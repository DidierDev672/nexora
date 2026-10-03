import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '../../../../shared/ui/Input';
import { RecursosDropdown } from '../../../recursos/ui/molecules/recursos-dropdown';
import { cn } from '../lib/cn';
import { api } from '../../../../lib/api';

export interface DatosBasicosHuesped {
  id?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  email?: string;
  fechaNacimiento: string;
  genero: string;
  nacionalidad: string;
  numeroTelefono: string;
  roleId?: string;
  roles?: string[];
}

export interface AsignarHuespedDatosBasicosModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: DatosBasicosHuesped;
  initialGuests?: DatosBasicosHuesped[];
  onSave: (
    titular: DatosBasicosHuesped,
    allGuests?: DatosBasicosHuesped[]
  ) => Promise<boolean | void> | boolean | void;
  /** Función para registrar individualmente cada huésped con POST /persons tanto en "Guardar y siguiente" como en "Guardar datos básicos" */
  onRegisterGuest?: (
    guest: DatosBasicosHuesped,
    guestIndex: number
  ) => Promise<{ success: boolean; id?: string } | boolean>;
  /** Número o cantidad de huéspedes ingresado por el usuario en el formulario principal */
  numeroHuespedes?: string | number;
  /** Número de habitación para la ficha táctica */
  roomNumber?: string | number;
  /** Mensaje de error psicológico/constructivo si la API falló */
  errorMessage?: { title: string; message: string; solution?: string } | null;
}

const OPCIONES_TIPO_DOCUMENTO = [
  { value: 'Tarjeta de identificacion', label: 'Tarjeta de identificación' },
  { value: 'Identificacion nacional', label: 'Identificación nacional' },
  { value: 'Identificacion extranjera', label: 'Identificación extranjera' },
] as const;

const OPCIONES_GENERO = [
  { value: 'M', label: 'M (Masculino)' },
  { value: 'F', label: 'F (Femenino)' },
] as const;

const INITIAL_STATE: DatosBasicosHuesped = {
  tipoDocumento: '',
  numeroDocumento: '',
  nombreCompleto: '',
  email: '',
  fechaNacimiento: '',
  genero: '',
  nacionalidad: 'Colombia',
  numeroTelefono: '',
  roleId: '',
  roles: [],
};

/**
 * Extrae y normaliza el número de huéspedes ingresado (entre 1 y 10).
 * Maneja entradas dinámicas como 2, 4 o 6 según lo ingresado por el recepcionista.
 */
export function parseGuestCount(val?: string | number): number {
  if (val === undefined || val === null || val === '') return 2;
  if (typeof val === 'number') {
    return Math.max(1, Math.min(10, Math.floor(val)));
  }
  const match = String(val).match(/\d+/);
  if (!match) return 2;
  const parsed = parseInt(match[0], 10);
  if (isNaN(parsed) || parsed <= 0) return 2;
  return Math.max(1, Math.min(10, parsed));
}

interface CornerDefinition {
  index: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  callsign: string;
  role: string;
  range: string;
  cornerLabel: string;
  containerClasses: string;
  restTransform: {
    y: number;
    x: number;
    rotate: number;
    opacity: number;
    scale: number;
  };
  cardAnchorClasses: string;
}

const CORNER_DEFINITIONS: CornerDefinition[] = [
  {
    index: 1,
    position: 'top-left',
    callsign: 'SNIPER TAC-01',
    role: 'TITULAR',
    range: '320M · LOCK',
    cornerLabel: 'ESQ-01 // NOROESTE',
    containerClasses: '-top-6 -left-6',
    restTransform: { y: 14, x: 14, rotate: -4, opacity: 0.5, scale: 0.98 },
    cardAnchorClasses: 'top-6 left-6 origin-top-left',
  },
  {
    index: 2,
    position: 'top-right',
    callsign: 'SNIPER TAC-02',
    role: 'ACOMP. 1',
    range: '450M · LOCK',
    cornerLabel: 'ESQ-02 // NORESTE',
    containerClasses: '-top-6 -right-6',
    restTransform: { y: 14, x: -14, rotate: 4, opacity: 0.5, scale: 0.98 },
    cardAnchorClasses: 'top-6 right-6 origin-top-right',
  },
  {
    index: 3,
    position: 'bottom-left',
    callsign: 'SNIPER TAC-03',
    role: 'ACOMP. 2',
    range: '580M · LOCK',
    cornerLabel: 'ESQ-03 // SUROESTE',
    containerClasses: '-bottom-6 -left-6',
    restTransform: { y: -14, x: 14, rotate: 4, opacity: 0.5, scale: 0.98 },
    cardAnchorClasses: 'bottom-6 left-6 origin-bottom-left',
  },
  {
    index: 4,
    position: 'bottom-right',
    callsign: 'SNIPER TAC-04',
    role: 'ACOMP. 3',
    range: '750M · LOCK',
    cornerLabel: 'ESQ-04 // SURESTE',
    containerClasses: '-bottom-6 -right-6',
    restTransform: { y: -14, x: -14, rotate: -4, opacity: 0.5, scale: 0.98 },
    cardAnchorClasses: 'bottom-6 right-6 origin-bottom-right',
  },
  {
    index: 5,
    position: 'top-left',
    callsign: 'SNIPER TAC-05',
    role: 'ACOMP. 4',
    range: '890M · LOCK',
    cornerLabel: 'ESQ-05 // APILADO NW',
    containerClasses: '-top-12 left-10',
    restTransform: { y: 10, x: 6, rotate: -8, opacity: 0.45, scale: 0.95 },
    cardAnchorClasses: 'top-6 left-6 origin-top-left',
  },
  {
    index: 6,
    position: 'top-right',
    callsign: 'SNIPER TAC-06',
    role: 'ACOMP. 5',
    range: '980M · LOCK',
    cornerLabel: 'ESQ-06 // APILADO NE',
    containerClasses: '-top-12 right-10',
    restTransform: { y: 10, x: -6, rotate: 8, opacity: 0.45, scale: 0.95 },
    cardAnchorClasses: 'top-6 right-6 origin-top-right',
  },
];

export function getCornerDefinition(index: number): CornerDefinition {
  if (index <= CORNER_DEFINITIONS.length) {
    return CORNER_DEFINITIONS[index - 1];
  }
  const isRight = index % 2 === 0;
  return {
    index,
    position: isRight ? 'top-right' : 'top-left',
    callsign: `SNIPER TAC-0${index}`,
    role: `ACOMP. ${index - 1}`,
    range: `${600 + index * 60}M · LOCK`,
    cornerLabel: `ESQ-0${index}`,
    containerClasses: isRight ? '-top-10 -right-8' : '-top-10 -left-8',
    restTransform: {
      y: 12,
      x: isRight ? -10 : 10,
      rotate: isRight ? 6 : -6,
      opacity: 0.4,
      scale: 0.95,
    },
    cardAnchorClasses: isRight
      ? 'top-6 right-6 origin-top-right'
      : 'top-6 left-6 origin-top-left',
  };
}

/**
 * Carta de Sniper semitransparente ubicada en el mazo detrás del modal:
 * - Se aprecian únicamente los contornos y bordes semitransparentes en reposo.
 * - Sincronizada con el mazo táctico para resaltar cuál carta está activa actualmente.
 */
function CornerShadowSniperCard({
  def,
  guestName,
  roomNumber,
  isActive,
  isRegistered,
}: {
  def: CornerDefinition;
  guestName?: string;
  roomNumber?: string | number;
  isActive?: boolean;
  isRegistered?: boolean;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute z-0 size-28 select-none sm:size-32',
        def.containerClasses
      )}
      aria-hidden="true"
    >
      <motion.div
        initial={false}
        animate={def.restTransform}
        transition={{ type: 'spring', stiffness: 340, damping: 22 }}
        className={cn(
          'pointer-events-none absolute h-44 w-32 rounded-2xl transition-all duration-300 select-none sm:h-48 sm:w-36',
          def.cardAnchorClasses,
          'border-[1.5px] backdrop-blur-xs',
          isActive
            ? 'border-amber-400 bg-amber-500/15 opacity-100 ring-2 ring-amber-400/50'
            : isRegistered
              ? 'border-emerald-400/50 bg-emerald-500/5 opacity-70 ring-1 ring-emerald-400/30'
              : 'bg-panel/10 border-amber-400/30 opacity-35 ring-1 ring-white/10 dark:bg-black/15'
        )}
      >
        {/* Marco interior sutil / filete balístico de la carta */}
        <div
          className={cn(
            'pointer-events-none absolute inset-1.5 rounded-xl border border-dashed transition-colors',
            isActive ? 'border-amber-400/60' : 'border-amber-400/20'
          )}
        />

        {/* Notches balísticos en las esquinas interiores de la carta */}
        <div className="absolute top-2 left-2 size-2 border-t-2 border-l-2 border-amber-400/70" />
        <div className="absolute top-2 right-2 size-2 border-t-2 border-r-2 border-amber-400/70" />
        <div className="absolute bottom-2 left-2 size-2 border-b-2 border-l-2 border-amber-400/70" />
        <div className="absolute right-2 bottom-2 size-2 border-r-2 border-b-2 border-amber-400/70" />

        {/* Microcuadrícula táctica semitransparente */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:10px_10px] opacity-10"
        />

        {/* Contenido traslúcido de la carta */}
        <div className="relative flex h-full flex-col justify-between p-3 font-mono text-[9px] text-amber-200/90">
          {/* Header de la carta en el mazo */}
          <div className="flex items-center justify-between border-b border-amber-400/30 pb-1">
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  isActive
                    ? 'animate-ping bg-amber-400'
                    : isRegistered
                      ? 'bg-emerald-400'
                      : 'bg-amber-400/50'
                )}
              />
              <span className="text-[8px] font-bold tracking-wider text-amber-300">
                {def.callsign}
              </span>
            </div>
            <span className="font-mono text-[7px] text-amber-400/80 uppercase">
              DECK 0{def.index}
            </span>
          </div>

          {/* Retícula balística sutil tipo filigrana */}
          <div className="my-auto flex flex-col items-center justify-center py-1">
            <span
              className={cn(
                'mt-1 max-w-[110px] truncate text-[8px] font-bold tracking-widest uppercase transition-colors',
                isActive ? 'font-black text-amber-200' : 'text-amber-300/60'
              )}
            >
              {guestName ? guestName : `Huésped #${def.index}`}
            </span>
          </div>

          {/* Telemetría balística inferior del mazo */}
          <div className="flex items-center justify-between border-t border-amber-400/30 pt-1 text-[7px] text-amber-400/70">
            <span className={cn(isActive && 'font-bold text-amber-300')}>
              {def.role}
            </span>
            <span className="font-bold text-amber-300">
              {roomNumber ? `HAB ${roomNumber}` : def.range}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Sub-modal para "Completar datos básicos del huésped".
 * Se abre dentro del modal de asignación y permite registrar
 * información de identidad y contacto con validación y UX fluida.
 *
 * Características del mazo de sniper:
 * - Cartas semitransparentes en el mazo detrás del modal de acuerdo al número de huéspedes ingresado
 * - Se aprecian únicamente los bordes y contornos semitransparentes en reposo (sin sombras ni elevación en hover)
 */
export function AsignarHuespedDatosBasicosModal({
  isOpen,
  onClose,
  initialData,
  initialGuests,
  onSave,
  onRegisterGuest,
  numeroHuespedes,
  roomNumber,
  errorMessage,
}: AsignarHuespedDatosBasicosModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <DatosBasicosDialogContent
          initialData={initialData}
          initialGuests={initialGuests}
          onClose={onClose}
          onSave={onSave}
          onRegisterGuest={onRegisterGuest}
          numeroHuespedes={numeroHuespedes}
          roomNumber={roomNumber}
          errorMessage={errorMessage}
        />
      )}
    </AnimatePresence>
  );
}

const sniperCardTransitionVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 48 : -48,
    opacity: 0,
    scale: 0.95,
    rotate: dir > 0 ? 2 : -2,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 340,
      damping: 24,
      mass: 0.75,
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
    scale: 0.95,
    rotate: dir > 0 ? -2 : 2,
    transition: {
      duration: 0.16,
      ease: 'easeInOut' as const,
    },
  }),
};

function DatosBasicosDialogContent({
  initialData,
  initialGuests,
  onClose,
  onSave,
  onRegisterGuest,
  numeroHuespedes,
  roomNumber,
  errorMessage,
}: Omit<AsignarHuespedDatosBasicosModalProps, 'isOpen'>) {
  // Cantidad total de huéspedes según el input de asignación (ej. 2, 4 o 6)
  const [guestCount, setGuestCount] = useState<number>(() =>
    parseGuestCount(numeroHuespedes)
  );

  // Índice del huésped actualmente siendo editado (1-indexed: 1..guestCount)
  const [currentGuestIndex, setCurrentGuestIndex] = useState<number>(1);

  // Dirección de transición cinemática para el cambio de carta de sniper (+1 adelante, -1 atrás)
  const [direction, setDirection] = useState<number>(1);

  // Almacén de datos de todos los huéspedes
  const [guestsData, setGuestsData] = useState<DatosBasicosHuesped[]>(() => {
    const count = parseGuestCount(numeroHuespedes);
    return Array.from({ length: count }, (_, idx) => {
      if (initialGuests && initialGuests[idx]) {
        return {
          ...INITIAL_STATE,
          ...initialGuests[idx],
          nacionalidad: initialGuests[idx].nacionalidad || 'Colombia',
        };
      }
      if (idx === 0 && initialData) {
        return {
          ...INITIAL_STATE,
          ...initialData,
          nacionalidad: initialData.nacionalidad || 'Colombia',
        };
      }
      return { ...INITIAL_STATE };
    });
  });

  // Sincronizar dinámicamente si el número de huéspedes cambia externamente
  useEffect(() => {
    const newCount = parseGuestCount(numeroHuespedes);
    setGuestCount(newCount);
    setGuestsData((prev) => {
      if (prev.length === newCount) return prev;
      if (prev.length < newCount) {
        const extra = Array.from({ length: newCount - prev.length }, () => ({
          ...INITIAL_STATE,
        }));
        return [...prev, ...extra];
      }
      return prev.slice(0, newCount);
    });
    setCurrentGuestIndex((curr) => Math.min(curr, newCount));
  }, [numeroHuespedes]);

  // Consultar /roles para asegurar que se utilice el ID real del rol de huésped en el payload
  useEffect(() => {
    let isMounted = true;
    api
      .get<{ id: string; name: string }[]>('/roles', {
        validateStatus: () => true,
      })
      .then((res) => {
        if (!isMounted) return;
        if (res.status === 200 && Array.isArray(res.data)) {
          const huespedRole =
            res.data.find(
              (r) =>
                r.name
                  .trim()
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '') === 'huesped'
            ) ||
            res.data.find((r) =>
              r.name.trim().toLowerCase().includes('huesped')
            );

          if (huespedRole) {
            const realRoleId = huespedRole.id;
            setFormData((prev) => {
              if (
                !prev.roleId ||
                prev.roleId === 'huesped' ||
                prev.roleId === 'role-1'
              ) {
                return {
                  ...prev,
                  roleId: realRoleId,
                  roles: [realRoleId],
                };
              }
              return prev;
            });
            setGuestsData((prev) =>
              prev.map((g) => {
                if (
                  !g.roleId ||
                  g.roleId === 'huesped' ||
                  g.roleId === 'role-1'
                ) {
                  return {
                    ...g,
                    roleId: realRoleId,
                    roles: [realRoleId],
                  };
                }
                return g;
              })
            );
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Datos actuales del formulario
  const [formData, setFormData] = useState<DatosBasicosHuesped>(() => {
    const current = guestsData[currentGuestIndex - 1] ?? initialData;
    if (current) {
      return {
        ...INITIAL_STATE,
        ...current,
        nacionalidad: current.nacionalidad || 'Colombia',
      };
    }
    return { ...INITIAL_STATE };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cierre por tecla Escape con fase de captura
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setGuestsData((prev) => {
      const copy = [...prev];
      copy[currentGuestIndex - 1] = {
        ...(copy[currentGuestIndex - 1] || INITIAL_STATE),
        [name]: value,
      };
      return copy;
    });
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleDropdownChange = (
    field: 'tipoDocumento' | 'genero' | 'roleId',
    val: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
      ...(field === 'roleId' ? { roles: [val] } : {}),
    }));
    setGuestsData((prev) => {
      const copy = [...prev];
      copy[currentGuestIndex - 1] = {
        ...(copy[currentGuestIndex - 1] || INITIAL_STATE),
        [field]: val,
        ...(field === 'roleId' ? { roles: [val] } : {}),
      };
      return copy;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSelectGuest = (targetIndex: number) => {
    if (
      targetIndex === currentGuestIndex ||
      targetIndex < 1 ||
      targetIndex > guestCount
    )
      return;
    const updated = [...guestsData];
    updated[currentGuestIndex - 1] = formData;
    setGuestsData(updated);

    setDirection(targetIndex > currentGuestIndex ? 1 : -1);
    setCurrentGuestIndex(targetIndex);
    setFormData(updated[targetIndex - 1] ?? { ...INITIAL_STATE });
    setErrors({});
  };

  const handleAddGuest = () => {
    if (guestCount >= 8) return;
    const newCount = guestCount + 1;
    setGuestCount(newCount);
    setGuestsData((prev) => [...prev, { ...INITIAL_STATE }]);
  };

  const handleRemoveGuest = () => {
    if (guestCount <= 1) return;
    const newCount = guestCount - 1;
    setGuestCount(newCount);
    setGuestsData((prev) => prev.slice(0, newCount));
    if (currentGuestIndex > newCount) {
      setCurrentGuestIndex(newCount);
      setFormData(guestsData[newCount - 1] ?? { ...INITIAL_STATE });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.tipoDocumento) {
      newErrors.tipoDocumento = 'Elige un tipo de documento';
    }
    if (!formData.numeroDocumento.trim()) {
      newErrors.numeroDocumento = 'El número de documento es obligatorio';
    }
    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es obligatorio';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 1. Invocar registro en segundo plano con POST /persons tanto en "Guardar y siguiente" como en "Guardar datos básicos"
    let currentGuestWithId = { ...formData };
    if (onRegisterGuest) {
      const regResult = await onRegisterGuest(formData, currentGuestIndex);
      const isSuccess =
        typeof regResult === 'boolean' ? regResult : regResult.success;
      if (!isSuccess) {
        // En caso de status 400, 422, 409, 500: se detiene el flujo y se muestra el mensaje psicológico
        return;
      }
      if (typeof regResult === 'object' && regResult.id) {
        currentGuestWithId.id = regResult.id;
        setFormData((prev) => ({ ...prev, id: regResult.id }));
      }
    }

    const updated = [...guestsData];
    updated[currentGuestIndex - 1] = currentGuestWithId;
    setGuestsData(updated);

    // Si aún faltan huéspedes por registrar en el mazo ("Guardar y siguiente"):
    if (currentGuestIndex < guestCount) {
      // Activar transición de cambio de carta de sniper hacia el siguiente huésped!
      setDirection(1);
      const nextIndex = currentGuestIndex + 1;
      setCurrentGuestIndex(nextIndex);
      setFormData(updated[nextIndex - 1] ?? { ...INITIAL_STATE });
      setErrors({});
    } else {
      // Último huésped completado ("Guardar datos básicos"):
      const result = await Promise.resolve(onSave(updated[0], updated));
      if (result !== false) {
        onClose();
      }
    }
  };

  // Filtrar las esquinas activas de acuerdo al número de huéspedes ingresado (hasta guestCount)
  const activeCorners = Array.from(
    { length: Math.min(6, guestCount) },
    (_, idx) => getCornerDefinition(idx + 1)
  );

  const isCurrentTitular = currentGuestIndex === 1;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-70 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      {/* Backdrop con desenfoque de cristal oscuro */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-md cursor-pointer"
        aria-hidden="true"
      />

      {/* CONTENEDOR RELATIVO (Alberga las cartas semitransparentes del mazo DETRÁS y el modal AL FRENTE) */}
      <div className="relative isolate my-auto w-full max-w-lg">
        {/* ========================================================= */}
        {/* 1. CARTAS SEMITRANSPARENTES EN EL MAZO DETRÁS DEL MODAL   */}
        {/* ========================================================= */}
        {activeCorners.map((def) => {
          const guest = guestsData[def.index - 1];
          const isRegistered = Boolean(
            guest?.nombreCompleto && guest?.numeroDocumento
          );
          const isActive = currentGuestIndex === def.index;
          return (
            <CornerShadowSniperCard
              key={def.index}
              def={def}
              guestName={
                guest?.nombreCompleto ||
                (def.index === 1 ? formData.nombreCompleto : undefined)
              }
              roomNumber={roomNumber}
              isActive={isActive}
              isRegistered={isRegistered}
            />
          );
        })}

        {/* ========================================================= */}
        {/* 2. CUERPO PRINCIPAL DEL MODAL (z-10, AL FRENTE DEL MAZO)  */}
        {/* ========================================================= */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-datos-basicos-title"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="border-line/70 bg-panel/95 relative z-10 w-full rounded-3xl border p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl sm:p-7"
        >
          {/* Capa de fondo con overflow-hidden para los brillos y glows decorativos */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
          >
            <div className="bg-secondary/15 absolute -top-24 left-1/2 size-60 -translate-x-1/2 rounded-full blur-3xl" />
          </div>

          {/* Botón de cierre (X) con z-40 y pointer-events-none */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="border-line bg-canvas/80 text-ink-muted hover:bg-panel hover:text-ink focus-visible:ring-primary/40 absolute top-4 right-4 z-40 grid size-8.5 cursor-pointer place-items-center rounded-full border transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 shadow-2xs"
            title="Cerrar modal de datos básicos (Esc)"
            aria-label="Cerrar datos básicos"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4 pointer-events-none"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Cabecera */}
          <div className="relative z-10 mb-5 space-y-2 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-3"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Identificación de Huésped
              </span>

              {/* Selector e indicador táctico del mazo de cartas según número de huéspedes */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-300">
                <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
                <span>
                  {guestCount} {guestCount === 1 ? 'huésped' : 'huéspedes'}
                </span>
                <span className="text-amber-500/40">·</span>
                <span className="font-mono text-[10px] text-amber-600/90 uppercase dark:text-amber-300/90">
                  Ficha {currentGuestIndex}/{guestCount}
                </span>

                {/* Píldora de navegación dinámica de huéspedes: botones según guestCount (2, 4, 6, etc.) */}
                <div className="ml-1 flex items-center gap-1 border-l border-amber-400/30 pl-1.5">
                  {Array.from({ length: guestCount }, (_, i) => i + 1).map(
                    (num) => {
                      const isSaved = Boolean(
                        guestsData[num - 1]?.nombreCompleto &&
                        guestsData[num - 1]?.numeroDocumento
                      );
                      const isActive = currentGuestIndex === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleSelectGuest(num)}
                          className={cn(
                            'relative flex size-5 cursor-pointer items-center justify-center rounded text-[10px] font-bold transition-all',
                            isActive
                              ? 'bg-amber-500 font-black text-stone-950 shadow-xs ring-1 ring-amber-300'
                              : isSaved
                                ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 dark:text-emerald-400'
                                : 'text-amber-600 hover:bg-amber-500/20 dark:text-amber-300'
                          )}
                          title={`Huésped #${num} (${num === 1 ? 'Titular' : `Acompañante ${num - 1}`})${isSaved ? ' · Completado' : ''}`}
                        >
                          {num}
                          {isSaved && !isActive && (
                            <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    }
                  )}

                  {/* Controles rápidos para añadir o quitar si el recepcionista necesita cambiar el número */}
                  <div className="ml-1 flex items-center gap-0.5 border-l border-amber-400/20 pl-1">
                    <button
                      type="button"
                      onClick={handleAddGuest}
                      className="flex size-4 cursor-pointer items-center justify-center rounded text-[11px] font-bold text-amber-400 hover:bg-amber-500/30"
                      title="Agregar otro huésped a registrar"
                    >
                      +
                    </button>
                    {guestCount > 1 && (
                      <button
                        type="button"
                        onClick={handleRemoveGuest}
                        className="flex size-4 cursor-pointer items-center justify-center rounded text-[11px] font-bold text-amber-400/60 hover:bg-amber-500/20 hover:text-amber-300"
                        title="Reducir último huésped"
                      >
                        -
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <h3
              id="modal-datos-basicos-title"
              className="text-ink text-xl font-black tracking-tight sm:text-2xl"
            >
              {isCurrentTitular
                ? 'Completar Datos Básicos · Titular'
                : `Datos Básicos · Acompañante ${currentGuestIndex - 1}`}
            </h3>
            <p className="text-ink-muted text-xs leading-relaxed">
              {isCurrentTitular
                ? 'Ingresa los datos del titular de la habitación.'
                : `Registra los datos del acompañante ${currentGuestIndex - 1} de ${guestCount - 1} para esta estancia.`}
            </p>

            {/* Banner de error psicológico / constructivo si el servidor retornó 4xx o 5xx */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-ink"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    !
                  </span>
                  <div className="space-y-1">
                    <p className="font-bold text-amber-700 dark:text-amber-300">
                      {errorMessage.title}
                    </p>
                    <p className="text-ink-muted leading-relaxed">
                      {errorMessage.message}
                    </p>
                    {errorMessage.solution && (
                      <p className="font-medium text-amber-700/90 dark:text-amber-300/90">
                        {errorMessage.solution}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Formulario con Transición Cinemática de Carta de Sniper */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentGuestIndex}
                custom={direction}
                variants={sniperCardTransitionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {/* Tipo de documento */}
                  <div className="sm:col-span-1">
                    <RecursosDropdown
                      label="Tipo de documento"
                      value={formData.tipoDocumento}
                      onChange={(val) =>
                        handleDropdownChange('tipoDocumento', val)
                      }
                      options={OPCIONES_TIPO_DOCUMENTO}
                      placeholder="Elegir tipo…"
                      error={errors.tipoDocumento}
                      required
                    />
                  </div>

                  {/* Número de documento */}
                  <div className="sm:col-span-1">
                    <Input
                      label="Número de documento"
                      name="numeroDocumento"
                      value={formData.numeroDocumento}
                      onChange={handleInputChange}
                      placeholder="Ej. 1098765432"
                      error={errors.numeroDocumento}
                      required
                    />
                  </div>

                  {/* Nombre completo */}
                  <div className="sm:col-span-2">
                    <Input
                      label="Nombre completo"
                      name="nombreCompleto"
                      value={formData.nombreCompleto}
                      onChange={handleInputChange}
                      placeholder="Ej. Andrea Gómez Restrepo"
                      error={errors.nombreCompleto}
                      required
                    />
                  </div>

                  {/* Fecha de nacimiento */}
                  <div className="sm:col-span-1">
                    <Input
                      label="Fecha de nacimiento"
                      type="date"
                      name="fechaNacimiento"
                      value={formData.fechaNacimiento}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Género */}
                  <div className="sm:col-span-1">
                    <RecursosDropdown
                      label="Género"
                      value={formData.genero}
                      onChange={(val) => handleDropdownChange('genero', val)}
                      options={OPCIONES_GENERO}
                      placeholder="Elegir género…"
                    />
                  </div>

                  {/* Nacionalidad */}
                  <div className="sm:col-span-1">
                    <Input
                      label="Nacionalidad"
                      name="nacionalidad"
                      value={formData.nacionalidad}
                      onChange={handleInputChange}
                      placeholder="Ej. Colombia"
                    />
                  </div>

                  {/* Número de teléfono */}
                  <div className="sm:col-span-1">
                    <Input
                      label="Número de teléfono"
                      type="tel"
                      name="numeroTelefono"
                      value={formData.numeroTelefono}
                      onChange={handleInputChange}
                      placeholder="Ej. +57 300 123 4567"
                    />
                  </div>

                  {/* Correo electrónico */}
                  <div className="sm:col-span-1">
                    <Input
                      label="Correo electrónico"
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      placeholder="Ej. juan@example.com"
                    />
                  </div>

                  {/* Rol del huésped (RecursosDropdown con endpoint="/roles") */}
                  <div className="sm:col-span-1">
                    <RecursosDropdown
                      label="Rol del huésped"
                      endpoint="/roles"
                      value={formData.roleId || formData.roles?.[0] || ''}
                      onChange={(val) => handleDropdownChange('roleId', val)}
                      placeholder="Elegir rol…"
                      isDisabled
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Botones de acción */}
            <div className="border-line/60 flex flex-col-reverse items-center justify-between gap-2.5 border-t pt-4 sm:flex-row">
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="border-line bg-canvas/80 text-ink-muted hover:border-primary/40 hover:bg-panel hover:text-ink inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-all active:scale-95 sm:w-auto"
                >
                  Volver
                </button>
                {currentGuestIndex > 1 && (
                  <button
                    type="button"
                    onClick={() => handleSelectGuest(currentGuestIndex - 1)}
                    className="border-line bg-canvas/80 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold text-amber-600 transition-all hover:border-amber-400/40 hover:bg-amber-500/10 active:scale-95 sm:w-auto dark:text-amber-300"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="size-3.5"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <span>Anterior</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="border-primary/50 bg-primary text-primary-foreground inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-2 text-xs font-bold shadow-sm transition-all hover:brightness-110 active:scale-95 sm:w-auto"
              >
                {currentGuestIndex < guestCount ? (
                  <>
                    <span>
                      Guardar y siguiente ({currentGuestIndex + 1}/{guestCount})
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="size-3.5"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="size-3.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>
                      Guardar datos básicos ({guestCount}{' '}
                      {guestCount === 1 ? 'huésped' : 'huéspedes'})
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>,
    document.body
  );
}
