import { memo, useState } from 'react';
import { C } from '../../constants/theme';

const TabBtn = memo(({ active, onClick, icon: Ic, label }) => {
  const [hovered, setHovered] = useState(false);
  const lit = active || hovered;

  return (
    <button
      className="nav-tab-btn"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.4rem 1rem', borderRadius: 8,
        border: 'none', cursor: 'pointer',
        background: lit ? '#fff' : 'transparent',
        color: lit ? C.primary : C.textM,
        fontWeight: lit ? 700 : 500, fontSize: '0.76rem', fontFamily: 'Inter,sans-serif',
        transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: lit ? '0 1px 3px rgba(30,58,95,0.1), 0 1px 2px rgba(30,58,95,0.06)' : 'none',
      }}
    >
      <Ic
        size={13}
        style={{
          color: lit ? C.accent : C.textM,
          transition: 'all 0.25s ease',
          transform: hovered ? 'scale(1.15) rotate(-6deg)' : 'scale(1) rotate(0deg)',
        }}
      />
      {label}
    </button>
  );
});

export default TabBtn;
