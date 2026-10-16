import { memo } from 'react';
import { Edit3, Settings } from 'lucide-react';
import { C } from '../constants/theme';
import TabBtn from './ui/TabBtn';
import LinkedInIcon from './ui/LinkedInIcon';
import ProfileDropdown from './ProfileDropdown';

/* ── Tyrosign Stream Logo — theme-aware ── */
const LOGO_COLORS = {
  light:    { gold1: '#e0a832', gold2: '#a67820', mid: '#1e3a5f', main: '#0098d4', overlay: '#152d4a' },
  navy:     { gold1: '#e0a832', gold2: '#a67820', mid: '#d1d5db', main: '#0098d4', overlay: '#b8bec6' },
  gradient: { gold1: '#e0a832', gold2: '#a67820', mid: '#d1d5db', main: '#0098d4', overlay: '#b8bec6' },
  charcoal: { gold1: '#e0a832', gold2: '#a67820', mid: '#d1d5db', main: '#0098d4', overlay: '#b8bec6' },
};
const StreamLogo = memo(({ size = 28, themeId = 'light' }) => {
  const c = LOGO_COLORS[themeId] || LOGO_COLORS.light;
  const gId = 'slG_' + themeId;
  return (
    <svg viewBox="0 0 150 150" fill="none" width={size} height={size} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={gId} x1="61.29" y1="33.97" x2="14.04" y2="103.35" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.gold1} />
          <stop offset="1" stopColor={c.gold2} />
        </linearGradient>
      </defs>
      <path fill={`url(#${gId})`} d="M14.52,68.93v33.41s-.28,6.49,3.59,4.28c10.49-6.21,21.95-12.7,26.51-15.05,9.39-4.69,8.01-10.49,8.01-10.49V48.77c0-8.42-5.8-4.69-5.8-4.69l-28.16,16.15s-4.14,2.35-4.14,8.7Z" />
      <path fill={c.mid} d="M97.77,70.17v40.31s1.52,10.91-7.45,15.88l-25.68,15.19s-6.9,3.31-6.49-2.76l1.66-48.73,37.96-19.88Z" />
      <path fill={c.main} d="M58.15,137.95V66.72s-1.52-13.67,18.5-24.99l54.94-31.61s5.8-3.59,5.8,4.69V47.12s1.52,5.8-8.01,10.49c-9.53,4.69-47.9,27.61-47.9,27.61,0,0-23.33,11.87-23.33,52.74Z" />
      <path fill={c.overlay} d="M84.52,91.98s5.52-3.31,13.25-7.87v-8.28c-9.11,5.25-16.43,9.66-16.43,9.66,0,0-20.29,10.35-22.92,45.14v1.1c7.32-30.23,26.09-39.76,26.09-39.76Z" />
    </svg>
  );
});

/* ── Header Theme Configs ── */
const THEMES = {
  'navy': {
    bg: '#1e3a5f',
    tyroColor: '#fff',
    signColor: '#c8922a',
    tabBg: 'rgba(255,255,255,0.08)',
    tabActive: 'rgba(255,255,255,0.22)',
    tabText: 'rgba(255,255,255,0.6)',
    tabActiveText: '#fff',
    tabActiveIcon: '#c8922a',
    border: 'rgba(255,255,255,0.08)',
    langBg: 'rgba(255,255,255,0.1)',
    langSlider: 'rgba(255,255,255,0.2)',
    langActive: '#fff',
    langInactive: 'rgba(255,255,255,0.45)',
    showDots: false,
  },
  gradient: {
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #0098d4 100%)',
    tyroColor: '#fff',
    signColor: '#c8922a',
    tabBg: 'rgba(255,255,255,0.1)',
    tabActive: 'rgba(255,255,255,0.2)',
    tabText: 'rgba(255,255,255,0.6)',
    tabActiveText: '#fff',
    tabActiveIcon: '#fff',
    border: 'rgba(255,255,255,0.1)',
    langBg: 'rgba(255,255,255,0.1)',
    langSlider: 'rgba(255,255,255,0.2)',
    langActive: '#fff',
    langInactive: 'rgba(255,255,255,0.45)',
    showDots: false,
  },
  light: {
    bg: 'rgba(255,255,255,0.82)',
    backdrop: 'blur(20px)',
    tyroColor: '#1e3a5f',
    signColor: '#c8922a',
    tabBg: 'rgba(30,58,95,0.04)',
    tabActive: '#fff',
    tabText: 'rgba(30,58,95,0.5)',
    tabActiveText: '#1e3a5f',
    tabActiveIcon: '#c8922a',
    border: 'rgba(30,58,95,0.08)',
    langBg: 'rgba(30,58,95,0.06)',
    langSlider: '#fff',
    langActive: '#1e3a5f',
    langInactive: 'rgba(148,163,184,1)',
    showDots: false,
  },
  charcoal: {
    bg: '#0f172a',
    tyroColor: '#fff',
    signColor: '#c8922a',
    tabBg: 'rgba(255,255,255,0.06)',
    tabActive: 'rgba(255,255,255,0.14)',
    tabText: 'rgba(255,255,255,0.5)',
    tabActiveText: '#fff',
    tabActiveIcon: '#c8922a',
    border: 'rgba(255,255,255,0.06)',
    langBg: 'rgba(255,255,255,0.06)',
    langSlider: 'rgba(255,255,255,0.14)',
    langActive: '#fff',
    langInactive: 'rgba(255,255,255,0.4)',
    showDots: false,
  },
};

/* ── Pill Slider — themed language toggle (4 langs) ── */
const LANGS = ['tr', 'en', 'ru', 'ar'];
const LANG_LABELS = { tr: 'Türkçe', en: 'English', ru: 'Русский', ar: 'العربية' };
const LangToggle = memo(({ lang, setLang, theme }) => {
  const idx = LANGS.indexOf(lang);
  const btnW = 35;
  const pad = 3;
  const totalW = btnW * LANGS.length + pad * 2;
  return (
    <div className="lang-toggle" style={{
      position: 'relative', display: 'flex',
      padding: pad, borderRadius: 20,
      background: theme.langBg,
      width: totalW, height: 30, flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: pad, left: pad + idx * btnW,
        width: btnW, height: 24, borderRadius: 17,
        background: theme.langSlider,
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
      {LANGS.map(l => (
        <button key={l} onClick={() => setLang(l)} aria-label={LANG_LABELS[l]} style={{
          position: 'relative', zIndex: 1, width: btnW,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.58rem', fontWeight: 700, fontFamily: 'Inter,sans-serif',
          color: lang === l ? theme.langActive : theme.langInactive,
          transition: 'color 0.25s', padding: 0,
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
});

/* ── Themed Tab Button ── */
const ThemedTabBtn = memo(({ active, onClick, icon: Icon, label, theme }) => (
  <button onClick={onClick} style={{
    position: 'relative', zIndex: 1,
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.38rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: active ? theme.tabActive : 'transparent',
    color: active ? theme.tabActiveText : theme.tabText,
    fontSize: '0.72rem', fontWeight: active ? 700 : 500,
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.25s ease',
  }}>
    <Icon size={13} style={{ color: active ? theme.tabActiveIcon : theme.tabText, transition: 'color 0.25s' }} />
    {label}
  </button>
));

const AppHeader = memo(({ tab, setTab, lang, setLang, L, msalAccount, profileOpen, setProfileOpen, handleLogout, profilePhoto, headerTheme = 'light', ...rest }) => {
  const theme = THEMES[headerTheme] || THEMES['light'];
  const isGradient = headerTheme === 'gradient';

  return (
    <header className="app-header" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: theme.bg,
      backdropFilter: theme.backdrop || 'none', WebkitBackdropFilter: theme.backdrop || 'none',
      borderBottom: `1px solid ${theme.border}`,
      padding: '0 2rem', height: 56,
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      {/* Logo — stream icon + tyrosign text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }} onClick={() => setTab('signature')}>
        <StreamLogo size={26} themeId={headerTheme} />
        <span style={{
          fontFamily: "'Baloo 2', 'Plus Jakarta Sans', Inter, sans-serif",
          fontSize: 23, fontWeight: 700, letterSpacing: -1, lineHeight: 1,
        }}>
          <span style={{ color: theme.tyroColor }}>tyro</span>
          <span style={{ color: theme.signColor }}>sign</span>
        </span>
      </div>

      {/* Nav tabs */}
      <nav className="app-header-nav" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div className="nav-tabs-inner" style={{
          display: 'flex', gap: '2px',
          padding: 3, borderRadius: 11,
          background: theme.tabBg,
        }}>
          <ThemedTabBtn active={tab === 'signature'} onClick={() => setTab('signature')} icon={Edit3} label={L.sigTab} theme={theme} />
          <ThemedTabBtn active={tab === 'banner'} onClick={() => setTab('banner')} icon={LinkedInIcon} label={L.banTab} theme={theme} />
          <ThemedTabBtn active={tab === 'settings'} onClick={() => setTab('settings')} icon={Settings} label={L.setTab} theme={theme} />
        </div>
      </nav>

      {/* Right side */}
      <LangToggle lang={lang} setLang={setLang} theme={theme} />

      {msalAccount && (
        <ProfileDropdown
          msalAccount={msalAccount}
          lang={lang}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          handleLogout={handleLogout}
          profilePhoto={profilePhoto}
          setTab={setTab}
        />
      )}
    </header>
  );
});

export default AppHeader;
