import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUtensils,
  faBowlFood,
  faCartShopping,
  faClipboardList,
  faPlus,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons'
import { slideIn, fadeIn } from '../../../../design-tokens/motion'
import { MenuCategoriasGrid } from '../organisms/MenuCategoriasGrid'
import { ItemMenuProductosMasonry } from '../organisms/ItemMenuProductosMasonry'
import { FormularioServicioHabitacionCard } from '../organisms/FormularioServicioHabitacionCard'
import { FormularioAgregarProductoCard } from '../organisms/FormularioAgregarProductoCard'
import { CarritoServicioHabitacionOrganism } from '../organisms/CarritoServicioHabitacionOrganism'
import { PedidosServicioHabitacionOrganism } from '../organisms/PedidosServicioHabitacionOrganism'
import { EstadoPedidoAsignacionesOrganism } from '../organisms/EstadoPedidoAsignacionesOrganism'
import { useCarritoStore } from '../../application/carrito-store'
import type { MenuCategoria } from '../../domain/menu-categoria'

export function MenuServiciosHabitacionPage() {
  const [vistaActiva, setVistaActiva] = useState<
    'catalogo' | 'productos' | 'nuevo' | 'agregar-producto' | 'carrito' | 'pedidos' | 'estado-pedido'
  >('catalogo')
  const [categoriaParaProducto, setCategoriaParaProducto] = useState<MenuCategoria | null>(null)

  // Reactividad del total de productos en el carrito de Zustand
  const totalArticulos = useCarritoStore((s) =>
    s.items.reduce((acc, curr) => acc + curr.cantidad, 0)
  )

  const handleIrAgregarProducto = (cat?: MenuCategoria) => {
    setCategoriaParaProducto(cat ?? null)
    setVistaActiva('agregar-producto')
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header con animación slideIn y Copywriting Psicológico según src/agent.md */}
      <motion.header
        variants={slideIn}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl border border-line bg-panel px-6 py-8 shadow-xs sm:px-10 sm:py-9"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none"
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Gastronomía · Room Service
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight font-serif">
              {vistaActiva === 'pedidos'
                ? 'Pedidos y Comandas de Room Service'
                : vistaActiva === 'estado-pedido'
                  ? 'Estado de Asignaciones y Pedidos'
                  : vistaActiva === 'carrito'
                    ? 'Carrito y Comanda de Room Service'
                    : vistaActiva === 'agregar-producto'
                      ? 'Nuevo Producto de Menú'
                      : vistaActiva === 'nuevo'
                        ? 'Registrar Categoría de Servicio'
                        : vistaActiva === 'productos'
                          ? 'Productos y Platillos de Menú'
                          : 'Menú de Servicios a la Habitación'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-muted">
              {vistaActiva === 'pedidos'
                ? 'Visualiza la lista de comandas transmitidas a cocina, con detalle de platillos, notas gastronómicas y parámetros de entrega.'
                : vistaActiva === 'estado-pedido'
                  ? 'Monitorea el estado y las vinculaciones de las solicitudes de servicio en tiempo real con las estadías y huéspedes.'
                  : vistaActiva === 'carrito'
                    ? 'Revisa y gestiona los platillos y bebidas agregados a la comanda por el recepcionista antes de enviar la orden a cocina.'
                    : vistaActiva === 'agregar-producto'
                      ? `Agrega y cataloga un nuevo platillo, bebida o amenidad para ${
                          categoriaParaProducto ? `la categoría "${categoriaParaProducto.name}"` : 'la carta de habitaciones'
                        }.`
                      : vistaActiva === 'nuevo'
                        ? 'Da de alta una nueva categoría gastronómica para organizar la oferta culinaria de cada sede.'
                        : vistaActiva === 'productos'
                          ? 'Visualiza la galería visual en cascada de los platillos, bebidas y amenidades catalogadas para room service.'
                          : 'Visualiza y consulta la oferta de categorías culinarias, licores y amenidades catalogadas para cada sede y edificio de la red hotelera.'}
            </p>
          </div>

          {/* Selector de Pestañas Interactivo [Servicio, Producto, Carrito, Pedido, Estado Pedido] */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-canvas p-1.5 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setVistaActiva('catalogo')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaActiva === 'catalogo'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <FontAwesomeIcon icon={faUtensils} className="size-3.5" />
              <span>Servicio</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('productos')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaActiva === 'productos'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <FontAwesomeIcon icon={faBowlFood} className="size-3.5" />
              <span>Producto</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('carrito')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaActiva === 'carrito'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <FontAwesomeIcon icon={faCartShopping} className="size-3.5" />
              <span>Carrito</span>
              {totalArticulos > 0 && (
                <span
                  className={`inline-flex size-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
                    vistaActiva === 'carrito'
                      ? 'bg-white text-primary'
                      : 'bg-primary text-white'
                  }`}
                >
                  {totalArticulos}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('pedidos')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaActiva === 'pedidos'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <FontAwesomeIcon icon={faClipboardList} className="size-3.5" />
              <span>Pedido</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('estado-pedido')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaActiva === 'estado-pedido'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <FontAwesomeIcon icon={faListCheck} className="size-3.5" />
              <span>Estado Pedido</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('nuevo')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                vistaActiva === 'nuevo'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <FontAwesomeIcon icon={faPlus} className="size-3.5" />
              <span>Nueva Categoría</span>
            </button>
            {vistaActiva === 'agregar-producto' && (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold bg-primary text-white shadow-xs cursor-default"
              >
                <span>✨ Alta de Producto</span>
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* 2. Contenido según la vista activa */}
      <AnimatePresence mode="wait">
        {vistaActiva === 'catalogo' ? (
          <motion.div
            key="catalogo"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <MenuCategoriasGrid
              onNuevoRegistro={() => setVistaActiva('nuevo')}
              onAgregarProducto={(cat) => handleIrAgregarProducto(cat)}
            />
          </motion.div>
        ) : vistaActiva === 'productos' ? (
          <motion.div
            key="productos"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ItemMenuProductosMasonry
              onAgregarNuevo={() => setVistaActiva('agregar-producto')}
            />
          </motion.div>
        ) : vistaActiva === 'carrito' ? (
          <motion.div
            key="carrito"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <CarritoServicioHabitacionOrganism
              onIrAProductos={() => setVistaActiva('productos')}
            />
          </motion.div>
        ) : vistaActiva === 'pedidos' ? (
          <motion.div
            key="pedidos"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <PedidosServicioHabitacionOrganism
              onIrAProductos={() => setVistaActiva('productos')}
              onIrACarrito={() => setVistaActiva('carrito')}
              onIrAEstadoPedido={() => setVistaActiva('estado-pedido')}
            />
          </motion.div>
        ) : vistaActiva === 'estado-pedido' ? (
          <motion.div
            key="estado-pedido"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <EstadoPedidoAsignacionesOrganism
              onIrAPedidos={() => setVistaActiva('pedidos')}
              onIrAProductos={() => setVistaActiva('productos')}
            />
          </motion.div>
        ) : vistaActiva === 'nuevo' ? (
          <motion.div
            key="nuevo"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mx-auto max-w-4xl"
          >
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setVistaActiva('catalogo')}
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                <span>← Volver al catálogo de menús</span>
              </button>
            </div>
            <FormularioServicioHabitacionCard />
          </motion.div>
        ) : (
          <motion.div
            key="agregar-producto"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mx-auto max-w-4xl"
          >
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setVistaActiva('productos')}
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                <span>← Volver a productos</span>
              </button>
            </div>
            <FormularioAgregarProductoCard
              categoriaInicial={categoriaParaProducto}
              onProductoGuardado={() => {
                // Se mantiene en el formulario para permitir seguir registrando información
              }}
              onCancelar={() => setVistaActiva('productos')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

