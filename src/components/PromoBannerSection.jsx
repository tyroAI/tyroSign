import { memo, useRef } from 'react';
import { Upload, Trash, Image, Plus } from 'lucide-react';
import { C } from '../constants/theme';
import { sanitizeUrl } from '../utils/formatting';
import { MAX_SIG_BANNERS } from '../constants/limits';
import GlassCard from './ui/GlassCard';
import SectionTitle from './ui/SectionTitle';
import FormField from './ui/FormField';
import ToggleSwitch from './ui/ToggleSwitch';

// Birden fazla promosyon banner'ı: imzanın altına alt alta eklenir (kullanıcı isteği).
// sigBanner = { enabled, items: [{ base64, width, height, linkUrl, alt }] }
// Tek dosya seçici tüm bannerlar için paylaşılır; hangi banner'ın değiştirileceği
// targetRef'te tutulur (null = listeye yeni ekle).
const PromoBannerSection = memo(({ sigBanner, setSigBanner, bannerFileRef, procBanner, lang, L }) => {
  const items = Array.isArray(sigBanner.items) ? sigBanner.items : [];
  const targetRef = useRef(null);

  const pick = (index) => { targetRef.current = index; bannerFileRef.current?.click(); };
  const patch = (index, changes) => setSigBanner(p => ({
    ...p,
    items: (p.items || []).map((it, i) => (i === index ? { ...it, ...changes } : it)),
  }));
  const remove = (index) => setSigBanner(p => ({
    ...p,
    items: (p.items || []).filter((_, i) => i !== index),
  }));
  const canAdd = items.length < MAX_SIG_BANNERS;
  const btn = (extra) => ({
    padding: '0.3rem 0.55rem', borderRadius: 6, border: `1px solid ${C.borderSub}`,
    background: '#fff', cursor: 'pointer', fontSize: '0.6rem', color: C.text2,
    display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter,sans-serif', ...extra,
  });

  return (
    <div className="sig-sec-banner" style={{ gridColumn: '1 / -1', animation: 'fadeIn 0.4s ease-out' }}>
      <GlassCard accent>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: sigBanner.enabled ? '0.75rem' : 0 }}>
          <div>
            <SectionTitle icon={Image}>{L.proBanner}</SectionTitle>
            <p style={{ fontSize: '0.62rem', color: C.textM, marginTop: '-0.4rem', marginBottom: '0.2rem' }}>{L.proBannerDesc}</p>
          </div>
          <div style={{ paddingTop: '0.2rem' }}>
            <ToggleSwitch label="" checked={sigBanner.enabled} onChange={(v) => setSigBanner(p => ({ ...p, enabled: v }))} />
          </div>
        </div>

        {sigBanner.enabled && (
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            {items.map((item, i) => (
              <div key={i} style={{
                padding: '0.75rem', background: C.primaryGhost, borderRadius: 10,
                border: `1px solid ${C.borderSub}`, marginBottom: '0.6rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: C.text2, fontFamily: 'Inter,sans-serif' }}>
                    {(L.proBannerItem || 'Banner') + ' ' + (i + 1)}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: C.textM }}>{item.width}x{item.height}px</span>
                </div>
                <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.borderSub}`, background: '#fff' }}>
                  {item.linkUrl ? (
                    <a href={sanitizeUrl(item.linkUrl)} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                      <img src={item.base64} alt={item.alt || 'Banner'} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
                    </a>
                  ) : (
                    <img src={item.base64} alt={item.alt || 'Banner'} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem', marginTop: '0.5rem' }}>
                  <button onClick={() => pick(i)} style={btn()}>
                    <Upload size={10} /> {lang === 'tr' ? 'Değiştir' : 'Change'}
                  </button>
                  <button onClick={() => remove(i)} style={btn({ background: 'transparent', color: C.err })}>
                    <Trash size={10} /> {L.proBannerRemove}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <FormField label={L.proBannerLink} value={item.linkUrl || ''}
                    onChange={e => patch(i, { linkUrl: e.target.value })}
                    placeholder="https://www.tyrotech.demo/etkinlik" />
                  <FormField label={L.proBannerAlt} value={item.alt || ''}
                    onChange={e => patch(i, { alt: e.target.value })}
                    placeholder={lang === 'tr' ? 'Fuar 2026' : 'Fair 2026'} />
                </div>
              </div>
            ))}

            {/* Yükleme alanı: liste boşken büyük bırakma alanı, doluysa ince "ekle" düğmesi */}
            {canAdd && (items.length === 0 ? (
              <div
                onClick={() => pick(null)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); targetRef.current = null; if (e.dataTransfer.files?.[0]) procBanner(e.dataTransfer.files[0], null); }}
                style={{
                  border: `2px dashed ${C.accent}50`, borderRadius: 12, padding: '1.8rem 1rem',
                  textAlign: 'center', cursor: 'pointer', background: C.accentGhost,
                  transition: 'all 0.25s ease',
                }}
              >
                <Upload size={26} style={{ color: C.accent, marginBottom: '0.4rem', opacity: 0.7 }} />
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: C.text1 }}>{L.proBannerUpload}</p>
                <p style={{ fontSize: '0.58rem', color: C.textM, marginTop: '0.15rem' }}>{L.proBannerHint}</p>
              </div>
            ) : (
              <div
                onClick={() => pick(null)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); targetRef.current = null; if (e.dataTransfer.files?.[0]) procBanner(e.dataTransfer.files[0], null); }}
                style={{
                  border: `1.5px dashed ${C.accent}55`, borderRadius: 10, padding: '0.6rem',
                  textAlign: 'center', cursor: 'pointer', background: C.accentGhost,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Plus size={13} style={{ color: C.accent }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: C.text1, fontFamily: 'Inter,sans-serif' }}>
                  {L.proBannerAdd || 'Banner Ekle'}
                </span>
                <span style={{ fontSize: '0.58rem', color: C.textM }}>({items.length}/{MAX_SIG_BANNERS})</span>
              </div>
            ))}

            {!canAdd && (
              <p style={{ fontSize: '0.58rem', color: C.textM, textAlign: 'center', marginTop: '0.2rem' }}>
                {(L.proBannerLimit || 'En fazla {n} banner').replace('{n}', MAX_SIG_BANNERS)}
              </p>
            )}

            <input ref={bannerFileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files?.[0]) procBanner(e.target.files[0], targetRef.current);
                targetRef.current = null;
                e.target.value = ''; // aynı dosya tekrar seçilebilsin
              }} />
          </div>
        )}
      </GlassCard>
    </div>
  );
});

export default PromoBannerSection;
