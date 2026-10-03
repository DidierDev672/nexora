import type { GuestDisplayInfo, ReceptionStay } from './habitacion-stay'
import type { RoomRow } from './habitacion-lista'

/**
 * Modelo de Dominio que representa una habitación en estado "Ocupada",
 * bloqueando cualquier intento de registrar o asignar más huéspedes.
 */
export interface HabitacionOcupadaModel {
  roomId: string
  roomNumber: string | number
  status: 'ocupada'
  statusLabel: 'OCUPADA'
  isAssignable: false
  blockingReason: string
  stayId: string
  checkInDate: string
  checkOutDate: string
  paymentMethod: string
  securityDeposit: number
  guestsCount: number
  guests: GuestDisplayInfo[]
  primaryGuestName: string
}

/**
 * Constructor de fábrica del modelo HabitacionOcupadaModel
 */
export function buildHabitacionOcupadaModel(
  room: RoomRow,
  stay: ReceptionStay,
  guests: GuestDisplayInfo[]
): HabitacionOcupadaModel {
  return {
    roomId: room.id,
    roomNumber: room.number,
    status: 'ocupada',
    statusLabel: 'OCUPADA',
    isAssignable: false,
    blockingReason:
      'La habitación cuenta con una estancia activa registrada en el sistema. No se permite asignar más huéspedes.',
    stayId: stay.id,
    checkInDate: stay.check_in_date,
    checkOutDate: stay.check_out_date,
    paymentMethod: stay.payment_method,
    securityDeposit: stay.security_deposit,
    guestsCount: guests.length || (stay.person_ids ? stay.person_ids.length : 1),
    guests,
    primaryGuestName: guests[0]?.name || 'Huésped activo',
  }
}
