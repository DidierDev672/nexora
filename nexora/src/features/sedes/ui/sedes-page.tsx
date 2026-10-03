import { SedesHeader } from './molecules/sedes-header'
import { SedesPanel } from './organisms/sedes-panel'

export function SedesPage() {
  return (
    <div className="min-h-screen bg-canvas px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <SedesHeader />

        <SedesPanel />
      </div>
    </div>
  )
}