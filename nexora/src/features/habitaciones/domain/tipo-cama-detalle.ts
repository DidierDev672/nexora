/**
 * Dominio: Entidad y tipos para el detalle de Tipo de Cama
 */

export interface RawBedTypeResponse {
  id?: string
  name?: string
  capacity_people?: number
  capacity?: number
  description?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  message?: string
}

export interface TipoCamaDetalle {
  id: string
  name: string
  capacity_people: number
  description: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export type TipoCamaErrorState = 'empty' | 'server_error' | 'network_error'
