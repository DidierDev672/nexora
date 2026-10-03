import type { DashboardKpi, OccupancyPoint, Reservation } from '../domain/dashboard-types'

export const MOCK_KPIS: readonly DashboardKpi[] = [
  { id: 'rooms-active', label: 'Habitaciones activas', value: '128', change: 4.2, icon: 'rooms' },
  { id: 'guests-active', label: 'Huéspedes activos', value: '342', change: 8.1, icon: 'guests' },
  { id: 'sedes-active', label: 'Sedes activas', value: '6', change: 16.7, icon: 'sedes' },
  { id: 'occupancy', label: 'Ocupación media', value: '78%', change: -2.4, icon: 'occupancy' },
] as const

export const MOCK_OCCUPANCY: readonly OccupancyPoint[] = [
  { month: 'Ene', occupancy: 61 },
  { month: 'Feb', occupancy: 65 },
  { month: 'Mar', occupancy: 70 },
  { month: 'Abr', occupancy: 72 },
  { month: 'May', occupancy: 68 },
  { month: 'Jun', occupancy: 75 },
  { month: 'Jul', occupancy: 80 },
  { month: 'Ago', occupancy: 83 },
  { month: 'Sep', occupancy: 86 },
  { month: 'Oct', occupancy: 84 },
  { month: 'Nov', occupancy: 89 },
  { month: 'Dic', occupancy: 92 },
] as const

export const MOCK_RESERVATIONS: readonly Reservation[] = [
  { id: 'r-01', guest: 'Sofía Ramírez', room: '214', sede: 'Centro', status: 'checkIn', time: '09:40' },
  { id: 'r-02', guest: 'Mateo García', room: '108', sede: 'Norte', status: 'confirmada', time: '10:15' },
  { id: 'r-03', guest: 'Valentina Torres', room: '502', sede: 'Centro', status: 'checkOut', time: '11:02' },
  { id: 'r-04', guest: 'Julián Castro', room: '301', sede: 'Sur', status: 'confirmada', time: '11:30' },
  { id: 'r-05', guest: 'Camila Rojas', room: '118', sede: 'Norte', status: 'cancelada', time: '12:05' },
  { id: 'r-06', guest: 'Andrés Peña', room: '226', sede: 'Centro', status: 'checkIn', time: '12:48' },
  { id: 'r-07', guest: 'Gabriela Vidal', room: '407', sede: 'Este', status: 'confirmada', time: '13:20' },
  { id: 'r-08', guest: 'Nicolás Duarte', room: '334', sede: 'Oeste', status: 'checkOut', time: '14:10' },
] as const