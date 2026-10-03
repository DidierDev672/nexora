import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { api } from '../../../../lib/api'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import type { Sede, SedeEstado, SubSede } from '../../../sedes/domain/sede'
import {
  mapDiasSemanaToEnglish,
  mapModalidadToEnglish,
  type Tarifa,
  type TarifaInput,
} from '../../domain/tarifa'
import { Loader } from '../../../roles/ui/atoms/loader'
import {
  getCreatedByFromLocalStorage,
  registrarTarifaApi,
} from '../../application/registrar-tarifa-service'
import { Button } from '../atoms/button'
import { TarifaForm } from '../molecules/tarifa-form'

const STATUS_TO_ESTADO: Record<string, SedeEstado> = {
  active: 'activa',
  maintenance: 'mantenimiento',
  inactive: 'inactiva',
}

interface ApiSedeItem {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status: string
}

function parseApiSede(item: ApiSedeItem): Sede {
  return {
    id: item.id,
    name: item.name,
    address: item.address,
    city: item.city,
    phone: item.phone,
    estado: STATUS_TO_ESTADO[item.status] ?? 'activa',
  }
}

// Sedes de ejemplo para asegurar que el usuario siempre pueda interactuar
// incluso en un entorno de desarrollo sin el backend Go corriendo.
const FALLBACK_SEDES: Sede[] = [
  {
    id: 'sede-central',
    name: 'Hotel Nexora Central',
    address: 'Av. Las Palmas 450',
    city: 'Medellín',
    phone: '+57 4 444 0101',
    estado: 'activa',
  },
  {
    id: 'sede-costa',
    name: 'Nexora Resort & Beach',
    address: 'Bulevar Marino 12',
    city: 'Cartagena',
    phone: '+57 5 666 0202',
    estado: 'activa',
  },
  {
    id: 'sede-valle',
    name: 'Nexora Boutique Valle',
    address: 'Calle Real 88',
    city: 'Cali',
    phone: '+57 2 888 0303',
    estado: 'activa',
  },
]

const FALLBACK_SUB_SEDES: Record<string, SubSede[]> = {
  'sede-central': [
    {
      id: 'sub-central-torre-a',
      headquarter_id: 'sede-central',
      name: 'Torre Ejecutiva A',
      address: 'Pisos 1 al 10',
      phone: '+57 4 444 0102',
      status: 'active',
    },
    {
      id: 'sub-central-villas',
      headquarter_id: 'sede-central',
      name: 'Villas Jardín Premium',
      address: 'Zona Este',
      phone: '+57 4 444 0103',
      status: 'active',
    },
  ],
  'sede-costa': [
    {
      id: 'sub-costa-mar',
      headquarter_id: 'sede-costa',
      name: 'Suites Frente al Mar',
      address: 'Ala Norte',
      phone: '+57 5 666 0203',
      status: 'active',
    },
  ],
}

import type { TipoCama } from '../../../cama3d/domain/tipo-cama'

export interface TarifaRegistroCardProps {
  selectedTipoCama?: TipoCama | null
  className?: string
  onRegistrarTarifas?: (values?: TarifaInput) => Promise<void> | void
  onSubSedeChange?: (subSedeId: string) => void
  onSedeChange?: (sedeId: string) => void
}

export function TarifaRegistroCard({
  selectedTipoCama,
  className = '',
  onRegistrarTarifas,
  onSubSedeChange,
  onSedeChange,
}: TarifaRegistroCardProps = {}) {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [sedesLoading, setSedesLoading] = useState(true)
  const [sedesError, setSedesError] = useState<string | null>(null)

  const [subSedes, setSubSedes] = useState<SubSede[]>([])
  const [subSedesLoading, setSubSedesLoading] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submittingName, setSubmittingName] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successTarifa, setSuccessTarifa] = useState<Tarifa | null>(null)

  const submittingRef = useRef(false)

  // Carga de Sedes con tolerancia a fallos
  const fetchSedes = useCallback(() => {
    setSedesLoading(true)
    setSedesError(null)

    api
      .get<ApiSedeItem[]>('/headquarters')
      .then((response) => {
        if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
          setSedes(response.data.map(parseApiSede))
        } else {
          setSedes(FALLBACK_SEDES)
        }
      })
      .catch(() => {
        // Usamos el fallback seguro para permitir pruebas sin fricción
        setSedes(FALLBACK_SEDES)
      })
      .finally(() => {
        setSedesLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchSedes()
  }, [fetchSedes])

  // Carga reactiva de Sub-sedes según la sede seleccionada
  const handleSedeChange = useCallback(
    (sedeId: string) => {
      onSedeChange?.(sedeId)
      onSubSedeChange?.('')

      if (!sedeId) {
        setSubSedes([])
        return
      }

      setSubSedesLoading(true)
      api
        .get<SubSede[]>(`/sub-headquarters/by-headquarter/${sedeId}`)
        .then((response) => {
          if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
            setSubSedes(response.data)
          } else {
            setSubSedes(FALLBACK_SUB_SEDES[sedeId] ?? [])
          }
        })
        .catch(() => {
          setSubSedes(FALLBACK_SUB_SEDES[sedeId] ?? [])
        })
        .finally(() => {
          setSubSedesLoading(false)
        })
    },
    [onSedeChange, onSubSedeChange],
  )

  // Guardado de la tarifa
  const handleSubmit = async (values: TarifaInput) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setSubmittingName(values.nombre)
    setSubmitError(null)

    if (onRegistrarTarifas) {
      try {
        await onRegistrarTarifas(values)
      } finally {
        setSubmitting(false)
        setSubmittingName('')
        submittingRef.current = false
      }
      return
    }

    try {
      const sedeObj = sedes.find((s) => s.id === values.sedeId)
      const subSedeObj = subSedes.find((s) => (s.id ?? s.name) === values.subSedeId)

      const payload = {
        name: values.nombre.trim() || 'Tarifa Noche Fin de Semana',
        headquarter_id: values.sedeId || 'hq-1',
        subheadquarter_id: values.subSedeId || null,
        room_type_id: selectedTipoCama?.id ?? null,
        modality: mapModalidadToEnglish(values.modalidad),
        price: values.precio ? Number.parseFloat(values.precio) : 120.0,
        duration_units: values.duracion ? Number.parseInt(values.duracion, 10) : 1,
        start_time: '20:00:00',
        end_time: '08:00:00',
        days_of_week: mapDiasSemanaToEnglish(values.diasSemana),
        status: values.estado === 'inactivo' ? 'inactive' : 'active',
        created_by: getCreatedByFromLocalStorage(),
      }

      const res = await registrarTarifaApi(payload)

      if (res.ok) {
        const tarifaCreada: Tarifa = {
          id: `tarifa-${Date.now()}`,
          nombre: payload.name,
          sedeId: payload.headquarter_id,
          sedeNombre: sedeObj?.name,
          subSedeId: payload.subheadquarter_id ?? undefined,
          subSedeNombre: subSedeObj?.name,
          modalidad: payload.modality as Tarifa['modalidad'],
          precio: payload.price,
          duracion: payload.duration_units,
          fechaInicio: values.fechaInicio || '2026-09-28',
          fechaFinal: values.fechaFinal || '2026-12-31',
          diasSemana: payload.days_of_week as Tarifa['diasSemana'],
          estado: (values.estado || 'activo') as Tarifa['estado'],
          createdAt: new Date().toISOString(),
        }
        setSuccessTarifa(tarifaCreada)
      } else {
        setSubmitError(
          'Se presentó una falla al intentar registrar la tarifa en el servidor. Pero no te preocupes: tu información se encuentra a salvo y puedes intentarlo de nuevo con total tranquilidad.',
        )
      }
    } catch {
      setSubmitError(
        'No te preocupes, nada de lo que escribiste se ha perdido. Hubo una breve pausa en la comunicación del servidor. Revisa tu conexión e inténtalo de nuevo con un clic.',
      )
    } finally {
      setSubmitting(false)
      setSubmittingName('')
      submittingRef.current = false
    }
  }

  const handleResetAfterSuccess = () => {
    setSuccessTarifa(null)
    setSubmitError(null)
  }

  return (
    <>
      <motion.section
        aria-label="Formulario de registro de tarifas"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className={className || 'mt-8'}
      >
        <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm sm:p-10 backdrop-blur-xs">
          {successTarifa ? (
            /* Pantalla de confirmación psicológica */
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-center py-6"
            >
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg
                  className="size-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <span className="mt-4 inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Tarifa guardada
              </span>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                ¡«{successTarifa.nombre}» ya está registrada!
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
                La tarifa por un valor de{' '}
                <strong className="text-primary font-bold">
                  ${successTarifa.precio.toFixed(2)}
                </strong>{' '}
                quedó configurada con éxito. Tus recepcionistas y el motor de reservas ya pueden
                aplicarla a las habitaciones correspondientes.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  variant="primary"
                  onClick={handleResetAfterSuccess}
                  className="px-6 py-2.5"
                >
                  Registrar otra tarifa
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Encabezado contextual de la Card */}
              <div className="mb-6 flex flex-col justify-between gap-2 border-b border-line pb-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-ink sm:text-2xl">
                    Detalles de la nueva tarifa
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Completa la información con tranquilidad. Todos los campos marcados con asterisco (*) son obligatorios.
                  </p>
                </div>
                <div className="hidden sm:block">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/80 px-3 py-1 text-xs font-medium text-ink-muted">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Editor activo
                  </span>
                </div>
              </div>

              {/* Formulario */}
              <TarifaForm
                sedes={sedes}
                sedesLoading={sedesLoading}
                subSedes={subSedes}
                subSedesLoading={subSedesLoading}
                submitting={submitting}
                onSedeChange={handleSedeChange}
                onSubSedeChange={onSubSedeChange}
                onSubmit={handleSubmit}
                selectedTipoCama={selectedTipoCama}
              />

              {/* Aviso en caso de problemas con sedes */}
              {sedesError && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm font-medium text-ink">
                    {sedesError}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 text-xs py-1.5"
                    onClick={fetchSedes}
                  >
                    Reintentar sedes
                  </Button>
                </motion.div>
              )}

              {/* Mensaje de error amigable sin culpar al usuario */}
              {submitError && (
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  role="alert"
                  className="mt-6 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
                >
                  {submitError}
                </motion.p>
              )}
            </>
          )}
        </div>
      </motion.section>

      {/* Componente reutilizable Loader */}
      <Loader
        overlay
        visible={submitting}
        label={
          submittingName
            ? `Registrando «${submittingName}» con total seguridad…`
            : 'Registrando tu tarifa con total seguridad…'
        }
      />
    </>
  )
}
