import { useState } from 'react'
import { PAGE_META, type NavId } from './ui/navigation'
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
        />

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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