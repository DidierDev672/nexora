import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Role } from '../../domain/role'
import { Button } from '../atoms/button'

export interface RoleItemProps {
  role: Role
  onEdit: (role: Role) => void
  onDelete: (id: string) => void
}

export function RoleItem({ role, onEdit, onDelete }: RoleItemProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className="overflow-hidden rounded-xl border border-neutral/20 bg-white/80 shadow-xs backdrop-blur-sm transition-colors hover:border-primary/25">
      <AnimatePresence mode="wait" initial={false}>
        {confirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3 bg-danger/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-primary">
              ¿Eliminar el rol <strong>{role.name}</strong>?
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
                Cancelar
              </Button>
              <Button type="button" variant="danger" onClick={() => onDelete(role.id)}>
                Eliminar
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start justify-between gap-4 px-4 py-3.5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate font-semibold text-primary">{role.name}</h4>
              </div>
              {role.description && (
                <p className="mt-1 text-sm leading-relaxed text-neutral">{role.description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                aria-label={`Editar rol ${role.name}`}
                onClick={() => onEdit(role)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-danger hover:bg-danger/10 hover:text-danger"
                aria-label={`Eliminar rol ${role.name}`}
                onClick={() => setConfirming(true)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                  <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}