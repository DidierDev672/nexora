import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary/90 active:bg-primary/95 focus-visible:ring-primary/40',
  secondary:
    'border border-line bg-panel text-ink hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-primary/30',
  ghost:
    'text-ink-muted hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/20',
  danger:
    'bg-danger text-white shadow-sm hover:bg-danger/90 active:bg-danger/95 focus-visible:ring-danger/30',
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
