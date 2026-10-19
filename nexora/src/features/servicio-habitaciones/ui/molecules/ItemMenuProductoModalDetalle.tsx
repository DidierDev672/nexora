import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons'
import { fadeUp } from '../../../../design-tokens/motion'
import { api } from '../../../../lib/api'
import { validateStatusCode } from '../../../../shared/lib/status-code-validator'
import { FALLBACK_MENU_CATEGORIAS } from '../../infrastructure/api-menu-categoria-repository'
import {
  type ItemMenuProducto,
  formatearMonedaCOP,
  resolverImagenProducto,
} from '../../domain/item-menu'
import { useCarritoStore, obtenerProductoKey } from '../../application/carrito-store'

export interface ItemMenuProductoModalDetalleProps {
  producto: ItemMenuProducto | null
  onClose: () => void
}

export function ItemMenuProductoModalDetalle({
  producto,
  onClose,
}: ItemMenuProductoModalDetalleProps) {
  // Estado para la información del servicio de habitaciones (categoría a la que pertenece)
  const [categoriaServicio, setCategoriaServicio] = useState<{
    name: string
    asset?: string
  } | null>(null)
  const [loadingCategoria, setLoadingCategoria] = useState(false)
  const [agregadoAnimado, setAgregadoAnimado] = useState(false)

  // Zustand Store para carrito de pedidos
  const agregarProductoAlCarrito = useCarritoStore((s) => s.agregarProducto)
  const itemsEnCarrito = useCarritoStore((s) => s.items)

  const itemKey = producto ? obtenerProductoKey(producto) : ''
  const itemEnCarrito = itemsEnCarrito.find((i) => obtenerProductoKey(i.producto) === itemKey)
  const cantidadEnCarrito = itemEnCarrito?.cantidad ?? 0

  const handleAgregarAlCarrito = () => {
    if (!producto) return
    agregarProductoAlCarrito(producto, 1)
    setAgregadoAnimado(true)
    setTimeout(() => setAgregadoAnimado(false), 1600)
  }

  // Cierre con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Consulta del endpoint GET /menu-category/{id} usando Category ID
  useEffect(() => {
    const catId = producto?.category_id
    if (!catId) {
      setCategoriaServicio(null)
      return
    }

    let isMounted = true

    // Coincidencia rápida en catálogo local para experiencia sin parpadeos
    const catLocal = FALLBACK_MENU_CATEGORIAS.find(
      (c) => c.headquartes_id === catId || c.name.toLowerCase() === catId.toLowerCase()
    )
    if (catLocal) {
      setCategoriaServicio({
        name: catLocal.name,
        asset: catLocal.asset,
      })
    }

    const fetchCategoria = async () => {
      setLoadingCategoria(true)
      try {
        const response = await api.get(`/menu-category/${encodeURIComponent(catId)}`, {
          skipAuth: true,
          validateStatus: () => true,
        })

        // Validación obligatoria con status-code-validator.ts
        const validation = validateStatusCode(response.status)

        if (validation.isValid && response.data && isMounted) {
          let raw: Record<string, unknown> | null = null

          if (Array.isArray(response.data) && response.data.length > 0) {
            raw = response.data[0] as Record<string, unknown>
          } else if (response.data && typeof response.data === 'object') {
            const obj = response.data as Record<string, unknown>
            if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
              raw = obj.data as Record<string, unknown>
            } else if (Array.isArray(obj.data) && obj.data.length > 0) {
              raw = obj.data[0] as Record<string, unknown>
            } else {
              raw = obj
            }
          }

          if (raw && typeof raw === 'object' && raw.name) {
            setCategoriaServicio({
              name: String(raw.name),
              asset: raw.asset ? String(raw.asset) : catLocal?.asset,
            })
          }
        }
      } catch (err) {
        console.warn('Aviso al consultar servicio de habitaciones:', err)
      } finally {
        if (isMounted) setLoadingCategoria(false)
      }
    }

    void fetchCategoria()

    return () => {
      isMounted = false
    }
  }, [producto?.category_id])

  if (!producto) return null

  const isVegetariano = Boolean(producto.isVegetarian ?? producto.is_vegetarian)
  const isVegano = Boolean(producto.isVegan ?? producto.is_vegan)
  const isDisponible = producto.available !== false
  const imagenUrl = resolverImagenProducto(producto)

  return (
    <AnimatePresence>
      <div
        data-id={producto.id}
        data-category-id={producto.category_id}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop desenfocado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />

        {/* Contenedor del Modal con animación fadeUp */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-panel shadow-2xl z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Cabecera: Fotografía ampliada del producto con badges */}
          <div className="relative aspect-16/10 sm:aspect-16/9 w-full overflow-hidden bg-black/10 shrink-0">
            <img
              src={imagenUrl}
              alt={producto.name}
              className="size-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/30 pointer-events-none"
            />

            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-md cursor-pointer border border-white/20 shadow-md"
              title="Cerrar ventana de detalle"
            >
              ✕
            </button>

            {/* Badge de Disponibilidad en la foto */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                  isDisponible
                    ? 'border border-emerald-400/40 bg-emerald-500/30 text-emerald-100'
                    : 'border border-rose-400/40 bg-rose-500/30 text-rose-100'
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    isDisponible ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                {isDisponible ? 'Disponible para Room Service' : 'Temporalmente Agotado'}
              </span>

              {isVegetariano && (
                <span className="inline-flex items-center gap-1 rounded-full border border-green-400/40 bg-green-950/70 px-2.5 py-1 text-xs font-semibold text-green-200 backdrop-blur-md">
                  🌱 Vegetariano
                </span>
              )}

              {isVegano && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-950/70 px-2.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md">
                  🌿 Vegano
                </span>
              )}
            </div>

            {/* Título en la base de la imagen */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
                {producto.name}
              </h2>
            </div>
          </div>

          {/* Cuerpo con scroll optimizado */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            {/* Tarjeta de Precio Destacado con botón rápido de Plus */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Tarifa de Carta al Huésped
                </span>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Precio final con cargo a la habitación del huésped.
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="sm:text-right">
                  <span className="font-sans text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight block">
                    {formatearMonedaCOP(producto.price)}
                  </span>
                  {producto.tax_percentage !== undefined && (
                    <p className="text-[11px] text-ink-muted">
                      + IVA del {producto.tax_percentage}% incluido en factura
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAgregarAlCarrito}
                  title="Agregar una unidad al carrito"
                  className="grid size-11 place-items-center rounded-2xl bg-primary text-white shadow-md hover:bg-primary/90 active:scale-90 transition-all cursor-pointer shrink-0"
                >
                  <FontAwesomeIcon icon={agregadoAnimado ? faCheck : faPlus} className="size-4" />
                </button>
              </div>
            </div>

            {/* Descripción y notas del chef */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                Descripción y Notas Gastronómicas
              </h4>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-line bg-canvas/60 p-4 rounded-2xl border border-line/60">
                {producto.description || 'Sin notas descriptivas adicionales para este producto.'}
              </p>
            </div>

            {/* Grid de Parámetros de Servicio: Tiempos y Horarios */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Parámetros de Servicio y Despacho
              </h4>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Tiempo de preparación */}
                <div className="rounded-2xl border border-line bg-canvas p-4">
                  <span className="block text-[11px] font-medium text-ink-muted">
                    Tiempo de cocina
                  </span>
                  <p className="mt-1 font-semibold text-ink text-sm sm:text-base flex items-center gap-1.5">
                    <span>⏱️</span>
                    <span>
                      {producto.prep_time !== undefined
                        ? `${producto.prep_time} minutos`
                        : 'Estándar (15-20 min)'}
                    </span>
                  </p>
                </div>

                {/* Horario de despacho */}
                <div className="rounded-2xl border border-line bg-canvas p-4 sm:col-span-2">
                  <span className="block text-[11px] font-medium text-ink-muted">
                    Ventana de atención a habitación
                  </span>
                  <p className="mt-1 font-semibold text-ink text-sm sm:text-base flex items-center gap-1.5">
                    <span>⏰</span>
                    <span>
                      {producto.start_time && producto.end_time
                        ? `De ${producto.start_time} a ${producto.end_time}`
                        : 'Disponible en horario regular de cocina'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Sección: Servicio de Habitaciones al que pertenece (debajo de parámetros de servicio y despacho) */}
            <div className="space-y-3 pt-4 border-t border-line/60">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <span>🍽️</span>
                  <span>Servicio de Habitaciones al que pertenece</span>
                </h4>
                {loadingCategoria && (
                  <span className="text-[11px] text-ink-muted animate-pulse">
                    Consultando menú...
                  </span>
                )}
              </div>

              {categoriaServicio ? (
                <div
                  data-category-id={producto.category_id}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-canvas/70 p-3.5 sm:p-4 shadow-2xs transition-all hover:bg-canvas"
                >
                  {/* asset: Fotografía del servicio de habitaciones */}
                  <div className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-black/10">
                    <img
                      src={
                        categoriaServicio.asset ||
                        'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=800'
                      }
                      alt={categoriaServicio.name}
                      className="size-full object-cover"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src =
                          'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=800'
                      }}
                    />
                  </div>

                  {/* name: Nombre del servicio de habitaciones */}
                  <div className="flex-1 min-w-0">
                    <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Menú de Carta Activo
                    </span>
                    <h5 className="mt-1 font-serif text-base sm:text-lg font-bold text-ink truncate">
                      {categoriaServicio.name}
                    </h5>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Categoría gastronómica asignada para pedidos a la habitación.
                    </p>
                  </div>
                </div>
              ) : loadingCategoria ? (
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-canvas/40 p-4 animate-pulse">
                  <div className="size-16 rounded-xl bg-ink/10" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-1/4 rounded bg-ink/10" />
                    <div className="h-4 w-1/2 rounded bg-ink/10" />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-line/60 bg-canvas/40 p-3.5 text-xs text-ink-muted">
                  <span>Información del servicio gastronómico no disponible para este producto.</span>
                </div>
              )}
            </div>
          </div>

          {/* Pie del modal con botón de cierre y botón con icono de plus para agregar al carrito */}
          <div className="border-t border-line bg-canvas/50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-ink-muted flex items-center gap-2">
              {cantidadEnCarrito > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 font-semibold text-primary">
                  <span>🛒</span>
                  <span>{cantidadEnCarrito} en la comanda del carrito</span>
                </span>
              ) : (
                <span>Listo para agregar al pedido del huésped</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-line bg-panel px-5 py-2.5 text-xs font-bold text-ink hover:bg-canvas transition-colors cursor-pointer shadow-2xs"
              >
                Cerrar detalle
              </button>
              <button
                type="button"
                onClick={handleAgregarAlCarrito}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer active:scale-95"
              >
                <FontAwesomeIcon icon={agregadoAnimado ? faCheck : faPlus} className="size-3.5" />
                <span>{agregadoAnimado ? '¡Agregado al Carrito!' : 'Agregar al Carrito'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
