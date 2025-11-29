/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neutral: {
          750: '#333333',
          850: '#1a1a1a',
          950: '#0a0a0a',
        }
      }
    },
  },
  plugins: [],
  safelist: [
    // Safelist dynamic color classes used in the app
    {
      pattern: /bg-(indigo|amber|emerald|rose|cyan|blue|purple|teal|orange)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['dark', 'hover'],
    },
    {
      pattern: /text-(indigo|amber|emerald|rose|cyan|blue|purple|teal|orange)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['dark'],
    },
    {
      pattern: /border-(indigo|amber|emerald|rose|cyan|blue|purple|teal|orange)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['dark'],
    },
  ],
}
