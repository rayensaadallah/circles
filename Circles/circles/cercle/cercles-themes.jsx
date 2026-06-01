// cercles-themes.jsx — three visual directions for Cercles

const CERCLES_THEMES = {
  blockParty: {
    name: 'Block Party',
    tagline: 'Risograph · paper · stickers',
    bg: '#f4ecd8',          // warm parchment
    bgAlt: '#ebdfc1',
    ink: '#1a1410',         // deep ink
    inkSoft: '#5a4a35',
    paper: '#fbf6e8',
    accents: {
      coral: '#ff5a3c',
      lime: '#c8e84a',
      cobalt: '#2d4cf5',
      yellow: '#ffc83a',
      plum: '#7a3a8a',
    },
    primary: '#ff5a3c',
    primaryFg: '#fbf6e8',
    radius: 24,
    radiusSm: 14,
    fontDisplay: '"Space Grotesk", system-ui, sans-serif',
    fontBody: 'Inter, system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
    displayWeight: 700,
    letterSpacing: '-0.02em',
    cardBorder: '1.5px solid #1a1410',
    cardShadow: '4px 4px 0 #1a1410',
    noise: true,
  },
  arena: {
    name: 'Arena',
    tagline: 'Dark · neon · high stakes',
    bg: '#0b0a14',
    bgAlt: '#16142a',
    ink: '#f4f0ff',
    inkSoft: 'rgba(244,240,255,0.55)',
    paper: '#1a1830',
    accents: {
      coral: '#ff3d6e',
      lime: '#b9ff3d',
      cobalt: '#5b6bff',
      yellow: '#ffd23d',
      plum: '#c45bff',
    },
    primary: '#b9ff3d',
    primaryFg: '#0b0a14',
    radius: 22,
    radiusSm: 12,
    fontDisplay: '"Space Grotesk", system-ui, sans-serif',
    fontBody: 'Inter, system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
    displayWeight: 700,
    letterSpacing: '-0.025em',
    cardBorder: '1px solid rgba(244,240,255,0.12)',
    cardShadow: '0 0 0 1px rgba(244,240,255,0.06), 0 20px 40px -10px rgba(91,107,255,0.25)',
    noise: false,
  },
  softCircle: {
    name: 'Soft Circle',
    tagline: 'Pastel · rounded · friendly',
    bg: '#fef5f0',
    bgAlt: '#fbe6dc',
    ink: '#2a1f3a',
    inkSoft: '#7a6e8a',
    paper: '#ffffff',
    accents: {
      coral: '#ff9a8b',
      lime: '#a8e6a3',
      cobalt: '#9bb3ff',
      yellow: '#ffd97d',
      plum: '#d4a8e8',
    },
    primary: '#ff9a8b',
    primaryFg: '#2a1f3a',
    radius: 28,
    radiusSm: 18,
    fontDisplay: '"Fraunces", "Instrument Serif", Georgia, serif',
    fontBody: 'Inter, system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
    displayWeight: 600,
    letterSpacing: '-0.015em',
    cardBorder: 'none',
    cardShadow: '0 1px 2px rgba(42,31,58,0.04), 0 8px 24px rgba(42,31,58,0.06)',
    noise: false,
  },
};

// Riso-noise utility — tiny grainy overlay used by Block Party
const noiseDataUrl = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

window.CERCLES_THEMES = CERCLES_THEMES;
window.CERCLES_NOISE = noiseDataUrl;
