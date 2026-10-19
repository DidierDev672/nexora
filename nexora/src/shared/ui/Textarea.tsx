import {
  useState,
  useId,
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
  type TextareaHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
  type FocusEvent,
} from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { fadeIn } from '../../design-tokens/motion'
import { cn } from '../lib/cn'

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both'
export type TextareaLabelVariant = 'top' | 'floating'

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  /**
   * Etiqueta del campo. Cambia dinámicamente de color según el estado
   * (focus, error, disabled, default).
   */
  label?: string

  /**
   * Variante de la etiqueta:
   * - 'top': Etiqueta superior fija con indicador de estado (por defecto).
   * - 'floating': Etiqueta flotante animada que se desplaza al borde superior.
   */
  labelVariant?: TextareaLabelVariant

  /**
   * Mensaje de error de validación.
   * Cambia los bordes y el anillo de enfoque a rojo, y muestra este texto debajo.
   */
  error?: string

  /**
   * Texto de asistencia / recomendación debajo del textarea (se oculta si hay error).
   */
  hint?: ReactNode

  /**
   * Muestra el contador de caracteres en la esquina inferior derecha.
   * Si se especifica `maxLength`, mostrará `actual/maxLength`.
   * Si no se pasa `maxLength`, mostrará el número total de caracteres ingresados.
   */
  showCount?: boolean

  /**
   * Límite máximo de caracteres permitidos.
   */
  maxLength?: number

  /**
   * Controla el comportamiento de redimensionamiento nativo:
   * - 'none': Deshabilita el resize (resize-none).
   * - 'vertical': Permite sólo resize vertical (resize-y).
   * - 'horizontal': Permite sólo resize horizontal (resize-x).
   * - 'both': Permite ambas direcciones (resize).
   * @default 'none'
   */
  resize?: TextareaResize

  /**
   * Si es `true`, el textarea ajusta automáticamente su altura al contenido (auto-grow).
   * Al activarse, anula el resize manual para una experiencia visual pulida.
   * @default false
   */
  autoResize?: boolean

  /**
   * Altura mínima cuando autoResize está activo (en píxeles o clases CSS).
   * @default 96 (equivalente a min-h-[96px])
   */
  minHeight?: number

  /**
   * Clases adicionales para el contenedor principal.
   */
  className?: string

  /**
   * Clases adicionales exclusivas para la etiqueta `<label>`.
   */
  labelClassName?: string

  /**
   * Clases adicionales exclusivas para el elemento `<textarea>`.
   */
  textareaClassName?: string
}

const resizeClasses: Record<TextareaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
}

/**
 * Componente de Textarea reutilizable construido con Tailwind CSS y principios de UX/UI modernos:
 * - Bordes suaves con transiciones refinadas.
 * - Anillo de enfoque (focus ring) con sombra de elevación sutil.
 * - Estados: Default, Lleno, Focus, Disabled y Validación con Error.
 * - Etiqueta superior o flotante con cambio reactivo de color.
 * - Contador de caracteres con feedback visual de proximidad al límite.
 * - Soporte para redimensionado desactivado o altura dinámica (auto-grow).
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      labelVariant = 'top',
      error,
      hint,
      showCount = false,
      maxLength,
      resize = 'none',
      autoResize = false,
      minHeight = 96,
      required = false,
      disabled = false,
      rows = 3,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      className,
      labelClassName,
      textareaClassName,
      id,
      placeholder,
      ...restProps
    },
    ref
  ) {
    const autoId = useId()
    const fieldId = id ?? autoId
    const errorId = `${fieldId}-error`
    const hintId = `${fieldId}-hint`

    const innerRef = useRef<HTMLTextAreaElement>(null)
    useImperativeHandle(ref, () => innerRef.current!)

    // Estados internos para feedback de interacción
    const [isFocused, setIsFocused] = useState(false)
    const [charCount, setCharCount] = useState<number>(() => {
      if (typeof value === 'string') return value.length
      if (typeof defaultValue === 'string') return defaultValue.length
      return 0
    })

    const hasError = Boolean(error && error.trim().length > 0)
    const hasValue = (typeof value === 'string' ? value.length : charCount) > 0

    // Ajuste dinámico de altura cuando autoResize está activo
    const adjustAutoHeight = useCallback(() => {
      if (!autoResize || !innerRef.current) return
      const el = innerRef.current
      el.style.height = 'auto'
      const newHeight = Math.max(el.scrollHeight, minHeight)
      el.style.height = `${newHeight}px`
    }, [autoResize, minHeight])

    useEffect(() => {
      if (autoResize) {
        adjustAutoHeight()
      }
    }, [autoResize, adjustAutoHeight, value])

    // Sincronizar contador de caracteres cuando el valor controlado cambia
    useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length)
      }
    }, [value])

    const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      if (autoResize) {
        adjustAutoHeight()
      }
      onChange?.(e)
    }

    // Cálculo del estado visual de la etiqueta (Label color state)
    const getLabelColorClass = () => {
      if (disabled) return 'text-ink-muted/50 cursor-not-allowed'
      if (hasError) return 'text-danger font-semibold'
      if (isFocused) return 'text-primary font-semibold'
      return 'text-ink font-medium'
    }

    // Proximidad al límite de caracteres para feedback visual preventivo
    const isNearLimit = maxLength != null && charCount >= maxLength * 0.9
    const isAtLimit = maxLength != null && charCount >= maxLength

    const effectiveResizeClass = autoResize ? 'resize-none overflow-hidden' : resizeClasses[resize]

    return (
      <div className={cn('group w-full flex flex-col', className)}>
        {/* 1. Etiqueta Superior Tradicional */}
        {label && labelVariant === 'top' && (
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label
              htmlFor={fieldId}
              className={cn(
                'block text-sm transition-colors duration-200 select-none',
                getLabelColorClass(),
                labelClassName
              )}
            >
              <span>{label}</span>
              {required && (
                <span aria-hidden="true" className="ml-1 text-danger font-bold">
                  *
                </span>
              )}
            </label>

            {!required && !disabled && (
              <span className="text-[11px] font-normal tracking-wide text-ink-muted">
                Opcional
              </span>
            )}
          </div>
        )}

        {/* 2. Contenedor del Textarea con Posible Etiqueta Flotante */}
        <div className="relative w-full">
          {label && labelVariant === 'floating' && (
            <label
              htmlFor={fieldId}
              className={cn(
                'pointer-events-none absolute left-3.5 z-10 origin-[0] transition-all duration-200 ease-out select-none',
                isFocused || hasValue
                  ? '-top-2.5 px-1.5 text-xs bg-panel rounded-sm'
                  : 'top-3 text-sm text-ink-soft',
                getLabelColorClass(),
                labelClassName
              )}
            >
              <span>{label}</span>
              {required && (
                <span aria-hidden="true" className="ml-0.5 text-danger">
                  *
                </span>
              )}
            </label>
          )}

          <textarea
            ref={innerRef}
            id={fieldId}
            rows={rows}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={
              labelVariant === 'floating' && !isFocused && !hasValue ? undefined : placeholder
            }
            aria-invalid={hasError ? true : undefined}
            aria-describedby={hasError ? errorId : hint ? hintId : undefined}
            style={autoResize ? { minHeight: `${minHeight}px` } : undefined}
            className={cn(
              // Tipografía y geometría base
              'w-full rounded-2xl border px-4 py-3 text-sm leading-relaxed text-ink',
              'font-sans bg-panel shadow-xs outline-none',
              // Transiciones suaves para todos los estados interactivos
              'transition-all duration-200 ease-in-out',
              // Placeholder estilizado
              'placeholder:text-ink-soft/70 placeholder:font-normal',
              // Control de Redimensionamiento
              effectiveResizeClass,
              // Estado: Focus e Indicador de Anillo Visual
              'focus:ring-2 focus:ring-offset-0 focus:shadow-md',
              // Estados de Color y Bordes según Error vs Normal
              hasError
                ? 'border-danger/60 text-danger-900 focus:border-danger focus:ring-danger/20'
                : 'border-line hover:border-ink-soft focus:border-primary focus:ring-primary/20',
              // Estado: Deshabilitado (Disabled)
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-canvas/50 disabled:hover:border-line disabled:shadow-none',
              textareaClassName
            )}
            {...restProps}
          />
        </div>

        {/* 3. Barra Inferior: Mensaje de Error / Ayuda (Izquierda) + Contador de Caracteres (Derecha) */}
        <div className="mt-1.5 flex items-start justify-between gap-3 min-h-[1.25rem] px-0.5">
          {/* Mensaje de Error o Ayuda */}
          <div className="flex-1">
            <AnimatePresence initial={false} mode="wait">
              {hasError ? (
                <motion.p
                  key={errorId}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  id={errorId}
                  role="alert"
                  className="flex items-center gap-1.5 text-xs font-medium text-danger"
                >
                  <svg
                    className="size-3.5 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </motion.p>
              ) : hint != null ? (
                <p id={hintId} className="text-xs text-ink-soft leading-normal">
                  {hint}
                </p>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Contador de Caracteres en la esquina inferior derecha */}
          {(showCount || maxLength != null) && (
            <div
              aria-live="polite"
              className={cn(
                'shrink-0 text-right text-xs font-mono transition-colors duration-200 select-none',
                disabled && 'opacity-40',
                isAtLimit
                  ? 'font-bold text-danger'
                  : isNearLimit
                    ? 'font-semibold text-amber-600 dark:text-amber-400'
                    : isFocused
                      ? 'text-primary'
                      : 'text-ink-muted'
              )}
            >
              {maxLength != null ? (
                <span>
                  {charCount}/{maxLength}
                </span>
              ) : (
                <span>{charCount} caracteres</span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
