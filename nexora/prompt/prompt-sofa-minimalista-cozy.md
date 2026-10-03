# 🛋️ Prompt: Sofá Minimalista Nórdico con CSS Puro y TailwindCSS

## 📋 Registro del Prompt Original

```text
@[src/features/habitaciones/ui/asignar-huesped-page.tsx] , para el background vamos  a siguir agrendado contenido, crear un sofá minimalista dentro de una habitación (representada por el fondo y el suelo).

Este código utiliza flexbox, bordes redondeados y sombras para simular los cojines, los reposabrazos y las patas del sofá sin necesidad de usar imágenes.
Como funciona este diseño
1. Efecto 3D/Volumen: Se logra usando shadow-md para separar el sofá del suelo y shadow-inner en el respaldo para darle profundidad.
2. Estructura limpia: Los reposabrazos usan absolute respecto al contenedor del sofá para acoplarse perfectamente a los lados.
3. Detalles realistas: Las patas usan skew-x para inclinarse ligeramente hacia afuera, imitando el diseño de los sofás de estilo nórdico o moderno.
```

---

## 🔧 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **9.2 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+9.2):** Extraordinario entendimiento de la composición volumétrica en CSS sin requerir imágenes ni assets externos. Aplica de forma limpia tres principios de diseño de mobiliario: sombras compuestas (`shadow-md` para la elevación del suelo y `shadow-inner` para la cavidad de los cojines del respaldo), reposabrazos acoplados con posicionamiento absoluto relativo (`absolute -left-*` / `-right-*`), e inclinación cónica nórdica en patas con `skew-x` (`-skew-x-12` / `skew-x-12`).
> - **Puntos a optimizar (-0.8):**
>   1. **Punto de anclaje de inclinación en patas (`origin-top`):** Al usar `skew-x` para patas de muebles, es crucial especificar `origin-top` para que la base superior de la pata permanezca fija contra el travesaño del sofá mientras la punta inferior se desplaza hacia afuera.
>   2. **Cojines de asiento bitemáticos y almohadones decorativos:** Para evitar que el sofá parezca un bloque sólido, es recomendable estructurar los cojines de asiento separados por líneas tenues de costura y añadir cojines de acento en las esquinas.
>   3. **Erratas ortográficas menores:** *"siguir agrendado"* (por seguir agregando), *"Como"* (falta tilde en interrogativa/explicativa).

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Punto de pivote en deformación skew (`origin-top`)** | 🟠 Media | Al aplicar `skew-x` a las patas, sin `origin-top` la pata se deforma desde el centro perdiendo el anclaje con el chasis del sofá. |
| **Patrón 3 — Erratas tipográficas menores** | 🟡 Baja | *"siguir agrendado"* → *"seguir agregando"*; *"Como funciona"* → *"Cómo funciona"*. |
| **Patrón 7 — Integración armónica en la escena 3D** | 🟡 Baja | Debe asegurarse que el sofá descanse bajo la ventana sobre el piso de madera 3D y se escale fluidamente en pantallas móviles y desktop. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Mantiene tu estructura original agregando el anclaje `origin-top` y la corrección ortográfica:*

```markdown
En el background de [src/features/habitaciones/ui/asignar-huesped-page.tsx], crea un sofá minimalista nórdico dentro de la habitación utilizando HTML, CSS puro y clases nativas de Tailwind CSS.

Este código utiliza Flexbox, bordes redondeados y sombras para simular los cojines, reposabrazos y patas del sofá sin necesidad de usar imágenes.
Cómo funciona este diseño:
1. Efecto 3D/Volumen: `shadow-md` para elevar el sofá del suelo y `shadow-inner` en el respaldo para otorgarle acolchado y profundidad.
2. Estructura limpia: Reposabrazos redondeados acoplados con `absolute` en los laterales exteriores del contenedor del sofá.
3. Detalles realistas: Patas nórdicas estilizadas usando `origin-top` y `-skew-x-12 / skew-x-12` para inclinarse hacia afuera con conteras de latón.
```

---

### Versión B — Versión Optimizada para Producción (Recomendada)
> *Componente atómico tipado con props para colores de tela y cojines decorativos:*

```markdown
### Componente: `HabitacionSofa`
**Ruta:** `src/features/habitaciones/ui/atoms/habitacion-sofa.tsx`
**Integrado en:** `src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx`

#### 1. Props del Componente:
```ts
export interface HabitacionSofaProps {
  className?: string
  fabricColor?: string   // Default: 'bg-stone-200 dark:bg-stone-700'
  pillowColor?: string   // Default: 'bg-amber-400/90'
}
```

#### 2. Especificaciones de Modelado:
1. **Respaldo Acolchado:** `h-14 sm:h-16 rounded-t-xl shadow-inner` con dos cojines divididos y botones de capitoné sutiles.
2. **Reposabrazos Laterales:** Contenedores cilíndricos con `absolute -left-3 / -right-3` redondeados (`rounded-full`) con gradiente vertical y sombras.
3. **Cojines de Asiento:** Base mullida en Flexbox con cojines independientes (`shadow-md`).
4. **Cojines Decorativos:** Cojín ámbar rotado a -12° y cojín índigo a +12° en los extremos interiores.
5. **Chasis y Patas Nórdicas:**
   - Travesaño de madera `bg-amber-900`.
   - Patas inclinadas con `origin-top -skew-x-12` (izquierda) y `origin-top skew-x-12` (derecha), rematadas con conteras doradas de latón.
   - Sombra de contacto difusa sobre el suelo en perspectiva 3D.
```

---

### Versión C — Versión Declarativa (XML)
> *Para pipelines automatizados y documentación de componentes:*

```xml
<component_spec name="HabitacionSofa">
  <style_type>Minimalist Nordic Living Sofa</style_type>
  <styling_engine>TailwindCSS v4 native classes</styling_engine>
  
  <features>
    <volume_depth>shadow-md ground lift and shadow-inner backrest cushions</volume_depth>
    <armrests>absolute -left-3.5 and -right-3.5 rounded-full cylinders</armrests>
    <tapered_legs>origin-top -skew-x-12 and skew-x-12 with brass caps</tapered_legs>
    <upholstery>Warm linen stone weave with accent throw pillows</upholstery>
  </features>

  <target_file>src/features/habitaciones/ui/atoms/habitacion-sofa.tsx</target_file>
</component_spec>
```

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Uso inteligente de `skew-x` para mobiliario:** Aplicar `skew-x` en lugar de complejas rotaciones compuestas permite simular patas cónicas nórdicas manteniendo la alineación del suelo de forma trivial.
- **Acoplamiento por `absolute` exterior:** Colocar los reposabrazos con coordenadas negativas relativas al chasis (`-left-3.5`) resuelve el ensamblado del mueble de manera limpia sin romper el flujo de Flexbox interior.

### 3 Reglas de Oro:
1. **"Toda deformación skew necesita un ancla":** Al usar `skew-x` en patas de mesas o sofás, especifica `origin-top` para que la parte superior quede firmemente unida al mueble.
2. **"El volumen se modela combinando `shadow-inner` y `shadow-md`":** Las superficies cóncavas (acolchados, asientos) usan `shadow-inner`; las convexas y elevadas usan sombras exteriores (`shadow-md`).
3. **"Los cojines en ángulo aportan calidez":** Una leve inclinación (`rotate-12` / `-rotate-12`) en los almohadones transforma un render rígido en un espacio acogedor y habitable.

---

## 🛠️ Implementación en el Proyecto Nexora

- **Átomo Creado:** [`src/features/habitaciones/ui/atoms/habitacion-sofa.tsx`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-sofa.tsx)
- **Integrado en:** [`HabitacionCozyBackground`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx) (posicionado a la derecha bajo la ventana arqueada sobre el piso de madera 3D) y [`AsignarHuespedPage`](file:///d:/React/nexora/src/features/habitaciones/ui/asignar-huesped-page.tsx).
