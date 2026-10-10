import { supabase } from '../../lib/supabase'

/**
 * Nombre por defecto del bucket de almacenamiento para imágenes y fotos de room service.
 */
export const DEFAULT_ROOM_SERVICE_BUCKET = 'room_service_nexora'

export interface EnsureBucketResult {
  bucketName: string
  created: boolean
  exists: boolean
  error: string | null
}

export interface SubirImagenOptions {
  bucketName?: string
  customPath?: string
  folder?: string
  upsert?: boolean
}

export interface ResultadoSubidaImagen {
  success: boolean
  publicUrl: string | null
  filePath: string | null
  bucketName: string
  error: string | null
}

/**
 * Verifica si un bucket existe en el servicio de Storage de Supabase.
 *
 * @param bucketName Nombre del bucket a consultar (por defecto: 'room_service_nexora')
 * @returns `true` si el bucket existe, `false` en caso contrario o error 404
 */
export async function verificarExisteBucket(
  bucketName: string = DEFAULT_ROOM_SERVICE_BUCKET
): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName)

    if (error) {
      const msg = error.message?.toLowerCase() ?? ''
      // Si el mensaje indica que no se encontró (404 / not found)
      if (msg.includes('not found') || msg.includes('404')) {
        return false
      }

      // Verificación alternativa listando todos los buckets como mecanismo resiliente
      const { data: buckets } = await supabase.storage.listBuckets()
      if (buckets && Array.isArray(buckets)) {
        return buckets.some((b) => b.name === bucketName || b.id === bucketName)
      }

      return false
    }

    return Boolean(data)
  } catch {
    return false
  }
}

/**
 * Verifica la existencia del bucket de almacenamiento en Supabase.
 * En caso de ser la primera vez que se registra y el bucket no exista,
 * lo crea automáticamente con visibilidad pública ('public: true') y el nombre por defecto 'room_service_nexora'.
 * Si el bucket ya existe, lo reutiliza directamente como destino de las fotos.
 *
 * @param bucketName Nombre del bucket (por defecto: 'room_service_nexora')
 * @returns Objeto con el estado del bucket, si fue creado o ya existía, y posibles errores.
 */
export async function asegurarBucketExiste(
  bucketName: string = DEFAULT_ROOM_SERVICE_BUCKET
): Promise<EnsureBucketResult> {
  try {
    // 1. Verificar si ya existe en Supabase Storage
    const yaExiste = await verificarExisteBucket(bucketName)
    if (yaExiste) {
      return {
        bucketName,
        created: false,
        exists: true,
        error: null,
      }
    }

    // 2. Si no existe, crear el bucket por defecto configurado como público para servir imágenes
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 15 * 1024 * 1024, // 15 MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/svg+xml',
      ],
    })

    if (error) {
      // Si fue creado en concurrencia por otro proceso y ya existe
      if (error.message?.toLowerCase().includes('already exists')) {
        return {
          bucketName,
          created: false,
          exists: true,
          error: null,
        }
      }

      return {
        bucketName,
        created: false,
        exists: false,
        error: error.message,
      }
    }

    return {
      bucketName: data?.name || bucketName,
      created: true,
      exists: true,
      error: null,
    }
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Error inesperado al verificar o crear el bucket'
    return {
      bucketName,
      created: false,
      exists: false,
      error: errorMsg,
    }
  }
}

/**
 * Sube una foto o imagen a Supabase Storage:
 * 1. Comprueba si el bucket existe y lo crea automáticamente si no ('room_service_nexora').
 * 2. Normaliza el nombre del archivo con un timestamp único para evitar sobreescrituras accidentales.
 * 3. Ejecuta la subida y devuelve la URL pública permanente del archivo.
 *
 * @param file Objeto File proveniente del selector de archivos del dispositivo
 * @param options Opciones de configuración (bucket alternativo, carpeta, upsert)
 */
export async function subirImagenSupabase(
  file: File,
  options: SubirImagenOptions = {}
): Promise<ResultadoSubidaImagen> {
  const bucket = options.bucketName || DEFAULT_ROOM_SERVICE_BUCKET
  const folder = options.folder ? `${options.folder.replace(/\/+$/, '')}/` : ''

  try {
    // 1. Asegurar existencia del bucket (creación automática en primera vez)
    const bucketStatus = await asegurarBucketExiste(bucket)
    if (!bucketStatus.exists && bucketStatus.error) {
      console.warn(
        `[Supabase Storage] Aviso al verificar o crear el bucket "${bucket}": ${bucketStatus.error}`
      )
    }

    // 2. Normalizar y generar nombre seguro único
    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
    const baseName = file.name
      .replace(/\.[^/.]+$/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase()
    const filePath = options.customPath || `${folder}${Date.now()}_${baseName}.${extension}`

    // 3. Subir el archivo al bucket de Supabase
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: options.upsert ?? true,
        contentType: file.type || 'image/jpeg',
      })

    if (uploadError) {
      return {
        success: false,
        publicUrl: null,
        filePath: null,
        bucketName: bucket,
        error: uploadError.message,
      }
    }

    // 4. Obtener la URL pública de la imagen
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return {
      success: true,
      publicUrl: publicData.publicUrl,
      filePath: data.path,
      bucketName: bucket,
      error: null,
    }
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Error inesperado durante la subida a Supabase'
    return {
      success: false,
      publicUrl: null,
      filePath: null,
      bucketName: bucket,
      error: errorMsg,
    }
  }
}

/**
 * Obtiene la URL pública directa para un archivo almacenado en el bucket.
 *
 * @param path Ruta del archivo dentro del bucket
 * @param bucketName Nombre del bucket (por defecto: 'room_service_nexora')
 */
export function obtenerUrlPublicaImagen(
  path: string,
  bucketName: string = DEFAULT_ROOM_SERVICE_BUCKET
): string {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Elimina una imagen almacenada en Supabase Storage.
 *
 * @param path Ruta del archivo dentro del bucket
 * @param bucketName Nombre del bucket (por defecto: 'room_service_nexora')
 */
export async function eliminarImagenSupabase(
  path: string,
  bucketName: string = DEFAULT_ROOM_SERVICE_BUCKET
): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucketName).remove([path])
    return !error
  } catch {
    return false
  }
}
