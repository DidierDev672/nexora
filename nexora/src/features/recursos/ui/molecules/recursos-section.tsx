import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import { Button } from '../atoms/button'
import { SelectField } from '../atoms/select-field'
import { Switch } from '../atoms/switch'
import { TextField } from '../atoms/text-field'

export interface RecursoInput {
  componente: string
  nombre: string
  activo: boolean
}

interface ComponenteOption {
  value: string
  label: string
}

export interface RecursosSectionProps {
  componenteOptions: ReadonlyArray<ComponenteOption>
  onSubmit: (input: RecursoInput) => void
  delay?: number
}

export function RecursosSection({ componenteOptions, onSubmit, delay = 0 }: RecursosSectionProps) {
  const [componente, setComponente] = useState('')
  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState(true)
  const [errors, setErrors] = useState<{ componente?: string; nombre?: string }>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: { componente?: string; nombre?: string } = {}

    if (!componente) {
      nextErrors.componente = 'Elegí un componente para continuar.'
    }
    if (!nombre.trim()) {
      nextErrors.nombre = 'El nombre del componente es obligatorio.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({ componente, nombre: nombre.trim(), activo })
    setComponente('')
    setNombre('')
    setActivo(true)
  }

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, delay: delay / 1000, ease: 'easeOut' }}
      className="rounded-2xl border border-line bg-panel shadow-sm"
      aria-labelledby="recursos-section-title"
    >
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <h3 id="recursos-section-title" className="text-base font-bold text-ink">
          Recursos
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          Da identidad a cada recurso: qué componente es, cómo se llama y si ya está listo
          para funcionar.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Componente"
            placeholder="Elegir componente…"
            options={componenteOptions}
            value={componente}
            onChange={(event) => setComponente(event.target.value)}
            error={errors.componente}
            required
          />
          <TextField
            label="Nombre del componente"
            placeholder="Ej. Panel de reservas"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            error={errors.nombre}
            required
          />
        </div>

        <div className="mt-4">
          <Switch
            label="Componente activo"
            description={
              activo
                ? 'Listo para usarse: ya es visible para tus equipos.'
                : 'En pausa: nadie podrá usarlo hasta que lo actives.'
            }
            checked={activo}
            onChange={setActivo}
          />
        </div>

        <div className="mt-6 flex items-center justify-end">
          <Button type="submit">Registrar recurso</Button>
        </div>
      </form>
    </motion.section>
  )
}