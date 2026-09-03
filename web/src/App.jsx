import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import RequireRole from './auth/RequireRole.jsx'
import LandingPage from './pages/LandingPage.jsx'
import { ThemeProvider } from './theme/ThemeContext.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import ClientsPage from './pages/ClientsPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import InvoicesPage from './pages/InvoicesPage.jsx'
import InvoiceFormPage from './pages/invoices/InvoiceFormPage.jsx'
import InvoiceDetailPage from './pages/InvoiceDetailPage.jsx'
import GarantiasPage from './pages/GarantiasPage.jsx'
import UsersPage from './pages/UsersPage.jsx'
import SolicitudesPage from './pages/SolicitudesPage.jsx'
import CatalogoPage from './pages/CatalogoPage.jsx'
import ConfiguracionPage from './pages/ConfiguracionPage.jsx'
import PublicVerifyPage from './pages/PublicVerifyPage.jsx'
import SolicitudPage from './pages/SolicitudPage.jsx'
import PrivacidadPage from './pages/PrivacidadPage.jsx'
import TerminosPage from './pages/TerminosPage.jsx'

// Redirección de URL desconocida según haya sesión o no.
function CatchAllRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/panel' : '/'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      {/* El tema envuelve todo: aplica también al login y a la página pública. */}
      <ThemeProvider>
        <AuthProvider>
        <ToastProvider>
          <Routes>
          {/* Públicas (sin login) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verificar/:code" element={<PublicVerifyPage />} />
          {/* Captación: el link que APE comparte por WhatsApp. */}
          <Route path="/solicitud" element={<SolicitudPage />} />
          {/* Legales públicas (standalone, como /verificar): texto placeholder. */}
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="/terminos" element={<TerminosPage />} />

          {/* Protegidas: requieren token */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* El panel dejó de ser "/" (ahora es la landing pública). */}
              <Route path="panel" element={<DashboardPage />} />
              <Route path="proyectos" element={<ProjectsPage />} />
              <Route path="proyectos/:id" element={<ProjectDetailPage />} />
              <Route path="facturacion" element={<InvoicesPage />} />
              <Route path="facturacion/nueva" element={<InvoiceFormPage />} />
              <Route path="facturacion/:id" element={<InvoiceDetailPage />} />
              {/* "Equipos" del sidebar = catálogo de productos por ahora; el inventario
                  de equipos instalados será otra pestaña en el futuro. */}
              <Route path="equipos" element={<ProductsPage />} />
              <Route path="garantias" element={<GarantiasPage />} />
              <Route path="clientes" element={<ClientsPage />} />
              {/* Captación interna: Admin + Facturación. */}
              <Route
                path="solicitudes"
                element={
                  <RequireRole action="solicitudes.manage">
                    <SolicitudesPage />
                  </RequireRole>
                }
              />
              {/* Solo-Admin: la guarda redirige al panel si el rol no puede. */}
              <Route
                path="catalogo"
                element={
                  <RequireRole action="catalogo.manage">
                    <CatalogoPage />
                  </RequireRole>
                }
              />
              <Route
                path="usuarios"
                element={
                  <RequireRole action="users.manage">
                    <UsersPage />
                  </RequireRole>
                }
              />
              {/* Configuración (secuencias NCF): solo Admin. */}
              <Route
                path="configuracion"
                element={
                  <RequireRole action="config.manage">
                    <ConfiguracionPage />
                  </RequireRole>
                }
              />
            </Route>
          </Route>

            {/* URL desconocida: un empleado logueado vuelve a su panel; un visitante,
                a la landing. (Si no hay token, /panel rebotaría a /login vía ProtectedRoute,
                así que lo mandamos directo a la landing.) */}
            <Route path="*" element={<CatchAllRedirect />} />
          </Routes>
        </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
