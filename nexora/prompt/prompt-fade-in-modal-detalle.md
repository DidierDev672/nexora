# Prompt: Efecto Fade In con Framer Motion en Modal "Detalle de recepción y estadía"

## Registro del Prompt

```text
@[src/features/dashboard/dashboard-page.tsx] , en el modal "Detalle de recepción y estadía", necesito que cada temga el efecto fadi in:
Reglas de Oro Técnicas

1. initial:
   - initial={{ opacity: 0 }}
   - Define el estado inicial del elemento antes de que se monte en el DOM (completamente transparente).

2. animate:
   - animate={{ opacity: 1 }}
   - Define el estado final al que debe llegar la animación (completamente opaco, visible al 100%).

3. transition:
   - transition={{ duration: 0.5, ease: 'easeOut' }}
   - Modifica el comportamiento de la animación, estableciendo una duración de 0.5 segundos y una curva de aceleración suave (easeOut) que desacelera armónicamente al finalizar.
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

- **Componente:** `src/features/recepciones/ui/molecules/recepcion-detalle-modal.tsx`
- **Elementos animados:**
  1. **Backdrop y Contenedor Principal del Modal**: Entrada suave de opacidad 0 a 1 con duración de 0.5s y curva *easeOut*.
  2. **Cabecera**: Título, icono e indicador de estado de la estadía.
  3. **Tarjeta de Huésped Principal**: Iniciales, nombre completo, documento, teléfono y correo electrónico.
  4. **Tarjetas de Ubicación**: Tarjeta individual de Sede, Edificio, Habitación y Cama.
  5. **Tarjetas de Fechas**: Tarjeta de fecha/hora de Check-in y tarjeta de fecha/hora de Check-out con contador de noches.
  6. **Tarjetas de Finanzas**: Tarjeta de método de pago y tarjeta de depósito de garantía en custodia.
  7. **Tarjeta de Observaciones**: Requerimientos especiales y notas registradas.
  8. **Pie del Modal**: Botón de confirmación y cierre.
- **Efecto visual:** Aparición progresiva y limpia (*fade in*) de cada componente sin saltos visuales ni parpadeos.
