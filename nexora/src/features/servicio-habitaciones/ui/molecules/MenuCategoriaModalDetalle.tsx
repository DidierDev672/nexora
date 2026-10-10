import { motion, AnimatePresence } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import {
  type MenuCategoria,
  resolverNombreEntidad,
} from '../../domain/menu-categoria'

interface MenuCategoriaModalDetalleProps {
  categoria: MenuCategoria | null
  onClose: () => void
}

export function MenuCategoriaModalDetalle({
  categoria,
  onClose,
}: MenuCategoriaModalDetalleProps) {
  if (!categoria) return null

  const nombreSede = resolverNombreEntidad(categoria.headquartes_id, 'Sede')
  const nombreSubsede = resolverNombreEntidad(categoria.sub_headquartes_id, 'Subsede')
  const nombreEdificio = resolverNombreEntidad(categoria.building_id, 'Edificio')

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop desenfocado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />

        {/* Contenedor del Modal con animación fadeUp */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-panel shadow-2xl z-10 my-8"
        >
          {/* Imagen de cabecera */}
          <div className="relative aspect-16/9 w-full overflow-hidden bg-black/10">
            <img
              src={categoria.asset}
              alt={categoria.name}
              className="size-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/30 pointer-events-none"
            />

            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-md cursor-pointer border border-white/20"
              title="Cerrar ventana"
            >
              ✕
            </button>

            {/* Número de orden en cabecera */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3.5 py-1 text-xs font-mono font-bold text-white shadow-md backdrop-blur-md">
                <span>Orden de Servicio #{categoria.order}</span>
              </span>
            </div>

            {/* Título en la base de la imagen */}
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                {categoria.name}
              </h2>
            </div>
          </div>

          {/* Cuerpo del detalle */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Descripción completa */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                Descripción del Servicio Gastronómico
              </h4>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-line bg-canvas/60 p-4 rounded-2xl border border-line/60">
                {categoria.description || 'Sin descripción registrada para esta categoría.'}
              </p>
            </div>

            {/* Parámetros de Ubicación Arquitectónica */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Parámetros de Despacho y Ubicación
              </h4>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Sede */}
                <div className="rounded-2xl border border-line bg-canvas p-3.5 flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      📍 Sede
                    </span>
                    <p className="mt-1 text-xs font-semibold text-ink line-clamp-1">
                      {nombreSede}
                    </p>
                  </div>
                </div>

                {/* Subsede */}
                <div className="rounded-2xl border border-line bg-canvas p-3.5 flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      🏢 Subsede
                    </span>
                    <p className="mt-1 text-xs font-semibold text-ink line-clamp-1">
                      {nombreSubsede}
                    </p>
                  </div>
                </div>

                {/* Edificio */}
                <div className="rounded-2xl border border-line bg-canvas p-3.5 flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      🚪 Edificio
                    </span>
                    <p className="mt-1 text-xs font-semibold text-ink line-clamp-1">
                      {nombreEdificio}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pie del modal */}
          <div className="flex items-center justify-end border-t border-line bg-canvas/40 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-primary/90 cursor-pointer"
            >
              Entendido / Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
