import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const THEME_STORAGE_KEY = 'nexora-theme'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Detecta la preferencia inicial del usuario:
 * 1. Lee de localStorage si existe un valor guardado.
 * 2. Si no hay valor previo, evalúa el esquema de color del sistema operativo (window.matchMedia).
 */
export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') {
      return stored
    }
  } catch {
    // Si localStorage no está disponible (ej. modo incógnito restringido)
  }

  // Detección basada en el sistema operativo mediante window.matchMedia
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

/**
 * Aplica los estilos usando el atributo data-theme="dark"|"light" en la etiqueta html y body,
 * además de sincronizar la clase .dark para compatibilidad integral con utilidades y variables CSS.
 */
export function applyThemeToDOM(theme: Theme): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const body = document.body

  // 1. Establecer el atributo data-theme en html y body (Instrucción 4)
  root.setAttribute('data-theme', theme)
  if (body) {
    body.setAttribute('data-theme', theme)
  }

  // 2. Establecer la clase 'dark' para máxima compatibilidad con Tailwind y variables
  const isDark = theme === 'dark'
  root.classList.toggle('dark', isDark)
  if (body) {
    body.classList.toggle('dark', isDark)
  }
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

/**
 * Proveedor de Contexto con la API de React Context para gestionar el estado del tema
 */
export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => defaultTheme || getInitialTheme())

  // Aplicar tema en el DOM y persistir en localStorage al cambiar de tema
  useEffect(() => {
    applyThemeToDOM(theme)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Ignorar si localStorage está restringido
    }
  }, [theme])

  // Detectar dinámicamente si el usuario cambia el tema del sistema operativo
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
        // Solo adaptar automáticamente si el usuario no tiene preferencia manual guardada
        if (!stored) {
          setThemeState(e.matches ? 'dark' : 'light')
        }
      } catch {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Hook personalizado (useTheme) para acceder y controlar el tema (light o dark).
 * Incluye un fallback autónomo si se invoca fuera del ThemeProvider.
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    const currentTheme: Theme =
      typeof document !== 'undefined' &&
      (document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.documentElement.classList.contains('dark'))
        ? 'dark'
        : 'light'

    return {
      theme: currentTheme,
      isDark: currentTheme === 'dark',
      toggleTheme: () => {
        const next = currentTheme === 'dark' ? 'light' : 'dark'
        applyThemeToDOM(next)
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, next)
        } catch {}
      },
      setTheme: (t: Theme) => {
        applyThemeToDOM(t)
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, t)
        } catch {}
      },
    }
  }
  return context
}
