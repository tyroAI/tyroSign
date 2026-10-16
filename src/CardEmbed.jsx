// Thub (React Native WebView) için gömülü kartvizit sayfası — `/card-embed.html`.
// Giriş noktası src/embed.jsx, kabuk card-embed.html (ayrı olmasının gerekçesi
// embed.jsx başlığında).
//
// MSAL YOK, Graph YOK, ek Azure yetkisi YOK: veriyi Thub postMessage ile gönderir,
// biz yalnız çizeriz. Kişisel veri URL'de taşınmaz (query param yerine postMessage).
//
// Köprü sözleşmesi (Thub ile mutabık):
//   sayfa yüklendi → {"type":"tyrosign:ready","directory":{companies,offices}}
//   Thub gönderir  → {"type":"tyrosign:data","payload":{...}}
//   çizildi        → {"type":"tyrosign:size","height":<px>}
//   hata           → {"type":"tyrosign:error","message":"..."}
import { useEffect, useRef, useState } from 'react';
import { OFFICES } from './constants/offices';
import { COMPANIES } from './constants/companies';
import { COMPANY_DIRECTORY } from './constants/companyDirectory';
import { TR, EN } from './i18n/translations';
import { buildCardStg } from './utils/cardStg';
import { drawBusinessCardV2 } from './components/businessCardV2';
import { drawCardQr, v2Data } from './components/BusinessCardModal';
import { generateVCard } from './utils/generateVCard';

// Thub'ın native şirket/ofis seçicisi bu listeden beslenir. `ready` mesajının içinde
// gönderiliyor — ayrı bir JSON dosyası koyarsak iki repoda iki kopya olur ve şirket
// eklendiğinde (ör. tyroFoundation) sessizce ayrışır.
// `street` ayrı gidiyor: Thub vCard ADR alanını `;;<street>;<city>;;;` diye bölüyor,
// tek satır gönderirsek sokak bilgisi şehir alanına sıkışır.
export const directory = () => ({
  // defaultOfficeId: şirket seçilince gelen varsayılan ofis — web arayüzünde de aynı
  // kaynak (companyDirectory.js) kullanılıyor, kullanıcı sonradan değiştirebiliyor.
  companies: COMPANIES.map(c => ({
    id: c.id, name: c.name, nameEN: c.nameEN, group: c.group,
    defaultOfficeId: (COMPANY_DIRECTORY[c.id] || {}).officeId || null,
  })),
  offices: OFFICES.map(o => ({ id: o.id, name: o.name, street: o.address, city: o.city, group: o.group, phone: o.sdn })),
});

const post = (obj) => {
  try { window.ReactNativeWebView?.postMessage(JSON.stringify(obj)); } catch (_) { /* WebView dışı önizleme */ }
};

// Kartvizitte herkese açık tek sürüm (QR + altında 4 ikon) — BusinessCardModal'daki
// CARD_TABS'ın varsayılanı. Embed'de sürüm seçimi yok, sabit.
const VARIANT = 'v4';

export default function CardEmbed() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('waiting');
  // Kartın DOĞAL genişliği (mantıksal px). Web arayüzünde kart sabit ölçülüdür ve
  // yalnızca sığmadığında KÜÇÜLÜR, asla büyümez (BusinessCardModal'daki useFitScale:
  // Math.min(1, ...)). Embed de aynı davranmalı, yoksa kart tablette esneyip
  // telefondan farklı fiziksel boyda görünür. Çizimden sonra tuvalden türetiliyor —
  // sabit sayı yazmıyoruz ki tasarım ölçüsü değişince kendiliğinden takip etsin.
  const [naturalW, setNaturalW] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const render = async (payload) => {
      const lang = payload.lang === 'tr' ? 'tr' : 'en';
      const L = lang === 'tr' ? TR : EN;
      const company = COMPANIES.find(c => c.id === payload.companyId) || null;
      const office = OFFICES.find(o => o.id === payload.officeId) || null;
      // Bilinmeyen şirket HATA: logo ve resmi ünvan ona bağlı, yanlış şirketle çizilen
      // kart sessizce yanlış olur. Bilinmeyen ofis ise yalnız adres satırını düşürür —
      // kartın kalanı doğru, o yüzden hata değil (Thub'ın kayıtlı seçimi liste
      // değişirken yarışabiliyor; tek satır eksik kart, hiç kart olmamasından iyi).
      if (payload.companyId && !company) throw new Error(`bilinmeyen companyId: ${payload.companyId}`);
      if (payload.officeId && !office) console.warn(`tyrosign: bilinmeyen officeId "${payload.officeId}" — adres satırı çizilmeyecek`);

      const form = {
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        // Thub tek bir jobTitle gönderiyor; titleParts [titleEN, titleTR] sırasıyla
        // kuruluyor, ikisine de yazarsak ünvan kartta İKİ KEZ çıkar.
        titleTR: payload.jobTitle || '',
        titleEN: '',
        officeId: office ? office.id : '',
        companyId: company ? company.id : '',
        gsm: payload.mobilePhone || '',
        email: payload.mail || '',
        linkedinPersonal: payload.linkedin || '',
      };
      const stg = await buildCardStg({ company, lang });
      if (cancelled) return;

      // QR içeriğini ÜRETMİYORUZ: Thub'ın vCard'ı birebir kodlanıyor. Sebep: Thub'ın
      // rehberi ve kartviziti aynı vCard fonksiyonunu paylaşıyor, iki yerde ayrı
      // üretilirse basılı karttan ve ekrandan okutan farklı kayıt alır.
      // YEDEK: vcard HİÇ gelmezse kendi generateVCard'ımızla üretiyoruz. Boş dizeyle
      // QR kütüphanesi "No input text" atıp kartın TAMAMINI düşürüyordu (ölçüldü) ve
      // Thub'ın yerel yedek kartı silindiği için ekran boş kalıyordu. vcard geldiğinde
      // davranış değişmez — yedek yalnız alan eksikken devreye girer.
      const vcard = payload.vcard || generateVCard(form, office, stg, company, lang);
      const qrCanvas = await drawCardQr(vcard, 360);
      if (cancelled) return;

      // Kart ölçüleri font metriğine bağlı (fitName/wrap) — fontlar inmeden çizersek
      // satırlar yanlış kırılır. Ama SÜRESİZ beklenmez: fontlar ayrı bir alan adından
      // (fonts.gstatic.com) geliyor, kurumsal ağ onu engellerse sayfa gelir font gelmez
      // ve kart hiç çizilmezdi. Thub'ın yerel yedek kartı silindi → düşecek yer yok.
      // Zaman aşımında sistem fontuyla çiziyoruz: ölçü biraz kayar, boş ekrandan iyi.
      if (document.fonts?.ready) {
        await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 3000))]);
      }
      if (cancelled) return;

      // photoCta: fotoğraf YOKKEN de profil dairesinin yeri ayrılsın. Web kartının
      // ÖNİZLEMESİ de bunu yapıyor (BusinessCardModal'daki needCta) — embed'in
      // fotoğrafsız hâli web'dekiyle aynı görünmeli, ayrı bir düzen olmamalı.
      // TYRO'de fotoğrafı olmayan kullanıcı çok; bu istisna değil, sık hâl.
      const { canvas: card, layout } = await drawBusinessCardV2({
        qrCanvas, form, stg, office, company,
        profileBase64: payload.photo || null,
        photoCta: !payload.photo,
        L, lang, variant: VARIANT,
        ...v2Data(form, stg, office, company, L, lang),
      });
      if (cancelled) return;

      // Web önizlemesi boş dairenin üstüne "yükleme çağrısı" basıyor; embed'de yükleme
      // diye bir şey yok, o yüzden yerine BAŞ HARFLER yazılıyor.
      const initials = [payload.firstName, payload.lastName]
        .filter(Boolean).map(s => s.trim()[0]).join('').toLocaleUpperCase('tr-TR');
      if (!payload.photo && layout.avatar && initials) {
        const SCALE = 2; // drawBusinessCardV2'deki tuval ölçeğiyle AYNI
        const cx = card.getContext('2d');
        cx.save();
        // Üretici tuvale ctx.scale(2,2) uygulayıp GERİ ALMIYOR ve textBaseline'ı 'top'
        // bırakıyor. Devralınan duruma güvenmek yerine dönüşümü sıfırlayıp ölçeği
        // kendimiz uyguluyoruz — aksi halde ölçek iki kez biniyor (ölçüldü: harf
        // dairenin dışına taşıyordu).
        cx.setTransform(1, 0, 0, 1, 0, 0);
        cx.fillStyle = '#1e3a5f';
        cx.font = `600 ${Math.round(layout.avatar.r * 0.62 * SCALE)}px Inter, system-ui, sans-serif`;
        cx.textAlign = 'center';
        cx.textBaseline = 'middle';
        cx.fillText(initials, layout.avatar.cx * SCALE, layout.avatar.cy * SCALE);
        cx.restore();
      }

      const el = canvasRef.current;
      el.width = card.width;
      el.height = card.height;
      el.getContext('2d').drawImage(card, 0, 0);
      setNaturalW(card.width / 2); // tuval 2x ölçekli çiziliyor
      setStatus('ready');
      // Yükseklik CSS pikselinde: tuval 2x ölçekli çiziliyor ve genişliği %100'e
      // oturuyor, Thub'ın WebView'a vereceği yükseklik de oranla hesaplanmalı.
      requestAnimationFrame(() => {
        post({ type: 'tyrosign:size', height: Math.ceil(el.getBoundingClientRect().height) });
      });
    };

    const onMessage = (e) => {
      let msg;
      try { msg = JSON.parse(typeof e.data === 'string' ? e.data : ''); } catch (_) { return; }
      if (!msg || msg.type !== 'tyrosign:data') return;
      setStatus('drawing');
      render(msg.payload || {}).catch(err => {
        if (cancelled) return;
        setStatus('error');
        post({ type: 'tyrosign:error', message: String(err && err.message || err) });
      });
    };

    // iOS'ta `window`, bazı Android sürümlerinde `document` üzerinden geliyor.
    window.addEventListener('message', onMessage);
    document.addEventListener('message', onMessage);
    post({ type: 'tyrosign:ready', directory: directory() });

    return () => {
      cancelled = true;
      window.removeEventListener('message', onMessage);
      document.removeEventListener('message', onMessage);
    };
  }, []);

  return (
    <div style={{ margin: 0, padding: 0, background: 'transparent' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block', height: 'auto', margin: '0 auto',
          // dar ekranda küçülür (width:100%), geniş ekranda doğal boyunda kalır
          // ve ortalanır (maxWidth) — web arayüzündeki kuralın aynısı.
          width: '100%', maxWidth: naturalW ? `${naturalW}px` : undefined,
        }}
      />
      {status !== 'ready' && (
        <div style={{ font: '13px Inter, system-ui, sans-serif', color: '#888', padding: 12, textAlign: 'center' }}>
          {status === 'error' ? 'Kart çizilemedi' : 'Kartvizit bekleniyor…'}
        </div>
      )}
    </div>
  );
}
