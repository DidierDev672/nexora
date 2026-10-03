import type { ClientSession, PersonApiResponse } from '../../domain/reserva'
import { SessionAvatar } from '../atoms/session-avatar'

export interface ClientSessionCardProps {
  session: ClientSession
  availablePersons?: PersonApiResponse[]
  isReservingForOther?: boolean
  selectedPersonId?: string
  onToggleReservingForOther?: (forOther: boolean) => void
  onSelectPerson?: (id: string) => void
  className?: string
}

export function ClientSessionCard({
  session,
  availablePersons = [],
  isReservingForOther = false,
  selectedPersonId,
  onToggleReservingForOther,
  onSelectPerson,
  className = '',
}: ClientSessionCardProps) {
  return (
    <div
      className={`rounded-2xl border border-line bg-panel p-5 shadow-xs transition-all ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Información del cliente en sesión */}
        <div className="flex items-center gap-3.5">
          <SessionAvatar name={session.name} size="md" />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-ink">
                ¡Hola, {session.name}!
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Sesión Activa · Titular
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {session.email || 'Cuenta autenticada en Nexora'}
            </p>
          </div>
        </div>

        {/* Toggle para reservar para otra persona */}
        {onToggleReservingForOther && (
          <label className="flex items-center gap-2 self-start rounded-xl border border-line/60 bg-canvas/60 px-3 py-1.5 text-xs font-medium text-ink cursor-pointer hover:bg-canvas transition-colors sm:self-auto select-none">
            <input
              type="checkbox"
              checked={isReservingForOther}
              onChange={(e) => onToggleReservingForOther(e.target.checked)}
              className="size-3.5 rounded border-line text-primary focus:ring-primary/30"
            />
            <span>¿Reservar para un acompañante?</span>
          </label>
        )}
      </div>

      {/* Selector si decide reservar para un tercero */}
      {isReservingForOther && availablePersons.length > 0 && onSelectPerson && (
        <div className="mt-4 pt-4 border-t border-line/70">
          <label htmlFor="other-person-select" className="block text-xs font-semibold text-ink mb-1.5">
            Selecciona el huésped titular asignado:
          </label>
          <select
            id="other-person-select"
            value={selectedPersonId || ''}
            onChange={(e) => onSelectPerson(e.target.value)}
            className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {availablePersons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.phone_number || p.email || 'Huésped'}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
