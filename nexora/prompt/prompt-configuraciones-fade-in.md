# Prompt: Efecto Fade In con Framer Motion en Cards de Configuración

## Registro del Prompt

```text
@[src/features/configuraciones/ui/configuraciones-page.tsx] ,  Cada card que indicar las configuraciones debe tener el siguiente efecto fade in (desvanecimiento etrante) en Framer Motion.
Regla de Oro
1. initial: Define el estado inicial del elemento antes que se monte en el DOM (complamente transparente).
2. animate: Define el estado final al que debe llegar la animacion (completamente opaco)
3. transition: Modifica el comportamiento de la animación, estableciendo una duracion de 0.5 segundos y una curva de acceleración suave (easeOut).
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

- **Página principal:** [`configuraciones-page.tsx`](../src/features/configuraciones/ui/configuraciones-page.tsx)
- **Cards animadas:**
  1. **Cards de Políticas y Preferencias:** [`hotel-general-settings.tsx`](../src/features/configuraciones/ui/molecules/hotel-general-settings.tsx)
     - Depósito de garantía
     - Check-in Express
     - Alertas de alta ocupación
     - Registro de auditoría (Fail-safe)
     - Modo mantenimiento
     - Sede predeterminada
  2. **Cards de Módulos del Hotel:** [`dashboard-nav-card.tsx`](../src/features/dashboard/ui/molecules/dashboard-nav-card.tsx) (incorporadas en [`modulos-hotel-section.tsx`](../src/features/configuraciones/ui/organisms/modulos-hotel-section.tsx))
     - Sedes, Habitaciones, Tarifas, Camas 3D, Reservas, Recepción, Usuarios, Personas, Permisos y Personalización.
  3. **Contenedores de sección:** Secciones principales en [`configuraciones-page.tsx`](../src/features/configuraciones/ui/configuraciones-page.tsx).
- **Efecto visual:** Aparición suave de cada tarjeta con desvanecimiento gradual (*fade in*) al cargarse en la vista de configuración.
