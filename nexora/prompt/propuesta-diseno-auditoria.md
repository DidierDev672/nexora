# Propuesta de Diseño Interactivo en React — Módulo de Auditoría

Esta propuesta traduce la arquitectura de auditoría ya definida (endpoints `/audit/*`, reglas R1–R20, KPIs K1–K6, matriz físico vs. sistema) en una **experiencia interactiva en React**, consumiendo únicamente los endpoints de solo lectura descritos en el documento base.

---

## 1. Mapa de la interfaz (Information Architecture)

```
/auditoria
├── Resumen ejecutivo          → GET /audit/summary
├── Habitaciones                → GET /audit/rooms
│   └── filtro por estado       → GET /audit/rooms/by-status/{status}
├── Tarifas                     → GET /audit/rates
├── Brechas
│   ├── Sin tarifa aplicada     → GET /audit/rooms-without-tariff
│   └── Tarifas inactivas en uso→ GET /audit/tariffs-inactive-in-use
```

Se propone una sola ruta padre `/auditoria` con **pestañas internas** (no rutas separadas de primer nivel), porque todas comparten el mismo contexto de sede y el mismo período de auditoría — cambiar de pestaña no debería recargar ese contexto.

---

## 2. Vista principal: Resumen ejecutivo (KPIs)

### Layout

Grilla de tarjetas KPI en la parte superior, correspondientes 1:1 a los indicadores K1–K6 del documento base:

| Tarjeta                         | Fuente                                               | Formato visual                                                          |
| ------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| Cobertura de tarifas (K1)       | `summary.habitaciones` + `summary.tarifas_aplicadas` | Anillo de progreso con % y meta (≥95%) marcada como línea de referencia |
| Coherencia de estados (K2)      | Cruce físico/sistema                                 | Anillo de progreso, meta 100%                                           |
| Tarifas default duplicadas (K3) | Conteo directo                                       | Número grande, verde si es 0, rojo si > 0                               |
| Brechas financieras (K4)        | Habitaciones sin precio auditable                    | Número grande con badge de severidad                                    |
| Tarifas inactivas en uso (K5)   | `GET /audit/tariffs-inactive-in-use`                 | Número grande, enlaza directo a la pestaña "Brechas"                    |
| Trazabilidad (K6)               | % `created_by` no vacío                              | Anillo de progreso, meta 100%                                           |

**Por qué anillos de progreso para K1, K2, K6 y números planos para K3, K4, K5**: los tres primeros son indicadores de "qué tan cerca estás de la meta" (naturaleza continua), mientras que K3, K4, K5 son "conteos de problemas discretos" donde lo ideal es cero — mezclar ambos formatos ayuda a que el ojo distinga de inmediato cuáles son metas de progreso y cuáles son alertas a resolver.

### Interacción

Cada tarjeta es **clicable**: lleva directamente a la pestaña y filtro correspondiente (ej. clic en K5 abre "Brechas → Tarifas inactivas en uso" ya filtrado). Esto evita que el resumen sea solo decorativo — es el punto de entrada a la acción.

### Desglose por entidad (debajo de los KPIs)

Una fila compacta de "chips" con los totales de `summary` (edificios, habitaciones, tipos de cama, sedes, sub sedes, tarifas, tarifas aplicadas), cada uno con su desglose active/inactive en un tooltip al pasar el cursor, sin ocupar espacio permanente en pantalla.

---

## 3. Vista: Habitaciones (matriz físico vs. sistema)

Esta es la vista más densa de información, por lo que aplica con más fuerza el principio de **auditoría por excepción** ya establecido: por defecto, **no se listan las 42 habitaciones**, se listan agrupadas por estado con conteos, y se expande solo lo que el usuario elige inspeccionar.

### 3.1 Selector de estado (en vez de tabla completa)

Fila de botones tipo "segmented control", uno por cada estado físico del documento, con el conteo de `summary.habitaciones` incrustado:

```
[ Disponibles 28 ]  [ Ocupadas 9 ]  [ Mantenimiento 2 ]  [ Limpieza 2 ]  [ Inactivas 1 ]
```

Al seleccionar uno, se llama a `GET /audit/rooms/by-status/{status}` y se reemplaza la lista — así nunca se cargan las 42 habitaciones de golpe, se navega por el estado que interesa auditar en ese momento (ej. un supervisor revisando específicamente las de mantenimiento).

### 3.2 Tabla de habitaciones filtradas

Columnas: número, piso, edificio, tarifa aplicada (o "Sin tarifa" en rojo), veredicto de conformidad.

La columna **veredicto** traduce la matriz físico vs. sistema del documento a un badge visual:

| Veredicto      | Badge    |
| -------------- | -------- |
| Conforme       | ✅ verde |
| No conforme    | ❌ rojo  |
| En observación | 🔧 ámbar |

Esta columna es el corazón de la "Sección 3" del documento (matriz físico vs. sistema) llevada a la interfaz — pero como el backend propuesto es de solo lectura sobre datos de sistema, **el estado físico observado en campo requiere un input separado** (ver punto 3.3), ya que no existe endpoint que lo provea automáticamente.

### 3.3 Captura de verificación física (complemento necesario)

El documento base define la matriz físico vs. sistema, pero los endpoints listados son de solo lectura sobre el estado _de sistema_ — no existe fuente de datos para el estado _físico observado_. Se propone:

- Un campo de **verificación manual** por habitación: el auditor, al inspeccionar en campo, marca en la interfaz "Coincide" / "No coincide" / "Pendiente de revisión", con un comentario opcional.
- Esto se guarda del lado del cliente como una sesión de auditoría en curso (o se propone al equipo backend un endpoint de escritura específico para esto, fuera del alcance de solo lectura ya definido) — **es una decisión a validar con el equipo**, ya que cambia el carácter "solo lectura" del módulo.
- Mientras no exista ese endpoint, la vista puede operar en modo **checklist offline-first**: el auditor recorre físicamente, marca en la app, y al final exporta o sincroniza cuando haya conectividad — útil en hoteles con señal débil en ciertos pisos.

---

## 4. Vista: Tarifas

Tabla simple de `GET /audit/rates`, con filtros por `modality`, `status` y `days_of_week`, coherente con los filtros que ya soporta el endpoint de evidencia según el documento (`?modality=`, `?status=`).

Cada fila muestra: nombre, precio, modalidad, vigencia (`days_of_week` traducido a texto legible: "Todos los días", "Entre semana", "Fines de semana"), y estado.

**Indicador visual de invariante financiera (R14)**: si por algún motivo llegara una tarifa con `price <= 0` (no debería pasar por la validación de dominio, pero la UI debe ser defensiva), se resalta en rojo como anomalía de datos, ya que viola una regla dura del sistema.

---

## 5. Vista: Brechas (el corazón operativo del módulo)

Dos sub-secciones, una por cada endpoint de brecha:

### 5.1 Habitaciones sin tarifa aplicada (`GET /audit/rooms-without-tariff`)

Lista de tarjetas (no tabla densa), cada una con: número de habitación, edificio, piso, y un botón de acción **"Asignar tarifa"** que abre el mismo `TariffPicker` ya propuesto en el trabajo anterior del frontend de habitaciones — reutilización directa de componente, no una pantalla nueva.

### 5.2 Tarifas inactivas en uso (`GET /audit/tariffs-inactive-in-use`)

Lista de tarjetas: nombre de la tarifa, cuántas habitaciones la tienen aplicada, con botón **"Ver habitaciones afectadas"** (expande la lista in situ) y botón **"Reactivar tarifa"** o **"Desvincular de estas habitaciones"** según el permiso del usuario.

Ambas listas comparten el mismo patrón de "tarjeta con acción incrustada" definido en la propuesta de UX de auditoría original — consistencia entre features en vez de inventar un patrón nuevo por pantalla.

---

## 6. Arquitectura de componentes React propuesta

```
/features/audit
  AuditPage.jsx                 // layout de pestañas + contexto de sede/período
  /components
    KpiCard.jsx                 // tarjeta reutilizable (progreso o número)
    KpiGrid.jsx                 // arma K1-K6 a partir de /audit/summary
    EntitySummaryChips.jsx      // fila de chips con tooltips
    RoomStatusSegmentedControl.jsx
    RoomAuditTable.jsx
    ConformityBadge.jsx         // ✅ ❌ 🔧 según veredicto
    PhysicalCheckInput.jsx      // captura manual de verificación física
    RateAuditTable.jsx
    GapCard.jsx                 // tarjeta reutilizable para ambas brechas
  /hooks
    useAuditSummary.js
    useRoomsByStatus.js
    useRates.js
    useGaps.js                  // encapsula ambos endpoints de brecha
  /context
    AuditScopeContext.jsx       // sede/subsede/período seleccionado, compartido entre pestañas
```

`AuditScopeContext` es clave: evita que cada pestaña tenga que repetir el selector de sede, y asegura que si el usuario cambia de sede en una pestaña, las demás se actualicen consistentemente al volver a ellas.

---

## 7. Manejo de datos (data fetching)

- Cada hook usa una librería de caché de consultas (React Query o similar), con `queryKey` que incluye el `headquarter_id`/`subheadquarter_id` activos, para que cambiar de sede invalide automáticamente la caché relevante.
- `useAuditSummary` se refresca al entrar a la vista y opcionalmente con un botón manual "Actualizar auditoría" (ya que el documento contempla que el cálculo puede ser periódico en backend, no instantáneo).
- Indicar **antigüedad del dato**: como el summary puede venir de un cálculo precalculado (según la arquitectura backend propuesta), mostrar un texto discreto tipo "Actualizado hace 40 min" junto al título de la vista, para que el usuario sepa si está viendo datos en vivo o de la última corrida del job.

---

## 8. Estados de carga y error (por vista, no global)

Siguiendo el mismo criterio que en el listado de habitaciones con infinite scroll ya propuesto:

- Skeleton específico por tipo de tarjeta/tabla, no un spinner genérico de página completa — el usuario debe poder ver la estructura (KPIs, columnas) mientras carga.
- Si un endpoint falla (ej. `/audit/rooms-without-tariff` no responde) pero los demás sí, esa sección muestra su propio estado de error con "Reintentar", sin bloquear el resto del panel de auditoría.

---

## 9. Accesibilidad e interacción

- Segmented control de estados navegable por teclado (flechas izquierda/derecha), con `aria-pressed` en el botón activo.
- Badges de veredicto (✅ ❌ 🔧) siempre acompañados de texto, nunca solo color/ícono, para usuarios con daltonismo o lectores de pantalla.
- Anillos de progreso de KPIs con `role="progressbar"` y `aria-valuenow`/`aria-valuemax` para que sean anunciados correctamente.

---

## 10. Responsivo

- Los KPIs en grilla de 3 columnas en escritorio, 2 en tablet, 1 en móvil (apilados en orden de severidad: primero los que están en rojo).
- La tabla de habitaciones colapsa a tarjetas apiladas en móvil, igual que se definió para el listado general de habitaciones.

---

## 11. Relación con el trabajo previo (reutilización, no reinvención)

Esta propuesta reutiliza deliberadamente tres piezas ya diseñadas en conversaciones anteriores, en vez de crear componentes nuevos:

1. El **`TariffPicker`** definido para el formulario de habitación se reutiliza tal cual en la brecha "sin tarifa aplicada".
2. El patrón de **tarjeta con acción incrustada** de la propuesta de UX de auditoría general se mantiene para las brechas.
3. Los **badges de severidad y semáforo** del panel de auditoría anterior se especializan aquí en el `ConformityBadge` (✅ ❌ 🔧), manteniendo el mismo lenguaje visual en toda la aplicación.
