// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPANY DIRECTORY — DEMO / kurgusal veri
// Şirket seçilince gelecek VARSAYILANLAR — kullanıcı sonradan değiştirebilir.
//
// Alanlar (hepsi opsiyonel):
//   legalName     : Resmi ticari ünvan — Klasik/V2/V3'te şirket adı SATIRINI değiştirir
//                   (tüm dillerde aynı). Hukuki uzantılar (Inc, B.V., LLC vb.) otomatik
//                   temizlenir (stripLegalSuffix).
//   legalDisplay  : Gösterim override'ı — verilirse imzada AYNEN bu yazılır
//   website       : Varsayılan web sitesi (host formatı, stg.website ile aynı biçim)
//   officeId      : Varsayılan ofis (offices.js id'si) — adres + sabit tel (sdn) ofisten gelir
//   parentId      : Üst şirket (companies.js id'si) — sağ alt rozet logosu
//   relation      : 'affiliate' | 'subsidiary' — rozet etiketi (bar rengi de bundan türer)
//   linkedin      : Varsayılan şirket LinkedIn URL'i (kişisel LinkedIn girilirse o öncelikli)
//   linkedinLabel : Footer'da görünen kısa LinkedIn etiketi
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const COMPANY_DIRECTORY = {
  'tyro-tech': { officeId: 'ist-merkez' },

  'tyro-software': { officeId: 'ist-teknopark' },
  'tyro-cloud': { officeId: 'ist-teknopark', parentId: 'tyro-software', relation: 'affiliate' },

  'tyro-ai': { officeId: 'ist-merkez' },
  'tyro-labs': { officeId: 'ankara', parentId: 'tyro-ai', relation: 'affiliate' },

  'tyro-global': { officeId: 'amsterdam' },
  'tyro-europe': { legalName: 'tyroEurope B.V.', officeId: 'amsterdam', parentId: 'tyro-global', relation: 'affiliate' },

  'tyro-services': { officeId: 'ist-merkez' },
  'tyro-digital': { officeId: 'usa-sf', parentId: 'tyro-services', relation: 'affiliate' },
  'tyro-foundation': { officeId: 'ist-merkez', parentId: 'tyro-tech', relation: 'affiliate' },
};
