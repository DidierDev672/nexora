import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { fetchPersonById } from '../../infrastructure/stays-api'
import {
  formatDateOfBirth,
  formatDocumentType,
  formatGender,
  type PersonDetail,
} from '../../domain/stay'
import type { StatusCodeValidationResult } from '../../../../shared/lib/status-code-validator'

export interface HuespedDetalleModalProps {
  personId: string | null
  isOpen?: boolean
  onClose: () => void
}

/**
 * Modal interactivo para visualizar la información detallada del huésped con
 * animación ModalPresentationStyle (iOS Page Sheet / Card Stack).
 *
 * Características técnicas implementadas según especificación:
 * 1. AnimatePresence: Envuelve el condicional {isModalOpen && (...)} garantizando
 *    el ciclo completo de desmontaje animado sin retornos prematuros.
 * 2. Física Spring iOS: Deslizamiento vertical con amortiguación calibrada
 *    (damping: 28, stiffness: 280, mass: 0.85).
 * 3. Profundidad 3D en pantalla de fondo: Aplica scale(0.93) y rounded-[24px] a #root
 *    con curva cubic-bezier(0.32, 0.72, 0, 1) y restauración limpia en cleanup.
 * 4. Tirador táctil (pill handle) para experiencia nativa iOS en dispositivos móviles.
 * 5. Cumplimiento estricto de las Reglas de Oro:
 *    - NO expone IDs de huésped (person-1, etc.).
 *    - NO expone creadores de registro (created_by).
 *    - Renderiza exclusivamente los 7 campos requeridos.
 */
export function HuespedDetalleModal({ personId, isOpen, onClose }: HuespedDetalleModalProps) {
  const [person, setPerson] = useState<PersonDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [validationResult, setValidationResult] = useState<StatusCodeValidationResult | null>(null)

  const isModalOpen = isOpen !== undefined ? isOpen : Boolean(personId)

  // Efecto iOS ModalPresentationStyle: escala la pantalla de fondo (scale-[0.93], rounded-[24px], origin-bottom)
  useEffect(() => {
    if (!isModalOpen) return
    const rootEl = document.getElementById('root')
    if (!rootEl) return

    const prevTransition = rootEl.style.transition
    const prevTransform = rootEl.style.transform
    const prevBorderRadius = rootEl.style.borderRadius
    const prevTransformOrigin = rootEl.style.transformOrigin
    const prevOverflow = rootEl.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    const prevBodyBg = document.body.style.backgroundColor

    rootEl.style.transition =
      'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
    rootEl.style.transformOrigin = 'bottom center'
    rootEl.style.transform = 'scale(0.93)'
    rootEl.style.borderRadius = '24px'
    rootEl.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#000000'

    return () => {
      rootEl.style.transition = prevTransition
      rootEl.style.transform = prevTransform
      rootEl.style.borderRadius = prevBorderRadius
      rootEl.style.transformOrigin = prevTransformOrigin
      rootEl.style.overflow = prevOverflow
      document.body.style.overflow = prevBodyOverflow
      document.body.style.backgroundColor = prevBodyBg
    }
  }, [isModalOpen])

  // Carga asíncrona de datos del huésped vía GET /person/{id}
  useEffect(() => {
    if (!personId) return

    let isMounted = true
    setLoading(true)
    setValidationResult(null)

    void fetchPersonById(personId).then((result) => {
      if (!isMounted) return
      setPerson(result.data)
      setValidationResult(result.validation)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [personId])

  // Soporte para cerrar con tecla Escape
  useEffect(() => {
    if (!isModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, onClose])

  const hasError = validationResult && !validationResult.isValid && !person

  // Iniciales para el avatar visual del huésped
  const getInitials = (fullName?: string) => {
    if (!fullName) return 'H'
    return fullName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-huesped-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Fondo oscurecido con desenfoque suave (Backdrop estilo iOS) */}
          <motion.div
            key="backdrop-huesped"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Tarjeta Modal: estilo iOS sheet con física Spring */}
          <motion.div
            key="modal-huesped-content"
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 280,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl border border-line bg-panel p-6 shadow-2xl transition-all sm:p-8 text-ink"
          >
            {/* Tirador táctil / Handle iOS para móvil */}
            <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-line/80 sm:hidden" />

            {/* Cabecera superior con pill descriptiva y botón cerrar */}
            <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5"
                    aria-hidden="true"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Ficha del Huésped</span>
                </span>

                {loading && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted">
                    <span className="inline-block size-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    <span>Consultando…</span>
                  </span>
                )}
              </div>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar ficha de huésped"
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-canvas/80 text-ink-muted hover:border-primary/40 hover:bg-canvas hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4.5"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Estado de Carga (Skeleton animado) */}
            {loading && !person ? (
              <div className="space-y-5 animate-pulse py-6">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-line/60" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-48 rounded-md bg-line/60" />
                    <div className="h-3.5 w-32 rounded-md bg-line/40" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="h-16 rounded-xl bg-line/40" />
                  <div className="h-16 rounded-xl bg-line/40" />
                  <div className="h-16 rounded-xl bg-line/40" />
                  <div className="h-16 rounded-xl bg-line/40" />
                  <div className="h-16 rounded-xl bg-line/40" />
                  <div className="h-16 rounded-xl bg-line/40" />
                </div>
              </div>
            ) : hasError ? (
              /* Estado de Error empático de validateStatusCode */
              <div className="space-y-4 py-8 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-6"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
                <h4 className="text-base font-bold text-ink">
                  {validationResult?.title || 'Ficha no disponible en este momento'}
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed max-w-sm mx-auto">
                  {validationResult?.message ||
                    'No pudimos conectar con el registro del huésped. Tus datos están a salvo; por favor intenta nuevamente.'}
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  {personId && (
                    <button
                      type="button"
                      onClick={() => {
                        setLoading(true)
                        void fetchPersonById(personId).then((result) => {
                          setPerson(result.data)
                          setValidationResult(result.validation)
                          setLoading(false)
                        })
                      }}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition cursor-pointer"
                    >
                      Reintentar consulta
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-semibold text-ink hover:bg-line/30 transition cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : person ? (
              /* Información del Huésped (Solo los 7 campos permitidos) */
              <div className="space-y-6 pt-4">
                {/* Encabezado: Avatar + Nombre (item: name) */}
                <div className="flex items-center gap-4">
                  <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-lg shadow-sm border border-primary/20">
                    {getInitials(person.name)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      Huésped registrado
                    </span>
                    <h3
                      id="modal-huesped-title"
                      className="text-lg sm:text-xl font-bold text-ink truncate"
                    >
                      {person.name}
                    </h3>
                  </div>
                </div>

                {/* Contenido en Grilla: Campos requeridos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* 1. Tipo de Documento (item: document_type) */}
                  <div className="rounded-2xl border border-line bg-canvas/40 p-3.5 space-y-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5 text-primary"
                        aria-hidden="true"
                      >
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <line x1="7" y1="8" x2="17" y2="8" />
                        <line x1="7" y1="12" x2="13" y2="12" />
                      </svg>
                      Tipo de documento
                    </span>
                    <p className="font-bold text-ink">
                      {formatDocumentType(person.document_type)}
                    </p>
                  </div>

                  {/* 2. Número de Documento (item: document_number) */}
                  <div className="rounded-2xl border border-line bg-canvas/40 p-3.5 space-y-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M4 7V4h16v3" />
                        <path d="M9 20h6" />
                        <path d="M12 4v16" />
                      </svg>
                      Número de documento
                    </span>
                    <p className="font-mono font-bold text-ink text-sm">
                      {person.document_number || 'No registrado'}
                    </p>
                  </div>

                  {/* 3. Fecha de Nacimiento (item: date_of_birth) */}
                  <div className="rounded-2xl border border-line bg-canvas/40 p-3.5 space-y-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5 text-primary"
                        aria-hidden="true"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Fecha de nacimiento
                    </span>
                    <p className="font-semibold text-ink capitalize">
                      {formatDateOfBirth(person.date_of_birth)}
                    </p>
                  </div>

                  {/* 4. Género (item: gender) */}
                  <div className="rounded-2xl border border-line bg-canvas/40 p-3.5 space-y-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5 text-primary"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v4" />
                        <path d="M12 18v4" />
                      </svg>
                      Género
                    </span>
                    <p className="font-semibold text-ink">
                      {formatGender(person.gender)}
                    </p>
                  </div>

                  {/* 5. Teléfono (item: phone_number) */}
                  <div className="rounded-2xl border border-line bg-canvas/40 p-3.5 space-y-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Teléfono
                    </span>
                    {person.phone_number ? (
                      <a
                        href={`tel:${person.phone_number}`}
                        className="font-mono font-bold text-primary hover:underline block"
                      >
                        {person.phone_number}
                      </a>
                    ) : (
                      <span className="text-ink-muted italic">No registrado</span>
                    )}
                  </div>

                  {/* 6. Correo Electrónico (item: email) */}
                  <div className="rounded-2xl border border-line bg-canvas/40 p-3.5 space-y-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5 text-blue-600 dark:text-blue-400"
                        aria-hidden="true"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      Correo electrónico
                    </span>
                    {person.email ? (
                      <a
                        href={`mailto:${person.email}`}
                        className="font-medium text-primary hover:underline block truncate"
                        title={person.email}
                      >
                        {person.email}
                      </a>
                    ) : (
                      <span className="text-ink-muted italic">No registrado</span>
                    )}
                  </div>
                </div>

                {/* Botón de cierre */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition cursor-pointer"
                  >
                    Cerrar ficha
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
