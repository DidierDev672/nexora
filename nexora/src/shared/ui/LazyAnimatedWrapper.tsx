import React from 'react'
import { motion, type Variants, type HTMLMotionProps } from 'motion/react'

/**
 * Variantes de animación predefinidas para el wrapper perezoso.
 */
export type LazyAnimationVariant =
  | 'fade'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomIn'

const PRESET_VARIANTS: Record<LazyAnimationVariant, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  },
  slideUp: {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 26,
        stiffness: 280,
        mass: 0.8,
      },
    },
  },
  slideDown: {
    hidden: { opacity: 0, y: -32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 26,
        stiffness: 280,
        mass: 0.8,
      },
    },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        damping: 26,
        stiffness: 280,
        mass: 0.8,
      },
    },
  },
  slideRight: {
    hidden: { opacity: 0, x: -32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        damping: 26,
        stiffness: 280,
        mass: 0.8,
      },
    },
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        mass: 0.8,
      },
    },
  },
}

export interface LazyAnimatedWrapperProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /**
   * Elementos hijos que serán envueltos y animados al entrar en el viewport.
   */
  children: React.ReactNode
  /**
   * Tipo de animación preconfigurada.
   * @default 'slideUp'
   */
  variant?: LazyAnimationVariant
  /**
   * Variantes personalizadas en caso de requerir un comportamiento a medida (Principio Open/Closed).
   */
  customVariants?: Variants
  /**
   * Margen de activación para el Intersection Observer del viewport.
   * Por ejemplo '-100px' para esperar a que entre 100px en pantalla.
   * @default '-100px'
   */
  viewportMargin?: string
  /**
   * Si es true, la animación se ejecutará únicamente la primera vez que entre al viewport.
   * @default true
   */
  once?: boolean
  /**
   * Proporción del elemento visible para disparar la animación.
   * @default 0.05
   */
  amount?: number | 'some' | 'all'
  /**
   * Retardo adicional en segundos para la animación.
   */
  delay?: number
}

/**
 * Componente React reutilizable que implementa Lazy Loading y animaciones al hacer scroll
 * utilizando `whileInView` de Framer Motion / Motion.
 */
export function LazyAnimatedWrapper({
  children,
  variant = 'slideUp',
  customVariants,
  viewportMargin = '-100px',
  once = true,
  amount = 0.05,
  delay,
  className = '',
  transition,
  ...props
}: LazyAnimatedWrapperProps) {
  // Selección de variantes: personalizada o preset predefinido
  const baseVariants = customVariants || PRESET_VARIANTS[variant] || PRESET_VARIANTS.slideUp

  // Incorporar delay opcional si fue provisto
  const resolvedVariants: Variants = React.useMemo(() => {
    if (delay === undefined) return baseVariants

    return {
      ...baseVariants,
      visible: {
        ...(typeof baseVariants.visible === 'object' ? baseVariants.visible : {}),
        transition: {
          ...((typeof baseVariants.visible === 'object' &&
            'transition' in baseVariants.visible &&
            typeof baseVariants.visible.transition === 'object'
            ? baseVariants.visible.transition
            : {}) || {}),
          delay,
        },
      },
    }
  }, [baseVariants, delay])

  return (
    <motion.div
      variants={resolvedVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once,
        margin: viewportMargin,
        amount,
      }}
      transition={transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
