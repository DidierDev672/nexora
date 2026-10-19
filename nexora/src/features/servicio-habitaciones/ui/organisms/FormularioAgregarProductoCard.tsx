import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import { Input } from '../../../../shared/ui/Input'
import { Switch } from '../atoms/Switch'
import { SeccionCargaImagen } from '../molecules/SeccionCargaImagen'
import { Loader } from '../../../tema/ui/atoms/loader'
import { api } from '../../../../lib/api'
import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../../../shared/lib/status-code-validator'
import { readAuthTokenEmail } from '../../../../shared/auth-storage'
import {
  subirImagenSupabase,
  DEFAULT_ROOM_SERVICE_BUCKET,
} from '../../../../shared/services/supabase-storage.service'
import type { MenuCategoria } from '../../domain/menu-categoria'

export interface FormularioAgregarProductoCardProps {
  categoriaInicial?: MenuCategoria | null
  categoriasDisponibles?: MenuCategoria[]
  onProductoGuardado?: () => void
  onCancelar?: () => void
}

const DEFAULT_PRODUCT_IMAGE =
  'https://images.pexels.com/photos/6823326/pexels-photo-6823326.jpeg'

export function FormularioAgregarProductoCard({
  categoriaInicial,
  categoriasDisponibles = [],
  onProductoGuardado,
  onCancelar,
}: FormularioAgregarProductoCardProps) {
  const descId = useId()
  const catSelectId = useId()

  // 1. Categoría asociada
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(
    categoriaInicial?.name ||
      (categoriasDisponibles[0]?.name ?? 'Platos Fuertes y Especialidades'),
  )

  // 2. name -> @Input.tsx
  const [name, setName] = useState('Bowl de Quiona y Aguacate')
  const [nameError, setNameError] = useState<string | undefined>()

  // 3. precio -> @Input.tsx
  const [price, setPrice] = useState('14.500')
  const [priceError, setPriceError] = useState<string | undefined>()

  // 4. porcentaje de impuesto -> @Input.tsx
  const [taxPercentage, setTaxPercentage] = useState('10.0')

  // 5. tiempo de preparacion -> @Input.tsx
  const [prepTime, setPrepTime] = useState('15')

  // 6. es vegetariano -> Switch (true / false)
  const [isVegetarian, setIsVegetarian] = useState(true)

  // 7. es vegano -> Switch (true / false)
  const [isVegan, setIsVegan] = useState(true)

  // 8. Fecha de inicios -> "Solo hora" (type="time")
  const [startTime, setStartTime] = useState('08:00')

  // 9. Fecha final -> "Solo hora" (type="time")
  const [endTime, setEndTime] = useState('22:00')

  // 10. Disponible -> Switch (true / false)
  const [available, setAvailable] = useState(true)

  // 11. Descripcion
  const [description, setDescription] = useState(
    'Quinoa orgánica, aguacate hass, garbanzos crocantes, espinaca baby y aderezo de tahini con limón',
  )

  // 12. Seccion para seleccionar imagen o foto
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [assetUrl, setAssetUrl] = useState<string>(DEFAULT_PRODUCT_IMAGE)

  // Estados de control de envío y feedback
  const [saving, setSaving] = useState(false)
  const [productosRegistrados, setProductosRegistrados] = useState(0)
  const [feedback, setFeedback] = useState<StatusCodeValidationResult | null>(null)

  const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setImagenArchivo(file)
    setImagenPreview(previewUrl)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAssetUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    } else {
      setAssetUrl(DEFAULT_PRODUCT_IMAGE)
    }
  }

  const validarFormulario = (): boolean => {
    let valido = true
    if (!name.trim()) {
      setNameError('Por favor ingresa el nombre comercial del producto.')
      valido = false
    } else {
      setNameError(undefined)
    }

    const numPrecio = parseFloat(price)
    if (isNaN(numPrecio) || numPrecio <= 0) {
      setPriceError('El precio debe ser un número positivo mayor a 0.')
      valido = false
    } else {
      setPriceError(undefined)
    }

    return valido
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return

    if (!validarFormulario()) {
      return
    }

    // Al hacer clic se activa saving para desplegar el Loader atómico visual
    setSaving(true)
    setFeedback(null)

    try {
      // 1. En segundo plano: Si el recepcionista seleccionó un archivo de imagen, subir a Supabase Storage
      let finalImageUrl = assetUrl || DEFAULT_PRODUCT_IMAGE
      if (imagenArchivo) {
        try {
          const uploadResult = await subirImagenSupabase(imagenArchivo, {
            bucketName: DEFAULT_ROOM_SERVICE_BUCKET,
          })
          if (uploadResult.success && uploadResult.publicUrl) {
            finalImageUrl = uploadResult.publicUrl
            setAssetUrl(uploadResult.publicUrl)
          }
        } catch (uploadErr) {
          console.warn('Aviso al subir imagen del producto a Supabase Storage:', uploadErr)
        }
      }

      // 2. Extraer created_by desde localStorage (en el JSON 'auteh_token' o 'auth_token' en el item email)
      const emailCreador = readAuthTokenEmail()

      // 3. Resolver category_id (por ejemplo '18d5458dc0eef66e' o el headquartes_id de la categoría)
      const selectedCat = categoriasDisponibles.find((c) => c.name === categoriaSeleccionada)
      const categoryId =
        categoriaInicial?.headquartes_id ||
        selectedCat?.headquartes_id ||
        '18d5458dc0eef66e'

      // 4. Construcción del payload requerido
      const prepMinutes = parseInt(prepTime, 10)
      const parsedPrice = parseFloat(price)
      const parsedTax = parseFloat(taxPercentage)

      const payload = {
        category_id: categoryId,
        name: name.trim() || 'Bowl de Quiona y Aguacate',
        description:
          description.trim() ||
          'Quinoa orgánica, aguacate hass, garbanzos crocantes, espinaca baby y aderezo de tahini con limón',
        price: isNaN(parsedPrice) ? 14.5 : parsedPrice,
        tax_percentage: isNaN(parsedTax) ? 10.0 : parsedTax,
        prep_time: isNaN(prepMinutes) ? 15 : prepMinutes,
        isVegetarian: isVegetarian,
        isVegan: isVegan,
        imageURL: finalImageUrl,
        start_time: startTime || '08:00',
        end_time: endTime || '22:00',
        available: available,
        created_by: emailCreador || 'ariasdev672@gmail.com',
      }

      // 5. Utilizando axios, enviar el payload al endpoint "/item-menu" con método POST (sin token de autenticación)
      const response = await api.post('/item-menu', payload, {
        skipAuth: true,
        validateStatus: () => true,
      })

      // 6. Validar el status code del endpoint utilizando status-code-validator.ts
      const validation = validateStatusCode(response.status)
      setFeedback(validation)

      if (validation.isValid) {
        setProductosRegistrados((prev) => prev + 1)
        // Limpiamos los campos para permitir registrar el siguiente producto de inmediato
        setName('')
        setNameError(undefined)
        setPrice('')
        setPriceError(undefined)
        setDescription('')
        setImagenArchivo(null)
        setImagenPreview(null)
        setAssetUrl(DEFAULT_PRODUCT_IMAGE)
        onProductoGuardado?.()
      }
    } catch (err: unknown) {
      let status = 500
      if (axios.isAxiosError(err) && err.response?.status) {
        status = err.response.status
      } else if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
        status = 408
      }
      const validation = validateStatusCode(status)
      setFeedback(validation)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Loader visual durante el guardado del producto */}
      <Loader
        visible={saving}
        overlay
        label="Guardando y registrando producto..."
      />

      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="w-full rounded-3xl border border-line bg-panel p-6 sm:p-8 shadow-xs"
      >
        {/* Cabecera de la Card con Copywriting Psicológico */}
        <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Carta Digital · Catálogo
              </span>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold text-ink">
              Agregar Producto o Platillo
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Define los precios, ingredientes, horarios y opciones dietéticas del ítem para los pedidos a habitación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {productosRegistrados > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{productosRegistrados} {productosRegistrados === 1 ? 'producto guardado' : 'productos guardados'}</span>
              </div>
            )}
            {categoriaInicial && (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
                <span>Categoría:</span>
                <strong className="text-ink">{categoriaInicial.name}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Formulario principal */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
          {/* Fila 0: Selección de Categoría (si hay varias disponibles) */}
          {categoriasDisponibles.length > 0 && (
            <div>
              <label htmlFor={catSelectId} className="mb-1.5 block text-sm font-medium text-ink">
                Categoría del menú asignada
              </label>
              <select
                id={catSelectId}
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-sm text-ink shadow-xs outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {categoriasDisponibles.map((cat) => (
                  <option key={`${cat.name}-${cat.order}`} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fila 1: Nombre y Precio */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nombre del producto o platillo"
              placeholder="Ej. Bowl de Quiona y Aguacate"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(undefined)
              }}
              error={nameError}
              required
              icon=""
            />

            <Input
              label="Precio de venta (COP / USD)"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej. 14.50"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
                if (priceError) setPriceError(undefined)
              }}
              error={priceError}
              required
              icon=""
            />
          </div>

          {/* Fila 2: Porcentaje de Impuesto y Tiempo de Preparación */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Porcentaje de impuesto (%)"
              type="number"
              step="0.01"
              min="0"
              placeholder="10.0"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(e.target.value)}
              icon=""
            />

            <Input
              label="Tiempo de preparación (minutos)"
              type="number"
              min="1"
              placeholder="15"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              icon=""
            />
          </div>

          {/* Fila 3: Horarios de Servicio ("Solo hora") */}
          <div className="rounded-2xl border border-line bg-canvas/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Ventana de Horario
                </span>
                <p className="text-xs text-ink-muted">
                  Horas del día en que cocina y bar despachan este producto.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Fecha de inicio (Solo hora)"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                icon=""
              />

              <Input
                label="Fecha final (Solo hora)"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                icon=""
              />
            </div>
          </div>

          {/* Fila 4: Switches interactivos (Es vegetariano, Es vegano, Disponible) */}
          <div className="space-y-3">
            <span className="block text-sm font-semibold text-ink">
              Preferencias dietéticas y estado en catálogo
            </span>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Switch
                label="¿Es vegetariano?"
                description="Apto para dietas sin carnes"
                checked={isVegetarian}
                onChange={setIsVegetarian}
              />

              <Switch
                label="¿Es vegano?"
                description="Libre de derivados animales"
                checked={isVegan}
                onChange={setIsVegan}
              />

              <Switch
                label="Disponible"
                description="Habilitado para pedidos hoy"
                checked={available}
                onChange={setAvailable}
              />
            </div>
          </div>

          {/* Fila 5: Descripción */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor={descId} className="block text-sm font-medium text-ink">
                Descripción comercial y notas de sabor
              </label>
              <span className="text-xs text-ink-muted">
                {description.length}/280 caracteres
              </span>
            </div>
            <textarea
              id={descId}
              rows={3}
              maxLength={280}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe los ingredientes principales, alérgenos o maridajes recomendados..."
              className="w-full rounded-2xl border border-line bg-panel p-3.5 text-xs text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none shadow-2xs"
            />
          </div>

          {/* Fila 6: Sección para seleccionar imagen o foto con Supabase Storage */}
          <SeccionCargaImagen
            imageFile={imagenArchivo}
            imagePreview={imagenPreview}
            onImageChange={handleImageChange}
          />

          {/* Banner de Feedback con psicología del usuario */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`rounded-2xl border p-4 text-xs shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  feedback.category === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : feedback.category === 'info'
                      ? 'border-sky-200 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200'
                      : feedback.category === 'warning'
                        ? 'border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                        : 'border-rose-200 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base shrink-0">
                    {feedback.category === 'success' && '✅'}
                    {feedback.category === 'info' && 'ℹ️'}
                    {feedback.category === 'warning' && '⚠️'}
                    {feedback.category === 'error' && '❌'}
                  </span>
                  <div>
                    <p className="font-semibold">
                      {feedback.message ||
                        (feedback.isValid
                          ? '¡Excelente! Producto registrado con éxito en la carta.'
                          : 'No se pudo procesar la solicitud. Por favor intenta nuevamente.')}
                    </p>
                    {feedback.isValid && (
                      <p className="text-[11px] opacity-80 mt-0.5">
                        El formulario está listo para que continúes registrando el siguiente producto.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {feedback.isValid && onCancelar && (
                    <button
                      type="button"
                      onClick={onCancelar}
                      className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-emerald-900/60 px-3 py-1.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-100 hover:bg-white transition-colors cursor-pointer"
                    >
                      Terminar y ver catálogo →
                    </button>
                  )}
                  <span className="font-mono text-[10px] font-bold">
                    HTTP {feedback.status}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-line">
            {onCancelar && (
              <button
                type="button"
                onClick={onCancelar}
                disabled={saving}
                className="w-full sm:w-auto rounded-2xl border border-line bg-canvas px-6 py-3 text-xs font-bold text-ink-muted transition-colors hover:bg-panel hover:text-ink cursor-pointer"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <span>{saving ? 'Guardando y registrando...' : 'Guardar y Registrar producto'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </>
  )
}
