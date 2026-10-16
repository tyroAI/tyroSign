import { memo, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { C } from '../../constants/theme';

const ChevronIcon = ({ open }) => (
  <svg width="12" height="7" viewBox="0 0 12 7" fill="none" style={{
    transition: 'transform 0.2s ease',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    flexShrink: 0,
  }}>
    <path d="M1 1L6 6L11 1" stroke={C.textM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchableSelect = memo(({
  value, onChange, placeholder, label, required,
  options, groups, groupLabels, nameKey, clearLabel, trailing,
}) => {
  const [open, setOpen] = useState(false);
  const [hlIdx, setHlIdx] = useState(-1); // keyboard highlight index
  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const btnRef = useRef(null);

  const selected = useMemo(() => options.find(o => o.id === value) || null, [options, value]);

  // Build flat list of selectable item IDs for keyboard navigation
  const flatIds = useMemo(() => {
    const ids = [];
    if (clearLabel) ids.push('__clear__');
    if (!groups) {
      options.forEach(o => ids.push(o.id));
    } else {
      groups.forEach(g => {
        options.filter(o => o.group === g).forEach(o => ids.push(o.id));
      });
    }
    return ids;
  }, [options, groups, clearLabel]);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* scroll selected into view on open + reset highlight */
  useEffect(() => {
    if (open) {
      setHlIdx(-1);
      if (listRef.current) {
        const active = listRef.current.querySelector('[data-active="true"]');
        if (active) active.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [open]);

  /* scroll highlighted item into view */
  useEffect(() => {
    if (!open || hlIdx < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${hlIdx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [hlIdx, open]);

  const selectItem = useCallback((id) => {
    onChange(id === '__clear__' ? '' : id);
    setOpen(false);
    btnRef.current?.focus();
  }, [onChange]);

  /* Keyboard navigation */
  const handleKeyDown = useCallback((e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHlIdx(prev => (prev < flatIds.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHlIdx(prev => (prev > 0 ? prev - 1 : flatIds.length - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (hlIdx >= 0 && hlIdx < flatIds.length) selectItem(flatIds[hlIdx]);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        btnRef.current?.focus();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  }, [open, hlIdx, flatIds, selectItem]);

  const clearRow = clearLabel ? (
    <div
      key="__clear__"
      data-idx={0}
      role="option"
      aria-selected={!value}
      onClick={() => selectItem('__clear__')}
      style={{
        padding: '0.4rem 0.55rem',
        fontSize: '0.75rem', fontFamily: 'Inter,sans-serif',
        color: value ? C.textM : C.primary,
        fontStyle: 'italic',
        fontWeight: value ? 400 : 600,
        cursor: 'pointer',
        background: (hlIdx === 0) ? '#eef2f7' : (!value ? `${C.primary}08` : 'transparent'),
        borderLeft: value ? '2.5px solid transparent' : `2.5px solid ${C.accent}`,
        borderBottom: `1px solid ${C.borderSub}`,
        marginBottom: '0.2rem',
        outline: 'none',
      }}
      onMouseEnter={() => setHlIdx(0)}
    >
      {clearLabel}
    </div>
  ) : null;

  const renderRows = () => {
    let idx = clearLabel ? 1 : 0;
    if (!groups) {
      return [
        clearRow,
        ...options.map(o => row(o, idx++)),
      ];
    }
    const out = clearRow ? [clearRow] : [];
    groups.forEach(g => {
      const items = options.filter(o => o.group === g);
      if (!items.length) return;
      const gLabel = groupLabels?.[g] || g;
      out.push(
        <div key={'g-' + g} role="presentation" style={{
          padding: '0.3rem 0.55rem 0.15rem', fontSize: '0.55rem', fontWeight: 700,
          color: C.textM, textTransform: 'uppercase', letterSpacing: '0.5px',
          fontFamily: 'Plus Jakarta Sans,sans-serif',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          {gLabel}
        </div>
      );
      items.forEach(o => out.push(row(o, idx++)));
    });
    return out;
  };

  const row = (o, idx) => {
    const active = value === o.id;
    const highlighted = hlIdx === idx;
    return (
      <div
        key={o.id}
        data-active={active ? 'true' : undefined}
        data-idx={idx}
        role="option"
        aria-selected={active}
        onClick={() => selectItem(o.id)}
        onMouseEnter={() => setHlIdx(idx)}
        style={{
          padding: '0.4rem 0.55rem',
          fontSize: '0.75rem', fontFamily: 'Inter,sans-serif',
          color: active ? C.primary : C.text1,
          fontWeight: active ? 600 : 400,
          cursor: 'pointer',
          background: highlighted ? '#eef2f7' : (active ? `${C.primary}08` : 'transparent'),
          borderLeft: active ? `2.5px solid ${C.accent}` : '2.5px solid transparent',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          outline: 'none',
        }}
      >
        {(nameKey && o[nameKey]) || o.name}
      </div>
    );
  };

  return (
    <div style={{ marginBottom: '0.7rem', position: 'relative' }} ref={wrapRef}>
      {label && (
        <label id={`lbl-${label}`} style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          fontSize: '0.7rem', fontWeight: 600, color: C.text2, marginBottom: '0.25rem',
        }}>
          {label}
          {required && <span style={{ color: C.err }}>*</span>}
        </label>
      )}

      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'stretch' }}>
        <button
          ref={btnRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-labelledby={label ? `lbl-${label}` : undefined}
          onClick={() => setOpen(p => !p)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.45rem 0.65rem',
            background: '#fff',
            border: `1.5px solid ${open ? C.accent + '60' : C.borderSub}`,
            borderRadius: 8,
            cursor: 'pointer', transition: 'border-color 0.15s',
            fontFamily: 'Inter,sans-serif', fontSize: '0.78rem', color: C.text1,
            boxSizing: 'border-box', outline: 'none', textAlign: 'left',
          }}
        >
          <span style={{
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: selected ? C.text1 : C.textM,
            fontWeight: selected ? 500 : 400,
          }}>
            {selected ? ((nameKey && selected[nameKey]) || selected.name) : placeholder}
          </span>
          <ChevronIcon open={open} />
        </button>
        {trailing}
      </div>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-labelledby={label ? `lbl-${label}` : undefined}
          style={{
            position: 'absolute', left: 0, right: 0,
            top: 'calc(100% + 4px)',
            maxHeight: 240,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: '#fff',
            border: `1px solid ${C.borderSub}`,
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            zIndex: 200,
            padding: '0.2rem 0',
            scrollbarWidth: 'thin',
          }}
        >
          {renderRows()}
        </div>
      )}
    </div>
  );
});

export default SearchableSelect;
