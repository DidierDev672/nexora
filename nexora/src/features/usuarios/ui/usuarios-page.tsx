import { UsuariosHeader } from './molecules/usuarios-header'
import { RegistroUsuarioPanel } from './organisms/registro-usuario-panel'

export function UsuariosPage() {
  return (
    <div className="min-h-screen bg-canvas px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <UsuariosHeader />

        <RegistroUsuarioPanel />
      </div>
    </div>
  )
}