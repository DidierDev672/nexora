import type { TarifaInput } from '../../domain/tarifa'

export interface TarifaPreviewCardProps {
  input: TarifaInput
  sedeNombre?: string
  subSedeNombre?: string
  tipoCamaNombre?: string
}

const MODALIDAD_LABELS: Record<string, string> = {
  manana: 'Mañana (Turno matutino)',
  tarde: 'Tarde (Turno vespertino)',
  noche: 'Noche (Estadía nocturna)',
  dias: 'Días (Día completo)',
  semanal: 'Semanal (7 días)',
  horas: 'Horas (Fracción por horas)',
  morning: 'Mañana (Turno matutino)',
  afternoon: 'Tarde (Turno vespertino)',
  night: 'Noche (Estadía nocturna)',
  day: 'Días (Día completo)',
  weekly: 'Semanal (7 días)',
  hour: 'Horas (Fracción por horas)',
}

const DIAS_LABELS: Record<string, string> = {
  todos_los_dias: 'Todos los días',
  fin_de_semana: 'Fin de semana',
  semanal: 'Semanal (Lunes a Jueves)',
  all: 'Todos los días',
  weekend: 'Fin de semana',
  weekday: 'Semanal (Lunes a Jueves)',
}

export function TarifaPreviewCard({
  input,
  sedeNombre,
  subSedeNombre,
  tipoCamaNombre,
}: TarifaPreviewCardProps) {
  const precioNumero = Number.parseFloat(input.precio)
  const precioValido = !Number.isNaN(precioNumero) && precioNumero > 0
  const isActivo = input.estado === 'activo'

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-panel via-panel to-canvas/70 p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-primary animate-ping" />
          <p className="text-xs font-semibold tracking-wider uppercase text-ink-muted">
            Vista previa en vivo de la tarifa
          </p>
          {tipoCamaNombre && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Mobiliario 3D: {tipoCamaNombre}
            </span>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isActivo
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'bg-neutral/15 text-ink-muted'
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              isActivo ? 'bg-emerald-500' : 'bg-neutral'
            }`}
          />
          {isActivo ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h3 className="text-lg font-bold text-ink sm:text-xl line-clamp-1">
            {input.nombre.trim() || 'Nombre de la tarifa'}
          </h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            {sedeNombre ? `Sede: ${sedeNombre}` : 'Sin sede seleccionada'}
            {subSedeNombre ? ` · ${subSedeNombre}` : ''}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-2xl font-black tracking-tight text-primary sm:text-3xl">
            {precioValido ? `$ ${precioNumero.toFixed(2)}` : '$ 0.00'}
          </div>
          <p className="text-[11px] font-medium text-ink-soft">
            {input.modalidad ? MODALIDAD_LABELS[input.modalidad] ?? input.modalidad : 'Modalidad sin asignar'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line/60 pt-3 text-xs sm:grid-cols-4">
        <div>
          <span className="block text-[10px] uppercase font-semibold text-ink-soft">Duración</span>
          <span className="font-medium text-ink">
            {input.duracion ? `${input.duracion} unidad(es)` : 'No especificada'}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-semibold text-ink-soft">Días de semana</span>
          <span className="font-medium text-ink">
            {input.diasSemana ? DIAS_LABELS[input.diasSemana] ?? input.diasSemana : 'No asignado'}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-semibold text-ink-soft">Vigencia inicio</span>
          <span className="font-medium text-ink">
            {input.fechaInicio || 'Pendiente'}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-semibold text-ink-soft">Vigencia fin</span>
          <span className="font-medium text-ink">
            {input.fechaFinal || 'Pendiente'}
          </span>
        </div>
      </div>
    </div>
  )
}
