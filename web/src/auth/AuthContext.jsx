import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi.js'
import { getToken, getStoredUser, setSession, clearSession } from '../api/client.js'
import { can as canRole } from './permissions.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken())
  const [user, setUser] = useState(() => getStoredUser())
  // `loading` cubre la validación inicial del token contra /api/auth/me.
  const [loading, setLoading] = useState(() => !!getToken())

  useEffect(() => {
    let active = true
    if (!getToken()) {
      setLoading(false)
      return
    }
    // Si hay token guardado, lo validamos; si es inválido, cerramos sesión.
    authApi
      .me()
      .then((u) => {
        if (!active) return
        setUser({ email: u.email, role: u.role })
        setSession(getToken(), { email: u.email, role: u.role })
      })
      .catch(() => {
        if (!active) return
        clearSession()
        setToken(null)
        setUser(null)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  async function login(email, password) {
    const res = await authApi.login(email, password)
    const u = { email: res.email, role: res.role }
    setSession(res.token, u)
    setToken(res.token)
    setUser(u)
    return res
  }

  function logout() {
    clearSession()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role ?? null,
      loading,
      isAuthenticated: !!token,
      // ¿Puede el usuario actual ejecutar `action`? (según la matriz de permisos).
      can: (action) => canRole(user?.role, action),
      login,
      logout,
    }),
    [token, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
