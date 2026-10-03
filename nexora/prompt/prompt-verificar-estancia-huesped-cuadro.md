# 🖼️ Prompt: Verificación de Estancia Activa en Habitación y Visualización en Cuadro

## 📋 Registro del Prompt Original

```text
@[src/features/habitaciones/ui/asignar-huesped-page.tsx] , necesito que crees un hook para consumir este endpoint "/stay/reception/{room_id}" para verificar si la habitacion ya cuenta con huesped, si obtenemos una respuesta de un status code 200 por parte de la api rest, obtedremos un JSON o Object:
{
  "id": "stay-1",
  "room_id": "room-1",
  "reservation_id": "res-1",
  "person_ids": ["person-1", "person-2"],
  "check_in_date": "2026-10-01T15:04:05Z",
  "check_out_date": "2026-10-02T15:04:05Z",
  "payment_method": "cash",
  "security_deposit": 50,
  "remarks": "",
  "status": "progress",
  "created_by": "recepcion",
  "created_at": "2026-10-01T15:04:05Z",
  "updated_at": "2026-10-01T15:04:05Z"
}, crearemos un un avisa de que esta habitacion ya cuenta con huespedes, usa la psicologia para indicarle al usuario. Tambien vamos a consumir este endpoint "/person/{id}", si obtenemos un status code 200, nos de vuelve un JSON o Object:
{
  "id": "person-1",
  "document_type": "id_card",
  "document_number": "12345678",
  "name": "Juan Pérez",
  "phone_number": "999888777",
  "email": "juan@example.com",
  "date_of_birth": "1990-05-15T00:00:00Z",
  "gender": "M",
  "nationality": "Peruana",
  "roles": ["recepcion", "admin"],
  "created_by": "admin",
  "created_at": "2026-10-01T15:04:05Z",
  "updated_at": "2026-10-01T15:04:05Z"
}, en el cuadro de la habitacion vamos a visualizar la informacion de los huespedes, los items que vamos utilizar para informacion de los huespedes:
name
document_type -> el valor en espanol, por favor
document_number
genre
phone_number
email
en caso de obtener los siguientes status code (400,404, 500) crea un mensaje personalizado para cada status de la excepcion usando la psicologia que el mensaje sea mas amigable.
```

---

## 🛠️ Arquitectura Implementada

### 1. Modelos de Dominio (`src/features/habitaciones/domain/habitacion-stay.ts`)
- `ReceptionStay`: Contrato de datos de la estancia obtenida de `GET /stay/reception/{room_id}`.
- `PersonApiResponse`: Contrato de datos del huésped obtenido de `GET /person/{id}`.
- `GuestDisplayInfo`: Modelo enriquecido para la UI con traducciones de tipo de documento y género al español.
- `translateDocumentTypeToSpanish(docType)`: Mapea `id_card` a "Tarjeta de identidad", `national_id` a "Identificación nacional", etc.
- `translateGenderToSpanish(gender)`: Mapea `M` a "Masculino" y `F` a "Femenino".

### 2. Hook de Aplicación (`src/features/habitaciones/application/use-habitacion-stay.ts`)
- **Consulta encadenada y resiliente:**
  - Llama a `GET /stay/reception/{room_id}`.
  - Si responde `200`: Activa `hasActiveStay = true`, genera el aviso psicológico de habitación ocupada y consulta en paralelo `GET /person/{id}` para cada ID en `person_ids`.
  - Si responde `404`: Determina que la habitación está completamente libre y lista para asignación sin errores.
  - Si responde `400` o `500`: Emite avisos psicológicos amigables sin alarmar al recepcionista, asegurando que los datos siguen resguardados.
- Sincroniza los huéspedes con el store global de Zustand `useGuestStayStore`.

### 3. Ficha Dinámica en el Cuadro (`src/features/habitaciones/ui/atoms/habitacion-cuadro.tsx`)
- Muestra los datos solicitados:
  - `name`: Nombre completo del huésped.
  - `document_type`: En español formal.
  - `document_number`: Número de identificación.
  - `genre`: Género en español.
  - `phone_number`: Teléfono de contacto con icono.
  - `email`: Correo electrónico.
- Paginación interactiva si hay más de 1 huésped (`‹ 1/2 ›`).
- Modal inspector de pantalla completa para consultar la ficha completa al hacer clic en el lienzo.

### 4. Integración en Página (`src/features/habitaciones/ui/asignar-huesped-page.tsx`)
- Banner psicológico flotante informando el estado de ocupación de la habitación.
- Pasa los datos de `guests`, `isLoadingStay` y `hasActiveStay` a través de `HabitacionCozyBackground` hasta el lienzo decorativo.
- Dispara `refetchStay()` en `onSuccess` del modal de formulario cuando se registre una nueva asignación.
