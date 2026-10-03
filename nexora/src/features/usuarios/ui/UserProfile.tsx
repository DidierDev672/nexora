import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { fadeIn, fadeUp } from '../../../design-tokens/motion'

export interface UserProfileData {
  name_full: string
  role: string
  id_number: string
  date_of_birth: string
  email: string
  phone: string
  headquarter: string
  joined_date: string
  status: string
}

/**
 * Función utilitaria para extraer las iniciales a partir del nombre completo.
 */
function getInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'U'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/**
 * Datos mock iniciales del usuario como respaldo
 */
const INITIAL_USER_MOCK: UserProfileData = {
  name_full: 'Lucía Morales Gómez',
  role: 'Administradora de Operaciones',
  id_number: 'CC 1.094.852.140',
  date_of_birth: '1994-08-15',
  email: 'lucia.morales@nexora.com',
  phone: '+57 312 456 7890',
  headquarter: 'Sede Poblado - Medellín',
  joined_date: 'Marzo de 2021',
  status: 'Activo',
}

/**
 * Obtiene la información del usuario desde el JSON `auth_user` almacenado en localStorage,
 * combinándolo de forma resiliente con los valores por defecto del mock.
 */
function getUserFromLocalStorage(): UserProfileData {
  if (typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_USER_MOCK
  }

  try {
    const raw = window.localStorage.getItem('auth_user')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return {
            ...INITIAL_USER_MOCK,
            ...parsed,
            name_full: String(parsed.name_full || parsed.name || parsed.full_name || parsed.nombre || INITIAL_USER_MOCK.name_full),
            role: String(parsed.role || parsed.rol || parsed.cargo || parsed.profile || INITIAL_USER_MOCK.role),
            id_number: String(parsed.id_number || parsed.document_number || parsed.identification || parsed.cedula || INITIAL_USER_MOCK.id_number),
            date_of_birth: String(parsed.date_of_birth || parsed.birth_date || parsed.fecha_nacimiento || INITIAL_USER_MOCK.date_of_birth),
            email: String(parsed.email || parsed.Email || parsed.correo || INITIAL_USER_MOCK.email),
            phone: String(parsed.phone || parsed.phone_number || parsed.telefono || parsed.celular || INITIAL_USER_MOCK.phone),
            headquarter: String(parsed.headquarter || parsed.sede || parsed.sede_nombre || INITIAL_USER_MOCK.headquarter),
            joined_date: String(parsed.joined_date || parsed.created_at || parsed.fecha_ingreso || INITIAL_USER_MOCK.joined_date),
            status: String(parsed.status || parsed.estado || INITIAL_USER_MOCK.status),
          }
        }
      } catch {
        if (typeof raw === 'string' && raw.trim()) {
          return {
            ...INITIAL_USER_MOCK,
            name_full: raw.trim(),
          }
        }
      }
    }
  } catch {
    // Si ocurre un error al acceder a localStorage
  }

  return INITIAL_USER_MOCK
}

/**
 * Componente principal de página: UserProfile
 * 
 * Cumple con las convenciones arquitectónicas y de diseño de agent.md
 */
export function UserProfile() {
  const [user, setUser] = useState<UserProfileData>(getUserFromLocalStorage)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UserProfileData>(getUserFromLocalStorage)
  const [savedAlert, setSavedAlert] = useState(false)

  // Sincronizar automáticamente si auth_user cambia externamente o en otra pestaña
  useEffect(() => {
    const handleSync = () => {
      const updated = getUserFromLocalStorage()
      setUser(updated)
      if (!isEditing) {
        setFormData(updated)
      }
    }

    window.addEventListener('storage', handleSync)
    window.addEventListener('nexora:auth-change', handleSync)

    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('nexora:auth-change', handleSync)
    }
  }, [isEditing])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    setUser(formData)

    // Persistir en localStorage bajo la clave 'auth_user'
    try {
      const currentRaw = window.localStorage.getItem('auth_user')
      let currentObj: Record<string, unknown> = {}
      if (currentRaw) {
        try {
          const parsed = JSON.parse(currentRaw) as unknown
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            currentObj = parsed as Record<string, unknown>
          }
        } catch {
          // ignore
        }
      }

      const updatedAuthUser = {
        ...currentObj,
        ...formData,
      }

      window.localStorage.setItem('auth_user', JSON.stringify(updatedAuthUser))
      // Disparar evento para que el avatar del navbar y otros componentes se actualicen al instante
      window.dispatchEvent(new Event('nexora:auth-change'))
    } catch {
      // En caso de que localStorage no esté accesible
    }

    setIsEditing(false)
    setSavedAlert(true)
    setTimeout(() => setSavedAlert(false), 3500)
  }

  const handleCancel = () => {
    setFormData(user)
    setIsEditing(false)
  }

  const handleStartEditing = () => {
    setFormData(user)
    setIsEditing(true)
  }

  return (
    <div className="min-h-screen bg-canvas p-4 sm:p-6 lg:p-8 font-sans text-ink transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 2. MENSAJE DE FEEDBACK (Regla 5 de agent.md) */}
        <AnimatePresence>
          {savedAlert && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="status"
              className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 shadow-sm"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <div className="space-y-0.5">
                <p className="font-semibold text-sm text-ink">
                  Guardamos los cambios en tu perfil
                </p>
                <p className="text-xs text-ink-muted">
                  Tu información personal y de contacto ya está actualizada en todo el sistema.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* 3. TARJETA PRINCIPAL DEL PERFIL (Reglas 2 & 4: fadeIn con motion) */}
        {/* ========================================================= */}
        <motion.section
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="relative bg-panel border border-line rounded-3xl shadow-sm overflow-hidden"
          aria-label="Información de perfil"
        >
          {/* 1. PORTADA / BANNER DECORATIVO */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }} className="relative h-44 sm:h-52 md:h-60 w-full bg-linear-to-r from-primary via-secondary to-primary/80 overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -top-24 -right-24 size-72 rounded-full bg-cream/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-16 bg-linear-to-t from-black/35 to-transparent pointer-events-none" />

            {/* Badge de sede / ubicación */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-panel/20 backdrop-blur-md text-cream border border-cream/25 shadow-xs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {user.headquarter}
              </span>
            </div>
          </motion.div>

          {/* 2. CABECERA: AVATAR SUPERPUESTO, IDENTIDAD Y ACCIONES */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
              
              {/* Avatar circular con iniciales superpuesto al banner con efecto fade in */}
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative group"
              >
                <div className="size-28 sm:size-36 rounded-full ring-4 ring-panel bg-linear-to-br from-primary to-secondary text-cream flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-xl select-none">
                  {getInitials(isEditing ? formData.name_full : user.name_full)}
                </div>

                <div 
                  className="absolute bottom-1 right-2 size-5 sm:size-6 rounded-full bg-emerald-500 ring-4 ring-panel shadow-md flex items-center justify-center"
                  title={`Estado: ${user.status}`}
                >
                  <span className="size-2 rounded-full bg-white animate-pulse" />
                </div>
              </motion.div>

              {/* Botones de acción principales */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-line bg-panel text-ink text-sm font-semibold hover:bg-cream/40 transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-secondary text-cream text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Guardar Cambios
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-secondary text-cream text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>

            {/* 3. IDENTIDAD: NOMBRE Y ROL */}
            <div className="space-y-3">
              <div>
                {isEditing ? (
                  <div className="space-y-1">
                    <label htmlFor="name_full" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Nombre Completo
                    </label>
                    <input
                      id="name_full"
                      name="name_full"
                      type="text"
                      value={formData.name_full}
                      onChange={handleInputChange}
                      placeholder="Ingresa tu nombre completo"
                      className="w-full max-w-lg px-4 py-2 text-xl font-bold rounded-xl border border-line bg-canvas focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-ink"
                    />
                  </div>
                ) : (
                  <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                    {user.name_full}
                  </h2>
                )}

                <div className="flex flex-wrap items-center gap-2.5 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    {user.role}
                  </span>
                  <span className="text-xs text-ink-soft">·</span>
                  <span className="text-xs text-ink-muted">
                    Miembro desde {user.joined_date}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 4. SECCIÓN: DATOS DE CONTACTO Y PERSONALES                */}
            {/* ========================================================= */}
            <div className="mt-8 pt-8 border-t border-line">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Datos de Contacto y Personales
                </h3>
                {isEditing && (
                  <span className="text-xs text-primary font-medium">
                    Modo edición activado
                  </span>
                )}
              </div>

              {/* Grid adaptable de información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                {/* Campo: Nombre Completo */}
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3, delay: 0.05, ease: 'easeOut' }}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-canvas border border-line shadow-2xs"
                >
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      Nombre Completo
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name_full"
                        value={formData.name_full}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-line bg-panel text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <span className="block text-sm sm:text-base font-semibold text-ink truncate mt-0.5">
                        {user.name_full}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Campo: Documento de Identidad */}
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-canvas border border-line shadow-2xs"
                >
                  <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      Documento de Identidad
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="id_number"
                        value={formData.id_number}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-line bg-panel text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <span className="block text-sm sm:text-base font-semibold text-ink truncate mt-0.5">
                        {user.id_number}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Campo: Fecha de Nacimiento */}
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3, delay: 0.15, ease: 'easeOut' }}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-canvas border border-line shadow-2xs"
                >
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      Fecha de Nacimiento
                    </span>
                    {isEditing ? (
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-line bg-panel text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <span className="block text-sm sm:text-base font-semibold text-ink truncate mt-0.5">
                        {user.date_of_birth}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Campo: Correo Electrónico */}
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-canvas border border-line shadow-2xs"
                >
                  <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      Correo Electrónico
                    </span>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-line bg-panel text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <span className="block text-sm sm:text-base font-semibold text-ink truncate mt-0.5">
                        {user.email}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Campo: Teléfono de Contacto */}
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3, delay: 0.25, ease: 'easeOut' }}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-canvas border border-line shadow-2xs md:col-span-2"
                >
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      Teléfono de Contacto
                    </span>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 w-full max-w-md px-3 py-1.5 text-sm font-semibold rounded-lg border border-line bg-panel text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    ) : (
                      <span className="block text-sm sm:text-base font-semibold text-ink truncate mt-0.5">
                        {user.phone}
                      </span>
                    )}
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </motion.section>

        {/* PIE DE PÁGINA INFORMATIVO */}
        <footer className="flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted px-4 gap-2 pt-2">
          <span>Nexora Hotel Management System · Módulo de Perfil de Usuario</span>
        </footer>

      </div>
    </div>
  )
}

export default UserProfile
