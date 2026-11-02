/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        toy: {
          blue: '#1565c0',
          'blue-dark': '#0d47a1',
          'blue-light': '#2196f3',
          red: '#d32f2f',
          'red-dark': '#b71c1c',
          'red-light': '#ef5350',
          yellow: '#ffc107',
          'yellow-light': '#ffea00',
          'yellow-dark': '#f57f17',
          flap: '#ffd54f'
        },
        tabletop: {
          base: '#0d131f',
          surface: '#141c2c',
          card: '#1b2438',
          border: '#2a3652',
          highlight: '#38486d'
        }
      },
      fontFamily: {
        display: ['"Fredoka"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
