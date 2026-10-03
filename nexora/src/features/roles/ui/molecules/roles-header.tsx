import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

export function RolesHeader() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 80)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <motion.header
      initial={{ x: -72, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 110, damping: 16 }}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-linear-to-r from-surface to-neutral px-6 py-10 shadow-xl sm:px-10 sm:py-14"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-primary/50 via-primary/25 to-primary/10" />

      <motion.div
        initial={{ x: -48, opacity: 0 }}
        animate={mounted ? { x: 0, opacity: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="relative max-w-xl"
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
          Gestión · Roles
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Roles</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/90">
          Cada miembro de tu equipo tiene su papel. Crea y organiza roles claros —nombre,
          descripción y permisos— para que tu gestión fluya con claridad y buena energía.
        </p>
      </motion.div>
    </motion.header>
  )
}