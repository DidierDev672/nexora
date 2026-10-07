import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCatalogRole } from '../../application/use-catalog'

export interface RoleDetailModalProps {
  roleId: string | null
  isOpen?: boolean
  onClose: () => void
}

/**
 * Modal interactivo para visualizar la información de un Rol de Usuario.
 * 
 * Reglas de diseño y experiencia de usuario:
 * - Muestra SOLAMENTE los campos "name" (nombre del rol) y "description" (descripción).
 * - Regla de oro: Cero identificadores técnicos (IDs) en la interfaz de usuario.
 * - Efecto ModalPresentationStyle estilo iOS (Backdrop desenfocado, escala 3D de fondo y físicas Spring).
 */
export function RoleDetailModal({ roleId, isOpen, onClose }: RoleDetailModalProps) {
  const isModalOpen = isOpen !== undefined ? isOpen : Boolean(roleId)
  const { data: role, loading } = useCatalogRole(roleId)

  // Efecto iOS ModalPresentationStyle: escala la pantalla de fondo (#root con scale(0.93), rounded-[24px], origin-bottom)
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

  // Escuchar tecla Escape para cerrar
  useEffect(() => {
    if (!isModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, onClose])

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-rol-title"
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Backdrop con desenfoque suave (Backdrop estilo iOS) */}
          <motion.div
            key="backdrop-role-detail"
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
            key="modal-role-detail-content"
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
            className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-[32px] sm:rounded-3xl border border-line bg-panel shadow-2xl overflow-hidden"
          >
            {/* Tirador táctil / Handle iOS para móvil */}
            <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-line/80 sm:hidden" />

            {/* Cabecera del Modal */}
            <div className="flex items-start justify-between border-b border-line/60 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Perfil y responsabilidades
                  </span>
                  <h2 id="modal-rol-title" className="text-xl sm:text-2xl font-black text-ink">
                    Información del Rol
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar ventana de rol"
                className="grid size-8 place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenido principal del modal (únicamente name y description) */}
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <span className="size-8 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
                  <p className="text-xs text-ink-muted">Consultando información del rol…</p>
                </div>
              ) : role ? (
                <>
                  {/* Nombre del rol */}
                  <div className="rounded-2xl border border-line bg-canvas/40 p-4 sm:p-5 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-primary" />
                      Nombre del Rol
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-ink capitalize">
                      {role.name}
                    </p>
                  </div>

                  {/* Descripción del rol */}
                  <div className="rounded-2xl border border-line bg-canvas/40 p-4 sm:p-5 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                      Descripción y funciones asignadas
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed text-ink font-medium">
                      {role.description && role.description.trim()
                        ? role.description
                        : 'Personal con funciones y permisos asignados para la operación hotelera en plataforma.'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-xs text-ink-muted">
                  No se encontró información detallada para este rol.
                </div>
              )}
            </div>

            {/* Pie de acción */}
            <div className="flex items-center justify-end border-t border-line/60 bg-canvas/50 px-6 py-4 sm:px-8">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-line bg-panel px-4 py-2 text-xs font-semibold text-ink hover:bg-line/30 transition cursor-pointer"
              >
                Cerrar detalle
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
