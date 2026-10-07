export type NavId =
  | 'home'
  | 'sedes'
  | 'habitacion'
  | 'tarifas'
  | 'cama'
  | 'reservas'
  | 'recepcion'
  | 'auditoria'
  | 'usuarios'
  | 'personas'
  | 'paletas'
  | 'recursos'
  | 'configuracion'
  | 'perfil';

export interface NavItem {
  id: NavId;
  label: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'configuracion', label: 'Configuración' },
] as const;

export interface PageMeta {
  title: string;
  subtitle: string;
  soonMessage: string;
}

export const PAGE_META: Record<NavId, PageMeta> = {
  home: {
    title: 'Resumen de hoy',
    subtitle:
      'Un vistazo a cómo respira tu red hotelera: ocupación, huéspedes y actividad reciente.',
    soonMessage: '',
  },
  sedes: {
    title: 'Sedes',
    subtitle:
      'Cada sede es un nuevo punto de encuentro para tus huéspedes. Aquí vive tu red.',
    soonMessage:
      'La gestión de tus sedes está tomando forma. Muy pronto podrás crear, ordenar y cuidar cada punto de tu red sin salir de este panel.',
  },
  habitacion: {
    title: 'Habitaciones',
    subtitle:
      'Todas tus habitaciones, su estado y su ocupación. Al instante y en un solo lugar.',
    soonMessage:
      'Estate atento: en breve podrás ver y gestionar cada habitación desde aquí, como se merece.',
  },
  tarifas: {
    title: 'Tarifas del hotel',
    subtitle:
      'Configura precios justos, turnos flexibles y fechas de vigencia para que tus huéspedes reserven con total certeza.',
    soonMessage: '',
  },
  cama: {
    title: 'Cama en 3D',
    subtitle:
      'Explora tu cama en tres dimensiones: gírala, acércate y descúbrela como si estuvieras frente a ella.',
    soonMessage: '',
  },
  reservas: {
    title: 'Reservas de habitaciones',
    subtitle:
      'Registra y asegura la estancia de tus huéspedes con disponibilidad y tarifas en tiempo real.',
    soonMessage: '',
  },
  recepcion: {
    title: 'Recepción y check-in de huéspedes',
    subtitle:
      'Da la bienvenida a tus huéspedes, asigna su habitación, valida el depósito de garantía y entrega llaves.',
    soonMessage: '',
  },
  auditoria: {
    title: 'Auditoría Operativa y Tarifaria',
    subtitle:
      'Control de calidad integral: conciliación física vs. sistema, invariantes financieras y brechas de tarifas.',
    soonMessage: '',
  },
  usuarios: {
    title: 'Registrar usuario',
    subtitle:
      'Suma nuevos integrantes a tu red y define desde el inicio su rol, su sede y su estado.',
    soonMessage: '',
  },
  personas: {
    title: 'Registro de personas',
    subtitle:
      'Suma y gestiona a tus clientes y proveedores en un solo lugar seguro y organizado.',
    soonMessage: '',
  },
  recursos: {
    title: 'Asignación de permisos',
    subtitle:
      'Definí qué puede ver y hacer cada usuario: recursos disponibles y permisos a tu medida.',
    soonMessage: '',
  },
  paletas: {
    title: 'Personalizar tu Nexora',
    subtitle:
      'Elegí la paleta de colores que mejor te represente y dejá que todo tu panel hable en tu tono.',
    soonMessage: '',
  },
  configuracion: {
    title: 'Configuración y Módulos',
    subtitle:
      'Supervisa los módulos del hotel, personaliza parámetros operacionales y mantén el control integral.',
    soonMessage: '',
  },
  perfil: {
    title: 'Mi Perfil de Usuario',
    subtitle:
      'Consulta y gestiona tu información personal, rol y datos de contacto.',
    soonMessage: '',
  },
};

/**
 * Lista exhaustiva de páginas donde el botón "Volver atrás"
 * retorna obligatoriamente a la página de Configuración ('configuracion'):
 * 1. Sedes ('sedes')
 * 2. Habitaciones ('habitacion')
 * 3. Tarifas ('tarifas')
 * 4. Camas en 3D ('cama')
 * 5. Reservas ('reservas')
 * 6. Recepción ('recepcion')
 * 7. Auditoría ('auditoria')
 * 8. Usuarios ('usuarios')
 * 9. Personas ('personas')
 * 10. Asignación de permisos ('recursos')
 * 11. Personalización ('paletas')
 */
export const BACK_TO_CONFIG_PAGES: readonly NavId[] = [
  'sedes',
  'habitacion',
  'tarifas',
  'cama',
  'reservas',
  'recepcion',
  'auditoria',
  'usuarios',
  'personas',
  'recursos',
  'paletas',
] as const;

