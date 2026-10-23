import type { Variants } from 'motion/react'

/**
 * Variantes de Stagger Reveal (Revelado Escalonado) en Framer Motion para Sedes (Cards y Tabla).
 * El contenedor propaga automáticamente los estados 'hidden' y 'visible'
 * aplicando delayChildren y staggerChildren a cada elemento hijo sucesivo.
 */
export const STAGGER_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.06,
    },
  },
}

export const STAGGER_ITEM_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 300,
      mass: 0.8,
    },
  },
}

export const STAGGER_ROW_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 300,
      mass: 0.8,
    },
  },
}
