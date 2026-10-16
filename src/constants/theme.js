// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME (Light-only premium glass)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── SPACING (4px base grid) ───
export const S = {
  xs:  '0.25rem',  //  4px
  sm:  '0.5rem',   //  8px
  md:  '0.75rem',  // 12px
  lg:  '1rem',     // 16px
  xl:  '1.5rem',   // 24px
  xxl: '2rem',     // 32px
  xxxl:'3rem',     // 48px
};

// ─── TYPOGRAPHY ───
// ⚠️ ANAHTAR ÇAKIŞMASI DÜZELTİLDİ: font ailesi de punto ölçeği de `body` adını
// kullanıyordu → ikinci tanım birincisini eziyor, T.body font ailesi yerine
// '0.875rem' dönüyordu. Aileler artık *Family son ekli.
// NOT: T ve S şu an HİÇBİR yerde import edilmiyor (yalnız C kullanılıyor); tuzak
// olarak durmasın diye çakışma yine de giderildi.
export const T = {
  // Font families
  bodyFamily: 'Inter, sans-serif',
  heading: "'Plus Jakarta Sans', sans-serif",
  // Size scale
  micro:   '0.625rem', // 10px — badges, meta
  caption: '0.75rem',  // 12px — captions, labels
  body:    '0.875rem',  // 14px — body text
  subhead: '1rem',     // 16px — section headers
  title:   '1.125rem', // 18px — page titles
  display: '1.5rem',   // 24px — hero text
  // Weights
  regular: 400,
  medium:  500,
  semi:    600,
  bold:    700,
  extra:   800,
};

export const C = {
  primary: '#1e3a5f',
  primarySoft: '#2c5282',
  primaryGhost: 'rgba(30,58,95,0.06)',
  primaryLight: '#e8f0fe',
  accent: '#c8922a',
  accentSoft: '#d4a84b',
  accentGhost: 'rgba(200,146,42,0.08)',
  accentLight: '#faf3e6',
  divider: '#0098d4',
  bg: 'linear-gradient(160deg, #f0f4f8 0%, #e8edf4 40%, #f5f0eb 100%)',
  bgFlat: '#f2f5f9',
  glass: 'rgba(255,255,255,0.55)',
  glassSolid: 'rgba(255,255,255,0.82)',
  surface: 'rgba(255,255,255,0.72)',
  surfaceSolid: '#ffffff',
  border: 'rgba(255,255,255,0.85)',
  borderSub: 'rgba(30,58,95,0.08)',
  text1: '#1a202c',
  text2: '#4a5568',
  textM: '#94a3b8',
  ok: '#16a34a',
  err: '#dc2626',
  info: '#2563eb',
  shadow: '0 1px 2px rgba(30,58,95,0.04), 0 4px 16px rgba(30,58,95,0.06)',
  shadowLg: '0 8px 40px rgba(30,58,95,0.10)',
  shadowXl: '0 20px 60px rgba(30,58,95,0.12)',
};
