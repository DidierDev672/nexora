import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { AnimatePresence, motion } from 'motion/react';
import {
  buttonEasingVariants,
  customEasing,
  fadeIn,
  fadeUp,
} from '../../../../design-tokens/motion';
import { api } from '../../../../lib/api';
import { validateStatusCode } from '../../../../shared/lib/status-code-validator';
import { readAuthTokenEmail } from '../../../../shared/auth-storage';
import { AsignarTarifaHabitacion } from '../../application/asignar-tarifa-habitacion';
import { RegistrarHabitacionDetalle } from '../../application/registrar-habitacion-detalle';
import type { HabitacionDetalleInput } from '../../domain/habitacion-detalle';
import { HabitacionApiError } from '../../domain/habitacion-error';
import type {
  RoomTariffFeedback,
  RoomTariffPayload,
} from '../../domain/room-tariff';
import { ApiHabitacionDetalleRepository } from '../../infrastructure/api-habitacion-detalle-repository';
import { ApiRoomTariffRepository } from '../../infrastructure/api-room-tariff-repository';
import { Button } from '../atoms/button';
import { Loader } from '../atoms/loader';
import { roomTypeErrorCopy } from '../lib/error-copy';
import {
  HabitacionDetalleForm,
  type Option,
  type EdificioOption,
  type TarifaOption,
} from '../molecules/habitacion-detalle-form';
import { TarifaFeedbackBanner } from '../molecules/tarifa-feedback-banner';
import { EdificioRegistroModal } from '../../../edificios/ui/organisms/edificio-registro-modal';
import { HabitacionTipoModal } from './habitacion-tipo-modal';
import { RecursosDropdown, type DropdownOption } from '../../../recursos/ui/molecules/recursos-dropdown';

const habitacionDetalleRepository = new ApiHabitacionDetalleRepository();
const roomTariffRepository = new ApiRoomTariffRepository();

function mapIdNameOptions(items: unknown[]): Option[] {
  return items
    .map((raw) => raw as { id?: unknown; name?: unknown })
    .filter((item) => item.id != null && typeof item.name === 'string')
    .map((item) => ({ value: String(item.id), label: String(item.name) }));
}

function mapEdificioOptions(items: unknown[]): EdificioOption[] {
  return items
    .map((raw) => {
      const item = raw as {
        id?: unknown;
        name?: unknown;
        floor_number?: unknown;
        floorNumber?: unknown;
      };
      const floorRaw = item.floor_number ?? item.floorNumber;
      const parsedFloor =
        typeof floorRaw === 'number'
          ? floorRaw
          : typeof floorRaw === 'string'
            ? parseInt(floorRaw, 10)
            : undefined;
      return {
        value: String(item.id ?? ''),
        label: String(item.name ?? ''),
        floorNumber:
          parsedFloor && !isNaN(parsedFloor) && parsedFloor > 0
            ? parsedFloor
            : undefined,
      };
    })
    .filter((item) => item.value.length > 0 && item.label.length > 0);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseRatesOptions(data: unknown): TarifaOption[] {
  const items = Array.isArray(data)
    ? data
    : data &&
        typeof data === 'object' &&
        Array.isArray((data as { data?: unknown }).data)
      ? (data as { data: unknown[] }).data
      : [];

  return items
    .map(
      (raw) =>
        raw as {
          id?: unknown;
          name?: unknown;
          price?: unknown;
          modality?: unknown;
        }
    )
    .filter(
      (item) =>
        item && typeof item.name === 'string' && item.name.trim().length > 0
    )
    .map((item) => {
      let price = 0;
      if (typeof item.price === 'number') {
        price = item.price;
      } else if (typeof item.price === 'string') {
        const parsed = parseFloat(item.price.replace(',', '.'));
        if (!isNaN(parsed)) price = parsed;
      }
      return {
        value: item.id != null ? String(item.id) : String(item.name),
        label: String(item.name),
        price,
        modality: typeof item.modality === 'string' ? item.modality : undefined,
      };
    });
}

export function HabitacionDetallePanel() {
  const [roomTypes, setRoomTypes] = useState<Option[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(true);
  const [roomTypesError, setRoomTypesError] = useState<string | null>(null);
  const [edificios, setEdificios] = useState<EdificioOption[]>([]);
  const [edificiosLoading, setEdificiosLoading] = useState(true);
  const [edificiosError, setEdificiosError] = useState<string | null>(null);
  const [rates, setRates] = useState<TarifaOption[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [selectedTarifaId, setSelectedTarifaId] = useState('');
  const [tarifaFeedback, setTarifaFeedback] =
    useState<RoomTariffFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingNumero, setSubmittingNumero] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successNumero, setSuccessNumero] = useState<string | null>(null);
  const [successValidationMessage, setSuccessValidationMessage] = useState<
    string | null
  >(null);
  const [tipoModalOpen, setTipoModalOpen] = useState(false);
  const [edificioModalOpen, setEdificioModalOpen] = useState(false);
  const submittingRef = useRef(false);

  const fetchRoomTypes = useCallback(async () => {
    setRoomTypesLoading(true);
    setRoomTypesError(null);
    try {
      const response = await api.get<unknown>('/room-types');
      if (response.status === 200) {
        setRoomTypes(
          Array.isArray(response.data) ? mapIdNameOptions(response.data) : []
        );
      }
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      setRoomTypesError(
        status === 400
          ? 'No pudimos obtener los tipos de habitación en este momento. Vuelve a intentarlo en unos segundos.'
          : 'No pudimos cargar los tipos de habitación, pero el formulario sigue listo. Revisa tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setRoomTypesLoading(false);
    }
  }, []);

  const fetchEdificios = useCallback(async () => {
    setEdificiosLoading(true);
    setEdificiosError(null);
    try {
      const response = await api.get<unknown>('/building');
      if (response.status === 200) {
        const rawData = Array.isArray(response.data)
          ? response.data
          : response.data &&
              typeof response.data === 'object' &&
              'data' in response.data &&
              Array.isArray((response.data as { data: unknown[] }).data)
            ? (response.data as { data: unknown[] }).data
            : [];
        setEdificios(mapEdificioOptions(rawData));
      }
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      setEdificiosError(
        status === 400
          ? 'No pudimos obtener los edificios en este momento. Vuelve a intentarlo en unos segundos.'
          : 'No pudimos cargar los edificios, pero el formulario sigue listo. Revisa tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setEdificiosLoading(false);
    }
  }, []);

  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    setRatesError(null);
    try {
      const response = await api.get<unknown>('/rates', {
        validateStatus: (status) => status === 200 || status === 400,
      });
      if (response.status === 200) {
        setRates(parseRatesOptions(response.data));
      } else if (response.status === 400) {
        setRatesError(
          '¡Ups! Parece que las tarifas se tomaron un respiro y tuvimos un pequeño tropiezo al obtenerlas. Tranquilo(a), todo lo que has escrito sigue intacto y seguro. Pulsa en «Reintentar» y las sincronizamos enseguida.'
        );
      }
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      setRatesError(
        status === 400
          ? '¡Ups! Parece que las tarifas se tomaron un respiro y tuvimos un pequeño tropiezo al obtenerlas. Tranquilo(a), todo lo que has escrito sigue intacto y seguro. Pulsa en «Reintentar» y las sincronizamos enseguida.'
          : 'No pudimos cargar las tarifas en este momento, pero tu formulario sigue listo. Revisa tu conexión y vuelve a intentarlo.'
      );
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await fetchRoomTypes();
      await fetchEdificios();
      await fetchRates();
    })();
  }, [fetchRoomTypes, fetchEdificios, fetchRates]);

  const handleSubmit = async (values: HabitacionDetalleInput) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmittingNumero(values.numero.trim());
    setSubmitError(null);
    setTarifaFeedback(null);
    try {
      const result = await RegistrarHabitacionDetalle(
        habitacionDetalleRepository
      )(values);
      setSuccessNumero(values.numero.trim());
      if (result?.validation?.message) {
        setSuccessValidationMessage(result.validation.message);
      }

      // Si el usuario seleccionó una tarifa, en segundo plano construimos el payload y lo enviamos a /room_tariff:
      if (selectedTarifaId) {
        const tarifaSeleccionada = rates.find(
          (r) => r.value === selectedTarifaId
        );
        const roomId = result?.roomId;
        const createdByEmail = readAuthTokenEmail();

        if (roomId) {
          const tariffPayload: RoomTariffPayload = {
            room_id: roomId,
            rate_id: selectedTarifaId,
            is_default: true,
            status: 'active',
            created_by: createdByEmail,
          };

          const feedback = await AsignarTarifaHabitacion(roomTariffRepository)({
            payload: tariffPayload,
            tarifaNombre: tarifaSeleccionada?.label,
            numeroHabitacion: values.numero.trim(),
          });

          setTarifaFeedback(feedback);
        } else {
          setTarifaFeedback({
            type: 'error',
            status: 0,
            title: 'Aviso: No se pudo vincular la tarifa en este momento',
            message: `¡Tranquilo(a)! La habitación ${values.numero.trim()} se registró y guardó de forma completamente segura en tu inventario; sin embargo, no fue posible obtener el identificador de la habitación para vincular automáticamente la tarifa «${tarifaSeleccionada?.label ?? 'seleccionada'}».`,
            subtext:
              'No te preocupes: puedes asociar o modificar su tarifa en cualquier momento desde el módulo de tarifas o el detalle de la habitación.',
          });
        }
      }
    } catch (error) {
      if (error instanceof HabitacionApiError && error.friendlyMessage) {
        setSubmitError(error.friendlyMessage);
      } else {
        const status =
          error instanceof HabitacionApiError
            ? error.status
            : isAxiosError(error)
              ? (error.response?.status ?? 0)
              : 0;
        const validation = validateStatusCode(status);
        setSubmitError(validation.message ?? roomTypeErrorCopy(status));
      }
    } finally {
      setSubmitting(false);
      setSubmittingNumero('');
      submittingRef.current = false;
    }
  };

  const resetForm = () => {
    setSuccessNumero(null);
    setSuccessValidationMessage(null);
    setSubmitError(null);
    setSelectedTarifaId('');
    setTarifaFeedback(null);
  };

  const buttonHoverTap = {
    whileHover: {
      scale: 1.04,
      y: -2,
      transition: { duration: 0.22, ease: customEasing },
    },
    whileTap: {
      scale: 0.96,
      y: 0,
      transition: { duration: 0.12, ease: customEasing },
    },
  };

  /* ------------------------------------------------------------------ */
  /*  2. Subcomponentes pequeños (mismo archivo, o muévelos a /components) */
  /* ------------------------------------------------------------------ */

  type ModalActionButtonProps = {
    index: number;
    onClick: () => void;
    children: React.ReactNode;
  };

  function ModalActionButton({
    index,
    onClick,
    children,
  }: ModalActionButtonProps) {
    return (
      <Button
        type="button"
        variant="secondary"
        className="shrink-0 shadow-2xs"
        custom={index}
        initial="hidden"
        animate="visible"
        variants={buttonEasingVariants}
        {...buttonHoverTap}
        onClick={onClick}
      >
        {children}
      </Button>
    );
  }

  type TarifaSelectProps = {
    rates: TarifaOption[];
    value: string;
    onChange: (value: string) => void;
    loading: boolean;
    error: boolean;
  };

  function TarifaSelect({
    rates,
    value,
    onChange,
    loading,
    error,
  }: TarifaSelectProps) {
    const placeholder = loading
      ? 'Cargando tarifas…'
      : error
        ? 'Tarifas no disponibles'
        : 'Elige una tarifa (opcional)…';

    const tarifaOptions: DropdownOption[] = useMemo(
      () =>
        rates.map((opt) => ({
          value: opt.value,
          label:
            opt.price > 0
              ? `${opt.label} (${formatCurrency(opt.price)})`
              : opt.label,
        })),
      [rates]
    );

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="tarifa-header-select"
          className="text-ink-muted text-[11px] leading-tight font-medium"
        >
          Puedes elegir la tarifa para esta habitación:
        </label>
        <RecursosDropdown
          id="tarifa-header-select"
          label=""
          options={tarifaOptions}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={loading}
          error={error ? 'Tarifas no disponibles' : undefined}
          emptyLabel="Todavía no hay tarifas registradas."
        />
      </div>
    );
  }

  type RegistroHeaderProps = {
    rates: TarifaOption[];
    selectedTarifaId: string;
    onTarifaChange: (value: string) => void;
    ratesLoading: boolean;
    ratesError: boolean;
    onCreateTipo: () => void;
    onCreateEdificio: () => void;
  };

  function RegistroHeader({
    rates,
    selectedTarifaId,
    onTarifaChange,
    ratesLoading,
    ratesError,
    onCreateTipo,
    onCreateEdificio,
  }: RegistroHeaderProps) {
    return (
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h2 className="text-ink text-lg font-bold">Registrar habitación</h2>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={buttonEasingVariants}
          className="flex flex-col gap-3 sm:min-w-[220px]"
        >
          <div className="flex flex-wrap gap-3">
            <ModalActionButton index={0} onClick={onCreateTipo}>
              Crear tipo de habitación
            </ModalActionButton>
            <ModalActionButton index={1} onClick={onCreateEdificio}>
              Crear edificio
            </ModalActionButton>
          </div>

          <TarifaSelect
            rates={rates}
            value={selectedTarifaId}
            onChange={onTarifaChange}
            loading={ratesLoading}
            error={ratesError}
          />
        </motion.div>
      </header>
    );
  }

  type LoadErrorsProps = {
    roomTypes: { error?: string | null; loading: boolean; retry: () => void };
    edificios: { error?: string | null; loading: boolean; retry: () => void };
    rates: { error?: string | null; loading: boolean; retry: () => void };
  };

  function LoadErrors({ roomTypes, edificios, rates }: LoadErrorsProps) {
    const items = [roomTypes, edificios, rates].filter((i) => i.error);
    if (items.length === 0) return null;

    return (
      <div className="mt-4 flex flex-col gap-2">
        {items.map((item) => (
          <LoadBanner
            key={item.error}
            message={item.error!}
            loading={item.loading}
            onRetry={item.retry}
          />
        ))}
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  3. Lógica derivada: sácala del JSX                                  */
  /* ------------------------------------------------------------------ */

  function getSubmittingLabel(numero: string | null, hasTarifa: boolean) {
    if (!numero) return 'Registrando…';
    return hasTarifa
      ? `Registrando habitación ${numero} y vinculando tarifa…`
      : `Registrando la habitación ${numero}…`;
  }

  /* ------------------------------------------------------------------ */
  /*  4. Dentro de tu componente: calcula una sola vez lo que se repite   */
  /* ------------------------------------------------------------------ */

  const selectedTarifa = useMemo(
    () => rates.find((r) => r.value === selectedTarifaId) ?? null,
    [rates, selectedTarifaId]
  );

  /* ------------------------------------------------------------------ */
  /*  5. El return queda como un "índice" legible de la pantalla          */
  /* ------------------------------------------------------------------ */

  return (
    <>
      <motion.section
        aria-label="Registro de habitaciones"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mt-10"
      >
        <div className="border-line bg-panel rounded-2xl border p-5 shadow-sm sm:p-8">
          {successNumero ? (
            <SuccessState
              numero={successNumero}
              tarifaNombre={selectedTarifa?.label}
              tarifaFeedback={tarifaFeedback}
              successMessage={successValidationMessage}
              onReset={resetForm}
            />
          ) : (
            <>
              <RegistroHeader
                rates={rates}
                selectedTarifaId={selectedTarifaId}
                onTarifaChange={setSelectedTarifaId}
                ratesLoading={ratesLoading}
                ratesError={Boolean(ratesError)}
                onCreateTipo={() => setTipoModalOpen(true)}
                onCreateEdificio={() => setEdificioModalOpen(true)}
              />

              <LoadErrors
                roomTypes={{
                  error: roomTypesError,
                  loading: roomTypesLoading,
                  retry: () => void fetchRoomTypes(),
                }}
                edificios={{
                  error: edificiosError,
                  loading: edificiosLoading,
                  retry: () => void fetchEdificios(),
                }}
                rates={{
                  error: ratesError,
                  loading: ratesLoading,
                  retry: () => void fetchRates(),
                }}
              />

              <div className="mt-5">
                <HabitacionDetalleForm
                  roomTypes={roomTypes}
                  roomTypesLoading={roomTypesLoading}
                  edificios={edificios}
                  edificiosLoading={edificiosLoading}
                  submitting={submitting}
                  submitError={submitError}
                  onSubmit={handleSubmit}
                  selectedTarifa={selectedTarifa}
                  repository={habitacionDetalleRepository}
                />
              </div>
            </>
          )}
        </div>
      </motion.section>

      <Loader
        overlay
        visible={submitting}
        size={40}
        label={getSubmittingLabel(submittingNumero, Boolean(selectedTarifaId))}
      >
        <span className="text-ink-soft max-w-xs text-center text-xs leading-relaxed">
          Un momento: le estamos preparando su lugar dentro de tu hotel.
        </span>
      </Loader>

      <HabitacionTipoModal
        open={tipoModalOpen}
        onClose={() => setTipoModalOpen(false)}
        onSuccess={() => void fetchRoomTypes()}
      />

      <EdificioRegistroModal
        open={edificioModalOpen}
        onClose={() => setEdificioModalOpen(false)}
        onSuccess={() => void fetchEdificios()}
      />
    </>
  );
}

function LoadBanner({
  message,
  loading,
  onRetry,
}: {
  message: string;
  loading: boolean;
  onRetry: () => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p role="status" className="text-sm font-medium text-black">
        {message}
      </p>
      <Button
        type="button"
        variant="secondary"
        className="shrink-0"
        onClick={onRetry}
        disabled={loading}
      >
        Reintentar
      </Button>
    </motion.div>
  );
}

function SuccessState({
  numero,
  tarifaNombre,
  tarifaFeedback,
  successMessage,
  onReset,
}: {
  numero: string;
  tarifaNombre?: string;
  tarifaFeedback?: RoomTariffFeedback | null;
  successMessage?: string | null;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-6 py-12 text-center"
      >
        <span className="grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-7"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        </span>
        <div className="space-y-1">
          <h3 className="text-ink text-xl font-bold">
            ¡La habitación {numero} ya tiene casa!
          </h3>
          {successMessage && (
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {successMessage}
            </p>
          )}
          <p className="text-ink-muted text-sm leading-relaxed">
            Quedó registrada con su piso, su edificio, su tipo
            {tarifaNombre ? `, su tarifa «${tarifaNombre}»` : ''} y su estado. A
            partir de ahora puedes encontrarla y gestionarla cuando quieras.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={onReset}>
          Registrar otra habitación
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {tarifaFeedback && <TarifaFeedbackBanner feedback={tarifaFeedback} />}
      </AnimatePresence>
    </div>
  );
}
