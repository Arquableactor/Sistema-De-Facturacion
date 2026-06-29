import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import BrandMark from '../components/ui/BrandMark.jsx'

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Si ya hay sesión, no mostramos el login.
  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      // Mensaje del backend ({ message }) — ej. "Credenciales inválidas".
      setError(err?.message || 'No se pudo iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-brand-gradient px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark size={56} />
          <h1 className="mt-4 font-display text-xl font-semibold text-white">
            APE Multiservicios
          </h1>
          <p className="text-sm text-white/60">Facturación &amp; Garantías · Energía Solar</p>
        </div>

        <div className="rounded-card bg-surface p-6 shadow-card">
          <h2 className="mb-1 font-display text-lg font-semibold text-brand-text">
            Iniciar sesión
          </h2>
          <p className="mb-5 text-sm text-muted">Accede con tu cuenta del sistema.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              id="email"
              label="Correo"
              type="email"
              autoComplete="username"
              placeholder="admin@arqua.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Field
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
                {error}
              </div>
            )}

            <Button type="submit" loading={submitting} className="w-full">
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-white/40">
          © {new Date().getFullYear()} APE Multiservicios
        </p>
      </div>
    </div>
  )
}
