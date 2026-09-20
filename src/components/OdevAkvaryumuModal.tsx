import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Trophy,
  CheckCircle2,
  RotateCcw,
  UserPlus,
  Volume2,
  VolumeX,
  Info
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
  '/blklar/01_pembe_pofuduk_balik.png',
  '/blklar/02_mavi_desenli_balik.png',
  '/blklar/03_beyaz_turuncu_cizgili_balik.png',
  '/blklar/04_mavi_sari_yuzgec_balik.png',
  '/blklar/05_aslan_baligi.png',
  '/blklar/06_turuncu_cizgili_yuvarlak_balik.png',
  '/blklar/07_kucuk_pembe_balik.png',
  '/blklar/08_siyah_beyaz_sari_bayrak_balik.png',
  '/blklar/09_mavi_girdapli_balik.png',
  '/blklar/10_sari_balik.png',
  '/blklar/11_mavi_balik_dory.png',
  '/blklar/12_bayrak_balik_moorish_idol.png',
  '/blklar/13_palyaco_baligi.png',
  '/blklar/14_mandalina_baligi.png',
  '/blklar/15_neon_balik.png',
  '/blklar/16_beta_savasci_balik.png',
  '/blklar/17_lacivert_halkali_balik.png',
  '/blklar/18_nane_yesili_balik.png',
  '/blklar/19_papagan_baligi.png',
  '/blklar/20_turkuaz_disk_baligi.png',
  '/blklar/21_beyaz_turuncu_kelebek_baligi.png',
  '/blklar/22_toz_mavi_balik.png',
  '/blklar/23_aslan_baligi_2.png',
  '/blklar/24_turuncu_siyah_cizgili_balik.png',
  '/blklar/25_pembe_turuncu_balik.png',
  '/blklar/26_kahverengi_cizgili_balik.png',
  '/blklar/27_mavi_gri_melek_baligi.png',
];

// Her balığın orijinal PNG görselinde yüzünün/başının baktığı doğal yön ('left' veya 'right')
export const FISH_FACING_MAP: Record<string, 'left' | 'right'> = {
  '/blklar/01_pembe_pofuduk_balik.png': 'left',
  '/blklar/02_mavi_desenli_balik.png': 'left',
  '/blklar/03_beyaz_turuncu_cizgili_balik.png': 'left',
  '/blklar/04_mavi_sari_yuzgec_balik.png': 'right',
  '/blklar/05_aslan_baligi.png': 'right',
  '/blklar/06_turuncu_cizgili_yuvarlak_balik.png': 'left',
  '/blklar/07_kucuk_pembe_balik.png': 'right',
  '/blklar/08_siyah_beyaz_sari_bayrak_balik.png': 'right',
  '/blklar/09_mavi_girdapli_balik.png': 'left',
  '/blklar/10_sari_balik.png': 'right',
  '/blklar/11_mavi_balik_dory.png': 'left',
  '/blklar/12_bayrak_balik_moorish_idol.png': 'right',
  '/blklar/13_palyaco_baligi.png': 'right',
  '/blklar/14_mandalina_baligi.png': 'right',
  '/blklar/15_neon_balik.png': 'left',
  '/blklar/16_beta_savasci_balik.png': 'right',
  '/blklar/17_lacivert_halkali_balik.png': 'right',
  '/blklar/18_nane_yesili_balik.png': 'right',
  '/blklar/19_papagan_baligi.png': 'left',
  '/blklar/20_turkuaz_disk_baligi.png': 'left',
  '/blklar/21_beyaz_turuncu_kelebek_baligi.png': 'left',
  '/blklar/22_toz_mavi_balik.png': 'right',
  '/blklar/23_aslan_baligi_2.png': 'right',
  '/blklar/24_turuncu_siyah_cizgili_balik.png': 'left',
  '/blklar/25_pembe_turuncu_balik.png': 'right',
  '/blklar/26_kahverengi_cizgili_balik.png': 'right',
  '/blklar/27_mavi_gri_melek_baligi.png': 'left',
};

interface FishState {
  id: string;
  studentId: string;
  name: string;
  homeworkCount: number;
  lastCompletedDate?: string;
  imageSrc: string;
  x: number; // 0 - 100 (%)
  y: number; // 0 - 100 (%)
  vx: number; // % per frame
  vy: number; // % per frame
  direction: 1 | -1; // 1: Sağa yüzerken, -1: Sola yüzerken
  isHappy: boolean;
}

interface OdevAkvaryumuModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialGrade?: number;
  onOpenRosterModal?: () => void;
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

  // Modal her açıldığında gelen initialGrade'i seç
  useEffect(() => {
    if (isOpen && initialGrade) {
      setSelectedGrade(initialGrade);
    }
  }, [isOpen, initialGrade]);

  // Seçili sınıftaki öğrenciler
  const currentGradeStudents = useMemo(() => {
    const list = students.filter(s => s.grade === selectedGrade);
    if (list.length > 0) return list;
    
    // Eğer seçili sınıfta henüz öğrenci eklenmemişse sevimli bir varsayılan kadro
    return [
      { id: `g${selectedGrade}_demo_1`, name: 'Ali Yıldız', grade: selectedGrade, avatar: '🦁', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: '' },
      { id: `g${selectedGrade}_demo_2`, name: 'Ayşe Kaya', grade: selectedGrade, avatar: '🐬', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: '' },
      { id: `g${selectedGrade}_demo_3`, name: 'Mehmet Demir', grade: selectedGrade, avatar: '🚀', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: '' },
      { id: `g${selectedGrade}_demo_4`, name: 'Zeynep Çelik', grade: selectedGrade, avatar: '🦊', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: '' },
      { id: `g${selectedGrade}_demo_5`, name: 'Can Özkan', grade: selectedGrade, avatar: '🐯', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: '' },
      { id: `g${selectedGrade}_demo_6`, name: 'Elif Şahin', grade: selectedGrade, avatar: '🌸', totalCorrect: 0, totalWrong: 0, gamesPlayed: 0, gamesWon: 0, topicStats: {}, createdAt: '' }
    ] as Student[];
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
  const aquariumRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  const todayStr = getTodayDateString();

  // Verileri yükle & senkronize et
  useEffect(() => {
    if (!isOpen) return;
    const existing = loadHomeworkData();
    const synced = syncHomeworkWithStudents(currentGradeStudents, existing);
    setHomeworkMap(synced);
    saveHomeworkData(synced);

    // Balıkların ilk konumlarını, hızlarını ve görsellerini ata
    const initialFishes: FishState[] = currentGradeStudents.map((st, i) => {
      const data: StudentHomeworkData = synced[st.id] || {
        studentId: st.id,
        studentName: st.name,
        homeworkCount: 0,
        lastCompletedDate: undefined,
        fishModelIndex: i % FISH_IMAGES.length,
        createdAt: new Date().toISOString()
      };

      // Öğrenciye özel balık görseli (30 balık arasından)
      const imageIndex = (data.fishModelIndex ?? i) % FISH_IMAGES.length;
      const imageSrc = FISH_IMAGES[imageIndex];

      // Akvaryumda rastgele dağıt
      const x = 12 + ((i * 19) % 74);
      const y = 16 + ((i * 23) % 64);
      const vx = (Math.random() > 0.5 ? 1 : -1) * (0.035 + Math.random() * 0.045);
      const vy = (Math.random() > 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.035);

      return {
        id: st.id,
        studentId: st.id,
        name: st.name,
        homeworkCount: data.homeworkCount || 0,
        lastCompletedDate: data.lastCompletedDate,
        imageSrc,
        x,
        y,
        vx,
        vy,
        direction: vx >= 0 ? 1 : -1, // Sağa yüzüyorsa 1, sola yüzüyorsa -1
        isHappy: false
      };
    });

    setFishes(initialFishes);
  }, [isOpen, currentGradeStudents, selectedGrade]);

  // Canlı Akvaryum Yüzme Fiziği Animasyonu
  useEffect(() => {
    if (!isOpen) return;

    const updatePhysics = () => {
      setFishes(prevFishes => {
        return prevFishes.map(f => {
          let newX = f.x + f.vx;
          let newY = f.y + f.vy;
          let newVx = f.vx;
          let newVy = f.vy;

          // X sınırları (sol: %8, sağ: %88)
          if (newX <= 8) {
            newX = 8;
            newVx = Math.abs(newVx); // Sağa dön
          } else if (newX >= 88) {
            newX = 88;
            newVx = -Math.abs(newVx); // Sola dön
          }

          // Y sınırları (üst: %12, alt: %78)
          if (newY <= 12) {
            newY = 12;
            newVy = Math.abs(newVy);
          } else if (newY >= 78) {
            newY = 78;
            newVy = -Math.abs(newVy);
          }

          // Doğal dalgalı yüzüş için minik rastgele sapmalar
          if (Math.random() < 0.015) {
            newVy = (Math.random() - 0.5) * 0.06;
          }

          // Hareket yönü: Sağa yüzerken 1, sola yüzerken -1
          const newDir: 1 | -1 = newVx >= 0 ? 1 : -1;

          return {
            ...f,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            direction: newDir
          };
        });
      });

      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    requestRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isOpen]);

  // Balığa Tıklama - Günlük Ödev Onayı
  const handleFishClick = (fish: FishState, event: React.MouseEvent) => {
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

      // Konfeti patlaması
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: {
            x: event.clientX / window.innerWidth,
            y: event.clientY / window.innerHeight
          },
          colors: ['#06b6d4', '#3b82f6', '#f59e0b', '#10b981', '#ec4899']
        });
      } catch {
        // Fallback
      }

      // State güncelle
      const updated = loadHomeworkData();
      setHomeworkMap(updated);

      setFishes(prev =>
        prev.map(item => {
          if (item.studentId === fish.studentId) {
            return {
              ...item,
              homeworkCount: res.newCount,
              lastCompletedDate: todayStr,
              isHappy: true,
              vy: -0.15 // Zıplama hareketi
            };
          }
          return item;
        })
      );

      const levelInfo = getFishLevelTitle(res.newCount);

      setActivePopup({
        studentName: fish.name,
        message: `Tebrikler! Bugünkü ödevini tamamladın ve balığın büyüdü! 🌟`,
        type: 'success',
        count: res.newCount,
        badge: levelInfo.badge,
        title: levelInfo.title
      });

      setTimeout(() => {
        setFishes(prev =>
          prev.map(item =>
            item.studentId === fish.studentId ? { ...item, isHappy: false } : item
          )
        );
      }, 2000);
    }
  };

  // Öğretmen Modunda Bugünkü Ödevi Geri Alma
  const handleUndo = (studentId: string, studentName: string) => {
    const success = undoTodayHomework(studentId);
    if (success) {
      if (soundEnabled && playMp3) playMp3('/hata.mp3');
      const updated = loadHomeworkData();
      setHomeworkMap(updated);
      setFishes(prev =>
        prev.map(f => {
          if (f.studentId === studentId) {
            return {
              ...f,
              homeworkCount: Math.max(0, f.homeworkCount - 1),
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
  };

  // İstatistik hesaplamaları
  const totalStudents = fishes.length;
  const completedTodayCount = fishes.filter(f => f.lastCompletedDate === todayStr).length;
  const completionPercentage = totalStudents > 0 ? Math.round((completedTodayCount / totalStudents) * 100) : 0;
  const totalHomeworksGiven = fishes.reduce((sum, f) => sum + (f.homeworkCount || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[820px] bg-gradient-to-b from-[#02182b] via-[#042844] to-[#011424] rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-cyan-400/80 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col overflow-hidden my-auto">
        
        {/* ÜST BİLGİ VE KONTROL ÇUBUĞU */}
        <div className="relative z-20 flex items-center justify-between px-2.5 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-950/95 via-sky-950/95 to-cyan-950/95 border-b-2 border-cyan-400/50 backdrop-blur-sm shrink-0 gap-1.5 sm:gap-3">
          {/* SOL: İKON VE BAŞLIK */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-300 flex items-center justify-center text-lg sm:text-2xl shadow-lg shrink-0">
              🐠
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-xs sm:text-sm md:text-base text-cyan-200 tracking-wide drop-shadow truncate">
                  {selectedGrade}. SINIF ÖDEV AKVARYUMU
                </h2>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shrink-0">
                  Canlı Takip
                </span>
              </div>
              <p className="text-[9px] sm:text-xs text-sky-300/80 font-medium truncate hidden xs:block">
                Ödevini yapan balığına tıklar, balıklar her ödevde büyür! 🐟✨
              </p>
            </div>
          </div>

          {/* ORTA: 1, 2, 3 VE 4. SINIF SEÇİCİ SEKMELERİ */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#021424]/90 p-0.5 sm:p-1 rounded-xl border border-cyan-500/40 shrink-0">
            {[1, 2, 3, 4].map((grade) => {
              const isSelected = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)] scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {grade}. Sınıf
                </button>
              );
            })}
          </div>

          {/* SAĞ: KONTROLLER (Sıralama, Düzenle, Ses, Kapat) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Liderlik Tablosu Butonu */}
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0"
              title="Ödev Lider Tablosu"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sıralama</span>
            </button>

            {/* Öğretmen Modu */}
            <button
              onClick={() => setTeacherMode(!teacherMode)}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 ${
                teacherMode
                  ? 'bg-purple-600/40 text-purple-200 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
              title="Öğretmen Düzenleme Modu"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden md:inline">{teacherMode ? 'Öğretmen: Açık' : 'Düzenle'}</span>
            </button>

            {/* Ses Aç/Kapa */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer shrink-0"
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />}
            </button>

            {/* Kapat Butonu (EN DIŞTAKİ BUTON - Her zaman tam ve net görünür) */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold border border-red-400 transition-all cursor-pointer ml-0.5 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)] active:scale-95"
              title="Akvaryumu Kapat"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* GÜNLÜK İLERLEME ÇUBUĞU / BİLGİ BANDI */}
        <div className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2 bg-[#032038]/90 border-b border-cyan-500/30 text-xs shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Bugün Ödev Yapanlar:
              <span className="text-emerald-300 font-black text-sm bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                {completedTodayCount} / {totalStudents}
              </span>
            </span>
            <span className="text-slate-400 text-[11px] hidden md:inline">
              ({completionPercentage}% Tamamlandı)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-amber-300/90 text-xs font-semibold hidden xs:inline">
              🌊 Toplam Büyüme: <strong className="text-amber-300 font-black">{totalHomeworksGiven} Ödev</strong>
            </span>
            {onOpenRosterModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRosterModal();
                }}
                className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200 underline cursor-pointer font-bold"
              >
                <UserPlus className="w-3 h-3" />
                Öğrenci Listesini Düzenle
              </button>
            )}
          </div>
        </div>

        {/* ANA AKVARYUM DÜNYASI (CANVAS / WATER VIEWPORT) */}
        {/* Kullanıcının istediği akvar.jpeg arka planı tam olarak kullanılır */}
        <div
          ref={aquariumRef}
          className="relative flex-1 w-full h-full overflow-hidden select-none cursor-default bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/akvar.jpeg')",
            backgroundColor: '#02182b'
          }}
        >
          {/* Su Işık Huzmeleri (Sun rays shining down through water) */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            <div className="absolute -top-10 left-1/4 w-32 h-[600px] bg-gradient-to-b from-cyan-200 via-sky-300/20 to-transparent rotate-12 blur-2xl" />
            <div className="absolute -top-10 left-2/4 w-44 h-[650px] bg-gradient-to-b from-cyan-100 via-teal-200/20 to-transparent -rotate-6 blur-2xl" />
            <div className="absolute -top-10 left-3/4 w-36 h-[600px] bg-gradient-to-b from-cyan-200 via-sky-300/20 to-transparent rotate-12 blur-2xl" />
          </div>

          {/* Yükselen Doğal Su Kabarcıkları */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[8, 20, 34, 46, 60, 74, 88].map((left, idx) => (
              <div
                key={idx}
                className="absolute rounded-full bg-white/30 border border-white/60 animate-pulse"
                style={{
                  width: `${6 + (idx % 3) * 4}px`,
                  height: `${6 + (idx % 3) * 4}px`,
                  left: `${left}%`,
                  bottom: `${(idx * 14) % 85}%`,
                  opacity: 0.45,
                  boxShadow: '0 0 8px rgba(255,255,255,0.6)'
                }}
              />
            ))}
          </div>

          {/* YÜZEN TÜM ÖĞRENCİ BALIKLARI */}
          {fishes.map((fish) => {
            const isCompletedToday = fish.lastCompletedDate === todayStr;
            const scale = calculateFishScale(fish.homeworkCount);
            const levelInfo = getFishLevelTitle(fish.homeworkCount);

            // Öğrencinin soyadını silip sadece ilk adını al
            const firstName = fish.name ? fish.name.trim().split(/\s+/)[0] : '';

            // Balık pixel genişliği (ödev sayısıyla birlikte organik büyür)
            const fishWidth = Math.min(145, Math.round(76 * scale));

            // Balığın orijinal PNG'sindeki doğal bakış yönü ('left' veya 'right')
            const nativeFacing = FISH_FACING_MAP[fish.imageSrc] || 'left';
            
            // fish.direction: 1 (sağa yüzüyor), -1 (sola yüzüyor)
            // Kesin yön düzeltmesi: Sağa yüzerken sağa, sola yüzerken sola baksın
            const scaleX = fish.direction === 1
              ? (nativeFacing === 'right' ? 1 : -1)
              : (nativeFacing === 'left' ? 1 : -1);

            return (
              <div
                key={fish.studentId}
                onClick={(e) => handleFishClick(fish, e)}
                className="absolute z-20 flex flex-col items-center cursor-pointer transition-transform duration-100 ease-out group"
                style={{
                  left: `${fish.x}%`,
                  top: `${fish.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Öğrenci İsim Kartuşu & Ödev Durumu */}
                <div
                  className={`relative z-30 mb-0.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black shadow-lg border flex items-center gap-1 whitespace-nowrap transition-all duration-200 group-hover:scale-110 select-none ${
                    isCompletedToday
                      ? 'bg-emerald-950/90 text-emerald-200 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)] ring-1 ring-emerald-300'
                      : 'bg-slate-950/85 text-slate-100 border-sky-400/50 hover:border-cyan-300'
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

                {/* Balık Gövdesi: Kullanıcının yüklediği public/blklar/*.png görseli */}
                <div
                  className={`relative flex items-center justify-center transition-all duration-300 select-none ${
                    fish.isHappy ? 'animate-bounce scale-110' : ''
                  }`}
                  style={{
                    width: `${fishWidth}px`,
                    // Kesin yön: Her balık yüzdüğü istikamete bakar
                    transform: `scaleX(${scaleX})`,
                    filter: isCompletedToday
                      ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8)) drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                      : 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.5)) drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                  }}
                >
                  <img
                    src={fish.imageSrc}
                    alt={fish.name}
                    className="w-full h-auto object-contain pointer-events-none select-none transition-transform duration-200 group-hover:scale-105"
                    loading="eager"
                  />

                  {/* Bugün tamamlandıysa parlayan altın yıldız rozeti */}
                  {isCompletedToday && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 border border-white text-[10px] flex items-center justify-center text-amber-950 font-black shadow-lg animate-pulse">
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
                    className="mt-1 px-1.5 py-0.5 rounded bg-red-600/85 hover:bg-red-600 text-white text-[9px] font-bold border border-red-400 flex items-center gap-0.5 cursor-pointer z-30 shadow-md"
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
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%] p-3.5 rounded-2xl bg-gradient-to-r from-[#0f2c4a] via-[#16426f] to-[#0f2c4a] border-2 border-cyan-400 text-white shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-in fade-in zoom-in-95 duration-200">
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
            <div className="absolute inset-y-0 right-0 w-full xs:w-80 sm:w-96 bg-[#041c33]/95 border-l-2 border-cyan-400/80 backdrop-blur-md z-40 p-4 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
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
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
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
