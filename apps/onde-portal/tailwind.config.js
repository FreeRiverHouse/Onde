/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Palette Onde - Stile Acquarello
        'onde': {
          coral: '#FF7F7F',
          'coral-light': '#FFB3B3',
          'coral-dark': '#E65C5C',
          gold: '#F4D03F',
          'gold-light': '#F9E79F',
          'gold-dark': '#D4AC0D',
          teal: '#48C9B0',
          'teal-light': '#A3E4D7',
          'teal-dark': '#17A589',
          blue: '#5DADE2',
          'blue-light': '#AED6F1',
          'blue-dark': '#2E86C1',
          ocean: '#1B4F72',
          'ocean-light': '#2980B9',
          'ocean-dark': '#154360',
          // Neutrali
          cream: '#FDF6E3',
          'cream-dark': '#F5E6C8',
          sand: '#F5DEB3',
          'dark': '#1A1A2E',
          'dark-blue': '#16213E',
        },
      },
      fontFamily: {
        'display': ['Georgia', 'Cambria', 'serif'],
        'body': ['system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'watercolor-1': 'radial-gradient(ellipse at 20% 30%, rgba(255, 127, 127, 0.15) 0%, transparent 50%)',
        'watercolor-2': 'radial-gradient(ellipse at 80% 70%, rgba(72, 201, 176, 0.12) 0%, transparent 50%)',
        'watercolor-3': 'radial-gradient(ellipse at 50% 50%, rgba(244, 208, 63, 0.1) 0%, transparent 60%)',
        'watercolor-blend': `
          radial-gradient(ellipse at 10% 20%, rgba(255, 127, 127, 0.18) 0%, transparent 40%),
          radial-gradient(ellipse at 90% 80%, rgba(72, 201, 176, 0.15) 0%, transparent 40%),
          radial-gradient(ellipse at 50% 50%, rgba(244, 208, 63, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 30% 70%, rgba(93, 173, 226, 0.1) 0%, transparent 45%)
        `,
        'gradient-ocean': 'linear-gradient(135deg, #1B4F72 0%, #2980B9 50%, #48C9B0 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF7F7F 0%, #F4D03F 50%, #48C9B0 100%)',
        'gradient-warm': 'linear-gradient(180deg, #FDF6E3 0%, #F5DEB3 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'wave': 'wave 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(5px) rotate(2deg)' },
          '75%': { transform: 'translateX(-5px) rotate(-2deg)' },
        },
      },
      boxShadow: {
        'watercolor': '0 4px 30px rgba(255, 127, 127, 0.15), 0 8px 60px rgba(72, 201, 176, 0.1)',
        'card': '0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 10px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.15), 0 5px 20px rgba(0, 0, 0, 0.08)',
        'glow-coral': '0 0 30px rgba(255, 127, 127, 0.4)',
        'glow-gold': '0 0 30px rgba(244, 208, 63, 0.4)',
        'glow-teal': '0 0 30px rgba(72, 201, 176, 0.4)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
