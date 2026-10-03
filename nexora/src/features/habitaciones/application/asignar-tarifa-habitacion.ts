import type {
  RoomTariffFeedback,
  RoomTariffPayload,
  RoomTariffRepository,
} from '../domain/room-tariff'

export interface AsignarTarifaHabitacionParams {
  payload: RoomTariffPayload
  tarifaNombre?: string
  numeroHabitacion?: string
}

export function buildTariffPsychologicalFeedback(params: {
  ok: boolean
  status: number
  tarifaNombre?: string
  numeroHabitacion?: string
}): RoomTariffFeedback {
  const { ok, status, tarifaNombre, numeroHabitacion } = params
  const tarifaDisplay = tarifaNombre ? `«${tarifaNombre}»` : 'seleccionada'
  const habitacionDisplay = numeroHabitacion
    ? `la habitación ${numeroHabitacion}`
    : 'la habitación'

  if (ok) {
    return {
      type: 'success',
      status: 201,
      title: '¡Estrategia de precios sincronizada con éxito!',
      message: `La tarifa ${tarifaDisplay} ha quedado vinculada y activa para ${habitacionDisplay}. Cada noche vendida ahora operará exactamente con el valor y condiciones que planificaste, blindando la rentabilidad de tu hotel.`,
      subtext:
        'Tus recepcionistas y el motor de reservas ya pueden cotizar y asignar esta habitación con total confianza y fluidez.',
    }
  }

  return {
    type: 'error',
    status,
    title: 'Aviso: No se pudo vincular la tarifa en este momento',
    message: `¡Tranquilo(a)! ${numeroHabitacion ? `La habitación ${numeroHabitacion}` : 'La habitación'} se registró y guardó de forma completamente segura en tu inventario; sin embargo, se presentó un inconveniente al intentar enlazar la tarifa ${tarifaDisplay}${status ? ` (código ${status})` : ''}.`,
    subtext:
      'No te preocupes, no perdiste ningún avance: tus datos están intactos y puedes asociar o modificar su tarifa en cualquier momento desde la sección de tarifas o el detalle de habitaciones.',
  }
}

export const AsignarTarifaHabitacion =
  (repository: RoomTariffRepository) =>
  async (params: AsignarTarifaHabitacionParams): Promise<RoomTariffFeedback> => {
    const result = await repository.assignTariff(params.payload)
    return buildTariffPsychologicalFeedback({
      ok: result.ok,
      status: result.status,
      tarifaNombre: params.tarifaNombre,
      numeroHabitacion: params.numeroHabitacion,
    })
  }
