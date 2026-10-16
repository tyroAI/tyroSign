import { memo } from 'react';
import { Check } from 'lucide-react';
import { C } from '../constants/theme';

/* iOS native progress — thin (4px), pill-rounded, minimal chrome */
const ProgressBar = memo(({ progress, L }) => (
  <div className="progress-bar" style={{
    display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem',
    background: C.surface, backdropFilter: 'blur(12px)', borderRadius: 12,
    padding: '0.6rem 1rem', border: `1px solid ${C.border}`,
    transition: 'all 0.4s ease',
    boxShadow: progress.pct === 100 ? `0 2px 16px ${C.ok}15` : C.shadow,
  }}>
    {/* Badge */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.35rem',
      background: progress.pct === 100
        ? `linear-gradient(135deg, ${C.ok}12, ${C.ok}06)`
        : `linear-gradient(135deg, ${C.primary}10, ${C.divider}08)`,
      border: `1px solid ${progress.pct === 100 ? C.ok + '25' : C.primary + '15'}`,
      borderRadius: 8, padding: '0.25rem 0.55rem',
      transition: 'all 0.4s ease',
      animation: progress.pct === 100 ? 'completeBounce 0.5s ease' : 'none',
    }}>
      {progress.pct === 100 ? (
        <Check size={11} style={{ color: C.ok }} />
      ) : (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.primary}, ${C.divider})`,
          animation: 'pulse 2s infinite',
        }} />
      )}
      <span style={{
        fontSize: '0.6rem', fontWeight: 700,
        color: progress.pct === 100 ? C.ok : C.primary,
        fontFamily: 'Plus Jakarta Sans,sans-serif',
      }}>{L.prog}</span>
      <span style={{
        fontSize: '0.68rem', fontWeight: 800,
        color: progress.pct === 100 ? C.ok : C.accent,
        fontFamily: 'Plus Jakarta Sans,sans-serif',
        fontVariantNumeric: 'tabular-nums',
      }}>{progress.filled}{L.of}{progress.total}</span>
    </div>

    {/* iOS thin track — 4px, full pill radius */}
    <div style={{
      flex: 1, height: 4, borderRadius: 2, overflow: 'hidden', position: 'relative',
      background: progress.pct === 100 ? `${C.ok}18` : '#e5e5ea',
      transition: 'background 0.4s ease',
    }}>
      <div style={{
        height: '100%', width: `${progress.pct}%`,
        background: progress.pct === 100
          ? `linear-gradient(90deg, #34C759, #30D158)`
          : `linear-gradient(90deg, ${C.primary}, ${C.divider})`,
        borderRadius: 2,
        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative', overflow: 'hidden',
      }}>
        {progress.pct > 0 && progress.pct < 100 && <span style={{
          position: 'absolute', top: 0, bottom: 0, width: '40%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
          animation: 'barShine 2.5s ease-in-out infinite',
        }} />}
      </div>
    </div>

    {/* Percentage */}
    <span style={{
      fontSize: '0.68rem', fontWeight: 800,
      fontFamily: 'Plus Jakarta Sans,sans-serif',
      fontVariantNumeric: 'tabular-nums',
      color: progress.pct === 100 ? C.ok : C.accent,
      background: progress.pct === 100 ? `${C.ok}10` : `${C.accent}10`,
      padding: '0.15rem 0.4rem', borderRadius: 6,
      transition: 'all 0.4s ease',
      animation: progress.pct === 100 ? 'completeBounce 0.5s ease' : 'none',
    }}>
      {progress.pct}%
    </span>
  </div>
));

export default ProgressBar;
