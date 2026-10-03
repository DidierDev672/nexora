# 🛑 Prompt: Advertencia en Modal de Habitación Ocupada, Bloqueo de Asignación y Ocultación de Diamante

## 📋 Registro del Prompt Original

```text
@[src/features/habitaciones/ui/asignar-huesped-page.tsx] , En caso de tener una habitación con huésped (o varios huéspedes), se deben aplicar los siguientes cambios:

1. La advertencia debe mostrarse en un modal.
2. No se debe mostrar el modal para asignar huéspedes, ya que la habitación está ocupada.
3. El diamente que aparece en la cama debe desaparecer cuando haya un huésped.
4. Se debe crear un modelo y una tabla que diga "ocupada", lo cual no debería permitir asignar más huéspedes.
```

---

## 🛠️ Arquitectura y Solución Implementada

### 1. Modelo de Dominio (`src/features/habitaciones/domain/habitacion-ocupada.ts`)
- `HabitacionOcupadaModel`: Entidad que formaliza la habitación en estado estricto `"ocupada"` (`statusLabel: 'OCUPADA'`, `isAssignable: false`), con motivo explícito de bloqueo y lista de huéspedes vinculados.
- `buildHabitacionOcupadaModel`: Función de fábrica que consolida la habitación, la estancia activa y las personas registradas.

### 2. Tabla de Estado "OCUPADA" (`src/features/habitaciones/ui/molecules/habitacion-ocupada-tabla.tsx`)
- Tabla estructurada que exhibe el badge de alto contraste `OCUPADA`.
- Detalla los huéspedes titulares y acompañantes, sus documentos y teléfonos.
- Cuenta con la columna de acción bloqueada con candado: *"No permite asignar"* e impide explícitamente agregar más huéspedes.

### 3. Modal de Advertencia (`src/features/habitaciones/ui/molecules/habitacion-ocupada-modal.tsx`)
- La advertencia no interrumpe como banner intrusivo, sino que se proyecta en un modal accesible (`HabitacionOcupadaModal`) con diseño glassmorphic y tono psicológico conciliador.
- Integra de forma nativa la `HabitacionOcupadaTabla`.
- Ofrece opciones de navegación seguras: "Cambiar de habitación" y "Entendido / Consultar Habitación".

### 4. Ocultación del Cojín de Diamante (`src/features/habitaciones/ui/atoms/habitacion-cama.tsx`)
- Se implementó la prop `showDiamond`.
- En `HabitacionCozyBackground`, se envía `showDiamond={!hasActiveStay}`.
- Al detectarse un huésped alojado, el diamante de asignación desaparece automáticamente de la cama.

### 5. Bloqueo del Modal de Asignación (`src/features/habitaciones/ui/asignar-huesped-page.tsx`)
- Si `hasActiveStay === true`:
  - `AsignarHuespedModalFormulario` no se monta ni se renderiza.
  - El botón de acción superior se convierte en *"Habitación Ocupada (Bloqueada)"*, el cual abre el modal de advertencia con la tabla.
  - Cualquier interacción con la cama abre el modal de advertencia en lugar del formulario.
