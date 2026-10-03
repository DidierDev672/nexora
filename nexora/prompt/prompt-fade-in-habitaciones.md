# Prompt: Efecto Fade In con Framer Motion en Lista de Habitaciones

## Registro del Prompt

```text
@[src/features/habitaciones/ui/habitaciones-page.tsx] , en la tabla donde se encuentra la lista habitaciones debe tener el siguiente efecto en cada iterm: 
fade in (desvanecimiento de la animacion) en Framer Motion.
Reglas de oro
1. initial: Define el estado inicial del elemento antes que se monte en el DOM (completamente transparente).
2. animate: Define el estado final al que debe llegar la animacion (completamente opaco).
3. transition: Modifica el comportamiento de la animacion, estableciendo una duracion de 0.5 segundos y una curva de aceleracion suave (easeOut).

Reglas de Oro Tecnicas:
1. initial:
- `initial={{ opacity: 0 }}`
- Define el estado inicial del elemento antes de que se monte en el DOM (completamente transparente).
2. animate:
- `animate={{ opacity: 1 }}`
- Define el estado final al que debe llegar la animación (completamente opaco, visible al 100%).
3. transition:
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

- **Componente Tabla (Escritorio):** `src/features/habitaciones/ui/organisms/habitaciones-lista-table.tsx`
  - **Elemento animado:** Cada fila individual `<motion.tr>` de la tabla.
- **Componente Tarjetas (Móvil):** `src/features/habitaciones/ui/molecules/habitacion-card-item.tsx`
  - **Elemento animado:** Cada tarjeta individual `<motion.div>` de habitación en pantallas angostas.
- **Efecto visual:** Entrada suave y fluida con desvanecimiento (*fade in*) para cada habitación al cargarse inicialmente o al añadirse incrementalmente mediante Infinite Scroll.
