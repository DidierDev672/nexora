import { NightBadge } from '../atoms/night-badge'

export interface StayDatePickerProps {
  checkInDate: string
  checkOutDate: string
  nights: number
  onChange: (field: 'checkInDate' | 'checkOutDate', value: string) => void
  checkInError?: string
  checkOutError?: string
  className?: string
}

function getTodayString(): string {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getMinCheckOut(checkIn: string): string {
  if (!checkIn) return getTodayString()
  const d = new Date(checkIn)
  d.setDate(d.getDate() + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function StayDatePicker({
  checkInDate,
  checkOutDate,
  nights,
  onChange,
  checkInError,
  checkOutError,
  className = '',
}: StayDatePickerProps) {
  const today = getTodayString()
  const minCheckOut = getMinCheckOut(checkInDate)

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-ink">
          Periodo de Estadía <span className="text-danger">*</span>
        </label>
        <NightBadge nights={nights} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Entrada Check-in */}
        <div className="space-y-1">
          <label htmlFor="check-in-input" className="block text-xs font-medium text-ink-muted">
            Fecha de entrada (Check-in)
          </label>
          <div className="relative">
            <input
              id="check-in-input"
              type="date"
              min={today}
              value={checkInDate}
              onChange={(e) => onChange('checkInDate', e.target.value)}
              className={`w-full rounded-xl border bg-panel px-3.5 py-2.5 text-xs font-semibold text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                checkInError ? 'border-danger' : 'border-line'
              }`}
            />
          </div>
          {checkInError && (
            <p role="alert" className="text-[11px] font-medium text-danger">
              {checkInError}
            </p>
          )}
        </div>

        {/* Salida Check-out */}
        <div className="space-y-1">
          <label htmlFor="check-out-input" className="block text-xs font-medium text-ink-muted">
            Fecha de salida (Check-out)
          </label>
          <div className="relative">
            <input
              id="check-out-input"
              type="date"
              min={minCheckOut}
              value={checkOutDate}
              onChange={(e) => onChange('checkOutDate', e.target.value)}
              className={`w-full rounded-xl border bg-panel px-3.5 py-2.5 text-xs font-semibold text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                checkOutError ? 'border-danger' : 'border-line'
              }`}
            />
          </div>
          {checkOutError && (
            <p role="alert" className="text-[11px] font-medium text-danger">
              {checkOutError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
