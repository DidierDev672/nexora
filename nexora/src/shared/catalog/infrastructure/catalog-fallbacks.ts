import type {
  PersonCatalogItem,
  RoomCatalogItem,
  RoomTypeCatalogItem,
  BedTypeCatalogItem,
  BuildingCatalogItem,
  HeadquarterCatalogItem,
  SubHeadquarterCatalogItem,
  RoleCatalogItem,
} from '../domain/catalog-types'

export const FALLBACK_PERSONS: Record<string, PersonCatalogItem> = {
  'person-1': {
    id: 'person-1',
    document_type: 'id_card',
    document_number: '12345678',
    name: 'Juan Pérez',
    phone_number: '999888777',
    email: 'juan@example.com',
    status: 'active',
  } as PersonCatalogItem,
  'person-2': {
    id: 'person-2',
    document_type: 'passport',
    document_number: 'P-98765432',
    name: 'María Gómez',
    phone_number: '987112233',
    email: 'maria.gomez@example.com',
  },
  'person-10': {
    id: 'person-10',
    document_type: 'national_id',
    document_number: '71234567',
    name: 'Carlos Mendoza',
    phone_number: '976543210',
    email: 'carlos.mendoza@empresa.com',
  },
  'person-35': {
    id: 'person-35',
    document_type: 'foreign_id',
    document_number: 'CE-55443322',
    name: 'Alexander Weber',
    phone_number: '944332211',
    email: 'a.weber@globalgroup.de',
  },
  'person-8': {
    id: 'person-8',
    document_type: 'national_id',
    document_number: '65432109',
    name: 'Lucía Fernández',
    phone_number: '965432109',
    email: 'lucia.fernandez@correo.com',
  },
}

export const FALLBACK_ROOMS: Record<string, RoomCatalogItem> = {
  'room-1': {
    id: 'room-1',
    number: '101',
    floor: 1,
    room_types_id: 'type-1',
    building_id: 'building-1',
    price_override: null,
    status: 'available',
    has_reception: true,
  },
  'room-102': {
    id: 'room-102',
    number: '102',
    floor: 1,
    room_types_id: 'type-2',
    building_id: 'building-1',
    price_override: null,
    status: 'available',
    has_reception: true,
  },
  'suite-presidencial-01': {
    id: 'suite-presidencial-01',
    number: '301',
    floor: 3,
    room_types_id: 'type-presidential',
    building_id: 'building-1',
    price_override: 350000,
    status: 'available',
    has_reception: true,
  },
  'room-205': {
    id: 'room-205',
    number: '205',
    floor: 2,
    room_types_id: 'type-family',
    building_id: 'building-2',
    price_override: null,
    status: 'available',
    has_reception: true,
  },
}

export const FALLBACK_ROOM_TYPES: Record<string, RoomTypeCatalogItem> = {
  'type-1': {
    id: 'type-1',
    name: 'Suite Deluxe',
    capacity: 4,
    base_price: 450.0,
  },
  'type-2': {
    id: 'type-2',
    name: 'Doble Superior',
    capacity: 2,
    base_price: 280.0,
  },
  'type-3': {
    id: 'type-3',
    name: 'Habitación Familiar',
    capacity: 4,
    base_price: 320.0,
  },
  'type-presidential': {
    id: 'type-presidential',
    name: 'Suite Presidencial Imperial',
    capacity: 6,
    base_price: 850.0,
  },
  'type-family': {
    id: 'type-family',
    name: 'Familiar Premium',
    capacity: 5,
    base_price: 380.0,
  },
}

export const FALLBACK_BED_TYPES: Record<string, BedTypeCatalogItem> = {
  'bed-type-1': {
    id: 'bed-type-1',
    name: 'Cama Matrimonial King',
    capacity_people: 2,
    description: 'Colchón ortopédico de alta densidad con almohadas hipoalergénicas.',
  },
  'bed-type-2': {
    id: 'bed-type-2',
    name: 'Cama Individual Confort',
    capacity_people: 1,
    description: 'Diseño compacto con somier ergonómico.',
  },
}

export const FALLBACK_BUILDINGS: Record<string, BuildingDetailItem> = {
  'building-1': {
    id: 'building-1',
    name: 'Torre A',
    floor_number: 12,
    headquarters_id: 'hq-1',
    sub_headquarters_id: null,
    status: 'active',
  },
  'building-2': {
    id: 'building-2',
    name: 'Torre B - Norte',
    floor_number: 8,
    headquarters_id: 'hq-1',
    sub_headquarters_id: 'shq-1',
    status: 'active',
  },
}

type BuildingDetailItem = BuildingCatalogItem

export const FALLBACK_HEADQUARTERS: Record<string, HeadquarterCatalogItem> = {
  'hq-1': {
    id: 'hq-1',
    name: 'Sede Central Principal',
    address: 'Av. Javier Prado Este 1234',
    city: 'Lima Metropolitana',
    phone: '+51 (1) 456-7890',
    status: 'active',
  },
  'hq-2': {
    id: 'hq-2',
    name: 'Sede Campestre Sol',
    address: 'Carretera Central Km 28',
    city: 'Chosica',
    phone: '+51 (1) 789-0123',
    status: 'active',
  },
}

export const FALLBACK_SUB_HEADQUARTERS: Record<string, SubHeadquarterCatalogItem> = {
  'shq-1': {
    id: 'shq-1',
    headquarter_id: 'hq-1',
    name: 'Subsede Norte Los Olivos',
    address: 'Av. Carlos Izaguirre 890',
    phone: '+51 (1) 988-7776',
    status: 'active',
  },
  'shq-2': {
    id: 'shq-2',
    headquarter_id: 'hq-1',
    name: 'Anexo Torre Ejecutiva San Isidro',
    address: 'Calle Las Begonias 450, Piso 8',
    phone: '+51 (1) 321-6540',
    status: 'active',
  },
  'shq-3': {
    id: 'shq-3',
    headquarter_id: 'hq-2',
    name: 'Subsede Ribera del Río',
    address: 'Malecón Turístico 105',
    phone: '+51 (1) 654-9870',
    status: 'active',
  },
}

export const FALLBACK_ROLES: Record<string, RoleCatalogItem> = {
  'role-1': {
    id: 'role-1',
    name: 'recepcion',
    description: 'Personal de recepción',
  },
  'recepcion': {
    id: 'role-1',
    name: 'recepcion',
    description: 'Personal de recepción',
  },
  'role-2': {
    id: 'role-2',
    name: 'administrador',
    description: 'Gestión administrativa integral, sedes, configuración y permisos de la red.',
  },
  'admin': {
    id: 'role-2',
    name: 'administrador',
    description: 'Gestión administrativa integral, sedes, configuración y permisos de la red.',
  },
  'role-3': {
    id: 'role-3',
    name: 'supervisor',
    description: 'Supervisión de operaciones de habitaciones, auditoría de turnos y calidad.',
  },
  'operaciones': {
    id: 'role-3',
    name: 'operaciones',
    description: 'Supervisión de operaciones de habitaciones, auditoría de turnos y calidad.',
  },
  'role-admin': {
    id: 'role-admin',
    name: 'administrador general',
    description: 'Control global del ecosistema hotelero y administración general.',
  },
  'role-reception': {
    id: 'role-reception',
    name: 'recepcionista',
    description: 'Atención en recepción y gestión de reservas en turno.',
  },
  'atencion_cliente': {
    id: 'role-atencion',
    name: 'atención al cliente',
    description: 'Atención al huésped y resolución de solicitudes durante la estancia.',
  },
  'huesped': {
    id: 'role-huesped',
    name: 'huésped',
    description: 'Huésped registrado en la plataforma hotelera.',
  },
  'mantenimiento': {
    id: 'role-mantenimiento',
    name: 'mantenimiento',
    description: 'Mantenimiento técnico y adecuación de instalaciones.',
  },
}


