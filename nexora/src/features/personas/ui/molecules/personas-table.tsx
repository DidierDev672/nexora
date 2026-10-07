import { useState } from 'react'
import { motion, type Variants } from 'motion/react'
import {
  formatDocumentType,
  formatBirthDate,
  getPersonInitials,
  type PersonListItem,
} from '../../domain/persona-list'
import { PersonGenderBadge } from '../atoms/person-gender-badge'
import { PersonRoleBadge } from '../atoms/person-role-badge'
import { PersonaCard } from './persona-card'

export interface PersonasTableProps {
  persons: PersonListItem[]
  variants?: Variants
  onInspectRole?: (roleId: string) => void
}

/**
 * Tabla interactiva y adaptativa para el Directorio de Personas.
 *
 * Características de diseño responsivo:
 * - Pantallas móviles (< md): Se transforma automáticamente en vista de tarjetas (Cards)
 *   para garantizar una experiencia táctil y fluida sin desbordamientos horizontales.
 * - Pantallas medianas y grandes (>= md): Visualización tabular con columnas completas
 *   (Persona, Documento, Nacimiento & Género, Contacto, Roles).
 * - En ambas modalidades, el clic en el rol abre el modal interactivo de detalle (/roles/{id}).
 */
export function PersonasTable({ persons, variants, onInspectRole }: PersonasTableProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = (text: string, key: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <>
      {/* 1. Vista adaptativa en Cards para pantallas móviles (< md) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {persons.map((person) => (
          <PersonaCard
            key={`mobile-table-card-${person.id}`}
            person={person}
            variants={variants}
            onInspectRole={onInspectRole}
          />
        ))}
      </div>

      {/* 2. Vista en Tabla estructurada para pantallas medianas y grandes (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-line bg-panel shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink border-collapse">
          {/* Encabezado de la tabla */}
          <thead>
            <tr className="border-b border-line bg-canvas/80 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th scope="col" className="px-5 py-3.5">
                Persona
              </th>
              <th scope="col" className="px-4 py-3.5">
                Documento
              </th>
              <th scope="col" className="px-4 py-3.5">
                Nacimiento & Género
              </th>
              <th scope="col" className="px-4 py-3.5">
                Contacto (Teléfono / Email)
              </th>
              <th scope="col" className="px-5 py-3.5">
                Roles
              </th>
            </tr>
          </thead>

          {/* Cuerpo de la tabla */}
          <tbody className="divide-y divide-line/70">
            {persons.map((person) => {
              const initials = getPersonInitials(person.name)
              const docTypeLabel = formatDocumentType(person.document_type)
              const birthInfo = formatBirthDate(person.date_of_birth)

              return (
                <motion.tr
                  key={person.id}
                  layout
                  variants={variants}
                  className="group hover:bg-canvas/50 transition-colors duration-150"
                >
                  {/* 1. Nombre y Avatar */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 rounded-xl bg-linear-to-br from-primary to-secondary text-cream flex items-center justify-center text-xs font-bold shadow-2xs select-none">
                        {initials}
                        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-panel" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-ink group-hover:text-primary transition-colors">
                          {person.name}
                        </div>
                        <div className="text-xs text-ink-muted">
                          {person.nationality ?? 'Registrado'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Tipo y Número de Documento */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <span className="block text-[11px] font-medium text-ink-muted">
                        {docTypeLabel}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-ink">
                        <span>{person.document_number}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(person.document_number, `doc-${person.id}`)}
                          className="text-[10px] text-primary hover:underline cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                          title="Copiar documento"
                        >
                          {copiedKey === `doc-${person.id}` ? '✓' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* 3. Fecha de Nacimiento y Género */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-ink">
                        {birthInfo.formatted}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <PersonGenderBadge gender={person.gender} />
                        {birthInfo.ageText && (
                          <span className="text-[11px] text-ink-muted">
                            {birthInfo.ageText}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 4. Teléfono y Correo */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1 text-xs">
                      {/* Teléfono */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${person.phone_number}`}
                          className="flex items-center gap-1.5 font-medium text-ink hover:text-primary transition-colors"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3 text-primary shrink-0">
                            <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                          <span>{person.phone_number}</span>
                        </a>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${person.email}`}
                          className="flex items-center gap-1.5 font-medium text-ink-muted hover:text-primary transition-colors truncate max-w-[200px]"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3 text-secondary shrink-0">
                            <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                          <span className="truncate">{person.email}</span>
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* 5. Roles */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-1.5 max-w-[240px]">
                      {person.roles && person.roles.length > 0 ? (
                        person.roles.map((role) => (
                          <PersonRoleBadge
                            key={role}
                            role={role}
                            onClick={onInspectRole}
                          />
                        ))
                      ) : (
                        <span className="text-xs text-ink-muted italic">Sin roles</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
}
