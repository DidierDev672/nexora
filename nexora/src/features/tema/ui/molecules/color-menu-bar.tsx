import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { api } from '../../../../lib/api'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import { Button } from '../atoms/button'

export interface ApiPaletteColor {
  hex: string
  name?: string
}

export interface ApiPaletteResponseItem {
  id?: string
  name?: string
  colors: ApiPaletteColor[]
  is_defined?: boolean
  created_at?: string
}

export interface ColorMenuBarProps {
  /** Callback al seleccionar un color de la barra */
  onSelectColor?: (hex: string) => void
  /** Color actualmente seleccionado en formato HEX */
  selectedColor?: string | null
  /** Acción para aplicar el tema personalizado */
  onApplyTheme?: () => void
  /** Indica si el tema actual ya está aplicado */
  isApplied?: boolean
  /** Acción para restablecer el tema predeterminado */
  onResetDefaultTheme?: () => void
}

const PSYCHOLOGICAL_400_ERROR =
  'Tranqui, no es nada que hayas hecho mal: el catálogo de colores tuvo un pequeño inconveniente al procesar la solicitud y no pudimos cargar las muestras esta vez. Nada se perdió; respira hondo, comprueba tu conexión y vuelve a intentarlo con calma; tus datos están a salvo.'

const PSYCHOLOGICAL_GENERIC_ERROR =
  'Tuvimos una pequeña pausa al intentar traer los colores disponibles. No te preocupes: tu espacio sigue seguro y listo para ti. Prueba nuevamente en un instante.'

interface ColorCardItemProps {
  hex: string
  index: number
  mouseX: MotionValue<number>
  isSelected: boolean
  isCopied: boolean
  onCopy: (hex: string) => void
}

/**
 * Card individual con efecto Dock Magnification (Framer Motion)
 * 1. useMotionValue: Almacena la coordenada X del cursor sin re-renders en React.
 * 2. useTransform: Mapea la distancia (<150px) escalando de 40px hasta un máximo de 80px.
 * 3. useSpring: Aplica inercia y rebote elástico suave para evitar cortes abruptos.
 */
function ColorCardItem({
  hex,
  index,
  mouseX,
  isSelected,
  isCopied,
  onCopy,
}: ColorCardItemProps) {
  const ref = useRef<HTMLButtonElement>(null)

  // 2. useTransform: Distancia desde el centro de la card hacia la coordenada X del mouse
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  // Mapea la distancia: si está a menos de 150px, escala desde 40px hasta 80px
  const sizeSync = useTransform(distance, [-150, 0, 150], [40, 80, 40])

  // 3. useSpring: Física de rebote inercial suave
  const size = useSpring(sizeSync, { mass: 0.1, stiffness: 150, damping: 12 })

  return (
    <motion.button
      ref={ref}
      type="button"
      role="option"
      aria-selected={isSelected}
      aria-label={`Color ${hex}`}
      title={hex}
      style={{
        width: size,
        height: size,
        borderRadius: '6px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: 'easeOut',
        delay: Math.min(index * 0.02, 0.25),
      }}
      whileTap={{ scale: 0.94 }}
      onClick={() => onCopy(hex)}
      className={`relative flex shrink-0 items-center justify-center border bg-panel p-1 shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isSelected
          ? 'border-primary ring-2 ring-primary/50 shadow-md'
          : 'border-line hover:border-primary/50'
      }`}
    >
      {/* Tarjeta de color con border-radius 6px */}
      <span
        style={{
          backgroundColor: hex,
          borderRadius: '6px',
        }}
        className="relative block size-full shadow-inner ring-1 ring-black/10 dark:ring-white/10"
        aria-hidden="true"
      >
        {isCopied && (
          <span
            style={{ borderRadius: '6px' }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white backdrop-blur-xs"
          >
            ✓
          </span>
        )}
      </span>
    </motion.button>
  )
}

export function ColorMenuBar({
  onSelectColor,
  selectedColor,
  onApplyTheme,
  isApplied = false,
  onResetDefaultTheme,
}: ColorMenuBarProps) {
  const [colors, setColors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 1. useMotionValue: Almacena la coordenada X del cursor sin re-renders en React
  const mouseX = useMotionValue(Infinity)

  const fetchColors = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await api.get<ApiPaletteResponseItem[]>('/palette')

      if (response.status === 200 && Array.isArray(response.data)) {
        // Del array de la respuesta, extraemos únicamente el item `hex` de cada color
        const hexList: string[] = []
        const seen = new Set<string>()

        for (const palette of response.data) {
          if (Array.isArray(palette.colors)) {
            for (const color of palette.colors) {
              if (color && typeof color.hex === 'string') {
                const normalized = color.hex.trim().toUpperCase()
                if (normalized && !seen.has(normalized)) {
                  seen.add(normalized)
                  hexList.push(normalized)
                }
              }
            }
          }
        }

        setColors(hexList)
      } else {
        setErrorMessage(PSYCHOLOGICAL_GENERIC_ERROR)
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setErrorMessage(PSYCHOLOGICAL_400_ERROR)
      } else {
        setErrorMessage(PSYCHOLOGICAL_GENERIC_ERROR)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchColors()
  }, [fetchColors])

  // Desplazamiento horizontal al hacer scroll con la rueda del ratón
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY !== 0 && event.deltaX === 0) {
        event.preventDefault()
        container.scrollLeft += event.deltaY
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [colors])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -220 : 220
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const handleCopy = (hex: string) => {
    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard.writeText(hex)
    }
    setCopiedHex(hex)
    onSelectColor?.(hex)
    setTimeout(() => {
      setCopiedHex((curr) => (curr === hex ? null : curr))
    }, 2000)
  }

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      aria-label="Barra de menú de colores"
      className="space-y-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">Menú de colores</h2>
          <p className="text-xs text-ink-muted">
            Pasa el cursor para magnificar los colores y usa la rueda del ratón para desplazarte.
          </p>
        </div>

        {colors.length > 0 && !isLoading && (
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {colors.length} {colors.length === 1 ? 'color disponible' : 'colores disponibles'}
            </span>

            {onApplyTheme && (
              <Button
                type="button"
                variant={isApplied ? 'secondary' : 'primary'}
                onClick={onApplyTheme}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold shadow-xs transition-all active:scale-95"
                title="Aplicar el tema personalizado a toda la aplicación"
              >
                {isApplied ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Tema aplicado</span>
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5"
                      aria-hidden="true"
                    >
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
                      <circle cx="7.5" cy="11" r="0.5" fill="currentColor" />
                      <circle cx="11" cy="7.5" r="0.5" fill="currentColor" />
                      <circle cx="16.5" cy="9.5" r="0.5" fill="currentColor" />
                    </svg>
                    <span>Aplicar tema</span>
                  </>
                )}
              </Button>
            )}

            {onResetDefaultTheme && (
              <Button
                type="button"
                variant="secondary"
                onClick={onResetDefaultTheme}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold shadow-xs transition-all active:scale-95 text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
                title="Restablecer el tema predeterminado de la aplicación"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5 text-ink-muted"
                  aria-hidden="true"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span>Restablecer tema</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Contenedor tipo barra / menú dock */}
      <div className="relative rounded-2xl border border-line bg-panel p-4 shadow-sm">
        {/* Estado de carga */}
        {isLoading && (
          <div className="flex items-center gap-3 overflow-hidden py-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                style={{ borderRadius: '6px' }}
                className="size-10 shrink-0 animate-pulse bg-black/5 dark:bg-white/5"
              />
            ))}
          </div>
        )}

        {/* Estado de error con copywriting psicológico */}
        <AnimatePresence>
          {!isLoading && errorMessage && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              role="alert"
              className="flex flex-col items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink">
                  No pudimos conectar con los colores
                </p>
                <p className="text-xs leading-relaxed text-ink-muted">
                  {errorMessage}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={fetchColors}
                className="shrink-0 text-xs"
              >
                Reintentar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de cards de color con efecto Dock magnification */}
        {!isLoading && !errorMessage && colors.length > 0 && (
          <div className="group/bar relative">
            {/* Botón flecha izquierda */}
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Desplazar colores hacia la izquierda"
              className="absolute -left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-line bg-panel/95 p-1.5 text-ink-muted shadow-md backdrop-blur-xs transition hover:bg-panel hover:text-ink focus-visible:ring-2 focus-visible:ring-primary opacity-0 group-hover/bar:opacity-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* Contenedor dock con escucha de coordenadas de mouse */}
            <div
              ref={scrollContainerRef}
              onMouseMove={(e) => mouseX.set(e.clientX)}
              onMouseLeave={() => mouseX.set(Infinity)}
              className="flex min-h-[96px] items-end gap-3 overflow-x-auto py-3 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-line"
              role="listbox"
              aria-label="Colores disponibles con magnificación dock"
            >
              {colors.map((hex, index) => (
                <ColorCardItem
                  key={hex}
                  hex={hex}
                  index={index}
                  mouseX={mouseX}
                  isSelected={selectedColor?.toUpperCase() === hex}
                  isCopied={copiedHex === hex}
                  onCopy={handleCopy}
                />
              ))}
            </div>

            {/* Botón flecha derecha */}
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Desplazar colores hacia la derecha"
              className="absolute -right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-line bg-panel/95 p-1.5 text-ink-muted shadow-md backdrop-blur-xs transition hover:bg-panel hover:text-ink focus-visible:ring-2 focus-visible:ring-primary opacity-0 group-hover/bar:opacity-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        )}

        {/* Estado vacío */}
        {!isLoading && !errorMessage && colors.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-ink">Aún no hay colores en el catálogo</p>
            <p className="mt-1 text-xs text-ink-muted">
              Cuando el servidor publique nuevas muestras aparecerán automáticamente en esta barra.
            </p>
          </div>
        )}
      </div>
    </motion.section>
  )
}
