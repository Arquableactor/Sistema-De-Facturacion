import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import BrandMark from '../ui/BrandMark.jsx'
import {
  IconDashboard,
  IconProjects,
  IconBilling,
  IconEquipment,
  IconWarranty,
  IconClients,
  IconLogout,
  IconChevron,
} from '../ui/icons.jsx'

const NAV = [
  { to: '/', label: 'Panel general', Icon: IconDashboard, end: true },
  { to: '/proyectos', label: 'Proyectos', Icon: IconProjects },
  { to: '/facturacion', label: 'Facturación', Icon: IconBilling },
  { to: '/equipos', label: 'Equipos', Icon: IconEquipment },
  { to: '/garantias', label: 'Garantías', Icon: IconWarranty },
  { to: '/clientes', label: 'Clientes', Icon: IconClients },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()

  return (
    <aside
      className="flex h-screen flex-col bg-brand-gradient text-white/90 transition-[width] duration-200"
      style={{ width: collapsed ? 76 : 248 }}
    >
      {/* Encabezado: isotipo + nombre + toggle */}
      <div className="flex items-center gap-3 px-4 py-5">
        <BrandMark size={collapsed ? 40 : 36} />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-sm font-semibold text-white">
              APE Multiservicios
            </div>
            <div className="truncate text-xs text-white/55">Energía Solar</div>
          </div>
        )}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expandir' : 'Colapsar'}
          className="ml-auto grid h-7 w-7 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
        >
          <IconChevron
            width={16}
            height={16}
            style={{ transform: collapsed ? 'none' : 'rotate(180deg)' }}
          />
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/[0.13] text-white'
                  : 'text-white/70 hover:bg-white/[0.07] hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-amber" />
                )}
                <Icon />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Pie: tarjeta de usuario + logout */}
      <div className="border-t border-white/10 p-3">
        {collapsed ? (
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="grid h-10 w-full place-items-center rounded-btn text-white/70 hover:bg-white/10 hover:text-white"
          >
            <IconLogout />
          </button>
        ) : (
          <div className="rounded-card bg-white/[0.06] p-3">
            <div className="mb-2 min-w-0">
              <div className="truncate text-sm font-medium text-white">
                {user?.email || 'Usuario'}
              </div>
              <div className="text-xs capitalize text-white/55">
                {user?.role ? String(user.role).toLowerCase() : '—'}
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-btn bg-white/10 py-2 text-sm font-medium text-white hover:bg-white/15"
            >
              <IconLogout width={16} height={16} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
