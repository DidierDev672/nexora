# 🚪 Prompt: Puerta de Habitación Interactiva con Apertura 3D en Hover

## 📋 Registro del Prompt Original

```text
@[src/features/habitaciones/ui/asignar-huesped-page.tsx] , para el background vamos  a siguir agrendado contenido, puerta de habitación interactiva lista para usar. Tiene un efecto de apertura en 3D cuando pasas el cursor por encima (hover).
Puntos clave del código:
1. Efecto 3D: Usamos style="perspective: 1000px;" en el marco para que la rotación se vea real y no plana.
2. Eje de apertura: La clase origin-left hace que la puerta se abra justo desde el lado izquierdo (las bisagras).
3. Rotación con Tailwind: Usamos una clase arbitraria hover:[transform:rotateY(-105deg)] para abrir la puerta hacia adentro del marco al pasar el mouse.
4. Estilo clásico: Los colores amber-700 y amber-900 simulan perfectamente el tono de la madera real.
```

---

## 🔧 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **9.3 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+9.3):** Excelente conceptualización de microinteracciones 3D con CSS puro y Tailwind. Desglosa los 4 principios cinemáticos esenciales: espacio de perspectiva en el marco (`perspective: 1000px`), punto de giro físico en las bisagras (`origin-left`), ángulo hiperrealista de batiente hacia el interior (`rotateY(-105deg)`) y acabado de madera noble (`amber-700 / amber-900`).
> - **Puntos a optimizar (-0.7):**
>   1. **Preservación del espacio 3D y suavidad (`transform-style: preserve-3d` / `transition`):** Para que la rotación no se aplane en navegadores basados en WebKit/Blink, es fundamental declarar `[transform-style:preserve-3d]` y una curva de desaceleración fluida (`transition-transform duration-700 ease-out`).
>   2. **Apertura y revelación de contenido:** Al abrirse una puerta a -105°, se revela el espacio interior. Añadir un pasillo iluminado en el marco y un haz de luz proyectado en el piso al abrirse multiplica el impacto de la interacción.
>   3. **Activación dentro de capas decorativas (`pointer-events-auto`):** Dado que el fondo contenedor declara `pointer-events-none`, la puerta requiere `pointer-events-auto` para responder al cursor del usuario.
>   4. **Erratas ortográficas menores:** *"siguir agrendado"* (por seguir agregando).

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Activación de eventos en fondo aislado (`pointer-events`)** | 🟠 Media | En fondos con `pointer-events-none`, la puerta interactiva necesita `pointer-events-auto` para capturar el hover. |
| **Patrón 1 — Preservación de plano 3D (`preserve-3d`)** | 🟡 Baja | Sin `transform-style: preserve-3d`, la rotación matricial en eje Y puede aplanarse en ciertos motores de renderizado. |
| **Patrón 3 — Errata tipográfica** | 🟡 Baja | *"siguir agrendado"* → *"seguir agregando"*. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Mantiene tu estilo directo añadiendo la preservación 3D, suavizado de transición e interactividad:*

```markdown
En el background de [src/features/habitaciones/ui/asignar-huesped-page.tsx], agrega una puerta de habitación interactiva con efecto de apertura en 3D al pasar el cursor (hover), utilizando clases nativas de Tailwind CSS.

Puntos clave:
1. Efecto 3D: Contenedor exterior con `[perspective:1000px]` para que la rotación tenga profundidad óptica.
2. Eje de apertura: `origin-left` para que la hoja gire anclada a las bisagras izquierdas.
3. Rotación en hover: `group-hover/door:[transform:rotateY(-105deg)]` con `transition-transform duration-700 ease-out` y `[transform-style:preserve-3d]`.
4. Estilo clásico: Tonos de madera noble `amber-700` y `amber-900` con placa metálica dorada y manija de latón.
5. Interactividad: `pointer-events-auto cursor-pointer` para capturar el hover dentro del fondo decorativo.
```

---

### Versión B — Versión Optimizada para Producción (Recomendada)
> *Componente atómico modular con placa personalizada de número de habitación, pasillo interior y haz de luz al suelo:*

```markdown
### Componente: `HabitacionPuerta`
**Ruta:** `src/features/habitaciones/ui/atoms/habitacion-puerta.tsx`
**Integrado en:** `src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx`

#### 1. Props del Componente:
```ts
export interface HabitacionPuertaProps {
  className?: string
  roomNumber?: string | number // Muestra el número real de habitación (ej. '101')
}
```

#### 2. Especificaciones Cinemáticas y Visuales:
1. **Marco y Umbral Exterior:**
   - Jamba de madera oscura `border-[6px] border-amber-950 bg-amber-950 shadow-2xl rounded-t-lg [perspective:1000px]`.
2. **Pasillo Interior Revelado:**
   - Al abrirse la puerta se revela el pasillo cálido (`bg-linear-to-b from-amber-200 via-amber-100 to-amber-300`) con lámpara aplique de pared (`animate-pulse`).
3. **Hoja de la Puerta en 3D:**
   - `origin-left [transform-style:preserve-3d] transition-transform duration-700 ease-out group-hover/door:[transform:rotateY(-105deg)]`.
   - Paneles moldurados en `bg-amber-800` y `bg-amber-900`.
   - Placa de latón dorada con el número de habitación y mirilla de seguridad.
   - Manija metálica con cerradura y picaporte que se acciona al hover.
4. **Haz de Luz Proyectado:**
   - Destello de luz difusa sobre el suelo 3D (`bg-linear-to-r from-amber-300/35 to-transparent blur-md`) que se desvanece de `opacity-0` a `opacity-100` al abrirse la puerta.
```

---

### Versión C — Versión Declarativa (XML)
> *Para especificación en pipelines de agentes autónomos:*

```xml
<component_spec name="HabitacionPuerta">
  <interaction_type>3D Hover Door Swing</interaction_type>
  <styling_engine>TailwindCSS v4 native classes</styling_engine>
  
  <kinematics>
    <perspective>[perspective:1000px]</perspective>
    <pivot>origin-left</pivot>
    <rotation_open>group-hover/door:[transform:rotateY(-105deg)]</rotation_open>
    <transition_curve>transition-transform duration-700 ease-out [transform-style:preserve-3d]</transition_curve>
  </kinematics>

  <visual_details>
    <finish>Amber-700 / amber-900 wood with brass hardware and room number plaque</finish>
    <interior_hallway>Warm illuminated corridor with wall sconce</interior_hallway>
    <floor_light_spill>Golden light beam projected onto the floor on door open</floor_light_spill>
  </visual_details>

  <target_file>src/features/habitaciones/ui/atoms/habitacion-puerta.tsx</target_file>
</component_spec>
```

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Ángulo de apertura realista (`-105deg`):** La mayoría de las puertas giran más allá de 90° al abrirse hacia el interior de un cuarto; elegir `-105deg` en lugar del plano `-90deg` añade una autenticidad espacial inmediata.
- **Punto de anclaje de bisagras:** Usar `origin-left` es la clave para que la rotación parezca una puerta real pivotando en bisagras físicas y no una tarjeta girando en el vacío.

### 3 Reglas de Oro:
1. **"Toda puerta abierta revela un mundo":** Al rotar una puerta, modela siempre lo que hay detrás (un pasillo con luz o un haz de sombra/luz); de lo contrario se vería el fondo transparente.
2. **"Preserva el espacio con `preserve-3d`":** Siempre que rotes elementos hijos en un contexto con perspectiva, añade `[transform-style:preserve-3d]` para evitar renderizados bidimensionales planos.
3. **"Personaliza con datos del contexto":** Mostrar dinámicamente el número de habitación real en la placa de la puerta conecta el fondo estético con el estado funcional de la aplicación.

---

## 🛠️ Implementación en el Proyecto Nexora

- **Átomo Creado:** [`src/features/habitaciones/ui/atoms/habitacion-puerta.tsx`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-puerta.tsx)
- **Integrado en:** [`HabitacionCozyBackground`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx) (posicionada a la izquierda de la escena sobre el suelo en perspectiva 3D) y [`AsignarHuespedPage`](file:///d:/React/nexora/src/features/habitaciones/ui/asignar-huesped-page.tsx) recibiendo dinámicamente `roomNumber={room.number}`.
