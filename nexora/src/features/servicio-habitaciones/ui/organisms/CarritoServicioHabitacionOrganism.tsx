import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faMinus,
  faTrash,
  faCheck,
  faCartShopping,
  faUtensils,
  faArrowLeft,
  faClock,
  faCreditCard,
  faPhone,
  faTruck,
} from '@fortawesome/free-solid-svg-icons'
import { fadeIn } from '../../../../design-tokens/motion'
import {
  InfiniteScroll,
  InfiniteScrollEnd,
  LazyAnimatedWrapper,
} from '../../../../shared/ui'
import {
  useCarritoStore,
  obtenerProductoKey,
} from '../../application/carrito-store'
import {
  formatearMonedaCOP,
  resolverImagenProducto,
} from '../../domain/item-menu'
import {
  ModalConfirmarPedidoCocina,
  OPCIONES_CANAL,
  OPCIONES_METODO_PAGO,
  type DatosOrdenCocina,
} from '../molecules/ModalConfirmarPedidoCocina'

export interface CarritoServicioHabitacionOrganismProps {
  onIrAProductos?: () => void
}

function formatearFechaHoraLegible(val?: string): string {
  if (!val) return 'Despacho inmediato'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return val
  }
}

export function CarritoServicioHabitacionOrganism({
  onIrAProductos,
}: CarritoServicioHabitacionOrganismProps) {
  const items = useCarritoStore((s) => s.items)
  const incrementarCantidad = useCarritoStore((s) => s.incrementarCantidad)
  const decrementarCantidad = useCarritoStore((s) => s.decrementarCantidad)
  const removerProducto = useCarritoStore((s) => s.removerProducto)
  const actualizarNotas = useCarritoStore((s) => s.actualizarNotas)
  const vaciarCarrito = useCarritoStore((s) => s.vaciarCarrito)

  const [pedidoConfirmado, setPedidoConfirmado] = useState(false)
  const [habitacionDestino, setHabitacionDestino] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [datosOrden, setDatosOrden] = useState<DatosOrdenCocina | null>(null)

  // Cálculos financieros y contables de la orden
  const totalArticulos = items.reduce((acc, curr) => acc + curr.cantidad, 0)
  const subtotalNeto = items.reduce(
    (acc, curr) => acc + curr.producto.price * curr.cantidad,
    0
  )
  const totalImpuestos = items.reduce((acc, curr) => {
    const taxRate = (curr.producto.tax_percentage ?? 0) / 100
    return acc + curr.producto.price * curr.cantidad * taxRate
  }, 0)
  const totalGeneral = subtotalNeto + totalImpuestos

  // Paginación reactiva para InfiniteScroll (src/agent.md)
  const PAGE_SIZE_CARRITO = 6
  const [visibleCountCarrito, setVisibleCountCarrito] = useState<number>(PAGE_SIZE_CARRITO)

  useEffect(() => {
    setVisibleCountCarrito(PAGE_SIZE_CARRITO)
  }, [items.length])

  const visibleItems = useMemo(
    () => items.slice(0, visibleCountCarrito),
    [items, visibleCountCarrito]
  )
  const hasMoreItems = visibleCountCarrito < items.length
  const handleLoadMoreItems = () => {
    setVisibleCountCarrito((prev) => prev + PAGE_SIZE_CARRITO)
  }

  const handleAbrirModal = () => {
    setIsModalOpen(true)
  }

  const handleConfirmarOrdenModal = (datos: DatosOrdenCocina) => {
    setDatosOrden(datos)
    setIsModalOpen(false)
    setPedidoConfirmado(true)
  }

  const handleNuevoPedido = () => {
    vaciarCarrito()
    setPedidoConfirmado(false)
    setDatosOrden(null)
    setHabitacionDestino('')
    if (onIrAProductos) onIrAProductos()
  }

  return (
    <div className="space-y-8">
      {/* Modal de Confirmación y Parámetros de Orden */}
      <ModalConfirmarPedidoCocina
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmar={handleConfirmarOrdenModal}
        totalArticulos={totalArticulos}
        totalGeneral={totalGeneral}
        recepcionInicial={habitacionDestino}
      />

      {/* Estado: Pedido Confirmado / Comanda Exitosa con datos completos */}
      {pedidoConfirmado && datosOrden ? (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl rounded-3xl border border-emerald-500/30 bg-panel p-6 sm:p-9 shadow-xl space-y-6"
        >
          <div className="text-center space-y-3">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-3xl">
              <FontAwesomeIcon icon={faCheck} />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span>N° de Comanda:</span>
              <span className="font-mono">{datosOrden.numeroOrden}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              ¡Comanda Transmitida a Cocina con Éxito!
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted max-w-lg mx-auto">
              El pedido de Room Service ha sido registrado en la cola de cocina y notificado al equipo de servicio.
            </p>
          </div>

          {/* Grilla con los parámetros confirmados del formulario */}
          <div className="rounded-2xl border border-line bg-canvas/60 p-5 sm:p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted pb-2 border-b border-line">
              Ficha de Despacho y Parámetros de Servicio
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Recepción */}
              <div className="rounded-xl border border-line bg-panel p-3">
                <span className="text-[11px] font-medium text-ink-muted block">
                  Recepción / Destino
                </span>
                <span className="font-bold text-ink text-sm mt-0.5 block">
                  {datosOrden.recepcion}
                </span>
              </div>

              {/* Horario de entrega */}
              <div className="rounded-xl border border-line bg-panel p-3">
                <span className="text-[11px] font-medium text-ink-muted block flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faClock} className="size-2.5 text-ink-muted" />
                  <span>Horario de entrega programado</span>
                </span>
                <span className="font-bold text-ink text-sm mt-0.5 block">
                  {formatearFechaHoraLegible(datosOrden.horarioEntrega)}
                </span>
              </div>

              {/* Canal */}
              <div className="rounded-xl border border-line bg-panel p-3">
                <span className="text-[11px] font-medium text-ink-muted block flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faPhone} className="size-2.5 text-ink-muted" />
                  <span>Canal de solicitud</span>
                </span>
                <span className="font-bold text-ink text-sm mt-0.5 block">
                  {OPCIONES_CANAL.find((c) => c.value === datosOrden.canal)?.label || datosOrden.canal}
                </span>
              </div>

              {/* Método de pago */}
              <div className="rounded-xl border border-line bg-panel p-3">
                <span className="text-[11px] font-medium text-ink-muted block flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCreditCard} className="size-2.5 text-ink-muted" />
                  <span>Método de pago</span>
                </span>
                <span className="font-bold text-ink text-sm mt-0.5 block">
                  {OPCIONES_METODO_PAGO.find((m) => m.value === datosOrden.metodoPago)?.label ||
                    datosOrden.metodoPago}
                </span>
              </div>

              {/* Propina */}
              <div className="rounded-xl border border-line bg-panel p-3">
                <span className="text-[11px] font-medium text-ink-muted block flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">$</span>
                  <span>Propina</span>
                </span>
                <span className="font-bold text-ink text-sm mt-0.5 block">
                  {datosOrden.propina > 0 ? formatearMonedaCOP(datosOrden.propina) : 'Sin propina'}
                </span>
              </div>
            </div>

            {/* Instrucciones de delivery si existen */}
            {datosOrden.instruccionesDelivery && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary block flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faTruck} className="size-3" />
                  <span>Instrucciones para el Delivery</span>
                </span>
                <p className="mt-1 text-ink">{datosOrden.instruccionesDelivery}</p>
              </div>
            )}

            {/* Notas generales si existen */}
            {datosOrden.notasGenerales && (
              <div className="rounded-xl border border-line bg-panel p-3 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
                  Notas Generales de Cocina
                </span>
                <p className="mt-1 text-ink">{datosOrden.notasGenerales}</p>
              </div>
            )}

            {/* Resumen de totales */}
            <div className="pt-3 border-t border-line flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-xs text-ink-muted">
                Total artículos: <strong className="text-ink">{totalArticulos}</strong>
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                Importe Total: {formatearMonedaCOP(totalGeneral + (datosOrden.propina || 0))}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleNuevoPedido}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faUtensils} className="size-3.5" />
              <span>Crear Otro Pedido de Room Service</span>
            </button>
          </div>
        </motion.div>
      ) : items.length === 0 ? (
        /* Estado Vacío */
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-xl rounded-3xl border border-line bg-panel p-10 text-center shadow-xs space-y-6"
        >
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary border border-primary/20 text-3xl">
            <FontAwesomeIcon icon={faCartShopping} />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-ink">
              El Carrito de Room Service está Vacío
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
              Aún no has agregado productos al pedido. Abre el detalle de cualquier platillo o bebida de la carta y pulsa el botón con el icono de plus (+) para agregarlo a la comanda.
            </p>
          </div>

          {onIrAProductos && (
            <button
              type="button"
              onClick={onIrAProductos}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faUtensils} className="size-3.5" />
              <span>Explorar Productos y Carta</span>
            </button>
          )}
        </motion.div>
      ) : (
        /* Vista con Artículos Agregados */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Lista de Productos en el Carrito (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-ink">
                  Artículos seleccionados ({totalArticulos})
                </span>
              </div>
              <button
                type="button"
                onClick={vaciarCarrito}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faTrash} className="size-3" />
                <span>Vaciar comanda</span>
              </button>
            </div>

            <InfiniteScroll
              onLoadMore={handleLoadMoreItems}
              hasMore={hasMoreItems}
              isLoading={false}
              animationVariant="slideUp"
              endMessage={
                items.length > 0 ? (
                  <InfiniteScrollEnd label="Todos los productos de tu comanda están listados arriba." />
                ) : null
              }
            >
              <div className="space-y-3">
                <AnimatePresence>
                  {visibleItems.map((item) => {
                    const itemKey = obtenerProductoKey(item.producto)
                    const isVegetariano = Boolean(item.producto.isVegetarian ?? item.producto.is_vegetarian)
                    const isVegano = Boolean(item.producto.isVegan ?? item.producto.is_vegan)
                    const subtotalItem = item.producto.price * item.cantidad

                    return (
                      <LazyAnimatedWrapper
                        key={itemKey}
                        layout
                        variant="slideUp"
                        viewportMargin="-50px"
                        once
                        data-product-key={itemKey}
                        className="rounded-3xl border border-line bg-panel p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 space-y-4"
                      >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Fotografía del producto */}
                        <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-2xl border border-line bg-black/10">
                          <img
                            src={resolverImagenProducto(item.producto)}
                            alt={item.producto.name}
                            className="size-full object-cover"
                          />
                        </div>

                        {/* Información del producto (sin IDs ni created_by según la regla de oro) */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {isVegetariano && (
                              <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                                🌱 Vegetariano
                              </span>
                            )}
                            {isVegano && (
                              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                🌿 Vegano
                              </span>
                            )}
                            {item.producto.prep_time !== undefined && (
                              <span className="text-[10px] text-ink-muted">
                                ⏱️ {item.producto.prep_time} min
                              </span>
                            )}
                          </div>

                          <h4 className="font-serif text-base sm:text-lg font-bold text-ink truncate">
                            {item.producto.name}
                          </h4>

                          <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">
                            {item.producto.description || 'Sin notas descriptivas'}
                          </p>

                          <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Precio unitario: {formatearMonedaCOP(item.producto.price)}
                          </div>
                        </div>

                        {/* Controles de Cantidad y Subtotal */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line/60">
                          {/* Selector de Cantidad */}
                          <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-canvas p-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => decrementarCantidad(itemKey)}
                              className="grid size-8 place-items-center rounded-xl bg-panel text-ink-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer border border-line/50"
                              title="Reducir cantidad"
                            >
                              <FontAwesomeIcon icon={faMinus} className="size-2.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-ink">
                              {item.cantidad}
                            </span>
                            <button
                              type="button"
                              onClick={() => incrementarCantidad(itemKey)}
                              className="grid size-8 place-items-center rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                              title="Aumentar cantidad"
                            >
                              <FontAwesomeIcon icon={faPlus} className="size-2.5" />
                            </button>
                          </div>

                          {/* Subtotal de línea */}
                          <div className="text-right">
                            <span className="font-sans text-sm sm:text-base font-extrabold text-ink">
                              {formatearMonedaCOP(subtotalItem)}
                            </span>
                          </div>

                          {/* Botón eliminar */}
                          <button
                            type="button"
                            onClick={() => removerProducto(itemKey)}
                            className="text-ink-muted hover:text-rose-500 p-1 transition-colors cursor-pointer"
                            title="Eliminar este platillo del carrito"
                          >
                            <FontAwesomeIcon icon={faTrash} className="size-3" />
                          </button>
                        </div>
                      </div>

                      {/* Campo opcional de notas de preparación para la cocina */}
                      <div className="pt-2 border-t border-line/50">
                        <input
                          type="text"
                          value={item.notas || ''}
                          onChange={(e) => actualizarNotas(itemKey, e.target.value)}
                          placeholder="Indicaciones especiales para la cocina (ej: salsa aparte, término medio...)"
                          className="w-full rounded-xl border border-line/80 bg-canvas/60 px-3.5 py-1.5 text-xs text-ink placeholder:text-ink-muted/70 focus:border-primary focus:bg-canvas focus:outline-hidden transition-all"
                        />
                      </div>
                      </LazyAnimatedWrapper>
                    )
                  })}
                </AnimatePresence>
              </div>
            </InfiniteScroll>

            {onIrAProductos && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onIrAProductos}
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
                  <span>Seguir agregando productos de la carta</span>
                </button>
              </div>
            )}
          </div>

          {/* Columna Derecha: Tarjeta de Liquidación y Confirmación (lg:col-span-4) */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div className="rounded-3xl border border-line bg-panel p-6 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <h3 className="font-serif text-lg font-bold text-ink">
                  Resumen de la Comanda
                </h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {totalArticulos} {totalArticulos === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Asignación de Habitación */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                  Habitación del Huésped
                </label>
                <input
                  type="text"
                  value={habitacionDestino}
                  onChange={(e) => setHabitacionDestino(e.target.value)}
                  placeholder="Ej: Habitación 304 - Suite Deluxe"
                  className="w-full rounded-2xl border border-line bg-canvas px-4 py-2.5 text-xs text-ink placeholder:text-ink-muted/70 focus:border-primary focus:outline-hidden transition-all"
                />
              </div>

              {/* Desglose de Precios */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-ink-muted">
                  <span>Subtotal alimentos y bebidas</span>
                  <span className="font-semibold text-ink">
                    {formatearMonedaCOP(subtotalNeto)}
                  </span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Impuesto estimado (IVA)</span>
                  <span className="font-semibold text-ink">
                    {formatearMonedaCOP(totalImpuestos)}
                  </span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Cargo por servicio a habitación</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Incluido
                  </span>
                </div>

                <div className="pt-3 border-t border-line flex justify-between items-baseline">
                  <span className="text-sm font-bold text-ink">Total a Cargar</span>
                  <span className="font-sans text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {formatearMonedaCOP(totalGeneral)}
                  </span>
                </div>
              </div>

              {/* Botón de Confirmación que abre el modal */}
              <button
                type="button"
                onClick={handleAbrirModal}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-4 text-xs font-bold text-white shadow-md hover:bg-primary/90 active:scale-98 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faCheck} className="size-3.5" />
                <span>Confirmar y Enviar a Cocina</span>
              </button>

              <p className="text-[11px] text-ink-muted text-center leading-relaxed">
                El pedido se transmitirá en tiempo real a la estación de Room Service del hotel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
