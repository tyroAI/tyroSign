// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPANIES (TYRO Tech Grup Şirketleri — DEMO / kurgusal veri)
// Her şirketin logoTR / logoEN alanı public/logos/ altındaki PNG'lere işaret eder.
// Dil seçimine göre doğru logo runtime'da yüklenir.
// Grup başı = adı grup adıyla AYNI olan şirket (rozet hiyerarşisi buna dayanır).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BASE = import.meta.env.BASE_URL + 'logos/';
const logo = (id) => ({ logoTR: BASE + id + '-tr.png', logoEN: BASE + id + '-en.png' });

export const COMPANIES = [
  // ── Ana Şirket ── (logo null → varsayılan TYRO Tech logosu)
  { id: 'tyro-tech', group: 'Ana Şirket', name: 'TYRO Tech', nameEN: 'TYRO Tech', logoTR: null, logoEN: null },

  // ── TYRO Yazılım ──
  { id: 'tyro-yazilim', group: 'TYRO Yazılım', name: 'TYRO Yazılım', nameEN: 'TYRO Software', ...logo('tyro-yazilim') },
  { id: 'tyro-cloud', group: 'TYRO Yazılım', name: 'TYRO Cloud', nameEN: 'TYRO Cloud', ...logo('tyro-cloud') },
  { id: 'tyro-mobile', group: 'TYRO Yazılım', name: 'TYRO Mobile', nameEN: 'TYRO Mobile', ...logo('tyro-mobile') },
  { id: 'tyro-data', group: 'TYRO Yazılım', name: 'TYRO Data', nameEN: 'TYRO Data', ...logo('tyro-data') },

  // ── TYRO AI ──
  { id: 'tyro-ai', group: 'TYRO AI', name: 'TYRO AI', nameEN: 'TYRO AI', ...logo('tyro-ai') },
  { id: 'tyro-ai-labs', group: 'TYRO AI', name: 'TYRO AI Labs', nameEN: 'TYRO AI Labs', ...logo('tyro-ai-labs') },
  { id: 'tyro-analytics', group: 'TYRO AI', name: 'TYRO Analytics', nameEN: 'TYRO Analytics', ...logo('tyro-analytics') },
  // Logosuz şirket örneği → varsayılan TYRO Tech logosuna düşer
  { id: 'tyro-robotics', group: 'TYRO AI', name: 'TYRO Robotics', nameEN: 'TYRO Robotics', logoTR: null, logoEN: null },

  // ── TYRO International ──
  { id: 'tyro-international', group: 'TYRO International', name: 'TYRO International', nameEN: 'TYRO International', ...logo('tyro-international') },
  { id: 'tyro-europe', group: 'TYRO International', name: 'TYRO Europe', nameEN: 'TYRO Europe', ...logo('tyro-europe') },
  { id: 'tyro-mena', group: 'TYRO International', name: 'TYRO MENA', nameEN: 'TYRO MENA', ...logo('tyro-mena') },
  { id: 'tyro-usa', group: 'TYRO International', name: 'TYRO USA', nameEN: 'TYRO USA', ...logo('tyro-usa') },

  // ── TYRO Ventures ── (kartvizitte ana marka logosu olarak Nexa Studio kullanılır)
  { id: 'tyro-ventures', group: 'TYRO Ventures', name: 'TYRO Ventures', nameEN: 'TYRO Ventures', ...logo('tyro-ventures') },
  { id: 'nexa-studio', group: 'TYRO Ventures', name: 'Nexa Studio', nameEN: 'Nexa Studio', ...logo('nexa-studio') },
  { id: 'orbit-apps', group: 'TYRO Ventures', name: 'Orbit Apps', nameEN: 'Orbit Apps', ...logo('orbit-apps') },

  // ── TYRO Hizmetler ──
  { id: 'tyro-hizmetler', group: 'TYRO Hizmetler', name: 'TYRO Hizmetler', nameEN: 'TYRO Services', ...logo('tyro-hizmetler') },
  { id: 'tyro-danismanlik', group: 'TYRO Hizmetler', name: 'TYRO Danışmanlık', nameEN: 'TYRO Consulting', ...logo('tyro-danismanlik') },
  { id: 'tyro-akademi', group: 'TYRO Hizmetler', name: 'TYRO Akademi', nameEN: 'TYRO Academy', ...logo('tyro-akademi') },
  // Her dilde İngilizce ad + logo kullanılır (bkz. cardStg.companyShortName)
  { id: 'tyro-digital', group: 'TYRO Hizmetler', name: 'TYRO Digital Solutions', nameEN: 'TYRO Digital Solutions',
    logoTR: BASE + 'tyro-digital-en.png', logoEN: BASE + 'tyro-digital-en.png' },
  // Vakıf: kartvizitte ana marka yerine KENDİ logosu gösterilir (cardStg.CARD_OWN_LOGO_IDS)
  { id: 'tyro-vakfi', group: 'TYRO Hizmetler', name: 'TYRO Vakfı', nameEN: 'TYRO Foundation', ...logo('tyro-vakfi') },
];

export const COMPANY_GROUPS = [
  'Ana Şirket',
  'TYRO Yazılım',
  'TYRO AI',
  'TYRO International',
  'TYRO Ventures',
  'TYRO Hizmetler',
];

export const COMPANY_GROUP_LABELS_EN = {
  'Ana Şirket': 'Main Company',
  'TYRO Yazılım': 'TYRO Software',
  'TYRO AI': 'TYRO AI',
  'TYRO International': 'TYRO International',
  'TYRO Ventures': 'TYRO Ventures',
  'TYRO Hizmetler': 'TYRO Services',
};
