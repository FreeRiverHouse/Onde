// AIKO Design System - Based on the watercolor illustrations
export const colors = {
  // Primary palette from illustrations
  sky: {
    light: '#E8F4F8',
    main: '#A8D8EA',
    dark: '#7AB8D1',
  },
  golden: {
    light: '#FFF9E6',
    main: '#FFE4A3',
    warm: '#FFCF66',
    sunset: '#FFB347',
  },
  aiko: {
    glow: '#4DD0E1',
    eye: '#00BCD4',
    metal: '#B0BEC5',
  },
  nature: {
    grass: '#AED581',
    earth: '#C8B896',
    cloud: '#FFFFFF',
  },
  text: {
    primary: '#37474F',
    secondary: '#78909C',
    light: '#FFFFFF',
  },
  background: {
    cream: '#FFF8E1',
    white: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  interactive: {
    primary: '#4DD0E1',
    success: '#81C784',
    warning: '#FFB74D',
    error: '#E57373',
  }
};

export const typography = {
  title: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  body: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
    color: colors.text.primary,
  },
  caption: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  button: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.light,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
