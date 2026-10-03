# Prompt: Registro de Persona con Loader y Envío al Endpoint /persons

## Registro del Prompt Optimizado

```text
@[src/features/personas/ui/molecules/persona-registro-form.tsx]

Implementa el flujo de envío del formulario de registro de personas hacia el backend bajo las siguientes especificaciones:

1. Interfaz y Estado de Carga:
   - Al hacer clic en el botón "Registrar persona", tras superar las validaciones locales del formulario, activa el estado de carga (`submitting = true`).
   - Muestra en pantalla el componente @[src/features/roles/ui/atoms/loader.tsx] configurado como capa superpuesta (`overlay={true}`) con el mensaje explicativo: `label="Registrando persona..."`.

2. Construcción del Payload:
   - Construye en segundo plano el siguiente objeto JSON:
     {
       "document_type": string,     // Mapeado a inglés desde el dropdown
       "document_number": string,   // Obtenido de numeroDocumento
       "name": string,              // Obtenido del campo "Nombre completo" del formulario
       "phone_number": string,      // Obtenido de telefono
       "email": string              // Obtenido de email
     }
   - Mapeo de "Tipo de documento" (Español -> Inglés):
     * "Tarjeta de identidad" -> "id_card"
     * "Cédula" -> "national_id"
     * "Tarjeta extranjera" -> "foreign_id"

3. Petición HTTP:
   - Envía el payload mediante una solicitud POST al endpoint "/persons" con cabecera 'Content-Type': 'application/json'.

4. Retroalimentación Psicológica al Usuario:
   - Caso de Éxito (HTTP 201 Created):
     Oculta el loader y presenta un mensaje de confirmación cálido y tranquilizador:
     "¡Persona registrada con éxito! La ficha y sus canales de contacto se han guardado de forma segura en el sistema."
     Permite limpiar el formulario o registrar a una nueva persona.
   - Caso de Error (HTTP != 201 o error de red):
     Oculta el loader y muestra un mensaje empático y no alarmista que preserve la calma del usuario y proteja su esfuerzo:
     "No pudimos completar el registro en este momento. La información que ingresaste no se ha perdido; por favor verifica los datos e inténtalo de nuevo."
     Mantén intactos los datos ingresados para que el usuario no tenga que reescribirlos.
```

---

## Fundamentos Técnicos del Flujo

1. **Gestión de Estados y Feedback Visual (`Loader`)**:
   - Se utiliza `src/features/roles/ui/atoms/loader.tsx` con la propiedad `overlay={true}`.
   - Proporciona un bloqueo visual temporal con difuminado suave (`backdrop-blur-sm`) que previene dobles envíos (*double-submit*) involuntarios mientras la promesa está pendiente.

2. **Transformación de Dominio a DTO (Data Transfer Object)**:
   - Los valores visuales de la interfaz en español se desacoplan de la estructura esperada por la API en inglés.
   - Diccionario de normalización:
     ```ts
     const DOCUMENT_TYPE_MAP: Record<string, string> = {
       'Tarjeta de identidad': 'id_card',
       'Cédula': 'national_id',
       'Tarjeta extranjera': 'foreign_id',
     }
     ```

3. **Arquitectura y Manejo de Errores Ético**:
   - **Principio de Preservación:** El estado local de los campos no debe destruirse ante un error de red o de servidor, evitando la frustración del usuario al tener que rellenar datos.
   - **Mensajería Empática:** Comunica el estado del sistema con claridad, explicando qué sucedió y cuál es la acción correctiva sin tecnicismos intimidantes.

---

## Implementación en el Proyecto

- **Componente Formulario:** `src/features/personas/ui/molecules/persona-registro-form.tsx`
- **Componente Contenedor / Orquestador:** `src/features/personas/ui/organisms/registro-persona-panel.tsx`
- **Átomo de Carga:** `src/features/roles/ui/atoms/loader.tsx`
- **Endpoint Destino:** `POST /persons`
