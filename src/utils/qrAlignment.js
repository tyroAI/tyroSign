// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QR HİZALAMA DESENİ KONUMLARI
//
// NEDEN VAR: QR çizicilerimiz süslü (yuvarlak noktalar, altın merkezler). Hizalama
// desenlerini "özel" çizebilmek için nerede olduklarını bilmeleri gerekiyor ve o
// alandaki veri noktalarını bastırıyorlar. Konum YANLIŞ hesaplanırsa süslü blok
// GERÇEK VERİNİN üzerine basılır → kod bozulur.
//
// ESKİ (HATALI) HESAP üç çizicide de aynıydı:
//     const ver = Math.floor((moduleCount - 17) / 4) + 1;   // +1 FAZLA → sürüm kayık
//     const step = Math.round((last - 6) / (Math.ceil(ver / 7) + 1));
// Ürettiği konumlar (ölçüldü):
//     69 modül (sürüm 13):  24,43,62,6   → DOĞRUSU  6,34,62
//     81 modül (sürüm 16):  23,40,57,74,6 → DOĞRUSU 6,26,50,74
// Yani her QR'da onlarca veri modülü süslü blokla eziliyordu. Hata düzeltme 'M'
// bunu SESSİZCE telafi ediyordu (kod zar zor okunuyordu); seviye 'L'ye çekilince
// pay bitti ve kodlar hiç okunmaz oldu.
//
// BURADAKİ HESAP resmi algoritmadır (ISO/IEC 18004 Ek E) ve qrcode kütüphanesinin
// kendi tablosuyla v2–v40 aralığında BİREBİR aynı olduğu doğrulandı (39 sürüm).
// Kütüphanenin iç dosyasına (qrcode/lib/core/...) bağımlı olmamak için burada
// yeniden yazıldı — o yol paket güncellemesinde değişebilir.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Verilen sürüm için hizalama deseni merkez koordinatları (satır = sütun). */
export function alignmentRowColCoords(version) {
  if (version <= 1) return [];
  const n = Math.floor(version / 7) + 2;          // koordinat sayısı
  const size = version * 4 + 17;
  // v32 spesifikasyonda istisna; kalanlar formülle
  const step = version === 32 ? 26 : Math.ceil((size - 13) / (2 * n - 2)) * 2;
  const coords = [];
  let pos = size - 7;
  for (let i = 0; i < n - 1; i++) { coords.unshift(pos); pos -= step; }
  coords.unshift(6);
  return coords;
}

/**
 * Hizalama deseni merkezlerini [satır, sütun] çiftleri olarak döndürür.
 * Üç bulucu (finder) köşesinde hizalama deseni YOKTUR, onlar hariç tutulur.
 * @param {number} moduleCount QR matrisinin kenar uzunluğu (ör. 69, 81)
 */
export function alignmentCenters(moduleCount) {
  const version = (moduleCount - 17) / 4;
  if (!Number.isInteger(version) || version < 2) return [];
  const coords = alignmentRowColCoords(version);
  const last = moduleCount - 7;
  const out = [];
  for (const r of coords) {
    for (const c of coords) {
      if ((r === 6 && c === 6) || (r === 6 && c === last) || (r === last && c === 6)) continue;
      out.push([r, c]);
    }
  }
  return out;
}

/** Çiziciler için hazır yardımcı: (row,col) bir hizalama MERKEZİ mi? */
export function makeAlignmentTest(moduleCount) {
  const set = new Set(alignmentCenters(moduleCount).map(([r, c]) => r + ',' + c));
  return (r, c) => set.has(r + ',' + c);
}
