export interface HabitacionPisoPerspectivaProps {
  className?: string
  /**
   * Ancho de los tablones de madera en píxeles (default: 56)
   */
  plankWidth?: number
  /**
   * Largo de las juntas de los tablones en píxeles (default: 160)
   */
  plankLength?: number
}

/**
 * Componente atómico decorativo que simula el suelo (piso de madera/parqué)
 * de una habitación con perspectiva 3D realista usando HTML, CSS puro y TailwindCSS.
 *
 * Implementa los 5 puntos clave:
 * 1. [perspective:1000px]: Define la distancia del observador para activar la perspectiva 3D.
 * 2. [transform:rotateX(60deg)]: Tumba el plano del suelo hacia atrás para crear profundidad.
 * 3. origin-bottom: Asegura que la rotación se haga desde la base de la pared trasera.
 * 4. background-image (Inline CSS): Patrón repetitivo de líneas simulando los tablones de madera o azulejos.
 * 5. bg-gradient-to-t: Sombra simulada que oscurece el piso a medida que se acerca a la pared trasera.
 */
export function HabitacionPisoPerspectiva({
  className = '',
  plankWidth = 56,
  plankLength = 160,
}: HabitacionPisoPerspectivaProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-64 sm:h-72 overflow-hidden [perspective:1000px] select-none ${className}`}
    >
      {/* Plano del suelo tumbado en 3D */}
      <div
        className="w-full h-full origin-bottom [transform:rotateX(60deg)] bg-linear-to-t from-transparent via-ink/15 to-ink/40 border-t border-line/60"
        style={{
          backgroundImage: `
            linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.45) 100%),
            repeating-linear-gradient(90deg, rgba(120, 85, 55, 0.28) 0px, rgba(120, 85, 55, 0.28) 2px, transparent 2px, transparent ${plankWidth}px),
            repeating-linear-gradient(0deg, rgba(120, 85, 55, 0.2) 0px, rgba(120, 85, 55, 0.2) 1.5px, transparent 1.5px, transparent ${plankLength}px)
          `,
          backgroundSize: '100% 100%, auto auto, auto auto',
        }}
      >
        {/* Reflejo rasante de luz cálida sobre los tablones */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-amber-400/10 to-transparent" />
      </div>

      {/* Zócalo inferior grueso de remate arquitectónico */}
      <div className="absolute inset-x-0 bottom-0 h-4 border-b-[16px] border-line/80 shadow-md" />
    </div>
  )
}
