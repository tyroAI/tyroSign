// ── Metni VERİLEN GENİŞLİĞE göre satırlara böl (tarayıcıda gerçek font ölçümüyle) ──
//
// NEDEN GEREKLİ: Klasik üreticileri (genSigNavyV4) gri panelin yüksekliğini satır satır
// HESAPLIYOR ve her satırı `mso-line-height-rule:exactly` ile kilitliyor. Word verilen
// pikseli aynen dizdiği için, tek satır varsayılan bir metin panele sığmayıp sararsa
// ikinci satır KIRPILIR (tarayıcıda görünür, eski Outlook'ta yok olur).
// Bu yüzden sarma tarayıcıya bırakılmaz: burada ölçülür, üretici her satır için
// AYRI bir satır kaydı ekler ve yükseklik hesabı gerçeğe uyar.
//
// Ölçüm bir kez oluşturulan canvas bağlamıyla yapılır. Ölçüm mümkün değilse (DOM yok)
// metin tek satır olarak döner — yani eski davranışa güvenli düşüş.
let _ctx = null;
export function wrapToWidth(text, maxWidth, font) {
  const t = (text || '').trim();
  if (!t) return [];
  if (_ctx === null) {
    try { _ctx = document.createElement('canvas').getContext('2d'); } catch (e) { _ctx = false; }
  }
  if (!_ctx || !maxWidth) return [t];
  _ctx.font = font;
  if (_ctx.measureText(t).width <= maxWidth) return [t];
  const words = t.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const cand = cur ? cur + ' ' + w : w;
    // !cur koşulu: tek bir kelime bile sığmıyorsa yine de kendi satırına konur
    if (!cur || _ctx.measureText(cand).width <= maxWidth) cur = cand;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
