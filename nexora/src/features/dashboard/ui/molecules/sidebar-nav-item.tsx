import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface SidebarNavItemProps {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
}

export function SidebarNavItem({ icon, label, active, onClick }: SidebarNavItemProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cream/40',
        active ? 'text-cream' : 'text-cream/60 hover:bg-sidebar-hover hover:text-cream',
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-xl bg-white/10"
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        />
      )}
      <span className="relative shrink-0">{icon}</span>
      <span className="relative truncate">{label}</span>
    </motion.button>
  )
}