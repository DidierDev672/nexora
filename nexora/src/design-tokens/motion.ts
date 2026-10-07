import type { Variants } from 'motion/react'

export const slideIn: Variants = {
  hidden: { opacity: 0, x: -72 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 110, damping: 16 } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 26 },
  },
  exit: { opacity: 0, y: 16, transition: { type: 'spring', stiffness: 400, damping: 26 } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } },
}

/**
 * Curva Bezier cúbica personalizada [0.42, 0, 0.58, 1] (easeInOut suave)
 * para transiciones con aceleración y desaceleración fluida.
 */
export const customEasing = [0.42, 0, 0.58, 1] as const

export const buttonEasingVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      delay: 0.06 + custom * 0.07,
      ease: customEasing,
    },
  }),
}

/**
 * Variantes de Stagger Reveal (Revelado Escalonado) para contenedores y listas/tablas.
 * Orquesta secuencialmente a los hijos sin cálculos manuales de retraso.
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
}

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
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