/** @type {import('tailwindcss').Config} */
// Design tokens del handoff. Nombres de color propios para no chocar con utilidades
// nativas de Tailwind (los bordes van como `edge` en vez de `border`).
//
// TEMA: los tokens SEMÁNTICOS salen de variables CSS definidas en index.css (:root y
// .dark). Así `bg-surface`, `text-brand-text`, `border-edge`… cambian solos con el tema
// y NO hace falta un `dark:` en cada componente. Se usa rgb(var(--x) / <alpha-value>)
// porque el código aplica opacidades (bg-edge-soft/40, ring-primary/15, …).
const themed = (name) => `rgb(var(--c-${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // brand DEFAULT/dark son FIJOS: el sidebar y el overlay del modal son navy en
        // ambos temas. Solo el texto de marca cambia con el tema.
        brand: { DEFAULT: '#0E3358', dark: '#0B2440', text: themed('brand-text') },

        // `primary` = acento (texto, bordes, rellenos). `primary-solid` = fondo de botón
        // con texto blanco. Van separados porque en oscuro el acento se aclara para leerse
        // sobre el fondo, y un fondo de botón claro dejaría el texto blanco ilegible.
        primary: {
          DEFAULT: themed('primary'),
          soft: themed('primary-soft'),
          solid: themed('primary-solid'),
          'solid-hover': themed('primary-solid-hover'),
        },
        // En los badges, `soft` es el fondo y `strong` el texto: en oscuro se invierten
        // (fondo oscuro + texto claro) para que sigan distinguiéndose.
        green: { DEFAULT: themed('green'), strong: themed('green-strong'), soft: themed('green-soft') },
        amber: { DEFAULT: themed('amber'), strong: themed('amber-strong'), soft: themed('amber-soft') },
        danger: {
          DEFAULT: themed('danger'),
          strong: themed('danger-strong'),
          soft: themed('danger-soft'),
          solid: themed('danger-solid'),
          'solid-hover': themed('danger-solid-hover'),
        },
        purple: { DEFAULT: themed('purple'), strong: themed('purple-strong'), soft: themed('purple-soft') },
        orange: { DEFAULT: themed('orange'), strong: themed('orange-strong'), soft: themed('orange-soft') },

        appbg: themed('appbg'),
        surface: themed('surface'),
        edge: { DEFAULT: themed('edge'), soft: themed('edge-soft') },
        muted: { DEFAULT: themed('muted'), 2: themed('muted-2') },
        faint: { DEFAULT: themed('faint'), 2: themed('faint-2') },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'sans-serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      boxShadow: {
        // También por variable: la sombra navy del tema claro se pierde sobre un fondo
        // oscuro, así que en oscuro se usa uná más profunda.
        card: 'var(--shadow-card)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(180deg, #0E3358 0%, #0B2440 100%)',
      },
    },
  },
  plugins: [],
}
