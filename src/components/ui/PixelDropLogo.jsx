import { memo, useMemo } from 'react';

const ROWS = [
  { y: -8, w: 0.5 }, { y: -7, w: 1 }, { y: -6, w: 1.5 },
  { y: -5, w: 2 }, { y: -4, w: 2.8 }, { y: -3, w: 3.5 },
  { y: -2, w: 4.2 }, { y: -1, w: 4.8 }, { y: 0, w: 5.2 },
  { y: 1, w: 5.5 }, { y: 2, w: 5.5 }, { y: 3, w: 5.2 },
  { y: 4, w: 4.5 }, { y: 5, w: 3.5 }, { y: 6, w: 2 },
];

const PixelDropLogo = memo(function PixelDropLogo({ height = 40, showText = true, textSize = 26, animate = true }) {
  const p = 0.9, g = 0.25, st = p + g;
  const cx = 14, cy = 25;
  const startX = 8;  // sol dağınık başlangıç
  const textX = 26;  // sağ metin hedefi

  const pixels = useMemo(() => {
    const out = [];
    let i = 0;
    for (const { y, w } of ROWS) {
      for (let x = -Math.floor(w); x <= Math.floor(w); x++) {
        if (Math.abs(x) <= w) {
          const del = (i * 0.02).toFixed(2);
          const dropX = (cx + x * st - p / 2).toFixed(1);
          const dropY = (cy + y * st - p / 2).toFixed(1);
          // Sol dağınık pozisyon
          const lx = (startX + (i * 7 % 6)).toFixed(1);
          const ly = (cy + (i * 13 % 16 - 8)).toFixed(1);
          // Sağ metin hedef pozisyon
          const rx = (textX + (i * 11 % 4)).toFixed(1);
          const ry = (cy + y * st * 0.3 - p / 2).toFixed(1);

          if (animate) {
            out.push(
              <rect key={i} className="pdl-px" width={p} height={p} rx={0.15}>
                <animate attributeName="x" values={`${lx};${dropX};${dropX};${rx};${lx}`} dur="5s" begin={`${del}s`} repeatCount="indefinite" keyTimes="0;0.25;0.55;0.85;1" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
                <animate attributeName="y" values={`${ly};${dropY};${dropY};${ry};${ly}`} dur="5s" begin={`${del}s`} repeatCount="indefinite" keyTimes="0;0.25;0.55;0.85;1" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
                <animate attributeName="opacity" values="0.3;1;1;0.4;0.3" dur="5s" begin={`${del}s`} repeatCount="indefinite" keyTimes="0;0.25;0.55;0.85;1" />
              </rect>
            );
          } else {
            out.push(<rect key={i} className="pdl-px" x={dropX} y={dropY} width={p} height={p} rx={0.15} />);
          }
          i++;
        }
      }
    }
    return out;
  }, [animate]);

  const vw = showText ? 180 : 30;

  return (
    <svg viewBox={`0 0 ${vw} 50`} fill="none" style={{ height, width: 'auto' }}>
      <defs>
        <style>{`
          @keyframes pdlColor {
            0%,40% { fill: #1e3a5f; }
            50%,90% { fill: #c8922a; }
            100% { fill: #1e3a5f; }
          }
          .pdl-px { animation: pdlColor 6s ease-in-out infinite; }
        `}</style>
      </defs>
      {pixels}
      {showText && (
        <text x="30" y="32" fontFamily="'Baloo 2','Plus Jakarta Sans',Inter,sans-serif" fontSize={textSize} fontWeight="700" letterSpacing="-1">
          <tspan fill="#1e3a5f">tyro</tspan><tspan fill="#c8922a">sign</tspan>
        </text>
      )}
    </svg>
  );
});

export default PixelDropLogo;
