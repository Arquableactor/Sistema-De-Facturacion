import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
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
import PublicVerifyPage from './pages/PublicVerifyPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
          {/* Públicas (sin login) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verificar/:code" element={<PublicVerifyPage />} />

          {/* Protegidas: requieren token */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
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
            </Route>
          </Route>

            {/* Cualquier otra ruta -> al panel (o /login si no hay sesión) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
