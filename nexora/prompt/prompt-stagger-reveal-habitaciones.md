# 🌊 Prompt: Stagger Reveal (Revelado Escalonado) en Framer Motion para Habitaciones (Cards y Tabla)

## 📋 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **8.4 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+8.4):** Excelente dominio conceptual de la orquestación en Framer Motion. Explica con total claridad el propósito de `delayChildren` (espera previa al primer hijo), `staggerChildren` (retraso acumulativo automático entre elementos sucesivos) y la sincronización automática de variantes padre-hijo (`hidden` y `visible`) eliminando cálculos manuales de tipo `delay: index * factor`.
> - **Puntos a corregir (-1.6):**
>   1. **Desajuste semántico de elementos HTML:** El prompt cita componentes `<motion.li>`, pero el módulo de habitaciones renderiza una tabla HTML (`<table> -> <motion.tbody> -> <motion.tr>`) y una cuadrícula de tarjetas (`<motion.div className="grid..."> -> <HabitacionCardItem>`). Usar `<li>` dentro de una tabla genera errores de hidratación y marcado HTML inválido.
>   2. **Errata tipográfica en API:** Se escribió *"varients"* en lugar de `variants`. En prompts para agentes de código, un error tipográfico en una prop clave puede hacer que el modelo intente crear props inexistentes.
>   3. **Calibración perceptual del tiempo de stagger:** Un `staggerChildren: 0.15s` para un listado que carga entre 15 y 50 habitaciones causaría que el elemento #20 tarde 3.3 segundos en aparecer, degradando la percepción de fluidez. Para catálogos o dashboards de alta productividad, el estándar óptimo se sitúa entre `0.04s` y `0.08s`.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 3 — Desajuste semántico HTML (`motion.li`)** | 🟠 Media | Mencionas: *"No necesitas pasarle propiedades initial ni animate a los elementos `<motion.li>`"*. En `HabitacionesListaTable`, la tabla usa `motion.tr` dentro de `motion.tbody` y las tarjetas usan `motion.div` en una rejilla `grid`. |
| **Patrón 3 — Errata tipográfica en prop clave (`varients`)** | 🟡 Baja | Escribiste *"las propiedades varients de Framer Motion"*. Debe ser `variants` para concordar con la API oficial de Motion. |
| **Patrón 1 — Calibración temporal para listas extensas** | 🟠 Media | Propones `staggerChildren: 0.15s`. En listas con paginación o scroll infinito (15+ elementos), 150ms por ítem es excesivo; se recomienda `0.06s - 0.08s` para mantener la interfaz ágil y reactiva. |
| **Patrón 7 — Especificación de montaje y vistas** | 🟡 Baja | No se especifica cómo interactúa la animación cuando el usuario conmuta entre la vista de tarjetas (`cards`) y la vista de tabla (`table`) mediante `key` o `AnimatePresence`. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Conserva tu estilo, redacción y estructura explicativa, adaptando la semántica a las tablas y cards reales.*

```markdown
En el componente [src/features/habitaciones/ui/organisms/habitaciones-lista-table.tsx] y [src/features/habitaciones/ui/habitaciones-page.tsx], implementa el efecto Stagger reveal (revelado escalonado) en Framer Motion tanto para la vista de tarjetas (cards) como para la vista de tabla.

La clave es usar la propiedad `variants` de Framer Motion junto con el modificador `staggerChildren` en los contenedores padres (`motion.tbody` en la tabla y `motion.div` en la cuadrícula de cards). De esta forma, los elementos hijos (`motion.tr` y las tarjetas de habitación) aparecerán secuencialmente de forma automática sin calcular retrasos manuales.

Cómo funciona la orquestación:
1. `delayChildren`: Le indica al contenedor padre que espere 0.3 segundos antes de iniciar la animación de su primer hijo.
2. `staggerChildren`: Aplica un retraso incremental y automático a cada elemento hijo sucesivo (recomendado: 0.06s entre elementos para mantener fluidez en listas extensas).
3. Orquestación automática: No necesitas pasarle propiedades `initial` ni `animate` individuales a cada fila (`motion.tr`) ni a cada tarjeta. Al heredar las variantes del padre, Framer Motion propaga los estados (`hidden` y `visible`) automáticamente.
```

**Cambios realizados:**
- Se reemplazó `<motion.li>` por los elementos reales: `motion.tbody` / `motion.tr` para la tabla y `motion.div` para la rejilla de tarjetas.
- Se corrigió la errata `varients` por `variants`.
- Se calibró el valor de `staggerChildren` a `0.06s` para un comportamiento óptimo en listas con scroll infinito.

---

### Versión B — Versión Optimizada para Producción
> *Estructurada, con variantes tipadas con `Variants` de `motion/react`, soporte para cambio de vistas e integración limpia.*

```markdown
### Tarea: Implementar Stagger Reveal con Framer Motion en Habitaciones (Cards y Tabla)

#### Archivos involucrados:
- [src/features/habitaciones/ui/organisms/habitaciones-lista-table.tsx]
- [src/features/habitaciones/ui/molecules/habitacion-card-item.tsx]
- [src/features/habitaciones/ui/habitaciones-page.tsx]

#### 1. Definición de Variantes Tipadas (`Variants`)
Define las variantes de orquestación en `habitaciones-lista-table.tsx`:

```ts
import type { Variants } from 'motion/react'

export const STAGGER_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.06,
    },
  },
}

export const STAGGER_ITEM_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 300,
      mass: 0.8,
    },
  },
}
```

#### 2. Implementación en la Vista Tabla (`<table>`)
1. Reemplaza `<tbody>` por `<motion.tbody>`:
   - `variants={STAGGER_CONTAINER_VARIANTS}`
   - `initial="hidden"`
   - `animate="visible"`
2. En cada fila:
   - `<motion.tr key={row.id} variants={STAGGER_ITEM_VARIANTS}>`
   - Elimina `initial={{ opacity: 0 }}` y `animate={{ opacity: 1 }}` redundantes para permitir que el padre orqueste el escalonado.

#### 3. Implementación en la Vista Tarjetas (`cards`)
1. Reemplaza el contenedor de cuadrícula por `<motion.div>`:
   - `variants={STAGGER_CONTAINER_VARIANTS}`
   - `initial="hidden"`
   - `animate="visible"`
   - `className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"`
2. En [src/features/habitaciones/ui/molecules/habitacion-card-item.tsx]:
   - Configura el contenedor raíz de la tarjeta para usar `variants={variants ?? STAGGER_ITEM_VARIANTS}`.
   - Elimina `initial` y `animate` individuales para sincronizarse con la orquestación del padre.

#### 4. Transición de Pestañas en [src/features/habitaciones/ui/habitaciones-page.tsx]
- Envolver las vistas en `<AnimatePresence mode="wait">` con `<motion.div>` para garantizar transiciones fluidas entre la pestaña de catálogo y el formulario de registro.
```

**Por qué es mejor:**
- Provee las variantes tipadas listas para producción con física de resorte (`spring`).
- Cubre ambos modos de visualización (`table` y `cards`) con sincronización exacta.
- Evita colisiones de layout y problemas de hidratación.

---

### Versión C — Versión Avanzada con Especificación XML
> *Especialmente diseñada para ejecución por agentes autónomos de IA y flujos automatizados.*

```xml
<task>
  <target_files>
    <file>src/features/habitaciones/ui/organisms/habitaciones-lista-table.tsx</file>
    <file>src/features/habitaciones/ui/molecules/habitacion-card-item.tsx</file>
    <file>src/features/habitaciones/ui/habitaciones-page.tsx</file>
  </target_files>

  <feature>Framer Motion Stagger Reveal Orchestration</feature>

  <requirements>
    <rule id="1" name="stagger_timing">
      El contenedor padre debe orquestar los hijos con delayChildren: 0.3s y staggerChildren: 0.06s en el estado visible.
    </rule>
    <rule id="2" name="variants_propagation">
      Los hijos (motion.tr y HabitacionCardItem) deben recibir únicamente variants={STAGGER_ITEM_VARIANTS} sin props initial ni animate locales para no romper la propagación.
    </rule>
    <rule id="3" name="view_mode_switching">
      Cada vista (tabla y cards) debe contar con una key única para re-disparar el efecto escalonado al alternar entre modos de visualización.
    </rule>
  </requirements>

  <implementation_template>
<![CDATA[
// Contenedor Tabla
<motion.tbody
  variants={STAGGER_CONTAINER_VARIANTS}
  initial="hidden"
  animate="visible"
  className="divide-line divide-y"
>
  {rows.map((row) => (
    <motion.tr key={row.id} variants={STAGGER_ITEM_VARIANTS}>
      {/* Celdas */}
    </motion.tr>
  ))}
</motion.tbody>

// Contenedor Cards
<motion.div
  key="habitaciones-cards-view"
  variants={STAGGER_CONTAINER_VARIANTS}
  initial="hidden"
  animate="visible"
  className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
>
  {rows.map((row) => (
    <HabitacionCardItem key={row.id} room={row} />
  ))}
</motion.div>
]]>
  </implementation_template>
</task>
```

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Explicaste la mecánica fundamental de Framer Motion:** La orquestación padre-hijo a través de `staggerChildren` y `delayChildren` es la forma más elegante y eficiente de animar listas en React.
- **Identificaste la redundancia:** Señalaste con precisión que los hijos no deben llevar `initial` ni `animate` cuando el padre gobierna las variantes.

### 3 Hábitos para mejorar:

1. **Alinea las etiquetas con la estructura DOM real:**
   - No asumas que todas las listas son `<ul> / <li>`. En aplicaciones de gestión hotelera y paneles administrativos, la información suele estructurarse en tablas (`<tbody> / <tr>`) o cuadrículas de tarjetas (`<div>`).
   - → **Regla de oro:** *"Verifica la semántica HTML del componente antes de citar etiquetas en el prompt."*

2. **Calibra los tiempos según el volumen de datos:**
   - Un `staggerChildren` de 0.15s es ideal para menús de 4 o 5 enlaces. Para listas de datos que pueden tener de 10 a 50 elementos, usa entre `0.04s` y `0.07s` para que el último ítem no tarde segundos en aparecer.
   - → **Regla de oro:** *"A mayor cantidad de elementos en la lista, menor debe ser el intervalo de stagger."*

3. **Cuida la ortografía de palabras clave técnicas:**
   - La propiedad se llama `variants` (con 'a'). Al escribir prompts para IAs, un término técnico exacto asegura que el modelo no cree variables o tipos con nombres erróneos.
   - → **Regla de oro:** *"Los identificadores de APIs y librerías deben escribirse con precisión literal."*
