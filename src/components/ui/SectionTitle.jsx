import { memo } from 'react';
import { C } from '../../constants/theme';

const SectionTitle = memo(({ icon: Ic, children }) => (
  <h3 style={{
    fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '0.85rem', fontWeight: 700,
    color: C.primary, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
  }}>
    <Ic size={16} className="sec-icon" style={{ color: C.accent }} />
    {children}
  </h3>
));

export default SectionTitle;
