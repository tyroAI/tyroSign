import { escapeHtml, sanitizeUrl } from '../utils/formatting';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROMOSYON BANNER SATIRLARI — TÜM imza üreticileri buradan geçer
// Kullanıcı birden fazla banner ekleyebilir; imzanın altına ALT ALTA dizilirler.
//
// Şekil: { enabled: bool, items: [{ base64, width, height, linkUrl, alt }] }
// Eski TEK banner şekli ({ enabled, base64, linkUrl, alt }) da kabul edilir —
// bannerItems() normalize eder, böylece eski kayıtlı/dışarıdan gelen state kırılmaz.
//
// Eski Outlook (Word motoru) notları:
//   • Her satır kendi <tr> → Word satır aralarına kıl boşluk koysa bile bannerlar
//     birbirine yapışık görünür (padding-top ile aralık zaten veriliyor).
//   • Hücrede font-size/line-height 0 → resmin altında istenmeyen boşluk oluşmaz.
//   • bgcolor her hücrede (dark mode + "Merge Formatting" yapıştırma dayanıklılığı).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WHITE = '#ffffff';

/** State'i normalize eder → çizilecek banner listesi (kapalıysa veya boşsa []). */
export const bannerItems = (sigBanner) => {
  if (!sigBanner || !sigBanner.enabled) return [];
  const list = Array.isArray(sigBanner.items)
    ? sigBanner.items
    : (sigBanner.base64 ? [sigBanner] : []); // eski tek-banner şekli
  return list.filter(b => b && b.base64);
};

/**
 * Banner <tr> satırlarını üretir.
 * @param sigBanner state
 * @param colspan   üreticinin ana tablosundaki sütun sayısı
 * @param width     imza genişliği (px) — tüm tasarımlarda 600
 */
export const sigBannerRows = (sigBanner, colspan, width = 600) => {
  const items = bannerItems(sigBanner);
  if (!items.length) return '';
  return items.map((b, i) => {
    const img = `<img src="${b.base64}" width="${width}" alt="${escapeHtml(b.alt || 'Banner')}" style="display:block; border:0; width:100%; height:auto;" />`;
    const content = b.linkUrl
      ? `<a href="${sanitizeUrl(b.linkUrl)}" target="_blank" style="text-decoration:none;">${img}</a>`
      : img;
    // İlk banner imzadan 10px ayrılır; sonrakiler birbirine daha yakın (6px) durur
    const padTop = i === 0 ? 10 : 6;
    return `<tr><td colspan="${colspan}" bgcolor="${WHITE}" style="background-color:${WHITE};padding-top:${padTop}px;font-size:0;line-height:0;">${content}</td></tr>`;
  }).join('');
};
