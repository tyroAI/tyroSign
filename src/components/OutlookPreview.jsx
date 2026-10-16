import { memo, useMemo, useRef, useLayoutEffect } from 'react';
import { C } from '../constants/theme';

// ── ÖNİZLEME MASAÜSTÜ DÜZENİNİ GÖSTERİR (mobilde de) ──
// Üretilen imza HTML'inin içinde `@media screen and (max-width:480px)` kuralı var:
// gerçek mobil posta istemcilerinde satırları alt alta diziyor (logo üstte, bilgiler
// altta). Bu kural VIEWPORT genişliğine bakıyor, kapsayıcıya değil → telefondan
// uygulamaya girildiğinde ÖNİZLEME de dikey diziliyordu ve kullanıcı imzasının
// öyle olduğunu sanıyordu (kullanıcı bildirdi). Oysa asıl hedef Outlook masaüstü,
// o da media sorgularını hiç uygulamıyor.
// Çözüm: önizlemeye basılan kopyadan <style> bloğu ÇIKARILIR (o bloklarda yalnız bu
// media kuralı var — beş üreticide de doğrulandı), kart ise genişliğe göre ölçeklenir.
// KOPYALANAN/dışa aktarılan HTML'e dokunulmaz: media kuralı orada kalır, gerçek
// mobil istemcilerde yerleşim yine akıllıca kırılır.
const stripMediaCss = (html) => (html || '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

// İmzayı (600px) kalan genişliğe SIĞDIR. `zoom` kullanılıyor çünkü transform'un
// aksine düzen yüksekliğini de küçültüyor → altındaki metinle boşluk oluşmuyor.
function useSigZoom(html) {
  const wrapRef = useRef(null);
  const naturalRef = useRef(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const inner = wrap.firstElementChild;
    if (!inner) return;
    // Doğal genişlik HTML her değiştiğinde BİR KEZ ölçülür (zoom'suz),
    // sonra yalnız kapsayıcı genişliği değiştikçe ölçek yeniden hesaplanır.
    inner.style.zoom = '';
    naturalRef.current = inner.scrollWidth || 600;
    const fit = () => {
      const avail = wrap.clientWidth;
      const nat = naturalRef.current;
      if (!avail || !nat) return;
      const z = Math.min(1, avail / nat);
      inner.style.zoom = String(z);
      // Önizleme küçültülerek sığdırıldığında (telefon) sağ panelin yazıları bir tık
      // küçülür — kullanıcı isteği. Kurallar globalCss'te; masaüstünde (z ≈ 1) sınıf
      // eklenmediği için hiçbir şey değişmez. Gönderilen imza her koşulda aynı kalır.
      wrap.classList.toggle('sig-preview-shrink', z < 0.95);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    window.addEventListener('resize', fit);
    return () => { ro.disconnect(); window.removeEventListener('resize', fit); };
  }, [html]);
  return wrapRef;
}

const shimBar = {
  background: `linear-gradient(90deg, ${C.borderSub}, rgba(30,58,95,0.06), ${C.borderSub})`,
  backgroundSize: '200% 100%',
  animation: 'shimmer 2s ease-in-out infinite',
  borderRadius: 4,
};

const SkeletonSignature = () => (
  <div style={{ display: 'flex', gap: 14, padding: '0.6rem 0', opacity: 0.6 }}>
    <div style={{ ...shimBar, width: 68, height: 44, borderRadius: 6, flexShrink: 0 }} />
    <div style={{ width: 2, background: `${C.divider}30`, borderRadius: 2, alignSelf: 'stretch' }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 2 }}>
      <div style={{ ...shimBar, width: '70%', height: 10 }} />
      <div style={{ ...shimBar, width: '50%', height: 7 }} />
      <div style={{ ...shimBar, width: '55%', height: 7 }} />
      <div style={{ height: 4 }} />
      <div style={{ ...shimBar, width: '40%', height: 6 }} />
      <div style={{ ...shimBar, width: '60%', height: 6 }} />
      <div style={{ ...shimBar, width: '45%', height: 6 }} />
    </div>
  </div>
);

/* Inline SVG pen-signing animation — no TyroLogo dependency */
const SigningAnimation = () => (
  <div style={{ textAlign: 'center', marginBottom: '0.8rem', padding: '0.5rem 0' }}>
    <svg width="180" height="90" viewBox="0 0 260 120" fill="none" style={{ overflow: 'visible' }}>
      <defs>
        {/* Pen gradients */}
        <linearGradient id="spPenBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e4d72" />
          <stop offset="45%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#152d4a" />
        </linearGradient>
        <linearGradient id="spPenShine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="spGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0a832" />
          <stop offset="50%" stopColor="#c8922a" />
          <stop offset="100%" stopColor="#a67820" />
        </linearGradient>
        <linearGradient id="spSigGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c8922a" />
          <stop offset="50%" stopColor="#d4a23a" />
          <stop offset="100%" stopColor="#c8922a" />
        </linearGradient>

        {/* Signature path clip for drawing effect */}
        <clipPath id="spSigClip">
          <rect x="0" y="0" width="260" height="120">
            <animate attributeName="width" values="0;260;260;0" keyTimes="0;0.45;0.85;1" dur="4s" repeatCount="indefinite" />
          </rect>
        </clipPath>

        {/* Pen shadow */}
        <filter id="spPenShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="rgba(30,58,95,0.25)" />
        </filter>

        {/* Signature glow */}
        <filter id="spSigGlow">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(200,146,42,0.35)" />
        </filter>
      </defs>

      {/* ── Gold signature stroke (drawn with clip animation) ── */}
      <g filter="url(#spSigGlow)" clipPath="url(#spSigClip)">
        <path
          d="M20 85 C32 62, 42 90, 56 72 S74 58, 90 76 S108 88, 124 68 C132 58, 138 80, 148 70 S160 56, 172 72 L180 68"
          fill="none" stroke="url(#spSigGrad)" strokeWidth="3" strokeLinecap="round"
        />
        {/* Decorative underline */}
        <path
          d="M40 96 C60 92, 100 94, 150 90 S180 88, 195 92"
          fill="none" stroke="#c8922a" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"
        />
        {/* Dot */}
        <circle cx="185" cy="66" r="2" fill="#c8922a" opacity="0.6" />
      </g>

      {/* ── 3D Fountain Pen (right-handed grip, nib bottom-left, body top-right) ── */}
      <g filter="url(#spPenShadow)">
        <animateTransform
          attributeName="transform" type="translate"
          values="8,48; 50,30; 80,44; 120,32; 155,38; 170,30; 168,32; 8,48"
          keyTimes="0; 0.15; 0.28; 0.42; 0.55; 0.65; 0.85; 1"
          dur="4s" repeatCount="indefinite"
        />
        <g transform="rotate(55, 12, 22) scale(-1, 1) translate(-25, 0)">
          {/* Pen cap */}
          <rect x="8" y="-14" width="9" height="10" rx="3" fill="url(#spPenBody)" />
          <rect x="8" y="-14" width="4" height="10" rx="3" fill="url(#spPenShine)" />
          {/* Cap ring */}
          <rect x="7.5" y="-5.5" width="10" height="2" rx="0.8" fill="#c8922a" opacity="0.85" />
          {/* Clip */}
          <rect x="16.5" y="-12" width="2" height="14" rx="0.8" fill="url(#spGold)" />
          <circle cx="17.5" cy="2" r="1.3" fill="#c8922a" />

          {/* Barrel */}
          <rect x="8.5" y="-4" width="8" height="28" rx="1.8" fill="url(#spPenBody)" />
          <rect x="8.5" y="-4" width="3.5" height="28" rx="1.8" fill="url(#spPenShine)" />
          {/* Barrel ring */}
          <rect x="8" y="20" width="9" height="1.8" rx="0.6" fill="#8a9bb5" opacity="0.4" />

          {/* Grip */}
          <rect x="9" y="24" width="7" height="7" rx="1" fill="#2a4d70" />
          <rect x="9" y="24" width="3" height="7" rx="1" fill="rgba(255,255,255,0.07)" />

          {/* Nib */}
          <polygon points="12.5,31 9,31 12.5,43 16,31" fill="url(#spGold)" />
          <line x1="12.5" y1="32.5" x2="12.5" y2="42" stroke="#8a6a18" strokeWidth="0.5" />
          <circle cx="12.5" cy="42.5" r="0.7" fill="#e0b840" opacity="0.8" />
        </g>
      </g>

      {/* ── Subtle ink drops that appear as pen writes ── */}
      <circle cx="60" cy="88" r="1.2" fill="#1e3a5f" opacity="0.15">
        <animate attributeName="opacity" values="0;0;0.15;0.15;0" keyTimes="0;0.2;0.25;0.8;1" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="130" cy="82" r="0.8" fill="#1e3a5f" opacity="0.1">
        <animate attributeName="opacity" values="0;0;0.12;0.12;0" keyTimes="0;0.4;0.45;0.8;1" dur="4s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
);

const OutlookPreview = memo(({ hasData, sigHTML, L, lang }) => {
  const previewHTML = useMemo(() => stripMediaCss(sigHTML), [sigHTML]);
  const sigWrapRef = useSigZoom(hasData ? previewHTML : '');
  return (
  <div style={{
    border: '1px solid #d0d5dd', borderRadius: 10, overflow: 'hidden',
    background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', padding: '0.4rem 0.7rem',
      background: 'linear-gradient(180deg, #f8f9fa, #eef0f2)',
      borderBottom: '1px solid #e0e3e8',
    }}>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1e3a5f', display: 'block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0098d4', display: 'block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#c8922a', display: 'block' }} />
      </div>
      <span style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: C.text2, fontWeight: 500 }}>{L.mockTitle}</span>
    </div>
    <div style={{ borderBottom: '1px solid #e8eaed', padding: '0.4rem 0.8rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem', marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: 600, color: C.text1, minWidth: 38 }}>{L.mockSubject}</span>
        <span style={{ color: C.text2 }}>{{ tr: 'Toplantı Daveti', en: 'Meeting Invitation', ru: 'Приглашение на встречу', ar: 'دعوة اجتماع' }[lang] || 'Meeting Invitation'}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem' }}>
        <span style={{ fontWeight: 600, color: C.text1, minWidth: 38 }}>{L.mockTo}</span>
        <span style={{ color: C.text2 }}>ali.yilmaz@tyrotech.demo</span>
      </div>
    </div>
    <div className="sig-body" style={{ padding: '0.8rem 1rem', overflow: 'hidden' }}>
      {hasData && (
        <div style={{ marginBottom: '1rem', fontSize: '0.75rem', color: C.text1, lineHeight: 1.6 }}>
          <p>{L.mockBody}</p>
          <p style={{ color: C.text2, marginTop: '0.2rem' }}>{L.mockBodyLine}</p>
        </div>
      )}
      <div className="sig-html-wrap" ref={sigWrapRef} style={{ minHeight: 80 }}>
        {hasData ? (
          <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
        ) : (
          <div style={{ padding: '0.5rem 0.5rem 0.8rem' }}>
            {/* Pen signing animation */}
            <SigningAnimation />
            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: C.text2, textAlign: 'center' }}>{L.emptySig}</p>
            <p style={{ fontSize: '0.6rem', color: C.textM, marginTop: '0.15rem', textAlign: 'center', marginBottom: '1rem' }}>{L.fillForm}</p>
            <SkeletonSignature />
          </div>
        )}
      </div>
    </div>
  </div>
  );
});

export default OutlookPreview;
