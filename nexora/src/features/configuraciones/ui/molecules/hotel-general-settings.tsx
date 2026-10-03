import { motion } from 'motion/react'
import { ConfiguracionToggle } from '../atoms/configuracion-toggle'
import type { PreferenciasHotel } from '../../domain/configuracion'
import {
  ShieldIcon,
  ConciergeBellIcon,
  TrendingUpIcon,
  BuildingIcon,
  AlertTriangleIcon,
} from '../../../dashboard/ui/icons'

export interface HotelGeneralSettingsProps {
  preferencias: PreferenciasHotel
  onToggle: (clave: keyof PreferenciasHotel) => void
  onSedeChange: (sedeId: string) => void
}

export function HotelGeneralSettings({
  preferencias,
  onToggle,
  onSedeChange,
}: HotelGeneralSettingsProps) {
  return (
    <section
      aria-label="Parámetros y políticas operativas del hotel"
      className="rounded-3xl border border-line bg-panel p-6 sm:p-8 shadow-xs"
    >
      <div className="mb-6 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Políticas y Preferencias del Sistema
          </h2>
          <p className="mt-1 text-xs text-ink-muted sm:text-sm">
            Establece salvaguardas, reglas de negocio y políticas por defecto para todas tus sedes.
          </p>
        </div>

        <div className="mt-2 sm:mt-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1 text-xs font-semibold text-ink-muted">
            <BuildingIcon className="size-3.5 text-primary" />
            Configuración global
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Depósito de garantía */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-canvas/40 p-4 transition-colors hover:border-primary/20"
        >
          <div className="flex gap-3">
            <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldIcon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Depósito de garantía</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Exigir comprobante de depósito antes de liberar llave de habitación.
              </p>
            </div>
          </div>
          <ConfiguracionToggle
            id="deposito-garantia"
            checked={preferencias.depositoGarantiaRequerido}
            onChange={() => onToggle('depositoGarantiaRequerido')}
            label="Depósito de garantía"
          />
        </motion.div>

        {/* Check-in express */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-canvas/40 p-4 transition-colors hover:border-primary/20"
        >
          <div className="flex gap-3">
            <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ConciergeBellIcon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Check-in Express</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Habilitar asignación rápida de habitaciones para huéspedes frecuentes.
              </p>
            </div>
          </div>
          <ConfiguracionToggle
            id="checkin-express"
            checked={preferencias.checkinExpress}
            onChange={() => onToggle('checkinExpress')}
            label="Check-in Express"
          />
        </motion.div>

        {/* Alerta de alta ocupación */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-canvas/40 p-4 transition-colors hover:border-primary/20"
        >
          <div className="flex gap-3">
            <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <TrendingUpIcon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Alertas de alta ocupación</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Notificar al personal cuando la ocupación supere el 85%.
              </p>
            </div>
          </div>
          <ConfiguracionToggle
            id="alerta-ocupacion"
            checked={preferencias.alertaOcupacionAlta}
            onChange={() => onToggle('alertaOcupacionAlta')}
            label="Alertas de alta ocupación"
          />
        </motion.div>

        {/* Auditoría estricta */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-canvas/40 p-4 transition-colors hover:border-primary/20"
        >
          <div className="flex gap-3">
            <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldIcon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Registro de auditoría (Fail-safe)</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Trazabilidad inmutable de cambios en tarifas, usuarios y cancelaciones.
              </p>
            </div>
          </div>
          <ConfiguracionToggle
            id="auditoria-segura"
            checked={preferencias.auditoriaSegura}
            onChange={() => onToggle('auditoriaSegura')}
            label="Registro de auditoría seguro"
          />
        </motion.div>

        {/* Modo Mantenimiento */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-canvas/40 p-4 transition-colors hover:border-primary/20"
        >
          <div className="flex gap-3">
            <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangleIcon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Modo mantenimiento</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Restringe altas temporales durante conciliaciones de cierre.
              </p>
            </div>
          </div>
          <ConfiguracionToggle
            id="modo-mantenimiento"
            checked={preferencias.modoMantenimiento}
            onChange={() => onToggle('modoMantenimiento')}
            label="Modo mantenimiento"
          />
        </motion.div>

        {/* Selector de Sede Predeterminada */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col justify-between rounded-2xl border border-line bg-canvas/40 p-4 transition-colors hover:border-primary/20"
        >
          <div>
            <p className="text-sm font-semibold text-ink">Sede predeterminada</p>
            <p className="text-xs text-ink-muted mt-0.5">
              Punto de operación por defecto al iniciar sesión.
            </p>
          </div>
          <select
            value={preferencias.sedePredeterminadaId}
            onChange={(e) => onSedeChange(e.target.value)}
            className="mt-3 w-full rounded-xl border border-line bg-panel px-3 py-2 text-xs font-semibold text-ink focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="sede-central">Sede Principal - Centro Histórico</option>
            <option value="sede-norte">Sede Norte - Distrito Empresarial</option>
            <option value="sede-costa">Sede Costa - Resort Bahía</option>
          </select>
        </motion.div>
      </div>
    </section>
  )
}
