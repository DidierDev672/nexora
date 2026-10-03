import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import {
  formatBedCapacity,
  type BedTypeInfo,
} from '../../domain/tarifa-cama'

export interface TarifaBedModalProps {
  isOpen: boolean
  onClose: () => void
  bedId: string | null
  bedData: BedTypeInfo | null
  isGeneral: boolean
  loading: boolean
  errorMessage: string | null
  onRetry: () => void
}

export function TarifaBedModal({
  isOpen,
  onClose,
  bedId,
  bedData,
  isGeneral,
  loading,
  errorMessage,
  onRetry,
}: TarifaBedModalProps) {
  const [copiedId, setCopiedId] = useState(false)

  // Efecto de profundidad 3D iOS: Escalar contenedor raíz (#root)
  useEffect(() => {
    if (!isOpen) return

    const root = document.getElementById('root')
    const originalRootTransform = root?.style.transform || ''
    const originalRootRadius = root?.style.borderRadius || ''
    const originalRootOrigin = root?.style.transformOrigin || ''
    const originalRootOverflow = root?.style.overflow || ''
    const originalRootTransition = root?.style.transition || ''
    const originalBodyBg = document.body.style.backgroundColor || ''
    const originalBodyOverflow = document.body.style.overflow || ''

    // Fondo negro detrás de la app para el efecto de apilamiento iOS
    document.body.style.backgroundColor = '#000000'
    document.body.style.overflow = 'hidden'

    if (root) {
      root.style.transformOrigin = 'bottom center'
      root.style.transition =
        'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
      root.style.transform = 'scale(0.93)'
      root.style.borderRadius = '24px'
      root.style.overflow = 'hidden'
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.backgroundColor = originalBodyBg
      document.body.style.overflow = originalBodyOverflow
      if (root) {
        root.style.transform = originalRootTransform
        root.style.borderRadius = originalRootRadius
        root.style.transformOrigin = originalRootOrigin
        root.style.overflow = originalRootOverflow
        root.style.transition = originalRootTransition
      }
    }
  }, [isOpen, onClose])

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } catch {
      // Fallback silencioso
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bed-modal-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Backdrop desenfocado */}
          <motion.div
            key="backdrop-bed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Contenedor del Modal: Tarjeta apilada estilo iOS */}
          <motion.div
            key="modal-bed-content"
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
            className="relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-[32px] sm:rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-7 dark:border-stone-800 dark:bg-stone-900"
          >
            {/* Indicador de arrastre superior estilo iOS (Pill handle) */}
            <div
              className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700"
              aria-hidden="true"
            />
          {/* Encabezado */}
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4 dark:border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary inline-flex size-8 items-center justify-center rounded-xl text-base">
                  🛏️
                </span>
                <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                  Especificación de Habitación
                </span>
              </div>
              <h3
                id="bed-modal-title"
                className="text-ink mt-1.5 text-xl font-extrabold tracking-tight dark:text-white"
              >
                {isGeneral
                  ? 'Configuración Universal'
                  : bedData?.name || `Tipo de Cama: ${bedId || 'Consultando...'}`}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="hover:text-ink rounded-xl p-2 text-stone-700 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="space-y-4 py-8">
              <div className="flex items-center gap-3">
                <div className="size-12 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
                  <div className="h-3 w-1/3 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
                </div>
              </div>
              <div className="h-20 w-full animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
              <div className="h-16 w-full animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
            </div>
          )}

          {/* Caso: Tarifa General / Sin asignación específica */}
          {!loading && isGeneral && (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-5 text-center dark:border-stone-800 dark:bg-stone-800/40">
                <span className="text-3xl" aria-hidden="true">
                  ✨
                </span>
                <h4 className="text-ink mt-2 text-base font-bold dark:text-white">
                  Aplica a Todos los Tipos de Cama
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                  Esta tarifa tiene un alcance <strong>general</strong>. No está restringida a un tipo de cama específico y puede aplicarse de manera uniforme a camas matrimoniales, dobles, individuales o suites según la disponibilidad del establecimiento.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-primary hover:bg-primary-hover rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-95"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}

          {/* Caso con error (status code distinto a 200 o fallo de conexión) */}
          {!loading && !isGeneral && errorMessage && (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">
                    ⚠️
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Información técnica no disponible
                    </h4>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={onRetry}
                  className="bg-primary hover:bg-primary-hover rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-95"
                >
                  Reintentar consulta
                </button>
              </div>
            </div>
          )}

          {/* Caso de éxito (Status Code 200 sin mensajes de error) */}
          {!loading && !isGeneral && !errorMessage && bedData && (
            <div className="mt-5 space-y-4">
              {/* 1. Nombre y Capacidad Destacada */}
              <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/90 bg-gradient-to-br from-stone-50/80 via-white to-stone-50/80 p-5 shadow-2xs dark:border-stone-800 dark:from-stone-900/60 dark:via-stone-900/90 dark:to-stone-900/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Denominación del Tipo de Cama
                  </span>
                  <h4 className="text-ink mt-0.5 text-xl font-black dark:text-white">
                    {bedData.name}
                  </h4>
                </div>

                {/* Badge de Capacidad de Personas (capacity_people) */}
                <div className="inline-flex items-center gap-2 rounded-2xl bg-indigo-50 px-3.5 py-2 ring-1 ring-indigo-500/20 dark:bg-indigo-950/40 dark:ring-indigo-400/30">
                  <span className="text-lg" aria-hidden="true">
                    👥
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-indigo-700/80 dark:text-indigo-300/80">
                      Capacidad
                    </span>
                    <span className="text-xs font-extrabold text-indigo-800 dark:text-indigo-200">
                      {formatBedCapacity(bedData.capacity_people)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Visualizador Gráfico de Huéspedes Soportados */}
              <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-800/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Aforo por Habitación
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {Array.from({ length: Math.max(1, bedData.capacity_people) }).map((_, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 shadow-2xs dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                    >
                      <span>👤</span>
                      <span>Huésped {i + 1}</span>
                    </span>
                  ))}
                  <span className="text-xs text-stone-700 dark:text-stone-300">
                    (Máximo {bedData.capacity_people}{' '}
                    {bedData.capacity_people === 1 ? 'persona' : 'personas'} por estancia)
                  </span>
                </div>
              </div>

              {/* 3. Descripción Detallada (description) */}
              <div className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-800/30">
                <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                  <span className="text-xs">📝</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Descripción y Especificaciones de Confort
                  </span>
                </div>
                <p className="text-ink mt-2 text-xs leading-relaxed dark:text-stone-200">
                  {bedData.description}
                </p>
              </div>

              {/* 4. Metadatos Técnicos de Identificación */}
              <div className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white p-3 text-[11px] sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:bg-stone-900/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-stone-700 dark:text-stone-300 shrink-0 font-medium">
                    ID Técnico:
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-700 dark:text-stone-300 truncate" title={bedData.id}>
                    {bedData.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyId(bedData.id)}
                  className="hover:border-primary/50 hover:text-primary inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1 font-semibold text-stone-600 transition hover:bg-stone-50 active:scale-95 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <span>{copiedId ? '✓ Copiado' : '📋 Copiar ID'}</span>
                </button>
              </div>

              {/* Botón de cierre */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-primary hover:bg-primary-hover rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-95"
                >
                  Cerrar especificación
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  )
}
