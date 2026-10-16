import { memo } from 'react';

/* Premium fountain pen icon — navy barrel, turkuaz grip, gold nib */
const TyroLogo = memo(({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 160 160" fill="none" style={{ filter: 'drop-shadow(0 2px 6px rgba(30,58,95,0.22))' }}>
    <defs>
      <linearGradient id="tlNavy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2e4d72" />
        <stop offset="45%" stopColor="#1e3a5f" />
        <stop offset="100%" stopColor="#152d4a" />
      </linearGradient>
      <linearGradient id="tlGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e0a832" />
        <stop offset="50%" stopColor="#c8922a" />
        <stop offset="100%" stopColor="#a67820" />
      </linearGradient>
    </defs>

    <g transform="translate(52, 4) rotate(32, 28, 72)">
      {/* Cap */}
      <rect x="18" y="0" width="24" height="18" rx="7" fill="url(#tlNavy)" />
      <rect x="18" y="0" width="11" height="18" rx="7" fill="#2e4d72" opacity="0.5" />
      <ellipse cx="30" cy="2" rx="12" ry="3.5" fill="#2c5282" />
      {/* Gold clip */}
      <rect x="40" y="2" width="4" height="28" rx="1.8" fill="url(#tlGold)" />
      <circle cx="42" cy="30" r="2.5" fill="#c8922a" />

      {/* Gold ring */}
      <rect x="16" y="17" width="28" height="5" rx="2.2" fill="url(#tlGold)" />
      <rect x="16" y="17" width="28" height="2.5" rx="1.2" fill="#e0a832" opacity="0.4" />

      {/* Barrel */}
      <rect x="18" y="22" width="24" height="62" rx="3.5" fill="url(#tlNavy)" />
      <rect x="18" y="22" width="10" height="62" rx="3.5" fill="#2e4d72" opacity="0.45" />
      <rect x="38" y="22" width="4" height="62" rx="2" fill="#152d4a" opacity="0.3" />
      <line x1="22" y1="26" x2="22" y2="80" stroke="#fff" strokeWidth="0.7" opacity="0.07" />

      {/* Silver ring */}
      <rect x="17" y="79" width="26" height="4" rx="1.8" fill="#94a3b8" opacity="0.5" />

      {/* Grip — turkuaz */}
      <rect x="19" y="84" width="22" height="20" rx="3" fill="#0098d4" />
      <rect x="19" y="84" width="9" height="20" rx="3" fill="#00b4e6" opacity="0.35" />
      <rect x="37" y="84" width="4" height="20" rx="2" fill="#007a9e" opacity="0.3" />
      <line x1="20" y1="89" x2="40" y2="89" stroke="#fff" strokeWidth="0.6" opacity="0.1" />
      <line x1="20" y1="94" x2="40" y2="94" stroke="#fff" strokeWidth="0.6" opacity="0.08" />
      <line x1="20" y1="99" x2="40" y2="99" stroke="#fff" strokeWidth="0.6" opacity="0.06" />

      {/* Nib — gold */}
      <polygon points="30,104 19,104 30,140 41,104" fill="url(#tlGold)" />
      <polygon points="30,104 19,104 27,132" fill="#e0a832" opacity="0.45" />
      <polygon points="30,104 41,104 33,132" fill="#a67820" opacity="0.3" />
      <line x1="30" y1="108" x2="30" y2="136" stroke="#8a6a18" strokeWidth="0.8" />
      <circle cx="30" cy="108" r="1.5" fill="#1e3a5f" opacity="0.4" />
      <circle cx="30" cy="139" r="1.8" fill="#e0a832" />
    </g>
  </svg>
));

export default TyroLogo;
