// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DÜZ RENK PNG ÜRETİCİ (saf JS — canvas/zlib YOK)
//
// Neden gerekli: eski Outlook'ta (Word motoru) içi boş, arka planı boyanmış ince
// hücreler dikey çubuk olarak kullanılamıyor — Word hücre gölgelemesini hücrenin
// İÇİNDEKİ paragraf kutusunun arkasına çizdiği için boş hücre tek satır boyunda
// boyanıp gerisi boyasız kalıyor ve çubuk "kesik kesik" görünüyor. Çözüm çubuğu
// RESİM yapmak: Word bir <img>'i asla bölemez.
//
// Klasik (V4) tasarımında çubuk renkleri üç sabit hex olduğu için önceden üretilmiş
// PNG'ler gömülüydü. Klasik-V2'de ise çubuk rengi kullanıcı ayarından (rightBlockBg
// renk seçicisi) gelebiliyor → renk başına PNG gömmek imkânsız, çalışma anında
// üretmek gerekiyor. Üreticiler saf string kurucular (DOM/canvas kullanmıyorlar),
// bu yüzden PNG baytları elle kuruluyor.
//
// ALFA KANALI YOK (colorType 2 = truecolor): Word saydam PNG'yi hücrenin bgcolor'ıyla
// harmanlamak yerine BEYAZA matlaştırıyor (rozet/ikonlarda ölçüldü) — alfasız üretmek
// bu yolu tamamen kapatır.
//
// Sıkıştırma: deflate "stored" (sıkıştırılmamış) blok kullanılıyor. Geçerli bir zlib
// akışı için 2 baytlık başlık + sonda Adler-32 yeterli; 10x2 px için toplam ~75 bayt,
// yani imza boyutuna etkisi yok.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CRC_TABLE = (() => {
  const t = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

const crc32 = (bytes) => {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const adler32 = (bytes) => {
  let a = 1, b = 0;
  for (let i = 0; i < bytes.length; i++) { a = (a + bytes[i]) % 65521; b = (b + a) % 65521; }
  return ((b << 16) | a) >>> 0;
};

const be32 = (n) => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];

// PNG chunk: uzunluk + tip + veri + CRC(tip+veri)
const chunk = (type, data) => {
  const typeBytes = [...type].map(ch => ch.charCodeAt(0));
  const body = typeBytes.concat(data);
  return be32(data.length).concat(body, be32(crc32(body)));
};

const b64 = (bytes) => {
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
    out += CH[b0 >> 2];
    out += CH[((b0 & 3) << 4) | ((b1 === undefined ? 0 : b1) >> 4)];
    out += b1 === undefined ? '=' : CH[((b1 & 15) << 2) | ((b2 === undefined ? 0 : b2) >> 6)];
    out += b2 === undefined ? '=' : CH[b2 & 63];
  }
  return out;
};

const cache = {};

/**
 * Verilen hex renkte, alfasız (colorType 2) düz renk PNG data URI'si üretir.
 * @param {string} hex  '#rrggbb' (3 haneli kısa biçim de kabul edilir)
 * @param {number} w    genişlik (varsayılan 10 — yatayda ölçekleme olmasın diye
 *                      çubuk genişliğiyle aynı verilir)
 * @param {number} h    yükseklik (varsayılan 2 — dikeyde esnetilir)
 */
export const solidPng = (hex, w = 10, h = 2) => {
  const key = hex + '|' + w + '|' + h;
  if (cache[key]) return cache[key];

  let s = String(hex || '').trim().replace('#', '');
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  if (!/^[0-9a-fA-F]{6}$/.test(s)) s = '1e3a5f'; // güvenli varsayılan (tyro laciverti)
  const r = parseInt(s.slice(0, 2), 16), g = parseInt(s.slice(2, 4), 16), b = parseInt(s.slice(4, 6), 16);

  // Ham tarama satırları: her satır 1 filtre baytı (0 = filtre yok) + w*3 renk baytı
  const raw = [];
  for (let y = 0; y < h; y++) {
    raw.push(0);
    for (let x = 0; x < w; x++) raw.push(r, g, b);
  }

  // zlib: başlık (0x78 0x01) + stored deflate blokları + Adler-32
  const z = [0x78, 0x01];
  const MAX = 65535;
  for (let off = 0; off < raw.length; off += MAX) {
    const part = raw.slice(off, off + MAX);
    const last = off + MAX >= raw.length ? 1 : 0;
    z.push(last, part.length & 0xff, (part.length >> 8) & 0xff,
      (~part.length) & 0xff, ((~part.length) >> 8) & 0xff);
    for (let i = 0; i < part.length; i++) z.push(part[i]);
  }
  z.push(...be32(adler32(raw)));

  const ihdr = be32(w).concat(be32(h), [8, 2, 0, 0, 0]); // bitDepth 8, colorType 2 (RGB, alfa YOK)
  const bytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
    .concat(chunk('IHDR', ihdr), chunk('IDAT', z), chunk('IEND', []));

  const uri = 'data:image/png;base64,' + b64(bytes);
  cache[key] = uri;
  return uri;
};
