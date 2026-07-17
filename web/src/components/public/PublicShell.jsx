import ThemeToggle from '../ui/ThemeToggle.jsx'

// Cáscara de las páginas PÚBLICAS de APE (sin login, sin sidebar): la solicitud de
// captación hoy, la landing después. Registro "marketing": más aire y branding
// prominente, al contrario de la app interna, que es densa.
//
// Fija el lienzo (fondo navy de marca, ancho de lectura, footer y el toggle de tema)
// para que cada página pública solo escriba su contenido y todas se sientan la misma
// familia. Móvil-primero: el link se comparte por WhatsApp.
// Anchos por registro de contenido, móvil-primero:
//  - 'md'   : contenido corto y centrado (el certificado de /verificar).
//  - 'wide' : formulario/landing. Crece por tramos en vez de saltar de golpe, para que
//             en desktop no quede una columna flaca perdida entre vacío.
const WIDTHS = {
  md: 'max-w-md',
  wide: 'max-w-md sm:max-w-2xl lg:max-w-5xl',
}

export default function PublicShell({ children, width = 'md', footer }) {
  const max = WIDTHS[width] ?? WIDTHS.md

  return (
    <div className="relative min-h-screen bg-brand-gradient">
      {/* Fuera del layout interno no hay sidebar, así que el toggle vive aquí. */}
      <div className="absolute right-3 top-3 z-10">
        <ThemeToggle variant="onBrand" />
      </div>

      {/* pt-14 deja sitio al toggle: con menos, se montaba encima del hero. */}
      <div className={`mx-auto w-full ${max} px-4 pb-10 pt-14 sm:pt-16`}>
        {children}

        <p className="mt-6 text-center text-xs text-white/55">
          {footer ?? 'APE Multiservicios SRL · Energía Solar'}
        </p>
      </div>
    </div>
  )
}
