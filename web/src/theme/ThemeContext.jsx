import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// Tema claro/oscuro. La preferencia explícita se guarda en localStorage; si no hay
// ninguna, se sigue la del sistema (prefers-color-scheme) y se mantiene sincronizada
// mientras el usuario no elija manualmente.
// El tema se aplica como clase `dark` en <html> (Tailwind darkMode: 'class'). El
// primer valor lo pinta un script inline en index.html para evitar el flash.

const ThemeContext = createContext(null)
export const THEME_KEY = 'ape_theme'

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function storedTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'dark' || v === 'light' ? v : null
  } catch {
    return null // localStorage bloqueado (modo privado): seguimos con el del sistema
  }
}

function apply(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => storedTheme() ?? systemTheme())

  useEffect(() => {
    apply(theme)
  }, [theme])

  // Sin preferencia guardada, seguimos al sistema si cambia (ej. modo noche automático).
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const onChange = (e) => {
      if (!storedTheme()) setTheme(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setAndStore = useCallback((next) => {
    setTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Si no se puede guardar, el tema igual aplica en esta sesión.
    }
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme: setAndStore,
      toggleTheme: () => setAndStore(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme, setAndStore],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}
