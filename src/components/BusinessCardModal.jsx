import { memo, useEffect, useLayoutEffect, useRef, useCallback, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, FileDown, Share2, Upload } from 'lucide-react';
import { C } from '../constants/theme';
import { makeAlignmentTest } from '../utils/qrAlignment';
import { generateVCard } from '../utils/generateVCard';
import { formatGSM, titleCase, escapeHtml, sanitizeUrl } from '../utils/formatting';
import { drawBusinessCardV2, buildBusinessCardV2Html, v2Content, v2Layout, v2LayoutInput, fitName } from './businessCardV2';
import { useMenuPos } from '../hooks/useMenuPos';
// Background image lazy-loaded from public/ only when HTML download is triggered (saves ~710KB from bundle)
const BG_CARD_URL = (import.meta.env.BASE_URL || '/') + 'bg-card.jpg';
let _bgBase64Cache = null;
async function getBgBase64() {
  if (_bgBase64Cache) return _bgBase64Cache;
  try {
    const res = await fetch(BG_CARD_URL);
    const blob = await res.blob();
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => { _bgBase64Cache = reader.result; resolve(reader.result); };
      reader.readAsDataURL(blob);
    });
  } catch (e) { return ''; }
}

const NAVY = C.primary;
const GOLD = C.accent;
// QR BULUCU/HİZALAMA MERKEZİ RENGİ — burada altın KULLANILAMAZ.
// Tarayıcı görüntüyü siyah/beyaza indirger (eşik ~128/255); altın #c8922a gri
// karşılığı 150/255, yani AÇIK tarafta kalıyor. Bu renk üç bulucu desenin iç
// 3x3'ünde kullanılıyordu; bulucunun merkezi açık okunursa 1:1:3:1:1 oranı
// bozulur ve tarayıcı kodu HİÇ BULAMAZ. Marka vurgusu için koyu bir bronz
// tonu seçildi: gri karşılığı ~99/255 → güvenle KOYU, altın hissi korunuyor.
const QR_ACCENT = '#8a5f10';
const BLUE = C.divider;

function formatName(form) {
  return [titleCase(form.firstName), titleCase(form.lastName)].filter(Boolean).join(' ') || '—';
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Draw QR with rounded dots instead of square modules.
 * Uses QRCode.create() for data matrix, then custom-renders circles.
 */
function drawRoundedQr(ctx, qrData, size, margin, darkColor, lightColor) {
  const modules = qrData.modules;
  const moduleCount = modules.size;
  const totalModules = moduleCount + margin * 2;
  const cellSize = size / totalModules;
  // Nokta yarıçapı 0.42 → 0.50: 0.42'de daireler komşularına DEĞMİYOR, aralarında
  // beyaz boşluk kalıyordu. 166px'de modül ~2px olduğu için nokta ~1.7px'e düşüp
  // kod cılızlaşıyor ve tarayıcı ikilileştirmede modülleri ayırt edemiyordu.
  // 0.50 = hücreye tam içten teğet daire → komşular birleşir, yuvarlak estetik korunur.
  const dotRadius = cellSize * 0.50;

  // Fill background with rounded corners
  ctx.fillStyle = lightColor;
  ctx.beginPath();
  // KÖŞE YARIÇAPI SESSİZ BÖLGEYİ AŞMAMALI. Eskiden size*0.06 idi: 360px tuvalde
  // 21.6px, oysa 4 modüllük sessiz bölge 16.2-18.7px. Yani beyaz zeminin köşesi
  // QR'ın İÇİNE kesiyor ve arkadaki renk (V3/V4'te cam çerçeve) üç bulucu
  // deseninin köşesinde görünüyordu → köşedeki beyaz pay 4 modülden ~2.7'ye
  // düşüyordu. Ölçüldü: katı yerel eşikli çözücülerde (jsQR, ZXing-lib) başarı
  // YARIYA iniyor; Apple Vision/ZXing-C++ etkilenmiyordu. Sınır: 2 modül.
  roundRect(ctx, 0, 0, size, size, Math.min(size * 0.06, cellSize * 2));
  ctx.fill();

  // Navy-to-blue gradient for data dots (kept dark for scanner contrast)
  const dotGrad = ctx.createLinearGradient(0, 0, size, size);
  dotGrad.addColorStop(0, NAVY);
  dotGrad.addColorStop(0.5, '#1a4a6e');
  dotGrad.addColorStop(1, '#15607a');

  function isFinderPattern(row, col) {
    if (row < 7 && col < 7) return true;
    if (row < 7 && col >= moduleCount - 7) return true;
    if (row >= moduleCount - 7 && col < 7) return true;
    return false;
  }

  // Alignment pattern detection
  // Hizalama merkezleri ORTAK ve DOĞRULANMIŞ kaynaktan gelir (utils/qrAlignment.js).
  // Eskiden buradaki formül YANLIŞ konum üretiyordu ve süslü hizalama bloğu gerçek
  // VERİ modüllerinin üzerine basılıyordu → kod bozuluyordu. Bkz. o dosyanın notu.
  const _isAlignCenter = makeAlignmentTest(moduleCount);
  function isAlignmentCenter(r, c) { return _isAlignCenter(r, c); }

  function isAlignmentArea(r, c) {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (isAlignmentCenter(r - dr, c - dc)) return true;
      }
    }
    return false;
  }

  // Draw finder patterns with glow + gradient + gold center
  function drawFinderPattern(startRow, startCol) {
    const ox = (startCol + margin) * cellSize;
    const oy = (startRow + margin) * cellSize;
    const outerSize = 7 * cellSize;
    const innerSize = 3 * cellSize;
    const midSize = 5 * cellSize;
    const r = cellSize * 0.8;

    // Shadow glow
    ctx.save();
    ctx.shadowColor = 'rgba(30, 58, 95, 0.25)';
    ctx.shadowBlur = cellSize * 2;
    ctx.fillStyle = NAVY;
    ctx.beginPath();
    roundRect(ctx, ox, oy, outerSize, outerSize, r);
    ctx.fill();
    ctx.restore();

    // Outer ring with gradient
    ctx.fillStyle = dotGrad;
    ctx.beginPath();
    roundRect(ctx, ox, oy, outerSize, outerSize, r);
    ctx.fill();

    // White gap
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    roundRect(ctx, ox + cellSize, oy + cellSize, midSize, midSize, r * 0.6);
    ctx.fill();

    // Inner square with gold accent
    ctx.fillStyle = QR_ACCENT;
    ctx.beginPath();
    roundRect(ctx, ox + 2 * cellSize, oy + 2 * cellSize, innerSize, innerSize, r * 0.4);
    ctx.fill();
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(0, moduleCount - 7);
  drawFinderPattern(moduleCount - 7, 0);

  // Draw alignment patterns with matching style
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isAlignmentCenter(row, col)) {
        const ox = (col - 2 + margin) * cellSize;
        const oy = (row - 2 + margin) * cellSize;
        const s = 5 * cellSize;
        const ar = cellSize * 0.6;
        ctx.fillStyle = dotGrad;
        ctx.beginPath();
        roundRect(ctx, ox, oy, s, s, ar);
        ctx.fill();
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        roundRect(ctx, ox + cellSize, oy + cellSize, 3 * cellSize, 3 * cellSize, ar * 0.5);
        ctx.fill();
        ctx.fillStyle = QR_ACCENT;
        ctx.beginPath();
        ctx.arc((col + margin + 0.5) * cellSize, (row + margin + 0.5) * cellSize, cellSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Draw data modules as gradient dots with visual rhythm
  ctx.fillStyle = dotGrad;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isFinderPattern(row, col)) continue;
      if (isAlignmentArea(row, col)) continue;
      if (modules.get(row, col)) {
        const cx = (col + margin + 0.5) * cellSize;
        const cy = (row + margin + 0.5) * cellSize;
        const dist = Math.sqrt(Math.pow(cx - size / 2, 2) + Math.pow(cy - size / 2, 2)) / (size / 2);
        ctx.beginPath();
        ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// Dışa açık: QR çiziminin doğruluğu (süslemenin veri modüllerini ezmediği)
// otomatik olarak sınanabilsin diye. Uygulama içinde kullanımı değişmedi.
export async function drawCardQr(vcard, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  // Merkez logosu KALDIRILDI → yüksek hata düzeltmeye (H) gerek yok. 'M' (15%) daha az
  // modül üretir → ekranda kareler büyür → telefon kamerasıyla (Android+iOS) daha güvenilir
  // okunur. Margin 4 modül + yüksek kontrast korunur.
  // HATA DÜZELTME 'M' — 'L'ye çekmek HATA OLDU ve geri alındı. Gerekçem ("ekranda
  // gösterilen kod hasar görmez") eksikti: bu çiziciler modülleri AYRIK YUVARLAK
  // NOKTA olarak basıyor (yarıçap hücrenin 0.42'si) ve üstelik hizalama deseni
  // konumları yanlış hesaplanıyordu → veri zaten bozuktu. 'M' o bozulmayı telafi
  // ediyordu; 'L' payı bitirip kodu tamamen okunmaz yaptı. Hizalama hatası artık
  // düzeltildi ama süslü nokta stili durduğu için pay bırakmak DOĞRU olan.
  const qrData = QRCode.create(vcard, { errorCorrectionLevel: 'M' });
  const ctx = canvas.getContext('2d');
  drawRoundedQr(ctx, qrData, size, 4, NAVY, '#ffffff');

  return canvas;
}

/** Draw the TYRO corporate gradient background on canvas */
function drawGradientBg(ctx, W, H, radius) {
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, 0, 0, W, H, radius);
  ctx.clip();

  const grad = ctx.createLinearGradient(0, 0, W * 0.3, H);
  grad.addColorStop(0, '#b8d4de');
  grad.addColorStop(0.25, '#8cc4d0');
  grad.addColorStop(0.5, '#4da8be');
  grad.addColorStop(0.75, '#3695b0');
  grad.addColorStop(1, '#2a7fa0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const wave = ctx.createRadialGradient(W * 0.35, H * 0.52, 0, W * 0.35, H * 0.52, W * 0.55);
  wave.addColorStop(0, 'rgba(180,215,80,0.35)');
  wave.addColorStop(0.3, 'rgba(100,210,160,0.2)');
  wave.addColorStop(0.6, 'rgba(60,190,190,0.1)');
  wave.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = wave;
  ctx.fillRect(0, 0, W, H);

  const highlight = ctx.createRadialGradient(W * 0.8, H * 0.15, 0, W * 0.8, H * 0.15, W * 0.4);
  highlight.addColorStop(0, 'rgba(200,230,240,0.2)');
  highlight.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = highlight;
  ctx.fillRect(0, 0, W, H);

  ctx.restore();
}

/** Wrap text to fit within maxWidth, returns array of lines */
function wrapText(ctx, text, maxWidth) {
  // First try measureText, with char-count fallback
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0] || '';
  for (let i = 1; i < words.length; i++) {
    const test = currentLine + ' ' + words[i];
    const measured = ctx.measureText(test).width;
    // Use both pixel measurement AND char-count safety
    if (measured <= maxWidth && test.length <= 45) {
      currentLine = test;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
}

/** Ellipsize text to fit within maxWidth on canvas */
function ellipsize(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth && text.length <= 50) return text;
  let t = text;
  while (t.length > 5 && (ctx.measureText(t + '...').width > maxWidth || t.length > 47)) {
    t = t.substring(0, t.length - 1);
  }
  return t + '...';
}

/**
 * Draws a premium digital business card canvas — Figma design
 * Dynamic height based on content
 */
async function drawBusinessCard(qrCanvas, form, stg, office, company, profileBase64, L, lang) {
  const W = 420;
  const RADIUS = 15;
  const PAD = 24; // horizontal padding for text

  const fullName = formatName(form);
  const companyName = getCompanyName(company, stg, lang); // imzadaki şirket satırıyla aynı kaynak
  // İki ünvan ayraçla ('/') değil ALT SATIRA yazılır — imza tasarımıyla aynı davranış
  // (kullanıcı isteği). Her ünvan kendi satırında; tek başına uzunsa yine sarılır.
  const titleParts = [form.titleEN, form.titleTR].filter(Boolean);
  const hasTwoLines = titleParts.length > 0;

  // Build contact rows (use icon keys for matching, display labels from L)
  const contacts = [];
  const phoneVal = cardPhone(form, office, stg);
  if (phoneVal) contacts.push({ key: 'GSM', label: (L && L.bcLabelGSM) || 'GSM', value: phoneVal });
  const emailVal = cardEmail(form, stg);
  if (emailVal) contacts.push({ key: 'Email', label: (L && L.bcLabelEmail) || 'E-Posta', value: emailVal });
  if (office && office.address && office.city) {
    contacts.push({ key: 'Address', label: (L && L.bcLabelAddress) || 'Adres', value: office.address + ', ' + office.city });
  } else if (office && office.city) {
    contacts.push({ key: 'Location', label: (L && L.bcLabelLocation) || 'Konum', value: office.city });
  }

  // ── Pre-calculate heights to determine canvas size ──
  const logoRadius = 55;
  const logoCY = 120;
  // Yuvarlak avatar SADECE profil fotoğrafı varsa çizilir (kullanıcı isteği).
  // Fotoğraf yoksa (Azure'dan gelmemiş ve elle yüklenmemiş) yuvarlak hiç çizilmez —
  // şirket logosu artık QR bandında görünüyor, dairede tekrar etmesine gerek yok.
  // Fotoğraf yokken isim yukarıdan başlar, boş daire yeri bırakılmaz.
  const hasPhoto = !!profileBase64;
  const nameBaselineY = hasPhoto ? (logoCY + logoRadius + 40) : 58;
  // Ünvan ve şirket ünvanı satır sayıları ÖLÇÜLEREK bulunur: resmi ticari ünvanların
  // en uzunu 60 karakter ("TYRO Sürdürülebilir Havacılık Yakıtları...") ve 2 satıra
  // sarıyor. Tahminle geçilse kanvas yüksekliği ile içerik uyuşmuyordu. Ölçüm için
  // geçici bir 2D bağlam kullanılır (asıl ctx henüz yok — H'ye göre oluşturuluyor).
  const TITLE_FS = 15;        // ünvan punto (13 → 15, kullanıcı isteği: bir tık büyük)
  const TITLE_LH = 19, COMPANY_LH = 21;
  const measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx.font = TITLE_FS + 'px "Inter", Arial, sans-serif';
  // Her ünvan ayrı satır; kendi içinde de sığmazsa sarılır (satır sayısı ölçülerek bulunur)
  const titleLines = titleParts.flatMap(p => wrapText(measureCtx, p, W - PAD * 3));
  measureCtx.font = '600 16px "Inter", Arial, sans-serif';
  const companyLines = wrapText(measureCtx, companyName, W - PAD * 2);

  let contentY = nameBaselineY; // after name (extra gap below logo)
  // Sıra: ad → ÜNVAN (ismin hemen altı) → şirket resmi ünvanı
  if (titleLines.length) contentY += 23 + (titleLines.length - 1) * TITLE_LH;
  contentY += 24 + (companyLines.length - 1) * COMPANY_LH;
  contentY += 30; // gap before QR
  const qrContainerSize = 220;
  // Şirket logosu QR'ın ÜSTÜNDE, aynı cam çerçevenin İÇİNDE: QR'ın 4 modüllük beyaz
  // sessiz alanıyla birleşerek tek blok gibi durur. QR küçültülmez (okunurluk önce
  // gelir) → çerçeve bant kadar uzar. Logo yoksa bant hiç eklenmez.
  // QR üstündeki logo = ANA MARKA logosu (Ventures → Nexa Studio, diğerleri → TYRO;
  // App.jsx hesaplar). Şirketin kendi logosu kartta kullanılmıyor — kimlik zaten
  // resmi ünvan satırında yazıyor. Eski davranışa güvenli düşüş: logoBase64.
  const cardLogo = stg.cardLogoBase64 || stg.logoBase64;
  const cardLogoW = stg.cardLogoBase64 ? stg.cardLogoW : stg.logoW;
  const cardLogoH = stg.cardLogoBase64 ? stg.cardLogoH : stg.logoH;
  // Ana tyro logosu aynı bant yüksekliğinde diğerlerinden BÜYÜK görünüyor: oranı
  // 3.14, Nexa Studio/şirket logolarının 3.90 → aynı yükseklikte harfleri daha iri kalıyor.
  // Bu yüzden sadece ona %18 küçültme (kullanıcı isteği: "sadece TYRO için özel").
  // ORAN, BANTTA GÖSTERİLEN logodan alınmalı (şirket logosundan DEĞİL): aksi halde
  // şirket logosu 3.90 iken bantta TYRO (3.14) durduğunda yükseklik yanlış seçilip
  // logo yine büyük görünüyordu.
  const qrLogoAspect = (cardLogoW && cardLogoH) ? cardLogoW / cardLogoH : 3.9;
  // ÜÇ KADEME (oran → yükseklik). Yeni TYRO logosu ALT YAZI içeriyor: aynı
  // yükseklikte wordmark'ı eski logodan %36 küçük kalıyor (wordmark, tuval
  // yüksekliğinin %64.6'sı — ölçüldü). Bu yüzden alt yazılı/kompakt logolar (oran
  // < 2.6) daha uzun çizilir; wordmark böylece eski görünümüne döner.
  //   oran >= 3.5  geniş wordmark        → 44
  //   2.6 – 3.5    tek satır tyro     → 36 (eski davranış korunur)
  //   < 2.6        alt yazılı / kare     → 52
  const QR_LOGO_H = qrLogoAspect < 2.6 ? 52 : (qrLogoAspect < 3.5 ? 36 : 44);
  const QR_LOGO_GAP = 6;
  // OPTİK SOLA KAYDIRMA — yalnızca TYRO ana logosu (kullanıcı isteği: "kartvizitte
  // tyro logosunu bir tık sola al, sadece tyro logosunu").
  // Geometride hata YOK: logo da QR da W/2'ye ortalanıyor. Sorun optik — logonun
  // solundaki swoosh ince/açık renkli, sağdaki wordmark ise koyu ve dolu, bu yüzden
  // görsel ağırlık merkezi piksel merkezinin sağında kalıyor ve logo sağa kaçık
  // algılanıyor. (Ölçüldü: 320x102 tuvalde görünür kutu x 0→310, yani tuvalin
  // kendisinde de 9px'i sağda boş.) Nexa Studio logosunda bu asimetri olmadığı için
  // kaydırma ona UYGULANMAZ. Ayarlamak için tek sayı: büyütmek = daha sola.
  const MAIN_LOGO_DX = 4;
  const qrLogoDx = stg.cardLogoIsMain ? -MAIN_LOGO_DX : 0;
  const qrBandH = cardLogo ? QR_LOGO_H + QR_LOGO_GAP : 0;
  const qrContainerH = qrContainerSize + qrBandH;
  contentY += qrContainerH; // QR bloğu (logo bandı dahil)

  const panelW = 370;
  const rowH = 52;
  const rowHWrap = 68; // taller row for wrapped address text
  // Pre-calc panel height: address rows get extra height
  // Kişi satırı HİÇ yoksa panel de yok: eskiden 12px'lik dolgu tek başına kalıp
  // PNG'de BOŞ cam dikdörtgen çiziliyordu (önizleme ve HTML hiç göstermiyordu).
  let panelH = contacts.length ? 12 : 0;
  contacts.forEach(c => {
    panelH += (c.key === 'Address') ? rowHWrap : rowH;
  });
  contentY += panelH ? panelH + 25 : 0;   // 25 = QR ile panel arası (aşağıdaki panelY)
  contentY += 40; // bottom padding

  // YÜKSEKLİK YALNIZ İÇERİKTEN gelir (contentY 40px alt dolguyu zaten içeriyor).
  // Eskiden `Math.max(hasPhoto ? 780 : 625, contentY)` idi: veri seyrekleştiğinde
  // taban yükseklik devrede kalıp kartın altında BOŞ GRADYAN bırakıyordu —
  // ölçüldü: gsm/adres/e-posta yokken 780px PNG'nin son 175px'i, boş formda
  // 625px'in son 219px'i tamamen boş; aynı verinin HTML kartı ise 581/437px'e
  // iniyordu, yani PNG ile paylaşılan kart HTML'den farklı görünüyordu.
  const H = contentY;

  // 2x resolution for sharp/Retina output
  const SCALE = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  drawGradientBg(ctx, W, H, RADIUS);

  // ── Circular avatar — SADECE profil fotoğrafı (logo fallback'i kaldırıldı) ──
  if (hasPhoto) {
    try {
      const avatarImg = await loadImage(profileBase64);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(W / 2, logoCY, logoRadius + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, logoCY, logoRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(W / 2 - logoRadius, logoCY - logoRadius, logoRadius * 2, logoRadius * 2);
      // Profil fotoğrafı: daireyi tamamen kaplar (cover)
      const aspect = avatarImg.width / avatarImg.height;
      let drawW, drawH;
      if (aspect > 1) { drawH = logoRadius * 2; drawW = drawH * aspect; }
      else { drawW = logoRadius * 2; drawH = drawW / aspect; }
      ctx.drawImage(avatarImg, W / 2 - drawW / 2, logoCY - drawH / 2, drawW, drawH);
      ctx.restore();
    } catch (e) { /* skip avatar */ }
  }

  // ── Name + LinkedIn icon ──
  let y = nameBaselineY;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Plus Jakarta Sans", "Inter", Arial, sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 6;
  const hasLinkedin = !!cardLinkedin(form, stg) && !!form.linkedinPersonal;
  const liIconSize = 18;
  const liGap = 6;
  // AD SIĞDIRILIR (LinkedIn ikonunun payı da düşülerek). Eskiden ham ölçülüp
  // ortalanıyordu: 51 karakterlik ad 700px'e çıkıp 420px tuvalde İKİ YANDAN
  // kesiliyor, LinkedIn ikonu x=554'te tuvalin dışına düşüyordu (denetim ölçümü).
  // Ünvan/şirket satırları zaten wrapText'ten geçiyordu, yalnız ad geçmiyordu.
  const nameAvail = W - PAD * 2 - (hasLinkedin ? liGap + liIconSize : 0);
  const { nameFS, nameText } = fitName(ctx, fullName, nameAvail, 24, 15);
  ctx.font = `bold ${nameFS}px "Plus Jakarta Sans", "Inter", Arial, sans-serif`;
  const nameW = ctx.measureText(nameText).width;
  const totalNameW = nameW + (hasLinkedin ? liGap + liIconSize : 0);
  const nameX = (W - totalNameW) / 2 + nameW / 2;
  ctx.fillText(nameText, nameX, y);
  ctx.shadowBlur = 0;

  // LinkedIn icon next to name (canvas — not clickable but visual)
  if (hasLinkedin) {
    const liX = nameX + nameW / 2 + liGap;
    const liY = y - liIconSize + 3;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const p = new Path2D('M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z');
    ctx.translate(liX, liY);
    ctx.scale(liIconSize / 24, liIconSize / 24);
    ctx.fill(p);
    ctx.restore();
  }

  // ── Ünvan: İSMİN HEMEN ALTINDA (kullanıcı isteği), bir tık büyük punto ──
  if (titleLines.length) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = TITLE_FS + 'px "Inter", Arial, sans-serif';
    titleLines.forEach((line, i) => {
      y += (i === 0 ? 23 : TITLE_LH);
      ctx.fillText(line, W / 2, y);
    });
  }

  // ── Şirket resmi ünvanı (ünvandan sonra) ──
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '600 16px "Inter", Arial, sans-serif';
  companyLines.forEach((line, i) => {
    y += (i === 0 ? 24 : COMPANY_LH);
    ctx.fillText(line, W / 2, y);
  });

  // ── QR code ──
  const qrPad = 6;
  const qrContainerX = (W - qrContainerSize) / 2;
  const qrContainerY = y + 25;

  // Glass QR container (logo bandı varsa bant kadar uzun)
  ctx.save();
  ctx.shadowColor = 'rgba(30, 58, 95, 0.18)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  roundRect(ctx, qrContainerX, qrContainerY, qrContainerSize, qrContainerH, 18);
  ctx.fill();
  ctx.restore();
  // Glass border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  roundRect(ctx, qrContainerX, qrContainerY, qrContainerSize, qrContainerH, 18);
  ctx.stroke();

  const qrDrawSize = qrContainerSize - qrPad * 2;

  // ── Logo bandı: çerçevenin içinde, QR'ın üstünde, ortalanmış ──
  // Yüksekliğe göre ölçeklenir (logolar yatay formatta); QR'ın iç genişliğini
  // aşarsa genişliğe göre sınırlanır.
  if (qrBandH && cardLogo) {
    try {
      const qrLogo = await loadImage(cardLogo);
      let lgH = QR_LOGO_H, lgW = lgH * (qrLogo.width / qrLogo.height);
      if (lgW > qrDrawSize) { lgW = qrDrawSize; lgH = lgW * (qrLogo.height / qrLogo.width); }
      ctx.drawImage(
        qrLogo,
        qrContainerX + (qrContainerSize - lgW) / 2 + qrLogoDx, // TYRO'de optik sola kaydırma
        qrContainerY + qrPad + (QR_LOGO_H - lgH) / 2,
        lgW, lgH
      );
    } catch (_) { /* logo yüklenemedi → bant boş kalır */ }
  }

  ctx.drawImage(qrCanvas, qrContainerX + qrPad, qrContainerY + qrPad + qrBandH, qrDrawSize, qrDrawSize);

  // ── Glass info panel (flows after QR, not anchored to bottom) ──
  const panelX = (W - panelW) / 2;
  const panelY = qrContainerY + qrContainerH + 25;

  if (panelH) {
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    roundRect(ctx, panelX, panelY, panelW, panelH, 12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, panelX, panelY, panelW, panelH, 12);
    ctx.stroke();
  }

  // Contact row icon paths (matching React preview & HTML)
  const iconPaths = {
    GSM: (ctx, x, y, s) => { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + s*0.21, y + s*0.08, s*0.58, s*0.83); ctx.beginPath(); ctx.arc(x + s/2, y + s*0.75, 0.5, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill(); },
    Email: (ctx, x, y, s) => { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + s*0.08, y + s*0.17, s*0.83, s*0.67); ctx.beginPath(); ctx.moveTo(x + s*0.08, y + s*0.17); ctx.lineTo(x + s/2, y + s*0.54); ctx.lineTo(x + s*0.92, y + s*0.17); ctx.stroke(); },
    Address: (ctx, x, y, s) => { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + s/2, y + s*0.42, s*0.3, 0, Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s/2, y + s*0.42, s*0.12, 0, Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + s/2, y + s*0.72); ctx.lineTo(x + s/2, y + s*0.92); ctx.stroke(); },
    Location: (ctx, x, y, s) => { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + s/2, y + s*0.42, s*0.3, 0, Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s/2, y + s*0.42, s*0.12, 0, Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + s/2, y + s*0.72); ctx.lineTo(x + s/2, y + s*0.92); ctx.stroke(); },
  };

  let rowY = panelY + 6;
  const iconBoxSize = 26;
  const textOffsetX = 16 + iconBoxSize + 10; // icon box + gap
  const maxTextW = panelW - textOffsetX - 16;
  contacts.forEach((contact, i) => {
    const isAddress = contact.key === 'Address' || contact.key === 'Location';
    const thisRowH = isAddress ? rowHWrap : rowH;

    // Icon background box
    const ibx = panelX + 16;
    const iby = rowY + (isAddress ? 10 : (thisRowH - iconBoxSize) / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    roundRect(ctx, ibx, iby, iconBoxSize, iconBoxSize, 6);
    ctx.fill();
    // Draw icon
    const drawIcon = iconPaths[contact.key];
    if (drawIcon) {
      ctx.save();
      drawIcon(ctx, ibx + 3, iby + 3, iconBoxSize - 6);
      ctx.restore();
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = '11px "Inter", Arial, sans-serif';
    ctx.fillText(contact.label, panelX + textOffsetX, rowY + 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = '13px "Inter", Arial, sans-serif';
    if (isAddress) {
      // Wrap address text into multiple lines
      const lines = wrapText(ctx, contact.value, maxTextW);
      lines.forEach((line, li) => {
        ctx.fillText(line, panelX + textOffsetX, rowY + 36 + li * 16);
      });
    } else {
      const val = ellipsize(ctx, contact.value, maxTextW);
      ctx.fillText(val, panelX + textOffsetX, rowY + 36);
    }

    rowY += thisRowH;

    if (i < contacts.length - 1) {
      ctx.strokeStyle = 'rgba(231,233,235,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panelX + 16, rowY);
      ctx.lineTo(panelX + panelW - 16, rowY);
      ctx.stroke();
    }
  });

  return canvas;
}

const QrCanvasView = memo(({ source, size, sizeH, trigger }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !source) return;
    const el = ref.current;
    el.width = source.width;
    el.height = source.height;
    el.getContext('2d').drawImage(source, 0, 0);
  }, [source, trigger]);
  return <canvas ref={ref} style={{ display: 'block', width: size, height: sizeH || size }} />;
});

// V2 önizlemesi: indirilecek PNG'nin AYNISI gösterilir → önizleme/çıktı ayrışması olmaz.
// Tıklanabilirlik hotspot'larla üstüne bindirilir; koordinatlar v2Layout'tan gelir.
// ─── KARTVİZİT TASARIM SEKMELERİ ───────────────────────────────────────────
// SIRA VE ETİKETLER kullanıcı isteğiyle yeniden düzenlendi:
//   gösterilen V1 = QR + altında 4 İKON            (dahili 'v4')
//   gösterilen V2 = müşteri PDF tasarımı            (dahili 'v2')
//   gösterilen V3 = QR bantta, çerçeveli            (dahili 'v3')
//   gösterilen V4 = ilk cam/gradyan tasarım, EN SON (dahili 'v1')
// DAHİLİ ADLAR GÖSTERİLEN NUMARAYLA ARTIK ÖRTÜŞMÜYOR — bu bilinçli: sıra iki kez
// değişti, dahili anahtarları her seferinde yeniden adlandırmak çizim/HTML/düzen
// yollarında sessiz hata riski taşıyordu. Tabloya bakmadan numara VARSAYMAYIN.
// DAHİLİ ANAHTARLAR BİLİNÇLİ OLARAK DEĞİŞTİRİLMEDİ: çizim/HTML yolları ve düzen
// mantığı ('v1' → drawBusinessCard, diğerleri → drawBusinessCardV2 + variant)
// bunlara bağlı; yalnız GÖSTERİM sırası/etiketi değişti. Varsayılan artık ilk
// sekme, yani müşteri tasarımı.
const CARD_TABS = [
  // KULLANICI İSTEĞİ: gösterilen V1 ile V2 TAKAS EDİLDİ → müşteri PDF tasarımı
  // artık "V1" ve VARSAYILAN; 4 ikonlu tasarım "V2" oldu. Dahili anahtarlar
  // (v2/v4/v3/v1) yine DEĞİŞMEDİ — çizim/HTML/düzen yolları bunlara bağlı.
  // Kullanıcı isteği: "v2 tasarımı v1 yap ve onu varsayılan yap" → 4 ikonlu tasarım
  // (dahili 'v4') artık gösterilen V1 ve VARSAYILAN; müşteri PDF tasarımı V2'ye geçti.
  { id: 'v4', labelKey: 'bcV1' },   // QR + altında 4 ikon ← VARSAYILAN, tek açık sürüm
  // ⏸ locked: GEÇİCİ olarak yalnız CARD_UNLOCK_EMAILS'teki hesaplara açık
  //    (kullanıcı isteği: "sadece bana kilitleme, bende açık olsun").
  //    Herkese açmak için TEK İŞ: `locked: true` ifadelerini silmek.
  { id: 'v2', labelKey: 'bcV2', locked: true },   // müşteri PDF tasarımı
  { id: 'v3', labelKey: 'bcV3', locked: true },   // QR bantta, çerçeveli
  // hidden: true → SEKMEDE görünmez ama kayıt ve kod yolu olduğu gibi durur
  // (designs.js'teki 'corporate' ile aynı desen). Kullanıcı isteğiyle gizlendi.
  // Tekrar açmak için TEK İŞ: aşağıdaki `hidden: true` ifadesini silmek — çizim
  // (drawBusinessCard), PNG/HTML dışa aktarımı ve çevirileri (bcV4) yerinde.
  { id: 'v1', labelKey: 'bcV4', hidden: true },   // ilk cam/gradyan tasarım
];

// Sekme çubuğunda gösterilecekler. Varsayılan sekme de buradan seçilir; gizli bir
// kayıt asla varsayılan olmasın diye CARD_TABS[0] değil, hesaba göre süzülmüş
// listenin ilk elemanı (visibleTabs[0]) kullanılır.
// İKİ AYRI GİZLEME TÜRÜ, karıştırılmamalı:
//   hidden → KALICI gizli (eski cam/gradyan tasarım; kimseye gösterilmiyor)
//   locked → GEÇİCİ kapalı; yalnız aşağıdaki hesaplara açık
// Kilit açık olan hesaplar (tam eşleşme, küçük harfe indirilerek karşılaştırılır).
// MSAL hesabının UPN'i kullanılıyor (msalAccount.username) — formdaki e-posta alanı
// DEĞİL: o alan elle değiştirilebiliyor, kilidi oradan aşmak mümkün olurdu.
const CARD_UNLOCK_EMAILS = [];

const cardTabsFor = (unlocked) =>
  CARD_TABS.filter(t => !t.hidden && (unlocked || !t.locked));

// Seçilecek tek sürüm kaldıysa combobox KİLİTLİ: açılmaz, chevron gösterilmez ve
// tıklama imleci verilmez. Bayrak SAYIDAN türetiliyor → kayıtlar açıldığında elle
// bir şey değiştirmek gerekmez, kilit kendiliğinden kalkar.
const isCardUnlocked = (msalAccount) =>
  CARD_UNLOCK_EMAILS.includes(((msalAccount && msalAccount.username) || '').trim().toLowerCase());

const CardCanvasView = memo(({ source, trigger }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !source) return;
    const el = ref.current;
    el.width = source.width;
    el.height = source.height;
    el.getContext('2d').drawImage(source, 0, 0);
  }, [source, trigger]);
  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: 'auto' }} />;
});

/** V2'nin ihtiyaç duyduğu alanlar — V1'in kullandığı AYNI kaynaklardan türetilir. */
export function v2Data(form, stg, office, company, L, lang) {
  const addressText = (office && office.address && office.city)
    ? office.address + ', ' + office.city
    : (office && office.city) || '';
  return {
    fullName: formatName(form),
    companyName: getCompanyName(company, stg, lang),
    titleParts: [form.titleEN, form.titleTR].filter(Boolean),
    gsm: cardPhone(form, office, stg),
    email: cardEmail(form, stg),
    addressText,
    // V4 ikon satirindaki LinkedIn: kisisel tanimliysa o, degilse SIRKETIN
    // (imza ureticilerindeki kuralin aynisi: genSigNavyV4 satir 186).
    linkedinUrl: cardLinkedin(form, stg),
  };
}

// ── KARTTA GÖSTERİLECEK TELEFON (tek kaynak) ──
// Normalde kişinin GSM'i. GSM gizlenmişse (stg.showGsm === false) yerine ofisin SABİT
// HATTI kullanılır; sabit hat da yoksa BOŞ döner → telefon ikonu çizilmez, tel: bağlantısı
// kurulmaz ve QR/vCard'a telefon girmez (kullanıcı isteği).
// Tek yerde olması şart: aynı değer tuval, HTML dışa aktarımı ve tıklama alanlarında
// kullanılıyor; ayrı ayrı hesaplanırsa sessizce ayrışırlar (bu dosyada daha önce yaşandı).
// Kartta gösterilecek E-POSTA: gizlenmişse boş → mail ikonu, "Randevu Talep Et"
// düğmesi ve QR/vCard'daki EMAIL hiç oluşmaz (GSM'deki kuralın aynısı).
function cardEmail(form, stg) {
  if (stg && stg.showEmail === false) return '';
  return (form && form.email) || '';
}

// Kartta gösterilecek LinkedIn: gizlenmişse boş → ad yanındaki ikon ve QR altındaki
// 4. ikon çizilmez. Bayrak stg.showLinkedin (Ayarlar'daki anahtarla AYNI).
function cardLinkedin(form, stg) {
  if (stg && stg.showLinkedin === false) return '';
  return (form && form.linkedinPersonal && form.linkedinPersonal.trim())
    || (stg && stg.social && stg.social.linkedin) || '';
}

function cardPhone(form, office, stg) {
  if (stg && stg.showGsm === false) return (office && office.sdn) ? office.sdn : '';
  return form && form.gsm ? formatGSM(form.gsm) : '';
}

const BG_GRADIENT = 'linear-gradient(160deg, #b8d4de 0%, #6bbac8 25%, #4da8be 45%, #3a9ab0 65%, #2a7fa0 100%)';

function contactHref(key, value) {
  if (key === 'GSM' || key === 'Tel') return 'tel:' + value.replace(/\s/g, '');
  if (key === 'Email') return 'mailto:' + value;
  if (key === 'Web') return value.startsWith('http') ? value : 'https://' + value;
  if (key === 'Address' || key === 'Location') {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(value);
  }
  return null;
}

/**
 * Önizlemeyi kalan alana SIĞDIRIR (kullanıcı isteği: "ekran açıldığında tek seferde
 * sığsın, herşeyi tek bakışta görelim, hangi ekran olursa olsun").
 *
 * Neden transform: kart hem V1'de DOM ağacı hem V2'de tuval; ikisini de aynı şekilde
 * küçültmenin tek yolu ölçek dönüşümü. transform LAYOUT'u etkilemediği için
 * offsetWidth/offsetHeight ÖLÇEKSİZ doğal boyutu verir → geri besleme döngüsü olmaz.
 * transformOrigin 'top center' → kart üstten ve ortadan küçülür, kırpılma olmaz.
 */
function useFitScale(deps) {
  const boxRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const box = boxRef.current, inner = innerRef.current;
    if (!box || !inner) return;
    const calc = () => {
      const bw = box.clientWidth, bh = box.clientHeight;
      const iw = inner.offsetWidth, ih = inner.offsetHeight;   // ölçeksiz doğal boyut
      if (!iw || !ih || !bh || !bw) return;
      const next = Math.min(1, bw / iw, bh / ih);
      setScale(prev => (Math.abs(prev - next) > 0.002 ? next : prev));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(box); ro.observe(inner);
    window.addEventListener('resize', calc);
    return () => { ro.disconnect(); window.removeEventListener('resize', calc); };
  }, deps);
  return { boxRef, innerRef, scale };
}

// Alt bar: tek parça BUTON GRUBU (kullanıcı isteği). Segment görünümü uygulamanın
// diğer kontrolleriyle (ExportSection, V1/V2 sekmeleri) aynı dilde.
const btnGroupItem = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.28rem',
  border: 'none', borderRadius: 9,
  padding: '0.5rem 0.25rem',
  fontFamily: 'Inter,sans-serif', fontSize: '0.66rem', fontWeight: 600,
  letterSpacing: '-0.1px',
  color: C.textM, cursor: 'pointer',
  background: 'transparent',
  transition: 'all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
  flex: '1 1 0', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden',
};

const btnGlass = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
  border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: 14, padding: '0.55rem 0.5rem',
  fontFamily: 'Inter,sans-serif', fontSize: '0.65rem', fontWeight: 600,
  letterSpacing: '0.01em',
  color: '#ffffff', cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  flex: 1, minWidth: 0, whiteSpace: 'nowrap',
  background: 'rgba(255,255,255,0.12)',
  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2)',
};

/** Generate QR SVG with modern gradient dots, gold finder centers, and logo overlay */
function generateQrSvg(vcard) {
  // Merkez logosu yok → 'M' seviyesi yeterli; daha az modül = daha büyük/okunur kareler.
  // HATA DÜZELTME 'M' — 'L'ye çekmek HATA OLDU ve geri alındı. Gerekçem ("ekranda
  // gösterilen kod hasar görmez") eksikti: bu çiziciler modülleri AYRIK YUVARLAK
  // NOKTA olarak basıyor (yarıçap hücrenin 0.42'si) ve üstelik hizalama deseni
  // konumları yanlış hesaplanıyordu → veri zaten bozuktu. 'M' o bozulmayı telafi
  // ediyordu; 'L' payı bitirip kodu tamamen okunmaz yaptı. Hizalama hatası artık
  // düzeltildi ama süslü nokta stili durduğu için pay bırakmak DOĞRU olan.
  const qrData = QRCode.create(vcard, { errorCorrectionLevel: 'M' });
  const modules = qrData.modules;
  const moduleCount = modules.size;
  const svgSize = 260;
  // Margin 4 (was 2) — improves scanner detection in low-light / oblique angles
  const margin = 4;
  const totalModules = moduleCount + margin * 2;
  const cellSize = svgSize / totalModules;
  // Nokta yarıçapı 0.42 → 0.50: 0.42'de daireler komşularına DEĞMİYOR, aralarında
  // beyaz boşluk kalıyordu. 166px'de modül ~2px olduğu için nokta ~1.7px'e düşüp
  // kod cılızlaşıyor ve tarayıcı ikilileştirmede modülleri ayırt edemiyordu.
  // 0.50 = hücreye tam içten teğet daire → komşular birleşir, yuvarlak estetik korunur.
  const dotR = cellSize * 0.50;
  const finderR = (cellSize * 0.8).toFixed(2);

  function isFinderPattern(row, col) {
    if (row < 7 && col < 7) return true;
    if (row < 7 && col >= moduleCount - 7) return true;
    if (row >= moduleCount - 7 && col < 7) return true;
    return false;
  }

  // Alignment pattern detection
  // Hizalama merkezleri ORTAK ve DOĞRULANMIŞ kaynaktan gelir (utils/qrAlignment.js).
  // Eskiden buradaki formül YANLIŞ konum üretiyordu ve süslü hizalama bloğu gerçek
  // VERİ modüllerinin üzerine basılıyordu → kod bozuluyordu. Bkz. o dosyanın notu.
  const _isAlignCenter = makeAlignmentTest(moduleCount);
  function isAlignmentCenter(r, c) { return _isAlignCenter(r, c); }

  function isAlignmentArea(r, c) {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (isAlignmentCenter(r - dr, c - dc)) return true;
      }
    }
    return false;
  }

  function finderPatternSvg(startRow, startCol) {
    const ox = ((startCol + margin) * cellSize).toFixed(2);
    const oy = ((startRow + margin) * cellSize).toFixed(2);
    const outer = (7 * cellSize).toFixed(2);
    const mid = (5 * cellSize).toFixed(2);
    const inner = (3 * cellSize).toFixed(2);
    const midOff = cellSize.toFixed(2);
    const innerOff = (2 * cellSize).toFixed(2);
    const r1 = finderR;
    const r2 = (cellSize * 0.5).toFixed(2);
    const r3 = (cellSize * 0.35).toFixed(2);
    return '<rect x="' + ox + '" y="' + oy + '" width="' + outer + '" height="' + outer + '" rx="' + r1 + '" fill="url(#navyGrad)" filter="url(#glow)"/>' +
      '<rect x="' + (parseFloat(ox) + parseFloat(midOff)).toFixed(2) + '" y="' + (parseFloat(oy) + parseFloat(midOff)).toFixed(2) + '" width="' + mid + '" height="' + mid + '" rx="' + r2 + '" fill="#ffffff"/>' +
      '<rect x="' + (parseFloat(ox) + parseFloat(innerOff)).toFixed(2) + '" y="' + (parseFloat(oy) + parseFloat(innerOff)).toFixed(2) + '" width="' + inner + '" height="' + inner + '" rx="' + r3 + '" fill="' + QR_ACCENT + '"/>';
  }

  // Alignment pattern SVGs
  let alignSvg = '';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isAlignmentCenter(row, col)) {
        const ox = ((col - 2 + margin) * cellSize).toFixed(2);
        const oy = ((row - 2 + margin) * cellSize).toFixed(2);
        const s = (5 * cellSize).toFixed(2);
        const ar = (cellSize * 0.6).toFixed(2);
        const ar2 = (cellSize * 0.3).toFixed(2);
        const innerS = (3 * cellSize).toFixed(2);
        const innerOff = cellSize.toFixed(2);
        const cx = ((col + margin + 0.5) * cellSize).toFixed(2);
        const cy = ((row + margin + 0.5) * cellSize).toFixed(2);
        alignSvg += '<rect x="' + ox + '" y="' + oy + '" width="' + s + '" height="' + s + '" rx="' + ar + '" fill="url(#navyGrad)"/>';
        alignSvg += '<rect x="' + (parseFloat(ox) + parseFloat(innerOff)).toFixed(2) + '" y="' + (parseFloat(oy) + parseFloat(innerOff)).toFixed(2) + '" width="' + innerS + '" height="' + innerS + '" rx="' + ar2 + '" fill="#ffffff"/>';
        alignSvg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (cellSize * 0.5).toFixed(2) + '" fill="' + QR_ACCENT + '"/>';
      }
    }
  }

  let dots = '';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isFinderPattern(row, col)) continue;
      if (isAlignmentArea(row, col)) continue;
      if (modules.get(row, col)) {
        const cx = (col + margin + 0.5) * cellSize;
        const cy = (row + margin + 0.5) * cellSize;
        dots += '<circle cx="' + cx.toFixed(2) + '" cy="' + cy.toFixed(2) + '" r="' + dotR.toFixed(2) + '" fill="url(#navyGrad)"/>';
      }
    }
  }

  // SVG with gradient defs and glow filter
  let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + svgSize + ' ' + svgSize + '" width="' + svgSize + '" height="' + svgSize + '">' +
    '<defs>' +
    '<linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="' + NAVY + '"/>' +
    '<stop offset="50%" stop-color="#1a4a6e"/>' +
    '<stop offset="100%" stop-color="#15607a"/>' +
    '</linearGradient>' +
    '<filter id="glow"><feGaussianBlur stdDeviation="' + (cellSize * 0.4).toFixed(1) + '" result="blur"/>' +
    '<feFlood flood-color="' + NAVY + '" flood-opacity="0.2"/>' +
    '<feComposite in2="blur" operator="in"/>' +
    '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
    '</defs>' +
    // rx aynı kural: sessiz bölgeyi aşmasın (bkz. tuval çizicisindeki not)
    '<rect width="' + svgSize + '" height="' + svgSize + '" rx="'
      + Math.round(Math.min(svgSize * 0.06, cellSize * 2)) + '" fill="#ffffff"/>' +
    finderPatternSvg(0, 0) +
    finderPatternSvg(0, moduleCount - 7) +
    finderPatternSvg(moduleCount - 7, 0) +
    alignSvg +
    dots;

  svg += '</svg>';
  return svg;
}

// Kartvizitteki şirket satırı İMZADAKİ ile aynı mantıkla çalışır (kullanıcı isteği):
// resmi ticari ünvan (companyDirectory → effectiveStg.companyLegalName) varsa o yazılır,
// yoksa kısa şirket adına düşer. Ünvan tüm dillerde aynıdır (resmi ad çevrilmez).
function getCompanyName(company, stg, lang) {
  if (stg && stg.companyLegalName) return stg.companyLegalName;
  if (!company) return (stg && stg.companyName) || 'TYRO Tech';
  return (lang !== 'tr' && company.nameEN) ? company.nameEN : company.name;
}

const BusinessCardModal = memo(({ open, onClose, form, office, stg, company, toast, L, lang, profilePhoto, msalAccount }) => {
  const qrCanvasRef = useRef(null);
  const cardRef = useRef(null);
  // ÖNİZLEMEDE GÖSTERİLEN tuval, dışa aktarılandan AYRI olabilir: fotoğrafı olmayan
  // kullanıcıda önizleme profil dairesinin yerini ayırıp beyaz bir yükleme dairesi
  // gösterir (kullanıcı isteği), indirilen PNG/Dijital Kart ise fotoğrafsız ve derli
  // toplu kalır. PNG indirme/kopyalama/paylaşma HEP cardRef'i kullanır.
  const previewCardRef = useRef(null);
  const profileInputRef = useRef(null);

  const [copyOk, setCopyOk] = useState(false);
  const [qrReady, setQrReady] = useState(0);
  const [profileBase64, setProfileBase64] = useState(profilePhoto || null);
  // Kartvizit tasarım sürümü. DAHİLİ anahtarlar GÖSTERİLEN numaralarla AYNI DEĞİL —
  // tek doğru kaynak CARD_TABS: gösterilen V1='v2', V2='v4', V3='v3', V4='v1'
  // (V1↔V2 kullanıcı isteğiyle takas edildi). Varsayılan = görünen ilk kayıt =
  // gösterilen V1 = dahili 'v2' (müşteri PDF tasarımı).
  // Kilit hesaba göre: listelenen sürümler ve combobox'ın açılıp açılmayacağı buradan
  // türetiliyor. Giriş yapılmamışsa (msalAccount yok) KİLİTLİ kalır — güvenli varsayılan.
  const unlocked = isCardUnlocked(msalAccount);
  const visibleTabs = useMemo(() => cardTabsFor(unlocked), [unlocked]);
  const cardLocked = visibleTabs.length < 2;
  const [variant, setVariant] = useState(visibleTabs[0].id);
  // Sürüm seçimi artık combobox (kullanıcı isteği: "sekme olmasın seçimli combobox olsun")
  const [tabOpen, setTabOpen] = useState(false);
  const { btnRef: tabBtnRef, pos: tabPos } = useMenuPos(tabOpen, { maxWidth: 260 });
  const curTab = visibleTabs.find(t => t.id === variant) || visibleTabs[0];
  const [cardReady, setCardReady] = useState(0);
  // V2'nin düzeni + tıklama alanları (önizlemedeki bağlantılar bunlardan konumlanır)
  const [v2Meta, setV2Meta] = useState(null);
  // Önizleme kalan alana sığsın (tek bakışta tüm kart + butonlar)
  const { boxRef, innerRef, scale } = useFitScale([open, variant, cardReady, profileBase64, L]);

  // Sync Graph photo when it becomes available
  useEffect(() => {
    if (profilePhoto && !profileBase64) setProfileBase64(profilePhoto);
  }, [profilePhoto]);

  useEffect(() => {
    if (!open) return;
    setCopyOk(false);
    setQrReady(0);

    const vcard = generateVCard(form, office, stg, company, lang);

    drawCardQr(vcard, 360).then(qrCanvas => {
      qrCanvasRef.current = qrCanvas;
      setQrReady(r => r + 1);

      const done = (card, meta) => {
        cardRef.current = card;
        previewCardRef.current = card;
        setV2Meta(meta || null);
        setCardReady(r => r + 1);
      };

      if (variant !== 'v1') {
        // V2 ve V3 AYNI üreticiyi kullanır; fark yalnız YERLEŞİMDE (variant)
        const args = {
          qrCanvas, form, stg, office, company, profileBase64, L, lang, variant,
          ...v2Data(form, stg, office, company, L, lang),
        };
        // Fotoğraf yoksa İKİ kart çizilir (QR tuvali paylaşıldığı için ek maliyet küçük):
        //   • dışa aktarım → fotoğrafsız, kısa kart (cardRef: PNG/kopyala/paylaş)
        //   • önizleme     → profil dairesinin yeri AYRILMIŞ + beyaz yükleme dairesi
        // Fotoğraf varsa ikisi aynı olduğu için tek çizim yapılır.
        const needCta = !profileBase64;
        Promise.all([
          drawBusinessCardV2(args),
          needCta ? drawBusinessCardV2({ ...args, photoCta: true }) : Promise.resolve(null),
        ]).then(([exp, prev]) => {
          cardRef.current = exp.canvas;
          const shown = prev || exp;
          previewCardRef.current = shown.canvas;
          setV2Meta({ hotspots: shown.hotspots, layout: shown.layout });
          setCardReady(r => r + 1);
        });
      } else {
        drawBusinessCard(qrCanvas, form, stg, office, company, profileBase64, L, lang)
          .then(card => done(card, null));
      }
    });
  }, [open, variant, form, office, stg, company, profileBase64, L, lang]);

  // ── DIŞA AKTARIM TUVALİ: saydam kenar payı + yumuşak gölge ──
  // Tuval zaten yuvarlak yola kırpılıyor (businessCardV2: roundRectPath + clip), yani
  // köşeler SAYDAM. Ama kartın kendisi beyaz olduğu için indirilen PNG beyaz zeminde
  // (Önizleme, Word, WhatsApp) KARE görünüyordu — ölçüldü: dört köşe de alfa 0, merkez
  // beyaz. Önizlemede rounding'i belli eden şey kabın gölgesi. Dışa aktarımda da aynısı
  // yapılıyor: kart, saydam payı olan daha büyük bir tuvale gölgeyle basılıyor. Gölge
  // görselin ALFA SİLUETİNDEN çizildiği için kendiliğinden yuvarlak.
  // Önizleme tuvaline DOKUNULMUYOR (previewCardRef ayrı) — yalnız indir/kopyala/paylaş.
  const exportCanvas = useCallback((src) => {
    if (!src) return null;
    const S = 2;                       // drawBusinessCardV2'deki SCALE ile aynı
    const PAD = 24 * S;
    const out = document.createElement('canvas');
    out.width = src.width + PAD * 2;
    out.height = src.height + PAD * 2;
    const c = out.getContext('2d');
    c.shadowColor = 'rgba(30,58,95,0.20)';
    c.shadowBlur = 20 * S;
    c.shadowOffsetY = 6 * S;
    c.drawImage(src, PAD, PAD);
    return out;
  }, []);

  const handleDownload = useCallback(() => {
    const card = exportCanvas(cardRef.current);
    if (!card) return;
    const link = document.createElement('a');
    const name = [form.firstName, form.lastName].filter(Boolean).join('-') || 'card';
    link.download = name.toLowerCase() + '-business-card.png';
    link.href = card.toDataURL('image/png');
    link.click();
  }, [form, exportCanvas]);

  const handleCopy = useCallback(() => {
    const card = exportCanvas(cardRef.current);
    if (!card) return;
    try {
      const item = new ClipboardItem({
        'image/png': new Promise((resolve, reject) => {
          card.toBlob(blob => {
            if (blob) resolve(blob); else reject(new Error('toBlob failed'));
          }, 'image/png');
        }),
      });
      navigator.clipboard.write([item]).then(() => {
        setCopyOk(true);
        if (toast) toast(L.bcCopied);
        setTimeout(() => setCopyOk(false), 2500);
      }).catch(() => { if (toast) toast(L.bcCopyFail || 'Copy failed'); });
    } catch (e) { if (toast) toast(L.bcCopyUnsupported || 'Copy not supported'); }
  }, [toast, L, exportCanvas]);

  /** Share via Web Share API */
  const handleShare = useCallback(async () => {
    const card = exportCanvas(cardRef.current);
    if (!card) return;

    try {
      const blob = await new Promise(resolve => card.toBlob(resolve, 'image/png'));
      const name = formatName(form);
      const cardSuffix = L.bcCardSuffix || 'Business Card';
      const file = new File([blob], name + ' - ' + cardSuffix + '.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: name + ' - ' + cardSuffix,
          text: name + ' ' + (L.bcDigitalCardText || 'digital business card'),
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: name + ' - ' + cardSuffix,
          text: name + ' ' + (L.bcDigitalCardText || 'digital business card'),
        });
      } else {
        if (toast) toast(L.bcShareFail || 'Sharing not supported');
      }
    } catch (e) {
      if (e.name !== 'AbortError' && toast) toast(L.bcShareFail || 'Sharing not supported');
    }
  }, [form, toast, L]);

  /** Generate & download standalone interactive HTML business card */
  const handleHtmlDownload = useCallback(async () => {
    const vcard = generateVCard(form, office, stg, company, lang);

    // Tek dosyayı indiren ortak yardımcı (V1 ve V2 aynı adlandırmayı kullanır)
    const saveHtml = (htmlStr) => {
      const blob = new Blob([htmlStr], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cardSuffix = L.bcCardSuffix || 'Business Card';
      const fname = [titleCase(form.firstName), titleCase(form.lastName)].filter(Boolean).join(' ') || cardSuffix;
      a.download = fname + ' - ' + cardSuffix + '.html';
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    };

    // ── V2: müşteri tasarımı. Tuvaldeki AYNI v2Layout sayıları kullanılır, ama
    //    metin gerçek metin ve telefon/adres/randevu gerçek bağlantı olur. ──
    if (variant !== 'v1') {
      const d = v2Data(form, stg, office, company, L, lang);
      const meas = document.createElement('canvas').getContext('2d');
      const { titleLines, companyLines } = v2Content(meas, d);
      // Bayraklar TUVAL YOLUYLA AYNI YERDEN üretilir (v2LayoutInput) — elle
      // listelenince biri atlanıyordu: hasLinkedinUrl geçilmediği için dijital
      // kartta LinkedIn ikonu çıkmıyordu (önizlemede çıkıyordu).
      const lay = v2Layout(meas, v2LayoutInput({
        data: d, titleLines, companyLines,
        hasPhoto: !!profileBase64, hasLinkedin: !!cardLinkedin(form, stg) && !!form.linkedinPersonal, variant, L,
      }));
      let svgV2 = '';
      try { svgV2 = await generateQrSvg(vcard); } catch (e) { /* QR üretilemedi → boş */ }
      saveHtml(buildBusinessCardV2Html({
        stg, form, L, ...d, profileBase64, qrSvg: svgV2,
        cardLogo: stg.cardLogoBase64 || stg.logoBase64,
        layout: lay, titleLines, companyLines,
      }));
      return;
    }

    const bgDataUri = await getBgBase64();
    const fullName = formatName(form);
    const companyName = getCompanyName(company, stg, lang);
    // İki ünvan ayraçla değil ALT SATIRA (imza tasarımıyla aynı) — kullanıcı isteği
    const titleParts = [form.titleEN, form.titleTR].filter(Boolean);
    const hasTwoLines = titleParts.length > 0;

    // Build contact rows
    const rows = [];
    const ph = cardPhone(form, office, stg);
    if (ph) rows.push({ key: 'GSM', label: L.bcLabelGSM || 'Phone', value: ph, href: 'tel:' + ph.replace(/\s/g, '') });
    const em = cardEmail(form, stg);
    if (em) rows.push({ key: 'Email', label: L.bcLabelEmail || 'Email', value: em, href: 'mailto:' + em });
    if (office && office.address && office.city) {
      const addr = office.address + ', ' + office.city;
      rows.push({ key: 'Address', label: L.bcLabelAddress || 'Address', value: addr, href: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr) });
    } else if (office && office.city) {
      rows.push({ key: 'Location', label: L.bcLabelLocation || 'Location', value: office.city, href: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(office.city) });
    }

    // Generate QR SVG with centered logo
    let qrSvg = '';
    try {
      qrSvg = await generateQrSvg(vcard);
    } catch (e) { /* QR generation failed */ }

    // Avatar HTML — SADECE profil fotoğrafı varsa yuvarlak çizilir (kullanıcı isteği).
    // Fotoğraf yoksa yuvarlak hiç eklenmez; şirket logosu QR bandında görünüyor.
    const logoHtml = profileBase64
      ? '<div style="margin:28px auto 0;width:100px;height:100px;border-radius:50%;border:3px solid rgba(255,255,255,0.9);background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.15)">' +
        '<img src="' + profileBase64 + '" alt="Profile" style="width:100%;height:100%;object-fit:cover"/>' +
        '</div>'
      : '';
    // QR bandı logo yüksekliği: ana tyro logosu (oran < 3.5) bir tık küçük
    // ANA MARKA logosu (bkz. drawBusinessCard'daki not) — oran ondan hesaplanır
    const cardLogo = stg.cardLogoBase64 || stg.logoBase64;
    const cardLogoAspect = stg.cardLogoBase64
      ? (stg.cardLogoW && stg.cardLogoH ? stg.cardLogoW / stg.cardLogoH : 3.9)
      : (stg.logoW && stg.logoH ? stg.logoW / stg.logoH : 3.9);
    // Kademeler tuvaldekiyle aynı mantık, HTML kart 33/36 oranında küçük çizildiği için ölçekli
    const qrLogoH = (cardLogoAspect < 2.6) ? 48 : ((cardLogoAspect < 3.5) ? 33 : 40);
    // TYRO logosunda optik sola kaydırma (canvas'taki MAIN_LOGO_DX ile aynı fikir;
    // HTML kart 33/36 oranında küçük çizildiği için değer de o oranda ölçeklenir).
    const qrLogoShift = stg.cardLogoIsMain ? Math.round(4 * (qrLogoH / 36) * 10) / 10 : 0;

    // Subtitle HTML — company line 1 (clickable to website), titles line 2
    const websiteUrl = stg.website ? (stg.website.startsWith('http') ? stg.website : 'https://' + stg.website) : '';
    const companyHtml = websiteUrl
      ? '<a href="' + sanitizeUrl(websiteUrl) + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">' + escapeHtml(companyName) + '</a>'
      : escapeHtml(companyName);
    const hasAvatar = !!profileBase64;
    // Sıra: ad → ÜNVAN (ismin hemen altı) → şirket resmi ünvanı (kullanıcı isteği)
    const subtitleHtml =
      // Her ünvan kendi <div>'inde; ilki isimden 6px, ikincisi ilkine 2px mesafede.
      // escapeHtml: bu dosyada dışa aktarılan HTML'de kaçırma hiç yoktu (denetimde
      // görüldü) — dokunduğum satırda kapatıldı, kalan alanlar ayrı iş olarak duruyor.
      titleParts.map((t, i) => '<div class="subtitle2" style="margin-top:' + (i === 0 ? '6px' : '2px') + '">' + escapeHtml(t) + '</div>\n').join('') +
      '<div class="subtitle" style="margin-top:' + (hasTwoLines ? '8px' : '10px') + '">' + companyHtml + '</div>';

    // Contact row icon SVGs (keyed by internal key, not display label)
    const rowIcons = {
      GSM: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
      Email: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
      Address: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      Location: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    };

    // Contact rows HTML with icons
    const rowsHtml = rows.map((r, i) => {
      const divider = i < rows.length - 1 ? '<div style="height:1px;background:rgba(231,233,235,0.3)"></div>' : '';
      const icon = rowIcons[r.key] || '';
      const iconHtml = icon ? '<div style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,0.12)">' + icon + '</div>' : '';
      return '<a href="' + escapeHtml(r.href) + '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:12px;padding:10px 16px;text-decoration:none;transition:background 0.15s" onmouseover="this.style.background=\'rgba(255,255,255,0.12)\'" onmouseout="this.style.background=\'transparent\'">' +
        iconHtml +
        '<div style="flex:1;min-width:0">' +
        '<div style="font-size:10px;color:rgba(255,255,255,0.5);font-family:Inter,sans-serif;letter-spacing:0.4px;text-transform:uppercase">' + escapeHtml(r.label) + '</div>' +
        '<div style="font-size:13px;color:#fff;font-family:Inter,sans-serif;margin-top:2px;text-shadow:0 1px 3px rgba(0,0,0,0.1)">' + escapeHtml(r.value) + '</div>' +
        '</div>' +
        '</a>' + divider;
    }).join('');

    const html = '<!DOCTYPE html>\n<html lang="tr">\n<head>\n' +
      '<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
      '<meta name="apple-mobile-web-app-capable" content="yes">\n' +
      '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n' +
      '<meta name="mobile-web-app-capable" content="yes">\n' +
      '<title>' + escapeHtml(fullName) + ' - ' + (L.bcCardSuffix || 'Business Card') + '</title>\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet">\n' +
      '<style>\n' +
      '*{margin:0;padding:0;box-sizing:border-box}\n' +
      'html,body{min-height:100vh;font-family:Inter,system-ui,sans-serif}\n' +
      'body{display:flex;align-items:center;justify-content:center;' +
      // getBgBase64 hata durumunda '' dönüyor → ham yazılınca geçersiz
      // `background:url()` üretiliyordu; arka plan rengi zaten yedek.
      (bgDataUri ? 'background:url(' + bgDataUri + ') center/cover no-repeat fixed;' : '') +
      'background-color:#1e3a5f;padding:20px}\n' +
      '.card{width:100%;max-width:390px;position:relative;overflow:hidden;border-radius:20px;' +
      'background:linear-gradient(160deg,#b8d4de 0%,#6bbac8 25%,#4da8be 45%,#3a9ab0 65%,#2a7fa0 100%);' +
      'box-shadow:0 24px 48px rgba(0,0,0,0.3);padding:0 0 24px}\n' +
      '.wave{position:absolute;inset:0;pointer-events:none;' +
      'background:radial-gradient(ellipse at 35% 55%,rgba(180,215,80,0.25) 0%,rgba(60,190,190,0.08) 50%,transparent 80%)}\n' +
      '.name{text-align:center;font-family:"Plus Jakarta Sans",sans-serif;font-size:1.4rem;font-weight:700;' +
      'color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.15);position:relative;z-index:1}\n' +
      '.subtitle{text-align:center;font-size:0.92rem;font-weight:600;color:rgba(255,255,255,0.9);' +
      'font-family:Inter,sans-serif;margin-top:6px;position:relative;z-index:1}\n' +
      // Ünvan puntosu bir tık büyütüldü (0.78 → 0.86rem)
      '.subtitle2{text-align:center;font-size:0.86rem;color:rgba(255,255,255,0.85);' +
      'font-family:Inter,sans-serif;margin-top:3px;padding:0 20px;position:relative;z-index:1}\n' +
      // Logo bandı çerçevenin içinde, QR'ın üstünde → yükseklik sabit değil (auto)
      '.qr-wrap{margin:20px auto 0;width:200px;background:rgba(255,255,255,0.55);' +
      'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:18px;' +
      'box-shadow:0 8px 32px rgba(30,58,95,0.18),inset 0 1px 0 rgba(255,255,255,0.4);' +
      'border:1.5px solid rgba(255,255,255,0.5);' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'position:relative;z-index:1;padding:6px;box-sizing:border-box}\n' +
      '.qr-logo{display:block;width:auto;max-width:100%;margin:0 0 6px}\n' +
      '.qr-wrap svg{width:100%;height:auto;display:block}\n' +
      '.glass{margin:20px auto 0;width:calc(100% - 36px);background:rgba(255,255,255,0.28);' +
      'backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border-radius:12px;' +
      'padding:4px 0;position:relative;z-index:1}\n' +
      '.scan{display:flex;align-items:center;justify-content:center;gap:6px;text-align:center;color:rgba(255,255,255,0.5);font-size:0.7rem;' +
      'font-family:Inter,sans-serif;margin-top:20px;position:relative;z-index:1}\n' +
      '</style>\n</head>\n<body>\n' +
      '<div class="card">\n' +
      '<div class="wave"></div>\n' +
      logoHtml + '\n' +
      '<div class="name" style="margin-top:' + (hasAvatar ? '14px' : '36px') + ';display:flex;align-items:center;justify-content:center;gap:6px">' + escapeHtml(fullName) +
      // İsmin yanındaki LinkedIn rozeti de 'Gizle' anahtarına tabi (indirilen HTML kart).
      (stg.showLinkedin !== false && form.linkedinPersonal
        ? ' <a href="' + sanitizeUrl(form.linkedinPersonal) + '" target="_blank" rel="noopener" style="display:inline-flex;opacity:0.85"><svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>'
        : '') +
      '</div>\n' +
      subtitleHtml + '\n' +
      '<div class="qr-wrap">' +
        (cardLogo ? '<img class="qr-logo" src="' + cardLogo + '" alt="" style="height:' + qrLogoH + 'px' + (qrLogoShift ? ';position:relative;right:' + qrLogoShift + 'px' : '') + '" />' : '') +
        qrSvg +
      '</div>\n' +
      '<div class="glass">' + rowsHtml + '</div>\n' +
      '<div class="scan"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> ' + (L.bcScan || 'Taratarak rehbere ekleyin') + '</div>\n' +
      '</div>\n' +
      '</body>\n</html>';

    saveHtml(html);
  }, [variant, form, office, stg, company, L, lang, profileBase64]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const fullName = formatName(form);
  const companyName = getCompanyName(company, stg, lang);
  // İki ünvan ayraçla değil ALT SATIRA (imza tasarımıyla aynı) — kullanıcı isteği
  const titleParts = [form.titleEN, form.titleTR].filter(Boolean);
  const hasTwoLines = titleParts.length > 0;

  // Contact info rows (key for icon matching, label for display)
  const contactRows = [];
  const phoneVal2 = cardPhone(form, office, stg);
  if (phoneVal2) contactRows.push({ key: 'GSM', label: L.bcLabelGSM || 'Phone', value: phoneVal2 });
  const emailVal2 = cardEmail(form, stg);
  if (emailVal2) contactRows.push({ key: 'Email', label: L.bcLabelEmail || 'Email', value: emailVal2 });
  if (office && office.address && office.city) {
    contactRows.push({ key: 'Address', label: L.bcLabelAddress || 'Address', value: office.address + ', ' + office.city });
  } else if (office && office.city) {
    contactRows.push({ key: 'Location', label: L.bcLabelLocation || 'Location', value: office.city });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(30,58,95,0.35)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.25s ease',
        padding: '1rem',
      }}
    >
      <div
        className="bc-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: `1px solid ${C.borderSub}`,
          boxShadow: '0 24px 48px rgba(30,58,95,0.18), 0 8px 16px rgba(30,58,95,0.08)',
          padding: '1.5rem 1.5rem 0',
          width: '100%', maxWidth: 420,
          textAlign: 'center',
          position: 'relative',
          animation: 'slideInUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          maxHeight: '92vh',
          // Flex column so footer can stick at bottom while content scrolls
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Hidden profile photo input */}
        <input
          ref={profileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => setProfileBase64(ev.target.result);
            reader.readAsDataURL(file);
            e.target.value = '';
          }}
        />

        {/* Scrollable content area — actions footer below stays visible */}
        <div className="bc-scroll" style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>

        {/* ── BAŞLIK SATIRI: tasarım sekmeleri + kapatma ──
            Kapatma çarpısı eskiden position:absolute (top:12,right:12) idi ve sekme
            şeridinin SAĞ UCUNUN ÜSTÜNE biniyordu (kullanıcı bildirimi). Artık aynı
            flex satırında duruyor: çakışma yapısal olarak imkânsız ve dikeyde
            fazladan yer de harcamıyor. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.6rem', flex: '0 0 auto' }}>
        {/* SÜRÜM SEÇİMİ (combobox). Menü portal ile document.body'ye basılıyor: modal
            (zIndex 9999) ve cam kartların backdrop-filter'ı yüzünden aksi hâlde ya
            kırpılır ya yanlış konumlanır — gerekçeler hooks/useMenuPos.js'te.
            KİLİTLİYKEN HİÇ ÇİZİLMEZ (kullanıcı isteği: "combobox kaldır"): seçilecek
            tek sürüm varken devre dışı bir kutu göstermek yerine kontrol tamamen
            kalkıyor. Kilidi açık hesapta (CARD_UNLOCK_EMAILS) görünmeye devam eder. */}
        {!cardLocked && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            ref={tabBtnRef}
            onClick={() => { if (!cardLocked) setTabOpen(o => !o); }}
            disabled={cardLocked}
            title={L.bcVersionSelect || L.designSelect}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 0.6rem',
              cursor: cardLocked ? 'default' : 'pointer',
              background: '#fff', borderRadius: 11,
              border: `1px solid ${tabOpen ? C.primary + '40' : C.borderSub}`,
              boxShadow: tabOpen ? '0 4px 16px rgba(30,58,95,0.12)' : '0 1px 4px rgba(30,58,95,0.06)',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{
              fontFamily: 'Inter,sans-serif', fontSize: '0.72rem', fontWeight: 700,
              color: C.primary, letterSpacing: '0.02em',
              // Etiketler artık uzun ("Sanal Kartvizit - V1", EN'de daha da uzun):
              // dar ekranda sarmak yerine tek satırda kalıp gerekirse kısalsın.
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              minWidth: 0, flex: 1, textAlign: 'left',
            }}>
              {L[curTab.labelKey] || curTab.labelKey.replace('bc', '')}
            </span>
            {!cardLocked && (
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{
                transition: 'transform 0.2s ease',
                transform: tabOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>
                <path d="M1 1L5 5L9 1" stroke={C.textM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          {!cardLocked && tabOpen && tabPos && createPortal(
            <>
              {/* dışarı tıklayınca kapanır — modalin (9999) ÜSTÜNDE olmalı */}
              <div onClick={() => setTabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10049 }} />
              <div style={{
                position: 'fixed', left: tabPos.left, top: tabPos.top, bottom: tabPos.bottom,
                width: tabPos.width, maxHeight: tabPos.maxH,
                background: C.surfaceSolid,          // OPAK: altındaki kart görünmesin
                borderRadius: 12, border: `1px solid ${C.borderSub}`,
                boxShadow: '0 12px 40px rgba(30,58,95,0.22), 0 4px 12px rgba(30,58,95,0.12)',
                zIndex: 10050, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                animation: 'fadeSlideDown 0.2s ease',
              }}>
                <div style={{ padding: '0.45rem 0.6rem 0.3rem', borderBottom: `1px solid ${C.borderSub}`, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 600, color: C.textM, fontFamily: 'Plus Jakarta Sans,sans-serif', letterSpacing: '0.5px' }}>
                    {L.bcVersionSelect || L.designSelect}
                  </span>
                </div>
                <div style={{ padding: '0.3rem', overflowY: 'auto', WebkitOverflowScrolling: 'touch', flex: 1, minHeight: 0 }}>
                  {visibleTabs.map(t => {
                    const on = t.id === variant;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { setVariant(t.id); setTabOpen(false); }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                          padding: '0.5rem 0.55rem', borderRadius: 9, border: 'none',
                          background: on ? `${C.primary}0a` : 'transparent',
                          cursor: 'pointer', transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => { if (!on) e.currentTarget.style.background = `${C.primary}06`; }}
                        onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{
                          flex: 1, minWidth: 0, textAlign: 'left', fontSize: '0.72rem', fontWeight: 700,
                          color: on ? C.primary : C.text1, fontFamily: 'Inter,sans-serif',
                          letterSpacing: '0.02em', lineHeight: 1.3,
                        }}>
                          {L[t.labelKey] || t.labelKey.replace('bc', '')}
                        </span>
                        {on && (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>,
            document.body
          )}
        </div>
        )}
          <button
            onClick={onClose}
            title={L.close || 'Kapat'}
            style={{
              // marginLeft:auto → combobox kaldırıldığında (kilitli hesaplar) çarpı
              // satırın sağ ucunda kalır; combobox varken flex:1 onu zaten sağa itiyor.
              flex: '0 0 auto', marginLeft: 'auto', width: 30, height: 30, borderRadius: 9,
              background: 'rgba(30,58,95,0.05)', border: `1px solid ${C.borderSub}`,
              cursor: 'pointer', color: C.textM, display: 'flex',
              alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.background = 'rgba(30,58,95,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textM; e.currentTarget.style.background = 'rgba(30,58,95,0.05)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Sığdırma kabı: kalan yükseklik neyse kart ona göre ölçeklenir (kaydırma YOK) */}
        <div ref={boxRef} style={{
          flex: 1, minHeight: 0, overflow: 'hidden',
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        }}>
        <div ref={innerRef} style={{
          transform: `scale(${scale})`, transformOrigin: 'top center', willChange: 'transform',
        }}>

        {/* Card Preview */}
        {variant !== 'v1' ? (
          // V2: indirilecek PNG'nin AYNISI. Üstüne saydam bağlantılar bindirilir
          // (yüzde koordinat → tuval hangi ölçekte gösterilirse gösterilsin hizalı kalır).
          <div style={{
            position: 'relative', borderRadius: 18, overflow: 'hidden',
            marginBottom: '1rem', background: '#fff',
            boxShadow: '0 8px 32px rgba(30,58,95,0.15)',
          }}>
            <CardCanvasView source={previewCardRef.current} trigger={cardReady} />
            {((v2Meta && v2Meta.hotspots) || []).map(h => (
              <a
                key={h.id}
                href={h.href}
                target={h.ext ? '_blank' : undefined}
                rel={h.ext ? 'noopener noreferrer' : undefined}
                title={h.label}
                style={{
                  position: 'absolute',
                  left: (h.x / v2Meta.layout.W * 100) + '%',
                  top: (h.y / v2Meta.layout.H * 100) + '%',
                  width: (h.w / v2Meta.layout.W * 100) + '%',
                  height: (h.h / v2Meta.layout.H * 100) + '%',
                  borderRadius: h.round ? '50%' : 10,
                  display: 'block',
                }}
              />
            ))}
            {/* ── PROFİL FOTOĞRAFI ETKİLEŞİMİ (V1'deki davranışın aynısı) ──
                Önizleme bir TUVAL görüntüsü olduğu için fotoğraf tuvale çizilidir;
                etkileşim onun üzerine bindirilen katmanlarla sağlanır. Konumlar
                v2Layout'tan yüzde olarak geldiği için tuval hangi ölçekte
                gösterilirse gösterilsin hizalı kalır.
                Eskiden yalnız görünmez bir tıklama alanı vardı: ne hover'da
                "fotoğraf yükle" katmanı ne de kırmızı silme rozeti çıkıyordu
                (kullanıcı bildirimi). */}
            {v2Meta && v2Meta.layout.avatar && (() => {
              const a = v2Meta.layout.avatar, LW = v2Meta.layout.W, LH = v2Meta.layout.H;
              const pct = (v, tot) => (v / tot * 100) + '%';
              return (
                <div style={{
                  position: 'absolute',
                  left: pct(a.cx - a.r, LW), top: pct(a.cy - a.r, LH),
                  width: pct(a.r * 2, LW), height: pct(a.r * 2, LH),
                }}>
                  {/* Fotoğraf VARSA: hover'da koyulaşan yükleme katmanı.
                      Fotoğraf YOKSA (placeholder): tuvale beyaz daire çizildi, üstüne
                      KALICI yükleme çağrısı basılır — gizlenen V4 tasarımındaki görünüm.
                      Bu katman yalnız önizlemede; indirilen PNG/Dijital Kart fotoğrafsız. */}
                  {a.placeholder ? (
                    <div
                      onClick={() => profileInputRef.current && profileInputRef.current.click()}
                      title={L.bcProfileTitle || 'Click on the photo to upload a profile picture'}
                      style={{
                        position: 'absolute', inset: 0, borderRadius: '50%', cursor: 'pointer',
                        // kesikli çerçeve: dairenin üst kısmı kartın beyaz şeridine denk
                        // geldiği için şeklin okunması buna bağlı
                        border: '2px dashed rgba(30,58,95,0.42)',
                        boxSizing: 'border-box',
                        background: 'transparent', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 3,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,58,95,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Upload size={20} color={C.primary} strokeWidth={1.9} />
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 700, color: C.primary,
                        fontFamily: 'Inter,sans-serif', letterSpacing: '0.01em',
                      }}>{L.bcAddPhoto || 'Fotoğraf'}</span>
                    </div>
                  ) : (
                  <div
                    onClick={() => profileInputRef.current && profileInputRef.current.click()}
                    title={L.bcProfileTitle || 'Click on the photo to upload a profile picture'}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '50%', cursor: 'pointer',
                      background: 'rgba(0,0,0,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                  >
                    <Upload size={22} color="#fff" />
                  </div>
                  )}
                  {/* kırmızı silme rozeti — daire kenarında, dışa taşar */}
                  {profileBase64 && (
                    <div
                      onClick={(e) => { e.stopPropagation(); setProfileBase64(null); }}
                      title={L.bcRemoveProfile || 'Remove profile'}
                      style={{
                        position: 'absolute', top: '4%', right: '-4%', zIndex: 3,
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        border: '2.5px solid #fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <X size={12} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Fotoğraf YOKSA tuvale daire hiç çizilmiyor (dışa aktarımda öyle olması
                istendi) → tıklanacak bir yer de kalmıyordu, yani Graph'tan fotoğrafı
                gelmeyen kullanıcı V2'de fotoğraf EKLEYEMİYORDU. Bu yüzden yalnız
                ÖNİZLEMEDE, dairenin olacağı yere kesikli bir çağrı bindirilir.
                Dışa aktarılan PNG/HTML bundan etkilenmez. */}
            {/* Fotoğraf yükleme çağrısı artık AYRI bir katman değil: önizleme düzeni
                profil dairesinin yerini her zaman ayırıyor (photoCta) ve çağrı yukarıdaki
                avatar katmanının içinde duruyor. Eski çözüm bandın üstüne bindirilen
                kesikli bir daireydi; V1/V3'te bant kartın en üstünden başladığı için
                yarısı kart dışında kalıp adın üstüne biniyordu. */}
          </div>
        ) : (<>

        <div style={{
          borderRadius: 15,
          overflow: 'hidden',
          background: BG_GRADIENT,
          position: 'relative',
          padding: '0 0 20px',
          marginBottom: '1rem',
          boxShadow: '0 8px 32px rgba(30,58,95,0.15)',
        }}>
          {/* Wave overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 35% 55%, rgba(180,215,80,0.25) 0%, rgba(60,190,190,0.08) 50%, transparent 80%)',
          }} />

          {/* Avatar: profil fotoğrafı VEYA fotoğraf yükleme çağrısı.
              Şirket logosu artık burada gösterilmiyor (QR bandında duruyor) — fotoğraf
              yoksa daire, tıklanabilir bir "fotoğraf yükle" alanı olarak kalır.
              Dışa aktarımda (PNG/HTML) fotoğraf yoksa daire HİÇ çizilmez. */}
          {(
            <div style={{
              marginTop: 28,
              display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1,
            }}>
              {/* Wrapper for circle + badge (position:relative so badge can overflow) */}
              <div style={{ position: 'relative', width: 100, height: 100 }}>
                <div
                  style={{
                    width: 100, height: 100, borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.9)',
                    background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                  }}
                  onClick={() => profileInputRef.current && profileInputRef.current.click()}
                  title={L.bcProfileTitle || 'Click on the photo to upload a profile picture'}
                >
                  {profileBase64 ? (
                    <img
                      src={profileBase64} alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    // Fotoğraf yok → logo değil, fotoğraf yükleme çağrısı
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 4, color: C.textM,
                    }}>
                      <Upload size={24} color={C.primary} strokeWidth={1.8} style={{ opacity: 0.55 }} />
                      <span style={{ fontSize: '0.56rem', fontWeight: 600, fontFamily: 'Inter,sans-serif', letterSpacing: '0.2px' }}>
                        {L.bcAddPhoto || 'Fotoğraf'}
                      </span>
                    </div>
                  )}
                  {/* Upload overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                  >
                    <Upload size={22} color="#fff" />
                  </div>
                </div>
                {/* Remove profile badge — outside overflow:hidden circle */}
                {profileBase64 && (
                  <div
                    onClick={(e) => { e.stopPropagation(); setProfileBase64(null); }}
                    title={L.bcRemoveProfile || 'Remove profile'}
                    style={{
                      position: 'absolute', top: 0, right: -4, zIndex: 3,
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: '2.5px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                      transition: 'transform 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <X size={12} color="#fff" strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Name + LinkedIn icon */}
          <div style={{
            marginTop: 14, // önizlemede daire her zaman var (fotoğraf yükleme alanı)
            fontSize: '1.3rem', fontWeight: 700, color: '#ffffff',
            fontFamily: 'Plus Jakarta Sans,sans-serif',
            textShadow: '0 2px 8px rgba(0,0,0,0.15)',
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {fullName}
            {/* önizlemedeki rozet de aynı anahtara bakar — indirilen kartla birebir aynı */}
            {stg.showLinkedin !== false && form.linkedinPersonal && (
              <a href={form.linkedinPersonal.startsWith('http') ? form.linkedinPersonal : 'https://' + form.linkedinPersonal}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', opacity: 0.85, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
          </div>

          {/* Ünvan(lar) — ismin HEMEN ALTINDA, her ünvan KENDİ SATIRINDA (ayraç yok) */}
          {titleParts.map((t, i) => (
            <div key={i} style={{
              marginTop: i === 0 ? 6 : 2, padding: '0 20px',
              fontSize: '0.86rem', color: 'rgba(255,255,255,0.85)',
              fontFamily: 'Inter,sans-serif',
              position: 'relative', zIndex: 1,
            }}>
              {t}
            </div>
          ))}

          {/* Şirket resmi ünvanı (ünvandan sonra) — siteye tıklanabilir */}
          <div style={{
            marginTop: hasTwoLines ? 8 : 10, padding: '0 18px',
            fontSize: '0.92rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)',
            fontFamily: 'Inter,sans-serif',
            position: 'relative', zIndex: 1,
          }}>
            {stg.website ? (
              <a
                href={stg.website.startsWith('http') ? stg.website : 'https://' + stg.website}
                target="_blank" rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                {companyName}
              </a>
            ) : companyName}
          </div>


          {/* QR — şirket logosu aynı cam çerçevenin içinde, QR'ın üstünde */}
          <div className="bc-qr-wrap" style={{
            margin: '20px auto 0',
            width: 210,
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 18,
            boxShadow: '0 8px 32px rgba(30, 58, 95, 0.18), inset 0 1px 0 rgba(255,255,255,0.4)',
            border: '1.5px solid rgba(255, 255, 255, 0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
            padding: 6, boxSizing: 'border-box',
          }}>
            {(stg.cardLogoBase64 || stg.logoBase64) && (
              // ANA MARKA logosu: Ventures grubunda Nexa Studio, diğerlerinde TYRO
              // (App.jsx hesaplar). Oran < 3.5 olan (TYRO) bir tık küçük —
              // bkz. drawBusinessCard'daki not.
              <img src={stg.cardLogoBase64 || stg.logoBase64} alt=""
                style={{
                  display: 'block', width: 'auto', maxWidth: '100%', marginBottom: 6,
                  height: (() => {
                    const ar = ((stg.cardLogoBase64 ? (stg.cardLogoW / stg.cardLogoH) : (stg.logoW / stg.logoH)) || 3.9);
                    return ar < 2.6 ? 50 : (ar < 3.5 ? 35 : 42);   // tuvaldeki üç kademe
                  })(),
                  // TYRO logosunda optik sola kaydırma — canvas'la (MAIN_LOGO_DX)
                  // aynı, önizleme ile indirilen görsel ayrışmasın. right → sola kaydırır.
                  ...(stg.cardLogoIsMain ? { position: 'relative', right: 4 } : null),
                }} />
            )}
            <QrCanvasView source={qrCanvasRef.current} size={196} trigger={qrReady} />
          </div>

          {/* Glass info panel */}
          {contactRows.length > 0 && (
            <div style={{
              margin: '20px auto 0',
              width: 'calc(100% - 36px)',
              background: 'rgba(255,255,255,0.28)',
              backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
              borderRadius: 12,
              padding: '4px 0',
              position: 'relative', zIndex: 1,
            }}>
              {contactRows.map((row, i) => {
                const href = contactHref(row.key, row.value);
                const iconSvg = row.key === 'GSM'
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  : row.key === 'Email'
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  : (row.key === 'Address' || row.key === 'Location')
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  : null;
                const content = (
                  <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    {iconSvg && (
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.12)' }}>
                        {iconSvg}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)',
                        fontFamily: 'Inter,sans-serif', textAlign: 'left',
                        letterSpacing: '0.4px', textTransform: 'uppercase',
                      }}>
                        {row.label}
                      </div>
                      <div style={{
                        fontSize: '0.78rem', color: '#ffffff',
                        fontFamily: 'Inter,sans-serif', textAlign: 'left',
                        marginTop: 2,
                        textShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}>
                        {row.value}
                      </div>
                    </div>
                  </div>
                );
                return (
                  <div key={i}>
                    {href ? (
                      <a
                        href={href}
                        target={row.key === 'Web' || row.key === 'Address' || row.key === 'Location' ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        style={{
                          display: 'block', textDecoration: 'none',
                          transition: 'background 0.15s',
                          borderRadius: i === 0 ? '12px 12px 0 0' : i === contactRows.length - 1 ? '0 0 12px 12px' : 0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {content}
                      </a>
                    ) : content}
                    {i < contactRows.length - 1 && (
                      <div style={{ height: 1, background: 'rgba(231,233,235,0.3)', margin: '0' }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </>)}

        </div>{/* /ölçekli iç kap */}
        </div>{/* /sığdırma kabı */}

        </div>{/* /bc-scroll */}

        {/* Actions — sticky footer, always visible */}
        <div className="bc-actions" style={{
          display: 'flex', gap: 2, padding: 3,
          background: 'rgba(30,58,95,0.05)',
          border: `1px solid ${C.borderSub}`,
          borderRadius: 12,
          flex: '0 0 auto',
          marginTop: '0.5rem',
        }}>
          {/* Kopyala — hover: gold */}
          <button
            onClick={handleCopy}
            style={{
              ...btnGroupItem,
              background: copyOk ? 'rgba(34,197,94,0.16)' : 'transparent',
              borderColor: copyOk ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.18)',
              color: copyOk ? '#16a34a' : C.textM,
            }}
            onMouseEnter={e => { if (!copyOk) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(200,146,42,0.18), rgba(200,146,42,0.1))'; e.currentTarget.style.borderColor = 'rgba(200,146,42,0.35)'; e.currentTarget.style.color = '#b07d1e'; } e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { if (!copyOk) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = C.textM; } e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {copyOk ? <Check size={14} /> : <Copy size={14} />}
            <span className="bc-btn-label">{copyOk ? '✓' : (L.bcCopy || 'Copy')}</span>
          </button>

          {/* İndir — hover: navy */}
          <button
            onClick={handleDownload}
            style={{ ...btnGroupItem, color: C.textM }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30,58,95,0.15), rgba(30,58,95,0.08))'; e.currentTarget.style.borderColor = 'rgba(30,58,95,0.3)'; e.currentTarget.style.color = '#1e3a5f'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = C.textM; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Download size={14} />
            <span className="bc-btn-label">{L.bcDownload || 'Download'}</span>
          </button>

          {/* Paylaş — hover: green */}
          <button
            onClick={handleShare}
            style={{ ...btnGroupItem, color: C.textM }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(37,211,102,0.15), rgba(37,211,102,0.08))'; e.currentTarget.style.borderColor = 'rgba(37,211,102,0.35)'; e.currentTarget.style.color = '#128C7E'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = C.textM; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Share2 size={14} />
            <span className="bc-btn-label">{L.bcShare || 'Share'}</span>
          </button>

          {/* Dijital Kart — hover: blue */}
          <button
            onClick={handleHtmlDownload}
            style={{
              ...btnGroupItem,
              background: 'rgba(0,152,212,0.1)',
              borderColor: 'rgba(0,152,212,0.2)',
              color: '#0088c0',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,152,212,0.22), rgba(0,152,212,0.12))'; e.currentTarget.style.borderColor = 'rgba(0,152,212,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,152,212,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,152,212,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <FileDown size={14} />
            <span className="bc-btn-label">{L.bcDigitalCard || 'Digital Card'}</span>
          </button>
        </div>

        {/* Hint */}
        <div style={{
          marginTop: '0.6rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
          fontSize: '0.65rem', color: C.text2 || '#4a5568',
          fontFamily: 'Inter,sans-serif',
          textAlign: 'center', lineHeight: 1.4,
          opacity: 0.55,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          {L.bcProfileHint || 'Click on the logo to upload your profile photo'}
        </div>
        <div style={{ height: '0.5rem' }} />
      </div>
    </div>
  );
});

export default BusinessCardModal;
