import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sepia: {
          50: '#fdfcfa',
          100: '#f9f5ed',
          200: '#f3ebdb',
          300: '#e8d5b5',
          400: '#d4b896',
          500: '#c19a6b',
          600: '#a67c52',
          700: '#8b6242',
          800: '#704e35',
          900: '#5a3d2b',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            lineHeight: '1.8',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
