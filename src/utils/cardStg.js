// Kartvizit için ORTAK TÜRETME — App.jsx ve CardEmbed.jsx aynı kuralları buradan okur.
// Buradaki kurallar eskiden yalnız App.jsx'in içindeydi; embed rotası eklenirken
// kopyalanmadı, çıkarıldı: kart logosu/hiyerarşi kuralı iki yerde ayrı hesaplanırsa
// sessizce ayrışır (bu depoda daha önce yaşandı — bkz. BusinessCardModal'daki
// cardPhone yorumu).
import DEFAULT_LOGO_BASE64 from '../defaultLogo.js';
import { COMPANIES } from '../constants/companies';
import { COMPANY_DIRECTORY } from '../constants/companyDirectory';
import { MAX_LOGO_W, MAX_LOGO_H, DEFAULT_LOGO_W, DEFAULT_LOGO_H } from '../constants/limits';
import { stripLegalSuffix } from './formatting';

// ─── Logo yükleyici (PNG → base64, kalite kaybı yok) ───
const logoCache = {};
export function loadLogo(url) {
  if (!url) return Promise.resolve(null);
  if (logoCache[url]) return Promise.resolve(logoCache[url]);
  return fetch(url)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        const img = new window.Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > MAX_LOGO_W) { const ratio = MAX_LOGO_W / w; w = MAX_LOGO_W; h = Math.round(h * ratio); }
          if (h > MAX_LOGO_H) { const ratio = MAX_LOGO_H / h; h = Math.round(h * ratio); w = Math.round(w * ratio); }
          // Measure left visual offset: how many px of whitespace/transparency before visible content
          let leftOffset = 0;
          try {
            const cvs = document.createElement('canvas');
            const sc = 0.25; // scan at 25% for speed
            cvs.width = Math.round(img.naturalWidth * sc);
            cvs.height = Math.round(img.naturalHeight * sc);
            const cx = cvs.getContext('2d');
            cx.drawImage(img, 0, 0, cvs.width, cvs.height);
            const px = cx.getImageData(0, 0, cvs.width, cvs.height).data;
            const W = cvs.width, H = cvs.height;
            outer: for (let x = 0; x < W; x++) {
              for (let y = 0; y < H; y++) {
                const i = (y * W + x) * 4;
                if (px[i + 3] > 30 && !(px[i] > 240 && px[i+1] > 240 && px[i+2] > 240)) {
                  // Convert scaled px back to rendered pixels
                  leftOffset = Math.round(x / sc * (w / img.naturalWidth));
                  break outer;
                }
              }
            }
          } catch (_) { leftOffset = 0; }
          const result = { base64, w, h, leftOffset };
          logoCache[url] = result;
          resolve(result);
        };
        img.onerror = () => reject(new Error('img'));
        img.src = base64;
      };
      reader.onerror = () => reject(new Error('read'));
      reader.readAsDataURL(blob);
    }))
    .catch(() => null);
}

// ─── Klasik-Navy hiyerarşisi ───
// ÖNCELİK: companyDirectory.js (Excel kaynaklı resmi harita) → parentId/relation.
// FALLBACK (directory'de yoksa) eski kural:
//   Seviye 1 (TYRO Tech / ana): rozet YOK
//   Seviye 2 (grup başı, ör. TYRO Yazılım): üst = TYRO Tech → "subsidiary"
//   Seviye 3 (alt şirket): üst = grup başı → "affiliate"
export function navyInfo(company) {
  if (!company || company.id === 'tyro-tech') return { level: 1, parent: null, label: null };
  const dir = COMPANY_DIRECTORY[company.id];
  if (dir && dir.parentId) {
    const parent = COMPANIES.find(c => c.id === dir.parentId) || null;
    const label = dir.relation || 'affiliate';
    return { level: label === 'subsidiary' ? 2 : 3, parent, label };
  }
  if (company.name === company.group) {
    return { level: 2, parent: COMPANIES.find(c => c.id === 'tyro-tech') || null, label: 'subsidiary' };
  }
  return { level: 3, parent: COMPANIES.find(c => c.group === company.group && c.name === c.group) || null, label: 'affiliate' };
}

// ─── Kartvizitin QR üstündeki ANA MARKA logosu ───
// Kartvizitte kural olarak şirketin kendi logosu değil, ana marka logosu gösterilir
// (kullanıcı isteği): "TYRO Ventures" grubunda NEXA STUDIO, diğerlerinde TYRO.
// İSTİSNA: CARD_OWN_LOGO_IDS listesindeki şirketler kendi logolarını gösterir
// (TYRO Vakfı bir VAKIF — TYRO marka çatısı altında değil).
const CARD_BRAND_GROUP = 'TYRO Ventures';
const CARD_OWN_LOGO_IDS = ['tyro-vakfi'];
export const MAIN_CARD_LOGO = { base64: DEFAULT_LOGO_BASE64, w: DEFAULT_LOGO_W, h: DEFAULT_LOGO_H, main: true };

/** Kartın marka logosu için kaynak URL — null ise TYRO ana logosu kullanılır. */
export function cardLogoUrl(company, lang) {
  const ownLogo = !!company && CARD_OWN_LOGO_IDS.includes(company.id);
  const organic = !!company && company.group === CARD_BRAND_GROUP;
  if (!ownLogo && !organic) return null;
  const src = ownLogo ? company : COMPANIES.find(c => c.id === 'nexa-studio');
  return src ? (lang === 'tr' ? src.logoTR : src.logoEN) : null;
}

/** Şirketin KENDİ logosu (imzada ve kartın bilgi tarafında kullanılan). RU/AR → EN. */
export function companyLogoUrl(company, lang) {
  if (!company) return null;
  return company.id === 'tyro-digital' ? company.logoEN : (lang === 'tr' ? company.logoTR : company.logoEN);
}

/** Kısa şirket adı (lang-aware; RU/AR → EN). TYRO Digital: her dilde İngilizce. */
export function companyShortName(company, lang, fallback = 'TYRO Tech') {
  if (!company) return fallback;
  if (company.id === 'tyro-digital') return company.nameEN;
  return lang === 'tr' ? company.name : (company.nameEN || company.name);
}

/** Resmi ticari ünvan (directory) — yoksa null. Tüm dillerde aynı. */
export function companyLegalName(company) {
  const dir = company ? COMPANY_DIRECTORY[company.id] : null;
  if (!dir) return null;
  return dir.legalDisplay || (dir.legalName ? stripLegalSuffix(dir.legalName) : null);
}

/**
 * Kartvizit çizimi için gereken stg alanlarını üretir (logolar dahil, async).
 * App.jsx'in effectiveStg'si React state'e bağlı olduğu için ayrı duruyor; ama
 * KURALLAR (marka logosu, hiyerarşi, ad seçimi) yukarıdaki ortak yardımcılardan
 * geliyor — iki yol aynı kaynaktan besleniyor.
 */
export async function buildCardStg({ company, lang }) {
  const [own, brand] = await Promise.all([
    loadLogo(companyLogoUrl(company, lang)),
    loadLogo(cardLogoUrl(company, lang)),
  ]);
  const companyLogo = own || { base64: DEFAULT_LOGO_BASE64, w: DEFAULT_LOGO_W, h: DEFAULT_LOGO_H };
  const cardLogo = cardLogoUrl(company, lang)
    ? (brand ? { ...brand, main: false } : MAIN_CARD_LOGO)
    : MAIN_CARD_LOGO;
  const dir = company ? COMPANY_DIRECTORY[company.id] : null;

  return {
    logoBase64: companyLogo.base64,
    logoW: companyLogo.w,
    logoH: companyLogo.h,
    cardLogoBase64: cardLogo.base64,
    cardLogoW: cardLogo.w,
    cardLogoH: cardLogo.h,
    cardLogoIsMain: !!cardLogo.main,
    companyName: companyShortName(company, lang),
    companyLegalName: companyLegalName(company),
    navyLevel: navyInfo(company).level,
    social: { linkedin: (dir && dir.linkedin) || 'https://www.linkedin.com/company/tyro-tech-demo/' },
    showGsm: true, showEmail: true, showLinkedin: true,
  };
}
