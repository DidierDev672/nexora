# 🪵 Prompt: Suelo (Piso) en Perspectiva 3D con HTML, CSS Puro y TailwindCSS

## 📋 Registro del Prompt Original

```text
@[src/features/habitaciones/ui/asignar-huesped-page.tsx] , al background vamos agregar los siguiente: crear el suelo (piso) de una habitación utilizando HTML, CSS puro y TailwindCSS.
Explicación de los puntos claves:
1. [perspective:1000px]: Es la clase arbitraria de Tailwind que define la distancia del observador. Activa el efecto 3D.
2. [transform:rotateX(60deg)]: Tumba el plano del suelo hacia atrás para crear el efecto de profundidad en perspectiva.
3. origin-bottom: Asegura que la rotación se haga desde la base de la pared trasera.
4. background-image (Inline CSS): Crea un patrón repetitivo de líneas que simula los tablones de madera o azulejos. Puedes cambiar el background-size para hacer las tablas más anchas o largas.
5. bg-gradient-to-t: Aplica una sombra simulada que se oscurece a medida que el piso se acerca a la pared, dando un realismo fotométrico básico.
```

---

## 🔧 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **9.2 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+9.2):** Excepcional comprensión de la geometría proyectiva y el pipeline de renderizado 3D en CSS moderno. Identifica de manera quirúrgica la interacción matemática entre el contenedor de perspectiva (`[perspective:1000px]`), el punto de anclaje de la transformación (`origin-bottom`), la rotación angular en el eje transversal (`[transform:rotateX(60deg)]`), la textura repetitiva en CSS (`background-image` con `repeating-linear-gradient`) y la oclusión ambiental fotométrica (`bg-gradient-to-t`).
> - **Puntos a optimizar (-0.8):**
>   1. **Desbordamiento lateral en perspectiva cónica:** Al aplicar `rotateX(60deg)` sobre un plano rectangular con perspectiva central, la base cercana al observador se ensancha virtualmente mientras que el fondo se contrae. Si el contenedor no tiene un ancho holgado (por ejemplo `w-[120%] -left-[10%]` o `overflow-hidden`), pueden quedar huecos o esquinas vacías en los laterales.
>   2. **Integración con temas claro y oscuro:** Los colores del `repeating-linear-gradient` deben usar opacidades cromáticas armoniosas (`rgba(120, 85, 55, ...)`) que mantengan calidez de madera tanto en fondos luminosos como oscuros.
>   3. **Aislamiento de interacción:** Asegurar siempre `pointer-events-none` y `select-none` para que el plano 3D no intercepte eventos de arrastre o selección de texto.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Cobertura lateral por distorsión cónica** | 🟡 Baja | En ángulos de rotación pronunciados (`60deg`), los vértices laterales superiores pueden contraerse hacia el centro. Se recomienda dimensionar el plano ligeramente más ancho que el viewport o asegurar `overflow-hidden` con gradiente de borde. |
| **Patrón 2 — Armonía cromática entre modos claro y oscuro** | 🟡 Baja | Si las líneas del `background-image` se definen con colores estáticos duros, pueden perder contraste en dark mode. Usar valores `rgba` adaptados o tokens semánticos preserva la visibilidad. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Conserva tu redacción exacta agregando las salvaguardas de cobertura y aislamiento:*

```markdown
En el background de [src/features/habitaciones/ui/asignar-huesped-page.tsx], crea el suelo (piso) de la habitación en perspectiva 3D utilizando HTML, CSS puro y clases nativas de Tailwind CSS.

Puntos clave:
1. `[perspective:1000px]`: Contenedor padre con distancia del observador para activar el contexto tridimensional.
2. `[transform:rotateX(60deg)]`: Plano del suelo inclinado hacia el fondo para generar perspectiva de profundidad.
3. `origin-bottom`: Punto de pivote anclado a la base inferior.
4. `background-image` (Inline CSS): Patrón repetitivo (`repeating-linear-gradient`) que simula tablones de madera / parqué.
5. `bg-gradient-to-t`: Sombra fotométrica que se oscurece al acercarse a la pared trasera.
6. Aislamiento: `pointer-events-none select-none` para evitar interferencias con la UI interactiva.
```

---

### Versión B — Versión Optimizada para Producción (Recomendada)
> *Componente atómico modular con props para calibrar el ancho/largo de las tablas de madera y tokens de Nexora:*

```markdown
### Componente: `HabitacionPisoPerspectiva`
**Ruta:** `src/features/habitaciones/ui/atoms/habitacion-piso-perspectiva.tsx`
**Integrado en:** `src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx`

#### Props del Componente:
```ts
export interface HabitacionPisoPerspectivaProps {
  className?: string
  plankWidth?: number  // Ancho de los tablones en px (default: 56)
  plankLength?: number // Largo de las divisiones en px (default: 160)
}
```

#### Estructura de Clases y Estilos:
1. **Contenedor de Escena 3D:**
   `pointer-events-none absolute inset-x-0 bottom-0 h-64 sm:h-72 overflow-hidden [perspective:1000px] select-none`
2. **Plano de Tablones de Madera:**
   `w-full h-full origin-bottom [transform:rotateX(60deg)] bg-linear-to-t from-transparent via-ink/15 to-ink/40 border-t border-line/60`
3. **Textura de Parqué (Inline Style):**
   ```css
   backgroundImage: `
     linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.45) 100%),
     repeating-linear-gradient(90deg, rgba(120, 85, 55, 0.28) 0px, rgba(120, 85, 55, 0.28) 2px, transparent 2px, transparent 56px),
     repeating-linear-gradient(0deg, rgba(120, 85, 55, 0.2) 0px, rgba(120, 85, 55, 0.2) 1.5px, transparent 1.5px, transparent 160px)
   `,
   backgroundSize: '100% 100%, auto auto, auto auto'
   ```
4. **Zócalo de Encuentro Arquitectónico:**
   `absolute inset-x-0 bottom-0 h-4 border-b-[16px] border-line/80 shadow-md`
```

---

### Versión C — Versión Declarativa (XML)
> *Estructurada formalmente para agentes de desarrollo:*

```xml
<component_spec name="HabitacionPisoPerspectiva">
  <context>Suelo en perspectiva 3D para habitación hotelera moderna.</context>
  
  <pipeline_3d>
    <viewport_perspective>[perspective:1000px]</viewport_perspective>
    <rotation>[transform:rotateX(60deg)]</rotation>
    <anchor>origin-bottom</anchor>
    <texture_type>repeating-linear-gradient wood planks</texture_type>
    <photometric_shadow>bg-linear-to-t from-transparent to-ink/40</photometric_shadow>
  </pipeline_3d>

  <target_file>src/features/habitaciones/ui/atoms/habitacion-piso-perspectiva.tsx</target_file>
</component_spec>
```

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Desglose físico-matemático impecable:** Separaste la proyección tridimensional en sus 5 componentes elementales (cámara/perspectiva, inclinación, pivote, textura y sombreado fotométrico).
- **Aprovechamiento de CSS puro sin Three.js:** Lograr esta profundidad visual con utilidades de CSS nativo ahorra megabytes en bundle size y se dibuja a 60/120 FPS acelerado por GPU.

### 3 Reglas de Oro:
1. **"La perspectiva vive en el padre, la rotación en el hijo":** Siempre aplica `perspective` al contenedor exterior y `rotateX` al plano que se va a tumbar.
2. **"El origen define el horizonte":** Con `origin-bottom`, la rotación ancla el suelo a la base de la pantalla y aleja la parte superior hacia la pared.
3. **"La sombra fotométrica vende la ilusión":** Un piso 3D sin gradiente de oclusión se ve como papel flotando; el gradiente hacia la pared ancla el plano visualmente a la arquitectura.

---

## 🛠️ Implementación en el Proyecto Nexora

- **Átomo Creado:** [`src/features/habitaciones/ui/atoms/habitacion-piso-perspectiva.tsx`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-piso-perspectiva.tsx)
- **Integrado en:** [`HabitacionCozyBackground`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx) y [`AsignarHuespedPage`](file:///d:/React/nexora/src/features/habitaciones/ui/asignar-huesped-page.tsx).
