import { cn } from '../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary/90 active:bg-primary/95 focus-visible:ring-primary/40',
  secondary:
    'border border-primary/30 bg-white/60 text-primary hover:bg-primary/10 focus-visible:ring-primary/30',
  ghost: 'text-neutral hover:bg-primary/5 hover:text-primary focus-visible:ring-primary/25',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}