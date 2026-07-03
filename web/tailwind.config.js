/** @type {import('tailwindcss').Config} */
// Design tokens del handoff. Nombres de color propios para no chocar con utilidades
// nativas de Tailwind (los bordes van como `edge` en vez de `border`).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0E3358', dark: '#0B2440', text: '#0E2A47' },
        primary: { DEFAULT: '#1466D8', soft: '#E7F0FE' },
        green: { DEFAULT: '#18A957', strong: '#0F7A41', soft: '#E7F6EE' },
        amber: { DEFAULT: '#F5A623', strong: '#9A6510', soft: '#FEF4E2' },
        danger: { DEFAULT: '#E5484D', strong: '#C0362C', soft: '#FDECEC' },
        purple: { DEFAULT: '#8B5CF6', soft: '#EDE9FC' },
        orange: { DEFAULT: '#E5764D', soft: '#FCEEE8' },
        appbg: '#EDF2F8',
        surface: '#FFFFFF',
        edge: { DEFAULT: '#E6EDF4', soft: '#EEF2F7' },
        muted: { DEFAULT: '#5B7185', 2: '#6B8299' },
        faint: { DEFAULT: '#8397AB', 2: '#A2B3C4' },
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
        card: '0 1px 2px rgba(14, 42, 71, 0.04), 0 6px 20px rgba(14, 42, 71, 0.06)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(180deg, #0E3358 0%, #0B2440 100%)',
      },
    },
  },
  plugins: [],
}
