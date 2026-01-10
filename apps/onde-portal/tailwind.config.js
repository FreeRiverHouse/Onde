/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Cinematic Dark Palette
        'onde': {
          // Primary Dark Backgrounds
          dark: '#0A0A0F',
          'dark-blue': '#0F1629',
          'dark-surface': '#12152B',
          'dark-elevated': '#1A1F3D',

          // Neon Accents
          coral: '#FF6B6B',
          'coral-light': '#FF8E8E',
          gold: '#FFD93D',
          'gold-light': '#FFE566',
          teal: '#4ECDC4',
          'teal-light': '#7EDDD6',
          blue: '#6C63FF',
          'blue-light': '#8B83FF',
          purple: '#A855F7',
          'purple-light': '#C084FC',
          cyan: '#22D3EE',
          'cyan-light': '#67E8F9',
          pink: '#EC4899',
          'pink-light': '#F472B6',

          // Legacy (for compatibility)
          ocean: '#1B4F72',
          'ocean-light': '#2980B9',
          'ocean-dark': '#154360',
          cream: '#FDF6E3',
          'cream-dark': '#F5E6C8',
          sand: '#F5DEB3',
        },
      },
      fontFamily: {
        'display': ['Georgia', 'Cambria', 'serif'],
        'body': ['system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        // Cinematic Gradients
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': `
          radial-gradient(ellipse 100% 100% at 50% 0%, rgba(108, 99, 255, 0.2) 0%, transparent 50%),
          radial-gradient(ellipse 80% 60% at 100% 50%, rgba(78, 205, 196, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse 60% 80% at 0% 100%, rgba(255, 107, 107, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse 50% 50% at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 70%)
        `,
        'gradient-hero': `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(108, 99, 255, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 50%, rgba(78, 205, 196, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse 50% 30% at 20% 80%, rgba(255, 107, 107, 0.08) 0%, transparent 50%)
        `,
        'gradient-neon': 'linear-gradient(135deg, #4ECDC4 0%, #6C63FF 50%, #A855F7 100%)',
        'gradient-fire': 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #1B4F72 0%, #2980B9 50%, #48C9B0 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 50%, #4ECDC4 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'spin-slow': 'spin 20s linear infinite',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'scale-up': 'scaleUp 0.6s ease-out forwards',
        'orb-float': 'orbFloat 20s ease-in-out infinite',
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
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(78, 205, 196, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(78, 205, 196, 0.6), 0 0 60px rgba(108, 99, 255, 0.4)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        orbFloat: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '75%': { transform: 'translate(-30px, -10px) scale(1.05)' },
        },
      },
      boxShadow: {
        // Glow shadows
        'glow-teal': '0 0 30px rgba(78, 205, 196, 0.4)',
        'glow-blue': '0 0 30px rgba(108, 99, 255, 0.4)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.4)',
        'glow-coral': '0 0 30px rgba(255, 107, 107, 0.4)',
        'glow-gold': '0 0 30px rgba(255, 217, 61, 0.4)',
        // Card shadows
        'card': '0 10px 40px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(108, 99, 255, 0.1)',
        // Glass shadows
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        // Legacy
        'watercolor': '0 4px 30px rgba(255, 127, 127, 0.15), 0 8px 60px rgba(72, 201, 176, 0.1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backdropBlur: {
        'xs': '2px',
        '3xl': '64px',
      },
    },
  },
  plugins: [],
}
