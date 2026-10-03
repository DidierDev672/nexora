/**
 * Re-exporta el hook useTheme y utilidades del contexto de tema compartido
 * para su consumo dentro del módulo de dashboard y otras características.
 */
export {
  useTheme,
  ThemeProvider,
  getInitialTheme,
  applyThemeToDOM,
  THEME_STORAGE_KEY,
  type Theme,
  type ThemeContextType,
  type ThemeProviderProps,
} from '../../../shared/theme/theme-context'
