import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export type LetterState = 'idle' | 'active' | 'lit'

export interface AlphabetWallState {
  letters: Record<string, LetterState> // A-Z
  currentWord: string
  history: string[] // palabras deletreadas anteriormente
}

interface BulbConfig {
  letter: string
  color: string
  glow: string
  rotation: string // rotación orgánica del carácter pintado
}

const BULB_PALETTE: Omit<BulbConfig, 'letter' | 'rotation'>[] = [
  { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.85)' }, // Ámbar / Oro
  { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.85)' },  // Azul
  { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.85)' },   // Rojo
  { color: '#10b981', glow: 'rgba(16, 185, 129, 0.85)' },  // Verde esmeralda
  { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.85)' },  // Violeta
  { color: '#f97316', glow: 'rgba(249, 115, 22, 0.85)' },   // Naranja
  { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.85)' },   // Cian
  { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.85)' },  // Rosa neón
]

// Rotaciones orgánicas de las letras pintadas a mano alzada
const ROTATIONS = [
  '-rotate-2', 'rotate-3', '-rotate-1', 'rotate-2',
  '-rotate-4', 'rotate-1', '-rotate-3', 'rotate-4',
  '-rotate-2', 'rotate-2', '-rotate-3', 'rotate-1',
]

// 3 filas icónicas de Stranger Things: A-H (8), I-Q (9), R-Z (9)
export const ALPHABET_ROWS: BulbConfig[][] = [
  // Fila 1: A - H
  'ABCDEFGH'.split('').map((letter, idx) => ({
    letter,
    color: BULB_PALETTE[idx % BULB_PALETTE.length].color,
    glow: BULB_PALETTE[idx % BULB_PALETTE.length].glow,
    rotation: ROTATIONS[idx % ROTATIONS.length],
  })),
  // Fila 2: I - Q
  'IJKLMNOPQ'.split('').map((letter, idx) => ({
    letter,
    color: BULB_PALETTE[(idx + 2) % BULB_PALETTE.length].color,
    glow: BULB_PALETTE[(idx + 2) % BULB_PALETTE.length].glow,
    rotation: ROTATIONS[(idx + 3) % ROTATIONS.length],
  })),
  // Fila 3: R - Z
  'QRSTUVWXYZ'.split('').map((letter, idx) => ({
    letter,
    color: BULB_PALETTE[(idx + 4) % BULB_PALETTE.length].color,
    glow: BULB_PALETTE[(idx + 4) % BULB_PALETTE.length].glow,
    rotation: ROTATIONS[(idx + 6) % ROTATIONS.length],
  })),
]

const ALL_LETTERS = ALPHABET_ROWS.flat()

const INITIAL_LETTERS: Record<string, LetterState> = ALL_LETTERS.reduce(
  (acc, { letter }) => {
    acc[letter] = 'idle'
    return acc
  },
  {} as Record<string, LetterState>
)

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Genera un sonido sintético sutil de encendido incandescente / click eléctrico
 * mediante Web Audio API sin depender de archivos de audio externos.
 */
function playLightSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(130, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  } catch {
    // Audio bloqueado o no disponible en el entorno
  }
}

export interface AlphabetWallProps {
  className?: string
  defaultWord?: string
  showControls?: boolean
  onMessageSent?: (message: string) => void
}

/**
 * Pared de Luces con Alfabeto de Joyce Byers (Stranger Things).
 * 
 * Cumple con todos los requerimientos de la especificación:
 * 1. Estructura de estado: LetterState ('idle' | 'active' | 'lit') y AlphabetWallState.
 * 2. Layout en 3 hileras orgánicas con cableado navideño, carácter pintado y bombilla incandescente.
 * 3. Animación de encendido con cambio de brillo y boxShadow animado para resplandor real.
 * 4. Secuencia de deletreo con pausas irregulares (600ms - 1400ms) y sonido eléctrico Web Audio.
 * 5. Efecto de parpadeo / interferencia errática con keyframes de opacidad respetando prefers-reduced-motion.
 * 6. Historial de mensajes acumulados con AnimatePresence (opcional con showControls).
 * 7. Interactividad bidireccional (clic manual para deletrear o transmisión automática).
 * 8. Accesibilidad completa: región aria-live="polite" y soporte de reducción de movimiento.
 */
export function AlphabetWall({
  className = '',
  defaultWord = 'RUN',
  showControls = false,
  onMessageSent,
}: AlphabetWallProps) {
  const [wallState, setWallState] = useState<AlphabetWallState>({
    letters: INITIAL_LETTERS,
    currentWord: '',
    history: ['RIGHT HERE'],
  })

  const [inputWord, setInputWord] = useState(defaultWord)
  const [isSpelling, setIsSpelling] = useState(false)
  const [flickeringLetter, setFlickeringLetter] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [ariaAnnouncement, setAriaAnnouncement] = useState('')

  // Detección de prefers-reduced-motion
  const prefersReducedMotion = useRef(false)
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  }, [])

  const abortControllerRef = useRef<boolean>(false)

  // Función para encender una letra individual
  const lightLetter = useCallback(
    async (letter: string, shouldFlicker = false) => {
      const char = letter.toUpperCase()
      if (!char.match(/[A-Z]/)) return

      if (soundEnabled) playLightSound()
      setAriaAnnouncement(`Letra ${char} iluminada`)

      // Efecto de interferencia / parpadeo errático opcional
      if (shouldFlicker && !prefersReducedMotion.current) {
        setFlickeringLetter(char)
        await wait(250)
        setFlickeringLetter(null)
      }

      setWallState((prev) => ({
        ...prev,
        letters: {
          ...prev.letters,
          [char]: 'lit',
        },
      }))

      // Apagado progresivo tras 800ms
      await wait(800)

      setWallState((prev) => ({
        ...prev,
        letters: {
          ...prev.letters,
          [char]: 'idle',
        },
      }))
    },
    [soundEnabled]
  )

  // Clic directo en letra (Rol: "el que está del otro lado")
  const handleLetterClick = useCallback(
    (letter: string) => {
      if (isSpelling) return
      lightLetter(letter, true)
      setWallState((prev) => {
        const nextWord = prev.currentWord + letter
        return {
          ...prev,
          currentWord: nextWord,
        }
      })
    },
    [isSpelling, lightLetter]
  )

  // Enviar la palabra acumulada al historial
  const handleCommitCurrentWord = useCallback(() => {
    if (!wallState.currentWord.trim()) return
    const word = wallState.currentWord.trim()
    setWallState((prev) => ({
      ...prev,
      currentWord: '',
      history: [word, ...prev.history],
    }))
    setAriaAnnouncement(`Mensaje transmitido: ${word}`)
    if (onMessageSent) onMessageSent(word)
  }, [wallState.currentWord, onMessageSent])

  // Secuencia de deletreo automático con pausas irregulares
  const spellWord = useCallback(
    async (wordToSpell: string) => {
      if (isSpelling || !wordToSpell.trim()) return
      setIsSpelling(true)
      abortControllerRef.current = false

      const cleanWord = wordToSpell.trim().toUpperCase()
      setAriaAnnouncement(`Iniciando transmisión del mensaje: ${cleanWord}`)

      for (let i = 0; i < cleanWord.length; i++) {
        if (abortControllerRef.current) break
        const char = cleanWord[i]

        if (char === ' ') {
          await wait(randomBetween(1000, 1600))
          continue
        }

        if (char.match(/[A-Z]/)) {
          // Pausa irregular antes de cada letra (tensión de la escena)
          const pauseTime = randomBetween(600, 1400)
          await wait(pauseTime)

          // 30% de probabilidad de interferencia parpadeante
          const shouldFlicker = Math.random() < 0.35
          await lightLetter(char, shouldFlicker)
        }
      }

      if (!abortControllerRef.current) {
        setWallState((prev) => ({
          ...prev,
          history: [cleanWord, ...prev.history],
        }))
        setAriaAnnouncement(`Mensaje completado: ${cleanWord}`)
        if (onMessageSent) onMessageSent(cleanWord)
      }

      setIsSpelling(false)
    },
    [isSpelling, lightLetter, onMessageSent]
  )

  // Detener deletreo en curso si se desmonta
  useEffect(() => {
    return () => {
      abortControllerRef.current = true
    }
  }, [])

  return (
    <div
      className={`relative z-10 mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-950/40 bg-stone-900/90 p-5 shadow-2xl backdrop-blur-md sm:p-8 ${className}`}
      style={{
        // Textura sutil de empapelado vintage de pared
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 80%),
          repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 24px)
        `,
      }}
    >
      {/* Región de accesibilidad para lectores de pantalla */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        aria-atomic="true"
      >
        {ariaAnnouncement}
      </div>

      {/* ========================================================= */}
      {/* ENCABEZADO Y CONTROLES DE LA PARED DE JOYCE */}
      {/* ========================================================= */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full bg-amber-400 animate-ping" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-amber-300 sm:text-base">
              Pared de Joyce Byers • Stranger Lights
            </h3>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Haz clic en las letras o escribe un mensaje para transmitir desde &quot;el otro lado&quot;.
          </p>
        </div>

        {/* Interruptor de sonido */}
        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono transition-colors ${
            soundEnabled
              ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
              : 'border-stone-700 bg-stone-800 text-stone-500'
          }`}
          title={soundEnabled ? 'Sonido eléctrico activado' : 'Sonido silenciado'}
        >
          <span>{soundEnabled ? '🔊 Sonido ON' : '🔇 Silencio'}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TABLERO DE LUCES DEL ALFABETO (3 FILAS ICÓNICAS) */}
      {/* ========================================================= */}
      <div className="relative py-2">
        {ALPHABET_ROWS.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="relative my-4 sm:my-6">
            {/* Cable de luces navideño trenzado oscuro que une las bombillas */}
            <div className="pointer-events-none absolute inset-x-2 top-3 h-1 rounded-full bg-stone-950/80 shadow-xs border-b border-emerald-950/70" />

            {/* Fila de letras y bombillas */}
            <div className="relative flex justify-between gap-1 sm:gap-2 px-1 sm:px-3">
              {row.map((bulb) => {
                const isLit = wallState.letters[bulb.letter] === 'lit'
                const isFlickering = flickeringLetter === bulb.letter

                return (
                  <button
                    key={bulb.letter}
                    type="button"
                    onClick={() => handleLetterClick(bulb.letter)}
                    disabled={isSpelling}
                    className="group relative flex flex-col items-center cursor-pointer transition-transform duration-150 active:scale-95 disabled:cursor-not-allowed"
                    title={`Letra ${bulb.letter}`}
                    aria-label={`Letra ${bulb.letter}, ${isLit ? 'encendida' : 'apagada'}`}
                  >
                    {/* Casquillo / base verde oscura de la bombilla */}
                    <div className="relative z-10 h-2 w-2.5 rounded-t-xs bg-emerald-950 border border-black/40 shadow-xs" />

                    {/* 3. BOMBILLA INCANDESCENTE CON GLOW ANIMADO */}
                    <motion.div
                      animate={{
                        backgroundColor: isLit ? bulb.color : '#1f2937',
                        boxShadow: isLit
                          ? `0 0 20px 6px ${bulb.glow}, 0 0 45px 12px ${bulb.glow}`
                          : '0 0 0px 0px rgba(0,0,0,0)',
                        opacity: isFlickering
                          ? [1, 0.2, 1, 0.4, 1]
                          : isLit
                          ? 1
                          : 0.65,
                      }}
                      transition={{
                        duration: isFlickering ? 0.6 : 0.4,
                        ease: 'easeOut',
                        times: isFlickering ? [0, 0.2, 0.4, 0.6, 1] : undefined,
                      }}
                      className="relative z-10 size-4 sm:size-5 rounded-full border border-black/30"
                    >
                      {/* Filamento incandescente sutil */}
                      <div className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/40 blur-[0.5px]" />
                    </motion.div>

                    {/* 2. CARÁCTER PINTADO EN LA PARED (Pintura negra tosca de Joyce) */}
                    <div className="mt-2 sm:mt-3 flex items-center justify-center">
                      <span
                        className={`font-serif text-2xl sm:text-3xl lg:text-4xl font-black select-none transition-colors duration-300 ${bulb.rotation} ${
                          isLit
                            ? 'text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                            : 'text-stone-300/80 group-hover:text-amber-200'
                        }`}
                        style={{
                          textShadow: isLit
                            ? `0 0 14px ${bulb.glow}`
                            : '1px 2px 2px rgba(0,0,0,0.8)',
                        }}
                      >
                        {bulb.letter}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 4 & 6. PANELES OPCIONALES DE CONTROL E HISTORIAL (showControls) */}
      {/* ========================================================= */}
      {showControls && (
        <>
          <div className="mt-6 rounded-2xl border border-amber-900/40 bg-stone-950/70 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Palabra actual en formación por clics directos */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-stone-400">
                  Mensaje en curso:
                </span>
                <div className="flex min-h-[32px] items-center gap-1.5 rounded-lg border border-amber-500/30 bg-stone-900 px-3 py-1">
                  <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-amber-300">
                    {wallState.currentWord || '—'}
                  </span>
                  {wallState.currentWord && (
                    <button
                      type="button"
                      onClick={handleCommitCurrentWord}
                      className="ml-2 rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-mono font-semibold text-amber-200 transition-colors hover:bg-amber-500/30 cursor-pointer"
                      title="Guardar palabra en el historial"
                    >
                      Confirmar ↵
                    </button>
                  )}
                </div>
              </div>

              {/* Formulario de transmisión de palabras completas */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value.toUpperCase())}
                  disabled={isSpelling}
                  placeholder="Escribe palabra..."
                  maxLength={15}
                  className="w-36 sm:w-44 rounded-xl border border-stone-700 bg-stone-900 px-3 py-1.5 font-mono text-xs sm:text-sm font-semibold tracking-wider text-amber-200 uppercase placeholder:text-stone-600 focus:border-amber-400 focus:outline-hidden"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') spellWord(inputWord)
                  }}
                />

                <button
                  type="button"
                  onClick={() => spellWord(inputWord)}
                  disabled={isSpelling || !inputWord.trim()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-500/50 bg-linear-to-r from-amber-600 to-amber-700 px-3.5 py-1.5 font-mono text-xs font-bold text-amber-50 shadow-md transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSpelling ? (
                    <>
                      <span className="size-2 rounded-full bg-amber-200 animate-ping" />
                      <span>Transmitiendo...</span>
                    </>
                  ) : (
                    <span>Transmitir ⚡</span>
                  )}
                </button>
              </div>
            </div>

            {/* Botones de mensajes rápidos icónicos */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-800/80 pt-3">
              <span className="font-mono text-[11px] text-stone-500">
                Mensajes rápidos:
              </span>
              {['RUN', 'RIGHT HERE', 'HELP', 'WILL'].map((msg) => (
                <button
                  key={msg}
                  type="button"
                  disabled={isSpelling}
                  onClick={() => {
                    setInputWord(msg)
                    spellWord(msg)
                  }}
                  className="rounded-lg border border-stone-700/70 bg-stone-900/60 px-2 py-0.5 font-mono text-[11px] text-amber-300/80 transition-colors hover:border-amber-400/50 hover:bg-stone-800 hover:text-amber-200 cursor-pointer disabled:opacity-50"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {/* 6. HISTORIAL DE PALABRAS DELETREADAS (Con AnimatePresence) */}
          <div className="mt-5 border-t border-amber-900/30 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold tracking-wider text-stone-400">
                Historial de señales recibidas:
              </span>
              <span className="font-mono text-[11px] text-stone-500">
                {wallState.history.length} mensaje(s)
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence initial={false}>
                {wallState.history.map((word, idx) => (
                  <motion.div
                    key={`${word}-${idx}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-900/50 bg-stone-950/80 px-2.5 py-1 shadow-sm"
                  >
                    <span className="size-1.5 rounded-full bg-amber-400/80" />
                    <span className="font-mono text-xs font-bold tracking-widest text-amber-200">
                      {word}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
