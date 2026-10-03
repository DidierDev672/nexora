# 💡 Prompt: Pared de Luces con Alfabeto de Joyce Byers (Stranger Things)

## 📋 Registro del Prompt Original

```text
@[src/features/habitaciones/ui/asignar-huesped-page.tsx] , para el background vamos  a siguir agrendado contenido, crea una pared de luces con el alfabeto que Joyce Byers.
1. Estructura de datos
type LetterState = "idle" | "active" | "lit";

interface AlphabetWallState {
  letters: Record<string, LetterState>; // A-Z
  currentWord: string;
  history: string[]; // palabras deletreadas anteriormente
}
2. Layout del tablero
. Grilla o fila de 26 elementos (A–Z), cada uno como un componente Letter.
. Cada Letter contiene: el carácter pintado en la "pared" (texto estático, no animado) + una hilera pequeña de puntos/focos debajo (representando el cable de luces), que es lo que realmente se anima.
. Usar CSS Grid con grid-template-columns: repeat(13, 1fr) en dos filas (como se ve en la serie, no es una sola fila continua) o una sola fila con scroll horizontal si se prefiere fidelidad a la escena específica.
3. Animación del encendido (el corazón del componente)
Efecto de "foco que se enciende": no es un simple cambio de color, es un cambio de brillo e intensidad, como una bombilla incandescente que tarda una fracción de segundo en alcanzar su brillo máximo.
<motion.div
  animate={{
    backgroundColor: isLit ? "#fbbf24" : "#1f2937",
    boxShadow: isLit
      ? "0 0 20px 6px rgba(251,191,36,0.8)"
      : "0 0 0px 0px rgba(251,191,36,0)",
  }}
  transition={{ duration: 0.4, ease: "easeOut" }}
/>
El boxShadow animado es lo que simula el resplandor (glow) de una luz navideña real — sin él, el efecto se siente plano, como un simple cambio de color de fondo.
4. Secuencia de deletreo (spelling sequence)
Para deletrear una palabra letra por letra con pausas irregulares (fiel a la tensión de la escena):
async function spellWord(word: string, onLetterLit: (letter: string) => void) {
  for (const letter of word.toUpperCase()) {
    await wait(randomBetween(600, 1400)); // pausa irregular, no un timer fijo
    onLetterLit(letter);
    playLightSound(); // opcional: sonido corto de "click" eléctrico
  }
}
La irregularidad de la pausa (no un intervalo fijo) es clave para la sensación de la escena — un timer perfectamente parejo se sentiría mecánico, no como una comunicación incierta desde "el otro lado".
2.5 Parpadeo/inestabilidad (efecto de interferencia)

En algunos momentos de la serie las luces parpadean de forma errática antes de estabilizarse, simulando interferencia. Esto se logra con keyframes de opacidad en vez de una transición simple:
animate={{ opacity: [1, 0.3, 1, 0.5, 1] }}
transition={{ duration: 0.6, times: [0, 0.2, 0.4, 0.6, 1] }}
Usarlo como un efecto ocasional (ej. antes de que una letra "se confirme" como encendida) añade textura dramática sin saturar toda la interacción.
6. Historial de palabras deletreadas
Debajo del tablero, un panel que va acumulando las palabras ya formadas, con entrada animada (AnimatePresence + initial={{ opacity: 0, y: 10 }}), para que cada palabra nueva se sienta como un mensaje que se "asienta" en el historial, sin reemplazar al anterior — replicando cómo Joyce nunca borra lo que ya se deletreó.
7. Interactividad real (más allá de la réplica visual)
Si el objetivo es un juego o demo interactivo (no solo una recreación pasiva), se puede invertir el control:
. Un usuario en un rol ("el que está del otro lado") hace clic en letras para deletrear un mensaje.
. El otro usuario (o la misma persona en modo demo) ve las luces encenderse en tiempo real, con la misma animación de glow.
. Esto convierte el componente en una mini-experiencia de comunicación asíncrona, que es justo el concepto emocional detrás del objeto original.
Consideraciones de accesibilidad
. El efecto de parpadeo errático (2.5) debe respetar prefers-reduced-motion: para usuarios con esa preferencia, sustituir por un cambio de opacidad directo sin keyframes intermedios.
. Cada letra encendida necesita anunciarse a lectores de pantalla en el orden en que se enciende (ej. con una región aria-live="polite" que vaya anunciando cada letra), ya que la información se transmite puramente de forma visual/temporal.
```

---

## 🔧 Diagnóstico y Calificación del Prompt Original

### 📊 Calificación: **9.4 / 10**

> **Desglose de la evaluación:**
> - **Aciertos (+9.4):** Es un prompt de ingeniería frontend de altísimo nivel. Especifica la estructura de datos TypeScript formal (`LetterState`, `AlphabetWallState`), el modelo visual (`boxShadow` volumétrico + `backgroundColor` incandescente), la cadencia temporal irregular (600ms–1400ms para simular incertidumbre y tensión física), el comportamiento no lineal de parpadeo errático con keyframes, el historial acumulativo con `AnimatePresence`, la interactividad bidireccional ("el que está del otro lado") y los dos pilares de accesibilidad más omitidos habitualmente: `prefers-reduced-motion` y anuncios de pantalla con `aria-live="polite"`.
> - **Puntos a optimizar (-0.6):**
>   1. **Distribución canónica de filas de la serie:** La serie Stranger Things utiliza exactamente 3 hileras de papel tapiz con letras pintadas a mano con pintura negra: Fila 1 (A–H = 8 letras), Fila 2 (I–Q = 9 letras) y Fila 3 (R–Z = 9 letras). La sugerencia de 2 filas de 13 (`repeat(13, 1fr)`) rompería la estética vintage original.
>   2. **Paleta cromática de luces navideñas C9:** En la serie las bombillas incandescentes no son solo ámbar/amarillo, sino guirnaldas multicolor de bulbos grandes (rojo, ámbar, verde, azul, violeta, naranja, cian, rosa).
>   3. **Mecanismo de sonido autónomo (`playLightSound`):** Si no se aclara cómo se implementa, un agente podría intentar importar archivos `.mp3` inexistentes que produzcan errores 404 en tiempo de ejecución. Es crucial estipular síntesis mediante **Web Audio API** (oscilador de clic y zumbido electromagnético).
>   4. **Manejo de concurrencia y limpieza de timers:** Si el usuario activa una nueva palabra mientras otra se está deletreando, se debe incluir un token de cancelación o `AbortController` para evitar solapamientos de estado.

---

### 🔍 Tabla de Problemas Detectados

| Patrón | Severidad | Descripción del problema en TU prompt |
|---|---|---|
| **Patrón 2 — Contexto histórico / fidelidad visual de la escena** | 🟠 Media | En la serie la pared tiene 3 filas (A-H, I-Q, R-Z) con cable negro retorcido y bombillas multicolor C9 de los 80, no solo 2 filas monocromáticas. |
| **Patrón 8 — Ausencia de especificación de audio autónomo** | 🟡 Baja | `playLightSound()` sin especificar origen puede disparar intentos de carga de archivos de audio locales rotos. Especificar Web Audio API sintético. |
| **Patrón 7 — Control de concurrencia en la secuencia async** | 🟡 Baja | Si el usuario dispara dos deletreos seguidos o hace clics rápidos, se requiere `AbortController` o referencia de cancelación para no duplicar timers en bucle. |

---

## 🚀 Versiones Mejoradas del Prompt

---

### Versión A — Corrección Mínima
> *Mantiene tu estructura original agregando la disposición de 3 filas, la paleta multicolor y la síntesis con Web Audio API:*

```markdown
En [src/features/habitaciones/ui/asignar-huesped-page.tsx], crea la pared de luces con el alfabeto de Joyce Byers (Stranger Things) utilizando React, TailwindCSS y Motion.

1. Estructura de Datos:
   - `type LetterState = "idle" | "active" | "lit"`
   - `interface AlphabetWallState { letters: Record<string, LetterState>; currentWord: string; history: string[]; }`

2. Layout Canónico (3 Filas con Cable Retorcido):
   - Fila 1: A - H (8 letras)
   - Fila 2: I - Q (9 letras)
   - Fila 3: R - Z (9 letras)
   - Cada letra tiene su carácter pintado en negro gastado con ligera rotación aleatoria + bombilla incandescente multicolor C9 colgando del cable superior.

3. Animación de Foco Incandescente:
   - `motion.div` con `boxShadow` animado y `backgroundColor` según la paleta de la bombilla.
   - Parpadeo errático previo a estabilizarse (respetando `prefers-reduced-motion`).

4. Secuencia Asíncrona con Cancelación:
   - `spellWord(word)` con intervalo aleatorio de 600 a 1400 ms.
   - Sonido de clic eléctrico simulado con Web Audio API (sin dependencias de archivos externos).
   - Limpieza de timers pendientes si se inicia una nueva transmisión.

5. Historial e Interactividad:
   - Chips de palabras previas con `AnimatePresence`.
   - Selector interactivo donde hacer clic en una letra o ingresar un mensaje personalizado enciende las luces en tiempo real.
   - Región accesible `aria-live="polite"` para lectores de pantalla.
```

---

### Versión B — Versión Optimizada para Producción (Recomendada)
> *Átomo ambiental puro en el fondo de la habitación, sin menús ni controles UI, con ciclo autónomo misterioso y Web Audio API:*

```markdown
### Componente: `HabitacionParedJoyce`
**Ruta:** `src/features/habitaciones/ui/atoms/habitacion-pared-joyce.tsx`
**Integrado en:** `src/features/habitaciones/ui/atoms/habitacion-cozy-background.tsx` (capa `z-0` en `asignar-huesped-page.tsx`)

#### 1. Especificaciones de Decoración de Fondo:
1. **Integración Natural en la Pared (Sin Marco ni Caja Oscura):**
   - Sin bordes duros, sin esquinas artificiales ni tarjeta oscura rectangular (`bg-transparent`), fundiéndose de manera 100% natural con la superficie y color de la pared de la habitación.
   - Las 26 letras aparecen pintadas directamente sobre el yeso de la pared con trazos toscos de pintura negra.
   - Cable verde oscuro y negro festoneado sujeto con grapas metálicas rústicas directamente en la pared.
   - Al iluminarse cada bombilla, proyecta un halo radial de luz directamente sobre la pared detrás de ella.
2. **Bombillas Incandescentes C9 Multicolor:**
   - Paleta de 8 tonos retro (ámbar, azul, rojo, verde esmeralda, violeta, naranja, cian y rosa).
   - Halo volumétrico de brillo con `boxShadow: 0 0 22px 7px ${glow}, 0 0 42px 14px ${glow}` y filamento visible.
3. **Comportamiento Autónomo "Upside Down" (Sin Menús ni Formularios):**
   - Transmisión autónoma inicial a los 3.5s (deletrea `"RUN"` letra por letra con pausas irregulares de 600ms a 1300ms).
   - Ciclo ambiental recurrente cada 22–34 segundos con selección aleatoria de palabras canónicas (`RUN`, `RIGHT HERE`, `WILL`, `HELP`).
   - Sin campos de entrada, sin botones de transmisión ni historial visible: estética 100% inmersiva como en la serie.
4. **Interacción Táctil Directa:**
   - Cada bombilla cuenta con `pointer-events-auto cursor-pointer`. Si el usuario hace clic sobre cualquier bombilla de la pared, esta se enciende de inmediato con destello, parpadeo y clic sonoro.
5. **Síntesis Procedural de Audio (Web Audio API):**
   - Generación en tiempo real de pulso de filamento incandescente mediante oscilador triangular (140Hz -> 32Hz en 80ms) sin depender de archivos de audio externos.
6. **Ubicación Arquitectónica (Centro de la Pared, Arribita de la Cama):**
   - Centrado horizontal: `left-1/2 -translate-x-1/2`.
   - Altura sobre el suelo: `bottom-[16.5rem] sm:bottom-[17rem] lg:bottom-[17.5rem]` (situado 24px–36px sobre el cabecero de la cama `h-60`, sin solaparse ni montarse sobre el colchón o cabecera).
   - Dimensiones proporcionales: `w-[92%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl origin-bottom`.
```

---

### Versión C — Versión Declarativa (XML)
> *Para especificaciones de agentes y automatizaciones:*

```xml
<component_spec name="AlphabetWall">
  <inspiration>Stranger Things - Joyce Byers Christmas Lights Wall</inspiration>
  <stack>React, TailwindCSS v4, Motion (framer-motion), Web Audio API</stack>
  
  <layout>
    <wall_rows>
      <row id="1" letters="A,B,C,D,E,F,G,H" count="8" />
      <row id="2" letters="I,J,K,L,M,N,O,P,Q" count="9" />
      <row id="3" letters="R,S,T,U,V,W,X,Y,Z" count="9" />
    </wall_rows>
    <wire_effect>continuous dark scalloped garland wire with sockets</wire_effect>
    <letter_style>hand-painted brush strokes, slight organic angles</letter_style>
  </layout>

  <lighting_engine>
    <palette count="8">amber, blue, red, emerald, violet, orange, cyan, pink</palette>
    <incandescent_glow>boxShadow 0 0 20px 6px + smooth intensity ramp (0.4s easeOut)</incandescent_glow>
    <interference_flicker probability="0.35">opacity keyframes [1, 0.2, 1, 0.4, 1]</interference_flicker>
  </lighting_engine>

  <audio_engine>
    <driver>Web Audio API AudioContext</driver>
    <waveform>triangle oscillator transient pulse (filament click & hum)</waveform>
  </audio_engine>

  <accessibility>
    <reduced_motion>bypasses keyframe flickers if user prefers reduced motion</reduced_motion>
    <screen_reader>aria-live="polite" live region announcing lit letters and incoming words</screen_reader>
  </accessibility>
</component_spec>
```

---

## 🎓 Lecciones para tus Próximos Prompts

**Lo que hiciste con excelencia:**
- Especificaste tanto la **tecnología de renderizado** (`boxShadow` animado para emular luminosidad real) como la **psicología temporal** (pausas irregulares no mecánicas entre 600ms y 1400ms), algo que el 95% de los desarrolladores omite.
- Diseñaste de inicio con **accesibilidad universal** (`prefers-reduced-motion` y `aria-live="polite"`).

**3 hábitos para potenciar tus futuros prompts:**
1. **Especificar fuentes de audio autónomas (Web Audio API):**
   → *Regla de oro:* En demos interactivas de frontend, no dejes sonidos a merced de archivos estáticos que puedan fallar por rutas relativas o CORS; pide síntesis procedural con `AudioContext`.
2. **Respetar la disposición física canónica de la referencia cultural:**
   → *Regla de oro:* En referencias icónicas de cine/TV, verifica la cantidad de hileras reales (3 filas en *Stranger Things* en vez de una cuadrícula uniforme).
3. **Diseñar el mecanismo de aborto para secuencias asíncronas:**
   → *Regla de oro:* Si un componente ejecuta bucles `for await` o `setTimeout`, exige siempre un `AbortController` para cancelar la secuencia cuando el usuario pulse otro botón o desmonte el componente.
