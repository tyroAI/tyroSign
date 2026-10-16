import { memo, useState } from 'react';
import { C } from '../constants/theme';
import tyrosignLogo from '../assets/tyrosign-logo.png';

/* ── Shared gradient defs ─────────────────────── */
const GradientDefs = () => (
  <defs>
    <linearGradient id="lcNavy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2e4d72" />
      <stop offset="100%" stopColor="#1e3a5f" />
    </linearGradient>
    <linearGradient id="lcNavyH" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#1e3a5f" />
      <stop offset="100%" stopColor="#0098d4" />
    </linearGradient>
    <linearGradient id="lcGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#e0a832" />
      <stop offset="50%" stopColor="#c8922a" />
      <stop offset="100%" stopColor="#a67820" />
    </linearGradient>
    <linearGradient id="lcGoldH" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#c8922a" />
      <stop offset="60%" stopColor="#d4a23a" />
      <stop offset="100%" stopColor="#c8922a" />
    </linearGradient>
    <linearGradient id="lcBlue" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#0098d4" />
      <stop offset="100%" stopColor="#1e3a5f" />
    </linearGradient>
    <filter id="lcShadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1e3a5f" floodOpacity="0.18" />
    </filter>
  </defs>
);

/* ── Konsept 1: Signature Flow ──────────────────── */
const Logo1 = () => (
  <svg viewBox="0 0 160 160" fill="none" width="100%" height="100%">
    <GradientDefs />
    {/* Rounded square bg */}
    <rect x="8" y="8" width="144" height="144" rx="36" fill="url(#lcNavy)" />
    {/* Flowing S-signature */}
    <path d="M36 105 C48 80, 58 110, 72 88 S88 70, 100 90 S110 105, 118 82"
      fill="none" stroke="url(#lcGoldH)" strokeWidth="4" strokeLinecap="round" />
    {/* Pen nib at start */}
    <g transform="translate(24, 92) rotate(-35)">
      <polygon points="8,0 0,18 16,18" fill="url(#lcGold)" />
      <line x1="8" y1="2" x2="8" y2="16" stroke="#8a6a18" strokeWidth="0.8" />
    </g>
    {/* Ink dot at end */}
    <circle cx="122" cy="80" r="3" fill="#c8922a" opacity="0.6" />
    {/* Small stars */}
    <circle cx="45" cy="48" r="1.5" fill="#fff" opacity="0.3" />
    <circle cx="120" cy="52" r="1" fill="#fff" opacity="0.2" />
  </svg>
);

/* ── Konsept 2: Mail Seal ──────────────────────── */
const Logo2 = () => (
  <svg viewBox="0 0 160 160" fill="none" width="100%" height="100%">
    <GradientDefs />
    <rect x="8" y="8" width="144" height="144" rx="36" fill="url(#lcNavy)" />
    {/* Outer seal ring */}
    <circle cx="80" cy="80" r="48" fill="none" stroke="url(#lcGold)" strokeWidth="3" />
    <circle cx="80" cy="80" r="42" fill="none" stroke="#c8922a" strokeWidth="1" opacity="0.4" />
    {/* Wax seal texture */}
    <circle cx="80" cy="80" r="38" fill="#c8922a" opacity="0.15" />
    {/* S monogram */}
    <text x="80" y="96" textAnchor="middle" fontFamily="Georgia, serif" fontSize="52" fontWeight="bold" fontStyle="italic" fill="url(#lcGold)">S</text>
    {/* Decorative dots around */}
    {[0,45,90,135,180,225,270,315].map((a, i) => (
      <circle key={i} cx={80 + 46 * Math.cos(a * Math.PI / 180)} cy={80 + 46 * Math.sin(a * Math.PI / 180)} r="1.5" fill="#c8922a" opacity="0.5" />
    ))}
  </svg>
);

/* ── Konsept 3: Smart Envelope ─────────────────── */
const Logo3 = () => (
  <svg viewBox="0 0 160 160" fill="none" width="100%" height="100%">
    <GradientDefs />
    {/* Gradient border */}
    <rect x="8" y="8" width="144" height="144" rx="36" fill="url(#lcNavyH)" />
    <rect x="12" y="12" width="136" height="136" rx="33" fill="#1e3a5f" />
    {/* Envelope body */}
    <rect x="32" y="48" width="76" height="56" rx="6" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.9" />
    {/* Envelope flap */}
    <path d="M32 48 L70 78 L108 48" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    {/* Edit pen (bottom-right) */}
    <g transform="translate(100, 88)">
      <circle cx="16" cy="16" r="20" fill="url(#lcGold)" />
      <g transform="translate(6, 4) rotate(0)">
        <rect x="8" y="2" width="10" height="20" rx="2" fill="#1e3a5f" />
        <polygon points="13,22 8,22 10,28 16,28" fill="#1e3a5f" />
        <polygon points="11,28 10,32 16,28" fill="#e0a832" />
      </g>
    </g>
  </svg>
);

/* ── Konsept 4: QR Pen ─────────────────────────── */
const Logo4 = () => (
  <svg viewBox="0 0 160 160" fill="none" width="100%" height="100%">
    <GradientDefs />
    <rect x="8" y="8" width="144" height="144" rx="36" fill="url(#lcNavy)" />
    {/* QR finder patterns — top-left, top-right, bottom-left */}
    {/* Top-left */}
    <rect x="30" y="30" width="28" height="28" rx="4" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.85" />
    <rect x="37" y="37" width="14" height="14" rx="2" fill="#fff" opacity="0.85" />
    {/* Top-right */}
    <rect x="102" y="30" width="28" height="28" rx="4" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.85" />
    <rect x="109" y="37" width="14" height="14" rx="2" fill="#fff" opacity="0.85" />
    {/* Bottom-left */}
    <rect x="30" y="102" width="28" height="28" rx="4" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.85" />
    <rect x="37" y="109" width="14" height="14" rx="2" fill="#fff" opacity="0.85" />
    {/* QR data dots */}
    {[[68,34],[78,34],[68,44],[88,44],[68,68],[78,58],[34,68],[44,68],[34,78],[78,78],[88,68]].map(([x,y],i) => (
      <rect key={i} x={x} y={y} width="6" height="6" rx="1" fill="#fff" opacity="0.5" />
    ))}
    {/* Pen emerging from bottom-right */}
    <g transform="translate(95, 85) rotate(-45)">
      <rect x="4" y="0" width="12" height="32" rx="2" fill="url(#lcGold)" />
      <polygon points="10,32 4,32 7,42 13,42" fill="url(#lcGold)" />
      <polygon points="8,42 7,46 13,42" fill="#fff" />
      <line x1="10" y1="4" x2="10" y2="30" stroke="#8a6a18" strokeWidth="0.5" opacity="0.3" />
    </g>
  </svg>
);

/* ── Konsept 5: Card Stack + Pen overlay ─────── */
const Logo5 = () => (
  <svg viewBox="0 0 160 160" fill="none" width="100%" height="100%">
    <GradientDefs />
    {/* Back card (rotated) */}
    <g transform="rotate(-8, 80, 80)">
      <rect x="28" y="42" width="104" height="68" rx="10" fill="#1e3a5f" opacity="0.08" />
      <rect x="28" y="42" width="104" height="68" rx="10" fill="none" stroke="#1e3a5f" strokeWidth="1.5" opacity="0.2" />
    </g>
    {/* Front card */}
    <g transform="rotate(3, 80, 85)">
      <rect x="20" y="48" width="112" height="72" rx="10" fill="#fff" />
      <rect x="20" y="48" width="112" height="72" rx="10" fill="none" stroke="#1e3a5f" strokeWidth="1.8" opacity="0.15" />
      {/* Name line */}
      <rect x="34" y="64" width="48" height="4" rx="2" fill="#1e3a5f" opacity="0.7" />
      {/* Title line */}
      <rect x="34" y="74" width="32" height="3" rx="1.5" fill="#1e3a5f" opacity="0.25" />
      {/* Contact lines */}
      <rect x="34" y="84" width="24" height="2" rx="1" fill="#0098d4" opacity="0.3" />
      <rect x="62" y="84" width="20" height="2" rx="1" fill="#0098d4" opacity="0.2" />
      {/* Signature */}
      <path d="M34 100 C42 90, 50 102, 60 94 S72 86, 82 96"
        fill="none" stroke="url(#lcGoldH)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Logo placeholder */}
      <rect x="104" y="62" width="20" height="20" rx="4" fill="url(#lcNavy)" opacity="0.12" />
      <rect x="108" y="66" width="12" height="12" rx="2" fill="url(#lcGold)" opacity="0.5" />
    </g>
    {/* Pen — cap top-left, nib bottom-right */}
    <g transform="translate(100, 10) rotate(40)">
      {/* Cap */}
      <rect x="-6" y="0" width="12" height="10" rx="4" fill="url(#lcNavy)" />
      {/* Gold ring */}
      <rect x="-7" y="8.5" width="14" height="3" rx="1.2" fill="url(#lcGold)" />
      {/* Clip */}
      <rect x="5" y="1" width="2.5" height="17" rx="1.2" fill="url(#lcGold)" />
      <circle cx="6.2" cy="18" r="1.5" fill="#c8922a" />
      {/* Barrel */}
      <rect x="-5.5" y="11.5" width="11" height="40" rx="2.5" fill="url(#lcNavy)" />
      <rect x="-5.5" y="11.5" width="5" height="40" rx="2.5" fill="#2e4d72" opacity="0.4" />
      {/* Barrel ring */}
      <rect x="-6" y="46" width="12" height="2.5" rx="1" fill="#8a9bb5" opacity="0.35" />
      {/* Grip */}
      <rect x="-5" y="50" width="10" height="13" rx="1.8" fill="#1e3a5f" opacity="0.9" />
      <line x1="-5" y1="54" x2="5" y2="54" stroke="#fff" strokeWidth="0.4" opacity="0.12" />
      <line x1="-5" y1="58" x2="5" y2="58" stroke="#fff" strokeWidth="0.4" opacity="0.1" />
      {/* Nib */}
      <polygon points="0,63 -5,63 0,80 5,63" fill="url(#lcGold)" />
      <line x1="0" y1="65" x2="0" y2="78" stroke="#8a6a18" strokeWidth="0.6" />
      <circle cx="0" cy="79" r="1" fill="#e0a832" opacity="0.7" />
    </g>
  </svg>
);

/* ── Konsept 6: Nib Drop — Byte-style dissolve + ink drop ── */
const Logo6 = () => (
  <svg viewBox="0 0 160 160" fill="none" width="100%" height="100%">
    <GradientDefs />
    <g transform="translate(72, 4) rotate(25, 16, 55)">
      {/* === SOLID PEN — smooth pixel edge merge === */}
      {/* Cap */}
      <rect x="-8" y="0" width="20" height="10" rx="4" fill="url(#lcNavy)" />
      {/* Pixel merge layer 1 (touching cap, nearly solid) */}
      <rect x="-11.5" y="0" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.97" />
      <rect x="-11.5" y="3.5" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.95" />
      <rect x="-11" y="7" width="3" height="3" rx="0.5" fill="#1e3a5f" opacity="0.92" />
      {/* Layer 2 */}
      <rect x="-15" y="0.5" width="3" height="3" rx="0.5" fill="#1e3a5f" opacity="0.78" />
      <rect x="-15" y="4" width="3" height="3" rx="0.5" fill="#1e3a5f" opacity="0.72" />
      <rect x="-14.5" y="7.5" width="3" height="2.5" rx="0.5" fill="#1e3a5f" opacity="0.65" />
      {/* Layer 3 */}
      <rect x="-18.5" y="1" width="2.5" height="2.5" rx="0.5" fill="#1e3a5f" opacity="0.48" />
      <rect x="-18" y="5" width="2.5" height="2.5" rx="0.5" fill="#0098d4" opacity="0.38" />
      {/* Layer 4 */}
      <rect x="-21.5" y="2" width="2" height="2" rx="0.3" fill="#1e3a5f" opacity="0.25" />
      <rect x="-21" y="6" width="2" height="2" rx="0.3" fill="#0098d4" opacity="0.18" />
      {/* Layer 5 — ghost */}
      <rect x="-24" y="3" width="1.5" height="1.5" rx="0.3" fill="#1e3a5f" opacity="0.1" />
      <rect x="-23.5" y="7" width="1.5" height="1.5" rx="0.3" fill="#0098d4" opacity="0.07" />

      {/* Gold ring */}
      <rect x="-9" y="9" width="22" height="3.5" rx="1.5" fill="url(#lcGold)" />
      <rect x="10" y="1" width="2.5" height="16" rx="1" fill="url(#lcGold)" />
      <circle cx="11.2" cy="17" r="1.5" fill="#c8922a" />
      {/* Gold ring pixel merge */}
      <rect x="-12.5" y="9" width="3.5" height="3.5" rx="0.5" fill="#c8922a" opacity="0.92" />
      <rect x="-16" y="9.5" width="3" height="3" rx="0.5" fill="#c8922a" opacity="0.65" />
      <rect x="-19.5" y="10" width="2.5" height="2.5" rx="0.5" fill="#c8922a" opacity="0.38" />
      <rect x="-22.5" y="10.5" width="2" height="2" rx="0.3" fill="#c8922a" opacity="0.18" />
      <rect x="-25" y="10.5" width="1.5" height="1.5" rx="0.3" fill="#c8922a" opacity="0.08" />

      {/* Barrel */}
      <rect x="-7" y="12.5" width="18" height="40" rx="2.5" fill="url(#lcNavy)" />
      <rect x="-7" y="12.5" width="7" height="40" rx="2.5" fill="#2e4d72" opacity="0.4" />
      {/* Barrel pixel merge — layer 1 (touching, nearly solid, no gap) */}
      <rect x="-10.5" y="13" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.95" />
      <rect x="-10.5" y="17" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.94" />
      <rect x="-10.5" y="21" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.93" />
      <rect x="-10.5" y="25" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.92" />
      <rect x="-10.5" y="29" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.91" />
      <rect x="-10.5" y="33" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.9" />
      <rect x="-10.5" y="37" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.89" />
      <rect x="-10.5" y="41" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.88" />
      <rect x="-10.5" y="45" width="3.5" height="3" rx="0.5" fill="#1e3a5f" opacity="0.87" />
      {/* Layer 2 */}
      <rect x="-14" y="13.5" width="3" height="3" rx="0.5" fill="#1e3a5f" opacity="0.72" />
      <rect x="-14" y="18" width="3" height="3" rx="0.5" fill="#1e3a5f" opacity="0.68" />
      <rect x="-14" y="22.5" width="3" height="3" rx="0.5" fill="#0098d4" opacity="0.6" />
      <rect x="-14" y="27" width="3" height="3" rx="0.5" fill="#1e3a5f" opacity="0.62" />
      <rect x="-14" y="31.5" width="3" height="3" rx="0.5" fill="#0098d4" opacity="0.55" />
      <rect x="-14" y="36" width="3" height="3" rx="0.5" fill="#1e3a5f" opacity="0.58" />
      <rect x="-14" y="40.5" width="3" height="3" rx="0.5" fill="#0098d4" opacity="0.5" />
      <rect x="-14" y="45" width="3" height="2.5" rx="0.5" fill="#1e3a5f" opacity="0.52" />
      {/* Layer 3 */}
      <rect x="-17.5" y="14.5" width="2.5" height="2.5" rx="0.5" fill="#0098d4" opacity="0.42" />
      <rect x="-17.5" y="20" width="2.5" height="2.5" rx="0.5" fill="#1e3a5f" opacity="0.38" />
      <rect x="-17" y="25.5" width="2.5" height="2.5" rx="0.5" fill="#0098d4" opacity="0.35" />
      <rect x="-17.5" y="31" width="2.5" height="2.5" rx="0.5" fill="#1e3a5f" opacity="0.32" />
      <rect x="-17" y="36.5" width="2.5" height="2.5" rx="0.5" fill="#0098d4" opacity="0.28" />
      <rect x="-17.5" y="42" width="2.5" height="2.5" rx="0.5" fill="#1e3a5f" opacity="0.25" />
      {/* Layer 4 */}
      <rect x="-20.5" y="16" width="2" height="2" rx="0.3" fill="#1e3a5f" opacity="0.2" />
      <rect x="-20" y="23" width="2" height="2" rx="0.3" fill="#0098d4" opacity="0.16" />
      <rect x="-20.5" y="30" width="2" height="2" rx="0.3" fill="#1e3a5f" opacity="0.14" />
      <rect x="-20" y="37" width="2" height="2" rx="0.3" fill="#0098d4" opacity="0.12" />
      <rect x="-20.5" y="44" width="1.5" height="1.5" rx="0.3" fill="#1e3a5f" opacity="0.1" />
      {/* Layer 5 — ghost */}
      <rect x="-23" y="18" width="1.5" height="1.5" rx="0.3" fill="#1e3a5f" opacity="0.08" />
      <rect x="-23" y="27" width="1.5" height="1.5" rx="0.3" fill="#0098d4" opacity="0.06" />
      <rect x="-22.5" y="35" width="1.5" height="1.5" rx="0.3" fill="#1e3a5f" opacity="0.05" />
      <rect x="-23" y="43" width="1" height="1" rx="0.2" fill="#0098d4" opacity="0.04" />

      {/* Barrel ring */}
      <rect x="-8" y="48" width="20" height="2.5" rx="1" fill="#8a9bb5" opacity="0.35" />

      {/* Grip */}
      <rect x="-6" y="52" width="16" height="13" rx="2" fill="#1e3a5f" opacity="0.9" />
      <line x1="-6" y1="56" x2="10" y2="56" stroke="#fff" strokeWidth="0.4" opacity="0.1" />
      <line x1="-6" y1="60" x2="10" y2="60" stroke="#fff" strokeWidth="0.4" opacity="0.08" />
      {/* Grip pixel merge */}
      <rect x="-9.5" y="52.5" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.85" />
      <rect x="-9.5" y="56.5" width="3.5" height="3.5" rx="0.5" fill="#1e3a5f" opacity="0.82" />
      <rect x="-9.5" y="60.5" width="3.5" height="3" rx="0.5" fill="#1e3a5f" opacity="0.8" />
      <rect x="-13" y="53.5" width="3" height="3" rx="0.5" fill="#0098d4" opacity="0.5" />
      <rect x="-13" y="58" width="3" height="3" rx="0.5" fill="#1e3a5f" opacity="0.45" />
      <rect x="-16.5" y="55" width="2" height="2" rx="0.3" fill="#0098d4" opacity="0.22" />
      <rect x="-16" y="60" width="2" height="2" rx="0.3" fill="#1e3a5f" opacity="0.18" />
      <rect x="-19" y="57" width="1.5" height="1.5" rx="0.3" fill="#0098d4" opacity="0.08" />

      {/* Nib — solid gold */}
      <polygon points="2,65 -5,65 2,84 9,65" fill="url(#lcGold)" />
      <line x1="2" y1="67" x2="2" y2="82" stroke="#8a6a18" strokeWidth="0.6" />
      {/* Nib pixel merge — left side dissolve continues through nib */}
      <rect x="-8.5" y="65.5" width="3.5" height="3.5" rx="0.5" fill="#c8922a" opacity="0.9" />
      <rect x="-8" y="69.5" width="3" height="3" rx="0.5" fill="#c8922a" opacity="0.85" />
      <rect x="-7" y="73.5" width="3" height="3" rx="0.5" fill="#d4a23a" opacity="0.8" />
      <rect x="-5.5" y="77" width="2.5" height="2.5" rx="0.5" fill="#c8922a" opacity="0.75" />
      <rect x="-4" y="80" width="2.5" height="2.5" rx="0.5" fill="#c8922a" opacity="0.7" />
      {/* Layer 2 */}
      <rect x="-12" y="66" width="3" height="3" rx="0.5" fill="#c8922a" opacity="0.6" />
      <rect x="-11.5" y="70.5" width="2.5" height="2.5" rx="0.5" fill="#d4a23a" opacity="0.5" />
      <rect x="-10.5" y="74.5" width="2.5" height="2.5" rx="0.5" fill="#c8922a" opacity="0.42" />
      <rect x="-9" y="78" width="2" height="2" rx="0.3" fill="#c8922a" opacity="0.35" />
      {/* Layer 3 */}
      <rect x="-15.5" y="67" width="2.5" height="2.5" rx="0.5" fill="#c8922a" opacity="0.35" />
      <rect x="-14.5" y="72" width="2" height="2" rx="0.3" fill="#d4a23a" opacity="0.25" />
      <rect x="-13" y="76" width="2" height="2" rx="0.3" fill="#c8922a" opacity="0.18" />
      {/* Layer 4 — ghost */}
      <rect x="-18.5" y="68" width="2" height="2" rx="0.3" fill="#c8922a" opacity="0.15" />
      <rect x="-17" y="73" width="1.5" height="1.5" rx="0.3" fill="#d4a23a" opacity="0.1" />
      <rect x="-21" y="69.5" width="1.5" height="1.5" rx="0.3" fill="#c8922a" opacity="0.06" />
    </g>

    {/* === PART 2: Gold ink DROP shape — teardrop made of dense pixels === */}
    {/* Positioned right below nib tip */}
    {/* Top of drop — narrow, very dense */}
    <rect x="80" y="90" width="4" height="4" rx="0.5" fill="#c8922a" opacity="1" />
    <rect x="76" y="91" width="3.5" height="3.5" rx="0.5" fill="#c8922a" opacity="0.95" />
    <rect x="84.5" y="91.5" width="3.5" height="3.5" rx="0.5" fill="#d4a23a" opacity="0.95" />
    {/* Widening — drop shape */}
    <rect x="73" y="95" width="4" height="4" rx="0.5" fill="#c8922a" opacity="0.92" />
    <rect x="78" y="95.5" width="4.5" height="4.5" rx="0.6" fill="#c8922a" opacity="0.95" />
    <rect x="83" y="95" width="4" height="4" rx="0.5" fill="#d4a23a" opacity="0.93" />
    <rect x="87.5" y="96" width="3.5" height="3.5" rx="0.5" fill="#c8922a" opacity="0.88" />
    <rect x="69.5" y="96" width="3" height="3" rx="0.5" fill="#c8922a" opacity="0.82" />
    {/* Widest part — belly of drop */}
    <rect x="68" y="100.5" width="3.5" height="3.5" rx="0.5" fill="#c8922a" opacity="0.85" />
    <rect x="72" y="100" width="4" height="4" rx="0.5" fill="#c8922a" opacity="0.9" />
    <rect x="76.5" y="100.5" width="4.5" height="4.5" rx="0.6" fill="#d4a23a" opacity="0.92" />
    <rect x="81.5" y="100" width="4.5" height="4.5" rx="0.6" fill="#c8922a" opacity="0.93" />
    <rect x="86.5" y="100.5" width="4" height="4" rx="0.5" fill="#c8922a" opacity="0.88" />
    <rect x="91" y="101" width="3.5" height="3.5" rx="0.5" fill="#d4a23a" opacity="0.78" />
    <rect x="65" y="101.5" width="2.5" height="2.5" rx="0.5" fill="#c8922a" opacity="0.65" />
    {/* Narrowing — bottom of drop */}
    <rect x="70" y="105.5" width="3.5" height="3.5" rx="0.5" fill="#c8922a" opacity="0.78" />
    <rect x="74.5" y="105" width="4" height="4" rx="0.5" fill="#d4a23a" opacity="0.82" />
    <rect x="79" y="105.5" width="4.5" height="4.5" rx="0.6" fill="#c8922a" opacity="0.85" />
    <rect x="84" y="105" width="4" height="4" rx="0.5" fill="#c8922a" opacity="0.8" />
    <rect x="88.5" y="106" width="3" height="3" rx="0.5" fill="#d4a23a" opacity="0.65" />
    <rect x="67" y="106.5" width="2.5" height="2.5" rx="0.5" fill="#c8922a" opacity="0.55" />
    {/* Tapering */}
    <rect x="73" y="110" width="3.5" height="3.5" rx="0.5" fill="#c8922a" opacity="0.68" />
    <rect x="77.5" y="110.5" width="4" height="4" rx="0.5" fill="#d4a23a" opacity="0.72" />
    <rect x="82" y="110" width="3.5" height="3.5" rx="0.5" fill="#c8922a" opacity="0.65" />
    <rect x="86" y="111" width="2.5" height="2.5" rx="0.5" fill="#c8922a" opacity="0.48" />
    <rect x="70" y="111" width="2.5" height="2.5" rx="0.5" fill="#d4a23a" opacity="0.42" />
    {/* Tip of drop */}
    <rect x="76" y="115" width="3" height="3" rx="0.5" fill="#c8922a" opacity="0.55" />
    <rect x="80" y="115.5" width="3.5" height="3.5" rx="0.5" fill="#d4a23a" opacity="0.5" />
    <rect x="84" y="116" width="2.5" height="2.5" rx="0.5" fill="#c8922a" opacity="0.38" />
    <rect x="73.5" y="116" width="2" height="2" rx="0.3" fill="#c8922a" opacity="0.32" />
    {/* Drip point */}
    <rect x="78" y="119.5" width="3" height="3" rx="0.5" fill="#c8922a" opacity="0.35" />
    <rect x="82" y="120" width="2" height="2" rx="0.3" fill="#d4a23a" opacity="0.25" />
    <rect x="79.5" y="123" width="2" height="2" rx="0.3" fill="#c8922a" opacity="0.18" />
    <rect x="80.5" y="126" width="1.5" height="1.5" rx="0.3" fill="#c8922a" opacity="0.1" />
  </svg>
);

/* ── Konsept 7: Shield Sign ────────────────────── */
const Logo7 = () => (
  <svg viewBox="0 0 160 160" fill="none" width="100%" height="100%">
    <GradientDefs />
    <rect x="8" y="8" width="144" height="144" rx="36" fill="url(#lcNavy)" />
    {/* Shield shape */}
    <path d="M80 28 L120 44 L120 80 C120 108, 80 132, 80 132 C80 132, 40 108, 40 80 L40 44 Z"
      fill="none" stroke="url(#lcGold)" strokeWidth="3" />
    <path d="M80 34 L114 48 L114 78 C114 102, 80 124, 80 124 C80 124, 46 102, 46 78 L46 48 Z"
      fill="#c8922a" opacity="0.08" />
    {/* Pen in center */}
    <g transform="translate(70, 48) rotate(15)">
      <rect x="0" y="0" width="10" height="28" rx="2" fill="#fff" opacity="0.85" />
      <rect x="-1" y="24" width="12" height="3" rx="1" fill="url(#lcGold)" />
      <polygon points="5,28 0,28 3,38 7,38" fill="#fff" opacity="0.85" />
      <polygon points="4,38 3,42 7,38" fill="url(#lcGold)" />
    </g>
    {/* Signature below pen */}
    <path d="M56 102 C62 94, 68 102, 76 96 S84 90, 92 98 S98 104, 104 96"
      fill="none" stroke="url(#lcGoldH)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/* ── Konsept 8: TYRO Calligraphy ───────────────── */
const Logo8 = () => (
  <svg viewBox="0 0 320 160" fill="none" width="100%" height="100%">
    <GradientDefs />
    {/* Wide rounded bg */}
    <rect x="4" y="4" width="312" height="152" rx="32" fill="url(#lcNavy)" />
    {/* T letter that morphs into a pen */}
    <g>
      {/* T horizontal stroke */}
      <path d="M32 52 L72 52" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      {/* T vertical → pen body */}
      <path d="M52 52 L52 78" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      {/* Pen grip */}
      <rect x="48" y="78" width="8" height="8" rx="1" fill="#fff" opacity="0.7" />
      {/* Pen nib — gold */}
      <polygon points="52,86 47,86 50,98 54,98" fill="url(#lcGold)" />
      <polygon points="51,98 50,102 54,98" fill="#e0a832" />
    </g>
    {/* "yro" in calligraphy style — handwritten feel */}
    <text x="76" y="94" fontFamily="Georgia, 'Times New Roman', serif" fontSize="42" fontStyle="italic" fontWeight="bold" fill="#fff" opacity="0.9" letterSpacing="-1">yro</text>
    {/* Gold signature flow from pen tip going under "yro" */}
    <path d="M51 100 C58 112, 72 108, 88 118 S120 124, 160 112 S200 106, 240 116 S268 122, 290 108"
      fill="none" stroke="url(#lcGoldH)" strokeWidth="3" strokeLinecap="round" />
    {/* Small ink dots */}
    <circle cx="294" cy="106" r="2" fill="#c8922a" opacity="0.5" />
    <circle cx="300" cy="110" r="1" fill="#c8922a" opacity="0.3" />
    {/* "SignSnap" subtitle */}
    <text x="160" y="142" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="#fff" opacity="0.45" letterSpacing="4">SIGN SNAP</text>
  </svg>
);

/* ── Konsept 9: Geometric Pen Mark — PNG logo ── */
const Logo9 = () => (
  <img src={tyrosignLogo} alt="tyrosign" style={{ width: '100%', maxHeight: '100%', objectFit: 'contain' }} />
);

/* ── Concept data ─────────────────────────────── */
/* ── Header Logo Konseptleri ─────────────────── */

/* G — Pixel T: BrandTech tarzı geometrik T harfi + piksel dağılım */
const LogoG = () => (
  <svg viewBox="0 0 300 50" fill="none" width="100%" height="100%">
    <g transform="translate(2, 2) scale(0.9)">
      {/* Dağılan pikseller — yukarı sağa doğru */}
      <rect x="28" y="0" width="3" height="3" rx="0.4" fill="#c8922a" />
      <rect x="24" y="5" width="4" height="4" rx="0.5" fill="#c8922a" opacity="0.85" />
      <rect x="20" y="10" width="5" height="5" rx="0.6" fill="#c8922a" opacity="0.7" />

      {/* T harfi — üst çizgi (navy → turkuaz gradient) */}
      {/* Sol blok — navy */}
      <rect x="4" y="16" width="12" height="10" rx="1.5" fill="#1e3a5f" />
      {/* Orta bağlantı — overlap */}
      <rect x="14" y="16" width="8" height="10" rx="0" fill="#0098d4" />
      {/* Sağ blok — turkuaz */}
      <rect x="20" y="16" width="12" height="10" rx="1.5" fill="#0098d4" />

      {/* T harfi — dikey çizgi (turkuaz → navy gradient) */}
      <rect x="12" y="24" width="10" height="8" rx="0" fill="#0098d4" />
      <rect x="12" y="30" width="10" height="12" rx="1.5" fill="#1e3a5f" />

      {/* İç boşluk efekti — sağ alt köşede rounded cutout */}
      <rect x="20" y="28" width="8" height="8" rx="3" fill="#0098d4" opacity="0.3" />
    </g>

    {/* Wordmark */}
    <text x="48" y="35" fontFamily="'Plus Jakarta Sans',Inter,sans-serif" fontSize="26" fontWeight="800" letterSpacing="-1">
      <tspan fill="#1e3a5f">tyro</tspan><tspan fill="#c8922a">sign</tspan>
    </text>
  </svg>
);

/* A — Signature Stroke Dots: noktalar arası eğri çizgi */
const LogoA = () => (
  <svg viewBox="0 0 280 50" fill="none" width="100%" height="100%">
    <path d="M12,25 Q22,10 32,25 Q42,40 52,25" stroke="#c8922a" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.5" />
    <circle cx="12" cy="25" r="5.5" fill="#1e3a5f" />
    <circle cx="32" cy="25" r="5.5" fill="#0098d4" />
    <circle cx="52" cy="25" r="5.5" fill="#c8922a" />
    <text x="68" y="32" fontFamily="'Plus Jakarta Sans',Inter,sans-serif" fontSize="26" fontWeight="800" letterSpacing="-1">
      <tspan fill="#1e3a5f">tyro</tspan><tspan fill="#c8922a">sign</tspan>
    </text>
  </svg>
);

/* B — Pen Nib Dot: üçüncü nokta diamond/nib şekli */
const LogoB = () => (
  <svg viewBox="0 0 280 50" fill="none" width="100%" height="100%">
    <circle cx="12" cy="25" r="5.5" fill="#1e3a5f" />
    <circle cx="30" cy="25" r="5.5" fill="#0098d4" />
    <polygon points="48,19 42,25 48,31 54,25" fill="#c8922a" />
    <text x="66" y="32" fontFamily="'Plus Jakarta Sans',Inter,sans-serif" fontSize="26" fontWeight="800" letterSpacing="-1">
      <tspan fill="#1e3a5f">tyro</tspan><tspan fill="#c8922a">sign</tspan>
    </text>
  </svg>
);

/* C — Animated Pulse: noktalar sırayla parlıyor */
const LogoC = () => (
  <svg viewBox="0 0 280 50" fill="none" width="100%" height="100%">
    <defs>
      <style>{`
        @keyframes lcPulse1 { 0%,100% { r: 5.5; opacity: 1; } 33% { r: 7.5; opacity: 0.7; } }
        @keyframes lcPulse2 { 0%,100% { r: 5.5; opacity: 1; } 66% { r: 7.5; opacity: 0.7; } }
        @keyframes lcPulse3 { 0%,33% { r: 5.5; opacity: 1; } 100% { r: 7.5; opacity: 0.7; } }
        .lc-d1 { animation: lcPulse1 3s ease-in-out infinite; }
        .lc-d2 { animation: lcPulse2 3s ease-in-out infinite; }
        .lc-d3 { animation: lcPulse3 3s ease-in-out infinite; }
      `}</style>
    </defs>
    <circle className="lc-d1" cx="12" cy="25" r="5.5" fill="#1e3a5f" />
    <circle className="lc-d2" cx="30" cy="25" r="5.5" fill="#0098d4" />
    <circle className="lc-d3" cx="48" cy="25" r="5.5" fill="#c8922a" />
    <text x="64" y="32" fontFamily="'Plus Jakarta Sans',Inter,sans-serif" fontSize="26" fontWeight="800" letterSpacing="-1">
      <tspan fill="#1e3a5f">tyro</tspan><tspan fill="#c8922a">sign</tspan>
    </text>
  </svg>
);

/* D — Stacked Mark: üçgen piramit dizilim */
const LogoD = () => {
  const p = 0.9, g = 0.25, s = p + g;
  const cx = 28, cy = 25, pixels = [];
  let idx = 0;
  const rows = [
    { y: -8, w: 0.5 },
    { y: -7, w: 1 },
    { y: -6, w: 1.5 },
    { y: -5, w: 2 },
    { y: -4, w: 2.8 },
    { y: -3, w: 3.5 },
    { y: -2, w: 4.2 },
    { y: -1, w: 4.8 },
    { y: 0, w: 5.2 },
    { y: 1, w: 5.5 },
    { y: 2, w: 5.5 },
    { y: 3, w: 5.2 },
    { y: 4, w: 4.5 },
    { y: 5, w: 3.5 },
    { y: 6, w: 2 },
  ];
  const startX = 8; // sol başlangıç
  const textX = 40; // metnin x konumu
  for (const { y, w } of rows) {
    for (let x = -Math.floor(w); x <= Math.floor(w); x++) {
      if (Math.abs(x) <= w) {
        const delay = (idx * 0.02).toFixed(2);
        const dropX = (cx + x * s - p / 2).toFixed(1);
        const dropY = (cy + y * s - p / 2).toFixed(1);
        // Solda dağınık başla → damla oluş → sağa metne doğru git → solda tekrar başla
        const leftX = (startX + (idx * 7 % 6) - 3).toFixed(1);
        const leftY = (cy + (idx * 13 % 16 - 8)).toFixed(1);
        const rightX = (textX + (idx * 11 % 4)).toFixed(1);
        const rightY = (cy + y * s * 0.3 - p / 2).toFixed(1);
        pixels.push(
          <rect key={idx++} className="ld-px" width={p} height={p} rx={0.15} opacity="1">
            <animate attributeName="x" values={`${leftX};${dropX};${dropX};${rightX};${leftX}`} dur="5s" begin={`${delay}s`} repeatCount="indefinite" keyTimes="0;0.25;0.55;0.85;1" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
            <animate attributeName="y" values={`${leftY};${dropY};${dropY};${rightY};${leftY}`} dur="5s" begin={`${delay}s`} repeatCount="indefinite" keyTimes="0;0.25;0.55;0.85;1" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
            <animate attributeName="opacity" values="0.3;1;1;0.4;0.3" dur="5s" begin={`${delay}s`} repeatCount="indefinite" keyTimes="0;0.25;0.55;0.85;1" />
          </rect>
        );
      }
    }
  }
  return (
    <svg viewBox="0 0 280 50" fill="none" width="100%" height="100%">
      <defs><style>{`
        @keyframes ldColor2 {
          0%,40% { fill: #1e3a5f; }
          50%,90% { fill: #c8922a; }
          100% { fill: #1e3a5f; }
        }
        .ld-px { animation: ldColor2 6s ease-in-out infinite; }
      `}</style></defs>
      {pixels}
      <text x="42" y="32" fontFamily="'Plus Jakarta Sans',Inter,sans-serif" fontSize="26" fontWeight="800" letterSpacing="-1">
        <tspan fill="#1e3a5f">tyro</tspan><tspan fill="#c8922a">sign</tspan>
      </text>
    </svg>
  );
};

/* E — Gradient Flow: tek yatay gradient pill */
const LogoE = () => (
  <svg viewBox="0 0 280 50" fill="none" width="100%" height="100%">
    <defs>
      <linearGradient id="lgEflow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1e3a5f" />
        <stop offset="50%" stopColor="#0098d4" />
        <stop offset="100%" stopColor="#c8922a" />
      </linearGradient>
    </defs>
    <rect x="4" y="18" width="44" height="14" rx="7" fill="url(#lgEflow)" />
    <text x="58" y="32" fontFamily="'Plus Jakarta Sans',Inter,sans-serif" fontSize="26" fontWeight="800" letterSpacing="-1">
      <tspan fill="#1e3a5f">tyro</tspan><tspan fill="#c8922a">sign</tspan>
    </text>
  </svg>
);

/* F — Pixel Matrix Ink Drop: sade piksel mürekkep damlası */
/* F — Pixel Matrix Ink Drop: daha fazla navy, küçük ikon */
const LogoF = () => {
  const px = (x, y, c, o) => <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.4" fill={c} opacity={o || 1} />;
  return (
    <svg viewBox="0 0 280 50" fill="none" width="100%" height="100%">
      {/* Ink drop — more navy at top, compact size */}
      <g transform="translate(10, 10) scale(0.55)">
        {/* Ink drop — aşağıdan yukarı: gold → turkuaz → navy */}
        {/* Sivri uç — GOLD */}
        {px(19, 0, '#c8922a')}
        {px(17, 4, '#c8922a')}{px(21, 4, '#c8922a')}
        {px(15, 8, '#c8922a')}{px(19, 8, '#c8922a')}{px(23, 8, '#c8922a')}
        {/* Gold → Turkuaz geçiş */}
        {px(13, 12, '#c8922a')}{px(17, 12, '#0098d4')}{px(21, 12, '#0098d4')}{px(25, 12, '#c8922a')}
        {/* Turkuaz bölge */}
        {px(11, 16, '#0098d4')}{px(15, 16, '#0098d4')}{px(19, 16, '#0098d4')}{px(23, 16, '#0098d4')}{px(27, 16, '#0098d4')}
        {px(7, 20, '#0098d4')}{px(11, 20, '#0098d4')}{px(15, 20, '#0098d4')}{px(19, 20, '#0098d4')}{px(23, 20, '#0098d4')}{px(27, 20, '#0098d4')}{px(31, 20, '#0098d4')}
        {/* Turkuaz → Navy geçiş */}
        {px(5, 24, '#0098d4')}{px(9, 24, '#1e3a5f')}{px(13, 24, '#1e3a5f')}{px(17, 24, '#1e3a5f')}{px(21, 24, '#1e3a5f')}{px(25, 24, '#1e3a5f')}{px(29, 24, '#1e3a5f')}{px(33, 24, '#0098d4')}
        {/* Navy gövde — en geniş */}
        {px(5, 28, '#1e3a5f')}{px(9, 28, '#1e3a5f')}{px(13, 28, '#1e3a5f')}{px(17, 28, '#1e3a5f')}{px(21, 28, '#1e3a5f')}{px(25, 28, '#1e3a5f')}{px(29, 28, '#1e3a5f')}{px(33, 28, '#1e3a5f')}
        {px(5, 32, '#1e3a5f')}{px(9, 32, '#1e3a5f')}{px(13, 32, '#1e3a5f')}{px(17, 32, '#1e3a5f')}{px(21, 32, '#1e3a5f')}{px(25, 32, '#1e3a5f')}{px(29, 32, '#1e3a5f')}{px(33, 32, '#1e3a5f')}
        {/* Daralma — navy oval alt */}
        {px(7, 36, '#1e3a5f')}{px(11, 36, '#1e3a5f')}{px(15, 36, '#1e3a5f')}{px(19, 36, '#1e3a5f')}{px(23, 36, '#1e3a5f')}{px(27, 36, '#1e3a5f')}{px(31, 36, '#1e3a5f')}
        {px(11, 40, '#1e3a5f')}{px(15, 40, '#1e3a5f')}{px(19, 40, '#1e3a5f')}{px(23, 40, '#1e3a5f')}{px(27, 40, '#1e3a5f')}
        {px(15, 44, '#1e3a5f')}{px(19, 44, '#1e3a5f')}{px(23, 44, '#1e3a5f')}
      </g>
      <text x="48" y="32" fontFamily="'Plus Jakarta Sans',Inter,sans-serif" fontSize="26" fontWeight="800" letterSpacing="-1">
        <tspan fill="#1e3a5f">tyro</tspan><tspan fill="#c8922a">sign</tspan>
      </text>
    </svg>
  );
};

/* ── Konsept H: DinTech Style — Rounded çerçeve + S-curve kalem ── */
const LogoH = () => (
  <svg viewBox="0 0 320 60" fill="none" width="100%" height="100%">
    <defs>
      <linearGradient id="lgHgold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e0a832" />
        <stop offset="100%" stopColor="#c8922a" />
      </linearGradient>
      <linearGradient id="lgHblue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0098d4" />
        <stop offset="100%" stopColor="#00b4e6" />
      </linearGradient>
    </defs>

    <g transform="translate(4, 4)">
      {/* === Beyaz/Navy rounded kare çerçeve === */}
      {/* Dış çerçeve — navy thick stroke, sol üst/alt kapalı, sağ üst açık */}
      <path d="M14,4 L32,4 Q44,4 44,16 L44,36 Q44,48 32,48 L14,48 Q4,48 4,36 L4,16 Q4,4 14,4 Z"
        fill="none" stroke="#1e3a5f" strokeWidth="4.5" />

      {/* === İç S-curve dalga — kalem silüeti === */}
      {/* S-curve path — sağ üstten sol alta doğru kıvrılıyor */}
      <path d="M30,10 Q36,10 36,18 Q36,26 24,26 Q12,26 12,34 Q12,42 18,42"
        fill="none" stroke="#1e3a5f" strokeWidth="4" strokeLinecap="round" />

      {/* === Sağ üst aksan — turkuaz kare (kalem cap) === */}
      <rect x="34" y="-2" width="12" height="12" rx="3" fill="url(#lgHblue)" />
      {/* Parlama */}
      <rect x="34" y="-2" width="5" height="12" rx="3" fill="#00c8f0" opacity="0.3" />

      {/* === Sol alt aksan — gold kare (kalem nib) === */}
      <rect x="2" y="38" width="12" height="12" rx="3" fill="url(#lgHgold)" />
      {/* Parlama */}
      <rect x="2" y="38" width="5" height="12" rx="3" fill="#e0a832" opacity="0.3" />

      {/* === Kalem ucu detayı — gold nib sol altta === */}
      <polygon points="8,38 4,44 12,44" fill="#c8922a" opacity="0.5" />
    </g>

    {/* Wordmark */}
    <text x="64" y="38" fontFamily="'Baloo 2','Plus Jakarta Sans',Inter,sans-serif" fontSize="30" fontWeight="700" letterSpacing="-1">
      <tspan fill="#1e3a5f">tyro</tspan><tspan fill="#c8922a">sign</tspan>
    </text>
  </svg>
);

const CONCEPTS = [
  { id: 6, name: 'Nib Drop Matrix', nameEN: 'Dijital Mürekkep', desc: 'Fiziksel kalem yazma pozisyonunda, mürekkep dijital piksellere dönüşüp fade oluyor. Analog → Digital geçişi.', Logo: Logo6, wide: false },
  { id: 9, name: 'Geometric Pen Mark', nameEN: 'Geometrik Kalem İşareti', desc: 'Açılı navy gövde + turkuaz üçgen + gold diamond. 3D derinlikli geometrik kalem ikonu + tyrosign wordmark.', Logo: Logo9, wide: true },
  { id: 10, name: 'Signature Stroke', nameEN: 'İmza Çizgisi', desc: 'Noktalar arası eğri imza darbesi ile bağlı. Organik, el yazısı hissi.', Logo: LogoA, wide: true },
  { id: 11, name: 'Pen Nib Dot', nameEN: 'Kalem Ucu Nokta', desc: 'Üçüncü nokta gold diamond/nib şekli. İlk ikisi yuvarlak, son geometrik.', Logo: LogoB, wide: true },
  { id: 12, name: 'Animated Pulse', nameEN: 'Nabız Animasyonu', desc: 'Noktalar sırayla subtle pulse/glow animasyonu yapıyor. Canlı, dinamik.', Logo: LogoC, wide: true },
  { id: 13, name: 'Pixel Drop Assemble', nameEN: 'Piksel Damla Birleşim', desc: 'Pikseller dağınık başlıyor, yavaşça birleşerek mürekkep damlası oluşturuyor. 3 renk döngüsü: navy → turkuaz → gold.', Logo: LogoD, wide: true },
  { id: 14, name: 'Gradient Flow', nameEN: 'Gradient Akış', desc: 'Noktalar yerine tek yatay gradient pill. Navy→Turkuaz→Gold geçişi.', Logo: LogoE, wide: true },
  { id: 15, name: 'Pixel Ink Drop', nameEN: 'Piksel Mürekkep', desc: 'Mürekkep damlası piksellerden oluşuyor. Üst navy, orta turkuaz, alt gold dissolve.', Logo: LogoF, wide: true },
  { id: 16, name: 'Pixel T Mark', nameEN: 'Piksel T Harfi', desc: 'BrandTech tarzı geometrik T harfi. Navy+turkuaz bloklar + yukarıya dağılan gold pikseller.', Logo: LogoG, wide: true },
  { id: 17, name: 'DinTech Pen', nameEN: 'Rounded Çerçeve + Kalem', desc: 'DinTech tarzı rounded kare çerçeve + S-curve kalem silüeti. Turkuaz cap (sağ üst) + Gold nib (sol alt).', Logo: LogoH, wide: true },
];

/* ── Main gallery page ─────────────────────────── */
const LogoConceptsPage = memo(({ onBack }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: `linear-gradient(135deg, ${C.primaryGhost}, ${C.accentGhost})`,
          padding: '0.4rem 1rem', borderRadius: 20, marginBottom: '0.75rem',
        }}>
          <span style={{ fontSize: '1.2rem' }}>🎨</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.primary, letterSpacing: '2px', textTransform: 'uppercase' }}>Logo Konseptleri</span>
        </div>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', fontWeight: 800,
          color: C.primary, margin: '0 0 0.3rem',
        }}>TYRO SignSnap — Yeni Logo Fikirleri</h2>
        <p style={{ fontSize: '0.8rem', color: C.text2, margin: 0, lineHeight: 1.5 }}>
          8 farklı konsept — TYRO renk paleti, modern app icon trendleri
        </p>
      </div>

      {/* Mevcut logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        background: C.surface, borderRadius: 16, padding: '1rem 1.25rem',
        border: `1px solid ${C.borderSub}`, marginBottom: '1.5rem',
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <svg viewBox="0 0 160 160" fill="none" width="36" height="36">
            <path d="M28 128 C40 110, 48 132, 60 116 S76 104, 88 118 S100 128, 112 112 L118 108" fill="none" stroke="#c8922a" strokeWidth="3.5" strokeLinecap="round" />
            <g transform="translate(58, 8) rotate(40, 40, 40)">
              <rect x="34" y="0" width="16" height="14" rx="4" fill="#2e4d72" />
              <rect x="33" y="12" width="18" height="3" rx="1" fill="#c8922a" opacity="0.9" />
              <rect x="35" y="15" width="14" height="48" rx="2.5" fill="#2e4d72" />
              <rect x="36" y="60" width="12" height="12" rx="1.5" fill="#2a4d70" />
              <polygon points="42,72 36,72 42,92 48,72" fill="#c8922a" />
            </g>
          </svg>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.text2 }}>Mevcut Logo</span>
          <p style={{ fontSize: '0.68rem', color: C.textM, margin: '0.15rem 0 0' }}>Dolma kalem + gold imza çizgisi</p>
        </div>
        <span style={{
          marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 700, color: C.accent,
          background: C.accentGhost, padding: '0.2rem 0.5rem', borderRadius: 8,
        }}>AKTİF</span>
      </div>

      {/* Concepts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        {CONCEPTS.map(({ id, name, nameEN, desc, Logo, wide }) => {
          const hovered = hoveredId === id;
          const selected = selectedId === id;
          return (
            <div
              key={id}
              style={{
                gridColumn: wide ? '1 / -1' : 'auto',
                background: selected ? `linear-gradient(135deg, ${C.accentGhost}, ${C.primaryGhost})` : C.surface,
                borderRadius: 16,
                border: `1.5px solid ${selected ? C.accent + '40' : hovered ? C.primary + '20' : C.borderSub}`,
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
                boxShadow: hovered
                  ? `0 8px 32px ${C.primary}15, 0 0 0 1px ${C.primary}10`
                  : C.shadow,
              }}
              onClick={() => setSelectedId(selected ? null : id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Logo preview */}
              <div style={{
                width: wide ? '100%' : '100%', maxWidth: wide ? 400 : 'none',
                aspectRatio: wide ? '2/1' : '1/1',
                margin: wide ? '0 auto 1rem' : '0 0 1rem',
                borderRadius: 12,
                overflow: 'hidden',
                background: 'transparent',
              }}>
                <Logo />
              </div>

              {/* Info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 800, color: C.accent,
                      background: C.accentGhost, padding: '0.1rem 0.35rem', borderRadius: 6,
                      fontVariantNumeric: 'tabular-nums',
                    }}>#{id}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.primary }}>{name}</span>
                  </div>
                  <p style={{ fontSize: '0.62rem', fontWeight: 600, color: C.divider, margin: '0 0 0.25rem', fontStyle: 'italic' }}>{nameEN}</p>
                  <p style={{ fontSize: '0.65rem', color: C.text2, margin: 0, lineHeight: 1.4 }}>{desc}</p>
                </div>
                {/* Small preview */}
                <div style={{
                  width: 36, height: wide ? 18 : 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                }}>
                  <Logo />
                </div>
              </div>

              {/* Selected badge */}
              {selected && (
                <div style={{
                  marginTop: '0.6rem', textAlign: 'center',
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})`,
                  color: '#fff', fontSize: '0.62rem', fontWeight: 700,
                  padding: '0.3rem 0.6rem', borderRadius: 8,
                }}>
                  ✓ Seçildi — Bu konsepti kullanmak ister misiniz?
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Back button */}
      {onBack && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: `1px solid ${C.borderSub}`, borderRadius: 12,
              padding: '0.5rem 1.5rem', fontSize: '0.75rem', fontWeight: 600,
              color: C.text2, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            ← Geri Dön
          </button>
        </div>
      )}
    </div>
  );
});

export default LogoConceptsPage;
