import LegalDoc from './legal/LegalDoc.jsx'

// Términos y Condiciones de la web pública de APE Multiservicios SRL. Regulan EXCLUSIVAMENTE
// la relación APE ↔ usuarios del sitio (nada relativo al software interno aparece aquí).
// Cada sección numera sola su encabezado.
const INTRO = [
  'Los presentes Términos y Condiciones regulan el acceso y uso del sitio web de APE Multiservicios SRL, así como de las funcionalidades y servicios digitales puestos a disposición de sus usuarios, incluyendo la consulta de información sobre productos y servicios, el envío de solicitudes de contacto o evaluación y la verificación de garantías.',
  'Al utilizar este sitio web, el usuario declara haber leído, comprendido y aceptado los presentes Términos y Condiciones.',
]

const SECCIONES = [
  {
    heading: 'Aceptación de los términos',
    body: [
      'El acceso, navegación o utilización de las funcionalidades disponibles en este sitio implica la aceptación de los presentes Términos y Condiciones.',
      'Cuando el usuario complete y envíe un formulario, solicitud o consulta a través del sitio, se compromete a proporcionar información veraz, actualizada y suficiente para gestionar su solicitud.',
      'Si el usuario no está de acuerdo con estos términos, deberá abstenerse de utilizar las funcionalidades ofrecidas a través del sitio.',
    ],
  },
  {
    heading: 'Descripción de los servicios',
    body: [
      'APE Multiservicios SRL pone a disposición de los usuarios una plataforma digital mediante la cual podrán:',
      {
        list: [
          'Consultar información sobre los productos y servicios ofrecidos por la empresa.',
          'Obtener información relacionada con soluciones de energía solar y otros servicios disponibles.',
          'Solicitar contacto, orientación o evaluación para un posible proyecto.',
          'Proporcionar información necesaria para la evaluación de una solicitud.',
          'Consultar o verificar garantías registradas por APE Multiservicios SRL.',
        ],
      },
      'El envío de una solicitud mediante el sitio no constituye por sí mismo una cotización definitiva, contrato, aprobación de financiamiento ni compromiso de instalación o prestación de servicios.',
      'Los precios, características técnicas, condiciones y alcance definitivo de cada proyecto serán establecidos mediante la evaluación correspondiente y, cuando proceda, mediante una cotización, propuesta, factura o contrato emitido por APE Multiservicios SRL.',
    ],
  },
  {
    heading: 'Uso permitido del sitio',
    body: [
      'El usuario se compromete a utilizar el sitio y sus funcionalidades únicamente para fines lícitos y relacionados con los servicios ofrecidos por APE Multiservicios SRL.',
      'Queda prohibido proporcionar deliberadamente información falsa, intentar obtener acceso no autorizado a cuentas, sistemas o información de terceros, interferir con el funcionamiento normal de la plataforma, intentar vulnerar sus mecanismos de seguridad, introducir software o código malicioso o utilizar herramientas automatizadas de manera no autorizada.',
      'APE Multiservicios SRL podrá limitar o restringir el acceso a determinadas funcionalidades cuando detecte actividades que puedan comprometer la seguridad, integridad o disponibilidad del servicio.',
    ],
  },
  {
    heading: 'Responsabilidades del usuario',
    body: [
      'El usuario es responsable de la exactitud, veracidad y actualización de la información proporcionada mediante el sitio.',
      'APE Multiservicios SRL no será responsable por retrasos, errores en evaluaciones preliminares, dificultades de comunicación o imposibilidad de gestionar una solicitud cuando estos sean consecuencia de información incorrecta, incompleta o desactualizada proporcionada por el usuario.',
      'Cuando corresponda, el usuario también será responsable de conservar adecuadamente los documentos, códigos, números de referencia o certificados asociados a sus servicios y garantías.',
    ],
  },
  {
    heading: 'Contenido y propiedad intelectual',
    body: [
      'Los nombres comerciales, marcas, logotipos, fotografías, textos, documentos, material audiovisual y demás contenido corporativo publicado en el sitio pertenece a APE Multiservicios SRL o es utilizado con la autorización correspondiente.',
      'El acceso al sitio no concede al usuario derechos de propiedad sobre dichos contenidos.',
      'Salvo autorización previa o disposición legal aplicable, no se permite reproducir, distribuir, modificar, publicar o utilizar comercialmente los contenidos del sitio.',
    ],
  },
  {
    heading: 'Información y limitación de responsabilidad',
    body: [
      'La información presentada en el sitio tiene carácter general, informativo y orientativo.',
      'Las estimaciones, recomendaciones o informaciones preliminares relacionadas con instalaciones, sistemas solares, equipos, capacidad energética, costos u otros aspectos técnicos no sustituyen una evaluación técnica cuando esta sea necesaria.',
      'APE Multiservicios SRL no garantiza que una solicitud enviada mediante el sitio resulte automáticamente en la aprobación, contratación o ejecución de un proyecto.',
      'La empresa procurará mantener sus servicios digitales disponibles y funcionando adecuadamente. Sin embargo, podrán producirse interrupciones temporales debido a mantenimiento, actualizaciones, fallos técnicos, servicios de terceros u otras circunstancias.',
    ],
  },
  {
    heading: 'Garantías',
    body: [
      'Las garantías correspondientes a productos, equipos, instalaciones o servicios suministrados por APE Multiservicios SRL estarán sujetas a las condiciones específicas establecidas en el certificado de garantía, factura, contrato u otro documento aplicable a cada operación.',
      'La funcionalidad de verificación disponible en el sitio permite consultar la información de una garantía registrada en el sistema.',
      'La consulta o verificación digital de una garantía no modifica, amplía ni sustituye las condiciones bajo las cuales dicha garantía fue originalmente emitida.',
      'La existencia de una garantía registrada tampoco supone cobertura sobre daños, situaciones o conceptos excluidos expresamente de sus condiciones particulares.',
    ],
  },
  {
    heading: 'Disponibilidad y modificaciones del sitio',
    body: [
      'APE Multiservicios SRL podrá realizar modificaciones, actualizaciones o mejoras en el sitio y sus funcionalidades cuando resulte necesario.',
      'Asimismo, determinadas funcionalidades podrán ser modificadas, suspendidas o retiradas temporal o permanentemente por razones técnicas, operativas, comerciales o de seguridad.',
    ],
  },
  {
    heading: 'Modificaciones de los Términos y Condiciones',
    body: [
      'APE Multiservicios SRL podrá actualizar los presentes Términos y Condiciones cuando sea necesario debido a modificaciones en sus servicios, procesos, funcionalidades o requisitos legales.',
      'La versión vigente estará disponible en el sitio e indicará su fecha de última actualización.',
      'Las modificaciones serán aplicables desde su publicación, salvo que se indique expresamente una fecha diferente.',
    ],
  },
  {
    heading: 'Ley aplicable y jurisdicción',
    body: [
      'Los presentes Términos y Condiciones se regirán e interpretarán de conformidad con las leyes de la República Dominicana.',
      'Cualquier controversia derivada del uso del sitio o de la interpretación de estos términos será sometida a las autoridades o tribunales competentes de la República Dominicana, conforme a la legislación aplicable.',
    ],
  },
]

export default function TerminosPage() {
  return (
    <LegalDoc
      titulo="Términos y Condiciones"
      fecha="2 de septiembre de 2026"
      intro={INTRO}
      secciones={SECCIONES}
    />
  )
}
