import type { NavId } from '../ui/navigation';

export interface DashboardCardDefinition {
  id: NavId;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeVariant?: 'neutral' | 'success' | 'accent' | 'warning';
  iconName: string;
  accentColor: string;
  highlightMetric?: string;
  description: string;
}

export const DASHBOARD_CARDS: readonly DashboardCardDefinition[] = [
  {
    id: 'sedes',
    title: 'Sedes',
    subtitle: 'Red hotelera y ubicaciones',
    description:
      'Administra sedes principales, sucursales y torres de habitaciones.',
    badgeText: 'Activas',
    badgeVariant: 'success',
    iconName: 'BuildingIcon',
    accentColor:
      'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400',
    highlightMetric: 'Hoteles conectados',
  },
  {
    id: 'habitacion',
    title: 'Habitaciones',
    subtitle: 'Inventario y disponibilidad',
    description:
      'Control de estados: disponibles, ocupadas, limpieza o mantenimiento.',
    badgeText: 'En tiempo real',
    badgeVariant: 'accent',
    iconName: 'BedIcon',
    accentColor:
      'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    highlightMetric: 'Catálogo de estancias',
  },
  {
    id: 'tarifas',
    title: 'Tarifas',
    subtitle: 'Precios, vigencias y turnos',
    description:
      'Configura esquemas de cobro por noche, horas, días y fin de semana.',
    badgeText: 'Vigentes',
    badgeVariant: 'accent',
    iconName: 'TagIcon',
    accentColor:
      'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400',
    highlightMetric: 'Planes comerciales',
  },
  {
    id: 'cama',
    title: 'Camas en 3D',
    subtitle: 'Mobiliario tridimensional',
    description:
      'Explora modelos 3D interactivos, rotación 360° y capacidades de camas.',
    badgeText: '3D Interactivo',
    badgeVariant: 'neutral',
    iconName: 'CubeIcon',
    accentColor:
      'from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400',
    highlightMetric: 'Visualizador espacial',
  },
  {
    id: 'reservas',
    title: 'Reservas',
    subtitle: 'Check-ins y estancias',
    description:
      'Registro de huéspedes con selección de sede, fechas y tarifas dinámicas.',
    badgeText: 'Confirmadas',
    badgeVariant: 'success',
    iconName: 'CalendarIcon',
    accentColor:
      'from-sky-500/10 to-cyan-500/10 text-sky-600 dark:text-sky-400',
    highlightMetric: 'Gestor de ocupación',
  },
  {
    id: 'recepcion',
    title: 'Recepción',
    subtitle: 'Recepción y entrega de llaves',
    description:
      'Atención en mostrador, asignación de cuartos y depósitos de garantía.',
    badgeText: 'Front desk',
    badgeVariant: 'accent',
    iconName: 'ConciergeBellIcon',
    accentColor:
      'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400',
    highlightMetric: 'Atención ágil',
  },
  {
    id: 'auditoria',
    title: 'Auditoría',
    subtitle: 'Control físico y tarifario',
    description:
      'Conciliación de habitaciones, verificación de invariantes R14 y resolución de brechas.',
    badgeText: 'Control de Calidad',
    badgeVariant: 'accent',
    iconName: 'ClipboardCheckIcon',
    accentColor:
      'from-amber-500/10 to-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    highlightMetric: 'Matriz de conformidad',
  },
  {
    id: 'usuarios',
    title: 'Usuarios',
    subtitle: 'Equipo y colaboradores',
    description:
      'Gestión de operadores del sistema, roles asignados y sedes autorizadas.',
    badgeText: 'Equipo',
    badgeVariant: 'neutral',
    iconName: 'UserIcon',
    accentColor:
      'from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400',
    highlightMetric: 'Cuentas seguras',
  },
  {
    id: 'personas',
    title: 'Personas',
    subtitle: 'Directorio de huéspedes',
    description:
      'Registro civil, documentos de identidad, canales de contacto y proveedores.',
    badgeText: 'Directorio',
    badgeVariant: 'neutral',
    iconName: 'UsersIcon',
    accentColor:
      'from-fuchsia-500/10 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-400',
    highlightMetric: 'Fichas de clientes',
  },
  {
    id: 'recursos',
    title: 'Asignación de permisos',
    subtitle: 'Control de acceso granular',
    description:
      'Define qué pantallas, módulos y acciones puede ejecutar cada perfil.',
    badgeText: 'Seguridad',
    badgeVariant: 'warning',
    iconName: 'ShieldIcon',
    accentColor:
      'from-amber-500/10 to-red-500/10 text-amber-600 dark:text-amber-400',
    highlightMetric: 'Políticas RBAC',
  },
  {
    id: 'paletas',
    title: 'Personalización',
    subtitle: 'Colores y tema visual',
    description:
      'Ajusta la paleta cromática, contrastes y estética para toda la plataforma.',
    badgeText: 'Estilo',
    badgeVariant: 'accent',
    iconName: 'PaletteIcon',
    accentColor: 'from-emerald-500/10 to-cyan-500/10 text-primary',
    highlightMetric: 'Atmósfera Nexora',
  },
  {
    id: 'servicios',
    title: 'Servicio de habitaciones',
    subtitle: 'Servicio a la habitación',
    description:
      'Registro de pedidos de gastronomía y amenidades con cargo directo a la estancia.',
    badgeText: 'Cocina & Bar',
    badgeVariant: 'accent',
    iconName: 'UtensilsIcon',
    accentColor:
      'from-amber-600/10 to-orange-600/10 text-[#5a311f] dark:text-amber-400',
    highlightMetric: 'Órdenes y delivery',
  },
] as const;
