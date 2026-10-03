import { useEffect, useState } from 'react'

export interface NuevoTipoCardProps {
  index: number
  onClick: () => void
}

export function NuevoTipoCard({ index, onClick }: NuevoTipoCardProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Agregar un nuevo tipo de cama"
      className={`group flex min-h-[280px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-panel/60 px-6 py-10 text-center outline-none transition-all duration-500 ease-out hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/30 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-2xl font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        +
      </span>
      <span className="text-sm font-semibold text-primary">Nuevo tipo de cama</span>
      <span className="text-sm leading-relaxed text-ink-muted">
        Sumá una cama o un sofá con su capacidad de personas y su descripción.
      </span>
    </button>
  )
}