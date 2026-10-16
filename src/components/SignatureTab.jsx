import { memo, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { User, Phone, Eye, Download, RefreshCw, EyeOff } from 'lucide-react';
import { C } from '../constants/theme';
import { OFFICES, OFFICE_GROUPS } from '../constants/offices';
import { COMPANIES, COMPANY_GROUPS, COMPANY_GROUP_LABELS_EN } from '../constants/companies';
import GlassCard from './ui/GlassCard';
import SectionTitle from './ui/SectionTitle';
import FormField from './ui/FormField';
import SearchableSelect from './ui/SearchableSelect';
import ProgressBar from './ProgressBar';
import DesignSwitcher from './DesignSwitcher';
import OutlookPreview from './OutlookPreview';
import ExportSection from './ExportSection';
import PromoBannerSection from './PromoBannerSection';

// Lazy-load heavy modals (QR + BusinessCard contain qrcode lib)
const QrModal = lazy(() => import('./QrModal'));
const BusinessCardModal = lazy(() => import('./BusinessCardModal'));
const NotifyManagerModal = lazy(() => import('./NotifyManagerModal'));
const CompanyPickerModal = lazy(() => import('./CompanyPickerModal'));

// Her alanın 'Gizle'/'Göster' düğmesindeki tooltip anahtarı. Etiket üçünde de ortak
// (gsmHide/gsmShow = 'Gizle'/'Göster'); sadece açıklama alana göre değişiyor.
const HIDE_HINTS = {
  showGsm: { hide: 'gsmHideHint', show: 'gsmShowHint' },
  showEmail: { hide: 'emailHideHint', show: 'emailShowHint' },
  showLinkedin: { hide: 'liHideHint', show: 'liShowHint' },
};

const SignatureTab = memo(({
  form, uf, stg, effectiveStg, setStg, office, company, sigHTML, hasData, progress, L, lang,
  copied, doCopy, doReset, showSteps, setShowSteps,
  designOpen, setDesignOpen,
  sigBanner, setSigBanner, bannerFileRef, procBanner,
  msalAccount, toast, fetchManager, sendMail, profilePhoto,
}) => {
  // Alan etiketinin sağında duran GİZLE/GÖSTER anahtarı (GSM · E-Posta · LinkedIn).
  // Gizlendiğinde ilgili bilgi imzada, kartvizitin ikon/düğmelerinde ve QR/vCard'da
  // hiç yer almaz. Üç alan için tek bileşen → görünüm ve davranış birebir aynı.
  const hideToggle = useCallback((flag) => {
    const hidden = stg[flag] === false;
    return (
      <button
        type="button"
        onClick={() => setStg(p => ({ ...p, [flag]: p[flag] === false }))}
        title={hidden ? L[HIDE_HINTS[flag].show] : L[HIDE_HINTS[flag].hide]}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          padding: '0.12rem 0.4rem', borderRadius: 999, cursor: 'pointer',
          border: `1px solid ${hidden ? C.primary + '35' : C.borderSub}`,
          background: hidden ? C.primary + '0f' : 'transparent',
          color: hidden ? C.primary : C.textM,
          fontFamily: 'Inter,sans-serif', fontSize: '0.58rem', fontWeight: 600,
          lineHeight: 1.6, transition: 'all 0.15s',
        }}
      >
        {hidden ? <EyeOff size={10} /> : <Eye size={10} />}
        {hidden ? (L.gsmShow || 'Göster') : (L.gsmHide || 'Gizle')}
      </button>
    );
  }, [stg, setStg, L]);

  const [qrOpen, setQrOpen] = useState(false);
  const [bcOpen, setBcOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);

  // ─── Form Validation ───
  const v = useMemo(() => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const e = form.email.trim();
    const g = form.gsm.trim();
    return {
      email: !e ? null : emailRe.test(e) ? { ok: true } : { err: lang === 'tr' ? 'Geçersiz e-posta formatı' : 'Invalid email format' },
      gsm: !g ? null : g.replace(/\D/g, '').length >= 10 ? { ok: true } : { err: lang === 'tr' ? 'En az 10 haneli olmalıdır' : 'Must be at least 10 digits' },
      firstName: form.firstName.trim().length > 0 ? { ok: true } : null,
      lastName: form.lastName.trim().length > 0 ? { ok: true } : null,
    };
  }, [form.email, form.gsm, form.firstName, form.lastName, lang]);

  // Şirket seçimi zorunlu — export aksiyonlarını (Outlook/QR/Kartvizit/Bildir) kapıla
  const requireCompany = useCallback((fn) => () => {
    if (!form.companyId) { toast(L.companyRequired, 'err'); return; }
    fn();
  }, [form.companyId, toast, L]);

  const handleOutlookOpen = useCallback(() => {
    if (!form.companyId) { toast(L.companyRequired, 'err'); return; }
    doCopy();
    window.open('https://outlook.office.com/mail/options/accounts-category/signatures-subcategory', '_blank');
    toast(lang === 'tr' ? 'İmza kopyalandı — Outlook ayarlarına yapıştırın' : 'Signature copied — paste it in Outlook settings');
  }, [doCopy, toast, lang, form.companyId, L]);

  return (
    <div style={{ animation: 'fadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      <ProgressBar progress={progress} L={L} />

      <div className="sig-layout sig-grid" style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 480px) 1fr',
        gap: '1.25rem', alignItems: 'stretch',
      }}>
        {/* LEFT: Kişisel Bilgiler + İletişim (tek kart) */}
        <div className="sig-sec-personal" style={{ animation: 'slideInLeft 0.4s ease-out' }}>
          <GlassCard accent style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.7rem' }}>
              <div style={{ flex: 1, marginBottom: '-0.7rem' }}><SectionTitle icon={User}>{L.pi}</SectionTitle></div>
              <button
                onClick={doReset}
                title={L.tipReset}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: 7, border: 'none',
                  background: `${C.textM}15`, cursor: 'pointer', marginLeft: 'auto',
                  transition: 'all 0.15s ease', color: C.textM,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.textM}30`; e.currentTarget.style.color = C.primary; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${C.textM}15`; e.currentTarget.style.color = C.textM; }}
              >
                <RefreshCw size={13} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}><FormField label={L.fn} value={form.firstName} onChange={e => uf('firstName', e.target.value)} placeholder="Ahmet" required success={!!v.firstName?.ok} /></div>
              <div style={{ flex: 1 }}><FormField label={L.ln} value={form.lastName} onChange={e => uf('lastName', e.target.value)} placeholder="Yılmaz" required success={!!v.lastName?.ok} /></div>
            </div>
            <FormField label={L.ttr} value={form.titleTR} onChange={e => uf('titleTR', e.target.value)} placeholder="Satış Müdürü" />
            <FormField label={L.ten} value={form.titleEN} onChange={e => uf('titleEN', e.target.value)} placeholder="Sales Manager" />
            {/* Şirket seçimi ofisten ÖNCE (kullanıcı isteği): şirket seçilince
                companyDirectory'den varsayılan ofis otomatik geliyor → sıra veri
                akışıyla da uyumlu. Ofis seçimi hemen altında, gerekirse değiştirilir. */}
            <SearchableSelect
              label={L.sc}
              required
              value={form.companyId}
              onChange={v => uf('companyId', v)}
              placeholder={L.sco}
              clearLabel={L.sco}
              options={COMPANIES}
              groups={COMPANY_GROUPS}
              nameKey={lang !== 'tr' ? 'nameEN' : undefined}
              groupLabels={lang !== 'tr' ? COMPANY_GROUP_LABELS_EN : undefined}
              trailing={
                <button
                  type="button"
                  className="company-visual-btn"
                  onClick={() => setCompanyPickerOpen(true)}
                  title={L.companyPickTitle}
                  aria-label={L.companyPickTitle}
                  style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0 0.75rem', whiteSpace: 'nowrap',
                    background: `${C.primary}0d`, border: `1.5px solid ${C.borderSub}`, borderRadius: 8,
                    cursor: 'pointer', color: C.primary, transition: 'all 0.15s ease',
                    fontSize: '0.72rem', fontWeight: 600, fontFamily: 'Inter,sans-serif',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${C.accent}1a`; e.currentTarget.style.borderColor = `${C.accent}70`; e.currentTarget.style.color = C.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${C.primary}0d`; e.currentTarget.style.borderColor = C.borderSub; e.currentTarget.style.color = C.primary; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                  {L.companyPickBtn}
                </button>
              }
            />
            <SearchableSelect
              label={L.ofc}
              value={form.officeId}
              onChange={v => uf('officeId', v)}
              placeholder={L.so}
              clearLabel={L.so}
              options={OFFICES}
              groups={OFFICE_GROUPS}
              groupLabels={lang !== 'tr' ? { 'Türkiye': L.grpTR, 'Uluslararası': L.grpIntl } : undefined}
            />

            <div style={{ height: 1, background: C.borderSub, margin: '0.5rem 0 0.6rem' }} />

            <SectionTitle icon={Phone}>{L.ci}</SectionTitle>
            {/* Alan etiketinin sağ ucundaki GİZLE/GÖSTER anahtarı — GSM, e-posta ve
                LinkedIn için AYNI bileşen (hideToggle). Bayrak stg'de tutuluyor
                (showGsm / showEmail / showLinkedin), yani localStorage'a yazılıyor ve
                seçim oturumlar arası korunuyor. showLinkedin BİLEREK yeni bayrak değil:
                Ayarlar → Sosyal Medya'daki anahtarla aynı olsun, iki kontrol çakışmasın. */}
            {/* GSM'in sağ üstünde GİZLE anahtarı (kullanıcı isteği).
                Açıkken: imzada GSM satırı çıkmaz (yalnız sabit hat); kartvizitte telefon
                ikonu ve QR sabit hattı kullanır; sabit hat da yoksa telefon hiç yer almaz.
                Bayrak stg'de (showGsm) — showSDN/showFax ile aynı desen, localStorage'a
                yazılıyor, yani seçim oturumlar arası korunuyor. */}
            <FormField
              label={L.gsm} value={form.gsm} onChange={e => uf('gsm', e.target.value)}
              placeholder="05XX XXX XX XX" error={v.gsm?.err} success={!!v.gsm?.ok}
              action={hideToggle('showGsm')}
            />
            <FormField
              label={L.email} value={form.email} onChange={e => uf('email', e.target.value.toLowerCase())}
              placeholder="ad.soyad@tyrotech.demo" required error={v.email?.err} success={!!v.email?.ok} type="email"
              action={hideToggle('showEmail')}
            />
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', fontWeight: 600, color: C.text2 }}>
                  LinkedIn
                </label>
                {hideToggle('showLinkedin')}
              </div>
              <input
                type="text" value={form.linkedinPersonal} onChange={e => uf('linkedinPersonal', e.target.value)}
                placeholder="https://linkedin.com/in/adsoyadiniz"
                style={{
                  width: '100%', padding: '0.45rem 0.65rem',
                  border: `1px solid ${C.borderSub}`, borderRadius: '8px',
                  fontSize: '0.78rem', fontFamily: 'Inter,sans-serif',
                  background: C.glass, color: C.text1,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'all 0.25s ease', backdropFilter: 'blur(8px)',
                }}
              />
              <p style={{ fontSize: '0.52rem', color: C.textM, marginTop: '0.15rem', fontStyle: 'italic' }}>
                {lang === 'tr' ? 'Boş bırakılırsa şirket LinkedIn adresi kullanılır' : 'If left empty, company LinkedIn URL will be used'}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT: Canlı Önizleme + İmzayı Dışa Aktar */}
        <div className="sig-sec-preview" style={{ animation: 'slideInRight 0.4s ease-out', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <GlassCard accent style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
              <Eye size={16} className="sec-icon" style={{ color: C.accent }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.primary, fontFamily: 'Plus Jakarta Sans,sans-serif' }}>{L.lv}</span>
              {hasData && <span style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background: C.ok, marginLeft: '0.3rem',
                boxShadow: `0 0 0 3px ${C.ok}20`,
                animation: 'pulse 2s infinite',
              }} />}
              <DesignSwitcher stg={stg} setStg={setStg} designOpen={designOpen} setDesignOpen={setDesignOpen} L={L} />
            </div>
            <OutlookPreview hasData={hasData} sigHTML={sigHTML} L={L} lang={lang} />
            <p style={{ fontSize: '0.55rem', color: C.textM, marginTop: '0.5rem', textAlign: 'center' }}>
              {lang === 'tr' ? 'E-posta istemcilerinde bu şekilde görünecek' : 'This is how it will appear in email clients'}
            </p>
          </GlassCard>

          <div className="sig-sec-export">
          <GlassCard accent>
            <SectionTitle icon={Download}>{L.exportTitle}</SectionTitle>
            <ExportSection
              hasData={hasData} copied={copied} doCopy={doCopy}
              onQrClick={requireCompany(() => setQrOpen(true))}
              onBcClick={requireCompany(() => setBcOpen(true))}
              onNotifyClick={requireCompany(() => setNotifyOpen(true))}
              onOutlookOpen={handleOutlookOpen}
              msalAccount={msalAccount}
              showSteps={showSteps} setShowSteps={setShowSteps} L={L}
            />
          </GlassCard>
          </div>
        </div>

        {/* FULL-WIDTH: Promosyon Banner */}
        <PromoBannerSection sigBanner={sigBanner} setSigBanner={setSigBanner} bannerFileRef={bannerFileRef} procBanner={procBanner} lang={lang} L={L} />
      </div>

      {/* QR Modal (lazy-loaded) */}
      {qrOpen && (
        <Suspense fallback={null}>
          <QrModal
            open={qrOpen}
            onClose={() => setQrOpen(false)}
            form={form}
            office={office}
            stg={effectiveStg}
            company={company}
            toast={toast}
            L={L}
            lang={lang}
          />
        </Suspense>
      )}

      {/* Business Card Modal (lazy-loaded) */}
      {bcOpen && (
        <Suspense fallback={null}>
          <BusinessCardModal
            open={bcOpen}
            onClose={() => setBcOpen(false)}
            form={form}
            office={office}
            stg={effectiveStg}
            company={company}
            toast={toast}
            L={L}
            lang={lang}
            profilePhoto={profilePhoto}
            msalAccount={msalAccount}
          />
        </Suspense>
      )}

      {/* Notify Manager Modal (lazy-loaded) */}
      {notifyOpen && (
        <Suspense fallback={null}>
          <NotifyManagerModal
            open={notifyOpen}
            onClose={() => setNotifyOpen(false)}
            form={form}
            sigHTML={sigHTML}
            toast={toast}
            L={L}
            lang={lang}
            fetchManager={fetchManager}
            sendMail={sendMail}
          />
        </Suspense>
      )}

      {/* Görsel Şirket Seçici (lazy-loaded) */}
      {companyPickerOpen && (
        <Suspense fallback={null}>
          <CompanyPickerModal
            open={companyPickerOpen}
            onClose={() => setCompanyPickerOpen(false)}
            value={form.companyId}
            onSelect={id => uf('companyId', id)}
            lang={lang}
            L={L}
          />
        </Suspense>
      )}
    </div>
  );
});

export default SignatureTab;
