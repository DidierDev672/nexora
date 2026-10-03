import { useState, type FormEvent } from 'react'
import {
  DESCRIPTION_MAX,
  NAME_MAX,
  validateRoleInput,
  type Role,
  type RoleInput,
} from '../../domain/role'
import { Button } from '../atoms/button'
import { TextArea } from '../atoms/text-area'
import { TextField } from '../atoms/text-input'

export interface RoleFormProps {
  initial?: Role | null
  takenNames: string[]
  submitLabel: string
  submitting?: boolean
  submitError?: string | null
  onCancel: () => void
  onSubmit: (values: RoleInput) => void
}

export function RoleForm({
  initial,
  takenNames,
  submitLabel,
  submitting = false,
  submitError = null,
  onCancel,
  onSubmit,
}: RoleFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values: RoleInput = { name, description }
    const nextErrors = validateRoleInput(values)

    if (takenNames.includes(values.name.trim().toLowerCase())) {
      nextErrors.name = 'Ya existe un rol con ese nombre.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <TextField
        label="Nombre"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        hint={`${name.length}/${NAME_MAX} caracteres`}
        placeholder="Ej. Editor de contenido"
        maxLength={NAME_MAX}
        autoFocus
        required
      />
      <TextArea
        label="Descripción"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={errors.description}
        hint={`${description.length}/${DESCRIPTION_MAX} caracteres`}
        placeholder="Qué responsabilidades y permisos tiene este rol…"
        maxLength={DESCRIPTION_MAX}
        rows={3}
      />
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : submitLabel}
        </Button>
      </div>
      {submitError ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {submitError}
        </p>
      ) : null}
    </form>
  )
}