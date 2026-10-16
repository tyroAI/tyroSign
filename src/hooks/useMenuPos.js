import { useRef, useState, useLayoutEffect } from 'react';

/**
 * Açılır menü (combobox) konumu — viewport'a KENETLİ, kırpılmaz.
 *
 * NEDEN BU KADAR İŞ: menüyü tetikleyen düğme cam kartların (`.glass-card`) içinde
 * duruyor ve o kartlarda `overflow:hidden` VAR. Menü `position:absolute` olduğunda
 * kart onu kesiyordu (ölçüldü: kart y 751→1076, menü y 806→1160 → listenin son
 * elemanları kartın dışında kalıp hiç tıklanamıyordu).
 * `position:fixed`e geçmek TEK BAŞINA YETMEZ: cam kartlarda `backdrop-filter` var
 * ve backdrop-filter, sabit konumlu çocuklar için YENİ KAPSAYICI BLOK yaratır →
 * fixed koordinatlar viewport'a değil KARTA göre çözülür (ölçüldü: hesap ekran
 * içindeyken menü 676px'lik viewport'un dışına, y 766'ya düşüyordu).
 * ÇÖZÜM: menü `createPortal` ile document.body'ye basılır + bu hook'un verdiği
 * fixed koordinatlar kullanılır. Portal ağaçtan çıkardığı için hem kapsayıcı blok
 * hem kırpma ortadan kalkar.
 *
 * Konum kuralları:
 *   • genişlik = min(maxWidth, viewport - 2*kenar boşluğu)
 *   • yatayda düğmenin SAĞ kenarına hizalı, ekran kenarlarına kenetli
 *   • aşağıda yeterli yer yoksa YUKARI açılır
 *   • her iki dalda sonuç viewport'a kenetlenir (düğme kıvrımın altında kalsa bile
 *     menü ekran içinde durur) ve maxHeight kalan yerden hesaplanır
 *   • scroll (capture) + resize'da yeniden hesaplanır
 *
 * @param {boolean} open  menü açık mı
 * @param {{maxWidth?: number, margin?: number, gap?: number, minHeight?: number}} opts
 * @returns {{btnRef: object, pos: null|{left:number,width:number,top?:number,bottom?:number,maxH:number}}}
 */
export function useMenuPos(open, opts = {}) {
  const { maxWidth = 300, margin = 8, gap = 6, minHeight = 150 } = opts;
  const btnRef = useRef(null);
  const [pos, setPos] = useState(null);
  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    const place = () => {
      const el = btnRef.current;
      if (!el) return;
      const b = el.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const width = Math.min(maxWidth, vw - margin * 2);
      let left = b.right - width;                       // sağa hizalı
      left = Math.max(margin, Math.min(left, vw - width - margin));
      const below = vh - b.bottom - gap - margin;
      const above = b.top - gap - margin;
      if (below >= minHeight || below >= above) {
        const top = Math.max(margin, Math.min(b.bottom + gap, vh - minHeight - margin));
        setPos({ left, width, top, maxH: Math.max(minHeight, vh - top - margin) });
      } else {
        const bottom = Math.max(margin, Math.min(vh - b.top + gap, vh - minHeight - margin));
        setPos({ left, width, bottom, maxH: Math.max(minHeight, vh - bottom - margin) });
      }
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, maxWidth, margin, gap, minHeight]);
  return { btnRef, pos };
}
