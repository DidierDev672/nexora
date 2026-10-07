import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  staggerContainer,
  staggerItem,
  fadeUp,
} from '../../../../design-tokens/motion'
import {
  HeadquarterDetailModal,
  RoleDetailModal,
} from '../../../../shared/catalog'
import { useUsersList } from '../../application/use-users-list'
import { UsersToolbar } from '../molecules/users-toolbar'
import { UserCard } from '../molecules/user-card'
import { UsersTable } from '../molecules/users-table'

export interface UsersListContainerProps {
  onNewUser?: () => void
}

function UsersCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-line bg-panel p-5 space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-line/60" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-line/60" />
                <div className="h-3 w-20 rounded bg-line/40" />
              </div>
            </div>
            <div className="h-5 w-16 rounded-full bg-line/60" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3.5 w-48 rounded bg-line/40" />
            <div className="h-3.5 w-40 rounded bg-line/40" />
            <div className="h-3.5 w-36 rounded bg-line/40" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Contenedor orquestador del Directorio de Usuarios.
 * Integra Métricas, Toolbar, Toggle Card/Table, Estados de Carga y Empty States.
 */
export function UsersListContainer({ onNewUser }: UsersListContainerProps) {
  const {
    filteredUsers,
    loading,
    error,
    validation,
    fromFallback,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    availableRoles,
    metrics,
    reload,
  } = useUsersList()

  const [inspectHeadquarter, setInspectHeadquarter] = useState<{
    headquartersId: string
    subHeadquartersId?: string | null
  } | null>(null)

  const [inspectRoleId, setInspectRoleId] = useState<string | null>(null)

  return (
    <div className="space-y-6">

      {/* 2. Barra de herramientas (Búsqueda, Filtros, Switch y Acciones) */}
      <div className="rounded-2xl border border-line bg-panel p-4 shadow-xs">
        <UsersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          availableRoles={availableRoles}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          loading={loading}
          onReload={reload}
          onNewUser={onNewUser}
        />
      </div>

      {/* 3. Notificación de validación o fallback resiliente */}
      {fromFallback && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-amber-500/20 font-bold">
              ℹ
            </span>
            <span>
              Mostrando datos del catálogo local optimizado mientras se sincroniza con el endpoint central (código validado: {validation?.status || 200}).
            </span>
          </div>
          <button
            type="button"
            onClick={reload}
            className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer shrink-0"
          >
            Reintentar conexión
          </button>
        </motion.div>
      )}

      {error && !fromFallback && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={reload}
            className="font-semibold underline hover:text-rose-900 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 4. Contador de resultados */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-ink-muted">
          Mostrando <span className="font-bold text-ink">{filteredUsers.length}</span> de{' '}
          <span className="font-bold text-ink">{metrics.total}</span> usuarios registrados
        </p>

        <span className="text-[11px] text-ink-muted hidden sm:inline">
          Modo actual: <strong className="text-ink">{viewMode === 'card' ? 'Tarjetas interactivas' : 'Tabla estructurada'}</strong>
        </span>
      </div>

      {/* 5. Contenido Principal: Cards vs. Table según el switch */}
      {loading ? (
        <UsersCardsSkeleton />
      ) : filteredUsers.length === 0 ? (
        /* Empty State */
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-panel/60 p-12 text-center"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-7"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </span>
          <h3 className="text-sm font-bold text-ink">
            No se encontraron usuarios con los filtros seleccionados
          </h3>
          <p className="mt-1 max-w-sm text-xs text-ink-muted">
            Prueba a modificar los términos de búsqueda o restablece los filtros para ver todos los usuarios.
          </p>
          {(searchQuery || statusFilter !== 'todos' || roleFilter !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('todos')
                setRoleFilter('todos')
              }}
              className="mt-4 rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-semibold text-primary hover:bg-line/40 transition cursor-pointer"
            >
              Restablecer filtros
            </button>
          )}
        </motion.div>
      ) : (
        /* Visualización activa según el switch Card vs. Table */
        <AnimatePresence mode="wait">
          {viewMode === 'card' ? (
            /* Vista en Cards con Stagger Reveal */
            <motion.div
              key="users-cards-view"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  variants={staggerItem}
                  onInspectHeadquarter={(hqId, subHqId) =>
                    setInspectHeadquarter({
                      headquartersId: hqId,
                      subHeadquartersId: subHqId,
                    })
                  }
                  onInspectRole={(roleId) => setInspectRoleId(roleId)}
                />
              ))}
            </motion.div>
          ) : (
            /* Vista en Tabla con Stagger Reveal y adaptación responsiva */
            <motion.div
              key="users-table-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <UsersTable
                users={filteredUsers}
                onInspectHeadquarter={(hqId, subHqId) =>
                  setInspectHeadquarter({
                    headquartersId: hqId,
                    subHeadquartersId: subHqId,
                  })
                }
                onInspectRole={(roleId) => setInspectRoleId(roleId)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Modal detallado de la Sede y Subsedes reales */}
      <HeadquarterDetailModal
        headquartersId={inspectHeadquarter?.headquartersId ?? null}
        subHeadquartersId={inspectHeadquarter?.subHeadquartersId ?? null}
        isOpen={Boolean(inspectHeadquarter)}
        onClose={() => setInspectHeadquarter(null)}
      />

      {/* Modal detallado del Rol del usuario (name y description) */}
      <RoleDetailModal
        roleId={inspectRoleId}
        isOpen={Boolean(inspectRoleId)}
        onClose={() => setInspectRoleId(null)}
      />
    </div>
  )
}
