export type ThemeName = 'blockParty' | 'arena' | 'softCircle';

export interface CTheme {
  name: string;
  tagline: string;
  bg: string;
  bgAlt: string;
  ink: string;
  inkSoft: string;
  paper: string;
  accents: {
    coral: string;
    lime: string;
    cobalt: string;
    yellow: string;
    plum: string;
  };
  primary: string;
  primaryFg: string;
  radius: number;
  radiusSm: number;
  fontDisplay: string;
  fontBody: string;
  fontBodyMed: string;
  fontBodyBold: string;
  letterSpacing: number;
  cardBorder: boolean;
  cardBorderColor: string;
  cardBorderWidth: number;
  shadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  isHardShadow: boolean;
}

export const THEMES: Record<ThemeName, CTheme> = {
  blockParty: {
    name: 'Block Party',
    tagline: 'Risograph · paper · stickers',
    bg: '#f4ecd8',
    bgAlt: '#ebdfc1',
    ink: '#1a1410',
    inkSoft: '#5a4a35',
    paper: '#fbf6e8',
    accents: { coral: '#ff5a3c', lime: '#c8e84a', cobalt: '#2d4cf5', yellow: '#ffc83a', plum: '#7a3a8a' },
    primary: '#ff5a3c',
    primaryFg: '#fbf6e8',
    radius: 24,
    radiusSm: 14,
    fontDisplay: 'SpaceGrotesk_700Bold',
    fontBody: 'Inter_400Regular',
    fontBodyMed: 'Inter_500Medium',
    fontBodyBold: 'Inter_600SemiBold',
    letterSpacing: -0.5,
    cardBorder: true,
    cardBorderColor: '#1a1410',
    cardBorderWidth: 1.5,
    shadow: { shadowColor: '#1a1410', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 0 },
    isHardShadow: true,
  },
  arena: {
    name: 'Arena',
    tagline: 'Dark · neon · high stakes',
    bg: '#0b0a14',
    bgAlt: '#16142a',
    ink: '#f4f0ff',
    inkSoft: 'rgba(244,240,255,0.55)',
    paper: '#1a1830',
    accents: { coral: '#ff3d6e', lime: '#b9ff3d', cobalt: '#5b6bff', yellow: '#ffd23d', plum: '#c45bff' },
    primary: '#b9ff3d',
    primaryFg: '#0b0a14',
    radius: 22,
    radiusSm: 12,
    fontDisplay: 'SpaceGrotesk_700Bold',
    fontBody: 'Inter_400Regular',
    fontBodyMed: 'Inter_500Medium',
    fontBodyBold: 'Inter_600SemiBold',
    letterSpacing: -0.5,
    cardBorder: true,
    cardBorderColor: 'rgba(244,240,255,0.12)',
    cardBorderWidth: 1,
    shadow: { shadowColor: '#5b6bff', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
    isHardShadow: false,
  },
  softCircle: {
    name: 'Soft Circle',
    tagline: 'Pastel · rounded · friendly',
    bg: '#fef5f0',
    bgAlt: '#fbe6dc',
    ink: '#2a1f3a',
    inkSoft: '#7a6e8a',
    paper: '#ffffff',
    accents: { coral: '#ff9a8b', lime: '#a8e6a3', cobalt: '#9bb3ff', yellow: '#ffd97d', plum: '#d4a8e8' },
    primary: '#ff9a8b',
    primaryFg: '#2a1f3a',
    radius: 28,
    radiusSm: 18,
    fontDisplay: 'Fraunces_600SemiBold',
    fontBody: 'Inter_400Regular',
    fontBodyMed: 'Inter_500Medium',
    fontBodyBold: 'Inter_600SemiBold',
    letterSpacing: -0.3,
    cardBorder: false,
    cardBorderColor: 'transparent',
    cardBorderWidth: 0,
    shadow: { shadowColor: '#2a1f3a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
    isHardShadow: false,
  },
};

export const DEFAULT_THEME: ThemeName = 'arena';
