import EstimateCard from '../../components/public/EstimateCard.jsx'

// TODO: reemplazar por el WhatsApp real de APE antes de publicar.
// Se deja un placeholder a propósito para no dejar un número de negocio en el repo.
const WHATSAPP_PLACEHOLDER = '1234567890'
const WHATSAPP_TEXTO = 'Hola, acabo de enviar mi solicitud de evaluación solar.'

// Confirmación. El estimado que se muestra aquí es el que devolvió el SERVER, no el
// que la pantalla venía calculando: es el que quedó guardado y el que APE verá.
export default function SolicitudExito({ resultado, onVolver }) {
  const waHref = `https://wa.me/${WHATSAPP_PLACEHOLDER}?text=${encodeURIComponent(WHATSAPP_TEXTO)}`

  return (
    <div className="text-center">
      <div className="relative mx-auto grid h-20 w-20 place-items-center">
        <span aria-hidden="true" className="absolute inset-0 rounded-full bg-green opacity-25 blur-xl" />
        <span className="relative grid h-16 w-16 place-items-center rounded-full bg-green text-white">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      </div>

      <h1 className="mt-4 font-display text-2xl font-bold text-white">¡Solicitud recibida!</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/70">
        Gracias por tu solicitud. Un asesor de APE te contactará muy pronto para agendar tu
        evaluación solar gratis.
      </p>

      <EstimateCard
        className="mt-5 text-left"
        kwhDia={resultado.consumoEstimadoKwhDia}
        kwhMes={resultado.consumoEstimadoKwhMes}
      />

      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Solicitud <span className="font-mono">{resultado.numeroSolicitud}</span>
      </div>

      {/* La promesa central: el número de arriba orienta, no compromete. */}
      <div className="mt-4 flex items-start gap-2.5 rounded-card border border-white/10 bg-white/[0.06] p-3.5 text-left">
        <span className="mt-0.5 shrink-0 text-amber">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 7.5v.5" />
          </svg>
        </span>
        <p className="text-xs leading-relaxed text-white/70">
          Este es un estimado orientativo — el cálculo exacto se hace en tu evaluación gratuita.
          APE Multiservicios te contactará pronto.
        </p>
      </div>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-btn bg-green px-4 py-3.5 font-semibold text-white transition-colors hover:bg-green-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4-1.1l-.3-.2-3 .8.8-3-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7 1-.3.2-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.5.5 0 0 0 0-.5c0-.1-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A2.8 2.8 0 0 0 7 8.8a4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.5 2.5 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c-.1-.1-.3-.2-.5-.3z" />
        </svg>
        Escríbenos por WhatsApp
      </a>

      <button
        type="button"
        onClick={onVolver}
        className="mt-3 w-full rounded-btn py-2 text-sm font-semibold text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        Enviar otra solicitud
      </button>
    </div>
  )
}
