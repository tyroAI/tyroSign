import { memo, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Eye, Download, Upload, X } from 'lucide-react';
import { C } from '../constants/theme';
import { BANNER_TEMPLATES, BANNER_SIZES } from '../constants/bannerConfig';
import { COMPANIES, COMPANY_GROUPS, COMPANY_GROUP_LABELS_EN } from '../constants/companies';
import GlassCard from './ui/GlassCard';
import SectionTitle from './ui/SectionTitle';
import FormField from './ui/FormField';
import SearchableSelect from './ui/SearchableSelect';
import LinkedInIcon from './ui/LinkedInIcon';
import Btn from './ui/Btn';

const LOGO_POSITIONS = [
  { id: 'top-left', row: 0, col: 0 },
  { id: 'top-right', row: 0, col: 2 },
  { id: 'center', row: 1, col: 1 },
  { id: 'bottom-left', row: 2, col: 0 },
  { id: 'bottom-right', row: 2, col: 2 },
];

const posLabel = (id, L) => ({
  'top-left': L.banPosTopLeft,
  'top-right': L.banPosTopRight,
  'bottom-left': L.banPosBtmLeft,
  'bottom-right': L.banPosBtmRight,
  'center': L.banPosCenter,
}[id] || id);

const BannerTab = memo(({ banner, setBanner, stg, canvasRef, downloadBanner, L, lang }) => {
  const selectedCompany = useMemo(() => COMPANIES.find(c => c.id === banner.companyId) || COMPANIES[0], [banner.companyId]);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleCustomImage = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB max
    const reader = new FileReader();
    reader.onload = (e) => setBanner(p => ({ ...p, customBg: e.target.result }));
    reader.readAsDataURL(file);
  }, [setBanner]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleCustomImage(file);
  }, [handleCustomImage]);

  const onDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const onDragLeave = useCallback(() => setDragOver(false), []);

  return (
    <div style={{ animation: 'fadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      <div className="sig-layout banner-flex" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div className="banner-left" style={{ flex: '0 0 320px', minWidth: 0, animation: 'slideInLeft 0.4s ease-out' }}>
          <GlassCard accent>
            <SectionTitle icon={LinkedInIcon}>LinkedIn Banner</SectionTitle>

            {/* Company Selection */}
            <SearchableSelect
              label={L.sc}
              value={banner.companyId}
              onChange={v => setBanner(p => ({ ...p, companyId: v }))}
              placeholder={L.sco}
              options={COMPANIES}
              groups={COMPANY_GROUPS}
              nameKey={lang !== 'tr' ? 'nameEN' : undefined}
              groupLabels={lang !== 'tr' ? COMPANY_GROUP_LABELS_EN : undefined}
            />

            {/* Template Selection — only show if multiple templates */}
            {BANNER_TEMPLATES.length > 1 && (
              <div style={{ marginBottom: '1rem', marginTop: '0.6rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: C.text2, marginBottom: '0.4rem', display: 'block' }}>{L.banTpl}</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {BANNER_TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setBanner(p => ({ ...p, template: t.id, customBg: '' }))} style={{
                      flex: 1, padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
                      border: !banner.customBg && banner.template === t.id ? `2px solid ${C.accent}` : `1px solid ${C.borderSub}`,
                      background: t.bg, color: t.textColor, fontSize: '0.62rem', fontWeight: 600,
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: !banner.customBg && banner.template === t.id ? 'scale(1.04)' : 'scale(1)',
                      opacity: banner.customBg ? 0.5 : 1,
                    }}>{t.name}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Image Upload */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: C.text2, marginBottom: '0.4rem', display: 'block' }}>{L.banCustom}</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files[0]) handleCustomImage(e.target.files[0]); e.target.value = ''; }}
              />
              {!banner.customBg ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  style={{
                    border: `2px dashed ${dragOver ? C.accent : C.borderSub}`,
                    borderRadius: 10,
                    padding: '1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? `${C.accent}08` : 'transparent',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Upload size={20} style={{ color: C.textM, marginBottom: 4 }} />
                  <div style={{ fontSize: '0.65rem', color: C.textM, lineHeight: 1.5 }}>{L.banCustomHint}</div>
                  <div style={{ fontSize: '0.55rem', color: C.textM, marginTop: 2 }}>PNG / JPG / WebP</div>
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: `2px solid ${C.accent}` }}>
                  <img src={banner.customBg} alt="" style={{ width: '100%', height: 60, objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={() => setBanner(p => ({ ...p, customBg: '' }))}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem',
                    }}
                    title={L.banCustomRemove}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Logo Toggle + Position Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: C.text2 }}>{L.banLogoPos}</label>
                <button
                  onClick={() => setBanner(p => ({ ...p, showLogo: !p.showLogo }))}
                  style={{
                    width: 34, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: banner.showLogo ? C.accent : C.borderSub,
                    position: 'relative', transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2,
                    left: banner.showLogo ? 18 : 2,
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
              {banner.showLogo && (
                <>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
                    gap: 4, width: 120, height: 80, margin: '0 auto',
                    background: `${C.primary}08`, borderRadius: 8, padding: 4,
                    border: `1px solid ${C.borderSub}`,
                  }}>
                    {Array.from({ length: 9 }).map((_, idx) => {
                      const row = Math.floor(idx / 3);
                      const col = idx % 3;
                      const pos = LOGO_POSITIONS.find(p => p.row === row && p.col === col);
                      if (!pos) return <div key={idx} />;
                      const isActive = banner.logoPosition === pos.id;
                      return (
                        <button
                          key={pos.id}
                          onClick={() => setBanner(p => ({ ...p, logoPosition: pos.id }))}
                          title={posLabel(pos.id, L)}
                          style={{
                            gridRow: row + 1, gridColumn: col + 1,
                            width: '100%', height: '100%',
                            borderRadius: 4, border: 'none', cursor: 'pointer',
                            background: isActive ? C.accent : `${C.primary}15`,
                            transition: 'all 0.2s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <div style={{
                            width: 10, height: 10, borderRadius: 2,
                            background: isActive ? '#fff' : C.textM,
                            opacity: isActive ? 1 : 0.4,
                          }} />
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: C.textM, textAlign: 'center', marginTop: 4 }}>
                    {posLabel(banner.logoPosition, L)}
                  </div>
                </>
              )}
            </div>

            {/* Size Selection */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: C.text2, marginBottom: '0.4rem', display: 'block' }}>{L.banSize}</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {BANNER_SIZES.map(s => (
                  <button key={s.id} onClick={() => setBanner(p => ({ ...p, size: s.id }))} style={{
                    flex: 1, padding: '0.45rem 0.6rem', borderRadius: '7px', cursor: 'pointer',
                    border: banner.size === s.id ? `2px solid ${C.accent}` : `1px solid ${C.borderSub}`,
                    background: banner.size === s.id ? C.accentGhost : 'transparent',
                    color: C.text2, fontSize: '0.65rem', fontWeight: 600,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    <div>{s.label}</div>
                    <div style={{ fontSize: '0.55rem', color: C.textM, marginTop: 2 }}>{s.w}x{s.h}</div>
                  </button>
                ))}
              </div>
            </div>
            <FormField label={L.banTitle} value={banner.title} onChange={e => setBanner(p => ({ ...p, title: e.target.value }))} placeholder={stg.companyName} />
            <FormField label={L.banSub} value={banner.subtitle} onChange={e => setBanner(p => ({ ...p, subtitle: e.target.value }))} placeholder={stg.slogan} />
            <FormField label={L.banWebLink || 'Web Link'} value={banner.webLink || ''} onChange={e => setBanner(p => ({ ...p, webLink: e.target.value }))} placeholder={stg.website || 'www.tyrotech.demo'} />
            <Btn onClick={downloadBanner} icon={Download}>{L.banDl}</Btn>
          </GlassCard>
        </div>
        <div className="sig-right" style={{ flex: 1, minWidth: 0, animation: 'slideInRight 0.4s ease-out' }}>
          <GlassCard accent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
              <Eye size={16} className="sec-icon" style={{ color: C.accent }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.primary, fontFamily: 'Plus Jakarta Sans,sans-serif' }}>{L.banPrev}</span>
            </div>
            <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 660, height: 'auto', borderRadius: '8px', border: `1px solid ${C.borderSub}`, display: 'block' }} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
});

export default BannerTab;
