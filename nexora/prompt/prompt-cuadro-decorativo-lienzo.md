# 🖼️ Prompt: Cuadro Decorativo (Lienzo / Póster de Galería) con Tailwind CSS

## 📋 Registro del Prompt Original

```text
@[d:\React\nexora\src\features\habitaciones\ui\asignar-huesped-page.tsx] , vamos a seguir agrendo contenido al background: cuadro decorativo (lienzo/poster) colgando en la pared de la habitacion utilizando clases Tailwind CSS.
Detalle de laas clases utilizdas:
1. shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]:  Crea una sombra profunda y difuminada que hace que el cuadro parezca "separado" de la pared con realismo.
2. bg-stone-50 p-6: Simula el paspartú (el recuadro blanco que enmarca las obras de arte).
3. transition-transform... hover:scale-[1.02]: Añade un pequeño efecto interactivo que simula acercarse al cuadro cuando pasas el cursor.
4. bg-[radial-gradient(...)]: Crea un patrón de micro puntos que emula la textura rugosa del lienzo.
```

---

## 🔧 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **9.2 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+9.2):** Excelente comprensión de los fundamentos de realismo y profundidad en CSS. El uso de `shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]` proporciona una sombra volumétrica que despega el cuadro de la pared; el `bg-stone-50 p-6` traduce fielmente el concepto museístico de paspartú (orla de montaje); la micro-interacción con `hover:scale-[1.02]` otorga interactividad sin estridencias; y el `radial-gradient` simula el tramado textil de lino sin cargar imágenes pesadas.
> - **Puntos a optimizar (-0.8):**
>   1. **Especificación del arte interior del lienzo:** El prompt describe con gran detalle el contenedor, el paspartú y la textura, pero omite qué obra de arte contiene el lienzo (lo cual puede provocar que la IA renderice un recuadro blanco o un lienzo vacío).
>   2. **Elemento de sujeción (clavo y alambre de suspensión):** Para vender el concepto de "colgando en la pared", añadir un clavo de latón y un sutil alambre en V en la parte superior añade un toque artesanal realista.
>   3. **Erratas ortográficas menores:** *"agrendo"* (por agregando), *"laas clases utilizdas"* (por las clases utilizadas).

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Especificación incompleta del contenido interior** | 🟠 Media | Describe la montura y el paspartú pero omite qué gráfico o composición abstracta habita dentro del lienzo. |
| **Patrón 3 — Erratas tipográficas en el texto** | 🟡 Baja | *"agrendo"* → *"agregando"*; *"Detalle de laas clases utilizdas"* → *"Detalle de las clases utilizadas"*. |
| **Patrón 7 — Anclaje y ubicación en el escenario 3D** | 🟡 Baja | Es conveniente definir su ubicación en la pared (ej. pared izquierda superior) para equilibrar visualmente la ventana derecha y la cama central. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Mantiene tu estructura original corrigiendo la ortografía y añadiendo la composición geométrica interior:*

```markdown
En el background de [d:\React\nexora\src\features\habitaciones\ui\asignar-huesped-page.tsx], agrega un cuadro decorativo contemporáneo (lienzo/póster de galería) colgado en la pared de la habitación utilizando clases nativas de Tailwind CSS.

Detalle de las clases y técnicas utilizadas:
1. Sombra Profunda: `shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]` para proyectar una sombra difuminada que separe tridimensionalmente el cuadro de la pared.
2. Paspartú de Galería: `bg-stone-50 p-4 sm:p-6` para simular el enmarcado blanco cálido de museo.
3. Micro-interacción: `transition-transform duration-300 ease-out hover:scale-[1.02]` para simular un acercamiento de mirada al pasar el cursor.
4. Textura de Lienzo: `bg-[radial-gradient(circle,rgba(0,0,0,0.08)_1px,transparent_1px)]` con patrón de micro-poros que emula la tela de lino.
5. Composición Abstracta: Ilustración geométrica minimalista estilo Bauhaus (disco ocre, arco terracota y línea cobalto).
```

---

### Versión B — Versión Optimizada para Producción (Recomendada)
> *Componente atómico tipado con props, biselado de marco, soporte de suspensión y composición abstracta pura en CSS:*

```markdown
### Componente: `HabitacionCuadro`
**Ruta:** `src/features/habitaciones/ui/atoms/habitacion-cuadro.tsx`
**Integrado en:** `src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx`

#### 1. Props del Componente:
```ts
export interface HabitacionCuadroProps {
  className?: string
  title?: string // Accesibilidad del cuadro
}
```

#### 2. Especificaciones de Enmarcado y Lienzo:
1. **Sujeción Superior:** Clavo metálico de latón (`size-2 rounded-full bg-amber-600`) y alambre en V con `[clip-path:polygon(50%_0%,0%_100%,100%_100%)]`.
2. **Marco Biselado:** Marco de madera oscura `border-[5px] border-stone-800` con `shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]` y transición fluida `hover:scale-[1.02]`.
3. **Paspartú de Museo:** `bg-stone-50 p-4 sm:p-5 shadow-inner` con bisel y mini-plaquita tipográfica de pie de obra.
4. **Textura Textil del Lienzo:** Micro-tramado con `radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)` a `6px 6px`.
5. **Obra Geométrica Bauhaus / Escandinava:** Disco solar ámbar, arco de media luna terracota y pincelada horizontal azul índigo, con reflejo especular tenue diagonal sobre el cristal (`bg-linear-to-tr from-transparent via-white/15 to-transparent`).
6. **Ubicación Arquitectónica (Extremo Derecho del Todo):** Pared superior en el extremo derecho (`top-6 right-3 sm:top-8 sm:right-6 lg:top-10 lg:right-8`), colgando en el borde derecho de la habitación sobre el área del sofá, con la ventana arqueada situada a su izquierda de forma armónica.
```

---

### Versión C — Versión Declarativa (XML)
> *Para pipelines automatizados y documentación de agentes:*

```xml
<component_spec name="HabitacionCuadro">
  <category>Decorative Architectural Wall Art</category>
  <styling_engine>TailwindCSS v4 native classes</styling_engine>

  <layers>
    <wall_mount>brass pin and triangular tension wire</wall_mount>
    <outer_frame>dark timber border with shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]</outer_frame>
    <passepartout>bg-stone-50 inner padded matting</passepartout>
    <canvas_texture>radial-gradient micro-pore linen pattern</canvas_texture>
    <artwork>geometric minimalist Bauhaus motifs (amber disc, terracotta arch, indigo stroke)</artwork>
    <glass_glare>diagonal specular light reflection</glass_glare>
  </layers>

  <interaction>
    <hover_zoom>transition-transform duration-300 ease-out hover:scale-[1.02]</hover_zoom>
  </interaction>
</component_spec>
```

---

## 🎓 Lecciones para tus Próximos Prompts

**Lo que hiciste con excelencia:**
- Especificaste de forma quirúrgica las propiedades CSS clave para simular materiales reales (`shadow-[0_25px_50px...]`, `bg-stone-50`, `radial-gradient`), lo que evita soluciones genéricas o planas.

**3 hábitos para enriquecer tus próximos prompts:**
1. **Definir el contenido interior además del contenedor:**
   → *Regla de oro:* Si diseñas un marco, una pantalla o un estante, describe siempre qué objeto o arte se exhibe en su interior.
2. **Incluir los elementos de fijación o anclaje:**
   → *Regla de oro:* Los objetos en el mundo real se sostienen con algo (clavos, patas, cables, bisagras). Incluirlos añade un nivel instantáneo de sofisticación.
3. **Equilibrio compositivo en la escena:**
   → *Regla de oro:* En fondos decorativos, indica en qué cuadrante de la habitación se ubica el elemento para garantizar balance escénico respecto a ventanas y muebles.
