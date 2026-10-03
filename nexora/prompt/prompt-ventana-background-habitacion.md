# 🪟 Prompt: Ventana Arquitectónica con Vidrio Realista, Paisaje y Alféizar para Background

## 📋 Registro del Prompt Original

```text
@[src/features/habitaciones/ui/asignar-huesped-page.tsx] , necesito agregar para el background una ventana, simula el marco de la ventana, los vidrios con un reflejo realista y un paisaje de fondo (puedes cambiar la imagen de fondo por la que prefieras).
Detalle del diseño:
1. Forma arqueada: Se utilizó rounded-t-full para darle un estilo elegante de arco de medio punto en la parte superior. Si prefieres una ventana completamente cuadrada, simplemente elimina esa clase.
2. Efecto de vidrio: El degradado (bg-gradient-to-tr con opacidades white/10) genera un reflejo de luz realista sobre el paisaje.
3. Profundidad: El alféizar inferior (absolute -bottom-4) sobresale de los lados y añade una sombra que simula relieve en la pared.
```

---

## 🔧 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **8.9 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+8.9):** Visión de modelado arquitectónico 2D con CSS de altísima calidad. Desglosa con maestría los tres elementos clave del realismo óptico: silueta de arco de medio punto (`rounded-t-full`), reflejo especular sobre cristal (`bg-gradient-to-tr` / `bg-linear-to-tr` con `white/10`) y relieve físico tridimensional mediante alféizar proyectado (`absolute -bottom-4`, saliente lateral y sombra de oclusión).
> - **Puntos a corregir (-1.1):**
>   1. **Parteluces y división de paneles (Muntins/Mullions):** Para que una ventana arqueada se perciba auténticamente arquitectónica y no como un marco plano con póster, es clave incluir parteluces divisorios (cruz central o divisiones de vidrio) con bordes biselados.
>   2. **Manejo de carga y fallback de la imagen:** No se especifica qué ocurre si la imagen del paisaje (`landscapeSrc`) tarda en descargar o da error 404. Es recomendable incluir un fondo degradado crepuscular nativo como fallback inmediato y `loading="lazy"`.
>   3. **Comportamiento responsivo:** En pantallas móviles estrechas (pantallas < 640px), una ventana rígida puede colisionar con la tarjeta de contenido si no se modulan sus dimensiones y opacidad (`opacity-90 sm:opacity-100`, `w-44 h-64 sm:w-56 sm:h-80 lg:w-64 lg:h-96`).

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Instrucción implícita de divisiones de vidrio** | 🟠 Media | Se menciona *"los vidrios con un reflejo realista"*, pero no se especifican las divisiones (parteluz vertical y travesaño horizontal) que separan los paneles de cristal. |
| **Patrón 8 — Sin manejo de fallback de imagen externa** | 🟠 Media | Si la imagen exterior del paisaje falla o tarda en cargar, el marco quedaría vacío a menos que se defina un gradiente crepuscular base de respaldo. |
| **Patrón 7 — Escalabilidad y responsividad** | 🟡 Baja | No se definen medidas adaptativas para pantallas móviles vs. desktop para evitar que la ventana compita en espacio con los formularios. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Conserva tu estilo directo agregando parteluces, fallback de degradado y dimensiones responsivas:*

```markdown
En el componente [src/features/habitaciones/ui/asignar-huesped-page.tsx], agrega al background decorativo una ventana arquitectónica con marco, vidrios con reflejo realista y paisaje alpino exterior de fondo.

Detalle del diseño:
1. Forma arqueada: Utiliza `rounded-t-full` para un arco de medio punto superior elegante, con opción de marco cuadrado si se requiere.
2. Paisaje y fallback: Imagen de alta resolución del paisaje exterior con un degradado de fondo (cielo crepuscular `from-indigo-950 via-purple-900 to-amber-700`) como respaldo mientras carga.
3. Vidrio y reflejo: Parteluz central y travesaño divisorios, cubiertos por un degradado diagonal (`bg-linear-to-tr from-white/20 via-white/10 to-transparent`) que simula el reflejo de luz natural.
4. Profundidad: Alféizar inferior (`absolute -bottom-4`) que sobresalga a los lados con bisel superior de luz y sombra inferior proyectada en la pared.
```

---

### Versión B — Versión Optimizada para Producción (Recomendada)
> *Componente modular con props tipadas, parteluces biselados, resplandor ambiental y fallback:*

```markdown
### Tarea: Implementar Componente Atómico `HabitacionVentana`
**Ubicación:** `src/features/habitaciones/ui/atoms/habitacion-ventana.tsx`
**Consumidor:** `src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx`

#### 1. Contrato de Props (TypeScript):
```ts
export interface HabitacionVentanaProps {
  className?: string
  landscapeSrc?: string // Por defecto: /images/landscape-cozy-window.jpg
  arched?: boolean      // true = rounded-t-full, false = rounded-2xl
}
```

#### 2. Estructura de Capas Visuales:
1. **Resplandor exterior (`ambient halo`):** `-inset-3 bg-amber-400/15 blur-2xl animate-pulse` proyectando luz hacia la pared.
2. **Marco principal:** `border-[6px] sm:border-[8px] border-line/90 bg-panel shadow-2xl` con `overflow-hidden`.
3. **Paisaje exterior:** `img` con `object-cover` sobre fondo degradado crepuscular seguro de fallback.
4. **Parteluces y molduras:** Eje vertical y horizontal biselados con `bg-line/90` y sombras tenues.
5. **Reflejo especular:** Doble diagonal luminosa (`bg-linear-to-tr from-white/20 via-white/10 to-transparent`).
6. **Alféizar tridimensional:** `absolute -bottom-4 -left-4 -right-4 h-4 rounded-md border border-line/90 bg-panel shadow-md` con línea de luz superior y sombra de oclusión inferior.
```

---

### Versión C — Versión Declarativa (XML)
> *Estructurada para agentes autónomos y pipelines de componentes:*

```xml
<component_spec name="HabitacionVentana">
  <target_file>src/features/habitaciones/ui/atoms/habitacion-ventana.tsx</target_file>
  <styling_engine>TailwindCSS v4 native classes</styling_engine>
  
  <features>
    <feature id="arch_geometry">rounded-t-full conditional on arched prop</feature>
    <feature id="glass_reflection">bg-linear-to-tr from-white/20 via-white/10 to-transparent</feature>
    <feature id="mullions">Parteluz vertical y travesaño horizontal dividiendo paneles</feature>
    <feature id="window_sill">absolute -bottom-4 -left-4 -right-4 con sombra proyectada</feature>
    <feature id="landscape_backdrop">Imagen /images/landscape-cozy-window.jpg con fallback degradado</feature>
  </features>
</component_spec>
```

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Elegancia geométrica:** Describir el arco con `rounded-t-full` y el alféizar con un contenedor absoluto sobresaliente (`-bottom-4`) crea un resultado visual arquitectónico de revista sin requerir código CSS personalizado.
- **Detalle de reflejo luminoso:** Entender que el reflejo de un vidrio se modela con un degradado diagonal semitransparente (`white/10`) sobre el fondo genera realismo inmediato.

### 3 Reglas de Oro:
1. **"Los marcos necesitan divisiones":** Si dibujas una ventana, añade parteluces; de lo contrario se percibe como una pantalla o cuadro en la pared.
2. **"Toda imagen externa requiere un fallback elegante":** Usa siempre un fondo degradado o color de respaldo por si el recurso no carga inmediatamente.
3. **"El alféizar requiere luz arriba y sombra abajo":** La tridimensionalidad se logra con un borde claro en la cara superior del alféizar y una sombra difusa debajo.

---

## 🛠️ Implementación en el Proyecto Nexora

- **Átomo Creado:** [`src/features/habitaciones/ui/atoms/habitacion-ventana.tsx`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-ventana.tsx)
- **Activo Fotográfico:** `/images/landscape-cozy-window.jpg` (fotografía alpina invernal en hora dorada/atardecer).
- **Integrado en:** [`HabitacionCozyBackground`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx) y [`AsignarHuespedPage`](file:///d:/React/nexora/src/features/habitaciones/ui/asignar-huesped-page.tsx).
