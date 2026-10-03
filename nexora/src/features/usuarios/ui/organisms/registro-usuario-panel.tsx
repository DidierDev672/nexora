import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { api } from '../../../../lib/api'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import type { Role } from '../../../roles/domain/role'
import type { Sede, SedeEstado, SubSede } from '../../../sedes/domain/sede'
import { RegistrarUsuario } from '../../application/registrar-usuario'
import type { Usuario, UsuarioInput } from '../../domain/usuario'
import { ApiUsuarioRepository } from '../../infrastructure/api-usuario-repository'
import { Button } from '../atoms/button'
import { UsuarioRegistroForm } from '../molecules/usuario-registro-form'

const usuarioRepository = new ApiUsuarioRepository()

const STATUS_TO_ESTADO: Record<string, SedeEstado> = {
  active: 'activa',
  maintenance: 'mantenimiento',
  inactive: 'inactiva',
}

interface ApiSede {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status: string
}

function fromApiSede(item: ApiSede): Sede {
  return {
    id: item.id,
    name: item.name,
    address: item.address,
    city: item.city,
    phone: item.phone,
    estado: STATUS_TO_ESTADO[item.status] ?? 'inactiva',
  }
}

export function RegistroUsuarioPanel() {
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [rolesError, setRolesError] = useState<string | null>(null)
  const [sedes, setSedes] = useState<Sede[]>([])
  const [sedesLoading, setSedesLoading] = useState(true)
  const [sedesError, setSedesError] = useState<string | null>(null)
  const [subSedes, setSubSedes] = useState<SubSede[]>([])
  const [subSedesLoading, setSubSedesLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittingName, setSubmittingName] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Usuario | null>(null)
  const submittingRef = useRef(false)

  const fetchSedes = useCallback(() => {
    api
      .get<ApiSede[]>('/headquarters')
      .then((response) => {
        setSedes(response.status === 200 && Array.isArray(response.data) ? response.data.map(fromApiSede) : [])
      })
      .catch(() =>
        setSedesError(
          'No pudimos cargar las sedes, pero el formulario sigue listo. Revisa tu conexión y vuelve a intentarlo.',
        ),
      )
      .finally(() => setSedesLoading(false))
  }, [])

  const loadSedes = useCallback(() => {
    setSedesLoading(true)
    setSedesError(null)
    fetchSedes()
  }, [fetchSedes])

  const fetchRoles = useCallback(() => {
    api
      .get<Role[]>('/roles')
      .then((response) => {
        setRoles(response.status === 200 && Array.isArray(response.data) ? response.data : [])
      })
      .catch(() =>
        setRolesError(
          'No pudimos cargar los roles, elige otro campo y vuelve a intentarlo en un momento.',
        ),
      )
      .finally(() => setRolesLoading(false))
  }, [])

  const loadRoles = useCallback(() => {
    setRolesLoading(true)
    setRolesError(null)
    fetchRoles()
  }, [fetchRoles])

  useEffect(() => {
    fetchSedes()
    fetchRoles()
  }, [fetchSedes, fetchRoles])

  const handleSedeChange = useCallback((sedeId: string) => {
    setSubSedes([])
    setSubSedesLoading(true)
    api
      .get<SubSede[]>(`/sub-headquarters/by-headquarter/${sedeId}`)
      .then((response) => {
        setSubSedes(response.status === 200 && Array.isArray(response.data) ? response.data : [])
      })
      .catch(() => setSubSedes([]))
      .finally(() => setSubSedesLoading(false))
  }, [])

  const handleSubmit = async (values: UsuarioInput) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setSubmittingName(values.nombre)
    setSubmitError(null)
    try {
      const usuario = await RegistrarUsuario(usuarioRepository)(values)
      setSuccess(usuario)
    } catch {
      setSubmitError(
        `Ups, el escenario se apagó justo antes de la función. No pasó nada grave: nada de lo que escribiste se perdió, y ${values.nombre} sigue entre bambalinas con muchas ganas de salir. Revisa tu conexión e inténtalo de nuevo en un momento.`,
      )
    } finally {
      setSubmitting(false)
      setSubmittingName('')
      submittingRef.current = false
    }
  }

  const resetForm = () => {
    setSuccess(null)
    setSubmitError(null)
  }

  return (
    <>
      <motion.section
        aria-label="Registro de usuarios"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mt-8"
      >
        <div className="rounded-2xl border border-line bg-panel p-5 shadow-sm sm:p-8">
          {success ? (
            <SuccessState usuario={success} onReset={resetForm} />
          ) : (
            <>
              <h2 className="text-lg font-bold text-ink">Datos del nuevo integrante</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Completa cada campo con calma; cuando esté listo, él o ella será parte de tu equipo.
              </p>

              <div className="mt-5">
                <UsuarioRegistroForm
                  roles={roles}
                  rolesLoading={rolesLoading}
                  sedes={sedes}
                  sedesLoading={sedesLoading}
                  subSedes={subSedes}
                  subSedesLoading={subSedesLoading}
                  submitting={submitting}
                  onSedeChange={handleSedeChange}
                  onSubmit={handleSubmit}
                />
              </div>

              {sedesError && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p
                    role="status"
                    className="text-sm font-medium text-black"
                  >
                    {sedesError}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    onClick={loadSedes}
                  >
                    Reintentar
                  </Button>
                </motion.div>
              )}

              {rolesError && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p
                    role="status"
                    className="text-sm font-medium text-black"
                  >
                    {rolesError}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    onClick={loadRoles}
                  >
                    Reintentar
                  </Button>
                </motion.div>
              )}

              {submitError && (
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  role="alert"
                  className="mt-4 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
                >
                  {submitError}
                </motion.p>
              )}
            </>
          )}
        </div>
      </motion.section>

      {submitting && (
        <motion.div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-line bg-panel px-8 py-10 text-center shadow-xl"
          >
            <span className="relative flex size-14 items-center justify-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-primary/10" />
              <span className="size-10 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink">
                Registrando a {submittingName}…
              </h3>
              <p className="text-sm text-ink-muted">
                Un momento: ya le estamos guardando su asiento en tu equipo.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

function SuccessState({ usuario, onReset }: { usuario: Usuario; onReset: () => void }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-6 py-12 text-center"
    >
      <span className="grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
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
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="m9 11 3 3L22 4" />
        </svg>
      </span>
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-ink">¡{usuario.nombre} ya es parte de tu equipo!</h3>
        <p className="text-sm leading-relaxed text-ink-muted">
          Su cuenta fue creada con éxito y el tiempo corre a su favor: a partir de ahora, cada día
          es un paso más cerca de su primera gran jornada contigo. El resto de la historia la
          escriben juntos.
        </p>
      </div>
      <Button type="button" variant="secondary" onClick={onReset}>
        Registrar otro usuario
      </Button>
    </motion.div>
  )
}