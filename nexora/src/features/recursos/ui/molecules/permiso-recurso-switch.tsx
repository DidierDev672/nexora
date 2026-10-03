import { motion } from 'motion/react'
import { Button } from '../atoms/button'
import { AnimatedText } from '../atoms/animated-text'

export interface PermisoRecursoSwitchProps {
  checked: boolean
  resourceId: string
  loading?: boolean
  errorMessage?: string | null
  retrying?: boolean
  onRetry?: () => void
}

interface Palette {
  surface: string
  border: string
  track: string
  thumb: string
  label: string
  description: string
}

const activePalette: Palette = {
  surface: 'rgba(200, 210, 166, 0.45)',
  border: '#A9C632',
  track: '#A9C632',
  thumb: '#E6D4A6',
  label: '#1D2E1B',
  description: 'rgba(29, 46, 27, 0.72)',
}

const inactivePalette: Palette = {
  surface: 'rgba(253, 227, 207, 0.6)',
  border: '#F8A91F',
  track: '#EC6426',
  thumb: '#FDE3CF',
  label: '#632713',
  description: 'rgba(99, 39, 19, 0.72)',
}

export function PermisoRecursoSwitch({
  checked,
  resourceId,
  loading = false,
  errorMessage = null,
  retrying = false,
  onRetry,
}: PermisoRecursoSwitchProps) {
  if (errorMessage !== null) {
    return (
      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-ink">Permiso para recursos</span>
        <div role="alert" className="rounded-lg border border-danger/15 bg-danger/5 px-3.5 py-3">
          <p className="text-xs font-bold text-ink">No pudimos leer el permiso del recurso</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{errorMessage}</p>
          <Button
            variant="secondary"
            onClick={onRetry}
            disabled={retrying}
            className="mt-2 px-2.5 py-1.5 text-xs"
          >
            {retrying ? 'Cargando…' : 'Volver a intentar'}
          </Button>
        </div>
      </div>
    )
  }

  const palette = checked ? activePalette : inactivePalette
  const stateKey = loading ? 'loading' : !resourceId ? 'empty' : checked ? 'active' : 'inactive'

  const description = loading
    ? 'Consultando el estado…'
    : !resourceId
      ? 'Elegí un recurso para ver su estado.'
      : checked
        ? 'Activo: este recurso tiene permiso asignado.'
        : 'Inactivo: este recurso no tiene permiso asignado.'

  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-disabled="true"
      aria-label="Permiso para recursos"
      className="flex cursor-default items-center justify-between gap-4 rounded-xl border px-4 py-3.5 transition-colors duration-300"
      style={{ borderColor: palette.border, backgroundColor: palette.surface }}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium" style={{ color: palette.label }}>
          <AnimatedText text="Permiso para recursos" />
        </span>
        <span className="mt-0.5 block text-xs" style={{ color: palette.description }}>
          <AnimatedText key={stateKey} text={description} delay={0.06} />
        </span>
      </span>

      <span
        aria-hidden="true"
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300"
        style={{ backgroundColor: palette.track }}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="inline-block size-4 rounded-full shadow-sm"
          style={{ backgroundColor: palette.thumb, marginLeft: checked ? 24 : 4 }}
        />
      </span>
    </div>
  )
}
