import Topbar from '../components/layout/Topbar.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

export default function DashboardPage() {
  const { user } = useAuth()
  return (
    <>
      <Topbar
        title="Panel general"
        subtitle="Resumen del negocio"
      />
      <div className="p-6">
        <div className="rounded-card bg-surface p-6 shadow-card">
          <h2 className="font-display text-base font-semibold text-brand-text">
            Bienvenido{user?.email ? `, ${user.email}` : ''}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Los cimientos del panel están listos. Los módulos (proyectos, facturación,
            equipos, garantías, clientes) se irán habilitando en las próximas entregas.
          </p>
        </div>
      </div>
    </>
  )
}
