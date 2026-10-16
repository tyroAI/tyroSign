import { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';

/* ─── APP CONFIG ─── */
const APP = {
  prefix: 'tyro',
  suffix: 'Sign',
  version: '1.0.0',
  headline1: { tr: 'Kurumsal Dijital', en: 'Corporate Digital', ru: 'Корпоративная Цифровая', ar: 'الاستوديو الرقمي' },
  headline2: { tr: 'İmza & Kart Stüdyosu', en: 'Signature & Card Studio', ru: 'Студия Подписей и Визиток', ar: 'للتوقيع والبطاقات' },
  description: {
    tr: 'E-posta imzalarınızı, dijital kartvizitlerinizi ve LinkedIn bannerlarınızı tek platformdan oluşturun ve yönetin.',
    en: 'Create and manage your email signatures, digital business cards, and LinkedIn banners from a single platform.',
    ru: 'Создавайте и управляйте подписями электронной почты, цифровыми визитками и баннерами LinkedIn на единой платформе.',
    ar: 'أنشئ وأدر توقيعات البريد الإلكتروني وبطاقات العمل الرقمية وبانرات LinkedIn من منصة واحدة.',
  },
  features: [
    { icon: 'pen-tool', label: { tr: 'İmza Oluşturucu', en: 'Signature Builder', ru: 'Конструктор Подписей', ar: 'منشئ التوقيع' }, desc: { tr: 'Kurumsal ve klasik tasarımlarla Outlook uyumlu e-posta imzanızı anında oluşturun', en: 'Instantly create Outlook-compatible email signatures with Corporate & Classic designs', ru: 'Мгновенно создавайте подписи для Outlook с корпоративным и классическим дизайном', ar: 'أنشئ توقيعات بريد إلكتروني متوافقة مع Outlook بتصاميم مؤسسية وكلاسيكية' }, num: 31, suffix: '', statLabel: { tr: 'şirket', en: 'companies', ru: 'компаний', ar: 'شركة' }, formatK: false },
    { icon: 'card', label: { tr: 'Dijital Kartvizit', en: 'Digital Business Card', ru: 'Цифровая Визитка', ar: 'بطاقة عمل رقمية' }, desc: { tr: 'Profesyonel dijital kartvizitinizi oluşturun, profil fotoğrafınızı ekleyin ve tek tıkla paylaşın', en: 'Create your professional digital business card, add your profile photo and share with one click', ru: 'Создайте профессиональную цифровую визитку, добавьте фото профиля и поделитесь одним кликом', ar: 'أنشئ بطاقة عملك الرقمية الاحترافية، أضف صورتك وشاركها بنقرة واحدة' }, num: 0, suffix: '', statLabel: { tr: '', en: '', ru: '', ar: '' }, formatK: false },
    { icon: 'mail', label: { tr: 'Microsoft 365', en: 'Microsoft 365', ru: 'Microsoft 365', ar: 'Microsoft 365' }, desc: { tr: 'Azure AD hesabınızla giriş yapın, profil bilgileriniz otomatik gelsin, Outlook\'a tek tıkla aktarın', en: 'Sign in with Azure AD, auto-fill your profile, apply to Outlook with one click', ru: 'Войдите через Azure AD, автозаполнение профиля, применение в Outlook одним кликом', ar: 'سجّل الدخول عبر Azure AD، واملأ ملفك الشخصي تلقائيًا، وطبّق التوقيع في Outlook بنقرة واحدة' }, num: 0, suffix: '', statLabel: { tr: '', en: '', ru: '', ar: '' }, formatK: false },
    { icon: 'qr', label: { tr: 'QR Kod ile Paylaşım', en: 'QR Code Sharing', ru: 'QR-код', ar: 'مشاركة عبر QR' }, desc: { tr: 'vCard QR koduyla iletişim bilgilerinizi anında paylaşın, telefonla okutunca rehbere kayıt oluşturur', en: 'Share your contact info instantly via vCard QR code, scan to save directly to phone contacts', ru: 'Мгновенно делитесь контактами через vCard QR-код, сканируйте для сохранения в телефоне', ar: 'شارك معلومات الاتصال فورًا عبر رمز vCard QR، امسح للحفظ مباشرة في جهات الاتصال' }, num: 0, suffix: '', statLabel: { tr: '', en: '', ru: '', ar: '' }, formatK: false },
  ],
};

/* ─── ICONS (inline SVG) ─── */
const ICONS = {
  'pen-tool': (sz = 20) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>
    </svg>
  ),
  mail: (sz = 20) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  card: (sz = 20) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="14" x2="10" y2="14"/><line x1="6" y1="17" x2="14" y2="17"/>
    </svg>
  ),
  qr: (sz = 20) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="6" height="6" x="3" y="3" rx="1"/><rect width="6" height="6" x="15" y="3" rx="1"/><rect width="6" height="6" x="3" y="15" rx="1"/><path d="M15 15h2v2h-2z"/><path d="M19 15h2v2h-2z"/><path d="M15 19h2v2h-2z"/><path d="M19 19h2v2h-2z"/>
    </svg>
  ),
  lock: (sz = 12) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
};

/* ─── MICROSOFT LOGO ─── */
const MsLogo = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

/* ─── StreamLogo — solid fills, no gradient issues ─── */
const StreamLogo = ({ variant = 'dark', size = 42 }) => {
  const isDark = variant === 'dark';
  const gold = '#c8922a';
  const mid = isDark ? '#1e3a5f' : '#1e3a5f';
  const main = isDark ? '#0098d4' : '#0098d4';
  const overlay = isDark ? '#152d4a' : '#152d4a';
  return (
    <svg viewBox="0 0 150 150" fill="none" width={size} height={size} style={{ flexShrink: 0 }}>
      <path fill={gold} d="M14.52,68.93v33.41s-.28,6.49,3.59,4.28c10.49-6.21,21.95-12.7,26.51-15.05,9.39-4.69,8.01-10.49,8.01-10.49V48.77c0-8.42-5.8-4.69-5.8-4.69l-28.16,16.15s-4.14,2.35-4.14,8.7Z" />
      <path fill={mid} d="M97.77,70.17v40.31s1.52,10.91-7.45,15.88l-25.68,15.19s-6.9,3.31-6.49-2.76l1.66-48.73,37.96-19.88Z" />
      <path fill={main} d="M58.15,137.95V66.72s-1.52-13.67,18.5-24.99l54.94-31.61s5.8-3.59,5.8,4.69V47.12s1.52,5.8-8.01,10.49c-9.53,4.69-47.9,27.61-47.9,27.61,0,0-23.33,11.87-23.33,52.74Z" />
      <path fill={overlay} d="M84.52,91.98s5.52-3.31,13.25-7.87v-8.28c-9.11,5.25-16.43,9.66-16.43,9.66,0,0-20.29,10.35-22.92,45.14v1.1c7.32-30.23,26.09-39.76,26.09-39.76Z" />
    </svg>
  );
};

/* ─── useCounter HOOK ─── */
function useCounter(target, duration = 1200, delay = 0, formatK = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let raf;
    const timer = setTimeout(() => {
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * ease));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timer); if (raf) cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  if (formatK && value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value;
}

/* ─── FEATURE CARD ─── */
const FeatureCard = memo(({ icon, label, desc, num, suffix, formatK, statLabel, delay, mouseX, lang }) => {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [glowVisible, setGlowVisible] = useState(false);
  const count = useCounter(num, 1200, delay);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setGlowPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }, []);

  const parallaxX = (mouseX - 50) * 0.02;
  const IconEl = ICONS[icon];
  const lbl = typeof label === 'object' ? label[lang] || label.tr : label;
  const dsc = typeof desc === 'object' ? desc[lang] || desc.tr : desc;
  const sLbl = typeof statLabel === 'object' ? statLabel[lang] || statLabel.tr : statLabel;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { setHover(true); setGlowVisible(true); }}
      onMouseLeave={() => { setHover(false); setGlowVisible(false); }}
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${hover ? 'rgba(0,152,212,0.25)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16,
        padding: '22px 20px',
        cursor: 'default',
        transform: `translateX(${parallaxX}px) translateY(${hover ? -3 : 0}px)`,
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: hover ? '0 8px 30px rgba(0,0,0,0.2)' : 'none',
        overflow: 'hidden',
        animation: `fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms both`,
      }}
    >
      {/* Mouse glow */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
        background: `radial-gradient(circle 140px at ${glowPos.x}% ${glowPos.y}%, rgba(0,152,212,0.12) 0%, rgba(30,58,95,0.06) 40%, transparent 70%)`,
        opacity: glowVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }} />
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 16, right: 16, height: 1,
        background: hover
          ? 'linear-gradient(90deg, transparent, #0098d4 30%, #1e3a5f 70%, transparent)'
          : 'rgba(255,255,255,0.15)',
        transition: 'background 0.3s ease',
      }} />
      {/* Icon + Stat row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: hover ? 'rgba(0,152,212,0.15)' : 'rgba(0,152,212,0.08)',
          border: `1px solid ${hover ? 'rgba(0,152,212,0.25)' : 'rgba(0,152,212,0.10)'}`,
          color: '#2ab5e8',
          transition: 'all 0.3s ease',
        }}>
          {IconEl && IconEl(20)}
        </div>
        {num > 0 && (
          <div>
            <span style={{
              fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em',
              color: '#e0a832',
            }}>
              {formatK && count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count}{suffix}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(240,240,245,0.55)', marginLeft: 6 }}>{sLbl}</span>
          </div>
        )}
      </div>
      {/* Label + desc */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0f0f5', marginBottom: 4 }}>{lbl}</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(240,240,245,0.45)', lineHeight: 1.5 }}>{dsc}</div>
      </div>
    </div>
  );
});

/* ─── CONFETTI ─── */
const CONFETTI_COLORS = ['#0098d4', '#1e3a5f', '#c8922a', '#0098d4', '#2c5282', '#4ade80'];
function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 4 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      dur: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 0.3,
      shape: Math.random() > 0.5 ? '50%' : '2px',
    })),
  []);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`, top: '-10px',
          width: p.size, height: p.size,
          borderRadius: p.shape,
          backgroundColor: p.color,
          animation: `confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}

/* ─── CSS ─── */
// NOT: Font @import'u buradan da KALDIRILDI → index.html'deki tek <link> hepsini
// yüklüyor ve o link BU ekranın ihtiyaç duyduğu ağırlıkları da içeriyor
// (Baloo 2: 400-800, Plus Jakarta Sans: 300-800). Üretimde ilk açılan ekran burası
// olduğu için asıl ilk boya kazancı bu satırın kalkmasıyla geliyor: @import,
// stil enjekte edilene kadar keşfedilemiyordu.
const CSS = `

@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeLeft { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
@keyframes orbFloat1 { 0%,100% { transform:translate(0,0); } 50% { transform:translate(30px,-25px); } }
@keyframes orbFloat2 { 0%,100% { transform:translate(0,0); } 50% { transform:translate(-25px,35px); } }
@keyframes orbFloat3 { 0%,100% { transform:translate(0,0); } 50% { transform:translate(20px,30px); } }
@keyframes beamSpin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
@keyframes confettiFall {
  0% { transform:translateY(-10px) rotate(0deg); opacity:1; }
  100% { transform:translateY(100vh) rotate(720deg); opacity:0; }
}
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
@keyframes spinLoader { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes successPop { 0% { transform:scale(0); opacity:0; } 60% { transform:scale(1.15); } 100% { transform:scale(1); opacity:1; } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.tyro-login-btn:focus-visible {
  outline: 2px solid #c8922a;
  outline-offset: 2px;
}
.tyro-login-btn:hover:not(:disabled) {
  transform: scale(1.02) translateY(-2px);
  background: rgba(255,255,255,0.85) !important;
  box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
}
.tyro-login-btn:active:not(:disabled) { transform: scale(0.98); }

.tyro-lang-btn:hover { background: rgba(0,0,0,0.04); }

@media (max-width: 768px) {
  .tyro-split { flex-direction: column !important; height: auto !important; min-height: 100vh !important; overflow-y: auto !important; align-items: center !important; justify-content: center !important; padding: 20px 0 !important; }
  .tyro-left { display: none !important; }
  .tyro-mobile-header { display: flex !important; }
  .tyro-right {
    flex: none !important; border-radius: 24px !important; margin: 24px 16px !important;
    min-height: auto !important; width: auto !important;
    padding: 36px 24px 28px !important;
    justify-content: flex-start !important;
    background: rgba(255,255,255,0.92) !important;
  }
  .tyro-right > div:last-child { position: relative !important; bottom: auto !important; }
  .tyro-desktop-logo { display: none !important; }
  .tyro-right > div:last-child { margin-top: 24px !important; }
}
`;

/* ─── SKELETON PRELOADER ─── */
const Skeleton = () => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 10000,
    backgroundColor: '#0c0e1a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: 16,
  }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1a1d32', animation: 'pulse 1.5s infinite' }} />
    <div style={{ width: 120, height: 14, borderRadius: 6, background: '#1a1d32', animation: 'pulse 1.5s infinite 0.2s' }} />
    <div style={{ width: 80, height: 10, borderRadius: 6, background: '#1a1d32', animation: 'pulse 1.5s infinite 0.4s' }} />
  </div>
);

/* ─── MAIN LOGIN SPLASH ─── */
const LoginSplash = memo(({ lang, setLang, authLoading, msalReady, handleLogin }) => {
  const [ready, setReady] = useState(false);
  const [mouseX, setMouseX] = useState(50);
  const [loginState, setLoginState] = useState('idle'); // idle | loading | success
  const [showConfetti, setShowConfetti] = useState(false);

  // Right panel mouse glow
  const [rpGlow, setRpGlow] = useState({ x: 50, y: 50, visible: false });
  const rpRef = useRef(null);

  // Skeleton preloader
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Global mouse tracking for parallax
  useEffect(() => {
    const handler = (e) => setMouseX((e.clientX / window.innerWidth) * 100);
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Sync loading state
  useEffect(() => {
    if (authLoading && loginState === 'idle') setLoginState('loading');
  }, [authLoading, loginState]);

  const onLogin = useCallback(() => {
    setLoginState('loading');
    handleLogin();
  }, [handleLogin]);

  const rpMouseMove = useCallback((e) => {
    if (!rpRef.current) return;
    const r = rpRef.current.getBoundingClientRect();
    setRpGlow({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      visible: true,
    });
  }, []);

  const L = useCallback((trText, enText, ruText, arText) => {
    if (lang === 'tr') return trText;
    if (lang === 'ru') return ruText || enText;
    if (lang === 'ar') return arText || enText;
    return enText;
  }, [lang]);
  const headline1 = APP.headline1[lang] || APP.headline1.tr;
  const headline2 = APP.headline2[lang] || APP.headline2.tr;
  const description = typeof APP.description === 'object' ? (APP.description[lang] || APP.description.tr) : APP.description;

  if (!ready) return <Skeleton />;

  return (
    <div role="main" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, padding: 0, position: 'fixed', inset: 0 }}>
      <style>{CSS}{`html, body, #root { margin:0; padding:0; overflow:hidden; height:100%; } *::-webkit-scrollbar { display:none; } * { scrollbar-width:none; }`}</style>

      {showConfetti && <Confetti />}

      {/* Full page container */}
      <div className="tyro-split" style={{
        display: 'flex', height: '100%', position: 'relative', overflow: 'hidden',
        backgroundColor: '#0c0e1a',
        backgroundImage: [
          'radial-gradient(ellipse 600px 500px at 20% 40%, rgba(0,152,212,0.35) 0%, transparent 70%)',
          'radial-gradient(ellipse 500px 400px at 65% 45%, rgba(30,58,95,0.2) 0%, transparent 70%)',
          'radial-gradient(ellipse 350px 300px at 60% 55%, rgba(200,146,42,0.1) 0%, transparent 60%)',
          'radial-gradient(ellipse 500px 80px at 35% 95%, rgba(0,152,212,0.15) 0%, transparent 70%)',
          'radial-gradient(ellipse 400px 80px at 60% 95%, rgba(180,130,160,0.1) 0%, transparent 70%)',
          'linear-gradient(180deg, #0c0e1a 0%, #121526 60%, #1a1d32 100%)',
        ].join(','),
      }}>

        {/* Animated Orbs */}
        <div style={{ position: 'absolute', width: 500, height: 400, borderRadius: '50%', top: '10%', left: '5%', background: 'radial-gradient(circle, rgba(0,152,212,0.30) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'orbFloat1 12s ease-in-out infinite alternate', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 350, borderRadius: '50%', top: '40%', left: '45%', background: 'radial-gradient(circle, rgba(30,58,95,0.25) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'orbFloat2 15s ease-in-out infinite alternate', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 260, borderRadius: '50%', bottom: '15%', left: '20%', background: 'radial-gradient(circle, rgba(200,146,42,0.20) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'orbFloat3 18s ease-in-out infinite alternate', pointerEvents: 'none' }} />

        {/* ═══ LEFT PANEL ═══ */}
        <div className="tyro-left" style={{
          flex: '1 1 0%', display: 'flex', flexDirection: 'column', minWidth: 0,
          padding: '0', position: 'relative', zIndex: 1, overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Logo + App Name — pinned top-left */}
            <div className="tyro-logo-row" style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '32px 0 0 48px',
              animation: 'fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 200ms both',
            }}>
              <StreamLogo variant="dark" size={42} />
              <span style={{
                fontFamily: "'Baloo 2', 'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 700, fontSize: '1.8rem', letterSpacing: '-0.04em', lineHeight: 1,
              }}>
                <span style={{ color: '#fff' }}>{APP.prefix}</span>
                <span style={{ color: '#c8922a' }}>{APP.suffix}</span>
              </span>
            </div>

            {/* Center content area — vertically centered, left-aligned */}
            <div className="tyro-center-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 48px', maxWidth: 580 }}>
              {/* Headline */}
              <h1 className="tyro-headline" style={{
                fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em',
                margin: '0 0 14px', lineHeight: 1.15,
                animation: 'fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 350ms both',
              }}>
                <span style={{ color: '#f0f0f5' }}>{headline1}</span>
                <br />
                <span style={{ color: '#c8922a' }}>{headline2}</span>
              </h1>

              {/* Description */}
              <p style={{
                fontSize: '1.05rem', fontWeight: 400, color: 'rgba(240,240,245,0.6)',
                lineHeight: 1.7, maxWidth: 480, margin: '0 0 28px',
                animation: 'fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 450ms both',
              }}>
                {description}
              </p>

              {/* Feature Grid 2x2 */}
              <div className="tyro-feat-grid" style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
              }}>
                {APP.features.map((f, i) => (
                  <FeatureCard
                    key={f.icon}
                    icon={f.icon}
                    label={f.label}
                    desc={f.desc}
                    num={f.num}
                    suffix={f.suffix}
                    formatK={f.formatK}
                    statLabel={f.statLabel}
                    delay={550 + i * 100}
                    mouseX={mouseX}
                    lang={lang}
                  />
                ))}
              </div>
            </div>

            {/* tyroTech Footer — pinned bottom-left */}
            <div className="tyro-tech-footer" style={{
              padding: '12px 48px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
              animation: 'fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 1100ms both',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,245,0.45)' }}>
                Powered by tyroTech
              </span>
              <span style={{ fontSize: '0.68rem', color: 'rgba(240,240,245,0.35)', marginLeft: 8 }}>
                v{APP.version}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL (Login) ═══ */}
        <div
          ref={rpRef}
          className="tyro-right"
          onMouseMove={rpMouseMove}
          onMouseEnter={() => setRpGlow(g => ({ ...g, visible: true }))}
          onMouseLeave={() => setRpGlow(g => ({ ...g, visible: false }))}
          style={{
            flex: '0 0 420px', borderRadius: 36, margin: '20px 12% 20px 20px', alignSelf: 'center',
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(60px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(60px) saturate(1.8)',
            boxShadow: '0 0 80px rgba(0,0,0,0.12), 0 0 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '36px 36px 56px', minHeight: 420,
            transition: 'box-shadow 0.4s ease',
          }}
        >
          {/* Noise texture */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', opacity: 0.5, mixBlendMode: 'overlay', pointerEvents: 'none',
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
          }} />

          {/* Mouse-tracking glow */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            background: `radial-gradient(circle 200px at ${rpGlow.x}% ${rpGlow.y}%, rgba(0,152,212,0.08) 0%, rgba(30,58,95,0.04) 40%, transparent 70%)`,
            opacity: rpGlow.visible ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }} />

          {/* Specular highlight */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 30%, white 50%, rgba(255,255,255,0.8) 70%, transparent)',
            pointerEvents: 'none',
          }} />

          {/* Aurora bleed left-top */}
          <div style={{
            position: 'absolute', top: '10%', left: -30, width: 120, height: 120,
            background: 'radial-gradient(circle, rgba(0,152,212,0.07) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />
          {/* Aurora bleed right-bottom */}
          <div style={{
            position: 'absolute', bottom: '15%', right: -30, width: 100, height: 100,
            background: 'radial-gradient(circle, rgba(30,58,95,0.05) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />

          {/* Content */}
          {/* Mobile-only header: logo + app name */}
          <div className="tyro-mobile-header" style={{
            display: 'none', alignItems: 'center', gap: 10, marginBottom: 24,
            position: 'relative', zIndex: 2,
          }}>
            <StreamLogo variant="light" size={32} />
            <span style={{
              fontFamily: "'Baloo 2', 'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.04em', lineHeight: 1,
            }}>
              <span style={{ color: '#1e3a5f' }}>tyro</span>
              <span style={{ color: '#c8922a' }}>Sign</span>
            </span>
          </div>

          <div style={{ maxWidth: 320, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>

            {/* Logo — hidden on mobile (shown in mobile-header instead) */}
            <div className="tyro-desktop-logo" style={{ animation: 'fadeLeft 0.5s cubic-bezier(0.4,0,0.2,1) 600ms both', marginBottom: 24 }}>
              <StreamLogo variant="light" size={60} />
            </div>

            {/* Welcome text */}
            <h2 style={{
              fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px',
              animation: 'fadeLeft 0.5s cubic-bezier(0.4,0,0.2,1) 700ms both',
            }}>
              {L('Hoş geldiniz', 'Welcome', 'Добро пожаловать', 'مرحباً')}
            </h2>
            <p style={{
              fontSize: '0.92rem', color: '#475569', margin: '0 0 28px', textAlign: 'center', lineHeight: 1.5, whiteSpace: 'pre-line',
              animation: 'fadeLeft 0.5s cubic-bezier(0.4,0,0.2,1) 750ms both',
            }}>
              {L('Demo sürüm — örnek hesapla\ntek tıkla giriş yapın', 'Demo version — sign in with\na sample account in one click', 'Демо-версия — вход с тестовой\nучётной записью одним кликом', 'نسخة تجريبية — سجّل الدخول\nبحساب تجريبي بنقرة واحدة')}
            </p>

            {/* Login Button */}
            <div style={{
              width: '100%', position: 'relative',
              animation: 'fadeLeft 0.5s cubic-bezier(0.4,0,0.2,1) 850ms both',
            }}>
              {/* Border beam container */}
              {loginState === 'idle' && (
                <div style={{
                  position: 'absolute', inset: -2, borderRadius: 16, overflow: 'hidden', pointerEvents: 'none',
                }}>
                  <div style={{
                    position: 'absolute', inset: -50,
                    background: 'conic-gradient(from 0deg, transparent 65%, #0098d4 72%, #1e3a5f 80%, #c8922a 85%, transparent 100%)',
                    animation: 'beamSpin 4s linear infinite',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 2, borderRadius: 14,
                    background: 'rgba(255,255,255,0.88)',
                  }} />
                </div>
              )}

              {loginState === 'success' ? (
                /* Success state */
                <div style={{
                  width: '100%', padding: '14px 20px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(74,222,128,0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: '#4ade80',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'successPop 0.4s cubic-bezier(0.4,0,0.2,1)',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                    {L('Giriş başarılı', 'Login successful', 'Вход выполнен', 'تم تسجيل الدخول')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {L('Yönlendiriliyorsunuz...', 'Redirecting...', 'Перенаправление...', 'جارٍ التوجيه...')}
                  </span>
                </div>
              ) : (
                /* Default / Loading state */
                <button
                  className="tyro-login-btn"
                  onClick={onLogin}
                  disabled={loginState === 'loading' || !msalReady}
                  aria-label={L('Microsoft ile giriş yap', 'Sign in with Microsoft', 'Войти через Microsoft', 'تسجيل الدخول عبر Microsoft')}
                  style={{
                    position: 'relative', zIndex: 1,
                    width: '100%', padding: '14px 20px', borderRadius: 14,
                    background: loginState === 'loading'
                      ? 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.7), rgba(255,255,255,0.5))'
                      : 'rgba(255,255,255,0.6)',
                    backgroundSize: loginState === 'loading' ? '200% 100%' : 'auto',
                    animation: loginState === 'loading' ? 'shimmer 1.5s linear infinite' : 'none',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    cursor: (loginState === 'loading' || !msalReady) ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    fontSize: '0.95rem', fontWeight: 600, color: '#0f172a',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                    opacity: (!msalReady && loginState !== 'loading') ? 0.5 : 1,
                  }}
                >
                  {loginState === 'loading' ? (
                    <>
                      <div style={{
                        width: 18, height: 18, border: '2px solid rgba(0,0,0,0.1)',
                        borderTopColor: '#0098d4', borderRadius: '50%',
                        animation: 'spinLoader 0.8s linear infinite',
                      }} />
                      <span>{L('Oturumunuz hazırlanıyor...', 'Preparing your session...', 'Подготовка сессии...', 'جارٍ تحضير جلستك...')}</span>
                    </>
                  ) : (
                    <>
                      <MsLogo />
                      <span>{L('Microsoft ile Giriş Yap', 'Sign in with Microsoft', 'Войти через Microsoft', 'تسجيل الدخول عبر Microsoft')}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Trust bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 16,
              animation: 'fadeLeft 0.5s cubic-bezier(0.4,0,0.2,1) 950ms both',
            }}>
              <span style={{ color: '#64748b' }}>{ICONS.lock(12)}</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {L('Entra ID korumalı güvenli oturum', 'Secured by Entra ID', 'Защищено Entra ID', 'محمي بواسطة Entra ID')}
              </span>
            </div>
          </div>

          {/* Footer: Language selector — pill toggle */}
          <div style={{
            position: 'absolute', bottom: 20, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'rgba(15,23,42,0.06)',
              borderRadius: 12, padding: 3,
              border: '1px solid rgba(15,23,42,0.08)',
              backdropFilter: 'blur(8px)',
            }}>
              {[
                { code: 'tr', label: 'TR', full: 'Türkçe' },
                { code: 'en', label: 'EN', full: 'English' },
                { code: 'ru', label: 'RU', full: 'Русский' },
                { code: 'ar', label: 'AR', full: 'العربية' },
              ].map(l => (
                <button
                  key={l.code}
                  className="tyro-lang-btn"
                  onClick={() => setLang(l.code)}
                  aria-label={l.full}
                  title={l.full}
                  style={{
                    border: 'none', cursor: 'pointer', borderRadius: 9,
                    padding: '6px 14px',
                    fontSize: '0.72rem', fontWeight: lang === l.code ? 700 : 500,
                    letterSpacing: '0.02em',
                    color: lang === l.code ? '#fff' : '#64748b',
                    background: lang === l.code
                      ? 'linear-gradient(135deg, #1e3a5f, #0098d4)'
                      : 'transparent',
                    boxShadow: lang === l.code
                      ? '0 2px 8px rgba(30,58,95,0.3)'
                      : 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LoginSplash;
