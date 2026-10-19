import { useState } from 'react'
import {
  type ItemMenuProducto,
  formatearMonedaCOP,
  resolverImagenProducto,
} from '../../domain/item-menu'

export interface ItemMenuProductoCardProps {
  producto: ItemMenuProducto
  index?: number
  onVerDetalle?: (producto: ItemMenuProducto) => void
}

// Relaciones de aspecto variadas para generar el ritmo asimétrico tipo Pinterest / Masonry
const ASPECT_RATIOS = [
  'aspect-[4/5]',
  'aspect-[3/4]',
  'aspect-[1/1]',
  'aspect-[4/3]',
  'aspect-[16/11]',
]

const FALLBACK_FOOD_IMAGE =
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'

export function ItemMenuProductoCard({
  producto,
  index = 0,
  onVerDetalle,
}: ItemMenuProductoCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => resolverImagenProducto(producto))
  const [hasError, setHasError] = useState(false)

  const isVegetariano = Boolean(producto.isVegetarian ?? producto.is_vegetarian)
  const isVegano = Boolean(producto.isVegan ?? producto.is_vegan)
  const isDisponible = producto.available !== false

  // Asignar dinámicamente relación de aspecto según el índice para un Waterfall Layout orgánico
  const aspectClass = ASPECT_RATIOS[index % ASPECT_RATIOS.length]

  return (
    <article
      data-id={producto.id}
      data-category-id={producto.category_id}
      role="button"
      tabIndex={0}
      onClick={() => onVerDetalle?.(producto)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onVerDetalle?.(producto)
        }
      }}
      className={`group relative overflow-hidden rounded-3xl border border-line bg-panel shadow-xs transition-all duration-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer select-none ${aspectClass}`}
    >
      {/* 1. Visualización base: Exclusivamente la fotografía pública del producto */}
      <img
        src={hasError ? FALLBACK_FOOD_IMAGE : imgSrc}
        alt={producto.name}
        loading="lazy"
        onError={() => {
          setHasError(true)
          setImgSrc(FALLBACK_FOOD_IMAGE)
        }}
        className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Sombra sutil permanente en el borde inferior para resaltar el volumen de la tarjeta */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-0"
      />

      {/* 2. Efecto HOVER: Capa de información completa requerida con glassmorphism */}
      <div className="absolute inset-0 flex flex-col justify-between bg-linear-to-t from-black/95 via-black/75 to-black/30 p-5 text-white opacity-0 backdrop-blur-xs transition-all duration-300 ease-in-out group-hover:opacity-100">
        {/* Franja Superior del Hover: Estados, Horarios y Preferencias Dietéticas */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Disponibilidad */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md ${
              isDisponible
                ? 'border border-emerald-400/40 bg-emerald-500/25 text-emerald-200'
                : 'border border-rose-400/40 bg-rose-500/25 text-rose-200'
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isDisponible ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            {isDisponible ? 'Disponible' : 'Agotado'}
          </span>

          {/* Badges Dietéticos: Vegetariano / Vegano */}
          <div className="flex items-center gap-1.5">
            {isVegetariano && (
              <span
                title="Apto para vegetarianos"
                className="inline-flex items-center gap-1 rounded-full border border-green-400/30 bg-green-950/60 px-2 py-0.5 text-[10px] font-semibold text-green-300 backdrop-blur-md"
              >
                🌱 Vegetariano
              </span>
            )}
            {isVegano && (
              <span
                title="Apto para veganos"
                className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 backdrop-blur-md"
              >
                🌿 Vegano
              </span>
            )}
          </div>
        </div>

        {/* Franja Inferior del Hover: Datos del Platillo, Tiempos, Impuestos y Precio */}
        <div className="space-y-2.5">
          {/* Horarios disponibles */}
          {(producto.start_time || producto.end_time) && (
            <div className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md">
              <span>⏰ Horario:</span>
              <span className="font-semibold">
                {producto.start_time || '00:00'} - {producto.end_time || '23:59'}
              </span>
            </div>
          )}

          {/* Nombre comercial */}
          <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug text-white drop-shadow-sm">
            {producto.name}
          </h3>

          {/* Descripción de notas gastronómicas */}
          {producto.description && (
            <p className="line-clamp-3 text-xs leading-relaxed text-zinc-200">
              {producto.description}
            </p>
          )}

          {/* Fila de metadatos: Tiempo de preparación + Porcentaje de impuesto */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-300">
            {producto.prep_time !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5">
                ⏱️ {producto.prep_time} min
              </span>
            )}

            {producto.tax_percentage !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5">
                IVA {producto.tax_percentage}%
              </span>
            )}
          </div>

          {/* Precio formateado en Moneda Colombiana (COP) */}
          <div className="border-t border-white/15 pt-2.5 flex items-baseline justify-between">
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-300">
                Precio al huésped
              </span>
              <span className="text-[10px] text-white/70">
                Ver detalle completo ↗
              </span>
            </div>
            <span className="font-sans text-xl sm:text-2xl font-black tracking-tight text-emerald-300 drop-shadow-sm">
              {formatearMonedaCOP(producto.price)}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
