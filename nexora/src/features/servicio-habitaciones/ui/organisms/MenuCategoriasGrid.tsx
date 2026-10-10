import { useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'motion/react'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import { useMenuCategorias } from '../../application/use-menu-categorias'
import { MenuCategoriaCard } from '../molecules/MenuCategoriaCard'
import { MenuCategoriaModalDetalle } from '../molecules/MenuCategoriaModalDetalle'
import {
  type MenuCategoria,
  resolverNombreEntidad,
} from '../../domain/menu-categoria'

interface MenuCategoriasGridProps {
  onNuevoRegistro?: () => void
}

/**
 * Variantes de animación para la cascada Masonry con orquestación escalonada (Stagger)
 */
const masonryContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

/**
 * Efecto Fade In (desvanecimiento entrante) según prompt/prompt-fade-in.md:
 * 1. initial: opacity: 0 (completamente transparente antes de montarse)
 * 2. animate: opacity: 1 (completamente opaco)
 * 3. transition: duration: 0.5, ease: 'easeOut' (desvanecimiento suave)
 */
const fadeInCardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
}

export function MenuCategoriasGrid({ onNuevoRegistro }: MenuCategoriasGridProps) {
  const {
    categoriasFiltradas,
    categorias,
    loading,
    feedback,
    usandoFallback,
    searchTerm,
    setSearchTerm,
    selectedBuilding,
    setSelectedBuilding,
    orden,
    setOrden,
    edificiosDisponibles,
    recargar,
    limpiarFiltros,
  } = useMenuCategorias()

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<MenuCategoria | null>(null)

  return (
    <div className="space-y-6">
      {/* 1. Barra de Herramientas y Filtros */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="rounded-3xl border border-line bg-panel p-5 sm:p-6 shadow-xs"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Campo de Búsqueda reactivo */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-ink-muted pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción (ej. Panadería, Coctelería)..."
              className="w-full rounded-2xl border border-line bg-canvas py-2.5 pl-10 pr-4 text-xs text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-3 flex items-center text-xs text-ink-muted hover:text-ink cursor-pointer"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros de Edificio y Ordenación */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por Edificio */}
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="font-medium hidden sm:inline">Edificio:</span>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-medium text-ink outline-none transition-colors focus:border-primary cursor-pointer"
              >
                <option value="todos">Todos los edificios</option>
                {edificiosDisponibles.map((bId) => (
                  <option key={bId} value={bId}>
                    {resolverNombreEntidad(bId, 'Edificio')}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenación */}
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="font-medium hidden sm:inline">Ordenar:</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as any)}
                className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-medium text-ink outline-none transition-colors focus:border-primary cursor-pointer"
              >
                <option value="order-asc">Orden: Menor a Mayor (1→99)</option>
                <option value="order-desc">Orden: Mayor a Menor (99→1)</option>
                <option value="name-asc">Alfabético (A→Z)</option>
                <option value="name-desc">Alfabético (Z→A)</option>
              </select>
            </div>

            {/* Botón Refrescar */}
            <button
              type="button"
              onClick={() => void recargar()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink transition-all hover:bg-panel active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Volver a consultar el endpoint /menu-category"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Botón para registrar nuevo servicio si se proporciona */}
            {onNuevoRegistro && (
              <button
                type="button"
                onClick={onNuevoRegistro}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
              >
                <span>+ Registrar Categoría</span>
              </button>
            )}
          </div>
        </div>

        {/* Resumen de contadores y badge de Masonry Layout */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span>
              Mostrando{' '}
              <strong className="text-ink">{categoriasFiltradas.length}</strong> de{' '}
              <strong className="text-ink">{categorias.length}</strong> categorías registradas
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              Cascada · Masonry
            </span>
          </div>

          <div className="flex items-center gap-2">
            {usandoFallback && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <span>Modo Resiliente (Catálogo local activo)</span>
              </span>
            )}
            <span className="text-[11px] font-mono text-ink-muted">
              GET /menu-category
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Banner de Feedback si StatusCodeValidationResult generó mensaje */}
      <AnimatePresence>
        {feedback && feedback.message && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`rounded-2xl border p-4 text-xs shadow-xs flex items-center justify-between gap-3 ${
              feedback.category === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : feedback.category === 'info'
                  ? 'border-sky-200 bg-sky-50 text-sky-900'
                  : feedback.category === 'warning'
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>
                {feedback.category === 'success' && '✅'}
                {feedback.category === 'info' && 'ℹ️'}
                {feedback.category === 'warning' && '⚠️'}
                {feedback.category === 'error' && '❌'}
              </span>
              <span>{feedback.message}</span>
            </div>
            <span className="font-mono text-[10px] font-bold">
              HTTP {feedback.status}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Diseño en Cascada Animado (Masonry / Waterfall Layout) con Motion */}
      {loading ? (
        /* Skeletons en Cascada con alturas variables tipo Pinterest */
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {[
            'aspect-3/4',
            'aspect-4/3',
            'aspect-square',
            'aspect-3/4',
            'aspect-4/3',
            'aspect-square',
          ].map((ratio, i) => (
            <div
              key={i}
              className={`break-inside-avoid mb-6 w-full ${ratio} rounded-3xl border border-line bg-panel/80 p-5 shadow-xs animate-pulse flex flex-col justify-between`}
            >
              <div className="flex justify-between">
                <div className="h-6 w-20 rounded-full bg-canvas" />
                <div className="h-6 w-16 rounded-full bg-canvas" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-3/4 rounded-xl bg-canvas" />
                <div className="h-3.5 w-full rounded-md bg-canvas" />
                <div className="h-3.5 w-1/2 rounded-md bg-canvas" />
              </div>
            </div>
          ))}
        </div>
      ) : categoriasFiltradas.length > 0 ? (
        /* Contenedor Masonry con Columnas Nativas de Tailwind y Técnica FLIP */
        <motion.div
          layout
          variants={masonryContainerVariants}
          initial="hidden"
          animate="visible"
          className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {categoriasFiltradas.map((cat, idx) => (
              <motion.div
                key={`${cat.headquartes_id}-${cat.building_id}-${cat.order}-${cat.name}`}
                layout
                variants={fadeInCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{
                  layout: { type: 'spring', damping: 28, stiffness: 300 },
                }}
                className="break-inside-avoid mb-6"
              >
                <MenuCategoriaCard
                  categoria={cat}
                  index={idx}
                  onVerDetalle={(item) => setCategoriaSeleccionada(item)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-3xl border border-dashed border-line bg-panel/60 p-12 text-center"
        >
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-2xl">
            🍽️
          </div>
          <h3 className="mt-4 font-serif text-lg font-bold text-ink">
            No se encontraron categorías
          </h3>
          <p className="mt-1 text-xs text-ink-muted max-w-md mx-auto">
            No hay opciones gastronómicas que coincidan con los filtros aplicados.
            Intenta limpiar el buscador o seleccionar otro edificio.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={limpiarFiltros}
              className="rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-semibold text-ink hover:bg-panel transition-colors cursor-pointer"
            >
              Restablecer filtros
            </button>
            {onNuevoRegistro && (
              <button
                type="button"
                onClick={onNuevoRegistro}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer"
              >
                + Registrar nueva categoría
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* 4. Modal de Ficha Técnica Detallada */}
      <MenuCategoriaModalDetalle
        categoria={categoriaSeleccionada}
        onClose={() => setCategoriaSeleccionada(null)}
      />
    </div>
  )
}
