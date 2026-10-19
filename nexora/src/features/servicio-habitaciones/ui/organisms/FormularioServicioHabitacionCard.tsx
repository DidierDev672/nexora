import { useState, useEffect, useCallback, useId } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import { Input } from '../../../../shared/ui/Input'
import { SelectField } from '../../../recursos/ui/atoms/select-field'
import { api } from '../../../../lib/api'
import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../../../shared/lib/status-code-validator'
import { readAuthTokenEmail, getRawJwtToken } from '../../../../shared/auth-storage'
import { Loader } from '../../../tema/ui/atoms/loader'
import { CampanaHotelAnimada } from '../atoms/CampanaHotelAnimada'
import { SeccionCargaImagen } from '../molecules/SeccionCargaImagen'
import {
  subirImagenSupabase,
  DEFAULT_ROOM_SERVICE_BUCKET,
} from '../../../../shared/services/supabase-storage.service'

// Modelos tipados de respuesta según endpoints indicados
interface SedeOption {
  id: string
  name: string
  address?: string
  city?: string
}

interface SubSedeOption {
  id: string
  headquarter_id?: string
  name: string
}

interface EdificioOption {
  id: string
  name: string
  floor_number?: number
}

// Datos de respaldo resilientes en caso de que el backend esté en pausa o fuera de línea
const FALLBACK_SEDES: SedeOption[] = [
  { id: '857476d852c2d215', name: 'Sede Central' },
  { id: 'hq-2', name: 'Sede Campestre Sol' },
  { id: 'hq-3', name: 'Sede Playa Mirador' },
]

const FALLBACK_SUB_SEDES: SubSedeOption[] = [
  { id: '3964a679462f9efc', headquarter_id: '857476d852c2d215', name: 'Sede Norte' },
  { id: 'sub-2', headquarter_id: '857476d852c2d215', name: 'Sede Sur San Isidro' },
  { id: 'sub-3', headquarter_id: 'hq-2', name: 'Anexo Valle Verde' },
  { id: 'sub-4', headquarter_id: 'hq-3', name: 'Pabellón Costa Mar' },
]

const FALLBACK_EDIFICIOS: EdificioOption[] = [
  { id: '161ecb4a52a33a52', name: 'Edificio A' },
  { id: 'building-2', name: 'Edificio B - Torre Ejecutiva' },
  { id: 'building-3', name: 'Edificio C - Suites Presidenciales' },
]

const DEFAULT_ASSET_URL = 'https://images.pexels.com/photos/3136318/pexels-photo-3136318.jpeg'

/**
 * Extrae el email del usuario desde localStorage bajo la clave "auth_token".
 * Analiza texto plano, objetos JSON o claims de JWT, con fallback al email asignado.
 */
function obtenerEmailAuthToken(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem('auth_token')
      if (raw) {
        const trimmed = raw.trim()
        if (trimmed.includes('@') && !trimmed.startsWith('{') && !trimmed.startsWith('[')) {
          return trimmed
        }
        try {
          const parsed = JSON.parse(trimmed) as Record<string, unknown>
          if (typeof parsed?.email === 'string' && parsed.email.trim()) {
            return parsed.email.trim()
          }
          if (typeof parsed?.Email === 'string' && parsed.Email.trim()) {
            return parsed.Email.trim()
          }
        } catch {
          // Si no es JSON simple, delegar a decodificador
        }
      }
    }
  } catch {
    // Si localStorage no está disponible
  }

  const fallback = readAuthTokenEmail()
  return fallback && fallback !== 'admin' && fallback.includes('@')
    ? fallback
    : 'ariasdev672@gmail.com'
}

/**
 * Genera un número aleatorio de dos dígitos (ej. 17).
 */
function generarNumeroDosDigitos(): string {
  const dosDigitos = Math.floor(10 + Math.random() * 90)
  return dosDigitos.toString()
}

export function FormularioServicioHabitacionCard() {
  const descId = useId()

  // 1. Order (código de orden numérico de 2 dígitos)
  const [order, setOrder] = useState('17')

  // 2. Sede (nombre e ID para consultar sub-sedes y construir payload)
  const [sedeId, setSedeId] = useState('857476d852c2d215')
  const [sede, setSede] = useState('Sede Central')
  const [sedes, setSedes] = useState<SedeOption[]>(FALLBACK_SEDES)
  const [loadingSedes, setLoadingSedes] = useState(false)

  // 3. Sub Sede (nombre e ID dependiente de la sede seleccionada)
  const [subSedeId, setSubSedeId] = useState('3964a679462f9efc')
  const [subSede, setSubSede] = useState('Sede Norte')
  const [subSedes, setSubSedes] = useState<SubSedeOption[]>(FALLBACK_SUB_SEDES)
  const [loadingSubSedes, setLoadingSubSedes] = useState(false)

  // 4. Edificio (nombre e ID del dropdown "Edificio", usado para building_id en el payload)
  const [edificioId, setEdificioId] = useState('161ecb4a52a33a52')
  const [edificio, setEdificio] = useState('Edificio A')
  const [edificios, setEdificios] = useState<EdificioOption[]>(FALLBACK_EDIFICIOS)
  const [loadingEdificios, setLoadingEdificios] = useState(false)

  // 5. Nombre del servicio
  const [nombreServicio, setNombreServicio] = useState('Bebidas y Cocteleria')

  // 6. Descripción del servicio
  const [descripcion, setDescripcion] = useState(
    'Seleccion de cocteles de autor, vinos, cervezas y bebidas refrescantes'
  )

  // 7. Imagen o foto seleccionada desde el dispositivo
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [assetUrl, setAssetUrl] = useState<string>(DEFAULT_ASSET_URL)

  // Estados de control de envío, loading y feedback psicológico
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<StatusCodeValidationResult | null>(null)

  // --- Carga de Sub-Sedes vía GET /sub-headquarters/by-headquarter/{id_headquarters} ---
  const fetchSubSedes = useCallback(async (headquarterId: string) => {
    if (!headquarterId) {
      setSubSedes([])
      setSubSedeId('')
      setSubSede('')
      return
    }
    setLoadingSubSedes(true)
    try {
      const response = await api.get(
        `/sub-headquarters/by-headquarter/${encodeURIComponent(headquarterId)}`,
        { validateStatus: () => true }
      )
      const validation = validateStatusCode(response.status)

      if (validation.isValid && response.data) {
        const raw = Array.isArray(response.data) ? response.data : [response.data]
        const items = raw
          .filter((item): item is { id: unknown; name: unknown } => Boolean(item && typeof item.name === 'string'))
          .map((item) => ({
            id: String(item.id ?? item.name),
            name: String(item.name),
          }))

        if (items.length > 0) {
          setSubSedes(items)
          if (!items.some((s) => s.id === subSedeId)) {
            setSubSedeId(items[0].id)
            setSubSede(items[0].name)
          }
          return
        }
      }

      const fallback = FALLBACK_SUB_SEDES.filter(
        (s) => s.headquarter_id === headquarterId || !s.headquarter_id
      )
      const res = fallback.length > 0 ? fallback : [{ id: '3964a679462f9efc', name: 'Sede Norte' }]
      setSubSedes(res)
      if (!res.some((s) => s.id === subSedeId)) {
        setSubSedeId(res[0].id)
        setSubSede(res[0].name)
      }
    } catch {
      const fallback = FALLBACK_SUB_SEDES.filter(
        (s) => s.headquarter_id === headquarterId || !s.headquarter_id
      )
      const res = fallback.length > 0 ? fallback : [{ id: '3964a679462f9efc', name: 'Sede Norte' }]
      setSubSedes(res)
      if (!res.some((s) => s.id === subSedeId)) {
        setSubSedeId(res[0].id)
        setSubSede(res[0].name)
      }
    } finally {
      setLoadingSubSedes(false)
    }
  }, [subSedeId])

  // --- Carga de Sedes vía GET /headquarters con validación de status code ---
  const fetchSedes = useCallback(async () => {
    setLoadingSedes(true)
    try {
      const response = await api.get('/headquarters', {
        validateStatus: () => true,
      })
      const validation = validateStatusCode(response.status)

      if (validation.isValid && response.data) {
        const raw = Array.isArray(response.data) ? response.data : [response.data]
        const items = raw
          .filter((item): item is { id: unknown; name: unknown } => Boolean(item && typeof item.name === 'string'))
          .map((item) => ({
            id: String(item.id ?? item.name),
            name: String(item.name),
          }))

        if (items.length > 0) {
          setSedes(items)
          if (!items.some((s) => s.id === sedeId)) {
            setSedeId(items[0].id)
            setSede(items[0].name)
            void fetchSubSedes(items[0].id)
          }
          return
        }
      }
      setSedes(FALLBACK_SEDES)
    } catch {
      setSedes(FALLBACK_SEDES)
    } finally {
      setLoadingSedes(false)
    }
  }, [sedeId, fetchSubSedes])

  // --- Carga de Edificios vía GET /building con validación de status code ---
  const fetchEdificios = useCallback(async () => {
    setLoadingEdificios(true)
    try {
      const response = await api.get('/building', {
        validateStatus: () => true,
      })
      const validation = validateStatusCode(response.status)

      if (validation.isValid && response.data) {
        const raw = Array.isArray(response.data) ? response.data : [response.data]
        const items = raw
          .filter((item): item is { id: unknown; name: unknown } => Boolean(item && typeof item.name === 'string'))
          .map((item) => ({
            id: String(item.id ?? item.name),
            name: String(item.name),
          }))

        if (items.length > 0) {
          setEdificios(items)
          // Preservar o seleccionar el edificio por defecto
          if (!items.some((e) => e.id === edificioId)) {
            setEdificioId(items[0].id)
            setEdificio(items[0].name)
          }
          return
        }
      }
      setEdificios(FALLBACK_EDIFICIOS)
    } catch {
      setEdificios(FALLBACK_EDIFICIOS)
    } finally {
      setLoadingEdificios(false)
    }
  }, [edificioId])

  // Cargar sedes y edificios al montar el componente
  useEffect(() => {
    void fetchSedes()
    void fetchEdificios()
  }, [fetchSedes, fetchEdificios])

  // Cambio de sede: actualiza ID y nombre, reinicia sub-sede y consulta /sub-headquarters/by-headquarter/{id}
  const handleSedeChange = (nuevaSedeId: string) => {
    setSedeId(nuevaSedeId)
    const encontrada = sedes.find((s) => s.id === nuevaSedeId)
    setSede(encontrada?.name ?? '')
    setSubSedeId('')
    setSubSede('')

    if (nuevaSedeId) {
      void fetchSubSedes(nuevaSedeId)
    } else {
      setSubSedes([])
    }
  }

  // Cambio de sub-sede: actualiza ID y nombre
  const handleSubSedeChange = (nuevaSubSedeId: string) => {
    setSubSedeId(nuevaSubSedeId)
    const encontrada = subSedes.find((s) => s.id === nuevaSubSedeId)
    setSubSede(encontrada?.name ?? '')
  }

  // Cambio de edificio: actualiza edificioId y nombre directamente desde el dropdown "Edificio"
  const handleEdificioChange = (nuevoEdificioId: string) => {
    setEdificioId(nuevoEdificioId)
    const encontrado = edificios.find((e) => e.id === nuevoEdificioId)
    setEdificio(encontrado?.name ?? '')
  }

  // Generador interactivo de número aleatorio de dos dígitos (ej. 17)
  const generarOrderAleatorio = () => {
    setOrder(generarNumeroDosDigitos())
  }

  // Manejo de imagen desde cualquier dispositivo y conversión a asset
  const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setImagenArchivo(file)
    setImagenPreview(previewUrl)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAssetUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    } else {
      setAssetUrl(DEFAULT_ASSET_URL)
    }
  }

  // Envío del formulario al endpoint /menu-category con método POST
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return

    setSaving(true)
    setFeedback(null)

    // 1. Subida a Supabase Storage (bucket 'room_service_nexora') si hay imagen seleccionada
    let finalAssetUrl = assetUrl || DEFAULT_ASSET_URL
    if (imagenArchivo) {
      try {
        const uploadResult = await subirImagenSupabase(imagenArchivo, {
          bucketName: DEFAULT_ROOM_SERVICE_BUCKET,
        })
        if (uploadResult.success && uploadResult.publicUrl) {
          finalAssetUrl = uploadResult.publicUrl
          setAssetUrl(uploadResult.publicUrl)
        }
      } catch (uploadErr) {
        console.warn('Aviso al subir imagen a Supabase Storage:', uploadErr)
      }
    }

    // 2. Obtención de building_id directamente del dropdown "Edificio"
    const resolvedBuildingId =
      edificioId ||
      edificios.find((e) => e.name === edificio)?.id ||
      '161ecb4a52a33a52'

    // Obtención de IDs de sede y sub-sede
    const resolvedHeadquarterId =
      sedeId ||
      sedes.find((s) => s.name === sede)?.id ||
      '857476d852c2d215'

    const resolvedSubHeadquarterId =
      subSedeId ||
      subSedes.find((s) => s.name === subSede)?.id ||
      '3964a679462f9efc'

    const orderNumber = Number(order)
    const resolvedOrder = Number.isFinite(orderNumber) ? orderNumber : 1

    // 3. Construcción exacta del payload con building_id obtenido del dropdown "Edificio"
    const payload = {
      headquartes_id: resolvedHeadquarterId,
      sub_headquartes_id: resolvedSubHeadquarterId,
      building_id: resolvedBuildingId, // Obtenido del dropdown "Edificio"
      name: nombreServicio.trim() || 'Bebidas y Cocteleria',
      description:
        descripcion.trim() ||
        'Seleccion de cocteles de autor, vinos, cervezas y bebidas refrescantes',
      order: resolvedOrder,
      asset: finalAssetUrl,
      created_by: obtenerEmailAuthToken() || 'ariasdev672@gmail.com',
    }

    try {
      const authToken = getRawJwtToken()
      const headers: Record<string, string> = {}
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`
        headers['auth-token'] = authToken
      }

      // Envío con Axios POST a /menu-category enviando el token de autenticación
      const [response] = await Promise.all([
        api.post('/menu-category', payload, {
          headers,
          validateStatus: () => true,
        }),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ])

      // Validación estricta del código de estado con status-code-validator
      const validation = validateStatusCode(response.status)
      setFeedback(validation)
    } catch (err: unknown) {
      let status = 500
      if (axios.isAxiosError(err) && err.response?.status) {
        status = err.response.status
      } else if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
        status = 408
      }
      const validation = validateStatusCode(status)
      setFeedback(validation)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Loader visual durante el guardado de la categoría o servicio */}
      <Loader
        visible={saving}
        overlay
        label="Guardando y emitiendo orden de servicio..."
      />

      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="w-full rounded-3xl border border-line bg-panel p-6 sm:p-8 shadow-xs"
      >
        {/* Cabecera de la Card con Copywriting Psicológico */}
        <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CampanaHotelAnimada />
            <div>
              <h2 className="font-serif text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Registro de Servicios a la Habitación
              </h2>
              <p className="text-xs text-ink-muted leading-relaxed">
                Asigna la ubicación de sede y edificio, ingresa la orden con precisión y añade la fotografía del servicio.
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de feedback psicológico según StatusCodeValidationResult */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`mt-6 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3.5 text-xs shadow-xs transition-colors ${
                feedback.category === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : feedback.category === 'info'
                    ? 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300'
                    : feedback.category === 'warning'
                      ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-base leading-none">
                  {feedback.category === 'success' && '✅'}
                  {feedback.category === 'info' && 'ℹ️'}
                  {feedback.category === 'warning' && '⚠️'}
                  {feedback.category === 'error' && '❌'}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {feedback.title ||
                        (feedback.isValid ? 'Categoría registrada con éxito' : 'Aviso del sistema')}
                    </span>
                    <span className="rounded-md bg-black/10 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold">
                      HTTP {feedback.status}
                    </span>
                  </div>
                  <p className="font-normal opacity-90 leading-relaxed">
                    {feedback.message ||
                      `Categoría "${nombreServicio || 'Bebidas y Cocteleria'}" guardada y emitida exitosamente en el sistema.`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="opacity-70 hover:opacity-100 cursor-pointer p-0.5 transition-opacity"
                title="Cerrar notificación"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* 1. Order con botón para obtener un número aleatorio */}
            <div>
              <Input
                label="Order (Código de orden)"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="Ej: 17"
                required
                hint="Identificador numérico de orden o secuencia (dos dígitos)."
                action={
                  <button
                    type="button"
                    onClick={generarOrderAleatorio}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 active:scale-95 transition-all cursor-pointer"
                    title="Generar número aleatorio de dos dígitos"
                  >
                    <span>Aleatorio</span>
                  </button>
                }
              />
            </div>

            {/* 2. Sede (consume /headquarters con axios) */}
            <div>
              <SelectField
                label="Sede"
                placeholder={loadingSedes ? 'Consultando sedes…' : 'Selecciona una sede…'}
                value={sedeId}
                onChange={(e) => handleSedeChange(e.target.value)}
                options={sedes.map((s) => ({ value: s.id, label: s.name }))}
                required
                disabled={loadingSedes}
                emptyLabel={
                  loadingSedes
                    ? 'Cargando sedes desde el servidor…'
                    : 'No hay sedes disponibles.'
                }
              />
            </div>

            {/* 3. Sub Sede (consume /sub-headquarters/by-headquarter/{id} a partir de la sede) */}
            <div>
              <SelectField
                label="Sub sede"
                placeholder={
                  !sedeId
                    ? 'Primero selecciona una sede…'
                    : loadingSubSedes
                      ? 'Consultando sub sedes…'
                      : 'Selecciona una sub sede…'
                }
                value={subSedeId}
                onChange={(e) => handleSubSedeChange(e.target.value)}
                options={subSedes.map((sub) => ({ value: sub.id, label: sub.name }))}
                required
                disabled={!sedeId || loadingSubSedes}
                emptyLabel={
                  loadingSubSedes
                    ? 'Cargando sub sedes…'
                    : !sedeId
                      ? 'Debes elegir una sede para consultar sus sub sedes'
                      : 'No hay sub sedes disponibles para esta sede.'
                }
              />
            </div>

            {/* 4. Edificio (dropdown "Edificio": su valor seleccionado determina building_id en el payload) */}
            <div>
              <SelectField
                label="Edificio"
                placeholder={loadingEdificios ? 'Consultando edificios…' : 'Selecciona un edificio…'}
                value={edificioId}
                onChange={(e) => handleEdificioChange(e.target.value)}
                options={edificios.map((ed) => ({ value: ed.id, label: ed.name }))}
                required
                disabled={loadingEdificios}
                emptyLabel={
                  loadingEdificios
                    ? 'Cargando edificios…'
                    : 'No hay edificios disponibles.'
                }
              />
            </div>
          </div>

          {/* 5. Nombre del servicio */}
          <div>
            <Input
              label="Nombre del servicio"
              value={nombreServicio}
              onChange={(e) => setNombreServicio(e.target.value)}
              placeholder="Ej: Bebidas y Cocteleria"
              required
              hint="Nombre de la categoría o servicio gastronómico."
            />
          </div>

          {/* 6. Descripción del servicio */}
          <div>
            <label htmlFor={descId} className="mb-1.5 block text-sm font-medium text-ink">
              Descripción
            </label>
            <textarea
              id={descId}
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe los ingredientes, horarios de servicio o cocteles de autor..."
              className="w-full rounded-2xl border border-line bg-panel p-3.5 text-xs text-ink placeholder:text-ink-soft outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* 7. Sección para seleccionar imagen o foto desde cualquier dispositivo (PC, Android, iOS, Mac, Linux) */}
          <div className="pt-2">
            <SeccionCargaImagen
              imageFile={imagenArchivo}
              imagePreview={imagenPreview}
              onImageChange={handleImageChange}
            />
          </div>

          {/* Botón de acción principal */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <>
                  <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Guardando...</span>
                </>
              ) : (
                'Guardar y emitir orden de servicio'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  )
}
