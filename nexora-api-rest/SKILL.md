---
name: g-vertical-onion-solid
description: "Arquitectura OBLIGATORIA para cualquier endpoint o slice nuevo en Go de este proyecto. Úsalo SIEMPRE al crear, extender o revisar un endpoint REST en Go, aunque el usuario no lo pida explícitamente. Impone Vertical Slicing (una carpeta internal/nombre-del-slice por feature con domain.go, repository.go, usecase.go, postgres_repository.go, handler.go), Cebolla/Onion (domain hacia application hacia infrastructure/delivery) y los 5 principios SOLID con ejemplos concretos. Incluye una rúbrica de autoevaluación obligatoria para calificar si Vertical Slicing, Onion y cada letra de SOLID se cumplieron de verdad antes de entregar el código. Cubre además el patrón de comunicación entre slices con puertos angostos (ISP + DIP), convenciones de errores, nomenclatura en ingles, y migraciones (alcance polimórfico + trigger, EXCLUDE constraints, catálogos separados).
"
---

# Arquitectura obligatoria para endpoint en Go

Estas reglas no son sugerencias: si la tarea es "crea un endpoint", "agrega una feature", "expón esto vía API", o "revisa este código Go", se aplican sin que el usuario tenga que repetirlas. Cubre el ciclo completo: generar el código, wiring en `main.go`, y **calificar** el resultado antes de entregarlo.

## 1. Vertical Slicing - estructura de carpetas obligatoria

Cada feature/dominio de negocio es una carpeta independiente en `internal/`, nunca una carpeta compartida por técnica (nada de `internal/controllers/`, `internal/services/` con todo mezclado):

```
internal/nombre-del-slice/
  domain.go              -> entidades + tipos con constantes (Rol)
  repository.go          -> puerto Repository + puertos angostos hacia otros slices
  usecase.go             -> reglas de negocio, valida ANTES de tocar el repositorio
  postgres_repository.go -> implementación concreta del puerto
  handler.go             -> rutas HTTP, decodifica JSON, traduce errores a status codes
```

Una feature nueva = una carpeta nueva. Nunca se agrega código de un slice dentro de la carpeta de otro, ni siquiera "por ahora, es rapidito".

## 2. Cebolla (Onion) - direction de dependencias

```
handler.go  ────────►  usecase.go  ────────►  domain.go
postgres_repository.go ─(implementa)─────────►  domain.go / repository.go
```

Reglas de importación, sin excepcione:

Reglas de importación, sin excepción:

- `domain.go` no importa `database/sql`, `net/http`, ni ningún otro slice. Es el centro de la cebolla.
- `usecase.go` importa solo `domain.go` (mismo paquete) y `shared/apperrors`. Nunca importa `database/sql` directamente.
- `postgres_repository.go` es la ÚNICA pieza del slice que importa `database/sql`.
- `handler.go` es la ÚNICA pieza que importa `net/http`. Nunca contiene lógica de negocio (validaciones, cálculos) — eso vive en `usecase.go`.
- El wiring (`repo := NewPostgresRepository(db); uc := NewUseCase(repo); handler := NewHandler(uc)`) ocurre SOLO en `cmd/api/main.go`. Ningún archivo del slice instancia su propia implementación concreta.

## 3. SOLID - con el criterio de cada letra, no solo el nombre

| Letra   | Regla verificable (no solo "aplícalo")                                                                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **S**RP | Cada función pública de `usecase.go` hace una sola operación de negocio nombrable con un verbo (`CrearX`, `ListarX`, `CambiarEstado`). Si una función necesita "y" en su descripción, se divide.                               |
| **O**CP | Un dato que puede crecer en variantes (tipos, colores, roles) vive en su propio catálogo/constante — agregar una variante nueva es una fila de `INSERT` o una constante nueva, **nunca** un `if`/`switch` nuevo en el usecase. |
| **L**SP | Toda implementación de un mismo puerto (`Repository`, o un `ConsultorX`) es 100% intercambiable: el usecase no debe comportarse distinto si se le inyecta una implementación distinta del mismo puerto.                        |
| **I**SP | Los puertos hacia OTROS slices son angostos: 1-2 métodos, nombrados por lo que hacen (`Existe`, `EdificioDe`, `EstaOperativo`), nunca "importa el paquete completo del otro slice". Ver sección 4.                             |
| **D**IP | `usecase.go` depende de interfaces (`Repository`, `ConsultorX`), nunca del tipo concreto `PostgresRepository`. La única función que ve el tipo concreto es el wiring en `main.go`.                                             |

## 4. Comunicación entre slices - el patron repetido

Cuando el usecase de un slice necesita algo de OTRO slice (ej. `reservas` necesita saber si un `edificio` está operativo), el patrón es siempre el mismo:

1. El slice que **necesita** el dato define la interfaz en su propio `repository.go` (puerto angosto, nombrado desde su punto de vista: `ConsultorEdificios`, no `EdificiosRepository`).
2. El slice que **provee** el dato agrega un método a su `UseCase` con el nombre exacto que el puerto pide. No hace falta declarar "implements" — Go lo resuelve por duck typing.
3. El wiring en `main.go` pasa el `UseCase` del proveedor directo al `NewUseCase(...)` del consumidor.
   Nunca se importa el paquete completo de otro slice dentro de un `usecase.go`. Ver `references/patron-comunicacion-entre-slices.md` para el ejemplo completo con código.

## 5. Convenciones de errores

- `shared/apperrors` centraliza `ErrNotFound`, `ErrForbidden`, `ErrInvalidInput`, `ErrAlreadyExists`. `usecase.go` siempre devuelve uno de estos (envuelto con `errors.Join` + contexto), nunca un `error` genérico de `fmt.Errorf` hacia arriba del handler.
- `handler.go` tiene una función `writeError` que traduce cada `apperrors.Err*` a su status HTTP — se copia igual en cada slice, no se reinventa.
- Un error crudo de Postgres (ej. de un trigger con `RAISE EXCEPTION`) SIEMPRE se traduce a un `apperrors.ErrInvalidInput` legible en el usecase antes de llegar al handler — el usuario final nunca ve `pq: ...`.

## 6. Convenciones de dominio

- `Estado`, `Alcance`, `Rol` y similares son **tipos con constantes** (`type Estado string; const (...)`) + un `map[Estado]bool` de validez, nunca un `string` suelto validado con `if x == "algo"`.
- Nombres de tipos, campos, funciones y mensajes de error en español; nombres de paquete Go en minúsculas sin guiones.

## 7. Verificacion obligatoria antes de entregar

Después de escribir o modificar código Go, SIEMPRE se corre, en este orden, antes de mostrar el resultado como terminado:

```bash
gofmt -w .
go build ./...
go vet ./...
```

Si algo no compila, se corrige — nunca se entrega código Go sin haber corrido `go build` primero.
