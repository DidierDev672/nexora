import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { slideIn, fadeIn } from '../../../../design-tokens/motion'
import { MenuCategoriasGrid } from '../organisms/MenuCategoriasGrid'
import { FormularioServicioHabitacionCard } from '../organisms/FormularioServicioHabitacionCard'

export function MenuServiciosHabitacionPage() {
  const [vistaActiva, setVistaActiva] = useState<'catalogo' | 'nuevo'>('catalogo')

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header con animación slideIn y Copywriting Psicológico */}
      <motion.header
        variants={slideIn}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl border border-line bg-panel px-6 py-8 shadow-xs sm:px-10 sm:py-9"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none"
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Gastronomía · Room Service
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight font-serif">
              Menú de Servicios a la Habitación
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-muted">
              Visualiza y consulta la oferta de categorías culinarias, licores y amenidades catalogadas para cada sede y edificio de la red hotelera.
            </p>
          </div>

          {/* Selector de Pestañas Interactivo */}
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-canvas p-1.5 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setVistaActiva('catalogo')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaActiva === 'catalogo'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span>🍽️ Catálogo de Menús</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('nuevo')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaActiva === 'nuevo'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span>➕ Registrar Servicio</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* 2. Contenido según la pestaña seleccionada */}
      <AnimatePresence mode="wait">
        {vistaActiva === 'catalogo' ? (
          <motion.div
            key="catalogo"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <MenuCategoriasGrid onNuevoRegistro={() => setVistaActiva('nuevo')} />
          </motion.div>
        ) : (
          <motion.div
            key="nuevo"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mx-auto max-w-4xl"
          >
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setVistaActiva('catalogo')}
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                <span>← Volver al catálogo de menús</span>
              </button>
            </div>
            <FormularioServicioHabitacionCard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
