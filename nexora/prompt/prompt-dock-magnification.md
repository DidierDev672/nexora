# Prompt: Efecto Dock Magnification con Framer Motion en Menú de Colores

## Registro del Prompt

```text
@[src/features/tema/ui/organisms/custom-theme-page.tsx] ,  En el menú de colores necesitamos implementar el siguiente efecto: Dock magnification, Utilizando React y la librería de animación Framer Motion, que es la forma más eficiente y fluida de lograr este efecto mediante el uso de valores físicos (MotionValue).
Como funciona el efecto:
1. useMotionValue: Almacena la coordenada X del cursor sin provocar re-renders constantes en el árbol de componentes de React.
2. useTransform: Mapea la distancia del cursor hacia el icono. Si el cursor está a menos de 150px, el tamaño del icono escala proporcionalmente desde los 40px hasta alcanzar un máximo de 80px.
3. useSpring: Añade una física de rebote inercial suave para que la amplificación no se corte de forma abrupta cuando mueves el mouse rápidamente.

En la carpeta que tenemos para los prompts, crea un archivo markdown para este prompt.
```

---

## Fundamentos Técnicos del Efecto Dock Magnification

1. **`useMotionValue`**:
   - Mantiene la coordenada X del cursor (`mouseX = useMotionValue(Infinity)`).
   - Se actualiza en el evento `onMouseMove` del contenedor mediante `mouseX.set(e.clientX)`.
   - Se restablece a `Infinity` en `onMouseLeave`.
   - **Ventaja de rendimiento:** Evita re-renders en el árbol de componentes de React; las actualizaciones ocurren directamente en el loop de animación vía valores físicos (*MotionValues*).

2. **`useTransform`**:
   - Calcula dinámicamente la distancia horizontal entre el cursor y el centro del bounding rect de la card (`ref.current.getBoundingClientRect()`).
   - Mapea el rango de proximidad `[-150, 0, 150]` al rango de dimensiones `[40, 80, 40]`.
   - A distancias $\ge 150\text{px}$, el tamaño base es $40\text{px}$. Justo sobre el centro del icono ($0\text{px}$), alcanza el tamaño máximo de $80\text{px}$.

3. **`useSpring`**:
   - Aplica una física de resorte inercial con amortiguación suave:
     ```ts
     const size = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 })
     ```
   - Evita saltos bruscos cuando el cursor entra o sale rápidamente de la barra de colores.

---

## Implementación en el Proyecto

- **Componente:** `src/features/tema/ui/molecules/color-menu-bar.tsx`
- **Subcomponente especializado:** `ColorCardItem`
- **Contenedor:** `ColorMenuBar` con alineación inferior (`items-end`), `min-h-[105px]` y espacio vertical seguro para la escala de hasta $80\text{px}$ sin desbordes.
