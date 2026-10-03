# Prompt: Transición Cross-Fade de Colores e Iconos con Framer Motion en ThemeToggle

## 📋 Registro del Prompt Original

```text
@[src/features/dashboard/ui/atoms/theme-toggle.tsx] , cuando se dambiendo de modo entre dark y ligth, debemos de implementar el siguiente efecto: Cross-fade de colores se desvanece mientras el otro apareace, Framer Motion, la forma mas limpia y eficiente es animar la propiedad backgroundColor utilizando transiciones de tipo tween.

Claves del funcionamiento
. type: "tween": por defecto, Framer Motion utiliza animaciones de tipo spring (resorte) para propiedades fisicas. Para cambios de color o de opacidad, un comportamiento lineal o suavizado (tween) genera un efecto de desvenecimiento cruzando mucho mas natural.
. esea: "easeInOut": Garanitiza que el inicio y el final de la transicion de color sean suaves, evitando cambios bruscos de tono.
. Cambio de estado: Al modificar isAlternative, Framer Motion calcula automaticamente los valores intermedios (interpolacion) entre ambos colores dark y ligth.

Crea un archivo markdown para este prompt y almacenalo en la carpeta prompt. Si el prompt cuenta con algun error puede corregirlo. Por favor
```

---

## 🔧 Diagnóstico y Análisis del Prompt

### Problemas detectados en el prompt original

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 4 — Inconsistencia en nomenclatura (`isAlternative`)** | 🔴 Alta | El prompt menciona `"Al modificar isAlternative"`, pero en `ThemeToggle` (`src/features/dashboard/ui/atoms/theme-toggle.tsx`) el estado real del tema es gestionado por `useTheme()` mediante `isDark` o `theme` (`'light' \| 'dark'`). Usar un nombre ajeno genera confusión o sobre-ingeniería en el agente. |
| **Patrón 3 — Errores tipográficos y sintaxis de animación** | 🟠 Media | Se detectó `esea: "easeInOut"` en lugar de `ease: "easeInOut"`. Además existen errores ortográficos: `"dambiendo"` (cambiando), `"ligth"` (light), `"apareace"` (aparece), `"desvenecimiento"` (desvanecimiento), `"cruzando"` (cruzado), `"Garanitiza"` (Garantiza). |
| **Patrón 1 — Instrucciones técnicas implícitas (Valores de color y duración)** | 🟠 Media | Solicita animar `backgroundColor`, pero no define qué paleta de colores utilizar (ej. `#fffdf8` para modo claro y `#211a12` para modo oscuro, correspondientes a `--nx-panel`). Tampoco especifica la duración de la transición (`duration`, típicamente entre `0.25s` y `0.4s`). |
| **Patrón 7 — Alcance incompleto del "Cross-Fade"** | 🟡 Media-Baja | En un selector de tema (`ThemeToggle`), el cross-fade comprende dos elementos esenciales: el fondo (`backgroundColor`) y el icono (`SunIcon` / `MoonIcon`). Si solo se anima el fondo, el icono cambiaría abruptamente sin desvanecerse. Se debe explicitar el tratamiento del icono (ej. con `AnimatePresence` o cross-fade de opacidad/rotación). |

---

## 🚀 Versiones Mejoradas del Prompt

### Versión A — Corrección Mínima
> *Ideal si deseas conservar la estructura y estilo original, corrigiendo únicamente la ortografía, sintaxis técnica y la variable de estado.*

```text
@[src/features/dashboard/ui/atoms/theme-toggle.tsx] , cuando se esté cambiando de modo entre dark y light, debemos implementar el siguiente efecto: Cross-fade donde un color se desvanece mientras el otro aparece. Con Framer Motion (motion/react), la forma más limpia y eficiente es animar la propiedad backgroundColor utilizando transiciones de tipo tween.

Claves del funcionamiento:
- type: "tween": Por defecto, Framer Motion utiliza animaciones de tipo spring (resorte) para propiedades físicas. Para cambios de color o de opacidad, un comportamiento suavizado (tween) genera un efecto de desvanecimiento cruzado mucho más natural.
- ease: "easeInOut": Garantiza que el inicio y el final de la transición de color sean suaves, evitando cambios bruscos de tono. Duración recomendada: 0.3s.
- Cambio de estado: Al alternar `isDark` (del hook `useTheme`), Framer Motion interpola automáticamente los valores intermedios entre el color claro (#fffdf8) y oscuro (#211a12).
- Asegura que los iconos (SunIcon / MoonIcon) también realicen una transición suave de desvanecimiento acorde al cambio.
```

**Cambios realizados:**
- Corrección de errores ortográficos (`dambiendo` → cambiando, `ligth` → light, `esea` → `ease`, `desvenecimiento` → desvanecimiento).
- Corrección de la variable `isAlternative` por `isDark` (proveniente de `useTheme()`).
- Inclusión explícita de colores hex y duración de la transición.

---

### Versión B — Versión Optimizada (Recomendada para Producción)
> *Estructurada, con especificaciones técnicas claras de diseño, rendimiento y tokens semánticos.*

```text
Actúa como un desarrollador frontend senior especializado en React, TypeScript y Framer Motion (`motion/react`).

Objetivo:
Implementar una animación fluida de desvanecimiento cruzado (Cross-Fade) en el componente `ThemeToggle` (`src/features/dashboard/ui/atoms/theme-toggle.tsx`) al alternar entre modo claro y modo oscuro.

Especificaciones técnicas:
1. Transición de fondo (`backgroundColor`):
   - Animar el `backgroundColor` del `motion.button` usando los colores de superficie del sistema de diseño Nexora:
     * Modo claro: '#fffdf8' (panel claro)
     * Modo oscuro: '#211a12' (panel oscuro)
   - Configuración de transición:
     * `type: "tween"`
     * `ease: "easeInOut"`
     * `duration: 0.3`
   - Justificación: Las curvas tipo `tween` con `easeInOut` proporcionan una interpolación cromática perceptual mucho más natural que el amortiguamiento de tipo `spring`.

2. Transición de iconos (`SunIcon` / `MoonIcon`):
   - Utilizar `AnimatePresence mode="wait"` o interpolación de opacidad y rotación suave (`initial={{ opacity: 0, rotate: -45, scale: 0.8 }}`, `animate={{ opacity: 1, rotate: 0, scale: 1 }}`, `exit={{ opacity: 0, rotate: 45, scale: 0.8 }}`) con duración de `0.2s` para que el icono saliente se desvanezca mientras el entrante se presenta con suavidad.

3. Integración y Accesibilidad:
   - Mantener el consumo del hook `useTheme()` ({ isDark, toggleTheme }).
   - Conservar la microinteracción táctil existente `whileTap={{ scale: 0.95 }}`.
   - Preservar `aria-label`, `title` y los estilos de foco accesible (`focus-visible:ring-2`).
```

**Por qué es mejor:**
- Establece valores de diseño exactos alineados con los tokens del proyecto.
- Resuelve integralmente tanto el fondo como los iconos del botón.
- Elimina cualquier ambigüedad técnica para el desarrollador o agente de IA.

---

### Versión C — Versión Avanzada (con XML y Criterios de Aceptación)
> *Ideal para máxima consistencia y control en flujos de desarrollo autónomos con agentes.*

```text
<task>
  <objective>
    Implementar una transición de desvanecimiento cruzado (Cross-Fade) en el botón `ThemeToggle` (`src/features/dashboard/ui/atoms/theme-toggle.tsx`) utilizando transiciones `tween` de `motion/react`.
  </objective>

  <context>
    El componente `ThemeToggle` consume el hook `useTheme()` que expone `isDark` y `toggleTheme()`. El botón cuenta con clases de Tailwind CSS y tokens semánticos de Nexora (`bg-panel`, `text-ink-muted`, `border-line`).
  </context>

  <animation_specifications>
    <property name="backgroundColor">
      <light_value>#fffdf8</light_value>
      <dark_value>#211a12</dark_value>
      <transition>
        <type>tween</type>
        <ease>easeInOut</ease>
        <duration>0.3</duration>
      </transition>
    </property>
    <property name="icon_cross_fade">
      <container>AnimatePresence mode="wait"</container>
      <initial>opacity: 0, rotate: -30, scale: 0.85</initial>
      <animate>opacity: 1, rotate: 0, scale: 1</animate>
      <exit>opacity: 0, rotate: 30, scale: 0.85</exit>
      <transition>
        <type>tween</type>
        <ease>easeOut</ease>
        <duration>0.2</duration>
      </transition>
    </property>
  </animation_specifications>

  <requirements>
    1. Usar `motion.button` para coordinar el `backgroundColor` animado y el feedback táctil `whileTap={{ scale: 0.95 }}`.
    2. Evitar saltos de color asignando explícitamente los valores hex correspondientes a los tokens de panel claro y oscuro.
    3. Asegurar que las etiquetas de accesibilidad `aria-label` y `title` se actualicen dinámicamente según `isDark`.
    4. Garantizar compatibilidad con TypeScript sin errores de compilación (`tsc -b`).
  </requirements>
</task>
```

---

## 💡 Implementación Técnica de Referencia

A continuación se presenta cómo queda implementado el componente con las especificaciones del prompt optimizado:

```tsx
import { AnimatePresence, motion } from 'motion/react'
import { MoonIcon, SunIcon } from '../icons'
import { useTheme } from '../../application/use-theme'

export interface ThemeToggleProps {
  className?: string
}

const PANEL_COLORS = {
  light: '#fffdf8',
  dark: '#211a12',
}

/**
 * Componente ThemeToggle con animación Cross-Fade:
 * - Interpolación de backgroundColor con curva tween y easeInOut.
 * - Desvanecimiento cruzado de iconos con AnimatePresence.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      animate={{
        backgroundColor: isDark ? PANEL_COLORS.dark : PANEL_COLORS.light,
      }}
      transition={{
        type: 'tween',
        ease: 'easeInOut',
        duration: 0.3,
      }}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo oscuro activado · Clic para modo claro' : 'Modo claro activado · Clic para modo oscuro'}
      className={`inline-flex size-9 items-center justify-center overflow-hidden rounded-lg border border-line text-ink-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`.trim()}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun-icon"
            initial={{ opacity: 0, rotate: -45, scale: 0.75 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.75 }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <SunIcon className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="moon-icon"
            initial={{ opacity: 0, rotate: 45, scale: 0.75 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -45, scale: 0.75 }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <MoonIcon className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
```

---

## 🎓 Lecciones para tus Próximos Prompts

**Lo que hiciste bien:**
- **Entendimiento técnico certero:** Tu comprensión de por qué usar `type: "tween"` en lugar de `spring` para interpolación cromática es impecable. Los cambios de color son matemáticos/espectrales y no físicos, por lo que `spring` suele generar oscilaciones extrañas de saturación o brillo.
- **Identificación de la curva de aceleración:** Elegir `easeInOut` es la decisión correcta para que la transición no sea robótica ni abrupta.

**3 hábitos para mejorar:**
1. **Verifica la concordancia de identificadores y variables:**
   - Evita introducir nombres genéricos o de plantillas externas (`isAlternative`) cuando el proyecto ya tiene un contrato establecido (`isDark`, `theme`).
   - *Regla de oro:* "Revisa el código actual antes de nombrar variables en el prompt."
2. **Revisa la sintaxis de las propiedades de animación:**
   - Escribir `esea` en lugar de `ease` puede provocar que un asistente no infiera de inmediato el atributo si el contexto es escueto.
   - *Regla de oro:* "Si indicas código o configuraciones literales, asegúrate de que coincidan con la API oficial."
3. **Completa el ciclo sensorial de la interfaz:**
   - Cuando pidas animar un elemento compuesto (como un botón con icono y fondo), define si la animación afecta solo al contenedor o también a su contenido.
   - *Regla de oro:* "El movimiento coherente involucra tanto al contenedor como al contenido."
