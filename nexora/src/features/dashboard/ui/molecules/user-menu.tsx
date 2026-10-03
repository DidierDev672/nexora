import { useState } from 'react'
import { cn } from '../lib/cn'
import {
  ChevronDownIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from '../icons'
import { MenuItem, MenuPopover } from './menu-popover'
import { useNavbarUser } from '../../application/use-navbar-user'
import { LogoutGoodbyeModal } from './logout-goodbye-modal'
import { clearAuthSession } from '../../../../shared/auth-storage'

import type { NavId } from '../navigation'

export interface UserMenuProps {
  onNavigate?: (id: NavId) => void
  onLogout?: () => void
}

export function UserMenu({ onNavigate, onLogout }: UserMenuProps = {}) {
  const { name, initials, email } = useNavbarUser()
  const [showGoodbye, setShowGoodbye] = useState(false)
  const [farewellName, setFarewellName] = useState('')

  const handleLogoutClick = () => {
    // 1. Guardar el nombre para personalizar el mensaje de despedida antes de limpiar
    setFarewellName(name)

    // 2. Borrar inmediatamente auth_user y los tokens de acceso del localStorage
    clearAuthSession()

    // 3. Mostrar la experiencia de despedida psicológica
    setShowGoodbye(true)
  }

  const handleCompleteLogout = () => {
    setShowGoodbye(false)
    // 4. Redirigir y retornar a la pantalla de login
    onLogout?.()
    window.dispatchEvent(new Event('nexora:auth-logout'))
  }

  return (
    <>
      <MenuPopover
        label="Menú de perfil"
        align="right"
        triggerClassName="h-10 rounded-full border-transparent bg-transparent px-1 hover:bg-primary/5"
        renderTrigger={(open) => (
          <span className="flex items-center gap-1.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-cream">
              {initials}
            </span>
            <ChevronDownIcon
              className={cn(
                'hidden size-4 text-ink-muted transition-transform min-[420px]:block',
                open && 'rotate-180',
              )}
            />
          </span>
        )}
      >
        <div className="flex items-center gap-3 border-b border-line px-3 py-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-sm font-bold text-cream">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">{name}</span>
            <span className="block text-xs text-ink-muted">{email}</span>
          </span>
        </div>
        <div className="p-1.5">
          <MenuItem
            icon={<UserIcon className="size-4" />}
            label="Ver mi perfil"
            onClick={() => onNavigate?.('perfil')}
          />
          <MenuItem
            icon={<SettingsIcon className="size-4" />}
            label="Configuración"
            onClick={() => onNavigate?.('configuracion')}
          />
          <MenuItem
            icon={<LogOutIcon className="size-4" />}
            label="Cerrar sesión"
            danger
            onClick={handleLogoutClick}
          />
        </div>
      </MenuPopover>

      {showGoodbye && (
        <LogoutGoodbyeModal
          userName={farewellName}
          onComplete={handleCompleteLogout}
        />
      )}
    </>
  )
}