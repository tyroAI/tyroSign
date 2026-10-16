// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPANIES (tyroTech Grup Şirketleri — DEMO / kurgusal veri)
// Ad ve logo HER DİLDE İngilizce (tek logo dosyası → logoTR = logoEN).
// Grup başı = adı grup adıyla AYNI olan şirket (rozet hiyerarşisi buna dayanır).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BASE = import.meta.env.BASE_URL + 'logos/';
const co = (id, group, name) => ({ id, group, name, nameEN: name, logoTR: BASE + id + '.png', logoEN: BASE + id + '.png' });

export const COMPANIES = [
  // ── Ana Şirket ── (logo null → varsayılan tyroTech logosu)
  { id: 'tyro-tech', group: 'Ana Şirket', name: 'tyroTech', nameEN: 'tyroTech', logoTR: null, logoEN: null },

  co('tyro-software', 'tyroSoftware', 'tyroSoftware'),
  co('tyro-cloud', 'tyroSoftware', 'tyroCloud'),

  co('tyro-ai', 'tyroAI', 'tyroAI'),
  co('tyro-labs', 'tyroAI', 'tyroLabs'),

  co('tyro-global', 'tyroGlobal', 'tyroGlobal'),
  co('tyro-europe', 'tyroGlobal', 'tyroEurope'),

  co('tyro-services', 'tyroServices', 'tyroServices'),
  co('tyro-digital', 'tyroServices', 'tyroDigital'),
  // Vakıf: kartvizitte ana marka yerine KENDİ logosu gösterilir (cardStg.CARD_OWN_LOGO_IDS)
  co('tyro-foundation', 'tyroServices', 'tyroFoundation'),
];

export const COMPANY_GROUPS = ['Ana Şirket', 'tyroSoftware', 'tyroAI', 'tyroGlobal', 'tyroServices'];

export const COMPANY_GROUP_LABELS_EN = {
  'Ana Şirket': 'Main Company',
  'tyroSoftware': 'tyroSoftware',
  'tyroAI': 'tyroAI',
  'tyroGlobal': 'tyroGlobal',
  'tyroServices': 'tyroServices',
};
