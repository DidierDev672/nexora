import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, type Variants } from 'motion/react'
import type { GuestDisplayInfo } from '../../domain/habitacion-stay'

/**
 * Variantes de orquestación para Stagger Reveal (revelado escalonado)
 * definidos según prompt-stagger-reveal-framer-motion.md
 */
const FICHA_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
}

const FICHA_CARD_VARIANTS: Variants = {
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

export interface FichaHuespedModalProps {
  isOpen: boolean
  onClose: () => void
  guests: GuestDisplayInfo[]
  roomNumber?: string
  initialActiveIdx?: number
}

/**
 * Modal Inspector centrado en la pantalla para consultar la ficha oficial del huésped.
 * 
 * Se renderiza mediante `createPortal` en `document.body` para garantizar que aparezca
 * perfectamente en el centro absoluto del viewport, independientemente de transformaciones
 * CSS 3D, escalados o posicionamientos relativos de los elementos decorativos de la habitación.
 */
export function FichaHuespedModal({
  isOpen,
  onClose,
  guests = [],
  roomNumber,
  initialActiveIdx = 0,
}: FichaHuespedModalProps) {
  const [activeIdx, setActiveIdx] = useState(initialActiveIdx)

  useEffect(() => {
    if (isOpen) {
      setActiveIdx(initialActiveIdx)
    }
  }, [isOpen, initialActiveIdx])

  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (typeof document === 'undefined') return null

  const currentGuest = guests.length > 0 ? guests[activeIdx] || guests[0] : null

  return createPortal(
    <AnimatePresence>
      {isOpen && currentGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop con desenfoque de cristal sobre toda la pantalla */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Diálogo Centrado en la Pantalla */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ficha-huesped-title"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative z-10 my-auto w-full max-w-lg rounded-3xl border border-line bg-panel p-6 sm:p-7 shadow-2xl space-y-5"
          >
            {/* Header del Modal */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Estancia Activa {roomNumber ? `· Habitación ${roomNumber}` : ''}
                  </span>
                </div>
                <h3 id="ficha-huesped-title" className="font-bold text-ink text-lg sm:text-xl">
                  Ficha Oficial del Huésped
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-8 grid place-items-center rounded-full border border-line bg-canvas text-ink-muted transition-colors hover:bg-panel hover:text-ink cursor-pointer"
                title="Cerrar ficha"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Pestañas de Huéspedes si hay múltiples con Stagger Reveal */}
            {guests.length > 1 && (
              <motion.div
                variants={FICHA_CONTAINER_VARIANTS}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-1.5 border-b border-line/60 pb-3 overflow-x-auto"
              >
                <span className="text-[11px] font-semibold text-ink-muted whitespace-nowrap mr-1">
                  Huéspedes ({guests.length}):
                </span>
                {guests.map((g, idx) => {
                  const firstName = g.name.trim().split(' ')[0] || `Huésped ${idx + 1}`
                  const isActive = activeIdx === idx
                  return (
                    <motion.button
                      key={g.id || idx}
                      variants={FICHA_CARD_VARIANTS}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-canvas text-ink-muted hover:bg-panel-muted hover:text-ink'
                      }`}
                    >
                      {idx + 1}. {firstName}
                    </motion.button>
                  )
                })}
              </motion.div>
            )}

            {/* Tarjeta de Información Principal con Stagger Reveal */}
            <motion.div
              key={currentGuest.id || activeIdx}
              variants={FICHA_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              className="space-y-4 rounded-2xl border border-line/70 bg-canvas/60 p-4 sm:p-5 text-xs"
            >
              {/* Identidad y Nombre */}
              <motion.div variants={FICHA_CARD_VARIANTS} className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-base shrink-0">
                  {currentGuest.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-muted">
                    Nombre Completo
                  </span>
                  <p className="text-base font-bold text-ink truncate" title={currentGuest.name}>
                    {currentGuest.name}
                  </p>
                </div>
              </motion.div>

              {/* Documento de Identidad y Género (Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-line/60 pt-3">
                <motion.div variants={FICHA_CARD_VARIANTS} className="rounded-xl border border-line/50 bg-panel/70 p-3 space-y-0.5">
                  <span className="text-[10px] uppercase text-ink-muted font-bold block">
                    Tipo de documento
                  </span>
                  <p className="font-semibold text-ink">{currentGuest.documentTypeSpanish}</p>
                </motion.div>
                <motion.div variants={FICHA_CARD_VARIANTS} className="rounded-xl border border-line/50 bg-panel/70 p-3 space-y-0.5">
                  <span className="text-[10px] uppercase text-ink-muted font-bold block">
                    Número de documento
                  </span>
                  <p className="font-mono font-bold text-ink text-sm">{currentGuest.documentNumber}</p>
                </motion.div>
              </div>

              {/* Género y Teléfono (Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-line/60 pt-3">
                <motion.div variants={FICHA_CARD_VARIANTS} className="rounded-xl border border-line/50 bg-panel/70 p-3 space-y-0.5">
                  <span className="text-[10px] uppercase text-ink-muted font-bold block">
                    Género registrado
                  </span>
                  <p className="font-medium text-ink">{currentGuest.genderSpanish}</p>
                </motion.div>
                <motion.div variants={FICHA_CARD_VARIANTS} className="rounded-xl border border-line/50 bg-panel/70 p-3 space-y-0.5">
                  <span className="text-[10px] uppercase text-ink-muted font-bold block">
                    Teléfono de contacto
                  </span>
                  <p className="font-mono font-bold text-ink">
                    {currentGuest.phoneNumber || 'No especificado'}
                  </p>
                </motion.div>
              </div>

              {/* Correo Electrónico (Card) */}
              <motion.div variants={FICHA_CARD_VARIANTS} className="border-t border-line/60 pt-3">
                <span className="text-[10px] uppercase text-ink-muted font-bold block">
                  Correo Electrónico
                </span>
                <p className="font-medium text-ink truncate mt-0.5" title={currentGuest.email}>
                  {currentGuest.email || 'No registrado'}
                </p>
              </motion.div>

              {/* Nacionalidad o Fecha de Nacimiento si existen (Cards) */}
              {(currentGuest.nationality || currentGuest.dateOfBirth) && (
                <div className="grid grid-cols-2 gap-3 border-t border-line/60 pt-3">
                  {currentGuest.nationality && (
                    <motion.div variants={FICHA_CARD_VARIANTS}>
                      <span className="text-[10px] uppercase text-ink-muted font-bold block">
                        Nacionalidad
                      </span>
                      <p className="font-medium text-ink">{currentGuest.nationality}</p>
                    </motion.div>
                  )}
                  {currentGuest.dateOfBirth && (
                    <motion.div variants={FICHA_CARD_VARIANTS}>
                      <span className="text-[10px] uppercase text-ink-muted font-bold block">
                        Fecha de Nacimiento
                      </span>
                      <p className="font-mono text-ink">{currentGuest.dateOfBirth}</p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Footer de Acciones */}
            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-[10px] text-ink-muted">
                {guests.length > 1 ? `Huésped ${activeIdx + 1} de ${guests.length}` : 'Registro validado'}
              </span>

              <div className="flex items-center gap-2">
                {guests.length > 1 && (
                  <div className="flex items-center gap-1 mr-2">
                    <button
                      type="button"
                      onClick={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : guests.length - 1))}
                      className="size-7 grid place-items-center rounded-lg border border-line bg-canvas text-xs font-bold text-ink hover:bg-panel cursor-pointer"
                      title="Huésped anterior"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveIdx((prev) => (prev < guests.length - 1 ? prev + 1 : 0))}
                      className="size-7 grid place-items-center rounded-lg border border-line bg-canvas text-xs font-bold text-ink hover:bg-panel cursor-pointer"
                      title="Huésped siguiente"
                    >
                      ›
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-bold text-ink hover:bg-panel cursor-pointer transition-colors"
                >
                  Cerrar Ficha
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
