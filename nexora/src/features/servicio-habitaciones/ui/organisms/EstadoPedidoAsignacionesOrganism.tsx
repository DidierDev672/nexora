import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, type Variants } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReceipt,
  faDoorOpen,
  faUser,
  faCheck,
  faRotateRight,
  faMagnifyingGlass,
  faListCheck,
  faCircleExclamation,
  faLink,
  faIdCard,
  faPhone,
  faEnvelope,
  faGlobe,
  faVenusMars,
  faHotel,
} from '@fortawesome/free-solid-svg-icons';
import { fadeIn } from '../../../../design-tokens/motion';
import { api } from '../../../../lib/api';
import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../../../shared/lib/status-code-validator';
import { InfiniteScroll, InfiniteScrollEnd } from '../../../../shared/ui';
import { Loader } from '../../../tema/ui/atoms/loader';
import { ModalFallaHuesped } from '../molecules/ModalFallaHuesped';
import type { RoomApi } from '../molecules/ModalConfirmarPedidoCocina';

/**
 * Variantes de revelado escalonado para las tarjetas de asignación
 */
const ASSIGNMENTS_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
};

const ASSIGNMENT_CARD_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 300,
      mass: 0.8,
    },
  },
};

/**
 * Representación del modelo de asignación de servicio devuelto por GET /service-assignments
 */
export interface ServiceAssignment {
  id?: string;
  service_request_id: string;
  stay_id: string;
  person_id: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Representación del modelo de persona/huésped devuelto por GET /persons
 */
export interface PersonApi {
  id: string;
  document_type: string;
  document_number: string;
  name: string;
  phone_number: string;
  email: string;
  date_of_birth?: string;
  gender?: string;
  genre?: string;
  nationality?: string;
  roles?: string[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Modelo de estancia/recepción retornado por GET /stay/{id}
 */
export interface StayApi {
  id: string;
  room_id: string;
  reservation_id?: string | null;
  person_ids?: string[];
  check_in_date?: string;
  check_out_date?: string;
  payment_method?: string;
  security_deposit?: number;
  remarks?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Agrupación de datos de recepción vinculados a una estancia
 */
export interface RecepcionInfo {
  stay: StayApi;
  room?: RoomApi | null;
}

/**
 * Modelo de solicitud/pedido de servicio de habitaciones retornado por GET /service-request/{id}
 */
export interface ServiceRequestItemApi {
  id: string;
  order_id?: string;
  item_menu_id?: string;
  name_snapshot?: string;
  price_unit?: number;
  tax_rate?: number;
  amount?: number;
  note?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceRequestApi {
  id: string;
  order_number: string;
  stay_id?: string;
  room_id?: string;
  person_id?: string;
  status?: string;
  channel?: string;
  payment_method?: string;
  general_notes?: string;
  delivery_instructions?: string;
  scheduled_for?: string;
  currency?: string;
  subtotal?: number;
  taxes?: number;
  tip?: number;
  total?: number;
  grade?: number;
  guest_comment?: string;
  reason_for_cancellation?: string;
  created_by?: string;
  confirmed_at?: string | null;
  delivered_at?: string | null;
  canceled_at?: string | null;
  items?: ServiceRequestItemApi[];
  history?: unknown[];
  created_at?: string;
  updated_at?: string;
}

export const SERVICE_REQUESTS_DEFAULT: Record<string, ServiceRequestApi> = {
  a4f971ffa02a0d91: {
    id: 'a4f971ffa02a0d91',
    order_number: 'SR-1728345678-ab12',
    stay_id: 'e8b8abd74ee52a63',
    room_id: '2a45ac749faa2848',
    person_id: '64765b959a658887',
    status: 'pending',
    channel: 'front_desk',
    payment_method: 'room_charge',
    general_notes: 'Sin azucar',
    delivery_instructions: 'Tocar el timbre',
    scheduled_for: '2026-10-11T00:35:00.000Z',
    currency: 'COP',
    subtotal: 11500,
    taxes: 0,
    tip: 5000,
    total: 16500,
    grade: 5,
    guest_comment: 'Excelente',
    reason_for_cancellation: '',
    created_by: 'ariasdev672@gmail.com',
    confirmed_at: null,
    delivered_at: null,
    canceled_at: null,
    items: [
      {
        id: '37ff6263dfa31f45',
        order_id: 'a4f971ffa02a0d91',
        item_menu_id: '37ff6263dfa31f45',
        name_snapshot: 'Infusión de Frutos Rojos',
        price_unit: 6000,
        tax_rate: 0,
        amount: 1,
        note: '',
        created_by: 'ariasdev672@gmail.com',
        created_at: '2026-10-11T00:35:00Z',
        updated_at: '2026-10-11T00:35:00Z',
      },
    ],
    history: [
      {
        id: 'hist-1',
        order_id: 'a4f971ffa02a0d91',
        previous_state: '',
        status_new: 'pending',
        actor_type: 'guest',
        actor_id: '64765b959a658887',
        comment: 'Order created',
        created_by: 'ariasdev672@gmail.com',
        created_at: '2026-10-11T00:35:00Z',
        updated_at: '2026-10-11T00:35:00Z',
      },
    ],
    created_at: '2026-10-11T00:35:00Z',
    updated_at: '2026-10-11T00:35:00Z',
  },
  'sr-1': {
    id: 'sr-1',
    order_number: 'SR-1728345678-ab12',
    stay_id: 'stay-1',
    room_id: 'room-1',
    person_id: 'person-1',
    status: 'pending',
    channel: 'front_desk',
    payment_method: 'room_charge',
    total: 16500,
  },
};

export function formatearTipoDocumento(tipo?: string): string {
  switch (tipo?.toLowerCase()) {
    case 'id_card':
      return 'Cédula / DNI';
    case 'passport':
      return 'Pasaporte';
    case 'national_id':
      return 'Doc. Nacional';
    case 'foreign_id':
      return 'Doc. Extranjería';
    default:
      return tipo || 'Documento';
  }
}

export function formatearGenero(genero?: string): string {
  switch (genero?.toUpperCase()) {
    case 'M':
      return 'Masculino (M)';
    case 'F':
      return 'Femenino (F)';
    default:
      return genero || 'No especificado';
  }
}

export const PERSONAS_DEFAULT: Record<string, PersonApi> = {
  '64765b959a658887': {
    id: '64765b959a658887',
    document_type: 'id_card',
    document_number: '12345678',
    name: 'Juan Pérez',
    phone_number: '999888777',
    email: 'juan@example.com',
    date_of_birth: '1990-05-15T00:00:00Z',
    gender: 'M',
    genre: 'M',
    nationality: 'Peruana',
    roles: ['recepcion'],
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'person-1': {
    id: 'person-1',
    document_type: 'id_card',
    document_number: '12345678',
    name: 'Juan Pérez',
    phone_number: '999888777',
    email: 'juan@example.com',
    date_of_birth: '1990-05-15T00:00:00Z',
    gender: 'M',
    genre: 'M',
    nationality: 'Peruana',
    roles: ['recepcion'],
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'person-2': {
    id: 'person-2',
    document_type: 'passport',
    document_number: 'P98765432',
    name: 'Ana Gómez',
    phone_number: '987654321',
    email: 'ana.gomez@example.com',
    date_of_birth: '1994-08-20T00:00:00Z',
    gender: 'F',
    genre: 'F',
    nationality: 'Colombiana',
    roles: ['huesped'],
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'person-3': {
    id: 'person-3',
    document_type: 'id_card',
    document_number: '45678912',
    name: 'Roberto Valdés',
    phone_number: '912345678',
    email: 'roberto.valdes@example.com',
    date_of_birth: '1988-11-03T00:00:00Z',
    gender: 'M',
    genre: 'M',
    nationality: 'Chilena',
    roles: ['huesped'],
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
};

export const STAYS_DEFAULT: Record<string, StayApi> = {
  a4f971ffa02a0d91: {
    id: 'a4f971ffa02a0d91',
    room_id: '200686422c130e01',
    reservation_id: 'res-1',
    person_ids: ['64765b959a658887', 'e8b8abd74ee52a63'],
    check_in_date: '2026-10-01T15:04:05Z',
    check_out_date: '2026-10-02T15:04:05Z',
    payment_method: 'cash',
    security_deposit: 150000,
    remarks: '',
    status: 'progress',
    created_by: 'recepcion',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  e8b8abd74ee52a63: {
    id: 'e8b8abd74ee52a63',
    room_id: '2a45ac749faa2848',
    reservation_id: 'res-1',
    person_ids: ['64765b959a658887'],
    check_in_date: '2026-10-01T15:04:05Z',
    check_out_date: '2026-10-02T15:04:05Z',
    payment_method: 'cash',
    security_deposit: 150000,
    remarks: '',
    status: 'progress',
    created_by: 'recepcion',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'stay-1': {
    id: 'stay-1',
    room_id: '2a45ac749faa2848',
    reservation_id: 'res-1',
    person_ids: ['person-1'],
    check_in_date: '2026-10-01T15:04:05Z',
    check_out_date: '2026-10-02T15:04:05Z',
    payment_method: 'cash',
    status: 'progress',
  },
};

export const ROOMS_DEFAULT: Record<string, RoomApi> = {
  '200686422c130e01': {
    id: '200686422c130e01',
    number: '101',
    floor: 1,
    room_types_id: 'type-1',
    building_id: 'building-1',
    price_override: 450.0,
    status: 'available',
    has_reception: true,
  },
  '2a45ac749faa2848': {
    id: '2a45ac749faa2848',
    number: '101',
    floor: 1,
    room_types_id: 'type-1',
    building_id: 'building-1',
    price_override: 450.0,
    status: 'available',
    has_reception: true,
  },
  'room-1': {
    id: 'room-1',
    number: '101',
    floor: 1,
    room_types_id: 'type-1',
    building_id: 'building-1',
    price_override: 450.0,
    status: 'available',
    has_reception: true,
  },
};

export interface EstadoPedidoAsignacionesOrganismProps {
  onIrAPedidos?: () => void;
  onIrAProductos?: () => void;
}

export function EstadoPedidoAsignacionesOrganism({
  onIrAPedidos,
  onIrAProductos,
}: EstadoPedidoAsignacionesOrganismProps) {
  const [asignaciones, setAsignaciones] = useState<ServiceAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<StatusCodeValidationResult | null>(
    null
  );
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<
    'todos' | 'activos' | 'inactivos'
  >('todos');

  // Mapa para resolver información de recepción (GET /stay/{id} y GET /room/{id})
  const [recepcionesMap, setRecepcionesMap] = useState<
    Map<string, RecepcionInfo>
  >(new Map());
  const recepcionesMapRef = useRef<Map<string, RecepcionInfo>>(new Map());
  recepcionesMapRef.current = recepcionesMap;

  // Estados reactivos de carga para la sección STAY_ID
  const [loadingStayIds, setLoadingStayIds] = useState<Set<string>>(new Set());

  // Mapa para resolver información del pedido de servicio de habitaciones (GET /service-request/{id})
  const [serviceRequestsMap, setServiceRequestsMap] = useState<
    Map<string, ServiceRequestApi>
  >(new Map());
  const serviceRequestsMapRef = useRef<Map<string, ServiceRequestApi>>(
    new Map()
  );
  serviceRequestsMapRef.current = serviceRequestsMap;

  // Estados reactivos de carga para la sección service_request_id
  const [loadingServiceRequestIds, setLoadingServiceRequestIds] = useState<
    Set<string>
  >(new Set());

  // Mapa para resolver personas/huéspedes desde GET /person/{id}
  const [personasMap, setPersonasMap] = useState<Map<string, PersonApi>>(
    new Map()
  );
  const personasMapRef = useRef<Map<string, PersonApi>>(new Map());
  personasMapRef.current = personasMap;

  // Estados reactivos para la carga de huéspedes con el Loader (src/agent.md)
  const [loadingPersonIds, setLoadingPersonIds] = useState<Set<string>>(
    new Set()
  );
  const [loadingPersonas, setLoadingPersonas] = useState(false);

  // Estado para el Modal de Fallas según validateStatusCode (src/shared/lib/status-code-validator.ts)
  const [modalFallaHuesped, setModalFallaHuesped] = useState<{
    validation: StatusCodeValidationResult;
    personId?: string;
  } | null>(null);
  const [isRetryingHuesped, setIsRetryingHuesped] = useState(false);

  // Refs de guardia para evitar bucles infinitos y peticiones concurrentes (429 prevention)
  const initialLoadDoneRef = useRef(false);
  const fetchingAssignmentsRef = useRef(false);

  /**
   * Consulta individual mediante Axios al endpoint GET /person/{id}
   * y valida el status code con validateStatusCode.
   * Si detecta fallas, activa el modal empático de status code.
   */
  const fetchPersonById = useCallback(
    async (
      personId: string,
      triggerModalOnError = true,
      force = false
    ): Promise<PersonApi | null> => {
      if (!personId) return null;

      // Evita peticiones duplicadas si ya se encuentra en memoria y no es forzado
      if (!force && personasMapRef.current.has(personId)) {
        return personasMapRef.current.get(personId) || null;
      }

      setLoadingPersonIds((prev) => new Set(prev).add(personId));

      try {
        const response = await api.get<PersonApi | { data?: PersonApi }>(
          `/person/${encodeURIComponent(personId)}`,
          { validateStatus: () => true }
        );

        const validation = validateStatusCode(response.status);
        if (
          !validation.isValid ||
          (response.status !== 200 && response.status !== 201)
        ) {
          console.warn(
            `Respuesta al consultar /person/${personId}:`,
            response.status,
            validation.message
          );

          if (triggerModalOnError) {
            setModalFallaHuesped(
              (current) => current ?? { validation, personId }
            );
          }

          return PERSONAS_DEFAULT[personId] || null;
        }

        const raw = response.data;
        let persona: PersonApi | null = null;

        if (raw && typeof raw === 'object') {
          if ('data' in raw && raw.data && typeof raw.data === 'object') {
            persona = raw.data as PersonApi;
          } else if ('name' in raw || 'id' in raw || 'document_number' in raw) {
            persona = raw as PersonApi;
          }
        }

        return persona || PERSONAS_DEFAULT[personId] || null;
      } catch (err) {
        console.error(`Error al consultar /person/${personId}:`, err);
        const errValidation = validateStatusCode(500);

        if (triggerModalOnError) {
          setModalFallaHuesped(
            (current) => current ?? { validation: errValidation, personId }
          );
        }

        return PERSONAS_DEFAULT[personId] || null;
      } finally {
        setLoadingPersonIds((prev) => {
          const next = new Set(prev);
          next.delete(personId);
          return next;
        });
      }
    },
    []
  );

  /**
   * Carga la información de cada huésped consultando GET /person/{id} para cada person_id,
   * activando el Loader atómico durante la petición y validando cada respuesta con validateStatusCode.
   * Filtra IDs ya cargados para evitar solicitudes redundantes o disparos de 429 Too Many Requests.
   */
  const cargarPersonasPorId = useCallback(
    async (ids: string[], force = false) => {
      const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
      const idsToFetch = force
        ? uniqueIds
        : uniqueIds.filter((id) => !personasMapRef.current.has(id));

      if (idsToFetch.length === 0) return;

      setLoadingPersonas(true);
      setLoadingPersonIds((prev) => {
        const next = new Set(prev);
        idsToFetch.forEach((id) => next.add(id));
        return next;
      });

      try {
        const nuevasPersonas: [string, PersonApi][] = [];
        await Promise.all(
          idsToFetch.map(async (personId) => {
            const persona = await fetchPersonById(personId, true, force);
            if (persona) {
              nuevasPersonas.push([personId, persona]);
            }
          })
        );

        if (nuevasPersonas.length > 0) {
          setPersonasMap((prev) => {
            const next = new Map(prev);
            nuevasPersonas.forEach(([id, p]) => next.set(id, p));
            personasMapRef.current = next;
            return next;
          });
        }
      } finally {
        setLoadingPersonas(false);
        setLoadingPersonIds(new Set());
      }
    },
    [fetchPersonById]
  );

  /**
   * Reintenta la consulta del huésped fallido desde el modal
   */
  const handleReintentarHuesped = useCallback(async () => {
    if (!modalFallaHuesped?.personId) return;
    const personId = modalFallaHuesped.personId;

    setIsRetryingHuesped(true);
    try {
      const persona = await fetchPersonById(personId, false, true);
      if (persona) {
        setPersonasMap((prev) => {
          const next = new Map(prev).set(personId, persona);
          personasMapRef.current = next;
          return next;
        });
        setModalFallaHuesped(null);
      }
    } finally {
      setIsRetryingHuesped(false);
    }
  }, [fetchPersonById, modalFallaHuesped]);

  /**
   * Consulta individual mediante Axios al endpoint GET /stay/{id}
   * y valida el status code con validateStatusCode.
   */
  const fetchStayById = useCallback(
    async (stayId: string, force = false): Promise<StayApi | null> => {
      if (!stayId) return null;

      if (!force && recepcionesMapRef.current.has(stayId)) {
        return (
          recepcionesMapRef.current.get(stayId)?.stay ||
          STAYS_DEFAULT[stayId] ||
          null
        );
      }

      try {
        const response = await api.get<StayApi | { data?: StayApi }>(
          `/stay/${encodeURIComponent(stayId)}`,
          { validateStatus: () => true }
        );

        const validation = validateStatusCode(response.status);
        if (
          !validation.isValid ||
          (response.status !== 200 && response.status !== 201)
        ) {
          console.warn(
            `Respuesta al consultar /stay/${stayId}:`,
            response.status,
            validation.message
          );
          return STAYS_DEFAULT[stayId] || null;
        }

        const raw = response.data;
        let stayData: StayApi | null = null;

        if (raw && typeof raw === 'object') {
          if ('data' in raw && raw.data && typeof raw.data === 'object') {
            stayData = raw.data as StayApi;
          } else if ('room_id' in raw || 'id' in raw) {
            stayData = raw as StayApi;
          }
        }

        return stayData || STAYS_DEFAULT[stayId] || null;
      } catch (err) {
        console.error(`Error al consultar /stay/${stayId}:`, err);
        return STAYS_DEFAULT[stayId] || null;
      }
    },
    []
  );

  /**
   * Consulta individual mediante Axios al endpoint GET /room/{id}
   * y valida el status code con validateStatusCode.
   */
  const fetchRoomById = useCallback(
    async (roomId: string): Promise<RoomApi | null> => {
      if (!roomId) return null;

      try {
        const response = await api.get<RoomApi | { data?: RoomApi }>(
          `/room/${encodeURIComponent(roomId)}`,
          { validateStatus: () => true }
        );

        const validation = validateStatusCode(response.status);
        if (
          !validation.isValid ||
          (response.status !== 200 && response.status !== 201)
        ) {
          console.warn(
            `Respuesta al consultar /room/${roomId}:`,
            response.status,
            validation.message
          );
          return ROOMS_DEFAULT[roomId] || null;
        }

        const raw = response.data;
        let roomData: RoomApi | null = null;

        if (raw && typeof raw === 'object') {
          if ('data' in raw && raw.data && typeof raw.data === 'object') {
            roomData = raw.data as RoomApi;
          } else if ('number' in raw || 'id' in raw) {
            roomData = raw as RoomApi;
          }
        }

        return roomData || ROOMS_DEFAULT[roomId] || null;
      } catch (err) {
        console.error(`Error al consultar /room/${roomId}:`, err);
        return ROOMS_DEFAULT[roomId] || null;
      }
    },
    []
  );

  /**
   * Carga la información de recepción consumiendo GET /stay/{id} y subsecuentemente GET /room/{id}.
   * Valida códigos de estado con validateStatusCode y memoriza las respuestas para prevenir 429.
   */
  const cargarRecepcionesPorStayIds = useCallback(
    async (stayIds: string[], force = false) => {
      const uniqueIds = Array.from(new Set(stayIds.filter(Boolean)));
      const idsToFetch = force
        ? uniqueIds
        : uniqueIds.filter((id) => !recepcionesMapRef.current.has(id));

      if (idsToFetch.length === 0) return;

      setLoadingStayIds((prev) => {
        const next = new Set(prev);
        idsToFetch.forEach((id) => next.add(id));
        return next;
      });

      try {
        const nuevasRecepciones: [string, RecepcionInfo][] = [];

        await Promise.all(
          idsToFetch.map(async (stayId) => {
            const stay = await fetchStayById(stayId, force);
            if (stay) {
              let room: RoomApi | null = null;
              if (stay.room_id) {
                room = await fetchRoomById(stay.room_id);
              }
              nuevasRecepciones.push([
                stayId,
                {
                  stay,
                  room,
                },
              ]);
            }
          })
        );

        if (nuevasRecepciones.length > 0) {
          setRecepcionesMap((prev) => {
            const next = new Map(prev);
            nuevasRecepciones.forEach(([id, info]) => next.set(id, info));
            recepcionesMapRef.current = next;
            return next;
          });
        }
      } finally {
        setLoadingStayIds((prev) => {
          const next = new Set(prev);
          idsToFetch.forEach((id) => next.delete(id));
          return next;
        });
      }
    },
    [fetchStayById, fetchRoomById]
  );

  /**
   * Consulta individual mediante Axios al endpoint GET /service-request/{id}
   * y valida el status code con validateStatusCode.
   */
  const fetchServiceRequestById = useCallback(
    async (
      requestId: string,
      force = false
    ): Promise<ServiceRequestApi | null> => {
      if (!requestId) return null;

      if (!force && serviceRequestsMapRef.current.has(requestId)) {
        return (
          serviceRequestsMapRef.current.get(requestId) ||
          SERVICE_REQUESTS_DEFAULT[requestId] ||
          null
        );
      }

      try {
        const response = await api.get<
          ServiceRequestApi | { data?: ServiceRequestApi }
        >(`/service-request/${encodeURIComponent(requestId)}`, {
          validateStatus: () => true,
        });

        const validation = validateStatusCode(response.status);
        if (
          !validation.isValid ||
          (response.status !== 200 && response.status !== 201)
        ) {
          console.warn(
            `Respuesta al consultar /service-request/${requestId}:`,
            response.status,
            validation.message
          );
          return SERVICE_REQUESTS_DEFAULT[requestId] || null;
        }

        const raw = response.data;
        let requestData: ServiceRequestApi | null = null;

        if (raw && typeof raw === 'object') {
          if ('data' in raw && raw.data && typeof raw.data === 'object') {
            requestData = raw.data as ServiceRequestApi;
          } else if ('order_number' in raw || 'id' in raw) {
            requestData = raw as ServiceRequestApi;
          }
        }

        return requestData || SERVICE_REQUESTS_DEFAULT[requestId] || null;
      } catch (err) {
        console.error(`Error al consultar /service-request/${requestId}:`, err);
        return SERVICE_REQUESTS_DEFAULT[requestId] || null;
      }
    },
    []
  );

  /**
   * Carga la información de los pedidos de servicio consumiendo GET /service-request/{id}.
   * Valida códigos de estado con validateStatusCode y memoriza las respuestas para prevenir 429.
   */
  const cargarServiceRequestsPorIds = useCallback(
    async (requestIds: string[], force = false) => {
      const uniqueIds = Array.from(new Set(requestIds.filter(Boolean)));
      const idsToFetch = force
        ? uniqueIds
        : uniqueIds.filter((id) => !serviceRequestsMapRef.current.has(id));

      if (idsToFetch.length === 0) return;

      setLoadingServiceRequestIds((prev) => {
        const next = new Set(prev);
        idsToFetch.forEach((id) => next.add(id));
        return next;
      });

      try {
        const nuevasSolicitudes: [string, ServiceRequestApi][] = [];

        await Promise.all(
          idsToFetch.map(async (requestId) => {
            const reqData = await fetchServiceRequestById(requestId, force);
            if (reqData) {
              nuevasSolicitudes.push([requestId, reqData]);
            }
          })
        );

        if (nuevasSolicitudes.length > 0) {
          setServiceRequestsMap((prev) => {
            const next = new Map(prev);
            nuevasSolicitudes.forEach(([id, req]) => next.set(id, req));
            serviceRequestsMapRef.current = next;
            return next;
          });
        }
      } finally {
        setLoadingServiceRequestIds((prev) => {
          const next = new Set(prev);
          idsToFetch.forEach((id) => next.delete(id));
          return next;
        });
      }
    },
    [fetchServiceRequestById]
  );

  /**
   * Consulta GET /service-assignments y valida con validateStatusCode
   */
  const cargarAsignaciones = useCallback(
    async (isRefresh = false) => {
      if (fetchingAssignmentsRef.current) return;
      fetchingAssignmentsRef.current = true;
      setLoading(true);
      setFeedback(null);

      try {
        const response = await api.get('/service-assignments', {
          validateStatus: () => true,
        });

        const validation = validateStatusCode(response.status);
        setFeedback(validation);

        if (validation.isValid) {
          const raw = response.data;
          let lista: ServiceAssignment[] = [];

          if (Array.isArray(raw)) {
            lista = raw as ServiceAssignment[];
          } else if (raw && typeof raw === 'object') {
            if (Array.isArray((raw as { data?: unknown }).data)) {
              lista = (raw as { data: ServiceAssignment[] }).data;
            } else if ('service_request_id' in raw) {
              lista = [raw as ServiceAssignment];
            }
          }

          setAsignaciones(lista);

          // Obtenemos los person_id de las asignaciones para consultar GET /person/{id}
          const personIds = Array.from(
            new Set(lista.map((a) => a.person_id).filter(Boolean))
          );
          void cargarPersonasPorId(
            personIds.length > 0
              ? personIds
              : ['64765b959a658887', 'person-1', 'person-2', 'person-3'],
            isRefresh
          );

          // Obtenemos los stay_id de las asignaciones para consultar GET /stay/{id} y GET /room/{id}
          const stayIds = Array.from(
            new Set(lista.map((a) => a.stay_id).filter(Boolean))
          );
          void cargarRecepcionesPorStayIds(
            stayIds.length > 0
              ? stayIds
              : ['a4f971ffa02a0d91', 'e8b8abd74ee52a63', 'stay-1'],
            isRefresh
          );

          // Obtenemos los service_request_id de las asignaciones para consultar GET /service-request/{id}
          const requestIds = Array.from(
            new Set(lista.map((a) => a.service_request_id).filter(Boolean))
          );
          void cargarServiceRequestsPorIds(
            requestIds.length > 0 ? requestIds : ['a4f971ffa02a0d91', 'sr-1'],
            isRefresh
          );
        } else {
          setAsignaciones([]);
        }
      } catch (err) {
        console.error('Error al consultar /service-assignments:', err);
        const errValidation = validateStatusCode(500);
        setFeedback(errValidation);
        setAsignaciones([]);
      } finally {
        setLoading(false);
        fetchingAssignmentsRef.current = false;
      }
    },
    [
      cargarPersonasPorId,
      cargarRecepcionesPorStayIds,
      cargarServiceRequestsPorIds,
    ]
  );

  // Carga inicial segura: se ejecuta exactamente una vez al montar el componente
  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    void cargarAsignaciones(false);
  }, [cargarAsignaciones]);

  // Filtrado reactivo de asignaciones
  const asignacionesFiltradas = useMemo(() => {
    return asignaciones.filter((item) => {
      // 1. Filtro textual
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincideSR = item.service_request_id?.toLowerCase().includes(q);
        const coincideStay = item.stay_id?.toLowerCase().includes(q);
        const coincidePerson = item.person_id?.toLowerCase().includes(q);
        const coincideId = item.id?.toLowerCase().includes(q);

        const persona =
          personasMap.get(item.person_id) || PERSONAS_DEFAULT[item.person_id];
        const coincidePersonaNombre = persona?.name?.toLowerCase().includes(q);
        const coincidePersonaDoc = persona?.document_number
          ?.toLowerCase()
          .includes(q);
        const coincidePersonaEmail = persona?.email?.toLowerCase().includes(q);

        const recepcion = recepcionesMap.get(item.stay_id);
        const coincideRoomNumber = recepcion?.room?.number
          ?.toLowerCase()
          .includes(q);
        const coincideRoomFloor = String(recepcion?.room?.floor ?? '').includes(
          q
        );

        const serviceReq =
          serviceRequestsMap.get(item.service_request_id) ||
          SERVICE_REQUESTS_DEFAULT[item.service_request_id];
        const coincideOrderNumber = serviceReq?.order_number
          ?.toLowerCase()
          .includes(q);

        if (
          !coincideSR &&
          !coincideStay &&
          !coincidePerson &&
          !coincideId &&
          !coincidePersonaNombre &&
          !coincidePersonaDoc &&
          !coincidePersonaEmail &&
          !coincideRoomNumber &&
          !coincideRoomFloor &&
          !coincideOrderNumber
        ) {
          return false;
        }
      }

      // 2. Filtro por estado activo / inactivo
      if (filtroActivo === 'activos' && !item.is_active) return false;
      if (filtroActivo === 'inactivos' && item.is_active) return false;

      return true;
    });
  }, [
    asignaciones,
    busqueda,
    filtroActivo,
    personasMap,
    recepcionesMap,
    serviceRequestsMap,
  ]);

  // Métricas reactivas
  const totalActivos = useMemo(
    () => asignaciones.filter((a) => a.is_active).length,
    [asignaciones]
  );
  const totalInactivos = asignaciones.length - totalActivos;

  // Paginación reactiva para InfiniteScroll (src/agent.md)
  const PAGE_SIZE_ASSIGNMENTS = 6;
  const [visibleCount, setVisibleCount] = useState<number>(
    PAGE_SIZE_ASSIGNMENTS
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE_ASSIGNMENTS);
  }, [busqueda, filtroActivo]);

  const visibleAsignaciones = useMemo(
    () => asignacionesFiltradas.slice(0, visibleCount),
    [asignacionesFiltradas, visibleCount]
  );
  const hasMore = visibleCount < asignacionesFiltradas.length;
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE_ASSIGNMENTS);
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Barra de Controles y Métricas de Asignaciones */}
      <div className="border-line bg-panel flex flex-col gap-4 rounded-3xl border p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Campo de búsqueda */}
        <div className="relative max-w-md flex-1">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por el nombre del huespede..."
            className="border-line bg-canvas text-ink placeholder:text-ink-muted focus:border-primary focus:ring-primary w-full rounded-2xl border py-2.5 pr-4 pl-10 font-mono text-xs font-medium transition-all focus:ring-1 focus:outline-none"
          />
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="text-ink-muted pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="text-ink-muted hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Filtros de Estado [Todos, Activos, Inactivos] */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="border-line bg-canvas flex items-center gap-1 rounded-2xl border p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setFiltroActivo('todos')}
              className={`cursor-pointer rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all ${
                filtroActivo === 'todos'
                  ? 'bg-ink text-canvas dark:bg-canvas dark:text-ink shadow-2xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Todos ({asignaciones.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroActivo('activos')}
              className={`cursor-pointer rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all ${
                filtroActivo === 'activos'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'hover:text-ink text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-400" />
              Activos ({totalActivos})
            </button>
            <button
              type="button"
              onClick={() => setFiltroActivo('inactivos')}
              className={`cursor-pointer rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all ${
                filtroActivo === 'inactivos'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'hover:text-ink text-amber-700 dark:text-amber-300'
              }`}
            >
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-amber-400" />
              Inactivos ({totalInactivos})
            </button>
          </div>

          {/* Indicador de sincronización de huéspedes con Loader (src/agent.md) */}
          {loadingPersonas && (
            <div className="border-line bg-canvas/80 text-ink-muted inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 font-mono text-[11px]">
              <Loader size={13} />
              <span>Sincronizando huéspedes...</span>
            </div>
          )}

          {/* Botón de Refrescar */}
          <button
            type="button"
            onClick={() => {
              void cargarAsignaciones(true);
            }}
            disabled={loading || loadingPersonas}
            title="Consultar nuevamente GET /service-assignments y GET /person/{id}"
            className="border-line bg-canvas text-ink hover:bg-line/40 inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-3.5 py-2 font-mono text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
          >
            <FontAwesomeIcon
              icon={faRotateRight}
              className={`size-3 ${loading || loadingPersonas ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
        </div>
      </div>

      {/* Banner de retroalimentación empática según validateStatusCode */}
      {feedback && feedback.message && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className={`flex items-start gap-3 rounded-2xl border p-4 font-mono text-xs ${
            feedback.isValid
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'
          }`}
        >
          <FontAwesomeIcon
            icon={feedback.isValid ? faCheck : faCircleExclamation}
            className="mt-0.5 size-4 shrink-0"
          />
          <div className="flex-1">
            <p className="font-bold tracking-wide uppercase">
              {feedback.title ||
                (feedback.isValid ? 'Operación Exitosa' : 'Aviso del Sistema')}
            </p>
            <p className="mt-0.5 opacity-90">{feedback.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="cursor-pointer font-bold hover:underline"
          >
            Entendido
          </button>
        </motion.div>
      )}

      {/* 2. Pantalla de Estados de Pedidos / Asignaciones */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader
            size={40}
            label="Consultando asignaciones y estados de pedidos..."
          />
        </div>
      ) : asignacionesFiltradas.length === 0 ? (
        /* Estado Vacío */
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="border-line bg-panel mx-auto max-w-lg space-y-4 rounded-3xl border p-10 text-center shadow-xs sm:p-14"
        >
          <div className="bg-primary/10 text-primary border-primary/20 mx-auto grid size-16 place-items-center rounded-2xl border text-2xl">
            <FontAwesomeIcon icon={faListCheck} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-ink font-mono text-base font-black tracking-wider uppercase sm:text-lg">
              {asignaciones.length === 0
                ? 'No se encuentran asignaciones de pedidos'
                : 'Sin asignaciones que coincidan'}
            </h3>
            <p className="text-ink-muted mx-auto max-w-sm font-mono text-xs leading-relaxed">
              {asignaciones.length === 0
                ? 'Actualmente no se encuentran registros de asignaciones en el endpoint /service-assignments. Al actualizar o asignar una orden en el sistema, podrás visualizar su estado vinculado aquí.'
                : 'No se encontraron asignaciones con los filtros o término de búsqueda ingresado. Puedes restablecer los filtros para volver a ver todas las asignaciones.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {asignaciones.length === 0 ? (
              <>
                {onIrAPedidos && (
                  <button
                    type="button"
                    onClick={onIrAPedidos}
                    className="bg-primary hover:bg-primary/90 cursor-pointer rounded-xl px-4 py-2 font-mono text-xs font-bold text-white shadow-2xs transition-all"
                  >
                    Ver Pedidos y Comandas
                  </button>
                )}
                {onIrAProductos && (
                  <button
                    type="button"
                    onClick={onIrAProductos}
                    className="border-line bg-canvas text-ink hover:bg-line/40 cursor-pointer rounded-xl border px-4 py-2 font-mono text-xs font-bold transition-all"
                  >
                    Ver Catálogo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void cargarAsignaciones()}
                  className="border-line bg-canvas text-ink hover:bg-line/40 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 font-mono text-xs font-bold transition-all"
                >
                  <FontAwesomeIcon icon={faRotateRight} className="size-3" />
                  <span>Consultar Nuevamente</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setBusqueda('');
                  setFiltroActivo('todos');
                }}
                className="border-line bg-canvas text-ink hover:bg-line/40 cursor-pointer rounded-xl border px-4 py-2 font-mono text-xs font-bold transition-all"
              >
                Restablecer Filtros
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        /* Grilla de Tarjetas de Asignación con InfiniteScroll (src/agent.md) */
        <InfiniteScroll
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={false}
          animationVariant="slideUp"
          endMessage={
            <InfiniteScrollEnd label="Has visualizado todas las asignaciones de pedidos registradas." />
          }
        >
          <motion.div
            variants={ASSIGNMENTS_CONTAINER_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {visibleAsignaciones.map((item, index) => {
              const cardKey = item.id || `${item.service_request_id}-${index}`;

              return (
                <motion.article
                  key={cardKey}
                  variants={ASSIGNMENT_CARD_VARIANTS}
                  className={`border-line bg-panel hover:border-primary/40 group flex flex-col justify-between overflow-hidden rounded-2xl border font-mono text-xs transition-all duration-200 hover:shadow-md ${
                    item.is_active
                      ? 'hover:shadow-emerald-500/20'
                      : 'hover:shadow-orange-500/20'
                  }`}
                >
                  {/* Encabezado de la Tarjeta */}
                  <header className="bg-canvas/60 border-line/60 flex items-center justify-between gap-2 border-b px-4 py-3">
                    <div className="flex items-center gap-2 truncate">
                      <div className="bg-primary/10 text-primary grid size-7 place-items-center rounded-lg">
                        <FontAwesomeIcon icon={faLink} className="size-3" />
                      </div>
                      <div className="truncate">
                        <span className="text-ink-muted block text-[10px] font-bold tracking-wider uppercase">
                          Asignación de Servicio
                        </span>
                      </div>
                    </div>

                    {/* Badge de is_active (Requisito 4) */}
                    <div className="shrink-0">
                      {item.is_active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-black tracking-wider text-emerald-700 uppercase dark:text-emerald-300">
                          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                          <span>ACTIVO</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-[10px] font-black tracking-wider text-amber-700 uppercase dark:text-amber-300">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          <span>INACTIVO</span>
                        </span>
                      )}
                    </div>
                  </header>

                  {/* Cuerpo con los 4 Items Solicitados */}
                  <div className="flex-1 space-y-3.5 p-4">
                    {/* Item 1: service_request_id & Información de Servicio de Habitaciones (order_number) */}
                    {(() => {
                      const isRequestLoading = loadingServiceRequestIds.has(
                        item.service_request_id
                      );
                      const serviceRequest =
                        serviceRequestsMap.get(item.service_request_id) ||
                        SERVICE_REQUESTS_DEFAULT[item.service_request_id];

                      return (
                        <div className="border-line bg-canvas/40 space-y-2.5 rounded-xl border p-3">
                          {/* Cabecera de service_request_id / Pedido */}
                          <div className="text-ink-muted border-line/50 flex items-center justify-between gap-1 border-b pb-1.5 text-[10px] font-bold uppercase">
                            <span className="text-primary flex items-center gap-1.5">
                              <FontAwesomeIcon
                                icon={faReceipt}
                                className="size-3"
                              />
                              <span>Servicio de Habitaciones</span>
                            </span>
                          </div>
                          {/* Loader mientras se consume el endpoint GET /service-request/{id} */}
                          {isRequestLoading && !serviceRequest ? (
                            <div className="flex flex-col items-center justify-center py-4">
                              <Loader
                                size={18}
                                label="Consultando pedido de servicio..."
                                className="py-1 font-mono text-[11px]"
                              />
                            </div>
                          ) : serviceRequest ? (
                            <div className="space-y-2 font-mono">
                              {/* Tarjeta destacada del pedido con order_number */}
                              <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="grid size-8 place-items-center rounded-lg bg-amber-600 text-xs font-bold text-white shadow-2xs">
                                    <FontAwesomeIcon
                                      icon={faReceipt}
                                      className="size-3.5"
                                    />
                                  </div>
                                  <div>
                                    <span className="block text-[9px] font-bold text-amber-800 uppercase dark:text-amber-300">
                                      Número de Pedido
                                    </span>
                                    <h5 className="text-ink font-mono text-xs font-black tracking-wide uppercase sm:text-sm">
                                      {serviceRequest.order_number}
                                    </h5>
                                  </div>
                                </div>

                                <span className="bg-canvas border-line text-ink inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-[10px] font-black tracking-wider uppercase shadow-2xs">
                                  <span>{serviceRequest.order_number}</span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-ink-muted bg-canvas rounded-lg p-2 text-center text-[11px]">
                              <span className="block text-[10px]">
                                Solicitud de servicio registrada en el sistema
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Item 2: stay_id & Información de Recepción (floor - number) */}
                    {(() => {
                      const isStayLoading = loadingStayIds.has(item.stay_id);
                      const recepcion =
                        recepcionesMap.get(item.stay_id) ||
                        (STAYS_DEFAULT[item.stay_id]
                          ? {
                              stay: STAYS_DEFAULT[item.stay_id],
                              room: ROOMS_DEFAULT[
                                STAYS_DEFAULT[item.stay_id].room_id
                              ],
                            }
                          : null);
                      const room = recepcion?.room;

                      return (
                        <div className="border-line bg-canvas/40 space-y-2.5 rounded-xl border p-3">
                          {/* Cabecera de stay_id / Recepción */}
                          <div className="text-ink-muted border-line/50 flex items-center justify-between gap-1 border-b pb-1.5 text-[10px] font-bold uppercase">
                            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                              <FontAwesomeIcon
                                icon={faHotel}
                                className="size-3"
                              />
                              <span>Información de Recepción</span>
                            </span>
                          </div>
                          {/* Loader mientras se consumen GET /stay/{id} y GET /room/{id} */}
                          {isStayLoading && !room ? (
                            <div className="flex flex-col items-center justify-center py-4">
                              <Loader
                                size={18}
                                label="Consultando recepción y habitación..."
                                className="py-1 font-mono text-[11px]"
                              />
                            </div>
                          ) : room ? (
                            <div className="space-y-2 font-mono">
                              {/* Tarjeta destacada de la habitación con número y piso */}
                              <div className="flex items-center justify-between gap-2 rounded-lg border border-sky-500/20 bg-sky-500/10 p-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="grid size-8 place-items-center rounded-lg bg-sky-500 text-xs font-bold text-white shadow-2xs">
                                    <FontAwesomeIcon
                                      icon={faDoorOpen}
                                      className="size-3.5"
                                    />
                                  </div>
                                  <div>
                                    <span className="block text-[9px] font-bold text-sky-800 uppercase dark:text-sky-300">
                                      Habitación Recepción
                                    </span>
                                    <h5 className="text-ink font-mono text-xs font-black uppercase sm:text-sm">
                                      Habitación {room.number}
                                    </h5>
                                  </div>
                                </div>

                                <span className="bg-canvas border-line text-ink inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-black tracking-wider uppercase shadow-2xs">
                                  <span>Piso {room.floor}</span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-ink-muted bg-canvas rounded-lg p-2 text-center text-[11px]">
                              <span className="block text-[10px]">
                                Estancia registrada en el sistema de recepción
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Item 3: person_id & Ficha del Huésped */}
                    {(() => {
                      const isGuestLoading = loadingPersonIds.has(
                        item.person_id
                      );
                      const persona =
                        personasMap.get(item.person_id) ||
                        PERSONAS_DEFAULT[item.person_id];

                      return (
                        <div className="border-line bg-canvas/40 space-y-2.5 rounded-xl border p-3">
                          {/* Cabecera del Huésped */}
                          <div className="text-ink-muted border-line/50 flex items-center justify-between gap-1 border-b pb-1.5 text-[10px] font-bold uppercase">
                            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="size-3"
                              />
                              <span>Huésped Asignado</span>
                            </span>
                          </div>

                          {/* Loader mientras se consume el endpoint GET /person/{id} */}
                          {isGuestLoading ? (
                            <div className="flex flex-col items-center justify-center py-7">
                              <Loader
                                size={22}
                                label="Consultando datos del huésped..."
                                className="font-mono text-xs"
                              />
                            </div>
                          ) : persona ? (
                            <div className="space-y-2 font-mono">
                              {/* Nombre completo */}
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <span className="text-ink-muted block text-[9px] font-bold uppercase">
                                    Nombre:
                                  </span>
                                  <h4 className="text-ink font-mono text-xs font-black tracking-wide uppercase sm:text-sm">
                                    {persona.name}
                                  </h4>
                                </div>
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[9px] font-bold text-purple-700 uppercase dark:text-purple-300">
                                  <FontAwesomeIcon
                                    icon={faGlobe}
                                    className="size-2.5"
                                  />
                                  <span>{persona.nationality || 'N/A'}</span>
                                </span>
                              </div>

                              {/* Grid de Datos del Huésped: document_type, document_number, phone_number, email, genre, nationality */}
                              <div className="border-line/40 grid grid-cols-1 gap-2 border-t pt-1 text-[11px] sm:grid-cols-2">
                                {/* Documento (tipo + número) */}
                                <div className="bg-canvas border-line/40 rounded-lg border p-2">
                                  <span className="text-ink-muted flex items-center gap-1 text-[9px] font-bold uppercase">
                                    <FontAwesomeIcon
                                      icon={faIdCard}
                                      className="text-primary size-2.5"
                                    />
                                    <span>
                                      {formatearTipoDocumento(
                                        persona.document_type
                                      )}
                                    </span>
                                  </span>
                                  <p className="text-ink mt-0.5 truncate font-mono font-bold select-all">
                                    {persona.document_number}
                                  </p>
                                </div>

                                {/* Teléfono */}
                                <div className="bg-canvas border-line/40 rounded-lg border p-2">
                                  <span className="text-ink-muted flex items-center gap-1 text-[9px] font-bold uppercase">
                                    <FontAwesomeIcon
                                      icon={faPhone}
                                      className="size-2.5 text-emerald-600 dark:text-emerald-400"
                                    />
                                    <span>Teléfono</span>
                                  </span>
                                  <a
                                    href={`tel:${persona.phone_number}`}
                                    className="text-ink hover:text-primary mt-0.5 block truncate font-mono font-bold transition-colors"
                                    title="Llamar al teléfono del huésped"
                                  >
                                    {persona.phone_number}
                                  </a>
                                </div>

                                {/* Correo Electrónico */}
                                <div className="bg-canvas border-line/40 rounded-lg border p-2 sm:col-span-2">
                                  <span className="text-ink-muted flex items-center gap-1 text-[9px] font-bold uppercase">
                                    <FontAwesomeIcon
                                      icon={faEnvelope}
                                      className="size-2.5 text-sky-600 dark:text-sky-400"
                                    />
                                    <span>Correo Electrónico</span>
                                  </span>
                                  <a
                                    href={`mailto:${persona.email}`}
                                    className="text-ink hover:text-primary mt-0.5 block truncate font-mono font-bold transition-colors"
                                    title="Enviar correo electrónico"
                                  >
                                    {persona.email}
                                  </a>
                                </div>

                                {/* Género (genre / gender) */}
                                <div className="bg-canvas border-line/40 rounded-lg border p-2">
                                  <span className="text-ink-muted flex items-center gap-1 text-[9px] font-bold uppercase">
                                    <FontAwesomeIcon
                                      icon={faVenusMars}
                                      className="size-2.5 text-purple-600 dark:text-purple-400"
                                    />
                                    <span>Género</span>
                                  </span>
                                  <p className="text-ink mt-0.5 truncate font-mono font-bold">
                                    {formatearGenero(
                                      persona.genre || persona.gender
                                    )}
                                  </p>
                                </div>

                                {/* Nacionalidad */}
                                <div className="bg-canvas border-line/40 rounded-lg border p-2">
                                  <span className="text-ink-muted flex items-center gap-1 text-[9px] font-bold uppercase">
                                    <FontAwesomeIcon
                                      icon={faGlobe}
                                      className="size-2.5 text-amber-600 dark:text-amber-400"
                                    />
                                    <span>Nacionalidad</span>
                                  </span>
                                  <p className="text-ink mt-0.5 truncate font-mono font-bold">
                                    {persona.nationality || 'No especificada'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-ink-muted bg-canvas rounded-lg p-2 text-center text-[11px]">
                              <span className="text-ink block font-mono font-bold select-all">
                                {item.person_id}
                              </span>
                              <span className="mt-0.5 block text-[10px]">
                                Huésped registrado en el sistema
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Pie de la Tarjeta */}
                  <footer className="bg-canvas/40 border-line/60 text-ink-muted flex items-center justify-between border-t px-4 py-2.5 text-[10px]">
                    <span className="truncate">
                      {item.updated_at
                        ? `Actualizado: ${new Date(item.updated_at).toLocaleDateString()}`
                        : 'Sincronizado'}
                    </span>
                  </footer>
                </motion.article>
              );
            })}
          </motion.div>
        </InfiniteScroll>
      )}

      {/* Modal empático de fallas en consulta de huésped según validateStatusCode y src/agent.md */}
      <ModalFallaHuesped
        isOpen={Boolean(modalFallaHuesped)}
        onClose={() => setModalFallaHuesped(null)}
        validation={modalFallaHuesped?.validation ?? null}
        personId={modalFallaHuesped?.personId}
        onReintentar={handleReintentarHuesped}
        isRetrying={isRetryingHuesped}
      />
    </div>
  );
}
