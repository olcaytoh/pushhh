import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Trophy,
  CheckCircle2,
  RotateCcw,
  UserPlus,
  Volume2,
  VolumeX,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentHomeworkData } from '../types/homeworkAquarium';
import {
  loadHomeworkData,
  saveHomeworkData,
  syncHomeworkWithStudents,
  completeHomeworkToday,
  undoTodayHomework,
  getTodayDateString,
  calculateFishScale,
  getFishLevelTitle
} from '../utils/homeworkStore';

// Kullanıcının public/blklar klasörüne yüklediği gerçek balık görselleri (27 adet tekil tropik balık)
export const FISH_IMAGES = [
  '/blklar/01_pembe_pofuduk_balik.webp',
  '/blklar/02_mavi_desenli_balik.webp',
  '/blklar/03_beyaz_turuncu_cizgili_balik.webp',
  '/blklar/04_mavi_sari_yuzgec_balik.webp',
  '/blklar/05_aslan_baligi.webp',
  '/blklar/06_turuncu_cizgili_yuvarlak_balik.webp',
  '/blklar/07_kucuk_pembe_balik.webp',
  '/blklar/08_siyah_beyaz_sari_bayrak_balik.webp',
  '/blklar/09_mavi_girdapli_balik.webp',
  '/blklar/10_sari_balik.webp',
  '/blklar/11_mavi_balik_dory.webp',
  '/blklar/12_bayrak_balik_moorish_idol.webp',
  '/blklar/13_palyaco_baligi.webp',
  '/blklar/14_mandalina_baligi.webp',
  '/blklar/15_neon_balik.webp',
  '/blklar/16_beta_savasci_balik.webp',
  '/blklar/17_lacivert_halkali_balik.webp',
  '/blklar/18_nane_yesili_balik.webp',
  '/blklar/19_papagan_baligi.webp',
  '/blklar/20_turkuaz_disk_baligi.webp',
  '/blklar/21_beyaz_turuncu_kelebek_baligi.webp',
  '/blklar/22_toz_mavi_balik.webp',
  '/blklar/23_aslan_baligi_2.webp',
  '/blklar/24_turuncu_siyah_cizgili_balik.webp',
  '/blklar/25_pembe_turuncu_balik.webp',
  '/blklar/26_kahverengi_cizgili_balik.webp',
  '/blklar/27_mavi_gri_melek_baligi.webp',
];

// Her balığın orijinal PNG görselinde yüzünün/başının baktığı doğal yön ('left' veya 'right')
export const FISH_FACING_MAP: Record<string, 'left' | 'right'> = {
  '/blklar/01_pembe_pofuduk_balik.webp': 'left',
  '/blklar/02_mavi_desenli_balik.webp': 'left',
  '/blklar/03_beyaz_turuncu_cizgili_balik.webp': 'left',
  '/blklar/04_mavi_sari_yuzgec_balik.webp': 'right',
  '/blklar/05_aslan_baligi.webp': 'right',
  '/blklar/06_turuncu_cizgili_yuvarlak_balik.webp': 'left',
  '/blklar/07_kucuk_pembe_balik.webp': 'right',
  '/blklar/08_siyah_beyaz_sari_bayrak_balik.webp': 'right',
  '/blklar/09_mavi_girdapli_balik.webp': 'left',
  '/blklar/10_sari_balik.webp': 'right',
  '/blklar/11_mavi_balik_dory.webp': 'left',
  '/blklar/12_bayrak_balik_moorish_idol.webp': 'right',
  '/blklar/13_palyaco_baligi.webp': 'right',
  '/blklar/14_mandalina_baligi.webp': 'right',
  '/blklar/15_neon_balik.webp': 'left',
  '/blklar/16_beta_savasci_balik.webp': 'right',
  '/blklar/17_lacivert_halkali_balik.webp': 'right',
  '/blklar/18_nane_yesili_balik.webp': 'right',
  '/blklar/19_papagan_baligi.webp': 'left',
  '/blklar/20_turkuaz_disk_baligi.webp': 'left',
  '/blklar/21_beyaz_turuncu_kelebek_baligi.webp': 'left',
  '/blklar/22_toz_mavi_balik.webp': 'right',
  '/blklar/23_aslan_baligi_2.webp': 'right',
  '/blklar/24_turuncu_siyah_cizgili_balik.webp': 'left',
  '/blklar/25_pembe_turuncu_balik.webp': 'right',
  '/blklar/26_kahverengi_cizgili_balik.webp': 'right',
  '/blklar/27_mavi_gri_melek_baligi.webp': 'left',
};

// React State için kullanılan balık bilgisi (Yüzme animasyonunda React render tetiklemez)
interface FishState {
  id: string;
  studentId: string;
  name: string;
  homeworkCount: number;
  lastCompletedDate?: string;
  imageSrc: string;
  fishWidth: number;
  nativeFacing: 'left' | 'right';
  isHappy?: boolean;
}

// Akıllı tahta CPU'sunu sıfıra indiren yüksek performanslı fizik nesnesi (Ref içinde saklanır)
interface FishPhysics {
  id: string;
  x: number; // 0 - 100 (%)
  y: number; // 0 - 100 (%)
  vx: number;
  vy: number;
  direction: 1 | -1;
  prevDirection: 1 | -1;
  nativeFacing: 'left' | 'right';
}

interface OdevAkvaryumuModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialGrade?: number;
  onOpenRosterModal?: (grade?: number) => void;
  playMp3?: (src: string) => void;
}

export const OdevAkvaryumuModal: React.FC<OdevAkvaryumuModalProps> = ({
  isOpen,
  onClose,
  students,
  initialGrade = 4,
  onOpenRosterModal,
  playMp3
}) => {
  // Seçili Sınıf: 1, 2, 3 veya 4
  const [selectedGrade, setSelectedGrade] = useState<number>(initialGrade || 4);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Modal her açıldığında gelen initialGrade'i seç
  useEffect(() => {
    if (isOpen && initialGrade) {
      setSelectedGrade(initialGrade);
    }
  }, [isOpen, initialGrade]);

  // Seçili sınıftaki öğrenciler (Yalnızca öğretmenin listesindeki gerçek öğrenciler)
  const currentGradeStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedGrade);
  }, [students, selectedGrade]);

  const [homeworkMap, setHomeworkMap] = useState<Record<string, StudentHomeworkData>>({});
  const [fishes, setFishes] = useState<FishState[]>([]);
  const [activePopup, setActivePopup] = useState<{
    studentName: string;
    message: string;
    type: 'success' | 'already' | 'info';
    count: number;
    badge: string;
    title: string;
  } | null>(null);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [teacherMode, setTeacherMode] = useState(false);

  // Akıllı Tahta Donanım Hızlandırması & GPU Doğrudan Erişim Ref'leri
  const aquariumRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const fishesPhysicsRef = useRef<FishPhysics[]>([]);
  const fishDomMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const fishBodyDomMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const aquariumDimsRef = useRef<{ w: number; h: number }>({ w: 1000, h: 600 });

  const todayStr = getTodayDateString();

  // Akvaryum boyutlarını güncel tut (ResizeObserver ile CPU harcamadan)
  useEffect(() => {
    if (!isOpen || !aquariumRef.current) return;
    const updateDims = () => {
      if (aquariumRef.current) {
        const rect = aquariumRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          aquariumDimsRef.current = { w: rect.width, h: rect.height };
        }
      }
    };
    updateDims();
    const ro = new ResizeObserver(updateDims);
    ro.observe(aquariumRef.current);
    return () => ro.disconnect();
  }, [isOpen]);

  // Verileri yükle & senkronize et (Sadece modal açıldığında veya sınıf değiştiğinde 1 kez çalışır)
  useEffect(() => {
    if (!isOpen) return;
    const existing = loadHomeworkData();
    const synced = syncHomeworkWithStudents(currentGradeStudents, existing);
    setHomeworkMap(synced);
    saveHomeworkData(synced);

    // Balık fizik durumlarını ref'e hazırla
    const physicsList: FishPhysics[] = [];

    // React render nesnelerini oluştur (Sadece ödev değiştiğinde re-render)
    const initialFishes: FishState[] = currentGradeStudents.map((st, i) => {
      const data: StudentHomeworkData = synced[st.id] || {
        studentId: st.id,
        studentName: st.name,
        homeworkCount: 0,
        lastCompletedDate: undefined,
        fishModelIndex: i % FISH_IMAGES.length,
        createdAt: new Date().toISOString()
      };

      const imageIndex = (data.fishModelIndex ?? i) % FISH_IMAGES.length;
      const imageSrc = FISH_IMAGES[imageIndex];
      const nativeFacing = FISH_FACING_MAP[imageSrc] || 'left';
      const scale = calculateFishScale(data.homeworkCount || 0);
      const fishWidth = Math.min(140, Math.round(74 * scale));

      // Akvaryumda rastgele başlangıç koordinatları
      const x = 12 + ((i * 19) % 74);
      const y = 18 + ((i * 23) % 62);
      const vx = (Math.random() > 0.5 ? 1 : -1) * (0.035 + Math.random() * 0.04);
      const vy = (Math.random() > 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.03);
      const dir: 1 | -1 = vx >= 0 ? 1 : -1;

      physicsList.push({
        id: st.id,
        x,
        y,
        vx,
        vy,
        direction: dir,
        prevDirection: dir,
        nativeFacing
      });

      return {
        id: st.id,
        studentId: st.id,
        name: st.name,
        homeworkCount: data.homeworkCount || 0,
        lastCompletedDate: data.lastCompletedDate,
        imageSrc,
        fishWidth,
        nativeFacing,
        isHappy: false
      };
    });

    fishesPhysicsRef.current = physicsList;
    setFishes(initialFishes);
  }, [isOpen, currentGradeStudents, selectedGrade]);

  // CANLI AKVARYUM FİZİĞİ - SIFIR REACT RERENDER, 100% GPU KOMPOZİTÖRÜ (translate3d)
  useEffect(() => {
    if (!isOpen) return;

    let lastTime = performance.now();
    let isRunning = true;

    const updatePhysics = (now: number) => {
      if (!isRunning) return;

      const dt = Math.min(now - lastTime, 64); // Frame drop durumunda fırlamayı önle
      lastTime = now;
      const speedFactor = dt / 16.666; // 60 FPS normalize çarpanı

      const dims = aquariumDimsRef.current;
      const w = dims.w;
      const h = dims.h;
      const list = fishesPhysicsRef.current;
      const domMap = fishDomMap.current;
      const bodyMap = fishBodyDomMap.current;

      for (let i = 0; i < list.length; i++) {
        const f = list[i];
        let newX = f.x + f.vx * speedFactor;
        let newY = f.y + f.vy * speedFactor;

        // X sınırları (%8 - %88)
        if (newX <= 8) {
          newX = 8;
          f.vx = Math.abs(f.vx);
        } else if (newX >= 88) {
          newX = 88;
          f.vx = -Math.abs(f.vx);
        }

        // Y sınırları (%14 - %80)
        if (newY <= 14) {
          newY = 14;
          f.vy = Math.abs(f.vy);
        } else if (newY >= 80) {
          newY = 80;
          f.vy = -Math.abs(f.vy);
        }

        // Minik organik dalgalanmalar
        if (Math.random() < 0.012) {
          f.vy = (Math.random() - 0.5) * 0.05;
        }

        f.x = newX;
        f.y = newY;
        f.direction = f.vx >= 0 ? 1 : -1;

        // DOĞRUDAN GPU TRANSLATE3D İLE HAREKET ETTİR (Sıfır Reflow, Sıfır Repaint)
        const el = domMap.get(f.id);
        if (el) {
          const px = (newX * w) / 100;
          const py = (newY * h) / 100;
          el.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
        }

        // Sadece yüzme yönü değiştiğinde gövdeyi ters çevir
        if (f.direction !== f.prevDirection) {
          f.prevDirection = f.direction;
          const bodyEl = bodyMap.get(f.id);
          if (bodyEl) {
            const scaleX = f.direction === 1
              ? (f.nativeFacing === 'right' ? 1 : -1)
              : (f.nativeFacing === 'left' ? 1 : -1);
            bodyEl.style.transform = `scaleX(${scaleX})`;
          }
        }
      }

      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    requestRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      isRunning = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isOpen]);

  // Balığa Tıklama - Günlük Ödev Onayı
  const handleFishClick = useCallback((fish: FishState, event: React.MouseEvent) => {
    event.stopPropagation();

    // Bugün zaten yapılmış mı kontrol et
    if (fish.lastCompletedDate === todayStr) {
      if (soundEnabled && playMp3) playMp3('/tek.mp3');
      const levelInfo = getFishLevelTitle(fish.homeworkCount);

      setActivePopup({
        studentName: fish.name,
        message: `Bugünkü ödevini zaten tamamladın! Balığın yarın yeni ödevinle birlikte daha da büyüyecek! 🌟`,
        type: 'already',
        count: fish.homeworkCount,
        badge: levelInfo.badge,
        title: levelInfo.title
      });
      return;
    }

    // Bugün ilk defa yapılıyorsa tamamla
    const res = completeHomeworkToday(fish.studentId, fish.name);
    if (res.success) {
      // Ses efekti
      if (soundEnabled && playMp3) {
        playMp3('/farklilvl.mp3');
        setTimeout(() => playMp3('/para.mp3'), 250);
      }

      // Akıllı tahtalarda kasmayan hafif konfeti
      try {
        confetti({
          particleCount: 30,
          spread: 55,
          origin: {
            x: event.clientX / window.innerWidth,
            y: event.clientY / window.innerHeight
          },
          colors: ['#06b6d4', '#3b82f6', '#f59e0b', '#10b981']
        });
      } catch {}

      // State güncelle (Tek bir kez re-render tetikler)
      const updated = loadHomeworkData();
      setHomeworkMap(updated);

      const levelInfo = getFishLevelTitle(res.newCount);
      const newScale = calculateFishScale(res.newCount);
      const newFishWidth = Math.min(140, Math.round(74 * newScale));

      setFishes(prev =>
        prev.map(item => {
          if (item.studentId === fish.studentId) {
            return {
              ...item,
              homeworkCount: res.newCount,
              lastCompletedDate: todayStr,
              fishWidth: newFishWidth,
              isHappy: true
            };
          }
          return item;
        })
      );

      // Balık zıplama animasyonunu 1.5 saniye sonra kapat
      setTimeout(() => {
        setFishes(prev =>
          prev.map(item =>
            item.studentId === fish.studentId ? { ...item, isHappy: false } : item
          )
        );
      }, 1500);

      setActivePopup({
        studentName: fish.name,
        message: `Tebrikler! Bugünkü ödevini tamamladın ve balığın büyüdü! 🌟`,
        type: 'success',
        count: res.newCount,
        badge: levelInfo.badge,
        title: levelInfo.title
      });
    }
  }, [todayStr, soundEnabled, playMp3]);

  // Öğretmen Modunda Bugünkü Ödevi Geri Alma
  const handleUndo = useCallback((studentId: string, studentName: string) => {
    const success = undoTodayHomework(studentId);
    if (success) {
      if (soundEnabled && playMp3) playMp3('/hata.mp3');
      const updated = loadHomeworkData();
      setHomeworkMap(updated);

      setFishes(prev =>
        prev.map(f => {
          if (f.studentId === studentId) {
            const nextCount = Math.max(0, f.homeworkCount - 1);
            const scale = calculateFishScale(nextCount);
            return {
              ...f,
              homeworkCount: nextCount,
              fishWidth: Math.min(140, Math.round(74 * scale)),
              lastCompletedDate: undefined
            };
          }
          return f;
        })
      );

      setActivePopup({
        studentName,
        message: 'Bugünkü ödev kaydı geri alındı.',
        type: 'info',
        count: Math.max(0, (homeworkMap[studentId]?.homeworkCount || 1) - 1),
        badge: '🔄',
        title: 'Geri Alındı'
      });
    }
  }, [soundEnabled, playMp3, homeworkMap]);

  // İstatistik hesaplamaları
  const totalStudents = fishes.length;
  const completedTodayCount = fishes.filter(f => f.lastCompletedDate === todayStr).length;
  const completionPercentage = totalStudents > 0 ? Math.round((completedTodayCount / totalStudents) * 100) : 0;
  const totalHomeworksGiven = fishes.reduce((sum, f) => sum + (f.homeworkCount || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col p-1 sm:p-2 md:p-3 bg-black/90 select-none overflow-hidden">
      <div className="relative w-full max-w-[1550px] h-full max-h-full mx-auto bg-[#02182b] rounded-xl sm:rounded-2xl md:rounded-3xl border-2 sm:border-3 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden">
        
        {/* ÜST BİLGİ VE KONTROL ÇUBUĞU */}
        <div className="relative z-30 flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2 bg-[#021424] border-b-2 border-cyan-400/50 shrink-0 gap-1.5 sm:gap-2">
          {/* SOL: İKON VE BAŞLIK */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-300 flex items-center justify-center text-base sm:text-xl shadow shrink-0">
              🐠
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-xs sm:text-sm md:text-base text-cyan-200 tracking-wide truncate">
                  {selectedGrade}. SINIF ÖDEV AKVARYUMU
                </h2>
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shrink-0">
                  Canlı Takip
                </span>
              </div>
              <p className="text-[9px] sm:text-xs text-sky-300/80 font-medium truncate hidden 2xl:block">
                Ödevini yapan balığına tıklar, balıklar her ödevde büyür! 🐟✨
              </p>
            </div>
          </div>

          {/* ORTA: 1, 2, 3 VE 4. SINIF SEÇİCİ SEKMELERİ */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#010e1a] p-0.5 sm:p-1 rounded-xl border border-cyan-500/40 shrink-0">
            {[1, 2, 3, 4].map((grade) => {
              const isSelected = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow scale-105'
                      : 'text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-950/60'
                  }`}
                >
                  {grade}. Sınıf
                </button>
              );
            })}
          </div>

          {/* SAĞ: HIZLI İŞLEM BUTONLARI */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Sıralama & Büyüme Liderliği */}
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-[10px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95"
              title="Akvaryum Sıralaması"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Sıralama</span>
            </button>

            {/* Öğretmen Modu */}
            <button
              onClick={() => setTeacherMode(!teacherMode)}
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                teacherMode
                  ? 'bg-purple-600/40 text-purple-200 border-purple-400 shadow'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
              title="Öğretmen Düzenleme Modu"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden md:inline">{teacherMode ? 'Öğretmen: Açık' : 'Düzenle'}</span>
            </button>

            {/* Ses Aç/Kapa */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer shrink-0 active:scale-95"
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />}
            </button>

            {/* Tam Ekran Butonu */}
            <button
              onClick={toggleFullscreen}
              className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-slate-800/80 hover:bg-slate-800 text-cyan-300 border border-slate-700 transition-all cursor-pointer shrink-0 active:scale-95"
              title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
            </button>

            {/* Kapat Butonu */}
            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-red-600 hover:bg-red-500 text-white font-black border border-red-400 transition-all cursor-pointer ml-0.5 shrink-0 shadow active:scale-95"
              title="Akvaryumu Kapat"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </button>
          </div>
        </div>

        {/* GÜNLÜK İLERLEME ÇUBUĞU / BİLGİ BANDI */}
        <div className="relative z-20 flex items-center justify-between px-2 sm:px-4 py-1 sm:py-1.5 bg-[#032038] border-b border-cyan-500/30 text-xs shrink-0 flex-wrap gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="text-cyan-300 font-bold flex items-center gap-1 text-[11px] sm:text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Bugün Ödev Yapanlar:
              <span className="text-emerald-300 font-black text-xs sm:text-sm bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-500/30 ml-0.5">
                {completedTodayCount} / {totalStudents}
              </span>
            </span>
            <span className="text-slate-400 text-[10px] sm:text-[11px] hidden md:inline">
              ({completionPercentage}% Tamamlandı)
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-amber-300/90 text-[10px] sm:text-xs font-semibold hidden xs:inline">
              🌊 Toplam Büyüme: <strong className="text-amber-300 font-black">{totalHomeworksGiven} Ödev</strong>
            </span>
            {onOpenRosterModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRosterModal(selectedGrade);
                }}
                className="flex items-center gap-1 text-[10px] sm:text-[11px] text-cyan-300 hover:text-cyan-200 underline cursor-pointer font-bold"
              >
                <UserPlus className="w-3 h-3" />
                Öğrenci Listesini Düzenle
              </button>
            )}
          </div>
        </div>

        {/* ANA AKVARYUM DÜNYASI (CANVAS / WATER VIEWPORT) */}
        <div
          ref={aquariumRef}
          className="relative flex-1 w-full min-h-0 overflow-hidden select-none cursor-default bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/akvar.webp')",
            backgroundColor: '#02182b'
          }}
        >
          {/* Su Işık Huzmeleri (CPU dostu yumuşak gradyanlar - blur kaldırıldı) */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            <div className="absolute -top-10 left-1/4 w-32 h-[600px] bg-gradient-to-b from-cyan-200/30 via-sky-300/10 to-transparent rotate-12" />
            <div className="absolute -top-10 left-2/4 w-44 h-[650px] bg-gradient-to-b from-cyan-100/25 via-teal-200/10 to-transparent -rotate-6" />
            <div className="absolute -top-10 left-3/4 w-36 h-[600px] bg-gradient-to-b from-cyan-200/30 via-sky-300/10 to-transparent rotate-12" />
          </div>

          {/* Yükselen Doğal Su Kabarcıkları (Düşük GPU yükü) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[8, 20, 34, 46, 60, 74, 88].map((left, idx) => (
              <div
                key={idx}
                className="absolute rounded-full bg-white/25 border border-white/40"
                style={{
                  width: `${6 + (idx % 3) * 4}px`,
                  height: `${6 + (idx % 3) * 4}px`,
                  left: `${left}%`,
                  bottom: `${(idx * 14) % 85}%`,
                  opacity: 0.4
                }}
              />
            ))}
          </div>

          {/* YÜZEN TÜM ÖĞRENCİ BALIKLARI (DOĞRUDAN GPU TRANSLATE3D İLE HAREKET EDER) */}
          {fishes.map((fish) => {
            const isCompletedToday = fish.lastCompletedDate === todayStr;
            const levelInfo = getFishLevelTitle(fish.homeworkCount);
            const firstName = fish.name ? fish.name.trim().split(/\s+/)[0] : '';

            return (
              <div
                key={fish.studentId}
                ref={(el) => {
                  if (el) fishDomMap.current.set(fish.studentId, el);
                  else fishDomMap.current.delete(fish.studentId);
                }}
                onClick={(e) => handleFishClick(fish, e)}
                className="absolute top-0 left-0 z-20 flex flex-col items-center cursor-pointer select-none group"
                style={{
                  // İlk render pozisyonu (Sonrasında requestAnimationFrame translate3d ile kontrol eder)
                  transform: 'translate3d(0, 0, 0) translate(-50%, -50%)',
                  willChange: 'transform'
                }}
              >
                {/* Öğrenci İsim Kartuşu & Ödev Durumu */}
                <div
                  className={`relative z-30 mb-0.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black border flex items-center gap-1 whitespace-nowrap select-none shadow-sm ${
                    isCompletedToday
                      ? 'bg-emerald-950/95 text-emerald-200 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-950/90 text-slate-100 border-sky-400/50 hover:border-cyan-300'
                  }`}
                >
                  <span className="text-[10px]">{levelInfo.badge}</span>
                  <span className="tracking-tight font-extrabold">{firstName}</span>
                  <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-black ${isCompletedToday ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-800 text-amber-300'}`}>
                    {fish.homeworkCount}
                  </span>
                  {isCompletedToday && (
                    <span className="text-emerald-400 font-black text-[10px]" title="Bugünkü ödev yapıldı!">
                      ✔
                    </span>
                  )}
                </div>

                {/* Balık Gövdesi: Çift drop-shadow yerine hafif tekil gölge */}
                <div
                  ref={(el) => {
                    if (el) fishBodyDomMap.current.set(fish.studentId, el);
                    else fishBodyDomMap.current.delete(fish.studentId);
                  }}
                  className={`relative flex items-center justify-center select-none ${
                    fish.isHappy ? 'animate-bounce' : ''
                  }`}
                  style={{
                    width: `${fish.fishWidth}px`,
                    willChange: 'transform',
                    filter: isCompletedToday
                      ? 'drop-shadow(0 2px 5px rgba(34, 197, 94, 0.75))'
                      : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45))'
                  }}
                >
                  <img
                    src={fish.imageSrc}
                    alt={fish.name}
                    className="w-full h-auto object-contain pointer-events-none select-none"
                    loading="eager"
                  />

                  {/* Bugün tamamlandıysa parlayan altın yıldız rozeti */}
                  {isCompletedToday && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border border-white text-[9px] flex items-center justify-center text-amber-950 font-black shadow">
                      ⭐
                    </div>
                  )}
                </div>

                {/* Öğretmen Modunda Geri Al Butonu */}
                {teacherMode && isCompletedToday && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUndo(fish.studentId, fish.name);
                    }}
                    className="mt-1 px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[9px] font-bold border border-red-400 flex items-center gap-0.5 cursor-pointer z-30 shadow"
                    title="Bugünkü ödevi geri al"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Geri Al
                  </button>
                )}
              </div>
            );
          })}

          {/* BİLGİLENDİRME / TEBRİK AÇILIR BALONCUĞU (POPUP) */}
          {activePopup && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%] p-3.5 rounded-2xl bg-[#0f2c4a] border-2 border-cyan-400 text-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl">{activePopup.badge}</span>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-cyan-200">
                      {activePopup.studentName}
                    </h4>
                    <p className="text-[10px] text-amber-300 font-bold">
                      {activePopup.title} • Toplam {activePopup.count} Ödev
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePopup(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="mt-2 text-xs sm:text-sm text-sky-100 leading-relaxed font-medium">
                {activePopup.message}
              </p>
            </div>
          )}

          {/* LİDERLİK TABLOSU / EN ÇOK BÜYÜYEN BALIKLAR MODALI */}
          {showLeaderboard && (
            <div className="absolute inset-y-0 right-0 w-full xs:w-80 sm:w-96 bg-[#041c33] border-l-2 border-cyan-400/80 z-40 p-4 flex flex-col shadow-2xl animate-in slide-in-from-right duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-sm text-cyan-200">
                    {selectedGrade}. Sınıf Büyüme Sıralaması
                  </h3>
                </div>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1 custom-scrollbar">
                {[...fishes]
                  .sort((a, b) => b.homeworkCount - a.homeworkCount)
                  .map((f, idx) => {
                    const isDone = f.lastCompletedDate === todayStr;
                    const level = getFishLevelTitle(f.homeworkCount);

                    return (
                      <div
                        key={f.studentId}
                        className={`flex items-center justify-between p-2 rounded-xl border ${
                          idx === 0
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : idx === 1
                            ? 'bg-slate-700/30 border-slate-400 text-slate-200'
                            : idx === 2
                            ? 'bg-orange-800/20 border-orange-400 text-orange-200'
                            : 'bg-slate-900/40 border-cyan-900/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-black text-xs w-4 text-center">
                            {idx + 1}.
                          </span>
                          <img
                            src={f.imageSrc}
                            alt=""
                            className="w-7 h-7 object-contain shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate">{f.name}</p>
                            <p className="text-[10px] text-slate-400">{level.title}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black text-xs text-cyan-300">
                            {f.homeworkCount} Ödev
                          </span>
                          {isDone ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Yapıldı
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400">
                              Bekliyor
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-2 border-t border-cyan-500/30 text-center">
                <p className="text-[10px] text-cyan-300/70">
                  Her gün 1 ödev hakkı vardır. Balıklar ödev yaptıkça büyür!
                </p>
              </div>
            </div>
          )}

          {/* AKVARYUM ALT BİLGİ ETİKETİ */}
          <div className="absolute bottom-2 left-3 z-20 pointer-events-none">
            <p className="text-[10px] text-cyan-300/80 font-medium flex items-center gap-1 drop-shadow">
              <Info className="w-3 h-3 text-cyan-400" />
              Öğrenciler kendi balığına tıklayarak günlük ödevini onaylar.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
