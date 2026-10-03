import { useEffect, useState } from 'react'
import { DashboardPage } from './features/dashboard/dashboard-page'
import { Login } from './features/login/ui/Login'
import { ThemeProvider } from './shared/theme/theme-context'
import {
  applyPaletteToDocument,
  clearPaletteFromDocument,
} from './features/tema/application/palette-theme'
import { useTemaStore } from './features/tema/application/tema-store'

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return Boolean(
        window.localStorage.getItem('auth_user') ||
        window.localStorage.getItem('nexora.auth.token') ||
        window.localStorage.getItem('auth_token')
      )
    }
    return false
  })

  const appliedPalette = useTemaStore((state) => state.appliedPalette)
  const previewPalette = useTemaStore((state) => state.previewPalette)

  useEffect(() => {
    const effective = previewPalette ?? appliedPalette
    if (effective) {
      applyPaletteToDocument(effective)
    } else {
      clearPaletteFromDocument()
    }
  }, [previewPalette, appliedPalette])

  // Escuchar evento global de cierre de sesión
  useEffect(() => {
    const handleAuthLogout = () => {
      setAuthenticated(false)
    }

    window.addEventListener('nexora:auth-logout', handleAuthLogout)
    return () => {
      window.removeEventListener('nexora:auth-logout', handleAuthLogout)
    }
  }, [])

  return (
    <ThemeProvider>
      {authenticated ? (
        <DashboardPage onLogout={() => setAuthenticated(false)} />
      ) : (
        <Login onContinue={() => setAuthenticated(true)} />
      )}
    </ThemeProvider>
  )
}