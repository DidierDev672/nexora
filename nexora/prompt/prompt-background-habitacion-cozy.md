# 🛋️ Prompt: Background Moderno de Habitación Minimalista Estilizada (Estilo Cozy) con Tailwind CSS

## 📋 Registro del Prompt Original

```text
@[src/features/habitaciones/ui/asignar-huesped-page.tsx] , para el background de la page, diseño moderno de una habitación minimalista estilizada (estilo cozy) creando completamente con claves nativas de TailwindCSS.
Como funciona este diseño
1. Efecto Glow: Se logra usando (opacidad del 20%) combinando con blur-[120px]. Esto simula las luces LED de la habitación.
2. Perspectiva: El uso de contenedores con alineación items-end (alineados al suelo) y bordes gruesos (border-b-[16px]) simula el suelo y paredes de fondo.
3. Animacion: Clase animate-pulse en los fondos de luz y la pantalla simula el parpadeo sutil de la iluminación noctura.
Almecena este prompt en un archivo markdown en la carpeta prompt. Por favor
```

---

## 🔧 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **8.6 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+8.6):** Excelente síntesis y creatividad visual. En lugar de sugerir imágenes pesadas o dependencias 3D para una página de gestión, descompone la atmósfera de una habitación *cozy* en tres primitivas geométricas puras de Tailwind CSS: iluminación difusa indirecta (glow con desenfoque extremo), ilusión óptica de perspectiva y horizonte (alineación al suelo con borde grueso como zócalo) y respiración ambiental (pulsación suave nocturna).
> - **Puntos a corregir (-1.4):**
>   1. **Aislamiento de eventos y apilamiento (`pointer-events-none` / `z-index`):** No se explicitaba que la capa de fondo debía tener `pointer-events-none` y posicionamiento `-z-10`. Sin esta instrucción, capas absolutas con desenfoques de 120px pueden interceptar eventos del puntero e impedir hacer clic en botones de navegación o inputs de formulario.
>   2. **Coherencia con el sistema de tokens y modo oscuro:** Se indicaba *"opacidad del 20%"*, pero no los tonos cromáticos base (ámbar, madera, primario o neutro) para mantener consistencia con la paleta de la aplicación en temas claro y oscuro.
>   3. **Accesibilidad en animaciones continuas (`motion-reduce`):** Un `animate-pulse` infinito debe incluir la variante de accesibilidad `motion-reduce:animate-none` para respetar a usuarios con sensibilidad vestibular o visual.
>   4. **Erratas ortográficas menores:** *"creando"* (por creado), *"Animacion"* (falta tilde), *"noctura"* (por nocturna), *"Almecena"* (por Almacena).

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Instrucciones implícitas (Aislamiento de clics)** | 🟠 Media | No se define la propiedad `pointer-events-none` ni `z-index`. En CSS, los elementos decorativos con `blur-[120px]` y posicionamiento absoluto pueden solapar el contenido interactivo y bloquear los clics del usuario. |
| **Patrón 2 — Sin contexto de tokens cromáticos** | 🟠 Media | Mencionas el 20% de opacidad y `blur-[120px]`, pero no qué colores usar (`bg-amber-500/20`, `bg-orange-500/20`, `bg-primary/20`) para encajar en el estilo de diseño cálido/cozy de Nexora. |
| **Patrón 7 — Accesibilidad visual (`prefers-reduced-motion`)** | 🟡 Baja | El uso de `animate-pulse` continuo en fondos amplios requiere salvaguarda para usuarios con sensibilidad visual (`motion-reduce:animate-none`). |
| **Patrón 3 — Erratas tipográficas menores** | 🟡 Baja | *"creando completamente"* → *"creado completamente"*; *"Animacion"* → *"Animación"*; *"noctura"* → *"nocturna"*; *"Almecena"* → *"Almacena"*. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Mantiene tu estilo directo y explicativo, corrigiendo la ortografía y añadiendo la directriz de no interferencia con la interactividad.*

```markdown
En el componente [src/features/habitaciones/ui/asignar-huesped-page.tsx], crea para el fondo (background) de la página un diseño moderno de habitación minimalista estilizada (estilo cozy), creado completamente con clases nativas de Tailwind CSS.

Cómo funciona este diseño:
1. Efecto Glow: Luces LED indirectas logradas con opacidad al 20% combinada con `blur-[120px]` en tonos cálidos (ámbar/madera).
2. Perspectiva: Contenedores con alineación `items-end` (alineados al suelo) y bordes inferiores gruesos (`border-b-[16px]`) para simular el zócalo, suelo y paredes de fondo.
3. Animación: Clase `animate-pulse` (con `motion-reduce:animate-none`) en los focos de luz ambiental para simular la suave iluminación nocturna.
4. Aislamiento: Toda la composición debe estar en una capa de fondo con `pointer-events-none` y `absolute inset-0 -z-10` para no bloquear los botones ni campos de la página.

Almacena este prompt en un archivo markdown dentro de la carpeta `prompt/`.
```

**Cambios realizados:**
- Se corrigieron las erratas tipográficas (*creando*, *Animacion*, *noctura*, *Almecena*).
- Se añadió la regla crítica de aislamiento (`pointer-events-none`, `-z-10`).
- Se especificaron los tonos cromáticos y la regla de accesibilidad `motion-reduce:animate-none`.

---

### Versión B — Versión Optimizada para Producción (Recomendada)
> *Estructurada por capas técnicas, compatible con modo claro/oscuro y separada en un componente atómico reutilizable.*

```markdown
### Objetivo:
Diseñar e implementar un fondo decorativo arquitectónico para la página [src/features/habitaciones/ui/asignar-huesped-page.tsx], simulando una habitación moderna minimalista y acogedora (*cozy bedroom*), utilizando exclusivamente utilidades nativas de Tailwind CSS.

### Especificaciones Técnicas y de Diseño:

1. Arquitectura de Capas y Aislamiento:
   - El contenedor raíz de la página debe declarar `relative isolate`, para crear un contexto de apilamiento propio y evitar que el z-index del fondo interfiera con elementos fuera de este componente.
   - Encapsular el fondo en un componente atómico o capa absoluta con `aria-hidden="true"`, `pointer-events-none absolute inset-0 z-0 overflow-hidden select-none`.
     (Se usa `z-0`, no `-z-10`: al evitar valores negativos de z-index, el fondo queda predeciblemente contenido dentro del `isolate` del padre, sin riesgo de renderizarse detrás del color de fondo real de la página.)
   - Garantizar que los elementos interactivos (botones, formularios, modales) permanezcan en una capa superior con `relative z-10`.

2. Iluminación Indirecta (Efecto Glow):
   - Foco cenital / cabecero: `absolute -top-32 left-1/2 -translate-x-1/2 size-96 rounded-full bg-amber-500/20 blur-[120px]`.
   - Lámpara de noche / lectura: `absolute top-1/4 -left-20 size-80 rounded-full bg-orange-500/20 blur-[120px]`.
   - Luz de cortesía / zócalo: `absolute bottom-14 left-1/3 size-72 rounded-full bg-primary/20 blur-[120px]`.

3. Perspectiva y Estructura Espacial:
   - Suelo y zócalo: Contenedor con `absolute inset-x-0 bottom-0 flex h-80 items-end justify-center border-b-[16px] border-line/70 bg-linear-to-t from-line/35 via-line/10 to-transparent`.
   - Pared de acento / cabecero estilizado: Estructura central con `flex items-end justify-between rounded-t-3xl border-t border-x border-line/40 bg-panel/30` con divisiones verticales sutiles.

4. Dinamismo y Accesibilidad:
   - Añadir `animate-pulse motion-reduce:animate-none` a los focos de luz para simular la pulsación nocturna sin comprometer la accesibilidad.
   - Integrar un gradiente de atenuación vertical (`bg-linear-to-b from-transparent via-transparent to-canvas/70`) para preservar un alto contraste de lectura.

5. Documentación:
   - Almacenar este prompt y su diagnóstico en `prompt/prompt-background-habitacion-cozy.md`.
```

---

### Versión C — Versión Avanzada (con Etiquetas XML y Contratos)
> *Ideal para orquestación con modelos de lenguaje de última generación.*

```xml
<task>
  <context>
    Página de asignación de huésped en un sistema de gestión hotelera (Nexora).
    Ruta objetivo: src/features/habitaciones/ui/asignar-huesped-page.tsx
  </context>

  <design_goal>
    Generar un ambiente visual "cozy bedroom" minimalista usando 100% clases utilitarias nativas de Tailwind CSS v4, sin imágenes externas ni librerías adicionales.
  </design_goal>

  <visual_layers>
    <layer id="stacking_context">
      <rules>Contenedor raíz con relative isolate; fondo en z-0 y elementos interactivos en relative z-10.</rules>
      <classes>root: "relative isolate", bg: "pointer-events-none absolute inset-0 z-0", interactive: "relative z-10"</classes>
    </layer>

    <layer id="glow_effects">
      <rules>Opacidad del 20%, filtro blur-[120px], animación pulsante sutil.</rules>
      <classes>bg-amber-500/20 bg-orange-500/20 bg-primary/20 blur-[120px] animate-pulse motion-reduce:animate-none</classes>
    </layer>

    <layer id="room_perspective">
      <rules>Contenedor anclado a la base (items-end) con zócalo grueso (border-b-[16px]) y panelado arquitectónico.</rules>
      <classes>absolute inset-x-0 bottom-0 flex items-end justify-center border-b-[16px] border-line/70</classes>
    </layer>

    <layer id="interaction_safety">
      <rules>La capa decorativa no debe capturar eventos del mouse ni solapar el árbol accesible.</rules>
      <classes>pointer-events-none absolute inset-0 z-0 overflow-hidden aria-hidden="true"</classes>
    </layer>
  </visual_layers>

  <deliverables>
    <item>Componente HabitacionCozyBackground o implementación en asignar-huesped-page.tsx</item>
    <item>Archivo markdown en prompt/prompt-background-habitacion-cozy.md</item>
  </deliverables>
</task>
```

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Traducción conceptual a clases utilitarias:** Describiste con gran precisión cómo lograr efectos físicos complejos (luz LED, horizonte de perspectiva y respiración nocturna) mediante combinaciones elegantes de utilidades estándar (`opacity-20`, `blur-[120px]`, `items-end`, `border-b-[16px]`, `animate-pulse`).
- **Eficiencia y rendimiento:** Al basar el fondo en CSS nativo en lugar de imágenes o texturas pesadas, la página mantiene un tiempo de carga instantáneo (0 KB de peticiones de red adicionales).
- **Precisión en arquitectura de apilamiento:** Identificar la combinación de `relative isolate` + `z-0` para el fondo decorativo y `relative z-10` para los controles interactivos evita el temido problema de "fondos que se ocultan detrás del body" al usar `-z-10`.

### 3 Hábitos para mejorar:

1. **Aislamiento defensivo en capas decorativas (`relative isolate` + `z-0`):**
   - Siempre que pidas fondos decorativos absolutos, declara `relative isolate` en el contenedor padre, `z-0` con `pointer-events-none` en el fondo y `relative z-10` en los elementos interactivos.
   - → **Regla de oro:** *"Usa `isolate` en el padre y `z-0` en el fondo; nunca dependas de `-z-10` para capas decorativas internas."*

2. **Alineación con tokens semánticos del proyecto:**
   - En lugar de colores arbitrarios, referencia los tokens del tema (`canvas`, `panel`, `line`, `primary`) para garantizar que el diseño funcione tanto en tema claro como en tema oscuro.
   - → **Regla de oro:** *"Los tokens semánticos garantizan coherencia entre temas claro y oscuro."*

3. **Accesibilidad en animaciones continuas (`motion-reduce`):**
   - Siempre que utilices animaciones continuas como `animate-pulse` o `animate-spin`, añade la variante `motion-reduce:animate-none`.
   - → **Regla de oro:** *"Toda animación infinita debe respetar la preferencia de reducción de movimiento del usuario."*

---

## 🛠️ Implementación Realizada en el Proyecto

1. **Componente Atómico Creado:**
   - [`src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx): Contiene la composición arquitectónica completa con focos LED cálidos, panelado de pared de acento y zócalo de perspectiva en capa `z-0`.
2. **Integración en la Página:**
   - [`src/features/habitaciones/ui/asignar-huesped-page.tsx`](file:///d:/React/nexora/src/features/habitaciones/ui/asignar-huesped-page.tsx): Contenedor raíz con `relative isolate`, fondo en `z-0` y elementos interactivos (`AsignarHuespedHeader` y panel de asignación) explícitamente situados en capas superiores con `relative z-10`.
