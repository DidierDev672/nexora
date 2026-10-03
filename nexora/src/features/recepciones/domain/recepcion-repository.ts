import type {
  CamaInfo,
  EdificioInfo,
  HabitacionInfo,
  HuespedInfo,
  Recepcion,
  RecepcionPayload,
  ReservaInfo,
  SedeInfo,
  SubSedeInfo,
  TipoCamaInfo,
} from './recepcion'

export interface RecepcionRepository {
  /**
   * Obtiene la lista de recepciones/estadías activas e históricas (GET /stay).
   */
  getRecepciones(): Promise<Recepcion[]>

  /**
   * Registra y persiste una nueva recepción/estadía en el backend (POST /stay).
   */
  createRecepcion(payload: RecepcionPayload): Promise<Recepcion>

  /**
   * Obtiene las sedes de la red hotelera (GET /headquarters).
   */
  getSedes(): Promise<SedeInfo[]>

  /**
   * Obtiene los edificios, opcionalmente filtrados por sede (GET /building).
   */
  getEdificios(sedeId?: string): Promise<EdificioInfo[]>

  /**
   * Obtiene las sub-sedes asociadas a una sede específica (GET /sub-headquarters/by-headquarter/{sedeId}).
   */
  getSubSedes(sedeId: string): Promise<SubSedeInfo[]>

  /**
   * Obtiene las habitaciones del hotel, opcionalmente filtradas por edificio (GET /room).
   */
  getHabitaciones(edificioId?: string): Promise<HabitacionInfo[]>

  /**
   * Obtiene una habitación puntual por ID con sus detalles (GET /rooms/{id}).
   */
  getHabitacionById(id: string): Promise<HabitacionInfo | null>

  /**
   * Obtiene las camas físicas, opcionalmente filtradas por habitación (GET /beds).
   */
  getCamas(roomId?: string): Promise<CamaInfo[]>

  /**
   * Obtiene el catálogo de tipos de cama (GET /types-bed).
   */
  getTiposCama(): Promise<TipoCamaInfo[]>

  /**
   * Obtiene las reservas activas o pendientes para el check-in (GET /reserve).
   */
  getReservas(): Promise<ReservaInfo[]>

  /**
   * Obtiene la lista de huéspedes registrados (GET /persons).
   */
  getHuespedes(): Promise<HuespedInfo[]>

  /**
   * Obtiene un huésped por ID (GET /person/{id}).
   */
  getPersonById(id: string): Promise<HuespedInfo | null>
}
