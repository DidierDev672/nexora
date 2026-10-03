import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';

export interface HabitacionParedJoyceProps {
  className?: string;
  autoPlay?: boolean;
  initialWord?: string;
}

interface BulbConfig {
  letter: string;
  color: string;
  glow: string;
  rotation: string;
}

const BULB_PALETTE = [
  { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.9)' }, // Ámbar / Oro
  { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.9)' }, // Azul
  { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.9)' }, // Rojo
  { color: '#10b981', glow: 'rgba(16, 185, 129, 0.9)' }, // Verde esmeralda
  { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.9)' }, // Violeta
  { color: '#f97316', glow: 'rgba(249, 115, 22, 0.9)' }, // Naranja
  { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.9)' }, // Cian
  { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.9)' }, // Rosa neón
];

// Rotaciones orgánicas de las letras pintadas a mano alzada por Joyce
const ROTATIONS = [
  '-rotate-3',
  'rotate-3',
  '-rotate-2',
  'rotate-4',
  '-rotate-4',
  'rotate-2',
  '-rotate-3',
  'rotate-1',
  '-rotate-2',
  'rotate-3',
  '-rotate-4',
  'rotate-2',
];

// 3 filas icónicas de Stranger Things: A-H (8), I-Q (9), R-Z (9)
const ALPHABET_ROWS: BulbConfig[][] = [
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
];

const MYSTERY_WORDS = ['RUN', 'RIGHT HERE', 'WILL', 'HELP', 'HE HERE'];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Síntesis de sonido de bombilla eléctrica / chispa de filamento
 * mediante Web Audio API autónomo (sin requerir archivos externos).
 */
function playLightSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {
    // Si el navegador bloquea audio sin interacción de usuario, continúa silenciosamente
  }
}

/**
 * Tablero de la pared de luces con el alfabeto de Joyce Byers (Stranger Things).
 * Diseñado como elemento ambiental del fondo de la habitación:
 * - Papel tapiz retro vintage de los años 80 con textura rayada sutil
 * - 3 hileras con cable de luces navideñas retorcido festoneado
 * - Bombillas incandescentes C9 con halo volumétrico y filamento
 * - Letras pintadas a mano con pintura negra tosca e irregular
 * - Ciclo ambiental misterioso autónomo ("RUN", "RIGHT HERE", etc.) sin menús ni controles UI
 * - Interacción táctil directa: haz clic en cualquier bombilla para encenderla y escuchar el clic
 */
// Luces navideñas parpadeantes que enmarcan los lados del cuadrado del tablero
const CHRISTMAS_FAIRY_LIGHTS_LEFT = [
  { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.95)', duration: 1.5, delay: 0.1 },  // Rojo
  { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.95)', duration: 2.1, delay: 0.6 }, // Ámbar
  { color: '#10b981', glow: 'rgba(16, 185, 129, 0.95)', duration: 1.7, delay: 0.3 }, // Verde
  { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.95)', duration: 2.3, delay: 0.8 }, // Azul
  { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.95)', duration: 1.8, delay: 0.4 }, // Rosa
];

const CHRISTMAS_FAIRY_LIGHTS_RIGHT = [
  { color: '#10b981', glow: 'rgba(16, 185, 129, 0.95)', duration: 1.8, delay: 0.5 }, // Verde
  { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.95)', duration: 1.4, delay: 0.2 }, // Rosa
  { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.95)', duration: 2.2, delay: 0.7 }, // Ámbar
  { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.95)', duration: 1.6, delay: 0.3 },  // Rojo
  { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.95)', duration: 2.0, delay: 0.9 },  // Cian
];

const CHRISTMAS_FAIRY_LIGHTS_TOP = [
  { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.95)', duration: 1.9, delay: 0.2 }, // Oro
  { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.95)', duration: 1.6, delay: 0.5 },  // Rojo
  { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.95)', duration: 2.2, delay: 0.1 }, // Azul
  { color: '#10b981', glow: 'rgba(16, 185, 129, 0.95)', duration: 1.7, delay: 0.8 }, // Verde
  { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.95)', duration: 2.0, delay: 0.4 }, // Rosa
  { color: '#f97316', glow: 'rgba(249, 115, 22, 0.95)', duration: 1.5, delay: 0.7 }, // Naranja
  { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.95)', duration: 2.3, delay: 0.3 }, // Cian
];

export function HabitacionParedJoyce({
  className = '',
  autoPlay = true,
  initialWord = 'RUN',
}: HabitacionParedJoyceProps) {
  const [litLetters, setLitLetters] = useState<Record<string, boolean>>({});
  const [flickeringLetters, setFlickeringLetters] = useState<
    Record<string, boolean>
  >({});
  const isPlayingRef = useRef(false);
  const isMountedRef = useRef(true);

  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }, []);

  // Encender una letra individual con desvanecimiento
  const lightLetter = useCallback(
    async (letter: string, withFlicker = false) => {
      const char = letter.toUpperCase();
      if (!char.match(/[A-Z]/)) return;

      playLightSound();

      if (withFlicker && !prefersReducedMotion.current) {
        setFlickeringLetters((prev) => ({ ...prev, [char]: true }));
        await wait(220);
        if (!isMountedRef.current) return;
        setFlickeringLetters((prev) => ({ ...prev, [char]: false }));
      }

      setLitLetters((prev) => ({ ...prev, [char]: true }));
      await wait(750);
      if (!isMountedRef.current) return;
      setLitLetters((prev) => ({ ...prev, [char]: false }));
    },
    []
  );

  // Deletreo autónomo con pausas irregulares y tensión de la escena
  const spellSequence = useCallback(
    async (word: string) => {
      if (isPlayingRef.current) return;
      isPlayingRef.current = true;

      const cleanWord = word.trim().toUpperCase();

      for (let i = 0; i < cleanWord.length; i++) {
        if (!isMountedRef.current) break;
        const char = cleanWord[i];

        if (char === ' ') {
          await wait(randomBetween(800, 1400));
          continue;
        }

        if (char.match(/[A-Z]/)) {
          // Pausa irregular antes de encender la bombilla
          await wait(randomBetween(600, 1300));
          if (!isMountedRef.current) break;

          const shouldFlicker = Math.random() < 0.4;
          await lightLetter(char, shouldFlicker);
        }
      }

      isPlayingRef.current = false;
    },
    [lightLetter]
  );

  // Ciclo ambiental autónomo: deletrea palabras periódicamente como en la serie
  useEffect(() => {
    isMountedRef.current = true;
    if (!autoPlay) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const runAmbientCycle = async () => {
      // Primera transmisión inicial tras 3.5 segundos de carga
      await wait(3500);
      if (!isMountedRef.current) return;

      await spellSequence(initialWord);

      // Bucle recurrente misterioso cada 22–34 segundos
      const scheduleNext = () => {
        const nextDelay = randomBetween(22000, 34000);
        timeoutId = setTimeout(async () => {
          if (!isMountedRef.current) return;
          const randomWord =
            MYSTERY_WORDS[Math.floor(Math.random() * MYSTERY_WORDS.length)];
          await spellSequence(randomWord);
          if (isMountedRef.current) scheduleNext();
        }, nextDelay);
      };

      scheduleNext();
    };

    runAmbientCycle();

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [autoPlay, initialWord, spellSequence]);

  return (
    <div className={`relative w-full select-none ${className}`}>
      {/* 1. Resplandor ambiental difuminado detrás del tablero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-3xl bg-amber-500/10 blur-2xl"
      />

      {/* ========================================================= */}
      {/* 2. CUADRADO DEL TABLERO (Panel rústico vintage enmarcado) */}
      {/* ========================================================= */}
      <div className="relative rounded-2xl border-2 border-stone-800/90 bg-linear-to-b from-[#221c16] via-[#1a1612] to-[#120f0c] p-2.5 sm:p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.6)] ring-1 ring-white/10 overflow-visible">
        {/* Textura sutil retro sobre el fondo del cuadrado */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-15"
          style={{
            backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* ========================================================= */}
        {/* 3. LUCES NAVIDEÑAS PARPADEANTES A LOS LADOS DEL CUADRADO */}
        {/* ========================================================= */}
        {/* Guirnalda lateral izquierda de luces navideñas parpadeantes */}
        <div className="pointer-events-none absolute -left-2 sm:-left-2.5 inset-y-2 flex flex-col justify-around items-center z-20">
          {CHRISTMAS_FAIRY_LIGHTS_LEFT.map((light, i) => (
            <div key={`left-fairy-${i}`} className="relative flex items-center justify-center">
              <div className="absolute top-1/2 -left-1 w-1.5 h-0.5 bg-stone-900 border-t border-stone-800" />
              <motion.div
                animate={{
                  opacity: [0.3, 1, 0.45, 0.95, 0.3],
                  scale: [0.85, 1.25, 0.9, 1.15, 0.85],
                  boxShadow: [
                    `0 0 2px 1px ${light.glow}`,
                    `0 0 9px 3px ${light.glow}, 0 0 16px 5px ${light.glow}`,
                    `0 0 3px 1px ${light.glow}`,
                    `0 0 11px 3px ${light.glow}`,
                    `0 0 2px 1px ${light.glow}`,
                  ],
                }}
                transition={{
                  duration: light.duration,
                  delay: light.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="size-1.5 sm:size-2 rounded-full border border-black/60 drop-shadow-sm"
                style={{ backgroundColor: light.color }}
              >
                <div className="absolute inset-0.5 rounded-full bg-white/70 blur-[0.2px]" />
              </motion.div>
            </div>
          ))}
        </div>

        {/* Guirnalda lateral derecha de luces navideñas parpadeantes */}
        <div className="pointer-events-none absolute -right-2 sm:-right-2.5 inset-y-2 flex flex-col justify-around items-center z-20">
          {CHRISTMAS_FAIRY_LIGHTS_RIGHT.map((light, i) => (
            <div key={`right-fairy-${i}`} className="relative flex items-center justify-center">
              <div className="absolute top-1/2 -right-1 w-1.5 h-0.5 bg-stone-900 border-t border-stone-800" />
              <motion.div
                animate={{
                  opacity: [0.45, 0.95, 0.3, 1, 0.45],
                  scale: [0.9, 1.15, 0.85, 1.25, 0.9],
                  boxShadow: [
                    `0 0 3px 1px ${light.glow}`,
                    `0 0 11px 3px ${light.glow}`,
                    `0 0 2px 1px ${light.glow}`,
                    `0 0 9px 3px ${light.glow}, 0 0 16px 5px ${light.glow}`,
                    `0 0 3px 1px ${light.glow}`,
                  ],
                }}
                transition={{
                  duration: light.duration,
                  delay: light.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="size-1.5 sm:size-2 rounded-full border border-black/60 drop-shadow-sm"
                style={{ backgroundColor: light.color }}
              >
                <div className="absolute inset-0.5 rounded-full bg-white/70 blur-[0.2px]" />
              </motion.div>
            </div>
          ))}
        </div>

        {/* Guirnalda superior de luces navideñas parpadeantes */}
        <div className="pointer-events-none absolute -top-2 sm:-top-2.5 inset-x-3 flex justify-around items-center z-20">
          {CHRISTMAS_FAIRY_LIGHTS_TOP.map((light, i) => (
            <div key={`top-fairy-${i}`} className="relative flex flex-col items-center">
              <div className="absolute -top-1 w-0.5 h-1.5 bg-stone-900" />
              <motion.div
                animate={{
                  opacity: [0.35, 1, 0.4, 0.95, 0.35],
                  scale: [0.85, 1.2, 0.9, 1.15, 0.85],
                  boxShadow: [
                    `0 0 2px 1px ${light.glow}`,
                    `0 0 9px 3px ${light.glow}`,
                    `0 0 3px 1px ${light.glow}`,
                    `0 0 11px 3px ${light.glow}`,
                    `0 0 2px 1px ${light.glow}`,
                  ],
                }}
                transition={{
                  duration: light.duration,
                  delay: light.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="size-1.5 sm:size-2 rounded-full border border-black/60 drop-shadow-sm"
                style={{ backgroundColor: light.color }}
              >
                <div className="absolute inset-0.5 rounded-full bg-white/70 blur-[0.2px]" />
              </motion.div>
            </div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 4. 3 FILAS DEL ALFABETO DE JOYCE BYERS (EN PERSPECTIVA LEJANA) */}
        {/* ========================================================= */}
        <div className="relative z-10 flex flex-col gap-2 opacity-90 transition-opacity hover:opacity-100 sm:gap-2.5">
          {ALPHABET_ROWS.map((row, rowIdx) => (
            <div key={`row-${rowIdx}`} className="relative">
              {/* Grapas de alambre rústicas fijadas directamente a la pared */}
              <div className="pointer-events-none absolute -top-0.5 left-1.5 size-1 rounded-full bg-stone-700/80 shadow-xs" />
              <div className="pointer-events-none absolute -top-0.5 right-1.5 size-1 rounded-full bg-stone-700/80 shadow-xs" />
              <div className="pointer-events-none absolute top-0 left-1/2 size-1 -translate-x-1/2 rounded-full bg-stone-700/80 shadow-xs" />

              {/* Cable negro festoneado de luces navideñas que cruza la pared */}
              <div className="pointer-events-none absolute inset-x-1 top-1 h-1.5 opacity-80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                <svg
                  className="h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 10"
                >
                  <path
                    d="M 0 3 Q 12 9, 25 3 Q 37 9, 50 3 Q 62 9, 75 3 Q 87 9, 100 3"
                    fill="none"
                    stroke="#1c1917"
                    strokeWidth="1.1"
                  />
                  {/* Doble torsión de hilo eléctrico verde oscuro */}
                  <path
                    d="M 0 4 Q 12 7, 25 4 Q 37 7, 50 4 Q 62 7, 75 4 Q 87 7, 100 4"
                    fill="none"
                    stroke="#064e3b"
                    strokeWidth="0.8"
                    strokeDasharray="2,3"
                  />
                </svg>
              </div>

              {/* Fila de letras y bombillas compactas en la lejanía */}
              <div className="relative flex items-center justify-between px-1">
                {row.map((bulb) => {
                  const isLit = Boolean(litLetters[bulb.letter]);
                  const isFlickering = Boolean(flickeringLetters[bulb.letter]);

                  return (
                    <button
                      key={bulb.letter}
                      type="button"
                      onClick={() => lightLetter(bulb.letter, true)}
                      className="group pointer-events-auto relative flex cursor-pointer flex-col items-center justify-start transition-transform focus:outline-hidden active:scale-95"
                      title={`Letra ${bulb.letter}`}
                    >
                      {/* Baño de luz tenue proyectado sobre la pared en la distancia */}
                      {isLit && (
                        <div
                          className="pointer-events-none absolute -top-1 -z-1 size-7 rounded-full opacity-60 blur-xs"
                          style={{ backgroundColor: bulb.glow }}
                        />
                      )}

                      {/* Portalámparas negro pequeño */}
                      <div className="z-10 h-0.5 w-1 rounded-t-xs border border-stone-800 bg-stone-900 shadow-xs sm:h-1 sm:w-1.5" />

                      {/* BOMBILLA INCANDESCENTE C9 COMPACTA (En la lejanía) */}
                      <motion.div
                        animate={{
                          backgroundColor: isLit ? bulb.color : '#1c1917',
                          boxShadow: isLit
                            ? `0 0 10px 3px ${bulb.glow}, 0 0 20px 6px ${bulb.glow}`
                            : `0 0 2px 0.5px ${bulb.glow.replace('0.9', '0.2')}`,
                          opacity: isFlickering ? [1, 0.2, 1, 0.4, 1] : 1,
                          scale: isLit ? 1.2 : 1,
                        }}
                        transition={{
                          duration: isFlickering ? 0.45 : 0.35,
                          ease: 'easeOut',
                          times: isFlickering ? [0, 0.2, 0.4, 0.6, 1] : undefined,
                        }}
                        className="relative z-10 size-1.5 rounded-full border border-black/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] sm:size-2"
                      >
                        {/* Reflejo del cristal y filamento */}
                        <div className="absolute inset-x-0.5 top-0.5 h-0.5 rounded-full bg-white/60 blur-[0.2px]" />
                      </motion.div>

                      {/* CARÁCTER PINTADO EN LA PARED EN PERSPECTIVA LEJANA */}
                      <div className="mt-0.5 flex items-center justify-center">
                        <span
                          className={`font-serif text-[10px] font-bold transition-colors duration-300 select-none sm:text-xs md:text-sm ${bulb.rotation} ${
                            isLit
                              ? 'text-amber-100 drop-shadow-[0_0_5px_rgba(251,191,36,0.95)]'
                              : 'text-stone-800/80 group-hover:text-amber-200 dark:text-stone-300/75'
                          }`}
                          style={{
                            textShadow: isLit
                              ? `0 0 8px ${bulb.glow}`
                              : '0 1px 1px rgba(0,0,0,0.4)',
                          }}
                        >
                          {bulb.letter}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
