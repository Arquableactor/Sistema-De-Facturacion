import Topbar from '../components/layout/Topbar.jsx'

// Página puente para los módulos aún no construidos. // TODO: reemplazar por el CRUD real.
export default function PlaceholderPage({ title, subtitle = 'Módulo en construcción.' }) {
  return (
    <>
      <Topbar title={title} subtitle={subtitle} />
      <div className="p-6">
        <div className="grid place-items-center rounded-card border border-dashed border-edge bg-surface py-20 text-center">
          <div>
            <div className="font-display text-base font-semibold text-brand-text">Próximamente</div>
            <p className="mt-1 text-sm text-muted">
              La sección «{title}» estará disponible en una próxima entrega.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
