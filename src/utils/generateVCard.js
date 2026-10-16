/**
 * vCard 3.0 Generator
 * Form + office + company verilerinden vCard string üretir.
 * QR okutulduğunda telefon rehberine kişi ekleme ekranı açılır.
 */
import { formatGSM } from './formatting';

export function generateVCard(form, office, stg, company, lang) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];

  // Full Name
  const fn = [form.firstName, form.lastName].filter(Boolean).join(' ');
  if (fn) {
    lines.push('FN:' + fn);
    lines.push('N:' + (form.lastName || '') + ';' + (form.firstName || '') + ';;;');
  }

  // Organization — şirket seçiminden gelir, yoksa ayarlardaki şirket adı
  const orgName = (lang !== 'tr' && company && company.nameEN) ? company.nameEN : ((company && company.name) || stg.companyName || 'tyroTech');
  lines.push('ORG:' + orgName);

  // Title (TR + EN)
  const title = [form.titleTR, form.titleEN].filter(Boolean).join(' / ');
  if (title) {
    lines.push('TITLE:' + title);
  }

  // Telefon — rehbere İKİSİ de yazılır (kullanıcı isteği 2026-09-21):
  //   GSM açık  → TYPE=CELL (cep) + ofisin santrali varsa TYPE=WORK (sabit hat)
  //   GSM gizli → yalnız TYPE=WORK; sabit hat da yoksa QR'a HİÇ telefon girmez.
  // Bedeli ölçüldü (errorCorrectionLevel 'M', 150px QR): sabit hat satırı 29 bayt
  // ekliyor ve kodu TEK sürüm büyütüyor — tipik kişide 73x73 → 77x77 (modül
  // 1.85px → 1.76px), en uzun ad/ünvan/adres birleşiminde 89x89 → 93x93
  // (1.55px → 1.49px). ~%5 küçülme; web adresi hâlâ KASITEN dışarıda (aşağıya bak).
  const showGsm = !(stg && stg.showGsm === false);
  if (showGsm && form.gsm) {
    lines.push('TEL;TYPE=CELL:' + formatGSM(form.gsm).replace(/\s/g, ''));
  }
  if (office && office.sdn) {
    lines.push('TEL;TYPE=WORK:' + office.sdn.replace(/\s/g, ''));
  }

  // WEB SİTESİ hâlâ KASITEN eklenmiyor (santral artık ekleniyor, yukarı bak).
  // Sebep: QR'ın okunabilirliği veri miktarına bağlı. Modül (küçük kare) sayısı veriyle
  // büyür, kart üzerindeki fiziksel boyut sabit olduğu için her modül KÜÇÜLÜR; kamera
  // modülü çözemeyince okuma başarısız olur. Ölçüm (aynı kişi, aynı 152px QR):
  //   iki telefon + web ile : 435 bayt → sürüm 16 → 81x81 modül → modül 1.88px
  //   sadece cep, web yok   : aşağıdaki commit mesajındaki ölçüme bakın
  // (Kıyas: restoran menüsü QR'ı ~28 karakterlik link → 29x29 modül → modül 5.24px.
  //  Menü QR'ı fiziksel olarak küçük olsa bile kareleri çok daha büyük, bu yüzden
  //  rahat okunuyor.) Santral ve web adresi imzada ve kartvizitin üzerinde zaten var.

  // Email
  if (form.email && !(stg && stg.showEmail === false)) {
    lines.push('EMAIL;TYPE=INTERNET:' + form.email);
  }

  // Address
  if (office) {
    const addr = [office.address, office.city].filter(Boolean).join(', ');
    if (addr) {
      // ADR: PO Box;Extended;Street;City;Region;Postal;Country
      // office.address BOŞ olabilir (yalnız city dolu) → ham yazılınca QR'a
      // 'undefined' giriyordu; addr kontrolü yalnız ikisinin BİRLEŞİMİNE bakıyor.
      lines.push('ADR;TYPE=WORK:;;' + (office.address || '') + ';' + (office.city || '') + ';;;');
    }
  }

  // LinkedIn (personal or company)
  // showLinkedin false ise (alan üstündeki 'Gizle' ya da Ayarlar'daki anahtar)
  // QR'a LinkedIn de girmez.
  const linkedin = (stg && stg.showLinkedin === false) ? ''
    : (form.linkedinPersonal || (stg.social && stg.social.linkedin) || '');
  if (linkedin) {
    lines.push('X-SOCIALPROFILE;TYPE=linkedin:' + linkedin);
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}
