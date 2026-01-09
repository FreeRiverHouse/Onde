/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        onde: {
          cream: '#FDF8F3',
          sand: '#E8DDD4',
          terracotta: '#C67B5C',
          rust: '#A65D3F',
          ocean: '#2C5F6A',
          deep: '#1A3A40',
          gold: '#D4A853',
          warm: '#F5EDE6',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
