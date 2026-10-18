import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, 
  BookOpen, ArrowRight, Video
} from 'lucide-react';

interface StandartOlmayanSiviOlcmeVideoModalProps {
  onClose: () => void;
  onStartSiviOlcme?: () => void;
  onStartSiviTahmin?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  soundEnabled?: boolean;
}

export const StandartOlmayanSiviOlcmeVideoModal: React.FC<StandartOlmayanSiviOlcmeVideoModalProps> = ({
  onClose,
  onStartSiviOlcme,
  onStartSiviTahmin,
  playMp3,
  soundEnabled = true
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(!soundEnabled);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(72.2);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'video' | 'interactive'>('video');

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Interactive Lesson Scenes (matching lesson steps)
  const [activeLessonStep, setActiveLessonStep] = useState<number>(0);

  // Direct reference to the uploaded video file with cache busting
  const videoSrc = '/sivi_oyunu/standart_olmayan_sivi_olcme.mp4?v=real_uploaded_v2';

  useEffect(() => {
    if (playMp3) playMp3('/op.mp3');
  }, [playMp3]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted || !soundEnabled;
    }
  }, [soundEnabled, isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Handled if browser blocks unmuted autoplay
        setIsPlaying(false);
      });
    }
  }, []);

  // Video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Robot Mascot SVG
  const RobotMascot = ({ speechText }: { speechText?: string }) => (
    <div className="flex items-center gap-3">
      {speechText && (
        <div className="relative bg-white text-slate-900 font-extrabold px-3 py-1.5 rounded-2xl shadow-lg border-2 border-slate-300 text-xs sm:text-sm animate-bounce">
          {speechText}
          <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white" />
        </div>
      )}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-sky-100 to-sky-300 border-2 border-sky-400 p-1 flex items-center justify-center shadow-lg shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="25" y="25" width="50" height="42" rx="14" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="40" cy="42" r="7" fill="#0284c7" />
          <circle cx="38" cy="40" r="2.5" fill="#ffffff" />
          <circle cx="60" cy="42" r="7" fill="#0284c7" />
          <circle cx="58" cy="40" r="2.5" fill="#ffffff" />
          <circle cx="33" cy="52" r="3.5" fill="#f472b6" opacity="0.6" />
          <circle cx="67" cy="52" r="3.5" fill="#f472b6" opacity="0.6" />
          <path d="M 42 54 Q 50 62 58 54" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <line x1="50" y1="25" x2="50" y2="12" stroke="#64748b" strokeWidth="4" />
          <circle cx="50" cy="10" r="5" fill="#38bdf8" />
          <rect x="18" y="36" width="7" height="18" rx="3" fill="#0284c7" />
          <rect x="75" y="36" width="7" height="18" rx="3" fill="#0284c7" />
          <rect x="32" y="70" width="36" height="24" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3" />
          <rect x="38" y="76" width="24" height="10" rx="3" fill="#0284c7" />
        </svg>
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      style={{ top: 'var(--app-header-height, 60px)' }}
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-md text-white select-none overflow-hidden animate-fadeIn p-2 sm:p-4"
    >
      {/* 1. TOP HEADER BANNER */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-cyan-950/90 via-slate-900/90 to-cyan-950/90 border border-cyan-500/40 rounded-2xl shadow-xl shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl sm:text-2xl shadow-md shrink-0 animate-pulse">
            🫗
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
                2. Sınıf Matematik • Sıvı Ölçme Araçları
              </span>
              <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300 uppercase tracking-widest shadow-sm">
                KONU ANLATIMI
              </span>
            </div>
            <h2 className="text-sm sm:text-lg md:text-xl font-black text-white truncate drop-shadow">
              Standart Olmayan Sıvı Ölçme Araçları
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Tab Switcher */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                activeTab === 'video' 
                  ? 'bg-cyan-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video size={13} />
              <span className="hidden xs:inline">Video Anlatım</span>
            </button>
            <button
              onClick={() => setActiveTab('interactive')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                activeTab === 'interactive' 
                  ? 'bg-cyan-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen size={13} />
              <span className="hidden xs:inline">Etkileşimli Ders</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-600/80 hover:bg-rose-500 border border-rose-400/50 flex items-center justify-center text-white font-bold transition cursor-pointer shadow-md"
            title="Kapat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA (VIDEO PLAYER OR INTERACTIVE LESSON) */}
      <div className="flex-1 w-full max-w-5xl my-2 min-h-0 flex flex-col items-center justify-center relative">
        {activeTab === 'video' ? (
          <div className="relative w-full h-full max-h-[72vh] flex flex-col items-center justify-center bg-black rounded-2xl sm:rounded-3xl border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.35)] overflow-hidden">
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              playsInline
              preload="auto"
              muted={isMuted || !soundEnabled}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Big Center Play Button Overlay when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyan-500/80 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.8)] border-4 border-white transition transform hover:scale-110 cursor-pointer z-20"
              >
                <Play size={32} className="ml-1" />
              </button>
            )}

            {/* CUSTOM MODERN VIDEO CONTROL BAR */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2.5 sm:p-3.5 flex flex-col gap-1.5 z-20">
              {/* Seek Bar */}
              <input
                type="range"
                min="0"
                max={duration || 72}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 accent-cyan-400 rounded-lg cursor-pointer transition-all hover:h-2"
              />

              <div className="flex items-center justify-between gap-2">
                {/* Left Controls: Play, Restart, Time */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title={isPlaying ? 'Durdur' : 'Oynat'}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="Baştan Başlat"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right Controls: Speed, Mute, Fullscreen */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-lg border border-white/10 text-[10px] sm:text-xs font-bold text-slate-300">
                    {[1, 1.25, 1.5].map(spd => (
                      <button
                        key={spd}
                        onClick={() => handleSpeedChange(spd)}
                        className={`px-1 py-0.5 rounded transition ${
                          playbackSpeed === spd ? 'bg-cyan-400 text-slate-950 font-black' : 'hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="Tam Ekran"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* EXACT 4-PART INTERACTIVE LESSON FROM USER'S VIDEO */
          <div className="w-full h-full max-h-[72vh] flex flex-col bg-gradient-to-b from-[#e8f1fc] to-[#f4f7fb] text-slate-900 rounded-2xl sm:rounded-3xl border-4 border-sky-400 shadow-2xl overflow-y-auto p-3 sm:p-5 relative">
            {/* Top Navigation Steps */}
            <div className="flex items-center justify-between gap-1 mb-3 bg-white/80 backdrop-blur p-1.5 rounded-xl border border-sky-200 shadow-sm shrink-0">
              {[
                { title: '1. Sıvı Madde Nedir?', icon: '💧' },
                { title: '2. Sıvı Madde Örnekleri', icon: '🥛' },
                { title: '3. Ölçme Araçları', icon: '🫗' },
                { title: '4. Miktar Tahmini', icon: '🎯' }
              ].map((step, idx) => (
                <button
                  key={step.title}
                  onClick={() => {
                    setActiveLessonStep(idx);
                    if (playMp3) playMp3('/op.mp3');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeLessonStep === idx
                      ? 'bg-sky-500 text-white shadow-md scale-102'
                      : 'text-slate-600 hover:bg-sky-100'
                  }`}
                >
                  <span>{step.icon}</span>
                  <span className="hidden md:inline">{step.title}</span>
                </button>
              ))}
            </div>

            {/* STEP 1: SIVI MADDE NEDİR? */}
            {activeLessonStep === 0 && (
              <div className="flex-1 flex flex-col justify-between animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="bg-sky-600 text-white font-black px-4 py-1 rounded-full text-xs sm:text-sm shadow">
                    2. Sınıf Matematik • Sıvı Ölçme
                  </div>
                  <RobotMascot speechText="Kabın şeklini alır!" />
                </div>

                <div className="my-auto py-2 text-center">
                  <h3 className="text-2xl sm:text-4xl font-black text-sky-800 drop-shadow-sm mb-4">
                    SIVI MADDE NEDİR? 💧
                  </h3>

                  {/* Visual Containers: Uzun Bardak, Geniş Kase, Yuvarlak Şişe */}
                  <div className="flex items-center justify-center gap-4 sm:gap-10 my-4 flex-wrap">
                    <div className="flex flex-col items-center">
                      <div className="w-16 sm:w-20 h-28 sm:h-36 border-4 border-sky-600 rounded-b-xl bg-gradient-to-t from-sky-400 to-sky-300 p-1 flex items-end justify-center shadow-lg">
                        <span className="text-[11px] font-black text-sky-900 pb-1">Su Dolar</span>
                      </div>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-800 mt-2">Uzun Bardak</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-28 sm:w-36 h-18 sm:h-24 border-4 border-sky-600 rounded-b-full bg-gradient-to-t from-sky-400 to-sky-300 p-1 flex items-end justify-center shadow-lg">
                        <span className="text-[11px] font-black text-sky-900 pb-1">Su Dolar</span>
                      </div>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-800 mt-2">Geniş Kase</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-20 sm:w-24 h-28 sm:h-36 border-4 border-sky-600 rounded-full bg-gradient-to-t from-sky-400 to-sky-300 p-1 flex items-center justify-center shadow-lg">
                        <span className="text-[11px] font-black text-sky-900">Su Dolar</span>
                      </div>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-800 mt-2">Yuvarlak Şişe</span>
                    </div>
                  </div>
                </div>

                {/* Subtitle definition banner */}
                <div className="bg-white/90 border-2 border-sky-300 rounded-2xl p-3 text-center shadow-md">
                  <p className="text-sm sm:text-base font-black text-slate-900">
                    💡 <span className="text-sky-700">Akıcı olan</span>, içine konulduğu kabın şeklini alan maddelere <span className="text-sky-600">sıvı maddeler</span> denir.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: SIVI MADDE ÖRNEKLERİ */}
            {activeLessonStep === 1 && (
              <div className="flex-1 flex flex-col justify-between animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="bg-sky-600 text-white font-black px-4 py-1 rounded-full text-xs sm:text-sm shadow">
                    Sıvı Madde Örnekleri
                  </div>
                  <RobotMascot speechText="Hepsi birer sıvıdır!" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3 my-auto py-2">
                  {[
                    { name: 'Su', emoji: '💧', color: 'from-blue-200 to-blue-400' },
                    { name: 'Süt', emoji: '🥛', color: 'from-slate-100 to-slate-200' },
                    { name: 'Ayran', emoji: '🥛', color: 'from-teal-100 to-teal-200' },
                    { name: 'Meyve Suyu', emoji: '🧃', color: 'from-amber-100 to-orange-300' },
                    { name: 'Sıvı Yağ', emoji: '🍶', color: 'from-yellow-200 to-yellow-400' },
                    { name: 'Çay', emoji: '🍵', color: 'from-red-200 to-amber-300' },
                    { name: 'Çorba', emoji: '🍲', color: 'from-orange-200 to-amber-200' },
                  ].map(item => (
                    <div 
                      key={item.name}
                      className="bg-white border-2 border-sky-300 rounded-2xl p-3 flex flex-col items-center justify-center shadow-md hover:scale-105 transition"
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl shadow-inner mb-2`}>
                        {item.emoji}
                      </div>
                      <span className="font-black text-xs sm:text-sm text-slate-800 text-center">{item.name}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-sky-100 border-2 border-sky-400 rounded-2xl p-3 text-center shadow-md">
                  <p className="text-xs sm:text-sm font-black text-sky-950">
                    Örnekler: Su, süt, ayran, meyve suyu, sıvı yağ, çay ve çorba birer sıvı maddedir.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: STANDART OLMAYAN SIVI ÖLÇME ARAÇLARI */}
            {activeLessonStep === 2 && (
              <div className="flex-1 flex flex-col justify-between animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="bg-sky-600 text-white font-black px-4 py-1 rounded-full text-xs sm:text-sm shadow">
                    Standart Olmayan Ölçme Araçları
                  </div>
                  <RobotMascot speechText="Büyüklükleri değişir!" />
                </div>

                {/* Shelf with household tools */}
                <div className="my-auto py-2">
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                    {[
                      { name: 'Kaşık', emoji: '🥄' },
                      { name: 'Fincan', emoji: '☕' },
                      { name: 'Kepçe', emoji: '🍳' },
                      { name: 'Bardak', emoji: '🥛' },
                      { name: 'Su Şişesi', emoji: '🧴' },
                      { name: 'Sürahi', emoji: '🫗' },
                      { name: 'Tencere', emoji: '🍲' },
                      { name: 'Kova', emoji: '🪣' },
                      { name: 'Damacana', emoji: '🛢️' }
                    ].map(tool => (
                      <div key={tool.name} className="bg-white border-2 border-sky-300 rounded-xl p-2 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-2xl sm:text-3xl filter drop-shadow">{tool.emoji}</span>
                        <span className="text-[10px] sm:text-xs font-black text-slate-800 mt-1 truncate">{tool.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Why non-standard? Ali'nin bardağı vs Zeynep'in bardağı */}
                  <div className="mt-4 bg-white/90 border border-sky-300 rounded-2xl p-3 flex items-center justify-around gap-2 text-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-12 border-2 border-sky-600 bg-sky-200 rounded-sm" />
                      <span className="text-xs font-extrabold text-slate-700">Ali'nin bardağı</span>
                    </div>
                    <span className="text-xs font-black text-rose-500 uppercase">≠ Kişiden Kişiye Değişir!</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-16 border-2 border-sky-600 bg-sky-300 rounded-sm" />
                      <span className="text-xs font-extrabold text-slate-700">Zeynep'in bardağı</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-100 border-2 border-amber-400 rounded-2xl p-3 text-center shadow-md">
                  <p className="text-xs sm:text-sm font-black text-amber-950">
                    Çünkü bu araçların büyüklükleri kişiden kişiye veya evden eve değişebilir.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: MİKTARI TAHMİN ETME (TAM DOLU, YARIM DOLU, BOŞ) */}
            {activeLessonStep === 3 && (
              <div className="flex-1 flex flex-col justify-between animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="bg-sky-600 text-white font-black px-4 py-1 rounded-full text-xs sm:text-sm shadow">
                    Kapların Alacağı Sıvı Miktarını Tahmin Etme
                  </div>
                  <RobotMascot speechText="Harika! 🌟" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-auto py-2">
                  {/* TAM DOLU */}
                  <div className="bg-white border-3 border-emerald-400 rounded-2xl p-3 flex flex-col items-center justify-between shadow-md">
                    <div className="w-20 h-28 border-4 border-slate-700 rounded-b-xl bg-gradient-to-t from-blue-500 to-cyan-400 flex items-center justify-center shadow-inner">
                      <span className="text-white font-black text-xs">TAM</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs sm:text-sm mt-2 shadow">
                      TAM DOLU
                    </span>
                    <p className="text-[11px] font-bold text-slate-600 text-center mt-1">
                      Kabın içinde hiç boş yer kalmayacak şekilde sıvı varsa.
                    </p>
                  </div>

                  {/* YARIM DOLU */}
                  <div className="bg-white border-3 border-amber-400 rounded-2xl p-3 flex flex-col items-center justify-between shadow-md">
                    <div className="w-20 h-28 border-4 border-slate-700 rounded-b-xl bg-slate-100 relative overflow-hidden flex flex-col justify-end shadow-inner">
                      <div className="w-full h-1/2 bg-gradient-to-t from-blue-500 to-cyan-400 flex items-center justify-center">
                        <span className="text-white font-black text-[10px]">YARIM</span>
                      </div>
                      <div className="absolute top-1/2 inset-x-0 border-b-2 border-dashed border-rose-500" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs sm:text-sm mt-2 shadow">
                      YARIM DOLU
                    </span>
                    <p className="text-[11px] font-bold text-slate-600 text-center mt-1">
                      Kabın tam ortasına kadar sıvı varsa.
                    </p>
                  </div>

                  {/* BOŞ */}
                  <div className="bg-white border-3 border-blue-400 rounded-2xl p-3 flex flex-col items-center justify-between shadow-md">
                    <div className="w-20 h-28 border-4 border-slate-700 rounded-b-xl bg-slate-50 flex items-center justify-center shadow-inner">
                      <span className="text-slate-400 font-bold text-xs">BOŞ</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500 text-white font-black text-xs sm:text-sm mt-2 shadow">
                      BOŞ
                    </span>
                    <p className="text-[11px] font-bold text-slate-600 text-center mt-1">
                      Kabın içinde hiç sıvı yoksa.
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-100 border-2 border-emerald-400 rounded-2xl p-3 text-center shadow-md">
                  <p className="text-xs sm:text-sm font-black text-emerald-950">
                    🎉 Tebrikler! Şimdi Sıvı Ölçme alıştırmalarını başarıyla çözebilirsin!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM ACTION BAR */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-2 px-3 py-2.5 bg-gradient-to-r from-slate-900/95 via-cyan-950/90 to-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-xl shrink-0">
        <button
          onClick={onClose}
          className="px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-black text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center gap-1.5"
        >
          <span>✕ Menüye Dön</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Start Sivi Olcme (Next Topic) */}
          {onStartSiviOlcme && (
            <button
              onClick={() => {
                onClose();
                onStartSiviOlcme();
              }}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border border-emerald-300 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <span>Sıvı Ölçme Alıştırmasına Başla</span>
              <ArrowRight size={16} />
            </button>
          )}

          {/* Sivi Tahmini Akvaryum Game */}
          {onStartSiviTahmin && (
            <button
              onClick={() => {
                onClose();
                onStartSiviTahmin();
              }}
              className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border border-blue-400 items-center gap-1.5 transition cursor-pointer"
            >
              <span>🐠 Sıvı Tahmini Düellosu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
