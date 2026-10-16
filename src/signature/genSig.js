import { escapeHtml, sanitizeUrl, titleCase, formatGSM } from '../utils/formatting';
import { sigBannerRows } from './sigBannerRows';
import { phoneIconSvg, mobileIconSvg, linkedinBlueSvg } from '../icons/svgDataUris';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLASSIC SIGNATURE GENERATOR
// Corporate tasarımın YATAY + DİKDÖRTGEN (kavissiz) + ESKİ-OUTLOOK UYUMLU versiyonu.
// Word motoru (Outlook 2007-2021) uyumu için:
//   • border-radius YOK   • rgba() YOK (hepsi solid hex)   • SVG YOK (PNG ikon)
//   • yerleşim tablo tabanlı, yazı satırları iç tablo ile (Word-safe boşluk)
// Kurumsal tasarımın eski Outlook fallback'i olarak da bu kullanılır.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const genSig = (f, s, office, sigBanner) => {
  const firstName = escapeHtml(titleCase(f.firstName));
  const lastName = f.lastName ? escapeHtml(f.lastName.toLocaleUpperCase('tr-TR')) : '';
  const name = [firstName, lastName].filter(Boolean).join(' ');
  const titleEN = escapeHtml(titleCase(f.titleEN));
  const titleTR = escapeHtml(titleCase(f.titleTR));
  // Resmi ticari ünvan (companyDirectory) varsa onu göster; yoksa kısa şirket adı
  const companyName = escapeHtml(s.companyLegalName || s.companyName || '');

  // ── SÜTUN GENİŞLİKLERİ SABİT ──
  // Eskiden tablo `table-layout:fixed` DEĞİLDİ: sütunları içerik belirliyordu, yani
  // adres uzadıkça lacivert bant büyüyüp beyaz logo paneli eziyordu (ist-merkez'de
  // 180+420, kısa adreste 238+362 → aynı imza ofise göre farklı oranda görünüyordu).
  // Artık sütunlar sabit; bant 350px'e kilitli → uzun adres kendiliğinden iki satıra
  // iner. 350-48 padding = 302px iç genişlik, nowrap telefon satırının ihtiyacı 233px.
  const LOGO_COL = 250, BAND_COL = 350;   // 600 = 250 + 350
  const LOGO_PADL = 4, LOGO_GUTTER = 36;  // hücre padding'i (sol/sağ)
  // ── LOGO ÖLÇÜSÜ: Klasik (V4) ile aynı oran-duyarlı sınırlar ──
  // Eskiden logo `s.logoW x s.logoH` (140x61) ham basılıyordu → tyro logosu bu
  // tasarımda tüm tasarımların en küçüğüydü (kullanıcı geri bildirimi). Panel artık
  // sabit 250px olduğu için ölçek güvenle hesaplanabiliyor.
  const natW = s.logoW || 140, natH = s.logoH || 45;
  const maxLW = LOGO_COL - LOGO_PADL - LOGO_GUTTER;   // 210
  const maxLH = (natW / natH) < 2.5 ? 92 : 64;        // kare/kompakt logolara 92px izni
  let lsc = maxLW / natW;
  if (natH * lsc > maxLH) lsc = maxLH / natH;
  const lw = Math.max(1, Math.round(natW * lsc));
  const lh = Math.max(1, Math.round(natH * lsc));

  const logo = s.logoBase64
    ? `<img src="${s.logoBase64}" width="${lw}" height="${lh}" alt="Logo" style="display:block;border:0;width:${lw}px;height:${lh}px;" />`
    : `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:middle;padding-right:6px;"><div style="width:40px;height:40px;background:${s.logoColor};border-radius:8px;text-align:center;line-height:40px;"><span style="font-family:Georgia,serif;font-size:26px;font-weight:bold;color:#c8922a;">T</span></div></td><td style="vertical-align:middle;"><span style="font-family:Georgia,serif;font-size:20px;font-weight:bold;color:${s.logoColor};letter-spacing:1.5px;">tyro</span><br/><span style="font-size:7px;color:#999;">${escapeHtml(s.slogan)}</span></td></tr></table>`;

  const rbBg = s.rightBlockBg || s.logoColor;
  const linkedinUrl = sanitizeUrl((f.linkedinPersonal && f.linkedinPersonal.trim()) || s.social.linkedin);
  const derivedLiHandle = linkedinUrl ? linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/(company\/|in\/)?/i, '').replace(/\/$/, '').replace(/-/g, '') : '';
  // Şirket LinkedIn'inde directory kısa etiketi (ör. 'tyroventures') tercih edilir; kişisel girildiyse türetilen kalır
  const linkedinHandle = (f.linkedinPersonal && f.linkedinPersonal.trim()) ? derivedLiHandle : (s.linkedinLabel || derivedLiHandle);

  // Solid renkler (Outlook-safe — rgba yerine düz hex)
  const cName = '#ffffff';   // isim
  const cSub = '#c9d3df';    // ünvanlar
  const cText = '#e6ebf1';   // adres / telefon / mail

  // ── Bant içi metin satırları (iç tablo → Word'de güvenilir satır boşluğu) ──
  // NOT: Eski Outlook (Word motoru) img margin'ini yok sayar → ikon-yazı boşluğu
  // için margin YERİNE &nbsp; kullanılır. Satır boşlukları td padding'inde (Word-safe).
  // KRİTİK: her metin hücresine lacivert arka plan (background-color:${rbBg}) da verilir.
  // Yazı rengi + arka plan AYNI hücrede olunca:
  //  • Outlook "sağ tık → Yapıştır" (Merge Formatting) yazı rengini "Otomatik"e sıfırlasa
  //    bile, Word koyu zeminli hücrede "Otomatik" rengi BEYAZ basar → yazı beyaz kalır.
  //  • Dark mode beyaz yazıyı siyaha çevirmez (koyu blok olarak tanır).
  // Dış banttaki bgcolor tek başına yetmiyordu çünkü iç hücrelerin kendi zemini yoktu.
  const bandLines = [];
  // Üst boşluk — spacer satırı (Word'de td padding-bottom rowspan'de sıkışabildiği için
  // dikey boşlukları spacer satırlarıyla veriyoruz; her istemcide simetrik durur).
  bandLines.push(`<tr><td height="15" bgcolor="${rbBg}" style="font-size:0;line-height:15px;height:15px;background-color:${rbBg};">&nbsp;</td></tr>`);
  bandLines.push(`<tr><td bgcolor="${rbBg}" style="padding:0 0 2px;font-size:15px;font-weight:bold;color:${cName};background-color:${rbBg};font-family:Arial,sans-serif;line-height:1.3;">${name || 'Ad SOYAD'}</td></tr>`);
  if (titleEN) bandLines.push(`<tr><td bgcolor="${rbBg}" style="padding:0 0 1px;font-size:11px;color:${cSub};background-color:${rbBg};font-style:italic;font-family:Arial,sans-serif;line-height:1.45;">${titleEN}</td></tr>`);
  if (titleTR) bandLines.push(`<tr><td bgcolor="${rbBg}" style="padding:0 0 1px;font-size:11px;color:${cSub};background-color:${rbBg};font-style:italic;font-family:Arial,sans-serif;line-height:1.45;">${titleTR}</td></tr>`);
  bandLines.push(`<tr><td height="10" bgcolor="${rbBg}" style="font-size:0;line-height:10px;height:10px;background-color:${rbBg};">&nbsp;</td></tr>`);
  // Şirket resmi adı (adresin üzerinde) — V2 gibi bold beyaz
  if (companyName) {
    bandLines.push(`<tr><td bgcolor="${rbBg}" style="padding:0 0 4px;font-size:12px;font-weight:bold;color:${cName};background-color:${rbBg};font-family:Arial,sans-serif;line-height:1.35;">${companyName}</td></tr>`);
  }
  if (s.showAddress !== false && office) {
    // İKİ SATIR: adres / şehir. Tek satırda 371px'e kadar çıkıyor ve bandı zorluyordu.
    // Tarayıcı sarmasına bırakmıyoruz — Word'ün satır kırması farklı, bu yüzden
    // kırılma noktası açıkça <br/> ile veriliyor (iki motorda aynı sonuç).
    const addrLine1 = escapeHtml(office.address);
    const addrLine2 = escapeHtml(office.city || '');
    const addrHtml = addrLine2 ? `${addrLine1}<br/>${addrLine2}` : addrLine1;
    bandLines.push(`<tr><td bgcolor="${rbBg}" style="padding:0 0 6px;font-size:11px;color:${cText};background-color:${rbBg};font-family:Arial,sans-serif;line-height:1.5;">${addrHtml}</td></tr>`);
  }
  const phones = [];
  // showGsm false ise GSM satırı ÇIKMAZ — yalnız sabit hat kalır (kullanıcı isteği,
  // GSM alanındaki 'Gizle' anahtarı). showSDN/showFax ile aynı desen.
  if (s.showGsm !== false && f.gsm) phones.push(`<img src="${mobileIconSvg}" width="12" height="12" alt="" style="vertical-align:middle;border:0;" />&nbsp;<span style="vertical-align:middle;">${escapeHtml(formatGSM(f.gsm))}</span>`);
  if (s.showSDN !== false && office?.sdn) phones.push(`<img src="${phoneIconSvg}" width="12" height="12" alt="" style="vertical-align:middle;border:0;" />&nbsp;<span style="vertical-align:middle;">${escapeHtml(office.sdn)}</span>`);
  if (phones.length > 0) {
    bandLines.push(`<tr><td bgcolor="${rbBg}" style="padding:0 0 5px;font-size:11px;color:${cText};background-color:${rbBg};font-family:Arial,sans-serif;line-height:1.4;white-space:nowrap;">${phones.join('&nbsp;&nbsp;&nbsp;&nbsp;')}</td></tr>`);
  }
  // showEmail false ise e-posta satırı ÇIKMAZ (GSM'deki 'Gizle' anahtarıyla aynı desen).
  if (s.showEmail !== false && f.email) {
    bandLines.push(`<tr><td bgcolor="${rbBg}" style="padding:0;font-size:11px;background-color:${rbBg};font-family:Arial,sans-serif;line-height:1.4;"><a href="mailto:${escapeHtml(f.email)}" style="color:${cName};text-decoration:none;">@&nbsp;${escapeHtml(f.email)}</a></td></tr>`);
  }
  // Alt boşluk — spacer satırı (mavi bandın alt kenarı yazıya bitişik kalmasın)
  bandLines.push(`<tr><td height="15" bgcolor="${rbBg}" style="font-size:0;line-height:15px;height:15px;background-color:${rbBg};">&nbsp;</td></tr>`);

  // ── Footer (logonun altı, tam genişlik satırı): web sitesi + LinkedIn ──
  const footerC = s.contactLabelColor || '#808285';
  const websiteDisplay = s.website ? s.website.replace(/^www\./i, '') : '';
  const footerItems = [];
  if (s.showWebsite !== false && websiteDisplay) footerItems.push(`<a href="${sanitizeUrl(s.website)}" style="color:${footerC};font-size:11px;text-decoration:none;font-style:italic;font-weight:bold;">${escapeHtml(websiteDisplay)}</a>`);
  if (s.showLinkedin !== false && linkedinUrl) footerItems.push(`<a href="${linkedinUrl}" target="_blank" style="text-decoration:none;"><img src="${linkedinBlueSvg}" width="13" height="13" alt="in" style="vertical-align:-2px;border:0;" />&nbsp;<span style="color:${footerC};font-size:11px;font-style:italic;font-weight:bold;">${linkedinHandle || 'LinkedIn'}</span></a>`);
  // Footer içeriği (web + LinkedIn). Corporate gibi banda rowspan ile yaslanıp
  // bandın ALT hizasına oturur (aşağı sarkmaz).
  const hasFooter = footerItems.length > 0;
  // Footer sol boşluğu: logonun görünür sol kenarıyla hizalı olsun (logo hücresi sol
  // padding'i 4px + logonun içindeki şeffaf sol boşluk logoLeftOffset).
  // Logo ölçeklendiği için içindeki şeffaf sol boşluk da ölçeklenir → alt satır
  // logonun GÖRÜNEN sol kenarına hizalanır (ölçekle çarpmazsak sola kayardı).
  const footerPadLeft = Math.round((s.logoLeftOffset || 0) * lsc) + LOGO_PADL;
  const footer = hasFooter
    ? `<tr><td class="sigc-foot" bgcolor="#ffffff" style="vertical-align:bottom;background-color:#ffffff;padding:10px 0 2px ${footerPadLeft}px;line-height:16px;white-space:nowrap;">${footerItems.join('&nbsp;&nbsp;&nbsp;')}</td></tr>`
    : '';


  // Responsive: dar ekranda logo üste, bant tam genişliğe geçer
  const sigCSS = `<style>@media screen and (max-width:480px){.sigc-table{width:100%!important}.sigc-logo,.sigc-band,.sigc-foot{display:block!important;width:100%!important;box-sizing:border-box!important}.sigc-logo{text-align:center!important;padding:0 0 10px 0!important}.sigc-foot{text-align:center!important;padding:10px 0 0 0!important}}</style>`;

  return sigCSS +
    `<table class="sigc-table" bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px; max-width:600px; table-layout:fixed; background-color:#ffffff; font-family:Arial,sans-serif; border-collapse:collapse;">` +
    `<tr>` +
    `<td class="sigc-logo" bgcolor="#ffffff" width="${LOGO_COL}" style="width:${LOGO_COL}px;box-sizing:border-box;vertical-align:top;background-color:#ffffff;padding:6px ${LOGO_GUTTER}px 0 ${LOGO_PADL}px;">${logo}</td>` +
    `<td class="sigc-band" bgcolor="${rbBg}" width="${BAND_COL}" rowspan="${hasFooter ? '2' : '1'}" style="width:${BAND_COL}px;box-sizing:border-box;vertical-align:top;background-color:${rbBg};padding:0 24px;">` +
      `<table cellpadding="0" cellspacing="0" border="0">${bandLines.join('')}</table>` +
    `</td>` +
    `</tr>` +
    footer +
    sigBannerRows(sigBanner, 2) +
    `</table>`;
};
