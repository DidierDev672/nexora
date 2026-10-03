# 🛎️ Prompt: Asignación de Estancia (Payload `/stays`, Store Zustand y Feedback Empático)

## 📋 Registro del Prompt Original

```text
@[d:\React\nexora\src\features\habitaciones\ui\molecules\asignar-huesped-datos-basicos-modal.tsx] ,  Cuando el recepcionista termien de registrar todos los huesped, la arrays de los id, de los huesped debe convertirse en una store con Zustand, @[d:\React\nexora\src\features\habitaciones\ui\molecules\asignar-huesped-modal-formulario.tsx] , cuando el recepcionista realice clic en el boton "Guardar Asignacion"  debe visualizar el siguiente componente @[d:\React\nexora\src\features\tema\ui\atoms\loader.tsx] , mientras que en segundo plano vamos a construir el siguiente payload:
{
  "room_id": "room-1",
  "reservation_id": "res-1",
  "person_ids": ["person-1", "person-2"],
  "check_in_date": "2026-10-01T14:00:00Z",
  "check_out_date": "2026-10-05T12:00:00Z",
  "payment_method": "cash",
  "security_deposit": 100.0,
  "remarks": "",
  "status": "progress",
  "created_by": "recep"
}, el valor de "room_id" lo obtenemos de la seleccion de la habitacion, el item "reservation_id" es opcional en este caso es vacio, "person_ids" lo obtenemos de la store Zustand solo necesitamos los id del huesped, en el item "status" el payloas necesia la opcion en ingles pero el recepcionista en espanol, para el "created_by" lo obtenemos del localstorage en el JSON auth_token del item email, ya con el payload construido debemo enviarlo a este endpoint "/stays" con el metodo POST, en caso de obtener un statu code 200 crea un mensaje de exito para indicarle al usuario que asignado huespedes a la habitacion con exito, usa la psicologia que el mensaje sea chulo, en caso de obtener los siguientes status code (400, 422,500), crea los mensaje personalizado para indicarle el recepcionista que se presento algunas fallas, usa psicologia que los mensaje sean amigable para el recepcionista.  El tablero que se encuentra en la habitacion el tablero debe empezar a la deletrear los nombres de los huesped, en el cuadro que se encuentra la derecha del todo empezara a visualizar la lista de huesped. Califica la calidad del prompt en una escala 1-10, por favor
```

---

## 🔧 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **7.2 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+7.2):**
>   1. **Contrato de datos explícito:** Proporcionar el molde exacto del JSON con sus nombres de atributos (`room_id`, `check_in_date`, `security_deposit`, etc.) es una práctica sobresaliente que elimina ambigüedades de nomenclatura (evita discrepancias como `checkIn` vs `check_in_date`).
>   2. **Trazabilidad de origen de datos:** Se aclara de dónde proviene cada campo (`room_id` de la habitación activa, `created_by` del email en el token de localStorage, `person_ids` del store).
>   3. **Estrategia de resiliencia y empatía psicológica:** Solicitar mensajes no punitivos y psicológicamente seguros ante errores (400, 422, 500) y de celebración al éxito (200) protege la confianza operativa del recepcionista.
>   4. **Vínculo directo a archivos:** Uso de enlaces contextuales `@` para los componentes nucleares de la tarea.
> - **Puntos a optimizar (-2.8):**
>   1. **Arquitectura y contrato del Store de Zustand (-1.0):** No se indica la ubicación del archivo del store (ej. `src/features/habitaciones/application/use-guest-stay-store.ts`), su tipado TypeScript ni sus acciones (`setPersonIds`, `reset`).
>   2. **Ambigüedad en términos de UX y animaciones (-0.8):** *"mensaje chulo"* es subjetivo. Además, *"el tablero debe empezar a deletrear los nombres"* y *"el cuadro a la derecha"* no indican qué archivo gobierna esa vista (ej. `habitacion-cuadro.tsx`), cómo se sincroniza con el store ni qué efecto/duración de tipeo (*typewriter*) se debe emplear.
>   3. **Mapeo de valores UI ↔ API incompleto (-0.5):** Se pide que `status` viaje en inglés (`progress`) cuando el usuario ve español (`Progreso`), pero falta la tabla de equivalencias para `Completa` y `Cancelada`, así como el mapeo de `payment_method` (`Efectivo` → `cash`, `Tarjeta` → `card`).
>   4. **Estructura en bloque de texto corrido y erratas (-0.5):** Un párrafo de más de 200 palabras sin viñetas aumenta el riesgo de que la IA ignore instrucciones secundarias ubicadas al final. Contiene además erratas tipográficas menores (*"termien"*, *"la arrays"*, *"payloas necesia"*).

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Instrucciones vagas o implícitas** | 🔴 Alta | *"Usa la psicología que el mensaje sea chulo"* y *"el tablero debe empezar a la deletrear"* dependen de la inferencia del modelo sin criterios verificables de formato o velocidad. |
| **Patrón 2 — Sobrecarga y falta de alcance delimitado** | 🔴 Alta | 4 responsabilidades distintas (Store Zustand, Modal/Loader, Petición POST `/stays`, Animación en escenario) empaquetadas en un único párrafo continuo. |
| **Patrón 3 — Mapeo de datos incompleto** | 🟠 Media | Faltan los diccionarios de conversión para los valores del dropdown `metodoPago` y el resto de estados de `status`. Tampoco se define el casteo numérico de `security_deposit`. |
| **Patrón 4 — Rutas de componentes visuales ausentes** | 🟡 Media | No se enlaza el componente visual del tablero o del lienzo de pared (`habitacion-cuadro.tsx`) donde se reflejarán los nombres. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Mantiene tu redacción directa pero estructurada en fases para garantizar que la IA ejecute todos los pasos sin omisiones:*

```markdown
En los componentes [src/features/habitaciones/ui/molecules/asignar-huesped-datos-basicos-modal.tsx](file:///d:/React/nexora/src/features/habitaciones/ui/molecules/asignar-huesped-datos-basicos-modal.tsx) y [src/features/habitaciones/ui/molecules/asignar-huesped-modal-formulario.tsx](file:///d:/React/nexora/src/features/habitaciones/ui/molecules/asignar-huesped-modal-formulario.tsx), implementa el siguiente flujo:

1. Store de Zustand:
   - Crea o actualiza un store de Zustand para almacenar los IDs de los huéspedes registrados (`person_ids: string[]`) y sus nombres completos.
   - Al terminar de registrar los huéspedes en el modal de datos básicos, guarda sus IDs en dicho store.

2. Envío de Formulario y Loader:
   - Al hacer clic en "Guardar Asignacion", muestra el componente [src/features/tema/ui/atoms/loader.tsx](file:///d:/React/nexora/src/features/tema/ui/atoms/loader.tsx) como overlay de carga.
   - En segundo plano, construye y envía el payload a `POST /stays`:
     {
       "room_id": room.id,
       "reservation_id": null,
       "person_ids": [ids del store Zustand],
       "check_in_date": formData.fechaEntrada,
       "check_out_date": formData.fechaSalida,
       "payment_method": "cash", // Mapear: "Efectivo" -> "cash", "Tarjeta" -> "card", "Transferencia bancaria" -> "transfer"
       "security_deposit": parseFloat(formData.deposito) || 0,
       "remarks": formData.observacion || "",
       "status": "progress", // Mapear: "Progreso" -> "progress", "Completa" -> "completed", "Cancelada" -> "cancelled"
       "created_by": [email extraído de auth_token en localStorage]
     }

3. Retroalimentación Psicológica y Amigable:
   - Si la API responde 200/201: Notifica el éxito con un mensaje entusiasta y tranquilizador (ej: "¡Habitación asignada con éxito! Todo está en orden para recibir a tus huéspedes").
   - Si la API responde 400, 422 o 500: Muestra avisos empáticos que confirmen que los datos del recepcionista siguen a salvo en la pantalla, sugiriendo la corrección necesaria sin tecnicismos culpabilizadores.

4. Tablero Visual de la Habitación:
   - En el cuadro/tablero visual de la habitación ([src/features/habitaciones/ui/atoms/habitacion-cuadro.tsx](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-cuadro.tsx)), muestra los nombres de los huéspedes asignados con una animación de tipeo progresivo (typewriter).
```

---

### Versión B — Versión Optimizada para Producción (Recomendada)
> *Especificación arquitectónica modular con interfaces TypeScript, diccionarios de conversión y ciclo de vida del loader:*

```markdown
### Objetivo
Conectar la asignación de huéspedes con el endpoint `POST /stays`, centralizando los IDs en un store Zustand, activando el indicador de carga `<Loader />` y actualizando el cuadro visual de la habitación.

### Archivos Involucrados
- `src/features/habitaciones/application/use-guest-stay-store.ts` (Nuevo store)
- [src/features/habitaciones/ui/molecules/asignar-huesped-datos-basicos-modal.tsx](file:///d:/React/nexora/src/features/habitaciones/ui/molecules/asignar-huesped-datos-basicos-modal.tsx)
- [src/features/habitaciones/ui/molecules/asignar-huesped-modal-formulario.tsx](file:///d:/React/nexora/src/features/habitaciones/ui/molecules/asignar-huesped-modal-formulario.tsx)
- [src/features/tema/ui/atoms/loader.tsx](file:///d:/React/nexora/src/features/tema/ui/atoms/loader.tsx)
- [src/features/habitaciones/ui/atoms/habitacion-cuadro.tsx](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-cuadro.tsx)

---

### Pasos de Implementación

#### 1. Store Zustand (`useGuestStayStore`)
Crear `src/features/habitaciones/application/use-guest-stay-store.ts`:
- Estado:
  - `personIds: string[]`
  - `guestNames: string[]`
  - `setRegisteredGuests: (guests: { id: string; name: string }[]) => void`
  - `clearGuests: () => void`
- En `asignar-huesped-datos-basicos-modal.tsx`, al completar el registro individual o total, despachar los IDs y nombres al store.

#### 2. Envío de Asignación (`asignar-huesped-modal-formulario.tsx`)
Al presionar el botón "Guardar Asignacion":
1. Activar estado `isSubmitting = true` para renderizar el componente `<Loader />`.
2. Extraer `created_by` con la función `getCreatedByFromLocalStorage()` (lee la clave `email` del JSON `auth_token` de localStorage).
3. Construir el payload respetando el tipado del backend:
   - `room_id`: `room.id`
   - `reservation_id`: `null` (o string si existe)
   - `person_ids`: array extraído de `useGuestStayStore.getState().personIds`
   - `check_in_date`: valor en formato ISO (`new Date(formData.fechaEntrada).toISOString()`)
   - `check_out_date`: valor en formato ISO (`new Date(formData.fechaSalida).toISOString()`)
   - `payment_method`: mapear `Efectivo` → `'cash'`, `Tarjeta` → `'card'`, `Transferencia bancaria` → `'transfer'`
   - `security_deposit`: número flotante (`parseFloat(formData.deposito) || 0`)
   - `remarks`: `formData.observacion.trim()`
   - `status`: mapear `Progreso` → `'progress'`, `Completa` → `'completed'`, `Cancelada` → `'cancelled'`
   - `created_by`: string del email recuperado
4. Petición HTTP: `api.post('/stays', payload)`.

#### 3. Manejo de Respuestas HTTP
- **Status 200 / 201 (Éxito):**
  - Desactivar loader.
  - Mostrar feedback psicológico de felicitación y confirmación:
    *"¡Excelente! La habitación ha sido asignada con éxito. Los huéspedes ya cuentan con su estancia registrada."*
  - Notificar a `onSuccess` y cerrar el modal.
- **Status 400, 422, 500 (Errores):**
  - Desactivar loader.
  - No cerrar el modal ni limpiar los campos para evitar la pérdida del trabajo del recepcionista.
  - Utilizar el helper `getPsychologicalErrorMessage(status)` para emitir una notificación que calme al recepcionista, le confirme que sus datos están seguros y le dé una vía de resolución.

#### 4. Cuadro Decorativo / Tablero (`habitacion-cuadro.tsx`)
- Suscribirse a `guestNames` de `useGuestStayStore`.
- Al contar con huéspedes asignados, iniciar una animación estilo máquina de escribir (*typewriter effect*, 35ms por letra) que deletree los nombres de los huéspedes dentro del lienzo decorativo.
```

---

### Versión C — Versión Declarativa (XML)
> *Ideal para pipelines automatizados y agentes autónomos sin margen de ambigüedad:*

```xml
<task_specification feature="room_guest_assignment">
  <context>
    Flujo de registro y asignación de huéspedes a estancias en Nexora Hotel Suite.
    Persistencia de IDs con Zustand, overlay de Loader, payload normalizado a POST /stays
    y animación tipográfica en el lienzo arquitectónico.
  </context>

  <dependencies>
    <file role="store">src/features/habitaciones/application/use-guest-stay-store.ts</file>
    <file role="basic_modal">src/features/habitaciones/ui/molecules/asignar-huesped-datos-basicos-modal.tsx</file>
    <file role="form_modal">src/features/habitaciones/ui/molecules/asignar-huesped-modal-formulario.tsx</file>
    <file role="loader">src/features/tema/ui/atoms/loader.tsx</file>
    <file role="canvas_board">src/features/habitaciones/ui/atoms/habitacion-cuadro.tsx</file>
  </dependencies>

  <data_contract endpoint="/stays" method="POST">
    <payload_schema>
      {
        "room_id": "string",
        "reservation_id": "string | null",
        "person_ids": "string[]",
        "check_in_date": "string (ISO-8601)",
        "check_out_date": "string (ISO-8601)",
        "payment_method": "'cash' | 'card' | 'transfer'",
        "security_deposit": "number",
        "remarks": "string",
        "status": "'progress' | 'completed' | 'cancelled'",
        "created_by": "string (email)"
      }
    </payload_schema>
  </data_contract>

  <steps>
    <step num="1">Generar store Zustand `useGuestStayStore` con `personIds: string[]` y `guestNames: string[]`.</step>
    <step num="2">Sincronizar el store al completar el registro en `asignar-huesped-datos-basicos-modal.tsx`.</step>
    <step num="3">En `asignar-huesped-modal-formulario.tsx`, renderizar `<Loader />` durante la llamada a `api.post('/stays', payload)`.</step>
    <step num="4">Manejar respuestas: éxito (200/201) con cierre y celebración; fallo (400/422/500) con mensaje empático sin perder datos en inputs.</step>
    <step num="5">En `habitacion-cuadro.tsx`, implementar efecto typewriter que deletree la lista de nombres leídos del store.</step>
  </steps>

  <invariants>
    <rule>Nunca resetear los valores del formulario cuando el servidor retorne un código de error (4xx/5xx).</rule>
    <rule>Garantizar que `security_deposit` viaje como número flotante y nunca como string.</rule>
    <rule>Asegurar que el loader se desmonte en el bloque `finally` de la promesa.</rule>
  </invariants>
</task_specification>
```

---

## 🎓 Lecciones para tus Próximos Prompts

**Lo que hiciste con excelencia:**
- Adjuntaste el **ejemplo exacto del payload JSON**, lo que garantiza que la IA no invente claves como `guest_ids` en lugar de `person_ids` o `deposit` en lugar de `security_deposit`.
- Especificaste de antemano el origen concreto de datos de infraestructura (`localStorage.auth_token.email`).

**3 hábitos para enriquecer tus próximos prompts:**
1. **Evita oraciones infinitas con comas:**
   Agrupar varias tareas independientes (Zustand + Formulario + Loader + Endpoint + Cuadro de animación) en una sola oración de 230 palabras incrementa la tasa de omisión.
   → *Regla de oro: "Una tarea por viñeta; separa la lógica de estado de los efectos visuales."*
2. **Proporciona tablas de equivalencia UI ↔ Backend:**
   Si la interfaz muestra texto en español y el backend espera enumeraciones en inglés, detalla el mapa completo (`Efectivo: cash`, `Tarjeta: card`, etc.).
   → *Regla de oro: "Si hay traducción de etiquetas, entrega el diccionario completo."*
3. **Reemplaza adjetivos subjetivos por ejemplos de texto real:**
   En lugar de solicitar que un mensaje sea "chulo", escribe una frase modelo de 1 línea con el tono deseado.
   → *Regla de oro: "Define el tono con un ejemplo, no solo con un adjetivo."*
