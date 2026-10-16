import { memo, useState, useEffect, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { C } from '../constants/theme';
import { COMPANIES, COMPANY_GROUPS } from '../constants/companies';
import DEFAULT_LOGO_BASE64 from '../defaultLogo.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Görsel Şirket Seçici (pop-up) — grup + logolarıyla şirketler.
// Logoya tıkla → seç (highlight) → "Tamam" → kapanır, şirket+logo güncellenir.
// Sadece büyük ekranlarda tetiklenir (mobilde metin seçimi kullanılır).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CompanyPickerModal = memo(({ open, onClose, value, onSelect, lang, L }) => {
  const [sel, setSel] = useState(value || '');

  // Modal her açıldığında mevcut seçimi baz al
  useEffect(() => { if (open) setSel(value || ''); }, [open, value]);

  // Escape ile kapat
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const nameOf = (c) => (lang !== 'tr' && c.nameEN) ? c.nameEN : c.name;
  const logoOf = (c) => (lang === 'tr' ? c.logoTR : c.logoEN); // RU/AR → EN

  const selCompany = useMemo(() => COMPANIES.find(c => c.id === sel) || null, [sel]);

  if (!open) return null;

  const mainGroup = COMPANY_GROUPS[0];
  const mainCompanies = COMPANIES.filter(c => c.group === mainGroup);
  const otherGroups = COMPANY_GROUPS.slice(1);

  const confirm = () => { if (sel) { onSelect(sel); onClose(); } };

  // ── Tek şirket kartı — HEPSİ aynı ölçüde: sabit yükseklik, logo kutuya ortalı.
  // Logolar (public/logos) tyroTech ile aynı yükseklik/kenar boşluğunda üretildiği
  // için sabit yükseklik = görsel olarak eşit yazı boyutu demek.
  const Tile = ({ c, main }) => {
    const active = sel === c.id;
    const url = logoOf(c) || DEFAULT_LOGO_BASE64; // logosuz → tyroTech ana logosu
    const restBorder = main ? `${C.primary}35` : C.borderSub;
    return (
      <button
        type="button"
        onClick={() => setSel(c.id)}
        title={nameOf(c)}
        style={{
          position: 'relative', width: '100%', height: main ? 76 : 58,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '6px 10px',
          background: active ? `${C.accent}0e` : '#ffffff',
          border: active ? `2px solid ${C.accent}` : `1px solid ${restBorder}`,
          borderRadius: 10, cursor: 'pointer',
          boxShadow: active ? `0 0 0 3px ${C.accent}22, 0 4px 14px ${C.primary}12` : '0 1px 2px rgba(30,58,95,0.05)',
          transition: 'all 0.16s ease',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = `${C.accent}70`; e.currentTarget.style.boxShadow = `0 4px 14px ${C.primary}14`; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = restBorder; e.currentTarget.style.boxShadow = '0 1px 2px rgba(30,58,95,0.05)'; } }}
      >
        <img src={url} alt={nameOf(c)} loading="lazy"
          style={{ height: main ? 60 : 44, maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
        {active && (
          <span style={{
            position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%',
            background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}>
            <Check size={12} color="#fff" strokeWidth={3} />
          </span>
        )}
      </button>
    );
  };

  const T = (o) => o[lang] || o.en;
  const LBL = {
    main: { tr: 'Ana Şirket', en: 'Parent Company', ru: 'Головная компания', ar: 'الشركة الأم' },
    head: { tr: 'Grup Şirketi', en: 'Group Company', ru: 'Компания группы', ar: 'شركة المجموعة' },
    subs: { tr: 'İştirakler', en: 'Affiliates', ru: 'Дочерние компании', ar: 'الشركات التابعة' },
  };
  const Caption = ({ children, color = C.textM }) => (
    <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color, margin: '0 0 0.4rem', textAlign: 'center' }}>
      {children}
    </div>
  );
  const LINE = `${C.primary}30`;

  const groups = otherGroups.map(g => {
    const all = COMPANIES.filter(c => c.group === g);
    if (!all.length) return null;
    // Grup başı = adı grup adıyla aynı olan şirket (ör. "tyroSoftware")
    const head = all.find(c => c.name === g) || all[0];
    return { g, head, subs: all.filter(c => c.id !== head.id) };
  }).filter(Boolean);
  const n = groups.length;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(30,58,95,0.35)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.25s ease', padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 18, border: `1px solid ${C.borderSub}`,
          boxShadow: '0 24px 48px rgba(30,58,95,0.22), 0 8px 16px rgba(30,58,95,0.1)',
          width: '100%', maxWidth: 1040, maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          position: 'relative', animation: 'slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '1.1rem 1.4rem 0.9rem', borderBottom: `1px solid ${C.borderSub}`, position: 'relative' }}>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1.05rem', fontWeight: 700, color: C.primary, margin: '0 0 0.2rem' }}>
            {L.companyPickTitle}
          </h3>
          <p style={{ fontSize: '0.72rem', color: C.textM, margin: 0 }}>{L.companyPickDesc}</p>
          <button
            onClick={onClose} aria-label="Close"
            style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: C.textM, padding: 4, borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = C.primary}
            onMouseLeave={e => e.currentTarget.style.color = C.textM}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body (scroll) — org şeması: ana şirket → gruplar → iştirakler ── */}
        <div style={{ padding: '1.2rem 1.4rem 1.4rem', overflowY: 'auto', flex: 1 }}>
          {/* Ana şirket — ortada */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 260 }}>
              <Caption color={C.primary}>{T(LBL.main)}</Caption>
              {mainCompanies.map(c => <Tile key={c.id} c={c} main />)}
            </div>
          </div>

          {/* Bağlantı çizgileri: dikey gövde + gruplar arası yatay hat */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 2, height: 18, background: LINE }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: '0.9rem', position: 'relative' }}>
            {n > 1 && (
              <div style={{ position: 'absolute', top: 0, height: 2, background: LINE,
                left: `calc((100% - ${(n - 1) * 0.9}rem) / ${2 * n})`, right: `calc((100% - ${(n - 1) * 0.9}rem) / ${2 * n})` }} />
            )}
            {groups.map(({ g, head, subs }) => (
              <div key={g} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ alignSelf: 'center', width: 2, height: 16, background: LINE }} />
                <div style={{
                  border: `1px solid ${C.borderSub}`, borderRadius: 14, padding: '0.75rem',
                  background: 'linear-gradient(180deg, rgba(30,58,95,0.035), rgba(30,58,95,0.01))',
                }}>
                  <Caption color={C.primary}>{T(LBL.head)}</Caption>
                  <Tile c={head} />
                  {subs.length > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: 2, height: 12, background: LINE }} />
                      </div>
                      <Caption>{T(LBL.subs)}</Caption>
                      <div style={{ display: 'grid', gap: '0.45rem' }}>
                        {subs.map(c => <Tile key={c.id} c={c} />)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '0.85rem 1.4rem', borderTop: `1px solid ${C.borderSub}`,
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(248,250,252,0.9)',
        }}>
          <div style={{ flex: 1, minWidth: 0, fontSize: '0.75rem', color: C.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ color: C.textM }}>{L.companyPickSelected}: </span>
            <strong style={{ color: selCompany ? C.primary : C.textM }}>{selCompany ? nameOf(selCompany) : '—'}</strong>
          </div>
          <button
            type="button" onClick={onClose}
            style={{
              padding: '0.5rem 1rem', borderRadius: 9, border: `1px solid ${C.borderSub}`,
              background: '#fff', color: C.text2, fontSize: '0.76rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter,sans-serif',
            }}
          >
            {L.companyPickCancel}
          </button>
          <button
            type="button" onClick={confirm} disabled={!sel}
            style={{
              padding: '0.5rem 1.4rem', borderRadius: 9, border: 'none',
              background: sel ? C.primary : C.borderSub, color: '#fff',
              fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Inter,sans-serif',
              cursor: sel ? 'pointer' : 'not-allowed', opacity: sel ? 1 : 0.6,
              boxShadow: sel ? `0 4px 12px ${C.primary}40` : 'none', transition: 'all 0.15s ease',
            }}
          >
            {L.companyPickOk}
          </button>
        </div>
      </div>
    </div>
  );
});

export default CompanyPickerModal;
