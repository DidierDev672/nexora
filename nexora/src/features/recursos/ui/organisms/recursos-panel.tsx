import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { PermisosSection, type PermisoInput } from '../molecules/permisos-section'
import { Loader } from '../atoms/loader'
import { SuccessModal } from '../atoms/success-modal'
import { ErrorModal } from '../atoms/error-modal'
import {
  ApiModuleRepository,
  type ApiHeadquarter,
  type ApiPermissionResource,
  type ApiSubHeadquarter,
  type ApiUser,
} from '../../infrastructure/api-module-repository'
import {
  toHeadquarterOption,
  toSubHeadquarterOption,
  toUserOption,
} from '../../application/selector-mappers'

const apiModuleRepository = new ApiModuleRepository()

const permissionResourceErrorMessage =
  'Nada de qué preocuparse, no fue algo que hayas hecho vos: se nos cruzó algo del otro lado y no pudimos leer el permiso de este recurso. Ya lo estamos resolviendo. Probá de nuevo en un instante y vas a ver su estado.'

const permissionResourceUnexpectedMessage =
  'Se nos complicó leer el permiso del recurso. No es tu culpa: estamos revisándolo. Probá otra vez en un momento y seguimos.'

const assignmentSuccessMessage =
  'Quedó todo en su lugar: el permiso se asignó con éxito y ya está activo. Buen trabajo — cada acceso que ordenás deja tu sistema más claro y seguro. Podés seguir cuando quieras, acá estamos.'

const assignmentErrorMessage =
  'No es tu culpa y nada se perdió: tus selecciones siguen intactas y a salvo. Del otro lado algo no salió como esperábamos y el permiso no llegó a crearse. Probá de nuevo en un instante; lo que cargaste te está esperando.'

export function RecursosPanel() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [headquarters, setHeadquarters] = useState<ApiHeadquarter[]>([])
  const [subHeadquarters, setSubHeadquarters] = useState<ApiSubHeadquarter[]>([])
  const [permissionResources, setPermissionResources] = useState<ApiPermissionResource[]>([])
  const [selectedSede, setSelectedSede] = useState('')
  const [loadingRecursos, setLoadingRecursos] = useState(true)
  const [loadingSubSede, setLoadingSubSede] = useState(false)
  const [loadingPermissionResources, setLoadingPermissionResources] = useState(true)
  const [permissionResourcesError, setPermissionResourcesError] = useState<string | null>(null)
  const [recursosFailed, setRecursosFailed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ title: string; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadRecursos = useCallback(async () => {
    try {
      const [usersData, headquartersData] = await Promise.all([
        apiModuleRepository.listUsers(),
        apiModuleRepository.listHeadquarters(),
      ])
      setUsers(usersData)
      setHeadquarters(headquartersData)
    } catch {
      setRecursosFailed(true)
    } finally {
      setLoadingRecursos(false)
    }
  }, [])

  const loadPermissionResources = useCallback(async () => {
    setLoadingPermissionResources(true)
    setPermissionResourcesError(null)
    try {
      const data = await apiModuleRepository.listPermissionResources()
      setPermissionResources(data)
    } catch (caught) {
      if (axios.isAxiosError(caught) && caught.response?.status === 400) {
        setPermissionResourcesError(permissionResourceErrorMessage)
      } else {
        setPermissionResourcesError(permissionResourceUnexpectedMessage)
      }
    } finally {
      setLoadingPermissionResources(false)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      await loadRecursos()
    })()
  }, [loadRecursos])

  useEffect(() => {
    void (async () => {
      await loadPermissionResources()
    })()
  }, [loadPermissionResources])

  const loadSubHeadquarters = useCallback(async (headquarterId: string) => {
    setLoadingSubSede(true)
    setSubHeadquarters([])
    try {
      const items = await apiModuleRepository.listSubHeadquarters(headquarterId)
      setSubHeadquarters(items)
    } catch {
      setRecursosFailed(true)
    } finally {
      setLoadingSubSede(false)
    }
  }, [])

  const handleSedeChange = (value: string) => {
    setSelectedSede(value)
    setSubHeadquarters([])
    if (value) {
      void loadSubHeadquarters(value)
    }
  }

  const userOptions = useMemo(() => users.map(toUserOption), [users])
  const headquarterOptions = useMemo(() => headquarters.map(toHeadquarterOption), [headquarters])
  const subSedeOptions = useMemo(
    () => subHeadquarters.map(toSubHeadquarterOption),
    [subHeadquarters],
  )

  const handleAsignarPermiso = async (input: PermisoInput) => {
    setSubmitting(true)
    setError(null)
    const payload = {
      id_user: input.usuario,
      id_headquarters: input.sede,
      id_sub_headquarters: input.subSede || null,
      id_resource: String(input.recurso),
      id_permission_resource: String(input.permisoRecurso),
    }
    try {
      const status = await apiModuleRepository.createPermissionAssignment(payload)
      if (status === 201) {
        setSuccess({ title: '¡Permiso asignado con éxito!', message: assignmentSuccessMessage })
      } else {
        setError(assignmentErrorMessage)
      }
    } catch {
      setError(assignmentErrorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const retryRecursos = () => {
    setLoadingRecursos(true)
    setRecursosFailed(false)
    void loadRecursos()
    void loadPermissionResources()
    if (selectedSede) {
      void loadSubHeadquarters(selectedSede)
    }
  }

  return (
    <main className="mt-8 space-y-6" aria-label="Panel de recursos">
      <PermisosSection
        usuarioOptions={userOptions}
        sedeOptions={headquarterOptions}
        subSedeOptions={subSedeOptions}
        permissionResources={permissionResources}
        onSedeChange={handleSedeChange}
        onSubmit={handleAsignarPermiso}
        loading={loadingRecursos}
        loadingSubSede={loadingSubSede}
        loadingPermissionResources={loadingPermissionResources}
        permissionResourcesError={permissionResourcesError}
        onRetryPermissionResources={loadPermissionResources}
        submitting={submitting}
        loadError={recursosFailed}
        onRetry={retryRecursos}
      />

      <Loader overlay visible={submitting} label="Asignando permiso…" />

      <SuccessModal
        open={success !== null}
        onClose={() => setSuccess(null)}
        title={success?.title ?? 'Éxito'}
        message={success?.message ?? ''}
      />

      <ErrorModal
        open={error !== null}
        onClose={() => setError(null)}
        title="No pudimos asignar el permiso"
        message={error ?? ''}
      />
    </main>
  )
}
