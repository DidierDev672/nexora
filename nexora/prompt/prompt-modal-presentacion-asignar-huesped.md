# 🪟 Prompt: Modal de Presentación de Habitación (Reemplazo del Header)

## 📋 Registro del Prompt Original

```text
Quitar heeader, la informacion del header conviertela en un modal de presentacion, por favor
```

---

## 🔧 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **7.8 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+7.8):** Intención y decisión de UX muy acertada: el header estático bloqueaba la visibilidad del fondo arquitectónico (ventana, cama, sofá, cuadro y luces de Joyce Byers). Convertir los metadatos en un modal de presentación permite admirar la habitación completa y acceder a la ficha técnica bajo demanda.
> - **Puntos a optimizar (-2.2):**
>   1. **Falta de ruta de los componentes destino:** Omite especificar `src/features/habitaciones/ui/asignar-huesped-page.tsx` y el nuevo componente del modal.
>   2. **Mecanismo de navegación de retorno:** El header original contenía el botón "Volver / Cambiar de habitación". Al solicitar *"quitar header"*, no se especificó dónde reubicar la acción de volver si el usuario cierra el modal, lo que arriesgaba dejar al usuario atrapado en la pantalla.
>   3. **Disparador para reabrir el modal (Trigger):** No se especificó cómo volver a abrir el modal si el usuario lo cierra para ver la habitación.
>   4. **Erratas ortográficas:** *"heeader"* → *"header"*; *"conviertela"* → *"conviértela"*.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Ausencia de mecanismo de retorno (Back Action)** | 🔴 Alta | Al eliminar el header, el botón `onBack` desaparece si no se especifica una barra de navegación flotante alternativa. |
| **Patrón 1 — Disparador de reapertura no definido** | 🟠 Media | Una vez cerrado el modal de presentación, el usuario necesita un chip o botón para volver a consultar los datos de la habitación. |
| **Patrón 3 — Erratas tipográficas** | 🟡 Baja | *"heeader"* → *"header"*; *"conviertela"* → *"conviértela"*. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Mantiene la brevedad de tu instrucción especificando la navegación y la reapertura:*

```markdown
En [src/features/habitaciones/ui/asignar-huesped-page.tsx]:
1. Remueve el componente de cabecera `AsignarHuespedHeader`.
2. Convierte toda la información de la habitación (título psicológico, edificio, piso, tipo de cama y estado) en un modal de presentación (`AsignarHuespedModalPresentacion`) que se abra automáticamente al montar la vista.
3. Añade una barra flotante superior discreta con:
   - Botón izquierdo para volver (`onBack`).
   - Chip derecho con "Habitación {room.number} · Info" para reabrir el modal en cualquier momento.
```

---

### Versión B — Versión Optimizada para Producción (Recomendada)
> *Especificación arquitectónica completa con UX accesible y diseño glassmorphic:*

```markdown
### Tarea: Conversión de Header en Modal de Presentación
**Archivos:**
- `src/features/habitaciones/ui/molecules/asignar-huesped-modal-presentacion.tsx` (Nuevo)
- `src/features/habitaciones/ui/asignar-huesped-page.tsx` (Refactorización)

#### 1. Componente: `AsignarHuespedModalPresentacion`
- **Backdrop:** `bg-stone-950/70 backdrop-blur-md` con cierre al clic y tecla `Escape`.
- **Tarjeta de Presentación:** Estilo iOS Sheet / Glassmorphic (`rounded-3xl border border-line/60 bg-panel/95 shadow-2xl`).
- **Animación:** Física spring suave (`type: 'spring', damping: 25, stiffness: 280`).
- **Contenido:**
  - Badge de número de habitación y `HabitacionStatusBadge`.
  - Título y subtítulo psicológico de valor para el usuario.
  - Rejilla informativa con iconos (Ubicación/Piso y Cama/Mobiliario).
  - Acciones: Botón primario "Continuar con la asignación" (`onClose`) y secundario "Cambiar de habitación" (`onBack`).

#### 2. Página: `AsignarHuespedPage`
- Estado local: `const [isPresentationOpen, setIsPresentationOpen] = useState(true)`.
- Reemplazar el header invasivo por una barra flotante en `relative z-10`:
  - Botón de retroceso minimalista (`onBack`).
  - Chip interactivo "Habitación {room.number} · Info" que activa `setIsPresentationOpen(true)`.
- El fondo arquitectónico cozy permanece 100% visible sin obstrucciones.
```

---

### Versión C — Versión Declarativa (XML)
> *Para pipelines automatizados y especificaciones formales:*

```xml
<component_refactor page="AsignarHuespedPage">
  <action>replace_header_with_presentation_modal</action>
  <new_molecule name="AsignarHuespedModalPresentacion">
    <presentation_style>iOS Sheet / Glassmorphism</presentation_style>
    <content>
      <room_title>Asigna un huésped a la Habitación {room.number}</room_title>
      <badges>HabitacionStatusBadge, floor, building, bed_type</badges>
      <actions>onBack (choose another room), onClose (continue assignment)</actions>
    </content>
    <motion>spring physics (damping: 25, stiffness: 280)</motion>
  </new_molecule>

  <navigation_layer>
    <floating_bar position="relative z-10 top">
      <back_button action="onBack" />
      <reopen_trigger action="openModal" label="Habitación {room.number} · Info" />
    </floating_bar>
  </navigation_layer>
</component_refactor>
```

---

## 🎓 Lecciones para tus Próximos Prompts

**Lo que hiciste con excelencia:**
- Tuviste la visión de **despejar la interfaz**: cuando un fondo es rico visualmente, un header denso compite y arruina la atmósfera escénica. Mover los datos a un modal es una decisión de diseño de alto impacto.

**3 hábitos para enriquecer tus próximos prompts:**
1. **Pensar en la cadena de navegación (¿Cómo salgo de aquí?):**
   → *Regla de oro:* Si pides remover un componente que contenía el botón de volver, indica siempre dónde debe vivir ahora esa acción.
2. **Definir el ciclo de vida del modal:**
   → *Regla de oro:* Aclara si el modal debe abrirse solo al inicio o si debe existir un botón para que el usuario lo vuelva a consultar.
3. **Nombrar el componente de destino:**
   → *Regla de oro:* Incluir el nombre del archivo ahorra búsquedas y asegura que el código se ubique en la capa adecuada.
