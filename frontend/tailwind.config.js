/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eefcf4',
          100: '#d5f7e4',
          200: '#aef0ce',
          300: '#76e2ae',
          400: '#3dcc8d',
          500: '#1bb070',
          600: '#108e57',
          700: '#0d7147',
          800: '#0b2d1c', // Deep forest card
          900: '#061a10', // Forest background
          950: '#030d08', // Midnight forest
        },
        limeAccent: {
          50: '#f6ffeb',
          100: '#eaffc7',
          200: '#d3ff96',
          300: '#b4fe57',
          400: '#9eff00', // Vibrant accent
          500: '#84e600',
          600: '#66b300',
          750: '#a7f542', // Soft lime accent
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glassLight: '0 8px 32px 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
