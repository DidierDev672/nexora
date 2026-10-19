# 🎬 Prompt: Lazy Loading y Animaciones al Scroll (`LazyAnimatedWrapper`) con Framer Motion / Motion

## 📋 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **7.8 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+7.8):** Excelente definición funcional y de arquitectura de componentes. Comprende con precisión las capacidades clave de Motion / Framer Motion para animación bajo demanda al hacer scroll (`whileInView`, `viewport: { once: true, margin: "-100px" }`). Diseña el componente con base en el principio de responsabilidad única (Single Responsibility) como un wrapper genérico que acepta `children`.
> - **Puntos a corregir (-2.2):**
>   1. **Corte abrupto de instrucción:** El prompt finaliza truncado en *"Define "* al final del requisito 4, dejando en el aire la especificación técnica de las variantes ('fade', 'slideUp', 'zoomIn') y sus propiedades de resorte o tiempo.
>   2. **Paquete desactualizado (`framer-motion` vs `motion/react`):** En este proyecto, la librería instalada y activa es la versión moderna `motion` (`import { motion } from 'motion/react'`), no el paquete legado `framer-motion`.
>   3. **Falta de ubicación y contratos TypeScript:** No especifica la ruta de destino del componente (`src/shared/ui/LazyAnimatedWrapper.tsx`) ni la interfaz de props tipada con `HTMLMotionProps<'div'>`.
>   4. **Consideración de borde para elementos en vista inicial:** Si un elemento ya está en la parte superior al cargar la página, un `margin: "-100px"` agresivo puede retrasar la visibilidad hasta que el usuario desplace 100px; debe ser configurable por prop.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Instrucción incompleta por corte de texto** | 🔴 Crítica | El prompt finaliza abruptamente en *"Define "*, sin aclarar qué valores físicos (stiffness, damping, duration) deben tener las variantes ni cuál es la variante por defecto. |
| **Patrón 3 — Paquete y dependencias (`framer-motion` vs `motion/react`)** | 🟠 Media | Haces referencia a `Framer Motion`. En este codebase, la importación estándar y compatible es `"motion/react"`. |
| **Patrón 2 — Sin contexto de arquitectura ni ubicación** | 🟠 Media | Omites la ruta recomendada del componente (`src/shared/ui/LazyAnimatedWrapper.tsx`) y el componente de la lista de productos donde se debe integrar (`ItemMenuProductosMasonry.tsx`). |
| **Patrón 7 — Parámetro de margen fijo sin flexibilidad** | 🟡 Baja | Exiges `margin: "-100px"` sin proveer una propiedad `viewportMargin` configurable con valor por defecto, lo que podría limitar el uso del wrapper en elementos más compactos. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Conserva tu estructura y redacción original, completando la frase truncada y alineando la importación con la librería del proyecto.*

```markdown
Crea un componente React reutilizable llamado `LazyAnimatedWrapper` en [src/shared/ui/LazyAnimatedWrapper.tsx] e intégralo en la lista de productos [src/features/servicio-habitaciones/ui/organisms/ItemMenuProductosMasonry.tsx], utilizando la funcionalidad `whileInView` de Motion (`motion/react`).

Requisitos del componente:
1. Debe envolver cualquier contenido (`children`) y animarlo solo cuando entre en el viewport.
2. Debe configurarse para que la animación ocurra solo la primera vez que aparece (`viewport: { once: true }`).
3. Añade un margen de activación para que la animación empiece al entrar al viewport (`viewport: { margin: "-100px" }`, configurable mediante prop).
4. Permite personalizar el tipo de animación pasando una propiedad `variant` con opciones:
   - `'fade'`: opacidad de 0 a 1 con transición easeOut.
   - `'slideUp'`: desplazamiento vertical en `y: 32` a `y: 0` con física spring (`damping: 26, stiffness: 280`).
   - `'zoomIn'`: escala de 0.92 a 1 con física spring.
   Define 'slideUp' como variante por defecto.
```

**Cambios realizados:**
- Se completó la frase truncada definiendo las variantes requeridas y sus físicas.
- Se especificó la ruta de creación y el componente donde se integrará.
- Se ajustó la importación a `motion/react`.

---

### Versión B — Versión Optimizada para Producción
> *Estructurada, con contratos TypeScript estrictos, extensibilidad Open/Closed y props bien tipadas.*

```markdown
### Tarea: Crear componente `LazyAnimatedWrapper` e integrarlo en la Lista de Productos

#### 1. Ubicación y Exportación
- Crear: [src/shared/ui/LazyAnimatedWrapper.tsx]
- Exportar en el barril: [src/shared/ui/index.ts]
- Integrar en: [src/features/servicio-habitaciones/ui/organisms/ItemMenuProductosMasonry.tsx]

#### 2. Especificación del Componente (`LazyAnimatedWrapper`)
- Importar `motion`, `type Variants` y `type HTMLMotionProps` desde `'motion/react'`.
- Tipos de variantes soportadas:
  `type LazyAnimationVariant = 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn'`
- Props del componente:
  - `children: React.ReactNode`
  - `variant?: LazyAnimationVariant` (por defecto `'slideUp'`)
  - `customVariants?: Variants` (para permitir variantes personalizadas externas)
  - `viewportMargin?: string` (por defecto `'-100px'`)
  - `once?: boolean` (por defecto `true`)
  - `amount?: number | 'some' | 'all'` (por defecto `0.05`)
  - `delay?: number`
  - `className?: string`
- Configuración de `motion.div`:
  - `initial="hidden"`
  - `whileInView="visible"`
  - `viewport={{ once, margin: viewportMargin, amount }}`

#### 3. Integración en `ItemMenuProductosMasonry.tsx`
- Envolver cada tarjeta de producto en el Masonry (`ItemMenuProductoCard`) dentro de `<LazyAnimatedWrapper variant="slideUp" viewportMargin="-100px" once className="break-inside-avoid mb-6">`.
```

**Por qué es mejor:**
- Contratos TypeScript explícitos y sin ambigüedad.
- Extensibilidad con `customVariants` para casos avanzados.
- Guía clara de integración en el layout en cascada (Masonry).

---

### Versión C — Versión Avanzada con Especificación XML
> *Ideal para pipelines automatizados, agentes de código y especificaciones de diseño.*

```xml
<component_specification>
  <target_file>src/shared/ui/LazyAnimatedWrapper.tsx</target_file>
  <integration_file>src/features/servicio-habitaciones/ui/organisms/ItemMenuProductosMasonry.tsx</integration_file>
  <library>motion/react</library>
  
  <design_pattern>
    Intersection Observer Scroll-Triggered Animation Wrapper (whileInView)
  </design_pattern>

  <variants_registry>
    <variant name="fade">
      <hidden opacity="0" />
      <visible opacity="1" transition="duration: 0.45, ease: 'easeOut'" />
    </variant>
    <variant name="slideUp" default="true">
      <hidden opacity="0" y="32" />
      <visible opacity="1" y="0" transition="type: 'spring', damping: 26, stiffness: 280, mass: 0.8" />
    </variant>
    <variant name="zoomIn">
      <hidden opacity="0" scale="0.92" />
      <visible opacity="1" scale="1" transition="type: 'spring', damping: 25, stiffness: 300, mass: 0.8" />
    </variant>
  </variants_registry>

  <viewport_defaults>
    <once>true</once>
    <margin>-100px</margin>
    <amount>0.05</amount>
  </viewport_defaults>
</component_specification>
```

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Modularidad:** Diseñar un wrapper desacoplado (`LazyAnimatedWrapper`) en lugar de acoplar lógica de scroll dentro de cada tarjeta de producto individual es la mejor práctica de arquitectura frontend (Principio de Responsabilidad Única).
- **Control de viewport:** Conocer `whileInView`, `viewport.once` y `margin` demuestra un dominio excelente de las APIs modernas de animación web.

### 3 Hábitos para mejorar:

1. **Revisa que el prompt no quede truncado antes de enviarlo:**
   - Si tu instrucción termina en *"Define "*, el modelo tendrá que inferir tus parámetros o pedirte aclaraciones.
   - → **Regla de oro:** *"Si el prompt se corta, la respuesta se dispersa. Revisa siempre la última línea."*

2. **Indica el paquete instalado en el ecosistema (`motion/react`):**
   - La librería moderna de Framer Motion se importa desde `motion/react`. Especificarlo previene que el agente intente importar desde paquetes desactualizados como `framer-motion`.
   - → **Regla de oro:** *"Especifica la ruta exacta del paquete cuando utilices librerías con múltiples versiones."*

3. **Declara la ubicación del archivo (`src/shared/ui/...`):**
   - Indicar dónde debe vivir el componente reutilizable ahorra búsquedas innecesarias y asegura que el código quede en la carpeta correcta del proyecto.
   - → **Regla de oro:** *"Todo componente nuevo necesita una dirección clara en el árbol del proyecto."*

---

### 📚 Recurso recomendado
- Motion Dev Docs: [Scroll-triggered animations with whileInView](https://motion.dev/docs/react-scroll-animations#whileinview).
