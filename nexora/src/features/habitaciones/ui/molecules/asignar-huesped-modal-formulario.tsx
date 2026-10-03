import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import type { RoomRow } from '../../domain/habitacion-lista'
import { Input } from '../../../../shared/ui/Input'
import { RecursosDropdown } from '../../../recursos/ui/molecules/recursos-dropdown'
import {
  AsignarHuespedDatosBasicosModal,
  type DatosBasicosHuesped,
} from './asignar-huesped-datos-basicos-modal'
import {
  BuscarHuespedesModal,
  type PersonItem,
} from './buscar-huespedes-modal'
import { translateDocumentTypeToSpanish } from '../../domain/habitacion-stay'
import { Loader } from '../../../tema/ui/atoms/loader'
import { api } from '../../../../lib/api'
import { readTokenEmail } from '../../../../shared/auth-storage'
import { useGuestStayStore } from '../../application/use-guest-stay-store'

export interface FormularioAsignarHuesped {
  numeroHuesped: string
  fechaEntrada: string
  fechaSalida: string
  metodoPago: string
  deposito: string
  observacion: string
  status: string
  datosBasicos?: DatosBasicosHuesped
  huespedes?: DatosBasicosHuesped[]
  personIds?: string[]
}

export interface PsychologicalNotice {
  title: string
  message: string
  solution?: string
}

/**
 * Obtiene el email de created_by desde localStorage auth_token de manera resiliente,
 * parseando como JSON o decodificando el payload JWT, con respaldo en readTokenEmail().
 */
function getCreatedByFromLocalStorage(): string {
  try {
    const raw = window.localStorage.getItem('auth_token')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          const email = (parsed.email || parsed.Email || '').trim()
          if (email) return email
        }
      } catch {
        // No es JSON plano, verificar si es JWT
      }

      const parts = raw.split('.')
      if (parts.length >= 2) {
        try {
          const base64 = (parts[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')
          const padLength = (4 - (base64.length % 4)) % 4
          const padded = base64.padEnd(base64.length + padLength, '=')
          const decoded = decodeURIComponent(
            atob(padded)
              .split('')
              .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
              .join('')
          )
          const jwtPayload = JSON.parse(decoded)
          if (jwtPayload && typeof jwtPayload === 'object') {
            const email = (jwtPayload.email || jwtPayload.Email || '').trim()
            if (email) return email
          }
        } catch {
          // Ignorar fallo de decodificación
        }
      }
    }

    const fallbackEmail = readTokenEmail()
    if (fallbackEmail && fallbackEmail !== 'user_system') {
      return fallbackEmail
    }
  } catch {
    // Protección contra excepciones de Storage
  }
  return 'recepcion'
}

/**
 * Mapea el tipo de documento del formulario al formato esperado por el backend
 */
function mapDocumentTypeToApi(tipoDocumento: string): string {
  const norm = (tipoDocumento || '').trim().toLowerCase()
  if (norm.includes('nacional') || norm === 'national_id') return 'national_id'
  if (norm.includes('tarjeta') || norm === 'id_card') return 'id_card'
  if (norm.includes('extranjera') || norm.includes('pasaporte') || norm === 'foreign_id') return 'foreign_id'
  return 'national_id'
}

/**
 * Mensajes con enfoque psicológico para informar problemas sin culpabilizar al usuario,
 * confirmando que sus datos siguen a salvo en la pantalla y dándole una salida clara.
 */
function getPsychologicalErrorMessage(
  status: number,
  guestName?: string,
  serverMessage?: string,
  docNumber?: string
): PsychologicalNotice {
  const nombre = guestName?.trim() ? `para ${guestName.trim()}` : 'del huésped'

  switch (status) {
    case 409:
      return {
        title: 'Registro previo detectado en el sistema',
        message: `Tranquilo(a), tu información está completamente a salvo. El documento ${docNumber ? `"${docNumber}"` : ''} ya figura registrado en la base de datos de Nexora.`,
        solution: 'Verifica si el número de documento fue digitado correctamente o si este huésped ya se hospedó previamente.',
      }

    case 422:
      return {
        title: 'Ajustemos un detalle del formato',
        message: `No te preocupes, los datos ingresados ${nombre} están protegidos en tu formulario. Detectamos que algún dato (como el correo o la fecha) requiere una pequeña corrección.`,
        solution: 'Revisa que el correo tenga el formato correcto (ej: nombre@correo.com) y que las fechas sean válidas.',
      }

    case 400:
      return {
        title: 'Dato indispensable pendiente de verificación',
        message: `Todo lo que has escrito sigue intacto en tu pantalla. El sistema necesita que confirmemos algunos campos obligatorios antes de completar el registro ${nombre}.`,
        solution: 'Por favor corrobora que el tipo y número de documento, así como el nombre completo, no se encuentren vacíos.',
      }

    case 500:
    case 502:
    case 503:
      return {
        title: 'Pausa momentánea en el servidor',
        message: `Mantén la calma, no has perdido ningún avance. Nuestro servidor central tuvo una breve pausa al procesar los datos ${nombre}.`,
        solution: 'Espera unos instantes y vuelve a presionar "Guardar datos básicos". Todos tus datos continúan resguardados.',
      }

    default:
      return {
        title: 'Interrupción momentánea de conexión',
        message: `Tus datos siguen seguros en tu pantalla. Se presentó una intermitencia de red al intentar registrar los datos ${nombre}${serverMessage ? ` (${serverMessage})` : ''}.`,
        solution: 'Comprueba tu conexión e intenta registrar nuevamente con total tranquilidad.',
      }
  }
}

/**
 * Mapea el método de pago seleccionado por el recepcionista al valor en inglés requerido por la API
 */
function mapPaymentMethodToApi(metodo: string): string {
  const norm = (metodo || '').trim().toLowerCase()
  if (norm.includes('tarjeta') || norm === 'card') return 'card'
  if (norm.includes('transferencia') || norm === 'transfer') return 'transfer'
  return 'cash'
}

/**
 * Mapea el status en español de la UI al valor en inglés esperado por el backend
 */
function mapStatusToApi(status: string): string {
  const norm = (status || '').trim().toLowerCase()
  if (norm.includes('completa') || norm === 'completed') return 'completed'
  if (norm.includes('cancelada') || norm === 'cancelled') return 'cancelled'
  return 'progress'
}

/**
 * Mensajes de soporte psicológico para fallos en la asignación de estancia (POST /stays)
 */
function getPsychologicalStayErrorMessage(
  status: number,
  serverMessage?: string
): PsychologicalNotice {
  switch (status) {
    case 422:
      return {
        title: 'Ajustemos los detalles de la estancia',
        message:
          'No te preocupes, los datos de la habitación están protegidos en tu formulario. El servidor detectó que algún dato (como el formato de fechas de check-in/out o el depósito) requiere un ajuste.',
        solution:
          'Asegúrate de que la fecha de salida sea posterior a la fecha de entrada y que los valores sean correctos.',
      }
    case 400:
      return {
        title: 'Dato indispensable pendiente para la asignación',
        message:
          'Toda tu información continúa intacta en pantalla. Se requiere verificar que los campos obligatorios y los huéspedes registrados estén completos.',
        solution:
          'Por favor confirma que se haya registrado al menos un huésped y seleccionado el método de pago.',
      }
    case 500:
    case 502:
    case 503:
      return {
        title: 'Pausa momentánea en el servidor central',
        message:
          'Mantén la calma, no has perdido ningún avance. El servidor tuvo una breve interrupción al procesar la asignación de la habitación.',
        solution:
          'Espera unos instantes y vuelve a presionar "Guardar Asignación". Todos tus datos siguen resguardados.',
      }
    default:
      return {
        title: 'Interrupción momentánea de conexión',
        message: `Tus datos están protegidos en el formulario. Se presentó una intermitencia de red${serverMessage ? ` (${serverMessage})` : ''}.`,
        solution:
          'Comprueba tu conexión e intenta guardar la asignación nuevamente.',
      }
  }
}

export interface AsignarHuespedModalFormularioProps {
  isOpen: boolean
  onClose: () => void
  room: RoomRow
  onSuccess?: (data: FormularioAsignarHuesped) => void
}

const OPCIONES_METODO_PAGO = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Tarjeta', label: 'Tarjeta' },
  { value: 'Transferencia bancaria', label: 'Transferencia bancaria' },
] as const

const OPCIONES_STATUS = [
  { value: 'Progreso', label: 'Progreso' },
  { value: 'Completa', label: 'Completa' },
  { value: 'Cancelada', label: 'Cancelada' },
] as const

/**
 * Retorna la fecha y hora local actual en formato YYYY-MM-DDTHH:mm
 * requerido por los inputs de tipo "datetime-local".
 */
export function getCurrentLocalDateTime(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const INITIAL_FORM: FormularioAsignarHuesped = {
  numeroHuesped: '',
  fechaEntrada: '',
  fechaSalida: '',
  metodoPago: 'Efectivo',
  deposito: '',
  observacion: '',
  status: 'Progreso',
}

/**
 * Modal principal de Asignación de Huésped.
 * Activado al hacer clic en el diamante de la cama (o botones directos).
 * Contiene el formulario completo de asignación e integra el sub-modal de datos básicos.
 */
export function AsignarHuespedModalFormulario({
  isOpen,
  onClose,
  room,
  onSuccess,
}: AsignarHuespedModalFormularioProps) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <AsignarHuespedDialogContent
          room={room}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </AnimatePresence>,
    document.body
  )
}

function AsignarHuespedDialogContent({
  room,
  onClose,
  onSuccess,
}: {
  room: RoomRow
  onClose: () => void
  onSuccess?: (data: FormularioAsignarHuesped) => void
}) {
  const [formData, setFormData] = useState<FormularioAsignarHuesped>(() => ({
    ...INITIAL_FORM,
    numeroHuesped: room.bed?.capacityPeople ? String(room.bed.capacityPeople) : '2',
    fechaEntrada: getCurrentLocalDateTime(),
  }))
  const [basicData, setBasicData] = useState<DatosBasicosHuesped | null>(null)
  const [allGuests, setAllGuests] = useState<DatosBasicosHuesped[]>([])
  const [registeredPersonIds, setRegisteredPersonIds] = useState<string[]>([])
  const [isRegisteringPersons, setIsRegisteringPersons] = useState(false)
  const [personErrorNotice, setPersonErrorNotice] = useState<PsychologicalNotice | null>(null)
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [selectedPersons, setSelectedPersons] = useState<PersonItem[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false)
  const [isSubmittingStay, setIsSubmittingStay] = useState(false)
  const [stayErrorNotice, setStayErrorNotice] = useState<PsychologicalNotice | null>(null)

  const storePersonIds = useGuestStayStore((state) => state.personIds)
  const setGuestsInStore = useGuestStayStore((state) => state.setGuests)
  const addPersonIdInStore = useGuestStayStore((state) => state.addPersonId)

  const maxGuestsAllowed = Math.max(1, parseInt(formData.numeroHuesped, 10) || 1)

  // Bloquear scroll de fondo mientras el modal de asignación esté abierto
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Cierre por tecla Escape solo si ningún sub-modal está abierto
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isBasicModalOpen || isSearchModalOpen) return
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isBasicModalOpen, isSearchModalOpen, onClose])

  /**
   * Sincroniza los huéspedes seleccionados desde el modal de búsqueda con el estado
   * del formulario y la tienda Zustand.
   */
  const handleConfirmSelectedGuests = (selected: PersonItem[]) => {
    setSelectedPersons(selected)

    // 1. Enviar IDs y datos a la tienda Zustand de huéspedes
    const ids = selected.map((p) => p.id)
    setGuestsInStore(
      selected.map((p) => ({
        id: p.id,
        nombreCompleto: p.name,
        numeroDocumento: p.document_number,
      }))
    )

    // 2. Registrar en la lista local de IDs de huéspedes
    setRegisteredPersonIds((prev) => Array.from(new Set([...prev, ...ids])))

    // 3. Si no había datos básicos, precargar con el primer huésped seleccionado
    if (selected.length > 0 && !basicData) {
      const first = selected[0]
      setBasicData({
        id: first.id,
        nombreCompleto: first.name,
        tipoDocumento: translateDocumentTypeToSpanish(first.document_type),
        numeroDocumento: first.document_number,
        email: first.email || '',
        numeroTelefono: first.phone_number || '',
        fechaNacimiento: first.date_of_birth || '',
        genero: first.gender || '',
        nacionalidad: first.nationality || '',
        roles: first.roles || [],
      })
    }

    // 4. Limpiar error de validación en numeroHuesped
    if (errors.numeroHuesped) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.numeroHuesped
        return next
      })
    }
  }

  /**
   * Remueve una píldora de huésped seleccionado y actualiza la tienda Zustand
   */
  const handleRemoveSelectedPerson = (personId: string) => {
    const next = selectedPersons.filter((p) => p.id !== personId)
    setSelectedPersons(next)
    setGuestsInStore(
      next.map((p) => ({
        id: p.id,
        nombreCompleto: p.name,
        numeroDocumento: p.document_number,
      }))
    )
  }

  /**
   * Actualiza el campo fechaEntrada con la fecha y hora actual exacta
   */
  const handleSetCurrentDateTime = () => {
    setFormData((prev) => ({
      ...prev,
      fechaEntrada: getCurrentLocalDateTime(),
    }))
    if (errors.fechaEntrada) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.fechaEntrada
        return next
      })
    }
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleDropdownChange = (field: 'metodoPago' | 'status', val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  /**
   * Registra un huésped individual en segundo plano con POST /persons.
   * Se ejecuta automáticamente tanto al presionar "Guardar y siguiente" como "Guardar datos básicos".
   */
  const handleRegisterSingleGuest = async (
    guest: DatosBasicosHuesped
  ): Promise<{ success: boolean; id?: string }> => {
    // Si ya cuenta con ID asignado previamente en esta sesión, lo preservamos
    if (guest.id) {
      return { success: true, id: guest.id }
    }

    // 1. Mostrar componente Loader atómico sobre la pantalla
    setIsRegisteringPersons(true)
    setPersonErrorNotice(null)

    const createdBy = getCreatedByFromLocalStorage()
    const docType = mapDocumentTypeToApi(guest.tipoDocumento)
    const docNum = (guest.numeroDocumento || '').trim()
    const guestName = (guest.nombreCompleto || '').trim()
    const guestPhone = (guest.numeroTelefono || '').trim()
    const guestEmail =
      (guest.email || '').trim() || `${docNum || 'huesped'}@huesped.nexora.com`
    const guestDob = (guest.fechaNacimiento || '').trim() || '1990-01-01'
    const guestGender = (guest.genero || 'M').trim()
    const guestNat = (guest.nacionalidad || '').trim() || 'Colombia'
    let selectedRoleId =
      guest.roleId ||
      (guest.roles && guest.roles.length > 0 ? guest.roles[0] : '')

    // Si el rol aún no tiene el ID real o tiene un identificador temporal, resolver el ID real desde /roles
    if (!selectedRoleId || selectedRoleId === 'huesped' || selectedRoleId === 'role-1') {
      try {
        const rolesRes = await api.get<{ id: string; name: string }[]>('/roles', {
          validateStatus: () => true,
        })
        if (rolesRes.status === 200 && Array.isArray(rolesRes.data)) {
          const found =
            rolesRes.data.find(
              (r) =>
                r.name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 'huesped'
            ) ||
            rolesRes.data.find((r) => r.name.trim().toLowerCase().includes('huesped'))
          if (found) {
            selectedRoleId = found.id
          }
        }
      } catch {
        // Fallback en caso de interrupción de red
      }
    }

    // Construcción del payload según especificación
    const payload = {
      document_type: docType,
      document_number: docNum,
      name: guestName,
      phone_number: guestPhone,
      email: guestEmail,
      date_of_birth: guestDob,
      gender: guestGender,
      nationality: guestNat,
      roles: selectedRoleId ? [selectedRoleId] : [], // Utiliza el ID real del rol de huésped para el payload
      created_by: createdBy, // Obtenido del localStorage auth_token email
    }

    try {
      const res = await api.post('/persons', payload, {
        validateStatus: () => true,
      })

      if (res.status === 201) {
        // Status 201: almacenar en array el id de respuesta
        const personId = (res.data?.id as string) || `p-${Date.now()}`
        setRegisteredPersonIds((prev) =>
          prev.includes(personId) ? prev : [...prev, personId]
        )
        addPersonIdInStore(personId)
        setPersonErrorNotice(null)
        setIsRegisteringPersons(false)
        return { success: true, id: personId }
      } else {
        // Status 400, 422, 409, 500 u otros: Mensaje empático y psicológico
        const serverMsg =
          res.data?.message || res.data?.error || res.data?.detail || ''
        const notice = getPsychologicalErrorMessage(
          res.status,
          guestName,
          serverMsg,
          docNum
        )
        setPersonErrorNotice(notice)
        setIsRegisteringPersons(false)
        return { success: false }
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err)
      const notice = getPsychologicalErrorMessage(
        0,
        guestName,
        errMessage,
        docNum
      )
      setPersonErrorNotice(notice)
      setIsRegisteringPersons(false)
      return { success: false }
    }
  }

  const handleSaveBasicData = (
    savedBasicData: DatosBasicosHuesped,
    allGuestsList?: DatosBasicosHuesped[]
  ) => {
    const list =
      allGuestsList && allGuestsList.length > 0 ? allGuestsList : [savedBasicData]
    const primaryGuest = list[0] || savedBasicData
    setBasicData(primaryGuest)
    setAllGuests(list)

    const idsFromGuests = list.map((g) => g.id).filter(Boolean) as string[]
    const combinedIds = Array.from(new Set([...registeredPersonIds, ...idsFromGuests]))
    setRegisteredPersonIds(combinedIds)

    setGuestsInStore(
      list.map((g) => ({
        id: g.id || '',
        nombreCompleto: g.nombreCompleto,
        numeroDocumento: g.numeroDocumento,
      }))
    )

    setFormData((prev) => ({
      ...prev,
      numeroHuesped: prev.numeroHuesped.trim()
        ? prev.numeroHuesped
        : String(list.length),
      datosBasicos: primaryGuest,
      huespedes: list,
      personIds: combinedIds,
    }))

    if (errors.numeroHuesped) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.numeroHuesped
        return next
      })
    }

    setPersonErrorNotice(null)
    setStayErrorNotice(null)
    setIsRegisteringPersons(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.numeroHuesped.trim()) {
      newErrors.numeroHuesped = 'Indica la cantidad o número de huéspedes'
    }
    if (!formData.fechaEntrada) {
      newErrors.fechaEntrada = 'Indica la fecha y hora de entrada'
    }
    if (!formData.fechaSalida) {
      newErrors.fechaSalida = 'Indica la fecha y hora de salida'
    }
    if (!formData.metodoPago) {
      newErrors.metodoPago = 'Selecciona el método de pago'
    }
    if (!formData.status) {
      newErrors.status = 'Selecciona el status'
    }

    // Unir IDs de huéspedes registrados desde Zustand, estado local, seleccionados y datos básicos
    const effectivePersonIds = Array.from(
      new Set([
        ...storePersonIds,
        ...registeredPersonIds,
        ...selectedPersons.map((p) => p.id),
        ...(allGuests.map((g) => g.id).filter(Boolean) as string[]),
        ...(basicData?.id ? [basicData.id] : []),
      ])
    )

    if (effectivePersonIds.length === 0) {
      newErrors.numeroHuesped =
        'Debes completar los datos básicos y registrar al menos a un huésped antes de guardar la asignación.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Formatear fechas a ISO 8601
    const formatIso = (dateStr: string) => {
      try {
        const d = new Date(dateStr)
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
      } catch {
        return new Date().toISOString()
      }
    }

    // Construcción del payload para POST /stays
    const stayPayload = {
      room_id: room.id,
      reservation_id: '',
      person_ids: effectivePersonIds,
      check_in_date: formatIso(formData.fechaEntrada),
      check_out_date: formatIso(formData.fechaSalida),
      payment_method: mapPaymentMethodToApi(formData.metodoPago),
      security_deposit: parseFloat(formData.deposito) || 0.0,
      remarks: (formData.observacion || '').trim(),
      status: mapStatusToApi(formData.status),
      created_by: getCreatedByFromLocalStorage(),
    }

    // 1. Mostrar loader atómico
    setIsSubmittingStay(true)
    setStayErrorNotice(null)

    try {
      const res = await api.post('/stays', stayPayload, {
        validateStatus: () => true,
      })

      if (res.status === 200 || res.status === 201) {
        setIsSubmittedSuccess(true)
        onSuccess?.({
          ...formData,
          datosBasicos: basicData ?? undefined,
          huespedes: allGuests.length > 0 ? allGuests : (basicData ? [basicData] : undefined),
          personIds: effectivePersonIds,
        })
      } else {
        const serverMsg =
          res.data?.message || res.data?.error || res.data?.detail || ''
        const notice = getPsychologicalStayErrorMessage(res.status, serverMsg)
        setStayErrorNotice(notice)
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err)
      const notice = getPsychologicalStayErrorMessage(0, errMessage)
      setStayErrorNotice(notice)
    } finally {
      setIsSubmittingStay(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop con desenfoque de cristal oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              className="fixed inset-0 bg-stone-950/75 backdrop-blur-md cursor-pointer"
              aria-hidden="true"
            />

            {/* Modal Container */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-asignar-title"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 290 }}
              onClick={(e) => e.stopPropagation()}
              className="relative my-auto w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-line/70 bg-panel/95 p-5 sm:p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 z-10"
            >
              {/* Resplandor decorativo de cabecera */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 size-80 rounded-full bg-primary/20 blur-3xl"
              />

              {/* Botón de cierre (X) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="absolute top-5 right-5 z-30 grid size-8.5 place-items-center rounded-full border border-line bg-canvas/80 text-ink-muted transition-all hover:bg-panel hover:text-ink hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer shadow-2xs"
                title="Cerrar modal de asignación (Esc)"
                aria-label="Cerrar modal de asignación"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 pointer-events-none">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Cabecera del Modal */}
              <div className="relative mb-6 space-y-2 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    <span className="size-2 rotate-45 rounded-xs bg-primary shadow-xs" />
                    Asignación · Habitación {room.number}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {room.building.name || 'Edificio principal'} · Piso {room.floor}
                  </span>
                </div>

                <h2
                  id="modal-asignar-title"
                  className="text-2xl sm:text-3xl font-black tracking-tight text-ink"
                >
                  Asignar Huésped
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Completa los datos de la estancia para registrar formalmente al huésped en la habitación.
                </p>
              </div>

              {/* Banner de Éxito cuando se guarda */}
              {isSubmittedSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-4"
                >
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-6">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-ink">¡Huésped asignado con éxito!</h3>
                    <p className="text-xs text-ink-muted max-w-md mx-auto">
                      Se ha registrado la estancia del huésped{' '}
                      <span className="font-semibold text-ink">
                        {basicData?.nombreCompleto || formData.numeroHuesped}
                      </span>{' '}
                      para la Habitación {room.number}.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:brightness-110 active:scale-95"
                    >
                      Aceptar y continuar
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Formulario */
                <form onSubmit={handleSubmit} className="relative space-y-5">
                  {/* SECCIÓN 1: CANTIDAD DE HUÉSPEDES, BOTÓN BUSCAR Y BOTÓN COMPLETAR DATOS BÁSICOS */}
                  <div className="rounded-2xl border border-line/60 bg-canvas/40 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2.5">
                      <div className="flex-1">
                        <Input
                          label="Cantidad de huéspedes"
                          name="numeroHuesped"
                          value={formData.numeroHuesped}
                          onChange={handleInputChange}
                          placeholder="Ej. 2, 4, 6 personas"
                          error={errors.numeroHuesped}
                          required
                          icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          }
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botón Buscar Huéspedes con FontAwesome */}
                        <button
                          type="button"
                          onClick={() => setIsSearchModalOpen(true)}
                          className="inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-canvas/80 px-3.5 text-xs font-bold text-ink transition-all hover:border-primary/50 hover:bg-panel hover:text-primary active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                          title="Buscar y seleccionar huéspedes registrados en el sistema (GET /persons)"
                        >
                          <FontAwesomeIcon icon={faMagnifyingGlass} className="size-3.5 text-primary" />
                          <span>Buscar huésped</span>
                        </button>

                        {/* Botón Completar Datos Básicos al lado derecho */}
                        <button
                          type="button"
                          onClick={() => setIsBasicModalOpen(true)}
                          className="inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3.5 text-xs font-bold text-primary shadow-xs transition-all hover:border-primary/70 hover:bg-primary/20 active:scale-95 cursor-pointer whitespace-nowrap"
                          title="Abrir formulario para registrar datos de los huéspedes"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M8 7h8" />
                            <path d="M8 11h8" />
                            <path d="M8 15h5" />
                          </svg>
                          <span>
                            {basicData
                              ? allGuests.length > 1
                                ? `Fichas (${allGuests.length} personas)`
                                : 'Editar datos'
                              : 'Completar datos'}
                          </span>
                          {basicData && (
                            <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-400/30" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Píldoras con los nombres de los huéspedes seleccionados del sistema */}
                    {selectedPersons.length > 0 && (
                      <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-ink-muted">
                          <span className="font-semibold text-ink">
                            Huéspedes vinculados ({selectedPersons.length} de {maxGuestsAllowed} permitidos):
                          </span>
                          {selectedPersons.length === maxGuestsAllowed && (
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              ✓ Capacidad completada
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedPersons.map((p) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-panel px-3 py-1 text-xs font-semibold text-ink shadow-xs backdrop-blur-md transition-all hover:border-primary"
                            >
                              <span className="size-1.5 rounded-full bg-primary" />
                              <span>{p.name}</span>
                              <span className="text-[10px] text-ink-muted font-mono">
                                ({p.document_number})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSelectedPerson(p.id)}
                                className="ml-1 grid size-4 place-items-center rounded-full text-ink-muted transition-colors hover:bg-rose-500/20 hover:text-rose-600 cursor-pointer"
                                title={`Quitar a ${p.name}`}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3">
                                  <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Aviso de error psicológico y constructivo si ocurrió alguna situación en la API */}
                    {personErrorNotice && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3.5 space-y-1.5 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-500 font-bold text-xs mt-0.5">
                            ℹ
                          </span>
                          <div className="space-y-1">
                            <h4 className="font-bold text-amber-600 dark:text-amber-300">
                              {personErrorNotice.title}
                            </h4>
                            <p className="text-ink-muted leading-relaxed">
                              {personErrorNotice.message}
                            </p>
                            {personErrorNotice.solution && (
                              <p className="text-amber-700 dark:text-amber-200/90 font-medium">
                                💡 {personErrorNotice.solution}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Resumen si ya se completaron los datos básicos */}
                    {basicData && (
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-ink">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-600 font-bold text-[10px]">
                            ✓
                          </span>
                          <div className="flex flex-col truncate">
                            <span className="truncate">
                              <strong className="font-semibold">{basicData.nombreCompleto}</strong>{' '}
                              <span className="text-ink-muted">
                                ({basicData.tipoDocumento}: {basicData.numeroDocumento})
                              </span>
                              {basicData.id && (
                                <span className="ml-2 inline-flex items-center rounded-md bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  ID: {basicData.id}
                                </span>
                              )}
                            </span>
                            {allGuests.length > 1 && (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                {allGuests.length} personas registradas (Titular + {allGuests.length - 1} acompañante{allGuests.length > 2 ? 's' : ''})
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsBasicModalOpen(true)}
                          className="shrink-0 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Ver / Editar fichas
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SECCIÓN 2: FECHAS DE ENTRADA Y SALIDA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="input-fecha-entrada"
                          className="block text-sm font-medium text-ink"
                        >
                          Fecha de entrada (Fecha y hora){' '}
                          <span aria-hidden="true" className="ml-0.5 text-danger">
                            *
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={handleSetCurrentDateTime}
                          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                          title="Fijar con la fecha y hora actual exacta"
                        >
                          Ahora
                        </button>
                      </div>
                      <Input
                        id="input-fecha-entrada"
                        type="datetime-local"
                        name="fechaEntrada"
                        value={formData.fechaEntrada}
                        onChange={handleInputChange}
                        error={errors.fechaEntrada}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Fecha de salida (Fecha y hora)"
                        type="datetime-local"
                        name="fechaSalida"
                        value={formData.fechaSalida}
                        onChange={handleInputChange}
                        error={errors.fechaSalida}
                        required
                      />
                    </div>
                  </div>

                  {/* SECCIÓN 3: MÉTODO DE PAGO, DEPÓSITO Y STATUS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Método de pago */}
                    <div>
                      <RecursosDropdown
                        label="Método de pago"
                        value={formData.metodoPago}
                        onChange={(val) => handleDropdownChange('metodoPago', val)}
                        options={OPCIONES_METODO_PAGO}
                        placeholder="Seleccionar método…"
                        error={errors.metodoPago}
                        required
                      />
                    </div>

                    {/* Depósito */}
                    <div>
                      <Input
                        label="Depósito"
                        type="number"
                        step="0.01"
                        name="deposito"
                        value={formData.deposito}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        icon={<span className="text-xs font-bold text-ink-muted">$</span>}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <RecursosDropdown
                        label="Status"
                        value={formData.status}
                        onChange={(val) => handleDropdownChange('status', val)}
                        options={OPCIONES_STATUS}
                        placeholder="Seleccionar status…"
                        error={errors.status}
                        required
                      />
                    </div>
                  </div>

                  {/* SECCIÓN 4: OBSERVACIÓN */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="observacion-field"
                      className="block text-sm font-medium text-ink"
                    >
                      Observación
                    </label>
                    <textarea
                      id="observacion-field"
                      name="observacion"
                      rows={3}
                      value={formData.observacion}
                      onChange={handleInputChange}
                      placeholder="Notas adicionales sobre la reserva, preferencias del huésped o requerimientos especiales…"
                      className="w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-sm text-ink shadow-xs outline-none transition-colors placeholder:text-ink-soft hover:border-ink-soft focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                    {/* Aviso empático/psicológico de error al enviar la estancia */}
                    {stayErrorNotice && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 text-xs"
                      >
                        <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <span>{stayErrorNotice.title}</span>
                        </div>
                        <p className="text-ink-muted leading-relaxed">
                          {stayErrorNotice.message}
                        </p>
                        {stayErrorNotice.solution && (
                          <p className="text-amber-700 dark:text-amber-300 font-medium">
                            💡 {stayErrorNotice.solution}
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* FOOTER ACTIONS */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-line/60">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmittingStay}
                        className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-canvas/80 px-4 py-2.5 text-xs font-semibold text-ink-muted transition-all hover:border-primary/40 hover:bg-panel hover:text-ink active:scale-95 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingStay}
                        className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{isSubmittingStay ? 'Guardando asignación…' : 'Guardar Asignación'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>

        {/* Sub-modal: Buscar y seleccionar huéspedes registrados en el sistema (GET /persons) */}
        <BuscarHuespedesModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          maxAllowed={maxGuestsAllowed}
          selectedGuests={selectedPersons}
          onConfirmSelection={handleConfirmSelectedGuests}
          roomNumber={room.number}
        />

        {/* Sub-modal dentro del modal: Registrar datos de los huéspedes */}
        <AsignarHuespedDatosBasicosModal
          isOpen={isBasicModalOpen}
          onClose={() => setIsBasicModalOpen(false)}
          initialData={basicData ?? undefined}
          initialGuests={allGuests.length > 0 ? allGuests : undefined}
          onSave={handleSaveBasicData}
          onRegisterGuest={handleRegisterSingleGuest}
          numeroHuespedes={formData.numeroHuesped || room.bed?.capacityPeople || 2}
          roomNumber={room.number}
          errorMessage={personErrorNotice}
        />

        {/* Componente Loader durante el registro en segundo plano con POST /persons */}
        <Loader
          overlay
          visible={isRegisteringPersons}
          label="Registrando datos del huésped en el sistema…"
          size={36}
        />

        {/* Componente Loader durante el registro de la estancia con POST /stays */}
        <Loader
          overlay
          visible={isSubmittingStay}
          label="Guardando asignación de la habitación en el sistema…"
          size={40}
        />
    </>
  )
}
