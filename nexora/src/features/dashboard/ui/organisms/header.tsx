import { useState } from 'react'
import { motion } from 'motion/react'
import { slideIn } from '../../../../design-tokens/motion'
import { MenuIcon } from '../icons'
import { ThemeToggle } from '../atoms/theme-toggle'
import { SearchField } from '../molecules/search-field'
import { NotificationsMenu } from '../molecules/notifications-menu'
import { UserMenu } from '../molecules/user-menu'

import type { NavId } from '../navigation'

export interface HeaderProps {
  title: string
  subtitle: string
  onOpenSidebar: () => void
  onNavigate?: (id: NavId) => void
  onLogout?: () => void
}

export function Header({ title, subtitle, onOpenSidebar, onNavigate, onLogout }: HeaderProps) {
  const [query, setQuery] = useState('')

  return (
    <motion.header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSidebar}
          aria-label="Abrir menú de navegación"
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-panel text-ink-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
        >
          <MenuIcon className="size-5" />
        </motion.button>

        <motion.div
          variants={slideIn}
          initial="hidden"
          animate="visible"
          className="min-w-0 flex-1"
        >
          <h1 className="truncate text-lg font-bold text-ink">{title}</h1>
          <p className="truncate text-xs text-ink-muted">{subtitle}</p>
        </motion.div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <SearchField value={query} onChange={setQuery} className="w-56 lg:w-72" />
          </div>
          <ThemeToggle />
          <NotificationsMenu />
          <UserMenu onNavigate={onNavigate} onLogout={onLogout} />
        </div>
      </div>
    </motion.header>
  )
}