import { useState, useEffect, useId, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faXmark,
  faHashtag,
  faClock,
  faDice,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { fadeUp } from '../../../../design-tokens/motion'
import { Input, Textarea } from '../../../../shared/ui'
import { api } from '../../../../lib/api'
import { validateStatusCode } from '../../../../shared/lib/status-code-validator'
import {
  RecursosDropdown,
  type DropdownOption,
} from '../../../recursos/ui/molecules/recursos-dropdown'
import { Loader } from '../../../tema/ui/atoms/loader'
import { useCarritoStore } from '../../application/carrito-store'
import { readAuthTokenEmail } from '../../../../shared/auth-storage'
import { formatearMonedaCOP } from '../../domain/item-menu'

import { type RawStayApi } from './ModalSeleccionarRecepcion'

/**
 * Extrae el email del creador desde localStorage bajo el JSON auth_token (campo Email o email)
 */
function obtenerCreatedBy(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem('auth_token')
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Record<string, unknown>
          if (typeof parsed?.Email === 'string' && parsed.Email.trim()) {
            return parsed.Email.trim()
          }
          if (typeof parsed?.email === 'string' && parsed.email.trim()) {
            return parsed.email.trim()
          }
        } catch {
          // No es JSON directo
        }
      }
    }
  } catch {
    // LocalStorage no disponible
  }

  const fallback = readAuthTokenEmail()
  return fallback && fallback.includes('@') ? fallback : 'ariasdev672@gmail.com'
}

export interface DatosOrdenCocina {
  numeroOrden: string
  recepcion: string
  canal: string
  metodoPago: string
  propina: number
  horarioEntrega: string
  instruccionesDelivery: string
  notasGenerales: string
}

export interface ServiceRequestItemPayload {
  item_menu_id: string
  name_snapshot: string
  price_unit: number
  tax_rate: number
  amount: number
  note: string
}

export interface ServiceRequestPayload {
  order_number: string
  stay_id: string
  room_id: string
  person_id: string
  channel: string
  payment_method: string
  general_notes: string
  delivery_instructions: string
  scheduled_for: string
  currency: string
  tip: number
  items: ServiceRequestItemPayload[]
  created_by: string
}

export interface ModalConfirmarPedidoCocinaProps {
  isOpen: boolean
  onClose: () => void
  onConfirmar: (datos: DatosOrdenCocina) => void
  totalArticulos: number
  totalGeneral: number
  recepcionInicial?: string
}

/**
 * Contrato de habitación retornado por GET /room/{id}
 */
export interface RoomApi {
  id: string
  number: string
  floor: number
  room_types_id?: string
  building_id: string
  price_override?: number
  status: string
  has_reception?: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

/**
 * Contrato de edificio retornado por GET /building/{id}
 */
export interface BuildingApi {
  id: string
  name: string
  floor_number?: number
  headquarters_id?: string
  sub_headquarters_id?: string
  status?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

/**
 * Datos de respaldo para /stays si el servidor se encuentra en mantenimiento
 */
const FALLBACK_STAYS: RawStayApi[] = [
  {
    id: 'stay-1',
    room_id: 'room-1',
    reservation_id: 'res-1',
    person_ids: ['person-1', 'person-2'],
    check_in_date: '2026-10-01T15:04:05Z',
    check_out_date: '2026-10-02T15:04:05Z',
    payment_method: 'cash',
    security_deposit: 150000,
    remarks: '',
    status: 'progress',
    created_by: 'recepcion',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  {
    id: 'stay-2',
    room_id: 'room-2',
    reservation_id: 'res-2',
    person_ids: ['person-3'],
    check_in_date: '2026-10-01T15:04:05Z',
    check_out_date: '2026-10-03T15:04:05Z',
    payment_method: 'credit_card',
    security_deposit: 200000,
    remarks: '',
    status: 'progress',
    created_by: 'recepcion',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  {
    id: 'stay-3',
    room_id: 'room-3',
    reservation_id: 'res-3',
    person_ids: ['person-4'],
    check_in_date: '2026-10-02T12:00:00Z',
    check_out_date: '2026-10-04T12:00:00Z',
    payment_method: 'transfer',
    security_deposit: 100000,
    remarks: '',
    status: 'progress',
    created_by: 'recepcion',
    created_at: '2026-10-02T12:00:00Z',
    updated_at: '2026-10-02T12:00:00Z',
  },
]

/**
 * Datos de respaldo para /room/{id}
 */
const FALLBACK_ROOMS: Record<string, RoomApi> = {
  'room-1': {
    id: 'room-1',
    number: '101',
    floor: 1,
    room_types_id: 'type-1',
    building_id: 'building-1',
    price_override: 450.0,
    status: 'available',
    has_reception: true,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'room-2': {
    id: 'room-2',
    number: '204',
    floor: 2,
    room_types_id: 'type-2',
    building_id: 'building-1',
    price_override: 520.0,
    status: 'available',
    has_reception: true,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'room-3': {
    id: 'room-3',
    number: '305',
    floor: 3,
    room_types_id: 'type-3',
    building_id: 'building-2',
    price_override: 600.0,
    status: 'available',
    has_reception: true,
    created_by: 'admin',
    created_at: '2026-10-02T12:00:00Z',
    updated_at: '2026-10-02T12:00:00Z',
  },
}

/**
 * Datos de respaldo para /building/{id}
 */
const FALLBACK_BUILDINGS: Record<string, BuildingApi> = {
  'building-1': {
    id: 'building-1',
    name: 'Edificio A',
    floor_number: 3,
    headquarters_id: 'hq-1',
    sub_headquarters_id: 'sub-1',
    status: 'active',
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'building-2': {
    id: 'building-2',
    name: 'Torre B',
    floor_number: 5,
    headquarters_id: 'hq-1',
    sub_headquarters_id: 'sub-1',
    status: 'active',
    created_by: 'admin',
    created_at: '2026-10-02T12:00:00Z',
    updated_at: '2026-10-02T12:00:00Z',
  },
}

/**
 * Opciones por defecto para el selector de Recepción / Habitación en formato: name - floor - number
 */
export const OPCIONES_RECEPCION_DEFAULT: ReadonlyArray<DropdownOption> = [
  { value: 'Edificio A - 1 - 101', label: 'Edificio A - 1 - 101' },
  { value: 'Edificio A - 2 - 204', label: 'Edificio A - 2 - 204' },
  { value: 'Torre B - 3 - 305', label: 'Torre B - 3 - 305' },
]

/**
 * Opciones para compatibilidad retrospectiva
 */
export const OPCIONES_RECEPCION = OPCIONES_RECEPCION_DEFAULT.map((o) => o.value)

/**
 * Opciones para el selector de Canal de solicitud utilizando RecursosDropdown
 */
export const OPCIONES_CANAL: ReadonlyArray<DropdownOption> = [
  { value: 'room_tablet', label: 'Tablet' },
  { value: 'mobile_app', label: 'Movil' },
  { value: 'phone', label: 'Telefono' },
  { value: 'front_desk', label: 'Recepcion' },
  { value: 'qr_code', label: 'Codigo QR' },
]

/**
 * Opciones para el selector de Método de pago utilizando RecursosDropdown
 */
export const OPCIONES_METODO_PAGO: ReadonlyArray<DropdownOption> = [
  { value: 'room_charge', label: 'Cargo a la habitacion' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'bank_transfer', label: 'Transferencia bancaria' },
]

/**
 * Genera la fecha y hora por defecto (momento actual + 35 minutos de elaboración y despacho)
 */
function calcularHorarioEntregaPorDefecto(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 35)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Genera un número de orden aleatorio de 2 dígitos (ej. '17', '42', '85')
 */
export function generarNumeroOrdenAleatorio(): string {
  const num = Math.floor(10 + Math.random() * 90)
  return String(num)
}

export interface RecepcionMetadata {
  stay_id: string
  room_id: string
  person_id: string
}

export function ModalConfirmarPedidoCocina({
  isOpen,
  onClose,
  onConfirmar,
  totalArticulos,
  totalGeneral,
  recepcionInicial,
}: ModalConfirmarPedidoCocinaProps) {
  const horarioEntregaId = useId()

  // Estados del Formulario
  const [numeroOrden, setNumeroOrden] = useState(generarNumeroOrdenAleatorio)
  const [opcionesRecepcion, setOpcionesRecepcion] = useState<ReadonlyArray<DropdownOption>>(
    OPCIONES_RECEPCION_DEFAULT
  )
  const [recepcionesMetaMap, setRecepcionesMetaMap] = useState<Map<string, RecepcionMetadata>>(
    () =>
      new Map([
        ['Edificio A - 1 - 101', { stay_id: 'stay-1', room_id: 'room-1', person_id: 'person-1' }],
        ['Edificio A - 2 - 204', { stay_id: 'stay-2', room_id: 'room-2', person_id: 'person-3' }],
        ['Torre B - 3 - 305', { stay_id: 'stay-3', room_id: 'room-3', person_id: 'person-4' }],
      ])
  )
  const [loadingRecepciones, setLoadingRecepciones] = useState(false)
  const [errorRecepciones, setErrorRecepciones] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [recepcion, setRecepcion] = useState(
    recepcionInicial && recepcionInicial.trim().length > 0
      ? recepcionInicial
      : OPCIONES_RECEPCION_DEFAULT[0].value
  )
  const [canal, setCanal] = useState(OPCIONES_CANAL[0].value)
  const [metodoPago, setMetodoPago] = useState(OPCIONES_METODO_PAGO[0].value)
  const [propina, setPropina] = useState<string>('0')
  const [horarioEntrega, setHorarioEntrega] = useState(calcularHorarioEntregaPorDefecto)
  const [instruccionesDelivery, setInstruccionesDelivery] = useState('')
  const [notasGenerales, setNotasGenerales] = useState('')

  const propinaNumerica = Math.max(0, Number(propina) || 0)
  const totalConPropina = totalGeneral + propinaNumerica

  /**
   * Carga las recepciones y habitaciones orquestando GET /stays, GET /room/{id} y GET /building/{id}
   * con validación rigurosa de status codes mediante validateStatusCode
   */
  const cargarOpcionesRecepcion = useCallback(async () => {
    setLoadingRecepciones(true)
    setErrorRecepciones(null)

    const roomsCache = new Map<string, RoomApi>()
    const buildingsCache = new Map<string, BuildingApi>()

    try {
      // 1. GET /stays
      const staysRes = await api.get<RawStayApi[] | { data?: RawStayApi[] }>('/stays', {
        validateStatus: () => true,
      })

      const staysValidation = validateStatusCode(staysRes.status)

      let listaStays: RawStayApi[] = FALLBACK_STAYS

      if (staysValidation.isValid && staysRes.status === 200) {
        const raw = staysRes.data
        const dataArr = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && 'data' in raw && Array.isArray(raw.data)
            ? raw.data
            : []
        if (dataArr.length > 0) {
          listaStays = dataArr
        }
      } else if (staysValidation.message) {
        setErrorRecepciones(staysValidation.message)
      }

      // 2. Extraer IDs únicos de habitaciones para consultar en paralelo
      const roomIds = Array.from(new Set(listaStays.map((s) => s.room_id).filter(Boolean)))

      await Promise.all(
        roomIds.map(async (roomId) => {
          try {
            const roomRes = await api.get<RoomApi | { data?: RoomApi }>(
              `/room/${encodeURIComponent(roomId)}`,
              { validateStatus: () => true }
            )
            const roomValidation = validateStatusCode(roomRes.status)
            if (roomValidation.isValid && (roomRes.status === 200 || roomRes.status === 201)) {
              const raw = roomRes.data
              const data =
                raw && typeof raw === 'object' && 'data' in raw && raw.data
                  ? raw.data
                  : (raw as RoomApi)
              roomsCache.set(roomId, data)
            } else {
              roomsCache.set(roomId, FALLBACK_ROOMS[roomId] || {
                id: roomId,
                number: roomId.replace('room-', ''),
                floor: 1,
                room_types_id: 'type-1',
                building_id: 'building-1',
                status: 'available',
              })
            }
          } catch {
            roomsCache.set(roomId, FALLBACK_ROOMS[roomId] || {
              id: roomId,
              number: roomId.replace('room-', ''),
              floor: 1,
              room_types_id: 'type-1',
              building_id: 'building-1',
              status: 'available',
            })
          }
        })
      )

      // 3. Extraer IDs únicos de edificios para consultar en paralelo
      const buildingIds = Array.from(
        new Set(
          Array.from(roomsCache.values())
            .map((r) => r.building_id)
            .filter(Boolean)
        )
      )

      await Promise.all(
        buildingIds.map(async (bId) => {
          try {
            const bRes = await api.get<BuildingApi | { data?: BuildingApi }>(
              `/building/${encodeURIComponent(bId)}`,
              { validateStatus: () => true }
            )
            const bValidation = validateStatusCode(bRes.status)
            if (bValidation.isValid && (bRes.status === 200 || bRes.status === 201)) {
              const raw = bRes.data
              const data =
                raw && typeof raw === 'object' && 'data' in raw && raw.data
                  ? raw.data
                  : (raw as BuildingApi)
              buildingsCache.set(bId, data)
            } else {
              buildingsCache.set(bId, FALLBACK_BUILDINGS[bId] || {
                id: bId,
                name: 'Edificio A',
                status: 'active',
              })
            }
          } catch {
            buildingsCache.set(bId, FALLBACK_BUILDINGS[bId] || {
              id: bId,
              name: 'Edificio A',
              status: 'active',
            })
          }
        })
      )

      // 4. Construir opciones en formato: name - floor - number y asociar metadatos (stay_id, room_id, person_id)
      const opcionesMap = new Map<string, DropdownOption>()
      const metaMap = new Map<string, RecepcionMetadata>()

      for (const stay of listaStays) {
        const room = roomsCache.get(stay.room_id) || FALLBACK_ROOMS[stay.room_id]
        if (!room) continue

        const building =
          buildingsCache.get(room.building_id) || FALLBACK_BUILDINGS[room.building_id]
        const buildingName = building?.name || 'Edificio A'
        const floor = room.floor ?? 1
        const roomNumber = room.number ?? '101'

        // Formato estricto solicitado: name - floor - number
        const itemFormateado = `${buildingName} - ${floor} - ${roomNumber}`

        const personIdTarget =
          (stay.person_ids && stay.person_ids.length > 0 ? stay.person_ids[0] : null) || 'person-1'

        if (!metaMap.has(itemFormateado)) {
          metaMap.set(itemFormateado, {
            stay_id: stay.id,
            room_id: stay.room_id,
            person_id: personIdTarget,
          })
        }

        if (!opcionesMap.has(itemFormateado)) {
          opcionesMap.set(itemFormateado, {
            value: itemFormateado,
            label: itemFormateado,
          })
        }
      }

      setRecepcionesMetaMap(metaMap)

      const opcionesFinales = Array.from(opcionesMap.values())
      if (opcionesFinales.length > 0) {
        setOpcionesRecepcion(opcionesFinales)
      } else {
        setOpcionesRecepcion(OPCIONES_RECEPCION_DEFAULT)
      }
    } catch {
      setOpcionesRecepcion(OPCIONES_RECEPCION_DEFAULT)
    } finally {
      setLoadingRecepciones(false)
    }
  }, [])

  // Cargar opciones al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarOpcionesRecepcion()
    }
  }, [isOpen, cargarOpcionesRecepcion])

  // Sincronizar recepción inicial si cambia mientras está abierto o cuando cargan las opciones
  useEffect(() => {
    if (recepcionInicial && recepcionInicial.trim().length > 0) {
      setRecepcion(recepcionInicial)
    } else if (opcionesRecepcion.length > 0) {
      setRecepcion((prev) => {
        if (prev && opcionesRecepcion.some((o) => o.value === prev)) {
          return prev
        }
        return opcionesRecepcion[0].value
      })
    }
  }, [recepcionInicial, opcionesRecepcion])

  // Cierre con la tecla Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleNumeroOrdenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite únicamente números y restringe a un máximo de 2 dígitos
    const soloDigitos = e.target.value.replace(/\D/g, '').slice(0, 2)
    setNumeroOrden(soloDigitos)
  }

  const handleGenerarAleatorio = () => {
    const nuevoNumero = generarNumeroOrdenAleatorio()
    setNumeroOrden(nuevoNumero)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)

    // Asegura que siempre se envíe un número de 2 dígitos
    const ordenFinal = numeroOrden.trim()
      ? numeroOrden.trim().padStart(2, '0').slice(-2)
      : generarNumeroOrdenAleatorio()

    const recepcionFinal =
      recepcion.trim() || opcionesRecepcion[0]?.value || OPCIONES_RECEPCION_DEFAULT[0].value

    // Metadatos obtenidos de la selección de "Recepción / Habitación" (stay_id, room_id, person_id)
    const meta = recepcionesMetaMap.get(recepcionFinal)
    const stayIdFinal = meta?.stay_id || 'e8b8abd74ee52a63'
    const roomIdFinal = meta?.room_id || '2a45ac749faa2848'
    const personIdFinal = meta?.person_id || '64765b959a658887'

    // Formato ISO para scheduled_for
    let scheduledForISO = '2026-10-10T15:00:00Z'
    try {
      const parsedDate = new Date(horarioEntrega)
      if (!isNaN(parsedDate.getTime())) {
        scheduledForISO = parsedDate.toISOString()
      }
    } catch {
      scheduledForISO = new Date().toISOString()
    }

    // Ítems obtenidos desde la store de Zustand del carrito adaptados al contrato del endpoint
    const cartItems = useCarritoStore.getState().items
    const itemsPayload: ServiceRequestItemPayload[] = cartItems.map((ci) => ({
      item_menu_id: ci.producto.id ?? '',
      name_snapshot: ci.producto.name,
      price_unit: Number(ci.producto.price) || 0,
      tax_rate: Number(ci.producto.tax_percentage ?? 0) || 0,
      amount: Number(ci.cantidad) || 1,
      note: ci.notas?.trim() || '',
    }))

    // Creador obtenido desde localStorage (auth_token -> Email)
    const createdBy = obtenerCreatedBy()

    // Construcción del payload para /service-request
    const payload: ServiceRequestPayload = {
      order_number: ordenFinal,
      stay_id: stayIdFinal,
      room_id: roomIdFinal,
      person_id: personIdFinal,
      channel: canal,
      payment_method: metodoPago,
      general_notes: notasGenerales.trim(),
      delivery_instructions: instruccionesDelivery.trim(),
      scheduled_for: scheduledForISO,
      currency: 'COP',
      tip: propinaNumerica,
      items: itemsPayload,
      created_by: createdBy,
    }

    try {
      const response = await api.post('/service-request', payload, {
        validateStatus: () => true,
      })

      const validation = validateStatusCode(response.status)

      if (validation.isValid) {
        onConfirmar({
          numeroOrden: ordenFinal,
          recepcion: recepcionFinal,
          canal,
          metodoPago,
          propina: propinaNumerica,
          horarioEntrega,
          instruccionesDelivery: instruccionesDelivery.trim(),
          notasGenerales: notasGenerales.trim(),
        })
      } else {
        setSubmitError(
          validation.message ||
            `No fue posible transmitir la comanda a cocina (Código ${response.status}). Por favor, verifica e intenta de nuevo.`
        )
      }
    } catch (err) {
      console.error('Error al enviar la comanda a /service-request:', err)
      const errorValidation = validateStatusCode(500)
      setSubmitError(
        errorValidation.message ||
          'No se pudo conectar con el servidor de cocina. Por favor verifica la red y vuelve a intentar.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop desenfocado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />

        {/* Contenedor del Modal */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-panel shadow-2xl z-10 my-8 max-h-[92vh] flex flex-col"
        >
          {/* Cabecera del Modal */}
          <div className="relative border-b border-line bg-canvas/60 px-6 py-5 sm:px-8 sm:py-6 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  <span>Transmisión a Cocina · Room Service</span>
                </div>
                <h3 className="mt-2 font-serif text-xl sm:text-2xl font-bold text-ink">
                  Confirmar y Enviar Pedido a Cocina
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-ink-muted">
                  Completa los parámetros de servicio y facturación para despachar los {totalArticulos} artículos de la comanda.
                </p>
              </div>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full bg-canvas text-ink-muted hover:text-ink hover:bg-line/40 transition-colors border border-line/60 shadow-2xs cursor-pointer shrink-0"
                title="Cerrar ventana"
              >
                <FontAwesomeIcon icon={faXmark} className="size-4" />
              </button>
            </div>

            {/* Resumen rápido de totales */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-sans font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  Total a Facturar: {formatearMonedaCOP(totalConPropina)}
                </span>
                {propinaNumerica > 0 && (
                  <span className="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-300/80">
                    (incluye {formatearMonedaCOP(propinaNumerica)} de propina)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Formulario con Scroll */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 space-y-5">
            {submitError && (
              <div
                role="alert"
                className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-xs text-danger flex items-start justify-between gap-3 animate-fade-in"
              >
                <div className="flex items-start gap-2.5">
                  <FontAwesomeIcon icon={faCircleExclamation} className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Aviso en el envío</p>
                    <p className="mt-0.5 text-danger/90">{submitError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="text-danger/70 hover:text-danger p-1 rounded-lg transition-colors cursor-pointer"
                  title="Descartar aviso"
                >
                  <FontAwesomeIcon icon={faXmark} className="size-3.5" />
                </button>
              </div>
            )}

            {/* 1. Número de Orden y Horario de Entrega en 2 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Campo: Número de Orden (restringido a 2 dígitos) con botón generador */}
              <Input
                label="Número de orden"
                value={numeroOrden}
                onChange={handleNumeroOrdenChange}
                placeholder="17"
                maxLength={2}
                inputMode="numeric"
                pattern="[0-9]{2}"
                icon={<FontAwesomeIcon icon={faHashtag} className="size-3.5" />}
                required
                action={
                  <button
                    type="button"
                    onClick={handleGenerarAleatorio}
                    title="Generar número de orden aleatorio de 2 dígitos (ej. 17)"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <FontAwesomeIcon icon={faDice} className="size-3" />
                    <span>Generar</span>
                  </button>
                }
                hint="Número de comanda de 2 dígitos. Pulsa 'Generar' para asignar uno al azar."
              />

              {/* Campo: Horario de Entrega (Datetime) */}
              <div className="w-full">
                <label
                  htmlFor={horarioEntregaId}
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Horario de entrega <span className="text-danger ml-0.5">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-soft">
                    <FontAwesomeIcon icon={faClock} className="size-3.5" />
                  </span>
                  <input
                    id={horarioEntregaId}
                    type="datetime-local"
                    value={horarioEntrega}
                    onChange={(e) => setHorarioEntrega(e.target.value)}
                    required
                    className="w-full rounded-xl border border-line bg-panel pl-10 pr-4 py-2.5 text-sm text-ink shadow-xs outline-none transition-colors hover:border-ink-soft focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="mt-1.5 text-xs text-ink-soft">
                  Fecha y hora programada para que el mayordomo entregue el pedido.
                </p>
              </div>
            </div>

            {/* 2. Recepción / Habitación -> RecursosDropdown */}
            <div className="w-full">
              <RecursosDropdown
                label="Recepción / Habitación"
                value={recepcion}
                onChange={(val) => setRecepcion(val)}
                options={opcionesRecepcion}
                placeholder={
                  loadingRecepciones
                    ? 'Cargando habitaciones…'
                    : 'Selecciona una recepción o habitación…'
                }
                error={errorRecepciones ?? undefined}
                required
              />
              <p className="mt-1.5 text-xs text-ink-soft">
                Punto de entrega o habitación del huésped asignada para este despacho (formato: Edificio - Piso - Habitación).
              </p>
            </div>

            {/* 3. Canal y Método de Pago en 2 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Campo: Canal de Pedido -> RecursosDropdown */}
              <div className="w-full">
                <RecursosDropdown
                  label="Canal de pedido"
                  value={canal}
                  onChange={(val) => setCanal(val)}
                  options={OPCIONES_CANAL}
                  placeholder="Selecciona el canal de pedido…"
                  required
                />
                <p className="mt-1.5 text-xs text-ink-soft">
                  Vía por la cual el huésped se comunicó para ordenar.
                </p>
              </div>

              {/* Campo: Método de Pago -> RecursosDropdown */}
              <div className="w-full">
                <RecursosDropdown
                  label="Método de pago"
                  value={metodoPago}
                  onChange={(val) => setMetodoPago(val)}
                  options={OPCIONES_METODO_PAGO}
                  placeholder="Selecciona el método de pago…"
                  required
                />
                <p className="mt-1.5 text-xs text-ink-soft">
                  Forma en que se liquidará el consumo del servicio.
                </p>
              </div>
            </div>

            {/* 4. Campo de Propina utilizando el componente reutilizable Input */}
            <div className="rounded-2xl border border-line bg-canvas/30 p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <Input
                    label="Propina"
                    type="number"
                    min="0"
                    step="1000"
                    value={propina}
                    onChange={(e) => setPropina(e.target.value)}
                    placeholder="0"
                    icon={<span className="text-xs font-bold text-ink-soft">$</span>}
                    action={
                      propinaNumerica > 0 ? (
                        <button
                          type="button"
                          onClick={() => setPropina('0')}
                          className="text-[11px] font-bold text-ink-muted hover:text-danger px-2 py-0.5 rounded transition-colors cursor-pointer"
                          title="Restablecer a 0"
                        >
                          Quitar
                        </button>
                      ) : undefined
                    }
                    hint="Aporte voluntario de propina para el personal de servicio (COP)."
                  />
                </div>

                {/* Botones de montos sugeridos */}
                <div className="sm:self-end pb-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-ink-muted">Sugerido:</span>
                  {[5000, 10000, 20000].map((monto) => (
                    <button
                      key={monto}
                      type="button"
                      onClick={() => setPropina(String(monto))}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border shadow-2xs active:scale-95 ${
                        propinaNumerica === monto
                          ? 'bg-primary text-white border-primary'
                          : 'bg-panel text-ink border-line hover:border-ink-soft hover:bg-canvas'
                      }`}
                    >
                      +{formatearMonedaCOP(monto)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Instrucciones para el delivery */}
            <Textarea
              label="Instrucciones para el delivery"
              value={instruccionesDelivery}
              onChange={(e) => setInstruccionesDelivery(e.target.value)}
              placeholder="Ej: Tocar el timbre suavemente dos veces. Dejar la bandeja sobre la mesa auxiliar de la terraza."
              rows={2}
              resize="none"
              maxLength={200}
              showCount
            />

            {/* 5. Notas generales */}
            <Textarea
              label="Notas generales"
              value={notasGenerales}
              onChange={(e) => setNotasGenerales(e.target.value)}
              placeholder="Ej: Huésped alérgico al marisco. Preparar bebidas con hielo por separado. Servicio de alta prioridad VIP."
              rows={2}
              resize="none"
              hint="Observaciones culinarias especiales o requerimientos de atención del cliente."
              maxLength={300}
              showCount
            />

            {/* Barra de botones de acción */}
            <div className="pt-4 border-t border-line flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl border border-line bg-panel px-5 py-2.5 text-xs font-bold text-ink hover:bg-canvas transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar y Volver al Carrito
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faCheck} className="size-3.5" />
                <span>{isSubmitting ? 'Transmitiendo...' : 'Confirmar y Enviar a Cocina'}</span>
              </button>
            </div>
          </form>

          {/* Loader visible durante el envío a cocina */}
          <Loader
            overlay
            visible={isSubmitting}
            size={42}
            label="Transmitiendo pedido a cocina..."
          />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
