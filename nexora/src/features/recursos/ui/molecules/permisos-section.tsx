import { useMemo, useState, type FormEvent } from 'react'
import { FadeIn } from '../atoms/fade-in'
import { Button } from '../atoms/button'
import { SelectField } from '../atoms/select-field'
import { RecursosDropdown } from './recursos-dropdown'
import { PermisoRecursoSwitch } from './permiso-recurso-switch'
import type { ApiPermissionResource } from '../../infrastructure/api-module-repository'

export interface PermisoInput {
  usuario: string
  sede: string
  subSede: string
  recurso: string
  permisoRecurso: string
}

interface Option {
  value: string
  label: string
}

export interface PermisosSectionProps {
  usuarioOptions: ReadonlyArray<Option>
  sedeOptions: ReadonlyArray<Option>
  subSedeOptions: ReadonlyArray<Option>
  permissionResources: ReadonlyArray<ApiPermissionResource>
  onUsuarioChange?: (value: string) => void
  onSedeChange?: (value: string) => void
  onSubmit: (input: PermisoInput) => void
  loading?: boolean
  loadingSubSede?: boolean
  loadingPermissionResources?: boolean
  permissionResourcesError?: string | null
  onRetryPermissionResources?: () => void
  submitting?: boolean
  loadError?: boolean
  onRetry?: () => void
  delay?: number
}

export function PermisosSection({
  usuarioOptions,
  sedeOptions,
  subSedeOptions,
  permissionResources,
  onUsuarioChange,
  onSedeChange,
  onSubmit,
  loading = false,
  loadingSubSede = false,
  loadingPermissionResources = false,
  permissionResourcesError = null,
  onRetryPermissionResources,
  submitting = false,
  loadError = false,
  onRetry,
  delay = 0,
}: PermisosSectionProps) {
  const [usuario, setUsuario] = useState('')
  const [sede, setSede] = useState('')
  const [subSede, setSubSede] = useState('')
  const [recurso, setRecurso] = useState('')
  const [errors, setErrors] = useState<{
    usuario?: string
    sede?: string
    recurso?: string
  }>({})

  const permissionResource = useMemo(
    () => permissionResources.find((item) => String(item.resource_id) === recurso),
    [permissionResources, recurso],
  )

  const handleUsuarioChange = (value: string) => {
    setUsuario(value)
    if (value) setErrors((prev) => ({ ...prev, usuario: undefined }))
    onUsuarioChange?.(value)
  }

  const handleSedeChange = (value: string) => {
    setSede(value)
    setSubSede('')
    if (value) setErrors((prev) => ({ ...prev, sede: undefined }))
    onSedeChange?.(value)
  }

  const handleRecursoChange = (value: string) => {
    setRecurso(value)
    if (value) setErrors((prev) => ({ ...prev, recurso: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: typeof errors = {}

    if (!usuario) nextErrors.usuario = 'Seleccioná a quién vas a darle acceso.'
    if (!sede) nextErrors.sede = 'Seleccioná una sede para asignar el permiso.'
    if (!recurso) nextErrors.recurso = 'Elegí un recurso para asignar el permiso.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      usuario,
      sede,
      subSede,
      recurso: String(recurso),
      permisoRecurso: permissionResource ? String(permissionResource.id) : '',
    })
  }

  const showSubSede = subSedeOptions.length > 0

  return (
    <FadeIn duration={1} delay={delay / 1000} className="rounded-2xl border border-line bg-panel shadow-sm">
      <section aria-labelledby="permisos-section-title">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <h3 id="permisos-section-title" className="text-base font-bold text-ink">
          Asignación de permisos
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          Definí quién entra y hasta dónde llega: a qué usuario, en qué sedes y qué sub
          sedes puede operar.
        </p>
      </div>

      {loadError ? (
        <div role="alert" className="border-b border-danger/15 bg-danger/5 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">Ups, no pudimos cargar los recursos.</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                No fue tu culpa: nuestro servidor se puso nervioso y le costó pasarnos la
                información. Ya estamos encargándonos para dejarlo todo en su lugar.
              </p>
              <button
                type="button"
                onClick={onRetry}
                disabled={loading}
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? 'Cargando…' : 'Reintentar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FadeIn duration={0.45} delay={0}>
            <SelectField
              label="Usuario"
              placeholder={loading ? 'Cargando usuarios…' : 'Elegir usuario…'}
              options={usuarioOptions}
              value={usuario}
              onChange={(event) => handleUsuarioChange(event.target.value)}
              error={errors.usuario}
              required
              disabled={loading}
              emptyLabel={loading ? undefined : 'Aún no hay usuarios registrados.'}
            />
          </FadeIn>
          <FadeIn duration={0.45} delay={0.07}>
            <SelectField
              label="Sede"
              placeholder={loading ? 'Cargando sedes…' : 'Elegir sede…'}
              options={sedeOptions}
              value={sede}
              onChange={(event) => handleSedeChange(event.target.value)}
              error={errors.sede}
              required
              disabled={loading}
              emptyLabel={loading ? undefined : 'Aún no hay sedes registradas.'}
            />
          </FadeIn>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FadeIn duration={0.45} delay={0.14}>
            {showSubSede || loadingSubSede ? (
              <SelectField
                label="Sub sede"
                placeholder={loadingSubSede ? 'Cargando sub sedes…' : 'Elegir sub sede…'}
                options={subSedeOptions}
                value={subSede}
                onChange={(event) => setSubSede(event.target.value)}
                required
                disabled={loading || loadingSubSede}
              />
            ) : (
              <SelectField
                label="Sub sede"
                placeholder="Elegir sub sede…"
                options={subSedeOptions}
                value={subSede}
                onChange={(event) => setSubSede(event.target.value)}
                emptyLabel={
                  sede
                    ? 'Esta sede no tiene sub sedes.'
                    : 'Elegí primero una sede para ver sus sub sedes.'
                }
                disabled={loading}
              />
            )}
          </FadeIn>

          <FadeIn duration={0.45} delay={0.21}>
            <RecursosDropdown
              value={recurso}
              onChange={handleRecursoChange}
              error={errors.recurso}
            />
          </FadeIn>
        </div>

        <FadeIn duration={0.45} delay={0.28} className="mt-4">
          <PermisoRecursoSwitch
            checked={permissionResource?.permission ?? false}
            resourceId={recurso}
            loading={loadingPermissionResources}
            errorMessage={permissionResourcesError}
            retrying={loadingPermissionResources}
            onRetry={onRetryPermissionResources}
          />
        </FadeIn>

        <FadeIn duration={0.45} delay={0.35} className="mt-6 flex items-center justify-end">
          <Button type="submit" disabled={loading || submitting}>
            {submitting ? 'Asignando…' : 'Asignar permiso'}
          </Button>
        </FadeIn>
      </form>
      </section>
    </FadeIn>
  )
}
