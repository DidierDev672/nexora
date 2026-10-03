import { useEffect, useState } from 'react'
import type { TipoCama } from '../../domain/tipo-cama'
import { Modelo3DFallback } from '../atoms/modelo-3d-fallback'
import { EscenaTipoCama } from '../organisms/escena-tipo-cama'

export interface TipoCamaCardProps {
  tipo: TipoCama
  index: number
}

export function TipoCamaCard({ tipo, index }: TipoCamaCardProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-line bg-panel shadow-sm transition-all duration-500 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <Modelo3DFallback className="h-52 border-b border-line">
        <EscenaTipoCama name={tipo.name} capacity={tipo.capacity_people} />
      </Modelo3DFallback>
      <div className="px-5 py-4">
        <h3 className="text-base font-bold text-ink">{tipo.name}</h3>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
          {tipo.capacity_people} {tipo.capacity_people === 1 ? 'huésped' : 'huéspedes'}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{tipo.description}</p>
      </div>
    </article>
  )
}