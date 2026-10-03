import { useState, type FormEvent } from 'react'
import {
  ADDRESS_MAX,
  CITY_MAX,
  NAME_MAX,
  PHONE_MAX,
  SEDE_ESTADOS,
  SEDE_ESTADO_LABELS,
  validateSedeInput,
  type Sede,
  type SedeEstado,
  type SedeInput,
} from '../../domain/sede'
import { Button } from '../atoms/button'
import { SelectField } from '../atoms/select-field'
import { TextArea } from '../atoms/text-area'
import { TextField } from '../atoms/text-field'

export interface SedeFormProps {
  initial?: Sede | null
  takenNames: string[]
  submitLabel: string
  submitting?: boolean
  submitError?: string | null
  onCancel: () => void
  onSubmit: (values: SedeInput) => void
}

export function SedeForm({
  initial,
  takenNames,
  submitLabel,
  submitting = false,
  submitError = null,
  onCancel,
  onSubmit,
}: SedeFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [estado, setEstado] = useState<SedeEstado>(initial?.estado ?? 'activa')
  const [errors, setErrors] = useState<{
    name?: string
    address?: string
    city?: string
    phone?: string
    estado?: string
  }>({})

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values: SedeInput = { name, address, city, phone, estado }
    const nextErrors = validateSedeInput(values)

    if (takenNames.includes(values.name.trim().toLowerCase())) {
      nextErrors.name = 'Ya existe una sede con ese nombre.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <TextField
        label="Nombre"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        hint={`${name.length}/${NAME_MAX} caracteres`}
        placeholder="Ej. Sede Central Bogotá"
        maxLength={NAME_MAX}
        autoFocus
        required
      />
      <TextArea
        label="Dirección"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        error={errors.address}
        hint={`${address.length}/${ADDRESS_MAX} caracteres`}
        placeholder="Calle, número y referencia"
        maxLength={ADDRESS_MAX}
        rows={2}
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Ciudad"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          error={errors.city}
          hint={`${city.length}/${CITY_MAX} caracteres`}
          placeholder="Ej. Bogotá"
          maxLength={CITY_MAX}
          required
        />
        <TextField
          label="Teléfono"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          error={errors.phone}
          hint={`${phone.length}/${PHONE_MAX} caracteres`}
          placeholder="+57 601 745 2000"
          maxLength={PHONE_MAX}
          required
        />
      </div>
      <SelectField
        label="Estado"
        value={estado}
        onChange={(event) => setEstado(event.target.value as SedeEstado)}
        error={errors.estado}
        required
      >
        {SEDE_ESTADOS.map((value) => (
          <option key={value} value={value}>
            {SEDE_ESTADO_LABELS[value]}
          </option>
        ))}
      </SelectField>
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