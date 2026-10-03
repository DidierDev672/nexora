import { useState } from 'react'
import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'

export function getEmailFromAuthToken(): string {
  try {
    const raw = window.localStorage.getItem('auth_token')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        if (parsed && typeof parsed.email === 'string' && parsed.email.trim()) {
          return parsed.email.trim()
        }
      } catch {
        // En caso de que sea un token JWT en string
        const parts = raw.split('.')
        if (parts.length >= 2) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
          const padLength = (4 - (base64.length % 4)) % 4
          const padded = base64.padEnd(base64.length + padLength, '=')
          const decoded = decodeURIComponent(
            atob(padded)
              .split('')
              .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
              .join(''),
          )
          const payload = JSON.parse(decoded) as Record<string, unknown>
          if (payload && typeof payload.email === 'string' && payload.email.trim()) {
            return payload.email.trim()
          }
        }
      }
    }
  } catch {
    // Si localStorage no está disponible
  }
  return 'admin@nexora.com'
}

export interface AplicarTarifaParams {
  roomId: string
  rateId: string
  tarifaNombre?: string
  numeroHabitacion?: string
}

export interface AplicarTarifaFeedback {
  ok: boolean
  status: number
  title: string
  message: string
}

export function useAplicarTarifa() {
  const [isApplying, setIsApplying] = useState(false)
  const [feedback, setFeedback] = useState<AplicarTarifaFeedback | null>(null)

  const aplicarTarifa = async (params: AplicarTarifaParams): Promise<AplicarTarifaFeedback> => {
    setIsApplying(true)
    setFeedback(null)

    const createdBy = getEmailFromAuthToken()
    const payload = {
      room_id: params.roomId,
      rate_id: params.rateId,
      is_default: true,
      status: 'active',
      created_by: createdBy,
    }

    const tarifaLabel = params.tarifaNombre ? `«${params.tarifaNombre}»` : 'seleccionada'
    const habitacionLabel = params.numeroHabitacion
      ? `la habitación ${params.numeroHabitacion}`
      : 'esta habitación'

    try {
      const response = await api.post('/room_tariffs', payload, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: (status) => status === 201,
      })

      const successFeedback: AplicarTarifaFeedback = {
        ok: true,
        status: response.status,
        title: '¡Tarifa vinculada con éxito!',
        message: `¡Quedó genial! La tarifa ${tarifaLabel} se aplicó correctamente a ${habitacionLabel}. A partir de ahora tus cotizaciones y reservas operarán de forma transparente y optimizada con este valor.`,
      }
      setFeedback(successFeedback)
      setIsApplying(false)
      return successFeedback
    } catch (error) {
      let status = 0
      if (isAxiosError(error)) {
        status = error.response?.status ?? 0
      }

      let message = `Se presentó un inconveniente al intentar aplicar la tarifa ${tarifaLabel} a ${habitacionLabel}. No te preocupes: tus datos no se han perdido y puedes intentarlo de nuevo.`

      if (status === 400) {
        message = `Se presentó un error (código 400): los datos para asociar la tarifa ${tarifaLabel} están incompletos o son incompatibles con ${habitacionLabel}. Por favor verifica la información.`
      } else if (status === 422) {
        message = `Se presentó un error (código 422): la tarifa ${tarifaLabel} no cumple con las condiciones requeridas para ${habitacionLabel}. Asegúrate de que ambas estén activas.`
      } else if (status === 409) {
        message = `Se presentó un aviso (código 409): la tarifa ${tarifaLabel} ya se encuentra aplicada actualmente a ${habitacionLabel}. No es necesario volver a registrarla.`
      } else if (status === 500) {
        message = `Se presentó un error en el servidor (código 500) al intentar aplicar la tarifa. Tranquilo(a), tus habitaciones e inventario continúan totalmente a salvo. Vuelve a intentarlo en unos instantes.`
      }

      const errorFeedback: AplicarTarifaFeedback = {
        ok: false,
        status,
        title: 'No se pudo aplicar la tarifa',
        message,
      }
      setFeedback(errorFeedback)
      setIsApplying(false)
      return errorFeedback
    }
  }

  const clearFeedback = () => setFeedback(null)

  return {
    isApplying,
    feedback,
    aplicarTarifa,
    clearFeedback,
  }
}
