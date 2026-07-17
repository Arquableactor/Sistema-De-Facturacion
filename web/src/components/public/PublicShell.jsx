import ThemeToggle from '../ui/ThemeToggle.jsx'

// Cáscara de las páginas PÚBLICAS de APE (sin login, sin sidebar): la solicitud de
// captación hoy, la landing después. Registro "marketing": más aire y branding
// prominente, al contrario de la app interna, que es densa.
//
// Fija el lienzo (fondo navy de marca, ancho de lectura, footer y el toggle de tema)
// para que cada página pública solo escriba su contenido y todas se sientan la misma
// familia. Móvil-primero: el link se comparte por WhatsApp.
export default function PublicShell({ children, width = 'md', footer }) {
  const max = width === 'lg' ? 'max-w-2xl' : 'max-w-md'

  return (
    <div className="relative min-h-screen bg-brand-gradient">
      {/* Fuera del layout interno no hay sidebar, así que el toggle vive aquí. */}
      <div className="absolute right-3 top-3 z-10">
        <ThemeToggle variant="onBrand" />
      </div>

      <div className={`mx-auto w-full ${max} px-4 pb-10 pt-6 sm:pt-10`}>
        {children}

        <p className="mt-6 text-center text-xs text-white/55">
          {footer ?? 'APE Multiservicios SRL · Energía Solar'}
        </p>
      </div>
    </div>
  )
}
