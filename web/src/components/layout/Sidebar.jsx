import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import BrandMark from '../ui/BrandMark.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import AboutModal from './AboutModal.jsx'
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
  IconSettings,
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
  { to: '/configuracion', label: 'Configuración', Icon: IconSettings, action: 'config.manage' },
]

// `onClose`/`onNavigate` (opcionales) = modo DRAWER (móvil): el header muestra ✕ en vez del
// toggle de colapso, y navegar cierra el drawer. Sin ellos = sidebar fija de desktop, igual
// que siempre.
export default function Sidebar({ collapsed, onToggle, onClose, onNavigate }) {
  const { user, logout, can } = useAuth()
  const navigate = useNavigate()
  const [aboutOpen, setAboutOpen] = useState(false)
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
        {onClose ? (
          // DRAWER (móvil): marca + botón cerrar. No hay colapso aquí.
          <div className="flex items-center gap-3 px-2">
            <BrandMark size={36} />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate font-display text-sm font-semibold text-white">
                APE Multiservicios
              </span>
              <span className="block truncate text-xs text-white/55">Energía Solar</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <CloseIcon />
            </button>
          </div>
        ) : (
          // DESKTOP: el botón de marca alterna colapso (como hoy).
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
        )}
      </div>

      {/* Navegación. min-h-0 + overflow-y-auto: en pantallas móviles cortas el drawer scrollea
          la lista en vez de cortar el pie (usuario/tema/logout). */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {nav.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            title={collapsed ? label : undefined}
            onClick={() => onNavigate?.()}
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
              onClick={() => setAboutOpen(true)}
              title="Acerca de"
              className="grid h-10 w-full place-items-center rounded-btn text-white/55 hover:bg-white/10 hover:text-white"
            >
              <InfoIcon />
            </button>
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
            {/* Aviso de licencia, discreto (no intrusivo, no "acepta para continuar"). */}
            <button
              onClick={() => setAboutOpen(true)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 text-[11px] font-medium text-white/45 transition-colors hover:text-white/75"
            >
              <InfoIcon width={13} height={13} />
              Acerca de
            </button>
          </div>
        )}
      </div>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </aside>
  )
}

function InfoIcon({ width = 18, height = 18 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
