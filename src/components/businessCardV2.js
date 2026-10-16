// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KARTVİZİT V2 — müşteri tasarımı (T-dijital kartvizit PDF'i)
//
// Düzen (yukarıdan aşağıya):
//   beyaz alan → şirket logosu
//   profil dairesi (merkezi RENK BANDININ ÜST KENARINDA — yarısı beyazda, yarısı bantta)
//   renk bandı → ad + LinkedIn ikonu / ünvanlar / şirket adı
//                telefon ikonu (yalnız ikon, numara YAZILMAZ — dokununca tel: açar)
//                "Navigate to my Office" (haritada adres)  "Book An Appointment" (mailto)
//   beyaz alan → QR
//
// Bant rengi ŞİRKET HİYERARŞİSİNE göre (imza tasarımlarındaki kuralın aynısı):
//   1 ana şirket → tyro mavisi   2 grup şirketi → tyro altını   3 iştirak → turkuaz
//
// ÖLÇÜLER PDF'TEN PİKSEL ÖLÇÜMÜYLE ÇIKARILDI (tahmin değil). Tasarımdaki telefon
// ekranı 437x915px; oranlar korunarak 420px genişliğe indirildi:
//   bant üstü %23.0 → %22.9 · bant %51.0 → %50.6 · bant altı %26.0 → %26.5
//   profil dairesi ekran genişliğinin %38'i, merkezi bant üstünden 6px aşağıda
//   butonlar %68 genişlik, 52px yükseklik, 10px köşe, aralarında 12px
//
// TEK KAYNAK İLKESİ: düzen v2Layout() içinde bir kez hesaplanır; tuval çizimi,
// HTML dışa aktarımı ve önizlemedeki tıklama alanları AYNI sayıları kullanır.
// (Daha önce önizleme ile indirilen dosyanın ayrışması sorun olmuştu.)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { escapeHtml, sanitizeUrl } from '../utils/formatting';

// ─── Hiyerarşi renkleri ───────────────────────────────────────────────────
// Uygulamanın MARKA değerleri (imza üreticileriyle birebir aynı) kullanılıyor;
// PDF'ten ölçülen renkler (#1D4475 / #BFCE53 / #51B1C8) bunların CMYK→sRGB
// dönüşümünde solmuş hâli. Marka değerlerini kullanmak kartı imzayla tutarlı tutar.
export const V2_BAND = { 1: '#232c5e', 2: '#c8922a', 3: '#3cbfbf' };

/** Bandı koyulaştırıp buton rengini üretir. PDF'te buton/bant ilişkisi ~0.70 çarpan. */
export function darkenHex(hex, f = 0.70) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

export function v2Colors(navyLevel) {
  // ── KARTVİZİTTE BANT HER ZAMAN LACİVERT ──
  // Kullanıcı isteği: "kartvizitte ilk üç versiyon yeşil ya da turkuaz olmasın,
  // hepsinde lacivert olsun, tyro seçmişiz gibi". Yani kart artık şirket
  // HİYERARŞİSİNE göre renk DEĞİŞTİRMİYOR; navyLevel yok sayılır.
  //
  // Bunun bir yan faydası da var: açık bantlarda beyaz metin okunmuyordu.
  // Ölçülen WCAG kontrastı (beyaz metin):
  //   lacivert #232c5e  9.54:1  ✓        yeşil #c8922a  1.63:1  ✗
  //                                       turkuaz #3cbfbf  2.41:1  ✗
  // Lacivert seçimi bu sorunu kökten kapatıyor.
  //
  // İMZA TASARIMLARI ETKİLENMEZ: onlar hiyerarşi rengini kendi içlerinde
  // hesaplıyor (genSigNavyV4.js: barColor = {1:BLUE,2:GREEN,3:TURQ}[s.navyLevel]).
  // Hiyerarşi rengini KARTA geri getirmek istenirse tek satır:
  //   const band = V2_BAND[navyLevel] || V2_BAND[1];
  const band = V2_BAND[1];
  return { band, btn: darkenHex(band) };
}

// ─── Düzen sabitleri (420px genişlik) ─────────────────────────────────────
export const V2 = {
  W: 420,
  RADIUS: 18,
  // Logo kutusu PDF ölçüsünde: tasarımdaki logo ALT YAZILI ("Smart tech. Strong future.")
  // ve 224x82px yer kaplıyordu (437px ekranda) → 420px karta ölçekli hâli 215x79.
  // Uygulamanın TYRO logosu da artık alt yazılı olduğu için kutu buna göre.
  // Geniş wordmark'lar (oran 3.9) bu kutuda GENİŞLİKTEN sınırlanır (215x55) ve
  // dikeyde ortalanır — onların görünümü değişmez.
  LOGO_TOP: 38,
  LOGO_BOX_W: 215,
  LOGO_BOX_H: 79,      // SABİT: şirket değişince bant yeri/kart boyu zıplamasın
  GAP_LOGO_AV: 11,     // PDF'te alt yazı, profil dairesine yakın duruyor
  AV_D: 160,           // profil dairesi çapı (ekran genişliğinin %38'i)
  AV_RING: 5,
  BAND_OVERLAP: 6,     // dairenin merkezi bant üstünden bu kadar AŞAĞIDA
  GAP_AV_NAME: 26,
  NAME_FS: 20, NAME_LH: 26,
  LI_SIZE: 17, LI_GAP: 6,
  GAP_NAME_TITLE: 6,
  TITLE_FS: 14, TITLE_LH: 19,
  GAP_TITLE_COMPANY: 6,
  COMPANY_FS: 12.5, COMPANY_LH: 17,
  GAP_COMPANY_PHONE: 18,
  PHONE_D: 48, PHONE_STROKE: 2,
  GAP_PHONE_BTN: 28,
  BTN_W: 286, BTN_H: 52, BTN_R: 10, BTN_GAP: 12, BTN_FS: 13.5,
  BTN_ICON: 17, BTN_ICON_GAP: 8,   // buton içi ikon + metin arası
  BAND_PAD_BOTTOM: 32,
  // QR OLABİLDİĞİNCE BÜYÜK: boşluklardan 14px kısılıp QR'a verildi (152 → 166).
  // Kartın TOPLAM yüksekliği DEĞİŞMEDİ (20+166+12+16+18 = 26+152+14+16+24 = 232),
  // yani tasarımın dış oranları korunuyor ama modüller büyüyor. Okunabilirlik
  // modül boyutuna bağlı olduğu için bu doğrudan kazanç.
  QR_GAP: 20, QR_SIZE: 166,
  // QR altındaki "Taratarak rehbere ekleyin" satırı (V1'de vardı, V2'de eksikti)
  SCAN_GAP: 12, SCAN_FS: 11.5, SCAN_ICON: 13, SCAN_LH: 16,
  BOTTOM_PAD: 18,
  PAD_X: 26,
};

// ─── V3 SÜRÜMÜ (V2'nin varyantı, kullanıcı isteği) ──────────────────────────
// Farklar (yalnız YERLEŞİM; tipografi, renkler, ikonlar V2 ile aynı):
//   • QR artık bant ALTINDA değil, TELEFON İKONU İLE BUTONLAR ARASINDA, bandın İÇİNDE
//   • QR, V1'deki gibi buzlu cam ÇERÇEVE içinde sunulur (bant rengi üzerinde)
//   • ŞİRKET LOGOSU, QR'ın eski yerine — en alttaki beyaz alana taşındı
//   • Logo yukarıdan kalktığı için PROFİL FOTOSU YUKARI kaydı (kart üstünde 30px)
// QR'ın kendi beyaz zemini + 4 modüllük sessiz bölgesi var (drawRoundedQr'a
// lightColor='#ffffff', margin=4 veriliyor), bu yüzden yarı saydam çerçeve
// okunabilirliği BOZMAZ — çerçeve tamamen dekoratif.
export const V3 = {
  TOP_PAD: 30,          // kart üstünden profil dairesine
  GAP_PHONE_QR: 20,     // telefon ikonu ile QR çerçevesi arası
  QR_FRAME_PAD: 8,      // çerçevenin QR'ı saran iç boşluğu
  QR_FRAME_R: 16,       // çerçeve köşe yarıçapı
  GAP_QR_SCAN: 10,      // QR çerçevesi ile "taratarak ekleyin" satırı arası
  GAP_SCAN_BTN: 18,     // o satır ile ilk buton arası
  GAP_BAND_LOGO: 22,    // bant altı ile logo arası
  BOTTOM_PAD: 26,       // logo altındaki boşluk
};

// Material Symbols "phone_in_talk" (24x24) — ahize + iki ses yayı; PDF'teki ikonun aynısı
const PHONE_PATH = 'M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z';
// Buton ikonları (Material Symbols, 24x24) — kullanıcı isteği: iki butona uygun ikon
const NAV_PATH = 'M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z';                    // near_me (yön oku)
const CAL_PATH = 'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z';  // event (takvim)
// ─── V4 İKON SATIRI: İÇİ BOŞ (ÇİZGİ) İKONLAR ───────────────────────────────
// Kullanıcı: "içi dolu ikon istemiyorum kötü gözüküyor ... qr altındaki butonlar
// V4'teki (ilk cam tasarım) ikonlar gibi olsun". Oradaki iletişim satırı ikonları
// da çizgi stilinde (strokeStyle + lineWidth), dolu değil. Bu yüzden bu satırdaki
// ikonlar Feather/Lucide tarzı ÇİZGİ yollarıyla çizilir: fill YOK, stroke VAR.
// Her ikon birden çok alt yoldan oluşabilir (ör. harita pini = damla + daire).
// 24x24 birim uzayda tanımlı; çizim ölçeklenirken çizgi kalınlığı da ölçeklenir.
const OUTLINE_ICONS = {
  tel: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'],
  map: ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
        'M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'],
  mail: ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
         'M22 6 12 13 2 6'],
  li: ['M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z',
       'M2 9h4v12H2z',
       'M6 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z'],
};

// NOT: ikon satırı DOLU Material glifleriyle başlamıştı; kullanıcı "içi dolu ikon
// istemiyorum" deyince ÇİZGİ yollarına (OUTLINE_ICONS) geçildi. Kullanılmayan dolu
// PLACE/MAIL sabitleri buradan kaldırıldı. LinkedIn ise MARKA işareti olduğu için
// dolu kaldı (LI_PATH) — o bilinçli.
const LI_PATH = 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';

/** İki aksiyon butonunun etiketleri — tuval, HTML ve düzen AYNI kaynaktan alır. */
export function v2BtnLabels(L) {
  return [
    (L && L.bcV2Navigate) || 'Navigate to my Office',
    (L && L.bcV2Appointment) || 'Book An Appointment',
  ];
}

// ─── V4 SÜRÜMÜ (V3 tabanlı, kullanıcı isteği) ───────────────────────────────
// V3'ten farkları: QR ALTINDAKİ UYARI YOK, QR ÜSTÜNDEKİ TELEFON İKONU YOK,
// İKİ AKSİYON BUTONU YOK. Onların yerine QR'ın ALTINDA tek satır 4 İKON:
//   telefon (tel:) · konum (haritada adres) · mail (mailto → Outlook) · LinkedIn
//   (kişisel tanımlıysa o, değilse şirketin — imza üreticilerindeki kuralın aynısı)
// Altta yine beyaz alanda ŞİRKET LOGOSU.
//
// İkon satırının ölçüleri müşteri PDF'indeki sosyal medya satırından ÖLÇÜLDÜ
// (437px ekran): satır y 898→938 (41px), genişlik 193px (%44.2), 4 ikon,
// merkez aralığı 52.3px, butonların altından 14px boşluk, bant sonuna 22px.
// 420px karta ölçekli hâli: ikon ~30px, merkez aralığı 50px.
export const V4 = {
  GAP_COMPANY_QR: 24,   // şirket adı ile QR çerçevesi arası (telefon ikonu kalktı)
  GAP_QR_ICONS: 18,     // QR çerçevesi ile ikon satırı arası
  // ÇERÇEVE KALDIRILDI ve glif KÜÇÜLTÜLDÜ (kullanıcı: "ikonlar çok büyük olmuş
  // küçült, ayrıca çerçeve olmasın"). Glif 22px ama DOKUNMA ALANI 40px: çerçeve
  // görünmüyor, yine de telefonda parmakla basmak kolay (44px'lik hedef önerisine
  // yakın). Hit alanı görünmez, yalnız tıklama için.
  ICON_SIZE: 22,        // görünen glif
  ICON_HIT: 40,         // görünmez dokunma alanı (glif ortalı)
  ICON_STROKE: 2,       // 24 birimlik glif uzayında çizgi kalınlığı
  ICON_SPACING: 44,     // glif MERKEZLERİ arası
  ICON_ROW_H: 40,
  BAND_PAD_BOTTOM: 26,
};

// ─── Metin sarma (ölçüm için bir 2D bağlam gerekir) ───────────────────────
function wrap(ctx, text, maxW) {
  if (!text) return [];
  const words = String(text).split(/\s+/).filter(Boolean);
  const out = []; let line = '';
  words.forEach(w => {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width <= maxW || !line) line = t;
    else { out.push(line); line = w; }
  });
  if (line) out.push(line);
  return out;
}

/**
 * v2Layout GİRDİSİNİ tek yerden üretir.
 *
 * NEDEN VAR: düzen iki yerden çağrılıyor (tuval çizimi ve HTML dışa aktarımı) ve
 * bayraklardan biri birinde geçilip diğerinde geçilmezse SESSİZ SAPMA oluyor.
 * Gerçekleşen hata: HTML yolunda hasLinkedinUrl geçilmemişti → dijital kartta
 * LinkedIn ikonu HİÇ üretilmiyordu, önizlemede görünüyordu (kullanıcı bildirimi).
 * Aynı sınıfta daha önce hasPhone/hasBtn1/hasBtn2 ve variant da atlanmıştı.
 * Artık iki yol da bu fonksiyonu çağırıyor; sapma yapısal olarak imkânsız.
 */
export function v2LayoutInput({ data, titleLines, companyLines, hasPhoto, hasLinkedin, variant, L, photoCta = false }) {
  return {
    fullName: data.fullName,
    titleLines, companyLines,
    hasPhoto, hasLinkedin, photoCta,
    hasPhone: !!data.gsm,
    hasBtn1: !!data.addressText,
    hasBtn2: !!data.email,
    hasLinkedinUrl: !!data.linkedinUrl,
    variant,
    btnLabels: v2BtnLabels(L),
  };
}

/**
 * V2 düzenini hesaplar. Tuval, HTML ve önizleme tıklama alanları bunu paylaşır.
 * @returns {{H:number, band:{top:number,bottom:number}, ...}}
 */
export function v2Layout(ctx, { fullName, titleLines, companyLines, hasPhoto, hasLinkedin,
  hasPhone = true, hasBtn1 = true, hasBtn2 = true, variant = 'v2', btnLabels = null,
  hasLinkedinUrl = false, photoCta = false }) {
  // photoCta: fotoğraf YOK ama profil dairesinin YERİ AYRILSIN (yalnız ÖNİZLEME için).
  // Gerekçe: foto yokken daire hiç çizilmediği için V1/V3'te bant kartın en üstünden
  // başlıyor ve "Fotoğraf yükle" çağrısına yer kalmıyordu; çağrı ada/logoya biniyordu
  // (kullanıcı bildirdi). Bu bayrakla önizleme, fotoğraflı düzenin AYNISINI kurar ve
  // dairenin yerine beyaz bir yuvarlak konur — tıklanınca yükleme açılır.
  // DIŞA AKTARIM (PNG/Dijital Kart) bu bayrağı ASLA kullanmaz: oradaki kart fotoğrafsız
  // ve derli toplu kalır. Yani önizleme ile çıktı bilinçli olarak farklıdır.
  const reservePhoto = hasPhoto || photoCta;
  const W = V2.W;
  const innerW = W - V2.PAD_X * 2;
  const isV4 = variant === 'v4';
  // V4 de V3'ün üst yerleşimini kullanır (foto yukarıda, logo altta)
  const isV3 = variant === 'v3' || isV4;

  // V4'te LinkedIn ADIN YANINDA DEĞİL, QR altındaki 4. ikon olarak yer alır
  // (kullanıcı isteği: "sağda ismin yanına yazma, orada qr altında dördüncü ikon
  // olsun"). Aynı bağlantıyı iki yerde göstermek de gereksiz tekrar oluyordu.
  const showInlineLi = hasLinkedin && !isV4;
  // Ad + (varsa) LinkedIn ikonu birlikte satıra sığmalı
  const nameAvail = innerW - (showInlineLi ? V2.LI_GAP + V2.LI_SIZE : 0);
  const { nameFS, nameText } = fitName(ctx, fullName || '', nameAvail);

  // ── BANT ÜSTÜ ──
  // V2: logo + (varsa) profil dairesinin üst yarısı
  // V3: logo EN ALTA taşındı → yalnız profil dairesi, ve daha YUKARIDA
  const logoBottom = V2.LOGO_TOP + V2.LOGO_BOX_H;
  let bandTop, avCY = null;
  if (reservePhoto) {
    avCY = isV3 ? (V3.TOP_PAD + V2.AV_D / 2)
                : (logoBottom + V2.GAP_LOGO_AV + V2.AV_D / 2);
    bandTop = avCY - V2.BAND_OVERLAP;
  } else {
    // Fotoğraf yoksa (ve photoCta da kapalıysa, yani DIŞA AKTARIM) daire HİÇ çizilmez.
    // V3/V4'te logo da yukarıda olmadığı için TOP_PAD kadar TAMAMEN BOŞ beyaz şerit
    // kalıyordu (denetimde bulundu) → bant kartın en üstünden başlar, renkli bir
    // başlık gibi görünür (yuvarlak köşeler zaten kırpıyor).
    bandTop = isV3 ? 0 : (logoBottom + V2.GAP_LOGO_AV);
  }

  // Bant içi akış
  let y = reservePhoto ? (avCY + V2.AV_D / 2 + V2.GAP_AV_NAME) : (bandTop + 34);
  const nameY = y;
  y += V2.NAME_LH;

  let titleY = null;
  if (titleLines.length) {
    y += V2.GAP_NAME_TITLE;
    titleY = y;
    y += titleLines.length * V2.TITLE_LH;
  }
  let companyY = null;
  if (companyLines.length) {
    y += V2.GAP_TITLE_COMPANY;
    companyY = y;
    y += companyLines.length * V2.COMPANY_LH;
  }

  // KOŞULLU YER AYIRMA: telefon/adres/e-posta yoksa o öğe ÇİZİLMEZ ve yerini de
  // KAPLAMAZ. Eskiden tuval üçünü koşulsuz çiziyordu, HTML ve tıklama alanları ise
  // koşulluydu → GSM'i olmayan kullanıcıda PNG'de İŞLEVSİZ telefon ikonu, HTML'de
  // aynı yerde boşluk oluşuyordu (tuval/HTML sapması).
  let phoneY = null, btn1Y = null, btn2Y = null;
  // V4'te QR ÜSTÜNDEKİ telefon ikonu YOK (kullanıcı isteği) — telefon, QR altındaki
  // ikon satırında yer alıyor.
  if (hasPhone && !isV4) {
    y += V2.GAP_COMPANY_PHONE;
    phoneY = y;
    y += V2.PHONE_D;
  }

  // ── V3: QR BANDIN İÇİNDE, telefon ikonu ile butonlar ARASINDA, çerçeveli ──
  let qrY, qrFrame = null, scanY, iconRow = null;
  const frameSize = V2.QR_SIZE + V3.QR_FRAME_PAD * 2;
  if (isV4) {
    // V4: şirket adı → QR (çerçeveli) → 4 İKON SATIRI. Uyarı satırı ve butonlar YOK.
    y += V4.GAP_COMPANY_QR;
    qrFrame = { x: (W - frameSize) / 2, y, w: frameSize, h: frameSize, r: V3.QR_FRAME_R, onBand: true };
    qrY = y + V3.QR_FRAME_PAD;
    y += frameSize;
    const ids = [];
    if (hasPhone) ids.push('tel');
    if (hasBtn1) ids.push('map');
    if (hasBtn2) ids.push('mail');
    if (hasLinkedinUrl) ids.push('li');
    if (ids.length) {
      // QR ile ikon satırı arasındaki boşluk YALNIZ satır varsa eklenir. Eskiden
      // koşuldan önce eklendiği için dördü de (gsm/adres/e-posta/LinkedIn) boş olan
      // kullanıcıda QR ile bant dibi arasında 18px ölü boşluk kalıyordu — V3'teki
      // buton guard'ının aynısı.
      y += V4.GAP_QR_ICONS;
      // Satır GÖRÜNEN gliflere göre ortalanır; dokunma alanı glifin çevresine yayılır.
      const rowW = (ids.length - 1) * V4.ICON_SPACING + V4.ICON_SIZE;
      const sx = (W - rowW) / 2;
      const hitOff = (V4.ICON_HIT - V4.ICON_SIZE) / 2;
      const gy = y + (V4.ICON_ROW_H - V4.ICON_SIZE) / 2;
      iconRow = {
        y, h: V4.ICON_ROW_H, size: V4.ICON_SIZE, onBand: true,
        items: ids.map((id, i) => {
          const gx = sx + i * V4.ICON_SPACING;
          return {
            id,
            gx, gy, gw: V4.ICON_SIZE, gh: V4.ICON_SIZE,          // görünen glif
            x: gx - hitOff, y: gy - hitOff,                       // görünmez hit alanı
            w: V4.ICON_HIT, h: V4.ICON_HIT,
          };
        }),
      };
      y += V4.ICON_ROW_H;
    }
    scanY = null;                // V4'te "taratarak ekleyin" satırı YOK
  } else if (isV3) {
    y += V3.GAP_PHONE_QR;
    qrFrame = { x: (W - frameSize) / 2, y, w: frameSize, h: frameSize, r: V3.QR_FRAME_R, onBand: true };
    qrY = y + V3.QR_FRAME_PAD;
    y += frameSize;
    y += V3.GAP_QR_SCAN;
    scanY = y;                 // "taratarak ekleyin" satırı BANDIN İÇİNDE (beyaz metin)
    y += V2.SCAN_LH;
    // Buton yoksa aralarındaki boşluğu da EKLEME (denetimde bulundu: iki buton da
    // yokken bant dibinde 32px yerine 50px ölü boşluk kalıyordu; V2'de guard vardı).
    if (hasBtn1 || hasBtn2) y += V3.GAP_SCAN_BTN;
  } else if (hasBtn1 || hasBtn2) {
    y += V2.GAP_PHONE_BTN;
  }

  // V4'te aksiyon BUTONLARI YOK (kullanıcı isteği) — işlevleri ikon satırında
  if (!isV4) {
    if (hasBtn1) { btn1Y = y; y += V2.BTN_H; }
    if (hasBtn2) { if (hasBtn1) y += V2.BTN_GAP; btn2Y = y; y += V2.BTN_H; }
  }
  const bandBottom = y + (isV4 ? V4.BAND_PAD_BOTTOM : V2.BAND_PAD_BOTTOM);

  // ── BANT ALTI ──
  // V2: QR + tarama satırı        V3: ŞİRKET LOGOSU (QR yukarı taşındı)
  let logoTop, H;
  if (isV3) {   // isV3, V4'ü de kapsıyor (yukarıda öyle tanımlandı)
    logoTop = bandBottom + V3.GAP_BAND_LOGO;
    H = logoTop + V2.LOGO_BOX_H + V3.BOTTOM_PAD;
  } else {
    // V2: QR bant ALTINDAKİ beyaz alanda, ama artık V3 gibi ÇERÇEVELİ (kullanıcı isteği).
    // Çerçeve zemine göre stillenir: V3/V4'te bant üzerinde buzlu cam, V2'de BEYAZ
    // zemin üzerinde ince kenarlı + yumuşak gölgeli panel (cam beyaz üstünde görünmez
    // kalırdı). onBand bayrağı bunu taşır.
    logoTop = V2.LOGO_TOP;
    const fy = bandBottom + V2.QR_GAP;
    qrFrame = { x: (W - frameSize) / 2, y: fy, w: frameSize, h: frameSize, r: V3.QR_FRAME_R, onBand: false };
    qrY = fy + V3.QR_FRAME_PAD;
    scanY = fy + frameSize + V2.SCAN_GAP;
    H = scanY + V2.SCAN_LH + V2.BOTTOM_PAD;
  }

  const btnX = (W - V2.BTN_W) / 2;
  const phoneX = (W - V2.PHONE_D) / 2;

  // ── BUTON İÇERİĞİ ORTAK SOL HİZADA ──
  // Eskiden her buton kendi "ikon + metin" grubunu AYRI AYRI ortalıyordu; etiketler
  // farklı genişlikte olduğu için ikonlar farklı x'te başlıyordu. Ölçüldü (13.5px
  // Inter, 286px buton): TR "Ofisime Yol Tarifi"/"Randevu Al" → ikon x 76.0 / 93.4,
  // yani 17.4px KAYMA. EN'de 2.2px olduğu için fark gözle görünmüyordu, kullanıcı
  // Türkçede yakaladı (RU 12.6px, AR 14.0px de bozuk).
  // Çözüm: hiza EN GENİŞ etikete göre bir kez hesaplanır ve İKİ butonda da aynı
  // kullanılır → ikonlar ve metin başlangıçları hizalı, blok yine ortalı görünür.
  let btnContentDx = null;
  if (btnLabels && btnLabels.length) {
    const shown = [hasBtn1 ? btnLabels[0] : null, hasBtn2 ? btnLabels[1] : null].filter(Boolean);
    if (shown.length) {
      ctx.font = `600 ${V2.BTN_FS}px "Inter", Arial, sans-serif`;
      const widest = Math.max(...shown.map(t => ctx.measureText(String(t)).width));
      const groupW = V2.BTN_ICON + V2.BTN_ICON_GAP + widest;
      btnContentDx = Math.max(10, (V2.BTN_W - groupW) / 2);
    }
  }

  return {
    W, H, innerW, variant,
    nameFS, nameText,
    band: { top: bandTop, bottom: bandBottom },
    logo: { top: logoTop, boxW: V2.LOGO_BOX_W, boxH: V2.LOGO_BOX_H },
    // placeholder: daire var ama İÇİ BOŞ (fotoğraf yok) → önizlemede yükleme çağrısı
    avatar: reservePhoto ? { cx: W / 2, cy: avCY, r: V2.AV_D / 2, placeholder: !hasPhoto } : null,
    nameY, titleY, companyY,
    phone: phoneY == null ? null : { x: phoneX, y: phoneY, d: V2.PHONE_D },
    btn1: btn1Y == null ? null : { x: btnX, y: btn1Y, w: V2.BTN_W, h: V2.BTN_H },
    btn2: btn2Y == null ? null : { x: btnX, y: btn2Y, w: V2.BTN_W, h: V2.BTN_H },
    qr: { x: (W - V2.QR_SIZE) / 2, y: qrY, size: V2.QR_SIZE },
    qrFrame,
    iconRow,
    showInlineLi,
    btnContentDx,
    scanY,
    scanOnBand: isV3,          // V3'te tarama satırı bandın içinde → BEYAZ metin
    hasLinkedin,
  };
}

/** V2 metin bloklarını hazırlar (sarma dahil) — tuval ve HTML aynı satırları kullanır. */
export function v2Content(ctx, { fullName, titleParts, companyName }) {
  const innerW = V2.W - V2.PAD_X * 2;
  ctx.font = `${V2.TITLE_FS}px "Inter", Arial, sans-serif`;
  const titleLines = (titleParts || []).filter(Boolean).flatMap(t => wrap(ctx, t, innerW));
  ctx.font = `600 ${V2.COMPANY_FS}px "Inter", Arial, sans-serif`;
  const companyLines = companyName ? wrap(ctx, companyName, innerW) : [];
  return { fullName, titleLines, companyLines };
}

/**
 * Adı kart genişliğine sığdırır. Uzun Türkçe adlar 20px'te taşıyordu
 * (ölçüldü: "Abdürrahim Muhammetcan Küçükyılmazoğlu" kartın iki yanından çıkıyor,
 * LinkedIn ikonu da dışarı itiliyordu). Önce punto kademeli küçültülür, en kötü
 * durumda kısaltılır. Satır yüksekliği (NAME_LH) SABİT kalır → düzen kaymaz.
 */
// Ad satirini genislige SIGDIR: once punto kademeli kucultulur, yetmezse '…' ile
// kisaltilir. startFS/minFS parametrik cunku ayni mantik gosterilen V4'un
// (dahili 'v1') 24px'lik tuval adinda da kullaniliyor (BusinessCardModal) —
// orada ad hic sigdirilmadigi icin 51 karakterlik ad PNG'de iki yandan kesiliyor
// ve LinkedIn ikonu tuvalin disina dusuyordu (denetimde olculdu).
export function fitName(ctx, name, availW, startFS = V2.NAME_FS, minFS = 13) {
  const font = (fs) => `bold ${fs}px "Plus Jakarta Sans", "Inter", Arial, sans-serif`;
  let fs = startFS;
  ctx.font = font(fs);
  while (fs > minFS && ctx.measureText(name).width > availW) {
    fs -= 0.5;
    ctx.font = font(fs);
  }
  let text = name;
  if (ctx.measureText(text).width > availW) {
    while (text.length > 4 && ctx.measureText(text + '…').width > availW) text = text.slice(0, -1);
    text += '…';
  }
  return { nameFS: fs, nameText: text };
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const im = new window.Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });
}

/**
 * V2 kartvizitini tuvale çizer.
 * @returns {{canvas:HTMLCanvasElement, hotspots:Array, layout:Object}}
 *   hotspots = önizlemede tıklanabilir alanlar (mantıksal 420px koordinatında)
 */
export async function drawBusinessCardV2({
  qrCanvas, form, stg, office, company, profileBase64, L, lang,
  fullName, companyName, titleParts, gsm, email, addressText, variant = 'v2',
  linkedinUrl = '', photoCta = false,
}) {
  const { band, btn } = v2Colors(stg.navyLevel);
  const hasPhoto = !!profileBase64;
  // showLinkedin false ise ad yanındaki LinkedIn ikonu da çizilmez (kart genelindeki
  // 'Gizle' kuralı; QR altındaki 4. ikon linkedinUrl üzerinden zaten kapanıyor).
  const hasLinkedin = stg.showLinkedin !== false && !!form.linkedinPersonal;

  // ölçüm için geçici bağlam
  const meas = document.createElement('canvas').getContext('2d');
  const { titleLines, companyLines } = v2Content(meas, { fullName, titleParts, companyName });
  const btnLabels = v2BtnLabels(L);
  const lay = v2Layout(meas, v2LayoutInput({
    data: { fullName, gsm, email, addressText, linkedinUrl },
    titleLines, companyLines, hasPhoto, hasLinkedin, variant, L, photoCta,
  }));

  const SCALE = 2;
  const canvas = document.createElement('canvas');
  canvas.width = lay.W * SCALE;
  canvas.height = lay.H * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = 'top';

  // ── zemin: beyaz kart, yuvarlak köşe ──
  roundRectPath(ctx, 0, 0, lay.W, lay.H, V2.RADIUS);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, lay.W, lay.H);

  // ── renk bandı ──
  ctx.fillStyle = band;
  ctx.fillRect(0, lay.band.top, lay.W, lay.band.bottom - lay.band.top);

  // ── logo (bant üstü beyaz alanda, ortalı, kutuya sığdırılmış) ──
  const cardLogo = stg.cardLogoBase64 || stg.logoBase64;
  if (cardLogo) {
    try {
      const im = await loadImg(cardLogo);
      const ar = im.width / im.height;
      let h = lay.logo.boxH, w = h * ar;
      if (w > lay.logo.boxW) { w = lay.logo.boxW; h = w / ar; }
      // TYRO ana logosunda optik sola kaydırma (V1'de de var — sol swoosh ince/açık,
      // sağ wordmark koyu, görsel ağırlık merkezi sağa kayıyor)
      const dx = stg.cardLogoIsMain ? -4 : 0;
      ctx.drawImage(im, (lay.W - w) / 2 + dx, lay.logo.top + (lay.logo.boxH - h) / 2, w, h);
    } catch (_) { /* logo yüklenemedi → boş bırak */ }
  }

  // ── profil dairesi: beyaz halka + fotoğraf (cover) ──
  if (lay.avatar) {
    const { cx, cy, r } = lay.avatar;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx, cy, r + V2.AV_RING, 0, Math.PI * 2); ctx.fill();
    // placeholder (yalnız önizleme): içi BEYAZ kalır, üstüne React katmanı yükleme
    // ikonunu ve "Fotoğraf" yazısını basar. Gizlenen V4 tasarımındaki görünümün aynısı.
    if (lay.avatar.placeholder) {
      // İç dolgu BEYAZ DEĞİL açık gri-mavi: dairenin üst kısmı kartın beyaz şeridinin
      // üstüne düşüyor, beyaz dolguda şekil o şeride karışıp "leke" gibi görünüyordu.
      // Kesikli çerçeve React katmanında (daha net) — burada yalnız dolgu.
      ctx.fillStyle = '#e9eff6';
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    } else {
    try {
      const im = await loadImg(profileBase64);
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      const ar = im.width / im.height;
      let dw = r * 2, dh = dw / ar;
      if (dh < r * 2) { dh = r * 2; dw = dh * ar; }
      ctx.drawImage(im, cx - dw / 2, cy - dh / 2, dw, dh);
      ctx.restore();
    } catch (_) {
      ctx.fillStyle = '#e8eef5';
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    }
  }

  // ── ad + LinkedIn ikonu ──
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${lay.nameFS}px "Plus Jakarta Sans", "Inter", Arial, sans-serif`;
  ctx.textAlign = 'left';
  const nameW = ctx.measureText(lay.nameText).width;
  const totalW = nameW + (lay.showInlineLi ? V2.LI_GAP + V2.LI_SIZE : 0);
  const nameX = (lay.W - totalW) / 2;
  // METİN MODELİ HTML İLE AYNI: her metin, Y'den başlayan LH yüksekliğinde bir satır
  // kutusunun DİKEY ORTASINA yazılır. Eskiden tuval textBaseline:'top' kullanıyordu,
  // HTML ise line-height kutusunu ortalıyordu → HTML metinleri 3-5px AŞAĞIDA kalıyordu.
  ctx.textBaseline = 'middle';
  ctx.fillText(lay.nameText, nameX, lay.nameY + V2.NAME_LH / 2);
  if (lay.showInlineLi) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.translate(nameX + nameW + V2.LI_GAP, lay.nameY + V2.NAME_LH / 2 - V2.LI_SIZE / 2);
    ctx.scale(V2.LI_SIZE / 24, V2.LI_SIZE / 24);
    ctx.fill(new Path2D(LI_PATH));
    ctx.restore();
  }

  // ── ünvanlar ──
  ctx.textAlign = 'center';
  if (lay.titleY != null) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `${V2.TITLE_FS}px "Inter", Arial, sans-serif`;
    titleLines.forEach((l, i) => ctx.fillText(l, lay.W / 2, lay.titleY + i * V2.TITLE_LH + V2.TITLE_LH / 2));
  }
  // ── şirket adı ──
  if (lay.companyY != null) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `600 ${V2.COMPANY_FS}px "Inter", Arial, sans-serif`;
    companyLines.forEach((l, i) => ctx.fillText(l, lay.W / 2, lay.companyY + i * V2.COMPANY_LH + V2.COMPANY_LH / 2));
  }

  // ── telefon ikonu: beyaz çember + ahize (numara YAZILMIYOR) ──
  //    lay.phone null ise (gsm yok) HİÇ çizilmez ve düzende yer de kaplamaz.
  if (lay.phone) {
    const pc = { x: lay.phone.x + lay.phone.d / 2, y: lay.phone.y + lay.phone.d / 2 };
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = V2.PHONE_STROKE;
    ctx.beginPath();
    ctx.arc(pc.x, pc.y, lay.phone.d / 2 - V2.PHONE_STROKE / 2, 0, Math.PI * 2);
    ctx.stroke();
    const gs = lay.phone.d * 0.52;           // ikon glifi çemberin %52'si
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.translate(pc.x - gs / 2, pc.y - gs / 2);
    ctx.scale(gs / 24, gs / 24);
    ctx.fill(new Path2D(PHONE_PATH));
    ctx.restore();
  }

  // ── aksiyon butonları: yalnız verisi OLAN çizilir (HTML ve hotspot'larla aynı koşul) ──
  const [label1, label2] = btnLabels;
  [[lay.btn1, label1, NAV_PATH], [lay.btn2, label2, CAL_PATH]].forEach(([b, label, iconPath]) => {
    if (!b) return;
    ctx.fillStyle = btn;
    roundRectPath(ctx, b.x, b.y, b.w, b.h, V2.BTN_R);
    ctx.fill();
    ctx.font = `600 ${V2.BTN_FS}px "Inter", Arial, sans-serif`;
    ctx.textAlign = 'left';
    // Ortak sol hiza (bkz. v2Layout'taki btnContentDx notu). Yedek: eski ortalama.
    const gx = lay.btnContentDx != null
      ? b.x + lay.btnContentDx
      : b.x + (b.w - (V2.BTN_ICON + V2.BTN_ICON_GAP + ctx.measureText(label).width)) / 2;
    const cy = b.y + b.h / 2;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.translate(gx, cy - V2.BTN_ICON / 2);
    ctx.scale(V2.BTN_ICON / 24, V2.BTN_ICON / 24);
    ctx.fill(new Path2D(iconPath));
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, gx + V2.BTN_ICON + V2.BTN_ICON_GAP, cy);
  });

  // ── QR ──  V2: bant altı beyaz alan · V3: bandın İÇİNDE, buzlu cam çerçevede
  if (lay.qrFrame) {
    const f = lay.qrFrame;
    ctx.save();
    ctx.shadowColor = f.onBand ? 'rgba(0,0,0,0.20)' : 'rgba(30,58,95,0.16)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;
    // Bant üzerinde buzlu cam; BEYAZ zeminde opak beyaz (cam orada görünmez olurdu)
    ctx.fillStyle = f.onBand ? 'rgba(255,255,255,0.55)' : '#ffffff';
    roundRectPath(ctx, f.x, f.y, f.w, f.h, f.r);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = f.onBand ? 'rgba(255,255,255,0.55)' : 'rgba(30,58,95,0.13)';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, f.x, f.y, f.w, f.h, f.r);
    ctx.stroke();
  }
  if (qrCanvas) {
    ctx.drawImage(qrCanvas, lay.qr.x, lay.qr.y, lay.qr.size, lay.qr.size);
  }

  // ── V4 İKON SATIRI: QR altında dört beyaz glif (telefon · konum · mail · LinkedIn)
  //    Butonların ve uyarı satırının yerini alır. Ölçüler müşteri PDF'indeki sosyal
  //    medya satırından alındı (bkz. V4 sabitlerindeki not). ──
  if (lay.iconRow) {
    const row = lay.iconRow;
    const ink = row.onBand ? '#ffffff' : '#232c5e';
    row.items.forEach(it => {
      ctx.save();
      ctx.translate(it.gx, it.gy);
      ctx.scale(it.gw / 24, it.gh / 24);
      if (it.id === 'li') {
        // LinkedIn: GERÇEK MARKA İŞARETİ (kullanıcı isteği "gerçekçi ikon").
        // Marka logosu doğası gereği DOLU; çizgiyle taklit edilince LinkedIn'e
        // benzemiyordu. Diğer üçü çizgi kalıyor.
        ctx.fillStyle = ink;
        ctx.fill(new Path2D(LI_PATH));
      } else {
        const paths = OUTLINE_ICONS[it.id] || [];
        ctx.strokeStyle = ink;
        ctx.lineWidth = V4.ICON_STROKE;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        paths.forEach(d => ctx.stroke(new Path2D(d)));
      }
      ctx.restore();
    });
  }

  // ── "Taratarak rehbere ekleyin" — küçük telefon ikonu + metin, birlikte ortalı
  //    (V1'in dijital kartında vardı, V2'de eksikti — kullanıcı bildirimi) ──
  if (lay.scanY != null) {
    const txt = (L && L.bcScan) || 'Taratarak rehbere ekleyin';
    // V3'te bu satır bandın İÇİNDE duruyor → beyaz; V2'de beyaz alanda → koyu
    const ink = lay.scanOnBand ? 'rgba(255,255,255,0.92)' : 'rgba(30,58,95,0.62)';
    ctx.font = `${V2.SCAN_FS}px "Inter", Arial, sans-serif`;
    ctx.textAlign = 'left';
    const tw = ctx.measureText(txt).width;
    const ic = V2.SCAN_ICON, gap = 6;
    const gx = (lay.W - (ic + gap + tw)) / 2;
    const cy = lay.scanY + V2.SCAN_LH / 2;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.3;
    roundRectPath(ctx, gx + 2.5, cy - ic / 2, ic - 5, ic, 2.5);
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.beginPath(); ctx.arc(gx + ic / 2, cy + ic / 2 - 3, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, gx + ic + gap, cy);
    ctx.textBaseline = 'top';
  }

  ctx.restore();

  // ── tıklama alanları (önizleme ve HTML aynı listeyi kullanır) ──
  const hotspots = [];
  // V4 ikon satırı: her ikon kendi eylemini açar. Konum V3'teki "yol tarifi"
  // butonuyla AYNI haritayı, mail mailto (Outlook), LinkedIn kişisel varsa onu
  // yoksa şirketinkini açar (linkedinUrl çağıran tarafından çözülür).
  if (lay.iconRow) {
    const HREFS = {
      tel: gsm ? 'tel:' + gsm.replace(/\s/g, '') : null,
      map: addressText ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addressText) : null,
      mail: email ? 'mailto:' + email : null,
      // ⚠️ LinkedIn adresi KULLANICI SERBEST METNİ (SignatureTab'da normalize edilmiyor).
      // sanitizeUrl zorunlu: (a) 'javascript:...' boşaltılır — bu href hem önizlemeye
      // hem de PAYLAŞILAN dijital kart HTML'ine giriyor ve o dosyada CSP yok,
      // (b) şemasız 'www.linkedin.com/in/x' başına https:// eklenir; ham hâli
      // GÖRECELİ bağlantı olup alıcının tarayıcısında yerel dosya/404 açıyordu.
      li: sanitizeUrl(linkedinUrl) || null,
    };
    lay.iconRow.items.forEach(it => {
      const href = HREFS[it.id];
      // ext: yeni sekmede açılmalı (harita + LinkedIn); tel:/mailto: aynı sekmede kalır
      if (href) hotspots.push({ id: 'icon-' + it.id, href, label: it.id, ext: it.id === 'map' || it.id === 'li', x: it.x, y: it.y, w: it.w, h: it.h });
    });
  }
  if (gsm && lay.phone) hotspots.push({ id: 'tel', href: 'tel:' + gsm.replace(/\s/g, ''), label: gsm, ...lay.phone, x: lay.phone.x, y: lay.phone.y, w: lay.phone.d, h: lay.phone.d, round: true });
  if (addressText && lay.btn1) hotspots.push({ id: 'map', href: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addressText), label: label1, ext: true, ...lay.btn1 });
  if (email && lay.btn2) hotspots.push({ id: 'mail', href: 'mailto:' + email, label: label2, ...lay.btn2 });

  return { canvas, hotspots, layout: lay };
}

/**
 * V2 için tek dosyalık HTML (Dijital Kart) — tuvaldeki AYNI düzen sayıları,
 * ama metin gerçek metin ve butonlar gerçek bağlantı.
 */
/**
 * V2 icin tek dosyalik HTML (Dijital Kart).
 *
 * KACIRMA KURALI (CLAUDE.md): bu dosya PAYLASILAN bir HTML uretiyor, yani self-XSS
 * degil - alicinin tarayicisinda calisir. href/src'ye giren HER deger escapeHtml'den
 * gecmeli.
 * Olculmus somut acik (DUZELTILDI): formatGSM() telefonu Turkce desene uyduramazsa
 * son satirinda HAM girdiyi donduruyor (return val). GSM alanina
 *     123"onmouseover="alert(document.domain)
 * yazildiginda href="tel:..." icine olay yakalayici siziyordu. Hemen yanindaki
 * aria-label escapeHtml'liydi, fark bu yuzden gorunuyordu. V1 disa aktarimi zaten
 * escapeHtml(r.href) kullaniyor - bu bosluk yalniz V2'deydi.
 * ARAC SECIMI (ikisi de gerekli, yer degistirilemez):
 *   • data: URI (logo/fotograf), tel:, mailto:  → escapeHtml. sanitizeUrl bunlari
 *     BOSALTIR (yalniz http/https gecirir), yani logo/telefon yok olur.
 *   • http/https adresi (LinkedIn gibi KULLANICI yazdigi alan) → sanitizeUrl.
 *     escapeHtml tek basina YETMEZ: tirnagi kacirir ama semayi bozmaz, yani
 *     'javascript:alert(1)' oldugu gibi href'e girer ve bu dosyada CSP olmadigi
 *     icin ALICININ tarayicisinda calisir (olculdu; DUZELTILDI).
 */
export function buildBusinessCardV2Html({
  stg, form, L, fullName, companyName, titleParts, gsm, email, addressText,
  profileBase64, qrSvg, cardLogo, layout, titleLines, companyLines, linkedinUrl = '',
}) {
  const { band, btn } = v2Colors(stg.navyLevel);
  const lay = layout;
  const [label1, label2] = v2BtnLabels(L);
  const mapHref = addressText ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addressText) : '';
  const telHref = gsm ? 'tel:' + gsm.replace(/\s/g, '') : '';

  const abs = (o) => `position:absolute;left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;`;
  const dx = stg.cardLogoIsMain ? -4 : 0;

  // left:50% + translateX(-50%) → kesin ortalama. Eskiden left:0;right:0;margin:0 auto
  // kullanılıyordu; genişliği auto olan konumlandırılmış bir <img>'de bu davranış
  // belirsiz ve tarayıcıya göre değişebiliyor. dx = TYRO optik kaydırması.
  // Logo, kutunun İÇİNDE hem yatay hem DİKEY ortalanır. Tuval de öyle yapıyor
  // (drawImage y = logo.top + (boxH - h)/2). Eskiden HTML'de yalnız top veriliyordu →
  // yüksekliği kutudan küçük logolar (geniş wordmark'lar, ör. Nexa Studio) kutunun ÜSTÜNE
  // yapışıp tuvalden ~12px yukarıda duruyordu.
  const logoHtml = cardLogo
    ? `<div style="position:absolute;left:0;right:0;top:${lay.logo.top}px;height:${lay.logo.boxH}px;`
      + `display:flex;align-items:center;justify-content:center">`
      + `<img src="${escapeHtml(cardLogo)}" alt="" style="max-width:${lay.logo.boxW}px;`
      + `max-height:${lay.logo.boxH}px;width:auto;height:auto;display:block;`
      + `transform:translateX(${dx}px)" /></div>`
    : '';

  const avatarHtml = lay.avatar
    ? `<div style="position:absolute;left:${lay.avatar.cx - lay.avatar.r - V2.AV_RING}px;`
      + `top:${lay.avatar.cy - lay.avatar.r - V2.AV_RING}px;`
      + `width:${(lay.avatar.r + V2.AV_RING) * 2}px;height:${(lay.avatar.r + V2.AV_RING) * 2}px;`
      + `border-radius:50%;background:#fff;overflow:hidden;padding:${V2.AV_RING}px;box-sizing:border-box">`
      + `<img src="${escapeHtml(profileBase64)}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block" />`
      + `</div>`
    : '';

  // V4'te ad yanında LinkedIn YOK (bkz. v2Layout'taki showInlineLi notu)
  const liSvg = (lay.showInlineLi && stg.showLinkedin !== false && form.linkedinPersonal)
    ? `<a href="${sanitizeUrl(form.linkedinPersonal)}" target="_blank" rel="noopener" `
      + `style="display:inline-flex;vertical-align:middle;margin-left:${V2.LI_GAP}px;opacity:.9">`
      + `<svg class="ico" width="${V2.LI_SIZE}" height="${V2.LI_SIZE}" viewBox="0 0 24 24" fill="#fff"><path d="${LI_PATH}"/></svg></a>`
    : '';

  const titleHtml = titleLines.length
    ? `<div style="position:absolute;left:0;right:0;top:${lay.titleY}px;text-align:center;`
      + `font-size:${V2.TITLE_FS}px;line-height:${V2.TITLE_LH}px;color:rgba(255,255,255,.92)">`
      + titleLines.map(escapeHtml).join('<br/>') + `</div>`
    : '';

  const companyHtml = companyLines.length
    ? `<div style="position:absolute;left:0;right:0;top:${lay.companyY}px;text-align:center;`
      + `font-size:${V2.COMPANY_FS}px;line-height:${V2.COMPANY_LH}px;font-weight:600;color:rgba(255,255,255,.85)">`
      + companyLines.map(escapeHtml).join('<br/>') + `</div>`
    : '';

  // KORUMA lay.phone'a bakar, sadece veriye DEĞİL: V4'te telefon ikonu düzende YOK
  // (lay.phone null) ama gsm VAR → eskiden burada 'Cannot read properties of null'
  // ile HTML dışa aktarımı çöküyordu. Tuval tarafı zaten lay.phone'u kontrol ediyordu.
  const phoneHtml = (telHref && lay.phone)
    ? `<a href="${escapeHtml(telHref)}" aria-label="${escapeHtml(gsm)}" style="${abs({ x: lay.phone.x, y: lay.phone.y, w: lay.phone.d, h: lay.phone.d })}`
      + `border:${V2.PHONE_STROKE}px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;`
      + `box-sizing:border-box;text-decoration:none">`
      + `<svg class="ico" width="${Math.round(lay.phone.d * 0.52)}" height="${Math.round(lay.phone.d * 0.52)}" viewBox="0 0 24 24" fill="#fff"><path d="${PHONE_PATH}"/></svg></a>`
    : '';

  // İkon + metin İKİ BUTONDA DA aynı x'te başlar: justify-content:center yerine
  // flex-start + düzenden gelen ortak sol boşluk (tuvaldeki gx ile birebir aynı).
  const btnPadL = lay.btnContentDx != null ? lay.btnContentDx : 10;
  const btnCss = `background:${btn};border-radius:${V2.BTN_R}px;display:flex;align-items:center;`
    + `justify-content:flex-start;gap:${V2.BTN_ICON_GAP}px;color:#fff;text-decoration:none;font-weight:600;`
    + `font-size:${V2.BTN_FS}px;box-sizing:border-box;padding-left:${btnPadL}px;padding-right:10px;`
    + `white-space:nowrap;overflow:hidden;`;
  // class="ico" → .qrbox dışındaki svg'ler kendi width/height'ını korur (bkz. CSS notu)
  const ico = (d) => `<svg class="ico" width="${V2.BTN_ICON}" height="${V2.BTN_ICON}" viewBox="0 0 24 24" fill="#fff"><path d="${d}"/></svg>`;

  const b1 = (mapHref && lay.btn1) ? `<a href="${escapeHtml(mapHref)}" target="_blank" rel="noopener" style="${abs(lay.btn1)}${btnCss}">${ico(NAV_PATH)}<span>${escapeHtml(label1)}</span></a>` : '';
  const b2 = (email && lay.btn2) ? `<a href="mailto:${escapeHtml(email)}" style="${abs(lay.btn2)}${btnCss}">${ico(CAL_PATH)}<span>${escapeHtml(label2)}</span></a>` : '';

  // V3: QR bandın içinde buzlu cam ÇERÇEVE ile sunulur (tuvaldeki ile aynı ölçüler)
  const qrFrameHtml = lay.qrFrame
    ? `<div style="${abs(lay.qrFrame)}`
      + `background:${lay.qrFrame.onBand ? 'rgba(255,255,255,.55)' : '#ffffff'};`
      + `border:1.5px solid ${lay.qrFrame.onBand ? 'rgba(255,255,255,.55)' : 'rgba(30,58,95,.13)'};`
      + `border-radius:${lay.qrFrame.r}px;`
      + `box-shadow:0 4px 16px ${lay.qrFrame.onBand ? 'rgba(0,0,0,.20)' : 'rgba(30,58,95,.16)'};`
      + `box-sizing:border-box"></div>`
    : '';
  // ── V4 IKON SATIRI (gercek baglantilar) ──
  // telefon → tel:  ·  konum → V3'teki yol tarifi butonuyla AYNI harita  ·
  // mail → mailto (varsayilan istemci, Outlook)  ·  LinkedIn → kisisel varsa o,
  // yoksa sirketin (linkedinUrl cagiran tarafindan cozulur).
  // Çerçeve KALDIRILDI (kullanıcı isteği): yalnız glif ve görünmez dokunma alanı.
  const iconInk = lay.iconRow && lay.iconRow.onBand ? '#ffffff' : '#232c5e';
  const iconHref = {
    tel: gsm ? 'tel:' + gsm.replace(/\s/g, '') : '',
    map: mapHref,
    mail: email ? 'mailto:' + email : '',
    // sanitizeUrl: yukarıdaki hotspot listesindeki gerekçenin aynısı. Bu satır
    // PAYLAŞILAN dosyaya yazılıyor → escapeHtml tek başına yetmez, 'javascript:'
    // şemasını escapeHtml geçirir (tırnak kaçırır ama şemayı bozmaz).
    li: sanitizeUrl(linkedinUrl),
  };
  const iconTitle = {
    tel: gsm || '',
    map: (L && L.bcV2Navigate) || 'Navigate to my Office',
    mail: email || '',
    li: 'LinkedIn',
  };
  const iconRowHtml = lay.iconRow
    ? lay.iconRow.items.map(it => {
        const href = iconHref[it.id];
        if (!href) return '';
        const ext = it.id === 'map' || it.id === 'li';
        // LinkedIn GERÇEK MARKA işareti (dolu); diğer üçü çizgi.
        const svg = it.id === 'li'
          ? `<svg class="ico" width="${it.gw}" height="${it.gh}" viewBox="0 0 24 24"`
            + ` fill="${iconInk}"><path d="${LI_PATH}"/></svg>`
          : `<svg class="ico" width="${it.gw}" height="${it.gh}" viewBox="0 0 24 24" fill="none"`
            + ` stroke="${iconInk}" stroke-width="${V4.ICON_STROKE}" stroke-linecap="round"`
            + ` stroke-linejoin="round">`
            + (OUTLINE_ICONS[it.id] || []).map(d => `<path d="${d}"/>`).join('')
            + `</svg>`;
        // Dokunma alanı glifin çevresine yayılır ama GÖRÜNMEZ (çerçeve yok)
        return `<a href="${escapeHtml(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}`
          + ` title="${escapeHtml(iconTitle[it.id] || '')}" style="${abs(it)}display:flex;`
          + `align-items:center;justify-content:center;text-decoration:none">`
          + svg + `</a>`;
      }).join('')
    : '';

  const qrHtml = qrSvg
    ? `<div class="qrbox" style="${abs({ x: lay.qr.x, y: lay.qr.y, w: lay.qr.size, h: lay.qr.size })}">${qrSvg}</div>`
    : '';

  const scanTxt = (L && L.bcScan) || 'Taratarak rehbere ekleyin';
  const scanInk = lay.scanOnBand ? 'rgba(255,255,255,.92)' : 'rgba(30,58,95,.62)';
  // V4'te bu satir YOK (lay.scanY null)
  const scanHtml = lay.scanY == null ? '' : `<div class="scan" style="position:absolute;left:0;right:0;top:${lay.scanY}px;`
    + `height:${V2.SCAN_LH}px;display:flex;align-items:center;justify-content:center;gap:6px;`
    + `font-size:${V2.SCAN_FS}px;color:${scanInk}">`
    + `<svg class="ico" width="${V2.SCAN_ICON}" height="${V2.SCAN_ICON}" viewBox="0 0 24 24" fill="none" `
    + `stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`
    + `<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`
    + `<span>${escapeHtml(scanTxt)}</span></div>`;

  return '<!DOCTYPE html>\n<html lang="' + (form.lang || 'tr') + '">\n<head>\n'
    + '<meta charset="utf-8" />\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />\n'
    + '<title>' + escapeHtml(fullName) + '</title>\n'
    + '<link rel="preconnect" href="https://fonts.googleapis.com" />\n'
    + '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
    + '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Plus+Jakarta+Sans:wght@700&display=swap" />\n'
    + '<style>\n'
    + '*{box-sizing:border-box}\n'
    // 100svh: mobil tarayıcı çubukları yüzünden 100vh gerçek görünür alandan büyük olur
    + 'html,body{margin:0;padding:0}\n'
    + 'body{background:#eef2f6;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;'
    + 'min-height:100vh;min-height:100svh;display:flex;align-items:center;justify-content:center;padding:10px;'
    + 'overflow-x:hidden}\n'
    // .fit = ÖLÇEKLENMİŞ boyutu LAYOUT'ta ayıran kap. transform layout'u etkilemediği
    // için bu kap olmadan sayfa hep tasarım yüksekliği kadar yer ayırır ve altta
    // kocaman bir boşluk/kaydırma kalır (indirilen kartta tam bu oluyordu).
    + `.fit{flex:0 0 auto;width:calc(${lay.W}px * var(--s,1));height:calc(${lay.H}px * var(--s,1))}\n`
    // ⚠️ ÖLÇEKLEME ve YUVARLAK KÖŞE AYNI ÖĞEDE OLMAMALI.
    // Eskiden .card hem `border-radius + overflow:hidden` hem `transform:scale()`
    // taşıyordu. iOS Safari'de bu üçlü bir arada köşe kırpmasını düşürüyor: kart
    // masaüstünde yuvarlak, TELEFONDA KARE görünüyordu (kullanıcı bildirdi; Chrome'da
    // yarıçap 18px ölçüldüğü için tarayıcı tarafında görünmüyor).
    // Çözüm: ölçek ayrı bir kaba (.scaler) alındı, .card yalnız yuvarlatma ve kırpma
    // yapıyor. Ek güvence olarak -webkit-mask-image: Safari'de dönüştürülmüş kapsayıcı
    // içinde köşe kırpmasını zorlayan bilinen bir düzeltme (diğer tarayıcılarda etkisiz).
    + `.scaler{width:${lay.W}px;height:${lay.H}px;transform:scale(var(--s,1));transform-origin:top left}\n`
    // flex:0 0 auto ŞART: kart daralmaya bırakılırsa kutusu küçülür ama içindeki
    // piksel konumlu öğeler yerinde kalır → her şey merkezden kayar (ölçüldü: +28.5px).
    + `.card{position:relative;flex:0 0 auto;width:${lay.W}px;height:${lay.H}px;background:#fff;`
    + `border-radius:${V2.RADIUS}px;overflow:hidden;box-shadow:0 12px 40px rgba(30,58,95,.18);`
    + '-webkit-mask-image:-webkit-radial-gradient(#fff,#000)}\n'
    + `.band{position:absolute;left:0;right:0;top:${lay.band.top}px;height:${lay.band.bottom - lay.band.top}px;background:${band}}\n`
    + `.nm{position:absolute;left:0;right:0;top:${lay.nameY}px;text-align:center;color:#fff;`
    + `font-family:"Plus Jakarta Sans",Inter,Arial,sans-serif;font-weight:700;font-size:${lay.nameFS}px;line-height:${V2.NAME_LH}px;white-space:nowrap}\n`
    + '.qrbox svg{display:block;width:100%;height:100%}\n'
    + '.ico{flex:0 0 auto;display:block}\n'
    + 'a{-webkit-tap-highlight-color:transparent}\n'
    + 'a:hover{filter:brightness(1.12)}\n'
    + '</style>\n</head>\n<body>\n'
    + '<div class="fit"><div class="scaler"><div class="card">\n'
    + '<div class="band"></div>\n'
    + logoHtml + '\n' + avatarHtml + '\n'
    + '<div class="nm">' + escapeHtml(lay.nameText || fullName) + liSvg + '</div>\n'
    + titleHtml + '\n' + companyHtml + '\n' + phoneHtml + '\n' + b1 + '\n' + b2 + '\n'
    + qrFrameHtml + '\n' + qrHtml + '\n' + iconRowHtml + '\n' + scanHtml + '\n'
    + '</div></div></div>\n'
    // Kart SABİT tasarım ölçüsünde (piksel konumlu) çizilir, sonra ekrana sığacak
    // orana küçültülür. Ölçek CSS'te hesaplanamıyor: scale() birimsiz SAYI ister,
    // calc((100vw - 20px)/420) ise UZUNLUK verir → tarayıcı bildirimi sessizce atar
    // (indirilen kartta tam bu olmuş: ölçekleme hiç uygulanmamış). Bu yüzden 6
    // satırlık betikle hesaplanıyor. Betik çalışmazsa --s=1 kalır: kart tam boyda
    // görünür ve sayfa kayar — bozulmaz, sadece küçülmez.
    + '<script>(function(){var W=' + lay.W + ',H=' + lay.H + ';function f(){'
    + 'var vw=innerWidth,vh=innerHeight;'
    + 'if(window.visualViewport){vw=visualViewport.width;vh=visualViewport.height;}'
    + 'var s=Math.min(1,(vw-20)/W,(vh-20)/H);'
    + 'document.documentElement.style.setProperty("--s",s>0?s:1);}'
    + 'addEventListener("resize",f);addEventListener("orientationchange",f);'
    + 'if(window.visualViewport)visualViewport.addEventListener("resize",f);'
    + 'f();addEventListener("load",f);})();<\/script>\n'
    + '</body>\n</html>';
}
