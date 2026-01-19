/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'corde': {
          'bg': '#0a0a0f',
          'surface': '#1a1a24',
          'border': '#2a2a3a',
          'accent': '#00bfff',
          'accent-warm': '#ff6b35',
          'text': '#e0e0e0',
          'muted': '#808090',
        }
      }
    },
  },
  plugins: [],
}
