import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'

// Cáscara de la app: sidebar fija + área de contenido. La sidebar colapsa a iconos
// automáticamente bajo 1024px, y se puede colapsar/expandir manualmente.
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024)

  useEffect(() => {
    function onResize() {
      setCollapsed(window.innerWidth < 1024)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="flex-1 overflow-y-auto bg-appbg">
        <Outlet />
      </main>
    </div>
  )
}
