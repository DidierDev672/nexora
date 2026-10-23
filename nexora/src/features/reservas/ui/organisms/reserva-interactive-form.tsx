import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { fadeIn, fadeUp } from '../../../../design-tokens/motion';
import { api } from '../../../../lib/api';
import {
  readAuthTokenEmail,
  readTokenEmail,
} from '../../../../shared/auth-storage';
import { validateStatusCode } from '../../../../shared/lib/status-code-validator';
import {
  formatPrecioCOP,
  calculateNights,
  type PersonApiResponse,
} from '../../domain/reserva';
import { NuevoHuespedModal } from '../molecules/nuevo-huesped-modal';
import {
  RecursosDropdown,
  type DropdownOption,
} from '../../../recursos/ui/molecules/recursos-dropdown';
import { Loader } from '../../../tema/ui/atoms/loader';

export interface RoomApiResponseItem {
  id: string;
  number: string;
  floor: number | string;
  room_types_id?: string;
  building_id?: string;
  price_override?: number | null;
  status?: string;
  has_reception?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoomOption {
  id: string;
  number: string;
  floor: number | string;
  price_override?: number | null;
  price: number;
  capacity: number;
  status: string;
}

export interface PersonApiResponseItem {
  id: string;
  document_type?: string;
  document_number?: string;
  name: string;
  phone_number?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  roles?: string[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

const ESTADOS_RESERVA = [
  {
    value: 'pendiente',
    backendValue: 'pending',
    label: 'Pendiente',
    dotColor: 'bg-amber-500',
    badgeClass:
      'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  },
  {
    value: 'confirmada',
    backendValue: 'confirmed',
    label: 'Confirmada',
    dotColor: 'bg-emerald-500',
    badgeClass:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  {
    value: 'en curso',
    backendValue: 'in progress',
    label: 'En curso',
    dotColor: 'bg-blue-500',
    badgeClass:
      'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
  {
    value: 'finalizada',
    backendValue: 'completed',
    label: 'Finalizada',
    dotColor: 'bg-neutral',
    badgeClass: 'bg-neutral/15 text-ink-muted border-line',
  },
  {
    value: 'cancelada',
    backendValue: 'canceled',
    label: 'Cancelada',
    dotColor: 'bg-rose-500',
    badgeClass:
      'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
  },
  {
    value: 'no muestrar',
    backendValue: 'no show',
    label: 'No asistió (No show)',
    dotColor: 'bg-purple-500',
    badgeClass:
      'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  },
] as const;

function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene el correo del recepcionista desde el objeto 'auth_user' de localStorage (propiedad email)
 */
function getCreatedByEmail(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem('auth_user');
      if (raw) {
        const parsed = JSON.parse(raw) as {
          email?: string;
          user?: { email?: string };
        };
        const email = parsed?.email || parsed?.user?.email;
        if (typeof email === 'string' && email.trim().length > 0) {
          return email.trim();
        }
      }
    }
  } catch {
    // Si localStorage no está disponible o el JSON es inválido
  }
  return readTokenEmail() || readAuthTokenEmail() || 'admin@nexora.com';
}

export function ReservaInteractiveForm() {
  // 1. Datos del catálogo
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);

  const [persons, setPersons] = useState<PersonApiResponse[]>([]);
  const [loadingPersons, setLoadingPersons] = useState(true);
  const [personError, setPersonError] = useState<string | null>(null);

  // 2. Estado de los campos del formulario
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [checkInDate, setCheckInDate] = useState(getTodayString());
  const [checkOutDate, setCheckOutDate] = useState(getTomorrowString());
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
  const [stateValue, setStateValue] = useState<string>('pendiente');
  const [customTotalPrice, setCustomTotalPrice] = useState<number | null>(null);

  // 3. UI states y modal
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatusCode, setSubmitStatusCode] = useState<number | null>(null);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    statusCode?: number;
  } | null>(null);
  const [successReservation, setSuccessReservation] = useState<{
    roomNumber: string;
    roomFloor: number | string;
    personName: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    numberOfGuests: number;
    stateLabel: string;
    totalPrice: number;
  } | null>(null);

  // Carga inicial de habitaciones consumiendo GET /room y validando con validateStatusCode
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      // 1. Cargar habitaciones con Axios GET /room y validación de status code
      try {
        const response = await api.get<RoomApiResponseItem[]>('/room', {
          validateStatus: () => true, // Permite evaluar manualmente el status code
        });

        const validation = validateStatusCode(response.status);

        if (isMounted) {
          if (validation.isValid) {
            const data = response.data;
            const rawList: RoomApiResponseItem[] = Array.isArray(data)
              ? data
              : data &&
                  typeof data === 'object' &&
                  Array.isArray((data as { data?: RoomApiResponseItem[] }).data)
                ? (data as { data: RoomApiResponseItem[] }).data
                : [];

            const mappedRooms: RoomOption[] = rawList.map((r) => ({
              id: String(r.id),
              number: String(r.number ?? ''),
              floor: r.floor ?? 1,
              price_override:
                r.price_override != null ? Number(r.price_override) : null,
              price:
                r.price_override != null && Number(r.price_override) > 0
                  ? Number(r.price_override)
                  : 160000,
              capacity: 2,
              status: String(r.status || 'available'),
            }));

            // Ordenamiento natural por número de habitación
            mappedRooms.sort((a, b) =>
              a.number.localeCompare(b.number, undefined, { numeric: true })
            );

            setRooms(mappedRooms);
          } else {
            setRoomError(
              validation.message ||
                'No pudimos consultar las habitaciones en este momento. Por favor verifica tu conexión o reintenta.'
            );
          }
        }
      } catch {
        if (isMounted) {
          const netValidation = validateStatusCode(0);
          setRoomError(
            netValidation.message ||
              'Ocurrió una pausa inesperada en la red al conectar con el inventario de habitaciones.'
          );
        }
      } finally {
        if (isMounted) {
          setLoadingRooms(false);
        }
      }

      // 2. Cargar personas registradas con Axios GET /persons y validación de status code
      try {
        let response = await api.get<PersonApiResponseItem[]>('/persons', {
          validateStatus: () => true,
        });

        // Fallback preventivo si el backend expone /person en singular
        if (response.status === 404) {
          try {
            const fallbackRes = await api.get<PersonApiResponseItem[]>(
              '/person',
              {
                validateStatus: () => true,
              }
            );
            if (validateStatusCode(fallbackRes.status).isValid) {
              response = fallbackRes;
            }
          } catch {
            // Mantener respuesta de /persons
          }
        }

        const validation = validateStatusCode(response.status);

        if (isMounted) {
          if (validation.isValid) {
            const data = response.data;
            const rawList: PersonApiResponseItem[] = Array.isArray(data)
              ? data
              : data &&
                  typeof data === 'object' &&
                  Array.isArray(
                    (data as { data?: PersonApiResponseItem[] }).data
                  )
                ? (data as { data: PersonApiResponseItem[] }).data
                : [];

            const mappedPersons: PersonApiResponse[] = rawList.map((p) => ({
              id: String(p.id),
              document_type: String(p.document_type || 'id_card'),
              document_number: String(p.document_number || ''),
              name: String(p.name || 'Huésped'),
              phone_number: String(p.phone_number || ''),
              email: String(p.email || ''),
            }));

            // Ordenamiento por nombre
            mappedPersons.sort((a, b) => a.name.localeCompare(b.name));

            setPersons(mappedPersons);
          } else {
            setPersonError(
              validation.message ||
                'No pudimos consultar la lista de huéspedes en este momento. Por favor verifica tu conexión o reintenta.'
            );
          }
        }
      } catch {
        if (isMounted) {
          const netValidation = validateStatusCode(0);
          setPersonError(
            netValidation.message ||
              'Ocurrió una pausa inesperada en la red al conectar con el registro de huéspedes.'
          );
        }
      } finally {
        if (isMounted) {
          setLoadingPersons(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Reintento manual de carga de habitaciones
  const handleRetryRooms = async () => {
    setLoadingRooms(true);
    setRoomError(null);

    try {
      const response = await api.get<RoomApiResponseItem[]>('/room', {
        validateStatus: () => true,
      });

      const validation = validateStatusCode(response.status);

      if (validation.isValid) {
        const data = response.data;
        const rawList: RoomApiResponseItem[] = Array.isArray(data)
          ? data
          : data &&
              typeof data === 'object' &&
              Array.isArray((data as { data?: RoomApiResponseItem[] }).data)
            ? (data as { data: RoomApiResponseItem[] }).data
            : [];

        const mappedRooms: RoomOption[] = rawList.map((r) => ({
          id: String(r.id),
          number: String(r.number ?? ''),
          floor: r.floor ?? 1,
          price_override:
            r.price_override != null ? Number(r.price_override) : null,
          price:
            r.price_override != null && Number(r.price_override) > 0
              ? Number(r.price_override)
              : 160000,
          capacity: 2,
          status: String(r.status || 'available'),
        }));

        mappedRooms.sort((a, b) =>
          a.number.localeCompare(b.number, undefined, { numeric: true })
        );
        setRooms(mappedRooms);
      } else {
        setRoomError(
          validation.message || 'No se pudo obtener la lista de habitaciones.'
        );
      }
    } catch {
      const netValidation = validateStatusCode(0);
      setRoomError(
        netValidation.message || 'Error de conexión al cargar habitaciones.'
      );
    } finally {
      setLoadingRooms(false);
    }
  };

  // Reintento manual de carga de personas (/persons) con validateStatusCode
  const handleRetryPersons = async () => {
    setLoadingPersons(true);
    setPersonError(null);

    try {
      let response = await api.get<PersonApiResponseItem[]>('/persons', {
        validateStatus: () => true,
      });

      if (response.status === 404) {
        try {
          const fallbackRes = await api.get<PersonApiResponseItem[]>(
            '/person',
            {
              validateStatus: () => true,
            }
          );
          if (validateStatusCode(fallbackRes.status).isValid) {
            response = fallbackRes;
          }
        } catch {
          // Mantener respuesta original
        }
      }

      const validation = validateStatusCode(response.status);

      if (validation.isValid) {
        const data = response.data;
        const rawList: PersonApiResponseItem[] = Array.isArray(data)
          ? data
          : data &&
              typeof data === 'object' &&
              Array.isArray((data as { data?: PersonApiResponseItem[] }).data)
            ? (data as { data: PersonApiResponseItem[] }).data
            : [];

        const mappedPersons: PersonApiResponse[] = rawList.map((p) => ({
          id: String(p.id),
          document_type: String(p.document_type || 'id_card'),
          document_number: String(p.document_number || ''),
          name: String(p.name || 'Huésped'),
          phone_number: String(p.phone_number || ''),
          email: String(p.email || ''),
        }));

        mappedPersons.sort((a, b) => a.name.localeCompare(b.name));
        setPersons(mappedPersons);
      } else {
        setPersonError(
          validation.message || 'No se pudo obtener la lista de huéspedes.'
        );
      }
    } catch {
      const netValidation = validateStatusCode(0);
      setPersonError(
        netValidation.message || 'Error de conexión al cargar huéspedes.'
      );
    } finally {
      setLoadingPersons(false);
    }
  };

  // Habitación y Persona actualmente seleccionadas
  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId),
    [rooms, selectedRoomId]
  );

  const selectedPerson = useMemo(
    () => persons.find((p) => p.id === selectedPersonId),
    [persons, selectedPersonId]
  );

  const personDropdownOptions = useMemo<DropdownOption[]>(() => {
    return persons.map((person) => {
      const docType = person.document_type?.trim();
      const isNationalId = !docType || docType.toLowerCase() === 'national_id';

      // Elimina la palabra 'national_id' de la experiencia de usuario
      const docLabel = isNationalId
        ? ''
        : docType.toLowerCase() === 'id_card'
          ? 'Tarjeta de identidad'
          : docType.toLowerCase() === 'foreign_id'
            ? 'Tarjeta de extranjería'
            : docType.toLowerCase() === 'passport'
              ? 'Pasaporte'
              : docType.replace(/_/g, ' ');

      const parts = [
        person.name?.trim(),
        docLabel,
        person.document_number?.trim(),
      ].filter(Boolean);

      return {
        value: person.id,
        label: parts.length > 0 ? parts.join(' - ') : person.name,
        id: person.id,
        rawName: person.name,
      };
    });
  }, [persons]);

  // Cálculo dinámico de noches
  const nights = useMemo(
    () => calculateNights(checkInDate, checkOutDate),
    [checkInDate, checkOutDate]
  );

  // Precio sugerido derivado y precio final mostrado
  const suggestedPrice = useMemo(() => {
    const roomPrice = selectedRoom ? selectedRoom.price : 160000;
    return Math.max(nights, 1) * roomPrice;
  }, [nights, selectedRoom]);

  const effectiveTotalPrice =
    customTotalPrice !== null ? customTotalPrice : suggestedPrice;

  // Manejador al seleccionar habitación
  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    if (errors.roomId) setErrors((p) => ({ ...p, roomId: '' }));

    const found = rooms.find((r) => r.id === roomId);
    if (found && numberOfGuests > found.capacity) {
      setNumberOfGuests(found.capacity);
    }
  };

  // Manejador de fechas
  const handleCheckInChange = (newCheckIn: string) => {
    setCheckInDate(newCheckIn);
    if (errors.checkInDate) setErrors((p) => ({ ...p, checkInDate: '' }));

    // Si checkOut es menor o igual, avanzamos un día
    if (checkOutDate && newCheckIn >= checkOutDate) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      const y = nextDay.getFullYear();
      const m = String(nextDay.getMonth() + 1).padStart(2, '0');
      const d = String(nextDay.getDate()).padStart(2, '0');
      setCheckOutDate(`${y}-${m}-${d}`);
    }
  };

  const handleCheckOutChange = (newCheckOut: string) => {
    setCheckOutDate(newCheckOut);
    if (errors.checkOutDate) setErrors((p) => ({ ...p, checkOutDate: '' }));
  };

  // Recepción de nuevo huésped creado desde el modal
  const handleGuestCreated = (newPerson: PersonApiResponse) => {
    setPersons((prev) => [
      newPerson,
      ...prev.filter((p) => p.id !== newPerson.id),
    ]);
    setSelectedPersonId(newPerson.id);
    if (errors.personId) setErrors((p) => ({ ...p, personId: '' }));
  };

  // Validación de formulario
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!selectedRoomId) {
      errs.roomId = 'Por favor selecciona una habitación para la reserva.';
    }

    if (!selectedPersonId) {
      errs.personId =
        'Por favor selecciona el huésped titular o registra uno nuevo.';
    }

    if (!checkInDate) {
      errs.checkInDate = 'La fecha de entrada es obligatoria.';
    }

    if (!checkOutDate) {
      errs.checkOutDate = 'La fecha de salida es obligatoria.';
    } else if (checkInDate && checkOutDate <= checkInDate) {
      errs.checkOutDate =
        'La fecha de salida debe ser posterior a la fecha de entrada.';
    }

    if (!numberOfGuests || numberOfGuests < 1) {
      errs.numberOfGuests = 'El número de huéspedes debe ser al menos 1.';
    } else if (selectedRoom && numberOfGuests > selectedRoom.capacity) {
      errs.numberOfGuests = `Esta habitación admite un máximo de ${selectedRoom.capacity} huéspedes.`;
    }

    if (effectiveTotalPrice < 0 || isNaN(effectiveTotalPrice)) {
      errs.totalPrice = 'Ingresa un precio total válido (mayor o igual a 0).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Envío del formulario validando status codes con validateStatusCode y retroalimentación psicológica al recepcionista
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitStatusCode(null);
    setSubmitFeedback(null);

    // Formatear fechas en formato ISO para la API (check-in 15:00Z y check-out 12:00Z)
    const checkInIso = checkInDate.includes('T')
      ? checkInDate
      : `${checkInDate}T15:00:00Z`;

    const checkOutIso = checkOutDate.includes('T')
      ? checkOutDate
      : `${checkOutDate}T12:00:00Z`;

    // Estado: en inglés para el backend ('pending', 'confirmed', etc.), en español para el usuario
    const estadoObj = ESTADOS_RESERVA.find((item) => item.value === stateValue);
    const backendState = estadoObj ? estadoObj.backendValue : 'pending';

    // created_by obtenido del localStorage 'auth_user' y del item email
    const createdByEmail = getCreatedByEmail();

    // Payload de reserva construido en segundo plano
    const payload = {
      room_id: selectedRoomId,
      person_id: selectedPersonId,
      check_in_date: checkInIso,
      check_out_date: checkOutIso,
      number_of_guests: Number(numberOfGuests),
      state: backendState,
      total_price: Number(Number(effectiveTotalPrice).toFixed(2)),
      created_by: createdByEmail,
    };

    try {
      // Envío mediante petición POST con Axios al endpoint /reserve
      const response = await api.post('/reserve', payload, {
        validateStatus: () => true, // Permite que validateStatusCode procese cualquier status sin excepciones no controladas
      });

      const validation = validateStatusCode(response.status);
      setSubmitStatusCode(response.status);

      if (validation.isValid) {
        // Respuesta POSITIVA: mensaje empático y tranquilizador usando psicología para el recepcionista
        const successMessage =
          validation.message ||
          '¡Excelente trabajo! La reserva se registró y aseguró con éxito en el sistema.';

        setSubmitFeedback({
          type: 'success',
          title: validation.title || '¡Reserva confirmada con éxito!',
          message: successMessage,
          statusCode: response.status,
        });

        setSuccessReservation({
          roomNumber: selectedRoom?.number || '',
          roomFloor: selectedRoom?.floor ?? '',
          personName: selectedPerson?.name || 'Huésped registrado',
          checkInDate,
          checkOutDate,
          nights: Math.max(nights, 1),
          numberOfGuests,
          stateLabel: estadoObj?.label || stateValue,
          totalPrice: effectiveTotalPrice,
        });
      } else {
        // Respuesta NEGATIVA: psicología empática orientada al recepcionista para preservar la calma
        let friendlyTitle = validation.title || 'No pudimos registrar la reserva';
        let friendlyMessage = validation.message;

        if (response.status === 409) {
          friendlyTitle = 'Habitación no disponible en esas fechas';
          friendlyMessage =
            '¡Tranquilo(a)! Tus datos siguen intactos en el formulario. La habitación seleccionada ya tiene una reserva activa para esas fechas. Puedes ajustar el periodo o elegir otra habitación con un solo clic.';
        } else if (response.status === 400) {
          friendlyTitle = 'Revisemos algunos datos de la reserva';
          friendlyMessage =
            friendlyMessage ||
            'Tus datos están completamente a salvo. Por favor verifica que las fechas y el huésped titular estén correctamente seleccionados e inténtalo nuevamente.';
        } else if (response.status >= 500) {
          friendlyTitle = 'El servidor tuvo una pausa momentánea';
          friendlyMessage =
            '¡Respira con calma! No es tu culpa: tus datos siguen aquí intactos en pantalla. Espera un momento y vuelve a presionar "Confirmar y asegurar reserva".';
        }

        setSubmitFeedback({
          type: response.status === 409 ? 'warning' : 'error',
          title: friendlyTitle,
          message: friendlyMessage || 'Tus datos están intactos en pantalla. Intenta nuevamente en un momento.',
          statusCode: response.status,
        });
      }
    } catch {
      // Manejo de errores de red o interrupción de conexión con psicología preventiva
      const netVal = validateStatusCode(0);
      setSubmitStatusCode(0);

      const friendlyNetworkMessage =
        netVal.message ||
        'Tuvimos una pequeña dificultad de conexión con el servidor. No te preocupes: tus datos no se perdieron y siguen aquí en el formulario. Prueba de nuevo en un instante.';

      setSubmitFeedback({
        type: 'error',
        title: netVal.title || 'Pequeña pausa de conexión',
        message: friendlyNetworkMessage,
        statusCode: 0,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Reiniciar formulario para una nueva reserva
  const handleResetForm = () => {
    setSelectedRoomId('');
    setSelectedPersonId('');
    setCheckInDate(getTodayString());
    setCheckOutDate(getTomorrowString());
    setNumberOfGuests(1);
    setStateValue('pendiente');
    setCustomTotalPrice(null);
    setErrors({});
    setPersonError(null);
    setSubmitStatusCode(null);
    setSubmitFeedback(null);
    setSuccessReservation(null);
  };

  const selectedStateObj = ESTADOS_RESERVA.find(
    (item) => item.value === stateValue
  );

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {successReservation ? (
          /* PANTALLA DE ÉXITO */
          <motion.div
            key="reserva-success-card"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-panel mx-auto max-w-2xl rounded-3xl border border-emerald-500/30 p-8 text-center shadow-xl sm:p-12"
          >
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 shadow-sm dark:text-emerald-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="size-8"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
            </div>

            <div className="mt-5 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                ¡Reserva Garantizada {submitStatusCode ? `· Código ${submitStatusCode}` : ''}!
              </span>
              <h2 className="text-ink text-2xl font-bold sm:text-3xl">
                ¡Estadía reservada con éxito!
              </h2>
              <p className="text-ink-muted mx-auto max-w-md text-xs leading-relaxed">
                {submitFeedback?.message ||
                  '¡Excelente trabajo! La reserva ha quedado vinculada y registrada de forma segura en el sistema de Nexora.'}
              </p>
            </div>

            {/* Ficha Resumen */}
            <div className="divide-line/60 border-line bg-canvas/60 mt-6 divide-y rounded-2xl border p-5 text-left text-xs">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-ink-muted">Habitación asignada:</span>
                <span className="text-ink font-bold">
                  {successReservation.roomNumber} -{' '}
                  {successReservation.roomFloor}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-ink-muted">Huésped titular:</span>
                <span className="text-ink font-semibold">
                  {successReservation.personName}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-ink-muted">Periodo:</span>
                <span className="text-ink font-semibold">
                  {successReservation.checkInDate} al{' '}
                  {successReservation.checkOutDate} ({successReservation.nights}{' '}
                  {successReservation.nights === 1 ? 'noche' : 'noches'})
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-ink-muted">Número de huéspedes:</span>
                <span className="text-ink font-semibold">
                  {successReservation.numberOfGuests} personas
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-ink-muted">Estado inicial:</span>
                <span className="text-ink font-semibold">
                  {successReservation.stateLabel}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-ink text-sm font-bold">
                  Total pagado:
                </span>
                <span className="text-primary text-lg font-black">
                  {formatPrecioCOP(successReservation.totalPrice)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetForm}
              className="bg-primary hover:bg-primary/90 mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
            >
              <span>Registrar otra reserva</span>
            </button>
          </motion.div>
        ) : (
          /* FORMULARIO REDISEÑADO */
          <motion.div
            key="reserva-main-form"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
          >
            {/* Columna Izquierda (8 columnas): Campos del formulario */}
            <div className="border-line bg-panel space-y-6 rounded-3xl border p-6 shadow-sm sm:p-8 lg:col-span-8">
              <div className="border-line/60 border-b pb-4">
                <h2 className="text-ink flex items-center gap-2.5 text-xl font-bold">
                  <span className="bg-primary/10 text-primary grid size-9 place-items-center rounded-xl">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="size-4.5"
                      aria-hidden="true"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                  Datos de la Reserva
                </h2>
                <p className="text-ink-muted mt-1 text-xs">
                  Ingresa o selecciona la información esencial para reservar y
                  asegurar el alojamiento.
                </p>
              </div>

              {/* Error al cargar catálogo de habitaciones con validateStatusCode */}
              {roomError && (
                <div
                  role="alert"
                  className="border-danger/30 bg-danger/10 text-danger flex items-center justify-between rounded-2xl border p-4 text-xs"
                >
                  <span>{roomError}</span>
                  <button
                    type="button"
                    onClick={handleRetryRooms}
                    className="hover:text-danger/80 ml-2 shrink-0 cursor-pointer font-bold underline"
                  >
                    Reintentar habitaciones
                  </button>
                </div>
              )}

              {/* Mensaje de retroalimentación psicológica al recepcionista si la reserva no se registró */}
              {submitFeedback && submitFeedback.type !== 'success' && (
                <div
                  role="alert"
                  className={`flex items-start gap-3 rounded-2xl border p-4.5 text-xs leading-relaxed shadow-xs ${
                    submitFeedback.type === 'warning' || submitStatusCode === 409
                      ? 'border-amber-500/35 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                      : 'border-danger/35 bg-danger/10 text-danger'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">
                    {submitStatusCode === 409 ? '📅' : '🌿'}
                  </span>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="block font-bold text-sm">
                        {submitFeedback.title}
                      </strong>
                      {submitStatusCode !== null && submitStatusCode > 0 && (
                        <span className="rounded-md border border-current/20 px-2 py-0.5 text-[10px] font-mono font-semibold">
                          Código {submitStatusCode}
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed">{submitFeedback.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitFeedback(null)}
                    aria-label="Cerrar notificación"
                    className="text-current/60 hover:text-current ml-1 shrink-0 cursor-pointer p-1 transition-colors"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* 1. DROPDOWN: HABITACIONES (Axios GET /room con formato 'number - floor') */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="select-habitacion"
                      className="text-ink block text-xs font-semibold"
                    >
                      Habitación (Numero - Piso){' '}
                      <span className="text-danger">*</span>
                    </label>
                  </div>

                  <div className="relative">
                    <select
                      id="select-habitacion"
                      value={selectedRoomId}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      disabled={loadingRooms || submitting}
                      className={`bg-canvas text-ink focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-xs transition outline-none focus:ring-2 ${
                        errors.roomId || roomError
                          ? 'border-danger/60 focus:border-danger'
                          : 'border-line'
                      }`}
                    >
                      <option value="">-- Selecciona una habitación --</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.number} - {room.floor}
                        </option>
                      ))}
                    </select>
                  </div>

                  {errors.roomId && (
                    <p
                      role="alert"
                      className="text-danger mt-1 text-xs font-medium"
                    >
                      {errors.roomId}
                    </p>
                  )}

                  {/* Ficha descriptiva de la habitación seleccionada */}
                  {selectedRoom && (
                    <div className="border-primary/20 bg-primary/5 text-ink mt-2.5 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-[11px]">
                      <span className="text-primary font-bold">
                        Habitación {selectedRoom.number} - {selectedRoom.floor}
                      </span>
                      {selectedRoom.status && (
                        <>
                          <span className="text-ink-muted">·</span>
                          <span className="text-ink-muted capitalize">
                            Estado: {selectedRoom.status}
                          </span>
                        </>
                      )}
                      {selectedRoom.price_override != null && (
                        <>
                          <span className="text-ink-muted">·</span>
                          <span>
                            Tarifa:{' '}
                            <strong>
                              {formatPrecioCOP(selectedRoom.price_override)}
                              /noche
                            </strong>
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. DROPDOWN: PERSONAS REGISTRADAS (RecursosDropdown reutilizable) */}
                <div>
                  <div className="flex items-start gap-2.5">
                    <div className="min-w-0 flex-1">
                      <RecursosDropdown
                        id="select-persona"
                        label="Huésped titular registrado"
                        placeholder={
                          loadingPersons
                            ? 'Consultando huéspedes (/persons)…'
                            : '-- Selecciona un huésped registrado --'
                        }
                        options={personDropdownOptions}
                        value={selectedPersonId}
                        onChange={(val) => {
                          setSelectedPersonId(val);
                          if (errors.personId)
                            setErrors((p) => ({ ...p, personId: '' }));
                        }}
                        onSelectOption={(opt) => {
                          if (opt.value || opt.id) {
                            setSelectedPersonId(opt.value || opt.id || '');
                            if (errors.personId)
                              setErrors((p) => ({ ...p, personId: '' }));
                          }
                        }}
                        disabled={loadingPersons || submitting}
                        required
                        error={errors.personId}
                      />
                    </div>

                    {/* Botón que abre el modal de ingreso de información personal del huésped */}
                    <div className="pt-[26px]">
                      <button
                        type="button"
                        onClick={() => setIsGuestModalOpen(true)}
                        className="border-primary/30 bg-primary/10 text-primary hover:bg-primary inline-flex h-[42px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold shadow-xs transition-all hover:text-white active:scale-95"
                        title="Registrar un nuevo huésped"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="size-4"
                          aria-hidden="true"
                        >
                          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                        </svg>
                        <span className="hidden sm:inline">Nuevo huésped</span>
                        <span className="sm:hidden">Nuevo</span>
                      </button>
                    </div>
                  </div>

                  {/* Feedback de error de carga de huéspedes si ocurre */}
                  {personError && (
                    <div
                      role="alert"
                      className="border-danger/30 bg-danger/10 text-danger mt-1.5 flex items-center justify-between rounded-xl border p-2.5 text-[11px]"
                    >
                      <span>{personError}</span>
                      <button
                        type="button"
                        onClick={handleRetryPersons}
                        className="hover:text-danger/80 ml-2 shrink-0 cursor-pointer font-bold underline"
                      >
                        Reintentar
                      </button>
                    </div>
                  )}

                  {/* Ficha del huésped seleccionado */}
                  {selectedPerson && (
                    <div className="border-line bg-canvas/70 text-ink mt-2.5 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-[11px]">
                      <span className="text-ink font-semibold">
                        {selectedPerson.name}
                      </span>
                      {selectedPerson.document_number && (
                        <>
                          <span className="text-ink-muted">·</span>
                          <span className="text-ink-muted">
                            Doc: {selectedPerson.document_number}
                          </span>
                        </>
                      )}
                      {selectedPerson.phone_number && (
                        <>
                          <span className="text-ink-muted">·</span>
                          <span className="text-ink-muted">
                            Tel: {selectedPerson.phone_number}
                          </span>
                        </>
                      )}
                      {selectedPerson.email && (
                        <>
                          <span className="text-ink-muted">·</span>
                          <span className="text-ink-muted">
                            {selectedPerson.email}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. DATE PICKER: FECHA DE ENTRADA Y FECHA DE SALIDA */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-ink block text-xs font-semibold">
                      Periodo de la estadía{' '}
                      <span className="text-danger">*</span>
                    </span>
                    <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                      {nights} {nights === 1 ? 'noche' : 'noches'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Fecha de Entrada */}
                    <div>
                      <label
                        htmlFor="check-in-date"
                        className="text-ink-muted mb-1 block text-[11px] font-medium"
                      >
                        Fecha de entrada
                      </label>
                      <input
                        type="date"
                        id="check-in-date"
                        value={checkInDate}
                        min={getTodayString()}
                        onChange={(e) => handleCheckInChange(e.target.value)}
                        disabled={submitting}
                        className={`bg-canvas text-ink focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-3.5 py-2 text-xs transition outline-none focus:ring-2 ${
                          errors.checkInDate
                            ? 'border-danger/60 focus:border-danger'
                            : 'border-line'
                        }`}
                      />
                      {errors.checkInDate && (
                        <p
                          role="alert"
                          className="text-danger mt-1 text-xs font-medium"
                        >
                          {errors.checkInDate}
                        </p>
                      )}
                    </div>

                    {/* Fecha de Salida */}
                    <div>
                      <label
                        htmlFor="check-out-date"
                        className="text-ink-muted mb-1 block text-[11px] font-medium"
                      >
                        Fecha de salida
                      </label>
                      <input
                        type="date"
                        id="check-out-date"
                        value={checkOutDate}
                        min={checkInDate || getTodayString()}
                        onChange={(e) => handleCheckOutChange(e.target.value)}
                        disabled={submitting}
                        className={`bg-canvas text-ink focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-3.5 py-2 text-xs transition outline-none focus:ring-2 ${
                          errors.checkOutDate
                            ? 'border-danger/60 focus:border-danger'
                            : 'border-line'
                        }`}
                      />
                      {errors.checkOutDate && (
                        <p
                          role="alert"
                          className="text-danger mt-1 text-xs font-medium"
                        >
                          {errors.checkOutDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. INPUT: NÚMERO DE HUÉSPEDES */}
                <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="number-of-guests"
                      className="text-ink mb-1.5 block text-xs font-semibold"
                    >
                      Número de huéspedes <span className="text-danger">*</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setNumberOfGuests((prev) => Math.max(1, prev - 1))
                        }
                        disabled={numberOfGuests <= 1 || submitting}
                        aria-label="Disminuir huéspedes"
                        className="border-line bg-canvas text-ink hover:bg-panel grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl border transition disabled:opacity-40"
                      >
                        <span className="text-base font-bold">−</span>
                      </button>

                      <input
                        type="number"
                        id="number-of-guests"
                        min={1}
                        max={selectedRoom ? selectedRoom.capacity : 10}
                        value={numberOfGuests}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!isNaN(val)) setNumberOfGuests(val);
                          if (errors.numberOfGuests)
                            setErrors((p) => ({ ...p, numberOfGuests: '' }));
                        }}
                        disabled={submitting}
                        className={`bg-canvas text-ink focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-3 py-2 text-center text-xs font-bold transition outline-none focus:ring-2 ${
                          errors.numberOfGuests
                            ? 'border-danger/60 focus:border-danger'
                            : 'border-line'
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setNumberOfGuests((prev) => {
                            const max = selectedRoom
                              ? selectedRoom.capacity
                              : 10;
                            return Math.min(max, prev + 1);
                          })
                        }
                        disabled={
                          (selectedRoom &&
                            numberOfGuests >= selectedRoom.capacity) ||
                          submitting
                        }
                        aria-label="Aumentar huéspedes"
                        className="border-line bg-canvas text-ink hover:bg-panel grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl border transition disabled:opacity-40"
                      >
                        <span className="text-base font-bold">+</span>
                      </button>
                    </div>

                    {errors.numberOfGuests && (
                      <p
                        role="alert"
                        className="text-danger mt-1 text-xs font-medium"
                      >
                        {errors.numberOfGuests}
                      </p>
                    )}

                    {selectedRoom && (
                      <p className="text-ink-muted mt-1 text-[11px]">
                        Habitación {selectedRoom.number} (Piso{' '}
                        {selectedRoom.floor}): Capacidad sugerida hasta{' '}
                        {selectedRoom.capacity} personas.
                      </p>
                    )}
                  </div>

                  {/* 5. DROPDOWN: MANEJAR ESTADOS */}
                  <div>
                    <label
                      htmlFor="select-estado"
                      className="text-ink mb-1.5 block text-xs font-semibold"
                    >
                      Estado de la reserva{' '}
                      <span className="text-danger">*</span>
                    </label>

                    <div className="relative">
                      <select
                        id="select-estado"
                        value={stateValue}
                        onChange={(e) => setStateValue(e.target.value)}
                        disabled={submitting}
                        className="border-line bg-canvas text-ink focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-semibold transition outline-none focus:ring-2"
                      >
                        {ESTADOS_RESERVA.map((est) => (
                          <option key={est.value} value={est.value}>
                            {est.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedStateObj && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className={`size-2 rounded-full ${selectedStateObj.dotColor}`}
                          aria-hidden="true"
                        />
                        <span className="text-ink-muted text-[11px] font-medium">
                          Estado seleccionado:{' '}
                          <strong>{selectedStateObj.label}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. INPUT: PRECIO TOTAL */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="total-price"
                      className="text-ink block text-xs font-semibold"
                    >
                      Precio total (COP) <span className="text-danger">*</span>
                    </label>
                    {customTotalPrice !== null && (
                      <button
                        type="button"
                        onClick={() => setCustomTotalPrice(null)}
                        className="text-primary cursor-pointer text-[11px] font-medium hover:underline"
                        title="Restaurar precio calculado por noches"
                      >
                        Restaurar precio sugerido (
                        {formatPrecioCOP(suggestedPrice)})
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <span className="text-ink-muted pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-bold">
                      $ COP
                    </span>
                    <input
                      type="number"
                      id="total-price"
                      min={0}
                      value={effectiveTotalPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val)) setCustomTotalPrice(val);
                        if (errors.totalPrice)
                          setErrors((p) => ({ ...p, totalPrice: '' }));
                      }}
                      disabled={submitting}
                      className={`bg-canvas text-ink focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-2.5 pr-3.5 pl-16 text-xs font-bold transition outline-none focus:ring-2 ${
                        errors.totalPrice
                          ? 'border-danger/60 focus:border-danger'
                          : 'border-line'
                      }`}
                    />
                  </div>

                  {errors.totalPrice && (
                    <p
                      role="alert"
                      className="text-danger mt-1 text-xs font-medium"
                    >
                      {errors.totalPrice}
                    </p>
                  )}

                  <div className="text-ink-muted mt-1.5 flex items-center justify-between text-[11px]">
                    <span>
                      Representación:{' '}
                      <strong className="text-ink">
                        {formatPrecioCOP(effectiveTotalPrice)}
                      </strong>
                    </span>
                    {selectedRoom && (
                      <span>
                        Base sugerida: {formatPrecioCOP(selectedRoom.price)} ×{' '}
                        {nights} {nights === 1 ? 'noche' : 'noches'}
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Columna Derecha (4 columnas): Resumen Dinámico y Confirmación */}
            <div className="sticky top-6 space-y-4 lg:col-span-4">
              <div className="border-line bg-panel space-y-5 rounded-3xl border p-6 shadow-sm">
                <div className="border-line/60 flex items-center justify-between border-b pb-3">
                  <h3 className="text-ink text-sm font-bold tracking-wider uppercase">
                    Resumen de Estadía
                  </h3>
                  {selectedStateObj && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${selectedStateObj.badgeClass}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${selectedStateObj.dotColor}`}
                      />
                      {selectedStateObj.label}
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  {/* Habitación con formato number - floor */}
                  <div className="flex items-start justify-between">
                    <span className="text-ink-muted">Habitación:</span>
                    <strong className="text-ink max-w-[180px] truncate text-right">
                      {selectedRoom
                        ? `${selectedRoom.number} - ${selectedRoom.floor}`
                        : 'Sin seleccionar'}
                    </strong>
                  </div>

                  {/* Huésped */}
                  <div className="flex items-start justify-between">
                    <span className="text-ink-muted">Huésped:</span>
                    <strong className="text-ink max-w-[180px] truncate text-right">
                      {selectedPerson ? selectedPerson.name : 'Sin seleccionar'}
                    </strong>
                  </div>

                  {/* Periodo */}
                  <div className="flex items-start justify-between">
                    <span className="text-ink-muted">Entrada / Salida:</span>
                    <span className="text-ink text-right font-semibold">
                      {checkInDate} <br />
                      <span className="text-ink-muted text-[11px]">
                        hasta {checkOutDate}
                      </span>
                    </span>
                  </div>

                  {/* Noches */}
                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted">Noches:</span>
                    <strong className="text-ink">
                      {nights} {nights === 1 ? 'noche' : 'noches'}
                    </strong>
                  </div>

                  {/* Huéspedes */}
                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted">Aforo:</span>
                    <strong className="text-ink">
                      {numberOfGuests} personas
                    </strong>
                  </div>

                  {/* Tarifa base */}
                  {selectedRoom && (
                    <div className="border-line/50 flex items-center justify-between border-t pt-2 text-[11px]">
                      <span className="text-ink-muted">Tarifa por noche:</span>
                      <span className="text-ink">
                        {formatPrecioCOP(selectedRoom.price)}
                      </span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-line/70 flex items-baseline justify-between border-t pt-3">
                    <span className="text-ink text-sm font-bold">
                      Total a pagar:
                    </span>
                    <span className="text-primary text-xl font-black">
                      {formatPrecioCOP(effectiveTotalPrice)}
                    </span>
                  </div>
                </div>

                {/* Botón de Confirmación Principal */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || loadingRooms}
                  className="bg-primary hover:bg-primary/90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader size={16} visible={true} className="text-white" />
                      <span>Confirmando y asegurando reserva…</span>
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-4"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Confirmar y asegurar reserva</span>
                    </>
                  )}
                </button>

                <p className="text-ink-muted text-center text-[11px] leading-tight">
                  Tus datos están protegidos. La reserva se confirmará
                  inmediatamente en el sistema.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL PARA INGRESAR INFORMACIÓN PERSONAL DEL HUÉSPED */}
      <NuevoHuespedModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onSuccess={handleGuestCreated}
      />

      {/* Componente reutilizable Loader con overlay mientras se procesa la reserva en segundo plano */}
      <Loader
        overlay
        visible={submitting}
        label="Confirmando y asegurando reserva en el sistema…"
        size={36}
      />
    </div>
  );
}
