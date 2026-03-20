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
function dist(t1, t2) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
function getSupportedMimeType() {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  return types.find(t => MediaRecorder.isTypeSupported(t)) ?? 'video/webm';
}

/* ── Component ───────────────────────────────────────── */
export default function CanvasEditorPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const content    = state?.content;

  /* ── Media element refs ────────────────────────────── */
  const canvasRef  = useRef(null);
  const bgImgRef   = useRef(null);
  const logoImgRef = useRef(null);
  const videoRef   = useRef(null);   // hidden <video> element
  const musicRef   = useRef(null);   // hidden <audio> element

  /* ── RAF ref ───────────────────────────────────────── */
  const rafRef     = useRef(null);
  const isPlayingRef = useRef(false); // mirrors isPlaying (stale-closure safe)

  /* ── Export audio refs (created once, reused) ──────── */
  const acRef          = useRef(null);  // AudioContext
  const vidGainRef     = useRef(null);  // GainNode for video
  const musGainRef     = useRef(null);  // GainNode for music
  const musConnected   = useRef(false); // music source added to AudioContext?
  const musicVolumeRef = useRef(0.7);   // mirrors musicVolume state (stale-closure safe)

  /* ── Logo interaction refs ──────────────────────────── */
  const logoState = useRef({ x: 40, y: 40, size: 200 });
  const drag      = useRef(null);
  const pinch     = useRef(null);

  /* ── State ─────────────────────────────────────────── */
  const [logoUrl,     setLogoUrl]     = useState(null);
  const [clinicName,  setClinicName]  = useState('');
  const [loading,     setLoading]     = useState(true);
  const [mode,        setMode]        = useState('image'); // 'image' | 'video'
  const [videoSrc,    setVideoSrc]    = useState(null);
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [recording,   setRecording]   = useState(false);
  const [exporting,   setExporting]   = useState(false);
  const [musicSrc,    setMusicSrc]    = useState(null);
  const [musicName,   setMusicName]   = useState('');
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [toast,       setToast]       = useState('');

  /* ── Load profile ─────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then(p => {
      if (p) { setLogoUrl(p.logoUrl); setClinicName(p.clinicName || ''); }
      setLoading(false);
    });
  }, [user]);

  /* ── Shared: logo overlay ─────────────────────────── */
  const drawLogoOverlay = (ctx) => {
    if (!logoImgRef.current) return;
    const { x, y, size } = logoState.current;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, size * 0.15);
    ctx.clip();
    ctx.drawImage(logoImgRef.current, x, y, size, size);
    ctx.restore();
  };

  /* ── Image mode draw ──────────────────────────────── */
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, CW, CH);
    grad.addColorStop(0, '#e8f0fe');
    grad.addColorStop(1, '#f0f4ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, CH);

    if (bgImgRef.current) {
      ctx.drawImage(bgImgRef.current, 0, 0, CW, CH);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(0, 0, CW, CH);
    }

    if (content?.discipline) {
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#1a73e8';
      ctx.fillText(content.discipline.toUpperCase(), 60, 80);
    }
    if (content?.title) {
      ctx.font = 'bold 68px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#111827';
      wrapText(ctx, content.title, 60, 160, CW - 120, 82);
    }
    if (content?.body) {
      ctx.font = '38px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#4b5563';
      const excerpt = content.body.length > 220 ? content.body.slice(0, 220) + '…' : content.body;
      wrapText(ctx, excerpt, 60, 420, CW - 120, 52);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.roundRect(40, CH - 160, CW - 80, 120, 20);
    ctx.fill();

    if (clinicName) {
      ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#1a73e8';
      const ls = logoImgRef.current ? 80 : 0;
      ctx.fillText(clinicName, 80 + ls + (ls ? 20 : 0), CH - 90);
    }

    drawLogoOverlay(ctx);
  }, [content, clinicName]);

  /* ── Video mode draw (one frame) ─────────────────── */
  const drawVideoFrame = () => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');

    const vw    = video.videoWidth  || CW;
    const vh    = video.videoHeight || CH;
    const scale = Math.max(CW / vw, CH / vh);
    const sw    = vw * scale;
    const sh    = vh * scale;
    ctx.drawImage(video, (CW - sw) / 2, (CH - sh) / 2, sw, sh);

    drawLogoOverlay(ctx);
  };

  /* ── RAF loop ─────────────────────────────────────── */
  const startLoop = () => {
    const loop = () => { drawVideoFrame(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
  };
  const stopLoop = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  };

  useEffect(() => () => stopLoop(), []);

  /* ── Logo load triggers redraw ─────────────────────── */
  useEffect(() => {
    if (!logoUrl) {
      logoImgRef.current = null;
      if (mode === 'image') drawFrame();
      return;
    }
    loadImage(logoUrl)
      .then(img => { logoImgRef.current = img; if (mode === 'image') drawFrame(); else drawVideoFrame(); })
      .catch(() => {});
  }, [logoUrl, drawFrame]); // eslint-disable-line

  useEffect(() => { if (mode === 'image') drawFrame(); }, [drawFrame, mode]);

  /* ── Video upload ─────────────────────────────────── */
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopLoop();
    if (musicRef.current) musicRef.current.pause();
    setIsPlaying(false);
    isPlayingRef.current = false;
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setMode('video');
  };

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !videoSrc) return;
    vid.src = videoSrc;
    vid.load();
    vid.onloadeddata = () => { vid.currentTime = 0; };
    vid.onseeked     = () => drawVideoFrame();
  }, [videoSrc]); // eslint-disable-line

  /* ── Music upload ─────────────────────────────────── */
  const handleMusicUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url  = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^/.]+$/, '');
    setMusicSrc(url);
    setMusicName(name);
    // If AudioContext already set up (from a previous export), reset music connection
    musConnected.current = false;
    musGainRef.current   = null;
    if (musicRef.current) {
      musicRef.current.src = url;
      musicRef.current.load();
      musicRef.current.volume = musicVolumeRef.current;
    }
  };

  const handleMusicRemove = () => {
    if (musicRef.current) { musicRef.current.pause(); musicRef.current.src = ''; }
    setMusicSrc(null);
    setMusicName('');
    musConnected.current = false;
    musGainRef.current   = null;
  };

  const handleMusicVolume = (e) => {
    const val = parseFloat(e.target.value);
    setMusicVolume(val);
    musicVolumeRef.current = val;
    if (musicRef.current) musicRef.current.volume = val;
    if (musGainRef.current) musGainRef.current.gain.value = val;
  };

  /* ── Switch to image mode ─────────────────────────── */
  const switchToImage = () => {
    stopLoop();
    const vid = videoRef.current;
    if (vid) { vid.pause(); vid.src = ''; }
    if (musicRef.current) musicRef.current.pause();
    setVideoSrc(null);
    setIsPlaying(false);
    isPlayingRef.current = false;
    setMode('image');
  };

  /* ── Play / Pause ─────────────────────────────────── */
  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid || !videoSrc) return;

    if (isPlayingRef.current) {
      vid.pause();
      if (musicRef.current?.src) musicRef.current.pause();
      stopLoop();
      drawVideoFrame();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      vid.play();
      if (musicRef.current?.src) {
        musicRef.current.currentTime = 0;
        musicRef.current.volume      = musicVolumeRef.current;
        musicRef.current.play();
      }
      startLoop();
      setIsPlaying(true);
      isPlayingRef.current = true;
      vid.onended = () => {
        stopLoop();
        if (musicRef.current) musicRef.current.pause();
        drawVideoFrame();
        setIsPlaying(false);
        isPlayingRef.current = false;
      };
    }
  };

  /* ── Export audio: mix video + music via Web Audio ── */
  const getExportAudioStream = () => {
    let ac = acRef.current;

    /* Create AudioContext on first export */
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        acRef.current = ac;

        /* Connect video audio → gain node */
        const vSrc  = ac.createMediaElementSource(videoRef.current);
        const vGain = ac.createGain();
        vGain.gain.value = 1.0;
        vSrc.connect(vGain);
        vidGainRef.current = vGain;
      } catch { return null; }
    }

    /* Connect music if loaded and not yet connected */
    if (musicRef.current?.src && !musConnected.current) {
      try {
        const mSrc  = ac.createMediaElementSource(musicRef.current);
        const mGain = ac.createGain();
        mGain.gain.value = musicVolumeRef.current;
        mSrc.connect(mGain);
        musGainRef.current   = mGain;
        musConnected.current = true;
      } catch { /* ignore */ }
    }

    /* Update music gain if volume changed since last export */
    if (musGainRef.current) musGainRef.current.gain.value = musicVolumeRef.current;

    /* Fresh MediaStreamDestination for each export */
    const dest = ac.createMediaStreamDestination();
    if (vidGainRef.current) vidGainRef.current.connect(dest);
    if (musGainRef.current) musGainRef.current.connect(dest);

    return dest.stream;
  };

  /* ── Export video ─────────────────────────────────── */
  const handleVideoExport = async () => {
    const vid = videoRef.current;
    if (!vid || !videoSrc) return;

    setRecording(true);
    stopLoop();
    vid.pause();
    if (musicRef.current) musicRef.current.pause();
    vid.currentTime = 0;
    await new Promise(r => { vid.onseeked = r; });

    /* Build mixed stream */
    const canvasStream = canvasRef.current.captureStream(30);
    const audioStream  = getExportAudioStream();
    if (audioStream) {
      audioStream.getAudioTracks().forEach(t => canvasStream.addTrack(t));
    }

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(canvasStream, { mimeType });
    const chunks   = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = `clinicpromo-video-${Date.now()}.webm`;
      a.click();
      setRecording(false);
      setIsPlaying(false);
      isPlayingRef.current = false;
      showToast('Video downloaded!');
    };

    recorder.start();
    vid.play();
    if (musicRef.current?.src) {
      musicRef.current.currentTime = 0;
      musicRef.current.loop        = true;
      musicRef.current.play();
    }
    startLoop();
    setIsPlaying(true);
    isPlayingRef.current = true;

    vid.onended = () => {
      stopLoop();
      if (musicRef.current) musicRef.current.pause();
      recorder.stop();
    };
  };

  /* ── Logo & image upload ──────────────────────────── */
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUrl(URL.createObjectURL(file));
  };

  const handleDownload = () => {
    setExporting(true);
    drawFrame();
    setTimeout(() => {
      const a    = document.createElement('a');
      a.href     = canvasRef.current.toDataURL('image/jpeg', 0.92);
      a.download = `clinicpromo-${content?.id ?? 'post'}.jpg`;
      a.click();
      setExporting(false);
      showToast('Downloaded!');
    }, 100);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  /* ── Canvas helpers ───────────────────────────────── */
  const getScale = useCallback(() => {
    const c = canvasRef.current;
    return c ? CW / c.getBoundingClientRect().width : 1;
  }, []);

  const toCanvas = (cx, cy) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const s    = getScale();
    return { x: (cx - rect.left) * s, y: (cy - rect.top) * s };
  };

  const hitLogo = (cx, cy) => {
    const { x, y, size } = logoState.current;
    return cx >= x && cx <= x + size && cy >= y && cy <= y + size;
  };

  /* ── Mouse events ─────────────────────────────────── */
  const onMouseDown = (e) => {
    const { x, y } = toCanvas(e.clientX, e.clientY);
    if (!hitLogo(x, y)) return;
    drag.current = { startX: x, startY: y, origX: logoState.current.x, origY: logoState.current.y };
  };
  const onMouseMove = (e) => {
    if (!drag.current) return;
    const { x, y } = toCanvas(e.clientX, e.clientY);
    logoState.current.x = drag.current.origX + (x - drag.current.startX);
    logoState.current.y = drag.current.origY + (y - drag.current.startY);
    if (mode === 'image') drawFrame();
    else if (!isPlayingRef.current) drawVideoFrame();
  };
  const onMouseUp = () => { drag.current = null; };

  /* ── Touch events ─────────────────────────────────── */
  const onTouchStart = (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const { x, y } = toCanvas(t.clientX, t.clientY);
      if (!hitLogo(x, y)) return;
      drag.current = { startX: x, startY: y, origX: logoState.current.x, origY: logoState.current.y };
    } else if (e.touches.length === 2) {
      drag.current  = null;
      pinch.current = { startDist: dist(e.touches[0], e.touches[1]), origSize: logoState.current.size };
    }
  };
  const onTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && drag.current) {
      const t = e.touches[0];
      const { x, y } = toCanvas(t.clientX, t.clientY);
      logoState.current.x = drag.current.origX + (x - drag.current.startX);
      logoState.current.y = drag.current.origY + (y - drag.current.startY);
      if (mode === 'image') drawFrame();
      else if (!isPlayingRef.current) drawVideoFrame();
    } else if (e.touches.length === 2 && pinch.current) {
      const d = dist(e.touches[0], e.touches[1]);
      logoState.current.size = Math.max(60, Math.min(600, pinch.current.origSize * (d / pinch.current.startDist)));
      if (mode === 'image') drawFrame();
      else if (!isPlayingRef.current) drawVideoFrame();
    }
  };
  const onTouchEnd = () => { drag.current = null; pinch.current = null; };

  /* ── Loading ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  /* ── Render ───────────────────────────────────────── */
  return (
    <div className="min-h-full flex flex-col"
      style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)' }}
    >
      {/* Hidden media elements */}
      <video ref={videoRef} playsInline crossOrigin="anonymous" style={{ display: 'none' }} />
      <audio ref={musicRef} loop crossOrigin="anonymous" style={{ display: 'none' }} />

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
          {logoImgRef.current
            ? (mode === 'video' ? 'Drag & pinch logo' : 'Drag & pinch your logo')
            : 'Upload logo below'}
        </span>
      </header>

      {/* Canvas area */}
      <div className="flex-1 flex flex-col items-center px-3 pt-4 gap-4 overflow-y-auto pb-safe">
        <div className="relative w-full max-w-sm">
          <motion.canvas
            ref={canvasRef}
            width={CW} height={CH}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 22 }}
            className="w-full rounded-2xl shadow-2xl touch-none cursor-grab active:cursor-grabbing"
            style={{ aspectRatio: '1/1' }}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}    onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          />

          {/* Canvas play/pause overlay (video mode) */}
          {mode === 'video' && videoSrc && !recording && (
            <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center group">
              <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isPlaying
                  ? <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  : <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                }
              </div>
            </button>
          )}

          {/* REC badge */}
          {recording && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />REC
            </div>
          )}

          {/* Music indicator on canvas during playback */}
          {mode === 'video' && isPlaying && musicSrc && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-full backdrop-blur-sm">
              <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
              </svg>
              {musicName || 'Music'}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm space-y-3 pb-8">

          {/* Mode tabs */}
          <div className="flex gap-1.5 p-1 glass rounded-2xl">
            <button
              onClick={() => { if (mode !== 'image') switchToImage(); }}
              className={['flex-1 h-9 rounded-xl text-sm font-semibold transition-all',
                mode === 'image' ? 'bg-brand-600 text-white shadow' : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >Image Post</button>
            <label
              className={['flex-1 h-9 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                mode === 'video' ? 'bg-brand-600 text-white shadow' : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
              title="Upload a video to overlay your logo"
            >
              {mode === 'video' && videoSrc
                ? <><span className="w-2 h-2 rounded-full bg-white" />Video</>
                : 'Video'}
              <input type="file" accept="video/*" className="sr-only" onChange={handleVideoUpload} />
            </label>
          </div>

          {/* Video strip (video mode) */}
          {mode === 'video' && videoSrc && (
            <div className="flex items-center justify-between glass rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
                <span className="text-xs text-gray-600 font-medium">Video ready</span>
              </div>
              <button
                onClick={togglePlay}
                className="press-scale flex items-center gap-1.5 px-3 h-8 rounded-xl bg-brand-600 text-white text-xs font-semibold"
              >
                {isPlaying
                  ? <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>Pause</>
                  : <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Preview</>
                }
              </button>
            </div>
          )}

          {/* ── Music card (video mode only) ─────────── */}
          {mode === 'video' && (
            <div className="glass rounded-2xl overflow-hidden">
              {!musicSrc ? (
                /* Upload music */
                <label className="press-scale flex items-center gap-3 px-5 py-4 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Add background music</p>
                    <p className="text-xs text-gray-400">MP3 · AAC · WAV — loops to fit video</p>
                  </div>
                  <input type="file" accept="audio/*" className="sr-only" onChange={handleMusicUpload} />
                </label>
              ) : (
                /* Music loaded — show name + volume */
                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{musicName || 'Music track'}</p>
                      <p className="text-xs text-gray-400">Loops · mixed on export</p>
                    </div>
                    {/* Replace */}
                    <label className="press-scale w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center cursor-pointer" title="Replace track">
                      <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      <input type="file" accept="audio/*" className="sr-only" onChange={handleMusicUpload} />
                    </label>
                    {/* Remove */}
                    <button
                      onClick={handleMusicRemove}
                      className="press-scale w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400"
                      title="Remove music"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Volume slider */}
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={musicVolume}
                      onChange={handleMusicVolume}
                      className="flex-1 h-1.5 rounded-full appearance-none bg-gray-200 accent-purple-600 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-gray-500 w-8 text-right">
                      {Math.round(musicVolume * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

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
                {logoImgRef.current ? 'Replace clinic logo' : 'Upload clinic logo'}
              </p>
              <p className="text-xs text-gray-400">PNG with transparent bg recommended</p>
            </div>
            <input type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} />
          </label>

          {/* Export — image mode */}
          {mode === 'image' && (
            <button
              onClick={handleDownload} disabled={exporting}
              className="press-scale w-full h-14 rounded-2xl bg-brand-600 text-white font-semibold text-base shadow-lg shadow-brand-600/40 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {exporting
                ? <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : <><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>Download Image</>
              }
            </button>
          )}

          {/* Export — video mode */}
          {mode === 'video' && (
            <button
              onClick={handleVideoExport} disabled={!videoSrc || recording}
              className="press-scale w-full h-14 rounded-2xl bg-red-600 text-white font-semibold text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {recording ? (
                <><span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />Recording… plays through once</>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                  {videoSrc ? 'Export Video with Logo' : 'Upload a video first'}
                </>
              )}
            </button>
          )}

          {mode === 'video' && videoSrc && (
            <p className="text-center text-xs text-white/30 -mt-1">
              WebM export · {musicSrc ? 'music + video audio mixed' : 'original audio preserved'} · drag logo to reposition
            </p>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full text-sm font-semibold text-gray-800 shadow-lg whitespace-nowrap"
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
  let line = '';
  let curY = y;
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
