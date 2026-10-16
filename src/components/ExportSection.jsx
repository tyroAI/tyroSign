import { memo, useState } from 'react';
import { Copy, Check, Info, Mail } from 'lucide-react';
import { C } from '../constants/theme';

const QrIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" /><rect x="2" y="14" width="8" height="8" rx="1" />
    <path d="M14 14h2v2h-2zM20 14h2v2h-2zM14 20h2v2h-2zM20 20h2v2h-2zM17 17h2v2h-2z" fill="currentColor" stroke="none" />
  </svg>
);

const OutlookIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M22 6.5V17.5C22 18.33 21.33 19 20.5 19H8.5C7.67 19 7 18.33 7 17.5V6.5C7 5.67 7.67 5 8.5 5H20.5C21.33 5 22 5.67 22 6.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 8L14.5 13L22 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 7V18C2 18.55 2.45 19 3 19H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CardIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <circle cx="8" cy="11" r="2" />
    <path d="M14 9h4M14 13h3" />
    <path d="M5 18c0-2 1.5-3 3-3s3 1 3 3" />
  </svg>
);

// Color palette for each action
const COLORS = {
  copy:    C.primary,      // navy
  copied:  C.ok,           // green
  outlook: C.divider,      // blue
  notify:  C.accent,       // gold
  qr:      '#475569',      // slate
  bc:      '#0d9488',      // teal
};

// Apple segmented control — ghost segment button
const SegBtn = ({ icon, label, color, onClick, disabled, tip }) => {
  const [hovered, setHovered] = useState(false);
  const active = hovered && !disabled;

  return (
    <div className="tip-wrap" style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
          padding: '0.55rem 0.3rem',
          background: active ? color : 'transparent',
          color: active ? '#fff' : disabled ? C.textM : color,
          border: 'none',
          borderRadius: 8,
          fontSize: '0.67rem', fontWeight: 600, fontFamily: 'Inter,sans-serif',
          letterSpacing: '-0.15px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.35 : 1,
          whiteSpace: 'nowrap',
          transition: 'all 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          boxShadow: active ? `0 2px 12px ${color}40` : 'none',
          transform: active ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {icon}
        {label}
      </button>
      <span className="tip-box">{tip}</span>
    </div>
  );
};

const ExportSection = memo(({ hasData, copied, doCopy, onQrClick, onBcClick, onOutlookOpen, onNotifyClick, msalAccount, showSteps, setShowSteps, L }) => (
  <>
    {/* Apple Segmented Control container */}
    <div
      className="export-btns"
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: '2px',
        padding: '3px',
        background: 'rgba(30,58,95,0.025)',
        borderRadius: 11,
        border: '1px solid rgba(30,58,95,0.06)',
        marginBottom: '0.6rem',
      }}
    >
      <SegBtn
        icon={copied ? <Check size={13} /> : <Copy size={13} />}
        label={copied ? L.cpd : L.cp}
        color={copied ? COLORS.copied : COLORS.copy}
        onClick={doCopy} disabled={!hasData} tip={L.tipCopy}
      />

      {msalAccount && (
        <SegBtn
          icon={<OutlookIcon />} label={L.olOpen}
          color={COLORS.outlook}
          onClick={onOutlookOpen} disabled={!hasData} tip={L.tipOutlook}
        />
      )}

      {msalAccount && (
        <SegBtn
          icon={<Mail size={13} />} label={L.notifyMgr}
          color={COLORS.notify}
          onClick={onNotifyClick} disabled={!hasData} tip={L.tipNotifyMgr}
        />
      )}

      {/* QR butonu ön yüzden KALDIRILDI (kullanıcı isteği) — QR zaten kartvizitin
          içinde var, ayrı düğmeye gerek görülmedi. Kod olduğu gibi duruyor:
          QrModal, onQrClick zinciri, qrGen/tipQr çevirileri ve QrIcon yerinde.
          Geri açmak için aşağıdaki SegBtn'i yorumdan çıkarmak yeterli:
          <SegBtn icon={<QrIcon />} label={L.qrGen} color={COLORS.qr}
                  onClick={onQrClick} disabled={!hasData} tip={L.tipQr} /> */}

      <SegBtn
        icon={<CardIcon />} label={L.bcGen}
        color={COLORS.bc}
        onClick={onBcClick} disabled={!hasData} tip={L.tipBc}
      />
    </div>

    <div style={{ borderTop: `1px solid ${C.borderSub}`, paddingTop: '0.5rem' }}>
      <button
        onClick={() => setShowSteps(!showSteps)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: '0.15rem 0',
          marginBottom: showSteps ? '0.5rem' : 0,
        }}
      >
        <Info size={14} style={{ color: C.accent }} />
        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: C.primary, fontFamily: 'Plus Jakarta Sans,sans-serif', flex: 1, textAlign: 'left' }}>{L.ht}</span>
        <span style={{
          fontSize: '0.7rem', color: C.textM, transition: 'transform 0.3s ease',
          transform: showSteps ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>&#9662;</span>
      </button>
      {showSteps && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
          {L.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                width: 18, height: 18, borderRadius: '50%',
                background: `${C.divider}15`, color: C.divider,
                fontSize: '0.58rem', fontWeight: 700,
              }}>{i + 1}</span>
              <span style={{ fontSize: '0.63rem', color: C.text2, lineHeight: 1.5, paddingTop: '0.05rem' }}>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </>
));

export default ExportSection;
