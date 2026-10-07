import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PersonasHeader } from './molecules/personas-header'
import { PersonasListContainer } from './organisms/personas-list-container'
import { RegistroPersonaPanel } from './organisms/registro-persona-panel'

export type PersonasPageTab = 'directorio' | 'nuevo'

/**
 * Página principal del Módulo de Personas en Nexora.
 *
 * Cumple con las directrices de src/agent.md:
 * 1. Vertical Slicing: Todo el flujo reside en features/personas con capas Domain, App, Infra y UI.
 * 2. Header Institucional con animación slide-in y copywriting psicológico.
 * 3. Directorio con Switch para alternar entre Tarjetas (Cards por defecto) y Tabla.
 * 4. Paginación con InfiniteScroll obligatorio en Cards y Tabla.
 * 5. Validación de códigos HTTP usando status-code-validator.ts.
 */
export function PersonasPage() {
  const [activeTab, setActiveTab] = useState<PersonasPageTab>('directorio')

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 sm:px-6 lg:px-8 font-sans text-ink transition-colors duration-200">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* 1. Cabecera con copywriting psicológico y animación slide-in */}
        <PersonasHeader
          badgeText={
            activeTab === 'directorio'
              ? 'Directorio · Personas Registradas'
              : 'Directorio · Nuevo Registro'
          }
          title={
            activeTab === 'directorio'
              ? 'Directorio y gestión de personas'
              : 'Ficha de registro de persona'
          }
          subtitle={
            activeTab === 'directorio'
              ? 'Supervisa la base de personas registradas, consulta documentos de identidad, canales de contacto y roles asociados en tiempo real.'
              : 'Registra a un nuevo colaborador, cliente o huésped asociando sus datos de identificación y canales de contacto verificados.'
          }
          isRegisterTab={activeTab === 'nuevo'}
          onNewPersona={activeTab === 'directorio' ? () => setActiveTab('nuevo') : undefined}
          onBackToDirectory={activeTab === 'nuevo' ? () => setActiveTab('directorio') : undefined}
        />

        {/* 2. Barra de pestañas interactiva con indicador animado */}
        <div className="flex items-center justify-between border-b border-line pb-1">
          <div className="flex items-center gap-2">
            {/* Pestaña: Directorio */}
            <button
              type="button"
              onClick={() => setActiveTab('directorio')}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
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
              <span>Directorio de personas</span>
              {activeTab === 'directorio' && (
                <motion.div
                  layoutId="activePersonasTabIndicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>

            {/* Pestaña: Registrar Persona */}
            <button
              type="button"
              onClick={() => setActiveTab('nuevo')}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
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
              <span>Registrar persona</span>
              {activeTab === 'nuevo' && (
                <motion.div
                  layoutId="activePersonasTabIndicator"
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

        {/* 3. Contenido Activo con AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === 'directorio' ? (
            <motion.div
              key="personas-directorio-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PersonasListContainer onNewPersona={() => setActiveTab('nuevo')} />
            </motion.div>
          ) : (
            <motion.div
              key="personas-registro-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-3xl"
            >
              <RegistroPersonaPanel
                onBackToDirectory={() => setActiveTab('directorio')}
                onSuccess={() => setActiveTab('directorio')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
export default PersonasPage
