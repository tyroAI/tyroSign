import { memo } from 'react';
import { Check } from 'lucide-react';
import { C } from '../constants/theme';

const ToastContainer = memo(({ toasts }) => (
  <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.4rem' }} role="status" aria-live="polite">
    {toasts.map(t => (
      <div key={t.id} style={{
        animation: 'toastIn 0.25s ease-out',
        padding: '0.55rem 1rem', borderRadius: '9px',
        background: t.type === 'success' ? C.ok : t.type === 'err' ? C.err : C.info,
        color: '#fff', fontSize: '0.72rem', fontWeight: 600,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '0.4rem',
      }}>
        <Check size={13} />{t.msg}
      </div>
    ))}
  </div>
));

export default ToastContainer;
