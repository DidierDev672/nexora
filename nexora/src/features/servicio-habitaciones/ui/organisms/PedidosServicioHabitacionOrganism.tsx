import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, type Variants } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faReceipt,
  faUtensils,
  faClock,
  faCreditCard,
  faMoneyBillWave,
  faPhone,
  faTruck,
  faCheck,
  faUser,
  faDoorOpen,
  faHotel,
  faBellConcierge,
  faRotateRight,
  faCircleExclamation,
  faMagnifyingGlass,
  faMobileScreen,
  faTabletScreenButton,
  faQrcode,
  faClipboardList,
  faListCheck,
  faTriangleExclamation,
  faFire,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { fadeIn } from '../../../../design-tokens/motion'
import { api } from '../../../../lib/api'
import { validateStatusCode, type StatusCodeValidationResult } from '../../../../shared/lib/status-code-validator'
import { InfiniteScroll, InfiniteScrollEnd } from '../../../../shared/ui'
import { formatearMonedaCOP } from '../../domain/item-menu'
import { Loader } from '../../../tema/ui/atoms/loader'
import { readAuthUser } from '../../../../shared/auth-storage'
import type { RawStayApi } from '../molecules/ModalSeleccionarRecepcion'
import type { RoomApi, BuildingApi } from '../molecules/ModalConfirmarPedidoCocina'

/**
 * Variantes de orquestación para Stagger Reveal (revelado escalonado) de comandas de cocina
 * según especificación en prompt/prompt-stagger-reveal-framer-motion.md
 */
const KITCHEN_TICKETS_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
}

const KITCHEN_TICKET_CARD_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 300,
      mass: 0.8,
    },
  },
}

export interface ServiceRequestItem {
  item_menu_id: string
  name_snapshot: string
  price_unit: number
  tax_rate?: number
  amount: number
  note?: string
}

export interface ServiceRequestOrder {
  id?: string
  order_number: string
  stay_id: string
  room_id: string
  person_id: string
  channel?: string
  payment_method?: string
  general_notes?: string
  delivery_instructions?: string
  scheduled_for?: string
  currency?: string
  tip?: number
  items: ServiceRequestItem[]
  created_by?: string
  created_at?: string
  status?: string
}

export interface UpdateServiceRequestPayload {
  id: string
  status: string
  actor_type: string
  actor_id: string
  status_comment: string
  grade: number
  guest_comment: string
  general_notes: string | null
  delivery_instructions: string | null
}

export interface CreateServiceAssignmentPayload {
  service_request_id: string
  stay_id: string
  person_id: string
  is_active: boolean
}

export interface PedidosServicioHabitacionOrganismProps {
  onIrAProductos?: () => void
  onIrACarrito?: () => void
  onIrAEstadoPedido?: () => void
}

export type NivelPrioridad = 'urgente' | 'atencion' | 'normal'

export interface PrioridadInfo {
  nivel: NivelPrioridad
  etiqueta: string
  tiempoTexto: string
  bordeClase: string
  bgHeaderClase: string
  textHeaderClase: string
  badgeClase: string
  icon: typeof faFire
}

export type EstadoPedido =
  | 'en_cola'
  | 'en_preparacion'
  | 'en_camino'
  | 'entregado'
  | 'cancelado'

export interface EstadoPedidoConfig {
  id: EstadoPedido
  label: string
  colorBadge: string
  dotColor: string
  icon: typeof faClock
}

export const ESTADOS_PEDIDO_CONFIG: Record<EstadoPedido, EstadoPedidoConfig> = {
  en_cola: {
    id: 'en_cola',
    label: 'EN COLA',
    colorBadge: 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30',
    dotColor: 'bg-amber-400',
    icon: faClock,
  },
  en_preparacion: {
    id: 'en_preparacion',
    label: 'EN PREPARACIÓN',
    colorBadge: 'bg-orange-500/20 text-orange-800 dark:text-orange-200 border border-orange-500/30',
    dotColor: 'bg-orange-400',
    icon: faFire,
  },
  en_camino: {
    id: 'en_camino',
    label: 'EN CAMINO',
    colorBadge: 'bg-sky-500/20 text-sky-800 dark:text-sky-200 border border-sky-500/30',
    dotColor: 'bg-sky-400',
    icon: faTruck,
  },
  entregado: {
    id: 'entregado',
    label: 'ENTREGADO',
    colorBadge: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    icon: faCheck,
  },
  cancelado: {
    id: 'cancelado',
    label: 'CANCELADO',
    colorBadge: 'bg-rose-500/20 text-rose-800 dark:text-rose-200 border border-rose-500/30',
    dotColor: 'bg-rose-400',
    icon: faCircleExclamation,
  },
}

/**
 * Calcula dinámicamente la prioridad de la comanda de cocina basándose en urgencia,
 * notas críticas y tiempo de espera hasta la entrega programada.
 */
export function calcularPrioridadComanda(orden: ServiceRequestOrder): PrioridadInfo {
  const textoCompleto = `${orden.general_notes || ''} ${orden.delivery_instructions || ''} ${orden.items?.map((i) => i.note || '').join(' ') || ''}`.toLowerCase()

  const esUrgentePorTexto =
    textoCompleto.includes('urgente') ||
    textoCompleto.includes('inmediat') ||
    textoCompleto.includes('alergia') ||
    textoCompleto.includes('alérgico') ||
    textoCompleto.includes('sin gluten') ||
    textoCompleto.includes('rapido') ||
    textoCompleto.includes('rápido')

  let diferenciaMinutos: number | null = null
  if (orden.scheduled_for) {
    try {
      const fecha = new Date(orden.scheduled_for).getTime()
      if (!isNaN(fecha)) {
        const ahora = Date.now()
        diferenciaMinutos = Math.round((fecha - ahora) / (1000 * 60))
      }
    } catch {
      // Silencioso
    }
  }

  // 1. Prioridad Crítica / Urgente (Borde y Alerta en Rojo)
  if (esUrgentePorTexto || (diferenciaMinutos !== null && diferenciaMinutos <= 15)) {
    return {
      nivel: 'urgente',
      etiqueta: 'PRIORIDAD CRÍTICA · RUSH',
      tiempoTexto:
        diferenciaMinutos !== null && diferenciaMinutos < 0
          ? `ENTREGA DEMORADA (+${Math.abs(diferenciaMinutos)} MIN)`
          : diferenciaMinutos !== null
            ? `ENTREGA EN ${diferenciaMinutos} MIN`
            : 'ENTREGA INMEDIATA',
      bordeClase:
        'border-2 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.22)] ring-1 ring-red-500/40 bg-red-500/[0.02]',
      bgHeaderClase: 'bg-red-600 dark:bg-red-700',
      textHeaderClase: 'text-white',
      badgeClase:
        'bg-red-600 text-white font-mono font-black animate-pulse shadow-sm',
      icon: faFire,
    }
  }

  // 2. Prioridad Media / Atención (Borde y Alerta en Ámbar / Amarillo)
  if (diferenciaMinutos !== null && diferenciaMinutos <= 40) {
    return {
      nivel: 'atencion',
      etiqueta: 'TIEMPO MEDIO · EN PREPARACIÓN',
      tiempoTexto: `ENTREGA EN ~${diferenciaMinutos} MIN`,
      bordeClase:
        'border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.18)] ring-1 ring-amber-500/30 bg-amber-500/[0.02]',
      bgHeaderClase: 'bg-amber-500 dark:bg-amber-600',
      textHeaderClase: 'text-zinc-950 font-black',
      badgeClase:
        'bg-amber-500 text-zinc-950 font-mono font-black shadow-sm',
      icon: faClock,
    }
  }

  // 3. Prioridad Normal / En tiempo (Borde en Verde Esmeralda)
  return {
    nivel: 'normal',
    etiqueta: 'A TIEMPO · COLA REGULAR',
    tiempoTexto:
      diferenciaMinutos !== null
        ? `ENTREGA EN ${diferenciaMinutos} MIN`
        : 'ENTREGA EN COLA',
      bordeClase:
        'border-2 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.12)] hover:border-emerald-500 bg-emerald-500/[0.01]',
    bgHeaderClase: 'bg-emerald-600 dark:bg-emerald-700',
    textHeaderClase: 'text-white font-bold',
    badgeClase:
      'bg-emerald-600 text-white font-mono font-bold shadow-sm',
    icon: faCheck,
  }
}

/**
 * Pedidos demo con diferentes niveles de prioridad para validar visualmente el sistema KDS
 */
export const DEMO_PEDIDOS_CONTINGENCIA: ServiceRequestOrder[] = [
  {
    id: 'sr-1',
    order_number: '71',
    stay_id: 'e8b8abd74ee52a63',
    room_id: '2a45ac749faa2848',
    person_id: '64765b959a658887',
    channel: 'front_desk',
    payment_method: 'room_charge',
    general_notes: 'Sin azucar, por faavor. Alergia a los mariscos.',
    delivery_instructions: 'Tocar el timbre antes de llegar el pedido',
    scheduled_for: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    currency: 'COP',
    tip: 5000,
    items: [
      {
        item_menu_id: '37ff6263dfa31f45',
        name_snapshot: 'Infusión de Frutos Rojos',
        price_unit: 6000,
        tax_rate: 0,
        amount: 1,
        note: 'Sin azúcar, bien caliente',
      },
      {
        item_menu_id: '240ac84df5b8d345',
        name_snapshot: 'Espresso Doble',
        price_unit: 5500,
        tax_rate: 0,
        amount: 2,
        note: '',
      },
    ],
    created_by: 'ariasdev672@gmail.com',
  },
  {
    order_number: '18',
    stay_id: 'stay-2',
    room_id: 'room-2',
    person_id: 'person-3',
    channel: 'room_tablet',
    payment_method: 'room_charge',
    general_notes: 'Huésped VIP. Enviar cubiertos de plata adicionales.',
    delivery_instructions: 'Dejar sobre mesa auxiliar',
    scheduled_for: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    currency: 'COP',
    tip: 10000,
    items: [
      {
        item_menu_id: 'item-89',
        name_snapshot: 'Salmón Grillé con Finas Hierbas',
        price_unit: 42000,
        tax_rate: 0,
        amount: 1,
        note: 'Término medio, salsa por separado',
      },
      {
        item_menu_id: 'item-90',
        name_snapshot: 'Copa de Vino Tinto Reserva',
        price_unit: 24000,
        tax_rate: 0,
        amount: 1,
        note: '',
      },
    ],
    created_by: 'ariasdev672@gmail.com',
  },
  {
    order_number: '05',
    stay_id: 'stay-3',
    room_id: 'room-3',
    person_id: 'person-4',
    channel: 'mobile_app',
    payment_method: 'card',
    general_notes: '',
    delivery_instructions: 'Llamar antes de subir',
    scheduled_for: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
    currency: 'COP',
    tip: 2000,
    items: [
      {
        item_menu_id: 'item-12',
        name_snapshot: 'Club Sándwich Tradicional',
        price_unit: 18000,
        tax_rate: 0,
        amount: 2,
        note: '',
      },
    ],
    created_by: 'ariasdev672@gmail.com',
  },
]

function formatearFechaHoraLegible(isoString?: string): string {
  if (!isoString) return 'ENTREGA INMEDIATA'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

function formatearCanal(channel?: string) {
  switch (channel?.toLowerCase()) {
    case 'front_desk':
    case 'recepcion':
      return { label: 'Recepción', icon: faBellConcierge }
    case 'mobile_app':
    case 'movil':
      return { label: 'Móvil', icon: faMobileScreen }
    case 'room_tablet':
    case 'tablet':
      return { label: 'Tablet', icon: faTabletScreenButton }
    case 'qr_code':
    case 'codigo_qr':
      return { label: 'Código QR', icon: faQrcode }
    case 'phone':
    case 'telefono':
      return { label: 'Teléfono', icon: faPhone }
    default:
      return { label: channel || 'Recepción', icon: faBellConcierge }
  }
}

function formatearMetodoPago(method?: string) {
  switch (method?.toLowerCase()) {
    case 'room_charge':
    case 'cargo_habitacion':
      return { label: 'Cargo a Habitación', icon: faHotel }
    case 'cash':
    case 'efectivo':
      return { label: 'Efectivo', icon: faMoneyBillWave }
    case 'card':
    case 'tarjeta':
      return { label: 'Tarjeta Bancaria', icon: faCreditCard }
    case 'bank_transfer':
    case 'transferencia':
      return { label: 'Transferencia', icon: faCreditCard }
    default:
      return { label: method || 'Pago en Entrega', icon: faMoneyBillWave }
  }
}

export function PedidosServicioHabitacionOrganism({
  onIrAProductos,
  onIrACarrito,
  onIrAEstadoPedido,
}: PedidosServicioHabitacionOrganismProps) {
  const [pedidos, setPedidos] = useState<ServiceRequestOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<StatusCodeValidationResult | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState<'todos' | NivelPrioridad>('todos')
  const [filtroCanal, setFiltroCanal] = useState<string>('todos')

  // Estados mutables para cada pedido (control de ciclo de vida del KDS)
  const [estadosPorPedido, setEstadosPorPedido] = useState<Record<string, EstadoPedido>>({})
  const [openDropdownOrderId, setOpenDropdownOrderId] = useState<string | null>(null)

  // Cerrar el menú desplegable al hacer clic fuera
  useEffect(() => {
    if (!openDropdownOrderId) return
    const handleClickOutside = () => setOpenDropdownOrderId(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [openDropdownOrderId])

  const handleCambiarEstadoPedido = (orderNumber: string, nuevoEstado: EstadoPedido) => {
    setEstadosPorPedido((prev) => ({
      ...prev,
      [orderNumber]: nuevoEstado,
    }))
    setOpenDropdownOrderId(null)
  }

  // Estado para el loader cuando se actualiza una orden con PUT /service-request/{id}
  const [actualizandoOrdenId, setActualizandoOrdenId] = useState<string | null>(null)

  /**
   * Actualiza el estado de la comanda en el servidor mediante PUT /service-request/{id}.
   * Construye el payload en segundo plano según especificación y valida los status codes.
   */
  const handleActualizarOrden = async (orden: ServiceRequestOrder) => {
    const ordenKey = orden.order_number || orden.id || 'sr-1'
    setActualizandoOrdenId(ordenKey)

    // Estado seleccionado para la comanda
    const estadoActual: EstadoPedido =
      estadosPorPedido[orden.order_number] ||
      (orden.status as EstadoPedido) ||
      'en_preparacion'

    let statusBackend = 'confirmed'
    let statusComment = 'Aceptado'
    if (estadoActual === 'en_cola') {
      statusBackend = 'pending'
      statusComment = 'En cola'
    } else if (estadoActual === 'en_preparacion') {
      statusBackend = 'confirmed'
      statusComment = 'Aceptado'
    } else if (estadoActual === 'en_camino') {
      statusBackend = 'in_transit'
      statusComment = 'En camino'
    } else if (estadoActual === 'entregado') {
      statusBackend = 'delivered'
      statusComment = 'Entregado'
    } else if (estadoActual === 'cancelado') {
      statusBackend = 'cancelled'
      statusComment = 'Cancelado'
    }

    // Actor autenticado o staff por defecto
    const authUser = readAuthUser()
    const actorId =
      (authUser?.id as string) || (authUser?.user_id as string) || 'user-1'

    // ID del endpoint
    const targetId =
      orden.id || (orden.order_number === '71' ? 'sr-1' : (orden.order_number || 'sr-1'))

    // Payload según requerimiento exacto
    const payload: UpdateServiceRequestPayload = {
      id: targetId,
      status: statusBackend,
      actor_type: 'staff',
      actor_id: actorId,
      status_comment: statusComment,
      grade: 5,
      guest_comment: 'Excelente',
      general_notes: orden.general_notes ? orden.general_notes.trim() : null,
      delivery_instructions: orden.delivery_instructions ? orden.delivery_instructions.trim() : null,
    }

    // Payload para POST /service-assignments según requerimiento exacto
    const assignmentPayload: CreateServiceAssignmentPayload = {
      service_request_id:
        orden.id && orden.id !== 'sr-1' ? orden.id : 'a4f971ffa02a0d91',
      stay_id: orden.stay_id || 'e8b8abd74ee52a63',
      person_id: orden.person_id || '64765b959a658887',
      is_active: true,
    }

    try {
      // 1. Actualización de orden mediante PUT /service-request/{id}
      const responsePut = await api.put(`/service-request/${encodeURIComponent(targetId)}`, payload, {
        validateStatus: () => true,
      })
      const validationPut = validateStatusCode(responsePut.status)

      // 2. Registro de asignación mediante POST /service-assignments
      const responseAssignment = await api.post('/service-assignments', assignmentPayload, {
        validateStatus: () => true,
      })
      const validationAssignment = validateStatusCode(responseAssignment.status)

      if (!validationPut.isValid) {
        setFeedback(validationPut)
      } else if (!validationAssignment.isValid) {
        setFeedback(validationAssignment)
      } else {
        setFeedback({
          isValid: true,
          status: responseAssignment.status,
          category: 'success',
          title: 'Orden y Asignación Actualizadas',
          message:
            validationAssignment.message ||
            validationPut.message ||
            `La comanda #${orden.order_number} y su asignación de servicio se han procesado exitosamente (Estado: ${statusComment}).`,
        })
      }
    } catch (err) {
      console.error('Error al actualizar /service-request o /service-assignments:', err)
      const errValidation = validateStatusCode(500)
      setFeedback(errValidation)
    } finally {
      setActualizandoOrdenId(null)
    }
  }

  // Mapa en memoria para resolver nombres de habitaciones sin exponer nunca IDs crudos
  const [roomsMap, setRoomsMap] = useState<Map<string, string>>(new Map())

  /**
   * Resuelve habitaciones y estadías para mostrar etiquetas amigables ("Habitación 101 · Edificio A")
   * cumpliendo estrictamente con la Regla de Oro: NUNCA mostrar IDs crudos en la interfaz.
   */
  const cargarMetadatosHabitaciones = useCallback(async () => {
    try {
      const staysRes = await api.get<RawStayApi[] | { data?: RawStayApi[] }>('/stays', {
        validateStatus: () => true,
      })
      const staysValidation = validateStatusCode(staysRes.status)
      if (!staysValidation.isValid || (staysRes.status !== 200 && staysRes.status !== 201)) {
        return
      }

      const rawStays = staysRes.data
      const staysList: RawStayApi[] = Array.isArray(rawStays)
        ? rawStays
        : rawStays && typeof rawStays === 'object' && 'data' in rawStays && Array.isArray(rawStays.data)
          ? rawStays.data
          : []

      const mapa = new Map<string, string>()

      await Promise.all(
        staysList.slice(0, 10).map(async (stay) => {
          try {
            const rRes = await api.get<RoomApi | { data?: RoomApi }>(
              `/room/${encodeURIComponent(stay.room_id)}`,
              { validateStatus: () => true }
            )
            const rVal = validateStatusCode(rRes.status)
            if (rVal.isValid && (rRes.status === 200 || rRes.status === 201)) {
              const rData =
                rRes.data && typeof rRes.data === 'object' && 'data' in rRes.data && rRes.data.data
                  ? rRes.data.data
                  : (rRes.data as RoomApi)

              let edificio = 'Torre A'
              try {
                const bRes = await api.get<BuildingApi | { data?: BuildingApi }>(
                  `/building/${encodeURIComponent(rData.building_id)}`,
                  { validateStatus: () => true }
                )
                if (bRes.status === 200 || bRes.status === 201) {
                  const bData =
                    bRes.data && typeof bRes.data === 'object' && 'data' in bRes.data && bRes.data.data
                      ? bRes.data.data
                      : (bRes.data as BuildingApi)
                  edificio = bData.name || edificio
                }
              } catch {
                // Silencioso
              }

              mapa.set(
                stay.room_id,
                `Habitación ${rData.number || '101'} · Piso ${rData.floor ?? 1} (${edificio})`
              )
              mapa.set(stay.id, `Habitación ${rData.number || '101'} (${edificio})`)
            }
          } catch {
            // Silencioso
          }
        })
      )

      if (mapa.size > 0) {
        setRoomsMap(mapa)
      }
    } catch {
      // Metadatos opcionales
    }
  }, [])

  /**
   * Consume GET /service-request con Axios y valida mediante validateStatusCode
   */
  const cargarPedidos = useCallback(async () => {
    setLoading(true)
    setFeedback(null)

    try {
      const response = await api.get('/service-request', {
        validateStatus: () => true,
      })

      const validation = validateStatusCode(response.status)
      setFeedback(validation)

      if (validation.isValid) {
        const raw = response.data
        let lista: ServiceRequestOrder[] = []

        if (Array.isArray(raw)) {
          lista = raw as ServiceRequestOrder[]
        } else if (raw && typeof raw === 'object') {
          if (Array.isArray((raw as { data?: unknown }).data)) {
            lista = (raw as { data: ServiceRequestOrder[] }).data
          } else if ('order_number' in raw) {
            lista = [raw as ServiceRequestOrder]
          }
        }

        // Si el endpoint devuelve un array vacío, se establece [] para mostrar el mensaje al usuario
        setPedidos(lista)
      } else {
        setPedidos([])
      }
    } catch (err) {
      console.error('Error al consultar /service-request:', err)
      const errValidation = validateStatusCode(500)
      setFeedback(errValidation)
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void cargarPedidos()
    void cargarMetadatosHabitaciones()
  }, [cargarPedidos, cargarMetadatosHabitaciones])

  // Filtrado reactivo de comandas por búsqueda, prioridad y canal
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      // 1. Filtro textual
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const coincideOrden = p.order_number?.toLowerCase().includes(q)
        const coincideProducto = p.items?.some((it) =>
          it.name_snapshot?.toLowerCase().includes(q)
        )
        const coincideNotas = p.general_notes?.toLowerCase().includes(q)
        if (!coincideOrden && !coincideProducto && !coincideNotas) return false
      }

      // 2. Filtro por canal
      if (filtroCanal !== 'todos') {
        if (p.channel?.toLowerCase() !== filtroCanal.toLowerCase()) {
          return false
        }
      }

      // 3. Filtro por prioridad dinámica
      if (filtroPrioridad !== 'todos') {
        const prio = calcularPrioridadComanda(p)
        if (prio.nivel !== filtroPrioridad) {
          return false
        }
      }

      return true
    })
  }, [pedidos, busqueda, filtroCanal, filtroPrioridad])

  // Paginación reactiva para InfiniteScroll (src/agent.md)
  const PAGE_SIZE_PEDIDOS = 6
  const [visibleCountPedidos, setVisibleCountPedidos] = useState<number>(PAGE_SIZE_PEDIDOS)

  useEffect(() => {
    setVisibleCountPedidos(PAGE_SIZE_PEDIDOS)
  }, [busqueda, filtroCanal, filtroPrioridad])

  const visiblePedidos = useMemo(
    () => pedidosFiltrados.slice(0, visibleCountPedidos),
    [pedidosFiltrados, visibleCountPedidos]
  )
  const hasMorePedidos = visibleCountPedidos < pedidosFiltrados.length
  const handleLoadMorePedidos = useCallback(() => {
    setVisibleCountPedidos((prev) => prev + PAGE_SIZE_PEDIDOS)
  }, [])

  return (
    <div className="space-y-6">
      {/* 1. Barra de Control de Cocina: Búsqueda y Filtros de Prioridad */}
      <div className="flex flex-col gap-4 rounded-3xl border border-line bg-panel p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar comanda #, plato o nota especial..."
            className="w-full rounded-2xl border border-line bg-canvas py-2.5 pl-10 pr-4 text-xs font-mono font-medium text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted size-3.5 pointer-events-none"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted hover:text-ink cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Código de Colores de Prioridad (Requisito 3) */}
          <div className="flex items-center gap-1 rounded-2xl border border-line bg-canvas p-1 text-xs font-mono">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'urgente', label: '🔴 Urgentes' },
              { id: 'atencion', label: '🟡 En cola' },
              { id: 'normal', label: '🟢 A tiempo' },
            ].map((p) => {
              const activo = filtroPrioridad === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFiltroPrioridad(p.id as 'todos' | NivelPrioridad)}
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    activo
                      ? 'bg-ink text-canvas dark:bg-canvas dark:text-ink shadow-2xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          {/* Filtro por Canal de Origen */}
          <div className="hidden lg:flex items-center gap-1 rounded-2xl border border-line bg-canvas p-1 text-xs font-mono">
            {[
              { id: 'todos', label: 'Canal: Todos' },
              { id: 'front_desk', label: 'Recepción' },
              { id: 'room_tablet', label: 'Tablet' },
              { id: 'mobile_app', label: 'Móvil' },
            ].map((c) => {
              const activo = filtroCanal === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFiltroCanal(c.id)}
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    activo
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {c.label}
                </button>
              )
            })}
          </div>

          {/* Botón de Refrescar Comandas */}
          <button
            type="button"
            onClick={() => void cargarPedidos()}
            disabled={loading}
            title="Actualizar tiquetera de cocina"
            className="inline-flex items-center gap-2 rounded-2xl border border-line bg-canvas px-3.5 py-2 text-xs font-mono font-bold text-ink hover:bg-line/40 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <FontAwesomeIcon
              icon={faRotateRight}
              className={`size-3 ${loading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          {/* Acceso a Estado de Asignaciones */}
          {onIrAEstadoPedido && (
            <button
              type="button"
              onClick={onIrAEstadoPedido}
              title="Ver estado de asignaciones de servicio (/service-assignments)"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-line bg-canvas px-3 py-2 text-xs font-mono font-bold text-ink hover:bg-line/40 transition-all cursor-pointer shadow-2xs"
            >
              <FontAwesomeIcon icon={faListCheck} className="size-3 text-primary" />
              <span className="hidden md:inline">Estado Pedidos</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner de retroalimentación empática según validateStatusCode */}
      {feedback && feedback.message && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className={`rounded-2xl border p-4 text-xs font-mono flex items-start gap-3 ${
            feedback.isValid
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'
          }`}
        >
          <FontAwesomeIcon
            icon={feedback.isValid ? faCheck : faCircleExclamation}
            className="size-4 shrink-0 mt-0.5"
          />
          <div className="flex-1">
            <p className="font-bold uppercase tracking-wide">
              {feedback.title || (feedback.isValid ? 'Comanda Actualizada' : 'Aviso de Tiquetera')}
            </p>
            <p className="mt-0.5 opacity-90">{feedback.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="font-bold hover:underline cursor-pointer"
          >
            Entendido
          </button>
        </motion.div>
      )}

      {/* Loader visual cuando el recepcionista realiza clic en el botón de actualizar (src/agent.md) */}
      <Loader
        overlay
        visible={actualizandoOrdenId !== null}
        label="Actualizando comanda y registrando asignación..."
      />

      {/* 2. Pantalla de Comandas de Cocina (Kitchen Display Ticket System) */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size={40} label="Imprimiendo comandas en pantalla de cocina..." />
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        /* Estado vacío: Sin pedidos registrados en /service-request o sin coincidencias de filtro */
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="rounded-3xl border border-line bg-panel p-10 sm:p-14 text-center shadow-xs space-y-4 max-w-lg mx-auto"
        >
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary text-2xl border border-primary/20">
            <FontAwesomeIcon icon={faClipboardList} />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-mono text-base sm:text-lg font-black text-ink uppercase tracking-wider">
              {pedidos.length === 0
                ? 'No se encuentran pedidos'
                : 'Sin comandas que coincidan'}
            </h3>
            <p className="text-xs font-mono text-ink-muted leading-relaxed max-w-sm mx-auto">
              {pedidos.length === 0
                ? 'Actualmente no se encuentran pedidos registrados en el sistema de Room Service. Las nuevas órdenes transmitidas por recepción o huéspedes aparecerán aquí automáticamente en tiempo real.'
                : 'No se encontraron pedidos con los filtros o término de búsqueda aplicado. Puedes restablecer los filtros para volver a ver todas las órdenes.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {pedidos.length === 0 ? (
              <>
                {onIrAProductos && (
                  <button
                    type="button"
                    onClick={onIrAProductos}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-primary/90 transition-all cursor-pointer font-mono"
                  >
                    Tomar Pedido / Ver Menú
                  </button>
                )}
                {onIrACarrito && (
                  <button
                    type="button"
                    onClick={onIrACarrito}
                    className="rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-bold text-ink hover:bg-line/40 transition-all cursor-pointer font-mono"
                  >
                    Ir al Carrito
                  </button>
                )}
                {onIrAEstadoPedido && (
                  <button
                    type="button"
                    onClick={onIrAEstadoPedido}
                    className="rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-bold text-ink hover:bg-line/40 transition-all cursor-pointer font-mono"
                  >
                    Ver Estado de Asignaciones
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void cargarPedidos()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-bold text-ink hover:bg-line/40 transition-all cursor-pointer font-mono"
                  title="Volver a consultar /service-request"
                >
                  <FontAwesomeIcon icon={faRotateRight} className="size-3" />
                  <span>Consultar Nuevamente</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setBusqueda('')
                  setFiltroPrioridad('todos')
                  setFiltroCanal('todos')
                }}
                className="rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-bold text-ink hover:bg-line/40 transition-all cursor-pointer font-mono"
              >
                Restablecer Filtros
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        /* Grilla de Kitchen Tickets / Comandas de Cocina con Stagger Reveal e InfiniteScroll */
        <InfiniteScroll
          onLoadMore={handleLoadMorePedidos}
          hasMore={hasMorePedidos}
          isLoading={false}
          animationVariant="slideUp"
          endMessage={
            <InfiniteScrollEnd label="Has visualizado todas las comandas de Room Service registradas." />
          }
        >
          <motion.div
            variants={KITCHEN_TICKETS_CONTAINER_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {visiblePedidos.map((orden, index) => {
            const canalInfo = formatearCanal(orden.channel)
            const pagoInfo = formatearMetodoPago(orden.payment_method)
            const prioridad = calcularPrioridadComanda(orden)

            // Estado del pedido dinámico y mutable para este ticket
            const estadoActual: EstadoPedido =
              estadosPorPedido[orden.order_number] ||
              (orden.status as EstadoPedido) ||
              'en_preparacion'
            const estadoActualConfig =
              ESTADOS_PEDIDO_CONFIG[estadoActual] || ESTADOS_PEDIDO_CONFIG.en_preparacion

            // Cálculo financiero de la comanda
            const subtotalProductos = (orden.items || []).reduce(
              (acc, it) => acc + (Number(it.price_unit) || 0) * (Number(it.amount) || 1),
              0
            )
            const totalItemsCount = (orden.items || []).reduce(
              (acc, it) => acc + (Number(it.amount) || 1),
              0
            )
            const propinaNum = Number(orden.tip) || 0
            const totalPedido = subtotalProductos + propinaNum

            // Resolución amigable de habitación sin exponer IDs crudos (Regla de Oro #1)
            const habitacionEtiqueta =
              roomsMap.get(orden.room_id) ||
              roomsMap.get(orden.stay_id) ||
              'Habitación Asignada al Huésped'

            // Detectar si la orden contiene modificaciones o alertas para aviso destacado
            const tieneAlertasItem = (orden.items || []).some((it) => it.note && it.note.trim())
            const tieneAlertasGenerales = Boolean(orden.general_notes && orden.general_notes.trim())
            const ordenConAlertas = tieneAlertasItem || tieneAlertasGenerales

            return (
              <motion.article
                key={orden.order_number || index}
                variants={KITCHEN_TICKET_CARD_VARIANTS}
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl bg-panel transition-all duration-200 ${prioridad.bordeClase}`}
              >
                {/* 1. Franja Superior de Prioridad y Comanda (Código de Colores Dinámico) */}
                <header
                  className={`px-4 py-2.5 flex items-center justify-between gap-2 border-b border-black/10 select-none ${prioridad.bgHeaderClase} ${prioridad.textHeaderClase}`}
                >
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faReceipt} className="size-3.5 opacity-90" />
                    <span className="font-mono text-sm sm:text-base font-black tracking-widest uppercase">
                      ORDEN #{orden.order_number}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Sección Entrega */}
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-mono font-black bg-black/25 backdrop-blur-xs">
                      <FontAwesomeIcon icon={prioridad.icon} className="size-2.5" />
                      <span>{prioridad.tiempoTexto}</span>
                    </span>

                    {/* Pequeño botón para cambiar el estado del pedido, ubicado al lado derecho de ENTREGA */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenDropdownOrderId(
                            openDropdownOrderId === orden.order_number ? null : orden.order_number
                          )
                        }}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-mono font-black bg-black/40 hover:bg-black/60 active:scale-95 text-white border border-white/25 transition-all cursor-pointer backdrop-blur-xs shadow-2xs"
                        title="Cambiar estado del pedido"
                      >
                        <span className={`size-1.5 rounded-full ${estadoActualConfig.dotColor} animate-pulse`} />
                        <span>{estadoActualConfig.label}</span>
                        <FontAwesomeIcon icon={faChevronDown} className="size-2 opacity-80 ml-0.5" />
                      </button>

                      {/* Dropdown flotante con las opciones de estado */}
                      {openDropdownOrderId === orden.order_number && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1.5 z-40 w-44 rounded-xl border border-line bg-panel p-1.5 shadow-xl font-mono text-xs text-ink space-y-0.5 backdrop-blur-md"
                        >
                          <div className="px-2 py-1 text-[9px] font-black uppercase text-ink-muted border-b border-line/60 tracking-wider">
                            Actualizar Estado
                          </div>
                          {(Object.keys(ESTADOS_PEDIDO_CONFIG) as EstadoPedido[]).map((estadoKey) => {
                            const conf = ESTADOS_PEDIDO_CONFIG[estadoKey]
                            const esSeleccionado = estadoActual === estadoKey

                            return (
                              <button
                                key={estadoKey}
                                type="button"
                                onClick={() => handleCambiarEstadoPedido(orden.order_number, estadoKey)}
                                className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition-colors cursor-pointer ${
                                  esSeleccionado
                                    ? 'bg-primary text-white shadow-2xs'
                                    : 'hover:bg-line/40 text-ink'
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <FontAwesomeIcon icon={conf.icon} className="size-2.5" />
                                  <span>{conf.label}</span>
                                </span>
                                {esSeleccionado && <FontAwesomeIcon icon={faCheck} className="size-2.5" />}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Botón de actualizar al lado del dropdown con icono de FontAwesome */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        void handleActualizarOrden(orden)
                      }}
                      disabled={actualizandoOrdenId === (orden.order_number || orden.id)}
                      className="inline-flex items-center justify-center size-6 rounded-full bg-black/40 hover:bg-black/60 active:scale-95 text-white border border-white/25 transition-all cursor-pointer backdrop-blur-xs shadow-2xs disabled:opacity-50"
                      title="Actualizar comanda y registrar asignación (PUT /service-request/{id} + POST /service-assignments)"
                    >
                      <FontAwesomeIcon
                        icon={faRotateRight}
                        className={`size-2.5 ${actualizandoOrdenId === (orden.order_number || orden.id) ? 'animate-spin' : ''}`}
                      />
                    </button>
                  </div>
                </header>

                {/* 2. Cuerpo del Ticket de Cocina */}
                <div className="p-4 sm:p-5 space-y-4 flex-1">
                  {/* Banner de Prioridad / Estado de Cocina */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b-2 border-dashed border-line">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-ink-muted">
                      ESTADO: <span className="text-ink font-black">{estadoActualConfig.label}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-ink-muted">
                      ITEMS: <strong className="text-ink">{totalItemsCount}</strong>
                    </span>
                  </div>

                  {/* Ficha de Ubicación y Huésped (REGLA DE ORO: SIN IDs CRUDOS) */}
                  <div className="rounded-xl border border-line bg-canvas/60 p-3 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <FontAwesomeIcon icon={faDoorOpen} className="text-primary size-3.5 shrink-0" />
                        <span className="font-black text-ink uppercase truncate" title={habitacionEtiqueta}>
                          {habitacionEtiqueta}
                        </span>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-ink-muted uppercase">
                        ACTIVA
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-line/60 text-[11px] text-ink-muted">
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faUser} className="size-3 text-ink-muted" />
                        <span>Huésped Titular</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={canalInfo.icon} className="size-3 text-primary" />
                        <span>{canalInfo.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. LISTA DE PLATOS PRINCIPALES (Requisito 1: font-mono + MAYÚSCULAS) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-[11px] font-black uppercase tracking-wider text-ink-muted border-b border-line pb-1">
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faUtensils} className="size-3 text-primary" />
                        <span>Platos & Bebidas</span>
                      </span>
                      <span>Cant.</span>
                    </div>

                    <div className="space-y-2.5 divide-y divide-line/40">
                      {(orden.items || []).map((item, idx) => {
                        const tieneModificacion = Boolean(item.note && item.note.trim())

                        return (
                          <div
                            key={item.item_menu_id || idx}
                            className={`pt-2 first:pt-0 font-mono transition-colors ${
                              tieneModificacion
                                ? 'rounded-lg p-2 bg-red-500/5 dark:bg-red-500/10 border border-red-500/30'
                                : ''
                            }`}
                          >
                            {/* Fila del Plato: Cantidad destacada + Nombre en MAYÚSCULAS */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                {/* Bloque numérico de cantidad estilo KDS de cocina */}
                                <span className="inline-flex items-center justify-center min-w-8 px-1.5 py-0.5 rounded font-mono font-black text-xs sm:text-sm bg-ink text-canvas dark:bg-canvas dark:text-ink shrink-0 tracking-tight">
                                  {item.amount}X
                                </span>

                                <div className="min-w-0 flex-1">
                                  {/* Nombre del plato en MAYÚSCULAS y monoespaciado */}
                                  <h4 className="font-mono font-black text-sm text-ink uppercase tracking-wide leading-tight">
                                    {item.name_snapshot}
                                  </h4>
                                </div>
                              </div>

                              {/* Precio unitario */}
                              <span className="font-mono text-xs font-bold text-ink-muted shrink-0 text-right">
                                {formatearMonedaCOP(Number(item.price_unit) * Number(item.amount))}
                              </span>
                            </div>

                            {/* Requisito 2: ALERTAS VISUALES EN COLOR ROJO PARA NOTAS/MODIFICACIONES */}
                            {tieneModificacion && (
                              <div className="mt-1.5 flex items-start gap-2 rounded-md border-2 border-red-600 bg-red-600/15 dark:bg-red-950/60 p-2 text-xs font-mono font-black text-red-600 dark:text-red-400">
                                <FontAwesomeIcon
                                  icon={faTriangleExclamation}
                                  className="size-3.5 mt-0.5 shrink-0 text-red-600 dark:text-red-400 animate-pulse"
                                />
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider underline">
                                    *** MODIFICACIÓN EN PREPARACIÓN ***
                                  </span>
                                  <p className="font-mono font-black text-xs sm:text-sm text-red-700 dark:text-red-300 uppercase leading-snug mt-0.5">
                                    {item.note}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Requisito 2: ALERTA ROJA PARA NOTAS GENERALES DE COCINA / ALERGIAS */}
                  {tieneAlertasGenerales && (
                    <div className="rounded-xl border-2 border-red-600 bg-red-600/15 dark:bg-red-950/50 p-3 font-mono text-xs text-red-600 dark:text-red-400 space-y-1">
                      <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[11px] text-red-700 dark:text-red-300">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="size-3.5 text-red-600 animate-pulse" />
                        <span>*** ALERTA DE COCINA / NOTAS ESPECIALES ***</span>
                      </div>
                      <p className="font-mono font-black text-xs sm:text-sm uppercase tracking-wide text-red-800 dark:text-red-200 pl-5 leading-snug">
                        {orden.general_notes}
                      </p>
                    </div>
                  )}

                  {/* Instrucciones de Delivery / Entrega */}
                  {orden.delivery_instructions && (
                    <div className="rounded-xl border border-line bg-canvas/70 p-2.5 font-mono text-xs text-ink space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-ink-muted uppercase">
                        <FontAwesomeIcon icon={faTruck} className="size-3 text-primary" />
                        <span>INSTRUCCIONES DE DESPACHO:</span>
                      </div>
                      <p className="font-mono font-semibold uppercase text-xs text-ink-soft">
                        {orden.delivery_instructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Pie del Ticket (Estilo corte de tiquetera con línea punteada) */}
                <footer className="p-4 border-t-2 border-dashed border-line bg-canvas/40 space-y-2 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-ink-muted text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faClock} className="size-3 text-primary" />
                      <span className="uppercase">ENTREGA: {formatearFechaHoraLegible(orden.scheduled_for)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={pagoInfo.icon} className="size-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="uppercase">{pagoInfo.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-line/60">
                    <span className="text-[11px] font-bold uppercase text-ink-muted">
                      {ordenConAlertas ? '🚨 COMANDA MODIFICADA' : 'COMANDA ESTÁNDAR'}
                    </span>
                    <span className="text-sm font-black text-ink">
                      TOTAL: {formatearMonedaCOP(totalPedido)}
                    </span>
                  </div>

                  {/* Código decorativo de tiquetera POS */}
                  <div className="text-center pt-1 text-[9px] font-mono tracking-[0.3em] opacity-40 select-none">
                    ||| | ||||| || | |||| ||| | |||
                  </div>
                </footer>
              </motion.article>
            )
          })}
        </motion.div>
      </InfiniteScroll>
      )}
    </div>
  )
}
