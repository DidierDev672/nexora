# Prompt: Efecto Slide-In con Framer Motion en Header de Configuración

## 📋 Registro del Prompt Original

```text
@[src/features/configuraciones/ui/configuraciones-page.tsx] ,  el header de la page, debe contener el siguiente efecto:  slide-in (deslizamiento desde el lado de la pantalla al aparecer).

Requesitos especificos:
1. Utiliza TailwindCSS para los estilos o Framer Motion si es mejor para la fluidez de la animacion (indicame cuál opción usas y por qué).
2. El componente debe aceptar props como direction (izq, der, arriba,abajo) y duration (duración de la animación).
3. Crea un archivo markdown en la carpeto prompt, de este prompt, si necesitas realiar correciones al prompt lo puede realizar, por favr
```

---

## 🔧 Diagnóstico y Corrección del Prompt

### Problemas detectados en el prompt original

| Patrón | Severidad | Descripción del problema |
|---|---|---|
| **Patrón 1 — Instrucciones implícitas** | 🟠 | No especificaba la distancia de traslación inicial en píxeles ni si el deslizamiento debía acompañarse de desvanecimiento (*fade*) para evitar saltos visuales bruscos. |
| **Patrón 3 — Formato y tipografía** | 🟡 | Errores ortográficos menores (*Requesitos*, *carpeto*, *correciones*, *por favr*). |
| **Patrón 4 — Definición de tipos en TypeScript** | 🟠 | No se definían los tipos exactos de la unión para `direction` (`'izq' | 'der' | 'arriba' | 'abajo'`) ni el tipo numérico para `duration`. |

---

### Versión A — Corrección Mínima
> *Ideal para mantener la redacción original corrigiendo ortografía y explicitando valores:*

```text
@[src/features/configuraciones/ui/configuraciones-page.tsx] , el header de la página debe contener el siguiente efecto: slide-in (deslizamiento de entrada desde un extremo de la pantalla al montarse).

Requisitos específicos:
1. Evalúa si usar Tailwind CSS o Framer Motion para la animación e indícame cuál opción usas y por qué.
2. El componente debe aceptar props configurables:
   - `direction`: dirección del desplazamiento ('izq', 'der', 'arriba', 'abajo').
   - `duration`: duración de la animación en segundos (por defecto 0.5s).
3. Guarda el registro de este prompt y su implementación en un archivo markdown dentro de la carpeta `prompt/`.
```

---

### Versión B — Versión Optimizada (Recomendada para Producción)
> *Estructurada, con contratos TypeScript claros y criterios de aceptación técnicos:*

```text
Actúa como un desarrollador frontend senior en React, TypeScript y animación web.

Objetivo:
Implementar una animación de entrada tipo `slide-in` con desvanecimiento complementario en el componente `ConfiguracionesHeader` (`src/features/configuraciones/ui/molecules/configuraciones-header.tsx`), invocado desde `ConfiguracionesPage`.

Especificaciones técnicas:
1. Biblioteca de animación:
   - Utiliza Framer Motion (`motion/react`) para controlar la traslación matricial en GPU y la reactividad de props.
   - Utiliza Tailwind CSS para el diseño visual, espaciados y tokens de color del componente.
   - Explica brevemente la comparativa técnica entre ambas alternativas.

2. Contrato de Props (TypeScript):
   - `direction?: 'izq' | 'der' | 'arriba' | 'abajo' | 'left' | 'right' | 'top' | 'bottom'` (valor por defecto: 'izq').
   - `duration?: number` (duración en segundos, valor por defecto: 0.5 o 0.6).

3. Comportamiento físico:
   - 'izq' / 'left': `x: -60` -> `x: 0`
   - 'der' / 'right': `x: 60` -> `x: 0`
   - 'arriba' / 'top': `y: -40` -> `y: 0`
   - 'abajo' / 'bottom': `y: 40` -> `y: 0`
   - Opacidad: `opacity: 0` -> `opacity: 1`
   - Curva de aceleración: `easeOut`

4. Documentación:
   - Registra el prompt corregido y la solución técnica en `prompt/prompt-header-slide-in.md`.
```

---

## ⚖️ Decisión Técnica: Framer Motion vs. Tailwind CSS

### Opción Elegida: **Framer Motion (`motion/react`)**

#### ¿Por qué Framer Motion y no Tailwind CSS en este caso?

1. **Interpolación dinámica en tiempo de ejecución (Props reactivas):**
   - El requisito exige recibir `direction` y `duration` como props. Con Tailwind CSS tendríamos que construir clases dinámicas arbitrarias (como `duration-[${duration}s]`), las cuales no son compatibles con el motor estático de Tailwind sin complejas listas seguras (*safelist*), o depender de estilos inline `@keyframes` poco mantenibles.
   - Con Framer Motion, las propiedades `x`, `y`, `opacity` y `duration` se calculan directamente en JavaScript y se transmiten a la GPU de manera fluida y declarativa.

2. **Aceleración por Hardware y Cero Reflows:**
   - Framer Motion manipula exclusivamente la propiedad CSS `transform` (`matrix3d` / `translate`), ejecutándose en el hilo de composición del navegador sin provocar *layout thrashing* ni repintados del árbol DOM.

3. **Coherencia con el ecosistema de Nexora:**
   - Todo el proyecto ya estandariza sus microinteracciones mediante `motion/react` (sidebar, tarjetas de módulos, barra de colores).

---

## 🛠️ Implementación Realizada

- **Componente:** [`ConfiguracionesHeader`](../src/features/configuraciones/ui/molecules/configuraciones-header.tsx)
- **Props añadidas:**
  ```typescript
  export type SlideDirection = 'izq' | 'der' | 'arriba' | 'abajo' | 'left' | 'right' | 'top' | 'bottom';

  export interface ConfiguracionesHeaderProps {
    totalModulos: number;
    direction?: SlideDirection;
    duration?: number;
  }
  ```
- **Consumo en la página:** [`ConfiguracionesPage`](../src/features/configuraciones/ui/configuraciones-page.tsx)
  ```tsx
  <ConfiguracionesHeader
    totalModulos={totalModulos}
    direction="izq"
    duration={0.6}
  />
  ```

---

## 🎓 Lecciones para tus próximos prompts

**Lo que hiciste bien:**
- Definiste con precisión qué componente animar y qué propiedades de configuración debía aceptar (`direction`, `duration`).
- Solicitaste una comparativa fundamentada entre tecnologías antes de asumir una implementación ciega.

**3 hábitos para mejorar:**
1. **Especifica valores por defecto:** Cuando pidas props configurables, indica qué valor debe asumir el componente si no se le suministra ninguno (ej: `direction="izq"`, `duration=0.5`).
   → *Regla de oro:* "Si un prop es opcional, define siempre su estado por defecto."
2. **Declara el tipo de datos esperado:** Indicar explícitamente si `duration` viene en segundos (`0.5`) o milisegundos (`500`) ahorra ambigüedad al agente.
   → *Regla de oro:* "Unidades claras evitan bugs silenciosos."
3. **Pide tipado TypeScript estricto:** Solicita un `type` o `interface` que modele los valores permitidos para restringir errores de compilación desde el primer momento.
   → *Regla de oro:* "Un buen prompt de UI también define el contrato de datos."
