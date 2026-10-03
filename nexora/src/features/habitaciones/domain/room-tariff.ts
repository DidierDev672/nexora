export interface RoomTariffPayload {
  room_id: string
  rate_id: string
  is_default: boolean
  status: 'active' | 'inactive'
  created_by: string
}

export interface RoomTariffFeedback {
  type: 'success' | 'error'
  title: string
  message: string
  subtext?: string
  status?: number
}

export interface RoomTariffRepository {
  assignTariff(payload: RoomTariffPayload): Promise<{
    ok: boolean
    status: number
    data?: unknown
    error?: unknown
  }>
}
