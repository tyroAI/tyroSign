// NOT: Etiketler ile ÜRETİCİLER birebir aynı sırada değil — kullanıcı isteğiyle
// birkaç kez takas/ekleme yapıldı. GÜNCEL EŞLEME:
//   "Klasik"      (1. sıra, VARSAYILAN) → classic-v4    (gri panel + İKİ kenar çubuğu)
//   "Klasik - V2" (YENİ)                → classic-v4-nl (Klasik'in aynısı, SOL çubuk YOK)
//   "Klasik - V3" (YENİ)                → classic-v4-nr (Klasik'in aynısı, SAĞ çubuk YOK)
//   "Klasik - V4"                       → classic-navy  (sağa hizalı, dikey lacivert bar)
//   "Klasik - V5"                       → classic       (eski lacivert bloklu klasik)
// NOT: "Klasik - V6" (classic-v3, ortada çift renk ayraç) 2026-09-16'da kullanıcı
//      isteğiyle TAMAMEN SİLİNDİ — üreticisi (genSigNavyV3.js) de kaldırıldı.
//      Geçiş riski yoktu: designId localStorage'a kaydedilmiyor (App.jsx:235),
//      her oturum varsayılan 'classic-v4' ile açılıyor.
// V2/V3 YENİ tasarımlar olduğu için eski V2/V3/V4 etiketleri birer aşağı kaydı;
// designId'ler DEĞİŞMEDİ (kullanıcıların localStorage'daki seçimi bozulmasın diye —
// designId zaten persist EDİLMİYOR ama üretici dağıtımı ve mini önizlemeler
// designId'ye bağlı; yeniden adlandırmak sessiz hata riski taşır).
// Etiket adları (designClassic*) i18n/translations.js'te; açıklamalar da bu eşlemeye göre.
// nl = no left (sol çubuk yok) · nr = no right (sağ çubuk yok)
export const DESIGNS = [
  { id: 'classic-v4', nameKey: 'designClassic' },
  { id: 'classic-v4-nl', nameKey: 'designClassicNavy' },   // YENİ: sol çubuk yok
  { id: 'classic-v4-nr', nameKey: 'designClassicV3' },     // YENİ: sağ çubuk yok
  { id: 'classic-navy', nameKey: 'designClassicV4' },
  { id: 'classic', nameKey: 'designClassicV5' },
  // hidden: true → tasarım SEÇİCİDE görünmez ama kayıt burada kalır.
  // Kurumsal geçici olarak gizlendi (kullanıcı isteği: "sonra ihtiyaç olduğunda tekrar
  // açarız"). Üretici (genSigCorporate), App.jsx'teki dağıtımı, çevirileri ve mini
  // önizlemesi olduğu gibi duruyor → tekrar açmak için TEK İŞ: aşağıdaki `hidden: true`
  // ifadesini silmek. Etiket çözümü (DesignSwitcher'daki find) gizli kayıtları da
  // bulmaya devam eder; yani bir şekilde seçili kalırsa düğmede doğru ad görünür.
  { id: 'corporate', nameKey: 'designCorporate', hidden: true },
];
