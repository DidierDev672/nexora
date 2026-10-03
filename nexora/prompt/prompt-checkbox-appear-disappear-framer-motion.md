# 🔘 Prompt: Checkbox Interactivo con Efecto Appear / Disappear (Entrada y Salida) en Motion

## 📋 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **8.2 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+8.2):** Excelente comprensión técnica de los requisitos esenciales de Motion: identifica la necesidad indispensable de `<AnimatePresence>` para permitir que los componentes ejecuten animaciones de salida (`exit`) antes de ser desmontados del DOM. Define con claridad los tres estados (`initial`, `animate`, `exit`) y un rango de duración adecuado (`0.2s - 0.4s`).
> - **Puntos a corregir (-1.8):** 
>   1. **Ambigüedad de destino:** Menciona `ficha-huesped-modal.tsx` (que es actualmente un modal inspector de solo lectura sin checkboxes), mientras que el componente con checkboxes de selección activos es `buscar-huespedes-modal.tsx`.
>   2. **Calibración de escala/desplazamiento:** Sugiere `y: 20` para un checkbox; un desplazamiento vertical de 20px es excesivo para un control que mide 20–24px (provoca que se dibuje fuera de su celda). Un `y: 4` a `y: 0` o un `scale: 0.7` a `1.0` resulta mucho más orgánico y refinado.
>   3. **Librería moderna:** En el stack de Nexora se utiliza `motion/react` (Motion v13+ para React 19) en lugar del import legado `framer-motion`.
>   4. **Accesibilidad (A11y):** No especifica mantener un `<input type="checkbox" className="sr-only">` para permitir navegación por teclado (`Tab`, `Espacio`) y lectores de pantalla.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Instrucción ambigua de objetivo** | 🟠 Media | Referencias `ficha-huesped-modal.tsx` cuando dicho modal muestra la ficha detallada del huésped. Los checkboxes de selección están en `buscar-huespedes-modal.tsx`. Es conveniente aclarar si se crea un checkbox nuevo en la ficha o se aplica al selector de huéspedes. |
| **Patrón 1 — Desplazamiento descalibrado (`y: 20`)** | 🟡 Baja | Un `y: 20` para un checkbox de 20px genera un salto brusco. En microinteracciones UI de este tamaño, se recomienda `scale: 0.65 -> 1` o un desplazamiento sutil `y: 3 -> 0`. |
| **Patrón 3 — Nombre de librería y sintaxis** | 🟡 Baja | En React 19 con la versión instalada (`motion` v13.2.0), se debe importar desde `"motion/react"`. Contiene erratas leves: *"Requesito"*, *"sigueinte"*, *"check box"*. |
| **Patrón 7 — Omisión de accesibilidad nativa** | 🟡 Baja | Si solo se anima un `div`, se pierde el soporte de formularios accesibles. Debe asociarse a un `input[type="checkbox"]` accesible. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Ideal si deseas mantener tu estructura original corrigiendo erratas y calibrando los valores de movimiento.*

```markdown
En el componente [src/features/habitaciones/ui/molecules/buscar-huespedes-modal.tsx] (o en [src/features/habitaciones/ui/molecules/ficha-huesped-modal.tsx]), implementa un efecto de Appear / Disappear (Entrada y Salida) para el estado del checkbox utilizando Motion (`motion/react`).

Requisitos Clave:
1. Utiliza `<AnimatePresence>` para que la animación de salida (`exit`) se ejecute fluidamente cuando el checkmark o el estado activo se desmonte del DOM.
2. En `initial` y `exit`, define `opacity: 0` y un escalado dinámico sutil (`scale: 0.65` o `y: 2`) para evitar saltos bruscos.
3. En `animate`, debe pasar a `opacity: 1`, `scale: 1` e `y: 0`.
4. Aplica una transición limpia con `duration: 0.22` segundos y una curva suave (`ease: 'easeOut'`).
5. Mantén la accesibilidad mediante un `<input type="checkbox" className="sr-only" />` sincronizado.
6. Proporciona el código en TypeScript/React utilizando Tailwind CSS para los estilos de la tarjeta y el contenedor.
```

**Cambios realizados:**
- Se corrigieron las erratas tipográficas (*Requisito*, *siguiente*).
- Se recalibró `scale: 0.65` en lugar de `y: 20` para un checkmark equilibrado.
- Se añadió la consideración de accesibilidad nativa.

---

### Versión B — Versión Optimizada para Producción
> *Ideal para desarrollo directo con tokens de diseño del proyecto.*

```markdown
### Tarea: Implementar Componente Checkbox Animado con Efecto Appear / Disappear en Motion

#### 1. Objetivo
Crear un componente de checkbox reutilizable con microanimación de entrada y salida (`Appear / Disappear`) para la selección de huéspedes, asegurando compatibilidad con React 19 y Motion (`motion/react`).

#### 2. Requisitos Técnicos de Animación
- **Contenedor AnimatePresence:** Envolver el icono de verificación (`check`) con `<AnimatePresence mode="wait">`.
- **Variantes de Entrada y Salida:**
  ```ts
  const checkVariants = {
    initial: { opacity: 0, scale: 0.5, rotate: -15 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0.6, rotate: 10 },
  }
  ```
- **Transición:** `transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}` (curva suave tipo spring o cubic-bezier amortiguado).

#### 3. Estructura y Estilos Tailwind CSS
- **Box contenedor:** `size-5.5 rounded-lg border transition-all duration-200`
- **Estado activo (`checked`):** `border-primary bg-primary text-primary-foreground shadow-xs`
- **Estado inactivo:** `border-line bg-panel hover:border-primary/60`
- **Estado deshabilitado:** `opacity-50 cursor-not-allowed bg-canvas/40`

#### 4. Accesibilidad (WAI-ARIA)
- Mantener un `<input type="checkbox" />` con clase `sr-only` o `peer` para captura de eventos de teclado (`Space`).
- Vincular con `id` y `htmlFor` únicos.
```

---

### Versión C — Versión Avanzada con Especificación XML
> *Ideal para orquestación de agentes autónomos y consistencia estricta.*

```xml
<task>
  <target_files>
    <file>src/features/habitaciones/ui/molecules/buscar-huespedes-modal.tsx</file>
    <file>src/features/habitaciones/ui/molecules/ficha-huesped-modal.tsx</file>
  </target_files>

  <feature>Appear / Disappear Animated Checkbox with AnimatePresence</feature>

  <motion_requirements>
    <import>import { motion, AnimatePresence } from 'motion/react'</import>
    <wrapper>AnimatePresence with mode="wait" or initial={false}</wrapper>
    <initial opacity="0" scale="0.6" y="2" />
    <animate opacity="1" scale="1" y="0" />
    <exit opacity="0" scale="0.6" y="-2" />
    <transition duration="0.22" ease="easeOut" />
  </motion_requirements>

  <accessibility>
    <semantic_input type="checkbox" hidden_class="sr-only peer" />
    <focus_ring>focus-visible:ring-2 focus-visible:ring-primary/40</focus_ring>
  </accessibility>
</task>
```

---

## 💻 Código de Implementación Listo para Usar

A continuación se presenta el componente reutilizable [`AnimatedCheckbox`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/animated-checkbox.tsx) que cumple con todas las especificaciones:

```tsx
import { motion, AnimatePresence } from 'motion/react'
import type { InputHTMLAttributes } from 'react'

export interface AnimatedCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked: boolean
  onChange: () => void
  label?: string
  className?: string
  disabled?: boolean
}

export function AnimatedCheckbox({
  checked,
  onChange,
  label,
  className = '',
  disabled = false,
  id,
  ...rest
}: AnimatedCheckboxProps) {
  const inputId = id || `animated-chk-${Math.random().toString(36).substring(2, 9)}`

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      } ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer sr-only"
          {...rest}
        />

        {/* Caja exterior del Checkbox */}
        <div
          className={`grid size-5.5 place-items-center rounded-lg border transition-all duration-200 ${
            checked
              ? 'border-primary bg-primary text-primary-foreground shadow-xs'
              : disabled
              ? 'border-line/60 bg-canvas/40'
              : 'border-line bg-panel hover:border-primary/60 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30'
          }`}
        >
          {/* Animación Appear / Disappear con AnimatePresence */}
          <AnimatePresence mode="wait">
            {checked && (
              <motion.svg
                key="checked-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 15 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="size-3.5"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>
      </div>

      {label && <span className="text-xs font-medium text-ink">{label}</span>}
    </label>
  )
}
```

---

## 🎓 Lecciones para tus Próximos Prompts

**Lo que hiciste bien:**
- Especificaste la condición obligatoria de `<AnimatePresence>` para habilitar animaciones de salida (`exit`).
- Formulaste el rango temporal óptimo (`0.2s a 0.4s`), que coincide con las directrices de Nielsen Norman Group para feedback visual inmediato.

**3 Hábitos para mejorar:**
1. **Calibra el desplazamiento al tamaño del elemento:**
   - Un `y: 20` funciona bien en un modal o card grande, pero en elementos pequeños (como un checkmark de 16px) desplaza el icono fuera de su caja.
   - → *Regla de oro: El desplazamiento `y` no debe superar el 25% de la altura del elemento.*
2. **Identifica el archivo exacto de UI interactiva:**
   - Si un modal es solo de lectura (como `ficha-huesped-modal.tsx`), especifica si el checkbox es para una nueva funcionalidad (ej. validar estancia) o si va en el modal de selección de tarjetas (`buscar-huespedes-modal.tsx`).
   - → *Regla de oro: Revisa la responsabilidad del componente destino antes de redactar el alcance.*
3. **Prefiere `motion/react` en stacks modernos:**
   - En proyectos con React 19 y Motion 13+, usar `"motion/react"` garantiza compatibilidad de tipos y tree-shaking óptimo.
   - → *Regla de oro: Indica el paquete exacto del proyecto para evitar imports de librerías duplicadas.*
