/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        pixel: ['"VT323"', 'monospace'],
      },
      colors: {
        pastel: {
          bg: '#fdf6f6',
          text: '#2d2a2e',
          purple: '#e5d4ef',
          yellow: '#fcf6bd',
          green: '#d0f4de',
          blue: '#a9def9',
          border: '#e2e8f0'
        },
        accent: {
          pink: '#ff99c8',
          blue: '#a9def9'
        }
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}
