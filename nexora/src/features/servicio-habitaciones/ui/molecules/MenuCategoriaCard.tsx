import { useState } from 'react'
import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand } from '@fortawesome/free-solid-svg-icons'
import type { MenuCategoria } from '../../domain/menu-categoria'

interface MenuCategoriaCardProps {
  categoria: MenuCategoria
  index?: number
  onVerDetalle?: (categoria: MenuCategoria) => void
}

const FALLBACK_FOOD_IMG =
  'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=800'

export function MenuCategoriaCard({
  categoria,
  index = 0,
  onVerDetalle,
}: MenuCategoriaCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(categoria.asset || FALLBACK_FOOD_IMG)
  const [imgError, setImgError] = useState<boolean>(false)

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
      setImgSrc(FALLBACK_FOOD_IMG)
    }
  }

  // Alturas y relaciones de aspecto variables deterministas (Masonry / Pinterest)
  const ratioVariant = (categoria.order + index) % 3
  const aspectClass =
    ratioVariant === 0
      ? 'aspect-3/4' // Formato vertical estilizado
      : ratioVariant === 1
        ? 'aspect-4/3' // Formato clásico
        : 'aspect-square' // Formato cuadrado 1:1

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.015 }}
      onClick={() => onVerDetalle?.(categoria)}
      className={`group relative ${aspectClass} w-full overflow-hidden rounded-3xl border border-line/80 bg-panel shadow-xs transition-all duration-300 hover:shadow-2xl hover:border-primary/60 cursor-pointer select-none`}
    >
      {/* 1. VISTA EN REPOSO: SOLO LA FOTOGRAFÍA (Pura y en alta definición) */}
      <img
        src={imgSrc}
        alt={categoria.name}
        onError={handleImageError}
        loading="lazy"
        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
      />

      {/* Sombra sutil en los bordes para profundidad visual */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-black/10 pointer-events-none transition-opacity duration-300 group-hover:opacity-0"
      />

      {/* 2. CON EL EFECTO (HOVER / TOUCH): Solo se visualiza el botón con el icono para expandir el modal */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onVerDetalle?.(categoria)
          }}
          className="inline-flex items-center gap-2.5 rounded-2xl bg-white/95 px-5 py-3 text-xs font-bold text-ink shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-106 hover:bg-white active:scale-95 border border-white/50 cursor-pointer"
          title="Expandir y ver detalle del menú"
        >
          <FontAwesomeIcon icon={faExpand} className="size-3.5 text-primary" />
          <span>Ver detalle</span>
        </button>
      </div>
    </motion.article>
  )
}
