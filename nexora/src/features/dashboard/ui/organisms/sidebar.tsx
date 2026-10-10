import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { NAV_ITEMS, type NavId } from '../navigation'
import { BedIcon, BuildingIcon, CalendarIcon, ClipboardCheckIcon, ConciergeBellIcon, CubeIcon, HomeIcon, PaletteIcon, SettingsIcon, ShieldIcon, SparklesIcon, TagIcon, UserIcon, UsersIcon, UtensilsIcon } from '../icons'
import { SidebarNavItem } from '../molecules/sidebar-nav-item'

const NAV_ICONS: Record<NavId, ReactNode> = {
  home: <HomeIcon className="size-[18px]" />,
  sedes: <BuildingIcon className="size-[18px]" />,
  habitacion: <BedIcon className="size-[18px]" />,
  tarifas: <TagIcon className="size-[18px]" />,
  cama: <CubeIcon className="size-[18px]" />,
  reservas: <CalendarIcon className="size-[18px]" />,
  recepcion: <ConciergeBellIcon className="size-[18px]" />,
  auditoria: <ClipboardCheckIcon className="size-[18px]" />,
  usuarios: <UsersIcon className="size-[18px]" />,
  personas: <UserIcon className="size-[18px]" />,
  recursos: <ShieldIcon className="size-[18px]" />,
  paletas: <PaletteIcon className="size-[18px]" />,
  configuracion: <SettingsIcon className="size-[18px]" />,
  perfil: <UserIcon className="size-[18px]" />,
  servicios: <UtensilsIcon className="size-[18px]" />,
}

function SidebarBody({
  activeId,
  onNavigate,
}: {
  activeId: NavId
  onNavigate: (id: NavId) => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <span className="grid size-10 place-items-center rounded-xl bg-cream text-primary shadow-sm">
          <SparklesIcon className="size-5" />
        </span>
        <div>
          <p className="text-base font-bold text-cream">Nexora</p>
          <p className="text-[11px] text-cream/50">Hoteles · Operaciones</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.id}
            active={activeId === item.id}
            icon={NAV_ICONS[item.id]}
            label={item.label}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-[11px] text-cream/40">Nexora v1.0 · Panel de operaciones</p>
      </div>
    </div>
  )
}

export interface SidebarProps {
  open: boolean
  onClose: () => void
  activeId: NavId
  onNavigate: (id: NavId) => void
}

export function Sidebar({ open, onClose, activeId, onNavigate }: SidebarProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-sidebar lg:block">
        <LayoutGroup>
          <SidebarBody activeId={activeId} onNavigate={onNavigate} />
        </LayoutGroup>
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="sidebar-overlay"
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              key="sidebar-drawer"
              className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            >
              <LayoutGroup>
                <SidebarBody activeId={activeId} onNavigate={onNavigate} />
              </LayoutGroup>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}