import { useCallback, useEffect, useRef, useState, useId } from 'react'
import axios from 'axios'
import { AnimatePresence, motion } from 'motion/react'
import { SelectField } from '../atoms/select-field'
import { Button } from '../atoms/button'
import { ApiModuleRepository } from '../../infrastructure/api-module-repository'
import { cn } from '../lib/cn'
import { api } from '../../../../lib/api'
import { validateStatusCode } from '../../../../shared/lib/status-code-validator'

const apiModuleRepository = new ApiModuleRepository()

const resourceErrorMessage =
  'Tranqui, no es algo que hayas hecho vos: se nos cruzó algo del otro lado y la lista no llegó a destino. Ya lo estamos resolviendo. Probá de nuevo en un instante y vas a poder elegir tu recurso.'

const unexpectedErrorMessage =
  'Se nos complicó traer tus recursos. No es tu culpa: estamos revisándolo. Probá otra vez en un momento y seguimos.'

const rolesErrorMessage400 =
  '¡Tranqui, que no cunda el pánico! ✨ Se nos presentó una pequeña situación técnica con el servidor al consultar los roles (código 400), pero toda tu información sigue completamente a salvo. Dale una segunda oportunidad con "Volver a intentar" y los traemos de inmediato.'

const rolesUnexpectedErrorMessage =
  '¡Respira con calma! 🌿 Tuvimos un breve contratiempo de red al intentar traer los roles. Tus datos siguen intactos aquí. Presiona "Volver a intentar" en un momento.'

export interface DropdownOption {
  value: string
  label: string
  id?: string
  rawName?: string
}

export interface RecursosDropdownProps {
  /** Valor seleccionado en modo selección simple */
  value?: string
  /** Callback para cambio en modo simple */
  onChange?: (value: string) => void
  /** Callback para notificar la opción completa seleccionada (con id y rawName) */
  onSelectOption?: (option: DropdownOption) => void
  /** Mensaje de error a desplegar */
  error?: string
  /** Etiqueta superior del campo */
  label?: string
  /** Texto placeholder */
  placeholder?: string
  /** Opciones predefinidas. Si no se pasan, carga recursos vía apiModuleRepository o endpoint */
  options?: ReadonlyArray<DropdownOption>
  /** Endpoint personalizado para consultar opciones vía axios GET (ej: '/roles') */
  endpoint?: string
  /** Activa la selección múltiple con chips y popover interactivo */
  multiple?: boolean
  /** Valores seleccionados en modo múltiple */
  selectedValues?: string[]
  /** Callback para actualización en modo múltiple */
  onMultiChange?: (values: string[]) => void
  /** Deshabilita la interacción */
  disabled?: boolean
  /** Deshabilita la interacción (alias: isDisabled) */
  isDisabled?: boolean
  /** Marca el campo como obligatorio */
  required?: boolean
  /** Clases CSS adicionales */
  className?: string
  /** Mensaje de aviso cuando no hay opciones disponibles */
  emptyLabel?: string
  /** Identificador opcional para el elemento de formulario */
  id?: string
}

export function RecursosDropdown({
  value = '',
  onChange,
  onSelectOption,
  error,
  label,
  placeholder,
  options: externalOptions,
  endpoint,
  multiple = false,
  selectedValues = [],
  onMultiChange,
  disabled = false,
  isDisabled,
  required = false,
  className,
  emptyLabel: customEmptyLabel,
  id,
}: RecursosDropdownProps) {
  const isComponentDisabled = isDisabled ?? disabled
  const autoId = useId()
  const fieldId = id ?? autoId
  const dropdownRef = useRef<HTMLDivElement>(null)
  const onSelectOptionRef = useRef(onSelectOption)
  useEffect(() => {
    onSelectOptionRef.current = onSelectOption
  }, [onSelectOption])
  const [internalOptions, setInternalOptions] = useState<ReadonlyArray<DropdownOption>>([])
  const [loading, setLoading] = useState(externalOptions == null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Carga automática de opciones solo si NO se proveyeron opciones externas
  const loadOptions = useCallback(async () => {
    if (externalOptions != null) return
    setErrorMessage(null)
    setLoading(true)

    try {
      // 1. Endpoint específico de roles: /roles vía GET con axios y validateStatusCode
      if (endpoint === '/roles' || endpoint?.includes('roles')) {
        const response = await api.get<{ id: string; name: string; description?: string }[]>(endpoint, {
          validateStatus: () => true,
        })

        const validation = validateStatusCode(response.status)

        if (validation.isValid) {
          const rawData = response.data
          const dataList: { id: string; name: string; description?: string }[] = Array.isArray(rawData)
            ? rawData
            : rawData && typeof rawData === 'object' && Array.isArray((rawData as { data?: unknown[] }).data)
              ? (rawData as { data: { id: string; name: string; description?: string }[] }).data
              : []

          // Para las opciones en el dropdown utilizar el item id como value y name como label
          const roleOptions = dataList.map((role) => {
            const isGuestOrHuesped =
              role.name.trim().toLowerCase() === 'guest' ||
              role.name.trim().toLowerCase() === 'huesped' ||
              role.name.trim().toLowerCase() === 'huésped'
            return {
              value: role.id,
              label: isGuestOrHuesped ? 'Huesped' : role.name,
              id: role.id,
              rawName: role.name,
            }
          })
          setInternalOptions(roleOptions)

          // De acuerdo a las opciones del endpoint por defecto es huesped
          const huespedRole =
            roleOptions.find(
              (r) =>
                r.label.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 'huesped' ||
                r.rawName?.trim().toLowerCase() === 'guest' ||
                r.rawName?.trim().toLowerCase() === 'huesped'
            ) || roleOptions[0]

          if (huespedRole) {
            onSelectOptionRef.current?.(huespedRole)
            onChange?.(huespedRole.id || huespedRole.value)
          }
        } else if (response.status === 400) {
          // Status 400: Mensaje empático y constructivo mediante status-code-validator
          setErrorMessage(validation.message || rolesErrorMessage400)
        } else {
          setErrorMessage(validation.message || rolesUnexpectedErrorMessage)
        }
        return
      }

      // 2. Otro endpoint genérico
      if (endpoint) {
        const response = await api.get<unknown[]>(endpoint, {
          validateStatus: () => true,
        })
        const validation = validateStatusCode(response.status)
        if (validation.isValid && Array.isArray(response.data)) {
          setInternalOptions(
            (response.data as Array<{ id?: string; value?: string; name?: string; label?: string }>).map((item) => ({
              value: item.id ?? item.value ?? String(item),
              label: item.name ?? item.label ?? String(item),
            }))
          )
        } else if (response.status === 400) {
          setErrorMessage(validation.message || rolesErrorMessage400)
        } else {
          setErrorMessage(validation.message || unexpectedErrorMessage)
        }
        return
      }

      // 3. Comportamiento por defecto: listResources vía apiModuleRepository
      const resources = await apiModuleRepository.listResources()
      setInternalOptions(resources.map((resource) => ({ value: resource.id, label: resource.name })))
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? 0
        const validation = validateStatusCode(status)
        setErrorMessage(
          validation.message || (endpoint?.includes('roles') ? rolesErrorMessage400 : resourceErrorMessage)
        )
      } else {
        const validation = validateStatusCode(0)
        setErrorMessage(
          validation.message || (endpoint?.includes('roles') ? rolesUnexpectedErrorMessage : unexpectedErrorMessage)
        )
      }
    } finally {
      setLoading(false)
    }
  }, [externalOptions, endpoint, onChange, value])

  useEffect(() => {
    if (externalOptions == null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadOptions()
    }
  }, [externalOptions, loadOptions])

  // Cierre al hacer click fuera del dropdown cuando está abierto en modo múltiple
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Conserva íntegras todas las opciones obtenidas del endpoint
  const rawOptions = externalOptions ?? internalOptions
  const isRolesEndpoint = endpoint === '/roles' || endpoint?.includes('roles')
  const defaultHuespedId = 'role-huesped'
  const options =
    rawOptions.length > 0
      ? rawOptions
      : isRolesEndpoint
        ? [{ value: defaultHuespedId, label: 'Huesped', id: defaultHuespedId, rawName: 'guest' }]
        : []

  // Resolver el valor seleccionado tolerando coincidencias por id, por alias (Huesped <-> guest) o por defecto
  const resolvedValue = (() => {
    if (!value) {
      if (isRolesEndpoint) {
        const huespedOpt = options.find(
          (o) =>
            o.label.toLowerCase() === 'huesped' ||
            (o as DropdownOption).rawName?.toLowerCase() === 'guest' ||
            (o as DropdownOption).rawName?.toLowerCase() === 'huesped'
        )
        return huespedOpt ? huespedOpt.value : options[0]?.value || defaultHuespedId
      }
      return ''
    }
    const exactMatch = options.find((o) => o.value === value || (o as DropdownOption).id === value)
    if (exactMatch) return exactMatch.value

    if (value.toLowerCase() === 'huesped' || value.toLowerCase() === 'guest') {
      const matchHuesped = options.find(
        (o) =>
          o.label.toLowerCase() === 'huesped' ||
          (o as DropdownOption).rawName?.toLowerCase() === 'guest' ||
          (o as DropdownOption).rawName?.toLowerCase() === 'huesped'
      )
      if (matchHuesped) return matchHuesped.value
    }

    return value
  })()

  const fieldLabel = label ?? 'Recurso'

  // Manejo de error de carga en modo automático
  if (externalOptions == null && errorMessage !== null) {
    const isRoles = endpoint?.includes('roles')
    return (
      <div className={cn('space-y-1.5', className)}>
        <span className="block text-sm font-medium text-ink">{fieldLabel}</span>
        <div role="alert" className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3.5 space-y-1.5 text-xs">
          <div className="flex items-start gap-2">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-500 font-bold text-xs mt-0.5">
              ℹ
            </span>
            <div className="space-y-1">
              <p className="font-bold text-amber-600 dark:text-amber-300">
                {isRoles ? '¡Pausa al sincronizar los roles!' : 'No pudimos traer los datos'}
              </p>
              <p className="text-xs leading-relaxed text-ink-muted">{errorMessage}</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setLoading(true)
                  void loadOptions()
                }}
                disabled={loading || isComponentDisabled}
                className="mt-2 px-3 py-1 text-xs font-semibold cursor-pointer"
              >
                {loading ? 'Consultando roles…' : 'Volver a intentar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // MODO SELECCIÓN MÚLTIPLE (Multi-select)
  if (multiple) {
    const defaultPlaceholder = placeholder ?? 'Elige una o varias opciones…'

    const toggleOption = (optValue: string) => {
      if (isComponentDisabled) return
      const isSelected = selectedValues.includes(optValue)
      const nextValues = isSelected
        ? selectedValues.filter((v) => v !== optValue)
        : [...selectedValues, optValue]
      onMultiChange?.(nextValues)
    }

    const removeValue = (optValue: string, event: React.MouseEvent) => {
      event.stopPropagation()
      if (isComponentDisabled) return
      onMultiChange?.(selectedValues.filter((v) => v !== optValue))
    }

    return (
      <div ref={dropdownRef} className={cn('relative space-y-1.5', className)}>
        <label id={`${autoId}-label`} className="block text-sm font-medium text-ink">
          {fieldLabel}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
          )}
        </label>

        {/* Trigger / Botón que abre el dropdown */}
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${autoId}-label`}
          disabled={isComponentDisabled || loading}
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'flex min-h-[42px] w-full items-center justify-between gap-2 rounded-xl border bg-panel px-3.5 py-2 text-left text-sm text-ink shadow-xs outline-none transition',
            error
              ? 'border-danger/60 ring-2 ring-danger/20'
              : isOpen
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-line hover:border-ink-soft',
            isComponentDisabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedValues.length === 0 ? (
              <span className="text-ink-soft">
                {loading ? 'Cargando opciones…' : defaultPlaceholder}
              </span>
            ) : (
              selectedValues.map((val) => {
                const matched = options.find((o) => o.value === val)
                const textLabel = matched ? matched.label : val
                return (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    {textLabel}
                    {!isComponentDisabled && (
                      <button
                        type="button"
                        onClick={(e) => removeValue(val, e)}
                        className="rounded hover:bg-primary/20 p-0.5 transition-colors"
                        aria-label={`Remover ${textLabel}`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="size-3"
                          aria-hidden="true"
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </span>
                )
              })
            )}
          </div>

          <span className="shrink-0 text-ink-muted">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={cn('size-4 transition-transform duration-200', isOpen && 'rotate-180')}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>

        {/* Popover flotante con las opciones */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-panel p-1.5 shadow-lg"
              role="listbox"
              aria-multiselectable="true"
            >
              {options.length === 0 ? (
                <div className="p-3 text-center text-xs text-ink-soft">
                  {loading ? 'Cargando opciones…' : 'No hay opciones disponibles.'}
                </div>
              ) : (
                options.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggleOption(opt.value)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors text-left',
                        isSelected
                          ? 'bg-primary/10 font-semibold text-primary'
                          : 'text-ink hover:bg-black/5 dark:hover:bg-white/5',
                      )}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="size-4 text-primary"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  )
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-1 text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    )
  }

  // MODO SELECCIÓN SIMPLE (Dropdown estándar)
  return (
    <SelectField
      id={fieldId}
      label={fieldLabel}
      placeholder={
        placeholder ?? (loading ? 'Cargando opciones…' : `Elegir ${fieldLabel.toLowerCase()}…`)
      }
      options={options}
      value={resolvedValue}
      onChange={(event) => {
        const val = event.target.value
        onChange?.(val)
        const matched = options.find((o) => o.value === val)
        if (matched) {
          onSelectOption?.(matched)
        }
      }}
      error={error}
      disabled={isComponentDisabled || loading}
      required={required}
      className={className}
      emptyLabel={loading ? undefined : (customEmptyLabel ?? 'Todavía no hay opciones disponibles.')}
    />
  )
}

