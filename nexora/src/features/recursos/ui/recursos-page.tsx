import { RecursosHeader } from './molecules/recursos-header'
import { RecursosPanel } from './organisms/recursos-panel'

export function RecursosPage() {
  return (
    <div className="min-h-screen bg-canvas px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <RecursosHeader />

        <RecursosPanel />
      </div>
    </div>
  )
}