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

export interface PersonaCardProps {
  person: PersonListItem
  variants?: Variants
  onInspectRole?: (roleId: string) => void
}

export function PersonaCard({ person, variants, onInspectRole }: PersonaCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (text: string, fieldName: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const initials = getPersonInitials(person.name)
  const docTypeLabel = formatDocumentType(person.document_type)
  const birthInfo = formatBirthDate(person.date_of_birth)

  return (
    <motion.article
      layout
      variants={variants}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-panel p-5 shadow-xs transition-shadow duration-200 hover:shadow-md"
    >
      {/* 1. Cabecera de la tarjeta: Avatar, Nombre e Indicador */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar circular con iniciales estilizado con gradiente primario */}
            <div className="relative size-12 shrink-0 rounded-2xl bg-linear-to-br from-primary to-secondary text-cream flex items-center justify-center text-sm font-bold shadow-xs select-none">
              {initials}
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-panel" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-ink group-hover:text-primary transition-colors">
                {person.name}
              </h3>
              <p className="text-xs text-ink-muted truncate">
                {person.nationality ? `${person.nationality} · ` : ''}
                Registrado en sistema
              </p>
            </div>
          </div>

          {/* Badge de género */}
          <PersonGenderBadge gender={person.gender} />
        </div>

        {/* 2. Sección de Documento de Identidad */}
        <div className="rounded-xl border border-line/70 bg-canvas/60 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-primary">
                <path d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0z" />
              </svg>
              {docTypeLabel}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(person.document_number, 'doc')}
              className="text-[11px] text-primary hover:underline cursor-pointer font-semibold"
              title="Copiar número de documento"
            >
              {copiedField === 'doc' ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <div className="font-mono text-sm font-bold text-ink tracking-wide">
            {person.document_number}
          </div>
        </div>

        {/* 3. Datos de Nacimiento y Edad */}
        <div className="flex items-center justify-between text-xs py-1 px-1 border-b border-line/50">
          <span className="text-ink-muted flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-secondary">
              <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Fecha de nacimiento:
          </span>
          <span className="font-semibold text-ink">
            {birthInfo.formatted} {birthInfo.ageText && <span className="text-ink-muted font-normal">({birthInfo.ageText})</span>}
          </span>
        </div>

        {/* 4. Canales de Contacto: Teléfono y Correo */}
        <div className="space-y-2 pt-1 text-xs">
          {/* Teléfono */}
          <div className="flex items-center justify-between group/link">
            <a
              href={`tel:${person.phone_number}`}
              className="flex items-center gap-2 text-ink hover:text-primary transition-colors min-w-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-primary shrink-0">
                <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <span className="truncate font-medium">{person.phone_number}</span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy(person.phone_number, 'phone')}
              className="text-[11px] text-ink-muted hover:text-primary cursor-pointer"
              title="Copiar teléfono"
            >
              {copiedField === 'phone' ? '✓' : 'Copiar'}
            </button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between group/link">
            <a
              href={`mailto:${person.email}`}
              className="flex items-center gap-2 text-ink hover:text-primary transition-colors min-w-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-secondary shrink-0">
                <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span className="truncate font-medium">{person.email}</span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy(person.email, 'email')}
              className="text-[11px] text-ink-muted hover:text-primary cursor-pointer"
              title="Copiar correo"
            >
              {copiedField === 'email' ? '✓' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* 5. Roles asignados en plataforma */}
        {person.roles && person.roles.length > 0 && (
          <div className="pt-2.5 border-t border-line/60">
            <span className="block text-[11px] font-semibold text-ink-muted mb-1.5">
              Roles en la plataforma:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {person.roles.map((roleId) => (
                <PersonRoleBadge
                  key={roleId}
                  role={roleId}
                  onClick={onInspectRole}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.article>
  )
}
