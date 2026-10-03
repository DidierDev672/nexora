import {
  formatCurrencyCOP,
  translateModalityToSpanish,
  translateStatusToSpanish,
} from '../../domain/tarifa-lista';

export function TarifaModalityBadge({ modality }: { modality: string }) {
  const spanish = translateModalityToSpanish(modality);
  const isNight = modality.toLowerCase().includes('night');
  const isDay = modality.toLowerCase().includes('day');
  const isHour = modality.toLowerCase().includes('hour');

  const colorClass = isNight
    ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950/40 dark:text-indigo-300'
    : isDay
      ? 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300'
      : isHour
        ? 'bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-950/40 dark:text-cyan-300'
        : 'bg-stone-100 text-stone-700 ring-stone-500/20 dark:bg-stone-800 dark:text-stone-300';

  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${colorClass}`}
    >
      {spanish}
    </span>
  );
}

export function TarifaStatusBadge({ status }: { status: string }) {
  const spanish = translateStatusToSpanish(status);
  const isActive = status.toLowerCase() === 'active';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'bg-stone-100 text-stone-600 ring-stone-400/20 dark:bg-stone-800 dark:text-stone-400'
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isActive ? 'animate-pulse bg-emerald-500' : 'bg-stone-400'
        }`}
        aria-hidden="true"
      />
      <span>{spanish}</span>
    </span>
  );
}

export function TarifaPriceBadge({ price }: { price: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-ink text-sm font-extrabold tracking-tight dark:text-white">
        {formatCurrencyCOP(price)}
      </span>
    </div>
  );
}
