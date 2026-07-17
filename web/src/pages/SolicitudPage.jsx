import { useMemo, useState } from 'react'
import PublicShell from '../components/public/PublicShell.jsx'
import PublicHero from '../components/public/PublicHero.jsx'
import PublicCard from '../components/public/PublicCard.jsx'
import EstimateCard from '../components/public/EstimateCard.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Button from '../components/ui/Button.jsx'
import useApi from '../hooks/useApi.js'
import { mapDetails } from '../lib/apiErrors.js'
import {
  DOC_TYPES,
  DOC_META,
  cleanDocument,
  clampDocument,
  cleanPhone,
  clampPhone,
  validateDocument,
  validatePhone,
  validateEmail,
} from '../lib/documentRules.js'
import { getAppliances, createSolicitud } from '../api/solicitudesApi.js'
import { agruparPorCategoria, categoriaMeta, estimateConsumo } from './solicitud/solicitudMeta.js'
import EquipoItem from './solicitud/EquipoItem.jsx'
import SolicitudExito from './solicitud/SolicitudExito.jsx'

// Página PÚBLICA de captación (hermana de /verificar): sin login y sin AppLayout.
// El link se comparte por WhatsApp, así que es móvil-primero; en desktop la columna se
// centra y el estimado se queda pegajoso al lado.
const EMPTY = {
  nombre: '',
  documentType: 'Cedula',
  documentNumber: '',
  documentRaw: '',
  phone: '',
  email: '',
  provincia: '',
  ubicacion: '',
  facturaLuzMensual: '',
  website: '', // honeypot
}

// Provincias RD. Estático: no cambian, y pedirle un endpoint al server para esto sería
// una llamada de más en la página que más rápido debe cargar.
const PROVINCIAS = [
  'Azua', 'Bahoruco', 'Barahona', 'Dajabón', 'Distrito Nacional', 'Duarte', 'El Seibo',
  'Elías Piña', 'Espaillat', 'Hato Mayor', 'Hermanas Mirabal', 'Independencia',
  'La Altagracia', 'La Romana', 'La Vega', 'María Trinidad Sánchez', 'Monseñor Nouel',
  'Monte Cristi', 'Monte Plata', 'Pedernales', 'Peravia', 'Puerto Plata', 'Samaná',
  'San Cristóbal', 'San José de Ocoa', 'San Juan', 'San Pedro de Macorís', 'Sánchez Ramírez',
  'Santiago', 'Santiago Rodríguez', 'Santo Domingo', 'Valverde',
]

const MAX_FACTURA = 1_000_000

export default function SolicitudPage() {
  const { data: appliances, loading, error, reload } = useApi(() => getAppliances(), [])

  const [form, setForm] = useState(EMPTY)
  // { [id]: { cantidad, horasPorDia } } — solo los equipos marcados.
  const [seleccion, setSeleccion] = useState({})
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resultado, setResultado] = useState(null)

  const lista = appliances || []
  const porId = useMemo(() => new Map(lista.map((a) => [a.id, a])), [lista])
  const grupos = useMemo(() => agruparPorCategoria(lista), [lista])

  // Estimado en vivo. Espeja al backend, pero al enviar mandan los números del server.
  const estimado = useMemo(() => {
    const lineas = Object.entries(seleccion).map(([id, s]) => ({
      watts: porId.get(Number(id))?.watts ?? 0,
      cantidad: s.cantidad,
      horasPorDia: s.horasPorDia,
    }))
    return estimateConsumo(lineas)
  }, [seleccion, porId])

  const marcados = Object.keys(seleccion).length

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  // Cambiar el tipo re-deriva el número desde el RAW: ir a Cédula y volver a Pasaporte
  // recupera las letras en vez de destruirlas.
  function setDocumentType(type) {
    setForm((f) => ({ ...f, documentType: type, documentNumber: cleanDocument(f.documentRaw, type) }))
  }

  function setDocumentNumber(value) {
    setForm((f) => ({
      ...f,
      documentRaw: value,
      documentNumber: clampDocument(cleanDocument(value, f.documentType), f.documentType),
    }))
  }

  function toggleEquipo(a) {
    setSeleccion((s) => {
      const next = { ...s }
      if (next[a.id]) delete next[a.id]
      // Precarga las horas SUGERIDAS del catálogo: el prospecto ajusta en vez de adivinar.
      else next[a.id] = { cantidad: 1, horasPorDia: a.horasSugeridas }
      return next
    })
  }

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.'
    const doc = validateDocument(form.documentNumber, form.documentType)
    if (doc) e.documentNumber = doc
    const phone = validatePhone(form.phone)
    if (phone) e.phone = phone
    const email = validateEmail(form.email)
    if (email) e.email = email
    if (!form.ubicacion.trim()) e.ubicacion = 'Dinos dónde vives.'
    if (form.facturaLuzMensual !== '') {
      const n = Number(form.facturaLuzMensual)
      if (Number.isNaN(n) || n <= 0 || n >= MAX_FACTURA) {
        e.facturaLuzMensual = 'Debe ser mayor que 0 y menor que 1,000,000.'
      }
    }
    if (marcados === 0) e.equipos = 'Marca al menos un equipo para estimar tu consumo.'
    return e
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    setErrors(errs)
    setFormError('')
    if (Object.keys(errs).length) {
      // En móvil el error puede quedar fuera de pantalla: llevamos al usuario a él.
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        documentType: form.documentType,
        documentNumber: form.documentNumber.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        provincia: form.provincia || null,
        ubicacion: form.ubicacion.trim(),
        facturaLuzMensual: form.facturaLuzMensual === '' ? null : Number(form.facturaLuzMensual),
        // Sin watts a propósito: los pone el server desde el catálogo.
        equipos: Object.entries(seleccion).map(([id, s]) => ({
          electrodomesticoId: Number(id),
          cantidad: s.cantidad,
          horasPorDia: s.horasPorDia,
        })),
        website: form.website, // honeypot: vacío si es una persona
      }
      setResultado(await createSolicitud(payload))
      window.scrollTo({ top: 0 })
    } catch (err) {
      if (err.status === 400 && err.details) {
        setErrors((prev) => ({ ...prev, ...mapDetails(err.details) }))
        setFormError(err.message || 'Revisa los campos marcados.')
      } else if (err.status === 429) {
        setFormError('Has enviado varias solicitudes. Intenta más tarde.')
      } else if (err.status === 0) {
        setFormError('No se pudo conectar. Revisa tu internet e inténtalo de nuevo.')
      } else {
        setFormError(err.message || 'No se pudo enviar tu solicitud.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (resultado) {
    return (
      <PublicShell>
        <SolicitudExito
          resultado={resultado}
          onVolver={() => {
            setResultado(null)
            setForm(EMPTY)
            setSeleccion({})
            setErrors({})
          }}
        />
      </PublicShell>
    )
  }

  return (
    <PublicShell width="wide">
      <PublicHero
        badge="Evaluación 100% gratis"
        title="Solicita tu evaluación solar gratis"
        subtitle="En 2 minutos calculamos tu consumo y preparamos una propuesta a tu medida. Deja que el sol pague tu factura. ☀️"
      />

      {loading ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-card bg-surface py-10">
          <Spinner size={26} />
          <p className="text-sm text-muted">Cargando el formulario…</p>
        </div>
      ) : error ? (
        <div className="mt-4 rounded-card bg-surface p-6 text-center">
          <p className="text-sm font-semibold text-danger-strong">No se pudo cargar el formulario.</p>
          <p className="mt-1 text-sm text-muted">Revisa tu conexión e inténtalo de nuevo.</p>
          <Button variant="ghost" className="mt-4" onClick={reload}>
            Reintentar
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-4 lg:flex lg:items-start lg:gap-5">
          <div className="space-y-4 lg:flex-1">
            {/* ---- 1. Datos ---- */}
            <PublicCard step={1} title="Tus datos" subtitle="Para preparar tu propuesta">
              {/* Móvil: una columna. Desde sm: pares de campos relacionados en 2
                  columnas, para que no sea una torre de inputs gigantes. */}
              <div className="space-y-3.5">
                <PublicField id="nombre" label="Nombre completo" error={errors.nombre}>
                  <input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) => set('nombre', e.target.value)}
                    placeholder="Ej. María Rodríguez"
                    className={inputCls(errors.nombre)}
                  />
                </PublicField>

                <div className="grid gap-3.5 sm:grid-cols-2">
                <PublicField label="Tipo de documento" error={errors.documentType}>
                  {/* Píldoras en vez de select: 3 opciones, y en móvil se tocan de una. */}
                  <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo de documento">
                    {DOC_TYPES.map((d) => {
                      const on = form.documentType === d.value
                      return (
                        <button
                          key={d.value}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setDocumentType(d.value)}
                          className={`rounded-btn border px-2 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                            on
                              ? 'border-brand bg-brand text-white'
                              : 'border-edge bg-surface text-muted hover:bg-edge-soft'
                          }`}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </PublicField>

                <PublicField
                  id="documentNumber"
                  label={`Número de ${(DOC_META[form.documentType]?.label || 'documento').toLowerCase()}`}
                  error={errors.documentNumber}
                >
                  <input
                    id="documentNumber"
                    inputMode={DOC_META[form.documentType]?.digits ? 'numeric' : 'text'}
                    value={form.documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder={
                      DOC_META[form.documentType]?.digits
                        ? `${DOC_META[form.documentType].digits} dígitos`
                        : 'AB123456'
                    }
                    className={inputCls(errors.documentNumber)}
                  />
                </PublicField>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                <PublicField id="phone" label="Teléfono / WhatsApp" error={errors.phone}>
                  <input
                    id="phone"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => set('phone', clampPhone(cleanPhone(e.target.value)))}
                    placeholder="8090000000"
                    className={inputCls(errors.phone)}
                  />
                </PublicField>

                <PublicField id="email" label="Correo" optional error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className={inputCls(errors.email)}
                  />
                </PublicField>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                <PublicField id="provincia" label="Provincia" optional error={errors.provincia}>
                  <select
                    id="provincia"
                    value={form.provincia}
                    onChange={(e) => set('provincia', e.target.value)}
                    className={inputCls(errors.provincia)}
                  >
                    <option value="">Selecciona tu provincia</option>
                    {PROVINCIAS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </PublicField>

                <PublicField id="ubicacion" label="Sector / dirección" error={errors.ubicacion}>
                  <input
                    id="ubicacion"
                    value={form.ubicacion}
                    onChange={(e) => set('ubicacion', e.target.value)}
                    placeholder="Sector, calle y número"
                    className={inputCls(errors.ubicacion)}
                  />
                </PublicField>
                </div>
              </div>
            </PublicCard>

            {/* ---- Factura de luz (opcional, el dato REAL) ---- */}
            <PublicCard
              tone="amber"
              title="¿Cuánto pagas de luz al mes?"
              action={
                <span className="rounded-full bg-amber/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-strong">
                  Opcional
                </span>
              }
            >
              <div
                data-error={errors.facturaLuzMensual ? 'true' : undefined}
                className={`flex items-center gap-2 rounded-btn border bg-surface px-3.5 py-2.5 ${
                  errors.facturaLuzMensual ? 'border-danger' : 'border-amber/40'
                }`}
              >
                <span className="font-display text-sm font-bold text-amber-strong">RD$</span>
                <input
                  id="facturaLuzMensual"
                  inputMode="decimal"
                  value={form.facturaLuzMensual}
                  onChange={(e) => set('facturaLuzMensual', e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="0.00"
                  aria-label="Cuánto pagas de luz al mes en pesos"
                  className="w-full bg-transparent text-sm text-brand-text outline-none placeholder:text-faint"
                />
              </div>
              {errors.facturaLuzMensual ? (
                <p className="mt-1.5 text-xs font-medium text-danger-strong">{errors.facturaLuzMensual}</p>
              ) : (
                <p className="mt-1.5 text-xs text-amber-strong">
                  Si lo sabes, nos ayuda a darte una propuesta más precisa.
                </p>
              )}
            </PublicCard>

            {/* ---- 2. Equipos ---- */}
            <div data-error={errors.equipos ? 'true' : undefined}>
              <div className="mb-3 flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand font-display text-xs font-bold text-white">
                  2
                </span>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    ¿Qué equipos usas en casa?
                  </h2>
                  <p className="mt-0.5 text-xs text-white/60">
                    Marca los que tienes y ajusta cantidad y horas.
                  </p>
                </div>
              </div>

              {errors.equipos && (
                <p className="mb-3 rounded-btn bg-danger-soft px-3 py-2 text-sm font-medium text-danger-strong">
                  {errors.equipos}
                </p>
              )}

              <div className="space-y-4">
                {grupos.map(([categoria, items]) => {
                  const meta = categoriaMeta(categoria)
                  const n = items.filter((a) => seleccion[a.id]).length
                  return (
                    <section key={categoria} className="rounded-card bg-surface p-3 shadow-card">
                      <header className="mb-2.5 flex items-center justify-between gap-2">
                        <h3 className={`font-display text-sm font-semibold ${meta.text}`}>{categoria}</h3>
                        {n > 0 && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.soft} ${meta.text}`}>
                            {n} seleccionado{n === 1 ? '' : 's'}
                          </span>
                        )}
                      </header>
                      {/* Móvil: lista vertical. Desde sm: 2 columnas. No pasamos de 2
                          porque cada tarjeta abierta lleva dos steppers con su etiqueta,
                          y a 3 columnas quedarían apretados. `items-start` evita que una
                          tarjeta abierta estire a la de al lado. */}
                      <div className="grid items-start gap-2 sm:grid-cols-2">
                        {items.map((a) => (
                          <EquipoItem
                            key={a.id}
                            appliance={a}
                            seleccion={seleccion[a.id]}
                            accent={`rgb(var(${meta.varName}))`}
                            onToggle={() => toggleEquipo(a)}
                            onChange={(next) => setSeleccion((s) => ({ ...s, [a.id]: next }))}
                          />
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ---- Estimado + enviar ----
              Apilado (móvil/tablet) se acota a max-w-md y se centra: a ancho completo,
              el botón de enviar quedaba de 672px y se veía desproporcionado.
              Desde lg pasa a ser la columna sticky de la derecha. */}
          <aside className="mx-auto mt-4 w-full max-w-md lg:sticky lg:top-6 lg:mx-0 lg:mt-0 lg:w-80 lg:max-w-none lg:shrink-0">
            <EstimateCard kwhDia={estimado.kwhDia} kwhMes={estimado.kwhMes} />

            {formError && (
              <p className="mt-3 rounded-btn bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger-strong">
                {formError}
              </p>
            )}

            {/* HONEYPOT: oculto para personas, visible para bots. Sin label ni tabIndex
                para que ni el teclado ni un lector de pantalla lo alcancen. */}
            <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
              <label htmlFor="website">No llenar</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => set('website', e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-btn bg-amber px-4 py-3.5 font-display font-bold text-brand-dark transition-colors hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-dark/30 border-t-brand-dark" />
                  Enviando…
                </>
              ) : (
                <>
                  Solicitar mi evaluación gratis
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>

            <ul className="mt-3 space-y-1.5">
              {['Evaluación 100% gratis, sin compromiso', 'Tus datos están protegidos',
                'Te contactamos en menos de 24 horas'].map((t) => (
                <li key={t} className="flex items-center gap-2 text-xs text-white/65">
                  <span className="text-green">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </aside>
        </form>
      )}
    </PublicShell>
  )
}

function inputCls(error) {
  return `w-full rounded-btn border bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors placeholder:text-faint focus:ring-2 ${
    error
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-edge focus:border-primary focus:ring-primary/15'
  }`
}

// Campo del registro público: label en mayúscula pequeña, como el diseño.
function PublicField({ id, label, optional, error, children }) {
  return (
    <div data-error={error ? 'true' : undefined}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-faint"
      >
        {label}
        {optional && <span className="ml-1 font-semibold text-faint-2">· Opcional</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-danger-strong">{error}</p>}
    </div>
  )
}
