export const theme = {
  colors: {
    graphite: '#0a0a0a',
    pureBlack: '#000000',
    carbon: '#171717',
    concrete: '#737373',
    ash: '#a1a1a1',
    smoke: '#b9b9b9',
    hairline: '#e5e5e5',
    mist: '#f2f2f2',
    chalk: '#ffffff',
  },

  typography: {
    sizes: {
      xs: 12,
      sm: 13,
      base: 14,
      md: 16,
      lg: 18,
      display: 48,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
    },
  },

  spacing: {
    '1': 4,
    '1.25': 5,
    '1.5': 6,
    '2': 8,
    '2.5': 10,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '8': 32,
    '10': 40,
    '20': 80,
  },

  radius: {
    md: 4,
    lg: 10,
    xl: 14,
    badges: 26,
    pills: 9999,
  },
} as const;
