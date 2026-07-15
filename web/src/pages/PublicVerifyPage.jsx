import { useParams } from 'react-router-dom'
import BrandMark from '../components/ui/BrandMark.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Button from '../components/ui/Button.jsx'
import useApi from '../hooks/useApi.js'
import { date, formatWarranty } from '../lib/format.js'
import { verifyPublic } from '../api/warrantiesApi.js'
import { warrantyStatusMeta } from './warranties/warrantyMeta.js'

// Página PÚBLICA (sin login, sin layout interno) que abre el QR del certificado.
// Solo muestra lo que da el endpoint anónimo: NADA de datos del cliente.
export default function PublicVerifyPage() {
  const { code } = useParams()
  const { data, loading, error, reload } = useApi(() => verifyPublic(code), [code])

  return (
    <div className="relative grid min-h-screen place-items-center bg-brand-gradient px-4 py-10">
      {/* Esta página va fuera del layout (no hay sidebar), así que el toggle vive aquí. */}
      <div className="absolute right-4 top-4">
        <ThemeToggle variant="onBrand" />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-5 flex flex-col items-center text-center">
          <BrandMark size={52} />
          <h1 className="mt-3 font-display text-lg font-semibold text-white">APE Multiservicios</h1>
          <p className="text-sm text-white/60">Verificación de certificado de garantía</p>
        </div>

        <div className="rounded-card bg-surface p-6 shadow-card">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Spinner size={28} />
              <p className="text-sm text-muted">Verificando certificado…</p>
            </div>
          ) : error ? (
            error.status === 404 ? (
              <NotFound />
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm font-semibold text-danger-strong">
                  No se pudo verificar el certificado.
                </p>
                <p className="mt-1 text-sm text-muted">Revisa tu conexión e inténtalo de nuevo.</p>
                <Button variant="ghost" className="mt-4" onClick={reload}>
                  Reintentar
                </Button>
              </div>
            )
          ) : data ? (
            <Certificate data={data} />
          ) : null}
        </div>

        <p className="mt-4 text-center text-xs text-white/40">
          Verificación oficial de APE Multiservicios SRL
        </p>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="py-6 text-center">
      <Hero tone="gray" icon="cross" title="Certificado no encontrado" />
      <p className="mt-2 text-sm text-muted">
        Verifica el código o contacta a APE Multiservicios.
      </p>
    </div>
  )
}

function Certificate({ data }) {
  const st = warrantyStatusMeta(data.status)
  const valid = data.isValid // Active
  const hero = valid
    ? { tone: 'green', icon: 'check', title: 'Certificado auténtico' }
    : data.status === 'Void'
      ? { tone: 'gray', icon: 'cross', title: 'Certificado anulado' }
      : { tone: 'amber', icon: 'clock', title: 'Certificado vencido' }

  return (
    <div>
      <Hero tone={hero.tone} icon={hero.icon} title={hero.title} />

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="font-display text-lg font-semibold text-brand-text">
          {data.warrantyNumber}
        </span>
        <Badge tone={st.tone}>{st.label}</Badge>
      </div>

      <div className="mt-1 text-sm text-muted">
        Vigencia: <span className="text-brand-text">{date(data.startDate)}</span> →{' '}
        <span className="text-brand-text">{date(data.endDate)}</span>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">
          Equipos cubiertos
        </div>
        <div className="overflow-x-auto rounded-btn border border-edge">
          <table className="w-full text-left text-sm">
            <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Equipo</th>
                <th className="px-3 py-2 font-semibold">Serie</th>
                <th className="px-3 py-2 font-semibold">Garantía</th>
                <th className="px-3 py-2 font-semibold">Vence</th>
              </tr>
            </thead>
            <tbody>
              {(data.items || []).map((it, i) => (
                <tr key={i} className="border-t border-edge">
                  <td className="px-3 py-2 text-muted">
                    {[it.marca, it.modelo].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">{it.serialNumber}</td>
                  <td className="px-3 py-2 text-muted">{formatWarranty(it.warrantyMonths)}</td>
                  <td className="px-3 py-2 text-muted">{date(it.endDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const HERO_TONE = {
  green: 'bg-green-soft text-green-strong',
  amber: 'bg-amber-soft text-amber-strong',
  gray: 'bg-edge-soft text-muted',
}

function Hero({ tone, icon, title }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className={`grid h-16 w-16 place-items-center rounded-full ${HERO_TONE[tone] || HERO_TONE.gray}`}>
        <HeroIcon icon={icon} />
      </div>
      <h2 className="mt-3 font-display text-xl font-semibold text-brand-text">{title}</h2>
    </div>
  )
}

function HeroIcon({ icon }) {
  const common = {
    'aria-hidden': 'true',
    focusable: 'false',
    width: 34,
    height: 34,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  if (icon === 'check') {
    return (
      <svg {...common}>
        <path d="M5 12.5l4.5 4.5L19 7" />
      </svg>
    )
  }
  if (icon === 'clock') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.5 2" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  )
}
