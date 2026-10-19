import { create } from 'zustand'
import type { ItemMenuProducto } from '../domain/item-menu'

export interface ItemCarrito {
  /** Referencia del producto agregado */
  producto: ItemMenuProducto
  /** Cantidad solicitada */
  cantidad: number
  /** Notas personalizadas o indicaciones especiales de cocina */
  notas?: string
}

export interface CarritoServicioHabitacionesState {
  items: ItemCarrito[]
  /** Agrega un producto al carrito o incrementa su cantidad si ya existe */
  agregarProducto: (producto: ItemMenuProducto, cantidad?: number) => void
  /** Remueve un producto del carrito por su clave única */
  removerProducto: (productoKey: string) => void
  /** Actualiza la cantidad exacta de un producto */
  actualizarCantidad: (productoKey: string, nuevaCantidad: number) => void
  /** Incrementa en 1 la cantidad */
  incrementarCantidad: (productoKey: string) => void
  /** Decrementa en 1 la cantidad (o lo elimina si llega a 0) */
  decrementarCantidad: (productoKey: string) => void
  /** Actualiza las notas especiales para el despacho en cocina */
  actualizarNotas: (productoKey: string, notas: string) => void
  /** Vacía todos los productos del carrito */
  vaciarCarrito: () => void
}

/**
 * Obtiene un identificador seguro para el item del carrito sin exponerlo al usuario.
 */
export function obtenerProductoKey(producto: ItemMenuProducto): string {
  return producto.id || producto.name.trim().toLowerCase()
}

/**
 * Store de Zustand para el Carrito de Pedidos de Room Service.
 * Mantiene la reactividad del pedido realizado por el recepcionista.
 */
export const useCarritoStore = create<CarritoServicioHabitacionesState>((set) => ({
  items: [],

  agregarProducto: (producto, cantidad = 1) =>
    set((state) => {
      const key = obtenerProductoKey(producto)
      const index = state.items.findIndex(
        (i) => obtenerProductoKey(i.producto) === key
      )

      if (index >= 0) {
        const nuevosItems = [...state.items]
        nuevosItems[index] = {
          ...nuevosItems[index],
          cantidad: nuevosItems[index].cantidad + cantidad,
        }
        return { items: nuevosItems }
      }

      return {
        items: [...state.items, { producto, cantidad, notas: '' }],
      }
    }),

  removerProducto: (productoKey) =>
    set((state) => ({
      items: state.items.filter(
        (i) => obtenerProductoKey(i.producto) !== productoKey
      ),
    })),

  actualizarCantidad: (productoKey, nuevaCantidad) =>
    set((state) => {
      if (nuevaCantidad <= 0) {
        return {
          items: state.items.filter(
            (i) => obtenerProductoKey(i.producto) !== productoKey
          ),
        }
      }
      return {
        items: state.items.map((i) =>
          obtenerProductoKey(i.producto) === productoKey
            ? { ...i, cantidad: nuevaCantidad }
            : i
        ),
      }
    }),

  incrementarCantidad: (productoKey) =>
    set((state) => ({
      items: state.items.map((i) =>
        obtenerProductoKey(i.producto) === productoKey
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      ),
    })),

  decrementarCantidad: (productoKey) =>
    set((state) => {
      const item = state.items.find((i) => obtenerProductoKey(i.producto) === productoKey)
      if (!item) return state

      if (item.cantidad <= 1) {
        return {
          items: state.items.filter(
            (i) => obtenerProductoKey(i.producto) !== productoKey
          ),
        }
      }

      return {
        items: state.items.map((i) =>
          obtenerProductoKey(i.producto) === productoKey
            ? { ...i, cantidad: i.cantidad - 1 }
            : i
        ),
      }
    }),

  actualizarNotas: (productoKey, notas) =>
    set((state) => ({
      items: state.items.map((i) =>
        obtenerProductoKey(i.producto) === productoKey ? { ...i, notas } : i
      ),
    })),

  vaciarCarrito: () => set({ items: [] }),
}))
