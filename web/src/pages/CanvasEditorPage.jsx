import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import { getProfile } from '../services/profileService';

/* ── Canvas size ─────────────────────────────────────── */
const CW = 1080;
const CH = 1080;

/* ── Helpers ─────────────────────────────────────────── */
function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function midpoint(t1, t2) {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  };
}
function dist(t1, t2) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/* ── Component ───────────────────────────────────────── */
export default function CanvasEditorPage() {
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const content      = state?.content;

  const canvasRef    = useRef(null);
  const bgImgRef     = useRef(null);
  const logoImgRef   = useRef(null);

  /* Logo transform state */
  const logoState    = useRef({ x: 40, y: 40, size: 200 });
  const drag         = useRef(null);   // { startX, startY, origX, origY }
  const pinch        = useRef(null);   // { startDist, origSize }

  const [logoUrl,    setLogoUrl]   = useState(null);
  const [clinicName, setClinicName] = useState('');
  const [loading,    setLoading]   = useState(true);
  const [exporting,  setExporting] = useState(false);
  const [toast,      setToast]     = useState('');

  /* ── Load profile ─────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then(p => {
      if (p) { setLogoUrl(p.logoUrl); setClinicName(p.clinicName || ''); }
      setLoading(false);
    });
  }, [user]);

  /* ── Build canvas background (text poster) ────────── */
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    /* Background gradient */
    const grad = ctx.createLinearGradient(0, 0, CW, CH);
    grad.addColorStop(0, '#e8f0fe');
    grad.addColorStop(1, '#f0f4ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, CH);

    /* Draw bg image if any */
    if (bgImgRef.current) {
      ctx.drawImage(bgImgRef.current, 0, 0, CW, CH);
      /* Overlay tint for readability */
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(0, 0, CW, CH);
    }

    /* Discipline badge */
    if (content?.discipline) {
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#1a73e8';
      ctx.fillText(content.discipline.toUpperCase(), 60, 80);
    }

    /* Title */
    if (content?.title) {
      ctx.font = 'bold 68px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#111827';
      wrapText(ctx, content.title, 60, 160, CW - 120, 82);
    }

    /* Body excerpt */
    if (content?.body) {
      ctx.font = '38px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#4b5563';
      const excerpt = content.body.length > 220
        ? content.body.slice(0, 220) + '…'
        : content.body;
      wrapText(ctx, excerpt, 60, 420, CW - 120, 52);
    }

    /* Branding strip at bottom */
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.roundRect(40, CH - 160, CW - 80, 120, 20);
    ctx.fill();

    if (clinicName) {
      ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#1a73e8';
      const logoSize = logoImgRef.current ? 80 : 0;
      ctx.fillText(clinicName, 80 + logoSize + (logoSize ? 20 : 0), CH - 90);
    }

    /* Logo overlay */
    if (logoImgRef.current) {
      const { x, y, size } = logoState.current;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, size * 0.15);
      ctx.clip();
      ctx.drawImage(logoImgRef.current, x, y, size, size);
      ctx.restore();
    }
  }, [content, clinicName]);

  /* ── Load logo image whenever url changes ─────────── */
  useEffect(() => {
    if (!logoUrl) { logoImgRef.current = null; drawFrame(); return; }
    loadImage(logoUrl).then(img => { logoImgRef.current = img; drawFrame(); }).catch(() => {});
  }, [logoUrl, drawFrame]);

  useEffect(() => { drawFrame(); }, [drawFrame]);

  /* ── Scale canvas to fit container ───────────────── */
  const scale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    return CW / rect.width;
  }, []);

  /* ── Pointer → canvas coords ──────────────────────── */
  const toCanvas = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const s    = scale();
    return { x: (clientX - rect.left) * s, y: (clientY - rect.top) * s };
  };

  /* ── Hit test logo ────────────────────────────────── */
  const hitLogo = (cx, cy) => {
    const { x, y, size } = logoState.current;
    return cx >= x && cx <= x + size && cy >= y && cy <= y + size;
  };

  /* ── Mouse events ─────────────────────────────────── */
  const onMouseDown = (e) => {
    const { x, y } = toCanvas(e.clientX, e.clientY);
    if (!hitLogo(x, y)) return;
    drag.current = {
      startX: x, startY: y,
      origX:  logoState.current.x,
      origY:  logoState.current.y,
    };
  };
  const onMouseMove = (e) => {
    if (!drag.current) return;
    const { x, y } = toCanvas(e.clientX, e.clientY);
    logoState.current.x = drag.current.origX + (x - drag.current.startX);
    logoState.current.y = drag.current.origY + (y - drag.current.startY);
    drawFrame();
  };
  const onMouseUp = () => { drag.current = null; };

  /* ── Touch events (drag + pinch-to-resize) ────────── */
  const onTouchStart = (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const { x, y } = toCanvas(t.clientX, t.clientY);
      if (!hitLogo(x, y)) return;
      drag.current = {
        startX: x, startY: y,
        origX:  logoState.current.x,
        origY:  logoState.current.y,
      };
    } else if (e.touches.length === 2) {
      drag.current = null;
      pinch.current = {
        startDist: dist(e.touches[0], e.touches[1]),
        origSize:  logoState.current.size,
      };
    }
  };
  const onTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && drag.current) {
      const t = e.touches[0];
      const { x, y } = toCanvas(t.clientX, t.clientY);
      logoState.current.x = drag.current.origX + (x - drag.current.startX);
      logoState.current.y = drag.current.origY + (y - drag.current.startY);
      drawFrame();
    } else if (e.touches.length === 2 && pinch.current) {
      const d    = dist(e.touches[0], e.touches[1]);
      const ratio = d / pinch.current.startDist;
      logoState.current.size = Math.max(60, Math.min(500, pinch.current.origSize * ratio));
      drawFrame();
    }
  };
  const onTouchEnd = () => { drag.current = null; pinch.current = null; };

  /* ── Upload local logo ────────────────────────────── */
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
  };

  /* ── Export ───────────────────────────────────────── */
  const handleDownload = () => {
    setExporting(true);
    drawFrame();
    setTimeout(() => {
      const a    = document.createElement('a');
      a.href     = canvasRef.current.toDataURL('image/jpeg', 0.92);
      a.download = `clinicpromo-${content?.id ?? 'post'}.jpg`;
      a.click();
      setExporting(false);
      setToast('Downloaded!');
      setTimeout(() => setToast(''), 2500);
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col"
      style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)' }}
    >
      {/* Header */}
      <header className="glass-dark pt-safe px-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="press-scale w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold text-white flex-1">Canvas Editor</h2>
        <span className="text-xs text-white/40">
          {logoImgRef.current ? 'Drag & pinch your logo' : 'Upload a logo below'}
        </span>
      </header>

      {/* Canvas */}
      <div className="flex-1 flex flex-col items-center px-3 pt-4 gap-4 overflow-y-auto pb-safe">
        <motion.canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 22 }}
          className="w-full max-w-sm rounded-2xl shadow-2xl touch-none cursor-grab active:cursor-grabbing"
          style={{ aspectRatio: '1/1' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />

        {/* Controls */}
        <div className="w-full max-w-sm space-y-3 pb-8">
          {/* Logo upload */}
          <label className="press-scale flex items-center gap-3 glass rounded-2xl px-5 py-4 cursor-pointer shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {logoImgRef.current ? 'Replace logo' : 'Upload clinic logo'}
              </p>
              <p className="text-xs text-gray-400">PNG with transparent bg recommended</p>
            </div>
            <input type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} />
          </label>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={exporting}
            className="press-scale w-full h-14 rounded-2xl bg-brand-600 text-white font-semibold text-base shadow-lg shadow-brand-600/40 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {exporting ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Image
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full text-sm font-semibold text-gray-800 shadow-lg"
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}

/* ── Text wrap helper ────────────────────────────────── */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line  = '';
  let curY  = y;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = word;
      curY += lineHeight;
      if (curY > CH - 200) { ctx.fillText(line + '…', x, curY); return; }
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, curY);
}
