import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, type Variants } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faUser,
  faIdCard,
  faEnvelope,
  faPhone,
  faCheck,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { api } from '../../../../lib/api'
import { validateStatusCode } from '../../../../shared/lib/status-code-validator'
import { translateDocumentTypeToSpanish } from '../../domain/habitacion-stay'
import { AnimatedCheckbox } from '../atoms/animated-checkbox'

/**
 * Variantes de orquestación para Stagger Reveal (revelado escalonado) de cards
 * según las especificaciones de prompt-stagger-reveal-framer-motion.md
 */
const GUEST_CARDS_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
}

const GUEST_CARD_ITEM_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 300,
      mass: 0.8,
    },
  },
}

export interface PersonItem {
  id: string
  document_type: string
  document_number: string
  name: string
  phone_number?: string
  email?: string
  date_of_birth?: string
  gender?: string
  nationality?: string
  roles?: string[]
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface BuscarHuespedesModalProps {
  isOpen: boolean
  onClose: () => void
  /** Cantidad máxima de huéspedes permitida según el campo "Cantidad de huéspedes" */
  maxAllowed: number
  /** Lista actual de huéspedes ya seleccionados */
  selectedGuests: PersonItem[]
  /** Callback al confirmar la selección de huéspedes */
  onConfirmSelection: (selected: PersonItem[]) => void
  /** Número de habitación para contexto en la cabecera */
  roomNumber?: string | number
}

/**
 * Modal para buscar y seleccionar huéspedes registrados en el sistema (GET /persons).
 *
 * Características:
 * - Valida el status code de la API utilizando `validateStatusCode`.
 * - Lista en tarjetas interactivas mostrando: name, document_type, document_number y email.
 * - Checkbox en la esquina superior derecha de cada card.
 * - Validación estricta que no permite superar la cantidad máxima de huéspedes establecida.
 * - Mensajes con psicología del usuario en caso de error o intermitencia de red.
 */
export function BuscarHuespedesModal({
  isOpen,
  onClose,
  maxAllowed,
  selectedGuests,
  onConfirmSelection,
  roomNumber,
}: BuscarHuespedesModalProps) {
  const [persons, setPersons] = useState<PersonItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [tempSelected, setTempSelected] = useState<PersonItem[]>(selectedGuests)
  const [limitNotice, setLimitNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<{
    title: string
    message: string
    category: 'warning' | 'error' | 'info'
  } | null>(null)

  // Sincronizar selección inicial cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedGuests)
      setLimitNotice(null)
      setErrorNotice(null)
    }
  }, [isOpen, selectedGuests])

  // Cierre por tecla Escape con fase de captura
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, onClose])

  // Consultar lista de personas: GET /persons al abrir el modal
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const fetchPersons = async () => {
      setIsLoading(true)
      setErrorNotice(null)
      try {
        const response = await api.get<PersonItem[]>('/persons', {
          validateStatus: () => true,
        })

        if (!isMounted) return

        // Validar status code con el validador psicológico
        const validation = validateStatusCode(response.status)

        if (response.status === 200 && response.data) {
          // Status 200 OK: procesar lista (validation.message es null)
          const raw = Array.isArray(response.data)
            ? response.data
            : Array.isArray((response.data as unknown as { data?: PersonItem[] })?.data)
            ? (response.data as unknown as { data: PersonItem[] }).data
            : []

          setPersons(raw)
          setErrorNotice(null)
        } else {
          // Status code diferente a 200: mensaje personalizado con psicología
          setPersons([])
          setErrorNotice({
            title: validation.title || `Aviso (${response.status})`,
            message:
              validation.message ||
              'No fue posible consultar la lista de personas registradas.',
            category: validation.category === 'warning' ? 'warning' : 'error',
          })
        }
      } catch (err: unknown) {
        if (!isMounted) return
        const errMsg = err instanceof Error ? err.message : String(err)
        setErrorNotice({
          title: 'Intermitencia de conexión',
          message: `Tus datos están protegidos. Ocurrió una intermitencia al contactar el servidor: ${errMsg}. Reintenta en unos instantes.`,
          category: 'error',
        })
        setPersons([])
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchPersons()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  // Filtrado reactivo por nombre, documento o email
  const filteredPersons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return persons
    return persons.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.document_number && p.document_number.toLowerCase().includes(term)) ||
        (p.email && p.email.toLowerCase().includes(term))
    )
  }, [persons, searchTerm])

  // Manejar alternancia de selección con validación de cantidad máxima
  const handleTogglePerson = (person: PersonItem) => {
    setLimitNotice(null)
    const isAlreadySelected = tempSelected.some((item) => item.id === person.id)

    if (isAlreadySelected) {
      // Desmarcar
      setTempSelected((prev) => prev.filter((item) => item.id !== person.id))
    } else {
      // Validar límite máximo de selección
      if (tempSelected.length >= maxAllowed) {
        setLimitNotice(
          `Solo puedes seleccionar hasta ${maxAllowed} huésped(es) según la cantidad indicada en la estancia. Para elegir a ${person.name}, desmarca primero a uno de los seleccionados o amplía la cantidad en el formulario.`
        )
        return
      }
      setTempSelected((prev) => [...prev, person])
    }
  }

  const handleConfirm = () => {
    onConfirmSelection(tempSelected)
    onClose()
  }

  const selectedCount = tempSelected.length
  const isLimitReached = selectedCount >= maxAllowed

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop con desenfoque de cristal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Contenedor del Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-buscar-huespedes-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-line/80 bg-panel/95 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 z-10 overflow-hidden"
          >
            {/* Cabecera del Modal */}
            <div className="border-b border-line/60 p-5 sm:p-6 pb-4 space-y-3 shrink-0">
              <div className="flex items-center justify-between gap-3 pr-8">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shadow-xs">
                    <FontAwesomeIcon icon={faUsers} className="size-4" />
                  </span>
                  <div>
                    <h3
                      id="modal-buscar-huespedes-title"
                      className="text-lg sm:text-xl font-black tracking-tight text-ink"
                    >
                      Huéspedes Registrados
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Selecciona a los huéspedes para la Habitación {roomNumber || 'seleccionada'}.
                    </p>
                  </div>
                </div>

                {/* Badge con el cupo y límite */}
                <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
                  <span>Capacidad:</span>
                  <span className="font-black text-ink">
                    {selectedCount} / {maxAllowed}
                  </span>
                </div>
              </div>

              {/* Botón de cierre (X) con z-30 y pointer-events-none */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="absolute top-5 right-5 z-30 grid size-8.5 place-items-center rounded-full border border-line bg-canvas/80 text-ink-muted transition-all hover:bg-panel hover:text-ink hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-2xs"
                title="Cerrar búsqueda (Esc)"
                aria-label="Cerrar modal"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 pointer-events-none">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Barra de Búsqueda con Icono FontAwesome */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-muted">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="size-3.5" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, número de documento o correo electrónico…"
                  className="w-full rounded-xl border border-line bg-canvas/70 py-2.5 pl-10 pr-4 text-xs font-medium text-ink placeholder:text-ink-muted/70 transition-all focus:border-primary focus:bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-ink-muted hover:text-ink cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Aviso si se intenta superar el límite permitido */}
              {limitNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2"
                >
                  <span className="font-bold shrink-0 mt-0.5">⚠️</span>
                  <div className="space-y-0.5">
                    <p className="font-semibold">Límite de selección alcanzado</p>
                    <p className="text-[11px] leading-relaxed text-ink-muted">
                      {limitNotice}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Aviso de error psicológico si la API falló (status code !== 200) */}
              {errorNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/35 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-300 space-y-1"
                >
                  <div className="flex items-center gap-2 font-bold">
                    <span>⚠️</span>
                    <span>{errorNotice.title}</span>
                  </div>
                  <p className="text-ink-muted leading-relaxed">{errorNotice.message}</p>
                </motion.div>
              )}
            </div>

            {/* Contenido: Lista de Cards con Scroll */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <div className="size-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
                  <p className="text-xs font-medium text-ink-muted animate-pulse">
                    Consultando huéspedes registrados…
                  </p>
                </div>
              ) : filteredPersons.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line p-10 text-center space-y-2">
                  <span className="grid size-10 mx-auto place-items-center rounded-full bg-canvas/80 text-ink-muted text-base">
                    🔍
                  </span>
                  <h4 className="font-bold text-sm text-ink">No se encontraron resultados</h4>
                  <p className="text-xs text-ink-muted max-w-sm mx-auto">
                    {searchTerm
                      ? `No hay huéspedes que coincidan con "${searchTerm}". Revisa la ortografía o intenta con otro término.`
                      : 'Aún no hay personas registradas en el catálogo del sistema.'}
                  </p>
                </div>
              ) : (
                <motion.div
                  key={searchTerm || 'all-guests'}
                  variants={GUEST_CARDS_CONTAINER_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                >
                  {filteredPersons.map((person) => {
                    const isSelected = tempSelected.some((item) => item.id === person.id)
                    const isCheckboxDisabled = isLimitReached && !isSelected

                    return (
                      <motion.div
                        key={person.id}
                        variants={GUEST_CARD_ITEM_VARIANTS}
                        onClick={() => handleTogglePerson(person)}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary/80 bg-primary/10 shadow-md ring-1 ring-primary/40'
                            : isCheckboxDisabled
                            ? 'border-line/50 bg-canvas/30 opacity-70 hover:border-line'
                            : 'border-line/70 bg-canvas/50 hover:border-primary/40 hover:bg-panel hover:shadow-xs'
                        }`}
                      >
                        {/* Checkbox animado con efecto Appear / Disappear (AnimatePresence) */}
                        <div className="absolute top-3.5 right-3.5 z-10">
                          <AnimatedCheckbox
                            id={`chk-guest-${person.id}`}
                            checked={isSelected}
                            disabled={isCheckboxDisabled}
                            onChange={() => handleTogglePerson(person)}
                          />
                        </div>

                        {/* Datos del Huésped */}
                        <div className="space-y-2 pr-7">
                          {/* 1. Name */}
                          <div className="flex items-center gap-2">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary text-xs">
                              <FontAwesomeIcon icon={faUser} className="size-2.5" />
                            </span>
                            <h4 className="font-bold text-sm text-ink truncate group-hover:text-primary transition-colors">
                              {person.name || 'Huésped sin nombre'}
                            </h4>
                          </div>

                          {/* 2. Document Type y Document Number */}
                          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                            <FontAwesomeIcon icon={faIdCard} className="size-3 text-ink-muted/80 shrink-0" />
                            <span className="font-medium">
                              {translateDocumentTypeToSpanish(person.document_type)}:
                            </span>
                            <span className="font-mono font-bold text-ink">
                              {person.document_number || 'S/N'}
                            </span>
                          </div>

                          {/* 3. Email */}
                          <div className="flex items-center gap-1.5 text-xs text-ink-muted truncate">
                            <FontAwesomeIcon icon={faEnvelope} className="size-3 text-ink-muted/80 shrink-0" />
                            <span className="truncate">{person.email || 'Sin correo registrado'}</span>
                          </div>

                          {/* 4. Teléfono (opcional) */}
                          {person.phone_number && (
                            <div className="flex items-center gap-1.5 text-[11px] text-ink-muted/80">
                              <FontAwesomeIcon icon={faPhone} className="size-2.5 text-ink-muted/70 shrink-0" />
                              <span className="font-mono">{person.phone_number}</span>
                            </div>
                          )}
                        </div>

                        {/* Pie de la card con estado de selección */}
                        <div className="mt-3 pt-2.5 border-t border-line/40 flex items-center justify-between text-[11px]">
                          <span
                            className={`font-semibold ${
                              isSelected
                                ? 'text-primary'
                                : isCheckboxDisabled
                                ? 'text-ink-muted/60'
                                : 'text-ink-muted group-hover:text-ink'
                            }`}
                          >
                            {isSelected
                              ? '✓ Seleccionado'
                              : isCheckboxDisabled
                              ? 'Límite alcanzado'
                              : 'Clic para seleccionar'}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </div>

            {/* Footer de Acciones del Modal */}
            <div className="border-t border-line/60 bg-canvas/40 px-5 py-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-ink-muted text-center sm:text-left">
                <span>
                  Seleccionados:{' '}
                  <strong className="text-ink font-bold">
                    {selectedCount} de {maxAllowed}
                  </strong>{' '}
                  huésped(es)
                </span>
                {selectedCount > 0 && (
                  <span className="block sm:inline sm:ml-2 text-primary font-medium text-[11px]">
                    ({tempSelected.map((t) => t.name).join(', ')})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-line bg-canvas/80 px-4 py-2.5 text-xs font-semibold text-ink-muted transition-all hover:bg-panel hover:text-ink active:scale-95 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faCheck} className="size-3" />
                  <span>Confirmar Selección ({selectedCount})</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
