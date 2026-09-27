export const THEME = {
  colors: {
    primaryNavy: '#0A192F',
    primaryDeep: '#0D2240',
    primaryBlue: '#0284C7',
    primaryLight: '#E0F2FE',
    accentCyan: '#06B6D4',
    background: '#F1F5F9',
    cardBackground: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    border: '#CBD5E1',
    borderLight: '#E2E8F0',
    
    // Status colors
    safeGreen: '#16A34A',
    safeGreenLight: '#DCFCE7',
    cautionAmber: '#D97706',
    cautionAmberLight: '#FEF3C7',
    warningRed: '#DC2626',
    warningRedLight: '#FEE2E2',
    
    // Offline status
    offlineOrange: '#EA580C',
    onlineGreen: '#10B981',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },
  typography: {
    title: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: '#0F172A',
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '500' as const,
      color: '#475569',
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700' as const,
      color: '#0D2240',
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: '#334155',
    },
    badge: {
      fontSize: 12,
      fontWeight: '600' as const,
    },
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
  },
};
