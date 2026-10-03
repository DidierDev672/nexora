import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { fadeUp } from '../../../design-tokens/motion'
import { api } from '../../../lib/api'
import type { TipoCama } from '../../cama3d/domain/tipo-cama'
import {
  mapDiasSemanaToEnglish,
  mapModalidadToEnglish,
  type TarifaInput,
} from '../domain/tarifa'
import { Loader } from '../../tema/ui/atoms/loader'
import {
  buildTarifaPayload,
  getCreatedByFromLocalStorage,
} from '../application/registrar-tarifa-service'
import { TarifasHeader } from './molecules/tarifas-header'
import {
  TiposCamaMenu3d,
  CATALOGO_CAMAS_DEFAULT,
} from './molecules/tipos-cama-menu-3d'
import { TarifaRegistroCard } from './organisms/tarifa-registro-card'
import {
  TarifasViewModeToggle,
  type TarifaViewMode,
} from './molecules/tarifas-view-mode-toggle'
import { TarifasListaPage } from './tarifas-lista-page'

export { TarifasListaPage }

interface FeedbackMessage {
  type: 'success' | 'error'
  title: string
  message: string
  subtext?: string
}

export function TarifasPage() {
  const [activeTab, setActiveTab] = useState<'lista' | 'registro'>('lista')
  const [viewMode, setViewMode] = useState<TarifaViewMode>('cards')
  const [selectedTipoCama, setSelectedTipoCama] = useState<TipoCama | null>(
    () => CATALOGO_CAMAS_DEFAULT[0] ?? null,
  )
  const [selectedSubSedeId, setSelectedSubSedeId] = useState<string | null>(null)
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null)

  const handleApplyToTarifa = (tipo: TipoCama) => {
    setSelectedTipoCama(tipo)
  }

  /**
   * Registra la tarifa construyendo el payload requerido en segundo plano,
   * leyendo created_by desde el JSON auth_token en localStorage,
   * obteniendo dinámicamente el subheadquarter_id de la sub sede seleccionada
   * y el room_type_id del tipo de cama seleccionado en 3D.
   */
  const handleRegistrarTarifas = async (formData?: TarifaInput) => {
    // 1. Mostrar en pantalla el componente reutilizable Loader
    setIsLoading(true)
    setFeedback(null)

    // 2. Obtener created_by desde localStorage (auth_token -> Email)
    const createdByEmail = getCreatedByFromLocalStorage()

    // 3. Obtener dinámicamente subheadquarter_id y room_type_id
    const subheadquarterId = formData?.subSedeId || selectedSubSedeId || null
    const roomTypeId = selectedTipoCama?.id || null
    const headquarterId = formData?.sedeId || selectedSedeId || 'hq-1'

    // 4. Construir en segundo plano el payload exacto solicitado
    const payload = buildTarifaPayload({
      name: formData?.nombre?.trim() || 'Tarifa Noche Fin de Semana',
      headquarter_id: headquarterId,
      subheadquarter_id: subheadquarterId,
      room_type_id: roomTypeId,
      modality: mapModalidadToEnglish(formData?.modalidad),
      price: formData?.precio ? Number.parseFloat(formData.precio) : 120.0,
      duration_units: formData?.duracion ? Number.parseInt(formData.duracion, 10) : 1,
      start_time: '20:00:00',
      end_time: '08:00:00',
      days_of_week: mapDiasSemanaToEnglish(formData?.diasSemana),
      status: formData?.estado === 'inactivo' ? 'inactive' : 'active',
      created_by: createdByEmail,
    })

    try {
      // 4. Enviar payload al endpoint /rate con el método POST
      const response = await api.post('/rate', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // Permite evaluar todos los status codes HTTP
      })

      // SWITCH DE VALIDACIÓN DE STATUS CODE
      switch (response.status) {
        case 200: {
          // En status 200 no se presenta mensaje al usuario
          setFeedback(null)
          break
        }

        case 201: {
          // Status 201 (Created): Mensaje amigable con psicología positiva
          setFeedback({
            type: 'success',
            title: '¡Tarifa registrada con éxito!',
            message:
              'Todo ha quedado configurado a la perfección. La tarifa «Tarifa Noche Fin de Semana» ya está activa en el sistema y lista para ser aplicada en las reservaciones de tus huéspedes.',
            subtext:
              'Tus recepcionistas y el motor de reservas ya pueden utilizarla con total confianza y tranquilidad.',
          })
          break
        }

        default: {
          // En caso de status de error: Mensaje amigable con psicología de no-culpabilidad
          setFeedback({
            type: 'error',
            title: 'No pudimos registrar la tarifa en este momento',
            message:
              'Se presentó una pequeña falla en la comunicación con el servidor al intentar registrar la tarifa. Pero no te preocupes: tu información se encuentra completamente a salvo.',
            subtext:
              'Te sugerimos revisar tu conexión o presionar "Reintentar registro" para intentarlo nuevamente sin perder nada de lo avanzado.',
          })
          break
        }
      }
    } catch {
      // Fallo de red o servidor no disponible: mensaje empático y tranquilizador
      setFeedback({
        type: 'error',
        title: 'No pudimos registrar la tarifa en este momento',
        message:
          'Se presentó una interrupción temporal de conexión al intentar registrar la tarifa. No te preocupes: todos tus datos permanecen seguros.',
        subtext:
          'Comprueba que tu red esté activa y pulsa "Reintentar registro" para sincronizar de nuevo en un segundo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 sm:px-6 lg:px-8">
      {/* Componente reutilizable Loader con overlay y label psicológico de tranquilidad */}
      <Loader
        overlay
        visible={isLoading}
        label="Registrando tu tarifa con total seguridad…"
      />

      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Selector de pestañas: Listado de tarifas registradas vs Registro */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="tablist"
            aria-label="Vistas de gestión de tarifas"
            className="inline-flex rounded-2xl border border-stone-200/80 bg-white/80 p-1.5 shadow-2xs backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'lista'}
              onClick={() => setActiveTab('lista')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'lista'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-stone-600 hover:text-ink dark:text-stone-300 dark:hover:text-white'
              }`}
            >
              <span>📋 Catálogo de Tarifas Registradas</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'registro'}
              onClick={() => setActiveTab('registro')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'registro'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-stone-600 hover:text-ink dark:text-stone-300 dark:hover:text-white'
              }`}
            >
              <span>➕ Registrar Nueva Tarifa</span>
            </button>
          </div>

          {/* Menú para cambiar la versión de visualización (Tablas / Cartas) basado estrictamente en figuras/iconos */}
          {activeTab === 'lista' && (
            <div className="flex items-center gap-2">
              <TarifasViewModeToggle
                viewMode={viewMode}
                onChange={setViewMode}
              />
            </div>
          )}
        </div>

        {activeTab === 'lista' ? (
          <TarifasListaPage
            onGoToRegister={() => setActiveTab('registro')}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        ) : (
          <>
            {/* Header con botón de registrar tarifas, orientación espacial y tranquilidad */}
            <TarifasHeader
              onRegistrarTarifas={() => handleRegistrarTarifas()}
              isLoading={isLoading}
            />

            {/* Mensaje de retroalimentación psicológica en pantalla (Éxito / Falla) */}
            <AnimatePresence mode="wait">
          {feedback && (
            <motion.section
              key={feedback.type + feedback.title}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -12 }}
              role={feedback.type === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              className={`rounded-2xl border p-5 shadow-sm transition-all sm:p-6 ${
                feedback.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icono psicológico */}
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}
                  aria-hidden="true"
                >
                  {feedback.type === 'success' ? (
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                </div>

                {/* Contenido textual psicológicamente guiado */}
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      feedback.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {feedback.type === 'success' ? 'Confirmación del sistema' : 'Aviso del sistema'}
                  </span>

                  <h2 className="mt-1 text-base font-bold sm:text-lg">
                    {feedback.title}
                  </h2>

                  <p className="mt-1.5 text-sm leading-relaxed opacity-90 sm:text-base">
                    {feedback.message}
                  </p>

                  {feedback.subtext && (
                    <p className="mt-1 text-xs leading-relaxed opacity-75 sm:text-sm">
                      {feedback.subtext}
                    </p>
                  )}

                  {/* Acciones para empoderar al usuario (Agency & Empowerment) */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {feedback.type === 'error' && (
                      <button
                        type="button"
                        onClick={() => handleRegistrarTarifas()}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        <svg
                          className="size-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
                        </svg>
                        <span>Reintentar registro</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setFeedback(null)}
                      className="rounded-xl border border-current/25 px-4 py-2 text-xs font-medium opacity-85 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5"
                    >
                      {feedback.type === 'success' ? 'Aceptar' : 'Entendido'}
                    </button>
                  </div>
                </div>

                {/* Botón de cerrar mensaje */}
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="rounded-lg p-1.5 opacity-60 transition hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
                  aria-label="Cerrar notificación"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Layout en dos columnas: Menú 3D a la izquierda de la card "Detalles de la nueva tarifa" */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr] xl:grid-cols-[390px_1fr] lg:items-start">
          {/* Menú al lado izquierdo: Tipos de camas y sofás en 3D interactivo */}
          <aside className="order-2 lg:order-1 lg:sticky lg:top-6">
            <TiposCamaMenu3d
              selectedTipo={selectedTipoCama}
              onSelectTipo={(tipo) => setSelectedTipoCama(tipo)}
              onApplyToTarifa={handleApplyToTarifa}
            />
          </aside>

          {/* Card principal al lado derecho: Detalles de la nueva tarifa */}
          <main className="order-1 lg:order-2">
            <TarifaRegistroCard
              selectedTipoCama={selectedTipoCama}
              onRegistrarTarifas={handleRegistrarTarifas}
              onSubSedeChange={setSelectedSubSedeId}
              onSedeChange={setSelectedSedeId}
              className="mt-0"
            />
          </main>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
