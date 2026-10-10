import { motion } from 'motion/react'

export interface HotelEdificioAnimadoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Componente visual animado para representar un edificio u hotel con estilo refinado.
 */
export function HotelEdificioAnimado({
  className = '',
  size = 'md',
}: HotelEdificioAnimadoProps) {
  const dimensionContenedor =
    size === 'sm' ? 'size-8' : size === 'lg' ? 'size-12' : 'size-10'

  const dimensionSvg =
    size === 'sm' ? 'size-4' : size === 'lg' ? 'size-7' : 'size-5'

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`grid ${dimensionContenedor} place-items-center rounded-xl bg-primary/10 text-primary ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={dimensionSvg}
        aria-hidden="true"
      >
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </svg>
    </motion.div>
  )
}
