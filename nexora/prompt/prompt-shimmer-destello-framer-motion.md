# ✨ Prompt: Destello Luminoso (Shimmer / Illumination) con Framer Motion en Botones de Filtro

## 📋 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **7.9 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+7.9):** Muy buena comprensión técnica del principio físico del efecto *shimmer*: identificar que la técnica de mayor rendimiento consiste en duplicar el tamaño del fondo (`backgroundSize: '200% 100%'`) y desplazar la posición (`backgroundPosition: ['200% 0', '-200% 0']`) con `repeat: Infinity` en lugar de crear capas DOM complejas superpuestas. Identificó con precisión los 5 filtros objetivo de la plataforma.
> - **Puntos a corregir (-2.1):** 
>   1. **Desajuste de archivo objetivo:** El prompt indica `configuraciones-page.tsx`, pero los botones de categorías (`Todos`, `Operaciones`, `Comercial`, `Seguridad y Accesos`, `Diseño y 3D`) no se renderizan directamente en la página, sino en la molécula `src/features/configuraciones/ui/molecules/modulo-filter-bar.tsx`. Un agente de código que busque los botones en la página no los encontrará o intentará reescribir la página rompiendo la arquitectura de Atomic Design.
>   2. **Omisión de la definición del gradiente:** Menciona animar `backgroundPosition`, pero no especifica la fórmula CSS de `backgroundImage` (`linear-gradient(...)`), los stops de color ni cómo armonizar con el color del tema (`primary` o transparente). Sin gradiente definido, la animación de posición no produce ningún efecto visual perceptible.
>   3. **Riesgo UX por sobrecarga visual (Fatiga visual):** Animar los 5 botones con destellos infinitos simultáneos crearía un parpadeo constante y molesto para el recepcionista. En UI profesional, el shimmer continuo debe reservarse para el **botón activo (`isActive`)** o activarse sutilmente en hover/focus.
>   4. **Biblioteca y sintaxis:** En el stack del proyecto se utiliza Motion v13+ para React 19 (`motion/react`) en lugar del import histórico `framer-motion`. Incluye erratas de redacción: *"necesito el implementar un botones en los botones"*, *"Diseno"*, *"Puntos clave la estructura"*.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 2 — Desajuste de archivo arquitectónico** | 🔴 Alta | Indicas `configuraciones-page.tsx`, pero los botones de filtro pertenecen a `src/features/configuraciones/ui/molecules/modulo-filter-bar.tsx`. El agente podría crear botones duplicados en la página en vez de enriquecer la barra de filtros existente. |
| **Patrón 1 — Definición incompleta del gradiente lineal** | 🔴 Alta | Mencionas `backgroundSize` y `backgroundPosition`, pero omites la propiedad base `backgroundImage` con el `linear-gradient` (colores, ángulos y porcentajes de destello). Sin fondo lineal, la animación no produce luz. |
| **Patrón 7 — Sobrecarga visual y fatiga de usuario** | 🟠 Media | Solicitar el efecto infinito en los 5 botones a la vez satura la interfaz. Debe condicionarse al botón seleccionado (`isActive`) o como microinteracción (`whileHover`). |
| **Patrón 3 — Nombre de librería y sintaxis moderna** | 🟡 Baja | En este repositorio se utiliza React 19 y `motion/react`. Además, la sintaxis debe contemplar compatibilidad con el sistema de tokens de Tailwind. |
| **Patrón 3 — Erratas tipográficas** | 🟡 Baja | Contiene frases como *"necesito el implementar un botones en los botones"* y *"Diseno y 3D"* (sin tilde). |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Conserva tu estructura y redacción original, corrigiendo la ubicación del componente, las erratas y especificando el gradiente.*

```markdown
En el componente [src/features/configuraciones/ui/molecules/modulo-filter-bar.tsx] (utilizado en [src/features/configuraciones/ui/configuraciones-page.tsx]), implementa un efecto de Destello Luminoso (Shimmer / Illumination) con Motion (`motion/react`) en los botones de categorías:
- Todos
- Operaciones
- Comercial
- Seguridad y Accesos
- Diseño y 3D

El efecto debe aplicarse principalmente cuando el botón esté activo (`isActive === true`), animando la propiedad `backgroundPosition` sobre un gradiente lineal:

Puntos clave de la estructura:
1. `backgroundImage`: Define un gradiente lineal que combine el color del tema con una franja de brillo translúcido, por ejemplo:
   `linear-gradient(110deg, var(--color-primary, #4f46e5) 0%, rgba(255,255,255,0.35) 50%, var(--color-primary, #4f46e5) 100%)`.
2. `backgroundSize: "200% 100%"`: Duplica el ancho del fondo para permitir el recorrido del haz de luz.
3. `backgroundPosition`: Anima cíclicamente desde `'200% 0'` hacia `'-200% 0'` para simular el barrido de luz de derecha a izquierda.
4. `repeat: Infinity`: Mantiene la animación continua con `ease: 'linear'` y `duration: 2.6s` en el botón seleccionado, agregando también una microinteracción sutil al pasar el cursor (`whileHover`).
```

**Cambios realizados:**
- Se redirigió al archivo exacto donde se encuentran los botones: `modulo-filter-bar.tsx`.
- Se corrigió la redacción y tipografía (*"necesito el implementar un botones"*, *"Diseño"*).
- Se agregó la definición explícita de `backgroundImage` indispensable para que el efecto funcione.
- Se condicionó el loop continuo al botón activo para evitar fatiga visual.

---

### Versión B — Versión Optimizada para Producción
> *Estructurada, explícita y lista para ejecución directa en código de producción con tokens de Tailwind y Motion.*

```markdown
### Tarea: Implementar Efecto Shimmer (Destello Luminoso) en Botones de Filtro en [src/features/configuraciones/ui/molecules/modulo-filter-bar.tsx]

#### 1. Contexto y Objetivo
En la barra de filtros de configuración (`ModuloFilterBar`), sustituir los `<button>` estándar por botones animados con `<motion.button>` de `motion/react`.
Cuando un filtro esté seleccionado (`isActive`), debe proyectar un destello luminoso continuo (*shimmer*) mediante la animación fluida de `backgroundPosition`. Cuando esté inactivo, debe mantener su estilo sobrio con un destello sutil solo al interactuar (`whileHover`).

#### 2. Especificación de Animación y Estilos

```tsx
import { motion, type Variants } from 'motion/react'

// Variantes de animación para el destello
const SHIMMER_BUTTON_VARIANTS: Variants = {
  active: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      repeat: Infinity,
      duration: 2.8,
      ease: 'linear',
    },
  },
  inactive: {
    backgroundPosition: '0% 0',
  },
}
```

#### 3. Implementación en `modulo-filter-bar.tsx`
- Sustituir el `<button>` de categoría por `<motion.button>`:
  - `animate={isActive ? 'active' : 'inactive'}`
  - `variants={SHIMMER_BUTTON_VARIANTS}`
  - `whileHover={{ scale: 1.03 }}`
  - `whileTap={{ scale: 0.97 }}`
- Para el botón activo (`isActive`):
  - Añadir estilo de gradiente:
    `background: 'linear-gradient(110deg, var(--color-primary, #4338ca) 0%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0.45) 50%, rgba(255, 255, 255, 0.35) 55%, var(--color-primary, #4338ca) 100%)'`
  - `backgroundSize: '200% 100%'`
- Para botones inactivos:
  - Conservar clases Tailwind (`border border-line bg-panel text-ink-muted hover:border-primary/30 hover:text-ink`).
- Garantizar accesibilidad con `aria-selected={isActive}` y `role="tab"`.
```

**Por qué es mejor:**
- Entrega el bloque de código tipado con `Variants` y parámetros de tiempo exactos (`duration: 2.8`, `ease: 'linear'`).
- Evita que los 5 botones parpadeen a la vez, reservando el efecto estrella para la pestaña activa.
- Emplea el import moderno `motion/react` compatible con React 19.

---

### Versión C — Versión Avanzada con Especificación XML
> *Ideal para pipelines de IA, agentes autónomos y automatización sin ambigüedades.*

```xml
<task>
  <target_file>src/features/configuraciones/ui/molecules/modulo-filter-bar.tsx</target_file>
  <feature>Framer Motion / Motion Shimmer Illumination Effect</feature>
  <context>
    Los 5 botones de categoría ('Todos', 'Operaciones', 'Comercial', 'Seguridad y Accesos', 'Diseño y 3D') 
    deben incorporar un efecto de destello de luz infinito cuando están activos, destacando la selección actual.
  </context>

  <technical_specifications>
    <library>motion/react</library>
    <shimmer_physics>
      - backgroundSize: "200% 100%"
      - backgroundPosition: ["200% 0", "-200% 0"]
      - repeat: Infinity
      - duration: 2.6
      - ease: "linear"
    </shimmer_physics>

    <ui_rules>
      - Active state: Linear gradient con iluminación central blanca translúcida (alpha: 0.3-0.4) combinada con el color primario de Nexora.
      - Inactive state: Fondo panel neutro, con microinteracción hover limpia.
      - A11y: Conservar role="tab", aria-selected y permitir navegación por teclado sin bloquear el foco.
    </ui_rules>
  </technical_specifications>

  <expected_code_pattern>
<![CDATA[
<motion.button
  key={cat.id}
  role="tab"
  aria-selected={isActive}
  type="button"
  onClick={() => onCategoriaChange(cat.id)}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  animate={
    isActive
      ? {
          backgroundPosition: ['200% 0', '-200% 0'],
          transition: { repeat: Infinity, duration: 2.6, ease: 'linear' },
        }
      : { backgroundPosition: '0% 0' }
  }
  style={
    isActive
      ? {
          backgroundImage:
            'linear-gradient(110deg, var(--color-primary, #4f46e5) 0%, rgba(255,255,255,0.38) 50%, var(--color-primary, #4f46e5) 100%)',
          backgroundSize: '200% 100%',
        }
      : undefined
  }
  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
    isActive
      ? 'text-cream shadow-xs'
      : 'border border-line bg-panel text-ink-muted hover:border-primary/30 hover:text-ink'
  }`}
>
  {cat.label}
</motion.button>
]]>
  </expected_code_pattern>
</task>
```

**Técnicas aplicadas:**
- Delimitación técnica de propiedades en bloques XML.
- Exclusión condicional de estilos inline (`style={isActive ? ... : undefined}`) para no alterar el rendimiento de los botones inactivos.
- Código modelo completo con gestión de eventos y atributos de accesibilidad.

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Explicaste el mecanismo técnico subyacente:** Comprender que un shimmer eficiente se basa en desplazar `backgroundPosition` sobre un fondo del doble de ancho (`200% 100%`) evita crear elementos `div` flotantes u opacidades que consumen más GPU.
- **Identificaste las opciones exactas del filtro:** Enumerar las 5 categorías ayuda a verificar inmediatamente si los datos del modelo coinciden con el dominio del sistema.

### 3 Hábitos para mejorar:

1. **Ubica el componente específico en la arquitectura de Atomic Design:**
   - La página (`configuraciones-page.tsx`) solo orquesta organismos; los botones residen dentro de una molécula (`modulo-filter-bar.tsx`). Especificar el archivo exacto ahorra pasos de exploración y previene código redundante.
   - → **Regla de oro:** *"Apunta al componente que contiene el marcado, no solo a la página que lo aloja."*

2. **Define la propiedad estática indispensable antes de animarla:**
   - Para animar `backgroundPosition`, el navegador necesita saber qué imagen de fondo existe. Si falta `backgroundImage: linear-gradient(...)`, la animación no producirá ningún efecto visual.
   - → **Regla de oro:** *"Si animas la posición de un fondo, define siempre los colores y paradas de ese fondo."*

3. **Cuida la ergonomía visual del usuario final (evita animaciones en masa):**
   - Si 5 botones cercanos parpadean al mismo tiempo de manera perpetua, compiten por la atención del usuario y generan fatiga cognitiva. Animar el elemento activo o activar el efecto bajo interacción (`hover`) aporta un acabado mucho más refinado y profesional.
   - → **Regla de oro:** *"La luz infinita destaca lo importante; si todo brilla, nada destaca."*

---

### 📚 Recurso recomendado
- [Framer Motion / Motion Documentation - CSS Gradients & Background Animations](https://motion.dev/docs/react-animation)
- [Anthropic Prompt Engineering - Explicit Context & Design Systems](https://platform.claude.com/docs/es/build-with-claude/prompt-engineering/claude-prompting-best-practices)
