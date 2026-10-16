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

  // ── Tek şirket kartı. head=true → grup başlığı (grup logosu, navy zeminli) ──
  const Tile = ({ c, big, head }) => {
    const active = sel === c.id;
    // Logosu olmayan (ör. Ana Şirket / tyroTech) → standart tyro logosu
    const url = logoOf(c) || DEFAULT_LOGO_BASE64;
    const restBg = head ? `${C.primary}0a` : '#ffffff';
    const restBorder = head ? `${C.primary}45` : C.borderSub;
    return (
      <button
        type="button"
        onClick={() => setSel(c.id)}
        title={nameOf(c)}
        style={{
          position: 'relative', width: '100%',
          minHeight: big ? 74 : head ? 70 : 62,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: big ? '10px 12px' : head ? '8px 8px' : '7px 6px',
          background: active ? `${C.accent}0e` : restBg,
          border: active ? `2px solid ${C.accent}` : `${head ? '1.5px' : '1px'} solid ${restBorder}`,
          borderRadius: 12, cursor: 'pointer',
          boxShadow: active ? `0 0 0 3px ${C.accent}22, 0 4px 14px ${C.primary}12` : '0 1px 3px rgba(30,58,95,0.06)',
          transition: 'all 0.16s ease',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = `${C.accent}70`; e.currentTarget.style.boxShadow = `0 4px 14px ${C.primary}14`; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = restBorder; e.currentTarget.style.boxShadow = '0 1px 3px rgba(30,58,95,0.06)'; } }}
      >
        <img src={url} alt={nameOf(c)} loading="lazy"
          style={{ maxWidth: '100%', maxHeight: big ? 52 : head ? 50 : 46, objectFit: 'contain', display: 'block' }} />
        {active && (
          <span style={{
            position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%',
            background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}>
            <Check size={13} color="#fff" strokeWidth={3} />
          </span>
        )}
      </button>
    );
  };

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
          width: '100%', maxWidth: 1080, maxHeight: '88vh',
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

        {/* ── Body (scroll) ── */}
        <div style={{ padding: '1.1rem 1.4rem', overflowY: 'auto', flex: 1 }}>
          {/* Ana şirket — üstte, ortalanmış */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
            <div style={{ maxWidth: 280, width: '100%' }}>
              {mainCompanies.map(c => <Tile key={c.id} c={c} big />)}
            </div>
          </div>

          {/* Gruplar — sütunlar (org şemasındaki gibi) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.9rem', alignItems: 'flex-start' }}>
            {otherGroups.map(g => {
              // Görsel seçicide sadece logosu olan şirketler (ör. Bioethanol logosuz → gösterilmez)
              const all = COMPANIES.filter(c => c.group === g && (c.logoTR || c.logoEN));
              if (!all.length) return null;
              // Grup başı = adı grup adıyla aynı olan şirket (ör. "tyroSoftware")
              const head = all.find(c => c.name === g) || all[0];
              const subs = all.filter(c => c.id !== head.id);
              // Çok uzun grup (ör. tyroSoftware, >6 alt şirket) → 2 sütun, yataya genişle
              const twoCol = subs.length > 6;
              return (
                <div key={g} style={{ flex: twoCol ? '2 1 320px' : '1 1 160px', minWidth: twoCol ? 300 : 152, maxWidth: twoCol ? 360 : 225 }}>
                  {/* Grup başlığı = grup logosu (tıklanabilir, seçilebilir) */}
                  <Tile c={head} head />
                  <div style={{ display: 'grid', gridTemplateColumns: twoCol ? '1fr 1fr' : '1fr', gap: '0.5rem', marginTop: '0.55rem' }}>
                    {subs.map(c => <Tile key={c.id} c={c} />)}
                  </div>
                </div>
              );
            })}
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
