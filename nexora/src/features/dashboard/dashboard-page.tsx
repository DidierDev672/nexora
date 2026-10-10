import { useState } from 'react'
import { PAGE_META, BACK_TO_CONFIG_PAGES, type NavId } from './ui/navigation'
import { Sidebar } from './ui/organisms/sidebar'
import { Header } from './ui/organisms/header'
import { HomeOverview } from './ui/organisms/home-overview'
import { PaletteView } from './ui/organisms/palette-view'
import { SedesView } from './ui/organisms/sedes-view'
import { UsuariosPage } from '../../features/usuarios/ui/usuarios-page'
import { PersonasPage } from '../../features/personas/ui/personas-page'
import { RecursosPage } from '../../features/recursos/ui/recursos-page'
import { HabitacionesPage } from '../../features/habitaciones/ui/habitaciones-page'
import { ReservasPage } from '../../features/reservas/ui/reservas-page'
import { RecepcionesPage } from '../../features/recepciones/ui/recepciones-page'
import { Cama3dPage } from '../../features/cama3d/ui/cama3d-page'
import { TarifasPage } from '../../features/tarifas/ui/tarifas-page'
import { ConfiguracionesPage } from '../../features/configuraciones/ui/configuraciones-page'
import { AuditoriaPage } from '../../features/auditoria/ui/auditoria-page'
import UserProfile from '../../features/usuarios/ui/UserProfile'
import { ServicioHabitacionesPage } from '../../features/servicio-habitaciones/ui/views/ServicioHabitacionesPage'
import { SectionSoon } from './ui/molecules/section-soon'

export interface DashboardPageProps {
  onLogout?: () => void
}

export function DashboardPage({ onLogout }: DashboardPageProps = {}) {
  const [activeId, setActiveId] = useState<NavId>('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const meta = PAGE_META[activeId]

  const navigate = (id: NavId) => {
    setActiveId(id)
    setSidebarOpen(false)
  }

  const isBackToConfigPage = BACK_TO_CONFIG_PAGES.includes(activeId)
  const handleBackToConfig = () => navigate('configuracion')

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId={activeId}
        onNavigate={navigate}
      />

      <div className="lg:pl-64">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenSidebar={() => setSidebarOpen(true)}
          onNavigate={navigate}
          onLogout={onLogout}
          canGoBack={isBackToConfigPage}
          onBack={handleBackToConfig}
        />

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Barra superior de retorno rápido a la página de Configuración */}
          {isBackToConfigPage && (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-line bg-panel/90 px-4 py-2.5 shadow-2xs backdrop-blur-xs">
              <button
                type="button"
                onClick={handleBackToConfig}
                className="group inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary transition-colors cursor-pointer"
                title="Volver a la página de Configuración"
              >
                <span className="grid size-6 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </span>
                <span>← Volver atrás a Configuración</span>
              </button>
              <span className="text-[11px] font-semibold text-ink-muted hidden sm:inline">
                Módulo del hotel · Navegación asistida
              </span>
            </div>
          )}
          {activeId === 'home' ? (
            <HomeOverview onNavigate={navigate} />
          ) : activeId === 'perfil' ? (
            <UserProfile />
          ) : activeId === 'sedes' ? (
            <SedesView />
          ) : activeId === 'usuarios' ? (
            <UsuariosPage />
          ) : activeId === 'personas' ? (
            <PersonasPage />
          ) : activeId === 'habitacion' ? (
            <HabitacionesPage />
          ) : activeId === 'tarifas' ? (
            <TarifasPage />
          ) : activeId === 'reservas' ? (
            <ReservasPage />
          ) : activeId === 'recepcion' ? (
            <RecepcionesPage />
          ) : activeId === 'auditoria' ? (
            <AuditoriaPage />
          ) : activeId === 'cama' ? (
            <Cama3dPage />
          ) : activeId === 'recursos' ? (
            <RecursosPage />
          ) : activeId === 'paletas' ? (
            <PaletteView />
          ) : activeId === 'servicios' ? (
            <ServicioHabitacionesPage />
          ) : activeId === 'configuracion' ? (
            <ConfiguracionesPage onNavigate={navigate} />
          ) : (
            <SectionSoon
              icon="bed"
              title={meta.title}
              message={meta.soonMessage}
              actionLabel="Volver al resumen"
              onAction={() => setActiveId('home')}
            />
          )}
        </main>
      </div>
    </div>
  )
}