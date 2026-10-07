import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { UsuariosHeader } from './molecules/usuarios-header'
import { UsersListContainer } from './organisms/users-list-container'
import { RegistroUsuarioPanel } from './organisms/registro-usuario-panel'

/**
 * Página principal del Módulo de Usuarios.
 *
 * Incluye:
 * 1. Directorio de usuarios: consulta a GET /users con validación de status code.
 * 2. Switch interactivo para alternar entre vista de Tarjetas (Cards) y vista de Tabla.
 * 3. En pantallas móviles, la tabla se adapta de forma inteligente en formato Card.
 * 4. Pestaña de Registro para dar de alta nuevos colaboradores.
 * 5. Cumplimiento de la regla de oro: cero IDs técnicos en la interfaz de usuario.
 */
export function UsuariosPage() {
  const [activeTab, setActiveTab] = useState<'directorio' | 'nuevo'>('directorio')

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Cabecera institucional con copywriting contextual y botón de acción */}
        <UsuariosHeader
          badgeText="Equipo · Directorio de Usuarios"
          title={
            activeTab === 'directorio'
              ? 'Directorio y gestión de usuarios'
              : 'Nuevo registro de colaborador'
          }
          subtitle={
            activeTab === 'directorio'
              ? 'Supervisa al personal de tu red hotelera, consulta roles asignados, sedes y estados operativos en tiempo real.'
              : 'Asigna credenciales, rol funcional y sede de operación a un nuevo integrante del equipo hotelero.'
          }
          onNewUser={activeTab === 'directorio' ? () => setActiveTab('nuevo') : undefined}
        />

        {/* Barra de pestañas para alternar entre Directorio y Registro */}
        <div className="flex items-center justify-between border-b border-line pb-1">
          <div className="flex items-center gap-2">
            {/* Pestaña 1: Directorio */}
            <button
              type="button"
              onClick={() => setActiveTab('directorio')}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                activeTab === 'directorio'
                  ? 'text-primary'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Directorio de usuarios</span>
              {activeTab === 'directorio' && (
                <motion.div
                  layoutId="activeUsuariosTabIndicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>

            {/* Pestaña 2: Nuevo Registro */}
            <button
              type="button"
              onClick={() => setActiveTab('nuevo')}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                activeTab === 'nuevo'
                  ? 'text-primary'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Registrar usuario</span>
              {activeTab === 'nuevo' && (
                <motion.div
                  layoutId="activeUsuariosTabIndicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          </div>

          {activeTab === 'nuevo' && (
            <button
              type="button"
              onClick={() => setActiveTab('directorio')}
              className="text-xs text-primary font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              ← Volver al directorio
            </button>
          )}
        </div>

        {/* Vista activa con animación AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === 'directorio' ? (
            <motion.div
              key="usuarios-directorio-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <UsersListContainer onNewUser={() => setActiveTab('nuevo')} />
            </motion.div>
          ) : (
            <motion.div
              key="usuarios-registro-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-3xl"
            >
              <RegistroUsuarioPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}