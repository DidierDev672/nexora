import type { HabitacionEstadoKey } from '../../domain/habitacion-lista'

interface HabitacionStatusBadgeProps {
  status: HabitacionEstadoKey
  className?: string
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  available: {
    label: 'Disponible',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500/25',
  },
  disponible: {
    label: 'Disponible',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500/25',
  },
  occupied: {
    label: 'Ocupada',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    border: 'border-rose-500/25',
  },
  ocupada: {
    label: 'Ocupada',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    border: 'border-rose-500/25',
  },
  maintenance: {
    label: 'Mantenimiento',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    border: 'border-amber-500/25',
  },
  mantenimiento: {
    label: 'Mantenimiento',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    border: 'border-amber-500/25',
  },
  cleaning: {
    label: 'Limpieza',
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    text: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500',
    border: 'border-sky-500/25',
  },
  limpieza: {
    label: 'Limpieza',
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    text: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500',
    border: 'border-sky-500/25',
  },
  inactive: {
    label: 'Inactiva',
    bg: 'bg-neutral/10 dark:bg-neutral/20',
    text: 'text-ink-muted',
    dot: 'bg-neutral',
    border: 'border-line',
  },
  inactiva: {
    label: 'Inactiva',
    bg: 'bg-neutral/10 dark:bg-neutral/20',
    text: 'text-ink-muted',
    dot: 'bg-neutral',
    border: 'border-line',
  },
}

export function HabitacionStatusBadge({ status, className = '' }: HabitacionStatusBadgeProps) {
  const norm = String(status).toLowerCase().trim()
  const config = STATUS_CONFIG[norm] || {
    label: norm ? norm.charAt(0).toUpperCase() + norm.slice(1) : 'Desconocido',
    bg: 'bg-primary/10',
    text: 'text-primary',
    dot: 'bg-primary',
    border: 'border-primary/20',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  )
}
