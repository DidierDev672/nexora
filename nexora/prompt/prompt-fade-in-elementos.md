# Prompt: Efecto Fade In con Framer Motion en "Elementos del Tema"

## Registro del Prompt

```text
@[src/features/tema/ui/organisms/custom-theme-page.tsx] ,  "ELEMENTOS DEL TEMA", cada cards debe contar con el siguiente efecto: fade in (desvanecimiento entrante) en Framer Motion.

Reglas de oro
1. initial: Define el estado inicial del elemento antes que se monte en el DOM (completamente transparente).
2. animate: Define el estado final al que debe llegar la animacion (completamente opaco).
3. transition: Modifica el comportamiento de la animacion, estableciendo una duracion de 0.5 segundos y una curva de aceleracion suave (easeOut).
```

---

## Reglas de Oro Técnicas

1. **`initial`**:
   - `initial={{ opacity: 0 }}`
   - Define el estado inicial del elemento antes de montarse en el DOM (completamente transparente).

2. **`animate`**:
   - `animate={{ opacity: 1 }}`
   - Define el estado final al que debe llegar la animación (completamente opaco, opacidad al 100%).

3. **`transition`**:
   - `transition={{ duration: 0.5, ease: 'easeOut' }}`
   - Modifica el comportamiento de la animación, estableciendo una duración de 0.5 segundos y una curva de aceleración suave (*easeOut*) que desacelera armónicamente al completarse.

---

## Implementación en el Proyecto

- **Componente:** `src/features/tema/ui/molecules/theme-bottom-menu.tsx` (consumido en `src/features/tema/ui/organisms/custom-theme-page.tsx`)
- **Elemento animado:** Cada card del menú inferior `"ELEMENTOS DEL TEMA"` (`Título`, `Sub título`, `Párrafos`, `Navbar`, `Sidebar`, `Card`, `Píldoras`).
- **Efecto visual:** Entrada suave con desvanecimiento gradual (*fade in*) al montarse en pantalla.
