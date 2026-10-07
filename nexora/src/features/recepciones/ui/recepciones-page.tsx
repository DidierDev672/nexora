import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RecepcionHeader } from './molecules/recepcion-header'
import { RecepcionesListContainer } from './organisms/recepciones-list-container'
import { RecepcionPanel } from './organisms/recepcion-panel'

export function RecepcionesPage() {
  const [activeTab, setActiveTab] = useState<'lista' | 'nuevo'>('lista')

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Cabecera con animación slideIn y copywriting psicológico */}
        <RecepcionHeader
          badgeText="Recepción · Estancias y Check-in"
          title={
            activeTab === 'lista'
              ? 'Lista de recepciones y estancias'
              : 'Nuevo registro de check-in'
          }
          subtitle={
            activeTab === 'lista'
              ? 'Supervisa la ocupación activa, consulta habitaciones, huéspedes asignados y depósitos de garantía en tiempo real.'
              : 'Registra el ingreso de un huésped asignando sede, edificio, habitación y cama en tu inventario hotelero.'
          }
          onNewCheckIn={activeTab === 'lista' ? () => setActiveTab('nuevo') : undefined}
        />

        {/* Barra de pestañas secundarias para alternar entre Listado y Registro */}
        <div className="flex items-center justify-between border-b border-line pb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('lista')}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                activeTab === 'lista'
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
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Listado de recepciones</span>
              {activeTab === 'lista' && (
                <motion.div
                  layoutId="activeRecepcionesTabIndicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>

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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              <span>Formulario de nuevo</span>
              {activeTab === 'nuevo' && (
                <motion.div
                  layoutId="activeRecepcionesTabIndicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          </div>

          {activeTab === 'nuevo' && (
            <button
              type="button"
              onClick={() => setActiveTab('lista')}
              className="text-xs text-primary font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              ← Volver al listado
            </button>
          )}
        </div>

        {/* Vista activa con animación fluida AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === 'lista' ? (
            <motion.div
              key="recepciones-stays-list-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <RecepcionesListContainer onNewCheckIn={() => setActiveTab('nuevo')} />
            </motion.div>
          ) : (
            <motion.div
              key="recepciones-stays-nuevo-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-4xl"
            >
              <RecepcionPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
