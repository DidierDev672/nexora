# 🌊 Prompt: Diseño en Cascada Animado (Waterfall / Masonry Layout) con Motion

## 📋 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **8.0 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+8.0):** Excelente intuición visual y de UX. Identifica correctamente la técnica **FLIP** (`layout` prop) para transiciones fluidas de reordenamiento y filtrado sin saltos bruscos. Comprende con claridad el uso de `staggerChildren` para generar la revelación escalonada secuencial característica de las interfaces prémium.
> - **Puntos a corregir (-2.0):**
>   1. **Confusión técnica entre `layoutId` y `layout`:** En listas de elementos, usar `layoutId` idéntico o genérico provoca colapso visual en Framer Motion; para filtrado y reordenación de listas se debe usar la propiedad booleana `layout="position"` o `layout` junto con una `key` única dentro de `<AnimatePresence>`. (`layoutId` se reserva exclusivamente para elementos compartidos hacia modales o detalles).
>   2. **Paquete de importación en el proyecto (`motion/react` vs `framer-motion`):** En Nexora, la dependencia instalada es la versión moderna `motion` (`import { motion, AnimatePresence } from 'motion/react'`), no el paquete legado `framer-motion`.
>   3. **Mecánica CSS de Masonry con Tailwind:** CSS Grid estándar (`grid grid-cols-4`) no permite alturas variables estilo Pinterest (deja huecos en blanco debajo de las tarjetas más cortas). Debe especificarse el uso de **CSS Columns** (`columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 [&>*]:break-inside-avoid`) o partición en columnas React.
>   4. **Ubicación de archivos y parámetros numéricos:** No especifica los archivos destino (`MenuCategoriasGrid.tsx`, `MenuCategoriaCard.tsx`) ni los valores numéricos recomendados para resortes y retardos.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Confusión técnica de `layoutId` vs `layout`** | 🔴 Crítica | Mencionas: *"Implementar 'AnimatePresence' y 'layoutId' para que si los elementos cambian de orden o se filtran..."*. En listas dinámicas, `layoutId` intenta fusionar múltiples elementos en uno solo. La técnica correcta para recolocación fluida en listas es la propiedad `layout` (técnica FLIP) con `key` estable en cada hijo. |
| **Patrón 1 — Mecánica de layout Masonry no especificada** | 🟠 Media | Un Masonry tipo Pinterest con alturas variables no se logra con un `grid` convencional (alinea filas completas dejando huecos vacíos). Es fundamental definir el patrón CSS (`columns-*` de Tailwind con `break-inside-avoid`) para que las tarjetas encajen sin espacios muertos. |
| **Patrón 3 — Paquete desactualizado (`framer-motion` vs `motion/react`)** | 🟠 Media | El prompt hace referencia a `framer-motion`. En este repositorio, la librería instalada es la versión moderna `motion`, por lo que se debe importar desde `"motion/react"`. |
| **Patrón 2 — Falta de contexto y archivos destino** | 🟡 Baja | No se especifican las rutas de los componentes donde se debe implementar el layout (`MenuCategoriasGrid.tsx` y `MenuCategoriaCard.tsx`). |
| **Patrón 3 — Erratas ortográficas** | 🟡 Baja | *"Design de cascada animados"* (en lugar de *Diseño en cascada animado*) y *"utulizar"* (en lugar de *utilizar*). |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Conserva tu estructura y redacción original, corrigiendo las erratas, la confusión de `layoutId` y la importación de la librería.*

```markdown
En el componente de visualización del catálogo de servicios a la habitación [src/features/servicio-habitaciones/ui/organisms/MenuCategoriasGrid.tsx], implementa un diseño en cascada animado (Waterfall / Masonry layout) utilizando Motion (`motion/react`).

Requisitos:
1. Columnas fluidas y responsivas con Tailwind CSS adaptadas a la pantalla: 1 columna en móvil, 2 en tablet y 3 o 4 en escritorio (usando `columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 [&>*]:break-inside-avoid`).
2. Tarjetas con alturas variables (por ejemplo, variando la relación de aspecto de la fotografía y la longitud de la descripción) para simular un feed estilo Pinterest.
3. Animación de entrada inicial escalonada (stagger effect) utilizando `staggerChildren: 0.05` en el contenedor padre y variantes en las tarjetas hijas.
4. Recolocación fluida (FLIP) con `layout` y `AnimatePresence`: añade la propiedad `layout` a cada tarjeta con una `key` única estable (`key={categoria.name}`) para que al filtrar o reordenar, las tarjetas se desplacen suavemente a su nueva posición sin saltos bruscos.
```

**Cambios realizados:**
- Se corrigió `layoutId` por la propiedad `layout` junto con `key` estable dentro de `AnimatePresence`.
- Se especificó el método de columnas en Tailwind (`columns-*` + `break-inside-avoid`) para lograr un Masonry real sin huecos.
- Se corrigieron las erratas tipográficas y se actualizó la importación a `motion/react`.

---

### Versión B — Versión Optimizada para Producción
> *Estructurada, con contratos claros, parámetros de animación precisos y rutas del proyecto Nexora.*

```markdown
### Objetivo
Transformar la visualización del catálogo de menús en [src/features/servicio-habitaciones/ui/organisms/MenuCategoriasGrid.tsx] a un diseño en cascada (Masonry / Waterfall layout) fluido y animado con Motion (`motion/react`).

### 1. Estructura CSS del Layout Masonry (Tailwind CSS)
En lugar de un grid con filas alineadas, utiliza el sistema de columnas continuas para que los elementos de alturas variables encajen sin espacios vacíos verticales:
```tsx
<motion.div
  layout
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
>
  <AnimatePresence mode="popLayout">
    {categoriasFiltradas.map((cat) => (
      <motion.div
        key={`${cat.headquartes_id}-${cat.building_id}-${cat.order}-${cat.name}`}
        layout
        variants={staggerItem}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        transition={{
          layout: { type: 'spring', damping: 28, stiffness: 300 },
        }}
        className="break-inside-avoid mb-6"
      >
        <MenuCategoriaCard categoria={cat} onVerDetalle={setCategoriaSeleccionada} />
      </motion.div>
    ))}
  </AnimatePresence>
</motion.div>
```

### 2. Alturas Dinámicas en las Tarjetas ([MenuCategoriaCard.tsx])
- Varía de manera determinista la relación de aspecto del asset fotográfico según la posición o ID (ej. alternar entre `aspect-4/3`, `aspect-16/10` y `aspect-3/2`).
- Permite que la descripción muestre su altura natural o un rango variable (`line-clamp-2` a `line-clamp-4`), generando el ritmo visual asimétrico tipo Pinterest.

### 3. Orquestación de Animaciones
- **Stagger Reveal:** El contenedor orquesta la entrada secuencial con `staggerChildren: 0.05` y `delayChildren: 0.02`.
- **Transición FLIP:** Cada tarjeta usa `layout` con transición de resorte (`damping: 28, stiffness: 300`) para animar automáticamente los desplazamientos cuando el usuario filtre por edificio, busque por texto o cambie el orden.
- **Salida elegante:** Al filtrar elementos, `AnimatePresence mode="popLayout"` desvanece suavemente los elementos descartados mientras los restantes se reacomodan.
```

**Por qué es mejor:**
- Resuelve la mecánica visual real con `columns-*` y `break-inside-avoid`.
- Define `mode="popLayout"` en `AnimatePresence`, evitando que los elementos eliminados ocupen espacio físico durante su animación de salida.
- Proporciona valores de resorte calibrados (`damping: 28, stiffness: 300`) acordes al diseño de Nexora.

---

### Versión C — Versión Avanzada con Contratos y XML
> *Máxima especificidad para agentes de codificación, incluyendo contratos de props, física de resorte y reglas de no-regresión.*

```markdown
<task_specification>
<context>
Proyecto Nexora (React 19 + Tailwind CSS + Motion). Se requiere actualizar el renderizado del listado de menús gastronómicos de habitación para que adopte un layout asimétrico tipo Masonry (Pinterest) con transiciones FLIP completas.
</context>

<target_files>
- `src/features/servicio-habitaciones/ui/organisms/MenuCategoriasGrid.tsx`
- `src/features/servicio-habitaciones/ui/molecules/MenuCategoriaCard.tsx`
</target_files>

<layout_rules>
1. Prohibido usar librerías de terceros externas para Masonry. Utilizar la utilidad de columnas nativas de Tailwind:
   - `columns-1 sm:columns-2 lg:columns-3 xl:columns-4`
   - Separación: `gap-6 space-y-6`
   - Regla obligatoria en cada hijo para evitar que una tarjeta se parta entre dos columnas: `break-inside-avoid`.
2. Para lograr alturas asimétricas elegantes:
   - Añadir una propiedad `aspectRatio` dinámica en `MenuCategoriaCard` basada en el orden (ej. índice par `aspect-16/10`, índice impar `aspect-4/3` o `aspect-1/1`).
</layout_rules>

<motion_rules>
<animation_presence>
- El contenedor directo de la lista debe envolver los elementos en `<AnimatePresence mode="popLayout">`.
- Cada ítem debe declarar `layout` y una `key` única e inmutable.
- Prohibido usar `layoutId` en las tarjetas de la lista (reservado únicamente si se abre un modal de detalle compartido).
</animation_presence>

<variants_definition>
```typescript
const masonryContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
}

const masonryCardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
}
```
</motion_rules>

<verification_criteria>
1. Al escribir en el buscador, las tarjetas que no coinciden se desvanecen y las restantes se recolocan con animación suave sin parpadeos.
2. Al cambiar el selector de orden o edificio, las tarjetas viajan fluidamente a sus nuevas coordenadas mediante FLIP.
3. En resoluciones móviles (<640px) se muestra 1 sola columna fluida; en tablets (640-1024px) 2 columnas; y en pantallas grandes (≥1024px) 3 o 4 columnas.
4. Compilación limpia con `npm run build` sin errores de tipos.
</verification_criteria>
</task_specification>
```

---

### 🎓 Lecciones para tus próximos prompts

**Lo que hiciste bien:**
- Tuviste una **visión de interacción excelente**: entender la técnica FLIP (`layout` prop) y la necesidad de `staggerChildren` demuestra que comprendes el flujo de animación de interfaces modernas y fluidas.
- Delimitaste con precisión los breakpoints responsivos (1 columna en móvil, 2 en tablet, 3-4 en escritorio).

**3 hábitos para mejorar:**

1. **`layout` vs `layoutId` en Motion:**
   - Usa `layout` (o `layout="position"`) para animar cambios de tamaño o posición dentro de una lista de elementos independientes. Reserva `layoutId` **únicamente** cuando dos elementos distintos representen la misma entidad (por ejemplo, una tarjeta pequeña que se expande hacia un modal a pantalla completa).
   - → *Regla de oro:* **"`layout` para reordenar listas; `layoutId` solo para transformar un elemento en otro."**

2. **Diferenciar Grid de Masonry en CSS:**
   - Recuerda que CSS Grid siempre fuerza filas alineadas con espacios en blanco. Para feeds tipo Pinterest sin librerías externas, el estándar de Tailwind es `columns-*` con `break-inside-avoid`.
   - → *Regla de oro:* **"Grid alinea filas y columnas; para cascada tipo Pinterest usa CSS Columns."**

3. **Verificar el nombre de la librería en el proyecto:**
   - La librería cambió su paquete oficial de `framer-motion` a `motion` (`motion/react`). Especificar la ruta de importación correcta evita fallos de compilación en el agente.
   - → *Regla de oro:* **"Verifica el `package.json` antes de pedir imports de librerías."**

**Recurso recomendado:**
- La documentación oficial de Motion sobre [Layout Animations y técnica FLIP](https://motion.dev/docs/react-layout-animations), en particular el apartado sobre `AnimatePresence` con `mode="popLayout"`.
