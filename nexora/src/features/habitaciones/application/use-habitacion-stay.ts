import { useState, useEffect, useCallback } from 'react'
import { api } from '../../../lib/api'
import { validateStatusCode } from '../../../shared/lib/status-code-validator'
import {
  type ReceptionStay,
  type PersonApiResponse,
  type GuestDisplayInfo,
  type PsychologicalStayNotice,
  translateDocumentTypeToSpanish,
  translateGenderToSpanish,
} from '../domain/habitacion-stay'
import { useGuestStayStore } from './use-guest-stay-store'

export interface UseHabitacionStayResult {
  stay: ReceptionStay | null
  guests: GuestDisplayInfo[]
  isLoading: boolean
  hasActiveStay: boolean
  notice: PsychologicalStayNotice | null
  error: PsychologicalStayNotice | null
  guestValidationMessage: string | null
  refetch: () => Promise<void>
}

/**
 * Mensajes personalizados con enfoque psicológico para los distintos códigos HTTP
 * al consultar la ocupación de la estancia y los huéspedes.
 */
function getStayPsychologicalNotice(
  status: number,
  roomNumber?: string | number,
  serverMessage?: string
): PsychologicalStayNotice {
  const roomLabel = roomNumber ? `Habitación ${roomNumber}` : 'esta habitación'

  switch (status) {
    case 200:
      return {
        type: 'occupied',
        statusCode: 200,
        title: `${roomLabel} actualmente ocupada`,
        message: `Esta habitación cuenta con una estancia activa registrada en Nexora. Puedes consultar la ficha detallada de los huéspedes en el cuadro decorativo de la pared derecha.`,
        solution: `Si necesitas asignar nuevos huéspedes, finaliza la estancia actual o selecciona otra habitación disponible en el catálogo.`,
      }

    case 404:
      return {
        type: 'available',
        statusCode: 404,
        title: `${roomLabel} completamente libre y lista`,
        message: `¡Excelente noticia! No se registran estancias activas para ${roomLabel}. Se encuentra 100% disponible para recibir y deleitar a nuevos huéspedes con total tranquilidad.`,
        solution: `Puedes proceder a registrar la asignación de estancia haciendo clic en el cojín de la cama.`,
      }

    case 400:
      return {
        type: 'warning',
        statusCode: 400,
        title: `Verificación de ${roomLabel} pendiente`,
        message: `No te preocupes, el inventario general sigue seguro. La consulta de estancia no pudo procesar los parámetros solicitados.`,
        solution: `Comprueba que la habitación se encuentre correctamente seleccionada desde el catálogo general.`,
      }

    case 500:
    case 502:
    case 503:
      return {
        type: 'error',
        statusCode: status,
        title: `Pausa momentánea en el servidor central`,
        message: `Mantén la calma, no hay pérdida de información. El servidor central tuvo una breve pausa al verificar la ocupación de ${roomLabel}.`,
        solution: `Espera un momento y pulsa "Reintentar verificación". Todo tu trabajo continúa a salvo.`,
      }

    default:
      return {
        type: 'error',
        statusCode: status,
        title: `Intermitencia de red temporal`,
        message: `Tus datos están protegidos en pantalla. Hubo una intermitencia de conexión al verificar el estado de la estancia${serverMessage ? ` (${serverMessage})` : ''}.`,
        solution: `Verifica tu conexión y presiona el botón de recarga con tranquilidad.`,
      }
  }
}

/**
 * Hook personalizado para verificar si una habitación ya cuenta con huéspedes
 * mediante GET /stay/reception/{room_id} y obtener la información de cada persona
 * mediante el endpoint GET /stays_person/{stay_id}, validando los status code
 * con psicología del usuario a través de validateStatusCode.
 */
export function useHabitacionStay(
  roomId?: string,
  roomNumber?: string | number
): UseHabitacionStayResult {
  const [stay, setStay] = useState<ReceptionStay | null>(null)
  const [guests, setGuests] = useState<GuestDisplayInfo[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasActiveStay, setHasActiveStay] = useState<boolean>(false)
  const [notice, setNotice] = useState<PsychologicalStayNotice | null>(null)
  const [error, setError] = useState<PsychologicalStayNotice | null>(null)
  const [guestValidationMessage, setGuestValidationMessage] = useState<string | null>(null)

  const setGuestsInStore = useGuestStayStore((state) => state.setGuests)

  const fetchStayAndGuests = useCallback(async () => {
    if (!roomId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setGuestValidationMessage(null)

    try {
      // 1. Consultar estado de estancia en la recepción: GET /stay/reception/{room_id}
      const stayResponse = await api.get<ReceptionStay>(
        `/stay/reception/${encodeURIComponent(roomId)}`,
        { validateStatus: () => true }
      )

      if (stayResponse.status === 200 && stayResponse.data) {
        const stayData = stayResponse.data
        setStay(stayData)
        setHasActiveStay(true)

        const psychNotice = getStayPsychologicalNotice(200, roomNumber)
        setNotice(psychNotice)

        // 2. Consultar huéspedes asociados a la estancia: GET /stays_person/{stay_id}
        const staysPersonRes = await api.get<PersonApiResponse[]>(
          `/stays_person/${encodeURIComponent(stayData.id)}`,
          { validateStatus: () => true }
        )

        // Validar el status code utilizando validateStatusCode
        const personStatusValidation = validateStatusCode(staysPersonRes.status)

        // Si status code es 200: procesamos la lista de huéspedes (sin mensaje de error)
        if (staysPersonRes.status === 200 && staysPersonRes.data) {
          const rawGuests: PersonApiResponse[] = Array.isArray(staysPersonRes.data)
            ? staysPersonRes.data
            : Array.isArray((staysPersonRes.data as unknown as { data?: PersonApiResponse[] })?.data)
            ? (staysPersonRes.data as unknown as { data: PersonApiResponse[] }).data
            : typeof staysPersonRes.data === 'object' && staysPersonRes.data !== null && 'id' in staysPersonRes.data
            ? [staysPersonRes.data as unknown as PersonApiResponse]
            : []

          const mappedGuests: GuestDisplayInfo[] = rawGuests.map((p) => ({
            id: p.id,
            name: p.name || 'Huésped sin nombre',
            documentTypeSpanish: translateDocumentTypeToSpanish(p.document_type),
            documentNumber: p.document_number || 'S/N',
            genderSpanish: translateGenderToSpanish(p.gender),
            phoneNumber: p.phone_number || 'No especificado',
            email: p.email || 'Sin correo',
            dateOfBirth: p.date_of_birth,
            nationality: p.nationality,
            roles: p.roles,
          }))

          setGuests(mappedGuests)
          setGuestValidationMessage(null)

          // Sincronizar con el store de Zustand para que otros componentes tengan los nombres e IDs
          setGuestsInStore(
            mappedGuests.map((g) => ({
              id: g.id,
              nombreCompleto: g.name,
              numeroDocumento: g.documentNumber,
            }))
          )
        } else {
          // Si status code es diferente de 200: mostramos el mensaje con psicología
          setGuests([])
          const validationMsg =
            personStatusValidation.message ||
            'No se pudo obtener la información de los huéspedes en este momento.'

          setGuestValidationMessage(validationMsg)

          setError({
            type: personStatusValidation.category === 'warning' ? 'warning' : 'error',
            statusCode: staysPersonRes.status,
            title:
              personStatusValidation.title ||
              `Aviso al consultar huéspedes (${staysPersonRes.status})`,
            message: validationMsg,
            solution:
              'La estancia continúa activa en el sistema. Puedes reintentar la consulta en unos instantes.',
          })
        }
      } else if (stayResponse.status === 404) {
        // 404 significa que la habitación está disponible y sin huéspedes
        setStay(null)
        setGuests([])
        setHasActiveStay(false)
        setGuestValidationMessage(null)
        setNotice(getStayPsychologicalNotice(404, roomNumber))
      } else {
        // 400, 500 u otros códigos de error en la estancia general
        const stayValidation = validateStatusCode(stayResponse.status)
        const errorNotice: PsychologicalStayNotice = {
          type: stayValidation.category === 'warning' ? 'warning' : 'error',
          statusCode: stayResponse.status,
          title: stayValidation.title || `Aviso (${stayResponse.status})`,
          message:
            stayValidation.message ||
            'Ocurrió un contratiempo al verificar la ocupación de la habitación.',
          solution: 'Tus datos están protegidos. Intenta recargar la consulta.',
        }
        setStay(null)
        setGuests([])
        setHasActiveStay(false)
        setGuestValidationMessage(null)
        setError(errorNotice)
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      const errorNotice = getStayPsychologicalNotice(0, roomNumber, errMsg)
      setStay(null)
      setGuests([])
      setHasActiveStay(false)
      setGuestValidationMessage(null)
      setError(errorNotice)
    } finally {
      setIsLoading(false)
    }
  }, [roomId, roomNumber, setGuestsInStore])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchStayAndGuests()
  }, [fetchStayAndGuests])

  return {
    stay,
    guests,
    isLoading,
    hasActiveStay,
    notice,
    error,
    guestValidationMessage,
    refetch: fetchStayAndGuests,
  }
}

