import { memo } from 'react';
import { Check } from 'lucide-react';
import { C } from '../constants/theme';

const CONFETTI_COLORS = [C.primary, C.accent, C.divider, C.ok, C.accentSoft, C.primarySoft];

const CopySuccess = memo(({ show }) => {
  if (!show) return null;

  const particles = [];
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * 360;
    const rad = angle * Math.PI / 180;
    const dist = 28 + Math.random() * 32;
    const dx = Math.cos(rad) * dist;
    const dy = Math.sin(rad) * dist;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const size = 4 + Math.random() * 4;
    const delay = Math.random() * 0.15;
    const shape = i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0';
    particles.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          width: size, height: size,
          background: color,
          borderRadius: shape,
          left: '50%', top: '50%',
          animation: `confettiFall 0.8s ${delay}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
          transform: `translate(${dx}px, ${dy}px)`,
          opacity: 0.9,
        }}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      {/* Particles */}
      <div style={{ position: 'relative', width: 0, height: 0 }}>
        {particles}
      </div>
      {/* Center check */}
      <div style={{
        width: 56, height: 56,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'successPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        boxShadow: '0 4px 24px rgba(22,163,74,0.4)',
      }}>
        <Check size={28} color="#fff" strokeWidth={3} />
      </div>
      {/* Expanding ring */}
      <div style={{
        position: 'absolute',
        width: 56, height: 56,
        borderRadius: '50%',
        animation: 'successRing 0.8s ease-out forwards',
      }} />
    </div>
  );
});

export default CopySuccess;
