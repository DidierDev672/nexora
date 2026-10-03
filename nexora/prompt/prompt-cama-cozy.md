# 🛏️ Prompt: Cama Realista de Hotel Minimalista con CSS Puro y TailwindCSS

## 📋 Registro del Prompt Original

```text
@[src/features/habitaciones/ui/asignar-huesped-page.tsx] , para el background vamos  a siguir agrendado contenido,  crear una cama realista utilizando unicamente CSS puro o TailwindCSS.
Detalles de la estructura:
1. Estructura base (bg-amber-800): Simula la madera del marco de la cama y las patas (bg-amber-950).
2. Colchón (bg-slate-100): La base que sostiene las almohadas.
3. Edredón e hilado (bg-indigo-600): Cubre la mayor parte inferior con doblez superior contrastente (bg-indigo-400).
5. Cojin decorativo (rotate-45): Un toque moderno colocado en forma de diamente en el centro.
```

---

## 🔧 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **9.1 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+9.1):** Magnífica estructuración anatómica del lecho de hotel. Desglosa los 4 estratos textiles y estructurales de una cama de lujo: armazón de madera de nogal (`bg-amber-800`) con soporte de patas oscuras (`bg-amber-950`), colchón accesible y almohadas de cabecera (`bg-slate-100`), edredón de hotel con doblez bitemático de alto contraste (`bg-indigo-600` / `bg-indigo-400`) y cojín decorativo en forma de rombo/diamante rotado (`rotate-45`).
> - **Puntos a optimizar (-0.9):**
>   1. **Elemento faltante en numeración:** En la lista original se salta del punto 3 al 5 (falta el punto 4, que corresponde naturalmente a las almohadas o cojines de respaldo).
>   2. **Textura del hilado y acolchado:** Se menciona *"Edredón e hilado"*, pero no se especificaban las líneas de pespunte o capitoné que diferencian un bloque de color plano de una tela textil acolchada.
>   3. **Erratas ortográficas menores:** *"siguir agrendado"* (por seguir agregando), *"unicamente"* (falta tilde), *"contrastente"* (por contrastante), *"Cojin"* (falta tilde), *"diamente"* (por diamante).

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Pespunte e hilado implícito** | 🟠 Media | Al solicitar *"edredón e hilado"*, conviene modelar las líneas de acolchado con bordes sutiles o gradientes para dar textura de tejido real. |
| **Patrón 3 — Erratas tipográficas y numeración discontinua** | 🟡 Baja | Salto de punto 3 a 5; *"siguir agrendado"* → *"seguir agregando"*; *"contrastente"* → *"contrastante"*; *"diamente"* → *"diamante"*. |
| **Patrón 7 — Integración espacial de escala** | 🟡 Baja | Debe asegurarse que la cama sea proporcional al cabecero y las mesas de noche en dispositivos móviles y de escritorio. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Mantiene tu estilo directo corrigiendo la numeración, ortografía y detalles textiles:*

```markdown
En el background de [src/features/habitaciones/ui/asignar-huesped-page.tsx], crea una cama realista de hotel utilizando únicamente CSS puro y clases nativas de Tailwind CSS.

Detalles de la estructura:
1. Estructura base (`bg-amber-800`): Marco de madera cálida y patas de apoyo (`bg-amber-950`).
2. Colchón y almohadas (`bg-slate-100`): Base acolchada visible con almohadas gemelas en la cabecera.
3. Edredón e hilado (`bg-indigo-600`): Cubre la parte inferior con líneas de acolchado y doblez superior contrastante (`bg-indigo-400`).
4. Cojín decorativo (`rotate-45`): Cojín decorativo en forma de diamante en el centro con acento dorado/ámbar.
```

---

### Versión B — Versión Optimizada para Producción (Recomendada)
> *Componente atómico tipado con props para colores de edredón y detalles de confección:*

```markdown
### Componente: `HabitacionCama`
**Ruta:** `src/features/habitaciones/ui/atoms/habitacion-cama.tsx`
**Integrado en:** `src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx`

#### 1. Props del Componente:
```ts
export interface HabitacionCamaProps {
  className?: string
  duvetColor?: string   // Default: 'bg-indigo-600'
  foldedColor?: string  // Default: 'bg-indigo-400'
}
```

#### 2. Especificaciones de Modelado CSS:
1. **Almohadas de Cabecera:** Almohadas gemelas acolchadas con `bg-slate-50 border border-slate-300/80 shadow-md`.
2. **Cuerpo del Colchón:** Bloque `bg-slate-100` con sábanas embozadas y esquinas redondeadas.
3. **Doblez Contrastante del Edredón:** Franja `bg-indigo-400` con línea de costura pespunteada superior.
4. **Cojín en Diamante Central:** `size-7 rotate-45 rounded-md bg-linear-to-br from-amber-300 via-amber-400 to-amber-500 shadow-md` con botón central.
5. **Edredón Acolchado:** Franja `bg-indigo-600` con 4 ranuras horizontales de pespunte (`bg-indigo-500/40`) y sombra de caída hacia el suelo.
6. **Larguero y Patas:** Larguero de madera `bg-amber-800` apoyado sobre patas `bg-amber-950` y sombra difusa de contacto sobre el piso de madera 3D.
```

---

### Versión C — Versión Declarativa (XML)
> *Para especificación formal en entornos de agentes:*

```xml
<component_spec name="HabitacionCama">
  <style_type>Realistic Boutique Hotel Bed</style_type>
  <styling_engine>TailwindCSS v4 native classes</styling_engine>
  
  <layers>
    <layer id="pillows">Twin plush pillows with soft inner shadow</layer>
    <layer id="mattress">Visible mattress base in bg-slate-100</layer>
    <layer id="turnover">Contrasting folded duvet edge in bg-indigo-400</layer>
    <layer id="cushion">Diamond accent cushion rotated 45deg in amber gold</layer>
    <layer id="quilt">Indigo quilted duvet with quilted thread lines</layer>
    <layer id="wooden_frame">Amber wood baseboard (bg-amber-800) and legs (bg-amber-950)</layer>
  </layers>

  <target_file>src/features/habitaciones/ui/atoms/habitacion-cama.tsx</target_file>
</component_spec>
```

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Estratificación realista del textil:** El detalle de separar el "doblez contrastante" del cuerpo principal del edredón es el secreto que hace que una cama dibujada en CSS parezca real y acogedora en lugar de un rectángulo plano.
- **Punto de acento focal:** El cojín en diamante (`rotate-45`) rompe la ortogonalidad horizontal de las sábanas, atrayendo la mirada al centro del diseño.

### 3 Reglas de Oro:
1. **"Los textiles necesitan costuras":** Agrega líneas de pespunte o hilado con bordes tenues (`border-dashed` o `h-px bg-white/30`) para simular acolchado.
2. **"Las camas se visten por capas":** Almohadas → Colchón → Doblez → Edredón → Armazón → Patas. Respeta el orden de apilamiento en el DOM.
3. **"El contraste cromático enriquece":** La combinación de madera cálida (`amber`), edredón azul profundo (`indigo`) y cojín joya (`amber/oro`) crea una paleta digna de hotel 5 estrellas.

---

## 🛠️ Implementación en el Proyecto Nexora

- **Átomo Creado:** [`src/features/habitaciones/ui/atoms/habitacion-cama.tsx`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-cama.tsx)
- **Integrado en:** [`HabitacionCozyBackground`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx) (centrada entre las mesitas de noche frente al cabecero) y [`AsignarHuespedPage`](file:///d:/React/nexora/src/features/habitaciones/ui/asignar-huesped-page.tsx).
