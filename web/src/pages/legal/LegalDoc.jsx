import { Link } from 'react-router-dom'
import PublicShell from '../../components/public/PublicShell.jsx'

// Contenedor de un documento legal PÚBLICO (privacidad, términos). Reusa PublicShell para
// combinar con la landing. El TEXTO es PLACEHOLDER a propósito: la ESTRUCTURA de secciones
// es la típica, con relleno EVIDENTE (entre corchetes, describiendo qué va en cada parte) y
// un banner de advertencia arriba, para que NADIE lo publique creyendo que es válido. El
// usuario reemplaza el cuerpo con la versión revisada por un abogado.
//
// Props: titulo (string), intro (string opcional), secciones ([{ heading, body }]).
export const FECHA_ACTUALIZACION = '{{FECHA_ACTUALIZACIÓN}}'

export default function LegalDoc({ titulo, intro, secciones }) {
  return (
    // width="doc": columna angosta (max-w-2xl) = buen ancho de lectura. footer={null}:
    // el pie de marca de PublicShell sobra aquí (el doc tiene su propio cierre).
    <PublicShell width="doc" footer={null}>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-text"
      >
        <BackArrow /> Volver al inicio
      </Link>

      {/* Banner de advertencia: DELIBERADAMENTE llamativo, para que no se confunda con
          texto legal válido y nadie lo publique por error. */}
      <div
        role="alert"
        className="mt-4 flex items-start gap-2 rounded-card border border-amber/50 bg-amber-soft px-4 py-3 text-sm font-semibold text-amber-strong"
      >
        <span aria-hidden="true">⚠</span>
        <span>Texto de ejemplo — reemplazar con la versión revisada por un abogado.</span>
      </div>

      <h1 className="mt-6 font-display text-2xl font-bold text-brand-text sm:text-3xl">{titulo}</h1>
      <p className="mt-1.5 text-sm text-muted">
        Última actualización: <span className="font-medium text-brand-text">{FECHA_ACTUALIZACION}</span>
      </p>

      {intro && <p className="mt-5 text-sm leading-relaxed text-muted">{intro}</p>}

      <div className="mt-6 space-y-6">
        {secciones.map((s, i) => (
          <section key={s.heading}>
            <h2 className="font-display text-base font-semibold text-brand-text">
              {i + 1}. {s.heading}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 border-t border-edge pt-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
        >
          <BackArrow /> Volver al inicio
        </Link>
      </div>
    </PublicShell>
  )
}

function BackArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}
