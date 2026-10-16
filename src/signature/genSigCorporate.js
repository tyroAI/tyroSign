import { escapeHtml, sanitizeUrl, titleCase, formatGSM } from '../utils/formatting';
import { sigBannerRows } from './sigBannerRows';
import { phoneIconSvg, mobileIconSvg, linkedinBlueSvg } from '../icons/svgDataUris';
import { genSig } from './genSig';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORPORATE SIGNATURE GENERATOR (PDF design - wave band)
// opts.withFallback=true → eski Outlook (Word motoru) için [if mso] ile
//   dikdörtgen/klasik sürüme otomatik düşer; kavis bozulması yaşanmaz.
//   Modern istemciler (Gmail, Apple Mail, telefon, yeni Outlook) kavisli sürümü görür.
// opts.withFallback=false → sadece kavisli sürüm (ör. PNG'ye render için).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const genSigCorporate = (f, s, office, sigBanner, opts = {}) => {
  const firstName = escapeHtml(titleCase(f.firstName));
  const lastName = f.lastName ? escapeHtml(f.lastName.toLocaleUpperCase('tr-TR')) : '';
  const name = [firstName, lastName].filter(Boolean).join(' ');
  const titleEN = escapeHtml(titleCase(f.titleEN));
  const titleTR = escapeHtml(titleCase(f.titleTR));

  const logo = s.logoBase64
    ? `<img src="${s.logoBase64}" width="${s.logoW}" height="${s.logoH}" alt="Logo" style="display:block;border:0;" />`
    : `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:middle;padding-right:6px;"><div style="width:40px;height:40px;background:${s.logoColor};border-radius:8px;text-align:center;line-height:40px;"><span style="font-family:Georgia,serif;font-size:26px;font-weight:bold;color:#c8922a;">T</span></div></td><td style="vertical-align:middle;"><span style="font-family:Georgia,serif;font-size:20px;font-weight:bold;color:${s.logoColor};letter-spacing:1.5px;">tyro</span><br/><span style="font-size:7px;color:#999;">${escapeHtml(s.slogan)}</span></td></tr></table>`;

  const rbBg = s.rightBlockBg || s.logoColor;
  const linkedinUrl = sanitizeUrl((f.linkedinPersonal && f.linkedinPersonal.trim()) || s.social.linkedin);
  const derivedLiHandle = linkedinUrl ? linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/(company\/|in\/)?/i, '').replace(/\/$/, '').replace(/-/g, '') : '';
  // Şirket LinkedIn'inde directory kısa etiketi (ör. 'nexa') tercih edilir; kişisel girildiyse türetilen kalır
  const linkedinHandle = (f.linkedinPersonal && f.linkedinPersonal.trim()) ? derivedLiHandle : (s.linkedinLabel || derivedLiHandle);

  // Build contact rows inside the band
  let bandRows = '';
  if (s.showAddress !== false && office) {
    bandRows += `<div style="font-size:11px;line-height:1.6;margin-bottom:8px;color:rgba(255,255,255,0.92);"><span style="white-space:nowrap">${escapeHtml(office.address)}</span><br/>${escapeHtml(office.city)}</div>`;
  }
  const phones = [];
  // showGsm false ise GSM satırı ÇIKMAZ — yalnız sabit hat kalır (kullanıcı isteği,
  // GSM alanındaki 'Gizle' anahtarı). showSDN/showFax ile aynı desen.
  if (s.showGsm !== false && f.gsm) phones.push(`<img src="${mobileIconSvg}" width="13" height="13" alt="" style="vertical-align:middle;border:0;margin-right:3px;" /><span style="vertical-align:middle;">${escapeHtml(formatGSM(f.gsm))}</span>`);
  if (s.showSDN !== false && office?.sdn) phones.push(`<img src="${phoneIconSvg}" width="13" height="13" alt="" style="vertical-align:middle;border:0;margin-right:3px;" /><span style="vertical-align:middle;">${escapeHtml(office.sdn)}</span>`);
  if (phones.length > 0) {
    bandRows += `<div style="font-size:11px;margin-bottom:4px;color:rgba(255,255,255,0.92);white-space:nowrap;">${phones.join('&nbsp;&nbsp;&nbsp;')}</div>`;
  }
  // showEmail false ise e-posta satırı ÇIKMAZ (GSM'deki 'Gizle' anahtarıyla aynı desen).
  if (s.showEmail !== false && f.email) {
    bandRows += `<div style="font-size:11px;color:rgba(255,255,255,0.92);"><a href="mailto:${escapeHtml(f.email)}" style="color:#fff;text-decoration:none;">@ ${escapeHtml(f.email)}</a></div>`;
  }

  // Footer: website + LinkedIn
  const footerC = s.contactLabelColor || '#808285';
  const websiteDisplay = s.website ? s.website.replace(/^www\./i, '') : '';
  let footerItems = [];
  if (s.showWebsite !== false && websiteDisplay) footerItems.push(`<a href="${sanitizeUrl(s.website)}" style="color:${footerC};font-size:11px;text-decoration:none;font-style:italic;font-weight:bold;vertical-align:baseline;">${escapeHtml(websiteDisplay)}</a>`);
  if (s.showLinkedin !== false && linkedinUrl) footerItems.push(`<a href="${linkedinUrl}" target="_blank" style="text-decoration:none;vertical-align:baseline;"><img src="${linkedinBlueSvg}" width="14" height="14" alt="in" style="vertical-align:-2px;border:0;margin-right:4px;" /><span style="color:${footerC};font-size:11px;font-style:italic;font-weight:bold;vertical-align:baseline;">${linkedinHandle || 'LinkedIn'}</span></a>`);
  const footer = footerItems.length > 0 ? `<div style="line-height:16px;white-space:nowrap;">${footerItems.join('&nbsp;&nbsp;&nbsp;')}</div>` : '';

  const corp = `<table class="sig-corp-table" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px; max-width:600px; font-family:Arial,sans-serif; border-collapse:collapse;">` +
    `<tr>` +
    `<td class="sig-corp-logo" style="vertical-align:top;padding:34px 50px 0 0;">` +
      logo +
    `</td>` +
    `<td class="sig-corp-band" rowspan="${footer ? '2' : '1'}" style="vertical-align:top;background-color:${rbBg};padding:0;border-top-left-radius:130px;">` +
      `<div style="padding:22px 24px 18px 105px;color:#fff;">` +
        `<div style="font-size:16px;font-weight:bold;margin-bottom:1px;color:#fff;">${name || 'Ad SOYAD'}</div>` +
        (titleEN ? `<div style="font-size:12px;margin-bottom:0;color:rgba(255,255,255,0.85);font-style:italic;">${titleEN}</div>` : '') +
        (titleTR ? `<div style="font-size:12px;margin-bottom:10px;color:rgba(255,255,255,0.85);font-style:italic;">${titleTR}</div>` : '<div style="margin-bottom:10px;"></div>') +
        bandRows +
      `</div>` +
    `</td>` +
    `</tr>` +
    (footer ? `<tr><td style="vertical-align:bottom;padding:0 0 18px 0;"><div style="text-align:left;line-height:16px;white-space:nowrap;${(s.logoLeftOffset || 0) + 6 > 0 ? `padding-left:${(s.logoLeftOffset || 0) + 6}px;` : ''}">${footerItems.join('&nbsp;&nbsp;&nbsp;')}</div></td></tr>` : '') +
    sigBannerRows(sigBanner, 2) +
    `</table>`;

  if (!opts.withFallback) return corp;

  // Eski Outlook (Word motoru) kavis/rgba/hizalamayı bozar → onlara dikdörtgen klasik sürüm.
  // Diğer tüm istemciler (yeni Outlook dahil) kavisli corporate'i görür.
  const fallback = genSig(f, s, office, sigBanner);
  return `<!--[if !mso]><!-->${corp}<!--<![endif]-->` +
    `<!--[if mso]>${fallback}<![endif]-->`;
};
