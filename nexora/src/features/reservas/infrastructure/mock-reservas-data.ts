import type { ReservaApiDto } from '../domain/reserva-list-types'

/**
 * Datos simulados representativos que replican la estructura exacta del backend:
 * GET /reserve -> ReservaApiDto[]
 */
export const MOCK_RESERVAS_DATA: ReservaApiDto[] = [
  {
    id: 'res_9a8b1c2d3e4f5001',
    room_id: 'room_suite_101',
    person_id: 'per_carlos_mendoza',
    check_in_date: '2026-10-24T15:00:00Z',
    check_out_date: '2026-10-27T12:00:00Z',
    number_of_guests: 2,
    state: 'confirmed',
    total_price: 540000.0,
    created_by: 'recepcion@nexora.com',
    created_at: '2026-10-22T10:00:00Z',
    updated_at: '2026-10-22T10:00:00Z',
  },
  {
    id: 'res_9a8b1c2d3e4f5002',
    room_id: 'room_deluxe_204',
    person_id: 'per_valentina_rios',
    check_in_date: '2026-10-25T14:00:00Z',
    check_out_date: '2026-10-28T11:00:00Z',
    number_of_guests: 3,
    state: 'pending',
    total_price: 720000.0,
    created_by: 'reservas@nexora.com',
    created_at: '2026-10-22T11:30:00Z',
    updated_at: '2026-10-22T11:30:00Z',
  },
  {
    id: 'res_9a8b1c2d3e4f5003',
    room_id: 'room_premium_305',
    person_id: 'per_andres_salazar',
    check_in_date: '2026-10-22T12:00:00Z',
    check_out_date: '2026-10-24T10:00:00Z',
    number_of_guests: 1,
    state: 'in progress',
    total_price: 380000.0,
    created_by: 'recepcion@nexora.com',
    created_at: '2026-10-21T09:15:00Z',
    updated_at: '2026-10-22T12:00:00Z',
  },
  {
    id: 'res_9a8b1c2d3e4f5004',
    room_id: 'room_stand_108',
    person_id: 'per_mariana_gomez',
    check_in_date: '2026-10-20T15:00:00Z',
    check_out_date: '2026-10-22T11:00:00Z',
    number_of_guests: 2,
    state: 'completed',
    total_price: 320000.0,
    created_by: 'admin@nexora.com',
    created_at: '2026-10-18T16:40:00Z',
    updated_at: '2026-10-22T11:00:00Z',
  },
  {
    id: 'res_9a8b1c2d3e4f5005',
    room_id: 'room_suite_401',
    person_id: 'per_felipe_torres',
    check_in_date: '2026-11-01T15:00:00Z',
    check_out_date: '2026-11-05T12:00:00Z',
    number_of_guests: 4,
    state: 'confirmed',
    total_price: 1150000.0,
    created_by: 'recepcion@nexora.com',
    created_at: '2026-10-22T14:20:00Z',
    updated_at: '2026-10-22T14:20:00Z',
  },
  {
    id: 'res_9a8b1c2d3e4f5006',
    room_id: 'room_deluxe_202',
    person_id: 'per_camila_duque',
    check_in_date: '2026-10-29T15:00:00Z',
    check_out_date: '2026-10-31T11:00:00Z',
    number_of_guests: 2,
    state: 'canceled',
    total_price: 460000.0,
    created_by: 'ventas@nexora.com',
    created_at: '2026-10-19T08:00:00Z',
    updated_at: '2026-10-20T17:45:00Z',
  },
  {
    id: 'res_9a8b1c2d3e4f5007',
    room_id: 'room_stand_105',
    person_id: 'per_mateo_herrera',
    check_in_date: '2026-11-10T14:00:00Z',
    check_out_date: '2026-11-12T12:00:00Z',
    number_of_guests: 1,
    state: 'pending',
    total_price: 290000.0,
    created_by: 'recepcion@nexora.com',
    created_at: '2026-10-22T15:10:00Z',
    updated_at: '2026-10-22T15:10:00Z',
  },
  {
    id: 'res_9a8b1c2d3e4f5008',
    room_id: 'room_suite_302',
    person_id: 'per_lucia_castro',
    check_in_date: '2026-10-23T15:00:00Z',
    check_out_date: '2026-10-26T12:00:00Z',
    number_of_guests: 2,
    state: 'confirmed',
    total_price: 680000.0,
    created_by: 'recepcion@nexora.com',
    created_at: '2026-10-22T09:00:00Z',
    updated_at: '2026-10-22T09:00:00Z',
  },
]

/**
 * Catálogo de resolución humana para habitaciones simuladas.
 * Evita estrictamente mostrar identificadores crudos (id/room_id) al usuario.
 */
export const MOCK_ROOM_CATALOG: Record<string, { name: string; floor: number }> = {
  room_suite_101: { name: 'Habitación 101 · Suite Presidencial', floor: 1 },
  room_deluxe_204: { name: 'Habitación 204 · Deluxe Vista Jardín', floor: 2 },
  room_premium_305: { name: 'Habitación 305 · Premium Ejecutiva', floor: 3 },
  room_stand_108: { name: 'Habitación 108 · Estándar Clásica', floor: 1 },
  room_suite_401: { name: 'Habitación 401 · Suite Panorámica', floor: 4 },
  room_deluxe_202: { name: 'Habitación 202 · Deluxe Balcón', floor: 2 },
  room_stand_105: { name: 'Habitación 105 · Estándar Doble', floor: 1 },
  room_suite_302: { name: 'Habitación 302 · Suite Jacuzzi', floor: 3 },
}

/**
 * Catálogo de resolución humana para huéspedes simulados.
 * Evita estrictamente mostrar identificadores crudos (person_id) al usuario.
 */
export const MOCK_PERSON_CATALOG: Record<string, string> = {
  per_carlos_mendoza: 'Carlos Mendoza Silva',
  per_valentina_rios: 'Valentina Ríos Gómez',
  per_andres_salazar: 'Andrés Salazar Quintero',
  per_mariana_gomez: 'Mariana Gómez Restrepo',
  per_felipe_torres: 'Felipe Torres Cárdenas',
  per_camila_duque: 'Camila Duque Morales',
  per_mateo_herrera: 'Mateo Herrera Vargas',
  per_lucia_castro: 'Lucía Castro Montoya',
}
