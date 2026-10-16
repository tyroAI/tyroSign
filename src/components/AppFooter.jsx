import { memo } from 'react';
import { C } from '../constants/theme';

const AppFooter = memo(() => (
  <footer className="app-footer" style={{ textAlign: 'center', padding: '0.75rem 2rem', marginTop: 'auto', borderTop: `1px solid ${C.borderSub}`, background: C.glassSolid }}>
    <p style={{ fontSize: '0.6rem', color: C.textM, margin: 0 }}>
      Powered by <span style={{ fontWeight: 700, color: C.text2 }}>TYRO Tech</span>
      {' '}&middot;{' '}&copy; {new Date().getFullYear()} TYRO Tech &middot; Demo
    </p>
  </footer>
));

export default AppFooter;
