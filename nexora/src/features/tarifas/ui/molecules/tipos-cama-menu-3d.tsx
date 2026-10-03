import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { api } from '../../../../lib/api'
import { fadeIn } from '../../../../design-tokens/motion'
import { esTipoSofa, type TipoCama } from '../../../cama3d/domain/tipo-cama'
import { EscenaTipoCama } from '../../../cama3d/ui/organisms/escena-tipo-cama'
import { Modelo3DFallback } from '../../../cama3d/ui/atoms/modelo-3d-fallback'
import { Button } from '../atoms/button'

export interface TiposCamaMenu3dProps {
  selectedTipo: TipoCama | null
  onSelectTipo: (tipo: TipoCama) => void
  onApplyToTarifa?: (tipo: TipoCama) => void
}

// Catálogo base de camas y sofás en 3D para disponibilidad inmediata y sin fallos
export const CATALOGO_CAMAS_DEFAULT: TipoCama[] = [
  {
    id: 'cama-king',
    name: 'Cama King Size',
    capacity_people: 2,
    description: 'Espacio y confort superior con almohadas dobles y estructura reforzada.',
    created_by: 'system',
  },
  {
    id: 'cama-queen',
    name: 'Cama Matrimonial Queen',
    capacity_people: 2,
    description: 'Equilibrio perfecto de descanso para parejas o viajeros ejecutivos.',
    created_by: 'system',
  },
  {
    id: 'cama-individual',
    name: 'Cama Individual Twin',
    capacity_people: 1,
    description: 'Diseño ergonómico ideal para habitaciones estándar de uso individual.',
    created_by: 'system',
  },
  {
    id: 'sofa-cama-doble',
    name: 'Sofá Cama Doble',
    capacity_people: 2,
    description: 'Mobiliario versátil convertible que maximiza el espacio diurno y nocturno.',
    created_by: 'system',
  },
  {
    id: 'sofa-cama-individual',
    name: 'Sofá Cama Individual',
    capacity_people: 1,
    description: 'Sofá compacto convertible para descanso casual o huésped adicional.',
    created_by: 'system',
  },
]

export function TiposCamaMenu3d({
  selectedTipo,
  onSelectTipo,
  onApplyToTarifa,
}: TiposCamaMenu3dProps) {
  const [tipos, setTipos] = useState<TipoCama[]>(CATALOGO_CAMAS_DEFAULT)
  const [filtro, setFiltro] = useState<'todos' | 'camas' | 'sofas'>('todos')
  const [rotacionActiva, setRotacionActiva] = useState(true)

  // Carga remota si la API /types-bed está activa
  useEffect(() => {
    let activo = true
    api
      .get<TipoCama[]>('/types-bed')
      .then((response) => {
        if (activo && response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
          setTipos(response.data)
        }
      })
      .catch(() => {
        // Mantiene CATALOGO_CAMAS_DEFAULT como respaldo garantizado
      })
    return () => {
      activo = false
    }
  }, [])

  // Seleccionar por defecto el primer elemento si ninguno está activo
  const actualTipo = selectedTipo ?? tipos[0] ?? CATALOGO_CAMAS_DEFAULT[0]

  const tiposFiltrados = tipos.filter((t) => {
    const isSofa = esTipoSofa(t.name)
    if (filtro === 'camas') return !isSofa
    if (filtro === 'sofas') return isSofa
    return true
  })

  const isCurrentSofa = esTipoSofa(actualTipo.name)

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 shadow-sm space-y-5">
      {/* Encabezado del menú 3D */}
      <div className="border-b border-line pb-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <svg
                className="size-4.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 4v16" />
                <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                <path d="M2 17h20" />
                <path d="M6 8v9" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">Mobiliario de descanso 3D</h2>
              <p className="text-[11px] text-ink-muted">Camas y sofás para la tarifa</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            3D Interactivo
          </span>
        </div>
      </div>

      {/* Visor 3D destacado */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-canvas">
        <Modelo3DFallback className="h-52 w-full">
          <EscenaTipoCama
            name={actualTipo.name}
            capacity={actualTipo.capacity_people}
            staticModel={!rotacionActiva}
            className="h-52 w-full bg-linear-to-b from-canvas via-canvas/90 to-panel"
          />
        </Modelo3DFallback>

        {/* Indicador flotante de interacción 3D */}
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-panel/85 px-2 py-1 text-[10px] font-medium text-ink shadow-2xs backdrop-blur-xs">
            <svg
              className="size-3 text-primary animate-spin"
              style={{ animationDuration: '6s' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Gira 360° con el mouse
          </span>

          <button
            type="button"
            onClick={() => setRotacionActiva((prev) => !prev)}
            className="pointer-events-auto rounded-md bg-panel/85 px-2 py-1 text-[10px] font-medium text-ink hover:text-primary shadow-2xs backdrop-blur-xs transition-colors"
            title="Alternar rotación automática"
          >
            {rotacionActiva ? 'Pausar' : 'Girar'}
          </button>
        </div>
      </div>

      {/* Tarjeta de detalles del modelo activo */}
      <div className="rounded-xl border border-line/70 bg-canvas/50 p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-ink">{actualTipo.name}</h3>
            <p className="mt-0.5 text-xs text-ink-muted line-clamp-2">
              {actualTipo.description}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
              isCurrentSofa
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {isCurrentSofa ? 'Sofá Cama' : 'Cama'}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-line/60 pt-2 text-xs">
          <span className="text-ink-muted">Capacidad recomendada:</span>
          <span className="font-semibold text-ink">
            {actualTipo.capacity_people}{' '}
            {actualTipo.capacity_people === 1 ? 'huésped' : 'huéspedes'}
          </span>
        </div>

        {onApplyToTarifa && (
          <Button
            variant="secondary"
            className="w-full text-xs py-2"
            onClick={() => onApplyToTarifa(actualTipo)}
          >
            <svg
              className="size-3.5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Aplicar a nombre de tarifa
          </Button>
        )}
      </div>

      {/* Filtros de Camas / Sofás */}
      <div className="flex items-center gap-1 rounded-xl bg-canvas p-1 text-xs">
        <button
          type="button"
          onClick={() => setFiltro('todos')}
          className={`flex-1 rounded-lg py-1.5 font-medium transition-colors text-center ${
            filtro === 'todos'
              ? 'bg-panel text-primary shadow-xs font-semibold'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          Todos ({tipos.length})
        </button>
        <button
          type="button"
          onClick={() => setFiltro('camas')}
          className={`flex-1 rounded-lg py-1.5 font-medium transition-colors text-center ${
            filtro === 'camas'
              ? 'bg-panel text-primary shadow-xs font-semibold'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          Camas ({tipos.filter((t) => !esTipoSofa(t.name)).length})
        </button>
        <button
          type="button"
          onClick={() => setFiltro('sofas')}
          className={`flex-1 rounded-lg py-1.5 font-medium transition-colors text-center ${
            filtro === 'sofas'
              ? 'bg-panel text-primary shadow-xs font-semibold'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          Sofás ({tipos.filter((t) => esTipoSofa(t.name)).length})
        </button>
      </div>

      {/* Lista interactiva de tipos para seleccionar */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {tiposFiltrados.map((tipo) => {
            const isSelected = actualTipo.id === tipo.id
            const isSofaItem = esTipoSofa(tipo.name)

            return (
              <motion.button
                key={tipo.id}
                type="button"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => onSelectTipo(tipo)}
                className={`w-full flex items-center justify-between gap-3 rounded-xl p-2.5 text-left text-xs transition-all ${
                  isSelected
                    ? 'border-2 border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border border-line bg-panel hover:bg-canvas text-ink'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-lg ${
                      isSelected
                        ? 'bg-primary text-white'
                        : isSofaItem
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-black/5 dark:bg-white/5 text-ink-muted'
                    }`}
                  >
                    {isSofaItem ? (
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                        <path d="M2 13h20v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4Z" />
                        <path d="M6 19v2M18 19v2" />
                      </svg>
                    ) : (
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <span className="block font-semibold line-clamp-1">{tipo.name}</span>
                    <span className="text-[10px] text-ink-muted">
                      {isSofaItem ? 'Sofá cama' : 'Cama de descanso'}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 text-[11px] font-medium text-ink-muted">
                  {tipo.capacity_people} pers.
                </span>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
