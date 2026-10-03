import { motion } from 'motion/react';

export type TarifaViewMode = 'table' | 'cards';

export interface TarifasViewModeToggleProps {
  viewMode: TarifaViewMode;
  onChange: (mode: TarifaViewMode) => void;
  className?: string;
}

/**
 * Menú de alternancia de visualización (Tablas / Cartas) basado estrictamente en figuras/iconos.
 * Cumple la regla de diseño: no contiene texto con las palabras "cartas" o "tablas".
 */
export function TarifasViewModeToggle({
  viewMode,
  onChange,
  className = '',
}: TarifasViewModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Selector de visualización"
      className={`inline-flex items-center rounded-2xl border border-stone-200/90 bg-stone-100/90 p-1 shadow-2xs backdrop-blur-xs dark:border-stone-800 dark:bg-stone-800/90 ${className}`}
    >
      {/* Botón de Modo Tabla (Filas / Tabular) - Solo icono / figura */}
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'table'}
        aria-label="Modo tabular"
        onClick={() => onChange('table')}
        className={`relative flex size-8 items-center justify-center rounded-xl transition-colors duration-150 focus:outline-hidden ${
          viewMode === 'table'
            ? 'text-primary'
            : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
        }`}
      >
        {viewMode === 'table' && (
          <motion.div
            layoutId="activeViewModeIndicator"
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="absolute inset-0 rounded-xl bg-white shadow-xs dark:bg-stone-700"
          />
        )}
        <span className="relative z-10" aria-hidden="true">
          {/* Figura estilizada representando filas/tabla */}
          <svg
            className="size-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
            <line x1="2.5" y1="8" x2="17.5" y2="8" />
            <line x1="2.5" y1="12.5" x2="17.5" y2="12.5" />
            <line x1="7.5" y1="8" x2="7.5" y2="16.5" />
          </svg>
        </span>
      </button>

      {/* Botón de Modo Cartas (Cuadrícula / Tarjetas) - Solo icono / figura */}
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'cards'}
        aria-label="Modo cuadrícula de tarjetas"
        onClick={() => onChange('cards')}
        className={`relative flex size-8 items-center justify-center rounded-xl transition-colors duration-150 focus:outline-hidden ${
          viewMode === 'cards'
            ? 'text-primary'
            : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
        }`}
      >
        {viewMode === 'cards' && (
          <motion.div
            layoutId="activeViewModeIndicator"
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="absolute inset-0 rounded-xl bg-white shadow-xs dark:bg-stone-700"
          />
        )}
        <span className="relative z-10" aria-hidden="true">
          {/* Figura estilizada representando cartas / tarjetas */}
          <svg
            className="size-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="5.8" height="5.8" rx="1.5" />
            <rect x="11.2" y="3" width="5.8" height="5.8" rx="1.5" />
            <rect x="3" y="11.2" width="5.8" height="5.8" rx="1.5" />
            <rect x="11.2" y="11.2" width="5.8" height="5.8" rx="1.5" />
          </svg>
        </span>
      </button>
    </div>
  );
}
