import type { NavId } from '../../dashboard/ui/navigation'

export type ModuloCategoria = 'todas' | 'operaciones' | 'comercial' | 'seguridad' | 'visual'

export interface CategoriaFiltro {
  id: ModuloCategoria
  label: string
  description: string
}

export const CATEGORIAS_CONFIGURACION: readonly CategoriaFiltro[] = [
  { id: 'todas', label: 'Todos', description: 'Todos los módulos del ecosistema Nexora' },
  { id: 'operaciones', label: 'Operaciones', description: 'Sedes, habitaciones, reservas y recepción' },
  { id: 'comercial', label: 'Comercial', description: 'Planes tarifarios, turnos y vigencias' },
  { id: 'seguridad', label: 'Seguridad y Accesos', description: 'Usuarios, directorio de personas y permisos RBAC' },
  { id: 'visual', label: 'Diseño y 3D', description: 'Camas tridimensionales y paletas de color' },
] as const

export const MODULO_A_CATEGORIA: Record<NavId, ModuloCategoria> = {
  home: 'operaciones',
  sedes: 'operaciones',
  habitacion: 'operaciones',
  tarifas: 'comercial',
  cama: 'visual',
  reservas: 'operaciones',
  recepcion: 'operaciones',
  auditoria: 'operaciones',
  usuarios: 'seguridad',
  personas: 'seguridad',
  recursos: 'seguridad',
  paletas: 'visual',
  configuracion: 'seguridad',
  perfil: 'seguridad',
}

export interface PreferenciasHotel {
  depositoGarantiaRequerido: boolean
  checkinExpress: boolean
  alertaOcupacionAlta: boolean
  auditoriaSegura: boolean
  modoMantenimiento: boolean
  sedePredeterminadaId: string
  monedaPredeterminada: string
}

export const PREFERENCIAS_HOTEL_DEFAULT: PreferenciasHotel = {
  depositoGarantiaRequerido: true,
  checkinExpress: true,
  alertaOcupacionAlta: true,
  auditoriaSegura: true,
  modoMantenimiento: false,
  sedePredeterminadaId: 'sede-central',
  monedaPredeterminada: 'COP ($)',
}
