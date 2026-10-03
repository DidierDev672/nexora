import { motion, AnimatePresence } from 'motion/react'
import type { NavId } from '../../../dashboard/ui/navigation'
import type { DashboardCardDefinition } from '../../../dashboard/domain/dashboard-card'
import { DashboardNavCard } from '../../../dashboard/ui/molecules/dashboard-nav-card'
import { ModuloFilterBar } from '../molecules/modulo-filter-bar'
import type { ModuloCategoria } from '../../domain/configuracion'
import { InfoIcon } from '../../../dashboard/ui/icons'

export interface ModulosHotelSectionProps {
  onNavigate: (id: NavId) => void
  modulos: readonly DashboardCardDefinition[]
  busqueda: string
  onBusquedaChange: (val: string) => void
  categoriaActiva: ModuloCategoria
  onCategoriaChange: (cat: ModuloCategoria) => void
  totalModulos: number
  className?: string
}

export function ModulosHotelSection({
  onNavigate,
  modulos,
  busqueda,
  onBusquedaChange,
  categoriaActiva,
  onCategoriaChange,
  totalModulos,
  className = '',
}: ModulosHotelSectionProps) {
  return (
    <section
      aria-label="Panel de configuración de módulos del hotel"
      className={`rounded-3xl border border-line bg-panel p-6 sm:p-8 shadow-xs ${className}`}
    >
      {/* Cabecera de la sección Módulos del Hotel */}
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Módulos del hotel
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-0.5 text-xs font-semibold text-ink-muted shadow-2xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              {modulos.length === totalModulos
                ? `${totalModulos} módulos disponibles`
                : `${modulos.length} de ${totalModulos} módulos`}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-muted sm:text-sm">
            Explora y gestiona cada área de tu red hotelera con un solo clic.
          </p>
        </div>
      </div>

      {/* Barra de filtros por categoría y buscador dinámico */}
      <div className="mb-6">
        <ModuloFilterBar
          busqueda={busqueda}
          onBusquedaChange={onBusquedaChange}
          categoriaActiva={categoriaActiva}
          onCategoriaChange={onCategoriaChange}
        />
      </div>

      {/* Grid interactivo de tarjetas de módulos */}
      <AnimatePresence mode="wait">
        {modulos.length > 0 ? (
          <motion.div
            key={`grid-${categoriaActiva}-${busqueda}`}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.04, delayChildren: 0.05 },
              },
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:gap-5 lg:gap-6"
          >
            {modulos.map((card) => (
              <DashboardNavCard
                key={card.id}
                card={card}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-12 text-center"
          >
            <div className="grid size-12 place-items-center rounded-2xl bg-line/50 text-ink-muted">
              <InfoIcon className="size-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink">
              No se encontraron módulos
            </h3>
            <p className="mt-1 text-xs text-ink-muted max-w-sm">
              No hay módulos que coincidan con &ldquo;{busqueda}&rdquo; en la categoría seleccionada.
            </p>
            <button
              type="button"
              onClick={() => {
                onBusquedaChange('')
                onCategoriaChange('todas')
              }}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-cream hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Restablecer filtros
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
