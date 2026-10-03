import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Role, RoleInput } from '../../domain/role'
import { api } from '../../../../lib/api'
import { Button } from '../atoms/button'
import { EmptyState } from '../atoms/empty-state'
import { FadeIn } from '../atoms/fade-in'
import { Loader } from '../atoms/loader'
import { SuccessModal } from '../atoms/success-modal'
import { TextField } from '../atoms/text-input'
import { RoleForm } from '../molecules/role-form'
import { RoleItem } from '../molecules/role-item'
import { useRoles } from '../roles-context'

export function RolesPanel() {
  const { roles, create, update, remove } = useRoles()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [createdRole, setCreatedRole] = useState<RoleInput | null>(null)
  const [error, setError] = useState<string | null>(null)

  const takenNames = useMemo(
    () =>
      roles
        .filter((role) => role.id !== editing?.id)
        .map((role) => role.name.trim().toLowerCase()),
    [roles, editing],
  )

  const visibleRoles = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return roles
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(q) || role.description.toLowerCase().includes(q),
    )
  }, [roles, query])

  const countLabel = roles.length === 1 ? '1 rol' : `${roles.length} roles`

  const closeForm = () => {
    setEditing(null)
    setFormOpen(false)
    setError(null)
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
    setError(null)
  }

  const openEdit = (role: Role) => {
    setEditing(role)
    setFormOpen(true)
    setError(null)
  }

  const handleSubmit = async (values: RoleInput) => {
    if (editing) {
      update(editing.id, values)
      closeForm()
      return
    }

    setCreating(true)
    setError(null)
    try {
      const response = await api.post('/roles', { name: values.name, description: values.description })
      if (response.status === 201) {
        create(values)
        setCreatedRole(values)
        setSuccessOpen(true)
      } else {
        setError('No pudimos crear el rol. Revisa tu conexión e inténtalo de nuevo; tus datos siguen a salvo.')
      }
    } catch {
      setError('No pudimos crear el rol. Revisa tu conexión e inténtalo de nuevo; tus datos siguen a salvo.')
    } finally {
      setCreating(false)
      setFormOpen(false)
    }
  }

  const resetCreateFlow = () => {
    setSuccessOpen(false)
    setCreatedRole(null)
  }

  return (
    <section aria-label="Gestión de roles" className="mt-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-primary">Roles registrados</h2>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">
            {countLabel}
          </span>
        </div>
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
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo rol
        </Button>
      </div>

      <TextField
        label="Buscar roles"
        hideLabel
        placeholder="Buscar por nombre o descripción…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="sm:max-w-xs"
      />

      <AnimatePresence initial={false}>
        {formOpen && (
          <motion.section
            key="role-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-primary/15 bg-surface/25 p-5 sm:p-6">
              {creating ? (
                <Loader label="Creando rol…" fullScreen={false} className="py-10" />
              ) : (
                <>
                  <h3 className="mb-4 text-base font-bold text-primary">
                    {editing ? `Editar rol: ${editing.name}` : 'Registrar nuevo rol'}
                  </h3>
                  <RoleForm
                    key={editing?.id ?? 'new'}
                    initial={editing}
                    takenNames={takenNames}
                    submitLabel={editing ? 'Guardar cambios' : 'Crear rol'}
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

      {roles.length === 0 ? (
        <EmptyState
          title="Aún no hay roles"
          message="Crea el primer rol para empezar a organizar los permisos de tu gestión."
          action={<Button onClick={openCreate}>Crear primer rol</Button>}
        />
      ) : visibleRoles.length === 0 ? (
        <EmptyState
          title={`Sin resultados para “${query.trim()}”`}
          message="Prueba con otro nombre o descripción."
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Limpiar búsqueda
            </Button>
          }
        />
      ) : (
        <motion.ul layout className="space-y-3">
          <AnimatePresence initial={false}>
            {visibleRoles.map((role, index) => (
              <FadeIn key={role.id} duration={500} delay={Math.min(index * 70, 350)}>
                <RoleItem role={role} onEdit={openEdit} onDelete={remove} />
              </FadeIn>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <SuccessModal
        open={successOpen}
        onClose={resetCreateFlow}
        title="¡Rol en acción!"
        message={`El rol «${createdRole?.name ?? ''}» ya está operativo. Tu equipo tiene un nuevo nivel de control, y ese poder está en tus manos.`}
      />
    </section>
  )
}