import { Link } from 'react-router-dom'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import useApi from '../../hooks/useApi.js'
import { date, phone as fmtPhone, money } from '../../lib/format.js'
import { getSolicitud } from '../../api/solicitudesApi.js'
import { estadoMeta, docLabel } from './solicitudMeta.js'

// Detalle de una solicitud: todos los datos + los equipos que marcó el prospecto con su
// consumo. Si está Pendiente, ofrece Aprobar/Rechazar; si ya fue revisada, se ve en
// solo-lectura con quién/cuándo y el motivo (rechazo) o el cliente creado (aprobación).
export default function SolicitudDetailModal({ open, solicitudId, canManage, onClose, onAprobar, onRechazar }) {
  const { data, loading, error, reload } = useApi(
    () => (solicitudId ? getSolicitud(solicitudId) : Promise.resolve(null)),
    [solicitudId],
  )

  const est = data ? estadoMeta(data.estado) : null
  const pendiente = data?.estado === 'Pendiente'

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={data ? `Solicitud ${data.numeroSolicitud}` : 'Solicitud'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          {data && pendiente && canManage && (
            <>
              <Button variant="danger" onClick={() => onRechazar(data)}>
                Rechazar
              </Button>
              <Button onClick={() => onAprobar(data)}>Aprobar</Button>
            </>
          )}
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size={26} />
        </div>
      ) : error ? (
        <div className="py-6 text-center">
          <p className="text-sm font-semibold text-danger-strong">No se pudo cargar la solicitud.</p>
          <Button variant="ghost" className="mt-3" onClick={reload}>
            Reintentar
          </Button>
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* Estado + revisión */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone={est.tone}>{est.label}</Badge>
            <span className="text-xs text-muted">Recibida el {date(data.createdAt)}</span>
          </div>

          {data.estado !== 'Pendiente' && (
            <div className="rounded-btn bg-edge-soft/60 px-3.5 py-2.5 text-sm">
              <span className="text-muted">
                Revisada por{' '}
                <span className="font-medium text-brand-text">{data.revisadoPorNombre || '—'}</span> el{' '}
                {date(data.revisadoAt)}.
              </span>
              {data.estado === 'Rechazada' && data.motivoRechazo && (
                <div className="mt-1 text-danger-strong">Motivo: {data.motivoRechazo}</div>
              )}
              {data.estado === 'Aprobada' && data.clienteCreadoId && (
                <div className="mt-1 text-green-strong">
                  Cliente creado (#{data.clienteCreadoId}).{' '}
                  <Link to="/clientes" className="font-medium text-primary hover:underline">
                    Ver clientes
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Datos personales */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Info label="Nombre" value={data.nombre} />
            <Info label="Documento" value={`${docLabel(data.documentType)} ${data.documentNumber}`} />
            <Info label="Teléfono" value={fmtPhone(data.phone)} />
            <Info label="Correo" value={data.email || '—'} />
            <Info label="Provincia" value={data.provincia || '—'} />
            <Info label="Ubicación" value={data.ubicacion} />
            <Info
              label="Factura de luz"
              value={data.facturaLuzMensual != null ? money(data.facturaLuzMensual) : '—'}
            />
            <Info label="Consumo estimado" value={`${data.consumoEstimadoKwhDia} kWh/día`} strong />
          </div>

          {data.notas && <Info label="Notas" value={data.notas} />}

          {/* Equipos */}
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-faint">
              Equipos declarados ({data.equipos.length})
            </div>
            <div className="overflow-hidden rounded-btn border border-edge">
              <table className="w-full text-left text-sm">
                <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Equipo</th>
                    <th className="px-3 py-2 text-right font-semibold">Watts</th>
                    <th className="px-3 py-2 text-right font-semibold">Cant.</th>
                    <th className="px-3 py-2 text-right font-semibold">Horas/día</th>
                    <th className="px-3 py-2 text-right font-semibold">kWh/día</th>
                  </tr>
                </thead>
                <tbody>
                  {data.equipos.map((e, i) => (
                    <tr key={i} className="border-t border-edge">
                      <td className="px-3 py-2 text-brand-text">{e.nombreEquipo}</td>
                      <td className="px-3 py-2 text-right tabular text-muted">{e.watts}</td>
                      <td className="px-3 py-2 text-right tabular text-muted">{e.cantidad}</td>
                      <td className="px-3 py-2 text-right tabular text-muted">{e.horasPorDia}</td>
                      <td className="px-3 py-2 text-right tabular font-medium text-brand-text">
                        {e.kwhDia}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-edge bg-edge-soft/40">
                    <td className="px-3 py-2 font-semibold text-brand-text" colSpan={4}>
                      Consumo estimado total
                    </td>
                    <td className="px-3 py-2 text-right tabular font-bold text-brand-text">
                      {data.consumoEstimadoKwhDia}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

function Info({ label, value, strong }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-faint">{label}</div>
      <div className={`mt-0.5 text-sm ${strong ? 'font-semibold text-brand-text' : 'text-brand-text'}`}>
        {value}
      </div>
    </div>
  )
}
