# 🔘 Prompt: Toggle Switch Fluido con Layout y Físicas Spring en Framer Motion

## 📋 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **8.0 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+8.0):** Identifica con gran precisión técnica el principio fundamental de Framer Motion: usar la propiedad `layout` delegando el cálculo de posición al cambio de alineación flex (`justify-start` a `justify-end`) del contenedor padre en lugar de calcular coordenadas manuales. También prescribe físicas `spring` para evitar animaciones lineales artificiales.
> - **Puntos a corregir (-2.0):** Numeración duplicada en los puntos clave (dos ítems numerados con "2"), erratas tipográficas ("sigueinte", "realista" en plural, "el secreto esta"), omisión de valores numéricos para `springConfig` (`stiffness`, `damping`), y omisión de una advertencia técnica crítica: no combinar `layout` con transformaciones CSS (`translate-x` o `transition-transform`), ya que generan colisión de transforms.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 3 — Formato inconsistente y numeración duplicada** | 🟠 Media | Tienes dos puntos rotulados con "2": `2. • transition={springConfig}` y `2. Tailwind CSS: ...`. Además contiene erratas: *"sigueinte"*, *"animaciones fisicas realista"*, *"el secreto esta utilizar"*. |
| **Patrón 1 — Instrucciones implícitas (Parámetros spring sin definir)** | 🟠 Media | Mencionas `transition={springConfig}` pero no especificas los valores físicos recomendados (`stiffness: 500, damping: 30`), dejando que la IA adivine coeficientes que podrían resultar en un rebote exagerado o demasiado rígido. |
| **Patrón 7 — Alcance técnico y prevención de conflictos** | 🟡 Baja | No se explicita eliminar clases tradicionales de translate (`translate-x-5` o `transition-transform`). Si el desarrollador o la IA deja estas clases activas, colisionarán con el cálculo de matriz de `layout`. |
| **Patrón 7 — Accesibilidad web (A11y)** | 🟡 Baja | No se mencionan atributos semánticos para el switch (`role="switch"`, `aria-checked={isActive}`), indispensables en interfaces profesionales. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Ideal si deseas conservar la estructura y tono original corrigiendo únicamente los fallos críticos y erratas.*

```markdown
En el componente [src/features/tarifas/ui/organisms/tarifas-table.tsx], implementa un switch deslizado (Toggle Switch) fluido con animaciones físicas realistas en Framer Motion / Motion para el estado de la tarifa (Activa / Inactiva).

Claves técnicas indispensables:
1. layout: Utiliza la propiedad `layout` en el círculo interior (`<motion.span layout />`). Framer Motion detectará el cambio de alineación del contenedor padre (pasando de `justify-start` a `justify-end` con Tailwind) y animará automáticamente la transición de posición.
2. transition={springConfig}: Sustituye las transiciones lineales por física spring con rebote calibrado: `transition={{ type: 'spring', stiffness: 500, damping: 30 }}`.
3. Tailwind CSS & Limpieza: Aplica estilos base con Tailwind (`h-6 w-11 rounded-full p-0.5`, `bg-emerald-500` / `bg-stone-300`). Asegúrate de no usar clases `translate-x` ni `transition-transform` en el círculo animado para no interferir con `layout`.
4. Accesibilidad: Incluye `role="switch"` y `aria-checked={isActive}` en el botón contenedor.
```

**Cambios realizados:**
- Se corrigió la numeración duplicada (1, 2, 3, 4) y las erratas ortográficas.
- Se definió el valor concreto para `springConfig` (`stiffness: 500, damping: 30`).
- Se añadió la advertencia de no mezclar `translate-x` con `layout` y los atributos de accesibilidad accesibles WAI-ARIA.

---

### Versión B — Versión Optimizada para Producción
> *Ideal para ejecutar en producción o alimentar agentes de desarrollo autónomos.*

```markdown
### Tarea: Implementar Toggle Switch Reactivo con `layout` y Físicas Spring en [src/features/tarifas/ui/organisms/tarifas-table.tsx]

#### 1. Requisitos de Animación (Framer Motion / motion/react)
- **Animación basada en Layout:** Aplicar la prop `layout` en el círculo (`motion.span`) del switch.
- **Transición por Flexbox:** El contenedor (`button`) debe gobernar la posición alternando entre:
  - Activo: `justify-end bg-emerald-500`
  - Inactivo: `justify-start bg-stone-300 dark:bg-stone-700`
- **Física Spring Orgánica:**
  ```ts
  const SWITCH_SPRING_CONFIG = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  } as const;
  ```
- **Prohibición de transformaciones CSS en el elemento móvil:** No utilizar `translate-x-*` ni `transition-transform` en el `motion.span`, permitiendo que Framer Motion calcule la matriz de transformación sin interferencia.

#### 2. Estructura y Tokens de Tailwind
- **Contenedor exterior (`button`):**
  - Dimensiones: `relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5`
  - Estados: `transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95`
- **Círculo interior (`motion.span`):**
  - Dimensiones: `inline-block size-5 rounded-full bg-white shadow-md`

#### 3. Estándar de Accesibilidad (WAI-ARIA)
- Atributos requeridos: `role="switch"`, `aria-checked={isActive}`, y `title` descriptivo del cambio de estado.
- Sincronizar tanto la tabla de escritorio (`table`) como las tarjetas en vista móvil (`md:hidden`).
```

**Por qué es mejor:**
- Establece la separación clara entre layout de Tailwind (`justify-start` vs `justify-end`) y la física de Motion.
- Provee dimensiones precisas (`h-6 w-11 p-0.5` con perilla de `size-5` = 20px) para un recorrido simétrico de 20px sin desfase.
- Garantiza cobertura dual (vista desktop y móvil).

---

### Versión C — Versión Avanzada con Especificación XML
> *Ideal para arquitecturas de agentes, máxima consistencia y cero ambigüedad.*

```xml
<task>
  <target_file>src/features/tarifas/ui/organisms/tarifas-table.tsx</target_file>
  <feature>Fluid Framer Motion Layout Switch (Toggle Switch)</feature>
  <context>
    Refactorizar los switches de estado en TarifasTable (vista tabla y vista móvil)
    para utilizar el principio de layout animation de Framer Motion.
  </context>

  <technical_rules>
    <rule name="framer_layout_principle">
      El contenedor &lt;button&gt; debe actuar como flex container con padding perimetral (p-0.5).
      El desplazamiento del botón NO debe calcularse con translate-x, sino con flex alignment:
      - Estado activo: "justify-end bg-emerald-500"
      - Estado inactivo: "justify-start bg-stone-300 dark:bg-stone-700"
    </rule>

    <rule name="spring_physics">
      El elemento &lt;motion.span&gt; debe recibir la prop `layout` y:
      `transition={{ type: 'spring', stiffness: 500, damping: 30 }}`
    </rule>

    <rule name="conflict_prevention">
      Remover de la perilla cualquier clase CSS de transición o desplazamiento
      (e.g., transition-transform, translate-x-*), ya que compiten con los inline styles de Framer Motion.
    </rule>

    <rule name="accessibility">
      Incluir role="switch", aria-checked={isActive}, y accesibilidad por teclado nativa.
    </rule>
  </technical_rules>

  <expected_code_pattern>
<![CDATA[
const SWITCH_SPRING_CONFIG = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
} as const;

<button
  type="button"
  role="switch"
  aria-checked={isActive}
  onClick={() => handleToggleSwitch(rate.id, rate.status)}
  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 ${
    isActive
      ? 'justify-end bg-emerald-500'
      : 'justify-start bg-stone-300 dark:bg-stone-700'
  }`}
  title={`Haz clic para cambiar a ${isActive ? 'Inactiva' : 'Activa'}`}
>
  <motion.span
    layout
    transition={SWITCH_SPRING_CONFIG}
    className="inline-block size-5 rounded-full bg-white shadow-md"
  />
</button>
]]>
  </expected_code_pattern>
</task>
```

**Técnicas aplicadas:**
- Delimitación por bloques semánticos XML.
- Código de referencia listo para copia/pega o lectura directa por LLMs.
- Regla explícita de prevención de conflictos (`conflict_prevention`).

---

## 🎓 Lecciones para tus próximos prompts

### Lo que hiciste bien:
- **Identificaste el principio de diseño correcto:** Señalar que `layout` es la propiedad idónea para animar cambios de alineación flex (`justify-start` a `justify-end`) demuestra un entendimiento profundo del motor de renderizado de Framer Motion.
- **Seleccionaste la física adecuada:** Exigir `spring` en lugar de curvas lineales asegura acabados premium con tacto nativo.

### 3 Hábitos para mejorar:

1. **Especifica los coeficientes numéricos de las físicas:**
   - Evita decir solo *"con animaciones físicas spring"*. Provee siempre valores concretos (`stiffness: 500, damping: 30`).
   - → **Regla de oro:** *"Si una animación depende de la física, dale los números o el modelo adivinará la inercia."*

2. **Advierte sobre conflictos de CSS vs JS:**
   - Cuando uses propiedades reactivas como `layout`, instruye explícitamente qué clases CSS **NO** deben coexistir (por ejemplo, evitar `transition-transform` y `translate-x-*`).
   - → **Regla de oro:** *"Dile qué hacer y adviértele qué no mezclar para evitar parpadeos."*

3. **Revisa la numeración y formato antes de enviar:**
   - Listas con números duplicados ("2." y luego otro "2.") desconciertan a los parsers de agentes y reducen la jerarquía de las instrucciones.
   - → **Regla de oro:** *"Una lista bien numerada es una orden bien ejecutada."*

---

### 📚 Recurso recomendado
- Documentación oficial de Framer Motion / Motion: [Layout Animations](https://motion.dev/docs/react-layout-animations) y [Spring Physics](https://motion.dev/docs/react-transitions#spring).
