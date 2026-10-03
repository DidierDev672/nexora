import { motion } from 'motion/react'
import { slideIn } from '../../../../design-tokens/motion'

export function RecursosHeader() {
  return (
    <motion.header
      variants={slideIn}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-line bg-panel px-6 py-10 shadow-sm sm:px-10 sm:py-12"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent"
      />
      <div className="relative max-w-xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Recursos · Componentes
        </p>
        <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">Tus recursos</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Creá, registrá y protegé cada recurso de tu sistema. Elegí cómo se construye, quién
          lo ve y quién lo usa — todo en un solo lugar y sin fricciones.
        </p>
      </div>
    </motion.header>
  )
}