import { useState } from 'react'
import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import { RecepcionesList } from './recepciones-list'
import { SedeDetalleModal } from '../molecules/sede-detalle-modal'
import { HabitacionDetalleModal } from '../molecules/habitacion-detalle-modal'
import { useRecepcionesList } from '../../application/use-recepciones-list'
import { Button } from '../../../recursos/ui/atoms/button'

export interface RecepcionesDashboardSectionProps {
  onNavigateToRecepcion?: () => void
}

export function RecepcionesDashboardSection({
  onNavigateToRecepcion,
}: RecepcionesDashboardSectionProps) {
  const {
    recepciones,
    totalCount,
    loading,
    error,
    sedes,
    searchQuery,
    setSearchQuery,
    selectedSedeId,
    setSelectedSedeId,
    hasMore,
    loadMore,
    reload,
  } = useRecepcionesList()

  // Estados para modales interactivos de inspección rápida
  const [inspectSedeId, setInspectSedeId] = useState<string | null>(null)
  const [inspectRoomId, setInspectRoomId] = useState<string | null>(null)
  const [inspectCamaId, setInspectCamaId] = useState<string | null>(null)

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      aria-label="Supervisión de recepciones y estadías"
      className="space-y-6"
    >
      {/* Cabecera de la Sección con Copywriting Empático y Acción Primaria */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-ink">Recepciones y estadías activas</h2>
            {!loading && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                {totalCount} {totalCount === 1 ? 'estadía' : 'estadías'}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-muted sm:text-sm">
            Supervisa las estadías activas en toda tu red, consulta fechas de ingreso y salida e inspecciona el detalle de cada recepción.
          </p>
        </div>

        {onNavigateToRecepcion && (
          <div className="shrink-0">
            <Button
              type="button"
              variant="primary"
              onClick={onNavigateToRecepcion}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="size-4"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Nuevo recepcion</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tabla Interactiva de Recepciones (con filtros por Sede, búsqueda, ordenamiento y scroll infinito) */}
      <RecepcionesList
        recepciones={recepciones}
        totalCount={totalCount}
        loading={loading}
        error={error}
        sedes={sedes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSedeId={selectedSedeId}
        onSedeChange={setSelectedSedeId}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onReload={reload}
        onOpenSede={(sedeId) => setInspectSedeId(sedeId)}
        onOpenHabitacion={(roomId, camaId) => {
          setInspectRoomId(roomId)
          setInspectCamaId(camaId ?? null)
        }}
        onNewCheckIn={() => onNavigateToRecepcion?.()}
      />

      {/* Modal Interactivo de Inspección de Sede (Sub-sedes y Edificios) */}
      <SedeDetalleModal
        sedeId={inspectSedeId}
        onClose={() => setInspectSedeId(null)}
      />

      {/* Modal Interactivo de Inspección de Habitación (Cama y Tipo de Cama asignados) */}
      <HabitacionDetalleModal
        roomId={inspectRoomId}
        camaId={inspectCamaId}
        onClose={() => {
          setInspectRoomId(null)
          setInspectCamaId(null)
        }}
      />
    </motion.section>
  )
}
