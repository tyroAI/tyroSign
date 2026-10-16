import { useEffect } from 'react';
import { BANNER_TEMPLATES, BANNER_SIZES } from '../constants/bannerConfig';

function getLogoCoords(position, sz, dw, dh, pad) {
  const p = pad;
  switch (position) {
    case 'top-left': return { x: p, y: p };
    case 'top-right': return { x: sz.w - dw - p, y: p };
    case 'bottom-left': return { x: p, y: sz.h - dh - p - 8 };
    case 'bottom-right': return { x: sz.w - dw - p, y: sz.h - dh - p - 8 };
    case 'center': return { x: (sz.w - dw) / 2, y: (sz.h - dh) / 2 };
    default: return { x: sz.w - dw - p, y: p };
  }
}

export function useBannerCanvas(canvasRef, tab, banner, stg) {
  useEffect(() => {
    if (tab !== 'banner') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let isMounted = true;
    const tpl = BANNER_TEMPLATES.find(t => t.id === banner.template) || BANNER_TEMPLATES[0];
    const sz = BANNER_SIZES.find(s => s.id === banner.size) || BANNER_SIZES[0];
    const sc = sz.scale || 2;
    canvas.width = sz.w * sc; canvas.height = sz.h * sc;
    const ctx = canvas.getContext('2d');
    ctx.scale(sc, sc);
    const isCustom = !!banner.customBg;
    const acBar = stg.bannerAccentColor || tpl.accentBar;

    const drawContent = () => {
      if (!isMounted) return;

      // Template mode: accent bar + left line + website
      if (!isCustom) {
        ctx.fillStyle = acBar; ctx.fillRect(0, sz.h - 6, sz.w, 6);
        ctx.fillStyle = acBar; ctx.fillRect(sz.w * 0.06, sz.h * 0.25, 4, sz.h * 0.5);
      }

      const textX = isCustom ? sz.w * 0.06 : sz.w * 0.06 + 24;

      // Title — only if user typed something
      if (banner.title) {
        ctx.fillStyle = isCustom ? '#fff' : tpl.textColor;
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${Math.round(sz.h * 0.13)}px "Plus Jakarta Sans", sans-serif`;
        if (isCustom) {
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
        }
        ctx.fillText(banner.title, textX, sz.h * 0.42);
      }

      // Subtitle — only if user typed something
      if (banner.subtitle) {
        ctx.fillStyle = isCustom ? '#fff' : tpl.textColor;
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.round(sz.h * 0.07)}px "Inter", sans-serif`;
        if (isCustom) {
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
        }
        ctx.globalAlpha = 0.85;
        ctx.fillText(banner.subtitle, textX, sz.h * 0.62);
        ctx.globalAlpha = 1;
      }

      // Website — only in template mode, use webLink if provided
      if (!isCustom) {
        const webText = banner.webLink || stg.website;
        if (webText) {
          ctx.font = `bold ${Math.round(sz.h * 0.05)}px "Inter", sans-serif`;
          ctx.fillStyle = acBar;
          ctx.textAlign = 'right';
          ctx.fillText(webText, sz.w * 0.94, sz.h * 0.85);
          ctx.textAlign = 'left';
        }
      }

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Logo — only if showLogo is true
      if (banner.showLogo && stg.logoBase64) {
        const logoImg = new window.Image();
        logoImg.onload = () => {
          if (!isMounted) return;
          const maxH = sz.h * 0.35, maxW = sz.w * 0.15;
          let dw = logoImg.width, dh = logoImg.height;
          if (dw > maxW) { const r = maxW / dw; dw = maxW; dh *= r; }
          if (dh > maxH) { const r = maxH / dh; dh = maxH; dw *= r; }
          const pad = sz.w * 0.04;
          const pos = getLogoCoords(banner.logoPosition || 'top-right', sz, dw, dh, pad);
          ctx.drawImage(logoImg, pos.x, pos.y, dw, dh);
        };
        logoImg.src = stg.logoBase64;
      }
    };

    // Draw background
    if (isCustom) {
      const bgImg = new window.Image();
      bgImg.onload = () => {
        if (!isMounted) return;
        const imgRatio = bgImg.width / bgImg.height;
        const canvasRatio = sz.w / sz.h;
        let sx = 0, sy = 0, sw = bgImg.width, sh = bgImg.height;
        if (imgRatio > canvasRatio) {
          sw = bgImg.height * canvasRatio;
          sx = (bgImg.width - sw) / 2;
        } else {
          sh = bgImg.width / canvasRatio;
          sy = (bgImg.height - sh) / 2;
        }
        ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, sz.w, sz.h);
        // Subtle overlay only if there's text
        if (banner.title || banner.subtitle) {
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.fillRect(0, 0, sz.w, sz.h);
        }
        drawContent();
      };
      bgImg.src = banner.customBg;
    } else {
      const grad = ctx.createLinearGradient(0, 0, sz.w, sz.h);
      if (tpl.id === 'classic') { grad.addColorStop(0, '#1e3a5f'); grad.addColorStop(1, '#2c5282'); }
      else if (tpl.id === 'gold') { grad.addColorStop(0, '#1a1a2e'); grad.addColorStop(0.5, '#16213e'); grad.addColorStop(1, '#0f3460'); }
      else { grad.addColorStop(0, '#f8f9fa'); grad.addColorStop(1, '#e9ecef'); }
      ctx.fillStyle = grad; ctx.fillRect(0, 0, sz.w, sz.h);
      drawContent();
    }

    return () => { isMounted = false; };
  }, [tab, banner, stg]);
}
