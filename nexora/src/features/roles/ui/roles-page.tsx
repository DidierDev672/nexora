import { RolesHeader } from './molecules/roles-header'
import { RolesPanel } from './organisms/roles-panel'

export function RolesPage() {
  return (
    <div className="min-h-screen bg-surface/20 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <RolesHeader />

        <RolesPanel />
      </div>
    </div>
  )
}