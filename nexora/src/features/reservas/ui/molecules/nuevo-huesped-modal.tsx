import { useState, useEffect, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Input } from '../../../../shared/ui/Input';
import { Button } from '../../../recursos/ui/atoms/button';
import { RecursosDropdown, type DropdownOption } from '../../../recursos/ui/molecules/recursos-dropdown';
import { Loader } from '../../../tema/ui/atoms/loader';
import { api } from '../../../../lib/api';
import { validateStatusCode } from '../../../../shared/lib/status-code-validator';
import { readTokenEmail } from '../../../../shared/auth-storage';
import type { PersonApiResponse } from '../../domain/reserva';

export interface NuevoHuespedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPerson: PersonApiResponse) => void;
}

export interface RoleApiResponseItem {
  id: string;
  name: string;
  description?: string;
}

const TIPOS_DOC = [
  { value: 'id_card', label: 'Tarjeta de identidad' },
  { value: 'national_id', label: 'Número de identificación' },
  { value: 'foreign_id', label: 'Tarjeta de extranjería' },
] as const;

const OPCIONES_GENERO = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
] as const;

const DEFAULT_ROLE_ID = 'role-huesped';

/**
 * Obtiene el email del usuario creador desde el JSON auth_user de localStorage
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
  return readTokenEmail() || 'admin@nexora.com';
}

/**
 * Genera un identificador único de respaldo si la API no devuelve ID
 */
function generateFallbackId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function NuevoHuespedModal({
  isOpen,
  onClose,
  onSuccess,
}: NuevoHuespedModalProps) {
  // 1. Dropdown tipo de documento: (a) Tarjeta de identidad, (b) Número de identificación, (c) Tarjeta de extranjería
  const [documentType, setDocumentType] = useState('id_card');
  // 2. Input número de documento
  const [documentNumber, setDocumentNumber] = useState('');
  // 3. Input nombre completo
  const [name, setName] = useState('');
  // 4. Input número de teléfono
  const [phoneNumber, setPhoneNumber] = useState('');
  // 5. Input correo electrónico (email)
  const [email, setEmail] = useState('');
  // 6. Input fecha de nacimiento
  const [dateOfBirth, setDateOfBirth] = useState('');
  // 7. Dropdown género: [Masculino, Femenino, Otro] mapeado a valores [M, F, O]
  const [genre, setGenre] = useState<'M' | 'F' | 'O'>('M');
  // 8. Input nacionalidad
  const [nationality, setNationality] = useState('Colombiana');
  // 9. Dropdown roles: por defecto "Huesped", consumiendo obligatoriamente GET /roles con RecursosDropdown e isDisabled
  const [selectedRoleId, setSelectedRoleId] = useState<string>(DEFAULT_ROLE_ID);
  const [roleOptions, setRoleOptions] = useState<ReadonlyArray<DropdownOption>>([
    { value: DEFAULT_ROLE_ID, label: 'Huesped', id: DEFAULT_ROLE_ID, rawName: 'guest' },
  ]);
  const [roleError, setRoleError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Consumir el endpoint "/roles" con el método GET y validar status code con status-code-validator.ts
  useEffect(() => {
    let isMounted = true;

    const fetchRoles = async () => {
      try {
        const response = await api.get<RoleApiResponseItem[]>('/roles', {
          validateStatus: () => true,
        });

        const validation = validateStatusCode(response.status);

        if (validation.isValid) {
          const rawData = response.data;
          const rolesList: RoleApiResponseItem[] = Array.isArray(rawData)
            ? rawData
            : rawData &&
                typeof rawData === 'object' &&
                Array.isArray((rawData as { data?: RoleApiResponseItem[] }).data)
              ? (rawData as { data: RoleApiResponseItem[] }).data
              : [];

          if (isMounted && rolesList.length > 0) {
            // Los items que vamos a utilizar son: name (y su id para el valor)
            const mappedOptions: DropdownOption[] = rolesList.map((item) => {
              const isHuesped =
                item.name.trim().toLowerCase() === 'guest' ||
                item.name.trim().toLowerCase() === 'huesped' ||
                item.name.trim().toLowerCase() === 'huésped';
              return {
                value: item.id,
                label: isHuesped ? 'Huesped' : item.name,
                id: item.id,
                rawName: item.name,
              };
            });

            setRoleOptions(mappedOptions);

            // De acuerdo a las opciones del endpoint, por defecto es huesped
            const huespedRole =
              rolesList.find(
                (r) =>
                  r.name.trim().toLowerCase() === 'guest' ||
                  r.name.trim().toLowerCase() === 'huesped' ||
                  r.name.trim().toLowerCase() === 'huésped'
              ) || rolesList[0];

            if (huespedRole?.id) {
              setSelectedRoleId(huespedRole.id);
            }
          }
        } else {
          if (isMounted && validation.message) {
            setRoleError(validation.message);
          }
        }
      } catch {
        const netValidation = validateStatusCode(0);
        if (isMounted && netValidation.message) {
          setRoleError(netValidation.message);
        }
      }
    };

    fetchRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  // Cerrar con Escape y bloquear scroll del body
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setDocumentType('id_card');
    setDocumentNumber('');
    setName('');
    setPhoneNumber('');
    setEmail('');
    setDateOfBirth('');
    setGenre('M');
    setNationality('Colombiana');
    const huespedOpt = roleOptions.find(
      (o) =>
        o.label.toLowerCase() === 'huesped' ||
        o.rawName?.toLowerCase() === 'guest' ||
        o.rawName?.toLowerCase() === 'huesped'
    );
    setSelectedRoleId(huespedOpt?.id || DEFAULT_ROLE_ID);
    setErrors({});
    setSubmitError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!documentType) {
      errs.documentType = 'El tipo de documento es requerido.';
    }
    if (!documentNumber.trim()) {
      errs.documentNumber = 'El número de documento es requerido.';
    }
    if (!name.trim()) {
      errs.name = 'El nombre completo es requerido.';
    }
    if (!phoneNumber.trim()) {
      errs.phoneNumber = 'El número de teléfono es requerido.';
    }
    if (!email.trim()) {
      errs.email = 'El correo electrónico es requerido.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Ingresa un correo electrónico válido.';
    }
    if (!dateOfBirth.trim()) {
      errs.dateOfBirth = 'La fecha de nacimiento es requerida.';
    }
    if (!genre) {
      errs.genre = 'El género es requerido.';
    }
    if (!nationality.trim()) {
      errs.nationality = 'La nacionalidad es requerida.';
    }
    if (!selectedRoleId.trim()) {
      errs.role = 'El rol es requerido.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    // Obtener estrictamente el ID del rol seleccionado desde las opciones del dropdown de Rol
    let roleId = selectedRoleId.trim();

    // Prioridad 1: buscar en las opciones cargadas en el dropdown (roleOptions) para obtener estrictamente su 'id'
    const matchedOption =
      roleOptions.find((o) => o.id === roleId || o.value === roleId) ||
      roleOptions.find(
        (o) =>
          o.label.toLowerCase() === 'huesped' ||
          o.rawName?.toLowerCase() === 'guest' ||
          o.rawName?.toLowerCase() === 'huesped'
      );

    if (matchedOption?.id) {
      roleId = matchedOption.id;
    } else if (
      !roleId ||
      roleId.toLowerCase() === 'huesped' ||
      roleId.toLowerCase() === 'guest'
    ) {
      // Prioridad 2: si las opciones no estaban en memoria, consultar directamente el endpoint /roles
      try {
        const rolesRes = await api.get<RoleApiResponseItem[]>('/roles', {
          validateStatus: () => true,
        });
        const rawData = rolesRes.data;
        const rolesList: RoleApiResponseItem[] = Array.isArray(rawData)
          ? rawData
          : rawData &&
              typeof rawData === 'object' &&
              Array.isArray((rawData as { data?: RoleApiResponseItem[] }).data)
            ? (rawData as { data: RoleApiResponseItem[] }).data
            : [];

        if (rolesList.length > 0) {
          const found =
            rolesList.find(
              (r) =>
                r.name
                  .trim()
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '') === 'huesped' ||
                r.name.trim().toLowerCase() === 'guest'
            ) ||
            rolesList.find((r) =>
              r.name.trim().toLowerCase().includes('huesped')
            ) ||
            rolesList[0];
          if (found?.id) {
            roleId = found.id;
            setSelectedRoleId(found.id);
          }
        }
      } catch {
        // Fallback en caso de interrupción de conexión
      }
    }

    // Fallback asegurado: si por cualquier motivo no hay ID válido, asignar el ID del catálogo de huésped
    if (
      !roleId ||
      roleId.toLowerCase() === 'huesped' ||
      roleId.toLowerCase() === 'guest'
    ) {
      roleId = DEFAULT_ROLE_ID;
    }

    const createdBy = getCreatedByEmail();

    // El payload no incluye 'id', ya que la API lo genera automáticamente.
    const payload = {
      document_type: documentType,
      document_number: documentNumber.trim(),
      name: name.trim(),
      phone_number: phoneNumber.trim(),
      email: email.trim(),
      date_of_birth: dateOfBirth ? (dateOfBirth.includes('T') ? dateOfBirth : `${dateOfBirth}T00:00:00Z`) : undefined,
      gender: genre,
      nationality: nationality.trim(),
      roles: [roleId],
      created_by: createdBy,
    };

    try {
      let response;
      try {
        response = await api.post('/persons', payload, {
          validateStatus: () => true,
        });
      } catch {
        response = await api.post('/person', payload, {
          validateStatus: () => true,
        });
      }

      const validation = validateStatusCode(response?.status ?? 0);

      if (validation.isValid) {
        const responseData = response.data as
          { id?: string; data?: { id?: string } } | undefined;
        // La API genera el id automáticamente en su respuesta
        const newId =
          responseData?.id ||
          responseData?.data?.id ||
          generateFallbackId();

        const createdPerson: PersonApiResponse = {
          id: String(newId),
          document_type: documentType,
          document_number: documentNumber.trim(),
          name: name.trim(),
          phone_number: phoneNumber.trim(),
          email: email.trim(),
          date_of_birth: dateOfBirth ? (dateOfBirth.includes('T') ? dateOfBirth : `${dateOfBirth}T00:00:00Z`) : undefined,
          genre: genre,
          gender: genre,
          nationality: nationality.trim(),
        };

        onSuccess(createdPerson);
        resetForm();
        onClose();
      } else {
        setSubmitError(
          validation.message ||
            'No fue posible registrar al huésped en este momento. Tus datos siguen intactos en el formulario; por favor intenta nuevamente.'
        );
      }
    } catch {
      const netVal = validateStatusCode(0);
      setSubmitError(
        netVal.message ||
          'Tuvimos una pequeña dificultad de conexión con el servidor. No te preocupes: tus datos no se perdieron. Prueba de nuevo en un instante.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop con blur y efecto Fade In */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Dialog Container con efecto Fade In (Framer Motion: initial 0, animate 1, transition 0.5s easeOut) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="nuevo-huesped-title"
            onClick={(e) => e.stopPropagation()}
            className="border-line bg-panel relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl sm:p-8"
          >
            {/* Header del Modal */}
            <div className="border-line/60 flex items-start justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary grid size-10 place-items-center rounded-2xl shadow-2xs">
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </span>
                <div>
                  <h3
                    id="nuevo-huesped-title"
                    className="text-ink text-lg font-bold"
                  >
                    Registrar nuevo huésped
                  </h3>
                  <p className="text-ink-muted text-xs">
                    Ingresa los datos personales del huésped para seleccionarlo
                    y vincularlo a la reserva.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar modal"
                className="border-line text-ink-muted hover:bg-canvas hover:text-ink grid size-8 cursor-pointer place-items-center rounded-xl border transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error general de envío */}
            {submitError && (
              <div
                role="alert"
                className="border-danger/30 bg-danger/10 text-danger mt-4 rounded-xl border p-3 text-xs leading-relaxed"
              >
                {submitError}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 1. DROPDOWN: TIPOS DE DOCUMENTOS */}
                <div>
                  <label
                    htmlFor="modal-tipo-documento"
                    className="text-ink mb-1.5 block text-xs font-semibold"
                  >
                    Tipo de documento <span className="text-danger">*</span>
                  </label>
                  <select
                    id="modal-tipo-documento"
                    value={documentType}
                    onChange={(e) => {
                      setDocumentType(e.target.value);
                      if (errors.documentType)
                        setErrors((p) => ({ ...p, documentType: '' }));
                    }}
                    className={`bg-canvas text-ink focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-xs transition outline-none focus:ring-2 ${
                      errors.documentType
                        ? 'border-danger/60 focus:border-danger'
                        : 'border-line'
                    }`}
                  >
                    {TIPOS_DOC.map((td) => (
                      <option key={td.value} value={td.value}>
                        {td.label}
                      </option>
                    ))}
                  </select>
                  {errors.documentType && (
                    <p
                      role="alert"
                      className="text-danger mt-1 text-xs font-medium"
                    >
                      {errors.documentType}
                    </p>
                  )}
                </div>

                {/* 2. INPUT: NÚMERO DE DOCUMENTO */}
                <Input
                  id="modal-numero-documento"
                  label="Número de documento"
                  placeholder="Ej: 1020304050"
                  value={documentNumber}
                  onChange={(e) => {
                    setDocumentNumber(e.target.value);
                    if (errors.documentNumber)
                      setErrors((p) => ({ ...p, documentNumber: '' }));
                  }}
                  error={errors.documentNumber}
                  required
                />
              </div>

              {/* 3. INPUT: NOMBRE COMPLETO */}
              <Input
                id="modal-nombre-completo"
                label="Nombre completo"
                placeholder="Ej: Juan Perez"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                }}
                error={errors.name}
                required
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 4. INPUT: CORREO ELECTRÓNICO (EMAIL) */}
                <Input
                  id="modal-email"
                  type="email"
                  label="Correo electrónico"
                  placeholder="Ej: juan.perez@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                  }}
                  error={errors.email}
                  required
                />

                {/* 5. INPUT: NÚMERO DE TELÉFONO */}
                <Input
                  id="modal-telefono"
                  type="tel"
                  label="Número de teléfono"
                  placeholder="Ej: +57 300 123 4567"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (errors.phoneNumber)
                      setErrors((p) => ({ ...p, phoneNumber: '' }));
                  }}
                  error={errors.phoneNumber}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 6. INPUT: FECHA DE NACIMIENTO */}
                <Input
                  id="modal-fecha-nacimiento"
                  type="date"
                  label="Fecha de nacimiento"
                  value={dateOfBirth}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    if (errors.dateOfBirth)
                      setErrors((p) => ({ ...p, dateOfBirth: '' }));
                  }}
                  error={errors.dateOfBirth}
                  required
                />

                {/* 7. DROPDOWN: GÉNERO [Masculino, Femenino, Otro] mapeado a [M, F, O] */}
                <div>
                  <label
                    htmlFor="modal-genero"
                    className="text-ink mb-1.5 block text-xs font-semibold"
                  >
                    Género <span className="text-danger">*</span>
                  </label>
                  <select
                    id="modal-genero"
                    value={genre}
                    onChange={(e) => {
                      setGenre(e.target.value as 'M' | 'F' | 'O');
                      if (errors.genre)
                        setErrors((p) => ({ ...p, genre: '' }));
                    }}
                    className={`bg-canvas text-ink focus:border-primary focus:ring-primary/20 w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-xs transition outline-none focus:ring-2 ${
                      errors.genre
                        ? 'border-danger/60 focus:border-danger'
                        : 'border-line'
                    }`}
                  >
                    {OPCIONES_GENERO.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.genre && (
                    <p
                      role="alert"
                      className="text-danger mt-1 text-xs font-medium"
                    >
                      {errors.genre}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 8. INPUT: NACIONALIDAD */}
                <Input
                  id="modal-nacionalidad"
                  label="Nacionalidad"
                  placeholder="Ej: Colombiana"
                  value={nationality}
                  onChange={(e) => {
                    setNationality(e.target.value);
                    if (errors.nationality)
                      setErrors((p) => ({ ...p, nationality: '' }));
                  }}
                  error={errors.nationality}
                  required
                />

                {/* 9. DROPDOWN: ROL (RecursosDropdown reutilizable consumiendo GET /roles, por defecto "Huesped", isDisabled) */}
                <RecursosDropdown
                  id="modal-rol"
                  label="Rol"
                  endpoint="/roles"
                  options={roleOptions}
                  value={selectedRoleId}
                  onChange={(val) => {
                    setSelectedRoleId(val);
                    if (errors.role) setErrors((p) => ({ ...p, role: '' }));
                  }}
                  onSelectOption={(opt) => {
                    if (opt.id || opt.value) {
                      setSelectedRoleId(opt.id || opt.value);
                    }
                  }}
                  isDisabled={true}
                  required
                  error={errors.role || roleError || undefined}
                />
              </div>

              {/* Botones de acción */}
              <div className="border-line/60 mt-6 flex items-center justify-end gap-3 border-t pt-3">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="rounded-xl px-4 py-2 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl px-5 py-2 text-xs font-bold"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader size={16} visible={true} />
                      Registrando…
                    </span>
                  ) : (
                    'Guardar y seleccionar'
                  )}
                </Button>
              </div>
            </form>

            {/* Componente reutilizable Loader visualizado en segundo plano al guardar y seleccionar */}
            <Loader
              overlay
              visible={submitting}
              label="Registrando nuevo huésped en segundo plano…"
              size={36}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
