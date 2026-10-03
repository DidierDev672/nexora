import type { HabitacionOcupadaModel } from '../../domain/habitacion-ocupada'

export interface HabitacionOcupadaTablaProps {
  model: HabitacionOcupadaModel
  className?: string
  showDetailedGuests?: boolean
}

/**
 * Tabla accesible y responsiva que muestra el estado "OCUPADA" de la habitación,
 * evidenciando los datos de la estancia e impidiendo la asignación de nuevos huéspedes.
 */
export function HabitacionOcupadaTabla({
  model,
  className = '',
}: HabitacionOcupadaTablaProps) {
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'No definida'
    try {
      const d = new Date(isoString)
      return isNaN(d.getTime())
        ? isoString
        : d.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
    } catch {
      return isoString
    }
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-rose-500/30 bg-panel shadow-md ${className}`}>
      {/* Cabecera de la tabla con estado bloqueante */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-500/20 bg-rose-500/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="size-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h4 className="font-bold text-sm sm:text-base text-ink">
            Estado de Habitación {model.roomNumber}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {/* Badge obligatorio que dice "OCUPADA" */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/50 bg-rose-500/20 px-3 py-1 font-mono text-xs font-black tracking-wider text-rose-700 dark:text-rose-300 uppercase shadow-xs">
            <span className="size-2 rotate-45 rounded-xs bg-rose-600 shadow-xs" />
            {model.statusLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas/80 px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
            🔒 Asignación bloqueada
          </span>
        </div>
      </div>

      {/* Contenido de la Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line/60 bg-canvas/50 text-[10px] uppercase tracking-wider text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-bold">Habitación</th>
              <th scope="col" className="px-4 py-2.5 font-bold">Estado</th>
              <th scope="col" className="px-4 py-2.5 font-bold">Huésped Titular</th>
              <th scope="col" className="px-4 py-2.5 font-bold">Fecha de entrada / Fecha de salida</th>
              <th scope="col" className="px-4 py-2.5 font-bold text-right">Disponibilidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/40 font-medium text-ink">
            <tr className="hover:bg-panel-muted/40 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap font-bold text-ink">
                Habitación {model.roomNumber}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center rounded-md bg-rose-500/15 px-2 py-0.5 text-xs font-black text-rose-700 dark:text-rose-300">
                  {model.statusLabel}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-semibold text-ink">{model.primaryGuestName}</span>
                {model.guestsCount > 1 && (
                  <span className="ml-1 text-[11px] text-ink-muted font-normal">
                    (+{model.guestsCount - 1} acompañante{model.guestsCount > 2 ? 's' : ''})
                  </span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-ink-muted text-[11px]">
                <div>Entrada: <span className="text-ink font-mono font-medium">{formatDate(model.checkInDate)}</span></div>
                <div>Salida: <span className="text-ink font-mono font-medium">{formatDate(model.checkOutDate)}</span></div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas/60 px-3 py-1 text-[11px] font-bold text-ink-muted opacity-60 cursor-not-allowed"
                  title="No se permite asignar más huéspedes porque la habitación está ocupada"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>No permite asignar</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Banner de bloqueo inferior */}
      <div className="border-t border-rose-500/20 bg-rose-500/5 px-4 py-2.5 text-center text-xs text-rose-700 dark:text-rose-300 font-medium">
        ⚠️ {model.blockingReason}
      </div>
    </div>
  )
}
