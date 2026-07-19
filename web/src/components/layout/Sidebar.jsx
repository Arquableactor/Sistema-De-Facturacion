import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import BrandMark from '../ui/BrandMark.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import {
  IconDashboard,
  IconProjects,
  IconBilling,
  IconEquipment,
  IconWarranty,
  IconClients,
  IconInbox,
  IconCatalog,
  IconUsers,
  IconLogout,
  IconChevron,
} from '../ui/icons.jsx'

const NAV = [
  { to: '/panel', label: 'Panel general', Icon: IconDashboard, end: true },
  { to: '/proyectos', label: 'Proyectos', Icon: IconProjects },
  { to: '/facturacion', label: 'Facturación', Icon: IconBilling },
  { to: '/equipos', label: 'Equipos', Icon: IconEquipment },
  { to: '/garantias', label: 'Garantías', Icon: IconWarranty },
  { to: '/clientes', label: 'Clientes', Icon: IconClients },
  // Captación (Admin + Facturación) — junto a Clientes, que es a lo que llevan.
  { to: '/solicitudes', label: 'Solicitudes', Icon: IconInbox, action: 'solicitudes.manage' },
  // Los solo-Admin se filtran abajo según el permiso.
  { to: '/catalogo', label: 'Catálogo', Icon: IconCatalog, action: 'catalogo.manage' },
  { to: '/usuarios', label: 'Usuarios', Icon: IconUsers, action: 'users.manage' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, can } = useAuth()
  const navigate = useNavigate()
  const nav = NAV.filter((item) => !item.action || can(item.action))

  // Al cerrar sesión mandamos a la landing pública (no al login): es la puerta de
  // entrada del sitio y un destino más amable tras salir.
  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <aside
      className="flex h-screen flex-col bg-brand-gradient text-white/90 transition-[width] duration-200"
      style={{ width: collapsed ? 76 : 248 }}
    >
      {/* Encabezado de marca = el BOTÓN que alterna el sidebar, en AMBOS estados: un solo
          gesto aprendible. El chevron dejó de ser un botón aparte (en colapsado se cortaba
          contra el borde); en expandido es solo una pista visual dentro del botón, y en
          colapsado no se muestra. Como un logo clickeable no es obvio, va con cursor, hover
          y foco claros, aria-label/aria-expanded según estado y tooltip con la acción. */}
      <div className="px-3 py-5">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          className={`group flex w-full cursor-pointer items-center gap-3 rounded-btn px-2 py-2 text-left transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <BrandMark size={collapsed ? 40 : 36} />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate font-display text-sm font-semibold text-white">
                  APE Multiservicios
                </span>
                <span className="block truncate text-xs text-white/55">Energía Solar</span>
              </span>
              {/* Pista visual de que el encabezado contrae; decorativa (el botón ya se
                  anuncia por aria-label). Apunta a la izquierda = "contraer". */}
              <IconChevron
                width={16}
                height={16}
                aria-hidden="true"
                className="shrink-0 text-white/50 transition-colors group-hover:text-white/80"
                style={{ transform: 'rotate(180deg)' }}
              />
            </>
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
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
          <div className="space-y-1">
            <ThemeToggle variant="onBrand" compact />
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="grid h-10 w-full place-items-center rounded-btn text-white/70 hover:bg-white/10 hover:text-white"
            >
              <IconLogout />
            </button>
          </div>
        ) : (
          <div className="rounded-card bg-white/[0.06] p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">
                  {user?.email || 'Usuario'}
                </div>
                <div className="text-xs capitalize text-white/55">
                  {user?.role ? String(user.role).toLowerCase() : '—'}
                </div>
              </div>
              <ThemeToggle variant="onBrand" compact className="!h-8 !w-8 shrink-0" />
            </div>
            <button
              onClick={handleLogout}
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
