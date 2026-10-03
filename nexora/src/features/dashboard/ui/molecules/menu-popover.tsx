import { AnimatePresence, motion } from 'motion/react'
import { type ReactNode, useEffect, useState } from 'react'
import { cn } from '../lib/cn'

export interface MenuPopoverProps {
  /** Texto accesible del botón que abre el menú. */
  label: string
  /** Función que dibuja el contenido del botón; recibe si está abierto. */
  renderTrigger: (open: boolean) => ReactNode
  /** Contenido del panel desplegable. */
  children: ReactNode
  align?: 'left' | 'right'
  triggerClassName?: string
  panelClassName?: string
}

export function MenuPopover({
  label,
  renderTrigger,
  children,
  align = 'right',
  triggerClassName,
  panelClassName,
}: MenuPopoverProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className={cn(
          'inline-flex size-9 items-center justify-center gap-2 rounded-lg border border-line bg-panel text-ink-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/40',
          triggerClassName,
        )}
      >
        {renderTrigger(open)}
      </motion.button>

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 mt-2 w-72 rounded-2xl border border-line bg-panel p-1.5 shadow-xl',
              align === 'right' ? 'right-0' : 'left-0',
              panelClassName,
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export interface MenuItemProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  danger?: boolean
}

export function MenuItem({ icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30',
        danger
          ? 'text-danger hover:bg-danger/10'
          : 'text-ink hover:bg-primary/5 hover:text-primary',
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/8 text-ink-muted">
        {icon}
      </span>
      {label}
    </button>
  )
}