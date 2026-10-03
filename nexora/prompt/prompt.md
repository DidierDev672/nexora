# Prompt: Efecto Slide In con Framer Motion en Vista Previa Interactiva

## Registro del Prompt

```text
@[src/features/tema/ui/organisms/custom-theme-page.tsx] ,  En la seccion "VISTA PREVIA INTERACTIVA", debemos de implementar el siguiente efecto slide in (deslizarse hacia adentro) con Framer Motion en React, el enfoque estandar consiste en animar la propiedad x o y junto con la opacidad (opacity).
Propiedades clave:
1. initial: Define el estado inicial del elemento antes de que se monte. Mantiene el componente oculto (opacity: 0) y desplazado fuera de su posicion original.
2. animate: Define el estado final del elemento. Vuelve a la opacidad total (opacity: 1) y a su posicion natural en el layout (x: 0, y: 0).
3. transition: Controla el comportamiento de la animacion. duration establece el tiempo en segundos y ease: "easeOut" hace que la animacion desacelere.
este efecto debe ser aplicado cuando el usuario seleccione algun item del menu "ELEMENTOS DEL TEMA", crea una carpeta fuera del src con el nombre prompt  y crea un archivo markdown, para almacenar este prompt, por favor
```

---

## Explicación Técnica de las Propiedades Clave

1. **`initial`**:
   - Define el estado previo al montaje o transición del componente.
   - Mantiene el elemento invisible (`opacity: 0`) y desplazado horizontal o verticalmente (por ejemplo, `x: -36` o `y: 20`) respecto a su posición en reposo.

2. **`animate`**:
   - Define el estado de destino cuando el elemento se presenta en pantalla.
   - Restaura la opacidad al 100% (`opacity: 1`) y retorna la posición a su coordenada natural (`x: 0, y: 0`).

3. **`transition`**:
   - Gobierna la física y temporalidad del movimiento.
   - `duration`: Define la duración del desplazamiento en segundos (ej. `0.35s`).
   - `ease: "easeOut"`: Genera una desaceleración armónica que transmite naturalidad y suavidad.

---

## Implementación en el Proyecto

- **Archivo destino:** `src/features/tema/ui/organisms/custom-theme-page.tsx`
- **Componente contenedor:** Sección `"Vista previa interactiva"`
- **Disparador:** Cambio de estado de `activeElement` al seleccionar cualquier card del menú `"ELEMENTOS DEL TEMA"`.
