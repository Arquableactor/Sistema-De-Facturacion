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

// `stickyBar`: contenido que se ancla al fondo SOLO en móvil/tablet. En desktop no hace
// falta porque ahí ya hay una columna lateral sticky. Vive en la cáscara y no en la
// página porque es un patrón de la cara pública (la landing querrá su CTA fija igual).
export default function PublicShell({ children, width = 'md', footer, stickyBar }) {
  const max = WIDTHS[width] ?? WIDTHS.md

  return (
    <div className="relative min-h-screen bg-brand-gradient">
      {/* Fuera del layout interno no hay sidebar, así que el toggle vive aquí. */}
      <div className="absolute right-3 top-3 z-10">
        <ThemeToggle variant="onBrand" />
      </div>

      {/* pt-14 deja sitio al toggle: con menos, se montaba encima del hero.
          El pb extra evita que la barra fija tape el final del contenido. */}
      <div
        className={`mx-auto w-full ${max} px-4 pt-14 sm:pt-16 ${
          stickyBar ? 'pb-32 lg:pb-10' : 'pb-10'
        }`}
      >
        {children}

        <p className="mt-6 text-center text-xs text-white/55">
          {footer ?? 'APE Multiservicios SRL · Energía Solar'}
        </p>
      </div>

      {stickyBar && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-brand-dark/95 backdrop-blur lg:hidden">
          {/* pb con safe-area: en iPhone la barra de gestos se comería el botón. */}
          <div
            className="mx-auto max-w-md px-4 pt-3"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
          >
            {stickyBar}
          </div>
        </div>
      )}
    </div>
  )
}
