import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { fadeUp, fadeIn } from '../../../../design-tokens/motion'

export interface SeccionCargaImagenProps {
  imageFile: File | null
  imagePreview: string | null
  onImageChange: (file: File | null, previewUrl: string | null) => void
  error?: string | null
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(2)} MB`
}

export function SeccionCargaImagen({
  imageFile,
  imagePreview,
  onImageChange,
  error,
}: SeccionCargaImagenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleFiles = (files: FileList | null) => {
    setLocalError(null)
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      setLocalError('El archivo seleccionado no es una imagen válida. Por favor elige una foto (JPG, PNG, WebP o AVIF).')
      return
    }

    // Límite de 15 MB
    if (file.size > 15 * 1024 * 1024) {
      setLocalError('La imagen seleccionada supera los 15 MB. Por favor elige una imagen de menor peso.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    onImageChange(file, previewUrl)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleQuitar = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageChange(null, null)
    setLocalError(null)
  }

  const abrirSelector = () => {
    fileInputRef.current?.click()
  }

  const activeError = error || localError

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-sm font-medium text-ink">
          Fotografía o imagen del servicio
          <span className="ml-1 text-xs font-normal text-ink-muted">
            (Para mostrar en tablets y cartas digitales)
          </span>
        </label>
      </div>

      {/* Input nativo oculto compatible con explorador de archivos en desktop y cámara/galería en móvil */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Seleccionar imagen o tomar foto desde el dispositivo"
      />

      <AnimatePresence mode="wait">
        {!imagePreview ? (
          // Zona interactiva de arrastre / selección
          <motion.div
            key="dropzone"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={abrirSelector}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                abrirSelector()
              }
            }}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : activeError
                  ? 'border-rose-400 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20'
                  : 'border-line bg-canvas/60 hover:border-primary/60 hover:bg-canvas'
            }`}
          >
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs transition-transform group-hover:scale-110">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-7"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                />
              </svg>
            </div>

            <p className="text-sm font-semibold text-ink">
              Haz clic o arrastra una fotografía aquí
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              En móviles puedes <strong>tomar una foto</strong> o elegir de tu galería; en computador selecciona cualquier archivo.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-ink-soft">
              <span className="rounded bg-black/5 dark:bg-white/5 px-2 py-0.5">JPG, PNG, WebP, AVIF</span>
              <span>•</span>
              <span>Hasta 15 MB</span>
            </div>
          </motion.div>
        ) : (
          // Vista previa interactiva con detalles de la imagen
          <motion.div
            key="preview"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex flex-col gap-4 rounded-2xl border border-line bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line shadow-xs">
                <img
                  src={imagePreview}
                  alt={imageFile?.name || 'Vista previa del servicio'}
                  className="size-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Imagen lista
                  </span>
                  <span className="text-xs font-mono text-ink-muted">
                    {imageFile ? formatBytes(imageFile.size) : ''}
                  </span>
                </div>
                <p className="max-w-xs truncate text-xs font-semibold text-ink" title={imageFile?.name}>
                  {imageFile?.name || 'imagen_servicio.jpg'}
                </p>
                <p className="text-[11px] text-ink-muted">
                  Capturada desde tu dispositivo ({imageFile?.type || 'image/jpeg'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={abrirSelector}
                className="rounded-xl border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs hover:bg-canvas transition-colors cursor-pointer"
              >
                Cambiar foto
              </button>
              <button
                type="button"
                onClick={handleQuitar}
                className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje de error de validación */}
      <AnimatePresence>
        {activeError && (
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="alert"
            className="text-xs font-medium text-danger"
          >
            {activeError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
