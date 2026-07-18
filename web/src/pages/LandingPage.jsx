import { Link } from 'react-router-dom'
import PublicShell from '../components/public/PublicShell.jsx'
import PublicHero from '../components/public/PublicHero.jsx'
import BrandMark from '../components/ui/BrandMark.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

// Landing PÚBLICA de APE: la puerta de entrada del sitio. Sin login. Reusa la cáscara
// pública (PublicShell + PublicHero), así que comparte fondo navy y hero con /solicitud
// y /verificar; las tarjetas de contenido van en bg-surface y SÍ cambian con el tema.
//
// DATOS DE CONTACTO: placeholders a propósito. APE es una empresa real y no inventamos
// teléfonos/correos. El usuario reemplaza estos {{...}} con los reales.
const CONTACTO = {
  telefono: '{{TELÉFONO_APE}}',
  whatsapp: '{{WHATSAPP}}',
  email: '{{EMAIL}}',
  direccion: '{{DIRECCIÓN}}',
  rnc: '{{RNC}}',
}

export default function LandingPage() {
  return (
    <PublicShell width="landing" topBar={<TopBar />} footer={<Footer />}>
      <Hero />
      <Servicios />
      <PorQueSolar />
      <ComoFunciona />
      <GarantiaVerificable />
      <CtaFinal />
    </PublicShell>
  )
}

// ---------------------------------------------------------------------------
// Barra superior
// ---------------------------------------------------------------------------
function TopBar() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-brand/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <BrandMark size={30} />
          <span className="font-display text-sm font-semibold text-white sm:text-base">
            APE Multiservicios
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Discreto: es para el personal de APE, no para clientes. Si ya hay sesión,
              lleva directo al panel en vez de pedir login otra vez. */}
          <Link
            to={isAuthenticated ? '/panel' : '/login'}
            className="rounded-btn px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {isAuthenticated ? 'Ir al panel' : 'Iniciar sesión'}
          </Link>
          <ThemeToggle variant="onBrand" compact className="!h-9 !w-9" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
function Hero() {
  return (
    <div className="mt-3 sm:mt-4">
      <PublicHero
        badge="Evaluación gratis, sin compromiso"
        title="Genera tu propia energía y reduce tu factura de luz"
        subtitle="Instalamos sistemas de energía solar para hogares y negocios en República Dominicana. Solicita tu evaluación gratis y da el primer paso hacia el ahorro."
        actions={
          <>
            <Link to="/solicitud" className={`${ctaPrimary} w-full sm:w-auto`}>
              Quiero ser cliente
              <ArrowIcon />
            </Link>
            <a href="#como-funciona" className={`${ctaSecondary} w-full sm:w-auto`}>
              Cómo funciona
            </a>
          </>
        }
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Qué hacemos
// ---------------------------------------------------------------------------
const SERVICIOS = [
  {
    Icon: IconHome,
    titulo: 'Instalación residencial',
    texto: 'Paneles solares para tu casa, dimensionados según tu consumo real.',
  },
  {
    Icon: IconBuilding,
    titulo: 'Instalación comercial',
    texto: 'Sistemas para negocios y empresas que quieren bajar sus costos de energía.',
  },
  {
    Icon: IconWrench,
    titulo: 'Mantenimiento',
    texto: 'Revisión y soporte para que tu sistema rinda al máximo por años.',
  },
  {
    Icon: IconShield,
    titulo: 'Garantía y soporte',
    texto: 'Cada instalación con certificado de garantía y acompañamiento.',
  },
]

function Servicios() {
  return (
    <Section id="servicios" eyebrow="Qué hacemos" titulo="Soluciones solares de principio a fin">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICIOS.map(({ Icon, titulo, texto }) => (
          <div
            key={titulo}
            className="rounded-card border border-edge bg-surface p-5 shadow-card transition-transform hover:-translate-y-0.5"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-soft text-amber-strong">
              <Icon />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-brand-text">{titulo}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{texto}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Por qué solar
// ---------------------------------------------------------------------------
const BENEFICIOS = [
  {
    Icon: IconSavings,
    titulo: 'Ahorra en tu factura',
    texto: 'Produce tu propia energía y reduce lo que pagas de luz cada mes.',
  },
  {
    Icon: IconBolt,
    titulo: 'Respaldo ante apagones',
    texto: 'Con opciones de baterías, mantén lo esencial encendido cuando falla la red.',
  },
  {
    Icon: IconLeaf,
    titulo: 'Energía limpia',
    texto: 'Aprovecha el sol del Caribe y reduce tu huella ambiental.',
  },
  {
    Icon: IconValue,
    titulo: 'Valoriza tu propiedad',
    texto: 'Una instalación solar suma valor a tu hogar o local.',
  },
]

function PorQueSolar() {
  // A propósito SIN tarjetas: contenido directo sobre el fondo, separado por espaciado y
  // no por caja, para romper la pila de cajas y dar ritmo. Acento VERDE (ahorro/energía
  // limpia), distinto del ámbar de Servicios: el color se usa con intención, no de adorno.
  return (
    <Section eyebrow="Por qué solar" titulo="El sol trabaja para ti">
      <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFICIOS.map(({ Icon, titulo, texto }) => (
          <div key={titulo}>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-soft text-green-strong">
              <Icon />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-brand-text">{titulo}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{texto}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Cómo funciona (refleja el sistema real)
// ---------------------------------------------------------------------------
const PASOS = [
  { n: 1, titulo: 'Solicita en línea', texto: 'Llena el formulario con tus equipos y datos. Toma 2 minutos.' },
  { n: 2, titulo: 'Te contactamos', texto: 'APE revisa tu solicitud y se comunica contigo para agendar.' },
  { n: 3, titulo: 'Visita técnica', texto: 'Evaluamos tu sitio y te damos una propuesta a tu medida.' },
  { n: 4, titulo: 'Instalación', texto: 'Montamos tu sistema y recibes tu certificado de garantía.' },
]

function ComoFunciona() {
  return (
    <Section
      id="como-funciona"
      eyebrow="Cómo funciona"
      titulo="De la solicitud a la instalación en 4 pasos"
    >
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PASOS.map((p, i) => (
          <li key={p.n} className="relative rounded-card border border-edge bg-surface p-5 shadow-card">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand font-display text-base font-bold text-white">
              {p.n}
            </span>
            {/* Conector entre pasos, solo en desktop. */}
            {i < PASOS.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute right-[-10px] top-10 hidden text-faint lg:block"
              >
                <ArrowIcon />
              </span>
            )}
            <h3 className="mt-4 font-display text-base font-semibold text-brand-text">{p.titulo}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.texto}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <Link to="/solicitud" className={ctaPrimary}>
          Empezar mi solicitud
          <ArrowIcon />
        </Link>
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Garantía verificable (diferenciador real; NO enlaza a /verificar sin código)
// ---------------------------------------------------------------------------
function GarantiaVerificable() {
  return (
    <Section eyebrow="Confianza" titulo="Garantía que puedes verificar">
      <div className="grid items-center gap-6 rounded-card border border-green/30 bg-surface p-6 shadow-card sm:p-8 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-sm leading-relaxed text-muted sm:text-base">
            Cada instalación recibe un{' '}
            <span className="font-semibold text-brand-text">certificado de garantía con código QR</span>.
            Escanéalo y verifica en línea, en cualquier momento, que tu garantía es auténtica y
            está vigente — sin llamadas ni papeleo.
          </p>
          <ul className="mt-4 space-y-2">
            {['Certificado por cada equipo instalado', 'Verificación en línea con QR', 'Cobertura y vigencia siempre a la vista'].map(
              (t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-muted">
                  <span className="text-green-strong">
                    <CheckIcon />
                  </span>
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="mx-auto">
          <QrDecor />
        </div>
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// CTA final
// ---------------------------------------------------------------------------
function CtaFinal() {
  // Banda navy deliberada (ancla de marca, blanca sobre navy en ambos temas): el clímax
  // de la página. Un sol propio en SVG + resplandor ámbar la separan de una caja genérica.
  return (
    <div className="relative mt-16 overflow-hidden rounded-card bg-brand-gradient p-8 text-center shadow-card ring-1 ring-inset ring-white/10 sm:mt-24 sm:p-14">
      {/* Resplandor solar, decorativo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber opacity-20 blur-3xl"
      />
      <div className="relative">
        <span
          aria-hidden="true"
          className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-amber/15 text-amber ring-1 ring-amber/30"
        >
          <SunGlyph />
        </span>
        <h2 className="mx-auto max-w-xl font-display text-2xl font-bold text-white sm:text-3xl">
          ¿Listo para que el sol pague tu factura?
        </h2>
        <p className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
          Solicita tu evaluación gratis hoy. Sin compromiso: un asesor de APE revisará tus datos y
          te contactará.
        </p>
        <Link to="/solicitud" className={`${ctaPrimary} mt-7`}>
          Quiero ser cliente
          <ArrowIcon />
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function Footer() {
  const year = new Date().getFullYear()
  // Vive directo sobre el fondo de página → todo en tokens de tema (brand-text/muted/edge),
  // nada de white, o desaparecería en claro. El acento "Contacto" usa amber-strong.
  return (
    <footer id="contacto" className="mt-16 border-t border-edge pt-8 sm:mt-24">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark size={32} />
            <div className="leading-tight">
              <div className="font-display text-sm font-semibold text-brand-text">APE Multiservicios SRL</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Energía solar · Rep. Dominicana
              </div>
            </div>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Instalación, mantenimiento y garantía de sistemas de energía solar para hogares y
            negocios.
          </p>
        </div>

        <div className="sm:justify-self-end">
          <div className="text-[11px] font-bold uppercase tracking-wide text-amber-strong">Contacto</div>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2">
              <PhoneIcon /> {CONTACTO.telefono}
            </li>
            <li className="flex items-center gap-2">
              <WhatsappIcon /> {CONTACTO.whatsapp}
            </li>
            <li className="flex items-center gap-2">
              <MailIcon /> {CONTACTO.email}
            </li>
            <li className="flex items-center gap-2">
              <PinIcon /> {CONTACTO.direccion}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-1 border-t border-edge pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} APE Multiservicios SRL. Todos los derechos reservados.</span>
        <span>RNC {CONTACTO.rnc}</span>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// Piezas compartidas
// ---------------------------------------------------------------------------
const ctaPrimary =
  'inline-flex items-center justify-center gap-2 rounded-btn bg-amber px-5 py-3.5 font-display text-sm font-bold text-brand-dark shadow-lg transition-colors hover:bg-amber/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60'
const ctaSecondary =
  'inline-flex items-center justify-center gap-2 rounded-btn border border-white/25 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40'

// Sección: eyebrow ámbar + título en tokens de tema, y el contenido debajo.
// - eyebrow con `amber-strong` (no `amber`): el ámbar puro no contrasta sobre el fondo
//   claro; el strong es marrón-ámbar en claro y ámbar claro en oscuro, legible en ambos.
// - título con `brand-text` (no white): ahora vive sobre el fondo de página, no navy.
// - jerarquía: xl→2xl, un paso POR DEBAJO del hero (2xl→4xl), para que el hero domine.
// - ritmo: escala vertical consistente entre secciones, con más aire en desktop.
function Section({ id, eyebrow, titulo, children }) {
  return (
    <section id={id} className="mt-16 scroll-mt-20 sm:mt-24">
      <div className="mb-6 sm:mb-8">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-strong">{eyebrow}</div>
        <h2 className="mt-1.5 max-w-2xl font-display text-xl font-bold text-brand-text sm:text-2xl">
          {titulo}
        </h2>
      </div>
      {children}
    </section>
  )
}

// --- Iconos (SVG propios, aria-hidden; nada de imágenes externas) ---
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}
function ArrowIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" {...stroke} strokeWidth={2.4}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} strokeWidth={2.8}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
// Sol propio (disco + rayos) para el CTA final. Decorativo, aria-hidden.
function SunGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...stroke} strokeWidth={1.9}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 1.5v2.5M12 20v2.5M3.2 3.2l1.8 1.8M19 19l1.8 1.8M1.5 12h2.5M20 12h2.5M3.2 20.8l1.8-1.8M19 5l1.8-1.8" />
    </svg>
  )
}
function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <path d="M10 20v-5h4v5" />
    </svg>
  )
}
function IconBuilding() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M10 21v-3h4v3" />
    </svg>
  )
}
function IconWrench() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5l-6 6 2.4 2.4 6-6a4 4 0 0 0 5-5.4l-2.5 2.5-2.1-.4-.4-2.1z" />
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
function IconSavings() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5A2.5 2 0 0 1 12 8c1.4 0 2.5.8 2.5 1.8M14.5 14.2A2.5 2 0 0 1 12 16c-1.4 0-2.5-.8-2.5-1.8" />
    </svg>
  )
}
function IconBolt() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />
    </svg>
  )
}
function IconLeaf() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
      <path d="M5 19c3-5 7-8 11-9" />
    </svg>
  )
}
function IconValue() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} className="shrink-0 text-faint">
      <path d="M5 4h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5V17a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  )
}
function WhatsappIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 text-faint">
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4-1.1l-.3-.2-3 .8.8-3-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7 1-.3.2-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.5.5 0 0 0 0-.5c0-.1-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A2.8 2.8 0 0 0 7 8.8a4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.5 2.5 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c-.1-.1-.3-.2-.5-.3z" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} className="shrink-0 text-faint">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} className="shrink-0 text-faint">
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}
// QR decorativo (no es un QR real; ilustra la característica). aria-hidden.
function QrDecor() {
  return (
    <div className="grid h-32 w-32 grid-cols-5 gap-1 rounded-xl border border-edge bg-surface p-3" aria-hidden="true">
      {[1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1].map((on, i) => (
        <span key={i} className={`rounded-[2px] ${on ? 'bg-brand-text' : 'bg-transparent'}`} />
      ))}
    </div>
  )
}
