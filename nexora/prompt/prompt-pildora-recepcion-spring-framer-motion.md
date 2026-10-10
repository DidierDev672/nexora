# 💊 Prompt: Animación Física Spring (Resorte) en Píldora de Recepción con Framer Motion

## 📋 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **8.2 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+8.2):**
>   1. **Localización exacta:** Especifica el archivo objetivo directo ([src/features/servicio-habitaciones/ui/organisms/FormularioServicioHabitacionCard.tsx](file:///d:/Nexora/nexora/src/features/servicio-habitaciones/ui/organisms/FormularioServicioHabitacionCard.tsx)) sin ambigüedades.
>   2. **Calibración física impecable:** Define con precisión matemática los parámetros del resorte (`stiffness: 260`, `damping: 20`) y razona el porqué de cada uno (aceleración rápida sin rigidez excesiva y amortiguación justa para un solo micro-rebote).
>   3. **Transición clara de estados:** Identifica el disparador (montaje del componente) y las propiedades visuales a mutar (opacidad de 0 a 1 y escala de menor a tamaño real).
>   4. **Stack tecnológico explícito:** Declara el uso de `Framer Motion` y `Tailwind CSS`.
> - **Puntos a corregir (-1.8):**
>   1. **Erratas tipográficas y gramaticales:** *"las pildora"* (concordancia), *"edeb"* (debe), tildes omitidas (*"animacion"*, *"basicos"*, *"encuetras"*).
>   2. **Ausencia de estado de salida (`exit`):** Como la píldora se desmonta al deseleccionar la recepción con el botón ✕, es indispensable definir la animación de salida para evitar un corte abrupto en pantalla.
>   3. **Punto de anclaje (*Transform Origin*):** Al crecer con escala, si no se fija `origin-bottom-left` o `origin-left`, la píldora se expande desde el centro geométrico invadiendo momentáneamente el espacio adyacente.
>   4. **Convención del proyecto ([src/agent.md](file:///d:/Nexora/nexora/src/agent.md)):** Se debe explicitar que la variante de resorte se centralice en [src/design-tokens/motion.ts](file:///d:/Nexora/nexora/src/design-tokens/motion.ts) para cumplir con el sistema de diseño compartido.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 3 — Erratas tipográficas y de concordancia** | 🟡 Baja | *"en las pildora para la recepcion, edeb contar"*: Concordancia plural/singular rota, inversión de letras en *"edeb"* y tildes omitidas en *"pildora"*, *"animacion"*, *"basicos"*, *"encuetras"*. |
| **Patrón 7 — Omisión del ciclo de vida de desmontaje (`exit`)** | 🟠 Media | Solo describe la entrada (*"al montar el componente de invisible a visible con escala"*), omitiendo cómo debe transicionar la píldora al deseleccionar o vaciar la estancia con `AnimatePresence`. |
| **Patrón 2 — Contexto arquitectónico de variantes** | 🟡 Baja | No indica dónde debe residir la variante. En proyectos con Arquitectura Hexagonal y tokens compartidos (como Nexora), las variantes deben crearse en `design-tokens/motion.ts` e importarse en el componente. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Ideal para mantener tu redacción original, corrigiendo erratas y completando el ciclo de desmontaje.*

```markdown
En el componente [src/features/servicio-habitaciones/ui/organisms/FormularioServicioHabitacionCard.tsx], en la píldora de recepción activa situada arriba del campo "Recepción / Estancia activa", implementa el siguiente efecto físico con Framer Motion (`motion/react`) y Tailwind CSS:

1. Tipo de transición: `type: "spring"` con rebote muy leve y sutil.
2. Parámetros de física:
   - `stiffness: 260`: Aceleración inicial rápida y enérgica.
   - `damping: 20`: Amortiguación que permite un rebase leve del tamaño final y retorna suavemente una sola vez.
3. Ciclo de animación:
   - Montaje (`visible`): De opacidad 0 a 1 y escala de 0.85 a 1 con traslación vertical `y: 8` a `0`.
   - Desmontaje (`exit`): Salida fluida a opacidad 0 y escala 0.9 con `duration: 0.16s`.
4. El efecto debe sentirse premium, fluido y profesional.
```

**Cambios realizados:**
- Se corrigieron las erratas tipográficas y de concordancia (*"las pildora"*, *"edeb"*).
- Se añadió el estado de salida `exit` coherente con `AnimatePresence`.
- Se especificó la física completa (`opacity`, `scale`, `y`).

---

### Versión B — Versión Optimizada para Producción
> *Ideal para integración limpia con el sistema de tokens del proyecto y microinteracciones completas.*

```markdown
### Objetivo: Implementar Microinteracción Spring con Rebote Sutil en Píldora de Recepción

**Archivos involucrados:**
- [src/design-tokens/motion.ts](file:///d:/Nexora/nexora/src/design-tokens/motion.ts) (definición de variante reutilizable)
- [src/features/servicio-habitaciones/ui/organisms/FormularioServicioHabitacionCard.tsx](file:///d:/Nexora/nexora/src/features/servicio-habitaciones/ui/organisms/FormularioServicioHabitacionCard.tsx) (consumo en la píldora)

#### Requisitos Técnicos:

1. **Definición de Variante (`springPill` en motion.ts):**
   ```ts
   export const springPill: Variants = {
     hidden: { opacity: 0, scale: 0.85, y: 8 },
     visible: {
       opacity: 1,
       scale: 1,
       y: 0,
       transition: {
         type: 'spring',
         stiffness: 260,
         damping: 20,
         mass: 0.8,
       },
     },
     exit: {
       opacity: 0,
       scale: 0.88,
       y: 4,
       transition: { duration: 0.16, ease: 'easeOut' },
     },
   }
   ```

2. **Integración en `FormularioServicioHabitacionCard.tsx`:**
   - Envolver el contenedor condicional con `<AnimatePresence>`.
   - Asignar `variants={springPill}`, `initial="hidden"`, `animate="visible"`, `exit="exit"`.
   - Añadir `className="origin-bottom-left"` para que el escalado crezca armónicamente desde la base del título.
   - Añadir microinteracción `whileHover={{ scale: 1.02 }}` y `whileTap={{ scale: 0.98 }}` en el badge interactivo.
```

**Por qué es mejor:**
- Desacopla la lógica de animación hacia los design tokens del proyecto, cumpliendo con la regla 4 de [src/agent.md](file:///d:/Nexora/nexora/src/agent.md).
- Evita saltos de layout fijando el `transform-origin`.
- Agrega retroalimentación táctil y de cursor (`hover` / `tap`).

---

### Versión C — Versión Avanzada con Especificación Estructurada
> *Estructurada para agentes de código autónomos con criterios verificables de aceptación.*

```markdown
<animation_specification>
  <target_component>FormularioServicioHabitacionCard</target_component>
  <element_role>Píldora interactiva de estancia activa</element_role>
  <tokens_file>src/design-tokens/motion.ts</tokens_file>

  <spring_physics>
    <type>spring</type>
    <stiffness>260</stiffness>
    <damping>20</damping>
    <mass>0.8</mass>
    <overshoot_behavior>Single subtle overshoot and settling</overshoot_behavior>
  </spring_physics>

  <keyframes>
    <initial opacity="0" scale="0.85" y="8" />
    <target opacity="1" scale="1.0" y="0" />
    <exit opacity="0" scale="0.88" y="4" duration_s="0.16" />
  </keyframes>

  <layout_guards>
    <anchor>origin-bottom-left</anchor>
    <container_presence>AnimatePresence mode="sync"</container_presence>
  </layout_guards>
</animation_specification>
```

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Explicaste el porqué de los números:** No dijiste simplemente *"ponle rebote"*, sino que fundamentaste por qué elegiste `stiffness: 260` y por qué `damping: 20` previene el efecto gelatinoso. Esa claridad técnica es oro puro para una IA.
- **Identificaste las propiedades de entrada correctas:** `opacity` + `scale` es la combinación canónica para elementos flotantes tipo píldora / chip.

### 3 Hábitos para mejorar:
1. **Revisar el estado de desmontaje (`exit`):**
   Siempre que uses `AnimatePresence` o elementos condicionales (`{item && <Componente />}`), define la animación de salida.
   → *Regla de oro: "Lo que entra con física de resorte debe salir con gracia."*

2. **Definir el punto de anclaje (*transform origin*):**
   Cuando un elemento escale (`scale`), indica si crece desde el centro (`origin-center`), desde la esquina (`origin-bottom-left`) o desde arriba.
   → *Regla de oro: "Todo escalado necesita un ancla visual para no desacomodar el diseño."*

3. **Centralizar en tokens antes de dispersar código:**
   Si una animación es candidata a reutilizarse en otras cards o badges, pide crearla en el archivo central de motion ([src/design-tokens/motion.ts](file:///d:/Nexora/nexora/src/design-tokens/motion.ts)).
   → *Regla de oro: "Un token centralizado mantiene la coherencia de toda la aplicación."*

---

## 💻 Implementación Aplicada en Nexora

El efecto ha sido implementado y compilado con cero errores:
1. **Token centralizado:** [src/design-tokens/motion.ts](file:///d:/Nexora/nexora/src/design-tokens/motion.ts) (variante exportada `springPill`).
2. **Componente actualizado:** [src/features/servicio-habitaciones/ui/organisms/FormularioServicioHabitacionCard.tsx](file:///d:/Nexora/nexora/src/features/servicio-habitaciones/ui/organisms/FormularioServicioHabitacionCard.tsx) (con `origin-bottom-left`, `whileHover` y `whileTap`).
3. **Verificación de tipado:** Comprobado mediante `npx tsc --noEmit`.
