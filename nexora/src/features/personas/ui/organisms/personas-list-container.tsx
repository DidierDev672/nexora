import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  staggerContainer,
  staggerItem,
  fadeUp,
} from '../../../../design-tokens/motion'
import {
  InfiniteScroll,
  InfiniteScrollEnd,
} from '../../../../shared/ui/InfiniteScroll'
import { usePersonasList } from '../../application/use-personas-list'
import { PersonasToolbar } from '../molecules/personas-toolbar'
import { PersonaCard } from '../molecules/persona-card'
import { PersonasTable } from '../molecules/personas-table'
import { PersonasStatusBanner } from '../molecules/personas-status-banner'
import { RoleDetailModal } from '../../../../shared/catalog'

export interface PersonasListContainerProps {
  onNewPersona?: () => void
  onInspectRole?: (roleId: string) => void
}

/**
 * Skeleton animado para la cuadrícula de tarjetas de personas.
 */
function PersonasCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-line bg-panel p-5 space-y-4 animate-pulse shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-line/60" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-line/60" />
                <div className="h-3 w-20 rounded bg-line/40" />
              </div>
            </div>
            <div className="h-5 w-16 rounded-full bg-line/50" />
          </div>
          <div className="h-14 rounded-xl bg-line/30" />
          <div className="space-y-2 pt-2">
            <div className="h-3.5 w-48 rounded bg-line/40" />
            <div className="h-3.5 w-40 rounded bg-line/40" />
          </div>
          <div className="h-6 w-24 rounded-full bg-line/40 pt-2" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton animado para la tabla de personas.
 */
function PersonasTableSkeleton() {
  return (
    <>
      {/* Skeleton adaptativo en Cards para pantallas móviles (< md) */}
      <div className="md:hidden">
        <PersonasCardsSkeleton />
      </div>

      {/* Skeleton tabular para pantallas medianas y grandes (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-line bg-panel p-4 shadow-xs animate-pulse space-y-3">
        <div className="h-10 rounded-xl bg-line/40 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-line/25 w-full" />
        ))}
      </div>
    </>
  )
}

/**
 * Organismo orquestador de la visualización del Directorio de Personas.
 * Integra:
 * - Llamada a GET /persons vía Axios con validación de status code.
 * - Switch interactivo de Cards y Table (Cards por defecto).
 * - Scroll Infinito obligatorio (Regla 2 de agent.md).
 * - Animaciones centralizadas con motion (Regla 4 de agent.md).
 * - Feedback psicológico ante respuestas HTTP (Regla 5 de agent.md).
 */
export function PersonasListContainer({
  onNewPersona,
  onInspectRole,
}: PersonasListContainerProps) {
  const {
    filteredPersons,
    visiblePersons,
    loading,
    validation,
    fromFallback,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    genderFilter,
    setGenderFilter,
    hasMore,
    isLoadingMore,
    loadMore,
    metrics,
    resetFilters,
    refetch,
  } = usePersonasList()

  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [inspectRoleId, setInspectRoleId] = useState<string | null>(null)

  const handleInspectRole = onInspectRole ?? setInspectRoleId

  return (
    <div className="space-y-6">
      {/* 2. Banner de feedback psicológico si el código HTTP no fue 200 */}
      {!bannerDismissed && (
        <PersonasStatusBanner
          validation={validation}
          fromFallback={fromFallback}
          onDismiss={() => setBannerDismissed(true)}
          onRetry={() => void refetch()}
        />
      )}

      {/* 3. Barra de herramientas: Búsqueda, filtros y switch Cards/Table */}
      <PersonasToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        genderFilter={genderFilter}
        onGenderFilterChange={setGenderFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={metrics.total}
        filteredCount={filteredPersons.length}
        onResetFilters={resetFilters}
      />

      {/* 4. Contenido Principal: Cards vs. Table según el switch */}
      {loading ? (
        viewMode === 'cards' ? (
          <PersonasCardsSkeleton />
        ) : (
          <PersonasTableSkeleton />
        )
      ) : filteredPersons.length === 0 ? (
        /* Empty State */
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-panel/60 p-12 text-center shadow-xs"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-7"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </span>
          <h3 className="text-base font-bold text-ink">
            No se encontraron personas con los criterios seleccionados
          </h3>
          <p className="mt-1.5 max-w-sm text-xs text-ink-muted leading-relaxed">
            Intenta modificar los términos de búsqueda o restablece los filtros para ver la lista completa.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-semibold text-primary hover:bg-line/40 transition cursor-pointer"
            >
              Restablecer filtros
            </button>
            {onNewPersona && (
              <button
                type="button"
                onClick={onNewPersona}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-cream hover:bg-secondary transition cursor-pointer shadow-xs"
              >
                + Registrar persona
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        /* Visualización con Scroll Infinito Obligatorio (Regla 2 de agent.md) */
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isLoadingMore}
          onLoadMore={loadMore}
          threshold={0.1}
          endMessage={
            <InfiniteScrollEnd label="Ya visualizas todas las personas registradas en el sistema." />
          }
        >
          <AnimatePresence mode="wait">
            {viewMode === 'cards' ? (
              /* Vista en Cards con Stagger Reveal y animación física */
              <motion.div
                key="personas-cards-view"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {visiblePersons.map((person) => (
                  <PersonaCard
                    key={person.id}
                    person={person}
                    variants={staggerItem}
                    onInspectRole={handleInspectRole}
                  />
                ))}
              </motion.div>
            ) : (
              /* Vista en Tabla con Stagger Reveal */
              <motion.div
                key="personas-table-view"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                <PersonasTable
                  persons={visiblePersons}
                  variants={staggerItem}
                  onInspectRole={handleInspectRole}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </InfiniteScroll>
      )}

      {/* Modal Interactivo de Detalle del Rol (/roles/{id}) */}
      <RoleDetailModal
        roleId={inspectRoleId}
        isOpen={Boolean(inspectRoleId)}
        onClose={() => setInspectRoleId(null)}
      />
    </div>
  )
}
