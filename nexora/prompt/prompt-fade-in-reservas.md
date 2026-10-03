# Prompt: Efecto Fade In con Framer Motion en Campos del Formulario de Reservas

## Registro del Prompt

```text
Los campos del formulkario para las reversas debe tener el siguiente efecto: fade in (desvanecimiento entrante) en Framer Motion.
Reglas de oro:
1. initial: Define el estado inicial del elemento antes que se monte en el DOM (completamente transparente).
2. animate: Define el estado final al que debe llegar la animacion (completamente opaco).
3. transition: Modifica el comportamiento de la animacion, estableciendo una duracion de 0.5 segundos y una curva de aceleracion suave (easeOut).

Reglas de Oro tecnicas
1. **`initial`**:
   - `initial={{ opacity: 0 }}`
   - Define el estado inicial del elemento antes de que se monte en el DOM (completamente transparente).

2. **`animate`**:
   - `animate={{ opacity: 1 }}`
   - Define el estado final al que debe llegar la animación (completamente opaco, visible al 100%).

3. **`transition`**:
   - `transition={{ duration: 0.5, ease: 'easeOut' }}`
   - Modifica el comportamiento de la animación, estableciendo una duración de 0.5 segundos y una curva de aceleración suave (*easeOut*) que desacelera armónicamente al finalizar.
```

---

## Reglas de Oro Técnicas

1. **`initial`**:
   - `initial={{ opacity: 0 }}`
   - Define el estado inicial del elemento antes de que se monte en el DOM (completamente transparente).

2. **`animate`**:
   - `animate={{ opacity: 1 }}`
   - Define el estado final al que debe llegar la animación (completamente opaco, visible al 100%).

3. **`transition`**:
   - `transition={{ duration: 0.5, ease: 'easeOut' }}`
   - Modifica el comportamiento de la animación, estableciendo una duración de 0.5 segundos y una curva de aceleración suave (*easeOut*) que desacelera armónicamente al finalizar.

---

## Implementación en el Proyecto

- **Componente:** `src/features/reservas/ui/molecules/reserva-card-form.tsx`
- **Elementos animados:** Cada contenedor de campo del formulario de reserva (`<motion.div>`):
  - Habitación y cama (`RecursosDropdown`)
  - Huésped principal (`RecursosDropdown`)
  - Fecha de registro (`Input`)
  - Fecha de salidad (`Input`)
  - Número de huéspedes (`Input`)
  - Estado de la reserva (`RecursosDropdown`)
  - Precio total (`Input`)
- **Efecto visual:** Entrada suave y fluida con desvanecimiento gradual (*fade in*) al montarse cada campo en la interfaz.
