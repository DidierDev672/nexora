---
name: g-vertical-onion-solid
description: "Estándar OBLIGATORIO de arquitectura, rendimiento y seguridad para endpoints en Go de este proyecto. Impone Vertical Slicing en internal/, Onion Architecture, SOLID, comunicación por puertos angostos, Rate Limiting, eliminación del antipatrón N+1 por Batch Loading, Data Loader concurrente, medición de RTT, optimización SQL con agregaciones y COALESCE, validación ReDoS-safe y rúbrica de autoevaluación obligatoria antes de entregar código."
---

# Arquitectura y Rendimiento Obligatorio para Endpoints en Go

Estas directivas no son sugerencias. Se aplican al crear, extender, optimizar o auditar cualquier endpoint o slice en Go del proyecto Nexora. Cubren el ciclo completo: diseño arquitectónico, prevención de cuellos de botella de rendimiento, seguridad de entrada, wiring y autoevaluación antes de la entrega.

---

## 1. Vertical Slicing - Estructura de Carpetas

Cada feature o dominio de negocio reside en una carpeta autónoma e independiente dentro de `internal/<nombre-del-slice>/`, evitando carpetas globales compartidas por capa técnica:

```
internal/<nombre-del-slice>/
  domain.go              -> Entidades de dominio, tipos tipados, errores centinela e invariantes
  domain_test.go         -> Pruebas unitarias de las invariantes del dominio
  repository.go          -> Interfaz Repository principal y puertos angostos hacia otros dominios
  usecase.go             -> Orquestación de negocio; valida y sanitiza ANTES del repositorio
  usecase_test.go        -> Pruebas unitarias de casos de uso (con mocks/fakes de puertos)
  postgres_repository.go -> Implementación SQL concreta usando database/sql o pgxpool
  handler.go             -> Rutas HTTP, decodificación JSON, mapeo de errores a HTTP status
  handler_test.go        -> Pruebas de integración HTTP usando net/http/httptest
```

Una feature nueva equivale a un slice nuevo. Jamás se coloca código de un dominio dentro de la carpeta de otro.

---

## 2. Cebolla (Onion) - Dirección de Dependencias

```
handler.go ────────► usecase.go ────────► domain.go
postgres_repository.go ─(implementa)────► domain.go / repository.go
```

Reglas estrictas de importación:

- `domain.go` es el centro de la cebolla: **prohibido** importar `database/sql`, `net/http` o paquetes de otros slices.
- `usecase.go` importa únicamente `domain.go` y los puertos abstractos de `repository.go`. Nunca importa `database/sql` directamente.
- `postgres_repository.go` es la **única** pieza del slice autorizada a interactuar con drivers SQL y base de datos.
- `handler.go` es la **única** pieza autorizada a importar `net/http`. No contiene reglas de negocio.
- El ensamblado (*wiring*) se efectúa exclusivamente en el nivel de composición (`cmd/api/main.go` o router principal). Ningún archivo del slice instancia su propia dependencia concreta.

---

## 3. Principios SOLID Aplicados en Go

| Principio | Criterio de Aceptación en Código Go |
|---|---|
| **S**RP | Cada función pública del caso de uso atiende una única operación de negocio con verbo explícito (`Create`, `FindByID`, `UpdateStatus`). |
| **O**CP | Variantes de dominio (estados, canales, roles) se modelan con constantes tipadas (`type Status string`), **nunca** con bloques `if`/`switch` anidados que crezcan en el usecase. |
| **L**SP | Las implementaciones de `Repository` son 100% intercambiables; el `usecase_test.go` debe pasar idénticamente con un mock en memoria o con Postgres. |
| **I**SP | Puertos salientes hacia otros dominios son angostos (1-2 métodos según la necesidad del consumidor, e.g. `ExistChecker`). |
| **D**IP | `usecase.go` depende exclusivamente de interfaces declaradas en `repository.go`, jamás de `*PostgresRepository`. |

---

## 4. Comunicación Entre Slices (Puertos Angostos)

Cuando un caso de uso requiere información de otro dominio:

1. El slice **consumidor** define una interfaz mínima en su propio `repository.go`:
   ```go
   // En internal/menucategory/repository.go
   type HeadquarterValidator interface {
       ValidateHeadquarterExists(ctx context.Context, id string) (bool, error)
   }
   ```
2. El slice **proveedor** implementa el método en su `UseCase`. Go resuelve la implementación por *duck typing*.
3. El *wiring* inyecta el caso de uso proveedor en el consumidor sin importar paquetes de infraestructura cruzados.

---

## 5. Control de Flujo y Protección de Recursos (Rate Limiting)

Todo endpoint expuesto debe estar protegido contra saturación de recursos, abusos y denegación de servicio (DoS):

- **Token Bucket por IP:** Se aplica un middleware global (`rateLimitMiddleware`) que envuelve a todo el router HTTP.
- **Configuración base:** 10 peticiones/segundo con ráfaga máxima (*burst*) de 20 por IP.
- **Respuesta estándar:** Cuando un cliente excede la cuota, responder inmediatamente con **`429 Too Many Requests`** y payload JSON `{ "error": "too many requests: rate limit exceeded" }` sin llegar a la capa de base de datos.

---

## 6. Detección y Eliminación del Antipatrón N+1 (y 2N + 1)

Está **terminantemente prohibido** ejecutar consultas a la base de datos dentro de ciclos `for` al listar entidades relacionadas:

```go
// ❌ PROHIBIDO (Antipatrón 2N + 1):
for i := range list {
    list[i].Items = r.loadItems(ctx, list[i].ID)     // N consultas
    list[i].History = r.loadHistory(ctx, list[i].ID) // N consultas
}
```

### Solución Estándar: Batch Eager Loading $O(1)$
Al listar $N$ elementos con colecciones hijas, ejecutar exactamente **3 consultas fijas**:
1. Consulta de cabeceras (`service_requests`).
2. Consulta agrupada de todos los ítems de las órdenes listadas usando `WHERE order_id = ANY($1)`.
3. Consulta agrupada de todo el historial usando `WHERE order_id = ANY($1)`.
4. Mapeo en memoria en $O(N)$ utilizando tablas hash (`map[ID][]Child`).

---

## 7. Medición Precisa de Latencia de Red (Network Round-Trip Time - RTT)

Para diagnósticos de red, health checks y monitoreo de dependencias externas:

- **TCP Ping (Transport Layer):** Medir el RTT mediante el *3-way handshake* TCP (`SYN` $\rightarrow$ `SYN-ACK` $\rightarrow$ `ACK`) usando `net.Dialer` con timeout estricto. Esto evita requerir privilegios de superusuario (`CAP_NET_RAW` / ICMP raw sockets).
- **Aislamiento DNS:** Pre-resolver el host a IP con `net.DefaultResolver.LookupIP` antes de iniciar la medición para evitar que la latencia de resolución de nombres contamine el RTT de red puro.
- **Reloj Monotónico:** Medir tiempos transcurridos exclusivamente con `time.Since(startTime)` para garantizar lecturas inmunes a desajustes del reloj del sistema por sincronizaciones NTP.

---

## 8. Patrón Data Loader (Batching, Desduplicación e Inyección en Contexto)

Para resolver lecturas concurrentes de alta frecuencia y eliminar el problema $N+1$ en APIs REST y motores GraphQL (ej. `gqlgen`, `graphql-go`):

### 8.1. Librerías Estándar del Ecosistema Go
- **`graph-gophers/dataloader` (v7):** La implementación más madura y probada en producción (utiliza interfaces de clave y resultados tipados).
- **`vikstrous/dataloadgen`:** Alternativa moderna basada en **Genéricos de Go** (`[K, V]`), sin generación estática de código ni casteo de interfaces.

### 8.2. Regla Crítica: Ciclo de Vida por Petición (*Per-Request Scope*)
**Jamás instanciar un DataLoader como Singleton o variable global.** Los DataLoaders mantienen una caché en memoria de las claves resueltas. Compartir esa caché entre diferentes peticiones provocaría:
1. **Fuga de datos de seguridad (Data Leaks):** Un usuario podría acceder a información privada previamente consultada por otro usuario o *tenant*.
2. **Datos obsoletos (*Stale Data*):** Mutaciones en la base de datos no se reflejarían en peticiones posteriores.
3. **Fugas de memoria:** Crecimiento ilimitado del mapa de caché sin recolección de basura.

### 8.3. Middleware HTTP para Inyección en el Contexto
El contenedor de `Loaders` debe instanciarse de forma aislada al inicio de cada petición HTTP e inyectarse en `r.Context()`:

```go
type contextKey struct{}
var loadersKey = contextKey{}

// Middleware inyecta una nueva instancia de Loaders con caché limpia por request:
func DataLoaderMiddleware(repo UserReader) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            loaders := NewLoaders(repo)
            ctx := context.WithValue(r.Context(), loadersKey, loaders)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

// For extrae de forma segura los loaders del contexto en cualquier handler o resolver:
func For(ctx context.Context) *Loaders {
    return ctx.Value(loadersKey).(*Loaders)
}
```

### 8.4. Uso en Resolvers de GraphQL y Handlers
En lugar de invocar directamente al repositorio o base de datos dentro de resolvers relacionales (lo que dispararía consultas $N+1$), encolar la lectura con `.Load()`:

```go
// En el Resolver de GraphQL (ej. Post.author):
func (r *PostResolver) Author(ctx context.Context, obj *Post) (*User, error) {
    // 1. Recuperar los loaders de la petición HTTP actual
    loaders := dataloader.For(ctx)

    // 2. Encolar la petición. Los N resolvers encolan sus llamadas;
    // el DataLoader agrupa todos los IDs en 1 sola consulta SQL tras 2ms.
    user, err := loaders.UserLoader.Load(ctx, obj.AuthorID)()
    if err != nil {
        return nil, err
    }
    return &user, nil
}
```

### 8.5. Parámetros de Configuración Recomendados
- **Agrupación Híbrida:** Disparo por tamaño (`MaxBatchSize: 100`) o por ventana de espera (`WaitTimeout: 2ms` a `5ms`).
- **Desduplicación:** Claves repetidas dentro de la misma petición se consolidan en un único ID antes de invocar la base de datos.
- **Canales Bufferizados y Respeto a `context.Context`:** Oyentes con buffer (`cap = 1`) para evitar *goroutine leaks* si la petición HTTP es cancelada por el cliente.

---

## 9. Optimización de Consultas SQL con Agregaciones y JOINs


Para reportes, métricas y dashboards:

- **Delegación al Motor SQL:** Calcular agregaciones (`COUNT`, `SUM`, `AVG`, `MAX`) directamente en PostgreSQL con `GROUP BY`, en lugar de cargar miles de registros en memoria en Go.
- **Uso Obligatorio de `COALESCE`:** En consultas con `LEFT JOIN`, envolver siempre funciones agregadas en `COALESCE(SUM(...), 0.0)` para evitar errores de escaneo al recibir `NULL` en tipos primitivos de Go (`float64`, `int`).
- **Manejo Estricto de `QueryContext`:** Utilizar siempre `QueryContext` (o `.WithContext(ctx)` en GORM) con un timeout prudente para evitar que consultas analíticas pesadas causen *Connection Pool Starvation*.
- **DTOs Planos de Proyección:** Crear un struct especializado para el reporte; jamás reutilizar ni alterar las entidades de dominio transaccionales.

---

## 10. Eficiencia en Validación y Sanitización de Entrada (Anti-ReDoS)

- **Sanitización Previa:** Normalizar siempre cadenas con `strings.TrimSpace` y `strings.ToLower` (en correos/claves) antes de evaluar invariantes de longitud y formato.
- **Neutralización de XSS:** En campos de texto libre o enriquecido (`bio`, `notes`, `description`), neutralizar o despojar tags HTML peligrosos (`<script>`, `onerror`) antes de persistir.
- **Prevención de ReDoS (Regular Expression Denial of Service):** Para validaciones complejas como contraseñas seguras, **no utilizar expresiones regulares catastróficas**. Iterar sobre runas evaluando el paquete estándar `unicode`:
  ```go
  // Validación eficiente O(N) sin ReDoS:
  for _, r := range password {
      switch {
      case unicode.IsUpper(r): hasUpper = true
      case unicode.IsLower(r): hasLower = true
      case unicode.IsDigit(r): hasDigit = true
      case unicode.IsPunct(r) || unicode.IsSymbol(r): hasSpecial = true
      }
  }
  ```

---

## 11. Convenciones de Dominio, Nomenclatura y Errores

- **Nomenclatura Técnica en Inglés:** Nombres de tipos, estructuras, interfaces, métodos, variables, campos JSON y mensajes de error internos en **inglés** (`MenuCategory`, `HeadquarterID`, `ErrNotFound`), coherente con el estándar del proyecto.
- **Documentación en Español:** Comentarios de cabecera y documentación técnica de arquitectura en español.
- **Tipos Fuertemente Tipados:** Estados y catálogos usan `type Estado string` con constantes y `map[Estado]struct{}` para validación en $O(1)$.
- **Traducción de Errores SQL:** Un error crudo del driver SQL (`pq: ...`) jamás debe filtrarse al cliente. Se captura en el repositorio o usecase y se mapea a un error de dominio comprensible con su código HTTP correspondiente.

---

## 12. Rúbrica de Autoevaluación Obligatoria

Antes de entregar cualquier slice nuevo o modificado, evalúa la solución contra esta lista de control:

| Criterio | Pregunta de Verificación | Estado |
|---|---|:---:|
| **Vertical Slicing** | ¿Todo el código nuevo reside dentro de su propia carpeta en `internal/<slice>/`? | [ ] |
| **Onion Architecture** | ¿`domain.go` está 100% aislado de dependencias de transporte HTTP y drivers SQL? | [ ] |
| **SOLID (ISP/DIP)** | ¿El caso de uso consume únicamente interfaces de `repository.go` y puertos angostos? | [ ] |
| **Rendimiento N+1** | ¿Se eliminaron consultas en bucles mediante Batch Loading (`WHERE = ANY($1)`)? | [ ] |
| **SQL Seguro** | ¿Las consultas con `LEFT JOIN` y agregación usan `COALESCE` y `QueryContext` con timeout? | [ ] |
| **Seguridad de Entrada** | ¿Se aplicó sanitización previa y validación sin expresiones regulares vulnerables a ReDoS? | [ ] |
| **DataLoader Scope** | ¿Los DataLoaders se instancian estrictamente por petición HTTP mediante middleware y nunca como singletons globales? | [ ] |
| **Pruebas** | ¿Se crearon las pruebas unitarias e integración (`_test.go`) para el slice? | [ ] |

---

## 13. Verificación Automatizada antes de Entregar

Antes de declarar cualquier tarea terminada, ejecuta obligatoriamente en la terminal:

```bash
gofmt -w .
go vet ./...
go test -v -race ./...
go build ./...
```

Si cualquier comando reporta un error de sintaxis, concurrencia o fallo de compilación, se corrige de inmediato antes de notificar al usuario.
