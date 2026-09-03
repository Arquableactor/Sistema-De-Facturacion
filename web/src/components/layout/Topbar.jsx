import { useLayout } from './LayoutContext.js'

// Barra superior de cada sección: título + subtítulo + hueco para acción primaria.
// En MÓVIL (< lg) muestra la hamburguesa que abre el drawer de navegación; en desktop no
// aparece (la sidebar es fija). px lateral menor en móvil para no comerse el ancho.
export default function Topbar({ title, subtitle, action }) {
  const { openDrawer, drawerOpen } = useLayout()

  return (
    <header className="flex items-center gap-3 border-b border-edge bg-surface px-4 py-4 sm:px-6">
      <button
        type="button"
        onClick={openDrawer}
        aria-label="Abrir menú"
        aria-expanded={drawerOpen}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-btn text-muted transition-colors hover:bg-edge-soft hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
      >
        <MenuIcon />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-semibold text-brand-text">{title}</h1>
        {subtitle && <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
