import { useState } from 'react'
import type { GuestDisplayInfo } from '../../domain/habitacion-stay'
import { FichaHuespedModal } from '../molecules/ficha-huesped-modal'

export interface HabitacionCuadroProps {
  className?: string
  /** Título u obra que representa el cuadro decorativo (accesibilidad) */
  title?: string
  /** Lista de huéspedes vinculados a la estancia activa */
  guests?: GuestDisplayInfo[]
  /** Indicador de carga de estancia o personas */
  isLoading?: boolean
  /** Si la habitación tiene una estancia activa */
  hasActiveStay?: boolean
  /** Callback para abrir el modal centrado con la ficha del huésped */
  onOpenGuestDetail?: () => void
}

/**
 * Componente atómico decorativo que simula un cuadro / lienzo artístico contemporáneo
 * colgado en la pared de la habitación, creado 100% con clases nativas de Tailwind CSS.
 *
 * Características:
 * 1. Sombra Profunda: `shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]` simula la separación tridimensional de la pared.
 * 2. Paspartú de Galería: `bg-stone-50 p-4 sm:p-5` emula el orlado blanco/crema de museo.
 * 3. Textura de Lienzo: `bg-[radial-gradient(...)]` genera el patrón de micro-poros de la tela de lino.
 * 4. Micro-interacción: `hover:scale-[1.02]` simula acercamiento de mirada al cuadro.
 * 5. Ficha de Huéspedes Dinámica: Si la habitación cuenta con estancia activa, muestra la información del huésped:
 *    - name
 *    - document_type (en español)
 *    - document_number
 *    - genre (género en español)
 *    - phone_number
 *    - email
 *    Con selector táctico para alternar entre huéspedes si hay más de uno.
 */
export function HabitacionCuadro({
  className = '',
  title = 'Ficha de Habitación & Huéspedes',
  guests = [],
  isLoading = false,
  hasActiveStay = false,
  onOpenGuestDetail,
}: HabitacionCuadroProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const currentGuest = guests.length > 0 ? guests[activeIdx] || guests[0] : null

  const handleOpenDetail = () => {
    if (guests.length === 0) return
    if (onOpenGuestDetail) {
      onOpenGuestDetail()
    } else {
      setIsDetailModalOpen(true)
    }
  }

  return (
    <>
      <div
        className={`relative select-none pointer-events-auto group ${className}`}
        aria-label={title}
      >
        {/* 1. Clavo de fijación superior en la pared y alambre de tensión */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <div className="size-2 rounded-full bg-amber-600 border border-amber-900 shadow-sm" />
          <div className="w-12 h-4 border-b border-l border-r border-stone-500/50 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
        </div>

        {/* 2. Marco exterior de madera oscura / aluminio con sombra profunda de separación */}
        <div
          onClick={handleOpenDetail}
          className="relative overflow-hidden rounded-lg border-[5px] sm:border-[6px] border-stone-800 dark:border-stone-900 bg-stone-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out hover:scale-[1.02] cursor-pointer"
          title={guests.length > 0 ? 'Clic para ver detalles completos de los huéspedes' : title}
        >
          {/* Bisel sutil de profundidad interior del marco */}
          <div className="p-0.5 bg-linear-to-br from-stone-700/60 to-black/80">
            {/* 3. Paspartú (recuadro blanco crema de galería que enmarca el arte) */}
            <div className="bg-stone-50 dark:bg-stone-100 p-3 sm:p-4 shadow-inner">
              {/* 4. Lienzo de la obra con textura rugosa de micro-puntos */}
              <div
                className="relative aspect-3/4 w-36 sm:w-44 md:w-52 overflow-hidden rounded-xs border border-stone-300/80 bg-[#fdfbf7] shadow-sm flex flex-col justify-between"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
                  backgroundSize: '6px 6px',
                }}
              >
                {/* ESTADO 1: CARGANDO */}
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center space-y-2">
                    <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="font-mono text-[9px] text-stone-600 animate-pulse">
                      Consultando estancia…
                    </p>
                  </div>
                ) : hasActiveStay && currentGuest ? (
                  /* ESTADO 2: FICHA DE HUÉSPED ACTIVO */
                  <div className="relative z-10 flex h-full flex-col justify-between p-2.5 sm:p-3 text-stone-900">
                    {/* Header: Badge de ocupación y selector */}
                    <div className="flex items-center justify-between border-b border-stone-300/80 pb-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[7px] sm:text-[8px] font-bold text-emerald-800 uppercase tracking-wider">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        En Estancia
                      </span>

                      {/* Selector táctico si hay más de 1 huésped */}
                      {guests.length > 1 && (
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setActiveIdx((prev) =>
                                prev > 0 ? prev - 1 : guests.length - 1
                              )
                            }
                            className="size-3.5 grid place-items-center rounded-xs bg-stone-200 text-[8px] font-bold text-stone-700 hover:bg-stone-300 cursor-pointer"
                            title="Huésped anterior"
                          >
                            ‹
                          </button>
                          <span className="font-mono text-[7px] text-stone-600 font-bold">
                            {activeIdx + 1}/{guests.length}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveIdx((prev) =>
                                prev < guests.length - 1 ? prev + 1 : 0
                              )
                            }
                            className="size-3.5 grid place-items-center rounded-xs bg-stone-200 text-[8px] font-bold text-stone-700 hover:bg-stone-300 cursor-pointer"
                            title="Huésped siguiente"
                          >
                            ›
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Información Principal del Huésped */}
                    <div className="my-auto space-y-1 sm:space-y-1.5 text-left">
                      {/* 1. Nombre completo */}
                      <div>
                        <span className="block font-mono text-[7px] uppercase tracking-wider text-stone-500">
                          Huésped
                        </span>
                        <h4
                          className="font-bold text-[10px] sm:text-[11px] leading-tight text-stone-900 line-clamp-1"
                          title={currentGuest.name}
                        >
                          {currentGuest.name}
                        </h4>
                      </div>

                      {/* 2. Tipo y número de documento (Español) */}
                      <div className="grid grid-cols-1 gap-0.5 border-t border-dashed border-stone-300/80 pt-1 text-[8px] sm:text-[9px]">
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="text-stone-500 text-[7px] uppercase">
                            Tipo Doc:
                          </span>
                          <span className="font-semibold text-stone-800 text-[8px] truncate">
                            {currentGuest.documentTypeSpanish}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="text-stone-500 text-[7px] uppercase">
                            Nº Doc:
                          </span>
                          <span className="font-mono font-bold text-stone-900 text-[8px]">
                            {currentGuest.documentNumber}
                          </span>
                        </div>
                      </div>

                      {/* 3. Género (Genre) */}
                      <div className="flex items-baseline justify-between gap-1 text-[8px]">
                        <span className="text-stone-500 text-[7px] uppercase">
                          Género:
                        </span>
                        <span className="font-medium text-stone-800">
                          {currentGuest.genderSpanish}
                        </span>
                      </div>

                      {/* 4. Teléfono y Correo */}
                      <div className="space-y-0.5 border-t border-dashed border-stone-300/80 pt-1 text-[7px] sm:text-[8px] text-stone-700">
                        <div className="flex items-center gap-1 truncate" title={currentGuest.phoneNumber}>
                          <span className="text-stone-500">📞</span>
                          <span className="font-mono">{currentGuest.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate" title={currentGuest.email}>
                          <span className="text-stone-500">✉️</span>
                          <span className="truncate">{currentGuest.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer de la tarjeta con acción rápida */}
                    <div className="border-t border-stone-300/80 pt-1 flex items-center justify-between text-[7px] text-stone-500">
                      <span className="font-mono uppercase tracking-widest text-[6px]">
                        Nexora Folio
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenDetail()
                        }}
                        className="font-semibold text-primary underline underline-offset-1 text-[7px] hover:text-primary/80 cursor-pointer"
                      >
                        Ver ficha completa ↗
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ESTADO 3: HABITACIÓN LIBRE / ARTE ABSTRACTO ORIGINAL */
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                    <div className="size-10 sm:size-12 rounded-full bg-amber-500/90 shadow-xs transition-transform duration-500 group-hover:scale-105" />
                    <div className="-mt-2.5 w-16 sm:w-20 h-8 sm:h-10 rounded-t-full bg-orange-700/85 transition-transform duration-500 group-hover:-translate-y-0.5" />
                    <div className="mt-1.5 w-14 sm:w-16 h-2 rounded-full bg-indigo-900/80 transition-transform duration-500 group-hover:w-18" />
                    <div className="mt-2.5 flex items-center gap-1 opacity-70">
                      <div className="size-1 rounded-full bg-stone-800" />
                      <div className="w-6 h-0.5 bg-stone-700" />
                      <div className="size-1 rounded-full bg-stone-800" />
                    </div>
                  </div>
                )}

                {/* Reflejo especular tenue diagonal sobre el cristal del marco */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-white/15 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />
              </div>

              {/* Plaquita de galería debajo del lienzo */}
              <div className="mt-2 flex justify-center items-center gap-1 opacity-60">
                <div className="h-0.5 w-5 bg-stone-400" />
                <span className="font-serif text-[7px] tracking-widest text-stone-700 uppercase">
                  {hasActiveStay && guests.length > 0
                    ? `Huéspedes (${guests.length})`
                    : 'Habitación Lista · Art No. 04'}
                </span>
                <div className="h-0.5 w-5 bg-stone-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Inspector: Ficha Completa del Huésped al hacer clic en el cuadro (centrado con Portal) */}
      {!onOpenGuestDetail && (
        <FichaHuespedModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          guests={guests}
          initialActiveIdx={activeIdx}
        />
      )}
    </>
  )
}
