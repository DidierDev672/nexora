import { SearchIcon, CloseIcon } from '../../../dashboard/ui/icons'
import {
  CATEGORIAS_CONFIGURACION,
  type ModuloCategoria,
  type CategoriaFiltro,
} from '../../domain/configuracion'

export interface ModuloFilterBarProps {
  busqueda: string
  onBusquedaChange: (val: string) => void
  categoriaActiva: ModuloCategoria
  onCategoriaChange: (cat: ModuloCategoria) => void
}

export function ModuloFilterBar({
  busqueda,
  onBusquedaChange,
  categoriaActiva,
  onCategoriaChange,
}: ModuloFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Píldoras de categorías */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="tablist">
        {CATEGORIAS_CONFIGURACION.map((cat: CategoriaFiltro) => {
          const isActive = categoriaActiva === cat.id
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onCategoriaChange(cat.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-primary text-cream shadow-xs'
                  : 'border border-line bg-panel text-ink-muted hover:border-primary/30 hover:text-ink'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Input de búsqueda interactivo */}
      <div className="relative w-full sm:w-72">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted">
          <SearchIcon className="size-4" />
        </span>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar módulo o función..."
          className="w-full rounded-xl border border-line bg-panel py-2 pl-9 pr-8 text-xs font-medium text-ink placeholder:text-ink-muted/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => onBusquedaChange('')}
            aria-label="Limpiar búsqueda"
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-ink-muted hover:text-ink cursor-pointer"
          >
            <CloseIcon className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
