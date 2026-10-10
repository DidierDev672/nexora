# 🛎️ Prompt: Efecto Físico de Campana de Hotel de Servicio con Framer Motion

## 📋 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **6.8 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+6.8):** Identifica con claridad el objetivo visual (simular el gesto mecánico de tocar una campana clásica de recepción de hotel), define el disparador de interacción (`hover`), selecciona la librería correcta de animación para el proyecto (`Framer Motion` / `motion/react`) y especifica el contexto de la interfaz (título "Registro de Pedido a la Habitación").
> - **Puntos a corregir (-3.2):**
>   1. **Instrucción gramaticalmente incompleta:** La frase *"la campana realice el efecto de cuando una persona la campana de un hotel"* omite el verbo clave (*"presiona"*, *"toca"*, *"hace sonar"*), forzando a la IA a deducir la física exacta.
>   2. **Referencia de archivo imprecisa:** Se referencia `ServicioHabitacionesPage.tsx`, pero el título *"Registro de Pedido a la Habitación"* y el icono se encuentran en el organismo hijo `FormularioServicioHabitacionCard.tsx`.
>   3. **Falta de especificación física:** No define los componentes mecánicos de la campana (el pulsador vertical, la oscilación angular de la cúpula ni las ondas sonoras del "ding").
>   4. **Erratas ortográficas:** *"utulizar"*, *"carperta"*, *"mardown"*.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Instrucciones vagas o incompletas** | 🔴 Alta | *"realice el efecto de cuando una persona la campana"*: Falta el verbo de acción. Una campana de hotel tiene dos movimientos físicos distintos: la compresión del botón superior y la vibración sonora de la cúpula. Al omitirlo, el modelo puede limitarse a un simple `scale: 1.1` genérico. |
| **Patrón 7 — Localización de archivo imprecisa** | 🟠 Media | Referencias `src/.../ServicioHabitacionesPage.tsx`, pero el elemento exacto está en `FormularioServicioHabitacionCard.tsx`. Esto puede provocar que un agente con herramientas de edición busque el texto en el archivo equivocado. |
| **Patrón 6 — Físicas y parámetros sin calibrar** | 🟡 Baja | Pide *"trata de utulizar Framer Motion"*, pero no define si debe usarse `whileHover`, `whileTap`, keyframes de rotación o una animación continua. En modelos modernos es preferible especificar los keyframes esperados (`rotate: [0, -12, 12, ...]` y `y: [0, 2, 0]`). |
| **Patrón 3 — Erratas tipográficas** | 🟡 Baja | Contiene pequeñas erratas: *"utulizar"* (utilizar), *"carperta"* (carpeta), *"mardown"* (markdown) que, aunque no bloquean a modelos avanzados, restan precisión semántica. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Ideal si deseas mantener tu redacción original corrigiendo las erratas y aclarando el comportamiento físico.*

```markdown
En el componente [src/features/servicio-habitaciones/ui/organisms/FormularioServicioHabitacionCard.tsx] (dentro de [src/features/servicio-habitaciones/ui/views/ServicioHabitacionesPage.tsx]), localiza el icono de campana junto al título "Registro de Pedido a la Habitación".

Reemplaza el emoji estático por un componente animado con Framer Motion (`motion/react`) que simule el efecto de tocar una campana de hotel al pasar el mouse por encima (`hover`) o hacer clic (`tap`):
1. El pulsador superior debe descender brevemente (compresión vertical).
2. La cúpula de la campana debe oscilar elásticamente de lado a lado (vibración resonante).
3. Utiliza transiciones tipo `easeOut` o `spring` para que el rebote se sienta mecánico y orgánico.
```

**Cambios realizados:**
- Se corrigió la ruta al archivo real donde vive el icono.
- Se completó la frase truncada agregando los movimientos físicos concretos (pulsador + cúpula).
- Se corrigieron las erratas tipográficas.

---

### Versión B — Versión Optimizada para Producción
> *Ideal para ejecuciones directas en código con especificaciones de físicas exactas y accesibilidad.*

```markdown
### Objetivo: Implementar Microinteracción de Campana de Hotel con Framer Motion

**Ubicación:** `src/features/servicio-habitaciones/ui/atoms/CampanaHotelAnimada.tsx`  
**Consumo:** `FormularioServicioHabitacionCard.tsx` en el título "Registro de Pedido a la Habitación".

#### Requisitos Técnicos:
1. **Representación Vectorial (SVG):**
   - Diseñar una campana de recepción de mostrador con 3 partes diferenciadas:
     - Botón superior / Pulsador central (`plunger`).
     - Cúpula de bronce/acero con reflejo de luz (`dome`).
     - Base circular fija (`base`).

2. **Físicas de Animación en Hover y Tap:**
   - **Pulsador:** Animación de bajada en eje Y: `y: [0, 2.5, 0]` (duración ~0.2s).
   - **Cúpula:** Oscilación elástica con pivote inferior: `rotate: [0, -14, 12, -9, 7, -4, 2, 0]` (duración ~0.75s, easeOut).
   - **Ondas de sonido ("Ding!"):** Mostrar dos arcos expansivos superiores que escalan de `0.7` a `1.5` y se desvanecen (`opacity: [0, 0.9, 0]`).

3. **Interacción y Accesibilidad:**
   - Disparador en `onMouseEnter`, `onClick` y `whileTap={{ scale: 0.92 }}`.
   - Atributos accesibles: `aria-label="Tocar campana de servicio de hotel"` y tooltip `title`.
   - Paleta de color coherente con Nexora (`bg-primary/10`, `text-primary`, `hover:bg-primary/20`).
```

**Por qué es mejor:**
- Desglosa la campana en sus partes anatómicas (pulsador, cúpula, base, ondas).
- Entrega valores numéricos concretos de keyframes y duraciones, eliminando la adivinación de la IA.
- Incorpora accesibilidad web (A11y) y soporte tanto para hover como para dispositivos táctiles (`tap`).

---

### Versión C — Versión Avanzada con Control de Estado
> *Estructurada con XML para máxima precisión en agentes de código autónomos.*

```markdown
<task_specification>
  <target_file>src/features/servicio-habitaciones/ui/organisms/FormularioServicioHabitacionCard.tsx</target_file>
  <component_name>CampanaHotelAnimada</component_name>

  <physics_rules>
    <trigger events="hover,click" debounce_ms="850">
      <plunger_press keyframes="[0, 2.5, 0]" duration="0.22s" ease="easeInOut" />
      <dome_resonance origin="12px 17px" keyframes="[0, -14, 12, -9, 7, -4, 2, 0]" duration="0.75s" ease="easeOut" />
      <soundwaves count="2" scale_range="[0.7, 1.6]" opacity_range="[0, 0.85, 0]" duration="0.7s" />
    </trigger>
  </physics_rules>

  <design_tokens>
    <background>bg-primary/10 hover:bg-primary/20</background>
    <foreground>text-primary</foreground>
    <border_radius>rounded-2xl</border_radius>
    <size>size-11</size>
  </design_tokens>
</task_specification>
```

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- Tuviste una visión de producto excelente: una campana de hotel que no interactúa es solo un dibujo; animarla con físicas reales enriquece la experiencia del usuario y da vida a la interfaz.
- Seleccionaste la herramienta técnica precisa del ecosistema del proyecto (`Framer Motion`).

### 3 Hábitos para mejorar:
1. **Comprobar la frase completa antes de enviar:**
   Asegúrate de que la oración principal contenga el verbo rector de la acción (*"cuando una persona presione/toque la campana"*).
   → *Regla de oro: "Si falta el verbo, el modelo inventará la acción."*

2. **Indicar la ruta del componente hijo directo:**
   Si el elemento visual está dentro de una tarjeta o formulario, menciona ese archivo específico además de la página contenedora.
   → *Regla de oro: "Apunta al componente exacto, no solo a la pantalla que lo aloja."*

3. **Describir la física visual esperada en 2 o 3 palabras clave:**
   Palabras como *"presión del botón superior"*, *"vibración de la cúpula"* y *"ondas de sonido"* le dicen al modelo exactamente qué animar sin ambigüedades.
   → *Regla de oro: "Un adjetivo físico vale más que diez metáforas."*

---

## 💻 Implementación Aplicada en Nexora

El componente ha sido creado e integrado en:
- Átomo interactivo: [src/features/servicio-habitaciones/ui/atoms/CampanaHotelAnimada.tsx](file:///d:/Nexora/nexora/src/features/servicio-habitaciones/ui/atoms/CampanaHotelAnimada.tsx)
- Consumo en la Card: [src/features/servicio-habitaciones/ui/organisms/FormularioServicioHabitacionCard.tsx](file:///d:/Nexora/nexora/src/features/servicio-habitaciones/ui/organisms/FormularioServicioHabitacionCard.tsx)
- Página contenedora: [src/features/servicio-habitaciones/ui/views/ServicioHabitacionesPage.tsx](file:///d:/Nexora/nexora/src/features/servicio-habitaciones/ui/views/ServicioHabitacionesPage.tsx)
