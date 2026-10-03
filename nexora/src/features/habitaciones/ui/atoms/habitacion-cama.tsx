import { cn } from '../lib/cn'

export interface HabitacionCamaProps {
  className?: string
  /**
   * Color base del edredón (default: 'bg-indigo-600')
   */
  duvetColor?: string
  /**
   * Color del doblez superior contrastante (default: 'bg-indigo-400')
   */
  foldedColor?: string
  /**
   * Determina si se visualiza el cojín de diamante (desaparece cuando la habitación está ocupada)
   */
  showDiamond?: boolean
  /**
   * Callback interactivo al hacer clic en el diamante decorativo de la cama
   */
  onDiamondClick?: () => void
}

/**
 * Componente atómico decorativo que simula una cama de hotel realista y moderna
 * creada 100% con CSS puro y TailwindCSS.
 *
 * Estructura del diseño:
 * 1. Estructura base (bg-amber-800) y patas (bg-amber-950): Marco de madera sólida.
 * 2. Colchón (bg-slate-100): Base acolchada que sostiene las almohadas.
 * 3. Edredón e hilado (bg-indigo-600): Cubre la mayor parte inferior con doblez contrastante (bg-indigo-400).
 * 4. Almohadas confortables: Almohadas gemelas en cabecera.
 * 5. Cojín decorativo (rotate-45): Toque contemporáneo en forma de diamante en el centro con interactividad.
 */
export function HabitacionCama({
  className = '',
  duvetColor = 'bg-indigo-600',
  foldedColor = 'bg-indigo-400',
  showDiamond = true,
  onDiamondClick,
}: HabitacionCamaProps) {
  return (
    <div
      aria-hidden={onDiamondClick ? undefined : 'true'}
      className={cn('relative flex flex-col items-center select-none', className)}
    >
      {/* ========================================================= */}
      {/* 1. ALMOHADAS CONFORTABLES DE CABECERA */}
      {/* ========================================================= */}
      <div className="relative -mb-3 z-1 flex gap-2 sm:gap-3">
        {/* Almohada izquierda */}
        <div className="h-8 sm:h-9 w-20 sm:w-24 rounded-lg border border-slate-300/80 bg-slate-50 shadow-md flex items-center justify-center">
          <div className="h-6 w-16 rounded-md bg-linear-to-b from-white to-slate-100/90 shadow-inner" />
        </div>

        {/* Almohada derecha */}
        <div className="h-8 sm:h-9 w-20 sm:w-24 rounded-lg border border-slate-300/80 bg-slate-50 shadow-md flex items-center justify-center">
          <div className="h-6 w-16 rounded-md bg-linear-to-b from-white to-slate-100/90 shadow-inner" />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CUERPO DE LA CAMA (Colchón + Edredón + Cojín) */}
      {/* ========================================================= */}
      <div className="relative w-56 sm:w-72 md:w-80 rounded-t-2xl border border-slate-300/60 bg-slate-100 shadow-xl overflow-hidden ring-1 ring-black/5">
        {/* Cabecera visible del colchón (Sábana encimera blanca) */}
        <div className="h-6 sm:h-7 w-full border-b border-slate-200/90 bg-linear-to-b from-slate-100 to-slate-200/60 px-4 flex items-center justify-between">
          <div className="h-1 w-12 rounded-full bg-slate-300/40" />
          <div className="h-1 w-12 rounded-full bg-slate-300/40" />
        </div>

        {/* 3. DOBLEZ SUPERIOR CONTRASTANTE DEL EDREDÓN (bg-indigo-400) */}
        <div
          className={`relative h-6 sm:h-7 w-full border-y border-indigo-400/80 ${foldedColor} shadow-inner flex items-center justify-center`}
        >
          {/* Costura decorativa sutil del doblez */}
          <div className="absolute inset-x-2 top-1 border-t border-dashed border-white/40" />

          {/* 5. COJÍN DECORATIVO EN DIAMANTE (rotate-45) - Se oculta si showDiamond es false */}
          {showDiamond && (
            <div className="relative z-20 -mt-1 flex items-center justify-center pointer-events-auto">
              {onDiamondClick ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDiamondClick()
                  }}
                  title="Haz clic para asignar un huésped a esta habitación"
                  aria-label="Asignar huésped a la habitación"
                  className="group relative size-6 sm:size-7 rotate-45 rounded-md border border-amber-200/90 bg-linear-to-br from-amber-300 via-amber-400 to-amber-500 shadow-md ring-1 ring-amber-600/30 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-125 hover:shadow-xl hover:ring-amber-300 hover:ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 animate-pulse hover:animate-none motion-reduce:animate-none"
                >
                  {/* Aura de resplandor interactivo */}
                  <span className="pointer-events-none absolute -inset-1 rounded-md bg-amber-400/30 opacity-70 blur-xs transition-opacity group-hover:opacity-100" />

                  {/* Botón central del cojín */}
                  <div className="size-1.5 rounded-full bg-amber-700/70 shadow-xs group-hover:bg-amber-900 transition-colors" />

                  {/* Tooltip flotante estilizado */}
                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 -rotate-45 rounded-md bg-stone-950/95 px-2 py-0.5 text-[10px] font-bold text-amber-300 opacity-0 shadow-xl backdrop-blur-xs transition-all group-hover:opacity-100 group-hover:-top-9 whitespace-nowrap z-30 border border-amber-400/30">
                    Asignar Huésped ✨
                  </span>
                </button>
              ) : (
                <div className="size-6 sm:size-7 rotate-45 rounded-md border border-amber-200/80 bg-linear-to-br from-amber-300 via-amber-400 to-amber-500 shadow-md ring-1 ring-amber-600/30 flex items-center justify-center">
                  {/* Botón central del cojín */}
                  <div className="size-1.5 rounded-full bg-amber-700/60 shadow-xs" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. EDREDÓN PRINCIPAL (bg-indigo-600) */}
        <div
          className={`relative h-20 sm:h-24 w-full ${duvetColor} bg-linear-to-b from-indigo-600 to-indigo-700 p-2 shadow-inner`}
        >
          {/* Líneas sutiles de acolchado / hilado del edredón */}
          <div className="absolute inset-x-4 top-3 h-px bg-indigo-500/40" />
          <div className="absolute inset-x-4 top-8 h-px bg-indigo-500/40" />
          <div className="absolute inset-x-4 top-13 h-px bg-indigo-500/40" />
          <div className="absolute inset-x-4 top-18 h-px bg-indigo-500/40" />

          {/* Sombra de caída del edredón hacia la base */}
          <div className="absolute inset-x-0 bottom-0 h-4 bg-linear-to-t from-black/35 to-transparent" />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. ESTRUCTURA BASE DE MADERA (bg-amber-800) */}
      {/* ========================================================= */}
      <div className="relative h-4 sm:h-4.5 w-60 sm:w-76 md:w-84 rounded-b-md border border-amber-950/80 bg-amber-800 shadow-md">
        {/* Veta / brillo superior del larguero de madera */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-700/60" />
      </div>

      {/* ========================================================= */}
      {/* 6. PATAS DE LA CAMA (bg-amber-950) */}
      {/* ========================================================= */}
      <div className="relative flex w-52 sm:w-68 md:w-76 justify-between px-2">
        {/* Pata izquierda */}
        <div className="h-3.5 sm:h-4 w-3 rounded-b-xs border-x border-b border-amber-950 bg-amber-950 shadow-sm" />
        {/* Pata central de refuerzo */}
        <div className="h-3 sm:h-3.5 w-2.5 rounded-b-xs border-x border-b border-amber-950 bg-amber-950 opacity-80" />
        {/* Pata derecha */}
        <div className="h-3.5 sm:h-4 w-3 rounded-b-xs border-x border-b border-amber-950 bg-amber-950 shadow-sm" />
      </div>

      {/* Sombra de contacto en el suelo 3D */}
      <div className="mt-0.5 h-2 w-56 sm:w-72 md:w-80 rounded-full bg-black/40 blur-xs" />
    </div>
  )
}
