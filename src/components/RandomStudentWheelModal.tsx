import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, RotateCcw, Volume2, Users, Trophy } from 'lucide-react';
import { Student } from '../types/student';

interface RandomStudentWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  students?: Student[];
  currentGrade?: number;
  playMp3?: (src: string) => void;
}

const FALLBACK_NAMES = [
  'Aybüke', 'Betül Sare', 'Buğlem', 'Çınar Eymen', 'Derin Defne',
  'Efekan', 'Elif Su', 'Eslem', 'Eymen', 'Güneş',
  'Harun', 'Miraç', 'Muhammed', 'Osman Emir', 'Ömer Asaf',
  'Ömer Faruk', 'Ravza', 'Sudem', 'Umut', 'Zeynep'
];

const SLICE_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
  '#e11d48', '#84cc16', '#0ea5e9', '#a855f7', '#d946ef'
];

export const RandomStudentWheelModal: React.FC<RandomStudentWheelModalProps> = ({
  isOpen,
  onClose,
  students = [],
  currentGrade = 2,
  playMp3
}) => {
  // Sınıf öğrencilerini filtrele veya varsayılan isimleri al
  const initialList = React.useMemo(() => {
    const gradeStudents = students.filter(s => !currentGrade || s.grade === currentGrade);
    if (gradeStudents.length > 0) {
      return gradeStudents.map(s => s.name);
    }
    return FALLBACK_NAMES;
  }, [students, currentGrade]);

  const [activeNames, setActiveNames] = useState<string[]>(initialList);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const wheelRef = useRef<SVGSVGElement>(null);

  // Modal her açıldığında liste yenilensin (eğer sıfırlanmışsa)
  useEffect(() => {
    if (isOpen) {
      if (activeNames.length === 0) {
        setActiveNames(initialList);
      }
      setWinner(null);
    }
  }, [isOpen, initialList]);

  if (!isOpen) return null;

  const count = activeNames.length;
  const sliceAngle = 360 / (count || 1);

  // Çarkı Döndür
  const handleSpin = () => {
    if (isSpinning || count === 0) return;

    setWinner(null);
    setIsSpinning(true);

    if (soundEnabled && playMp3) {
      playMp3('/op.mp3');
    }

    // En az 5 tam tur (1800 derece) + rastgele açı
    const extraRounds = 5 + Math.floor(Math.random() * 4);
    const randomAngle = Math.random() * 360;
    const targetRotation = rotation + extraRounds * 360 + randomAngle;

    setRotation(targetRotation);

    // Dönüş bittiğinde kazananı hesapla
    // İbre tepede (270 derece / 12 saati yönünde)
    const spinDuration = 4500; // 4.5 saniye
    setTimeout(() => {
      setIsSpinning(false);

      // İbrenin gösterdiği açıyı normalize et
      // Pointer üstte (90° veya 270° normalize)
      const normalized = (targetRotation % 360 + 360) % 360;
      // İbre tam tepede olduğu için açı ofseti: (270 - normalized) % 360
      const pointerAngle = (360 - (normalized % 360) + 270) % 360;
      const winnerIndex = Math.floor(pointerAngle / sliceAngle) % count;
      const selectedStudent = activeNames[winnerIndex] || activeNames[0];

      setWinner(selectedStudent);

      if (soundEnabled && playMp3) {
        playMp3('/alkis.mp3');
      }

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }, spinDuration);
  };

  // Kazanan öğrenciyi çarktan çıkar (herkesin tahtaya kalkması için)
  const handleRemoveWinner = () => {
    if (!winner) return;
    const nextList = activeNames.filter(n => n !== winner);
    setActiveNames(nextList.length > 0 ? nextList : initialList);
    setWinner(null);
  };

  // Listeyi Sıfırla
  const handleResetList = () => {
    setActiveNames(initialList);
    setWinner(null);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] border-2 border-amber-400 rounded-3xl p-4 sm:p-6 shadow-[0_0_35px_rgba(245,158,11,0.35)] flex flex-col items-center">
        {/* Üst Kapat ve Başlık */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-amber-400/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-spin" style={{ animationDuration: '8s' }}>🎡</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center gap-1.5">
                Rastgele Öğrenci Çarkı
              </h2>
              <p className="text-[11px] text-amber-300/80 font-medium">
                {currentGrade ? `${currentGrade}. Sınıf` : 'Sınıf'} Listesi • {count} Öğrenci
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-red-500/80 text-white transition-colors cursor-pointer border border-slate-600"
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* ÇARK GÖVลูก VE İBRE */}
        <div className="relative my-4 flex items-center justify-center select-none">
          {/* Üst Sabit İbre (Pointer) */}
          <div className="absolute -top-3 z-30 flex flex-col items-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
            <div className="w-6 h-7 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 rounded-b-md clip-pointer shadow-lg border border-white"
                 style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
            <div className="w-3 h-3 -mt-4 rounded-full bg-amber-200 border-2 border-amber-600 shadow" />
          </div>

          {/* Dönen Çark SVG */}
          <div
            className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] overflow-hidden bg-slate-900"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.95, 0.35, 1)' : 'none'
            }}
          >
            <svg
              ref={wheelRef}
              viewBox="-100 -100 200 200"
              className="w-full h-full"
            >
              {activeNames.map((name, i) => {
                const startAngle = (i * sliceAngle * Math.PI) / 180;
                const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180;
                const x1 = Math.cos(startAngle) * 100;
                const y1 = Math.sin(startAngle) * 100;
                const x2 = Math.cos(endAngle) * 100;
                const y2 = Math.sin(endAngle) * 100;
                const largeArc = sliceAngle > 180 ? 1 : 0;
                const pathData = `M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;

                const textAngle = (i + 0.5) * sliceAngle;
                const color = SLICE_COLORS[i % SLICE_COLORS.length];

                return (
                  <g key={i}>
                    <path
                      d={pathData}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />
                    <text
                      transform={`rotate(${textAngle}) translate(58, 4)`}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={count > 16 ? '5.5' : count > 10 ? '7' : '8.5'}
                      fontWeight="900"
                      style={{
                        paintOrder: 'stroke fill',
                        stroke: 'rgba(0,0,0,0.7)',
                        strokeWidth: '1.2px',
                        letterSpacing: '-0.2px'
                      }}
                    >
                      {name.length > 12 ? `${name.substring(0, 10)}..` : name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Çark Göbek Altın Rozeti */}
          <div
            onClick={handleSpin}
            className={`absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border-4 border-white shadow-[0_4px_15px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform ${
              isSpinning ? 'pointer-events-none' : 'hover:scale-105'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-950 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-black text-amber-950 uppercase tracking-tighter">
              {isSpinning ? '...' : 'ÇEVİR'}
            </span>
          </div>
        </div>

        {/* KAZANAN ÖĞRENCİ KUTUSU */}
        {winner && (
          <div className="w-full my-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border-2 border-emerald-400 animate-bounce flex flex-col items-center text-center shadow-lg">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              Sıradaki Soruyu Yanıtlıyor!
            </div>
            <div className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] mt-0.5">
              🌟 {winner} 🌟
            </div>
          </div>
        )}

        {/* EYLEM BUTONLARI */}
        <div className="w-full flex items-center justify-center gap-2 pt-2">
          <button
            onClick={handleSpin}
            disabled={isSpinning || count === 0}
            className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 border-2 border-white shadow-[0_4px_12px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSpinning || count === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:brightness-110 active:scale-98'
            }`}
          >
            <span className="text-lg">🎯</span>
            <span>{isSpinning ? 'Çark Dönüyor...' : 'ÇARKINI ÇEVİR!'}</span>
          </button>

          {winner && (
            <button
              onClick={handleRemoveWinner}
              className="px-3 py-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-400/50 cursor-pointer transition-colors"
              title="Bu öğrenciyi bu tur için çarktan çıkar"
            >
              Listeden Çıkar
            </button>
          )}

          <button
            onClick={handleResetList}
            className="p-2.5 sm:p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 cursor-pointer transition-colors"
            title="Tüm sınıfı çarka geri ekle"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
