import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import ClientsPage from './pages/ClientsPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protegidas: requieren token */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="proyectos" element={<PlaceholderPage title="Proyectos" />} />
              <Route path="facturacion" element={<PlaceholderPage title="Facturación" />} />
              <Route path="equipos" element={<PlaceholderPage title="Equipos" />} />
              <Route path="garantias" element={<PlaceholderPage title="Garantías" />} />
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
