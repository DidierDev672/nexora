import { motion } from 'motion/react'
import { slideIn, fadeIn } from '../../../../design-tokens/motion'
import { FormularioAgregarProductoCard } from '../organisms/FormularioAgregarProductoCard'
import type { MenuCategoria } from '../../domain/menu-categoria'

export interface AgregarProductoPageProps {
  categoriaInicial?: MenuCategoria | null
  categoriasDisponibles?: MenuCategoria[]
  onVolverAlCatalogo: () => void
}

/**
 * Vista de alta de nuevo producto gastronómico o ítem de room service.
 * Cumple con las directrices de src/agent.md:
 * - Header con animación slideIn y copywriting psicológico centrado en beneficios.
 * - Formulario dentro de una Card estilizada con animación fadeIn.
 * - Navegación fluida de retorno al catálogo.
 */
export function AgregarProductoPage({
  categoriaInicial,
  categoriasDisponibles = [],
  onVolverAlCatalogo,
}: AgregarProductoPageProps) {
  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header con animación slideIn y Copywriting Psicológico */}
      <motion.header
        variants={slideIn}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl border border-line bg-panel px-6 py-8 shadow-xs sm:px-10 sm:py-9"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none"
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Gastronomía · Alta de Ítems
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight font-serif">
              Nuevo Producto de Carta
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-muted">
              Aquí puedes catalogar nuevos platillos, cocteles o amenidades culinarias con precios, impuestos, horarios y preferencias dietéticas para pedidos desde la habitación.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onVolverAlCatalogo}
              className="inline-flex items-center gap-2 rounded-2xl border border-line bg-canvas px-4 py-2.5 text-xs font-bold text-ink-muted transition-all hover:bg-panel hover:text-ink hover:border-primary/40 active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>← Volver al catálogo</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* 2. Card Principal con el Formulario */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl"
      >
        <FormularioAgregarProductoCard
          categoriaInicial={categoriaInicial}
          categoriasDisponibles={categoriasDisponibles}
          onProductoGuardado={() => {
            // Se mantiene en la página para seguir registrando información
          }}
          onCancelar={onVolverAlCatalogo}
        />
      </motion.div>
    </div>
  )
}
