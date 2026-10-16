import { memo } from 'react';
import { C } from '../../constants/theme';

const ColorPicker = memo(({ label, value, onChange }) => (
  <div>
    <label style={{ fontSize: '0.63rem', fontWeight: 600, color: C.text2, marginBottom: '0.3rem', display: 'block' }}>{label}</label>
    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden', border: `2px solid ${C.borderSub}`, position: 'relative' }}>
        <input
          type="color"
          value={value}
          onChange={onChange}
          aria-label={label}
          style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', position: 'absolute', top: -7, left: -7 }}
        />
      </div>
      <span style={{ fontSize: '0.6rem', color: C.text2, fontFamily: 'monospace' }}>{value}</span>
    </div>
  </div>
));

export default ColorPicker;
