import LegalDoc from './legal/LegalDoc.jsx'

// Política de Privacidad — ESTRUCTURA típica para la Ley 172-13 dominicana (protección de
// datos personales). TODO el cuerpo es PLACEHOLDER entre corchetes: describe qué va en cada
// sección, sin redactar texto legal real. El usuario lo reemplaza con la versión del abogado.
const SECCIONES = [
  {
    heading: 'Responsable del tratamiento',
    body: '[Placeholder: identifica al responsable — APE Multiservicios SRL, su RNC, domicilio y datos de contacto — como la persona jurídica que recoge y trata los datos personales.]',
  },
  {
    heading: 'Datos que recogemos',
    body: '[Placeholder: enumera los datos personales que se recogen del titular (p. ej. nombre, tipo y número de documento, teléfono, correo, provincia, ubicación, consumo eléctrico) y los medios por los que se obtienen.]',
  },
  {
    heading: 'Finalidad del tratamiento',
    body: '[Placeholder: explica para qué se usan los datos — evaluar la solicitud, preparar una propuesta, contactar al prospecto, ejecutar la instalación y dar soporte de garantía — y que no se usarán para fines incompatibles.]',
  },
  {
    heading: 'Base legal y consentimiento',
    body: '[Placeholder: indica la base que legitima el tratamiento (consentimiento del titular al enviar la solicitud y/o ejecución de una relación contractual) conforme a la Ley 172-13.]',
  },
  {
    heading: 'Con quién se comparten',
    body: '[Placeholder: aclara si los datos se comparten con terceros (p. ej. suplidores, instaladores, entidades financieras, autoridades) y bajo qué condiciones; o afirma que no se ceden a terceros salvo obligación legal.]',
  },
  {
    heading: 'Plazo de conservación',
    body: '[Placeholder: define cuánto tiempo se conservan los datos y el criterio para determinarlo (mientras dure la relación y los plazos legales/fiscales aplicables), y qué ocurre al vencer.]',
  },
  {
    heading: 'Derechos del titular',
    body: '[Placeholder: describe los derechos de acceso, rectificación, cancelación y oposición (ARCO) y el procedimiento y el canal para ejercerlos.]',
  },
  {
    heading: 'Seguridad de la información',
    body: '[Placeholder: resume las medidas técnicas y organizativas para proteger los datos frente a acceso, pérdida o alteración no autorizados.]',
  },
  {
    heading: 'Contacto',
    body: '[Placeholder: canal para dudas sobre esta política o para ejercer los derechos ARCO — correo, teléfono o dirección de APE.]',
  },
]

export default function PrivacidadPage() {
  return (
    <LegalDoc
      titulo="Política de Privacidad"
      intro="[Placeholder: párrafo introductorio que explica el compromiso de APE con la protección de los datos personales y el alcance de esta política, conforme a la Ley 172-13 de la República Dominicana.]"
      secciones={SECCIONES}
    />
  )
}
