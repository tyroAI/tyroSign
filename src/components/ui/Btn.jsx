import { useState, useEffect, useRef, memo } from 'react';
import { C } from '../../constants/theme';

const Btn = memo(({ icon: Ic, onClick, disabled, isGreen, hoverColor, children }) => {
  const [hov, setHov] = useState(false);
  const [clicked, setClicked] = useState(false);
  const timerRef = useRef(null);
  const hc = hoverColor || C.primary;

  // Cleanup timeout on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleClick = (e) => {
    if (disabled) return;
    setClicked(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setClicked(false), 400);
    onClick?.(e);
  };
  return (
    <button
      onClick={handleClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.65rem 1.3rem',
        borderRadius: '10px',
        border: `1px solid ${hov && !disabled ? hc + '35' : C.borderSub}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isGreen ? `linear-gradient(135deg, ${C.ok}, #15803d)` : 'rgba(255,255,255,0.7)',
        color: isGreen ? '#fff' : C.text1,
        fontWeight: 600, fontSize: '0.78rem', fontFamily: 'Inter,sans-serif',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hov && !disabled ? 'translateY(-2px)' : 'none',
        boxShadow: hov && !disabled
          ? `0 4px 18px ${hc}22, 0 0 12px ${hc}10`
          : C.shadow,
        backdropFilter: 'blur(10px)',
        animation: clicked ? 'ripple 0.4s ease-out' : 'scaleIn 0.3s ease-out',
        letterSpacing: '0.01em',
      }}
    >
      <span style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: hov && !disabled ? 2.5 : 0,
        background: `linear-gradient(90deg, transparent, ${hc}, transparent)`,
        borderRadius: '0 0 2px 2px',
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
      <Ic size={14} style={{ color: hov && !disabled ? hc : C.text2, transition: 'color 0.3s' }} />
      {children}
    </button>
  );
});

export default Btn;
