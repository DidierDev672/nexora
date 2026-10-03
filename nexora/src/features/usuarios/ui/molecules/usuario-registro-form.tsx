import { useState, type FormEvent } from 'react'
import type { Role } from '../../../roles/domain/role'
import type { Sede, SubSede } from '../../../sedes/domain/sede'
import { Input } from '../../../../shared/ui/Input'
import {
  USUARIO_ESTADOS,
  USUARIO_ESTADO_LABELS,
  validateUsuarioInput,
  type UsuarioEstado,
  type UsuarioInput,
  type UsuarioValidationErrors,
} from '../../domain/usuario'
import { Button } from '../atoms/button'
import { SelectField } from '../atoms/select-field'

export interface UsuarioRegistroFormProps {
  roles: Role[]
  rolesLoading?: boolean
  sedes: Sede[]
  sedesLoading: boolean
  subSedes: SubSede[]
  subSedesLoading: boolean
  submitting: boolean
  onSedeChange: (sedeId: string) => void
  onSubmit: (values: UsuarioInput) => void
}

export function UsuarioRegistroForm({
  roles,
  rolesLoading = false,
  sedes,
  sedesLoading,
  subSedes,
  subSedesLoading,
  submitting,
  onSedeChange,
  onSubmit,
}: UsuarioRegistroFormProps) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('')
  const [sedeId, setSedeId] = useState('')
  const [subSedeId, setSubSedeId] = useState('')
  const [estado, setEstado] = useState<UsuarioEstado>('activo')
  const [errors, setErrors] = useState<UsuarioValidationErrors>({})

  const clearError = (field: keyof UsuarioValidationErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const handleSedeChange = (value: string) => {
    setSedeId(value)
    setSubSedeId('')
    clearError('sedeId')
    clearError('subSedeId')
    onSedeChange(value)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values: UsuarioInput = {
      nombre,
      email,
      password,
      rol,
      sedeId,
      subSedeId: subSedeId || undefined,
      estado,
    }
    const nextErrors = validateUsuarioInput(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Input
        label="Nombre"
        placeholder="Ej. Mariana López"
        autoComplete="name"
        maxLength={80}
        required
        value={nombre}
        onChange={(event) => {
          setNombre(event.target.value)
          clearError('nombre')
        }}
        error={errors.nombre}
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
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        }
      />

      <Input
        label="Correo electrónico"
        type="email"
        inputMode="email"
        placeholder="mariana@hotel.com"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value)
          clearError('email')
        }}
        error={errors.email}
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
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        }
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => {
          setPassword(event.target.value)
          clearError('password')
        }}
        error={errors.password}
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
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Rol"
          required
          disabled={rolesLoading}
          value={rol}
          onChange={(event) => {
            setRol(event.target.value)
            clearError('rol')
          }}
          error={errors.rol}
        >
          <option value="">
            {rolesLoading ? 'Cargando roles…' : 'Elige un rol…'}
          </option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Estado"
          required
          value={estado}
          onChange={(event) => setEstado(event.target.value as UsuarioEstado)}
          error={errors.estado}
        >
          {USUARIO_ESTADOS.map((value) => (
            <option key={value} value={value}>
              {USUARIO_ESTADO_LABELS[value]}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Sede"
          required
          disabled={sedesLoading}
          value={sedeId}
          onChange={(event) => handleSedeChange(event.target.value)}
          error={errors.sedeId}
        >
          <option value="">
            {sedesLoading ? 'Cargando sedes…' : 'Elige una sede…'}
          </option>
          {sedes.map((sede) => (
            <option key={sede.id} value={sede.id}>
              {sede.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Sub sede"
          disabled={!sedeId || subSedesLoading}
          value={subSedeId}
          onChange={(event) => {
            setSubSedeId(event.target.value)
            clearError('subSedeId')
          }}
          error={errors.subSedeId}
        >
          <option value="">
            {!sedeId
              ? 'Primero elige una sede'
              : subSedesLoading
                ? 'Cargando sub sedes…'
                : subSedes.length === 0
                  ? 'Sin sub sedes'
                  : 'Opcional: elige una sub sede'}
          </option>
          {subSedes.map((sub) => (
            <option key={sub.id ?? sub.name} value={sub.id ?? sub.name}>
              {sub.name}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <>
              <span
                className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              />
              Registrando…
            </>
          ) : (
            'Registrar usuario'
          )}
        </Button>
      </div>
    </form>
  )
}