import { memo, useEffect, useRef } from 'react';

/* ── DinTech Style Logo — Rounded çerçeve + S-curve kalem ── */
const DinTechLogo = ({ size = 100 }) => {
  const s = size / 50; // scale factor
  return (
    <svg viewBox="0 0 50 52" fill="none" width={size} height={size * 1.04}>
      <defs>
        <linearGradient id="labGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0a832" />
          <stop offset="100%" stopColor="#c8922a" />
        </linearGradient>
        <linearGradient id="labBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0098d4" />
          <stop offset="100%" stopColor="#00b4e6" />
        </linearGradient>
      </defs>

      {/* === Navy rounded kare çerçeve === */}
      <path d="M14,4 L32,4 Q44,4 44,16 L44,36 Q44,48 32,48 L14,48 Q4,48 4,36 L4,16 Q4,4 14,4 Z"
        fill="none" stroke="#1e3a5f" strokeWidth="4.5" />

      {/* === S-curve — kalem silüeti === */}
      <path d="M30,10 Q36,10 36,18 Q36,26 24,26 Q12,26 12,34 Q12,42 18,42"
        fill="none" stroke="#1e3a5f" strokeWidth="4" strokeLinecap="round" />

      {/* === Turkuaz kare — sağ üst (cap) === */}
      <rect x="34" y="-2" width="12" height="12" rx="3" fill="url(#labBlue)" />
      <rect x="34" y="-2" width="5" height="12" rx="3" fill="#00c8f0" opacity="0.3" />

      {/* === Gold kare — sol alt (nib) === */}
      <rect x="2" y="38" width="12" height="12" rx="3" fill="url(#labGold)" />
      <rect x="2" y="38" width="5" height="12" rx="3" fill="#e0a832" opacity="0.3" />
    </svg>
  );
};

/* ── Network Dots 3D Logo ── */
const NetworkDotsLogo = ({ size = 120, dark = false }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = size;
    const h = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Piksel matrix versiyonu
    const NAVY = '#1e3a5f';
    const TURK = '#0098d4';
    const GOLD = '#c8922a';
    const px = w * 0.04; // piksel boyutu

    // Ana 3 nokta — üçgen formasyonu (piksel kare olacak)
    const mainDots = [
      { x: w * 0.5, y: h * 0.18, r: px * 1.6, color: NAVY, phase: 0 },
      { x: w * 0.22, y: h * 0.72, r: px * 1.4, color: TURK, phase: 2.1 },
      { x: w * 0.78, y: h * 0.72, r: px * 1.4, color: GOLD, phase: 4.2 },
    ];

    // Uydu pikseller — küçük
    const satDots = [
      { x: w * 0.35, y: h * 0.38, r: px * 0.7, color: NAVY, phase: 1.0 },
      { x: w * 0.65, y: h * 0.38, r: px * 0.7, color: TURK, phase: 3.2 },
      { x: w * 0.5, y: h * 0.58, r: px * 0.8, color: GOLD, phase: 5.0 },
      { x: w * 0.15, y: h * 0.45, r: px * 0.5, color: TURK, phase: 0.7 },
      { x: w * 0.85, y: h * 0.45, r: px * 0.5, color: GOLD, phase: 2.5 },
      { x: w * 0.5, y: h * 0.88, r: px * 0.55, color: NAVY, phase: 4.0 },
      // Extra scatter pikseller
      { x: w * 0.42, y: h * 0.25, r: px * 0.35, color: TURK, phase: 1.5 },
      { x: w * 0.58, y: h * 0.25, r: px * 0.35, color: GOLD, phase: 3.8 },
      { x: w * 0.3, y: h * 0.55, r: px * 0.4, color: NAVY, phase: 0.3 },
      { x: w * 0.7, y: h * 0.55, r: px * 0.4, color: TURK, phase: 2.8 },
      { x: w * 0.38, y: h * 0.82, r: px * 0.35, color: GOLD, phase: 4.5 },
      { x: w * 0.62, y: h * 0.82, r: px * 0.35, color: NAVY, phase: 5.5 },
    ];

    const allDots = [...mainDots, ...satDots];

    // Bağlantı çizgileri — hangi noktalar birbirine bağlı
    const connections = [
      [0, 1], [0, 2], [1, 2],  // ana üçgen
      [0, 3], [0, 4],          // üst → uydu
      [1, 3], [1, 5], [1, 6],  // sol → uydu
      [2, 4], [2, 7], [2, 8],  // sağ → uydu
      [3, 5], [4, 5],          // iç bağlantılar
      [6, 8],                   // alt çapraz
    ];

    let t = 0;
    const animate = () => {
      t += 0.015;
      ctx.clearRect(0, 0, w, h);

      // Bağlantı çizgileri
      connections.forEach(([a, b]) => {
        const da = allDots[a];
        const db = allDots[b];
        const ax = da.x + Math.sin(t + da.phase) * w * 0.015;
        const ay = da.y + Math.cos(t * 0.8 + da.phase) * h * 0.015;
        const bx = db.x + Math.sin(t + db.phase) * w * 0.015;
        const by = db.y + Math.cos(t * 0.8 + db.phase) * h * 0.015;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        const alpha = 0.12 + Math.sin(t * 0.5 + da.phase) * 0.06;
        ctx.strokeStyle = dark
          ? `rgba(255,255,255,${alpha + 0.05})`
          : `rgba(30,58,95,${alpha})`;
        ctx.lineWidth = w * 0.008;
        ctx.stroke();
      });

      // Piksel kareler
      allDots.forEach((dot) => {
        const dx = dot.x + Math.sin(t + dot.phase) * w * 0.012;
        const dy = dot.y + Math.cos(t * 0.8 + dot.phase) * h * 0.012;
        const s = dot.r * (1 + Math.sin(t * 2 + dot.phase) * 0.1);
        const alpha = 0.7 + Math.sin(t * 1.5 + dot.phase) * 0.3;

        // Glow (kare glow — yumuşak)
        ctx.shadowColor = dot.color;
        ctx.shadowBlur = s * 2;

        // Ana piksel kare
        ctx.fillStyle = dot.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(dx - s / 2, dy - s / 2, s, s);

        // İç parlama (küçük beyaz kare sol üst)
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(dx - s / 2, dy - s / 2, s * 0.4, s * 0.4);

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [size, dark]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
    />
  );
};

/* ── Wordmark with logo ── */
const DinTechWordmark = ({ logoSize = 40, fontSize = 28 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: logoSize * 0.25 }}>
    <DinTechLogo size={logoSize} />
    <span style={{
      fontFamily: "'Baloo 2','Plus Jakarta Sans',Inter,sans-serif",
      fontSize, fontWeight: 700, letterSpacing: -1, lineHeight: 1,
    }}>
      <span style={{ color: '#1e3a5f' }}>tyro</span>
      <span style={{ color: '#c8922a' }}>sign</span>
    </span>
  </div>
);

/* ── Lab Page ── */
const LogoLabPage = memo(function LogoLabPage({ onBack }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#fff', padding: '2rem',
      fontFamily: 'Inter, sans-serif', color: '#1e3a5f',
    }}>
      {/* Back button */}
      <button onClick={onBack} style={{
        background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
        padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem',
        color: '#64748b', marginBottom: '2rem',
      }}>
        ← Geri Dön
      </button>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Logo Lab — DinTech Style
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '3rem' }}>
        Rounded çerçeve + S-curve kalem silüeti. Turkuaz cap + Gold nib.
      </p>

      {/* === Hero — büyük logo === */}
      <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <DinTechLogo size={160} />
        </div>
        <DinTechWordmark logoSize={60} fontSize={42} />
      </section>

      {/* === Farklı boyutlar === */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Boyut Varyasyonları
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {[20, 30, 40, 50, 70, 100].map(s => (
            <div key={s} style={{ textAlign: 'center' }}>
              <DinTechLogo size={s} />
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>{s}px</div>
            </div>
          ))}
        </div>
      </section>

      {/* === Wordmark boyutları === */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Wordmark Boyutları
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: 6 }}>Header (küçük)</div>
            <DinTechWordmark logoSize={32} fontSize={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: 6 }}>Normal</div>
            <DinTechWordmark logoSize={42} fontSize={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: 6 }}>Hero (büyük)</div>
            <DinTechWordmark logoSize={60} fontSize={40} />
          </div>
        </div>
      </section>

      {/* === Dark background === */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Koyu Arkaplan
        </h3>
        <div style={{
          background: '#1e3a5f', borderRadius: 16, padding: '2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem',
        }}>
          <DinTechLogo size={60} />
          <span style={{
            fontFamily: "'Baloo 2','Plus Jakarta Sans',Inter,sans-serif",
            fontSize: 32, fontWeight: 700, letterSpacing: -1,
          }}>
            <span style={{ color: '#fff' }}>tyro</span>
            <span style={{ color: '#c8922a' }}>sign</span>
          </span>
        </div>
      </section>

      {/* === Network Dots 3D === */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Network Dots 3D
        </h3>

        {/* Beyaz arkaplan */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '2rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: '1.5rem',
          }}>
            <NetworkDotsLogo size={50} dark={false} />
            <span style={{
              fontFamily: "'Baloo 2','Plus Jakarta Sans',Inter,sans-serif",
              fontSize: 32, fontWeight: 700, letterSpacing: -1,
            }}>
              <span style={{ color: '#1e3a5f' }}>tyro</span>
              <span style={{ color: '#c8922a' }}>sign</span>
            </span>
          </div>
        </div>

        {/* Koyu arkaplan */}
        <div style={{
          background: '#1e3a5f', borderRadius: 20, padding: '2rem',
          display: 'flex', alignItems: 'center', gap: '1.5rem',
        }}>
          <NetworkDotsLogo size={50} dark={true} />
          <span style={{
            fontFamily: "'Baloo 2','Plus Jakarta Sans',Inter,sans-serif",
            fontSize: 32, fontWeight: 700, letterSpacing: -1,
          }}>
            <span style={{ color: '#fff' }}>tyro</span>
            <span style={{ color: '#c8922a' }}>sign</span>
          </span>
        </div>

        {/* Büyük hero versiyonlar */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <NetworkDotsLogo size={100} dark={false} />
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>160px Light</div>
          </div>
          <div style={{
            textAlign: 'center', background: '#1e3a5f', borderRadius: 16, padding: '1rem',
          }}>
            <NetworkDotsLogo size={100} dark={true} />
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>160px Dark</div>
          </div>
        </div>

        {/* App ikon versiyonlar */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 18,
            background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <NetworkDotsLogo size={40} dark={false} />
          </div>
          <div style={{
            width: 80, height: 80, borderRadius: 18,
            background: '#1e3a5f', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <NetworkDotsLogo size={40} dark={true} />
          </div>
          <div style={{
            width: 80, height: 80, borderRadius: 18,
            background: 'linear-gradient(135deg, #1e3a5f, #0098d4)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <NetworkDotsLogo size={40} dark={true} />
          </div>
        </div>
      </section>

      {/* === App icon mockup === */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          App İkon
        </h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Light */}
          <div style={{
            width: 80, height: 80, borderRadius: 18,
            background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DinTechLogo size={52} />
          </div>
          {/* Dark */}
          <div style={{
            width: 80, height: 80, borderRadius: 18,
            background: '#1e3a5f', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DinTechLogo size={52} />
          </div>
          {/* Gradient */}
          <div style={{
            width: 80, height: 80, borderRadius: 18,
            background: 'linear-gradient(135deg, #1e3a5f, #0098d4)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DinTechLogo size={52} />
          </div>
        </div>
      </section>
      {/* === Sadece Tyrosign Text — Koyu Arkaplan === */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Tyrosign Text Logo — Koyu Arkaplan
        </h3>

        {/* Navy bg */}
        <div style={{
          background: '#1e3a5f', borderRadius: 20, padding: '3rem 2rem',
          textAlign: 'center', marginBottom: '1rem',
        }}>
          <span style={{
            fontFamily: "'Baloo 2','Plus Jakarta Sans',Inter,sans-serif",
            fontSize: 48, fontWeight: 700, letterSpacing: -1.5,
          }}>
            <span style={{ color: '#fff' }}>tyro</span>
            <span style={{ color: '#c8922a' }}>sign</span>
          </span>
        </div>

        {/* Navy bg + dots */}
        <div style={{
          background: '#1e3a5f', borderRadius: 20, padding: '3rem 2rem',
          textAlign: 'center', marginBottom: '1rem',
        }}>
          <span style={{
            fontFamily: "'Baloo 2','Plus Jakarta Sans',Inter,sans-serif",
            fontSize: 48, fontWeight: 700, letterSpacing: -1.5,
          }}>
            <span style={{ color: '#fff' }}>tyro</span>
            <span style={{ color: '#c8922a' }}>sign</span>
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', opacity: 0.6 }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0098d4' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c8922a' }} />
          </div>
        </div>

        {/* Gradient bg */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0098d4 100%)', borderRadius: 20, padding: '3rem 2rem',
          textAlign: 'center', marginBottom: '1rem',
        }}>
          <span style={{
            fontFamily: "'Baloo 2','Plus Jakarta Sans',Inter,sans-serif",
            fontSize: 48, fontWeight: 700, letterSpacing: -1.5,
          }}>
            <span style={{ color: '#fff' }}>tyro</span>
            <span style={{ color: '#c8922a' }}>sign</span>
          </span>
        </div>

        {/* Dark charcoal bg */}
        <div style={{
          background: '#0f172a', borderRadius: 20, padding: '3rem 2rem',
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: "'Baloo 2','Plus Jakarta Sans',Inter,sans-serif",
            fontSize: 48, fontWeight: 700, letterSpacing: -1.5,
          }}>
            <span style={{ color: '#fff' }}>tyro</span>
            <span style={{ color: '#c8922a' }}>sign</span>
          </span>
          <div style={{ marginTop: 8, fontSize: '0.7rem', color: '#94a3b8', letterSpacing: 3, textTransform: 'uppercase' }}>
            corporate email signature
          </div>
        </div>
      </section>

    </div>
  );
});

export default LogoLabPage;
