import type { HTMLMotionProps } from 'motion/react'
import { motion } from 'motion/react'
import { customEasing } from '../../../../design-tokens/motion'
import { cn } from '../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary/90 active:bg-primary/95 focus-visible:ring-primary/40',
  secondary:
    'border border-primary/30 bg-white/60 text-primary hover:bg-primary/10 focus-visible:ring-primary/30',
  ghost: 'text-neutral hover:bg-primary/5 hover:text-primary focus-visible:ring-primary/25',
}

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant
  animateMount?: boolean
}

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  animateMount = false,
  whileHover,
  whileTap,
  transition,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      initial={animateMount ? { opacity: 0, y: 8, scale: 0.96 } : undefined}
      animate={
        animateMount
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.35,
                ease: customEasing,
              },
            }
          : undefined
      }
      whileHover={
        disabled
          ? undefined
          : (whileHover ?? {
              scale: 1.03,
              y: -1,
              transition: { duration: 0.22, ease: customEasing },
            })
      }
      whileTap={
        disabled
          ? undefined
          : (whileTap ?? {
              scale: 0.97,
              y: 0,
              transition: { duration: 0.12, ease: customEasing },
            })
      }
      transition={transition ?? { duration: 0.22, ease: customEasing }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
