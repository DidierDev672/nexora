# 📋 Diagnóstico y Optimización de `src/agent.md`

## 📊 Calificación General del Prompt: **6.9 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+6.9):** Excelente conceptualización arquitectónica (Vertical Slicing, Onion Architecture, Atomic Design y principios SOLID aplicados al frontend). Directrices visuales y de UX claras (Header semántico, InfiniteScroll obligatorio para colecciones, orquestación de animaciones centralizada con Motion, psicología del copywriting para mensajes).
> - **Puntos a corregir (-3.1):**
>   1. **Mezcla de dos propósitos dispares (Contaminación de alcance):** El archivo combina una especificación puntual de la feature de temas (`src/features/tema/`, líneas 1-88) con convenciones globales de UI para todo el sistema (líneas 89-145). Esto confunde a los agentes sobre el alcance real de su rol.
>   2. **Referencias a archivos inexistentes ("Rutas Fantasma"):** Cita `references/copywriting-psicologia.md`, `assets/motionVariants.ts`, `assets/InfiniteScroll.example.tsx` y `assets/messages.example.ts`, los cuales no existen en el repositorio. Esto induce alucinaciones o errores de lectura en agentes autónomos.
>   3. **Frontmatter YAML roto / malformado:** Las etiquetas `name: ui-page-conventions` y `description: "..."` se ubican entre encabezados de Markdown sin los delimitadores `---` al inicio, rompiendo el parseo estándar de skills o reglas.
>   4. **Instrucciones obsoletas:** La directriz *"Copia assets/motionVariants.ts a src/design-tokens/motion.ts la primera vez que este skill se use"* es obsoleta y peligrosa, ya que `src/design-tokens/motion.ts` ya existe y está en producción activa.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en `src/agent.md` |
|---|---|---|
| **Patrón 8 — Rutas inexistentes / Alucinaciones inducidas** | 🔴 Crítica | Referencia múltiples archivos locales que no existen en el workspace (`references/copywriting-psicologia.md`, `assets/motionVariants.ts`, `assets/InfiniteScroll.example.tsx`, `assets/messages.example.ts`). |
| **Patrón 2 — Contaminación de contexto y alcance (Scope Bleed)** | 🔴 Crítica | Fusiona la documentación de una única feature (`src/features/tema/`) con directrices transversales de páginas de UI para toda la aplicación. |
| **Patrón 3 — Frontmatter YAML malformado** | 🟠 Media | `name:` y `description:` carecen de delimitadores de apertura `---` y están intercalados tras un encabezado `# panel-personalizacion`, provocando fallos de sintaxis en loaders de agentes. |
| **Patrón 7 — Instrucción obsoleta de inicialización** | 🟠 Media | Pide copiar un archivo inexistente a `src/design-tokens/motion.ts`, arriesgando sobreescritura accidental de tokens de animación reales en producción. |
| **Patrón 6 — Over-prompting imperativo** | 🟡 Baja | Exceso de urgencia artificial en mayúsculas (*"Convenciones OBLIGATORIAS...", "Úsalo SIEMPRE..."*), lo cual puede causar rigidez en componentes donde ciertas reglas no aplican (ej. páginas de login o modales simples). |

---

## 🚀 Versiones Mejoradas de `agent.md`

---

### Versión A — Corrección Mínima
> *Conserva la estructura original del archivo, pero corrige el frontmatter, reemplaza las rutas fantasma por los archivos reales del proyecto y elimina instrucciones obsoletas.*

```markdown
---
name: ui-page-conventions
description: Convenciones de arquitectura y diseño UI para React en Nexora. Aplica al crear páginas, cabeceras, modales, loaders, listas con scroll infinito y mensajes de retroalimentación.
---

# panel-personalizacion — Esquema de personalización de tema

Sistema de personalización de colores/tipografía para React, diseñado para que un agente de IA lo extienda respetando las reglas arquitectónicas del proyecto.

## Cómo se cumple cada principio

### Verticalidad (Vertical Slicing)
Todo lo relacionado con "tema" vive en una sola carpeta: `src/features/tema/`. Si se agrega otra feature (ej. `notificaciones`), se crea `src/features/notificaciones/` con su propio `domain/`, `application/`, `infrastructure/` y `ui/`, sin modificar `tema/`.

### Cebolla (Onion Architecture)
Dentro de `features/tema/`, las dependencias solo apuntan hacia adentro:
```
ui/ ────────► application/ ────────► domain/
infrastructure/ ─(implementa)─► domain/
```
- `domain/` no importa React ni librerías de persistencia.
- `application/` orquesta casos de uso y solo conoce `domain/`.
- `infrastructure/` implementa contratos (repositorios) definidos en el dominio.
- `ui/` es la única capa con conocimiento de React y componentes visuales.

### Atomización (Atomic Design)
Dentro de `ui/`:
- `atoms/` → Componentes visuales puros sin conocimiento de negocio.
- `molecules/` → Composición de átomos.
- `organisms/` → Componentes complejos conectados a hooks o estado global.

### SOLID
- **S**: Cada caso de uso y componente atómico tiene una responsabilidad única.
- **O**: Se extienden estilos mediante tokens en `src/design-tokens/` sin alterar componentes existentes.
- **L**: Las implementaciones de repositorios son 100% intercambiables con base en su interfaz de dominio.
- **I**: Interfaces pequeñas y específicas para cada consumidor.
- **D**: Los componentes y casos de uso dependen de abstracciones, no de clases concretas.

## Tokens de Tema por Defecto
- `primary`: `#5a311f` (Botones principales, encabezados de acento)
- `secondary`: `#67543e` (Acentos secundarios, estados hover)
- `neutral`: `#6d6e76` (Texto secundario, bordes sutiles)
- `surface`: `#d4c7b7` (Fondos de panel y tarjetas)
- Tipografía: **Poppins**, peso bold (700) en títulos.

---

# Convenciones Globales de Páginas y Componentes (UI)

## 1. Cabecera Semántica con Copywriting Humano
- Toda página principal incluye un encabezado descriptivo.
- Lenguaje cercano y centrado en el usuario (ej. *"Tus reservas"*, no *"Gestión de Reservas"*).
- El título comunica el resultado o beneficio; el subtítulo aporta contexto y reduce fricción.
- Efecto de entrada con animación `slideIn` desde `src/design-tokens/motion.ts`.

## 2. Scroll Infinito Obligatorio en Listas y Tablas
- No implementar paginación manual ni botones de "cargar más" caseros.
- Envolver toda colección dinámica con el componente compartido `src/shared/ui/InfiniteScroll.tsx`.
- Animación de revelado para tarjetas y tablas con variantes de `motion` (o `LazyAnimatedWrapper`).

## 3. Modales y Estados de Carga
- Efecto de entrada con variante `fadeUp` (opacidad de 0 a 1 con traslación vertical).
- Aplicar la misma transición al modal y a su loader interno.

## 4. Animaciones Centralizadas con Motion
- Importar siempre desde `motion/react`.
- Reutilizar las variantes tipadas en `src/design-tokens/motion.ts` (`slideIn`, `fadeUp`, `fadeIn`, `staggerContainer`).
- Prohibido definir `@keyframes` de CSS dispersos para transiciones estándar.

## 5. Mensajes de Retroalimentación (Feedback)
- **Éxito**: Confirmar la acción concreta con verbos directos (*"Guardado"*, *"Comanda enviada"*).
- **Error**: Explicar qué ocurrió y cómo solucionarlo de forma constructiva, sin culpar al usuario ni exponer stack traces.
- **Advertencia**: Anticipar consecuencias de forma preventiva antes de ejecutar acciones destructivas.
```

---

### Versión B — Versión Optimizada para Producción
> *Separa nítidamente las reglas globales de arquitectura y UI de Nexora, incrusta las directrices de copywriting directamente para eliminar dependencias externas y define contratos de archivo reales.*

```markdown
---
name: nexora-ui-architectural-rules
description: Directrices obligatorias de arquitectura limpia (Vertical Slicing, Onion, SOLID) y diseño de interfaz para el desarrollo de páginas, componentes, animaciones y flujos en Nexora.
---

# Reglas de Arquitectura y Convenciones de UI de Nexora

Este documento establece los estándares de ingeniería y diseño para cualquier agente o desarrollador que genere código en el repositorio.

---

## 🏛️ 1. Arquitectura de Código

### A. Vertical Slicing
Cada funcionalidad de negocio reside en su propio módulo independiente dentro de `src/features/<modulo>/`.
- Prohibido acoplar código entre slices paralelos.
- Si una funcionalidad es transversal a múltiples dominios, reside en `src/shared/` (ej. `src/shared/ui/`, `src/shared/lib/`).

### B. Arquitectura Onion (Cebolla)
Dentro de cada slice, el flujo de dependencias es estrictamente unidireccional hacia el núcleo:
1. `domain/`: Entidades de negocio, tipos e interfaces de repositorios (sin React, sin Axios, sin almacenamiento).
2. `application/`: Casos de uso, stores (Zustand) y orquestación de lógica.
3. `infrastructure/`: Implementaciones técnicas de repositorios, clientes HTTP y adaptadores de API.
4. `ui/`: Componentes React, vistas y composables.

### C. Atomic Design en la capa UI
- `atoms/`: Elementos primitivos reutilizables sin lógica de negocio (botones, inputs, badges).
- `molecules/`: Combinación de átomos para formar unidades funcionales (campos con etiqueta y error, tarjetas compactas).
- `organisms/`: Componentes complejos que orquestan flujos, consumen stores o ejecutan mutaciones (paneles, grillas, formularios).
- `views/`: Vistas completas compuestas por organismos.

---

## 🎨 2. Convenciones Globales de Interfaz de Usuario

### 1. Encabezados con Copywriting Psicológico
Toda página nueva debe iniciar con un encabezado descriptivo animado:
- **Título**: Orientado al beneficio del usuario, en lenguaje humano, claro y libre de jerga técnica interna.
- **Subtítulo**: Contextualiza la acción principal y reduce la carga cognitiva.
- **Animación**: Entrada con variante `slideIn` (`src/design-tokens/motion.ts`).

### 2. Manejo de Colecciones con Scroll Infinito
Toda lista de tarjetas (`cards`), grilla o tabla dinámica debe utilizar scroll infinito:
- **Componente**: Envolver con `src/shared/ui/InfiniteScroll.tsx`.
- **Efecto de Scroll**: Usar `LazyAnimatedWrapper` o variantes `whileInView` con margen de activación controlado.
- **Mensaje de Cierre**: Incluir siempre el componente `InfiniteScrollEnd` al agotar los datos.

### 3. Modales y Feedback Visual
- Los modales y sus indicadores de carga internos deben animarse con la variante `fadeUp`.
- La información de error o advertencia debe ser clara, predictiva y no acusatoria.

### 4. Orquestación de Animaciones Centralizada
- Importar únicamente desde `motion/react`.
- Consumir las variantes centralizadas en `src/design-tokens/motion.ts`:
  - `slideIn`: Encabezados y títulos de vista.
  - `fadeUp`: Modales, diálogos y tarjetas con elevación.
  - `fadeIn`: Tablas, contenedores secundarios y transiciones de pestaña.
  - `staggerContainer` / `staggerItem`: Listados orquestados de elementos secuenciales.

---

## 📁 3. Mapa de Rutas Clave del Repositorio

| Recurso | Ruta en el Proyecto |
|---|---|
| Variantes de animación Motion | `src/design-tokens/motion.ts` |
| Componentes UI compartidos | `src/shared/ui/` (`InfiniteScroll.tsx`, `LazyAnimatedWrapper.tsx`, `Input.tsx`, `Textarea.tsx`) |
| Cliente HTTP Axios validado | `src/lib/api.ts` |
| Validador de Códigos HTTP | `src/shared/lib/status-code-validator.ts` |
| Módulos funcionales (Slices) | `src/features/<modulo>/` |
```

---

### Versión C — Versión Avanzada con XML para Agentes Autónomos
> *Estructura modularizada con delimitadores semánticos XML, listas de verificación y anti-patrones explícitos para agentes de IA.*

```xml
<nexora_guidelines version="2.0">
  <metadata>
    <project_name>Nexora Hotel Management Platform</project_name>
    <core_stack>React 19, TypeScript, Tailwind CSS, Motion (motion/react), Zustand</core_stack>
  </metadata>

  <architectural_rules>
    <vertical_slicing>
      Organizar por módulos de negocio en `src/features/<feature>/`.
      Capas internas obligatorias: domain -> application -> infrastructure -> ui.
    </vertical_slicing>
    <atomic_design>
      ui/atoms: Primitivos visuales sin acoplamiento a negocio.
      ui/molecules: Composiciones de átomos reutilizables.
      ui/organisms: Bloques de pantalla orquestados con stores o llamadas a repositorios.
      ui/views: Pantallas completas del dashboard.
    </atomic_design>
  </architectural_rules>

  <ui_rules>
    <header_rule>
      Toda página de vista debe iniciar con un Header animado con `slideIn`.
      Copywriting centrado en beneficio del usuario (sin nombres crudos de tablas de base de datos).
    </header_rule>

    <collection_rule>
      Toda lista o tabla debe envolverse en `src/shared/ui/InfiniteScroll.tsx`.
      Cada tarjeta debe animarse en viewport mediante `src/shared/ui/LazyAnimatedWrapper.tsx`.
    </collection_rule>

    <motion_rule>
      Importar exclusivamente desde `motion/react`.
      Consumir variantes desde `src/design-tokens/motion.ts`.
      Prohibido definir CSS @keyframes manuales para animaciones estándar de entrada.
    </motion_rule>
  </ui_rules>

  <anti_patterns>
    <avoid>No crear paginación manual con botones "Cargar más" propios.</avoid>
    <avoid>No exponer identificadores UUID crudos (room_id, stay_id, created_by) en la interfaz final.</avoid>
    <avoid>No acoplar componentes de diferentes slices funcionales entre sí.</avoid>
  </anti_patterns>

  <verification_checklist>
    <item>¿El módulo está ubicado dentro de `src/features/<slice>` o `src/shared/`?</item>
    <item>¿Las listas de elementos dinámicos cuentan con `InfiniteScroll`?</item>
    <item>¿Las animaciones consumen variantes de `src/design-tokens/motion.ts`?</item>
    <item>¿El build de TypeScript (`tsc -b`) pasa sin advertencias ni errores?</item>
  </verification_checklist>
</nexora_guidelines>
```

---

## 🎓 Lecciones para tus próximos prompts de agentes

### Lo que hiciste bien:
- **Coherencia arquitectónica:** Establecer reglas claras de Vertical Slicing, Onion y Atomic Design previene que los agentes dispersen el código en carpetas desorganizadas.
- **Estandarización de componentes:** Imponer el uso de `InfiniteScroll` y `motion` evita que cada interacción de la IA invente un sistema de paginación o animación diferente.

### 3 Hábitos para mejorar:

1. **Separa la documentación de una feature de las reglas globales del agente:**
   - Si un archivo se llama `agent.md`, debe contener instrucciones aplicables a **todas** las tareas del agente. La documentación técnica de un módulo específico (como `features/tema`) debe vivir en su propio `README.md` o `docs/` dentro de esa carpeta.
   - → **Regla de oro:** *"Las reglas del agente definen CÓMO trabajar; las carpetas de feature documentan QUÉ hace cada módulo."*

2. **Evita referenciar archivos locales que no existen en el repo:**
   - Citar rutas como `references/copywriting-psicologia.md` cuando no existen en el disco induce al agente a alucinar o fallar en tiempo de ejecución. Si una regla es importante, inclúyela directamente en el texto del prompt.
   - → **Regla de oro:** *"Si una guía es obligatoria, colócala en el prompt; no delegues en archivos externos inexistentes."*

3. **Mantén el prompt sincronizado con la realidad del código:**
   - Instrucciones como *"copia assets/motionVariants.ts la primera vez..."* confunden al modelo cuando el archivo ya está creado en `src/design-tokens/motion.ts`.
   - → **Regla de oro:** *"Revisa los prompts del sistema cada vez que se consoliden módulos base en el repositorio."*

---

### 📚 Recurso recomendado
- Documentación oficial de Anthropic: [Building Effective AI Agents & System Prompts](https://www.anthropic.com/research/building-effective-agents).
