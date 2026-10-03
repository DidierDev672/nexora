import axios from 'axios'

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_REST as string | undefined) || 'http://localhost:8080',
})