import { useCallback, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { AnimatePresence, motion } from 'motion/react'
import { api } from '../../../../lib/api'
import { Button } from '../../../habitaciones/ui/atoms/button'

export interface EdificioDetalleModalProps {
  buildingId: string | null
  buildingSummary?: {
    name: string
    floorNumber?: number
    headquartersId?: string
    subHeadquartersId?: string
  }
  linkedRoom?: {
    number: string
    floor: number | string
  }
  isOpen: boolean
  onClose: () => void
}

interface RawBuildingFull {
  id: string
  name: string
  floor_number?: number
  headquarters_id?: string
  sub_headquarters_id?: string | null
  status?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

interface RawHeadquarter {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

interface RawSubHeadquarter {
  id: string
  headquarter_id?: string
  name: string
  address: string
  phone: string
  status?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export function EdificioDetalleModal({
  buildingId,
  buildingSummary,
  linkedRoom,
  isOpen,
  onClose,
}: EdificioDetalleModalProps) {
  const [loading, setLoading] = useState(false)
  const [buildingData, setBuildingData] = useState<RawBuildingFull | null>(null)

  // Estados para la Sede Principal
  const [sede, setSede] = useState<RawHeadquarter | null>(null)
  const [sedeLoading, setSedeLoading] = useState(false)
  const [sedeError, setSedeError] = useState<string | null>(null)

  // Estados para las Sub-Sedes vinculadas
  const [subSedes, setSubSedes] = useState<RawSubHeadquarter[]>([])
  const [subSedesLoading, setSubSedesLoading] = useState(false)
  const [subSedesError, setSubSedesError] = useState<string | null>(null)

  const headquartersId = buildingData?.headquarters_id || buildingSummary?.headquartersId

  // Efecto iOS ModalPresentationStyle: escala la pantalla de fondo (scale-[0.93], rounded-[24px], origin-bottom)
  useEffect(() => {
    if (!isOpen) return
    const rootEl = document.getElementById('root')
    if (!rootEl) return

    const prevTransition = rootEl.style.transition
    const prevTransform = rootEl.style.transform
    const prevBorderRadius = rootEl.style.borderRadius
    const prevTransformOrigin = rootEl.style.transformOrigin
    const prevOverflow = rootEl.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    const prevBodyBg = document.body.style.backgroundColor

    rootEl.style.transition =
      'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
    rootEl.style.transformOrigin = 'bottom center'
    rootEl.style.transform = 'scale(0.93)'
    rootEl.style.borderRadius = '24px'
    rootEl.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#000000'

    return () => {
      rootEl.style.transition = prevTransition
      rootEl.style.transform = prevTransform
      rootEl.style.borderRadius = prevBorderRadius
      rootEl.style.transformOrigin = prevTransformOrigin
      rootEl.style.overflow = prevOverflow
      document.body.style.overflow = prevBodyOverflow
      document.body.style.backgroundColor = prevBodyBg
    }
  }, [isOpen])

  // Cerrar al pulsar la tecla Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Cargar datos exclusivamente del edificio específico
  const fetchFullBuilding = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await api.get<unknown>(`/building/${id}`, {
        validateStatus: (s) => s === 200,
      })

      const raw = response.data as RawBuildingFull | { data?: RawBuildingFull }
      const item: RawBuildingFull =
        raw && typeof raw === 'object' && 'data' in raw && raw.data
          ? (raw.data as RawBuildingFull)
          : (raw as RawBuildingFull)

      if (item && item.id) {
        setBuildingData(item)
      }
    } catch {
      // Fallback a los datos recibidos por props
      setBuildingData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar información de la sede principal
  const fetchSede = useCallback(async (hqId: string) => {
    setSedeLoading(true)
    setSedeError(null)
    try {
      const response = await api.get<unknown>(`/headquarters/${hqId}`)
      const raw = response.data
      const item: RawHeadquarter | null = Array.isArray(raw)
        ? ((raw[0] as RawHeadquarter) ?? null)
        : raw && typeof raw === 'object' && 'data' in raw && raw.data
        ? (raw.data as RawHeadquarter)
        : (raw as RawHeadquarter)

      if (item && (item.id || item.name)) {
        setSede(item)
      } else {
        setSede(null)
      }
    } catch (err: unknown) {
      setSede(null)
      if (isAxiosError(err) && err.response?.status === 400) {
        setSedeError(
          'Tuvimos un inconveniente al consultar la información de la sede. Puedes reintentar o continuar explorando los detalles del edificio con total tranquilidad.'
        )
      } else {
        setSedeError(
          'No logramos conectar con la información de la sede en este momento. La información del edificio sigue disponible.'
        )
      }
    } finally {
      setSedeLoading(false)
    }
  }, [])

  // Cargar sub-sedes asociadas a la sede
  const fetchSubSedes = useCallback(async (hqId: string) => {
    setSubSedesLoading(true)
    setSubSedesError(null)
    try {
      const response = await api.get<unknown>(`/sub-headquarters/by-headquarter/${hqId}`)
      const raw = response.data
      const list: RawSubHeadquarter[] = Array.isArray(raw)
        ? (raw as RawSubHeadquarter[])
        : raw && typeof raw === 'object' && 'data' in raw && Array.isArray(raw.data)
        ? (raw.data as RawSubHeadquarter[])
        : []

      setSubSedes(list)
      if (list.length === 0) {
        setSubSedesError(
          'Esta sede opera como punto central único; no cuenta con sub-sedes secundarias registradas por el momento.'
        )
      }
    } catch (err: unknown) {
      setSubSedes([])
      if (isAxiosError(err) && err.response?.status === 400) {
        setSubSedesError(
          'Esta sede opera como punto central único; no cuenta con sub-sedes secundarias registradas por el momento.'
        )
      } else {
        setSubSedesError(
          'No se pudo consultar el listado de sub-sedes en este momento. La información del edificio sigue disponible.'
        )
      }
    } finally {
      setSubSedesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && buildingId) {
      void fetchFullBuilding(buildingId)
    } else {
      setBuildingData(null)
    }
  }, [isOpen, buildingId, fetchFullBuilding])

  useEffect(() => {
    if (isOpen && headquartersId) {
      void fetchSede(headquartersId)
      void fetchSubSedes(headquartersId)
    } else if (!isOpen) {
      setSede(null)
      setSedeError(null)
      setSubSedes([])
      setSubSedesError(null)
    }
  }, [isOpen, headquartersId, fetchSede, fetchSubSedes])

  const displayName = buildingData?.name || buildingSummary?.name || 'Detalle del Edificio'
  const displayFloors = buildingData?.floor_number ?? buildingSummary?.floorNumber ?? 1
  const displayStatus = buildingData?.status || 'available'

  const isAvailable =
    displayStatus === 'available' || displayStatus === 'disponible' || displayStatus === 'active'

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-edificio-detalle-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Fondo con blur y oscurecimiento (Backdrop estilo iOS) */}
          <motion.div
            key="backdrop-edificio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Contenido Modal: Tarjeta estilo iOS (desliza desde abajo con física Spring) */}
          <motion.div
            key="modal-edificio-content"
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 280,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl border border-line bg-panel p-6 shadow-2xl transition-all sm:p-8"
          >
            {/* Tirador táctil / Handle iOS para móvil */}
            <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-line/80 sm:hidden" />
          {/* Tag de Contexto: Habitación Vinculada */}
          <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                  <path d="M2 4v16" />
                  <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                  <path d="M2 17h20" />
                  <path d="M6 8v9" />
                </svg>
                {linkedRoom ? (
                  <span>
                    Habitación <strong>{linkedRoom.number}</strong> · Piso {linkedRoom.floor}
                  </span>
                ) : (
                  <span>Habitación vinculada</span>
                )}
              </span>

              {loading && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted">
                  <span className="inline-block size-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  <span>Sincronizando…</span>
                </span>
              )}
            </div>

            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-line text-ink-muted hover:border-primary/40 hover:bg-canvas hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Cabecera Principal del Edificio */}
          <div className="mt-5 flex items-start gap-4">
            <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-7"
                aria-hidden="true"
              >
                <path d="M3 21h18" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                <path d="M9 9h1" />
                <path d="M9 13h1" />
                <path d="M9 17h1" />
                <path d="M14 9h1" />
                <path d="M14 13h1" />
                <path d="M14 17h1" />
              </svg>
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                    isAvailable
                      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  />
                  {isAvailable ? 'Edificio Operativo' : 'En Mantenimiento'}
                </span>
              </div>

              <h2
                id="modal-edificio-detalle-title"
                className="mt-1 text-2xl font-black text-ink tracking-tight truncate"
              >
                {displayName}
              </h2>

              <p className="text-xs text-ink-muted">
                Edificio asignado a la habitación seleccionada
              </p>
            </div>
          </div>

          {/* Tarjetas de Métricas Exclusivas de este Edificio */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {/* 1. Habitación asignada */}
            <div className="rounded-2xl border border-line bg-canvas/70 p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-ink-muted block uppercase tracking-wider">
                Habitación
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-primary">
                  {linkedRoom ? linkedRoom.number : '—'}
                </span>
                <span className="text-xs text-ink-muted">
                  {linkedRoom ? `(Piso ${linkedRoom.floor})` : ''}
                </span>
              </div>
            </div>

            {/* 2. Total de Pisos */}
            <div className="rounded-2xl border border-line bg-canvas/70 p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-ink-muted block uppercase tracking-wider">
                Niveles
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-ink">{displayFloors}</span>
                <span className="text-xs text-ink-muted">pisos</span>
              </div>
            </div>

            {/* 3. Estado */}
            <div className="rounded-2xl border border-line bg-canvas/70 p-3.5 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-ink-muted block uppercase tracking-wider">
                Estado
              </span>
              <div className="mt-1">
                <span className="text-sm font-bold text-ink">
                  {isAvailable ? 'Disponible' : 'Mantenimiento'}
                </span>
              </div>
            </div>
          </div>


          {/* Sección 1: Información de la Sede Principal */}
          <div className="mt-5 rounded-2xl border border-line bg-canvas/70 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  Sede Principal
                </h3>
              </div>

              {sedeLoading && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted">
                  <span className="inline-block size-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  <span>Consultando sede…</span>
                </span>
              )}
            </div>

            {sedeLoading ? (
              <div className="space-y-2 py-1 animate-pulse">
                <div className="h-4 w-48 rounded bg-line/60" />
                <div className="h-3 w-64 rounded bg-line/40" />
                <div className="h-3 w-36 rounded bg-line/40" />
              </div>
            ) : sedeError ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="flex-1 space-y-1.5">
                  <p className="leading-relaxed">{sedeError}</p>
                  {headquartersId && (
                    <button
                      type="button"
                      onClick={() => void fetchSede(headquartersId)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 21h5v-5" />
                      </svg>
                      Reintentar consulta de sede
                    </button>
                  )}
                </div>
              </div>
            ) : sede ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">{sede.name}</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {sede.city}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-xs text-ink-muted sm:grid-cols-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-medium text-ink-soft">Dirección:</span>
                    <span className="truncate text-ink" title={sede.address}>{sede.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-ink-soft">Teléfono:</span>
                    {sede.phone ? (
                      <a href={`tel:${sede.phone}`} className="font-semibold text-primary hover:underline">
                        {sede.phone}
                      </a>
                    ) : (
                      <span className="text-ink-muted">No registrado</span>
                    )}
                  </div>
                </div>
              </div>
            ) : !headquartersId && !loading ? (
              <p className="text-xs text-ink-muted">
                Este edificio no tiene una sede principal asociada directamente en el sistema.
              </p>
            ) : null}
          </div>

          {/* Sección 2: Sub-Sedes Vinculadas */}
          <div className="mt-4 rounded-2xl border border-line bg-canvas/70 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  Sub-Sedes vinculadas {subSedes.length > 0 ? `(${subSedes.length})` : ''}
                </h3>
              </div>

              {subSedesLoading && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted">
                  <span className="inline-block size-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  <span>Buscando subsedes…</span>
                </span>
              )}
            </div>

            {subSedesLoading ? (
              <div className="space-y-2 py-1 animate-pulse">
                <div className="h-10 w-full rounded-xl bg-line/40" />
                <div className="h-10 w-full rounded-xl bg-line/30" />
              </div>
            ) : subSedes.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {subSedes.map((sub) => (
                  <div
                    key={sub.id || sub.name}
                    className="rounded-xl border border-line/70 bg-panel p-3 space-y-1 shadow-2xs"
                  >
                    <p className="text-xs font-bold text-ink truncate" title={sub.name}>
                      {sub.name}
                    </p>
                    <p className="text-[11px] text-ink-muted truncate" title={sub.address}>
                      {sub.address}
                    </p>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-ink-soft">Tel:</span>
                      {sub.phone ? (
                        <a href={`tel:${sub.phone}`} className="font-medium text-primary hover:underline">
                          {sub.phone}
                        </a>
                      ) : (
                        <span className="text-ink-muted">No registrado</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-line/60 bg-panel/60 p-3 text-xs text-ink-muted flex items-start gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-ink-soft shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="leading-relaxed">
                  {subSedesError ||
                    'Esta sede opera como punto central único; no cuenta con sub-sedes secundarias registradas por el momento.'}
                </p>
              </div>
            )}
          </div>

          {/* Información de Auditoría (Fecha de registro) */}
          {buildingData?.created_at && (
            <div className="mt-5 border-t border-line/60 pt-4 text-[11px] text-ink-muted">
              <div className="flex items-center justify-between">
                <span>Fecha de registro:</span>
                <span className="font-medium text-ink">
                  {new Date(buildingData.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Botón de Acción Inferior */}
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
)
}
