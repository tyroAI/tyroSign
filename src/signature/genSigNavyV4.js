import { escapeHtml, sanitizeUrl, titleCase, formatGSM } from '../utils/formatting';
import { solidPng } from './solidPng';
import { DEFAULT_LOGO_W, DEFAULT_LOGO_H } from '../constants/limits';
import { sigBannerRows } from './sigBannerRows';
import { wrapToWidth } from './wrapToWidth';
import { linkedinBlueSvg } from '../icons/svgDataUris';

// Gri panelin zemini — App.jsx rozet görselinin alfasını BU renkle düzleştirmek için
// import eder. Tek kaynak: renk değişirse rozetin dolgusu da otomatik takip eder.
export const V4_PANEL_BG = '#f8f8f8';

// ── Kenar çubukları: DÜZ RENK PNG (10x2 px, colorType 2 = ALFA KANALI YOK) ──
// Word/eski Outlook bir <img>'i ASLA bölemez ve boyunu yeniden yorumlamaz. Boş bir
// bgcolor hücresini ise TEK BOŞ PARAGRAF kadar boyayıp gerisini beyaz bırakıyor —
// çubukların "kesik kesik" görünmesinin sebebi buydu (bkz. V3'ün aynı savaşı:
// 053f291 → 240d8a3 → 6eb6d94 → 2af329b → f90d939).
// Kaynak 10px GENİŞ → yatayda ölçekleme yok, yalnızca dikeyde esner; düz renk olduğu
// için interpolasyon aynı rengi verir. Alfa olmadığı için Word'ün "saydamlığı beyaza
// matlaştırma" yolu da devre dışı kalır.
// Çubuk PNG'leri artık çalışma anında üretiliyor (solidPng) → renk değişince
// gömülü görselin eski renkte kalması imkânsız.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KLASİK - V4 SIGNATURE GENERATOR (müşteri kartvizit tasarımı, 2026)
// İki panel yan yana, toplam 600px:
//   [ 10px TYRO MAVİSİ çubuk ][ 280px BEYAZ panel ][ 300px GRİ panel ][ 10px HİYERARŞİ çubuğu ]
//   • Sol çubuk HER ZAMAN tyro mavisi (#232c5e) — şirket/seviye ne olursa olsun
//   • Sağ çubuk seviyeye göre: 1 (ana) lacivert • 2 (grup şirketi) tyro mavisi
//     • 3 (iştirak) tyro altını → s.navyLevel (App.jsx hesaplar)
//   • BEYAZ panel: üstte logo (panel genişliğine ölçekli), ALTTA web sitesi (bold mavi)
//     + LinkedIn ikonu ve etiketi — tasarımdaki "social media link" satırı
//   • GRİ panel (#f2f2f2): ad SOYAD, ünvan, resmi ünvan, adres, Pbx/Fax/Gsm
//     (tasarımda ikon değil METİN etiket), e-posta (lokal kısım bold), altta rozet
// Eski Outlook (Word motoru) uyumu:
//   • border-radius YOK — müşteri görselindeki yuvarlak köşeler Word'de bozulur
//   • Çubuklar ALFASIZ düz renk PNG (10x2) + YEDEK bgcolor; boy = barH (satırın gerçek
//     boyu, sol panelden türer). Word bir resmi bölemez. NOT: eskiden burada "tek
//     satırlık bgcolor hücresi — V2'de kanıtlanmış" yazıyordu, bu YANLIŞTI: ofis
//     testinde çubuklar kesik çıktı. V2 (genSigNavy.js) hâlâ aynı bozuk desende.
//   • rgba/SVG yerine solid hex + PNG; boşluklar spacer satırı/td padding ile
//   • Her hücreye bgcolor (yapıştırmada "Merge Formatting" ve dark mode dayanıklılığı)
// Sol panelin alt satırı (web/LinkedIn) gri panelin ALT hizasına oturması için gri
// panelin yüksekliği satır satır HESAPLANIR (line-height'lar mso-exactly ile sabit).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Klasik tasarım. opts.bars ile KENAR ÇUBUKLARI seçilir (kullanıcı isteği:
 * "Klasik'in aynısı ama soldaki çubuk olmayacak" / "...sağdaki çubuk olmayacak").
 *   'both'  → sol mavi + sağ hiyerarşi çubuğu (VARSAYILAN, ana Klasik)
 *   'right' → SOL çubuk YOK; onun 10px'i beyaz panele geçer
 *   'left'  → SAĞ çubuk YOK; onun 10px'i gri panele geçer
 * Toplam genişlik HER varyantta 600px kalır (imzanın ayak izi değişmiyor,
 * table-layout:fixed sütun hesabı bozulmuyor).
 * NOT: hiyerarşi rengini SAĞ çubuk taşır → 'left' varyantında (sağ çubuk yok)
 * hiyerarşi rengi imzada görünmez olur; bu tasarımın doğal sonucu.
 */
export const genSigNavyV4 = (f, s, office, sigBanner, opts = {}) => {
  const firstName = escapeHtml(titleCase(f.firstName));
  const lastName = f.lastName ? escapeHtml(f.lastName.toLocaleUpperCase('tr-TR')) : '';
  const name = [firstName, lastName].filter(Boolean).join(' ');
  // İki ünvan AYRAÇLA değil ALT SATIRA yazılır (kullanıcı isteği): uzun ünvanlarda
  // "EN | TR" tek satıra sığmayıp zaten sarıyordu — ayrı satır hem daha okunur hem
  // yükseklik hesabı kesinleşir (sarma tahmin edilemiyordu, artık sarma yok).
  const titleLines = [escapeHtml(titleCase(f.titleEN)), escapeHtml(titleCase(f.titleTR))].filter(Boolean);
  // Resmi ticari ünvan (companyDirectory) varsa onu göster; yoksa kısa şirket adı
  const companyName = escapeHtml(s.companyLegalName || s.companyName || '');

  const WHITE = '#ffffff';
  // Sağ panel zemini: müşteri görselindeki gri iki kez açıldı (kullanıcı isteği)
  // #f2f2f2 → #f6f6f6 → #f8f8f8. Daha açığa gitmek panelin beyaz zeminden
  // ayrıldığını belirsizleştirir; sınır bu civarda. Modül kapsamındaki
  // V4_PANEL_BG'den gelir — rozet alfa düzleştirmesi de aynı rengi kullanıyor.
  const GRAY = V4_PANEL_BG;
  // TYRO logosunun gerçek üç rengi (logo piksellerinden örneklendi — V3 ile aynı)
  const BLUE = '#232c5e';    // tyro mavisi (wordmark laciverti)
  const SKY = '#0098d4';     // tyro mavisi (uygulama vurgu rengi)
  const GOLD = '#c8922a';    // tyro altını
  // Sağ çubuk = hiyerarşi rengi; seviye bilinmiyorsa mavi
  const barColor = ({ 1: BLUE, 2: SKY, 3: GOLD })[s.navyLevel] || BLUE;

  const cDark = '#26292e';   // ad SOYAD / resmi ünvan / e-posta lokali
  const cGray = '#54585c';   // ünvan / adres / telefonlar / e-posta domaini
  const cSoft = '#8b9299';   // rozet etiketi (bold-italik açık gri)

  // ── Ölçüler (600px toplam) ──
  const BAR = 10;                            // kenar çubuklarının genişliği
  const bars = opts.bars || 'both';          // 'both' | 'right' (sol yok) | 'left' (sağ yok)
  const hasLeftBar = bars === 'both' || bars === 'left';
  const hasRightBar = bars === 'both' || bars === 'right';
  const LEFT_BLOCK = 290;                    // müşteri görselindeki "290 px" ölçüsü (çubuk dahil)
  // Kalkan çubuğun 10px'i komşu panele geçer → tablo HER VARYANTTA 600px.
  const LEFT_W = LEFT_BLOCK - BAR + (hasLeftBar ? 0 : BAR);          // 280 · sol çubuksuz 290
  const RIGHT_W = 600 - LEFT_BLOCK - BAR + (hasRightBar ? 0 : BAR);  // 300 · sağ çubuksuz 310
  // İç marjlar ve satır yükseklikleri Klasik'e (V3) yakın toplam yükseklik verecek
  // şekilde sıkı tutuldu — ilk sürüm ~40px daha uzundu (kullanıcı geri bildirimi).
  const LPADL = 18, LPADR = 12, LPADT = 16, LPADB = 14;  // beyaz panel iç marjları
  const RPADL = 18, RPADR = 14, RPADT = 18, RPADB = 14;  // gri panel iç marjları
  const FOOT_H = 16;                         // web/LinkedIn satırının yüksekliği

  // ── Logo: beyaz panele ölçeklenir. Sağda tasarımdaki gibi nefes payı bırakılır
  // (logo panelin kenarına DAYANMAZ) → ayrıca sol hücrenin min-content genişliği
  // 280px'in altında kalır, tablo sütun genişlikleri sapmaz.
  const natW = s.logoW || 140, natH = s.logoH || 45;
  const LOGO_GUTTER = 40;                    // logonun sağındaki boşluk
  const maxLW = LEFT_W - LPADL - LOGO_GUTTER; // 222
  // Yükseklik sınırı görsel ağırlığı EŞİTLER: ana tyro logosunun oranı 3.14,
  // şirket logolarının 3.90 → sabit genişlikte tyro 71px, diğerleri 57px yüksekliğe
  // geliyordu ve tyro bir tık büyük duruyordu (kullanıcı geri bildirimi).
  // 64px sınırı yalnızca tyro'yi 222x71 → 199x64 küçültür, geniş logolara dokunmaz.
  //
  // KARE/KOMPAKT ve DİKEY logolar için 64px sınırı ÇOK sert (kare logolar 1:1, tyroFoundation 0.75):
  // logo panelde kaybolup gidiyordu. Bu logolarda sınır artık SABİT DEĞİL, panelde
  // GERÇEKTEN BOŞ OLAN yüksekliğe bağlanıyor — hesap rightH bilindikten sonra yapılır,
  // bkz. aşağıdaki "LOGO ÖLÇÜSÜ" bloğu.
  // ── GRİ PANEL satırları: [html, üst boşluk, satır yüksekliği] ──
  // Yükseklikler sabit (mso-line-height-rule:exactly) → panel yüksekliği hesaplanabilir.
  const rows = [];
  rows.push([`<span style="font-size:15px;font-weight:bold;color:${cDark};">${name || 'Ad SOYAD'}</span>`, 0, 20]);
  // Her ünvan kendi satırında; ilki isimden 1px ayrılır, ikincisi ilkine bitişik durur
  titleLines.forEach((t, i) => rows.push([`<span style="font-size:12px;color:${cGray};">${t}</span>`, i === 0 ? 1 : 0, 16]));
  if (companyName) rows.push([`<span style="font-size:12px;font-weight:bold;color:${cDark};">${companyName}</span>`, 8, 17]);
  if (s.showAddress !== false && office) {
    // ADRES ÖLÇÜLEREK SATIRLANIR. Eskiden tek satır varsayılıp yüksekliği 15px'e
    // kilitleniyordu; panele sığmayan uzun adresler (ör. bölge adı + mahalle + bulvar)
    // tarayıcıda sarıyor ama Word `exactly` yüzünden ikinci satırı KIRPIYORDU.
    // Artık her satır kendi 15px'lik kaydını alıyor → contentH gerçeğe uyuyor,
    // panel/çubuk yükseklikleri ve beyaz panel hizası kendiliğinden doğru kalıyor.
    const addrAvail = RIGHT_W - RPADL - RPADR;
    const addrLines = wrapToWidth(office.address, addrAvail, '11px Arial, sans-serif');
    addrLines.forEach((ln, i) => rows.push([
      `<span style="font-size:11px;color:${cGray};">${escapeHtml(ln)}</span>`,
      i === 0 ? (companyName ? 1 : 8) : 0, 15,
    ]));
    rows.push([`<span style="font-size:11px;color:${cGray};">${escapeHtml(office.city)}</span>`, 0, 15]);
  }
  // Telefonlar TEK SATIRDA ve Klasik'teki gibi İKONLU (metin etiket yok) — iki ayrı
  // satır imzayı gereksiz uzatıyordu. İkonlar App.jsx'te koyuya boyanır (s.navyIcons);
  // henüz yüklenmediyse metin etikete düşer. Ofis verisinde fax alanı boş olduğu için
  // pratikte satır Gsm + Pbx'ten oluşur ve 268px'lik gri panele sığar.
  const ic = s.navyIcons;
  // İki sürümlü görsel: SAYDAM olanı modern istemcilere, panel rengiyle DÜZLEŞTİRİLMİŞ
  // olanı yalnızca eski Outlook'a. Sebep iki motorun ZIT davranışı:
  //   • Apple Mail (ve diğerleri) karanlık modda zemini koyulaştırıyor ama raster
  //     görseli çeviremiyor → opak açık-gri görsel karanlıkta BEYAZ KUTU olarak çıkıyor
  //     (kullanıcı bildirimi). Saydam sürümde koyu zemin görselin arkasından geçiyor.
  //   • Word (eski Outlook) saydamlığı hücrenin bgcolor'ıyla harmanlamayıp BEYAZA
  //     matlaştırıyor → orada düzleştirilmiş kopya şart.
  // [if mso] koşullu yorumu depoda üretimde kullanılıyor (genSigCorporate) → pano
  // yolundan sağ çıktığı kanıtlı. Aralarında BOŞLUK YOK: istemcide fazladan metin
  // düğümü oluşmasın.
  const dualImg = (transparent, mso, attrs) => (mso && mso !== transparent)
    ? `<!--[if !mso]><!--><img src="${transparent}" ${attrs} /><!--<![endif]--><!--[if mso]><img src="${mso}" ${attrs} /><![endif]-->`
    : `<img src="${transparent}" ${attrs} />`;
  const mkIcon = (src, srcMso) => dualImg(src, srcMso, 'width="12" height="12" alt="" style="vertical-align:middle;border:0;"') + '&nbsp;';
  const telItems = [];
  // showGsm false ise GSM satırı ÇIKMAZ — yalnız sabit hat kalır (kullanıcı isteği,
  // GSM alanındaki 'Gizle' anahtarı). showSDN/showFax ile aynı desen.
  if (s.showGsm !== false && f.gsm) telItems.push((ic && ic.mobile ? mkIcon(ic.mobile, ic.mobileMso) : 'Gsm:&nbsp;') + `<span style="vertical-align:middle;">${escapeHtml(formatGSM(f.gsm))}</span>`);
  const landline = [];
  if (s.showSDN !== false && office?.sdn) landline.push(escapeHtml(office.sdn));
  if (s.showFax !== false && office?.fax) landline.push(`Fax: ${escapeHtml(office.fax)}`);
  if (landline.length) telItems.push((ic && ic.phone ? mkIcon(ic.phone, ic.phoneMso) : 'Pbx:&nbsp;') + `<span style="vertical-align:middle;">${landline.join('&nbsp;&nbsp;')}</span>`);
  // Telefon satırının ÜSTÜNDE boşluk yok (kullanıcı isteği) → adres bloğuyla bitişik
  if (telItems.length) rows.push([`<span style="font-size:11px;color:${cGray};">${telItems.join('&nbsp;&nbsp;&nbsp;')}</span>`, 0, 17]);
  // showEmail false ise e-posta satırı ÇIKMAZ (GSM'deki 'Gizle' anahtarıyla aynı desen).
  if (s.showEmail !== false && f.email) {
    // Lokal kısım BOLD DEĞİL (kullanıcı isteği — müşteri görselinde bold'du);
    // ayrım yalnızca renkle: lokal koyu, domain gri.
    const mail = escapeHtml(f.email);
    const at = mail.indexOf('@');
    const mailHtml = at > 0
      ? `<span style="color:${cDark};">${mail.slice(0, at)}</span><span style="color:${cGray};">${mail.slice(at)}</span>`
      : `<span style="color:${cDark};">${mail}</span>`;
    // Başına ZARF ikonu — eskiden "@" metni vardı ama e-posta adresinin içinde de @
    // olduğu için tekrar ediyordu (kullanıcı isteği). İkon telefon satırındakilerle
    // aynı boyutta ve aynı çift-sürüm (saydam / mso-düzleştirilmiş) yolundan geçiyor.
    // İkon henüz yüklenmediyse eski "@" önekine düşer.
    const mailPrefix = (ic && ic.mail) ? mkIcon(ic.mail, ic.mailMso) : `<span style="color:${cGray};">@</span>&nbsp;`;
    rows.push([`<a href="mailto:${mail}" style="text-decoration:none;font-size:11px;color:${cDark};">${mailPrefix}${mailHtml}</a>`, 1, 16]);
  }

  // ── Gri panelin sağ altındaki hiyerarşi rozeti (seviye 1 → rozet yok) ──
  // EN SAĞA yaslı (kullanıcı isteği). Yaslama float/margin:auto ile DEĞİL — Word ikisini
  // de yok sayar — hücre İÇİ satır içi hizalamayla (`align="right"`) yapılır. Eskiden
  // genişliği %100 olan içi boş İTİCİ HÜCRE kullanılıyordu; eski Outlook'ta beyaz şerit
  // bıraktığı için kaldırıldı (gerekçe aşağıda). Metin satırlarındaki colspan="3"
  // o yapıdan kalma, zararsız: her satır tam genişliği kaplıyor.
  const BADGE_PT = 8, BADGE_H = 17;
  let badgeRow = '';
  if (s.navyBadge && s.navyBadge.base64 && s.navyBadge.label) {
    const bw = s.navyBadge.h ? Math.max(1, Math.round(s.navyBadge.w * BADGE_H / s.navyBadge.h)) : BADGE_H;
    // ⚠️ ESKİ OUTLOOK'TA ROZETİN SOLUNDA BEYAZ ÇİZGİ (kullanıcı bildirdi: "gri bölümün
    // alt kısmında beyaz hafif kalın bir çizgi, sonra rozet geliyor").
    // KÖK NEDEN: rozeti sağa yaslamak için genişliği %100 olan İÇİ BOŞ İTİCİ HÜCRE
    // kullanılıyordu — CLAUDE.md'nin "içi boş + bgcolor hücresi" YASAĞININ tam örneği.
    // Word hücre gölgelemesini hücrenin İÇİNDEKİ paragraf kutusunun arkasına çizer;
    // `font-size:0;line-height:0`lı `&nbsp;` kutusu sıfıra çöktüğü için gri boyanmıyor,
    // kalan yükseklikte tablonun BEYAZI görünüyordu. Üstelik itici hücrede rozet
    // hücrelerindeki `padding-top:8px` de yoktu → boyanan ince şerit rozetten 8px
    // yukarıda kalıyor, tam rozetin hizasında beyaz bir bant bırakıyordu.
    //
    // ÇÖZÜM: itici hücre TAMAMEN KALDIRILDI. Yaslama artık hücre İÇİNDE, satır içi
    // hizalamayla yapılıyor (`align="right"` + `text-align:right`) — bu eski HTML
    // niteliği Word'ün güvenilir uyguladığı bir mekanizma (yok saydığı şeyler
    // float ve margin:auto'ydu, o yüzden itici hücreye başvurulmuştu). Boyanacak
    // boş hücre kalmadığı için beyaz şerit üretecek bir yer de yok.
    // Rozet görseli artık satır içi: display:inline-block + vertical-align:middle.
    const badgeImg = dualImg(
      s.navyBadge.base64, s.navyBadge.base64Mso,
      `width="${bw}" height="${BADGE_H}" alt="" style="display:inline-block;border:0;vertical-align:middle;"`
    );
    badgeRow = `<tr bgcolor="${GRAY}">`
      + `<td colspan="3" align="right" bgcolor="${GRAY}" style="background-color:${GRAY};`
      + `text-align:right;padding-top:${BADGE_PT}px;font-family:Arial,sans-serif;`
      + `line-height:${BADGE_H}px;mso-line-height-rule:exactly;white-space:nowrap;">`
      + badgeImg
      // Görsel ile etiket arası boşluk &nbsp; ile veriliyor, padding/margin ile DEĞİL:
      // bu dosyanın kuralı (Word satır içi öğelerde ikisini de yok sayabiliyor, o
      // durumda etiket rozete yapışırdı). İki &nbsp; ≈ 6px, eski 5px'in yerine.
      + `<span style="font-style:italic;font-size:11px;color:${cSoft};`
      + `font-family:Arial,sans-serif;line-height:${BADGE_H}px;vertical-align:middle;">`
      + `&nbsp;&nbsp;${escapeHtml(s.navyBadge.label)}</span>`
      + `</td></tr>`;
  }

  // ── BEYAZ panel alt satırı: web sitesi (bold mavi) + LinkedIn ──
  const usingPersonalLi = !!(f.linkedinPersonal && f.linkedinPersonal.trim());
  const linkedinUrl = sanitizeUrl((f.linkedinPersonal && f.linkedinPersonal.trim()) || s.social.linkedin);
  const derivedLiHandle = linkedinUrl ? linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/(company\/|in\/)?/i, '').replace(/\/$/, '').replace(/-/g, '') : '';
  // Şirket LinkedIn'inde directory kısa etiketi tercih edilir; kişisel girildiyse türetilen kalır
  const linkedinHandle = usingPersonalLi ? derivedLiHandle : (s.linkedinLabel || derivedLiHandle);
  const websiteDisplay = s.website ? s.website.replace(/^www\./i, '') : '';
  const footItems = [];
  // Site ve LinkedIn etiketi İTALİK (diğer klasik tasarımlarla aynı üslup)
  if (s.showWebsite !== false && websiteDisplay) footItems.push(`<a href="${sanitizeUrl(s.website)}" style="color:${BLUE};font-size:11px;font-weight:bold;font-style:italic;text-decoration:none;">${escapeHtml(websiteDisplay)}</a>`);
  if (s.showLinkedin !== false && linkedinUrl) footItems.push(`<a href="${linkedinUrl}" target="_blank" style="text-decoration:none;"><img src="${linkedinBlueSvg}" width="12" height="12" alt="in" style="vertical-align:-2px;border:0;" />&nbsp;<span style="color:${cGray};font-size:11px;font-style:italic;">${linkedinHandle || 'LinkedIn'}</span></a>`);
  const hasFoot = footItems.length > 0;

  // ── Panel yükseklikleri: hesap WORD'ü modeller, tarayıcıyı değil ──
  // Satır yükseklikleri mso-line-height-rule:exactly ile kilitli olduğundan Word satırı
  // TAM pt+L piksel diziyor; tarayıcı ise font metriği yüzünden satır başına ~1px daha
  // büyütüyor. Eskiden hesaba satır başına +1px "tarayıcı payı" eklenmişti → Word'de iki
  // panelin fazlalığı FARKLI oluyordu (beyaz ~6px, gri ~14px) ve valign="bottom" yüzünden
  // bu fark ÜSTTE boşluk + isim/logo hizasızlığı olarak görünüyordu (eski Outlook
  // bildirimi). Pay kaldırıldı: artık Word'de iki panel de TAM hesaplanan boyda →
  // fazlalık 0, hiza kusursuz. Tarayıcıda satırlar birkaç px büyüyor; o fazlalık
  // logonun ÜSTÜNDEKİ görünmez beyaz boşluğa gider (alt satır ve rozet valign="bottom"
  // olduğu için hizalarını korur) ve çubuğun eksik kalan kısmını hücrenin bgcolor'ı
  // kapatır — tarayıcıda hücre boyaması satırın TAMAMINI kaplar, sorun yaşanan motor
  // Word'dü ve orada artık kilitli.
  const contentH = rows.reduce((acc, [, pt, L]) => acc + pt + L, 0) + (badgeRow ? BADGE_PT + BADGE_H : 0);
  const rightH = RPADT + contentH + RPADB;
  // ── LOGO ÖLÇÜSÜ (rightH BİLİNDİKTEN SONRA) ──
  // Geniş wordmark'lar (oran ≥ 2.5) genişlikten sınırlanır, yükseklik 64'te kalır —
  // görsel ağırlık eşitlensin diye (eski kural, dokunulmadı).
  // KARE/DİKEY logolarda ise yükseklik sınırı SABİT 92px'ti ve dikey logo (tyroFoundation 0.75)
  // 69px genişliğe düşüp panelde kayboluyordu (kullanıcı bildirimi: "logodaki yazılar
  // bile okunmuyor"). Oysa sol panelde KULLANILMAYAN yükseklik vardı: gapH boşluğu
  // gri panelle farkı emiyordu (ölçüldü: logo 92px iken 80px boş pay).
  // Artık sınır o boşluktan türetiliyor → logo mevcut yeri DOLDURUR, imza UZAMAZ:
  //   avail = rightH − üst marj − alt satır − alt marj − asgari boşluk(20)
  // Taban 92 (asla bugünkünden küçük olmaz), tavan 150 (aşırı büyümesin).
  // Logo ile alt satır arasındaki ASGARİ boşluk: geniş wordmark'larda 20px (tasarımdaki
  // nefes payı, dokunulmadı); yükseklikten sınırlanan kare/dikey logolarda 8px, çünkü
  // orada her piksel logoya gidiyor ve 20px'lik pay görsel olarak israf oluyordu.
  // DEMO — TEK TİP LOGO KUTUSU: şirket logoları tyroTech ile AYNI düzen/yükseklikte
  // üretildiği için hepsi tyroTech'in kapladığı kutuya (maxLW × LOGO_BOX_H) sığdırılır.
  // Kısa adlar tyroTech ile birebir aynı yazı boyutunda çıkar; uzun adlar genişliğe
  // sığsın diye orantılı küçülür → hiçbir logo tyroTech'ten büyük görünmez.
  const LOGO_BOX_H = Math.round(maxLW * DEFAULT_LOGO_H / DEFAULT_LOGO_W); // 222 × 61/140 ≈ 97
  const MIN_GAP = 8;
  const sc = Math.min(maxLW / natW, LOGO_BOX_H / natH);
  const lw = Math.max(1, Math.round(natW * sc));
  const lh = Math.max(1, Math.round(natH * sc));
  // Logonun içindeki şeffaf sol boşluk da ölçeklenir → alt satır logonun GÖRÜNEN
  // sol kenarıyla hizalanır (tasarımda web adresi logo ile aynı hizada başlıyor)
  const logoOffset = Math.round((s.logoLeftOffset || 0) * sc);

  const logo = s.logoBase64
    ? `<img src="${s.logoBase64}" width="${lw}" height="${lh}" alt="Logo" style="display:block;border:0;" />`
    : `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:middle;padding-right:6px;"><div style="width:40px;height:40px;background:${BLUE};text-align:center;line-height:40px;"><span style="font-family:Georgia,serif;font-size:26px;font-weight:bold;color:#c8922a;">T</span></div></td><td style="vertical-align:middle;"><span style="font-family:Georgia,serif;font-size:20px;font-weight:bold;color:${BLUE};letter-spacing:1.5px;">tyro</span></td></tr></table>`;

  const leftFixed = LPADT + lh + (hasFoot ? FOOT_H : 0) + LPADB;
  const gapH = Math.max(MIN_GAP, rightH - leftFixed);

  // Çubuk boyu = iki panelin WORD'deki boyunun büyüğü. PAY EKLENMEZ: pay eklenince resim
  // satırın en uzun ögesi olup satırı gerdiriyor ve fazlalık (valign bottom yüzünden)
  // üstte boşluk olarak görünüyordu. Word'de satırlar kilitli olduğu için bu sayı
  // orada TAM tutar → çubuk ne kısa kalır ne satırı gerdirir.
  // rightH TEK BAŞINA YETMEZ: az veri senaryosunda gapH 20'ye clamp'lenir ve sol panel
  // daha uzun olur → çubuk kısa kalırdı.
  const leftH = leftFixed + (hasFoot ? gapH : 0);
  const barH = Math.max(rightH, leftH);

  // Responsive: dar ekranda paneller alt alta; çubuklar tam genişlik ince şeride döner
  const sigCSS = `<style>@media screen and (max-width:480px){.sgn4-table{width:100%!important;table-layout:auto!important}.sgn4-left,.sgn4-right{display:block!important;width:100%!important;box-sizing:border-box!important}.sgn4-bar{display:block!important;width:100%!important;height:5px!important;font-size:0!important;line-height:0!important}.sgn4-barin{width:100%!important;height:5px!important}.sgn4-left{text-align:center!important;padding:16px 16px 14px!important}.sgn4-left table{margin:0 auto!important}.sgn4-left img{margin:0 auto!important}.sgn4-lfoot{text-align:center!important;padding-left:0!important}.sgn4-right{padding:16px 16px 18px!important}.sgn4-gap{display:none!important}}</style>`;

  // Çubuk hücreleri ÇİFT KATMAN:
  //  1) RESİM (asıl taşıyıcı) — alfasız düz renk PNG, boyu barH. Word bir resmi bölemez.
  //  2) hücrenin bgcolor'ı + height (yedek) — tarayıcı td zeminini zaten tam satır boyu
  //     boyar; Word gölgelemeyi doğru uygularsa resimle AYNI renk olduğu için fark
  //     görünmez, uygulamazsa çubuğu resim taşır. Resim engellenirse zemin devralır.
  // vertical-align:top → olası 1-3px sapma en ALT kenarda, panelin alt iç boşluğunda kalır.
  // class="sgn4-barin" resimde KALIR → mobil media query (width:100%;height:5px !important)
  // hem width niteliğini hem inline style'ı ezer, responsive davranış aynı.
  const barTd = (color) => `<td class="sgn4-bar" width="${BAR}" height="${barH}" bgcolor="${color}" style="width:${BAR}px;height:${barH}px;background-color:${color};font-size:0;line-height:0;vertical-align:top;"><img class="sgn4-barin" src="${solidPng(color, BAR, 2)}" width="${BAR}" height="${barH}" alt="" style="display:block;border:0;width:${BAR}px;height:${barH}px;" /></td>`;

  // Beyaz panel: logo → (hesaplanan boşluk) → web/LinkedIn satırı
  const leftInner = `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">` +
    `<tr><td bgcolor="${WHITE}" style="background-color:${WHITE};font-size:0;line-height:0;">${logo}</td></tr>` +
    (hasFoot
      // mso-line-height-rule:exactly → Word bu boşluğu TAM gapH piksel dizer; sol panelin
      // boyu böylece deterministik olur ve barH ile birebir tutar.
      ? `<tr><td class="sgn4-gap" height="${gapH}" bgcolor="${WHITE}" style="height:${gapH}px;font-size:0;line-height:${gapH}px;mso-line-height-rule:exactly;background-color:${WHITE};">&nbsp;</td></tr>` +
        // nowrap YOK: sabit sütun genişliğinde uzun site+etiket gri panele taşabilirdi;
        // taşmak yerine alt satıra kaysın (yükseklik zaten esnek).
        `<tr><td class="sgn4-lfoot" bgcolor="${WHITE}" style="background-color:${WHITE};padding-left:${logoOffset}px;font-family:Arial,sans-serif;line-height:${FOOT_H}px;mso-line-height-rule:exactly;">${footItems.join('&nbsp;&nbsp;&nbsp;')}</td></tr>`
      : '') +
    `</table>`;

  // Gri panel: bilgi satırları (colspan=3, tam genişlik) + sağa yaslı rozet satırı.
  // Tablo width=100% olmalı, yoksa itici hücre panelin tamamını kaplamaz.
  const rightInner = `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">` +
    rows.map(([html, pt, L]) =>
      `<tr><td colspan="3" bgcolor="${GRAY}" style="background-color:${GRAY};${pt ? `padding-top:${pt}px;` : ''}font-family:Arial,sans-serif;line-height:${L}px;mso-line-height-rule:exactly;">${html}</td></tr>`
    ).join('') +
    badgeRow +
    `</table>`;

  return sigCSS +
    // table-layout:fixed → tarayıcı sütun genişliklerini içeriğe göre YENİDEN
    // DAĞITMAZ (auto düzende beyaz panel 280 yerine 300px oluyordu; ölçüldü).
    // Word bu özelliği yok sayar, zaten td width'lerini kullanır → iki tarafta da 290/300.
    `<table class="sgn4-table" bgcolor="${WHITE}" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px; max-width:600px; table-layout:fixed; background-color:${WHITE}; font-family:Arial,sans-serif; border-collapse:collapse;">` +
    `<tr>` +
      (hasLeftBar ? barTd(BLUE) : '') +
      // box-sizing:border-box → table-layout:fixed'de iç marjlar sütun genişliğine
      // EKLENMEZ (eklenince tablo 600 yerine 662px oluyordu; ölçüldü). Word bu
      // özelliği yok sayar ama zaten hücre genişliğini iç marj DAHİL hesaplar.
      // valign="bottom" (+CSS): İKİ PANEL DE ALTA ÇIPALI. Böylece sol paneldeki
      // web/LinkedIn satırı ile gri paneldeki rozet, ikisi de kendi hücresinin
      // ALTINDAN aynı marj kadar (LPADB == RPADB) yukarıda durur → hizaları
      // hangi motor/DPI olursa olsun eşit. Üst-hizalıyken sol panelin alt satırı
      // hesaplanan boşlukla konumlanıyordu ve tarayıcının satır yuvarlaması
      // (DPI'a göre 1-2px/satır) rozetle arasında kayma yaratıyordu.
      // Hesap hatası artık logonun ÜSTÜNDEKİ boşluğa gider — görünmez.
      `<td class="sgn4-left" width="${LEFT_W}" valign="bottom" bgcolor="${WHITE}" style="width:${LEFT_W}px;box-sizing:border-box;background-color:${WHITE};vertical-align:bottom;padding:${LPADT}px ${LPADR}px ${LPADB}px ${LPADL}px;">${leftInner}</td>` +
      `<td class="sgn4-right" width="${RIGHT_W}" valign="bottom" bgcolor="${GRAY}" style="width:${RIGHT_W}px;box-sizing:border-box;background-color:${GRAY};vertical-align:bottom;padding:${RPADT}px ${RPADR}px ${RPADB}px ${RPADL}px;">${rightInner}</td>` +
      (hasRightBar ? barTd(barColor) : '') +
    `</tr>` +
    // colspan SÜTUN SAYISINA göre: çubuk kalkınca 4 değil 3 olur, yoksa banner
    // satırı tabloyu bozar (sessiz hata).
    sigBannerRows(sigBanner, 2 + (hasLeftBar ? 1 : 0) + (hasRightBar ? 1 : 0)) +
    `</table>`;
};
