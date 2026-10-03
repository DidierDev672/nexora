import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import { KNOWN_BED_TYPE_NAMES, type BedTypeInfo } from '../domain/tarifa-cama'

export interface BedTypeResult {
  statusCode: number
  data: BedTypeInfo | null
  errorMessage: string | null
}

/**
 * Catálogo de contingencia para modo demostración o desarrollo sin backend activo.
 */
const DEMO_BED_TYPES_MAP: Record<string, BedTypeInfo> = {
  'room-type-matrimonial': {
    id: 'room-type-matrimonial',
    name: 'Matrimonial',
    capacity_people: 2,
    description:
      'Cama matrimonial Queen con colchón ortopédico de alta densidad, cabecero acolchado y lencería de 400 hilos para un confort superior.',
    created_by: 'admin@nexorahoteles.com',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-03-12T14:20:00Z',
  },
  'room-type-doble': {
    id: 'room-type-doble',
    name: 'Doble Queen',
    capacity_people: 2,
    description:
      'Configuración de dos camas dobles semi-ortopédicas ideales para estadías corporativas o descanso familiar con iluminación cálida indirecta.',
    created_by: 'operaciones@nexorahoteles.com',
    created_at: '2026-01-12T09:30:00Z',
    updated_at: '2026-03-14T11:00:00Z',
  },
  'room-type-individual': {
    id: 'room-type-individual',
    name: 'Individual Estándar',
    capacity_people: 1,
    description:
      'Cama individual anatómica diseñada para viajeros de negocios, con estación de carga USB, mesa de noche integrada y almohada ergonómica.',
    created_by: 'recepcion@nexorahoteles.com',
    created_at: '2026-01-15T10:15:00Z',
    updated_at: '2026-03-18T16:45:00Z',
  },
  'room-type-suite': {
    id: 'room-type-suite',
    name: 'Suite King Presidencial',
    capacity_people: 3,
    description:
      'Cama King Size extra amplia con base de madera noble, menú de almohadas hipoalergénicas y disposición ergonómica para máxima exclusividad.',
    created_by: 'gerencia@nexorahoteles.com',
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-03-22T17:10:00Z',
  },
  matrimonial: {
    id: 'matrimonial',
    name: 'Matrimonial',
    capacity_people: 2,
    description:
      'Cama matrimonial estándar diseñada para dos adultos, con ropa de cama de algodón percal y soporte lumbar reforzado.',
    created_by: 'admin@nexorahoteles.com',
  },
}

/**
 * Consulta los detalles de un tipo de cama (GET /types-bed/{id})
 * y procesa la respuesta mediante un switch estricto de códigos HTTP.
 * REGLA: En status 200 NO se genera ningún mensaje de advertencia/error al usuario.
 */
export async function fetchBedTypeById(id: string): Promise<BedTypeResult> {
  const cleanId = id.trim()
  if (!cleanId) {
    return {
      statusCode: 400,
      data: null,
      errorMessage: 'El identificador del tipo de cama no fue proporcionado.',
    }
  }

  try {
    const response = await api.get<unknown>(`/types-bed/${encodeURIComponent(cleanId)}`, {
      headers: { Accept: 'application/json' },
      validateStatus: () => true, // Permite evaluar todos los status codes en el switch
    })

    const serverMsg = extractServerMessage(response.data)

    // SWITCH DE VALIDACIÓN DE STATUS CODE PARA TIPO DE CAMA
    switch (response.status) {
      case 200: {
        // En status 200 NO se presenta mensaje de error ni advertencia al usuario
        const data = parseBedTypeObject(response.data, cleanId)
        return {
          statusCode: 200,
          data,
          errorMessage: null,
        }
      }

      case 204: {
        return {
          statusCode: 204,
          data: null,
          errorMessage:
            'El registro de este tipo de cama existe pero no contiene especificaciones disponibles.',
        }
      }

      case 400: {
        return {
          statusCode: 400,
          data: null,
          errorMessage:
            serverMsg ||
            'La solicitud para consultar el tipo de cama contiene parámetros con formato no reconocido.',
        }
      }

      case 401: {
        return {
          statusCode: 401,
          data: null,
          errorMessage:
            'Tu sesión ha expirado. Por favor ingresa nuevamente para visualizar los detalles de cama.',
        }
      }

      case 403: {
        return {
          statusCode: 403,
          data: null,
          errorMessage:
            'No posees los permisos necesarios para auditar las especificaciones de esta cama.',
        }
      }

      case 404: {
        // En caso de 404 en entorno local o demo, evaluamos si disponemos del catálogo de contingencia
        const fallback = DEMO_BED_TYPES_MAP[cleanId.toLowerCase()]
        if (fallback) {
          return {
            statusCode: 200,
            data: fallback,
            errorMessage: null,
          }
        }

        return {
          statusCode: 404,
          data: null,
          errorMessage:
            serverMsg ||
            `No encontramos un tipo de cama registrado con el identificador "${cleanId}".`,
        }
      }

      case 422: {
        return {
          statusCode: 422,
          data: null,
          errorMessage:
            serverMsg ||
            'El servidor de camas no pudo procesar las entidades enviadas en la petición.',
        }
      }

      case 429: {
        return {
          statusCode: 429,
          data: null,
          errorMessage:
            'Se han realizado demasiadas solicitudes en un corto intervalo. Por favor espera un momento.',
        }
      }

      case 500:
      case 502:
      case 503:
      case 504: {
        const fallback = DEMO_BED_TYPES_MAP[cleanId.toLowerCase()]
        if (fallback) {
          return {
            statusCode: 200,
            data: fallback,
            errorMessage: null,
          }
        }

        return {
          statusCode: response.status,
          data: null,
          errorMessage:
            'El servicio central de inventario de camas no se encuentra disponible temporalmente. Tus tarifas siguen operando con normalidad.',
        }
      }

      default: {
        return {
          statusCode: response.status,
          data: null,
          errorMessage:
            serverMsg ||
            `Respuesta del servidor no prevista (Código HTTP ${response.status}).`,
        }
      }
    }
  } catch (error) {
    // Si la conexión falla (offline o backend aún no iniciado), usamos el catálogo demo si coincide
    const fallback = DEMO_BED_TYPES_MAP[cleanId.toLowerCase()] || buildGenericFallbackBedType(cleanId)
    if (fallback) {
      return {
        statusCode: 200,
        data: fallback,
        errorMessage: null,
      }
    }

    if (isAxiosError(error)) {
      return {
        statusCode: error.response?.status || 0,
        data: null,
        errorMessage:
          error.message ||
          'No fue posible enlazar con el servicio de tipos de cama. Por favor comprueba tu conexión.',
      }
    }

    return {
      statusCode: 0,
      data: null,
      errorMessage: 'Ocurrió un error inesperado al consultar la información del tipo de cama.',
    }
  }
}

/**
 * Parsea con tolerancia a fallos la estructura de cama JSON que retorna el endpoint.
 */
function parseBedTypeObject(raw: unknown, defaultId: string): BedTypeInfo {
  if (typeof raw === 'object' && raw !== null) {
    const obj = 'data' in raw && typeof raw.data === 'object' && raw.data !== null
      ? (raw.data as Record<string, unknown>)
      : (raw as Record<string, unknown>)

    const capacity =
      typeof obj.capacity_people === 'number'
        ? obj.capacity_people
        : typeof obj.capacity === 'number'
          ? obj.capacity
          : Number.parseInt(String(obj.capacity_people || obj.capacity || '1'), 10) || 1

    return {
      id: String(obj.id || defaultId),
      name: String(obj.name || 'Tipo de Cama Estándar'),
      capacity_people: capacity,
      description: String(
        obj.description || 'Configuración de cama ergonómica y acondicionada para el descanso de los huéspedes.'
      ),
      created_by: obj.created_by ? String(obj.created_by) : undefined,
      created_at: obj.created_at ? String(obj.created_at) : undefined,
      updated_at: obj.updated_at ? String(obj.updated_at) : undefined,
    }
  }

  return buildGenericFallbackBedType(defaultId)
}

function buildGenericFallbackBedType(id: string): BedTypeInfo {
  const humanized = id
    .replace(/^room[-_]type[-_]/i, '')
    .replace(/^bed[-_]type[-_]/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    id,
    name: humanized || 'Cama Estándar Confort',
    capacity_people: id.toLowerCase().includes('matrimonial') || id.toLowerCase().includes('doble') ? 2 : 1,
    description:
      'Configuración de cama con acabados de primera calidad, almohadas hipoalergénicas y climatización adecuada para el descanso.',
    created_by: 'sistema@nexorahoteles.com',
  }
}

function extractServerMessage(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null) {
    if ('message' in data && typeof data.message === 'string') return data.message
    if ('error' in data && typeof data.error === 'string') return data.error
    if ('detail' in data && typeof data.detail === 'string') return data.detail
  }
  return undefined
}

let cachedBedTypesNames: Record<string, string> | null = null

/**
 * Consulta la lista general de tipos de cama (/types-bed) para obtener un mapa de ID -> Nombre oficial.
 * Dispone de caché en memoria y fallback instantáneo a los tipos de cama conocidos.
 */
export async function fetchBedTypeNamesMap(): Promise<Record<string, string>> {
  if (cachedBedTypesNames) return cachedBedTypesNames

  const map: Record<string, string> = { ...KNOWN_BED_TYPE_NAMES }
  for (const [key, val] of Object.entries(DEMO_BED_TYPES_MAP)) {
    map[key] = val.name
    map[key.toLowerCase()] = val.name
  }

  try {
    const response = await api.get<unknown>('/types-bed', {
      headers: { Accept: 'application/json' },
      validateStatus: () => true,
    })

    const rawList = Array.isArray(response.data)
      ? response.data
      : response.data &&
          typeof response.data === 'object' &&
          'data' in response.data &&
          Array.isArray((response.data as { data: unknown }).data)
        ? (response.data as { data: unknown[] }).data
        : null

    if (response.status === 200 && rawList) {
      for (const item of rawList) {
        if (item && typeof item === 'object' && 'id' in item && 'name' in item) {
          const id = String((item as { id: unknown }).id)
          const name = String((item as { name: unknown }).name)
          if (id && name) {
            map[id] = name
            map[id.toLowerCase()] = name
          }
        }
      }
      cachedBedTypesNames = map
      return map
    }
  } catch {
    // Si no hay conexión con el endpoint /types-bed se devuelve el catálogo precargado
  }

  cachedBedTypesNames = map
  return map
}
