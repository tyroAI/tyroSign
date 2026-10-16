// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPANY DIRECTORY — DEMO / kurgusal veri
// Şirket seçilince gelecek VARSAYILANLAR — kullanıcı sonradan değiştirebilir.
//
// Alanlar (hepsi opsiyonel):
//   legalName     : Resmi ticari ünvan — Klasik/V2/V3'te şirket adı SATIRINI değiştirir
//                   (tüm dillerde aynı). Hukuki uzantılar (A.Ş., Ltd, LLC vb.) otomatik
//                   temizlenir (stripLegalSuffix).
//   legalDisplay  : Gösterim override'ı — verilirse imzada AYNEN bu yazılır
//   website       : Varsayılan web sitesi (host formatı, stg.website ile aynı biçim)
//   officeId      : Varsayılan ofis (offices.js id'si) — adres + sabit tel (sdn) ofisten gelir
//   parentId      : Üst şirket (companies.js id'si) — sağ alt rozet logosu
//   relation      : 'affiliate' | 'subsidiary' — rozet etiketi (bar rengi de bundan türer)
//   linkedin      : Varsayılan şirket LinkedIn URL'i (kişisel LinkedIn girilirse o öncelikli)
//   linkedinLabel : Footer'da görünen kısa LinkedIn etiketi (ör. 'nexa')
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const COMPANY_DIRECTORY = {
  // ── Ana şirket ──
  'tyro-tech': {
    legalName: 'TYRO Tech Teknoloji Anonim Şirketi',
    officeId: 'ist-merkez',
  },

  // ── TYRO Yazılım ──
  'tyro-yazilim': {
    legalName: 'TYRO Yazılım ve Bilişim Hizmetleri A.Ş.',
    officeId: 'ist-teknopark',
  },
  'tyro-cloud': {
    legalName: 'TYRO Cloud Bulut Hizmetleri A.Ş.',
    officeId: 'ist-teknopark',
    parentId: 'tyro-yazilim', relation: 'affiliate',
  },
  'tyro-mobile': {
    officeId: 'izmir',
    parentId: 'tyro-yazilim', relation: 'affiliate',
  },
  'tyro-data': {
    officeId: 'ankara',
    parentId: 'tyro-yazilim', relation: 'affiliate',
  },

  // ── TYRO AI ──
  'tyro-ai': {
    legalName: 'TYRO Yapay Zeka Teknolojileri A.Ş.',
    officeId: 'ist-merkez',
  },
  'tyro-ai-labs': {
    officeId: 'ankara',
    parentId: 'tyro-ai', relation: 'affiliate',
  },
  'tyro-analytics': {
    officeId: 'antalya',
    parentId: 'tyro-ai', relation: 'affiliate',
  },
  'tyro-robotics': {
    officeId: 'bursa',
    parentId: 'tyro-ai', relation: 'affiliate',
  },

  // ── TYRO International ──
  'tyro-international': {
    officeId: 'amsterdam',
  },
  'tyro-europe': {
    legalName: 'TYRO Europe B.V.',
    officeId: 'amsterdam',
    parentId: 'tyro-international', relation: 'affiliate',
  },
  'tyro-mena': {
    legalName: 'TYRO MENA FZE',
    officeId: 'dubai',
    parentId: 'tyro-international', relation: 'affiliate',
  },
  'tyro-usa': {
    legalName: 'TYRO USA Inc',
    officeId: 'usa-sf',
    parentId: 'tyro-international', relation: 'affiliate',
  },

  // ── TYRO Ventures ──
  'tyro-ventures': {
    officeId: 'ist-merkez',
  },
  'nexa-studio': {
    legalName: 'Nexa Studio LLC',
    website: 'www.nexastudio.demo',
    officeId: 'usa-ny',
    parentId: 'tyro-ventures', relation: 'affiliate',
    linkedin: 'https://www.linkedin.com/company/nexa-studio-demo',
    linkedinLabel: 'nexa',
  },
  'orbit-apps': {
    legalName: 'Orbit Apps Ltd',
    website: 'www.orbitapps.demo',
    officeId: 'london',
    parentId: 'nexa-studio', relation: 'affiliate',
  },

  // ── TYRO Hizmetler ──
  'tyro-hizmetler': {
    officeId: 'ist-merkez',
  },
  'tyro-danismanlik': {
    legalName: 'TYRO Danışmanlık Hizmetleri Ltd. Şti.',
    officeId: 'ist-merkez',
    parentId: 'tyro-hizmetler', relation: 'affiliate',
  },
  'tyro-akademi': {
    officeId: 'ankara',
    parentId: 'tyro-hizmetler', relation: 'affiliate',
  },
  'tyro-digital': {
    legalName: 'TYRO Digital Solutions Bilişim Danışmanlık A.Ş.',
    legalDisplay: 'TYRO Digital Solutions',
    officeId: 'ist-teknopark',
    parentId: 'tyro-hizmetler', relation: 'affiliate',
  },
  'tyro-vakfi': {
    legalName: 'TYRO Eğitim ve Teknoloji Vakfı',
    officeId: 'ist-merkez',
    parentId: 'tyro-tech', relation: 'affiliate',
  },
};
