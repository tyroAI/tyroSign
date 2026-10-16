import { useState, useRef, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import DEFAULT_LOGO_BASE64 from './defaultLogo.js';
import { C } from './constants/theme';
import { OFFICES } from './constants/offices';
import { COMPANIES } from './constants/companies';
import { COMPANY_DIRECTORY } from './constants/companyDirectory';
import { PROGRESS_FIELDS } from './constants/progressFields';
import { MAX_LOGO_SIZE, MAX_BANNER_SIZE, MAX_LOGO_W, MAX_LOGO_H, DEFAULT_LOGO_W, DEFAULT_LOGO_H, SIG_WIDTH, MAX_SIG_BANNERS } from './constants/limits';
import { TR, EN, RU, AR } from './i18n/translations';
import { genSig } from './signature/genSig';
import { genSigNavy } from './signature/genSigNavy';
import { genSigNavyV4, V4_PANEL_BG } from './signature/genSigNavyV4';
import { genSigCorporate } from './signature/genSigCorporate';
import { stripLegalSuffix } from './utils/formatting';
import { loadLogo, navyInfo, cardLogoUrl, companyLogoUrl, MAIN_CARD_LOGO } from './utils/cardStg';
import { phoneIconSvg, mobileIconSvg, mailIconSvg } from './icons/svgDataUris';
import { GLOBAL_CSS } from './styles/globalCss';
import { useToast } from './hooks/useToast';
import { useMsal } from './hooks/useMsal';
import { useBannerCanvas } from './hooks/useBannerCanvas';
import LoginSplash from './components/LoginSplash';
import AppHeader from './components/AppHeader';
import BottomTabBar from './components/BottomTabBar';
import SignatureTab from './components/SignatureTab';
import BannerTab from './components/BannerTab';
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const LogoConceptsPage = lazy(() => import('./components/LogoConceptsPage'));
const FontDemoPage = lazy(() => import('./components/FontDemoPage'));
const LogoLabPage = lazy(() => import('./components/LogoLabPage'));
const HelpPage = lazy(() => import('./components/HelpPage'));
import AppFooter from './components/AppFooter';
import ToastContainer from './components/ToastContainer';
import CopySuccess from './components/CopySuccess';
import OnboardingGuide from './components/OnboardingGuide';

// navyInfo, loadLogo ve kart logosu kuralı utils/cardStg.js'e taşındı — embed rotası
// (CardEmbed.jsx) aynı kuralları kullanıyor, iki kopya sessizce ayrışmasın.

// Beyaz ikonları koyu renge boya (Klasik-Navy beyaz zemin için) — PNG kalır, Outlook-safe.
// bg verilirse ikonun ALFASI da o renkle düzleştirilir: eski Outlook saydam PNG'yi
// hücrenin bgcolor'ıyla harmanlamak yerine BEYAZA matlaştırıyor (rozet logosunda
// ölçüldü: %82 saydam piksel → gri panelde beyaz şerit). 12x12'ye küçültülen bu
// ikonlar da V4'ün GRİ panelinde duruyor → aynı sınıf hata. Beyaz panelli
// tasarımlarda (V2/V3) bg beyazdır, yani sonuç bugünküyle birebir aynı.
function recolorIcon(dataUri, color, bg) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || 64; c.height = img.naturalHeight || 64;
        const cx = c.getContext('2d');
        cx.drawImage(img, 0, 0);
        cx.globalCompositeOperation = 'source-in'; // mevcut alfayı koru, rengi değiştir
        cx.fillStyle = color;
        cx.fillRect(0, 0, c.width, c.height);
        if (bg) {
          // destination-over → zemini ikonun ARKASINA çizer (source-in ile boyanan
          // alfa korunur). Sıra kritik: zemin önce doldurulsa source-in onu yutardı.
          cx.globalCompositeOperation = 'destination-over';
          cx.fillStyle = bg;
          cx.fillRect(0, 0, c.width, c.height);
        }
        resolve(c.toDataURL('image/png'));
      } catch (_) { resolve(dataUri); }
    };
    img.onerror = () => resolve(dataUri);
    img.src = dataUri;
  });
}

// Rozet logosunu şeffaf/beyaz kenar boşluklarından kırp → tüm rozetler tutarlı görünür.
//
// bg = ALFA DÜZLEŞTİRME ZEMİNİ. Eski Outlook'un Word motoru saydam PNG'yi hücrenin
// bgcolor'ıyla harmanlamak YERİNE BEYAZA matlaştırıyor. TYRO logosunun sol ~%11'i
// neredeyse tamamen saydam (ince turkuaz swoosh kuyruğu; ölçüm: 320x102 görselin %73'ü
// tam saydam, opak beyaz piksel sayısı 0) → 52x17'ye küçültülürken V4'ün GRİ panelinde
// beyaz şerit olarak çıkıyordu. Çözüm: çıktıda saydamlık bırakmamak.
//   V4 → V4_PANEL_BG (#f8f8f8)   •   V2/V3 rozeti BEYAZ panelde → '#ffffff'
// (yani V2/V3 çıktısı bugünküyle bire bir aynı; aynı gizli hata orada da kapanır.)
function trimLogo(base64, bg) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const maxW = 300;
        const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const cx = c.getContext('2d'); cx.drawImage(img, 0, 0, w, h);
        const d = cx.getImageData(0, 0, w, h).data;
        let top = h, left = w, right = -1, bottom = -1;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4, a = d[i + 3];
          if (a > 25 && !(d[i] > 245 && d[i + 1] > 245 && d[i + 2] > 245)) {
            if (x < left) left = x; if (x > right) right = x;
            if (y < top) top = y; if (y > bottom) bottom = y;
          }
        }
        // Görünür piksel yoksa tüm tuvali kullan — eskiden burada HAM (düzleştirilmemiş)
        // base64 dönüyordu; artık her yol alfasız çıkar.
        let empty = false;
        if (right < left || bottom < top) { left = 0; top = 0; right = w - 1; bottom = h - 1; empty = true; }
        const pad = empty ? 0 : 1;
        left = Math.max(0, left - pad); top = Math.max(0, top - pad);
        right = Math.min(w - 1, right + pad); bottom = Math.min(h - 1, bottom + pad);
        const cw = right - left + 1, ch = bottom - top + 1;
        const oc = document.createElement('canvas'); oc.width = cw; oc.height = ch;
        const ocx = oc.getContext('2d');
        // Alfayı panel rengiyle doldur (pad'in eklediği saydam çerçeve dahil) — bu satır
        // olmadan Word saydam bölgeleri beyaza matlaştırıp gri panelde şerit bırakıyor.
        if (bg) { ocx.fillStyle = bg; ocx.fillRect(0, 0, cw, ch); }
        ocx.drawImage(c, left, top, cw, ch, 0, 0, cw, ch);
        resolve({ base64: oc.toDataURL('image/png'), w: cw, h: ch });
      } catch (_) { resolve({ base64, w: img.naturalWidth || 1, h: img.naturalHeight || 1 }); }
    };
    img.onerror = () => resolve({ base64, w: 1, h: 1 });
    img.src = base64;
  });
}

export default function App() {
  // ─── State ───
  const [lang, _setLang] = useState(() => { try { return localStorage.getItem('tyro-lang') || 'tr'; } catch { return 'tr'; } });
  // Synchronous localStorage write — prevents loss during MSAL loginRedirect
  const setLang = useCallback((l) => { try { localStorage.setItem('tyro-lang', l); } catch { /* private mode */ } _setLang(l); }, []);
  const [tab, setTab] = useState(() => {
    const h = window.location.hash;
    if (h === '#concepts') return 'concepts';
    if (h === '#fonts') return 'fonts';
    if (h === '#lab') return 'lab';
    return 'signature';
  });
  const [copied, setCopied] = useState(false);
  // ─── MOBİLDE YALNIZCA İMZA SAYFASI (kullanıcı isteği) ───
  // Alt sekme çubuğu mobilde gizlendi (globalCss). CSS tek başına yetmez: masaüstünde
  // Ayarlar/Banner sekmesindeyken pencere küçültülürse (veya cihaz döndürülürse)
  // kullanıcı gezinme aracı OLMAYAN bir sekmede kalırdı. Bu yüzden mobil eşiğe
  // geçildiğinde sekme imzaya çekilir. Eşik CSS'teki 768px ile AYNI olmalı.
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => { if (mq.matches) setTab(t => (t === 'signature' ? t : 'signature')); };
    apply();
    // Safari 13 öncesi addEventListener desteklemiyor → addListener'a düş
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq.addListener) mq.addListener(apply);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply);
      else if (mq.removeListener) mq.removeListener(apply);
    };
  }, []);

  const [showSteps, setShowSteps] = useState(false);
  const [settingsTab, setSettingsTab] = useState('logo');
  const [form, setForm] = useState({
    firstName: '', lastName: '', titleTR: '', titleEN: '',
    officeId: '', companyId: '', gsm: '', email: '', linkedinPersonal: '',
  });
  const DEFAULT_STG = {
    companyName: 'tyroTech', website: 'www.tyrotech.demo',
    slogan: 'Smart tech. Strong future.', logoColor: '#1e3a5f', accentColor: '#0098d4',
    logoBase64: DEFAULT_LOGO_BASE64, logoW: DEFAULT_LOGO_W, logoH: DEFAULT_LOGO_H,
    social: { linkedin: 'https://www.linkedin.com/company/tyro-tech-demo/', twitter: 'https://x.com/tyrotechdemo', facebook: 'https://www.facebook.com/tyrotechdemo', instagram: 'https://www.instagram.com/tyrotechdemo/' },
    showSDN: true, showFax: true, showAddress: true,
    // GSM görünürlüğü (kullanıcı isteği: GSM alanında 'Gizle' anahtarı).
    // false iken: İMZADA gsm satırı yok (yalnız sabit hat), KARTVİZİTTE telefon ikonu
    // ve QR/vCard GSM yerine SABİT HATTI kullanır; sabit hat da yoksa telefon hiç çıkmaz.
    showGsm: true,
    // E-posta görünürlüğü (GSM ile aynı desen). false iken: imzada e-posta satırı yok,
    // kartvizitte mail ikonu / 'Randevu Talep Et' düğmesi ve QR/vCard'daki EMAIL yok.
    // NOT: LinkedIn için YENİ bayrak eklenmedi — mevcut stg.showLinkedin kullanılıyor
    // (Ayarlar → Sosyal Medya'daki anahtarla AYNI bayrak, iki kontrol çakışmasın).
    showEmail: true,
    showRightBlock: true, showLinkedin: true, showTwitter: true, showFacebook: true, showInstagram: true, showWebsite: true,
    dividerColor: '#0098d4', dividerWidth: 3,
    rightBlockBg: '#024d7e', rightBlockRadius: 6,
    nameColor: '#1e3a5f', titleColor: '#0098d4',
    companyTextColor: '#333333', contactLabelColor: '#888888', contactValueColor: '#555555',
    bannerAccentColor: '',
    designId: 'classic-v4', // varsayılan = "Klasik" etiketi (gri panel + iki kenar çubuğu)
    headerTheme: 'light',
  };
  const [stg, setStg] = useState(() => {
    try {
      const saved = localStorage.getItem('tyro-stg');
      if (saved) {
        const parsed = JSON.parse(saved);
        // designId localStorage'a kaydedilmez → her açılışta varsayılan (klasik) gelir
        return { ...DEFAULT_STG, ...parsed, social: { ...DEFAULT_STG.social, ...(parsed.social || {}) }, designId: DEFAULT_STG.designId };
      }
    } catch { /* ignore */ }
    return DEFAULT_STG;
  });
  const [banner, setBanner] = useState(() => {
    try {
      const saved = localStorage.getItem('tyro-banner');
      if (saved) { const p = JSON.parse(saved); return { template: 'light', size: 'linkedin', title: '', subtitle: '', webLink: '', customBg: '', companyId: 'tyro-tech', logoPosition: 'top-right', showLogo: true, ...p, customBg: '' }; }
    } catch {}
    return { template: 'light', size: 'linkedin', title: '', subtitle: '', webLink: '', customBg: '', companyId: 'tyro-tech', logoPosition: 'top-right', showLogo: true };
  });
  // Promosyon bannerları: birden fazla olabilir (kullanıcı isteği) → items dizisi.
  // Her öge: { base64, width, height, linkUrl, alt }. enabled tümü için ana anahtar.
  const [sigBanner, setSigBanner] = useState({ enabled: false, items: [] });
  const [profileOpen, setProfileOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);

  const [showCelebration, setShowCelebration] = useState(false);
  const fRef = useRef(null);
  const canvasRef = useRef(null);
  const bannerFileRef = useRef(null);

  // ─── Persist lang + all settings ───
  useEffect(() => { try { localStorage.setItem('tyro-lang', lang); } catch { /* private mode */ } }, [lang]);

  // ─── Browser tab title — language-aware ───
  useEffect(() => {
    const slogan = {
      tr: 'Kurumsal Dijital İmza Stüdyosu',
      en: 'Corporate Digital Signature Studio',
      ru: 'Корпоративная Студия Цифровых Подписей',
      ar: 'استوديو التوقيع الرقمي المؤسسي',
    }[lang] || 'Corporate Digital Signature Studio';
    document.title = `tyroSign - ${slogan}`;
    try { document.documentElement.setAttribute('lang', lang); } catch {}
  }, [lang]);
  useEffect(() => { try { const { designId, ...persist } = stg; localStorage.setItem('tyro-stg', JSON.stringify(persist)); } catch {} }, [stg]);
  useEffect(() => { try { const { customBg, ...rest } = banner; localStorage.setItem('tyro-banner', JSON.stringify(rest)); } catch {} }, [banner]);

  // ─── Hooks ───
  const { toasts, toast } = useToast();
  const { MSAL_ENABLED, msalReady, msalAccount, authLoading, handleLogin, handleLogout, fetchManager, sendMail, profilePhoto } = useMsal({ toast, lang, setForm });

  // ─── Derived ───
  const L = useMemo(() => ({ tr: TR, en: EN, ru: RU, ar: AR })[lang] || EN, [lang]);
  const hasData = form.firstName.trim().length > 0;
  const office = OFFICES.find(o => o.id === form.officeId) || null;
  const company = useMemo(() => COMPANIES.find(c => c.id === form.companyId) || null, [form.companyId]);

  // ─── Dynamic company logo (lang-aware) ───
  const [companyLogo, setCompanyLogo] = useState({ base64: DEFAULT_LOGO_BASE64, w: DEFAULT_LOGO_W, h: DEFAULT_LOGO_H });
  useEffect(() => {
    if (!company) { setCompanyLogo({ base64: DEFAULT_LOGO_BASE64, w: DEFAULT_LOGO_W, h: DEFAULT_LOGO_H }); return; }
    const url = companyLogoUrl(company, lang); // ru/ar use EN logos
    if (!url) { setCompanyLogo({ base64: DEFAULT_LOGO_BASE64, w: DEFAULT_LOGO_W, h: DEFAULT_LOGO_H }); return; }
    let cancelled = false;
    loadLogo(url).then(result => {
      if (cancelled) return;
      if (result) setCompanyLogo(result);
      else setCompanyLogo({ base64: DEFAULT_LOGO_BASE64, w: DEFAULT_LOGO_W, h: DEFAULT_LOGO_H });
    });
    return () => { cancelled = true; };
  }, [company, lang, loadLogo]);

  // ─── Kartvizitin QR üstündeki ANA MARKA logosu ───
  // Kural (Ventures → tyroVentures, tyroFoundation → kendi, diğerleri → TYRO) cardStg.js'te;
  // CardEmbed.jsx de aynı kaynaktan okuyor.
  const [cardLogo, setCardLogo] = useState(MAIN_CARD_LOGO);
  useEffect(() => {
    const url = cardLogoUrl(company, lang);
    if (!url) { setCardLogo(MAIN_CARD_LOGO); return; }
    let cancelled = false;
    loadLogo(url).then(result => {
      if (cancelled) return;
      // Yüklenemezse TYRO logosuna düş (kart logosuz kalmasın)
      setCardLogo(result ? { ...result, main: false } : MAIN_CARD_LOGO);
    });
    return () => { cancelled = true; };
  }, [company, lang, loadLogo]);

  // Klasik ailesi: aynı üretici (genSigNavyV4), yalnız kenar çubukları farklı.
  // GRİ PANELLİ olan bu üç tasarımda hem hiyerarşi rozeti hem de eski Outlook için
  // panel rengiyle düzleştirilmiş ikon/rozet kopyası gerekir. Varyantlar eklendiğinde
  // aşağıdaki iki useEffect'in designId listeleri güncellenmemişti → yeni
  // "Klasik - V2/V3"te rozet HİÇ çıkmıyordu ve düzleştirme devre dışı kalıyordu.
  const isGrayPanelDesign = ['classic-v4', 'classic-v4-nl', 'classic-v4-nr'].includes(stg.designId);

  // ─── Klasik-Navy iletişim ikonları (koyu renge boyanmış — beyaz zemin için) ───
  // { mobile, phone, mobileMso, phoneMso } | null
  // İKİ SÜRÜM üretilir çünkü iki motorun ihtiyacı ZIT:
  //   • SAYDAM sürüm → modern istemciler. Apple Mail karanlık modda zemini koyulaştırıyor
  //     ama raster görseli çeviremiyor; saydam olduğu için koyu zemin arkasından geçiyor.
  //   • DÜZLEŞTİRİLMİŞ sürüm → yalnızca eski Outlook. Word saydamlığı hücrenin
  //     bgcolor'ıyla harmanlamak yerine BEYAZA matlaştırıyor, bu yüzden alfası panel
  //     rengiyle önceden düzleştirilmiş bir kopya gerekiyor.
  // Üretici hangisini kime göstereceğini [if mso] koşullu yorumuyla seçiyor.
  // Düzleştirilmiş kopya SADECE gri panelli V4 için gerekli — V2/V3'ün paneli beyaz,
  // orada Word'ün beyaza matlaştırması zaten görünmez.
  const [navyIcons, setNavyIcons] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const msoBg = isGrayPanelDesign ? V4_PANEL_BG : null;
    Promise.all([
      recolorIcon(mobileIconSvg, '#63696e'),
      recolorIcon(phoneIconSvg, '#63696e'),
      recolorIcon(mailIconSvg, '#63696e'),
      msoBg ? recolorIcon(mobileIconSvg, '#63696e', msoBg) : Promise.resolve(null),
      msoBg ? recolorIcon(phoneIconSvg, '#63696e', msoBg) : Promise.resolve(null),
      msoBg ? recolorIcon(mailIconSvg, '#63696e', msoBg) : Promise.resolve(null),
    ]).then(([mobile, phone, mail, mobileMso, phoneMso, mailMso]) => {
      if (!cancelled) setNavyIcons({ mobile, phone, mail, mobileMso, phoneMso, mailMso });
    });
    return () => { cancelled = true; };
  }, [stg.designId]);

  // ─── Şirket directory varsayılanları (companyDirectory.js — Excel kaynaklı) ───
  const companyDir = company ? (COMPANY_DIRECTORY[company.id] || null) : null;

  // Şirket seçilince directory'deki varsayılan ofisi getir (kullanıcı sonradan değiştirebilir)
  useEffect(() => {
    if (companyDir?.officeId && OFFICES.some(o => o.id === companyDir.officeId)) {
      setForm(p => (p.officeId === companyDir.officeId ? p : { ...p, officeId: companyDir.officeId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.companyId]);

  // ─── Hiyerarşi rozeti (üst-seviye logo + subsidiary/affiliate) — V2 ve V3 ───
  const [navyBadge, setNavyBadge] = useState(null); // { base64, w, h, label } | null
  useEffect(() => {
    if (stg.designId !== 'classic-navy' && !isGrayPanelDesign) { setNavyBadge(null); return; }
    const { level, parent, label } = navyInfo(company);
    if (level === 1) { setNavyBadge(null); return; }
    const url = parent ? (lang === 'tr' ? parent.logoTR : parent.logoEN) : null;
    let cancelled = false;
    // Kırpılmış (tight) logo → tüm rozetler tutarlı boyutta.
    // İKİ SÜRÜM (bkz. navyIcons'taki not): saydam → modern istemciler / karanlık mod,
    // panel rengiyle düzleştirilmiş → yalnızca eski Outlook. Düzleştirilmiş kopya
    // sadece gri panelli V4 için üretilir; kırpma aynı olduğu için boyutlar eşit.
    const msoBg = isGrayPanelDesign ? V4_PANEL_BG : null;
    const finalize = (b64) => Promise.all([
      trimLogo(b64, null),
      msoBg ? trimLogo(b64, msoBg) : Promise.resolve(null),
    ]).then(([t, m]) => {
      if (!cancelled) setNavyBadge({ base64: t.base64, base64Mso: m ? m.base64 : null, w: t.w, h: t.h, label });
    });
    // Üst = tyroTech (logosuz) → standart tyro logosu
    if (!url) { finalize(DEFAULT_LOGO_BASE64); return () => { cancelled = true; }; }
    loadLogo(url).then(res => { if (!cancelled) finalize(res ? res.base64 : DEFAULT_LOGO_BASE64); });
    return () => { cancelled = true; };
  }, [stg.designId, company, lang, loadLogo]);

  const effectiveStg = useMemo(() => {
    const nv = navyInfo(company);
    return {
      ...stg,
      logoBase64: companyLogo.base64,
      logoW: companyLogo.w,
      logoH: companyLogo.h,
      logoLeftOffset: companyLogo.leftOffset || 0,
      // Kartvizitin QR üstündeki ana marka logosu (Ventures → tyroVentures, diğerleri → TYRO).
      // Yalnızca BusinessCardModal kullanır; imza üreticileri logoBase64'ü kullanmaya devam eder.
      cardLogoBase64: cardLogo.base64,
      cardLogoW: cardLogo.w,
      cardLogoH: cardLogo.h,
      // Kart logosu TYRO ana logosu mu? (tyroVentures ise false.) Kartvizitte yalnızca
      // TYRO logosuna küçük bir optik sola kaydırma uygulanıyor — bkz.
      // BusinessCardModal içindeki MAIN_LOGO_DX.
      cardLogoIsMain: !!cardLogo.main,
      // Kısa şirket adı (lang-aware; RU/AR → EN). tyroDigital: her dilde İngilizce.
      companyName: company
        ? (company.id === 'tyro-digital' ? company.nameEN : (lang === 'tr' ? company.name : (company.nameEN || company.name)))
        : stg.companyName,
      // Resmi ticari ünvan (directory) — Klasik/V2/V3 şirket satırı bunu tercih eder; tüm dillerde aynı.
      // legalDisplay override'ı varsa AYNEN o; yoksa hukuki uzantılar temizlenmiş legalName (öz ad).
      companyLegalName: companyDir?.legalDisplay || (companyDir?.legalName ? stripLegalSuffix(companyDir.legalName) : null),
      // Varsayılan web sitesi (directory) — yoksa ayarlardaki site
      website: companyDir?.website || stg.website,
      // Varsayılan şirket LinkedIn'i (directory) — kişisel LinkedIn girilirse üreticide o kazanır
      social: { ...stg.social, linkedin: companyDir?.linkedin || stg.social.linkedin },
      linkedinLabel: companyDir?.linkedinLabel || null,
      navyBadge, // Klasik-Navy sağ alt hiyerarşi rozeti
      navyIsMain: nv.level === 1, // 1. seviye (ana) → sol logo daha büyük
      navyIcons, // Klasik-Navy koyu iletişim ikonları
      // Dikey bar rengi seviyeye göre: 1 → lacivert (varsayılan), 2 → tyro mavisi, 3 → tyro altını
      navyBarColor: ({ 2: '#0098d4', 3: '#c8922a' })[nv.level] || null,
      // Hiyerarşi seviyesi (1 ana / 2 grup / 3 iştirak) — V4 sağ kenar çubuğunun rengi bundan türer
      navyLevel: nv.level,
    };
  }, [stg, companyLogo, cardLogo, company, companyDir, lang, navyBadge, navyIcons]);

  // ─── Dynamic banner logo (lang-aware) ───
  const bannerCompany = useMemo(() => COMPANIES.find(c => c.id === banner.companyId) || COMPANIES[0], [banner.companyId]);
  const [bannerLogo, setBannerLogo] = useState({ base64: DEFAULT_LOGO_BASE64, w: DEFAULT_LOGO_W, h: DEFAULT_LOGO_H });
  useEffect(() => {
    const url = bannerCompany.id === 'tyro-digital' ? bannerCompany.logoEN : (lang === 'tr' ? bannerCompany.logoTR : bannerCompany.logoEN);
    if (!url) { setBannerLogo({ base64: DEFAULT_LOGO_BASE64, w: DEFAULT_LOGO_W, h: DEFAULT_LOGO_H }); return; }
    let cancelled = false;
    loadLogo(url).then(result => {
      if (cancelled) return;
      if (result) setBannerLogo(result);
      else setBannerLogo({ base64: DEFAULT_LOGO_BASE64, w: DEFAULT_LOGO_W, h: DEFAULT_LOGO_H });
    });
    return () => { cancelled = true; };
  }, [bannerCompany, lang, loadLogo]);

  const bannerStg = useMemo(() => ({
    ...stg,
    logoBase64: bannerLogo.base64,
    logoW: bannerLogo.w,
    logoH: bannerLogo.h,
  }), [stg, bannerLogo]);

  useBannerCanvas(canvasRef, tab, banner, bannerStg);

  const sigHTML = useMemo(() => {
    // corporate → kavisli + eski Outlook için [if mso] klasik fallback
    if (effectiveStg.designId === 'corporate') return genSigCorporate(form, effectiveStg, office, sigBanner, { withFallback: true });
    // classic-navy → kurumsal spec (sağa hizalı + dikey lacivert bar), doğası gereği eski-Outlook-safe
    if (effectiveStg.designId === 'classic-navy') return genSigNavy(form, effectiveStg, office, sigBanner);
    // classic-v4 → müşteri kartvizit tasarımı: beyaz logo paneli + gri bilgi paneli, iki kenarda çubuk
    if (effectiveStg.designId === 'classic-v4') return genSigNavyV4(form, effectiveStg, office, sigBanner);
    // Klasik'in çubuk varyantları (aynı üretici, yalnız kenar çubukları farklı)
    if (effectiveStg.designId === 'classic-v4-nl') return genSigNavyV4(form, effectiveStg, office, sigBanner, { bars: 'right' });
    if (effectiveStg.designId === 'classic-v4-nr') return genSigNavyV4(form, effectiveStg, office, sigBanner, { bars: 'left' });
    return genSig(form, effectiveStg, office, sigBanner);
  }, [form, effectiveStg, office, sigBanner]);

  const progress = useMemo(() => {
    const filled = PROGRESS_FIELDS.filter(k => form[k].trim().length > 0).length;
    return { filled, total: PROGRESS_FIELDS.length, pct: Math.round((filled / PROGRESS_FIELDS.length) * 100) };
  }, [form]);

  // ─── Handlers ───
  const uf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const procLogo = useCallback((file) => {
    if (!file) return;
    if (file.size > MAX_LOGO_SIZE) { toast('Max 500KB', 'err'); return; }
    if (!file.type.startsWith('image/')) { toast('Invalid file type', 'err'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      const img = new window.Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > MAX_LOGO_W) { const r = MAX_LOGO_W / w; w = MAX_LOGO_W; h = Math.round(h * r); }
        if (h > MAX_LOGO_H) { const r = MAX_LOGO_H / h; h = Math.round(h * r); w = Math.round(w * r); }
        setStg(p => ({ ...p, logoBase64: base64, logoW: w, logoH: h }));
        toast('Logo OK');
      };
      img.onerror = () => toast('Ge\u00e7ersiz g\u00f6rsel', 'err');
      img.src = base64;
    };
    reader.onerror = () => toast('Dosya okunamad\u0131', 'err');
    reader.readAsDataURL(file);
  }, [toast]);

  // index verilirse O banner de\u011fi\u015ftirilir; verilmezse listeye YEN\u0130 banner eklenir.
  const procBanner = useCallback((file, index = null) => {
    if (!file) return;
    if (file.size > MAX_BANNER_SIZE) { toast('Max 2MB', 'err'); return; }
    if (!file.type.startsWith('image/')) { toast('Invalid file type', 'err'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      const img = new window.Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > SIG_WIDTH) { const r = SIG_WIDTH / w; w = SIG_WIDTH; h = Math.round(h * r); }
        // Limit kontrolü setState'ten ÖNCE: güncelleyici içinden bayrak okumak güvenilmez
        // (React güncelleyiciyi erteleyebilir, StrictMode'da iki kez çağırır).
        if (index == null && (sigBanner.items?.length || 0) >= MAX_SIG_BANNERS) {
          toast((L.proBannerLimit || 'En fazla {n} banner').replace('{n}', MAX_SIG_BANNERS), 'err');
          return;
        }
        setSigBanner(p => {
          const items = Array.isArray(p.items) ? [...p.items] : [];
          if (index != null && items[index]) {
            items[index] = { ...items[index], base64, width: w, height: h };
          } else if (items.length < MAX_SIG_BANNERS) {
            items.push({ base64, width: w, height: h, linkUrl: '', alt: '' });
          } else {
            return p; // yarış durumunda ikinci savunma hattı
          }
          return { ...p, enabled: true, items };
        });
        toast('Banner OK');
      };
      img.onerror = () => toast(lang === 'tr' ? 'Ge\u00e7ersiz g\u00f6rsel' : 'Invalid image', 'err');
      img.src = base64;
    };
    reader.onerror = () => toast(lang === 'tr' ? 'Dosya okunamad\u0131' : 'File read error', 'err');
    reader.readAsDataURL(file);
  }, [toast, lang, L, sigBanner.items]);

  const doCopy = useCallback(async () => {
    // Şirket seçimi zorunlu — boşsa kopyalama yapma, hata göster (Ctrl+C dahil)
    if (!form.companyId) { toast(L.companyRequired, 'err'); return; }
    const onSuccess = (path) => {
      // Diagnostic: window.__tyroCopyPath gives ofis kullanıcısına hangi yol başarılı oldu bilgisi
      try { window.__tyroCopyPath = path; console.info('[TYRO] clipboard path:', path); } catch {}
      setCopied(true); setShowCelebration(true); toast(L.cpd);
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setShowCelebration(false), 1800);
    };

    // Diagnostic: domain + clipboard API durumu
    try {
      console.info('[TYRO] copy invoked', {
        host: window.location.host,
        secure: window.isSecureContext,
        hasClipboardAPI: !!(navigator.clipboard && navigator.clipboard.write),
        hasClipboardItem: typeof ClipboardItem !== 'undefined',
        execCommandSupported: typeof document.queryCommandSupported === 'function'
          ? document.queryCommandSupported('copy') : 'unknown',
      });
    } catch {}

    // Panoya gidecek HTML (corporate zaten [if mso] fallback içerir)
    const copyHTML = sigHTML;

    // ─── PRIMARY: DOM-range execCommand copy (universal cross-browser support)
    // Works in: Chrome, Firefox, Safari (desktop+iOS), Edge, Opera, Brave, mobile
    // - Doesn't require clipboard-write permission (works in corporate envs / DLP / MDM)
    // - Auto-generates BOTH text/html and text/plain from same DOM (proper entity decoding)
    // - Outlook respects this on Ctrl+V AND right-click paste
    // - iOS Safari: contenteditable + visible-but-tiny element required (opacity:0 alone fails)
    let domCopySucceeded = false;
    const prevActive = document.activeElement; // restore focus after
    const prevScrollY = window.scrollY;        // iOS Safari may scroll on focus
    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    div.setAttribute('readonly', 'false');     // iOS Safari requires non-readonly
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML = copyHTML;
    // iOS Safari + Firefox: element MUST be in viewport with non-zero size to be selectable.
    // Use 1×1 px transparent element instead of off-screen / display:none / visibility:hidden.
    // user-select + -webkit-user-select ensures programmatic selection works on Safari/iOS.
    div.style.cssText = [
      'position:fixed', 'top:0', 'left:0',
      'width:1px', 'height:1px',
      'padding:0', 'margin:0', 'border:0',
      'opacity:0',
      'overflow:hidden',
      'background:transparent',
      'user-select:text', '-webkit-user-select:text', '-moz-user-select:text',
      'font-size:12pt',  // iOS Safari prevents zoom on focus when font-size >= 12pt
    ].join(';');
    document.body.appendChild(div);
    try {
      // Firefox needs explicit focus before selection in some cases
      if (typeof div.focus === 'function') div.focus({ preventScroll: true });

      const range = document.createRange();
      range.selectNodeContents(div);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
        // iOS Safari fallback — explicit setSelectionRange not applicable to div,
        // but Range-based selection works when element is contenteditable + visible
        if (typeof document.queryCommandSupported !== 'function' ||
            document.queryCommandSupported('copy')) {
          domCopySucceeded = document.execCommand('copy');
        }
        sel.removeAllRanges();
      }
    } catch { /* fall through to ClipboardItem */ }
    document.body.removeChild(div);
    // Restore focus + scroll (iOS Safari may have shifted)
    if (prevActive && typeof prevActive.focus === 'function') {
      try { prevActive.focus({ preventScroll: true }); } catch {}
    }
    if (window.scrollY !== prevScrollY) window.scrollTo(0, prevScrollY);

    if (domCopySucceeded) { onSuccess('execCommand'); return; }
    console.warn('[TYRO] execCommand path failed, trying ClipboardItem');

    // ─── FALLBACK: ClipboardItem API (modern; may fail in restricted corp envs)
    try {
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        // Properly decode HTML entities for plain text version
        const tmp = document.createElement('div');
        tmp.innerHTML = copyHTML;
        const plainText = tmp.innerText || tmp.textContent || '';
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([copyHTML], { type: 'text/html' }),
            'text/plain': new Blob([plainText], { type: 'text/plain' }),
          }),
        ]);
        onSuccess('ClipboardItem');
        return;
      }
    } catch (err) {
      console.warn('[TYRO] ClipboardItem path failed:', err && err.message);
    }

    // ─── LAST RESORT: writeText only (PLAIN TEXT — rich format kaybolur)
    try {
      const tmp = document.createElement('div');
      tmp.innerHTML = copyHTML;
      await navigator.clipboard.writeText(tmp.innerText || tmp.textContent || '');
      onSuccess('writeText-plainOnly');
      console.warn('[TYRO] Only plain text copied — rich HTML lost. Likely cause: Permissions-Policy or corporate proxy stripping clipboard API.');
    } catch (err) {
      console.error('[TYRO] All clipboard paths failed:', err && err.message);
      toast('Error', 'err');
    }
  }, [sigHTML, form, L, toast]);

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+C (not in input/textarea) → copy signature
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && hasData) {
        const tag = document.activeElement?.tagName;
        const sel = window.getSelection();
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (sel && sel.toString().length > 0)) return;
        e.preventDefault();
        doCopy();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [hasData, doCopy]);

  const doReset = useCallback(() => {
    setForm({ firstName: '', lastName: '', titleTR: '', titleEN: '', officeId: '', companyId: '', gsm: '', email: '', linkedinPersonal: '' });
    toast(L.rst, 'info');
  }, [L, toast]);

  const downloadBanner = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'banner.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast(L.banDl);
  }, [L, toast]);

  // ─── Login Splash ───
  if (MSAL_ENABLED && !msalAccount) {
    return <LoginSplash lang={lang} setLang={setLang} authLoading={authLoading} msalReady={msalReady} handleLogin={handleLogin} />;
  }

  // ─── Main App ───
  return (
    <div style={{ fontFamily: 'Inter,sans-serif', background: C.bg, color: C.text1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{GLOBAL_CSS}</style>
      <a href="#main-content" className="skip-link">{lang === 'tr' ? 'İçeriğe geç' : 'Skip to content'}</a>

      <AppHeader
        tab={tab} setTab={setTab}
        lang={lang} setLang={setLang} L={L}
        msalAccount={msalAccount} profileOpen={profileOpen} setProfileOpen={setProfileOpen}
        handleLogout={handleLogout} profilePhoto={profilePhoto}
        headerTheme={stg.headerTheme}
      />

      {/* Animated gradient accent line */}
      <div style={{
        height: 2,
        backgroundImage: `linear-gradient(90deg, ${C.primary}, ${C.divider}, ${C.accent}, ${C.primary})`,
        backgroundSize: '300% 100%',
        animation: 'gradientShift 4s ease infinite',
        opacity: 0.7,
      }} />

      <main id="main-content" className="app-main" role="main" style={{ flex: 1, padding: '1rem 2rem', maxWidth: 1400, width: '100%', margin: '0 auto' }}>

        {tab === 'signature' && (
          <SignatureTab
            form={form} uf={uf} stg={stg} effectiveStg={effectiveStg} setStg={setStg} office={office} company={company}
            sigHTML={sigHTML} hasData={hasData} progress={progress} L={L} lang={lang}
            copied={copied} doCopy={doCopy} doReset={doReset}
            showSteps={showSteps} setShowSteps={setShowSteps}
            designOpen={designOpen} setDesignOpen={setDesignOpen}
            sigBanner={sigBanner} setSigBanner={setSigBanner}
            bannerFileRef={bannerFileRef} procBanner={procBanner}
            msalAccount={msalAccount} toast={toast}
            fetchManager={fetchManager} sendMail={sendMail} profilePhoto={profilePhoto}
          />
        )}

        {tab === 'banner' && (
          <BannerTab
            banner={banner} setBanner={setBanner} stg={bannerStg}
            canvasRef={canvasRef} downloadBanner={downloadBanner} L={L} lang={lang}
          />
        )}

        {tab === 'settings' && (
          <Suspense fallback={null}>
            <SettingsModal
              settingsTab={settingsTab} setSettingsTab={setSettingsTab}
              stg={stg} setStg={setStg} fRef={fRef} procLogo={procLogo}
              toast={toast} L={L} lang={lang}
              DEFAULT_LOGO_BASE64={DEFAULT_LOGO_BASE64}
            />
          </Suspense>
        )}

        {tab === 'concepts' && (
          <Suspense fallback={null}>
            <LogoConceptsPage onBack={() => setTab('signature')} />
          </Suspense>
        )}

        {tab === 'fonts' && (
          <Suspense fallback={null}>
            <FontDemoPage onBack={() => setTab('signature')} />
          </Suspense>
        )}

        {tab === 'lab' && (
          <Suspense fallback={null}>
            <LogoLabPage onBack={() => setTab('signature')} />
          </Suspense>
        )}

        {tab === 'help' && (
          <Suspense fallback={null}>
            <HelpPage lang={lang} onBack={() => setTab('signature')} />
          </Suspense>
        )}

      </main>

      <BottomTabBar tab={tab} setTab={setTab} />
      <AppFooter />
      <CopySuccess show={showCelebration} />
      {tab === 'signature' && <OnboardingGuide L={L} />}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
