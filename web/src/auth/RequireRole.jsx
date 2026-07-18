import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

// Guarda una ruta según un permiso de la matriz. Asume que ya pasó por ProtectedRoute
// (hay sesión). Si el rol no puede, redirige al panel en vez de mostrar una página que
// fallaría con 403. El backend igual protege sus endpoints.
export default function RequireRole({ action, children }) {
  const { can } = useAuth()
  // /panel (no "/"): quien está autenticado y sin permiso vuelve a su panel interno,
  // no a la landing pública de marketing.
  if (!can(action)) return <Navigate to="/panel" replace />
  return children
}
