import { useState, useEffect, useMemo, useTransition } from 'react'
import { AnimatePresence } from 'motion/react'
import axios from 'axios'
import { api } from '../../../../lib/api'
import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../../../shared/lib/status-code-validator'
import { Loader } from '../../../tema/ui/atoms/loader'
import { ItemMenuProductoCard } from '../molecules/ItemMenuProductoCard'
import { ItemMenuProductoModalDetalle } from '../molecules/ItemMenuProductoModalDetalle'
import {
  LazyAnimatedWrapper,
  InfiniteScroll,
  InfiniteScrollEnd,
} from '../../../../shared/ui'
import type { ItemMenuProducto } from '../../domain/item-menu'

export interface ItemMenuProductosMasonryProps {
  onAgregarNuevo?: () => void
}

export function ItemMenuProductosMasonry({ onAgregarNuevo }: ItemMenuProductosMasonryProps) {
  const [productos, setProductos] = useState<ItemMenuProducto[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<ItemMenuProducto | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<StatusCodeValidationResult | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroDieta, setFiltroDieta] = useState<'todos' | 'vegetarianos' | 'veganos' | 'disponibles'>('todos')
  const [, startTransition] = useTransition()

  const cargarProductos = async () => {
    setLoading(true)
    setFeedback(null)

    try {
      // Consumo del endpoint GET /item-menu
      const response = await api.get('/item-menu', {
        skipAuth: true,
        validateStatus: () => true,
      })

      // Validación obligatoria del status code con status-code-validator.ts
      const validation = validateStatusCode(response.status)
      setFeedback(validation)

      if (validation.isValid) {
        const rawData = response.data
        let lista: ItemMenuProducto[] = []

        if (Array.isArray(rawData)) {
          lista = rawData as ItemMenuProducto[]
        } else if (rawData && typeof rawData === 'object' && Array.isArray((rawData as { data?: unknown }).data)) {
          lista = (rawData as { data: ItemMenuProducto[] }).data
        }

        setProductos(lista)
      } else {
        setProductos([])
      }
    } catch (err: unknown) {
      let status = 500
      if (axios.isAxiosError(err) && err.response?.status) {
        status = err.response.status
      } else if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
        status = 408
      }
      const validation = validateStatusCode(status)
      setFeedback(validation)
      setProductos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargarProductos()
  }, [])

  // Filtrado reactivo fluido en memoria
  const productosFiltrados = useMemo(() => {
    return productos.filter((item) => {
      // 1. Filtro textual
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const coincideNombre = item.name.toLowerCase().includes(q)
        const coincideDesc = item.description ? item.description.toLowerCase().includes(q) : false
        if (!coincideNombre && !coincideDesc) return false
      }

      // 2. Filtro dietético / disponibilidad
      if (filtroDieta === 'vegetarianos') {
        return Boolean(item.isVegetarian ?? item.is_vegetarian)
      }
      if (filtroDieta === 'veganos') {
        return Boolean(item.isVegan ?? item.is_vegan)
      }
      if (filtroDieta === 'disponibles') {
        return item.available !== false
      }

      return true
    })
  }, [productos, busqueda, filtroDieta])

  // Paginación reactiva para InfiniteScroll (src/agent.md)
  const PAGE_SIZE = 8
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [busqueda, filtroDieta])

  const visibleProductos = useMemo(
    () => productosFiltrados.slice(0, visibleCount),
    [productosFiltrados, visibleCount]
  )
  const hasMore = visibleCount < productosFiltrados.length
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  return (
    <div className="space-y-6">
      {/* Barra Superior: Buscador y Filtros Rápidos */}
      <div className="flex flex-col gap-4 rounded-3xl border border-line bg-panel p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              const val = e.target.value
              startTransition(() => {
                setBusqueda(val)
              })
            }}
            placeholder="Buscar por platillo, ingrediente o nota de sabor..."
            className="w-full rounded-2xl border border-line bg-canvas px-4 py-2.5 text-xs text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-2.5 text-xs text-ink-muted hover:text-ink cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros de Dieta / Disponibilidad */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-line bg-canvas p-1 text-xs">
          <button
            type="button"
            onClick={() => setFiltroDieta('todos')}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
              filtroDieta === 'todos'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Todos ({productos.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroDieta('vegetarianos')}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
              filtroDieta === 'vegetarianos'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            🌱 Vegetarianos
          </button>
          <button
            type="button"
            onClick={() => setFiltroDieta('veganos')}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
              filtroDieta === 'veganos'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            🌿 Veganos
          </button>
          <button
            type="button"
            onClick={() => setFiltroDieta('disponibles')}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
              filtroDieta === 'disponibles'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            ✅ Disponibles
          </button>
        </div>

        {/* Acciones de Cabecera: Recargar y Registrar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void cargarProductos()}
            title="Recargar catálogo de productos"
            className="inline-flex items-center justify-center rounded-2xl border border-line bg-canvas p-2.5 text-ink-muted hover:text-ink hover:border-primary/40 transition-colors cursor-pointer shadow-2xs"
          >
            🔄
          </button>
          {onAgregarNuevo && (
            <button
              type="button"
              onClick={onAgregarNuevo}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <span>➕ Nuevo Producto</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner de Feedback (si la API arrojó un código no exitoso) */}
      {feedback && !feedback.isValid && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-xs dark:border-amber-950 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>
                {feedback.message ||
                  'No pudimos sincronizar los productos en este momento. Intenta recargar la lista.'}
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold">HTTP {feedback.status}</span>
          </div>
        </div>
      )}

      {/* Estado de Carga con Loader atómico */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader visible={true} label="Cargando productos de la carta..." />
        </div>
      ) : productosFiltrados.length === 0 ? (
        /* Estado Vacío elegante */
        <div className="rounded-3xl border border-line bg-panel p-12 text-center shadow-xs">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
            🍲
          </div>
          <h3 className="mt-4 font-serif text-xl font-bold text-ink">
            {productos.length === 0
              ? 'No hay productos registrados aún'
              : 'Ningún producto coincide con el filtro'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs text-ink-muted leading-relaxed">
            {productos.length === 0
              ? 'Comienza a dar de alta tus platillos, bebidas y amenidades de Room Service para visualizarlos aquí en cascada.'
              : 'Prueba ajustando los términos de búsqueda o cambiando el filtro dietético.'}
          </p>
          {onAgregarNuevo && productos.length === 0 && (
            <button
              type="button"
              onClick={onAgregarNuevo}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <span>Registrar primer producto</span>
            </button>
          )}
        </div>
      ) : (
        /* 🌊 Waterfall / Masonry Layout con InfiniteScroll y LazyAnimatedWrapper */
        <InfiniteScroll
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={false}
          animationVariant="slideUp"
          endMessage={
            <InfiniteScrollEnd label="Has visualizado todos los platillos y bebidas del menú de Room Service." />
          }
        >
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 [&>*]:break-inside-avoid">
            <AnimatePresence mode="popLayout">
              {visibleProductos.map((item, idx) => {
                // Clave inmutable y estable para la técnica FLIP
                const itemKey =
                  item.id || `${item.category_id || 'cat'}-${item.name}-${idx}`

                return (
                  <LazyAnimatedWrapper
                    key={itemKey}
                    layout
                    variant="slideUp"
                    viewportMargin="-100px"
                    once
                    className="break-inside-avoid mb-6"
                  >
                    <ItemMenuProductoCard
                      producto={item}
                      index={idx}
                      onVerDetalle={setProductoSeleccionado}
                    />
                  </LazyAnimatedWrapper>
                )
              })}
            </AnimatePresence>
          </div>
        </InfiniteScroll>
      )}

      {/* Modal de Detalle al hacer clic en la fotografía del producto */}
      <ItemMenuProductoModalDetalle
        producto={productoSeleccionado}
        onClose={() => setProductoSeleccionado(null)}
      />
    </div>
  )
}
