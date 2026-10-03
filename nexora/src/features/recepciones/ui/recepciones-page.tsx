import { RecepcionHeader } from './molecules/recepcion-header'
import { RecepcionPanel } from './organisms/recepcion-panel'

export function RecepcionesPage() {
  return (
    <div className="min-h-screen bg-canvas px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        {/* Encabezado enfocado en el formulario de check-in */}
        <RecepcionHeader
          badgeText="Recepción · Registro directo"
          title="Recepción y check-in de huéspedes"
          subtitle="Registra el ingreso del huésped con asignación precisa de sede, edificio, habitación y cama en tu red hotelera."
        />

        {/* Formulario completo de recepción (sin dashboard, directo en la página) */}
        <RecepcionPanel />
      </div>
    </div>
  )
}
