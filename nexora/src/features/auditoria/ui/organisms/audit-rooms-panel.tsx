import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import { useAuditScope } from '../../application/audit-scope-context'
import { useRoomsByStatus } from '../../application/use-rooms-by-status'
import { ConformityBadge } from '../atoms/conformity-badge'
import { PhysicalCheckCell } from '../molecules/physical-check-cell'
import { RoomStatusSegmentedControl } from '../molecules/room-status-segmented-control'

export function AuditRoomsPanel() {
  const { summary } = useAuditScope()
  const { selectedStatus, setSelectedStatus, rooms, loading, error, refetch, setPhysicalCheck } =
    useRoomsByStatus()

  const counts = summary?.entities.habitaciones.by_status || {
    disponibles: 28,
    ocupadas: 9,
    mantenimiento: 2,
    limpieza: 2,
    inactivas: 1,
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 1. Selector de estado tipo Segmented Control */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-ink dark:text-white">
            Matriz Físico vs. Sistema por Estado
          </h3>
          <p className="text-xs text-stone-700 dark:text-stone-300">
            Navega por estado operativo para auditar por excepción sin sobrecargar la vista.
          </p>
        </div>

        <RoomStatusSegmentedControl
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          counts={counts}
        />
      </div>

      {/* 2. Estado de carga / error específico de esta pestaña */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-12 w-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/60" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/40" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/40" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/40" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
            Fallo al obtener habitaciones con estado &ldquo;{selectedStatus}&rdquo;
          </p>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            Reintentar carga
          </button>
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-10 text-center dark:border-stone-800 dark:bg-stone-900/40">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            No hay habitaciones registradas en estado &ldquo;{selectedStatus}&rdquo;
          </p>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
            Selecciona otro estado en el control superior para continuar con la auditoría.
          </p>
        </div>
      ) : (
        <>
          {/* Vista Desktop / Tablet: Tabla Completa */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-stone-100 bg-stone-50/90 text-stone-700 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-300">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 font-semibold">
                      Habitación
                    </th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">
                      Ubicación (Edificio / Piso)
                    </th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">
                      Tarifa en Sistema
                    </th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">
                      Veredicto Sistema
                    </th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">
                      Verificación Física en Campo (Offline)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {rooms.map((room) => (
                    <tr
                      key={room.id}
                      className="hover:bg-stone-50/60 transition-colors dark:hover:bg-stone-800/40"
                    >
                      {/* Número y tipo */}
                      <td className="px-4 py-3.5 font-medium text-ink dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">Hab. {room.number}</span>
                          {room.room_type_name && (
                            <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                              {room.room_type_name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ubicación */}
                      <td className="px-4 py-3.5 text-stone-700 dark:text-stone-300">
                        {room.building_name} · Piso {room.floor}
                      </td>

                      {/* Tarifa aplicada */}
                      <td className="px-4 py-3.5">
                        {room.has_tariff && room.applied_tariff_name ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-ink dark:text-white">
                              {room.applied_tariff_name}
                            </span>
                            {room.applied_tariff_price != null && (
                              <span className="text-[11px] text-stone-700 dark:text-stone-300">
                                S/ {room.applied_tariff_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300">
                            Sin tarifa
                          </span>
                        )}
                      </td>

                      {/* Veredicto */}
                      <td className="px-4 py-3.5">
                        <ConformityBadge verdict={room.verdict} notes={room.verdict_notes} />
                      </td>

                      {/* Verificación física offline */}
                      <td className="px-4 py-3.5">
                        <PhysicalCheckCell
                          roomId={room.id}
                          check={room.physical_check}
                          onChange={setPhysicalCheck}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista Móvil: Tarjetas apiladas (Sección 10 de la propuesta) */}
          <div className="space-y-3 md:hidden">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/90"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-ink dark:text-white">
                    Habitación {room.number}
                  </span>
                  <ConformityBadge verdict={room.verdict} notes={room.verdict_notes} />
                </div>

                <div className="mt-2 text-xs text-stone-700 dark:text-stone-300">
                  <p>
                    {room.building_name} · Piso {room.floor}
                  </p>
                  <p className="mt-1 font-medium">
                    Tarifa:{' '}
                    {room.has_tariff && room.applied_tariff_name ? (
                      <span className="text-ink dark:text-white">
                        {room.applied_tariff_name} (S/ {room.applied_tariff_price?.toFixed(2)})
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold dark:text-rose-400">
                        Sin tarifa
                      </span>
                    )}
                  </p>
                </div>

                <div className="mt-3 border-t border-stone-100 pt-3 dark:border-stone-800">
                  <p className="mb-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                    Inspección física en campo:
                  </p>
                  <PhysicalCheckCell
                    roomId={room.id}
                    check={room.physical_check}
                    onChange={setPhysicalCheck}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
