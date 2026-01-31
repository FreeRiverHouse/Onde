/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Maritime Relaxing Palette - Mare Calmo
        'onde': {
          // Primary Dark Backgrounds - Blu oceano profondo
          dark: '#0B1929',
          'dark-blue': '#0D2137',
          'dark-surface': '#122A42',
          'dark-elevated': '#1A3A52',

          // Maritime Accents - Turchese, Azzurro, Oro, Lapislazzuli
          coral: '#D4AF37',           // Oro (sostituisce coral)
          'coral-light': '#E5C158',
          gold: '#D4AF37',             // Oro
          'gold-light': '#E5C158',
          teal: '#5B9AA0',             // Turchese soft
          'teal-light': '#7EB8C4',
          blue: '#26619C',             // Blu lapislazzuli
          'blue-light': '#4A7C9B',
          purple: '#4A7C9B',           // Azzurro profondo
          'purple-light': '#6B9BB8',
          cyan: '#7EB8C4',             // Azzurro soft
          'cyan-light': '#A5D4DC',
          pink: '#5B9AA0',             // Turchese (sostituisce pink)
          'pink-light': '#7EB8C4',

          // Maritime colors
          ocean: '#26619C',            // Blu lapislazzuli
          'ocean-light': '#4A7C9B',
          'ocean-dark': '#1A4A7A',
          cream: '#F5F5F5',            // Bianco
          'cream-dark': '#E8E8E8',
          sand: '#D4AF37',             // Oro
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
          radial-gradient(ellipse 100% 100% at 50% 0%, rgba(38, 97, 156, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse 80% 60% at 100% 50%, rgba(91, 154, 160, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse 60% 80% at 0% 100%, rgba(126, 184, 196, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse 50% 50% at 50% 50%, rgba(212, 175, 55, 0.06) 0%, transparent 70%)
        `,
        'gradient-hero': `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(38, 97, 156, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 50%, rgba(91, 154, 160, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse 50% 30% at 20% 80%, rgba(212, 175, 55, 0.06) 0%, transparent 50%)
        `,
        'gradient-neon': 'linear-gradient(135deg, #5B9AA0 0%, #26619C 50%, #4A7C9B 100%)',
        'gradient-fire': 'linear-gradient(135deg, #D4AF37 0%, #E5C158 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #26619C 0%, #5B9AA0 50%, #7EB8C4 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #D4AF37 0%, #5B9AA0 50%, #7EB8C4 100%)',
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
        // 🎨 Skin Creator Premium Animations
        'skin-fade-in-up': 'skinFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'skin-scale-in': 'skinScaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'skin-slide-left': 'skinSlideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'skin-slide-right': 'skinSlideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'skin-glow': 'skinGlow 2s ease-in-out infinite',
        'skin-float': 'skinFloat 4s ease-in-out infinite',
        'skin-shimmer': 'skinShimmer 2s linear infinite',
        'skin-bounce': 'skinBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'skin-wiggle': 'skinWiggle 0.5s ease-in-out',
        'skin-pop': 'skinPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'skin-pulse': 'skinPulse 2s ease-in-out infinite',
        'skin-rotate-glow': 'skinRotateGlow 8s linear infinite',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(91, 154, 160, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(91, 154, 160, 0.4), 0 0 60px rgba(38, 97, 156, 0.3)' },
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
        // 🎨 Skin Creator Premium Keyframes
        skinFadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        skinScaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        skinSlideLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        skinSlideRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        skinGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)' },
        },
        skinFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        skinShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        skinBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        skinWiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        skinPop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        skinPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        skinRotateGlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        // Glow shadows - Maritime soft
        'glow-teal': '0 0 30px rgba(91, 154, 160, 0.3)',
        'glow-blue': '0 0 30px rgba(38, 97, 156, 0.3)',
        'glow-purple': '0 0 30px rgba(74, 124, 155, 0.3)',
        'glow-coral': '0 0 30px rgba(212, 175, 55, 0.3)',
        'glow-gold': '0 0 30px rgba(212, 175, 55, 0.3)',
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
