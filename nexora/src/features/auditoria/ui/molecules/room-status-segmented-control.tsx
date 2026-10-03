import { motion } from 'motion/react'
import { useRef, type KeyboardEvent } from 'react'
import type { RoomAuditStatus } from '../../domain/audit-types'

export interface RoomStatusOption {
  status: RoomAuditStatus
  label: string
  count: number
  colorDot: string
}

export interface RoomStatusSegmentedControlProps {
  selectedStatus: RoomAuditStatus
  onSelectStatus: (status: RoomAuditStatus) => void
  counts: Record<RoomAuditStatus, number>
}

export function RoomStatusSegmentedControl({
  selectedStatus,
  onSelectStatus,
  counts,
}: RoomStatusSegmentedControlProps) {
  const options: RoomStatusOption[] = [
    {
      status: 'disponibles',
      label: 'Disponibles',
      count: counts.disponibles ?? 0,
      colorDot: 'bg-emerald-500',
    },
    {
      status: 'ocupadas',
      label: 'Ocupadas',
      count: counts.ocupadas ?? 0,
      colorDot: 'bg-blue-500',
    },
    {
      status: 'mantenimiento',
      label: 'Mantenimiento',
      count: counts.mantenimiento ?? 0,
      colorDot: 'bg-amber-500',
    },
    {
      status: 'limpieza',
      label: 'Limpieza',
      count: counts.limpieza ?? 0,
      colorDot: 'bg-indigo-500',
    },
    {
      status: 'inactivas',
      label: 'Inactivas',
      count: counts.inactivas ?? 0,
      colorDot: 'bg-stone-400',
    },
  ]

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % options.length
      onSelectStatus(options[nextIndex].status)
      buttonRefs.current[nextIndex]?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prevIndex = (currentIndex - 1 + options.length) % options.length
      onSelectStatus(options[prevIndex].status)
      buttonRefs.current[prevIndex]?.focus()
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Filtrar habitaciones por estado físico de auditoría"
      className="inline-flex w-full flex-wrap gap-1.5 rounded-2xl bg-stone-100/90 p-1.5 dark:bg-stone-900/80 sm:w-auto"
    >
      {options.map((opt, index) => {
        const isSelected = selectedStatus === opt.status
        return (
          <button
            key={opt.status}
            ref={(el) => {
              buttonRefs.current[index] = el
            }}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-pressed={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelectStatus(opt.status)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isSelected
                ? 'text-ink dark:text-white shadow-sm'
                : 'text-stone-700 hover:text-ink dark:text-stone-300 dark:hover:text-stone-200'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="active-room-status-indicator"
                className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-stone-800"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <span className={`size-2 rounded-full ${opt.colorDot}`} aria-hidden="true" />
              <span>{opt.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
                  isSelected
                    ? 'bg-stone-100 text-stone-900 dark:bg-stone-700 dark:text-white'
                    : 'bg-stone-200/70 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                {opt.count}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
