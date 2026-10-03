import type {
  BedApiResponse,
  PersonApiResponse,
  ReservaPayload,
  RoomApiResponse,
  TipoCamaApiResponse,
} from './reserva'

export interface ReservaRepository {
  getBeds(): Promise<BedApiResponse[]>
  getRoom(id: string): Promise<RoomApiResponse>
  getPersons(): Promise<PersonApiResponse[]>
  getTypesBed?(): Promise<TipoCamaApiResponse[]>
  createReserva(payload: ReservaPayload): Promise<{ id?: string; message: string }>
}

