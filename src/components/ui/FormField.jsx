import { useState, memo } from 'react';
import { Check } from 'lucide-react';
import { C } from '../../constants/theme';

const FormField = memo(({ label, value, onChange, placeholder, required, error, success, type, action }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: '0.85rem' }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        fontSize: '0.7rem', fontWeight: 600,
        color: error ? C.err : focused ? C.primary : C.text2,
        marginBottom: '0.25rem', transition: 'color 0.2s',
      }}>
        {label}
        {required && <span style={{ color: C.err, fontSize: '0.6rem' }}>*</span>}
        {success && !error && value && (
          <Check size={12} style={{ color: C.ok, strokeWidth: 2.5, marginLeft: 'auto' }} />
        )}
        {/* Etiket satırının SAĞ UCUNA isteğe bağlı eylem (ör. GSM için "Gizle" anahtarı).
            marginLeft:auto yalnız tik YOKSA burada; ikisi birlikteyken tik zaten sağa
            itiyor, eylem onun hemen ardından geliyor. */}
        {action && <span style={{ marginLeft: success && !error && value ? '0.4rem' : 'auto', display: 'flex', alignItems: 'center' }}>{action}</span>}
      </label>
      <input
        type={type || 'text'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-required={required || undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `err-${label}` : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '0.55rem 0.75rem',
          border: error ? `1.5px solid ${C.err}60` : '1px solid transparent',
          borderRadius: 12, fontSize: '0.78rem', fontFamily: 'Inter,sans-serif',
          background: focused ? '#fff' : '#f2f3f5',
          color: C.text1,
          outline: 'none', boxSizing: 'border-box',
          transition: 'all 0.2s ease',
          boxShadow: focused
            ? `0 0 0 3.5px ${C.accent}20, 0 1px 3px rgba(0,0,0,0.06)`
            : error
              ? `0 0 0 3px ${C.err}10`
              : 'none',
        }}
      />
      {error && (
        <p id={`err-${label}`} role="alert" style={{
          fontSize: '0.58rem', color: C.err, marginTop: '0.2rem',
          fontWeight: 500, fontFamily: 'Inter,sans-serif',
          animation: 'fadeIn 0.2s ease',
        }}>
          {error}
        </p>
      )}
    </div>
  );
});

export default FormField;
