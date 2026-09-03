import { Link } from 'react-router-dom'
import PublicShell from '../../components/public/PublicShell.jsx'

// Contenedor de un documento legal PÚBLICO (privacidad, términos). Reusa PublicShell para
// combinar con la landing. El contenido (título, fecha, intro y secciones) llega por props;
// cada sección numera sola su encabezado y conserva la columna angosta de lectura.
//
// Props:
//   titulo    (string)
//   fecha     (string)            — fecha de última actualización
//   intro     (string | string[]) — uno o varios párrafos introductorios
//   secciones ([{ heading, body }]) — body es un array de BLOQUES; cada bloque es:
//     - string           -> párrafo
//     - { list: [...] }  -> lista con viñetas
//     - { lines: [...] } -> grupo de líneas juntas (p. ej. bloque de contacto)
export default function LegalDoc({ titulo, fecha, intro, secciones }) {
  const introParrafos = Array.isArray(intro) ? intro : intro ? [intro] : []
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

      <h1 className="mt-6 font-display text-2xl font-bold text-brand-text sm:text-3xl">{titulo}</h1>
      <p className="mt-1.5 text-sm text-muted">
        Última actualización: <span className="font-medium text-brand-text">{fecha}</span>
      </p>

      {introParrafos.length > 0 && (
        <div className="mt-5 space-y-3">
          {introParrafos.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted">
              {p}
            </p>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {secciones.map((s, i) => (
          <section key={s.heading}>
            <h2 className="font-display text-base font-semibold text-brand-text">
              {i + 1}. {s.heading}
            </h2>
            <div className="mt-1.5 space-y-3">
              {s.body.map((block, j) => (
                <Bloque key={j} block={block} />
              ))}
            </div>
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

// Un bloque del cuerpo de una sección: párrafo, lista o grupo de líneas.
function Bloque({ block }) {
  if (typeof block === 'string') {
    return <p className="text-sm leading-relaxed text-muted">{block}</p>
  }
  if (block.list) {
    return (
      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
        {block.list.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    )
  }
  if (block.lines) {
    return (
      <div className="space-y-1 text-sm leading-relaxed text-muted">
        {block.lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    )
  }
  return null
}

function BackArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}
