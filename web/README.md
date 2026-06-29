# APE — Frontend web

Panel de Facturación & Garantías (React + Vite + Tailwind, JavaScript).

## Requisitos
- Node 18+ (probado con Node 20).
- El backend corriendo en `http://localhost:5266`
  (`docker start arqua-postgres` + `ASPNETCORE_ENVIRONMENT=Development dotnet run`
  desde `backend/ArquaBilling.Api/`).

## Levantar en desarrollo
```bash
cd web
npm install
npm run dev          # http://localhost:5173
```

## Configuración
- La URL del backend se toma de `VITE_API_URL` (ver `.env.example`).
  Cópiala a `.env` si necesitas cambiarla:
  ```bash
  cp .env.example .env
  ```
  Si no hay `.env`, Vite usa `http://localhost:5266` por defecto.
- **Sin CORS**: el cliente usa rutas relativas (`/api/...`) y el dev server de
  Vite las **proxea** a `VITE_API_URL` (ver `vite.config.js`). El backend no se toca.

## Credenciales de prueba (seed de Development)
`admin@arqua.local` / `Admin123*`

## Estructura
```
src/
  api/        client.js (fetch + Bearer + manejo 401), authApi.js
  auth/       AuthContext.jsx (token en localStorage), ProtectedRoute.jsx
  components/  layout/ (AppLayout, Sidebar, Topbar)  ui/ (Button, Field, ...)
  pages/      LoginPage (funcional), DashboardPage, PlaceholderPage
  lib/        format.js (RD$ / DD/MM/AAAA)
```
