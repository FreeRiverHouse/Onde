/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        sepia: {
          50: '#fdf8f3',
          100: '#f5ebe0',
          200: '#e8d5b9',
          300: '#d4b896',
          400: '#c4a373',
          500: '#b08d5b',
          600: '#9a7548',
          700: '#7f5f3c',
          800: '#6a4f35',
          900: '#5a432f',
        },
      },
    },
  },
  plugins: [],
};
