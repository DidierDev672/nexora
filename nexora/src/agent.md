# panel-personalizacion — Esquema de personalización de tema

Sistema de personalización de colores/tipografía para React, diseñado para
que un agente de IA (o cualquier dev) lo extienda sin romper las reglas
arquitectónicas pedidas.

name: ui-page-conventions

description: "Convenciones OBLIGATORIAS de este proyecto para crear páginas y componentes de UI en React. Úsalo SIEMPRE que crees una página nueva, un Header, un modal, un estado de loading, una lista de cards o una tabla, o cualquier mensaje de éxito/error/advertencia — incluso si el usuario no lo menciona explícitamente, porque son reglas del proyecto, no algo opcional. Cubre: título/subtítulo del Header redactados con copywriting psicológico, scroll infinito obligatorio con el componente reutilizable InfiniteScroll.tsx para toda lista de cards o tabla, animaciones con la librería motion (slide-in para Header, fade-up para modales/loading, fade-in para cards y tablas), y mensajes de feedback redactados con principios de psicología del usuario."

---

## Cómo se cumple cada principio

### Verticalidad (Vertical Slicing)

Todo lo relacionado con "tema" vive en **una sola carpeta**:
`src/features/tema/`. Si mañana agregas otra feature (ej. `notificaciones`),
se crea `src/features/notificaciones/` con su propio domain/application/
infrastructure/ui — sin tocar `tema/`.

### Cebolla (Onion)

Dentro de `features/tema/`, las dependencias solo apuntan hacia adentro:

```
ui/  ────────►  application/  ────────►  domain/
infrastructure/ ─(implementa)─►  domain/
```

- `domain/` (ThemeConfig, ThemeRepository) no importa React ni localStorage.
- `application/` (GetTheme, UpdateTheme, ResetTheme) solo conoce `domain/`.
- `infrastructure/` (LocalStorageThemeRepository, ApiThemeRepository)
  implementa el puerto `ThemeRepository` — son intercambiables.
- `ui/` (ThemeContext, componentes) es la única capa que conoce React.

### Atomizar (Atomic Design)

Dentro de `ui/` los componentes se dividen por nivel de composición:

- `atoms/` → ColorSwatch, Etiqueta (no saben nada de negocio)
- `molecules/` → SelectorDeColor (compone átomos)
- `organisms/` → PanelDePersonalizacion (el único que usa `useTheme()`)

### SOLID

- **S**RP: cada caso de uso (`GetTheme`, `UpdateTheme`, `ResetTheme`) hace
  una sola cosa; cada componente atómico tiene un único propósito visual.
- **O**CP: agregar un color nuevo a la paleta no obliga a tocar
  `ThemeProvider` ni los casos de uso — solo `design-tokens/colors.ts`.
- **L**SP: `LocalStorageThemeRepository` y `ApiThemeRepository` son
  100% intercambiables porque ambas cumplen `ThemeRepository` al pie
  de la letra (ver `src/App.tsx`, es el único lugar donde se elige cuál).
- **I**SP: `ThemeRepository` solo tiene 3 métodos (`obtener`, `guardar`,
  `limpiar`) — ningún consumidor se ve forzado a implementar algo que no usa.
- **D**IP: `ThemeProvider` recibe el repositorio por props (inyección),
  nunca instancia `LocalStorageThemeRepository` directamente.

## Paleta y tipografía por defecto

| Token       | Color     | Uso sugerido                     |
| ----------- | --------- | -------------------------------- |
| `primary`   | `#5a311f` | Botones principales, encabezados |
| `secondary` | `#67543e` | Acentos, estados hover           |
| `neutral`   | `#6d6e76` | Texto secundario, bordes         |
| `surface`   | `#d4c7b7` | Fondos de panel/tarjetas         |

Tipografía: **Poppins**, peso **bold (700)** por defecto en títulos, con
escala completa (`regular`/`medium`/`bold`) para el resto de la jerarquía
en `src/design-tokens/typography.ts`.

## Verificar tipos

```bash
npm install
npm run typecheck
```

(Ya se ejecutó en el entorno de generación: compila limpio en modo `strict`.)

## Próximo paso sugerido

Agregar persistencia real conectada al backend de usuarios en Go: solo
hay que cambiar una línea en `src/App.tsx`
(`new ApiThemeRepository(baseUrl, token)` en vez de
`new LocalStorageThemeRepository()`), sin tocar dominio, casos de uso
ni componentes.

# Convenciones de páginas y componentes (UI)

Reglas fijas del proyecto. No son sugerencias: si la tarea es "crear una página nueva", "agregar un modal", "listar X en cards/tabla", o "mostrar un mensaje de éxito/error", estas reglas se aplican sin que el usuario tenga que repetirlas.

## 1. Toda página nueva lleva un Header con título + subtítulo

- Usa el componente `Header` (organismo — ver arquitectura del proyecto: átomos `Titulo`/`Subtitulo` + layout del header).
- Título y subtítulo se redactan siguiendo `references/copywriting-psicologia.md` — en resumen:
  - Lenguaje humano, no técnico ni nombre de tabla/entidad ("Tus reservas", no "Gestión de Reservas").
  - El título comunica el beneficio/resultado para el usuario, no la función del sistema.
  - El subtítulo reduce fricción: da contexto o transmite control ("Aquí puedes ver y gestionar quiénes se hospedan hoy").
  - Sin mayúsculas sostenidas, sin jerga interna, sin signos de alarma innecesarios.
- Efecto de entrada: **slide-in** (ver `assets/motionVariants.ts` → `slideIn`).

## 2. Toda lista de cards o tabla usa scroll infinito

- Nunca implementes paginación manual ni "cargar más" propio: envuelve la lista con el componente reutilizable **`InfiniteScroll.tsx`** que ya existe en el proyecto.
- Ver ejemplo de uso en `assets/InfiniteScroll.example.tsx`.
- Efecto de entrada de cada card: **fade-in**.
- Efecto de entrada de la tabla: **fade-in**.

## 3. Modales y loading

- Efecto de entrada: **fade-up** (opacity 0→1 + traslación vertical desde abajo).
- Aplica igual al contenido del modal y a su estado de loading interno.

## 4. Animaciones: siempre con la librería `motion`

Nunca CSS `@keyframes` manual ni `transition` para estas entradas — usa `motion` (`import { motion } from "motion/react"`) con las variantes centralizadas en `assets/motionVariants.ts`. Esto evita que cada componente reinvente sus propios valores de duración/easing (un solo lugar para ajustar el "feel" de toda la app).

| Componente                | Efecto   | Variante  |
| ------------------------- | -------- | --------- |
| Header                    | slide-in | `slideIn` |
| Modal                     | fade-up  | `fadeUp`  |
| Loading (dentro de modal) | fade-up  | `fadeUp`  |
| Card                      | fade-in  | `fadeIn`  |
| Tabla                     | fade-in  | `fadeIn`  |

Copia `assets/motionVariants.ts` a `src/design-tokens/motion.ts` la primera vez que este skill se use en el proyecto (mismo lugar que `colors.ts` y `typography.ts`), y luego solo impórtalo.

## 5. Mensajes de éxito, error y advertencia

Se redactan con psicología del usuario — ver `references/copywriting-psicologia.md` para el detalle completo. Resumen rápido:

- **Éxito**: confirma la acción específica que se hizo, con el mismo verbo que usó el botón ("Guardado", no "Operación exitosa").
- **Error**: nunca culpa al usuario; dice qué pasó y qué hacer, sin tecnicismos ni stack traces.
- **Advertencia**: anticipa la consecuencia antes de que ocurra y da una acción clara, tono neutral (no alarmista).
- Los tres tipos entran con la variante `fadeUp` (igual que modales, para consistencia visual del sistema de notificaciones).
- Ejemplo de diccionario de mensajes en `assets/messages.example.ts`.

## Dónde vive cada cosa (si el proyecto sigue Vertical Slicing + Onion + Atomic Design)

- `motionVariants` → `src/design-tokens/motion.ts` (junto a colors/typography).
- `Header`, `Modal`, `Card`, `Tabla` → capa `ui/` del slice correspondiente, organizados por átomos/moléculas/organismos.
- `InfiniteScroll.tsx` → componente compartido, fuera de cualquier slice (ej. `src/shared/ui/InfiniteScroll.tsx`), ya que lo consume cualquier feature.
- Diccionario de mensajes → `src/shared/mensajes/` o junto al slice si el mensaje es específico de esa feature.
