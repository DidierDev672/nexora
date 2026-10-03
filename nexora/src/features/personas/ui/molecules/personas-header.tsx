import { motion } from 'motion/react'
import { slideIn } from '../../../../design-tokens/motion'

export function PersonasHeader() {
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
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          Directorio · Nuevo Registro
        </div>
        <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">
          Tus nuevos aliados y clientes
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Estás en el registro de personas. Asocia documentos, mantén tus canales de contacto al día y
          asigna roles con total claridad para que tu red crezca de forma segura y organizada.
        </p>
      </div>
    </motion.header>
  )
}
