import LegalDoc from './legal/LegalDoc.jsx'

// Términos y Condiciones — ESTRUCTURA típica. TODO el cuerpo es PLACEHOLDER entre corchetes:
// describe qué va en cada sección, sin redactar texto legal real. El usuario lo reemplaza con
// la versión revisada por un abogado.
const SECCIONES = [
  {
    heading: 'Aceptación de los términos',
    body: '[Placeholder: indica que al usar el sitio o enviar una solicitud el usuario acepta estos términos, y qué pasa si no está de acuerdo.]',
  },
  {
    heading: 'Descripción del servicio',
    body: '[Placeholder: describe qué ofrece APE a través del sitio — información sobre energía solar, captación de solicitudes de evaluación, verificación de garantías — y su alcance.]',
  },
  {
    heading: 'Uso permitido',
    body: '[Placeholder: define el uso aceptable del sitio y las conductas prohibidas (información falsa, uso automatizado no autorizado, intento de vulnerar la seguridad, etc.).]',
  },
  {
    heading: 'Responsabilidades del usuario',
    body: '[Placeholder: aclara que el usuario es responsable de la veracidad de los datos que proporciona y del uso que hace del sitio.]',
  },
  {
    heading: 'Propiedad intelectual',
    body: '[Placeholder: establece que el contenido, marcas y materiales del sitio pertenecen a APE (o a quien corresponda) y no pueden usarse sin autorización.]',
  },
  {
    heading: 'Limitación de responsabilidad',
    body: '[Placeholder: limita la responsabilidad de APE por el uso del sitio y aclara que la información es orientativa hasta la visita técnica y la propuesta formal.]',
  },
  {
    heading: 'Garantías',
    body: '[Placeholder: remite a las condiciones de garantía de las instalaciones y aclara qué cubre el certificado verificable, sin crear garantías adicionales por el uso del sitio.]',
  },
  {
    heading: 'Modificaciones',
    body: '[Placeholder: indica que APE puede actualizar estos términos y cómo se notifican los cambios y desde cuándo aplican.]',
  },
  {
    heading: 'Ley aplicable y jurisdicción',
    body: '[Placeholder: señala que estos términos se rigen por las leyes de la República Dominicana y la jurisdicción competente para cualquier controversia.]',
  },
  {
    heading: 'Contacto',
    body: '[Placeholder: canal para dudas sobre estos términos — correo, teléfono o dirección de APE.]',
  },
]

export default function TerminosPage() {
  return (
    <LegalDoc
      titulo="Términos y Condiciones"
      intro="[Placeholder: párrafo introductorio que explica que estos términos regulan el uso del sitio y de los servicios de captación y verificación de APE Multiservicios SRL.]"
      secciones={SECCIONES}
    />
  )
}
