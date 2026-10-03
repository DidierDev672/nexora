import { memo } from 'react'

export interface HabitacionPuertaProps {
  className?: string
  /**
   * Número de habitación mostrado en la placa de latón de la puerta (ej. '101' o número actual)
   */
  roomNumber?: string | number
  /**
   * Acción ejecutada al hacer clic sobre la puerta abierta (ej. volver a la lista de habitaciones)
   */
  onDoorClick?: () => void
}


// ------------------------------------------
// ATOMOS MEMOIZADOS (no re-renderizan nunca)
// ------------------------------------------

const Bisagras = memo(function Bisagras() {
  return (
    <>
       <div className='absolute left-0 top-6 h-4 w-1 rounded-r-xs bg-gradient-to-r from-amber-300 to-amber-500' />
       <div className='absolute left-0 bottom-6 h-4 w-1 rounded-r-xs bg-gradient-to-r from-amber-300 to-amber-5000' />
    </>
  );
});


const Cerradura = memo(function Cerradura() {
  return (
    <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center'>
      <div className='h-1.5 w-4 rounded-l-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 transition-transform duration-300 group-hover/door:rotate-6 motion-reduce:transition-none' />
      <div className='flex h-8 w-2.5 flex-col items-center justify-between rounded-xs border border-amber-200/60 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 py-1 shadow-sm'>
        <div className="size-1 rounded-full bg-amber-100" />
        <div className="h-2 w-1 rounded-full bg-amber-950" />
      </div>
    </div>
  );
});


const InteriorPasillo = memo(function InteriorPasillo() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-t-xs bg-gradient-to-b from-amber-200 via-amber-100 to-amber-300 flex flex-col justify-between p-2 shadow-[inset_0_0_12px_rgba(0,0,0,0.5)]">
      {/* Lámpara: pulse solo si el usuario no pidió reduced-motion */}
      <div className="mx-auto mt-3 size-5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] motion-safe:animate-pulse" />

      <div className="flex flex-col items-center justify-center gap-1 opacity-0 transition-opacity duration-300 group-hover/door:opacity-100 text-center pointer-events-none">
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-amber-950/85 px-2.5 py-1 text-[8px] sm:text-[9px] font-bold text-amber-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-2.5" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Salir</span>
        </span>
        <span className="font-mono text-[7px] sm:text-[8px] font-semibold text-amber-950 tracking-wider">
          Habitaciones
        </span>
      </div>

      <div className="h-3 w-full border-t border-amber-400/50 bg-amber-800/40" />
    </div>
  );
});

/**
 * Componente atómico decorativo e interactivo que simula la puerta de la habitación
 * con apertura 3D hiperrealista al pasar el cursor (hover).
 *
 * Puntos clave implementados:
 * 1. Efecto 3D: [perspective:1000px] en el marco exterior para profundidad realista.
 * 2. Eje de apertura: origin-left para pivotar sobre las bisagras izquierdas.
 * 3. Rotación en hover: group-hover/door:[transform:rotateY(-105deg)] que abre la puerta hacia adentro.
 * 4. Madera clásica: Tonos amber-700, amber-800 y amber-900 con paneles moldurados.
 * 5. Haz de luz y pasillo: Al abrirse la puerta se revela el pasillo cálido y un haz de luz proyectado en el piso.
 * 6. Interactividad garantizada: pointer-events-auto para responder al hover y clic de retorno a habitaciones.
 */
export function HabitacionPuerta({
  className = '',
  roomNumber = '101',
  onDoorClick,
}: HabitacionPuertaProps) {
  

  return (
     <button
      type="button"
      aria-label={`Puerta de la habitación ${roomNumber}: Clic para volver al catálogo`}
      title="Haz clic para salir y volver a la lista de habitaciones"
      onClick={onDoorClick}
      className={[
        'pointer-events-auto relative select-none cursor-pointer',
        'group/door rounded-t-lg',
        'outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
        // ⚡ active:scale solo en transform, no todo
        'transition-transform duration-150 active:scale-[0.98]',
        className,
      ].join(' ')}
    >
      {/* Marco exterior con perspectiva 3D */}
      <div
        className="relative h-56 w-28 sm:h-64 sm:w-32 md:h-72 md:w-36 rounded-t-lg border-4 sm:border-[6px] border-amber-950 bg-amber-950 [perspective:1000px]"
        style={{ contain: 'layout paint' }} // ⚡ aísla repaints al marco
      >
        <InteriorPasillo />

        {/* HOJA DE LA PUERTA — el único elemento que rota */}
        <div
          className={[
            'relative h-full w-full origin-left',
            'border border-amber-600/40',
            'bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900',
            'transition-transform duration-500 ease-out',
            'motion-reduce:transition-none',
            '[transform-style:preserve-3d]',
            // ⚡ will-change SOLO cuando el contenedor tiene hover → no consume GPU en reposo
            'group-hover/door:[will-change:transform]',
            'group-hover/door:[transform:rotateY(-105deg)]',
          ].join(' ')}
        >
          <Bisagras />

          {/* Molduras de madera */}
          <div className="flex h-full w-full flex-col justify-between p-2 sm:p-2.5">
            {/* Panel superior con placa */}
            <div className="relative flex h-[44%] w-full flex-col items-center justify-center rounded-md border-2 border-amber-950/70 bg-gradient-to-b from-amber-800/90 to-amber-900/90 shadow-[inset_0_2px_3px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-1 rounded-xs border border-amber-200/80 bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 px-2 py-0.5">
                <span className="font-mono text-[9px] sm:text-[10px] font-black tracking-wider text-amber-950">
                  {roomNumber}
                </span>
              </div>
              <div className="mt-2 size-2 rounded-full border border-amber-300 bg-amber-950 shadow-inner" />
            </div>

            {/* Panel inferior */}
            <div className="h-[46%] w-full rounded-md border-2 border-amber-950/70 bg-gradient-to-b from-amber-800/90 to-amber-900/90 shadow-[inset_0_2px_3px_rgba(0,0,0,0.4)]" />
          </div>

          <Cerradura />
        </div>

        {/* Umbral inferior */}
        <div className="absolute -bottom-1 -left-1 -right-1 h-1.5 rounded-b-xs border-t border-amber-700 bg-amber-950" />
      </div>

      {/* Haz de luz en el suelo — se mantiene, pero sin blur costoso */}
      <div
        aria-hidden="true"
        className={[
          'pointer-events-none absolute -bottom-8 left-2 h-14 w-32',
          'origin-top-left -rotate-6 rounded-full',
          // ⚡ gradiente radial en vez de blur-md → mismo look, 0 coste de blur
          'bg-[radial-gradient(ellipse_at_left,rgba(252,211,77,0.35),transparent_70%)]',
          'opacity-0 transition-opacity duration-500',
          'group-hover/door:opacity-100',
          'motion-reduce:transition-none',
        ].join(' ')}
      />
    </button>
  )
}
