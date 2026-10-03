import { type ReactNode } from 'react'
import { cn } from '../lib/cn'

export type PildoraSize = 'sm' | 'md' | 'lg'
export type PildoraPaleta = 'primary' | 'secondary' | 'neutral' | 'surface'

export interface PildoraProps {
  /** Texto a mostrar, por ejemplo: 'name,capacity_people' */
  label: string
  /** Paleta de colores con gradiente de acuerdo al tema */
  paleta?: PildoraPaleta
  /** Tamaño de la píldora: 'sm' | 'md' | 'lg'. Por defecto 'md' */
  size?: PildoraSize
  /** Función opcional para mostrar un icono de cerrar y hacerla interactiva */
  onClose?: () => void
  /** Elemento visual o icono opcional a la izquierda */
  icon?: ReactNode
  /** Clases CSS adicionales */
  className?: string
  /** Etiqueta accesible para el botón de cerrar */
  closeAriaLabel?: string
}

const PALETA_STYLES: Record<PildoraPaleta, string> = {
  primary:
    'bg-gradient-to-r from-primary via-[#6f3d28] to-[#8c4e33] text-cream border-primary/40 shadow-xs shadow-primary/20',
  secondary:
    'bg-gradient-to-r from-secondary via-[#7a644b] to-[#92785c] text-cream border-secondary/40 shadow-xs shadow-secondary/20',
  neutral:
    'bg-gradient-to-r from-[#505157] via-[#6d6e76] to-[#888994] text-white border-neutral/40 shadow-xs shadow-neutral/20',
  surface:
    'bg-gradient-to-r from-[#cfbeaa] via-[#dcd0bf] to-[#ebe1d5] text-ink border-[#bcaea0] shadow-xs dark:from-[#2c2217] dark:via-[#3b2e20] dark:to-[#4a3b2b] dark:text-cream dark:border-[#524131]',
}

const SIZE_STYLES: Record<
  PildoraSize,
  { container: string; icon: string; closeBtn: string; closeIcon: string }
> = {
  sm: {
    container: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    icon: 'size-3.5 shrink-0',
    closeBtn: 'size-4 p-0.5 -mr-0.5',
    closeIcon: 'size-3',
  },
  md: {
    container: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
    icon: 'size-4 shrink-0',
    closeBtn: 'size-5 p-0.5 -mr-1',
    closeIcon: 'size-3.5',
  },
  lg: {
    container: 'text-base px-4.5 py-2 gap-2.5 font-semibold',
    icon: 'size-5 shrink-0',
    closeBtn: 'size-6 p-1 -mr-1',
    closeIcon: 'size-4',
  },
}

export function Pildora({
  label,
  paleta = 'primary',
  size = 'md',
  onClose,
  icon,
  className,
  closeAriaLabel,
}: PildoraProps) {
  const sizeConfig = SIZE_STYLES[size]
  const paletaClasses = PALETA_STYLES[paleta]

  return (
    <div
      role="status"
      className={cn(
        'inline-flex items-center rounded-full border transition-all duration-200 select-none backdrop-blur-xs',
        paletaClasses,
        sizeConfig.container,
        className,
      )}
    >
      {icon && (
        <span aria-hidden="true" className={cn('flex items-center justify-center', sizeConfig.icon)}>
          {icon}
        </span>
      )}

      <span className="truncate tracking-wide">{label}</span>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeAriaLabel ?? `Eliminar ${label}`}
          className={cn(
            'inline-flex items-center justify-center rounded-full transition-colors',
            'hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 active:scale-95',
            sizeConfig.closeBtn,
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={sizeConfig.closeIcon}
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
