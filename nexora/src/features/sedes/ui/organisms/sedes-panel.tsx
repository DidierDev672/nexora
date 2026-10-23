import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { InfiniteScroll, InfiniteScrollEnd } from '../../../../shared/ui/InfiniteScroll'
import { Input } from '../../../../shared/ui/Input'
import { api } from '../../../../lib/api'
import type { Sede, SedeEstado, SedeInput, SubSede } from '../../domain/sede'
import { isStaticSede } from '../../infrastructure/local-storage-sede-repository'
import { Button } from '../atoms/button'
import { EmptyState } from '../atoms/empty-state'
import { Loader } from '../atoms/loader'
import { Modal } from '../atoms/modal'
import { SuccessModal } from '../atoms/success-modal'
import { TextField } from '../atoms/text-field'
import { WarningModal } from '../atoms/warning-modal'
import { SedeItem } from '../molecules/sede-item'
import { SedeForm } from '../molecules/sede-form'
import { SedesTable } from '../molecules/sedes-table'
import { STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../lib/sedes-motion'
import { SedesViewSwitch, type SedesViewMode } from '../molecules/sedes-view-switch'
import { SubSedeForm, type SubSedeFormValues } from '../molecules/sub-sede-form'
import { SubSedeHistory } from '../molecules/sub-sede-history'
import { useSedes } from '../sedes-context'

export interface SedesPanelProps {
  viewMode?: SedesViewMode
  onViewModeChange?: (mode: SedesViewMode) => void
}

const PAGE_SIZE = 6

const ESTADO_TO_STATUS: Record<SedeEstado, string> = {
  activa: 'active',
  mantenimiento: 'maintenance',
  inactiva: 'inactive',
}

const CREATED_BY = 'u-123'

const SUB_SEDE_CREATED_BY = 'user_system'

export function SedesPanel({
  viewMode: propViewMode,
  onViewModeChange,
}: SedesPanelProps = {}) {
  const { sedes, isLoading, loadError, reload, create, remove, removeStatic } = useSedes()
  const [internalViewMode, setInternalViewMode] = useState<SedesViewMode>('cards')
  const viewMode = propViewMode ?? internalViewMode

  const handleViewModeChange = (mode: SedesViewMode) => {
    setInternalViewMode(mode)
    onViewModeChange?.(mode)
  }

  const [formOpen, setFormOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [success, setSuccess] = useState<{ title: string; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Sede | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [subSedeParent, setSubSedeParent] = useState<Sede | null>(null)
  const [submittingSubSede, setSubmittingSubSede] = useState(false)
  const [subSedeError, setSubSedeError] = useState<string | null>(null)
  const [subSedeView, setSubSedeView] = useState<Sede | null>(null)
  const [viewingSubSedes, setViewingSubSedes] = useState(false)
  const [subSedes, setSubSedes] = useState<SubSede[] | null>(null)
  const [viewSubSedesError, setViewSubSedesError] = useState<string | null>(null)
  const [subSedeQuery, setSubSedeQuery] = useState('')

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const submittingRef = useRef(false)

  const takenNames = useMemo(
    () => sedes.map((sede) => sede.name.trim().toLowerCase()),
    [sedes],
  )

  const filteredSedes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sedes
    return sedes.filter((sede) =>
      [sede.name, sede.address, sede.city, sede.phone]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [sedes, query])

  const visibleSedes = filteredSedes.slice(0, visibleCount)
  const hasMore = visibleCount < filteredSedes.length

  const filteredSubSedes = useMemo(() => {
    if (!subSedes) return []
    const q = subSedeQuery.trim().toLowerCase()
    if (!q) return subSedes
    return subSedes.filter((sub) =>
      [sub.name, sub.address, sub.phone].join(' ').toLowerCase().includes(q),
    )
  }, [subSedes, subSedeQuery])

  const countLabel = sedes.length === 1 ? '1 sede' : `${sedes.length} sedes`

  const closeForm = () => {
    setFormOpen(false)
    setError(null)
  }

  const openCreate = () => {
    setFormOpen(true)
    setError(null)
  }

  const handleSubmit = async (values: SedeInput) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setCreating(true)
    setError(null)
    try {
      const response = await api.post('/headquarters', {
        name: values.name,
        address: values.address,
        city: values.city,
        phone: values.phone,
        status: ESTADO_TO_STATUS[values.estado],
        created_by: CREATED_BY,
      })
      if (response.status === 201) {
        create(values)
        setSuccess({
          title: '¡Nueva sede en el mapa!',
          message: `La sede «${values.name}» ya es oficial: un espacio más hecho realidad, un lugar que ahora vive en la red. Cada sede que creas hace crecer tu imperio, y esta ya es tuya. Grandes cosas se construyen con detalles, y acabas de sumar uno bien hecho.`,
        })
      } else {
        setError('No se pudo registrar, pero tus datos siguen a salvo. Es un tropiezo menor: revisa tu conexión e inténtalo de nuevo; el destino cerca de la sede sabe esperar un segundo intento.')
      }
    } catch {
      setError('Nuestros servidores parecen estar tomando un descanso. No te preocupes: tu información quedó intacta. Respira, revisa tu conexión y vuelve a intentarlo en un momento.')
    } finally {
      setCreating(false)
      setFormOpen(false)
      submittingRef.current = false
    }
  }

  const loadMore = async () => {
    setIsLoadingMore(true)
    await new Promise((resolve) => window.setTimeout(resolve, 900))
    setVisibleCount((prev) => prev + PAGE_SIZE)
    setIsLoadingMore(false)
  }

  const closeSuccess = () => setSuccess(null)

  const openSubSedeModal = (sede: Sede) => {
    setSubSedeParent(sede)
    setSubSedeError(null)
    setSubmittingSubSede(false)
  }

  const closeSubSedeModal = () => {
    setSubSedeParent(null)
    setSubSedeError(null)
  }

  const handleSubSedeSubmit = async (values: SubSedeFormValues) => {
    const parent = subSedeParent
    if (!parent) return
    setSubmittingSubSede(true)
    setSubSedeError(null)
    try {
      const response = await api.post('/sub-headquarters', {
        headquarter_id: parent.id,
        name: values.name,
        address: values.address,
        phone: values.phone,
        status: ESTADO_TO_STATUS[values.estado],
        created_by: SUB_SEDE_CREATED_BY,
      })
      if (response.status === 201) {
        setSubSedeParent(null)
        setSuccess({
          title: 'Sub sede agregada',
          message: `¡La sub sede «${values.name}» ya forma parte de «${parent.name}»! Cada pieza nueva que sumas acerca tu imperio un paso más: más cerca de tus huéspedes, más grande tu red. Sigue así, que el mapa se llena de tus pisadas.`,
        })
      } else {
        setSubSedeError('La sub sede casi se suma… pero el servidor frenó en seco. No es tu culpa: tus datos quedaron intactos. Revisa tu conexión y reintenta; tu próxima sub sede puede esperar un parpadeo más.')
      }
    } catch {
      setSubSedeError('Nuestros servidores parecen estar tomando un descanso y la sub sede aguardó en la puerta. No te agobies: nada se perdió. Respira, revisa tu conexión y vuelve a intentarlo en un momento.')
    } finally {
      setSubmittingSubSede(false)
    }
  }

  const openSubSedeView = async (sede: Sede) => {
    setSubSedeView(sede)
    setSubSedes(null)
    setViewSubSedesError(null)
    setSubSedeQuery('')
    setViewingSubSedes(true)
    try {
      const response = await api.get<SubSede[]>(`/sub-headquarters/by-headquarter/${sede.id}`)
      if (response.status === 200) {
        setSubSedes(Array.isArray(response.data) ? response.data : [])
      } else if (response.status === 400) {
        setSubSedes([])
      } else {
        setViewSubSedesError('No pudimos encontrar las sub sedes: los servidores pidieron una pausa justo ahora. Tus datos siguen a salvo; respira, revisa tu conexión y vuelve a intentarlo.')
      }
    } catch {
      setViewSubSedesError('No pudimos buscar las sub sedes: parece que los servidores están tomando un descanso. Nada se perdió: revisa tu conexión y reintenta cuando quieras.')
    } finally {
      setViewingSubSedes(false)
    }
  }

  const closeSubSedeView = () => {
    setSubSedeView(null)
    setSubSedes(null)
    setViewSubSedesError(null)
    setSubSedeQuery('')
    setViewingSubSedes(false)
  }

  const confirmDelete = (sede: Sede) => {
    setPendingDelete(sede)
    setDeleteError(null)
  }

  const closeDelete = () => {
    if (deleting) return
    setPendingDelete(null)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    const sede = pendingDelete
    if (!sede) return
    setDeleting(true)
    setDeleteError(null)
    if (isStaticSede(sede)) {
      removeStatic(sede.id)
    }
    try {
      const response = await api.delete(`/headquarters/${sede.id}`)
      if (response.status === 204) {
        remove(sede.id)
        setPendingDelete(null)
        setSuccess({
          title: 'Sede eliminada',
          message: `«${sede.name}» ya no forma parte de tu red. Cada despedida deja espacio: ahí donde estaba, siempre puede nacer una nueva sede.`,
        })
      } else {
        setDeleteError('La sede no se eliminó y todo sigue exactamente donde estaba: a salvo. Revisa tu conexión e inténtalo de nuevo; esta despedida puede esperar un poco.')
      }
    } catch {
      setDeleteError('Nuestros servidores parecen estar tomando un descanso. No te preocupes: tus sedes están a salvo. Respira, revisa tu conexión y vuelve a intentarlo en un momento.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section aria-label="Gestión de sedes" className="mt-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-ink">Sedes registradas</h2>
          {isLoading ? null : (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {countLabel}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <SedesViewSwitch viewMode={viewMode} onChange={handleViewModeChange} />
          <Button onClick={openCreate}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-4"
              aria-hidden="true"
            >
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v8M8 13h8" />
            </svg>
            Nueva sede
          </Button>
        </div>
      </div>

      <TextField
        label="Buscar sedes"
        hideLabel
        placeholder="Buscar por nombre, dirección, ciudad o teléfono…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="sm:max-w-md"
      />

      <AnimatePresence initial={false}>
        {formOpen && (
          <motion.section
            key="sede-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
              {creating ? (
                <Loader label="Registrando sede…" className="py-10" />
              ) : (
                <>
                  <h3 className="mb-4 text-base font-bold text-ink">Registrar nueva sede</h3>
                  <SedeForm
                    takenNames={takenNames}
                    submitLabel="Crear sede"
                    submitting={creating}
                    submitError={error}
                    onCancel={closeForm}
                    onSubmit={handleSubmit}
                  />
                </>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Loader label="Cargando sedes…" className="py-24" />
      ) : loadError ? (
        <div className="rounded-2xl border border-danger/20 bg-danger/10 p-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
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
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-ink">No pudimos cargar tus sedes</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{loadError}</p>
          <Button variant="secondary" className="mt-5" onClick={reload}>
            Reintentar
          </Button>
        </div>
      ) : sedes.length === 0 ? (
        <EmptyState
          title="Aún no hay sedes"
          message="Registra la primera sede y empieza a expandir tu red hotelera."
          action={<Button onClick={openCreate}>Registrar primera sede</Button>}
        />
      ) : filteredSedes.length === 0 ? (
        <EmptyState
          title={`Sin resultados para “${query.trim()}”`}
          message="Prueba con otro nombre, ciudad o dirección."
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Limpiar búsqueda
            </Button>
          }
        />
      ) : (
        <InfiniteScroll
          onLoadMore={loadMore}
          hasMore={hasMore}
          isLoading={isLoadingMore}
          loader={<Loader label="Cargando más sedes…" className="py-6" />}
          endMessage={<InfiniteScrollEnd label="Ya aparecen todas tus sedes." />}
        >
          <AnimatePresence mode="wait">
            {viewMode === 'cards' ? (
              <motion.ul
                key="sedes-cards-view"
                variants={STAGGER_CONTAINER_VARIANTS}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5"
              >
                {visibleSedes.map((sede) => (
                  <SedeItem
                    key={sede.id}
                    sede={sede}
                    variants={STAGGER_ITEM_VARIANTS}
                    onDelete={() => confirmDelete(sede)}
                    onAddSubSede={() => openSubSedeModal(sede)}
                    onViewSubSedes={() => openSubSedeView(sede)}
                  />
                ))}
              </motion.ul>
            ) : (
              <motion.div
                key="sedes-table-view"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
              >
                <SedesTable
                  sedes={visibleSedes}
                  onDelete={confirmDelete}
                  onAddSubSede={openSubSedeModal}
                  onViewSubSedes={openSubSedeView}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </InfiniteScroll>
      )}

      <SuccessModal
        open={success !== null}
        onClose={closeSuccess}
        title={success?.title ?? 'Éxito'}
        message={success?.message ?? ''}
      />

      <WarningModal
        open={pendingDelete !== null}
        title="¿Eliminar esta sede?"
        message={`«${pendingDelete?.name ?? ''}» desaparecerá de tu red junto con sus datos. Esta acción no se puede deshacer: revísala una vez más y decide con calma.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        busy={deleting}
        busyLabel="Eliminando…"
        onConfirm={handleDelete}
        onCancel={closeDelete}
      >
        {deleteError ? (
          <p role="alert" className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
            {deleteError}
          </p>
        ) : null}
      </WarningModal>

      <Modal
        isOpen={subSedeParent !== null}
        onClose={closeSubSedeModal}
        title={subSedeParent ? `Sub sede para «${subSedeParent.name}»` : undefined}
      >
        {subSedeParent ? (
          <SubSedeForm
            parentName={subSedeParent.name}
            submitting={submittingSubSede}
            submitError={subSedeError}
            onCancel={closeSubSedeModal}
            onSubmit={handleSubSedeSubmit}
          />
        ) : null}
      </Modal>

      <Modal
        isOpen={subSedeView !== null}
        onClose={closeSubSedeView}
        title={subSedeView ? `Sub sedes de «${subSedeView.name}»` : undefined}
        className="max-w-lg"
      >
        {subSedeView ? (
          viewingSubSedes ? (
            <Loader label="Buscando sub sedes…" className="py-10" />
          ) : subSedes && subSedes.length > 0 ? (
            <div className="space-y-4">
              <Input
                label="Buscar sub sedes"
                placeholder="Buscar por nombre, dirección o teléfono…"
                value={subSedeQuery}
                onChange={(event) => setSubSedeQuery(event.target.value)}
                icon={
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
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                }
              />
              {filteredSubSedes.length > 0 ? (
                <SubSedeHistory
                  parentName={subSedeView.name}
                  subSedes={filteredSubSedes}
                />
              ) : (
                <EmptyState
                  title={`Sin resultados para “${subSedeQuery.trim()}”`}
                  message="Prueba con otro nombre, dirección o teléfono; tus sub sedes siguen aquí, solo cambiaron de lugar."
                  action={
                    <Button variant="secondary" onClick={() => setSubSedeQuery('')}>
                      Limpiar búsqueda
                    </Button>
                  }
                />
              )}
            </div>
          ) : viewSubSedesError ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 p-6 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
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
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4M12 17h.01" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-ink">No pudimos cargar las sub sedes</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
                {viewSubSedesError}
              </p>
              <Button
                variant="secondary"
                className="mt-5"
                onClick={() => openSubSedeView(subSedeView)}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <EmptyState
              title="Esta sede aún no tiene sub sedes"
              message="Toda gran historia empieza con una página en blanco, y esta sede está lista para abrir su primer capítulo. Cuando quieras, el botón «+» te ayuda a escribirlo."
            />
          )
        ) : null}
      </Modal>
    </section>
  )
}