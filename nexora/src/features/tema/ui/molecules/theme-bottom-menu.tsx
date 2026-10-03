import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'

export type ThemeElementKey =
  | 'titulo'
  | 'subtitulo'
  | 'parrafos'
  | 'navbar'
  | 'sidebar'
  | 'card'
  | 'pildoras'

export interface ThemeElementCardItem {
  id: ThemeElementKey
  label: string
  description: string
  icon: (props: { className?: string }) => React.ReactNode
}

export const THEME_BOTTOM_ITEMS: ThemeElementCardItem[] = [
  {
    id: 'titulo',
    label: 'Título',
    description: 'Encabezados principales',
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    id: 'subtitulo',
    label: 'Sub título',
    description: 'Bajadas y subtítulos',
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M4 6h16M4 12h10M4 18h6" />
      </svg>
    ),
  },
  {
    id: 'parrafos',
    label: 'Párrafos',
    description: 'Cuerpo de texto',
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M21 6H3M21 10H3M21 14H3M21 18H7" />
      </svg>
    ),
  },
  {
    id: 'navbar',
    label: 'Navbar',
    description: 'Barra superior de navegación',
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <line x1="2" y1="9" x2="22" y2="9" />
      </svg>
    ),
  },
  {
    id: 'sidebar',
    label: 'Sidebar',
    description: 'Menú lateral de la app',
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <line x1="8" y1="4" x2="8" y2="20" />
      </svg>
    ),
  },
  {
    id: 'card',
    label: 'Card',
    description: 'Paneles y contenedores',
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect width="18" height="18" x="3" y="3" rx="3" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    id: 'pildoras',
    label: 'Píldoras',
    description: 'Badges, chips y tags',
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect width="18" height="10" x="3" y="7" rx="5" />
        <line x1="12" y1="7" x2="12" y2="17" />
      </svg>
    ),
  },
]

export interface ThemeBottomMenuProps {
  activeElement: ThemeElementKey
  onSelectElement: (key: ThemeElementKey) => void
  elementColors?: Partial<Record<ThemeElementKey, string>>
}

export function ThemeBottomMenu({
  activeElement,
  onSelectElement,
  elementColors = {},
}: ThemeBottomMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Desplazamiento horizontal con rueda del ratón
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <nav
      aria-label="Menú inferior de elementos del tema"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/95 py-3 shadow-2xl backdrop-blur-md"
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-ink">
              Elementos del tema
            </span>
          </div>
          <span className="text-[11px] text-ink-muted hidden sm:inline-block">
            Elige un elemento para asignarle un color desde el menú superior
          </span>
        </div>

        {/* Barra de cards */}
        <div
          ref={containerRef}
          className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-line"
          role="tablist"
        >
          {THEME_BOTTOM_ITEMS.map((item, index) => {
            const isActive = activeElement === item.id
            const assignedColor = elementColors[item.id]

            return (
              <motion.button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: Math.min(index * 0.04, 0.25),
                }}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectElement(item.id)}
                className={`group relative flex min-w-[124px] sm:min-w-[136px] flex-1 shrink-0 flex-col items-start rounded-xl border p-2.5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30'
                    : 'border-line bg-panel hover:border-primary/40 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {/* Cabecera de la card: Icono + swatch de color */}
                <div className="mb-1.5 flex w-full items-center justify-between">
                  <span
                    className={`rounded-lg p-1.5 transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-black/5 text-ink-muted group-hover:text-ink dark:bg-white/5'
                    }`}
                  >
                    {item.icon({ className: 'size-3.5' })}
                  </span>

                  {/* Indicador de color asignado */}
                  {assignedColor ? (
                    <span
                      style={{
                        backgroundColor: assignedColor,
                        borderRadius: '6px',
                      }}
                      title={`Color actual: ${assignedColor}`}
                      className="size-3.5 border border-black/15 shadow-xs ring-1 ring-black/10 dark:ring-white/10"
                    />
                  ) : (
                    <span
                      style={{ borderRadius: '6px' }}
                      className="size-3.5 border border-dashed border-line bg-transparent"
                      title="Sin color personalizado"
                    />
                  )}
                </div>

                {/* Título de la card */}
                <span
                  className={`text-xs font-bold leading-tight ${
                    isActive ? 'text-primary' : 'text-ink'
                  }`}
                >
                  {item.label}
                </span>

                {/* Subtítulo / Descripción */}
                <span className="truncate text-[10px] text-ink-muted">
                  {item.description}
                </span>

                {/* Badge activo */}
                {isActive && (
                  <span className="absolute -top-1.5 right-2 rounded-full bg-primary px-1.5 py-0.2 text-[9px] font-bold text-white shadow-xs">
                    Activo
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
