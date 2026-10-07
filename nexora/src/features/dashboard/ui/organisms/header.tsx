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
  canGoBack?: boolean
  onBack?: () => void
}

export function Header({
  title,
  subtitle,
  onOpenSidebar,
  onNavigate,
  onLogout,
  canGoBack,
  onBack,
}: HeaderProps) {
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

        {canGoBack && onBack && (
          <motion.button
            type="button"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            aria-label="Volver atrás a Configuración"
            title="Volver atrás a Configuración"
            className="group flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-1.5 text-xs font-bold text-primary shadow-2xs hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 text-primary transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Volver atrás</span>
          </motion.button>
        )}

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