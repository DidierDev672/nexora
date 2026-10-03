import { PersonasHeader } from './molecules/personas-header'
import { RegistroPersonaPanel } from './organisms/registro-persona-panel'

export function PersonasPage() {
  return (
    <div className="min-h-screen bg-canvas px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <PersonasHeader />
        <RegistroPersonaPanel />
      </div>
    </div>
  )
}
