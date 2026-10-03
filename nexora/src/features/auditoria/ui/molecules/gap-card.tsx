import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import type { InactiveTariffInUse, RoomWithoutTariff } from '../../domain/audit-types'

export interface RoomWithoutTariffCardProps {
  type: 'room_without_tariff'
  room: RoomWithoutTariff
  onAssignTariff: (room: RoomWithoutTariff) => void
}

export interface InactiveTariffCardProps {
  type: 'inactive_tariff_in_use'
  item: InactiveTariffInUse
  onReactivate: (tariffId: string) => void
  onUnlink: (tariffId: string, roomIds: string[]) => void
  isActionInProgress?: boolean
}

export type GapCardProps = RoomWithoutTariffCardProps | InactiveTariffCardProps

export function GapCard(props: GapCardProps) {
  const [expandedRooms, setExpandedRooms] = useState(false)

  if (props.type === 'room_without_tariff') {
    const { room, onAssignTariff } = props
    return (
      <div className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all hover:border-amber-400/50 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/90">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300">
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              Sin tarifa asignada
            </span>
            <span className="text-xs text-stone-700 dark:text-stone-300">
              Piso {room.floor}
            </span>
          </div>

          <div className="mt-3">
            <h4 className="text-xl font-bold tracking-tight text-ink dark:text-white">
              Habitación {room.number}
            </h4>
            <p className="mt-1 text-xs text-stone-700 dark:text-stone-300">
              {room.building_name} · Capacidad: {room.capacity} personas
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-stone-100 pt-4 dark:border-stone-800">
          <button
            type="button"
            onClick={() => onAssignTariff(room)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.98]"
          >
            <span>🏷️ Asignar tarifa</span>
          </button>
        </div>
      </div>
    )
  }

  // Tarifa inactiva en uso
  const { item, onReactivate, onUnlink, isActionInProgress } = props
  const affectedRoomIds = item.affected_rooms.map((r) => r.id)

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all hover:border-rose-400/50 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/90">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800 ring-1 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-300">
            <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
            Tarifa Inactiva en Uso
          </span>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            {item.rooms_count} hab. afectadas
          </span>
        </div>

        <div className="mt-3">
          <h4 className="text-lg font-bold tracking-tight text-ink dark:text-white">
            {item.tariff_name}
          </h4>
          <p className="mt-1 text-xs text-stone-700 dark:text-stone-300">
            Precio: S/ {item.price.toFixed(2)} · Modalidad: {item.modality}
          </p>
        </div>

        {/* Acordeón de habitaciones afectadas */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpandedRooms((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-ink dark:text-stone-300 dark:hover:text-white"
          >
            <span>{expandedRooms ? 'Ocultar' : 'Ver'} habitaciones afectadas ({item.affected_rooms.length})</span>
            <span className="text-[10px]">{expandedRooms ? '▲' : '▼'}</span>
          </button>

          <AnimatePresence>
            {expandedRooms && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1.5 overflow-hidden rounded-xl bg-stone-50 p-2.5 text-xs dark:bg-stone-800/60"
              >
                {item.affected_rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between text-stone-700 dark:text-stone-300"
                  >
                    <span className="font-semibold text-ink dark:text-white">
                      Hab. {room.number}
                    </span>
                    <span className="text-[11px] text-stone-600 dark:text-stone-300">
                      {room.building_name} (Piso {room.floor})
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Botones de acción incrustada */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4 dark:border-stone-800">
        <button
          type="button"
          disabled={isActionInProgress}
          onClick={() => onReactivate(item.tariff_id)}
          className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50"
        >
          {isActionInProgress ? 'Procesando...' : 'Reactivar tarifa'}
        </button>

        <button
          type="button"
          disabled={isActionInProgress}
          onClick={() => onUnlink(item.tariff_id, affectedRoomIds)}
          className="flex-1 inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition-all hover:border-rose-300 hover:text-rose-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-rose-600 disabled:opacity-50"
        >
          Desvincular
        </button>
      </div>
    </div>
  )
}
