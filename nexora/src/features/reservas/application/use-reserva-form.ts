import { useCallback, useEffect, useState } from 'react'
import { readAuthTokenEmail, readTokenEmail } from '../../../shared/auth-storage'
import {
  calculateNights,
  calculateTotalPrice,
  RESERVA_ESTADO_BACKEND_MAP,
  RESERVA_ESTADO_OPTIONS,
  ReservaApiError,
  validateReservaInput,
  type BedItem3D,
  type ReservaEstado,
  type ReservaInput,
  type ReservaPayload,
  type ReservaValidationErrors,
} from '../domain/reserva'
import { ApiReservaRepository } from '../infrastructure/api-reserva-repository'
import { useClientSession } from './use-client-session'
import { useInteractiveBeds3D } from './use-interactive-beds-3d'

const defaultRepository = new ApiReservaRepository()

export interface SuccessReservaSummary {
  roomLabel: string
  personLabel: string
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  stateLabel: string
  totalPrice: number
  bedTypeName?: string
}

function getTodayString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTomorrowString(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useReservaForm(repository = defaultRepository) {
  const sessionManager = useClientSession(repository)
  const bedsManager = useInteractiveBeds3D(repository)

  const [assignedBed, setAssignedBed] = useState<BedItem3D | null>(null)
  const [checkInDate, setCheckInDate] = useState<string>(getTodayString())
  const [checkOutDate, setCheckOutDate] = useState<string>(getTomorrowString())
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1)
  const [state, setState] = useState<string>('pendiente')
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [nights, setNights] = useState<number>(1)

  const [errors, setErrors] = useState<ReservaValidationErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitStatusCode, setSubmitStatusCode] = useState<number | null>(null)
  const [successReserva, setSuccessReserva] = useState<SuccessReservaSummary | null>(null)

  // Recalcular noches y total si cambian fechas o la cama asignada
  useEffect(() => {
    const computedNights = calculateNights(checkInDate, checkOutDate)
    setNights(computedNights)
    if (assignedBed) {
      const calculated = calculateTotalPrice(computedNights, assignedBed.pricePerNight)
      setTotalPrice(calculated)
    } else {
      setTotalPrice(0)
    }
  }, [checkInDate, checkOutDate, assignedBed])

  // Ajustar huéspedes automáticamente si la cama tiene menor capacidad
  useEffect(() => {
    if (assignedBed && numberOfGuests > assignedBed.capacity) {
      setNumberOfGuests(assignedBed.capacity)
    }
  }, [assignedBed, numberOfGuests])

  /**
   * Se ejecuta cuando el usuario suelta una cama 3D en la BedDropZone
   */
  const handleBedDrop = useCallback((bed: BedItem3D) => {
    setAssignedBed(bed)
    setErrors((prev) => {
      const updated = { ...prev }
      delete updated.bedId
      delete updated.roomId
      return updated
    })
  }, [])

  /**
   * Desasigna la cama actual
   */
  const handleRemoveBed = useCallback(() => {
    setAssignedBed(null)
    setTotalPrice(0)
  }, [])

  /**
   * Cambios en fechas
   */
  const handleDateChange = useCallback(
    (field: 'checkInDate' | 'checkOutDate', value: string) => {
      if (field === 'checkInDate') {
        setCheckInDate(value)
        // Si checkOut es menor o igual, lo avanzamos al día siguiente
        if (checkOutDate && value >= checkOutDate) {
          const nextDay = new Date(value)
          nextDay.setDate(nextDay.getDate() + 1)
          const y = nextDay.getFullYear()
          const m = String(nextDay.getMonth() + 1).padStart(2, '0')
          const d = String(nextDay.getDate()).padStart(2, '0')
          setCheckOutDate(`${y}-${m}-${d}`)
        }
      } else {
        setCheckOutDate(value)
      }

      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    },
    [checkOutDate],
  )

  /**
   * Stepper de huéspedes con límite del aforo de la cama
   */
  const handleGuestChange = useCallback(
    (newVal: number) => {
      const maxAllowed = assignedBed ? assignedBed.capacity : 10
      const clamped = Math.max(1, Math.min(newVal, maxAllowed))
      setNumberOfGuests(clamped)
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated.numberOfGuests
        return updated
      })
    },
    [assignedBed],
  )

  /**
   * Envío final de la reserva con try / catch exhaustivo
   */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const currentPersonId = sessionManager.selectedPersonId || sessionManager.clientSession.personId || ''

    const formInput: ReservaInput = {
      bedId: assignedBed ? assignedBed.bedId : '',
      roomId: assignedBed ? assignedBed.roomId : '',
      personId: currentPersonId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      state,
      totalPrice,
    }

    const validation = validateReservaInput(formInput, assignedBed ? assignedBed.capacity : 10)
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    setSubmitStatusCode(null)

    try {
      const stateBackend =
        RESERVA_ESTADO_BACKEND_MAP[state as ReservaEstado] ?? state.toLowerCase()
      const createdByEmail = readTokenEmail() || readAuthTokenEmail()

      const payload: ReservaPayload = {
        room_id: assignedBed!.roomId,
        person_id: currentPersonId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        number_of_guests: Number(numberOfGuests),
        state: stateBackend,
        total_price: totalPrice,
        created_by: createdByEmail,
      }

      await repository.createReserva(payload)

      const stateOpt = RESERVA_ESTADO_OPTIONS.find((o) => o.value === state)
      const personLabel =
        sessionManager.availablePersons.find((p) => p.id === currentPersonId)?.name ||
        sessionManager.clientSession.name

      setSuccessReserva({
        roomLabel: `${assignedBed!.roomName} · ${assignedBed!.etiquette}`,
        personLabel,
        checkInDate,
        checkOutDate,
        numberOfGuests: Number(numberOfGuests),
        stateLabel: stateOpt ? stateOpt.label : state,
        totalPrice,
        bedTypeName: assignedBed!.typeName,
      })
    } catch (err: unknown) {
      // Manejo estricto de Status Codes HTTP (200, 201, 400, 401, 403, 404, 409, 422, 500, Código 0)
      if (err instanceof ReservaApiError) {
        setSubmitStatusCode(err.statusCode)
        if (err.statusCode === 400) {
          setSubmitError(
            'Revisamos los datos y notamos un detalle en la solicitud. No te preocupes: toda tu información sigue guardada en el formulario; por favor verifica que las fechas y el huésped sean correctos e intenta de nuevo.',
          )
        } else if (err.statusCode === 401) {
          setSubmitError(
            'Tu sesión ha expirado durante el proceso de reserva. Por favor reingresa a tu cuenta; tus datos seleccionados están protegidos.',
          )
        } else if (err.statusCode === 403) {
          setSubmitError(
            'No dispones de los permisos requeridos para registrar reservas en este módulo. Consulta con la administración del hotel.',
          )
        } else if (err.statusCode === 404) {
          setSubmitError(
            'La cama o habitación seleccionada ya no figura en el inventario activo. Por favor selecciona otra cama desde la barra 3D.',
          )
        } else if (err.statusCode === 409) {
          setSubmitError(
            '¡Esta cama acaba de ser tomada por otro huésped para las fechas seleccionadas! No perdiste ningún dato: arrastra otra cama desde la barra superior para continuar.',
          )
        } else if (err.statusCode === 422) {
          setSubmitError(
            'Casi lo tenemos: algunos campos necesitan un pequeño ajuste antes de confirmar (como aforo o coherencia de fechas). Tus datos están seguros aquí; revísalos y volvemos a intentar.',
          )
        } else if (err.statusCode === 500) {
          setSubmitError(
            'Hubo una pequeña interrupción momentánea en nuestros servidores al registrar la reserva. Tranqui, no hiciste nada mal y tus datos no se perdieron. Prueba nuevamente en un instante.',
          )
        } else {
          setSubmitError(
            `Se presentó un detalle al intentar registrar la reserva (código ${err.statusCode}). Tus datos siguen intactos en el formulario; por favor intenta nuevamente.`,
          )
        }
      } else {
        setSubmitStatusCode(0)
        setSubmitError(
          'Tus datos ingresados siguen a salvo en el formulario. Ocurrió un inconveniente al conectar con el servidor; por favor revisa tu conexión e inténtalo nuevamente.',
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setAssignedBed(null)
    setCheckInDate(getTodayString())
    setCheckOutDate(getTomorrowString())
    setNumberOfGuests(1)
    setState('pendiente')
    setTotalPrice(0)
    setErrors({})
    setSubmitError(null)
    setSubmitStatusCode(null)
    setSuccessReserva(null)
  }

  return {
    sessionManager,
    bedsManager,
    assignedBed,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    state,
    totalPrice,
    nights,
    errors,
    submitting,
    submitError,
    submitStatusCode,
    successReserva,
    handleBedDrop,
    handleRemoveBed,
    handleDateChange,
    handleGuestChange,
    setState,
    handleSubmit,
    handleReset,
  }
}
