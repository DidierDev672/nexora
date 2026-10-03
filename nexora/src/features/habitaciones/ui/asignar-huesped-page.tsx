import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fadeIn } from '../../../design-tokens/motion';
import type { RoomRow } from '../domain/habitacion-lista';
import { buildHabitacionOcupadaModel } from '../domain/habitacion-ocupada';
import { HabitacionCozyBackground } from './atoms/habitacion-cozy-background';
import { AsignarHuespedModalPresentacion } from './molecules/asignar-huesped-modal-presentacion';
import { AsignarHuespedModalFormulario } from './molecules/asignar-huesped-modal-formulario';
import { HabitacionOcupadaModal } from './molecules/habitacion-ocupada-modal';
import { FichaHuespedModal } from './molecules/ficha-huesped-modal';
import { useHabitacionStay } from '../application/use-habitacion-stay';

export interface AsignarHuespedPageProps {
  room: RoomRow;
  onBack: () => void;
  windowLandscapeSrc?: string;
  archedWindow?: boolean;
}

/**
 * Página para Asignar Huésped a una Habitación seleccionada
 * Cumple con las directrices de agent.md y el diseño de fondo cozy:
 * 1. La advertencia de habitación ocupada se muestra en un modal (`HabitacionOcupadaModal`).
 * 2. Bloquea e impide el modal de asignar huéspedes cuando la habitación ya está ocupada.
 * 3. El cojín en forma de diamante en la cama desaparece automáticamente al haber huéspedes.
 * 4. Modelo (`HabitacionOcupadaModel`) y tabla con estado "OCUPADA" que bloquea la asignación.
 * - Verificación en tiempo real de estancia previa con el hook `useHabitacionStay` (GET /stay/reception/{room_id})
 * - Consulta de información de huéspedes con GET /person/{id} y visualización en el cuadro artístico
 * - Modal de presentación flotante con copywriting psicológico e información contextual
 * - Background moderno de habitación minimalista estilizada (estilo cozy) con TailwindCSS
 * - Barra flotante minimalista de navegación sin header invasivo
 */
export function AsignarHuespedPage({
  room,
  onBack,
  windowLandscapeSrc,
  archedWindow = true,
}: AsignarHuespedPageProps) {
  const [isPresentationOpen, setIsPresentationOpen] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isOccupiedModalOpen, setIsOccupiedModalOpen] = useState(false);
  const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);

  // Soporte de tecla Escape para cerrar los modales activos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFormModalOpen) {
          e.preventDefault();
          e.stopPropagation();
          setIsFormModalOpen(false);
        } else if (isOccupiedModalOpen) {
          e.preventDefault();
          e.stopPropagation();
          setIsOccupiedModalOpen(false);
        } else if (isFichaModalOpen) {
          e.preventDefault();
          e.stopPropagation();
          setIsFichaModalOpen(false);
        } else if (isPresentationOpen) {
          e.preventDefault();
          e.stopPropagation();
          setIsPresentationOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isFormModalOpen, isOccupiedModalOpen, isFichaModalOpen, isPresentationOpen]);

  // Hook para verificar si la habitación ya cuenta con estancia y obtener la ficha de huéspedes
  const {
    stay,
    guests,
    isLoading: isLoadingStay,
    hasActiveStay,
    error: stayError,
    guestValidationMessage,
    refetch: refetchStay,
  } = useHabitacionStay(room.id, room.number);

  // Modelo de dominio para habitación ocupada
  const occupiedModel = hasActiveStay && stay
    ? buildHabitacionOcupadaModel(room, stay, guests)
    : null;

  // Sincronizar modales si se detecta estancia activa según la recomendación de React (sin useEffect)
  const [prevHasActiveStay, setPrevHasActiveStay] = useState(hasActiveStay);
  if (hasActiveStay !== prevHasActiveStay) {
    setPrevHasActiveStay(hasActiveStay);
    if (hasActiveStay) {
      setIsFormModalOpen(false);
      setIsOccupiedModalOpen(true);
    }
  }

  // Función al hacer clic en la cama / diamante
  const handleDiamondClick = () => {
    if (hasActiveStay) {
      // 2. Si la habitación está ocupada, no se abre el formulario; se muestra el modal de advertencia
      setIsOccupiedModalOpen(true);
    } else {
      setIsFormModalOpen(true);
    }
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="border-line/70 bg-canvas/40 relative isolate min-h-[calc(100vh-8rem)] space-y-8 overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur-xs sm:p-10"
    >
      {/* Background estilizado de habitación minimalista (estilo cozy) con cama interactiva y cuadro de huéspedes */}
      <HabitacionCozyBackground
        landscapeSrc={windowLandscapeSrc || '/images/landscape-cozy-window.jpg'}
        archedWindow={archedWindow}
        roomNumber={room.number}
        withJoyceWall={false}
        withCuadro={true}
        guests={guests}
        isLoadingGuests={isLoadingStay}
        hasActiveStay={hasActiveStay}
        onDiamondClick={handleDiamondClick}
        onOpenGuestFolio={() => setIsFichaModalOpen(true)}
        onDoorClick={onBack}
      />

      {/* Barra de navegación flotante minimalista (capa superior interactiva z-10) */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Botón para volver a la lista */}
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 rounded-full border border-line/80 bg-panel/85 px-4 py-2 text-xs font-semibold text-ink-muted shadow-sm backdrop-blur-md transition-all hover:border-primary/40 hover:bg-panel hover:text-ink hover:shadow-md active:scale-95 cursor-pointer"
          title="Volver al catálogo de habitaciones"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Habitaciones</span>
        </button>

        {/* Acciones derechas: Botón de asignación rápida y chip informativo */}
        <div className="flex items-center gap-2.5">
          {/* Si está ocupada, se bloquea la asignación y se muestra el badge de advertencia */}
          {hasActiveStay ? (
            <button
              type="button"
              onClick={() => setIsOccupiedModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-rose-500/50 bg-rose-500/15 px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 shadow-sm backdrop-blur-md transition-all hover:border-rose-500/80 hover:bg-rose-500/25 hover:shadow-md active:scale-95 cursor-pointer"
              title="Habitación ocupada: Clic para ver advertencia y ficha"
            >
              <span className="size-2 rotate-45 rounded-xs bg-rose-600 shadow-xs" />
              <span>Habitación Ocupada (Bloqueada)</span>
            </button>
          ) : (
            /* Botón de acceso directo a la asignación cuando la habitación está libre */
            <button
              type="button"
              onClick={handleDiamondClick}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 shadow-sm backdrop-blur-md transition-all hover:border-amber-400/80 hover:bg-amber-500/20 hover:shadow-md active:scale-95 cursor-pointer"
              title="Abrir formulario de asignación de huésped"
            >
              <span className="size-2 rotate-45 rounded-xs bg-amber-500 animate-pulse motion-reduce:animate-none shadow-xs" />
              <span>Asignar Huésped</span>
            </button>
          )}

          {/* Chip informativo con botón para reabrir el modal de presentación */}
          <button
            type="button"
            onClick={() => setIsPresentationOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-panel/85 px-4 py-2 text-xs font-bold text-ink shadow-sm backdrop-blur-md transition-all hover:border-primary/60 hover:bg-panel hover:shadow-md active:scale-95 cursor-pointer"
            title="Ver detalles y presentación de la habitación"
          >
            <span className="size-2 rounded-full bg-primary motion-reduce:animate-none" />
            <span>Habitación {room.number}</span>
            <span className="text-ink-muted">·</span>
            <span className="font-semibold text-primary">Info</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-3.5 text-primary"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>
        </div>
      </div>

      {/* Aviso de error o intermitencia con enfoque psicológico */}
      {(stayError || guestValidationMessage) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-auto max-w-xl rounded-2xl border border-amber-500/40 bg-panel/90 p-4 shadow-xl backdrop-blur-xl space-y-1 text-xs"
        >
          <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
            <span>⚠️</span>
            <span>{stayError?.title || 'Aviso sobre los Huéspedes'}</span>
          </div>
          <p className="text-ink-muted leading-relaxed">
            {guestValidationMessage || stayError?.message}
          </p>
          {stayError?.solution && (
            <p className="font-medium text-amber-600/90 dark:text-amber-400/90">
              💡 {stayError.solution}
            </p>
          )}
        </motion.div>
      )}

      {/* Modal de presentación flotante con la información contextual del header */}
      <AsignarHuespedModalPresentacion
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        room={room}
        onBack={onBack}
        onStartAssignment={() => {
          if (hasActiveStay) {
            setIsOccupiedModalOpen(true);
          } else {
            setIsFormModalOpen(true);
          }
        }}
      />

      {/* 1. La advertencia debe mostrarse en un modal con la tabla de estado "OCUPADA" */}
      {occupiedModel && (
        <HabitacionOcupadaModal
          isOpen={isOccupiedModalOpen}
          onClose={() => setIsOccupiedModalOpen(false)}
          onBack={onBack}
          model={occupiedModel}
        />
      )}

      {/* 2. No se debe mostrar el modal para asignar huéspedes, ya que la habitación está ocupada */}
      {!hasActiveStay && (
        <AsignarHuespedModalFormulario
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          room={room}
          onSuccess={() => {
            void refetchStay();
          }}
        />
      )}

      {/* 3. Modal Inspector: Ficha Completa del Huésped (centrado en el medio de la pantalla con Portal) */}
      <FichaHuespedModal
        isOpen={isFichaModalOpen}
        onClose={() => setIsFichaModalOpen(false)}
        guests={guests}
        roomNumber={room.number}
      />
    </motion.div>
  );
}
