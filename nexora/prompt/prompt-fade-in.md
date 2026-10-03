# Prompt: Efecto Fade In con Framer Motion en Menú de Colores

## Registro del Prompt

```text
@[src/features/tema/ui/organisms/custom-theme-page.tsx] ,  en el menu de los colores, cada cards debe contar con el siguiente efecto: fade in (desvanecimiento entrante) en Framer Motion.

Reglas de oro
1. initial: Define el estado inicial del elemento antes que se monte en el DOM (completamente transparente).
2. animate: Define el estado final al que debe llegar la animacion (completamente opaco).
3. transition: Modifica el comportamiento de la animacion, estableciendo una duracion de 0.5 segundos y una curva de aceleracion suave (easeOut).

en la carpeta prompt crea otro archivo markdown para este prompt, por favor
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

- **Componente:** `src/features/tema/ui/molecules/color-menu-bar.tsx` (desplegado dentro de `src/features/tema/ui/organisms/custom-theme-page.tsx`)
- **Elemento animado:** Cada tarjeta de color individual (`<motion.button>`) con `border-radius: 6px`.
- **Efecto visual:** Aparición suave de cada tarjeta de color con desvanecimiento gradual (*fade in*) al cargarse en el menú.
