import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { motion } from 'motion/react'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import { api } from '../../../../lib/api'
import { readTokenEmail } from '../../../../shared/auth-storage'
import { Input } from '../../../../shared/ui/Input'
import { Loader } from '../../../roles/ui/atoms/loader'
import { Button } from '../atoms/button'
import { FadeIn } from '../atoms/fade-in'
import { Pildora } from '../atoms/pildora'
import { SelectField, type SelectFieldOption } from '../atoms/select-field'
import { cn } from '../lib/cn'
import { esTipoSofa, type TipoCama } from '../../domain/tipo-cama'
import { TiposCamaGrid } from './tipos-cama-grid'

export interface CamaAsignadaInfo {
  id: string
  nombre: string
  capacidad: number
}

export type CamaStatus = 'active' | 'maintenance'

export interface CreateBedApiPayload {
  room_id: string
  types_bed_id: string[]
  etiquette: string
  status: CamaStatus
  created_by: string
}

const ESTADO_CAMA_OPTIONS: ReadonlyArray<SelectFieldOption> = [
  { value: 'active', label: 'Activa' },
  { value: 'maintenance', label: 'Mantenimiento' },
]

export interface AsignarCamaPayload {
  id?: string
  habitacionId: string
  habitacionLabel?: string
  etiqueta: string
  status: CamaStatus
  camasAsignadas?: CamaAsignadaInfo[]
  capacidadTotal?: number
  tipoCamaId?: string
  tipoCamaNombre?: string
}

export interface AsignarCamaCardProps {
  onSuccess?: (payload: AsignarCamaPayload) => void
  className?: string
}

export interface CamaAsignadaItem {
  uid: string
  tipo: TipoCama
}

interface ApiRoom {
  id: string
  number: string | number
  floor: string | number
  building_id?: string
  room_types_id?: string
  status?: string
}

interface ApiBuilding {
  id: string
  name: string
  floor_number?: number
  status?: string
}

function parseRooms(data: unknown): ApiRoom[] {
  if (Array.isArray(data)) {
    return data as ApiRoom[]
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.data)) {
      return obj.data as ApiRoom[]
    }
    if (obj.id != null && obj.number != null) {
      return [
        {
          id: String(obj.id),
          number: String(obj.number),
          floor: obj.floor != null ? String(obj.floor) : '1',
          building_id: typeof obj.building_id === 'string' ? obj.building_id : undefined,
        },
      ]
    }
  }
  return []
}

function parseBuildingName(data: unknown): string {
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0] as Partial<ApiBuilding>
    return typeof first?.name === 'string' ? first.name : 'Edificio'
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (typeof obj.name === 'string') {
      return obj.name
    }
    if (obj.data && typeof obj.data === 'object') {
      const sub = obj.data as Record<string, unknown>
      if (typeof sub.name === 'string') {
        return sub.name
      }
    }
  }
  return 'Edificio'
}

export function AsignarCamaCard({ onSuccess, className }: AsignarCamaCardProps) {
  const [habitaciones, setHabitaciones] = useState<SelectFieldOption[]>([])
  const [cargandoHabitaciones, setCargandoHabitaciones] = useState(true)
  const [errorHabitaciones, setErrorHabitaciones] = useState<string | null>(null)

  const [habitacionId, setHabitacionId] = useState('')
  const [etiqueta, setEtiqueta] = useState('')
  const [status, setStatus] = useState<CamaStatus>('active')
  const [camasAsignadas, setCamasAsignadas] = useState<CamaAsignadaItem[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const [habitacionError, setHabitacionError] = useState<string | null>(null)
  const [etiquetaError, setEtiquetaError] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [tiposError, setTiposError] = useState<string | null>(null)

  const [guardando, setGuardando] = useState(false)
  const [guardadoExitoso, setGuardadoExitoso] = useState<AsignarCamaPayload | null>(null)
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null)

  const handleAgregarTipo = (tipo: TipoCama) => {
    const nuevoItem: CamaAsignadaItem = {
      uid: `${tipo.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tipo,
    }
    setCamasAsignadas((prev) => [...prev, nuevoItem])
    if (tiposError) setTiposError(null)
  }

  const handleRemoverTipo = (uid: string) => {
    setCamasAsignadas((prev) => prev.filter((item) => item.uid !== uid))
  }

  const handleLimpiarTodos = () => {
    setCamasAsignadas([])
  }

  const totalCapacidadAsignada = camasAsignadas.reduce(
    (acc, curr) => acc + curr.tipo.capacity_people,
    0,
  )

  const fetchHabitaciones = useCallback(async () => {
    setCargandoHabitaciones(true)
    setErrorHabitaciones(null)

    try {
      const roomResponse = await api.get<unknown>('/room')
      if (roomResponse.status !== 200) {
        setErrorHabitaciones(
          'Tuvimos un momento de pausa al conectar con el registro de tus habitaciones. Tus datos están a salvo: puedes volver a intentarlo cuando gustes.',
        )
        return
      }

      const rooms = parseRooms(roomResponse.data)

      if (rooms.length === 0) {
        setHabitaciones([])
        return
      }

      // Obtener los edificios asociados a cada habitación
      const buildingCache = new Map<string, string>()
      const buildingIds = Array.from(
        new Set(rooms.map((r) => r.building_id).filter((id): id is string => Boolean(id))),
      )

      await Promise.all(
        buildingIds.map(async (bId) => {
          try {
            const bResponse = await api.get<unknown>(`/building/${bId}`)
            if (bResponse.status === 200) {
              const bName = parseBuildingName(bResponse.data)
              buildingCache.set(bId, bName)
            }
          } catch (err) {
            // Si el endpoint de edificio arroja 400 u otro error, se maneja de forma resiliente
            const status = isAxiosError(err) ? err.response?.status : undefined
            if (status === 400) {
              setErrorHabitaciones(
                'No pudimos sincronizar los detalles del edificio en este momento. Tu información sigue segura; pulsa reintentar cuando quieras.',
              )
            }
          }
        }),
      )

      // Formato solicitado: name - number - floor
      const options: SelectFieldOption[] = rooms.map((room) => {
        const buildingName = room.building_id
          ? buildingCache.get(room.building_id) ?? 'Edificio'
          : 'Edificio'
        return {
          value: String(room.id),
          label: `${buildingName} - Hab. ${room.number} - Piso ${room.floor}`,
        }
      })

      setHabitaciones(options)
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined
      if (status === 400) {
        setErrorHabitaciones(
          'No logramos cargar la lista de habitaciones en este momento. No te preocupes, tus datos están a salvo: puedes volver a intentarlo cuando gustes.',
        )
      } else {
        setErrorHabitaciones(
          'Hubo un pequeño tropiezo al conectar con tus habitaciones. Puedes reintentar la conexión en unos momentos.',
        )
      }
    } finally {
      setCargandoHabitaciones(false)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      await fetchHabitaciones()
    })()
  }, [fetchHabitaciones])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorRegistro(null)
    let hasError = false

    if (!habitacionId) {
      setHabitacionError('Selecciona la habitación donde se ubicará la cama.')
      hasError = true
    }

    const valorEtiqueta = etiqueta.trim()
    if (!valorEtiqueta) {
      setEtiquetaError('Escribe una etiqueta para que tu equipo y huéspedes reconozcan la cama sin confusiones.')
      hasError = true
    } else if (valorEtiqueta.length < 2) {
      setEtiquetaError('La etiqueta es muy corta: usa al menos 2 caracteres para identificarla bien.')
      hasError = true
    } else if (valorEtiqueta.length > 50) {
      setEtiquetaError('Mantén la etiqueta breve y clara, con menos de 50 caracteres.')
      hasError = true
    }

    if (!status) {
      setStatusError('Selecciona el estado de la cama o sofá.')
      hasError = true
    }

    if (camasAsignadas.length === 0) {
      setTiposError(
        'Para brindarle el máximo confort a tus huéspedes, arrastra al menos un tipo de cama o sofá a esta sección.',
      )
      hasError = true
    }

    if (hasError) return

    // Activamos el combo Loader mientras construimos y enviamos en segundo plano
    setGuardando(true)

    const typesBedId = camasAsignadas.map((c) => c.tipo.id)
    const createdBy = readTokenEmail()

    const apiPayload: CreateBedApiPayload = {
      room_id: habitacionId,
      types_bed_id: typesBedId,
      etiquette: valorEtiqueta,
      status,
      created_by: createdBy,
    }

    try {
      const response = await api.post<Record<string, unknown>>('/bed', apiPayload)

      if (response.status === 201) {
        const capacidadTotal = camasAsignadas.reduce(
          (acc, curr) => acc + curr.tipo.capacity_people,
          0,
        )
        const habitacionSeleccionada = habitaciones.find((h) => h.value === habitacionId)?.label
        const responseData = response.data
        const generatedId =
          typeof responseData?.id === 'string'
            ? responseData.id
            : typeof (responseData?.data as Record<string, unknown> | undefined)?.id === 'string'
              ? ((responseData?.data as Record<string, unknown>).id as string)
              : undefined

        const successPayload: AsignarCamaPayload = {
          id: generatedId,
          habitacionId,
          habitacionLabel: habitacionSeleccionada,
          etiqueta: valorEtiqueta,
          status,
          camasAsignadas: camasAsignadas.map((c) => ({
            id: c.tipo.id,
            nombre: c.tipo.name,
            capacidad: c.tipo.capacity_people,
          })),
          capacidadTotal,
          tipoCamaId: camasAsignadas[0]?.tipo.id,
          tipoCamaNombre: camasAsignadas
            .map((c) => `${c.tipo.name},${c.tipo.capacity_people}`)
            .join(' | '),
        }

        setGuardadoExitoso(successPayload)
        onSuccess?.(successPayload)
      } else {
        // Status code recibido diferente al 201
        setErrorRegistro(
          'No te preocupes, tus selecciones y datos siguen totalmente a salvo aquí. Se presentó una respuesta imprevista del servidor al registrar la cama en la habitación. Puedes pulsar nuevamente en «Asignar cama» para reintentar cuando gustes.',
        )
      }
    } catch (error) {
      // Manejo empático de error de red o respuesta HTTP con código != 201
      const statusCode = isAxiosError(error) ? error.response?.status : undefined
      if (statusCode && statusCode !== 201) {
        setErrorRegistro(
          `No te preocupes, tu información está protegida en el formulario. Ocurrió un pequeño contratiempo con el servidor (código ${statusCode}) al registrar la cama en la habitación. Por favor, pulsa «Asignar cama» para reintentar.`,
        )
      } else {
        setErrorRegistro(
          'No te preocupes, ninguno de tus datos se ha perdido. Tuvimos una interrupción momentánea de conexión al registrar la cama en la habitación. Verifica tu red y pulsa «Asignar cama» para reintentar.',
        )
      }
    } finally {
      setGuardando(false)
    }
  }

  const handleReset = () => {
    setHabitacionId('')
    setEtiqueta('')
    setStatus('active')
    setCamasAsignadas([])
    setHabitacionError(null)
    setEtiquetaError(null)
    setStatusError(null)
    setTiposError(null)
    setErrorRegistro(null)
    setGuardadoExitoso(null)
  }

  return (
    <motion.section
      id="seccion-asignar-camas"
      aria-labelledby="asignar-cama-titulo"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={cn('mt-10 scroll-mt-6', className)}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[130px_1fr] lg:items-start">
        {/* Barra lateral para tipos de cama (avatares 3D circulares con efecto de onda progresivo) */}
        <aside
          aria-label="Catálogo de tipos de cama"
          className="rounded-2xl border border-line bg-panel p-3 shadow-sm lg:sticky lg:top-6 overflow-visible"
        >
          <div className="mb-3.5 flex items-center justify-center border-b border-line pb-3">
            <span
              className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary shadow-2xs"
              aria-hidden="true"
            >
              <BedDoubleIcon className="size-4.5" />
            </span>
          </div>

          <TiposCamaGrid
            variant="sidebar"
            className="mt-0"
            onSelectTipo={handleAgregarTipo}
          />
        </aside>

        {/* Card principal: Asignar camas a tu habitación */}
        <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm sm:p-8">
          {/* Header con copywriting psicológico */}
          <div className="flex items-start gap-4">
            <div
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <TagBedIcon />
            </div>
            <div className="space-y-1">
              <h2 id="asignar-cama-titulo" className="text-xl font-bold tracking-tight text-ink">
                Asignar camas a tu habitación
              </h2>
              <p className="text-sm leading-relaxed text-ink-muted">
                Organiza los espacios de descanso de forma intuitiva. Dale una etiqueta clara a cada cama
                para que tu equipo y tus huéspedes la ubiquen al primer vistazo.
              </p>
            </div>
          </div>

          {/* Banner de error amigable y psicológico si fallan las habitaciones */}
          {errorHabitaciones && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-2.5">
                <span className="shrink-0 text-amber-600 dark:text-amber-400">
                  <AlertCircleIcon />
                </span>
                <p role="status" className="text-sm font-medium text-ink">
                  {errorHabitaciones}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                onClick={() => void fetchHabitaciones()}
                disabled={cargandoHabitaciones}
              >
                Reintentar
              </Button>
            </motion.div>
          )}

          {/* Banner de error amigable y psicológico al intentar registrar la cama */}
          {errorRegistro && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 flex flex-col items-start justify-between gap-3.5 rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400">
                  <AlertCircleIcon className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-ink">
                    Tuvimos un momento de pausa al registrar la cama
                  </p>
                  <p className="text-xs leading-relaxed text-ink-muted">
                    {errorRegistro}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 self-end sm:self-auto"
                onClick={() => setErrorRegistro(null)}
              >
                Entendido
              </Button>
            </motion.div>
          )}

          {guardadoExitoso ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                  <CheckIcon />
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-ink">
                      ¡Excelente trabajo! La cama «{guardadoExitoso.etiqueta}» se ha registrado con éxito en la habitación
                    </p>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      Registrada (201)
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-muted">
                    {guardadoExitoso.habitacionLabel ? (
                      <>Ubicación confirmada en <strong className="font-semibold text-ink">{guardadoExitoso.habitacionLabel}</strong>. </>
                    ) : null}
                    La cama ya quedó vinculada y lista para recibir a tus huéspedes con total comodidad. Todo tu equipo podrá ubicarla de inmediato.
                  </p>
                  {guardadoExitoso.camasAsignadas && guardadoExitoso.camasAsignadas.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {guardadoExitoso.camasAsignadas.map((c, idx) => (
                        <span
                          key={`${c.id}-${idx}`}
                          className="inline-flex items-center gap-1 rounded-full bg-panel px-2.5 py-0.5 text-[11px] font-medium text-ink border border-line"
                        >
                          {esTipoSofa(c.nombre) ? (
                            <SofaIcon className="size-3 text-secondary" />
                          ) : (
                            <BedDoubleIcon className="size-3 text-primary" />
                          )}
                          {c.nombre} ({c.capacidad} {c.capacidad === 1 ? 'persona' : 'personas'})
                        </span>
                      ))}
                      <span className="text-[11px] font-semibold text-ink-soft">
                        Capacidad total: {guardadoExitoso.capacidadTotal ?? 0}{' '}
                        {guardadoExitoso.capacidadTotal === 1 ? 'persona' : 'personas'}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border',
                          guardadoExitoso.status === 'active'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                        )}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {guardadoExitoso.status === 'active' ? 'Activa' : 'Mantenimiento'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button type="button" variant="secondary" onClick={handleReset} className="shrink-0">
                Asignar otra cama
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              {/* Campo Dropdown Habitaciones con Fade In Motion */}
              <FadeIn duration={400} delay={60}>
                <SelectField
                  label="Habitación"
                  placeholder={
                    cargandoHabitaciones
                      ? 'Buscando habitaciones disponibles…'
                      : 'Selecciona una habitación…'
                  }
                  options={habitaciones}
                  value={habitacionId}
                  onChange={(event) => {
                    setHabitacionId(event.target.value)
                    if (habitacionError) setHabitacionError(null)
                  }}
                  error={habitacionError ?? undefined}
                  hint="Elige la habitación donde se ubicará esta cama o sofá."
                  disabled={cargandoHabitaciones}
                  emptyLabel="Aún no hay habitaciones registradas en tu hotel."
                  required
                  icon={<DoorIcon />}
                />
              </FadeIn>

              {/* Sección Tipo de Cama o Sofá con Drag & Drop y visualización en Píldora */}
              <FadeIn duration={400} delay={110}>
                <div
                  className={cn(
                    'my-5 rounded-[8px] border transition-all duration-200 p-4 sm:p-5',
                    isDraggingOver
                      ? 'border-2 border-dashed border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01]'
                      : 'border-line bg-canvas/45',
                  )}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'copy'
                    if (!isDraggingOver) setIsDraggingOver(true)
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setIsDraggingOver(false)
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDraggingOver(false)
                    try {
                      const json = e.dataTransfer.getData('application/json')
                      if (json) {
                        const parsed = JSON.parse(json) as TipoCama
                        handleAgregarTipo(parsed)
                      }
                    } catch (err) {
                      console.error('Error al procesar el tipo de cama soltado', err)
                    }
                  }}
                  role="region"
                  aria-labelledby="tipo-cama-seccion-titulo"
                >
                  {/* Cabecera con jerarquía clara y etiqueta de contexto */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-primary/10 text-primary">
                        <BedDoubleIcon className="size-4" />
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          id="tipo-cama-seccion-titulo"
                          className="text-sm font-semibold tracking-tight text-ink"
                        >
                          Tipo de Cama o Sofá
                        </h3>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          Paso orientativo
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-medium text-ink-soft hidden sm:inline-block">
                      {camasAsignadas.length > 0
                        ? `${camasAsignadas.length} ${camasAsignadas.length === 1 ? 'mobiliario añadido' : 'mobiliarios añadidos'}`
                        : 'Arrastra y suelta'}
                    </span>
                  </div>

                  {/* Feedback interactivo activo al arrastrar sobre la zona */}
                  {isDraggingOver && (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-[8px] border border-dashed border-primary bg-primary/15 py-3 text-sm font-semibold text-primary animate-pulse">
                      <HandDropIcon className="size-4.5" />
                      <span>¡Suelta aquí para añadir esta cama o sofá a la habitación!</span>
                    </div>
                  )}

                  {/* Tipos de cama soltados visualizados mediante múltiples Píldoras accesibles */}
                  {camasAsignadas.length > 0 ? (
                    <div className="mt-3.5 space-y-3 rounded-[8px] border border-primary/30 bg-panel p-3.5 shadow-2xs">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line/60 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-semibold text-ink">
                            Mobiliario configurado ({camasAsignadas.length}):
                          </p>
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                            {totalCapacidadAsignada}{' '}
                            {totalCapacidadAsignada === 1 ? 'plaza total' : 'plazas totales'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleLimpiarTodos}
                          className="self-start text-[11px] font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors sm:self-auto cursor-pointer"
                        >
                          Limpiar todo
                        </button>
                      </div>

                      {/* Lista de píldoras configuradas */}
                      <div className="flex flex-wrap items-center gap-2">
                        {camasAsignadas.map((item) => {
                          const esSofa = esTipoSofa(item.tipo.name)
                          return (
                            <Pildora
                              key={item.uid}
                              label={`${item.tipo.name},${item.tipo.capacity_people}`}
                              paleta={esSofa ? 'secondary' : 'primary'}
                              size="md"
                              icon={
                                esSofa ? (
                                  <SofaIcon className="size-4" />
                                ) : (
                                  <BedDoubleIcon className="size-4" />
                                )
                              }
                              onClose={() => handleRemoverTipo(item.uid)}
                              closeAriaLabel={`Quitar ${item.tipo.name} de la habitación`}
                            />
                          )
                        })}
                      </div>

                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pt-1 border-t border-line/40 text-[11px] text-ink-muted">
                        <span>
                          Arrastra más avatares desde la barra lateral izquierda para seguir agregando camas o sofás.
                        </span>
                        <span className="text-ink-soft">
                          Pulsa <strong className="font-semibold text-ink">✕</strong> en una píldora para retirarla.
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Zona de indicación interactiva de arrastre cuando no hay elementos */
                    <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[8px] border border-dashed border-line/90 bg-panel/60 px-3.5 py-2.5 text-center sm:text-left">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                          <HandDropIcon className="size-3.5" />
                        </span>
                        <p className="text-xs text-ink-muted">
                          <span className="font-semibold text-ink">Arrastra uno o varios avatares</span> desde la barra lateral izquierda y suéltalos aquí (o haz clic en ellos) para añadir diversas camas o sofás a tu habitación.
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-ink-soft shrink-0">
                        Zona activa (múltiple)
                      </span>
                    </div>
                  )}

                  {/* Mensaje amigable si intenta guardar sin arrastrar tipos de cama */}
                  {tiposError && (
                    <motion.div
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="mt-3 flex items-center gap-2 rounded-[8px] border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400"
                    >
                      <AlertCircleIcon className="size-4 shrink-0" />
                      <span>{tiposError}</span>
                    </motion.div>
                  )}

                  {/* Mensaje psicológico: propósito, claridad y tranquilidad para el usuario */}
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-ink-muted">
                    Aquí debes indicar el tipo de <strong className="font-semibold text-ink">cama</strong> o <strong className="font-semibold text-ink">sofá</strong> que se instalará en la habitación. Definirlo con precisión le permite a tu equipo de limpieza preparar la lencería adecuada y a recepción conocer las plazas reales disponibles sin confusiones ni contratiempos.
                  </p>

                  {/* Tarjetas informativas de anclaje visual (Principio de reconocimiento sobre recuerdo) */}
                  <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div className="flex items-start gap-2.5 rounded-[8px] border border-line/70 bg-panel p-3 shadow-xs">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-[8px] bg-primary/10 text-primary">
                        <BedDoubleIcon className="size-3.5" />
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-ink">Camas</p>
                        <p className="text-[11px] leading-tight text-ink-muted">
                          King, Queen, Matrimonial o Individual para el descanso principal.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-[8px] border border-line/70 bg-panel p-3 shadow-xs">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-[8px] bg-primary/10 text-primary">
                        <SofaIcon className="size-3.5" />
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-ink">Sofás o Sofás Cama</p>
                        <p className="text-[11px] leading-tight text-ink-muted">
                          Mobiliario versátil o plazas convertibles para estancias compartidas.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pauta psicológica de refuerzo (disminución de ansiedad) */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
                    <LightbulbIcon className="size-3.5 shrink-0 text-primary/80" />
                    <span>
                      Consejo: Asignar el tipo exacto ayuda a que tus huéspedes disfruten de la experiencia que esperan al hacer check-in.
                    </span>
                  </div>
                </div>
              </FadeIn>

              {/* Campo Etiqueta con Fade In Motion */}
              <FadeIn duration={400} delay={160}>
                <Input
                  label="Etiqueta identificadora"
                  placeholder="Ej. Cama ventana A, Doble principal 101…"
                  autoComplete="off"
                  maxLength={50}
                  required
                  value={etiqueta}
                  onChange={(event) => {
                    setEtiqueta(event.target.value)
                    if (etiquetaError) setEtiquetaError(null)
                  }}
                  error={etiquetaError ?? undefined}
                  hint="Usa un nombre amigable o código que facilite localizarla en los registros y turnos de limpieza."
                  icon={<TagIcon />}
                />
              </FadeIn>

              {/* Campo Estado (dropdown) con opciones en español y valor en inglés para el API */}
              <FadeIn duration={400} delay={190}>
                <SelectField
                  label="Estado"
                  options={ESTADO_CAMA_OPTIONS}
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as CamaStatus)
                    if (statusError) setStatusError(null)
                  }}
                  error={statusError ?? undefined}
                  hint="Define la disponibilidad operativa de la cama o sofá en la habitación."
                  required
                  icon={<ActivityIcon />}
                />
              </FadeIn>

              {/* Botón de acción con Fade In Motion */}
              <FadeIn duration={400} delay={230} className="flex items-center justify-end border-t border-line pt-4">
                <Button type="submit" disabled={guardando || cargandoHabitaciones} className="w-full sm:w-auto">
                  {guardando ? (
                    <>
                      <span
                        className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        aria-hidden="true"
                      />
                      Asignando cama…
                    </>
                  ) : (
                    'Asignar cama'
                  )}
                </Button>
              </FadeIn>
            </form>
          )}
        </div>
      </div>

      {/* Combo Loader en pantalla mientras se construye el payload en segundo plano y se registra en /bed */}
      <Loader
        overlay
        visible={guardando}
        size={38}
        label="Asignando cama a la habitación…"
      >
        <span className="max-w-xs text-center text-xs leading-relaxed text-ink-soft">
          En segundo plano estamos configurando los espacios y sincronizando tu cama con la habitación. En breve estará lista.
        </span>
      </Loader>
    </motion.section>
  )
}

function TagBedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      <path d="M2 19h20" />
      <path d="M2 5v14" />
      <path d="M22 19v-6a2 2 0 0 0-2-2H8" />
      <path d="M4 11h4a2 2 0 0 1 2 2v2H2v-2a2 2 0 0 1 2-2Z" />
    </svg>
  )
}

function BedDoubleIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 19h20" />
      <path d="M2 4v15" />
      <path d="M22 4v15" />
      <path d="M2 10h20" />
      <path d="M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
    </svg>
  )
}

function SofaIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
      <path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" />
      <path d="M4 18v2" />
      <path d="M20 18v2" />
      <path d="M12 5v4" />
    </svg>
  )
}

function LightbulbIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}

function DoorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
      <path d="M2 20h20" />
      <path d="M14 12v.01" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.579a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  )
}

function AlertCircleIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function HandDropIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2v10" />
      <path d="m9 9 3 3 3-3" />
      <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
