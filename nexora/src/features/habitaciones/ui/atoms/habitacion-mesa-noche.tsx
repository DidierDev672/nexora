export interface HabitacionMesaNocheProps {
  className?: string
  /**
   * Si es true, incluye una pequeña lámpara de lectura cálida encima de la mesa.
   * Default: true
   */
  withLamp?: boolean
}

/**
 * Componente atómico decorativo que simula una mesa de noche moderna y minimalista
 * (estilo Mid-Century / nórdico) creada 100% con CSS puro y TailwindCSS.
 *
 * Características del diseño:
 * 1. Efecto de Madera: Tonos bg-amber-800 y bg-amber-900 para simular madera natural cálida.
 * 2. Profundidad del Estante: shadow-[inset_0_5px_12px_rgba(0,0,0,0.6)] en el nicho abierto inferior.
 * 3. Patas Estilizadas: Inclinación en ángulo nórdico (-rotate-6 / rotate-6) con origin-top y conteras de latón.
 * 4. Interacción group-hover: Manija metálica de latón que brilla al pasar el cursor sobre el cajón.
 */
export function HabitacionMesaNoche({
  className = '',
  withLamp = true,
}: HabitacionMesaNocheProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex flex-col items-center select-none ${className}`}
    >
      {/* ========================================================= */}
      {/* Lámpara de noche minimalista sobre la mesa (opcional) */}
      {/* ========================================================= */}
      {withLamp && (
        <div className="relative mb-0.5 flex flex-col items-center">
          {/* Pantalla de lámpara cónica cálida */}
          <div className="relative h-6 w-9 rounded-t-sm border-t border-x border-amber-200/40 bg-linear-to-b from-amber-100/90 to-amber-200/80 shadow-md">
            {/* Foco de luz interna */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
          </div>

          {/* Mástil delgado metálico */}
          <div className="h-5 w-0.5 bg-linear-to-b from-amber-400 to-amber-700" />

          {/* Base circular de la lámpara */}
          <div className="h-1 w-6 rounded-full bg-linear-to-r from-amber-500 via-amber-300 to-amber-600 shadow-xs" />
        </div>
      )}

      {/* ========================================================= */}
      {/* Mueble principal de la mesa de noche */}
      {/* ========================================================= */}
      <div className="relative w-28 sm:w-32 rounded-xl border border-amber-950/60 bg-amber-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Tablero superior biselado de madera */}
        <div className="h-2 w-full border-b border-amber-950/60 bg-linear-to-r from-amber-700 via-amber-800 to-amber-700 shadow-xs" />

        {/* 1. CAJÓN SUPERIOR (Con interacción group-hover y pointer-events-auto) */}
        <div className="group/drawer pointer-events-auto relative flex h-10 w-full cursor-pointer items-center justify-center border-b border-amber-950/70 bg-linear-to-b from-amber-800/95 to-amber-900/95 transition-colors duration-200 hover:from-amber-750 hover:to-amber-850">
          {/* Línea de juntura sutil del cajón */}
          <div className="absolute inset-x-1 top-0.5 h-px bg-amber-700/50" />

          {/* Manija metálica de latón con brillo en group-hover */}
          <div
            className="relative flex h-1.5 w-7 items-center justify-center rounded-full bg-linear-to-r from-amber-200 via-amber-400 to-amber-500 shadow-xs transition-all duration-300 group-hover/drawer:scale-105 group-hover/drawer:brightness-125 group-hover/drawer:shadow-[0_0_10px_rgba(251,191,36,0.7)]"
            title="Tirador metálico"
          >
            {/* Reflejo especular central */}
            <div className="h-0.5 w-3 rounded-full bg-white/70" />
          </div>
        </div>

        {/* 2. ESPACIO ABIERTO INFERIOR (Estante con sombra de profundidad) */}
        <div className="relative flex h-12 sm:h-14 w-full items-end justify-center bg-amber-950/90 p-2 shadow-[inset_0_5px_12px_rgba(0,0,0,0.65)]">
          {/* Libros estilizados decorativos en el estante hueco */}
          <div className="flex items-end gap-1 opacity-70">
            <div className="h-5 w-2 rounded-xs border-r border-amber-950 bg-stone-300 shadow-xs" />
            <div className="h-6 w-2.5 rounded-xs border-r border-amber-950 bg-amber-700 shadow-xs" />
            <div className="h-4 w-2 rounded-xs border-r border-amber-950 bg-primary/80 shadow-xs" />
          </div>

          {/* Sombra de oclusión en la base interior */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-black/40" />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. PATAS ESTILIZADAS NÓRDICAS (Mid-Century: -rotate-6 / rotate-6) */}
      {/* ========================================================= */}
      <div className="relative -mt-0.5 flex w-24 sm:w-28 justify-between px-2">
        {/* Pata izquierda inclinada hacia afuera */}
        <div className="origin-top -rotate-6 flex h-12 sm:h-14 w-1.5 sm:w-2 flex-col justify-between rounded-b-xs bg-linear-to-b from-amber-900 via-amber-950 to-stone-950 shadow-md">
          <div className="h-full w-full" />
          {/* Contera metálica dorada de latón en la punta */}
          <div className="h-2 w-full rounded-b-xs bg-linear-to-r from-amber-300 to-amber-500 shadow-2xs" />
        </div>

        {/* Pata derecha inclinada hacia afuera */}
        <div className="origin-top rotate-6 flex h-12 sm:h-14 w-1.5 sm:w-2 flex-col justify-between rounded-b-xs bg-linear-to-b from-amber-900 via-amber-950 to-stone-950 shadow-md">
          <div className="h-full w-full" />
          {/* Contera metálica dorada de latón en la punta */}
          <div className="h-2 w-full rounded-b-xs bg-linear-to-r from-amber-300 to-amber-500 shadow-2xs" />
        </div>
      </div>

      {/* Sombra proyectada en el suelo 3D */}
      <div className="mt-1 h-2 w-24 rounded-full bg-black/35 blur-xs" />
    </div>
  )
}
