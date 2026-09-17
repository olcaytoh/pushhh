import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, RotateCcw, X, Sparkles, Lightbulb, Shuffle, ChevronLeft, ChevronRight, 
  CheckCircle2, Eye, Star, Volume2, VolumeX, Image as ImageIcon, Check, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FARK_BUL_LEVELS, FarkLevel, FarkDifference } from '../data/farkBulData';

interface FarkBulGameProps {
  onClose: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
}

interface MissClick {
  id: number;
  panel: 'left' | 'right';
  x: number;
  y: number;
}

export const FarkBulGame: React.FC<FarkBulGameProps> = ({
  onClose,
  onPrevActivity,
  onNextActivity,
  playMp3
}) => {
  // State
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const [foundDiffIds, setFoundDiffIds] = useState<number[]>([]);
  const [missClicks, setMissClicks] = useState<MissClick[]>([]);
  const [hintDiffId, setHintDiffId] = useState<number | null>(null);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedLevelIds, setCompletedLevelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fark_bul_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentLevel: FarkLevel = FARK_BUL_LEVELS[levelIndex] || FARK_BUL_LEVELS[0];
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesized web audio fallback
  const playTone = useCallback((type: 'hit' | 'miss' | 'hint' | 'victory') => {
    if (!soundEnabled) return;
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'miss') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'hint') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'victory') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0.2, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.4);
        });
      }
    } catch {
      // AudioContext unavailable
    }
  }, [soundEnabled]);

  // Audio trigger wrapper
  const triggerSound = useCallback((type: 'hit' | 'miss' | 'hint' | 'victory') => {
    if (!soundEnabled) return;
    if (playMp3) {
      if (type === 'hit') playMp3('/coin.mp3');
      else if (type === 'miss') playMp3('/hata.mp3');
      else if (type === 'hint') playMp3('/para.mp3');
      else if (type === 'victory') playMp3('/farklilvl.mp3');
    }
    playTone(type);
  }, [soundEnabled, playMp3, playTone]);

  // Reset when level changes
  useEffect(() => {
    setFoundDiffIds([]);
    setMissClicks([]);
    setHintDiffId(null);
    setShowVictoryModal(false);
  }, [levelIndex]);

  // Save completed levels
  const markLevelCompleted = useCallback((lvlId: string) => {
    setCompletedLevelIds(prev => {
      if (prev.includes(lvlId)) return prev;
      const next = [...prev, lvlId];
      try {
        localStorage.setItem('fark_bul_completed', JSON.stringify(next));
      } catch {
        // LocalStorage fallback
      }
      return next;
    });
  }, []);

  // Check victory
  useEffect(() => {
    if (foundDiffIds.length === 7 && currentLevel) {
      markLevelCompleted(currentLevel.id);
      triggerSound('victory');
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
      const t = setTimeout(() => {
        setShowVictoryModal(true);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [foundDiffIds.length, currentLevel, markLevelCompleted, triggerSound]);

  // Handle click on either panel
  const handlePanelClick = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, 
    panel: 'left' | 'right'
  ) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('changedTouches' in e && (e as React.TouchEvent).changedTouches.length > 0) {
        clientX = (e as React.TouchEvent).changedTouches[0].clientX;
        clientY = (e as React.TouchEvent).changedTouches[0].clientY;
      } else {
        return;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const clickX = ((clientX - rect.left) / rect.width) * 100;
    const clickY = ((clientY - rect.top) / rect.height) * 100;

    // Check hit against unfound differences
    let hitFound: FarkDifference | null = null;
    for (const diff of currentLevel.differences) {
      if (!foundDiffIds.includes(diff.id)) {
        const dist = Math.hypot(diff.x - clickX, diff.y - clickY);
        // Generous hit distance for seamless touch & mouse feel
        const hitRadius = Math.max(diff.radius || 8.5, 9.5);
        if (dist <= hitRadius) {
          hitFound = diff;
          break;
        }
      }
    }

    if (hitFound) {
      setFoundDiffIds(prev => [...prev, hitFound!.id]);
      if (hintDiffId === hitFound.id) {
        setHintDiffId(null);
      }
      triggerSound('hit');
    } else {
      // Miss click
      const missId = Date.now() + Math.random();
      setMissClicks(prev => [...prev, { id: missId, panel, x: clickX, y: clickY }]);
      triggerSound('miss');
      setTimeout(() => {
        setMissClicks(prev => prev.filter(m => m.id !== missId));
      }, 650);
    }
  };

  // Hint button
  const handleHint = () => {
    const unfound = currentLevel.differences.filter(d => !foundDiffIds.includes(d.id));
    if (unfound.length === 0) return;
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    setHintDiffId(pick.id);
    triggerSound('hint');
    setTimeout(() => {
      setHintDiffId(null);
    }, 3500);
  };

  // Shuffle / Random level
  const handleRandomLevel = () => {
    if (FARK_BUL_LEVELS.length <= 1) return;
    let nextIdx = levelIndex;
    while (nextIdx === levelIndex) {
      nextIdx = Math.floor(Math.random() * FARK_BUL_LEVELS.length);
    }
    setLevelIndex(nextIdx);
  };

  const handleNextLevel = () => {
    setLevelIndex((prev) => (prev + 1) % FARK_BUL_LEVELS.length);
  };

  const handlePrevLevel = () => {
    setLevelIndex((prev) => (prev - 1 + FARK_BUL_LEVELS.length) % FARK_BUL_LEVELS.length);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white">
      {/* 1. BACKGROUND SCENE */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.jpg" 
          alt="Arka Plan"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center blur-[1px] opacity-25 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/90 to-slate-950/95" />
      </div>

      {/* 2. TOP HEADER BAR */}
      <header className="relative z-30 bg-[#091124]/95 backdrop-blur-md border-b border-amber-500/30 px-2 sm:px-4 py-1.5 flex items-center justify-between shadow-xl shrink-0 gap-2">
        {/* Left: Badge & Activity Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onPrevActivity && (
            <button
              onClick={onPrevActivity}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Önceki Etkinlik"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-amber-950/80 border border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <Eye size={14} className="text-amber-400 shrink-0 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-amber-300 font-extrabold uppercase tracking-wide">
              7 FARKI BUL
            </span>
            <span className="text-amber-400/60 font-bold hidden sm:inline">•</span>
            <span className="text-xs font-black text-white hidden sm:inline truncate max-w-[150px] md:max-w-[220px]">
              {currentLevel.title}
            </span>
          </div>

          {onNextActivity && (
            <button
              onClick={onNextActivity}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Sonraki Etkinlik"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Center: 7 Differences Status Counter */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 px-2.5 sm:px-4 py-1 rounded-full border border-slate-700 shadow-inner">
          <div className="flex items-center gap-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const isFound = i < foundDiffIds.length;
              return (
                <div
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black transition-all duration-300 ${
                    isFound 
                      ? 'bg-amber-400 text-slate-950 scale-110 shadow-[0_0_8px_rgba(245,158,11,0.9)] ring-1 ring-amber-300' 
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isFound ? '★' : i + 1}
                </div>
              );
            })}
          </div>
          <span className="text-xs sm:text-sm font-black text-amber-300 ml-1">
            {foundDiffIds.length}/7
          </span>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Hint Button */}
          <button
            onClick={handleHint}
            disabled={foundDiffIds.length === 7}
            className="px-2 sm:px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black transition shadow-md flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            title="Fark İpucu Göster"
          >
            <Lightbulb size={13} className="text-slate-950 fill-current" />
            <span className="hidden md:inline">İpucu</span>
          </button>

          {/* Random / Shuffle */}
          <button
            onClick={handleRandomLevel}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition active:scale-95"
            title="Rastgele Görsel Seç"
          >
            <Shuffle size={14} />
          </button>

          {/* Reset Current Level */}
          <button
            onClick={() => {
              setFoundDiffIds([]);
              setMissClicks([]);
              setHintDiffId(null);
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition active:scale-95"
            title="Yeniden Başla"
          >
            <RotateCcw size={14} />
          </button>

          {/* Level Picker */}
          <button
            onClick={() => setShowLevelSelect(true)}
            className="px-2 sm:px-2.5 py-1 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400/50 text-white text-xs font-bold transition flex items-center gap-1 active:scale-95"
            title="Bölüm Listesi"
          >
            <ImageIcon size={13} />
            <span className="hidden md:inline">{levelIndex + 1}/{FARK_BUL_LEVELS.length}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition active:scale-95"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} className="text-rose-400" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="px-2 sm:px-2.5 py-1 rounded-xl bg-rose-600/80 hover:bg-rose-600 border border-rose-500/50 text-white text-xs font-bold transition flex items-center gap-1 ml-1"
            title="Kapat"
          >
            <X size={14} />
            <span className="hidden sm:inline">Kapat</span>
          </button>
        </div>
      </header>

      {/* 3. MAIN GAMEPLAY VIEWPORT - DUAL PANELS */}
      <main className="relative z-10 flex-1 flex flex-col p-1.5 sm:p-3 max-w-7xl mx-auto w-full overflow-hidden items-center justify-center">
        {/* Navigation Arrows & Level Title Bar */}
        <div className="w-full flex items-center justify-between px-2 py-0.5 mb-1 max-w-5xl shrink-0 text-slate-300 text-xs">
          <button
            onClick={handlePrevLevel}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition active:scale-95"
          >
            <ChevronLeft size={13} />
            <span>Önceki</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-300 text-xs sm:text-sm drop-shadow-sm">
              {currentLevel.title}
            </span>
            {completedLevelIds.includes(currentLevel.id) && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 text-[10px] font-bold">
                <Check size={10} /> Tamamlandı
              </span>
            )}
          </div>

          <button
            onClick={handleNextLevel}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition active:scale-95"
          >
            <span>Sonraki</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Dual Panels Container */}
        <div className="flex-1 w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-3 overflow-hidden p-1">
          {/* PANEL 1: LEFT IMAGE */}
          <div className="flex-1 w-full h-full flex flex-col items-center justify-center overflow-hidden">
            <div className="text-[11px] font-bold text-slate-400 mb-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Görsel (Sol)
              <span className="text-slate-500 text-[10px]">• Dokunulabilir</span>
            </div>
            <div
              onClick={(e) => handlePanelClick(e, 'left')}
              className="relative w-full aspect-[1408/1536] max-h-[72vh] md:max-h-[76vh] rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-[0_4px_25px_rgba(0,0,0,0.8)] cursor-crosshair group select-none bg-slate-950 touch-none"
            >
              {/* Left half of image rendered with 200% width and left 0% */}
              <img
                src={currentLevel.src}
                alt="Sol Görsel"
                draggable={false}
                referrerPolicy="no-referrer"
                className="absolute inset-y-0 left-0 h-full w-[200%] max-w-none object-cover pointer-events-none select-none"
                style={{ transform: 'translateX(0%)' }}
              />

              {/* Found Differences Markers on Left Panel */}
              {currentLevel.differences.map((diff) => {
                const isFound = foundDiffIds.includes(diff.id);
                const isHint = hintDiffId === diff.id;
                if (!isFound && !isHint) return null;

                return (
                  <div
                    key={`left-diff-${diff.id}`}
                    style={{
                      left: `${diff.x}%`,
                      top: `${diff.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute pointer-events-none transition-all duration-300 ${
                      isHint && !isFound
                        ? 'w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-300 bg-amber-400/25 animate-ping z-30'
                        : 'w-10 h-10 sm:w-14 sm:h-14 rounded-full border-3 border-emerald-400 bg-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.9)] flex items-center justify-center animate-scale-up z-20'
                    }`}
                  >
                    {isFound && (
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-black shadow-md">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Miss clicks ripples on Left Panel */}
              {missClicks
                .filter((m) => m.panel === 'left')
                .map((m) => (
                  <div
                    key={`miss-${m.id}`}
                    style={{
                      left: `${m.x}%`,
                      top: `${m.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="absolute w-8 h-8 rounded-full border-2 border-rose-500 bg-rose-500/30 flex items-center justify-center text-rose-300 font-black text-xs pointer-events-none animate-ping z-40"
                  >
                    ✕
                  </div>
                ))}
            </div>
          </div>

          {/* PANEL 2: RIGHT IMAGE */}
          <div className="flex-1 w-full h-full flex flex-col items-center justify-center overflow-hidden">
            <div className="text-[11px] font-bold text-slate-400 mb-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Görsel (Sağ)
              <span className="text-slate-500 text-[10px]">• Dokunulabilir</span>
            </div>
            <div
              onClick={(e) => handlePanelClick(e, 'right')}
              className="relative w-full aspect-[1408/1536] max-h-[72vh] md:max-h-[76vh] rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-[0_4px_25px_rgba(0,0,0,0.8)] cursor-crosshair group select-none bg-slate-950 touch-none"
            >
              {/* Right half of image rendered with 200% width and translated -50% */}
              <img
                src={currentLevel.src}
                alt="Sağ Görsel"
                draggable={false}
                referrerPolicy="no-referrer"
                className="absolute inset-y-0 left-0 h-full w-[200%] max-w-none object-cover pointer-events-none select-none"
                style={{ transform: 'translateX(-50%)' }}
              />

              {/* Found Differences Markers on Right Panel (synchronized) */}
              {currentLevel.differences.map((diff) => {
                const isFound = foundDiffIds.includes(diff.id);
                const isHint = hintDiffId === diff.id;
                if (!isFound && !isHint) return null;

                return (
                  <div
                    key={`right-diff-${diff.id}`}
                    style={{
                      left: `${diff.x}%`,
                      top: `${diff.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute pointer-events-none transition-all duration-300 ${
                      isHint && !isFound
                        ? 'w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-300 bg-amber-400/25 animate-ping z-30'
                        : 'w-10 h-10 sm:w-14 sm:h-14 rounded-full border-3 border-emerald-400 bg-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.9)] flex items-center justify-center animate-scale-up z-20'
                    }`}
                  >
                    {isFound && (
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-black shadow-md">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Miss clicks ripples on Right Panel */}
              {missClicks
                .filter((m) => m.panel === 'right')
                .map((m) => (
                  <div
                    key={`miss-${m.id}`}
                    style={{
                      left: `${m.x}%`,
                      top: `${m.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="absolute w-8 h-8 rounded-full border-2 border-rose-500 bg-rose-500/30 flex items-center justify-center text-rose-300 font-black text-xs pointer-events-none animate-ping z-40"
                  >
                    ✕
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Bottom Helper Hint / Instructions */}
        <div className="mt-1 text-center text-slate-400 text-[11px] font-medium shrink-0">
          İpucu: Farkı ister <span className="text-amber-300 font-bold">sol</span> ister <span className="text-amber-300 font-bold">sağ</span> görsel üzerinde bulup dokunabilirsin! Bulunan farklar her iki tarafta da işaretlenir.
        </div>
      </main>

      {/* 4. LEVEL SELECT MODAL */}
      {showLevelSelect && (
        <div className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-2xl bg-[#0f172a] border-2 border-amber-400/80 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-amber-400" size={20} />
                <h2 className="text-base sm:text-lg font-black text-white">
                  Bölüm Seç ({FARK_BUL_LEVELS.length} Görsel)
                </h2>
              </div>
              <button
                onClick={() => setShowLevelSelect(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grid of levels */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto my-3 pr-1">
              {FARK_BUL_LEVELS.map((lvl, idx) => {
                const isCurrent = idx === levelIndex;
                const isDone = completedLevelIds.includes(lvl.id);

                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setLevelIndex(idx);
                      setShowLevelSelect(false);
                    }}
                    className={`relative flex flex-col rounded-xl overflow-hidden border text-left transition-all group ${
                      isCurrent
                        ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-lg'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-800/80'
                    }`}
                  >
                    {/* Thumbnail preview (left half of image) */}
                    <div className="relative w-full aspect-[4/3] bg-slate-950 overflow-hidden">
                      <img
                        src={lvl.src}
                        alt={lvl.title}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-[200%] h-full object-cover object-left"
                      />
                      {isDone && (
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[9px] font-black flex items-center gap-0.5 shadow">
                          <Check size={10} /> Tamam
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-slate-900/95 flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                        {idx + 1}. {lvl.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowLevelSelect(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. VICTORY MODAL */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-[260] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#131d36] to-[#0b1122] border-2 border-amber-400 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.4)] p-6 flex flex-col items-center text-center animate-scale-up">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.6)] mb-3 animate-bounce">
              <Trophy size={36} className="text-slate-950" />
            </div>

            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
              TEBRİKLER ŞAMPİYON!
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 mb-2">
              7 Farkın Tamamını Buldun!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-5">
              <span className="text-amber-300 font-bold">{currentLevel.title}</span> görselindeki tüm gizli farkları dikkatle keşfettin!
            </p>

            {/* Stars row */}
            <div className="flex items-center gap-1.5 mb-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <Star key={i} size={22} className="text-amber-400 fill-current animate-pulse" />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
              <button
                onClick={() => {
                  setShowVictoryModal(false);
                  handleNextLevel();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
              >
                <span>Sonraki Görsel</span>
                <ChevronRight size={18} />
              </button>

              <button
                onClick={() => {
                  setShowVictoryModal(false);
                  setFoundDiffIds([]);
                  setMissClicks([]);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white font-bold text-xs transition active:scale-95"
              >
                Yeniden Oyna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
