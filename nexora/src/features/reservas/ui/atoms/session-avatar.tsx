export interface SessionAvatarProps {
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SessionAvatar({ name, className = '', size = 'md' }: SessionAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || 'U'

  const sizeClasses = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
  }[size]

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center font-bold select-none ${className}`}>
      <span
        className={`grid place-items-center rounded-full bg-primary/15 text-primary font-semibold ring-2 ring-primary/20 shadow-xs ${sizeClasses}`}
        aria-hidden="true"
      >
        {initial}
      </span>
      {/* Indicador pulsante de sesión activa */}
      <span className="absolute bottom-0 right-0 flex size-3">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-3 rounded-full border-2 border-panel bg-emerald-500" />
      </span>
    </div>
  )
}
