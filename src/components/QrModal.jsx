import { memo, useEffect, useRef, useCallback, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check } from 'lucide-react';
import { C } from '../constants/theme';
import { makeAlignmentTest } from '../utils/qrAlignment';
import { generateVCard } from '../utils/generateVCard';
import { formatGSM, titleCase } from '../utils/formatting';
import Btn from './ui/Btn';

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

/**
 * Draws a vertical business card: QR top, info below — matches modal preview
 */
async function drawCardCanvas(qrDataUrl, form, stg, company, lang) {
  const W = 420;
  const qrSize = 220;
  const qrPad = 12;
  const qrBoxSize = qrSize + qrPad * 2;

  const fullName = formatName(form);
  const companyName = (lang !== 'tr' && company && company.nameEN) ? company.nameEN : ((company && company.name) || stg.companyName || 'TYRO Tech');
  const titleText = [form.titleTR, form.titleEN].filter(Boolean).join(' / ');

  // Height calc — matches modal spacing exactly
  let H = 0;
  H += 6;              // top navy bar
  H += 24;             // padding above QR
  H += qrBoxSize;      // QR + bg padding
  H += 20;             // gap QR → name
  H += 26;             // name line
  H += 4;              // name → divider gap
  H += 3;              // divider
  H += 8;              // divider → company gap
  H += 18;             // company
  if (titleText) H += 18;
  if (form.gsm) H += 18;
  if (form.email) H += 18;
  H += 24;             // bottom hint
  H += 4;              // bottom gold bar

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Top navy bar
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, 6);

  // Bottom gold accent line — QR KODU DEĞİL, kartın dekoratif şeridi → altın kalır
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, H - 4, W, 4);

  ctx.textAlign = 'center';
  let y = 6 + 24; // after top bar + padding

  // QR background box (glass effect)
  const qrBoxX = (W - qrBoxSize) / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  roundRect(ctx, qrBoxX, y, qrBoxSize, qrBoxSize, 14);
  ctx.fill();
  // Inner highlight (top edge glow)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  roundRect(ctx, qrBoxX, y, qrBoxSize, qrBoxSize, 14);
  ctx.stroke();
  // Outer shadow
  ctx.shadowColor = 'rgba(30, 58, 95, 0.12)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.0)';
  ctx.beginPath();
  roundRect(ctx, qrBoxX, y, qrBoxSize, qrBoxSize, 14);
  ctx.fill();
  ctx.restore();

  // Draw QR — wait for image to load
  const qrImgX = qrBoxX + qrPad;
  const qrImgY = y + qrPad;
  await new Promise((resolve) => {
    const qrImg = new window.Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrImgX, qrImgY, qrSize, qrSize);
      resolve();
    };
    qrImg.src = qrDataUrl;
  });

  y += qrBoxSize + 20; // gap after QR box

  // Name
  ctx.fillStyle = NAVY;
  ctx.font = 'bold 20px "Plus Jakarta Sans", "Inter", Arial, sans-serif';
  ctx.fillText(fullName, W / 2, y + 16);
  y += 26 + 4; // name height + gap

  // Divider
  ctx.fillStyle = BLUE;
  ctx.fillRect(W / 2 - 25, y, 50, 3);
  y += 3 + 8; // divider + gap

  // Company
  ctx.fillStyle = NAVY;
  ctx.font = 'bold 13px "Inter", Arial, sans-serif';
  ctx.fillText(companyName, W / 2, y + 12);
  y += 18;

  // Title
  if (titleText) {
    ctx.fillStyle = '#666666';
    ctx.font = '11px "Inter", Arial, sans-serif';
    ctx.fillText(titleText, W / 2, y + 11);
    y += 18;
  }

  // GSM
  if (form.gsm) {
    ctx.fillStyle = '#777777';
    ctx.font = '11px "Inter", Arial, sans-serif';
    ctx.fillText('📱 ' + formatGSM(form.gsm), W / 2, y + 11);
    y += 18;
  }

  // Email
  if (form.email) {
    ctx.fillStyle = '#888888';
    ctx.font = '11px "Inter", Arial, sans-serif';
    ctx.fillText('✉ ' + form.email, W / 2, y + 11);
    y += 18;
  }

  // Bottom hint
  ctx.fillStyle = '#bbbbbb';
  ctx.font = 'italic 9px "Inter", Arial, sans-serif';
  const hintTexts = { tr: 'Rehbere eklemek için QR okutun', en: 'Scan QR to save contact', ru: 'Сканируйте QR для сохранения контакта', ar: 'امسح رمز QR لحفظ جهة الاتصال' };
  ctx.fillText(hintTexts[lang] || hintTexts.en, W / 2, H - 12);

  return canvas;
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

const QrModal = memo(({ open, onClose, form, office, stg, company, toast, L, lang }) => {
  const canvasRef = useRef(null);
  const cardRef = useRef(null); // Pre-rendered card canvas
  const [copyOk, setCopyOk] = useState(false);
  const copyTimerRef = useRef(null);

  // Cleanup copy timer on unmount
  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); }, []);

  // Generate QR code + pre-render card canvas
  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const vcard = generateVCard(form, office, stg, company, lang);

    // Draw rounded-dot QR — High EC level + larger margin for reliable scanning
    // even from screens, low-light, or oblique angles
    const qrData = QRCode.create(vcard, { errorCorrectionLevel: 'H' });
    const qrModules = qrData.modules;
    const moduleCount = qrModules.size;
    const qrSize = 280;
    const qrMargin = 4;
    const totalMods = moduleCount + qrMargin * 2;
    const cell = qrSize / totalMods;
    // Nokta yarıçapı 0.42 → 0.50: 0.42'de daireler komşularına DEĞMİYOR, aralarında
    // beyaz boşluk kalıyordu. 166px'de modül ~2px olduğu için nokta ~1.7px'e düşüp
    // kod cılızlaşıyor ve tarayıcı ikilileştirmede modülleri ayırt edemiyordu.
    // 0.50 = hücreye tam içten teğet daire → komşular birleşir, yuvarlak estetik korunur.
    const dotR = cell * 0.50;
    const finderCornerR = cell * 0.8;

    const cvs = canvasRef.current;
    cvs.width = qrSize;
    cvs.height = qrSize;
    const qCtx = cvs.getContext('2d');

    // Background with rounded corners
    qCtx.fillStyle = '#ffffff';
    qCtx.beginPath();
    // KÖŞE YARIÇAPI SESSİZ BÖLGEYİ AŞMAMALI. Eskiden size*0.06 idi: 360px tuvalde
    // 21.6px, oysa 4 modüllük sessiz bölge 16.2-18.7px. Yani beyaz zeminin köşesi
    // QR'ın İÇİNE kesiyor ve arkadaki renk (V3/V4'te cam çerçeve) üç bulucu
    // deseninin köşesinde görünüyordu → köşedeki beyaz pay 4 modülden ~2.7'ye
    // düşüyordu. Ölçüldü: katı yerel eşikli çözücülerde (jsQR, ZXing-lib) başarı
    // YARIYA iniyor; Apple Vision/ZXing-C++ etkilenmiyordu. Sınır: 2 modül.
    roundRect(qCtx, 0, 0, qrSize, qrSize, Math.min(qrSize * 0.06, cell * 2));
    qCtx.fill();

    // Navy gradient for dots
    const dotGrad = qCtx.createLinearGradient(0, 0, qrSize, qrSize);
    dotGrad.addColorStop(0, NAVY);
    dotGrad.addColorStop(0.5, '#1a4a6e');
    dotGrad.addColorStop(1, '#15607a');

    function isFinderArea(r, c) {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= moduleCount - 7) return true;
      if (r >= moduleCount - 7 && c < 7) return true;
      return false;
    }

    // Alignment pattern detection
    // Hizalama merkezleri ORTAK ve DOĞRULANMIŞ kaynaktan gelir (utils/qrAlignment.js).
    // Eskiden buradaki formül YANLIŞ konum üretiyordu ve süslü hizalama bloğu gerçek
    // VERİ modüllerinin üzerine basılıyordu → kod bozuluyordu. Bkz. o dosyanın notu.
    const _isAlignCenter = makeAlignmentTest(moduleCount);
    function isAlignmentCenter(r, c) { return _isAlignCenter(r, c); }

    function drawFinder(sr, sc) {
      const ox = (sc + qrMargin) * cell;
      const oy = (sr + qrMargin) * cell;

      // Shadow glow behind finder
      qCtx.save();
      qCtx.shadowColor = 'rgba(30, 58, 95, 0.25)';
      qCtx.shadowBlur = cell * 2;
      qCtx.fillStyle = NAVY;
      qCtx.beginPath();
      roundRect(qCtx, ox, oy, 7 * cell, 7 * cell, finderCornerR);
      qCtx.fill();
      qCtx.restore();

      // Outer ring with gradient
      qCtx.fillStyle = dotGrad;
      qCtx.beginPath();
      roundRect(qCtx, ox, oy, 7 * cell, 7 * cell, finderCornerR);
      qCtx.fill();

      // White gap
      qCtx.fillStyle = '#ffffff';
      qCtx.beginPath();
      roundRect(qCtx, ox + cell, oy + cell, 5 * cell, 5 * cell, finderCornerR * 0.6);
      qCtx.fill();

      // Inner square with gold accent
      qCtx.fillStyle = QR_ACCENT;
      qCtx.beginPath();
      roundRect(qCtx, ox + 2 * cell, oy + 2 * cell, 3 * cell, 3 * cell, finderCornerR * 0.4);
      qCtx.fill();
    }

    drawFinder(0, 0);
    drawFinder(0, moduleCount - 7);
    drawFinder(moduleCount - 7, 0);

    // Draw alignment patterns with matching style
    function drawAlignment(cr, cc) {
      const ox = (cc - 2 + qrMargin) * cell;
      const oy = (cr - 2 + qrMargin) * cell;
      const s = 5 * cell;
      const r = cell * 0.6;
      qCtx.fillStyle = dotGrad;
      qCtx.beginPath();
      roundRect(qCtx, ox, oy, s, s, r);
      qCtx.fill();
      qCtx.fillStyle = '#ffffff';
      qCtx.beginPath();
      roundRect(qCtx, ox + cell, oy + cell, 3 * cell, 3 * cell, r * 0.5);
      qCtx.fill();
      qCtx.fillStyle = QR_ACCENT;
      qCtx.beginPath();
      const dotCx = (cc + qrMargin + 0.5) * cell;
      const dotCy = (cr + qrMargin + 0.5) * cell;
      qCtx.arc(dotCx, dotCy, cell * 0.5, 0, Math.PI * 2);
      qCtx.fill();
    }

    // Find and draw alignment patterns
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (isAlignmentCenter(r, c)) drawAlignment(r, c);
      }
    }

    // Check if a cell is part of alignment pattern (5x5 area)
    function isAlignmentArea(r, c) {
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (isAlignmentCenter(r - dr, c - dc)) return true;
        }
      }
      return false;
    }

    // Data modules as gradient dots
    qCtx.fillStyle = dotGrad;
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (isFinderArea(r, c)) continue;
        if (isAlignmentArea(r, c)) continue;
        if (qrModules.get(r, c)) {
          const cx = (c + qrMargin + 0.5) * cell;
          const cy = (r + qrMargin + 0.5) * cell;
          qCtx.beginPath();
          qCtx.arc(cx, cy, dotR, 0, Math.PI * 2);
          qCtx.fill();
        }
      }
    }

    // Continue with card rendering
    Promise.resolve().then(() => {
      // Pre-render the styled card so copy is instant
      const qrDataUrl = canvasRef.current.toDataURL('image/png');
      drawCardCanvas(qrDataUrl, form, stg, company, lang).then(c => { cardRef.current = c; });
    }).catch(() => {});
  }, [open, form, office, stg, company, lang]);

  // Reset copy state when modal opens
  useEffect(() => { if (open) setCopyOk(false); }, [open]);

  // Download styled card
  const handleDownload = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    const link = document.createElement('a');
    const name = [form.firstName, form.lastName].filter(Boolean).join('-') || 'qr';
    link.download = name.toLowerCase() + '-business-card.png';
    link.href = card.toDataURL('image/png');
    link.click();
  }, [form]);

  // Copy styled card to clipboard — uses pre-rendered canvas for instant user-gesture compliance
  const handleCopy = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    try {
      // ClipboardItem with lazy blob promise — keeps user gesture context
      const item = new ClipboardItem({
        'image/png': new Promise((resolve, reject) => {
          card.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('toBlob failed'));
          }, 'image/png');
        }),
      });
      navigator.clipboard.write([item]).then(() => {
        setCopyOk(true);
        if (toast) toast(L.qrCopied);
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopyOk(false), 2500);
      }).catch(err => {
        console.warn('Clipboard write failed:', err);
        if (toast) toast(L.bcCopyFail || 'Copy failed');
      });
    } catch (err) {
      console.warn('QR copy failed:', err);
      if (toast) toast(L.bcCopyUnsupported || 'Copy not supported');
    }
  }, [toast, L]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const fullName = formatName(form);
  const companyName = (lang !== 'tr' && company && company.nameEN) ? company.nameEN : ((company && company.name) || 'TYRO Tech');
  const titleText = [form.titleTR, form.titleEN].filter(Boolean).join(' · ');

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
        className="qr-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 16,
          border: `1px solid ${C.borderSub}`,
          boxShadow: '0 24px 48px rgba(30,58,95,0.18), 0 8px 16px rgba(30,58,95,0.08)',
          padding: '1.8rem',
          width: '100%', maxWidth: 400,
          textAlign: 'center',
          position: 'relative',
          animation: 'slideInUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.textM, padding: 4, borderRadius: 6,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.primary}
          onMouseLeave={e => e.currentTarget.style.color = C.textM}
        >
          <X size={18} />
        </button>

        {/* Modal title */}
        <h3 style={{
          fontFamily: 'Plus Jakarta Sans,sans-serif',
          fontSize: '1rem', fontWeight: 700, color: C.primary,
          margin: '0 0 0.3rem',
        }}>
          {L.qrTitle}
        </h3>
        <p style={{ fontSize: '0.7rem', color: C.textM, margin: '0 0 1rem' }}>
          {L.qrScan}
        </p>

        {/* Card preview — vertical: QR top, info below */}
        <div style={{
          display: 'inline-block',
          padding: '1rem',
          background: '#fff',
          borderRadius: 12,
          border: `1px solid ${C.borderSub}`,
          boxShadow: '0 2px 8px rgba(30,58,95,0.06)',
          marginBottom: '1rem',
          borderTop: `4px solid ${NAVY}`,
        }}>
          {/* QR */}
          <div style={{
            display: 'inline-flex',
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 14,
            padding: 10,
            border: '1.5px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(30, 58, 95, 0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
            marginBottom: '0.8rem',
          }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: 160, height: 160 }} />
          </div>

          {/* Name */}
          <div style={{
            fontSize: '0.95rem', fontWeight: 700, color: NAVY,
            fontFamily: 'Plus Jakarta Sans,sans-serif',
            marginBottom: 4,
          }}>
            {fullName || '—'}
          </div>

          {/* Divider */}
          <div style={{ width: 40, height: 2, background: BLUE, borderRadius: 1, margin: '0 auto 6px' }} />

          {/* Company + Title */}
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: NAVY, marginBottom: 2 }}>
            {companyName}
          </div>
          {titleText && (
            <div style={{ fontSize: '0.62rem', color: '#666', marginBottom: 4 }}>
              {titleText}
            </div>
          )}

          {/* GSM */}
          {form.gsm && (
            <div style={{ fontSize: '0.58rem', color: '#777', marginTop: 2 }}>
              📱 {formatGSM(form.gsm)}
            </div>
          )}

          {/* Email */}
          {form.email && (
            <div style={{ fontSize: '0.58rem', color: '#888', marginTop: 2 }}>
              ✉ {form.email}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <Btn onClick={handleCopy} icon={copyOk ? Check : Copy}>{copyOk ? '✓' : L.qrCopy}</Btn>
          <Btn onClick={handleDownload} icon={Download}>{L.qrDl}</Btn>
        </div>
      </div>
    </div>
  );
});

export default QrModal;
