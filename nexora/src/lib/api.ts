import axios from 'axios'
import { getRawJwtToken } from '../shared/auth-storage'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
  }
}

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_REST as string | undefined) || 'http://localhost:8080',
})

// Interceptor global para inyectar automáticamente el token JWT de localStorage en todas las peticiones
api.interceptors.request.use((config) => {
  if (config.skipAuth) {
    return config
  }
  const token = getRawJwtToken()
  if (token) {
    if (config.headers && typeof (config.headers as unknown as { set?: unknown }).set === 'function') {
      const h = config.headers as unknown as {
        has: (key: string) => boolean
        set: (key: string, value: string) => void
      }
      if (!h.has('Authorization') && !h.has('authorization')) {
        h.set('Authorization', `Bearer ${token}`)
      }
      if (!h.has('auth-token')) {
        h.set('auth-token', token)
      }
    } else {
      config.headers = config.headers || {}
      if (!config.headers.Authorization && !config.headers.authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }
      if (!config.headers['auth-token']) {
        config.headers['auth-token'] = token
      }
    }
  }
  return config
})