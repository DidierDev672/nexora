import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export interface CampanaHotelAnimadaProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Campana de Hotel interactiva con físicas de Framer Motion.
 * Simula el comportamiento mecánico de una campana de recepción clásica:
 * 1. Presión vertical del pulsador superior (Plunger).
 * 2. Oscilación elástica de la cúpula (Bell dome vibration).
 * 3. Ondas expansivas de sonido ("Ding! soundwaves") en hover o clic.
 */
export function CampanaHotelAnimada({
  className = '',
  size = 'md',
}: CampanaHotelAnimadaProps) {
  const [estaSonando, setEstaSonando] = useState(false)
  const [dingKey, setDingKey] = useState(0)

  const activarCampana = () => {
    setEstaSonando(true)
    setDingKey((prev) => prev + 1)
    setTimeout(() => {
      setEstaSonando(false)
    }, 850)
  }

  const dimensionContenedor =
    size === 'sm' ? 'size-9' : size === 'lg' ? 'size-14' : 'size-11'

  const dimensionSvg =
    size === 'sm' ? 'size-5' : size === 'lg' ? 'size-8' : 'size-6'

  return (
    <motion.button
      type="button"
      onClick={activarCampana}
      onMouseEnter={activarCampana}
      whileTap={{ scale: 0.92 }}
      title="¡Toca la campana para avisar a cocina y recepción!"
      aria-label="Tocar campana de servicio de hotel"
      className={`group relative grid ${dimensionContenedor} place-items-center rounded-2xl bg-primary/10 text-primary transition-colors hover:bg-primary/20 active:bg-primary/25 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      {/* Ondas expansivas de sonido ("Ding!") emitidas al activar */}
      <AnimatePresence mode="popLayout">
        {estaSonando && (
          <div
            key={`ondas-${dingKey}`}
            className="pointer-events-none absolute -inset-2 flex items-center justify-center overflow-visible"
            aria-hidden="true"
          >
            {/* Onda 1: Arco cercano */}
            <motion.svg
              viewBox="0 0 32 16"
              className="absolute -top-3 w-7 text-primary/60"
              initial={{ opacity: 0, scale: 0.6, y: 3 }}
              animate={{
                opacity: [0, 0.9, 0],
                scale: [0.7, 1.25, 1.5],
                y: [2, -4, -7],
              }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            >
              <path
                d="M 6 12 A 10 10 0 0 1 26 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </motion.svg>

            {/* Onda 2: Arco distante */}
            <motion.svg
              viewBox="0 0 40 20"
              className="absolute -top-4 w-9 text-primary/40"
              initial={{ opacity: 0, scale: 0.7, y: 2 }}
              animate={{
                opacity: [0, 0.75, 0],
                scale: [0.8, 1.4, 1.8],
                y: [1, -6, -11],
              }}
              transition={{ duration: 0.8, delay: 0.08, ease: 'easeOut' }}
            >
              <path
                d="M 5 16 A 15 15 0 0 1 35 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="2 3"
              />
            </motion.svg>
          </div>
        )}
      </AnimatePresence>

      {/* SVG Vectorial de la Campana de Hotel de Servicio */}
      <svg
        viewBox="0 0 24 24"
        className={`${dimensionSvg} overflow-visible`}
        fill="currentColor"
        aria-hidden="true"
      >
        {/* 1. Pulsador / Botón superior (baja al presionar) */}
        <motion.path
          d="M 11 1.5 C 11 0.9 11.4 0.5 12 0.5 C 12.6 0.5 13 0.9 13 1.5 L 13 4 L 11 4 Z"
          animate={
            estaSonando
              ? {
                  y: [0, 2.5, 0],
                  scaleY: [1, 0.75, 1],
                }
              : { y: 0, scaleY: 1 }
          }
          transition={{ duration: 0.22, ease: 'easeInOut' }}
        />

        {/* 2. Cúpula resonante (oscilación angular elástica en hover) */}
        <motion.g
          style={{ originX: '12px', originY: '17px' }}
          animate={
            estaSonando
              ? {
                  rotate: [0, -14, 12, -9, 7, -4, 2, 0],
                  y: [0, -1, 1, -0.5, 0],
                }
              : { rotate: 0, y: 0 }
          }
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          {/* Corona del pulsador */}
          <rect x="9.5" y="4" width="5" height="1.8" rx="0.9" opacity="0.9" />

          {/* Domo de bronce/acero */}
          <path
            d="M 12 5.5 C 7.2 5.5 3.5 8.8 3.1 13.6 C 3 14.4 3.6 15 4.4 15 L 19.6 15 C 20.4 15 21 14.4 20.9 13.6 C 20.5 8.8 16.8 5.5 12 5.5 Z"
          />

          {/* Reflejo de luz en el metal de la cúpula */}
          <path
            d="M 6.5 13.5 C 6.8 10 9 7.5 12 7.2 C 11.5 7 10.5 7 9.5 7.6 C 7.5 8.8 6.5 11 6.5 13.5 Z"
            fill="white"
            opacity="0.35"
          />

          {/* Badajo interior visible sutilmente */}
          <circle cx="12" cy="15.8" r="1.3" opacity="0.75" />
        </motion.g>

        {/* 3. Base fija metálica del mostrador */}
        <rect x="2" y="17" width="20" height="2.5" rx="1.25" opacity="0.95" />
        <rect x="4.5" y="19.5" width="15" height="1.5" rx="0.75" opacity="0.6" />
      </svg>
    </motion.button>
  )
}
