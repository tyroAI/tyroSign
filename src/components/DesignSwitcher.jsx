import { memo } from 'react';
import { createPortal } from 'react-dom';
import { useMenuPos } from '../hooks/useMenuPos';
import { C } from '../constants/theme';
import { DESIGNS } from '../constants/designs';

const renderMiniPreview = (designId, stg, size = 1) => {
  const w = 40 * size, h = 24 * size;
  // classic-navy → beyaz kart, sağa hizalı satırlar, en sağda dikey lacivert bar
  if (designId === 'classic-navy') {
    return (
      <div style={{ width: w, height: h, borderRadius: 4, overflow: 'hidden', border: `1px solid ${C.borderSub}`, background: '#fff', display: 'flex', position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 12 * size, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `${2 * size}px ${size}px`, gap: size }}>
          <div style={{ width: 8 * size, height: 6 * size, borderRadius: 1, background: C.primary + '30' }} />
          <div style={{ width: 9 * size, height: size, borderRadius: 1, background: C.accent + '40' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: size, paddingRight: 2 * size }}>
          <div style={{ height: 1.5 * size, width: '60%', background: C.primary + '80', borderRadius: 1 }} />
          <div style={{ height: size, width: '45%', background: '#c5cbd1', borderRadius: 1 }} />
          <div style={{ height: size, width: '70%', background: '#dfe3e7', borderRadius: 1 }} />
        </div>
        <div style={{ width: 2.5 * size, background: stg.rightBlockBg || C.primary, flexShrink: 0 }} />
      </div>
    );
  }
  // classic-v4 ve ÇUBUK VARYANTLARI (classic-v4-nl: sol çubuk yok, -nr: sağ çubuk yok)
  // Aynı önizleme; yalnız hangi çubuğun çizildiği değişir.
  if (designId === 'classic-v4' || designId === 'classic-v4-nl' || designId === 'classic-v4-nr') {
    const showLeftBar = designId !== 'classic-v4-nl';
    const showRightBar = designId !== 'classic-v4-nr';
    return (
      <div style={{ width: w, height: h, borderRadius: 4, overflow: 'hidden', border: `1px solid ${C.borderSub}`, background: '#fff', display: 'flex', flexShrink: 0 }}>
        {showLeftBar && <div style={{ width: 2 * size, background: '#232c5e', flexShrink: 0 }} />}
        <div style={{ width: 15 * size, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: `${3 * size}px ${1.5 * size}px` }}>
          <div style={{ width: 11 * size, height: 5 * size, borderRadius: 1, background: C.primary + '30' }} />
          <div style={{ width: 8 * size, height: size, borderRadius: 1, background: '#232c5e80' }} />
        </div>
        <div style={{ flex: 1, background: '#f2f2f2', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: size, padding: `${2 * size}px ${2 * size}px` }}>
          <div style={{ height: 1.5 * size, width: '75%', background: C.primary + '80', borderRadius: 1 }} />
          <div style={{ height: size, width: '55%', background: '#c5cbd1', borderRadius: 1 }} />
          <div style={{ height: size, width: '80%', background: '#d6dade', borderRadius: 1, marginTop: size }} />
          <div style={{ height: size, width: '65%', background: '#d6dade', borderRadius: 1 }} />
        </div>
        {showRightBar && <div style={{ width: 2 * size, background: '#c8922a', flexShrink: 0 }} />}
      </div>
    );
  }

  // classic → dikdörtgen bant (kavissiz) | corporate → kavisli bant
  const bandRadius = designId === 'classic' ? 0 : `${6 * size}px 0 0 ${3 * size}px`;
  return (
    <div style={{ width: w, height: h, borderRadius: 4, overflow: 'hidden', border: `1px solid ${C.borderSub}`, background: '#fff', display: 'flex', position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 14 * size, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: `${2 * size}px ${size}px` }}>
        <div style={{ width: 8 * size, height: 9 * size, borderRadius: 1, background: C.primary + '30', marginBottom: size }} />
        <div style={{ height: size, width: 10 * size, background: C.accent + '40', borderRadius: 1 }} />
      </div>
      <div style={{ flex: 1, background: stg.rightBlockBg || C.primary, borderRadius: bandRadius, display: 'flex', flexDirection: 'column', padding: `${3 * size}px`, gap: size }}>
        <div style={{ height: 1.5 * size, width: '85%', background: 'rgba(255,255,255,0.7)', borderRadius: 1 }} />
        <div style={{ height: size, width: '55%', background: 'rgba(255,255,255,0.4)', borderRadius: 1 }} />
        <div style={{ height: size, width: '75%', background: 'rgba(255,255,255,0.3)', borderRadius: 1, marginTop: size }} />
      </div>
    </div>
  );
};

// Konum/kırpma mantığı ortak hook'ta (kartvizit modalindeki tasarım seçici de
// aynısını kullanıyor): src/hooks/useMenuPos.js — gerekçeler orada yazılı.
const DesignSwitcher = memo(({ stg, setStg, designOpen, setDesignOpen, L }) => {
  const curDesign = DESIGNS.find(d => d.id === stg.designId) || DESIGNS[0];
  const { btnRef, pos } = useMenuPos(designOpen);
  return (
    <div style={{ marginLeft: 'auto', position: 'relative' }}>
      <button
        ref={btnRef}
        onClick={() => setDesignOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.25rem 0.5rem 0.25rem 0.3rem',
          background: designOpen ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px) saturate(180%)', WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          borderRadius: 20, border: `1.5px solid ${designOpen ? C.primary + '30' : 'rgba(255,255,255,0.6)'}`,
          boxShadow: designOpen ? '0 4px 16px rgba(30,58,95,0.12)' : '0 2px 8px rgba(30,58,95,0.08)',
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { if (!designOpen) { e.currentTarget.style.background = 'rgba(255,255,255,0.75)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,58,95,0.12)'; } }}
        onMouseLeave={e => { if (!designOpen) { e.currentTarget.style.background = 'rgba(255,255,255,0.55)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(30,58,95,0.08)'; } }}
      >
        <span className="design-mini-preview">{renderMiniPreview(curDesign.id, stg)}</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: C.text1, fontFamily: 'Plus Jakarta Sans,sans-serif', whiteSpace: 'nowrap' }}>
          {L[curDesign.nameKey]}
        </span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{
          transition: 'transform 0.2s ease',
          transform: designOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <path d="M1 1L5 5L9 1" stroke={C.textM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {designOpen && pos && createPortal(
        <>
          <div onClick={() => setDesignOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
          <div style={{
            position: 'fixed', left: pos.left, top: pos.top, bottom: pos.bottom,
            width: pos.width, maxHeight: pos.maxH,
            // ZEMİN OPAK: eskiden C.surface (rgba beyaz .72) ve backdrop-filter YOKTU →
            // menünün arkasındaki lacivert imza önizlemesi içinden görünüyor, yazılar
            // okunamıyordu (kullanıcı bildirdi). Menü zemini şeffaf olmamalı.
            background: C.surfaceSolid,
            borderRadius: 14, border: `1px solid ${C.borderSub}`,
            boxShadow: '0 12px 40px rgba(30,58,95,0.22), 0 4px 12px rgba(30,58,95,0.12)',
            zIndex: 200, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            animation: 'fadeSlideDown 0.2s ease',
          }}>
            <div style={{ padding: '0.5rem 0.6rem 0.35rem', borderBottom: `1px solid ${C.borderSub}`, flexShrink: 0 }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: C.textM, fontFamily: 'Plus Jakarta Sans,sans-serif', letterSpacing: '0.5px' }}>
                {L.designSelect}
              </span>
            </div>
            {/* Liste KAYDIRILABİLİR: dış kutu köşe yuvarlaması için overflow:hidden
                kalıyor, kaydırma burada. Eskiden hiçbir yerde overflow-y yoktu →
                menü ekrandan taşınca alt tasarımlara ulaşmak imkansızdı. */}
            <div style={{ padding: '0.3rem', overflowY: 'auto', WebkitOverflowScrolling: 'touch', flex: 1, minHeight: 0 }}>
              {/* hidden: true olan tasarımlar listede GÖSTERİLMEZ (ör. Kurumsal geçici
                  olarak gizli). Kayıt designs.js'te durduğu için etiket çözümü ve
                  üretici bozulmaz; açmak için oradaki hidden ifadesini silmek yeterli. */}
              {DESIGNS.filter(d => !d.hidden).map(d => {
                const isActive = d.id === stg.designId;
                return (
                  <button
                    key={d.id}
                    onClick={() => { setStg(p => ({ ...p, designId: d.id })); setDesignOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.5rem 0.55rem', borderRadius: 10,
                      border: 'none', background: isActive ? `${C.primary}0a` : 'transparent',
                      cursor: 'pointer', transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = `${C.primary}06`; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {renderMiniPreview(d.id, stg)}
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: C.text1, fontFamily: 'Plus Jakarta Sans,sans-serif' }}>
                        {L[d.nameKey]}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: C.textM, marginTop: 1 }}>
                        {L[d.nameKey + 'Desc']}
                      </div>
                    </div>
                    {isActive && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
});

export default DesignSwitcher;
