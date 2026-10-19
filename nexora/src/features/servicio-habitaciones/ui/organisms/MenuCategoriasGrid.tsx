import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fadeIn, fadeUp } from '../../../../design-tokens/motion';
import { useMenuCategorias } from '../../application/use-menu-categorias';
import { MenuCategoriaCard } from '../molecules/MenuCategoriaCard';
import { MenuCategoriaModalDetalle } from '../molecules/MenuCategoriaModalDetalle';
import {
  type MenuCategoria,
  resolverNombreEntidad,
} from '../../domain/menu-categoria';
import {
  InfiniteScroll,
  InfiniteScrollEnd,
  LazyAnimatedWrapper,
  type LazyAnimationVariant,
} from '../../../../shared/ui';

interface MenuCategoriasGridProps {
  onNuevoRegistro?: () => void;
  onAgregarProducto?: (categoria: MenuCategoria) => void;
  /** Variante de animación perezosa para las tarjetas de servicios */
  animationVariant?: LazyAnimationVariant;
}

export function MenuCategoriasGrid({
  onNuevoRegistro,
  onAgregarProducto,
  animationVariant = 'slideUp',
}: MenuCategoriasGridProps) {
  const {
    categoriasFiltradas,
    categorias,
    loading,
    feedback,
    searchTerm,
    setSearchTerm,
    selectedBuilding,
    setSelectedBuilding,
    orden,
    setOrden,
    edificiosDisponibles,
    recargar,
    limpiarFiltros,
  } = useMenuCategorias();

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<MenuCategoria | null>(null);

  // Paginación reactiva para InfiniteScroll según convención de src/agent.md
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedBuilding, orden]);

  const visibleCategorias = useMemo(
    () => categoriasFiltradas.slice(0, visibleCount),
    [categoriasFiltradas, visibleCount]
  );
  const hasMore = visibleCount < categoriasFiltradas.length;
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Barra de Herramientas y Filtros */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="border-line bg-panel rounded-3xl border p-5 shadow-xs sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Campo de Búsqueda reactivo */}
          <div className="relative max-w-md flex-1">
            <span className="text-ink-muted pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción (ej. Panadería, Coctelería)..."
              className="border-line bg-canvas text-ink placeholder:text-ink-muted/70 focus:border-primary focus:ring-primary/20 w-full rounded-2xl border py-2.5 pr-4 pl-10 text-xs transition-colors outline-none focus:ring-2"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-ink-muted hover:text-ink absolute inset-y-0 right-3 flex cursor-pointer items-center text-xs"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros de Edificio y Ordenación */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por Edificio */}
            <div className="text-ink-muted flex items-center gap-1.5 text-xs">
              <span className="hidden font-medium sm:inline">Edificio:</span>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="border-line bg-canvas text-ink focus:border-primary cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-colors outline-none"
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
            <div className="text-ink-muted flex items-center gap-1.5 text-xs">
              <span className="hidden font-medium sm:inline">Ordenar:</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as any)}
                className="border-line bg-canvas text-ink focus:border-primary cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-colors outline-none"
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
              className="border-line bg-canvas text-ink hover:bg-panel inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
              title="Volver a consultar el endpoint /menu-category"
            >
              <span className={loading ? 'animate-spin' : ''}></span>
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Botón para registrar nuevo servicio si se proporciona */}
            {onNuevoRegistro && (
              <button
                type="button"
                onClick={onNuevoRegistro}
                className="bg-primary hover:bg-primary/90 inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-95"
              >
                <span>+ Registrar Categoría</span>
              </button>
            )}
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
            className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs shadow-xs ${
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
        <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3 xl:columns-4">
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
              className={`mb-6 w-full break-inside-avoid ${ratio} border-line bg-panel/80 flex animate-pulse flex-col justify-between rounded-3xl border p-5 shadow-xs`}
            >
              <div className="flex justify-between">
                <div className="bg-canvas h-6 w-20 rounded-full" />
                <div className="bg-canvas h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="bg-canvas h-6 w-3/4 rounded-xl" />
                <div className="bg-canvas h-3.5 w-full rounded-md" />
                <div className="bg-canvas h-3.5 w-1/2 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : categoriasFiltradas.length > 0 ? (
        /* Contenedor Masonry con InfiniteScroll y LazyAnimatedWrapper */
        <InfiniteScroll
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={false}
          animationVariant={animationVariant}
          endMessage={
            <InfiniteScrollEnd label="Has visualizado todas las categorías gastronómicas de Room Service." />
          }
        >
          <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3 xl:columns-4">
            <AnimatePresence mode="popLayout">
              {visibleCategorias.map((cat, idx) => (
                <LazyAnimatedWrapper
                  key={`${cat.headquartes_id}-${cat.building_id}-${cat.order}-${cat.name}`}
                  layout
                  variant={animationVariant}
                  viewportMargin="-100px"
                  once
                  className="mb-6 break-inside-avoid"
                >
                  <MenuCategoriaCard
                    categoria={cat}
                    index={idx}
                    onVerDetalle={(item) => setCategoriaSeleccionada(item)}
                    onAgregarProducto={(item) => onAgregarProducto?.(item)}
                  />
                </LazyAnimatedWrapper>
              ))}
            </AnimatePresence>
          </div>
        </InfiniteScroll>
      ) : (
        /* Empty State */
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="border-line bg-panel/70 mx-auto max-w-lg space-y-4 rounded-3xl border border-dashed p-10 text-center shadow-xs sm:p-14"
        >
          <div className="bg-primary/10 text-primary border-primary/20 mx-auto grid size-16 place-items-center rounded-2xl border text-2xl">
            🍽️
          </div>

          <div className="space-y-1.5">
            <h3 className="text-ink font-serif text-base font-bold sm:text-lg">
              {categorias.length === 0
                ? 'No se encuentran registros del menú de servicio de habitaciones'
                : 'Sin categorías que coincidan'}
            </h3>
            <p className="text-ink-muted mx-auto max-w-md text-xs leading-relaxed">
              {categorias.length === 0
                ? 'Actualmente no se encuentran registros en el catálogo del menú de servicio de habitaciones para las sedes y edificios. Puedes dar de alta una nueva categoría para comenzar a estructurar la carta gastronómica.'
                : 'No se encontraron opciones gastronómicas con los filtros aplicados. Intenta restablecer los filtros para volver a ver todas las categorías.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {categorias.length === 0 ? (
              <>
                {onNuevoRegistro && (
                  <button
                    type="button"
                    onClick={onNuevoRegistro}
                    className="bg-primary hover:bg-primary/90 cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition-all"
                  >
                    + Registrar Categoría de Menú
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void recargar()}
                  className="border-line bg-canvas text-ink hover:bg-panel inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all"
                  title="Volver a consultar el endpoint /menu-category"
                >
                  <span className={loading ? 'animate-spin' : ''}>🔄</span>
                  <span>Consultar Nuevamente</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="border-line bg-canvas text-ink hover:bg-panel cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold transition-colors"
              >
                Restablecer filtros
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
  );
}
