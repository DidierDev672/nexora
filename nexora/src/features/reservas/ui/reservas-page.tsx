import { ReservasHeader } from './molecules/reservas-header'
import { ReservaInteractiveForm } from './organisms/reserva-interactive-form'

export function ReservasPage() {
  return (
    <div className="min-h-screen bg-canvas px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <ReservasHeader />
        <ReservaInteractiveForm />
      </div>
    </div>
  )
}
