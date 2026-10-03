export type HabitacionEstadoKey =
  | 'available'
  | 'occupied'
  | 'maintenance'
  | 'cleaning'
  | 'inactive'
  | string

export interface BedDetail {
  id?: string
  name: string
  capacityPeople?: number
  loading: boolean
  error: boolean
}

export interface BuildingDetail {
  id?: string
  name: string
  floorNumber?: number
  headquartersId?: string
  subHeadquartersId?: string
  loading: boolean
  error: boolean
}

export interface RoomRow {
  id: string
  number: string
  floor: number | string
  status: HabitacionEstadoKey
  priceOverride: number | null
  updatedAt?: string
  createdAt?: string
  roomTypesId?: string
  buildingId?: string
  bed: BedDetail
  building: BuildingDetail
}

export interface RawRoomData {
  id: string | number
  number?: string | number
  floor?: string | number
  status?: string
  price_override?: number | string | null
  price?: number | string | null
  room_types_id?: string
  room_type_id?: string
  building_id?: string
  updated_at?: string
  created_at?: string
}

export interface RawBuildingData {
  id: string
  name?: string
  floor_number?: number
  headquarters_id?: string
  sub_headquarters_id?: string
}

export interface RawBedTypeData {
  id: string
  name?: string
  capacity_people?: number
  capacity?: number
  description?: string
}

export interface HabitacionesListFilters {
  search: string
  status: string
  buildingId: string
}

/**
 * Compara dos números de habitación para ordenarlas de mayor a menor (descendente).
 * Prioriza la magnitud numérica real y aplica orden alfanumérico natural en caso de sufijos.
 */
export function compareRoomNumbersDesc(
  aNumRaw?: string | number | null,
  bNumRaw?: string | number | null
): number {
  const aStr = String(aNumRaw ?? '').trim()
  const bStr = String(bNumRaw ?? '').trim()

  const aMatch = aStr.match(/\d+/)
  const bMatch = bStr.match(/\d+/)

  if (aMatch && bMatch) {
    const aVal = parseInt(aMatch[0], 10)
    const bVal = parseInt(bMatch[0], 10)
    if (aVal !== bVal) {
      return bVal - aVal // Descendente (de mayor a menor)
    }
  }

  // Fallback con orden alfanumérico descendente natural
  return bStr.localeCompare(aStr, undefined, { numeric: true, sensitivity: 'base' })
}
