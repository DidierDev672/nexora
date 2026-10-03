import { useState } from 'react'
import type { EntitySummary } from '../../domain/audit-types'

export interface EntitySummaryChipsProps {
  entities: EntitySummary
  className?: string
}

interface ChipItem {
  id: string
  label: string
  total: number
  active?: number
  inactive?: number
  details?: string
}

export function EntitySummaryChips({ entities, className = '' }: EntitySummaryChipsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const chips: ChipItem[] = [
    {
      id: 'sedes',
      label: 'Sedes',
      total: entities.sedes.total,
      active: entities.sedes.active,
      inactive: entities.sedes.inactive,
    },
    {
      id: 'sub_sedes',
      label: 'Sub Sedes',
      total: entities.sub_sedes.total,
      active: entities.sub_sedes.active,
      inactive: entities.sub_sedes.inactive,
    },
    {
      id: 'edificios',
      label: 'Edificios',
      total: entities.edificios.total,
      active: entities.edificios.active,
      inactive: entities.edificios.inactive,
    },
    {
      id: 'habitaciones',
      label: 'Habitaciones',
      total: entities.habitaciones.total,
      active: entities.habitaciones.active,
      inactive: entities.habitaciones.inactive,
      details: `${entities.habitaciones.by_status.disponibles} disp. · ${entities.habitaciones.by_status.ocupadas} ocup. · ${entities.habitaciones.by_status.mantenimiento} mant.`,
    },
    {
      id: 'tipos_cama',
      label: 'Tipos de cama',
      total: entities.tipos_cama.total,
      active: entities.tipos_cama.active,
      inactive: entities.tipos_cama.inactive,
    },
    {
      id: 'tarifas',
      label: 'Tarifas catálogo',
      total: entities.tarifas.total,
      active: entities.tarifas.active,
      inactive: entities.tarifas.inactive,
    },
    {
      id: 'tarifas_aplicadas',
      label: 'Tarifas aplicadas',
      total: entities.tarifas_aplicadas.total,
      details: `${entities.tarifas_aplicadas.unique_rooms} habitaciones cubiertas`,
    },
  ]

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          Desglose de Entidades en Auditoría
        </h4>
        <span className="text-[11px] text-stone-600 dark:text-stone-300">
          Pasa el cursor para ver activos / inactivos
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => {
          const isHovered = hoveredId === chip.id
          return (
            <div
              key={chip.id}
              className="relative inline-block"
              onMouseEnter={() => setHoveredId(chip.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(chip.id)}
              onBlur={() => setHoveredId(null)}
              tabIndex={0}
              role="group"
              aria-label={`${chip.label}: ${chip.total} en total`}
            >
              <div className="inline-flex items-center gap-2 rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-primary/40 hover:bg-white dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:bg-stone-800">
                <span className="text-stone-700 dark:text-stone-300">{chip.label}</span>
                <span className="rounded-md bg-stone-200/70 px-1.5 py-0.5 text-[11px] font-bold text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                  {chip.total}
                </span>
              </div>

              {/* Tooltip con desglose activo / inactivo */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-stone-900 px-3 py-2 text-xs text-white shadow-xl dark:bg-stone-100 dark:text-stone-900 animate-in fade-in zoom-in-95 duration-150">
                  <p className="font-semibold">{chip.label}</p>
                  {chip.active !== undefined && chip.inactive !== undefined ? (
                    <div className="mt-1 flex items-center gap-3 text-[11px] opacity-90">
                      <span className="text-emerald-300 dark:text-emerald-700">
                        ● {chip.active} activas
                      </span>
                      <span className="text-stone-400 dark:text-stone-500">
                        ● {chip.inactive} inactivas
                      </span>
                    </div>
                  ) : null}
                  {chip.details && (
                    <p className="mt-1 text-[11px] opacity-80 text-stone-300 dark:text-stone-600">
                      {chip.details}
                    </p>
                  )}
                  {/* Flecha indicadora */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900 dark:border-t-stone-100" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
