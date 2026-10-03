import { motion } from 'motion/react'
import { MoonIcon, SunIcon } from '../icons'
import { useTheme } from '../../application/use-theme'

export interface ThemeToggleProps {
  className?: string
}

/**
 * Componente de botón simple (ThemeToggle) para alternar entre modo claro y modo oscuro.
 * Consume el hook personalizado useTheme respaldado por React Context.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo oscuro activado · Clic para modo claro' : 'Modo claro activado · Clic para modo oscuro'}
      className={`inline-flex size-9 items-center justify-center rounded-lg border border-line bg-panel text-ink-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`.trim()}
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </motion.button>
  )
}