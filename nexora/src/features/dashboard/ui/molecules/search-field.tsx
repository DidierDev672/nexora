import { SearchIcon } from '../icons'

export interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Buscar en el panel…',
  className,
}: SearchFieldProps) {
  return (
    <label className={`relative block w-full text-ink-muted ${className ?? ''}`}>
      <span className="sr-only">Buscar en el panel</span>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-primary/40 focus:ring-2 focus:ring-primary/25"
      />
    </label>
  )
}