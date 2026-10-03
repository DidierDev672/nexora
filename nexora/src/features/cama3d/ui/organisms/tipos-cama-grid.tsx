import { useCallback, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import { ObtenerTiposCama } from '../../application/obtener-tipos-cama'
import type { TipoCama } from '../../domain/tipo-cama'
import { TipoCamaApiError } from '../../domain/tipo-cama-error'
import { ApiTipoCamaRepository } from '../../infrastructure/api-tipo-cama-repository'
import { Button } from '../atoms/button'
import { Gradiente3d } from '../atoms/gradiente-3d'
import { Loader } from '../atoms/loader'
import { modelosNoDisponiblesCopy, tipoCamaErrorCopy } from '../lib/error-copy'
import { Modelo3DFallback } from '../atoms/modelo-3d-fallback'
import { NuevoTipoCard } from '../molecules/nuevo-tipo-card'
import { TipoCamaCard } from '../molecules/tipo-cama-card'
import { EscenaTipoCama } from './escena-tipo-cama'
import { TipoCamaModal } from './tipo-cama-modal'

const obtenerTiposCama = ObtenerTiposCama(new ApiTipoCamaRepository())

export interface TiposCamaGridProps {
  onReady?: () => void
  variant?: 'grid' | 'sidebar'
  className?: string
  onSelectTipo?: (tipo: TipoCama) => void
}

function getAvatarScale(index: number, hovered: number | null): number {
  if (hovered === null) return 1
  const distance = Math.abs(index - hovered)
  if (distance === 0) return 1.28 // El avatar bajo el cursor se agranda progresivamente
  if (distance === 1) return 1.14 // Los avatares adyacentes se escalan de manera proporcionalmente menor
  if (distance === 2) return 1.05 // Onda secundaria suave
  return 1
}

function getAvatarZIndex(index: number, hovered: number | null): number {
  if (hovered === null) return 1
  const distance = Math.abs(index - hovered)
  if (distance === 0) return 30
  if (distance === 1) return 20
  if (distance === 2) return 10
  return 1
}

export function TiposCamaGrid({
  onReady,
  variant = 'grid',
  className,
  onSelectTipo,
}: TiposCamaGridProps) {
  const [tipos, setTipos] = useState<TipoCama[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalAbierta, setModalAbierta] = useState(false)
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const datos = await obtenerTiposCama()
      setTipos(datos)
    } catch (err) {
      const status = err instanceof TipoCamaApiError ? err.status : 0
      setError(tipoCamaErrorCopy(status))
    } finally {
      setLoading(false)
      onReady?.()
    }
  }, [onReady])

  useEffect(() => {
    void (async () => {
      await cargar()
    })()
  }, [cargar])

  const refrescar = useCallback(async () => {
    try {
      const datos = await obtenerTiposCama()
      setTipos(datos)
      setError(null)
    } catch (err) {
      const status = err instanceof TipoCamaApiError ? err.status : 0
      setError(tipoCamaErrorCopy(status))
    }
  }, [])

  if (variant === 'sidebar') {
    if (loading && tipos === null) {
      return (
        <div className={`flex flex-col items-center gap-4 py-2 ${className ?? ''}`}>
          <div className="size-20 sm:size-22 animate-pulse rounded-full border-2 border-line bg-canvas/60" />
          <div className="size-20 sm:size-22 animate-pulse rounded-full border-2 border-line bg-canvas/60" />
        </div>
      )
    }

    if (error && tipos === null) {
      return (
        <div className={`rounded-xl border border-amber-500/25 bg-amber-500/10 p-2.5 text-center text-xs text-ink ${className ?? ''}`}>
          <p className="font-medium text-[11px]">Error al cargar</p>
          <button
            type="button"
            onClick={() => void cargar()}
            className="mt-1.5 text-[11px] font-semibold text-primary underline"
          >
            Reintentar
          </button>
        </div>
      )
    }

    if (tipos && tipos.length === 0) {
      return (
        <div className={`rounded-xl border border-dashed border-line bg-canvas/40 p-2 text-center text-[11px] text-ink-muted ${className ?? ''}`}>
          Sin tipos
        </div>
      )
    }

    return (
      <div
        className={`flex flex-col items-center gap-5 max-h-[660px] overflow-y-auto overflow-x-visible py-4 px-2.5 ${className ?? ''}`}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {tipos?.map((tipo, index) => {
          const isHovered = hoveredIndex === index
          const isAdjacent = hoveredIndex !== null && Math.abs(index - hoveredIndex) === 1
          const scale = arrastrandoId === tipo.id ? 0.92 : getAvatarScale(index, hoveredIndex)
          const zIndex = getAvatarZIndex(index, hoveredIndex)

          return (
            <motion.div
              key={tipo.id}
              animate={{
                scale,
                zIndex,
              }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 24,
                mass: 0.6,
              }}
              style={{ zIndex }}
              className="relative shrink-0"
              onMouseEnter={() => setHoveredIndex(index)}
            >
              <div
                draggable
                tabIndex={0}
                role="button"
                aria-grabbed={arrastrandoId === tipo.id}
                aria-label={`Arrastrar o seleccionar tipo de cama: ${tipo.name}`}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(tipo))
                  e.dataTransfer.setData('text/plain', tipo.id)
                  e.dataTransfer.effectAllowed = 'copy'
                  setArrastrandoId(tipo.id)
                }}
                onDragEnd={() => {
                  setArrastrandoId(null)
                }}
                onClick={() => onSelectTipo?.(tipo)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectTipo?.(tipo)
                  }
                }}
                className={`group relative size-20 shrink-0 cursor-grab active:cursor-grabbing select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  arrastrandoId === tipo.id ? 'opacity-40' : ''
                }`}
                title={`Arrastra o haz clic para seleccionar ${tipo.name} (${tipo.capacity_people} ${tipo.capacity_people === 1 ? 'huésped' : 'huéspedes'})`}
              >
                {/* Avatar circular con el modelo 3D estático y realce proporcional de la onda */}
                <div
                  className={`relative size-full overflow-hidden rounded-full border-2 bg-panel transition-all duration-200 ${
                    isHovered
                      ? 'border-primary shadow-lg ring-4 ring-primary/20'
                      : isAdjacent
                        ? 'border-primary/50 shadow-md ring-2 ring-primary/10'
                        : 'border-line shadow-2xs group-hover:border-primary/40'
                  }`}
                >
                  <Modelo3DFallback className="size-full">
                    <EscenaTipoCama
                      name={tipo.name}
                      capacity={tipo.capacity_people}
                      staticModel
                      className="size-full overflow-hidden bg-linear-to-b from-canvas to-panel"
                    />
                  </Modelo3DFallback>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  if (loading && tipos === null) {
    return (
      <Loader fullScreen size={40} label="Construyendo las camas y los sofás…">
        <span className="max-w-xs text-center text-xs leading-relaxed text-ink-soft">
          Un momento: estamos armando los modelos 3D en el taller, con sus patas, almohadas y respaldos.
        </span>
      </Loader>
    )
  }

  return (
    <div className={className ?? 'mt-10'}>
      {error && tipos === null && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Gradiente3d message={modelosNoDisponiblesCopy}>
            <Button type="button" variant="secondary" className="shrink-0" onClick={() => void cargar()} disabled={loading}>
              Reintentar
            </Button>
          </Gradiente3d>
        </motion.div>
      )}

      {tipos && tipos.length === 0 && (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6 rounded-2xl border border-line bg-panel px-6 py-6 text-center text-sm leading-relaxed text-ink-muted"
        >
          Todavía no hay tipos de cama en el catálogo. Sumá el primero con la casilla que brilla abajo y
          empezá a llenar tu taller.
        </motion.p>
      )}

      {tipos && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tipos.map((tipo, index) => (
            <TipoCamaCard key={tipo.id} tipo={tipo} index={index} />
          ))}
          <NuevoTipoCard index={tipos.length} onClick={() => setModalAbierta(true)} />
        </div>
      )}

      <TipoCamaModal
        open={modalAbierta}
        onClose={() => setModalAbierta(false)}
        onSuccess={() => void refrescar()}
      />
    </div>
  )
}