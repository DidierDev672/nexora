export interface HabitacionVentanaProps {
  className?: string
  /**
   * Ruta o URL de la imagen del paisaje exterior visible a través de la ventana.
   * Por defecto utiliza la fotografía de paisaje alpino al atardecer generada para Nexora.
   */
  landscapeSrc?: string
  /**
   * Si es true, la ventana utiliza arco de medio punto (`rounded-t-full`).
   * Si es false, adopta un marco completamente rectangular.
   */
  arched?: boolean
}

/**
 * Componente atómico decorativo que simula una ventana de habitación con marco arquitectónico,
 * parteluces, reflejo especular sobre el vidrio y alféizar con relieve y sombra.
 *
 * Cumple con los requerimientos:
 * 1. Forma arqueada: `rounded-t-full` para estilo arco de medio punto elegante (configurable).
 * 2. Efecto de vidrio: Degradado `bg-linear-to-tr` con opacidades `white/10` - `white/25` para reflejo realista.
 * 3. Profundidad: Alféizar inferior (`absolute -bottom-4`) sobresaliendo de los lados con relieve y sombra proyectada.
 */
export function HabitacionVentana({
  className = '',
  landscapeSrc = '/images/landscape-cozy-window.jpg',
  arched = true,
}: HabitacionVentanaProps) {
  const shapeClass = arched ? 'rounded-t-full' : 'rounded-2xl'

  return (
    <div
      aria-hidden="true"
      className={`relative select-none ${className}`}
    >
      {/* Resplandor ambiental exterior que emite la ventana hacia la pared (estático de cero consumo GPU) */}
      <div
        className={`absolute -inset-3 -z-10 bg-amber-400/15 blur-xl pointer-events-none ${shapeClass}`}
      />

      {/* Marco exterior principal de la ventana */}
      <div
        className={`relative h-full w-full overflow-hidden border-[6px] sm:border-[8px] border-line/90 bg-panel shadow-2xl ring-1 ring-black/5 dark:ring-white/10 ${shapeClass}`}
      >
        {/* Capa 1: Paisaje exterior de fondo */}
        <div className="absolute inset-0 bg-linear-to-b from-indigo-950 via-purple-900 to-amber-700">
          <img
            src={landscapeSrc || '/images/landscape-cozy-window.jpg'}
            alt="Paisaje exterior alpino al atardecer"
            className="h-full w-full object-cover object-center filter brightness-95 contrast-105"
            loading="lazy"
            onError={(e) => {
              // Si la imagen falla o se tarda, el fondo gradiente sirve de fallback estético
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>

        {/* Capa 2: Iluminación exterior cálida de atardecer */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-amber-500/20 via-transparent to-indigo-950/30" />

        {/* Capa 3: Parteluces / Molduras divisorias de la ventana (paneles de vidrio) */}
        {/* Parteluz vertical */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 sm:w-2 bg-line/90 shadow-xs border-x border-black/10 dark:border-white/10" />

        {/* Travesaño horizontal */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 sm:h-2 bg-line/90 shadow-xs border-y border-black/10 dark:border-white/10" />

        {/* Sub-arco arquitectónico superior (solo en modo arqueado) */}
        {arched && (
          <div className="pointer-events-none absolute top-3 inset-x-3 h-20 rounded-t-full border-t border-line/50 opacity-70" />
        )}

        {/* Capa 4: Efecto de vidrio y reflejo de luz realista (diagonal blanca suave) */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-white/20 via-white/10 to-transparent opacity-90" />
        <div className="pointer-events-none absolute -inset-full rotate-25 bg-linear-to-r from-transparent via-white/15 to-transparent opacity-80" />

        {/* Sombra interior para sensación de profundidad en el marco */}
        <div className="pointer-events-none absolute inset-0 shadow-inner" />
      </div>

      {/* Capa 5: Alféizar inferior con profundidad y relieve en la pared */}
      <div className="absolute -bottom-3 sm:-bottom-4 -left-3 sm:-left-4 -right-3 sm:-right-4 h-3.5 sm:h-4.5 rounded-md border border-line/90 bg-panel shadow-md shadow-ink/20 flex items-center justify-between px-2">
        {/* Bisel superior del alféizar que capta la luz */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/40 dark:bg-white/15" />
      </div>

      {/* Sombra de oclusión proyectada por el alféizar hacia la pared inferior */}
      <div className="absolute -bottom-6 -left-2 -right-2 h-2.5 rounded-full bg-ink/15 blur-xs" />
    </div>
  )
}
