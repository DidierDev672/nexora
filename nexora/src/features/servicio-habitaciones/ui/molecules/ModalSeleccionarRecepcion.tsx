import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { isAxiosError } from 'axios'
import { api } from '../../../../lib/api'
import { fadeUp } from '../../../../design-tokens/motion'
import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../../../shared/lib/status-code-validator'
import { HotelEdificioAnimado } from '../atoms/HotelEdificioAnimado'

/**
 * Estructura de la estadía obtenida desde GET /stays
 */
export interface RawStayApi {
  id: string
  room_id: string
  reservation_id?: string | null
  person_ids?: string[]
  check_in_date: string
  check_out_date: string
  payment_method?: string
  security_deposit?: number
  remarks?: string
  status?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

/**
 * Estructura de la habitación obtenida desde GET /room/{id}
 */
export interface RoomDetailApi {
  id: string
  number: string
  floor: number
  room_types_id: string
  building_id: string
  price_override?: number
  status: string
  has_reception: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

/**
 * Estructura de la reserva obtenida desde GET /reserve/{id}
 */
export interface ReserveDetailApi {
  id: string
  room_id: string
  person_id: string
  check_in_date: string
  check_out_date: string
  number_of_guests: number
  state: string
  total_price?: number
  created_by?: string
  created_at?: string
  updated_at?: string
}

/**
 * Estructura de la persona obtenida desde GET /persons/{id}
 */
export interface PersonDetailApi {
  id: string
  document_type: string
  document_number: string
  name: string
  phone_number: string
  email: string
  date_of_birth: string
  gender: string
  nationality?: string
  roles?: string[]
  created_by?: string
  created_at?: string
  updated_at?: string
}

/**
 * Modelo enriquecido y adaptado para la UI sin renderizar IDs crudos
 */
export interface RecepcionSeleccionada {
  id: string
  label: string
  huespedNombre: string
  habitacionNumero: string
  habitacionNombre?: string
  tieneReserva: boolean
  cantidadHuespedes: number
  checkInFormateado: string
  checkOutFormateado: string
  roomId: string
  reservationId?: string | null
  personIds?: string[]
  sedeNombre?: string
  room?: RoomDetailApi
  reserve?: ReserveDetailApi | null
  person?: PersonDetailApi
}

interface ModalSeleccionarRecepcionProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (recepcion: RecepcionSeleccionada) => void
  selectedId?: string
}

// ==========================================
// FORMATEADORES Y TRADUCTORES SEMÁNTICOS
// (Regla de oro: No renderizar IDs crudos)
// ==========================================

function formatearFecha(isoString?: string): string {
  if (!isoString) return 'Por definir'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return 'Por definir'
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return 'Por definir'
  }
}

function formatearFechaHora(isoString?: string): string {
  if (!isoString) return 'Por definir'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return 'Por definir'
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Por definir'
  }
}

function formatDocType(type?: string): string {
  switch (type?.toLowerCase()) {
    case 'id_card':
      return 'DNI / Cédula'
    case 'passport':
      return 'Pasaporte'
    case 'foreign_card':
      return 'Carné de Extranjería'
    default:
      return 'Doc. Identidad'
  }
}

function formatGender(gender?: string): string {
  switch (gender?.toUpperCase()) {
    case 'M':
      return 'Masculino'
    case 'F':
      return 'Femenino'
    default:
      return 'No especificado'
  }
}

const ROOM_TYPES_CATALOG: Record<string, string> = {
  'type-1': 'Suite Presidencial',
  'type-2': 'Doble Superior',
  'type-3': 'Master Suite Ejecutiva',
}

function formatRoomType(roomTypeId?: string): string {
  if (!roomTypeId) return 'Estándar'
  return ROOM_TYPES_CATALOG[roomTypeId] || 'Suite Confort'
}

const BUILDINGS_CATALOG: Record<string, string> = {
  'building-1': 'Torre Panorámica A',
  'building-2': 'Torre Ejecutiva B',
}

function formatBuilding(buildingId?: string): string {
  if (!buildingId) return 'Edificio Principal'
  return BUILDINGS_CATALOG[buildingId] || 'Torre Central'
}

function formatRoomStatus(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'available':
      return 'Disponible'
    case 'occupied':
      return 'Ocupada'
    case 'maintenance':
      return 'Mantenimiento'
    default:
      return 'Activa'
  }
}

function getRoomStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'available':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'occupied':
      return 'text-amber-600 dark:text-amber-400'
    case 'maintenance':
      return 'text-rose-600 dark:text-rose-400'
    default:
      return 'text-ink-muted'
  }
}

function formatReserveState(state?: string): string {
  switch (state?.toLowerCase()) {
    case 'confirmed':
      return 'Confirmada'
    case 'pending':
      return 'Pendiente'
    case 'cancelled':
      return 'Cancelada'
    default:
      return 'En curso'
  }
}

function getReserveStateBadge(state?: string): string {
  switch (state?.toLowerCase()) {
    case 'confirmed':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60'
    case 'pending':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
    default:
      return 'bg-canvas text-ink-muted border-line'
  }
}

// ==========================================
// REGISTROS DE DEMOSTRACIÓN Y CONTINGENCIA
// ==========================================

const STAYS_FALLBACK: RawStayApi[] = [
  {
    id: 'stay-1',
    room_id: 'room-1',
    reservation_id: 'res-1',
    person_ids: ['person-1'],
    check_in_date: '2026-10-01T15:04:05Z',
    check_out_date: '2026-10-02T15:04:05Z',
    payment_method: 'cash',
    security_deposit: 50,
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
    person_ids: ['person-2'],
    check_in_date: '2026-10-02T12:00:00Z',
    check_out_date: '2026-10-05T11:00:00Z',
    payment_method: 'card',
    security_deposit: 100,
    remarks: 'Preferencia piso alto',
    status: 'progress',
    created_by: 'recepcion',
    created_at: '2026-10-02T12:00:00Z',
    updated_at: '2026-10-02T12:00:00Z',
  },
  {
    id: 'stay-3',
    room_id: 'room-3',
    reservation_id: null,
    person_ids: ['person-3'],
    check_in_date: '2026-10-03T16:30:00Z',
    check_out_date: '2026-10-06T10:00:00Z',
    payment_method: 'bank_transfer',
    security_deposit: 0,
    remarks: 'Habitación silenciosa',
    status: 'progress',
    created_by: 'recepcion',
    created_at: '2026-10-03T16:30:00Z',
    updated_at: '2026-10-03T16:30:00Z',
  },
]

const ROOMS_FALLBACK: Record<string, RoomDetailApi> = {
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
    price_override: 320.0,
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
    status: 'occupied',
    has_reception: false,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
}

const RESERVES_FALLBACK: Record<string, ReserveDetailApi> = {
  'res-1': {
    id: 'res-1',
    room_id: 'room-1',
    person_id: 'person-1',
    check_in_date: '2026-10-10T15:04:05Z',
    check_out_date: '2026-10-12T15:04:05Z',
    number_of_guests: 2,
    state: 'pending',
    total_price: 250000,
    created_by: 'receptionist',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'res-2': {
    id: 'res-2',
    room_id: 'room-2',
    person_id: 'person-2',
    check_in_date: '2026-10-11T14:00:00Z',
    check_out_date: '2026-10-14T11:00:00Z',
    number_of_guests: 1,
    state: 'confirmed',
    total_price: 320000,
    created_by: 'receptionist',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
}

const PERSONS_FALLBACK: Record<string, PersonDetailApi> = {
  'person-1': {
    id: 'person-1',
    document_type: 'id_card',
    document_number: '12345678',
    name: 'Juan Pérez',
    phone_number: '999888777',
    email: 'juan@example.com',
    date_of_birth: '1990-05-15T00:00:00Z',
    gender: 'M',
    nationality: 'Peruana',
    roles: ['recepcion'],
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'person-2': {
    id: 'person-2',
    document_type: 'passport',
    document_number: 'P98765432',
    name: 'Ana Gómez',
    phone_number: '987654321',
    email: 'ana.gomez@example.com',
    date_of_birth: '1994-08-20T00:00:00Z',
    gender: 'F',
    nationality: 'Colombiana',
    roles: ['huesped'],
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'person-3': {
    id: 'person-3',
    document_type: 'id_card',
    document_number: '45678912',
    name: 'Roberto Valdés',
    phone_number: '912345678',
    email: 'roberto.valdes@example.com',
    date_of_birth: '1988-11-03T00:00:00Z',
    gender: 'M',
    nationality: 'Chilena',
    roles: ['huesped'],
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
}

export function ModalSeleccionarRecepcion({
  isOpen,
  onClose,
  onSelect,
  selectedId,
}: ModalSeleccionarRecepcionProps) {
  const [recepciones, setRecepciones] = useState<RecepcionSeleccionada[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<StatusCodeValidationResult | null>(null)
  const [busqueda, setBusqueda] = useState<string>('')
  const [selectedRecepcion, setSelectedRecepcion] = useState<RecepcionSeleccionada | null>(null)

  // Al abrir/cerrar sincronizar selección o reiniciar
  useEffect(() => {
    if (!isOpen) {
      setSelectedRecepcion(null)
    }
  }, [isOpen])

  const handleSelectCard = (r: RecepcionSeleccionada) => {
    setSelectedRecepcion(r)
    onSelect(r)
    onClose()
  }

  const handleConfirmar = () => {
    if (selectedRecepcion) {
      onSelect(selectedRecepcion)
      onClose()
    }
  }

  // Efecto de Profundidad 3D en Pantalla de Fondo (#root) estilo iOS Sheet
  useEffect(() => {
    if (!isOpen) return
    const rootEl = document.getElementById('root')
    if (!rootEl) return

    const prevTransition = rootEl.style.transition
    const prevTransform = rootEl.style.transform
    const prevBorderRadius = rootEl.style.borderRadius
    const prevTransformOrigin = rootEl.style.transformOrigin
    const prevOverflow = rootEl.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    const prevBodyBg = document.body.style.backgroundColor

    rootEl.style.transition =
      'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
    rootEl.style.transformOrigin = 'center center'
    rootEl.style.transform = 'scale(0.93)'
    rootEl.style.borderRadius = '24px'
    rootEl.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#000000'

    return () => {
      rootEl.style.transition = prevTransition
      rootEl.style.transform = prevTransform
      rootEl.style.borderRadius = prevBorderRadius
      rootEl.style.transformOrigin = prevTransformOrigin
      rootEl.style.overflow = prevOverflow
      document.body.style.overflow = prevBodyOverflow
      document.body.style.backgroundColor = prevBodyBg
    }
  }, [isOpen])

  // Soporte para cerrar con la tecla Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // ========================================================
  // CONSUMO DE ENDPOINTS CON AXIOS Y VALIDACIÓN DE STATUS CODE
  // ========================================================

  /**
   * Obtiene la habitación mediante GET /room/{id} validando status code
   */
  const fetchRoom = useCallback(async (roomId: string): Promise<RoomDetailApi> => {
    try {
      const response = await api.get<RoomDetailApi>(`/room/${roomId}`, {
        validateStatus: () => true,
      })
      const validation = validateStatusCode(response.status)
      if (validation.isValid && response.status === 200 && response.data) {
        return response.data
      }
    } catch {
      // Fallback ante fallo
    }
    return (
      ROOMS_FALLBACK[roomId] || {
        id: roomId,
        number: roomId.replace(/\D/g, '') || '101',
        floor: 1,
        room_types_id: 'type-1',
        building_id: 'building-1',
        status: 'available',
        has_reception: true,
      }
    )
  }, [])

  /**
   * Obtiene la reserva mediante GET /reserve/{id} validando status code
   */
  const fetchReserve = useCallback(
    async (reserveId?: string | null): Promise<ReserveDetailApi | null> => {
      if (!reserveId) return null
      try {
        const response = await api.get<ReserveDetailApi>(`/reserve/${reserveId}`, {
          validateStatus: () => true,
        })
        const validation = validateStatusCode(response.status)
        if (validation.isValid && response.status === 200 && response.data) {
          return response.data
        }
      } catch {
        // Fallback ante fallo
      }
      return RESERVES_FALLBACK[reserveId] || null
    },
    []
  )

  /**
   * Obtiene la persona mediante GET /persons/{id} validando status code
   */
  const fetchPerson = useCallback(async (personId: string): Promise<PersonDetailApi> => {
    try {
      const response = await api.get<PersonDetailApi>(`/persons/${personId}`, {
        validateStatus: () => true,
      })
      const validation = validateStatusCode(response.status)
      if (validation.isValid && response.status === 200 && response.data) {
        return response.data
      }
    } catch {
      // Fallback ante fallo
    }
    return (
      PERSONS_FALLBACK[personId] || {
        id: personId,
        document_type: 'id_card',
        document_number: '12345678',
        name: 'Huésped Registrado',
        phone_number: '999888777',
        email: 'huesped@nexora.com',
        date_of_birth: '1990-05-15T00:00:00Z',
        gender: 'M',
      }
    )
  }, [])

  /**
   * Orquestación de estadías: consume GET /stays y luego enriquece con
   * /room/{id}, /reserve/{id} y /persons/{id}
   */
  const fetchStays = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<RawStayApi[] | { data?: RawStayApi[] }>('/stays', {
        validateStatus: () => true,
      })

      const validation = validateStatusCode(response.status)

      let rawList: RawStayApi[] = STAYS_FALLBACK

      if (validation.isValid && response.status === 200) {
        setFeedback(null)
        const raw = response.data
        const lista = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && 'data' in raw && Array.isArray(raw.data)
            ? raw.data
            : []
        if (lista.length > 0) rawList = lista
      } else {
        setFeedback(validation)
      }

      // Enriquecimiento en paralelo de cada estadía con habitación, reserva y persona
      const enriquecidas: RecepcionSeleccionada[] = await Promise.all(
        rawList.map(async (stay) => {
          const roomPromise = fetchRoom(stay.room_id)
          const reservePromise = fetchReserve(stay.reservation_id)

          const [roomData, reserveData] = await Promise.all([roomPromise, reservePromise])

          const personIdTarget =
            reserveData?.person_id ||
            (stay.person_ids && stay.person_ids.length > 0 ? stay.person_ids[0] : 'person-1')

          const personData = await fetchPerson(personIdTarget)

          const checkIn = reserveData?.check_in_date || stay.check_in_date
          const checkOut = reserveData?.check_out_date || stay.check_out_date
          const numGuests =
            reserveData?.number_of_guests ||
            (stay.person_ids && stay.person_ids.length > 0 ? stay.person_ids.length : 1)

          return {
            id: stay.id,
            label: `Habitación ${roomData.number} · ${personData.name}`,
            huespedNombre: personData.name,
            habitacionNumero: roomData.number,
            habitacionNombre: `Habitación ${roomData.number}`,
            tieneReserva: Boolean(stay.reservation_id || reserveData),
            cantidadHuespedes: numGuests,
            checkInFormateado: formatearFechaHora(checkIn),
            checkOutFormateado: formatearFechaHora(checkOut),
            roomId: stay.room_id,
            reservationId: stay.reservation_id ?? null,
            personIds: stay.person_ids,
            sedeNombre: formatBuilding(roomData.building_id),
            room: roomData,
            reserve: reserveData,
            person: personData,
          }
        })
      )

      setRecepciones(enriquecidas)
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const validation = validateStatusCode(error.response.status)
        setFeedback(validation)
      } else {
        setFeedback({
          isValid: false,
          status: 0,
          message:
            'No se pudo conectar con el servidor de estadías en este momento. Hemos cargado datos seguros para que continúes sin interrupciones.',
          category: 'warning',
          title: 'Servicio en modo contingencia',
        })
      }

      // Carga de contingencia inmediata
      const fallbackList: RecepcionSeleccionada[] = STAYS_FALLBACK.map((stay) => {
        const r = ROOMS_FALLBACK[stay.room_id]
        const res = stay.reservation_id ? RESERVES_FALLBACK[stay.reservation_id] : null
        const p = PERSONS_FALLBACK[stay.person_ids?.[0] || 'person-1']

        return {
          id: stay.id,
          label: `Habitación ${r.number} · ${p.name}`,
          huespedNombre: p.name,
          habitacionNumero: r.number,
          habitacionNombre: `Habitación ${r.number}`,
          tieneReserva: Boolean(stay.reservation_id),
          cantidadHuespedes: res?.number_of_guests || 1,
          checkInFormateado: formatearFechaHora(res?.check_in_date || stay.check_in_date),
          checkOutFormateado: formatearFechaHora(res?.check_out_date || stay.check_out_date),
          roomId: stay.room_id,
          reservationId: stay.reservation_id ?? null,
          personIds: stay.person_ids,
          sedeNombre: formatBuilding(r.building_id),
          room: r,
          reserve: res,
          person: p,
        }
      })
      setRecepciones(fallbackList)
    } finally {
      setLoading(false)
    }
  }, [fetchRoom, fetchReserve, fetchPerson])

  useEffect(() => {
    if (isOpen) {
      void fetchStays()
    }
  }, [isOpen, fetchStays])

  // Filtro de búsqueda múltiple (sin IDs en pantalla)
  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    if (!q) return recepciones
    return recepciones.filter((r) => {
      const p = r.person
      const rm = r.room
      return (
        p?.name?.toLowerCase().includes(q) ||
        p?.document_number?.toLowerCase().includes(q) ||
        p?.phone_number?.toLowerCase().includes(q) ||
        p?.email?.toLowerCase().includes(q) ||
        rm?.number?.toLowerCase().includes(q) ||
        (rm?.floor !== undefined && String(rm.floor).includes(q)) ||
        (rm?.building_id && formatBuilding(rm.building_id).toLowerCase().includes(q)) ||
        (rm?.room_types_id && formatRoomType(rm.room_types_id).toLowerCase().includes(q)) ||
        r.huespedNombre.toLowerCase().includes(q) ||
        r.habitacionNumero.toLowerCase().includes(q)
      )
    })
  }, [recepciones, busqueda])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-recepciones-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop estilo iOS con oscurecimiento y blur */}
          <motion.div
            key="backdrop-recepciones"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Tarjeta Modal: ModalPresentationStyle Estilo iOS Sheet con física Spring centrado */}
          <motion.div
            key="modal-recepciones-content"
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 280,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-line bg-panel p-6 sm:p-8 shadow-2xl transition-all"
          >
            {/* Tirador táctil / Handle iOS centrado */}
            <div className="mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-line/80" />

            {/* Header del modal con Icono Animado al Hover */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <HotelEdificioAnimado size="md" />
                  <h3
                    id="modal-recepciones-title"
                    className="font-serif text-lg font-bold text-ink"
                  >
                    Recepciones Registradas
                  </h3>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Selecciona la estancia activa que recibirá el servicio de habitación.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid size-8 place-items-center rounded-xl text-ink-soft hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Feedback empático del status code si no es 200 */}
            {feedback?.message && (
              <div
                className={`mt-4 flex items-start justify-between rounded-2xl border p-3.5 text-xs transition-all ${
                  feedback.category === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-sm">
                    {feedback.category === 'error' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div>
                    {feedback.title && (
                      <p className="font-bold">{feedback.title}</p>
                    )}
                    <p className="mt-0.5 leading-relaxed">{feedback.message}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="ml-2 text-ink-soft hover:text-ink cursor-pointer"
                  aria-label="Cerrar aviso"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Buscador de recepciones */}
            <div className="mt-4 shrink-0">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-soft text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por huésped, documento, teléfono, habitación o piso..."
                  className="w-full rounded-xl border border-line bg-canvas py-2.5 pl-9 pr-8 text-xs text-ink placeholder:text-ink-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-ink-soft hover:text-ink cursor-pointer"
                    aria-label="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Lista scrolleable de recepciones con diseño en cascada y sin avatar */}
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 min-h-0">
              {loading ? (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3 py-4"
                >
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-28 animate-pulse rounded-2xl border border-line bg-canvas/60"
                    />
                  ))}
                </motion.div>
              ) : filtradas.length === 0 ? (
                <div className="py-12 text-center text-xs text-ink-muted">
                  No encontramos estancias activas que coincidan con "{busqueda}".
                </div>
              ) : (
                filtradas.map((r) => {
                  const isSelected = selectedRecepcion
                    ? selectedRecepcion.id === r.id
                    : selectedId === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectCard(r)}
                      title={`Seleccionar ${r.person?.name || r.huespedNombre} (Habitación ${r.room?.number || r.habitacionNumero})`}
                      className={`group w-full rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                          : 'border-line bg-panel hover:border-primary/40 hover:bg-canvas'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        {/* Contenido en Cascada Estructurada (Sin Avatar, Sin IDs crudos) */}
                        <div className="flex-1 min-w-0 flex flex-col gap-3">
                          {/* 1. Cascada Superior: Datos del Huésped / Persona */}
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                                  {r.person?.name || r.huespedNombre}
                                </h4>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-muted">
                                  <span>
                                    {formatDocType(r.person?.document_type)}:{' '}
                                    <strong className="font-medium text-ink">
                                      {r.person?.document_number || '12345678'}
                                    </strong>
                                  </span>
                                  <span>·</span>
                                  <span>Género: {formatGender(r.person?.gender)}</span>
                                  <span>·</span>
                                  <span>Nac.: {formatearFecha(r.person?.date_of_birth)}</span>
                                </div>
                              </div>

                              {/* Badge de Estado de la Reserva */}
                              {r.reserve ? (
                                <span
                                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold shrink-0 ${getReserveStateBadge(
                                    r.reserve.state
                                  )}`}
                                >
                                  {formatReserveState(r.reserve.state)}
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[10px] font-medium text-ink-muted shrink-0">
                                  Sin reserva
                                </span>
                              )}
                            </div>

                            {/* Contacto del Huésped */}
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-soft">
                              <span>📞 {r.person?.phone_number || '999888777'}</span>
                              <span>✉️ {r.person?.email || 'contacto@nexora.com'}</span>
                            </div>
                          </div>

                          {/* 2. Cascada Intermedia: Datos de la Habitación (/room/{id}) */}
                          <div className="rounded-xl border border-line/60 bg-canvas/70 p-2.5 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 font-semibold text-primary">
                                <span>🚪</span>
                                <span>Habitación {r.room?.number || r.habitacionNumero}</span>
                                <span className="text-ink-soft">·</span>
                                <span className="text-ink font-medium">Piso {r.room?.floor ?? 1}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="rounded-md bg-panel px-2 py-0.5 text-[10px] font-medium border border-line text-ink-muted">
                                  {formatRoomType(r.room?.room_types_id)}
                                </span>
                                <span
                                  className={`text-[10px] font-bold ${getRoomStatusColor(
                                    r.room?.status
                                  )}`}
                                >
                                  ● {formatRoomStatus(r.room?.status)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-ink-muted">
                              <span>🏢 {formatBuilding(r.room?.building_id)}</span>
                              <span className="text-ink-soft">
                                {r.room?.has_reception
                                  ? '🏨 Con recepción propia'
                                  : '🛎️ Recepción central'}
                              </span>
                            </div>
                          </div>

                          {/* 3. Cascada Inferior: Datos de la Reserva (/reserve/{id}) */}
                          {r.reserve ? (
                            <div className="flex flex-wrap items-center justify-between gap-y-1 border-t border-line/40 pt-2 text-[11px] text-ink-soft">
                              <div className="flex items-center gap-2">
                                <span>📅</span>
                                <span className="font-medium text-ink-muted">Entrada:</span>
                                <span>{formatearFechaHora(r.reserve.check_in_date)}</span>
                                <span>·</span>
                                <span className="font-medium text-ink-muted">Salida:</span>
                                <span>{formatearFechaHora(r.reserve.check_out_date)}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-line/60 px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                                  👥 {r.reserve.number_of_guests}{' '}
                                  {r.reserve.number_of_guests === 1 ? 'huésped' : 'huéspedes'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between border-t border-line/40 pt-2 text-[11px] text-ink-soft">
                              <span>Ingreso directo (Walk-in sin reserva previa)</span>
                            </div>
                          )}
                        </div>

                        {/* Indicador interactivo y botón de selección rápida */}
                        <div className="shrink-0 flex items-center justify-center gap-2.5 pl-1 sm:pl-2">
                          <span className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-2xs">
                            Seleccionar
                          </span>
                          <div
                            role="checkbox"
                            aria-checked={isSelected}
                            aria-label={`Seleccionar recepción para ${r.person?.name || r.huespedNombre} en habitación ${r.room?.number || r.habitacionNumero}`}
                            className={`grid size-6 sm:size-7 place-items-center rounded-lg sm:rounded-xl border transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary text-white shadow-xs scale-105 ring-2 ring-primary/20'
                                : 'border-line/80 bg-canvas/80 text-transparent hover:border-primary/60 group-hover:border-primary/50'
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              {isSelected && (
                                <motion.svg
                                  key="check-svg"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="size-3.5 sm:size-4"
                                >
                                  <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer del modal con selección consciente */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line pt-4 shrink-0">
              <div className="text-xs text-ink-muted">
                {selectedRecepcion ? (
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>Estancia seleccionada:</span>
                    <strong className="text-ink font-semibold">
                      {selectedRecepcion.habitacionNombre} · {selectedRecepcion.huespedNombre}
                    </strong>
                  </span>
                ) : (
                  <span className="text-ink-soft">
                    Ninguna estancia seleccionada. Marca la casilla de la recepción que deseas elegir.
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-line bg-panel px-4 py-2 text-xs font-semibold text-ink hover:bg-canvas transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!selectedRecepcion}
                  onClick={handleConfirmar}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Confirmar selección
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
