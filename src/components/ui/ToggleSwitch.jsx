import { memo } from 'react';
import { C } from '../../constants/theme';

/* iOS native toggle — 51×31px, #34C759 green, 27px knob */
const ToggleSwitch = memo(({ checked, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: `1px solid ${C.borderSub}` }}>
    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: C.text1 }}>{label}</span>
    <div
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
      style={{
        width: 51, height: 31, borderRadius: 15.5, cursor: 'pointer',
        background: checked ? '#34C759' : '#e9e9eb',
        position: 'relative',
        transition: 'background 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.04)',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 27, height: 27, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, left: checked ? 22 : 2,
        transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.06)',
      }} />
    </div>
  </div>
));

export default ToggleSwitch;
