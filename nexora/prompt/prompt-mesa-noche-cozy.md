# 🪵 Prompt: Mesa de Noche Mid-Century Minimalista con CSS Puro y TailwindCSS

## 📋 Registro del Prompt Original

```text
@[src/features/habitaciones/ui/asignar-huesped-page.tsx] , para el background vamos  a siguir agrendado contenido, crea un diseño moderno y minimalista  de una mesa de noche creado completamente con CSS puro y TailwindCSS. Incluye un cajón superior, un espacio abierto inferior y patas delgadas estilizadas.
Detelles del diseño y clases utilizadas
1. Efecto de Madera (bg-amber-800 / bg-amber-900): Usamos la paleta Amber (ámbar) combinada con tonos oscuros para simular una madera cálida.
2. Profundidad del Estante (shadow-[inset_...]): El espacio abierto de abajo utiliza una sombra interna personalizada de Tailwind para dar la sensación de que el estante va hacia adentro de la pared.
3. Patas Estilizadas: (rotate-3 / -rotate-3): Inclinamos ligeramente las patas usando las clases de rotacion y origen de Tailwind para darle un toque nórdico o de diseño "MidCentury"
4. Interacción (group-hover): Al pasar el cursor sobre el cajón superior, la manija metálica brilla sutilmente simulando reflejo de luz.
```

---

## 🔧 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **9.0 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+9.0):** Excelente criterio estético de diseño de mobiliario trasladado a utilidades CSS. Descompone una pieza clásica de diseño de interiores (*mesita de noche Mid-Century Modern*) en 4 recursos técnicos muy precisos: simulación cromática de madera de nogal/teca (`bg-amber-800 / bg-amber-900`), técnica de oclusión ambiental interna (`shadow-[inset_...]`) para sensación de profundidad física, angulación cónica en patas con punto de pivote (`origin-top` y rotación) y microinteracción de brillo especular mediante modificadores de grupo (`group-hover`).
> - **Puntos a optimizar (-1.0):**
>   1. **Interacción dentro de capas decorativas (`pointer-events-auto`):** Dado que el fondo general de la habitación se encuentra aislado con `pointer-events-none` (para no interferir con la interfaz de usuario), si se desea que el `group-hover` del cajón funcione al pasar el ratón, el elemento interactivo debe declarar explícitamente `pointer-events-auto`.
>   2. **Detalle en los extremos de las patas:** En el estilo Mid-Century, las patas cónicas de madera suelen incorporar conteras o casquillos de latón dorado en las puntas para acentuar el lujo hotelero.
>   3. **Erratas ortográficas menores:** *"siguir agrendado"* (por seguir agregando), *"Detelles"* (por Detalles), *"rotacion"* (falta tilde), *"MidCentury"* (Mid-Century).

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 1 — Activación de eventos en capa de fondo (`pointer-events`)** | 🟠 Media | La capa decorativa tiene `pointer-events-none`. Para que el `group-hover` de la manija funcione, el cajón debe declarar `pointer-events-auto`. |
| **Patrón 3 — Erratas tipográficas menores** | 🟡 Baja | *"siguir agrendado"* → *"seguir agregando"*; *"Detelles"* → *"Detalles"*; *"rotacion"* → *"rotación"*. |
| **Patrón 7 — Composición de mobiliario contextual** | 🟡 Baja | No se menciona si la mesa de noche incluye una lámpara de lectura cálida o libros decorativos para integrarse con la iluminación nocturna de la habitación. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Conserva tu redacción original corrigiendo ortografía y asegurando la interactividad del hover:*

```markdown
En el background de [src/features/habitaciones/ui/asignar-huesped-page.tsx], crea un diseño moderno y minimalista de una mesa de noche estilo Mid-Century, creado completamente con CSS puro y clases nativas de Tailwind CSS. Incluye un cajón superior, un espacio abierto inferior y patas delgadas estilizadas.

Detalles del diseño y clases utilizadas:
1. Efecto de Madera (`bg-amber-800 / bg-amber-900`): Tonos ámbar cálidos y madera oscura para simular nogal natural.
2. Profundidad del Estante (`shadow-[inset_0_5px_12px_rgba(0,0,0,0.65)]`): Sombra interna en el nicho abierto para simular relieve y profundidad hacia la pared.
3. Patas Estilizadas (`-rotate-6 / rotate-6` con `origin-top`): Patas cónicas anguladas con conteras doradas de latón estilo Mid-Century.
4. Interacción (`group-hover` y `pointer-events-auto`): Al pasar el cursor sobre el cajón, la manija metálica de latón brilla sutilmente simulando reflejo de luz.
```

---

### Versión B — Versión Optimizada para Producción (Recomendada)
> *Componente atómico tipado, con opción de lámpara de lectura superior e integración en la escena cozy:*

```markdown
### Tarea: Implementar Componente Atómico `HabitacionMesaNoche`
**Ruta:** `src/features/habitaciones/ui/atoms/habitacion-mesa-noche.tsx`
**Consumidor:** `src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx`

#### 1. Props del Componente:
```ts
export interface HabitacionMesaNocheProps {
  className?: string
  withLamp?: boolean // Lámpara de noche cálida sobre la mesa (default: true)
}
```

#### 2. Especificaciones de Diseño:
1. **Lámpara Superior Opcional:** Pantalla cónica con resplandor cálido (`shadow-[0_0_12px_rgba(251,191,36,0.9)]`) alineada con la luz ambiental.
2. **Cajón Superior:**
   - Contenedor con `pointer-events-auto group/drawer cursor-pointer`.
   - Manija metálica de latón: `bg-linear-to-r from-amber-200 via-amber-400 to-amber-500` con `group-hover/drawer:brightness-125 group-hover/drawer:shadow-[0_0_10px_rgba(251,191,36,0.7)]`.
3. **Nicho Hueco Inferior:** `shadow-[inset_0_5px_12px_rgba(0,0,0,0.65)]` con lomos de libros decorativos estilizados.
4. **Patas Nórdicas Anguladas:** Patas inclinadas (`origin-top -rotate-6 / rotate-6`) rematadas con conteras doradas de latón.
5. **Sombra de Contacto:** `h-2 w-24 rounded-full bg-black/35 blur-xs` proyectada en el suelo de madera.
```

---

### Versión C — Versión Declarativa (XML)
> *Para pipelines automatizados y documentación de componentes:*

```xml
<component_spec name="HabitacionMesaNoche">
  <style_type>Mid-Century Modern Nightstand</style_type>
  <styling_engine>TailwindCSS v4 native classes</styling_engine>
  
  <design_elements>
    <wood_finish>bg-amber-800 / bg-amber-900 with ring-white/10</wood_finish>
    <drawer_interaction>pointer-events-auto group/drawer with brass handle glow on hover</drawer_interaction>
    <shelf_depth>shadow-[inset_0_5px_12px_rgba(0,0,0,0.65)]</shelf_depth>
    <legs_tapered>origin-top -rotate-6 and rotate-6 with brass metal caps</legs_tapered>
  </design_elements>

  <target_file>src/features/habitaciones/ui/atoms/habitacion-mesa-noche.tsx</target_file>
</component_spec>
```

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Especialización de sombras (`inset`):** El uso de `shadow-[inset_...]` es la forma más limpia y ligera en CSS para crear cavidades realistas en objetos de mobiliario sin mallas 3D complejas.
- **Puntos de pivote en rotación:** Entender que las patas necesitan rotar desde la parte superior (`origin-top`) garantiza que el mueble apoye firmemente en la base sin despegarse.

### 3 Reglas de Oro:
1. **"Los eventos flotan, pero los fondos aíslan":** Si una capa decorativa tiene `pointer-events-none`, los elementos interactivos dentro de ella deben tener `pointer-events-auto` para responder a `:hover`.
2. **"La madera cobra vida con contrastes de tono":** Combina `amber-800` (tablero/cajón iluminado) con `amber-900/amber-950` (estructura y sombras) para crear volumen real.
3. **"El latón enriquece el diseño Mid-Century":** Añadir detalles dorados en tiradores y conteras eleva la percepción de calidad del diseño a estándar de hotel boutique.

---

## 🛠️ Implementación en el Proyecto Nexora

- **Componente Creado:** [`src/features/habitaciones/ui/atoms/habitacion-mesa-noche.tsx`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-mesa-noche.tsx)
- **Integrado en:** [`HabitacionCozyBackground`](file:///d:/React/nexora/src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx) (mesita izquierda con lámpara cálida y mesita derecha simétrica) y [`AsignarHuespedPage`](file:///d:/React/nexora/src/features/habitaciones/ui/asignar-huesped-page.tsx).
