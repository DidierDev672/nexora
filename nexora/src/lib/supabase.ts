import { createClient } from '@supabase/supabase-js'

/**
 * URL de la instancia de Supabase (local o remota) leída desde .env.
 * Valor por defecto: http://127.0.0.1:54321
 */
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'http://127.0.0.1:54321'

/**
 * Clave de autenticación para Supabase.
 * Para operaciones de creación de buckets y administración de almacenamiento,
 * se prioriza VITE_SUPABASE_SERVICE_KEY (service_role) y se usa VITE_SUPABASE_ANON_KEY como respaldo.
 */
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_SERVICE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  ''

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export const SUPABASE_CONFIG = {
  url: supabaseUrl,
  hasServiceKey: Boolean(import.meta.env.VITE_SUPABASE_SERVICE_KEY),
} as const
