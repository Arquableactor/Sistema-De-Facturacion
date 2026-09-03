import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import { LayoutContext } from './LayoutContext.js'

// Cáscara de la app.
// - DESKTOP (>= lg): sidebar FIJA en el flujo, expandible/colapsable con el botón de marca.
//   Idéntica a como estaba: el estado `collapsed` la gobierna igual que antes.
// - MÓVIL (< lg): la sidebar NO ocupa espacio fijo (se oculta con lg:hidden / lg:flex). El
//   contenido usa todo el ancho. Entra como DRAWER sobre el contenido al tocar la hamburguesa
//   del Topbar; se cierra por backdrop, ✕, navegar o Esc; atrapa el foco y lo devuelve.
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef(null)
  const lastFocus = useRef(null) // a quién devolver el foco al cerrar (la hamburguesa)

  // El colapso auto por ancho solo aplica a la sidebar de DESKTOP (bajo lg ni se renderiza).
  useEffect(() => {
    function onResize() {
      setCollapsed(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) setDrawerOpen(false) // al pasar a desktop, cierra el drawer
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function openDrawer() {
    lastFocus.current = document.activeElement
    setDrawerOpen(true)
  }
  function closeDrawer() {
    setDrawerOpen(false)
    // Devuelve el foco a quien abrió (la hamburguesa), por accesibilidad de teclado.
    if (lastFocus.current && typeof lastFocus.current.focus === 'function') lastFocus.current.focus()
  }

  // Mientras el drawer está abierto: Esc cierra, y el foco queda ATRAPADO dentro (Tab cicla).
  useEffect(() => {
    if (!drawerOpen) return
    const panel = drawerRef.current
    const focusables = () =>
      [...panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((el) => el.offsetParent !== null)

    focusables()[0]?.focus() // foco al primer elemento del drawer

    function onKey(e) {
      if (e.key === 'Escape') {
        closeDrawer()
        return
      }
      if (e.key !== 'Tab') return
      const els = focusables()
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen])

  return (
    <LayoutContext.Provider value={{ drawerOpen, openDrawer }}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar de DESKTOP: fija en el flujo, solo >= lg. Sin cambios de comportamiento. */}
        <div className="hidden lg:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>

        <main className="flex-1 overflow-y-auto bg-appbg">
          <Outlet />
        </main>

        {/* DRAWER móvil (< lg). Backdrop + panel deslizante con la sidebar completa. */}
        <div className="lg:hidden" aria-hidden={!drawerOpen}>
          <div
            className={`fixed inset-0 z-40 bg-scrim/50 transition-opacity duration-200 ${
              drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            onClick={closeDrawer}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 ${
              drawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* collapsed=false: en el drawer siempre expandida (hay ancho para el panel). */}
            <Sidebar collapsed={false} onClose={closeDrawer} onNavigate={closeDrawer} />
          </div>
        </div>
      </div>
    </LayoutContext.Provider>
  )
}
