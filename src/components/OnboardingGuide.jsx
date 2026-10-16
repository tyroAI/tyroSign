import { useState, useEffect, memo } from 'react';
import { C } from '../constants/theme';
import { User, Eye, Copy, Zap, Image, ChevronRight, X } from 'lucide-react';

const STORAGE_KEY = 'tyro-onboarding-done';

const steps = [
  { icon: User,  target: '.sig-sec-personal', labelKey: 'obLabel1', textKey: 'obStep1' },
  { icon: Eye,   target: '.sig-sec-preview',  labelKey: 'obLabel2', textKey: 'obStep2' },
  { icon: Copy,  target: '.sig-sec-export',   labelKey: 'obLabel3', textKey: 'obStep3' },
  { icon: Zap,   target: '.export-btns',      labelKey: 'obLabel4', textKey: 'obStep4' },
  { icon: Image, target: '.sig-sec-banner',   labelKey: 'obLabel5', textKey: 'obStep5' },
];

const TIP_H = 170; // approximate tooltip height
const TIP_W = 310;
const GAP = 14;
const PAD = 12; // minimum padding from viewport edges

const OnboardingGuide = memo(({ L }) => {
  const [step, setStep] = useState(-1); // -1 = not started
  const [, forceUpdate] = useState(0); // for re-render after scroll

  useEffect(() => {
    try { if (localStorage.getItem(STORAGE_KEY)) return; } catch { return; }
    const t = setTimeout(() => setStep(0), 800);
    return () => clearTimeout(t);
  }, []);

  // Scroll target into view when step changes
  useEffect(() => {
    if (step < 0) return;
    const el = document.querySelector(steps[step].target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const needsScroll = r.top < 60 || r.bottom > window.innerHeight - 60;
    if (needsScroll) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Re-render after scroll settles so positions update
      const t = setTimeout(() => forceUpdate(n => n + 1), 450);
      return () => clearTimeout(t);
    }
  }, [step]);

  const dismiss = () => {
    setStep(-1);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* private mode */ }
  };

  const next = () => {
    if (step >= steps.length - 1) { dismiss(); return; }
    setStep(step + 1);
  };

  if (step < 0) return null;

  const current = steps[step];
  const Icon = current.icon;

  // Try to get target element position
  const el = document.querySelector(current.target);
  let spotStyle = {};
  if (el) {
    const r = el.getBoundingClientRect();
    spotStyle = {
      position: 'fixed',
      top: r.top - 6, left: r.left - 6,
      width: r.width + 12, height: r.height + 12,
      borderRadius: 14,
      border: `2px solid ${C.accent}`,
      boxShadow: `0 0 0 4000px rgba(15,23,42,0.45), 0 0 24px ${C.accent}40`,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none',
      zIndex: 100001,
    };
  }

  // Smart tooltip positioning — always stays fully visible
  let tipStyle = {};
  if (el) {
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Vertical: prefer below target, fallback above, fallback inside/center
    const spaceBelow = vh - r.bottom - GAP;
    const spaceAbove = r.top - GAP;
    let tipTop;

    if (spaceBelow >= TIP_H) {
      tipTop = r.bottom + GAP;
    } else if (spaceAbove >= TIP_H) {
      tipTop = r.top - TIP_H - GAP;
    } else {
      // Neither side has room — center tooltip vertically in viewport
      tipTop = Math.max(PAD, (vh - TIP_H) / 2);
    }

    // Final clamp
    tipTop = Math.max(PAD, Math.min(tipTop, vh - TIP_H - PAD));

    // Horizontal: try right of target first, then center on target, clamp
    let tipLeft;
    const spaceRight = vw - r.right - GAP;
    const spaceLeft = r.left - GAP;

    if (spaceRight >= TIP_W + GAP) {
      // Enough room to the right
      tipLeft = r.right + GAP;
    } else if (spaceLeft >= TIP_W + GAP) {
      // Enough room to the left
      tipLeft = r.left - TIP_W - GAP;
    } else {
      // Center horizontally on target
      tipLeft = r.left + (r.width - TIP_W) / 2;
    }
    tipLeft = Math.max(PAD, Math.min(tipLeft, vw - TIP_W - PAD));

    tipStyle = {
      position: 'fixed',
      top: tipTop,
      left: tipLeft,
      zIndex: 100002,
    };
  } else {
    tipStyle = {
      position: 'fixed',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 100002,
    };
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={dismiss} style={{
        position: 'fixed', inset: 0, zIndex: 100000,
        background: 'transparent', cursor: 'pointer',
      }} />

      {/* Spotlight on target */}
      {el && <div style={spotStyle} />}

      {/* Tooltip card — Glass Apple style */}
      <div style={{
        ...tipStyle,
        width: TIP_W,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 4px 24px rgba(30,58,95,0.18), 0 12px 48px rgba(30,58,95,0.10), 0 0 0 1px rgba(30,58,95,0.05)',
        overflow: 'hidden',
        animation: 'scaleIn 0.3s ease-out',
      }}>
        {/* Accent gradient top stripe (same as GlassCard) */}
        <div style={{ height: 2.5, background: `linear-gradient(90deg, ${C.primary}, ${C.divider}, ${C.accent})` }} />

        <div style={{ padding: '1rem 1.15rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.55rem' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: `linear-gradient(135deg, ${C.primary}, ${C.primarySoft})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 6px ${C.primary}25`,
            }}>
              <Icon size={14} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: C.primary, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {L[current.labelKey]}
              </div>
              <div style={{ fontSize: '0.56rem', color: C.textM, fontWeight: 500 }}>
                {step + 1} / {steps.length}
              </div>
            </div>
            <button onClick={dismiss} aria-label="Close" style={{
              background: `${C.primary}08`, border: 'none', cursor: 'pointer',
              padding: 5, borderRadius: 7, color: C.textM,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}>
              <X size={13} />
            </button>
          </div>

          {/* Body */}
          <p style={{
            fontSize: '0.72rem', color: C.text2, lineHeight: 1.65,
            marginBottom: '0.75rem', fontFamily: 'Inter,sans-serif',
          }}>
            {L[current.textKey]}
          </p>

          {/* Progress dots + buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {steps.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? 16 : 5, height: 5,
                  borderRadius: 3,
                  background: i === step
                    ? `linear-gradient(90deg, ${C.primary}, ${C.divider})`
                    : `${C.primary}15`,
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button onClick={dismiss} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.66rem', color: C.textM, fontWeight: 500,
                fontFamily: 'Inter,sans-serif', padding: '0.3rem 0.5rem',
                borderRadius: 6, transition: 'color 0.15s',
              }}>
                {L.obSkip}
              </button>
              <button onClick={next} style={{
                background: C.primary,
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: '0.66rem', fontWeight: 600, fontFamily: 'Inter,sans-serif',
                padding: '0.35rem 0.75rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.2rem',
                boxShadow: `0 2px 8px ${C.primary}30`,
                transition: 'all 0.15s ease',
              }}>
                {step >= steps.length - 1 ? L.obDone : L.obNext}
                {step < steps.length - 1 && <ChevronRight size={11} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default OnboardingGuide;
