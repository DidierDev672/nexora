import { formatPrecioCOP, RESERVA_ESTADO_OPTIONS, type BedItem3D, type ClientSession } from '../../domain/reserva'
import { BedTypeBadge } from '../atoms/bed-type-badge'
import { NightBadge } from '../atoms/night-badge'

export interface ReservaSummaryCardProps {
  clientSession: ClientSession
  guestName?: string
  assignedBed: BedItem3D | null
  checkInDate: string
  checkOutDate: string
  nights: number
  numberOfGuests: number
  totalPrice: number
  state: string
  onStateChange: (state: string) => void
  submitting?: boolean
  onSubmit: (e?: React.FormEvent) => void
  className?: string
}

export function ReservaSummaryCard({
  clientSession,
  guestName,
  assignedBed,
  checkInDate,
  checkOutDate,
  nights,
  numberOfGuests,
  totalPrice,
  state,
  onStateChange,
  submitting = false,
  onSubmit,
  className = '',
}: ReservaSummaryCardProps) {
  const titular = guestName || clientSession.name

  return (
    <div
      className={`rounded-2xl border border-line bg-panel p-6 shadow-sm sticky top-6 space-y-5 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h3 className="text-base font-bold text-ink">Resumen de tu Estadía</h3>
          <p className="text-xs text-ink-muted mt-0.5">Desglose transparente en tiempo real</p>
        </div>
        <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary text-sm">
          📋
        </span>
      </div>

      {/* Huésped Titular */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-muted">Huésped Titular:</span>
        <span className="font-bold text-ink truncate max-w-[170px]" title={titular}>
          {titular}
        </span>
      </div>

      {/* Cama 3D Asignada */}
      <div className="rounded-xl border border-line/70 bg-canvas/60 p-3.5 space-y-2">
        <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
          Alojamiento Seleccionado
        </span>
        {assignedBed ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <strong className="text-xs font-bold text-ink truncate">
                {assignedBed.roomName}
              </strong>
              <BedTypeBadge typeName={assignedBed.typeName} size="sm" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-ink-muted">
              <span>{assignedBed.etiquette} · Piso {assignedBed.floorNumber || 1}</span>
              <span className="font-semibold text-primary">
                {formatPrecioCOP(assignedBed.pricePerNight)}/noche
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 py-1">
            <span className="animate-bounce">👉</span>
            <span>Arrastra una cama 3D para completar</span>
          </div>
        )}
      </div>

      {/* Fechas y Noches */}
      <div className="space-y-2 text-xs border-b border-line pb-4">
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Entrada:</span>
          <strong className="text-ink font-semibold">{checkInDate || 'Pendiente'}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Salida:</span>
          <strong className="text-ink font-semibold">{checkOutDate || 'Pendiente'}</strong>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-ink-muted">Duración:</span>
          <NightBadge nights={nights} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Huéspedes:</span>
          <strong className="text-ink font-semibold">
            {numberOfGuests} {numberOfGuests === 1 ? 'persona' : 'personas'}
          </strong>
        </div>
      </div>

      {/* Estado Inicial de Reserva */}
      <div className="space-y-1.5">
        <label htmlFor="summary-state-select" className="block text-xs font-semibold text-ink">
          Estado inicial de la reserva:
        </label>
        <select
          id="summary-state-select"
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {RESERVA_ESTADO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desglose Financiero */}
      <div className="space-y-2 pt-2 border-t border-line">
        {assignedBed && nights > 0 ? (
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>
              {formatPrecioCOP(assignedBed.pricePerNight)} × {nights} {nights === 1 ? 'noche' : 'noches'}
            </span>
            <span className="font-medium text-ink">{formatPrecioCOP(totalPrice)}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>Impuestos hoteleros e IVA:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Incluidos</span>
        </div>

        <div className="flex items-baseline justify-between pt-2 border-t border-line/70">
          <span className="text-sm font-bold text-ink">Total estimado:</span>
          <span className="text-xl font-extrabold text-primary">
            {formatPrecioCOP(totalPrice)}
          </span>
        </div>
      </div>

      {/* Botón de Confirmación */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || !assignedBed}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary/90 active:scale-[0.99] transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary"
      >
        {submitting ? (
          <>
            <svg
              className="size-4 animate-spin text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
            <span>Asegurando reserva…</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>Confirmar y asegurar reserva</span>
          </>
        )}
      </button>

      {/* Garantía Ética (Leyes de Asimov) */}
      <p className="text-[11px] leading-relaxed text-ink-muted text-center">
        🔒 <strong>Garantía Nexora:</strong> Sin cargos sorpresa ni cobros indebidos. Tus fechas y aforo han sido verificados contra la integridad física de la habitación.
      </p>
    </div>
  )
}
