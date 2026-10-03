# 🌊 Prompt: Stagger Reveal (Revelado Escalonado) en Framer Motion para Tablas y Listas

## 📋 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **8.2 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+8.2):** Excelente comprensión conceptual del sistema de orquestación de Framer Motion. Explica con total certeza que las variantes (`variants`) propagan automáticamente las transiciones entre padres e hijos (`hidden` $\rightarrow$ `visible`) sin necesidad de calcular manualmente `delay: index * factor`, y describe adecuadamente el uso de `staggerChildren` y `whileInView` con `viewport={{ once: true }}`.
> - **Puntos a corregir (-1.8):** 
>   1. **Desajuste de etiquetas HTML:** El prompt cita `motion.li`, pero el componente destino es una tabla (`<table>`), por lo que los elementos correspondientes son `motion.tbody` y `motion.tr` (además de `motion.div` para la versión móvil).
>   2. **Erratas tipográficas:** *"varients"* (en lugar de `variants`) y *"revelado escalando"* (en lugar de *"revelado escalonado"* / *stagger reveal*).
>   3. **Omisión de parámetros numéricos:** No provee los valores recomendados para el resorte o desplazamiento inicial (`y: 8, scale: 0.98`, `staggerChildren: 0.045`).

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 3 — Desajuste semántico HTML (`motion.li` vs `motion.tr`)** | 🟠 Media | Mencionas: *"No necesitas pasarle initial ni animate a los componentes motion.li"*. En una tabla HTML (`TarifasTable`), usar `motion.li` dentro de `<tbody>` provocaría HTML inválido y errores de hidratación; debe aplicarse en `motion.tr` y `motion.tbody`. |
| **Patrón 3 — Erratas tipográficas y de redacción** | 🟡 Baja | Contiene *"propiedades varients"* (en vez de `variants`), *"revelado escalando"* (en vez de *escalonado*), y puntuación mejorable en *"la tabla debe tener el siguiente, Stagger reveal..."*. |
| **Patrón 1 — Parámetros numéricos implícitos** | 🟠 Media | Omites los valores numéricos concretos de `staggerChildren` (ej. `0.045s`) y de la física de entrada de las filas (`type: 'spring', damping: 26, stiffness: 300`), delegando la calibración a la inventiva del modelo. |
| **Patrón 7 — Calibración de `viewport`** | 🟡 Baja | Recomiendas `viewport={{ once: true }}` pero omites `amount: 0.05` o margen de activación, lo que puede provocar que la tabla dispare la animación antes de ser realmente perceptible por el usuario. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Conserva tu estructura y redacción original, corrigiendo las erratas y alineando las etiquetas HTML con la tabla.*

```markdown
En el componente [src/features/tarifas/ui/organisms/tarifas-table.tsx], implementa un efecto de Stagger Reveal (revelado escalonado) con Framer Motion / Motion para las filas de la tabla y las tarjetas móviles.

Utiliza la propiedad `variants` junto con `staggerChildren` en el contenedor padre (`motion.tbody` / contenedor móvil) para que los elementos hijos (`motion.tr` / `motion.div`) se revelen secuencialmente de forma automática.

Cómo debe funcionar:
1. `staggerChildren`: Defínelo dentro de la transición del estado `visible` del padre (ej. `staggerChildren: 0.045, delayChildren: 0.03`).
2. Propagación automática a hijos: Al compartir las mismas llaves de variantes (`hidden` y `visible`) entre el contenedor padre y los hijos (`motion.tr`), Framer Motion orquesta la animación sin necesidad de declarar `initial`, `animate` o `delay: index * N` manualmente en cada fila.
3. Scroll interactivo: Utiliza `initial="hidden"`, `whileInView="visible"` y `viewport={{ once: true, amount: 0.05 }}` en el padre para que la animación inicie fluidamente al entrar en pantalla.
```

**Cambios realizados:**
- Se corrigió `motion.li` por `motion.tbody` y `motion.tr`.
- Se corrigieron las erratas tipográficas (`varients` $\rightarrow$ `variants`, `escalando` $\rightarrow$ `escalonado`).
- Se proporcionaron valores de referencia para `staggerChildren` y `viewport.amount`.

---

### Versión B — Versión Optimizada para Producción
> *Estructurada, explícita y lista para ejecución directa en código de producción.*

```markdown
### Tarea: Implementar Stagger Reveal con Framer Motion en [src/features/tarifas/ui/organisms/tarifas-table.tsx]

#### 1. Definición de Variantes Tipadas (`Variants`)
Define las constantes de variantes fuera del componente para evitar recreaciones en render:

```ts
import type { Variants } from 'motion/react';

const TABLE_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
};

const TABLE_ROW_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
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
};
```

#### 2. Implementación en la Tabla de Escritorio (`<table>`)
- Reemplazar `<tbody>` por `<motion.tbody>` con:
  - `variants={TABLE_CONTAINER_VARIANTS}`
  - `initial="hidden"`
  - `whileInView="visible"`
  - `viewport={{ once: true, amount: 0.05 }}`
- En cada fila `{localRates.map(rate => ...)}`:
  - Usar `<motion.tr key={rate.id} variants={TABLE_ROW_VARIANTS}>`
  - Eliminar los atributos manuales `initial`, `animate` y `transition={{ delay: index * ... }}`.

#### 3. Implementación en la Vista Móvil (`md:hidden`)
- Envolver el listado de tarjetas en un `<motion.div>` con las mismas variantes de contenedor (`variants={TABLE_CONTAINER_VARIANTS}`).
- Asignar `variants={TABLE_ROW_VARIANTS}` a cada tarjeta `<motion.div key={rate.id}>`.
```

**Por qué es mejor:**
- Contiene los snippets de TypeScript exactos y tipados con `Variants`.
- Cubre tanto la vista de tabla para escritorio como la vista de tarjetas para dispositivos móviles.
- Suprime la anti-práctica de calcular retrasos manuales con `index * delay`.

---

### Versión C — Versión Avanzada con Especificación XML
> *Ideal para prompts de agentes autónomos, pipelines CI/CD y automatización sin ambigüedades.*

```xml
<task>
  <target_file>src/features/tarifas/ui/organisms/tarifas-table.tsx</target_file>
  <animation_pattern>Framer Motion Stagger Reveal Orchestration</animation_pattern>
  <context>
    Sustituir las animaciones manuales con cálculo de índice (delay: index * 0.03)
    por orquestación automática mediante Variants y staggerChildren en el componente TarifasTable.
  </context>

  <technical_specifications>
    <container_rule element="motion.tbody | motion.div.md:hidden">
      - Debe declarar variants con estados 'hidden' y 'visible'.
      - En 'visible.transition', configurar:
        staggerChildren: 0.045
        delayChildren: 0.03
      - Activar con initial="hidden", whileInView="visible" y viewport={{ once: true, amount: 0.05 }}.
    </container_rule>

    <child_rule element="motion.tr | motion.div.card">
      - Debe declarar variants con estados 'hidden' ({ opacity: 0, y: 8, scale: 0.98 })
        y 'visible' ({ opacity: 1, y: 0, scale: 1 }).
      - Usar física spring: { type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }.
      - PROHIBIDO pasar props initial o animate individuales; deben ser heredadas del padre.
    </child_rule>
  </technical_specifications>

  <expected_code_pattern>
<![CDATA[
// Contenedor
<motion.tbody
  variants={TABLE_CONTAINER_VARIANTS}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.05 }}
  className="divide-y divide-stone-100 dark:divide-stone-800/80"
>
  {localRates.map((rate) => (
    <motion.tr
      key={rate.id}
      variants={TABLE_ROW_VARIANTS}
      className="group transition-colors hover:bg-stone-50/80 dark:hover:bg-stone-800/40"
    >
      {/* Celdas */}
    </motion.tr>
  ))}
</motion.tbody>
]]>
  </expected_code_pattern>
</task>
```

**Técnicas aplicadas:**
- Especificación técnica modular y auto-contenida con XML.
- Regla explícita anti-redundancia para no heredar propiedades manuales en hijos.
- Código modelo delimitado por `CDATA`.

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Explicaste el mecanismo de orquestación:** Comprender que las variantes propagan el estado automáticamente hacia los hijos por coincidencia de llaves (`hidden` y `visible`) es la clave de oro de Framer Motion.
- **Identificaste `whileInView`:** Proponer `whileInView` con `viewport={{ once: true }}` es la técnica estándar para evitar animaciones invisibles ocurridas antes del scroll.

### 3 Hábitos para mejorar:

1. **Adapta las etiquetas al contexto del componente:**
   - Si estás trabajando en una tabla, habla de `motion.tr` y `motion.tbody`; si es una cuadrícula, de `motion.div`. Citar `motion.li` por costumbre de ejemplos de la documentación puede confundir a un agente y generar marcado inválido.
   - → **Regla de oro:** *"Verifica la semántica HTML del componente antes de nombrar las etiquetas animadas."*

2. **Entrega los coeficientes numéricos de la orquestación:**
   - Especifica siempre cuánto durará el escalonado (`staggerChildren: 0.04s` a `0.06s` suele ser el punto dulce entre fluidez y rapidez).
   - → **Regla de oro:** *"Sin números, el modelo inventará tiempos que pueden verse lentos o imperceptibles."*

3. **Revisa la ortografía técnica (`variants`, no `varients`):**
   - Aunque los LLMs entienden erratas por contexto, un término de API mal escrito (`varients`) puede filtrarse literalmente en el código generado si el modelo asume que es una variable local.
   - → **Regla de oro:** *"Los nombres de props y APIs deben escribirse con precisión quirúrgica."*

---

### 📚 Recurso recomendado
- Documentación oficial de Framer Motion / Motion: [Transition Orchestration](https://motion.dev/docs/react-transitions#orchestration) y [Variants Propagation](https://motion.dev/docs/react-animation#variants).
