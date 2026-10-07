/**
 * Contratos de Dominio para el Catálogo Maestro Compartido (Shared Kernel).
 * Define las entidades transversales de la red hotelera:
 * - Huéspedes / Personas (GET /person/{id})
 * - Habitaciones (GET /room/{id})
 * - Tipos de Habitación (GET /room-types/{id})
 * - Tipos de Cama (GET /types-bed/{id})
 * - Edificios o Torres (GET /building/{id})
 * - Sedes Principales (GET /headquarters/{id})
 * - Subsedes Secundarias (GET /sub-headquarters/{id})
 */

export interface PersonCatalogItem {
  id: string
  document_type?: string
  document_number?: string
  name: string
  phone_number?: string
  email?: string
  date_of_birth?: string
  gender?: string
  nationality?: string
  roles?: string[]
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface RoomCatalogItem {
  id: string
  number: string
  floor: number
  room_types_id: string
  building_id: string
  price_override: number | null
  status: string
  has_reception: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface RoomTypeCatalogItem {
  id: string
  name: string
  capacity: number
  base_price: number
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface BedTypeCatalogItem {
  id: string
  name: string
  capacity_people: number
  description?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface BuildingCatalogItem {
  id: string
  name: string
  floor_number: number
  headquarters_id: string
  sub_headquarters_id: string | null
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface HeadquarterCatalogItem {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface SubHeadquarterCatalogItem {
  id: string
  headquarter_id: string
  name: string
  address: string
  phone: string
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface RoleCatalogItem {
  id: string
  name: string
  description?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

