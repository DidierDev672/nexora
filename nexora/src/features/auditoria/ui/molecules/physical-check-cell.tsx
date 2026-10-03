import { useState } from 'react'
import type {
  PhysicalCheckRecord,
  PhysicalVerificationStatus,
} from '../../domain/audit-types'

export interface PhysicalCheckCellProps {
  roomId: string
  check?: PhysicalCheckRecord
  onChange: (roomId: string, check: PhysicalCheckRecord) => void
}

export function PhysicalCheckCell({ roomId, check, onChange }: PhysicalCheckCellProps) {
  const currentStatus: PhysicalVerificationStatus = check?.status || 'pendiente'
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [noteText, setNoteText] = useState(check?.notes || '')

  const handleStatusChange = (status: PhysicalVerificationStatus) => {
    onChange(roomId, {
      status,
      notes: noteText,
      verified_at: new Date().toISOString(),
    })
  }

  const handleSaveNotes = () => {
    onChange(roomId, {
      status: currentStatus,
      notes: noteText,
      verified_at: new Date().toISOString(),
    })
    setIsEditingNotes(false)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <select
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value as PhysicalVerificationStatus)}
          aria-label="Verificación física en campo de la habitación"
          className={`h-8 rounded-lg border px-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${
            currentStatus === 'coincide'
              ? 'border-emerald-300 bg-emerald-50/70 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : currentStatus === 'no_coincide'
                ? 'border-rose-300 bg-rose-50/70 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                : 'border-amber-300 bg-amber-50/70 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
          }`}
        >
          <option value="coincide">Coincide con sistema</option>
          <option value="no_coincide">No coincide (Discrepancia)</option>
          <option value="pendiente">Pendiente de revisión</option>
        </select>

        <button
          type="button"
          onClick={() => setIsEditingNotes((prev) => !prev)}
          className={`inline-flex items-center justify-center rounded-lg border p-1 text-xs transition-colors ${
            noteText
              ? 'border-primary/40 bg-primary/10 text-primary dark:border-primary/50'
              : 'border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-800'
          }`}
          title={noteText ? `Nota: "${noteText}" (clic para editar)` : 'Añadir nota de auditoría de campo'}
        >
          📝
        </button>
      </div>

      {/* Editor rápido de notas inline */}
      {isEditingNotes && (
        <div className="mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Observación en campo (ej. cama rota, llave falta)..."
            className="h-7 flex-1 rounded border border-stone-300 bg-white px-2 text-xs text-ink placeholder:text-stone-400 focus:border-primary focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleSaveNotes}
            className="rounded bg-primary px-2 py-1 text-[11px] font-semibold text-white hover:bg-primary-hover"
          >
            Guardar
          </button>
        </div>
      )}

      {noteText && !isEditingNotes && (
        <p className="text-[11px] text-stone-700 dark:text-stone-300 italic line-clamp-1">
          &ldquo;{noteText}&rdquo;
        </p>
      )}
    </div>
  )
}
