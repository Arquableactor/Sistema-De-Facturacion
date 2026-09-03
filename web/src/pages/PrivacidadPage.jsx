import LegalDoc from './legal/LegalDoc.jsx'

// Política de Privacidad de la web pública de APE Multiservicios SRL. Regula EXCLUSIVAMENTE
// el tratamiento de datos de clientes/usuarios del sitio (nada relativo al software interno
// aparece aquí). Los únicos placeholders son los datos de contacto de APE (los pone Franklin).
const INTRO = [
  'APE Multiservicios SRL reconoce la importancia de proteger la información personal de sus clientes, potenciales clientes y usuarios.',
  'La presente Política de Privacidad describe cómo se recopilan, utilizan, almacenan y protegen los datos personales proporcionados a través del sitio web y de los servicios digitales de APE Multiservicios SRL.',
]

const SECCIONES = [
  {
    heading: 'Información que recopilamos',
    body: [
      'APE Multiservicios SRL podrá recopilar información proporcionada directamente por el usuario al completar formularios, solicitar una evaluación, realizar una consulta o utilizar determinadas funcionalidades del sitio.',
      'Esta información puede incluir:',
      {
        list: [
          'Nombre y apellido.',
          'Número de teléfono.',
          'Correo electrónico.',
          'Dirección o ubicación relacionada con el servicio solicitado.',
          'Información relacionada con el inmueble, negocio o lugar donde se solicita una evaluación.',
          'Información proporcionada voluntariamente en formularios, mensajes o solicitudes.',
          'Datos relacionados con servicios, proyectos y garantías cuando el usuario ya sea cliente de APE Multiservicios SRL.',
        ],
      },
      'También podrán recopilarse determinados datos técnicos necesarios para el funcionamiento y seguridad del sitio, como dirección IP, tipo de navegador, dispositivo utilizado, fecha y hora de acceso y registros técnicos de actividad.',
    ],
  },
  {
    heading: 'Finalidad del tratamiento de los datos',
    body: [
      'La información recopilada podrá ser utilizada para:',
      {
        list: [
          'Atender solicitudes de información o contacto.',
          'Evaluar solicitudes relacionadas con productos y servicios.',
          'Preparar y dar seguimiento a cotizaciones o proyectos.',
          'Comunicarse con clientes y potenciales clientes.',
          'Gestionar servicios contratados.',
          'Registrar y verificar garantías.',
          'Mantener registros administrativos y comerciales.',
          'Mejorar el funcionamiento y seguridad de la plataforma.',
          'Prevenir usos fraudulentos o no autorizados.',
          'Cumplir obligaciones legales o regulatorias aplicables.',
        ],
      },
      'APE Multiservicios SRL procurará utilizar los datos personales únicamente para las finalidades para las cuales fueron recopilados o para otros usos legítimamente relacionados con la prestación de sus servicios.',
    ],
  },
  {
    heading: 'Datos de clientes y garantías',
    body: [
      'Cuando una persona contrate productos o servicios de APE Multiservicios SRL, determinada información podrá conservarse como parte de su historial de cliente, incluyendo datos relacionados con proyectos, facturas, pagos, productos instalados y garantías.',
      'La plataforma podrá permitir la verificación de determinadas garantías mediante un número, código, código QR u otro mecanismo de consulta.',
      'La información mostrada públicamente mediante estos mecanismos deberá limitarse a los datos necesarios para comprobar la autenticidad y estado de la garantía, evitando exponer innecesariamente información personal del cliente.',
    ],
  },
  {
    heading: 'Protección de la información',
    body: [
      'APE Multiservicios SRL adoptará medidas técnicas y organizativas razonables destinadas a proteger la información almacenada contra acceso no autorizado, pérdida, alteración, divulgación o uso indebido.',
      'Estas medidas podrán incluir controles de acceso, autenticación de usuarios, conexiones seguras, restricciones según roles, copias de seguridad y otras medidas de seguridad aplicables a la plataforma.',
      'No obstante, ningún sistema informático o método de transmisión de información a través de Internet puede garantizar seguridad absoluta.',
    ],
  },
  {
    heading: 'Acceso a la información',
    body: [
      'El acceso a la información personal estará limitado al personal autorizado que necesite utilizarla para cumplir funciones relacionadas con la prestación, administración o soporte de los servicios de APE Multiservicios SRL.',
      'Los usuarios internos de la plataforma deberán acceder únicamente a la información necesaria según las funciones y permisos que les hayan sido asignados.',
    ],
  },
  {
    heading: 'Compartición de información',
    body: [
      'APE Multiservicios SRL no comercializará ni venderá los datos personales recopilados a través de su plataforma.',
      'La información podrá ser compartida cuando sea necesario con proveedores que participen en la prestación o funcionamiento de los servicios, siempre dentro de los límites necesarios para cumplir dicha finalidad.',
      'También podrá ser comunicada cuando exista una obligación legal, requerimiento de una autoridad competente o cuando resulte necesario para proteger derechos legítimos de APE Multiservicios SRL o de terceros.',
    ],
  },
  {
    heading: 'Servicios tecnológicos de terceros',
    body: [
      'Para operar su plataforma, APE Multiservicios SRL podrá utilizar servicios tecnológicos proporcionados por terceros, tales como infraestructura en la nube, alojamiento web, bases de datos, servicios de correo electrónico, almacenamiento u otras herramientas necesarias para el funcionamiento del sistema.',
      'Como consecuencia, determinados datos podrán ser procesados o almacenados mediante la infraestructura de dichos proveedores.',
      'APE Multiservicios SRL procurará utilizar proveedores que ofrezcan medidas adecuadas de seguridad y protección de la información.',
    ],
  },
  {
    heading: 'Conservación de los datos',
    body: [
      'Los datos personales serán conservados durante el tiempo necesario para cumplir las finalidades para las cuales fueron recopilados y atender las obligaciones comerciales, administrativas, contractuales o legales correspondientes.',
      'Determinada información relacionada con facturas, pagos, proyectos y garantías podrá conservarse durante períodos mayores cuando sea necesario para mantener registros comerciales, comprobar operaciones realizadas o atender obligaciones legales.',
      'Cuando la información deje de ser necesaria, podrá ser eliminada, anonimizada o archivada de acuerdo con las políticas y obligaciones aplicables.',
    ],
  },
  {
    heading: 'Derechos del titular de los datos',
    body: [
      'El titular de los datos podrá solicitar, según corresponda y conforme a la legislación aplicable:',
      {
        list: [
          'Acceso a sus datos personales.',
          'Corrección o actualización de información incorrecta o desactualizada.',
          'Información sobre el tratamiento de sus datos.',
          'Supresión de determinada información cuando legalmente proceda.',
          'Oposición a determinados usos de sus datos cuando corresponda.',
        ],
      },
      'Para realizar una solicitud, el titular podrá comunicarse con APE Multiservicios SRL mediante los canales de contacto oficiales establecidos por la empresa.',
      'APE Multiservicios SRL podrá solicitar información razonable para verificar la identidad de la persona antes de atender solicitudes relacionadas con datos personales.',
    ],
  },
  {
    heading: 'Cookies y tecnologías similares',
    body: [
      'El sitio podrá utilizar cookies u otras tecnologías necesarias para permitir determinadas funcionalidades, mantener sesiones, mejorar la seguridad y analizar el funcionamiento de la plataforma.',
      'Cuando se incorporen cookies o tecnologías que requieran consentimiento conforme a la legislación aplicable, se proporcionarán los mecanismos correspondientes para informar al usuario y gestionar sus preferencias.',
    ],
  },
  {
    heading: 'Enlaces y servicios externos',
    body: [
      'El sitio podrá contener enlaces hacia páginas, plataformas o servicios administrados por terceros.',
      'APE Multiservicios SRL no controla las prácticas de privacidad de sitios externos, por lo que se recomienda consultar sus respectivas políticas de privacidad antes de proporcionar información personal.',
    ],
  },
  {
    heading: 'Menores de edad',
    body: [
      'Los servicios ofrecidos mediante esta plataforma no están dirigidos específicamente a menores de edad.',
      'APE Multiservicios SRL no busca recopilar intencionalmente información personal de menores sin la autorización que corresponda.',
    ],
  },
  {
    heading: 'Modificaciones de esta política',
    body: [
      'APE Multiservicios SRL podrá actualizar esta Política de Privacidad para reflejar cambios en sus servicios, procesos, tecnologías o requisitos legales.',
      'La versión vigente será publicada en el sitio indicando la fecha de su última actualización.',
    ],
  },
  {
    heading: 'Contacto',
    body: [
      'Para consultas, solicitudes o inquietudes relacionadas con esta Política de Privacidad o con el tratamiento de datos personales, el usuario podrá comunicarse con:',
      {
        lines: [
          'APE Multiservicios SRL',
          'Correo electrónico: {{EMAIL_APE}}',
          'Teléfono: {{TELÉFONO_APE}}',
          'Dirección: {{DIRECCIÓN_APE}}',
        ],
      },
    ],
  },
]

export default function PrivacidadPage() {
  return (
    <LegalDoc
      titulo="Política de Privacidad"
      fecha="3 de septiembre de 2026"
      intro={INTRO}
      secciones={SECCIONES}
    />
  )
}
