export interface HabitacionSofaProps {
  className?: string
  /**
   * Color de tela principal del sofá (default: tono nórdico arena / lino)
   */
  fabricColor?: string
  /**
   * Color del cojín decorativo secundario
   */
  pillowColor?: string
}

/**
 * Componente atómico decorativo que simula un sofá nórdico minimalista
 * creado 100% con CSS puro y TailwindCSS (sin imágenes).
 *
 * Características clave del diseño:
 * 1. Efecto 3D / Volumen: shadow-md para separar el sofá del suelo y shadow-inner en el respaldo para profundidad.
 * 2. Estructura limpia: Reposabrazos redondeados acoplados con absolute en los extremos laterales del contenedor.
 * 3. Detalles realistas: Patas nórdicas estilizadas inclinadas hacia afuera con -skew-x-12 y skew-x-12.
 * 4. Textil acolchado: Cojines de asiento y respaldo bitemáticos con cojines decorativos de acento.
 */
export function HabitacionSofa({
  className = '',
  fabricColor = 'bg-stone-200 dark:bg-stone-700',
  pillowColor = 'bg-amber-400/90',
}: HabitacionSofaProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex flex-col items-center select-none ${className}`}
    >
      {/* ========================================================= */}
      {/* 1. CUERPO DEL SOFÁ (Respaldo + Cojines + Reposabrazos) */}
      {/* ========================================================= */}
      <div className="relative w-48 sm:w-56 md:w-64 rounded-2xl p-1 shadow-md">
        {/* ========================================================= */}
        {/* REPOSABRAZOS LATERALES (absolute a los costados) */}
        {/* ========================================================= */}
        {/* Reposabrazos izquierdo */}
        <div className="absolute -left-3 sm:-left-3.5 top-3 sm:top-4 z-20 h-14 sm:h-16 w-3.5 sm:w-4 rounded-full border border-stone-300/80 dark:border-stone-600 bg-linear-to-b from-stone-300 via-stone-400 to-stone-500 dark:from-stone-600 dark:via-stone-700 dark:to-stone-800 shadow-md" />

        {/* Reposabrazos derecho */}
        <div className="absolute -right-3 sm:-right-3.5 top-3 sm:top-4 z-20 h-14 sm:h-16 w-3.5 sm:w-4 rounded-full border border-stone-300/80 dark:border-stone-600 bg-linear-to-b from-stone-300 via-stone-400 to-stone-500 dark:from-stone-600 dark:via-stone-700 dark:to-stone-800 shadow-md" />

        {/* ========================================================= */}
        {/* RESPALDO ACOLCHADO (con shadow-inner para profundidad) */}
        {/* ========================================================= */}
        <div
          className={`relative h-14 sm:h-16 w-full rounded-t-xl ${fabricColor} shadow-inner border border-stone-300/60 dark:border-stone-600 flex gap-1 p-1`}
        >
          {/* Cojín de respaldo izquierdo */}
          <div className="flex-1 rounded-t-lg bg-stone-100/90 dark:bg-stone-600/90 shadow-inner border border-stone-300/40 flex items-center justify-center">
            {/* Botón de capitoné sutil */}
            <div className="size-1 rounded-full bg-stone-400/70 shadow-2xs" />
          </div>

          {/* Cojín de respaldo derecho */}
          <div className="flex-1 rounded-t-lg bg-stone-100/90 dark:bg-stone-600/90 shadow-inner border border-stone-300/40 flex items-center justify-center">
            {/* Botón de capitoné sutil */}
            <div className="size-1 rounded-full bg-stone-400/70 shadow-2xs" />
          </div>

          {/* Sombra de caída hacia el asiento */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2 bg-linear-to-t from-black/20 to-transparent" />
        </div>

        {/* ========================================================= */}
        {/* COJINES DECORATIVOS (Throw Pillows en las esquinas) */}
        {/* ========================================================= */}
        {/* Cojín izquierdo */}
        <div
          className={`absolute left-2 bottom-7 z-15 size-5 sm:size-6 -rotate-12 rounded-md ${pillowColor} border border-amber-300/70 shadow-sm flex items-center justify-center`}
        >
          <div className="size-1 rounded-full bg-amber-700/50" />
        </div>

        {/* Cojín derecho (azul índigo) */}
        <div className="absolute right-2 bottom-7 z-15 size-5 sm:size-6 rotate-12 rounded-md bg-indigo-500/90 border border-indigo-400/70 shadow-sm flex items-center justify-center">
          <div className="size-1 rounded-full bg-indigo-800/60" />
        </div>

        {/* ========================================================= */}
        {/* COJINES DEL ASIENTO (Seat Cushions mullidos) */}
        {/* ========================================================= */}
        <div className="relative z-10 -mt-1 flex h-7 sm:h-8 w-full gap-1 rounded-md bg-stone-300 dark:bg-stone-800 p-0.5 shadow-md">
          {/* Asiento izquierdo */}
          <div className="flex-1 rounded-sm bg-linear-to-b from-stone-100 to-stone-200 dark:from-stone-600 dark:to-stone-700 border-b border-stone-400/50 shadow-xs" />
          {/* Asiento derecho */}
          <div className="flex-1 rounded-sm bg-linear-to-b from-stone-100 to-stone-200 dark:from-stone-600 dark:to-stone-700 border-b border-stone-400/50 shadow-xs" />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BASE DE MADERA Y PATAS NÓRDICAS INCLINADAS (skew-x) */}
      {/* ========================================================= */}
      {/* Travesaño inferior de soporte de madera */}
      <div className="h-1.5 w-44 sm:w-52 rounded-xs border-t border-amber-700 bg-amber-900 shadow-xs" />

      {/* Patas estilizadas con inclinación skew-x */}
      <div className="relative flex w-40 sm:w-48 justify-between px-2">
        {/* Pata izquierda (inclinada hacia afuera con -skew-x-12) */}
        <div className="origin-top -skew-x-12 flex h-6 sm:h-7 w-1.5 sm:w-2 flex-col justify-between rounded-b-xs bg-linear-to-b from-amber-800 via-amber-900 to-stone-950 shadow-md">
          <div className="h-full w-full" />
          {/* Contera de latón dorado en la punta */}
          <div className="h-1.5 w-full bg-linear-to-r from-amber-300 to-amber-500 rounded-b-xs shadow-2xs" />
        </div>

        {/* Pata derecha (inclinada hacia afuera con skew-x-12) */}
        <div className="origin-top skew-x-12 flex h-6 sm:h-7 w-1.5 sm:w-2 flex-col justify-between rounded-b-xs bg-linear-to-b from-amber-800 via-amber-900 to-stone-950 shadow-md">
          <div className="h-full w-full" />
          {/* Contera de latón dorado en la punta */}
          <div className="h-1.5 w-full bg-linear-to-r from-amber-300 to-amber-500 rounded-b-xs shadow-2xs" />
        </div>
      </div>

      {/* Sombra de oclusión proyectada en el suelo */}
      <div className="mt-0.5 h-1.5 w-44 sm:w-52 rounded-full bg-black/40 blur-xs" />
    </div>
  )
}
