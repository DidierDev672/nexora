# 📱 Prompt: ModalPresentationStyle Estilo iOS en "EdificioDetalleModal"

## 📋 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **7.5 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+7.5):** Describe con claridad conceptual el comportamiento deseado (*ModalPresentationStyle* tipo tarjeta apilada de iOS), identifica los 3 pilares técnicos indispensables (`AnimatePresence`, físicas `spring`, escala en el fondo con `scale-[0.93]`, `rounded-[24px]`, `origin-bottom`) y delimita dos acciones de limpieza concretas (eliminar ID de Edificio y campo "Registrado por").
> - **Puntos a corregir (-2.5):** No especifica la ruta del componente destino (`src/features/edificios/ui/organisms/edificio-detalle-modal.tsx`), omite el orden crítico de renderizado condicional dentro de `AnimatePresence` (el cual impedía la animación de salida al tener un `if (!isOpen) return null` prematuro), y no define valores numéricos calibrados para la física spring (`stiffness`, `damping`, `mass`).

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en el prompt original |
|---|---|---|
| **Patrón 1 — Falta de ruta del componente** | 🔴 Alta | *"En modal para visualizar el detalle del edificio..."* no provee la ruta exacta `src/features/edificios/ui/organisms/edificio-detalle-modal.tsx`. |
| **Patrón 1 — Detalle crítico de AnimatePresence** | 🔴 Alta | Pide animación suave de desmontaje con `AnimatePresence`, pero no instruye envolver la condición `{isOpen && <Component />}` adentro, provocando que si el componente tiene un `return null` externo, la salida se rompa. |
| **Patrón 3 — Parámetros spring y target del contenedor** | 🟠 Media | No concreta los coeficientes de física (`damping: 28`, `stiffness: 280`) ni especifica que el contenedor a encoger con `scale(0.93)` es el elemento raíz `#root` del DOM. |
| **Patrón 3 — Sintaxis y tipografía** | 🟡 Baja | Erratas como `!OS` en vez de `iOS` y redacción confusa en *"quita el registrador por el recepcionista"*. |

---

## 🚀 Versiones Mejoradas del Prompt

### Versión A — Corrección Mínima
> *Mantiene la estructura original corrigiendo las ambigüedades críticas*

```markdown
En el componente [src/features/edificios/ui/organisms/edificio-detalle-modal.tsx]:

1. **Limpieza de campos:**
   - Elimina la sección completa de "ID de Edificio" (y su botón de copiar).
   - En la sección de auditoría, elimina el campo "Registrado por" (deja únicamente la "Fecha de registro" si existe).

2. **Efecto ModalPresentationStyle (Estilo tarjeta iOS):**
   - **AnimatePresence:** Asegúrate de que el condicional `{isOpen && (...)}` esté DENTRO de `<AnimatePresence>` para que la animación de salida se ejecute antes de desmontar.
   - **Animación del modal:** Debe deslizarse desde abajo (`initial={{ y: '100%' }}`, `animate={{ y: 0 }}`, `exit={{ y: '100%' }}`) usando física spring (`type: 'spring', damping: 28, stiffness: 280, mass: 0.85`).
   - **Efecto de escala en el fondo:** Al abrirse el modal, aplica al contenedor raíz `#root` los estilos `transform: scale(0.93)`, `border-radius: 24px` y `transform-origin: bottom center`, restaurándolos al cerrarse.
```

---

### Versión B — Versión Optimizada para Producción
> *Estructurada, explícita y lista para agentes o desarrolladores*

```markdown
### Tarea: Refactorización y Animación Estilo iOS Sheet en [EdificioDetalleModal](file:///d:/React/nexora/src/features/edificios/ui/organisms/edificio-detalle-modal.tsx)

#### 1. Simplificación de Interfaz
- **Eliminar bloque "ID de Edificio":** Suprime el bloque con el UUID y el botón de copiado.
- **Auditoría limpia:** Suprime la visualización de `created_by` ("Registrado por"). Preserva únicamente `created_at` formateada en español.

#### 2. Implementación de ModalPresentationStyle (iOS Card Stack)
- **Física de Entrada y Salida (Spring):**
  - Deslizar la tarjeta verticalmente desde el borde inferior de la pantalla:
    - `initial`: `{ y: '100%', opacity: 0.9 }`
    - `animate`: `{ y: 0, opacity: 1 }`
    - `exit`: `{ y: '100%', opacity: 0.8 }`
    - `transition`: `{ type: 'spring', damping: 28, stiffness: 280, mass: 0.85 }`
- **Ciclo de Desmontaje con AnimatePresence:**
  - Evitar el `if (!isOpen) return null` previo. Envolver todo el diálogo bajo `<AnimatePresence>{isOpen && (...) }</AnimatePresence>`.
- **Efecto de Profundidad 3D en la Pantalla de Fondo:**
  - Mediante un `useEffect` sincronizado con `isOpen`, aplicar sobre el elemento `#root`:
    - `transformOrigin: 'bottom center'`
    - `transform: 'scale(0.93)'`
    - `borderRadius: '24px'`
    - `transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.4s cubic-bezier(0.32, 0.72, 0, 1)'`
  - Restaurar valores originales al desmontar o cerrar.
- **Detalle Estético iOS:**
  - Incluir un indicador de arrastre superior (*pill handle*) centrado (`h-1.5 w-12 rounded-full bg-line/80`).
```

---

### Versión C — Versión Avanzada con Especificación XML
> *Máxima precisión y robustez para agentes de IA*

```xml
<task>
  <target_file>src/features/edificios/ui/organisms/edificio-detalle-modal.tsx</target_file>
  <goal>Implementar ModalPresentationStyle estilo iOS sheet y remover datos redundantes de auditoría e ID.</goal>

  <ui_modifications>
    <remove_element>Sección "ID de Registro del Edificio" y manejadores de portapapeles.</remove_element>
    <remove_field>Campo "Registrado por" (created_by).</remove_field>
    <preserve_field>Campo "Fecha de registro" (created_at).</preserve_field>
  </ui_modifications>

  <animation_specifications>
    <pattern>iOS Page Sheet / ModalPresentationStyle</pattern>
    <exit_strategy>
      Condicional {isOpen && (...)} anidado obligatoriamente en <AnimatePresence />.
    </exit_strategy>
    <modal_card>
      <axis>y</axis>
      <initial y="100%" opacity="0.9" />
      <animate y="0" opacity="1" />
      <exit y="100%" opacity="0.8" />
      <physics type="spring" damping="28" stiffness="280" mass="0.85" />
    </modal_card>
    <background_depth_effect target="#root">
      <transform_origin>bottom center</transform_origin>
      <scale>0.93</scale>
      <border_radius>24px</border_radius>
      <transition_curve>cubic-bezier(0.32, 0.72, 0, 1)</transition_curve>
      <cleanup>Restaurar estilos en return de useEffect al cerrar.</cleanup>
    </background_depth_effect>
  </animation_specifications>
</task>
```

---

## 🎓 Lecciones Transferibles para tus Próximos Prompts

**Lo que hiciste muy bien:**
- Capturaste la esencia de la experiencia de usuario de Apple descomponiéndola en sus 3 componentes técnicos fundamentales (`AnimatePresence`, físicas `spring`, y contracción de la capa inferior).
- Justificaste el porqué de cada cambio (ej. *"por que ya estamos visualizando la informacion de la sede, no es necesario"*).

**3 Hábitos de Oro:**
1. **Especifica siempre el archivo exacto donde vive el componente:**
   → *Regla de oro:* *"Un archivo específico en el prompt ahorra búsquedas a ciegas y modificaciones en archivos equivocados."*
2. **Cuidado con el 'Return Prematuro' en animaciones con Framer Motion:**
   → *Regla de oro:* *"Si pides animaciones de salida con AnimatePresence, recuérdale al modelo que el `if (!isOpen) return null` rompe el ciclo."*
3. **Calibra las constantes de física spring:**
   → *Regla de oro:* *"Para transiciones estilo Apple, valores de `damping: 25-30` y `stiffness: 250-300` reproducen el rebote nativo de iOS."*
