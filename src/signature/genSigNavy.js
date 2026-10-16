import { escapeHtml, sanitizeUrl, titleCase, formatGSM } from '../utils/formatting';
import { sigBannerRows } from './sigBannerRows';
import { wrapToWidth } from './wrapToWidth';
import { solidPng } from './solidPng';
import { linkedinBlueSvg } from '../icons/svgDataUris';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KLASİK - NAVY SIGNATURE GENERATOR (MAIL-SIGN spec, 1. tasarım)
// Beyaz zemin • solda logo + logonun sağ kenarına hizalı slogan (tek satır)
// • sağa hizalı TEK akış bloğu, 3 grup (ayraç çizgisi YOK, sadece boşluk):
//     1) Ad SOYAD (bold koyu) + ünvan (gri)
//     2) Şirket resmi adı (bold) + adres satırları
//     3) Pbx/Fax/Gsm satırı + e-posta (lokal kısım bold koyu, domain gri)
// • EN SAĞDA dikey lacivert bar (~16px) — TAM olarak bilgi bloğu boyunca
// • altta sola hizalı footer: web sitesi (bold) + LinkedIn
// Eski Outlook (Word motoru) uyumlu: tablo tabanlı, solid hex, radius yok,
// boşluklar spacer satırlarıyla, her hücrede bgcolor (dark mode dayanıklılığı).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const genSigNavy = (f, s, office, sigBanner) => {
  const firstName = escapeHtml(titleCase(f.firstName));
  const lastName = f.lastName ? escapeHtml(f.lastName.toLocaleUpperCase('tr-TR')) : '';
  const name = [firstName, lastName].filter(Boolean).join(' ');
  // İki ünvan AYRAÇLA değil ALT SATIRA yazılır (kullanıcı isteği — Klasik ile aynı)
  const titleLines = [escapeHtml(titleCase(f.titleEN)), escapeHtml(titleCase(f.titleTR))].filter(Boolean);
  // Resmi ticari ünvan (companyDirectory) varsa onu göster; yoksa kısa şirket adı
  const companyName = escapeHtml(s.companyLegalName || s.companyName || '');

  const WHITE = '#ffffff';
  const navy = s.rightBlockBg || s.logoColor || '#1e3a5f'; // fallback logo zemini
  // Dikey bar rengi seviyeye göre (App.jsx): 2→yeşil, 3→turkuaz; yoksa lacivert
  const barColor = s.navyBarColor || navy;
  const cDark = '#26292e';   // ad-soyad / şirket adı / e-posta lokali (spec: koyu antrasit)
  const cGray = '#63696e';   // ünvan / adres / telefonlar / e-posta domaini
  const cSoft = '#8b9299';   // slogan + rozet etiketi (bold-italik, açık gri)
  const PADX = 20;           // kart iç yatay marj (spec 25px @800 → ~20px @600)
  const BAR = 8;             // dikey bar genişliği (yarıya indirildi: 16 → 8)

  // Sol logo boyutu: 1. seviye (ana) en büyük; 2./3. seviye de biraz büyütülür
  const isMain = !!s.navyIsMain;
  const logoScale = isMain ? 1.25 : 1.2;
  const lw = Math.round((s.logoW || 140) * logoScale);
  const lh = Math.round((s.logoH || 45) * logoScale);

  const logo = s.logoBase64
    ? `<img src="${s.logoBase64}" width="${lw}" height="${lh}" alt="Logo" style="display:block;border:0;" />`
    : `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:middle;padding-right:6px;"><div style="width:40px;height:40px;background:${navy};border-radius:8px;text-align:center;line-height:40px;"><span style="font-family:Georgia,serif;font-size:26px;font-weight:bold;color:#c8922a;">T</span></div></td><td style="vertical-align:middle;"><span style="font-family:Georgia,serif;font-size:20px;font-weight:bold;color:${navy};letter-spacing:1.5px;">tyro</span></td></tr></table>`;

  // Slogan kaldırıldı (kullanıcı isteği) — sol tarafta sadece logo
  const slogan = '';

  // ── Sağa hizalı bilgi bloğu — TEK akış (çizgi YOK) ──
  // Boşluk grup başı satırın padding-top'ıyla verilir (td padding = Word-safe).
  // gap: ünvandan sonra KÜÇÜK boşluk (9px); telefondan önce boşluk YOK (0).
  //
  // Satır yükseklikleri artık ORANLI (1.25/1.35) değil SABİT PİKSEL + mso kilidi.
  // Sebep: sağdaki dikey çubuk resim olarak basılıyor ve boyu bu satırların toplamından
  // hesaplanıyor; Word oranlı line-height'ta kendi (daha yüksek) metriğini uyguladığı
  // için hesap tutmuyordu. mso-line-height-rule:exactly ile Word satırı TAM verilen
  // piksele diziyor → çubuk boyu iki motorda da doğru. Değerler eski oranların
  // yuvarlanmışı (15×1.25≈19, 12×1.35≈16, 12×1.3≈16, 11×1.35≈15) → görünüm korunur.
  const mkRow = (html, pt, L) => `<tr><td align="right" style="text-align:right;${pt ? `padding-top:${pt}px;` : ''}font-family:Arial,sans-serif;line-height:${L}px;mso-line-height-rule:exactly;">${html}</td></tr>`;

  const g1 = { gap: 0, rows: [] };  // Ad + ünvan(lar)
  g1.rows.push([`<span style="font-size:15px;font-weight:bold;color:${cDark};">${name || 'Ad SOYAD'}</span>`, 0, 19]);
  // İki ünvan ayraçla ('|') değil ALT SATIRA (kullanıcı isteği — Klasik ile aynı davranış)
  titleLines.forEach((t, i) => g1.rows.push([`<span style="font-size:12px;color:${cGray};">${t}</span>`, i === 0 ? 1 : 0, 16]));

  const g2 = { gap: 9, rows: [] };  // Şirket resmi adı + adres (ünvandan sonra küçük boşluk)
  if (companyName) g2.rows.push([`<span style="font-size:12px;font-weight:bold;color:${cDark};">${companyName}</span>`, 0, 16]);
  if (s.showAddress !== false && office) {
    // ADRES ÖLÇÜLEREK SATIRLANIR — satır yüksekliği mso ile 15px'e KİLİTLİ olduğu için
    // sığmayan adres eski Outlook'ta kırpılırdı (ölçüldü: gerçek 27px > kilitli 15px).
    // Genişlik logo boyutuna göre değiştiği için sabit yazılmaz, buradan türetilir:
    //   600 − sol marj − logo − logo sağ boşluğu − bilgi hücresi sağ dolgusu − bar
    const addrAvail = 600 - PADX - lw - 16 - 14 - BAR;
    wrapToWidth(office.address, addrAvail, '11px Arial, sans-serif').forEach((ln, i) =>
      g2.rows.push([`<span style="font-size:11px;color:${cGray};">${escapeHtml(ln)}</span>`, i === 0 ? 1 : 0, 15]));
    g2.rows.push([`<span style="font-size:11px;color:${cGray};">${escapeHtml(office.city)}</span>`, 0, 15]);
  }

  // Gsm/Sdn: metin label yerine ikon (klasikteki gibi) — koyuya boyanmış PNG (s.navyIcons)
  const ic = s.navyIcons;
  const mkIcon = (src) => `<img src="${src}" width="12" height="12" alt="" style="vertical-align:middle;border:0;" />&nbsp;`;
  const telItems = [];
  // showGsm false ise GSM satırı ÇIKMAZ — yalnız sabit hat kalır (kullanıcı isteği,
  // GSM alanındaki 'Gizle' anahtarı). showSDN/showFax ile aynı desen.
  if (s.showGsm !== false && f.gsm) telItems.push((ic && ic.mobile ? mkIcon(ic.mobile) : 'Gsm:&nbsp;') + `<span style="vertical-align:middle;">${escapeHtml(formatGSM(f.gsm))}</span>`);
  const landline = [];
  if (s.showSDN !== false && office?.sdn) landline.push(escapeHtml(office.sdn));
  if (s.showFax !== false && office?.fax) landline.push(`Fax: ${escapeHtml(office.fax)}`);
  if (landline.length) telItems.push((ic && ic.phone ? mkIcon(ic.phone) : 'Pbx:&nbsp;') + `<span style="vertical-align:middle;">${landline.join('&nbsp;&nbsp;')}</span>`);
  const g3 = { gap: 0, rows: [] };  // Telefonlar + e-posta (telefondan ÖNCE boşluk YOK)
  if (telItems.length > 0) g3.rows.push([`<span style="font-size:11px;color:${cGray};white-space:nowrap;">${telItems.join('&nbsp;&nbsp;&nbsp;')}</span>`, 0, 15]);
  // showEmail false ise e-posta satırı ÇIKMAZ (GSM'deki 'Gizle' anahtarıyla aynı desen).
  if (s.showEmail !== false && f.email) {
    // Başına ZARF ikonu — "@" metni e-posta adresinin içindekiyle tekrar ediyordu
    // (kullanıcı isteği, Klasik ile aynı davranış). İkon yüklenmemişse @ önekine düşer.
    const mailPrefix = (ic && ic.mail) ? mkIcon(ic.mail) : `<span style="color:${cGray};">@</span>&nbsp;`;
    g3.rows.push([`<a href="mailto:${escapeHtml(f.email)}" style="text-decoration:none;font-size:11px;color:${cDark};">${mailPrefix}${escapeHtml(f.email)}</a>`, 1, 15]);
  }

  // Grupları birleştir: her grubun İLK satırına kendi gap'i eklenir (ilk grup hariç)
  const groups = [g1, g2, g3].filter(g => g.rows.length > 0);
  // Düz liste: [html, toplam üst boşluk, satır yüksekliği]
  const flatRows = [];
  groups.forEach((g, gi) => g.rows.forEach(([html, pt, L], ri) => flatRows.push([html, pt + (gi > 0 && ri === 0 ? g.gap : 0), L])));
  const infoRows = flatRows.map(([html, pt, L]) => mkRow(html, pt, L)).join('');
  // Dikey çubuğun boyu = bilgi bloğunun TAM yüksekliği (Word'de satırlar kilitli olduğu
  // için bu sayı orada da geçerli). Tarayıcıda satırlar font metriğiyle birkaç px
  // büyüyebilir; eksik kalan kısmı hücrenin bgcolor'ı kapatır.
  const infoH = flatRows.reduce((acc, [, pt, L]) => acc + pt + L, 0);

  // ── Footer: web sitesi (bold koyu) + LinkedIn — sola hizalı ──
  const usingPersonalLi = !!(f.linkedinPersonal && f.linkedinPersonal.trim());
  const linkedinUrl = sanitizeUrl((f.linkedinPersonal && f.linkedinPersonal.trim()) || s.social.linkedin);
  const derivedLiHandle = linkedinUrl ? linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/(company\/|in\/)?/i, '').replace(/\/$/, '').replace(/-/g, '') : '';
  // Şirket LinkedIn'inde directory kısa etiketi (ör. 'tyroventures') tercih edilir; kişisel girildiyse türetilen kalır
  const linkedinHandle = usingPersonalLi ? derivedLiHandle : (s.linkedinLabel || derivedLiHandle);
  const websiteDisplay = s.website ? s.website.replace(/^www\./i, '') : '';
  const footerItems = [];
  if (s.showWebsite !== false && websiteDisplay) footerItems.push(`<a href="${sanitizeUrl(s.website)}" style="color:${cSoft};font-size:11px;text-decoration:none;font-style:italic;font-weight:bold;">${escapeHtml(websiteDisplay)}</a>`);
  if (s.showLinkedin !== false && linkedinUrl) footerItems.push(`<a href="${linkedinUrl}" target="_blank" style="text-decoration:none;"><img src="${linkedinBlueSvg}" width="13" height="13" alt="in" style="vertical-align:-2px;border:0;" />&nbsp;<span style="color:${cSoft};font-size:11px;font-style:italic;font-weight:bold;">${linkedinHandle || 'LinkedIn'}</span></a>`);
  const hasFooter = footerItems.length > 0;

  // ── Sağ alt hiyerarşi rozeti: üst-seviye logo + italik subsidiary/affiliate ──
  // (Seviye 1 = ana şirket → rozet yok; App.jsx s.navyBadge'i hesaplar)
  let badge = '';
  if (s.navyBadge && s.navyBadge.base64 && s.navyBadge.label) {
    // Kırpılmış logo → tutarlı; affiliate (2. seviye) rozet logosu biraz daha büyük
    // TÜM rozetler tek tip: logo 17px, etiket 11px (affiliate/subsidiary/logo türü ayrımı yok)
    const bh = 17;
    const bw = s.navyBadge.h ? Math.max(1, Math.round(s.navyBadge.w * bh / s.navyBadge.h)) : bh;
    // Mini tablo: Outlook (Word) inline vertical-align'ı bozuyor; td middle güvenilir →
    // etiket logoya göre dikey ORTALI durur
    badge = `<table cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;"><tr>` +
      `<td style="vertical-align:middle;"><img src="${s.navyBadge.base64}" width="${bw}" height="${bh}" alt="" style="display:block;border:0;" /></td>` +
      `<td style="vertical-align:middle;padding-left:5px;font-style:italic;font-size:11px;color:${cSoft};font-family:Arial,sans-serif;line-height:${bh}px;">${escapeHtml(s.navyBadge.label)}</td>` +
      `</tr></table>`;
  }
  const showFooter = hasFooter || !!badge;

  // Responsive: dar ekranda logo üste ortalanır, bilgi bloğu sola yaslanır, bar gizlenir
  const sigCSS = `<style>@media screen and (max-width:480px){.sgnv-table{width:100%!important}.sgnv-logo,.sgnv-info{display:block!important;width:100%!important;box-sizing:border-box!important}.sgnv-logo{text-align:center!important;padding:12px 0 4px!important}.sgnv-logo img{margin:0 auto!important}.sgnv-logo div{width:auto!important;text-align:center!important}.sgnv-info{text-align:left!important;padding:8px 14px!important}.sgnv-info table{float:none!important;margin:0!important}.sgnv-info td{text-align:left!important}.sgnv-bar{display:none!important}.sgnv-foot{text-align:center!important;padding:10px 0 12px!important}}</style>`;

  return sigCSS +
    `<table class="sgnv-table" bgcolor="${WHITE}" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px; max-width:600px; background-color:${WHITE}; font-family:Arial,sans-serif; border-collapse:collapse;">` +
    // Üst marj (bar bu satıra girmez → bar tam bilgi bloğuyla başlar, spec'teki gibi)
    `<tr><td colspan="3" height="20" bgcolor="${WHITE}" style="font-size:0;line-height:20px;height:20px;background-color:${WHITE};">&nbsp;</td></tr>` +
    // Ana satır: logo+slogan | bilgi bloğu (sağa hizalı tek akış) | dikey bar
    `<tr>` +
    `<td class="sgnv-logo" bgcolor="${WHITE}" style="vertical-align:top;background-color:${WHITE};padding:2px 16px 0 ${PADX}px;white-space:nowrap;">${logo}${slogan}</td>` +
    `<td class="sgnv-info" width="100%" bgcolor="${WHITE}" style="width:100%;vertical-align:top;background-color:${WHITE};padding:0 14px 0 0;">` +
      `<table cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;">${infoRows}</table>` +
    `</td>` +
    // Dikey bar ÇİFT KATMAN (Klasik/V4 ile aynı reçete):
    //  1) RESİM (asıl taşıyıcı) — alfasız düz renk PNG, boyu infoH. Word bir resmi
    //     ASLA bölemez. Eskiden burada içi boş bgcolor hücresi vardı ve eski Outlook
    //     onu tek satır boyunda boyayıp gerisini boş bırakıyordu → çubuk kesik kesik
    //     görünüyordu (V4'te ofis testiyle doğrulanan aynı hata).
    //  2) hücrenin bgcolor'ı (yedek) — tarayıcı td zeminini satırın tamamında boyar;
    //     resim engellenirse/yüklenmezse çubuğu zemin taşır.
    // Renk kullanıcı ayarından da gelebildiği için PNG çalışma anında üretilir (solidPng).
    `<td class="sgnv-bar" width="${BAR}" height="${infoH}" bgcolor="${barColor}" style="width:${BAR}px;height:${infoH}px;background-color:${barColor};font-size:0;line-height:0;vertical-align:top;"><img src="${solidPng(barColor, BAR, 2)}" width="${BAR}" height="${infoH}" alt="" style="display:block;border:0;width:${BAR}px;height:${infoH}px;" /></td>` +
    `</tr>` +
    // Footer öncesi boşluk + footer: SOLDA web/LinkedIn, SAĞDA hiyerarşi rozeti
    (showFooter
      ? `<tr><td colspan="3" height="16" bgcolor="${WHITE}" style="font-size:0;line-height:16px;height:16px;background-color:${WHITE};">&nbsp;</td></tr>` +
        `<tr><td class="sgnv-foot" colspan="3" bgcolor="${WHITE}" style="background-color:${WHITE};padding:0 ${PADX}px 4px ${PADX}px;">` +
          `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr>` +
            `<td align="left" style="text-align:left;line-height:16px;white-space:nowrap;padding-left:${s.logoLeftOffset || 0}px;">${footerItems.join('&nbsp;&nbsp;&nbsp;')}</td>` +
            `<td align="right" style="text-align:right;line-height:16px;white-space:nowrap;">${badge}</td>` +
          `</tr></table>` +
        `</td></tr>`
      : `<tr><td colspan="3" height="6" bgcolor="${WHITE}" style="font-size:0;line-height:6px;height:6px;background-color:${WHITE};">&nbsp;</td></tr>`) +
    sigBannerRows(sigBanner, 3) +
    `</table>`;
};
