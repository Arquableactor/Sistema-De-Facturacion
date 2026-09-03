import { Link } from 'react-router-dom'

// Representa UNA fila de una lista como TARJETA, para móvil (la tabla se queda en desktop).
// Define solo la ESTRUCTURA — título, badge, datos de apoyo, acciones — y cada pantalla le
// pasa SUS campos. Genérico y reutilizable para las 9 listas (hoy Clientes y Facturas).
//
// Props:
//  - leading:  nodo opcional a la izquierda (avatar de iniciales, ícono).
//  - title:    identifica la fila de un vistazo (string o nodo).
//  - badge:    nodo opcional (uno o varios <Badge>) — arriba a la derecha.
//  - fields:   [{ label, value, full? }] — 2-3 pares etiqueta/valor de apoyo. `full` ocupa
//              las dos columnas (útil para un valor largo como el nombre del cliente).
//  - actions:  nodo opcional (el <ActionMenu> existente) — en la esquina, NO botones sueltos.
//  - href:     si se pasa, TODA la tarjeta enlaza ahí (patrón "stretched link"): el enlace
//              cubre la tarjeta pero las `actions` quedan por encima (z superior) y siguen
//              siendo clicables. Sin `href`, la tarjeta no navega (ej. Clientes).
//  - ariaLabel: etiqueta accesible del enlace de tarjeta.
export default function ListCard({ leading, title, badge, fields = [], actions, href, ariaLabel }) {
  return (
    <div
      className={`relative rounded-card border border-edge bg-surface p-4 shadow-card ${
        href ? 'transition-colors hover:bg-edge-soft/40' : ''
      }`}
    >
      {href && (
        // Enlace estirado sobre toda la tarjeta. Va debajo de las acciones (que llevan z-10).
        <Link
          to={href}
          aria-label={ariaLabel}
          className="absolute inset-0 rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
        />
      )}

      <div className="flex items-start gap-3">
        {leading && <div className="shrink-0">{leading}</div>}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className={`min-w-0 flex-1 truncate text-sm font-semibold ${href ? 'text-primary' : 'text-brand-text'}`}>
              {title}
            </div>
            {(badge || actions) && (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                {badge}
                {/* z-10 + relative: por encima del enlace estirado, para que el menú funcione. */}
                {actions && <div className="relative z-10 -mr-1">{actions}</div>}
              </div>
            )}
          </div>

          {fields.length > 0 && (
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {fields.map((f) => (
                <div key={f.label} className={`min-w-0 ${f.full ? 'col-span-2' : ''}`}>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-faint">{f.label}</dt>
                  <dd className="mt-0.5 truncate text-sm text-muted">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}
