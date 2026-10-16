import { memo, useState, useEffect } from 'react';
import { C } from '../constants/theme';

const FONTS = [
  // Mevcut
  { name: 'Plus Jakarta Sans', weight: '800', google: 'Plus+Jakarta+Sans:wght@800', current: true, tag: 'Mevcut' },
  // Rounded & Soft
  { name: 'Nunito', weight: '800', google: 'Nunito:wght@800', tag: 'Rounded' },
  { name: 'Quicksand', weight: '700', google: 'Quicksand:wght@700', tag: 'Rounded' },
  { name: 'Comfortaa', weight: '700', google: 'Comfortaa:wght@700', tag: 'Yaratıcı' },
  // Geometric & Modern
  { name: 'Poppins', weight: '700', google: 'Poppins:wght@700', tag: 'Geometric' },
  { name: 'Outfit', weight: '700', google: 'Outfit:wght@700', tag: 'Modern' },
  { name: 'Sora', weight: '700', google: 'Sora:wght@700', tag: 'Geometric' },
  // Creative & Unique
  { name: 'Fredoka', weight: '600', google: 'Fredoka:wght@600', tag: 'Yaratıcı' },
  { name: 'Grandstander', weight: '700', google: 'Grandstander:wght@700', tag: 'Yaratıcı' },
  { name: 'Baloo 2', weight: '700', google: 'Baloo+2:wght@700', tag: 'Display' },
  { name: 'Lexend', weight: '700', google: 'Lexend:wght@700', tag: 'Modern' },
  // Tech & Sharp
  { name: 'Space Grotesk', weight: '700', google: 'Space+Grotesk:wght@700', tag: 'Tech' },
  { name: 'Urbanist', weight: '800', google: 'Urbanist:wght@800', tag: 'Tech' },
  { name: 'Satoshi', weight: '700', google: 'Instrument+Sans:wght@700', tag: 'Tech' },
  { name: 'Red Hat Display', weight: '800', google: 'Red+Hat+Display:wght@800', tag: 'Display' },
  { name: 'Rubik', weight: '700', google: 'Rubik:wght@700', tag: 'Rounded' },
  // Vercel / Next.js
  { name: 'Geist', weight: '700', google: 'Geist:wght@700', tag: 'Tech' },
  { name: 'Geist Mono', weight: '700', google: 'Geist+Mono:wght@700', tag: 'Mono' },
  { name: 'Spectral', weight: '700', google: 'Spectral:wght@700', tag: 'Serif' },
  // ── Muzli 2026 Best Google Fonts ──
  { name: 'Inter', weight: '700', google: 'Inter:wght@700', tag: 'Sans' },
  { name: 'Roboto', weight: '700', google: 'Roboto:wght@700', tag: 'Sans' },
  { name: 'Open Sans', weight: '700', google: 'Open+Sans:wght@700', tag: 'Sans' },
  { name: 'Work Sans', weight: '700', google: 'Work+Sans:wght@700', tag: 'Sans' },
  { name: 'Merriweather', weight: '700', google: 'Merriweather:wght@700', tag: 'Serif' },
  { name: 'Lora', weight: '700', google: 'Lora:wght@700', tag: 'Serif' },
  { name: 'Libre Baskerville', weight: '700', google: 'Libre+Baskerville:wght@700', tag: 'Serif' },
  { name: 'Oswald', weight: '700', google: 'Oswald:wght@700', tag: 'Display' },
  { name: 'Anton', weight: '400', google: 'Anton', tag: 'Display' },
  { name: 'Montserrat', weight: '800', google: 'Montserrat:wght@800', tag: 'Geometric' },
  { name: 'Bebas Neue', weight: '400', google: 'Bebas+Neue', tag: 'Display' },
  { name: 'Roboto Slab', weight: '700', google: 'Roboto+Slab:wght@700', tag: 'Slab' },
  { name: 'Arvo', weight: '700', google: 'Arvo:wght@700', tag: 'Slab' },
  { name: 'Zilla Slab', weight: '700', google: 'Zilla+Slab:wght@700', tag: 'Slab' },
  { name: 'Bitter', weight: '700', google: 'Bitter:wght@700', tag: 'Slab' },
  { name: 'Pacifico', weight: '400', google: 'Pacifico', tag: 'Script' },
  { name: 'Dancing Script', weight: '700', google: 'Dancing+Script:wght@700', tag: 'Script' },
  { name: 'Great Vibes', weight: '400', google: 'Great+Vibes', tag: 'Script' },
  { name: 'Sacramento', weight: '400', google: 'Sacramento', tag: 'Script' },
  { name: 'JetBrains Mono', weight: '700', google: 'JetBrains+Mono:wght@700', tag: 'Mono' },
  { name: 'Source Code Pro', weight: '700', google: 'Source+Code+Pro:wght@700', tag: 'Mono' },
  { name: 'Inconsolata', weight: '700', google: 'Inconsolata:wght@700', tag: 'Mono' },
  { name: 'Fira Mono', weight: '700', google: 'Fira+Mono:wght@700', tag: 'Mono' },
];

const FontDemoPage = memo(({ onBack }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const families = FONTS.filter(f => !f.current).map(f => f.google).join('&family=');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    link.onload = () => setLoaded(true);
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', background: '#fff', minHeight: '100vh' }}>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.4rem', fontWeight: 800, color: C.primary, marginBottom: '0.3rem' }}>
        Font Karşılaştırma
      </h2>
      <p style={{ fontSize: '0.8rem', color: C.textM, marginBottom: '1.5rem' }}>
        "tyrosign" wordmark için font alternatifleri. Rounded geometric sans-serif ailesi.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {FONTS.map(({ name, weight, current, tag }) => (
          <div key={name} style={{
            padding: '1.25rem',
            borderRadius: 16,
            background: current ? `linear-gradient(135deg, ${C.primaryGhost}, rgba(30,58,95,0.04))` : C.card,
            border: `1.5px solid ${current ? C.primary + '22' : C.borderSub}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,58,95,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            {/* Font name + badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.text2 }}>{name}</span>
              {tag && (
                <span style={{
                  fontSize: '0.55rem', fontWeight: 700,
                  color: current ? C.accent : tag === 'Yaratıcı' ? '#9333ea' : tag === 'Tech' ? '#0098d4' : tag === 'Script' ? '#e11d48' : tag === 'Mono' ? '#059669' : tag === 'Serif' || tag === 'Slab' ? '#92400e' : tag === 'Display' ? '#c026d3' : C.text2,
                  background: current ? C.accentGhost : tag === 'Yaratıcı' ? '#f3e8ff' : tag === 'Tech' ? '#e0f7ff' : tag === 'Script' ? '#fff1f2' : tag === 'Mono' ? '#ecfdf5' : tag === 'Serif' || tag === 'Slab' ? '#fffbeb' : tag === 'Display' ? '#fdf4ff' : C.primaryGhost,
                  padding: '0.12rem 0.4rem', borderRadius: 6,
                }}>{tag.toUpperCase()}</span>
              )}
            </div>

            {/* tyrosign demo — large */}
            <div style={{ marginBottom: '0.6rem' }}>
              <span style={{
                fontFamily: `'${name}', sans-serif`,
                fontSize: '2.2rem',
                fontWeight: weight,
                letterSpacing: '-1.5px',
                color: C.primary,
              }}>tyro</span>
              <span style={{
                fontFamily: `'${name}', sans-serif`,
                fontSize: '2.2rem',
                fontWeight: weight,
                letterSpacing: '-1.5px',
                color: C.accent,
              }}>sign</span>
            </div>

            {/* Medium size */}
            <div style={{ marginBottom: '0.4rem' }}>
              <span style={{
                fontFamily: `'${name}', sans-serif`,
                fontSize: '1.1rem',
                fontWeight: weight,
                letterSpacing: '-0.5px',
                color: C.primary,
              }}>tyro</span>
              <span style={{
                fontFamily: `'${name}', sans-serif`,
                fontSize: '1.1rem',
                fontWeight: weight,
                letterSpacing: '-0.5px',
                color: C.accent,
              }}>sign</span>
              <span style={{ fontSize: '0.65rem', color: C.textM, marginLeft: '0.5rem' }}>Header boyutu</span>
            </div>

            {/* Character showcase */}
            <div style={{
              fontFamily: `'${name}', sans-serif`,
              fontSize: '0.85rem',
              fontWeight: weight,
              color: C.text2,
              letterSpacing: '1px',
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: `1px solid ${C.borderSub}`,
            }}>
              a b c d e f g h i j k l m n o p q r s t u v w x y z
            </div>

            {/* Key letters highlight */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
              {['t', 'y', 'g', 'o', 's'].map(ch => (
                <span key={ch} style={{
                  fontFamily: `'${name}', sans-serif`,
                  fontSize: '1.6rem',
                  fontWeight: weight,
                  color: ch === 'g' || ch === 's' ? C.accent : C.primary,
                  lineHeight: 1,
                }}>{ch}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {!loaded && (
        <p style={{ textAlign: 'center', color: C.textM, fontSize: '0.75rem', marginTop: '1rem' }}>
          Fontlar yükleniyor...
        </p>
      )}

      {/* Back button */}
      {onBack && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={onBack} style={{
            background: 'none', border: `1.5px solid ${C.borderSub}`,
            borderRadius: 10, padding: '0.5rem 1.5rem',
            fontSize: '0.8rem', fontWeight: 600, color: C.text2,
            cursor: 'pointer',
          }}>← Geri Dön</button>
        </div>
      )}
    </div>
  );
});

FontDemoPage.displayName = 'FontDemoPage';
export default FontDemoPage;
