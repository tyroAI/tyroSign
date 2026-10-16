import { C } from '../constants/theme';

// NOT: Font @import'u buradan KALDIRILDI → index.html'de <link rel="stylesheet">
// olarak yükleniyor (preconnect ile). Buradaki @import, stil JS tarafından enjekte
// edilene kadar keşfedilemiyordu; fontlar geç iniyor ve yazı titremesi oluşuyordu.
export const GLOBAL_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-y: scroll; }
  .sec-icon { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .sec-icon:hover { transform: scale(1.18) rotate(-8deg); }
  .bottom-tab-bar { display: none; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes toastIn { from { opacity: 0; transform: translateX(80px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  @keyframes ripple { 0% { box-shadow: 0 0 0 0 rgba(200,146,42,0.35); } 100% { box-shadow: 0 0 0 14px rgba(200,146,42,0); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes confettiFall {
    0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
    100% { transform: translateY(60px) rotate(360deg) scale(0); opacity: 0; }
  }
  @keyframes successPop {
    0%   { transform: scale(0); opacity: 0; }
    50%  { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes successRing {
    0%   { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); }
    100% { box-shadow: 0 0 0 20px rgba(22,163,74,0); }
  }
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes progressFlow { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }
  @keyframes progressGlow { 0%, 100% { box-shadow: 0 0 4px rgba(0,152,212,0.3), 0 0 8px rgba(0,152,212,0.1); } 50% { box-shadow: 0 0 8px rgba(0,152,212,0.5), 0 0 16px rgba(0,152,212,0.2); } }
  @keyframes progressComplete { 0%, 100% { box-shadow: 0 0 6px rgba(22,163,74,0.4), 0 0 12px rgba(22,163,74,0.15); } 50% { box-shadow: 0 0 10px rgba(22,163,74,0.6), 0 0 20px rgba(22,163,74,0.25); } }
  @keyframes countPop { 0% { transform: scale(1); } 50% { transform: scale(1.25); } 100% { transform: scale(1); } }
  @keyframes completeBounce { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes barShine { 0% { left: -40%; } 100% { left: 140%; } }
  @keyframes signing {
    0%   { transform: translate(0, 0) rotate(0deg); }
    8%   { transform: translate(6px, -3px) rotate(2deg); }
    16%  { transform: translate(14px, 1px) rotate(-1deg); }
    24%  { transform: translate(20px, -4px) rotate(3deg); }
    32%  { transform: translate(28px, 0px) rotate(-2deg); }
    40%  { transform: translate(34px, -5px) rotate(4deg); }
    48%  { transform: translate(26px, -2px) rotate(-1deg); }
    56%  { transform: translate(18px, 2px) rotate(2deg); }
    64%  { transform: translate(10px, -3px) rotate(-3deg); }
    72%  { transform: translate(4px, 1px) rotate(1deg); }
    80%  { transform: translate(0, -2px) rotate(-1deg); }
    90%  { transform: translate(0, 0) rotate(0deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  @keyframes signLine {
    0%   { width: 0; opacity: 0; }
    5%   { opacity: 1; }
    80%  { width: 100%; opacity: 1; }
    90%  { width: 100%; opacity: 0.3; }
    100% { width: 0; opacity: 0; }
  }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(30,58,95,0.12); border-radius: 3px; }
  ::selection { background: ${C.accent}30; }

  /* ═══ ACCESSIBILITY ═══ */
  :focus-visible {
    outline: 2px solid ${C.accent};
    outline-offset: 2px;
    border-radius: 4px;
  }
  input:focus-visible, button:focus-visible, select:focus-visible {
    outline: 2px solid ${C.accent};
    outline-offset: 1px;
  }
  /* Skip-to-content link */
  .skip-link {
    position: absolute; top: -100%; left: 16px; z-index: 99999;
    padding: 0.5rem 1rem; background: ${C.primary}; color: #fff;
    border-radius: 0 0 8px 8px; font-size: 0.75rem; font-weight: 600;
    text-decoration: none; transition: top 0.2s ease;
  }
  .skip-link:focus { top: 0; }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* ═══ TOOLTIP (CSS-only) ═══ */
  .tip-wrap { position: relative; }
  .tip-wrap .tip-box {
    visibility: hidden; opacity: 0;
    position: absolute; bottom: calc(100% + 10px); left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: rgba(20,30,48,0.92); color: #fff;
    font-size: 0.6rem; font-weight: 500; line-height: 1.45;
    padding: 0.45rem 0.7rem; border-radius: 9px;
    white-space: normal; width: max-content; max-width: 220px;
    pointer-events: none; z-index: 9999;
    box-shadow: 0 6px 20px rgba(0,0,0,0.18);
    backdrop-filter: blur(8px);
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
    font-family: 'Inter',sans-serif; text-align: center; letter-spacing: -0.01em;
  }
  .tip-wrap .tip-box::after {
    content: ''; position: absolute; top: 100%; left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent; border-top-color: rgba(20,30,48,0.92);
  }
  .tip-wrap:hover .tip-box {
    visibility: visible; opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* ═══ GLASS CARD HOVER (CSS-only, no React re-render) ═══ */
  .glass-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .glass-card:hover { box-shadow: ${C.shadowLg}; transform: translateY(-1px); border-color: ${C.accent}25; }

  /* ═══ RESPONSIVE ═══ */
  @media(max-width:900px) {
    .sig-layout { flex-direction: column!important; }
    .sig-right { position: relative!important; top: auto!important; }
    .sig-grid { grid-template-columns: 1fr!important; gap: 0.85rem!important; }
  }
  @media(min-width:769px) and (max-width:1024px) {
    .sig-grid { grid-template-columns: 1fr 1fr!important; gap: 0.85rem!important; }
    .sig-sec-banner { grid-column: 1 / -1!important; }
    .lang-toggle { width: 146px!important; height: 30px!important; }
    .lang-toggle button { font-size: 0.54rem!important; }
  }
  /* NOT: bu kurallar bilinçli olarak MEDIA SORGUSU DIŞINDA — tetikleyici
     viewport degil, onizlemenin kapsayici genisligine gore olceklenmis olmasi
     (.sig-preview-shrink sinifini OutlookPreview zoom<0.95 iken ekliyor).
     Media icine konuldugunda dar KAPSAYICI + genis pencere durumunda calismiyordu. */
  /* ── MOBIL ONIZLEMEDE SAG PANEL YAZILARI BIR TIK KUCUK ──
     Kullanici istegi: telefonda sag taraftaki yazilar sikisik duruyor, bir tik
     kucuk olsun. YALNIZ ONIZLEME: kopyalanan/gonderilen imza HIC degismiyor
     (uretici dosyalarina dokunulmadi), bu yuzden kural satir ici style'i
     !important ile eziyor. Sinifi OutlookPreview ekliyor: yalnizca onizleme
     kucultulmus olarak sigdirildiginda (zoom < 0.95), yani masaustunde YOK.
     Sag panel sinifi tasarima gore degisiyor:
       .sgn4-right (Klasik + cubuk varyantlari) · .sgnv-info (Klasik-V4)
       .sigc-band  (Klasik-V5)                  · .sgn3-cell (Klasik-V6)
     Sag panelde kullanilan satir ici puntolar OLCULDU: 11 / 12 / 15px. */
  .sig-preview-shrink .sgn4-right[style*="font-size:11px"],
  .sig-preview-shrink .sgnv-info[style*="font-size:11px"],
  .sig-preview-shrink .sigc-band[style*="font-size:11px"],
  .sig-preview-shrink .sgn3-cell[style*="font-size:11px"],
  .sig-preview-shrink .sgn4-right [style*="font-size:11px"],
  .sig-preview-shrink .sgnv-info [style*="font-size:11px"],
  .sig-preview-shrink .sigc-band [style*="font-size:11px"],
  .sig-preview-shrink .sgn3-cell [style*="font-size:11px"] { font-size: 10px!important; }
  .sig-preview-shrink .sgn4-right[style*="font-size:12px"],
  .sig-preview-shrink .sgnv-info[style*="font-size:12px"],
  .sig-preview-shrink .sigc-band[style*="font-size:12px"],
  .sig-preview-shrink .sgn3-cell[style*="font-size:12px"],
  .sig-preview-shrink .sgn4-right [style*="font-size:12px"],
  .sig-preview-shrink .sgnv-info [style*="font-size:12px"],
  .sig-preview-shrink .sigc-band [style*="font-size:12px"],
  .sig-preview-shrink .sgn3-cell [style*="font-size:12px"] { font-size: 11px!important; }
  .sig-preview-shrink .sgn4-right[style*="font-size:15px"],
  .sig-preview-shrink .sgnv-info[style*="font-size:15px"],
  .sig-preview-shrink .sigc-band[style*="font-size:15px"],
  .sig-preview-shrink .sgn3-cell[style*="font-size:15px"],
  .sig-preview-shrink .sgn4-right [style*="font-size:15px"],
  .sig-preview-shrink .sgnv-info [style*="font-size:15px"],
  .sig-preview-shrink .sigc-band [style*="font-size:15px"],
  .sig-preview-shrink .sgn3-cell [style*="font-size:15px"] { font-size: 14px!important; }

  @media(max-width:768px) {
    .tip-wrap .tip-box { display: none!important; }
    .app-header { padding: 0 0.75rem!important; height: 44px!important; gap: 0.4rem!important; }
    .app-header-logo { display: none!important; }
    .app-header-title { font-size: 1.1rem!important; }
    .app-header-title-accent { font-size: 1.1rem!important; }
    .app-header-nav { display: none!important; }
    .lang-toggle { margin-left: auto!important; transform: scale(0.85)!important; transform-origin: right center!important; }
    /* MOBİLDE NAVİGASYON YOK — yalnızca imza sayfası (kullanıcı isteği).
       Alt sekme çubuğu mobilin TEK gezinme yoluydu (header sekmeleri 768px altında
       zaten gizli), gizlenince Ayarlar ve LinkedIn Banner mobilde erişilemez olur;
       ikisi de masaüstünde tam çalışmaya devam eder. Yardım hâlâ profil menüsünden
       açılıyor ve kendi geri butonu var, yani kullanıcı sekmede sıkışmıyor.
       GERİ AÇMAK için aşağıdaki satırı 'display: flex!important' yapmak yeterli. */
    .bottom-tab-bar { display: none!important; }
    .app-main { padding-bottom: 1rem!important; }
    /* 4.5rem sabit alt çubuğu aşmak içindi; çubuk kalktı → normal boşluk */
    .app-footer { padding-bottom: 1.25rem!important; }
    .app-header-auth { order: 2!important; }
    .app-header-auth .profile-trigger { padding: 0.1rem 0.25rem 0.1rem 0.1rem!important; gap: 0.2rem!important; border-radius: 16px!important; }
    .app-header-auth .profile-avatar { width: 22px!important; height: 22px!important; font-size: 0.48rem!important; }
    .app-header-auth .profile-chevron { width: 7px!important; height: 4px!important; }
    .profile-dropdown { min-width: 200px!important; }
    .nav-tabs-inner { gap: 2px!important; }
    .nav-tab-btn { padding: 0.35rem 0.65rem!important; font-size: 0.7rem!important; gap: 0.2rem!important; }
    .app-main { padding: 0.65rem 0.75rem 2rem!important; overflow-x: hidden!important; }
    .sig-grid { grid-template-columns: 1fr!important; gap: 0.75rem!important; }
    .sig-grid > div { animation: fadeIn 0.3s ease-out!important; }
    .sig-sec-personal { order: 1!important; }
    .sig-sec-contact { order: 2!important; }
    .sig-sec-preview { order: 3!important; }
    .sig-sec-export { order: 4!important; }
    .sig-sec-banner { order: 5!important; }
    .banner-flex { flex-direction: column!important; }
    .banner-left { flex: 1 1 auto!important; min-width: 0!important; max-width: 100%!important; width: 100%!important; }
    .settings-tabs-inner { gap: 0!important; overflow-x: auto!important; }
    .settings-tab-btn { font-size: 0.6rem!important; padding: 0.38rem 0.3rem!important; gap: 0.15rem!important; min-height: 32px!important; }
    .settings-color-grid-3 { grid-template-columns: 1fr 1fr!important; }
    .social-grid { grid-template-columns: 1fr!important; }
    .progress-bar { padding: 0.5rem 0.65rem!important; gap: 0.5rem!important; }
    .glass-card-inner { padding: 0.75rem 0.85rem!important; }
    .export-btns { grid-template-columns: 1fr!important; }
    .export-btns .tip-wrap { min-width: 0!important; }
    .export-btns button { justify-content: flex-start!important; padding-left: 1.2rem!important; }
    /* Olcek artik OutlookPreview'da JS ile kapsayici genisligine gore hesaplaniyor
       (satir ici zoom). Bu kural YEDEK: !important OLMAMALI, yoksa satir ici degeri
       ezer. Sabit 0.52, JS calismazsa 600px'lik kartin tasmasini onler. */
    .sig-html-wrap > div { zoom: 0.52; }
    .sig-body { padding: 0.5rem!important; overflow: hidden!important; }
    /* Görsel şirket seçim butonu mobilde gizli — metin seçimi kullanılır */
    .company-visual-btn { display: none!important; }
  }
  @media(max-width:480px) {
    .app-header-nav .nav-tabs-inner { gap: 0!important; }
    .nav-tab-btn { padding: 0.35rem 0.6rem!important; font-size: 0.68rem!important; }
    .app-main { padding: 0.5rem 0.5rem!important; }
    .settings-color-grid-2 { grid-template-columns: 1fr!important; }
    .company-grid { grid-template-columns: 1fr!important; }
    .design-mini-preview { display: none!important; }
    /* Business Card modal — compact for small phones */
    .bc-modal { padding: 0.85rem!important; border-radius: 16px!important; max-height: 95vh!important; }
    /* QR sarmalayıcısı: yükseklik AUTO olmalı — içinde QR'ın üstünde logo bandı var.
       Sabit 150px'te içerik (logo + 6 boşluk + QR 138 + 12 iç marj ≈ 191px) sığmıyordu;
       justify-content:center yüzünden cam çerçevenin DIŞINA taşıyordu: logo çerçevenin
       üstünde havada, QR'ın beyazı altında kalıyor, "logo QR'a kaymış" gibi görünüyordu
       (mobil hata bildirimi). İndirilen PNG ayrı kod yolundan (canvas) geçtiği için
       doğruydu — hata yalnızca ekran önizlemesindeydi.
       flex:0 0 auto → ileride bir şey sıkışmaya çalışsa da QR kare kalır. */
    .bc-modal .bc-qr-wrap { width: 150px!important; height: auto!important; }
    .bc-modal .bc-qr-wrap canvas { width: 138px!important; height: 138px!important; flex: 0 0 auto!important; }
    .bc-modal .bc-qr-wrap img { height: 30px!important; flex: 0 0 auto!important; }
    /* Alt bar artık BUTON GRUBU: mobilde de TEK SATIR kalır (eskiden 2x2 sarıyordu ve
       modal yükseklikte iki kat yer kaplıyordu → kart sığmıyordu). Dört buton eşit
       paylaşır; etiket sığmazsa 360px altında gizlenip ikon kalır (aşağıdaki kural). */
    .bc-actions { flex-wrap: nowrap!important; }
    .bc-actions button { font-size: 0.6rem!important; padding: 0.5rem 0.15rem!important; gap: 0.2rem!important; }
    /* QR modal */
    .qr-modal { padding: 1.2rem!important; border-radius: 14px!important; }
  }
  @media(max-width:360px) {
    /* Çok dar ekranda 4 etiket yan yana sığmıyor → yalnız ikonlar kalır (kırpılmış
       yarım kelime yerine temiz ikon satırı). Butonların işlevi hover/başlıkta duruyor. */
    .bc-actions .bc-btn-label { display: none!important; }
    .bc-actions button { padding: 0.55rem 0.2rem!important; }
    .nav-tab-btn { padding: 0.3rem 0.45rem!important; font-size: 0.62rem!important; }
  }
`;
