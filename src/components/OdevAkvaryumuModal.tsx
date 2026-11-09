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
  Minimize2,
  Cloud,
  CloudCheck,
  Plus,
  Minus
} from 'lucide-react';
import { User } from '../firebase';
import { Student } from '../types/student';
import { StudentHomeworkData } from '../types/homeworkAquarium';
import { deduplicateStudents } from '../utils/studentStore';
import {
  loadHomeworkData,
  saveHomeworkData,
  syncHomeworkWithStudents,
  completeHomeworkToday,
  adjustHomeworkPoints,
  undoTodayHomework,
  getTodayDateString,
  calculateFishScale,
  getFishLevelTitle
} from '../utils/homeworkStore';
import { getCutoutFishInfo, CUTOUT_FISH_SPECIES } from '../utils/cutoutFishData';

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
  speciesName: string;
  stageName: string;
  stageIndex: number;
  badge: string;
  neededForNext: number;
  nextStageName: string | null;
  animationDuration: string;
  animationDelay: string;
  isSquid: boolean;
}

// Akvaryumda yükselen hafif ve GPU dostu gerçekçi hava kabarcıkları (Kasmayı önlemek için 14 adet hafif baloncuk)
const BUBBLE_LIST = Array.from({ length: 14 }).map((_, idx) => {
  const size = 5 + (idx % 4) * 2.4;
  const left = 3 + ((idx * 7.1 + (idx % 3) * 4.3) % 94);
  const duration = 2.2 + (idx % 5) * 0.35;
  const delay = -((idx * 0.55) % 3.0);
  return { id: idx, size, left, duration, delay };
});

// Akıllı tahta CPU'sunu sıfıra indiren yüksek performanslı akıcı fizik nesnesi (Ref içinde saklanır)
interface FishPhysics {
  id: string;
  x: number; // 0 - 100 (%)
  y: number; // 0 - 100 (%)
  vx: number;
  vy: number;
  direction: 1 | -1;
  nativeFacing: 'left' | 'right';
  currentScaleX: number;
  pitch: number; // Su altında burun eğim açısı
  phase: number; // Sinüzoidal doğal salınım fazı
  speedBase: number;
  isSquid: boolean;
  lastScaleX: number; // DOM güncelleme optimizasyon önbelleği
  lastTilt: number; // DOM güncelleme optimizasyon önbelleği
}

interface OdevAkvaryumuModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialGrade?: number;
  onOpenRosterModal?: (grade?: number) => void;
  playMp3?: (src: string) => void;
  currentUser?: User | null;
  onTriggerCloudSync?: () => void;
}

export const OdevAkvaryumuModal: React.FC<OdevAkvaryumuModalProps> = ({
  isOpen,
  onClose,
  students,
  initialGrade = 4,
  onOpenRosterModal,
  playMp3,
  currentUser,
  onTriggerCloudSync
}) => {
  // Seçili Sınıf: 1, 2, 3 veya 4
  const [selectedGrade, setSelectedGrade] = useState<number>(initialGrade || 4);
  // Tam Ekran Yönetimi: Hem Tarayıcı (HTML5 Fullscreen API) hem de Kenardan Kenara Tam Ekran
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (playMp3) playMp3('/op.mp3');

    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    } else {
      const targetEl = modalContainerRef.current || document.documentElement;
      if (targetEl && targetEl.requestFullscreen) {
        targetEl.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    }
  };

  const handleClose = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    onClose();
  };

  // Modal her açıldığında gelen initialGrade'i seç
  useEffect(() => {
    if (isOpen && initialGrade) {
      setSelectedGrade(initialGrade);
    }
  }, [isOpen, initialGrade]);

  // Seçili sınıf seviyesindeki şubeler (örn: 2-A, 2-C)
  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    deduplicateStudents(students)
      .filter(s => s.grade === selectedGrade)
      .forEach(s => {
        const cls = (s.className || `${s.grade}-A`).trim().toUpperCase();
        if (cls) classes.add(cls);
      });
    return Array.from(classes).sort();
  }, [students, selectedGrade]);

  const [selectedClass, setSelectedClass] = useState<string>('2-C');

  // Sınıf seviyesi veya şubeler değiştiğinde uygun bir şubeyi seçili yap
  useEffect(() => {
    if (availableClasses.length > 0) {
      if (!availableClasses.includes(selectedClass)) {
        const defaultBranch = 
          availableClasses.find(c => c.includes('C')) || 
          availableClasses.find(c => c.includes('A')) || 
          availableClasses[0];
        setSelectedClass(defaultBranch);
      }
    }
  }, [availableClasses, selectedGrade, selectedClass]);

  // Seçili sınıftaki ve şubedeki öğrenciler (Farklı şubeler asla aynı akvaryumda karışmaz!)
  const currentGradeStudents = useMemo(() => {
    return deduplicateStudents(students).filter(s => {
      if (s.grade !== selectedGrade) return false;
      if (availableClasses.length > 1) {
        const sClass = (s.className || `${s.grade}-A`).trim().toUpperCase();
        return sClass === selectedClass;
      }
      return true;
    });
  }, [students, selectedGrade, selectedClass, availableClasses]);

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
  }, [isOpen, isFullscreen]);

  // Verileri yükle & senkronize et (Sadece modal açıldığında veya sınıf değiştiğinde 1 kez çalışır)
  useEffect(() => {
    if (!isOpen) return;
    const existing = loadHomeworkData(currentUser?.uid, currentUser?.email);
    const synced = syncHomeworkWithStudents(currentGradeStudents, existing);
    setHomeworkMap(synced);

    // Yalnızca yeni öğrenci eklenmişse kaydet
    const existingCount = Object.keys(existing).length;
    const syncedCount = Object.keys(synced).length;
    if (syncedCount > existingCount) {
      saveHomeworkData(synced, currentUser?.uid, currentUser?.email);
    }

    // Balık fizik durumlarını ref'e hazırla
    // ÖNEMLİ: Bu efekt, öğrenci listesi her güncellendiğinde (istatistik kaydı, bulut senkronu vb.)
    // yeniden çalışır. Mevcut balıkların konum/hız bilgisi KORUNUR; aksi halde balıklar
    // başlangıç noktalarına geri ışınlanır.
    const prevPhysicsById = new Map<string, FishPhysics>(
      fishesPhysicsRef.current.map(fp => [fp.id, fp] as [string, FishPhysics])
    );
    const physicsList: FishPhysics[] = [];

    // React render nesnelerini oluştur (Sadece ödev değiştiğinde re-render)
    const initialFishes: FishState[] = currentGradeStudents.map((st, i) => {
      const data: StudentHomeworkData = synced[st.id] || {
        studentId: st.id,
        studentName: st.name,
        homeworkCount: 0,
        lastCompletedDate: undefined,
        fishModelIndex: i,
        createdAt: new Date().toISOString()
      };

      // Eşit sayıda mevcut ve yeni balık dağıtımı için sınıf sıra indeksi (i) kullanılır:
      // Çift indeksler (0, 2, 4) mevcut cutouts, tek indeksler (1, 3, 5) yeni cutouts2 balıklarıdır
      const modelIndex = i;
      const cutout = getCutoutFishInfo(modelIndex, data.homeworkCount || 0, st.id || st.name);
      const isSquid = cutout.speciesId === 'murekkep_baligi';
      const imageSrc = cutout.imageSrc;
      const nativeFacing: 'left' = 'left';
      const fishWidth = cutout.calculatedWidth;

      // Akvaryumda dengeli başlangıç koordinatları
      const x = 12 + ((i * 21) % 72);
      const y = 18 + ((i * 17) % 60);
      const speedBase = isSquid
        ? 0.026 + (i % 3) * 0.005
        : 0.034 + (i % 5) * 0.006;
      const initialDir: 1 | -1 = (i % 2 === 0) ? 1 : -1;
      const vx = initialDir * speedBase;
      const vy = (i % 3 === 0 ? 1 : -1) * 0.010;
      const initialScaleX = initialDir === 1 ? -1 : 1; // Cutout görselleri doğal olarak sola bakar. Sağa giderken scaleX(-1) ile sağa çevrilir.

      const existingPhysics = prevPhysicsById.get(st.id);
      physicsList.push(existingPhysics || {
        id: st.id,
        x,
        y,
        vx,
        vy,
        direction: initialDir,
        nativeFacing,
        currentScaleX: initialScaleX,
        pitch: 0,
        phase: (i * 1.35) % (Math.PI * 2),
        speedBase,
        isSquid,
        lastScaleX: initialScaleX,
        lastTilt: 0,
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
        isHappy: false,
        speciesName: cutout.speciesName,
        stageName: cutout.stageName,
        stageIndex: cutout.stageIndex,
        badge: cutout.badge,
        neededForNext: cutout.neededForNext,
        nextStageName: cutout.nextStageName,
        animationDuration: isSquid ? `${3.2 + (i % 3) * 0.35}s` : `${1.75 + (i % 5) * 0.28}s`,
        animationDelay: `-${(i * 0.35) % 2}s`,
        isSquid
      };
    });

    fishesPhysicsRef.current = physicsList;
    setFishes(initialFishes);
  }, [isOpen, currentGradeStudents, selectedGrade]);

  // CANLI AKVARYUM FİZİĞİ - SIFIR REACT RERENDER, 100% GPU KOMPOZİTÖRÜ (translate3d)
  // Akıllı tahta optimizasyonu: ~31 FPS hedefli akıcı simülasyon, sıfır kasma, içiçe geçmeyi önleyen ayrılma fizikleri
  useEffect(() => {
    if (!isOpen) return;

    let lastTime = performance.now();
    let isRunning = true;
    const TARGET_INTERVAL = 32; // ~31.25 FPS - Tamamen akıcı, CPU ve GPU yükünü yarıya indirir

    const updatePhysics = (now: number) => {
      if (!isRunning) return;

      // Öğretmen düzenleme modunda balıkların koordinatını sabit tut.
      if (teacherMode) {
        lastTime = now;
        requestRef.current = requestAnimationFrame(updatePhysics);
        return;
      }

      const elapsed = now - lastTime;
      if (elapsed >= TARGET_INTERVAL) {
        // Zaman sapmasını telafi et
        lastTime = now - (elapsed % TARGET_INTERVAL);
        const dt = Math.min(elapsed, 50);
        const speedFactor = dt / 16.666; // Normalize edilmiş hız çarpanı

        const dims = aquariumDimsRef.current;
        const w = dims.w;
        const h = dims.h;
        const list = fishesPhysicsRef.current;
        const domMap = fishDomMap.current;
        const bodyMap = fishBodyDomMap.current;
        const count = list.length;

        // SERBEST VE ÖZGÜR BALIK YÜZÜŞÜ (Çakışma/itme olmadan, birbirinin içinden serbestçe geçerler)
        for (let i = 0; i < count; i++) {
          const f = list[i];

          // Kenar sınırlarından yumuşak dönüşler (Sol ve Sağ Duvarlar)
          if (f.x > 86 && f.vx > 0) {
            f.vx = -Math.abs(f.speedBase);
            f.direction = -1;
          } else if (f.x < 12 && f.vx < 0) {
            f.vx = Math.abs(f.speedBase);
            f.direction = 1;
          }

          // Üst ve Alt sınırlar (Yüzey ve Zemin)
          if (f.y > 80 && f.vy > 0) {
            f.vy = -Math.abs(f.vy);
          } else if (f.y < 16 && f.vy < 0) {
            f.vy = Math.abs(f.vy);
          } else {
            // Suyun içinde serbestçe yukarı-aşağı süzülme (Doğal dalgalanma)
            f.vy += Math.sin((now * 0.0009) + f.phase) * 0.00035 * speedFactor;
            const maxVy = f.speedBase * 0.45;
            f.vy = Math.max(-maxVy, Math.min(maxVy, f.vy));
          }

          // Koordinatları ilerlet
          f.x += f.vx * speedFactor;
          f.y += f.vy * speedFactor;

          // Sınır koruması
          f.x = Math.max(10, Math.min(88, f.x));
          f.y = Math.max(14, Math.min(82, f.y));

          // Doğrudan GPU translate3d (Sıfır reflow, sıfır repaint, sıfır kasma)
          const el = domMap.get(f.id);
          if (el) {
            const px = (f.x * w) / 100;
            const py = (f.y * h) / 100;
            el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }

          // Balığın yönü ve burun eğimi (Cutoutlar sola baktığı için sağa yüzerken scaleX(-1))
          const bodyEl = bodyMap.get(f.id);
          if (bodyEl) {
            // Su akışına göre hafif doğal burun eğimi (maks ±8 derece)
            const targetPitch = Math.max(-8, Math.min(8, (f.vy / (f.speedBase || 0.03)) * 6));
            f.pitch += (targetPitch - f.pitch) * 0.05 * speedFactor;

            f.currentScaleX = f.direction === 1 ? -1 : 1;
            const effectiveTilt = f.direction === 1 ? -f.pitch : f.pitch;
            if (f.currentScaleX !== f.lastScaleX || Math.abs(effectiveTilt - f.lastTilt) > 0.3) {
              f.lastScaleX = f.currentScaleX;
              f.lastTilt = effectiveTilt;
              bodyEl.style.transform = `scaleX(${f.currentScaleX}) rotate(${effectiveTilt.toFixed(1)}deg)`;
            }
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
  }, [isOpen, teacherMode]);

  // Balığa Tıklama - Günlük Ödev Onayı
  const handleFishClick = useCallback((fish: FishState, event: React.MouseEvent) => {
    event.stopPropagation();

    // Bugün zaten yapılmış mı kontrol et
    if (fish.lastCompletedDate === todayStr) {
      if (soundEnabled && playMp3) playMp3('/tek.mp3');

      setActivePopup({
        studentName: fish.name,
        message: fish.nextStageName
          ? `Bugünkü ödevini zaten tamamladın! Balığın yarın yeni ödevinle birlikte "${fish.nextStageName}" olmak için büyüyecek! 🌟`
          : `Bugünkü ödevini zaten tamamladın! Balığın akvaryumun en büyük aşamasında görkemle yüzüyor! 👑✨`,
        type: 'already',
        count: fish.homeworkCount,
        badge: fish.badge,
        title: `${fish.speciesName} • ${fish.stageName}`
      });
      return;
    }

    // Bugün ilk defa yapılıyorsa tamamla
    const res = completeHomeworkToday(fish.studentId, fish.name, 0, currentUser?.uid, currentUser?.email);
    if (res.success) {
      if (onTriggerCloudSync) {
        onTriggerCloudSync();
      }

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
          colors: ['#06b6d4', '#3b82f6', '#f59e0b', '#10b981', '#ec4899']
        });
      } catch {}

      // State güncelle (Tek bir kez re-render tetikler)
      const updated = loadHomeworkData(currentUser?.uid, currentUser?.email);
      setHomeworkMap(updated);

      const studentIdx = currentGradeStudents.findIndex(st => st.id === fish.studentId);
      const modelIndex = studentIdx >= 0 ? studentIdx : fishes.findIndex(item => item.studentId === fish.studentId);
      const newCutout = getCutoutFishInfo(modelIndex, res.newCount, fish.studentId || fish.name);
      const isEvolved = newCutout.stageIndex > fish.stageIndex;

      if (isEvolved && soundEnabled && playMp3) {
        setTimeout(() => playMp3('/alkis.mp3'), 500);
      }

      setFishes(prev =>
        prev.map(item => {
          if (item.studentId === fish.studentId) {
            return {
              ...item,
              homeworkCount: res.newCount,
              lastCompletedDate: todayStr,
              fishWidth: newCutout.calculatedWidth,
              imageSrc: newCutout.imageSrc,
              stageName: newCutout.stageName,
              stageIndex: newCutout.stageIndex,
              badge: newCutout.badge,
              neededForNext: newCutout.neededForNext,
              nextStageName: newCutout.nextStageName,
              isHappy: true,
              isSquid: newCutout.speciesId === 'murekkep_baligi'
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
        message: isEvolved
          ? `HARİKA! Balığın evrim geçirdi ve büyüdü: ${newCutout.stageName}! 🎉👑`
          : newCutout.nextStageName
          ? `Tebrikler! Bugünkü ödevini tamamladın ve balığın beslendi! ${newCutout.neededForNext} ödev sonra "${newCutout.nextStageName}" olacak! 🌟`
          : `Tebrikler! Bugünkü ödevini tamamladın! Balığın en büyük dev boyutuna ulaştı! 👑✨`,
        type: 'success',
        count: res.newCount,
        badge: newCutout.badge,
        title: `${newCutout.speciesName} • ${newCutout.stageName}`
      });
    }
  }, [todayStr, soundEnabled, playMp3, currentUser, onTriggerCloudSync, fishes]);

  // Öğretmen Modunda Bugünkü Ödevi Geri Alma
  const handleUndo = useCallback((studentId: string, studentName: string) => {
    const success = undoTodayHomework(studentId, currentUser?.uid, currentUser?.email);
    if (success) {
      if (onTriggerCloudSync) {
        onTriggerCloudSync();
      }
      if (soundEnabled && playMp3) playMp3('/hata.mp3');
      const updated = loadHomeworkData(currentUser?.uid, currentUser?.email);
      setHomeworkMap(updated);

      setFishes(prev =>
        prev.map(f => {
          if (f.studentId === studentId) {
            const nextCount = Math.max(0, f.homeworkCount - 1);
            const studentIdx = currentGradeStudents.findIndex(st => st.id === studentId);
            const modelIndex = studentIdx >= 0 ? studentIdx : prev.findIndex(item => item.studentId === studentId);
            const rolledCutout = getCutoutFishInfo(modelIndex, nextCount, f.studentId || f.name);
            return {
              ...f,
              homeworkCount: nextCount,
              fishWidth: rolledCutout.calculatedWidth,
              imageSrc: rolledCutout.imageSrc,
              stageName: rolledCutout.stageName,
              stageIndex: rolledCutout.stageIndex,
              badge: rolledCutout.badge,
              neededForNext: rolledCutout.neededForNext,
              nextStageName: rolledCutout.nextStageName,
              lastCompletedDate: undefined,
              isSquid: rolledCutout.speciesId === 'murekkep_baligi'
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
  }, [soundEnabled, playMp3, homeworkMap, currentUser, onTriggerCloudSync]);

  // Öğretmen düzenleme modunda balık puanını anında ve kalıcı olarak değiştir.
  const handleAdjustPoints = useCallback((fish: FishState, delta: number) => {
    const result = adjustHomeworkPoints(
      fish.studentId,
      delta,
      currentUser?.uid,
      currentUser?.email
    );
    if (!result.success) return;

    onTriggerCloudSync?.();
    const updated = loadHomeworkData(currentUser?.uid, currentUser?.email);
    setHomeworkMap(updated);

    const studentIdx = currentGradeStudents.findIndex(student => student.id === fish.studentId);
    const modelIndex = studentIdx >= 0 ? studentIdx : fishes.findIndex(item => item.studentId === fish.studentId);
    const updatedCutout = getCutoutFishInfo(modelIndex, result.newCount, fish.studentId || fish.name);
    setFishes(prev => prev.map(item => item.studentId === fish.studentId ? {
      ...item,
      homeworkCount: result.newCount,
      fishWidth: updatedCutout.calculatedWidth,
      imageSrc: updatedCutout.imageSrc,
      speciesName: updatedCutout.speciesName,
      stageName: updatedCutout.stageName,
      stageIndex: updatedCutout.stageIndex,
      badge: updatedCutout.badge,
      neededForNext: updatedCutout.neededForNext,
      nextStageName: updatedCutout.nextStageName,
      isSquid: updatedCutout.speciesId === 'murekkep_baligi'
    } : item));

    setActivePopup({
      studentName: fish.name,
      message: `Balık puanı ${delta > 0 ? 'artırıldı' : 'azaltıldı'} ve kaydedildi.`,
      type: 'info',
      count: result.newCount,
      badge: updatedCutout.badge,
      title: `${updatedCutout.speciesName} • ${updatedCutout.stageName}`
    });
  }, [currentUser, currentGradeStudents, fishes, onTriggerCloudSync]);

  // İstatistik hesaplamaları
  const totalStudents = fishes.length;
  const completedTodayCount = fishes.filter(f => f.lastCompletedDate === todayStr).length;
  const completionPercentage = totalStudents > 0 ? Math.round((completedTodayCount / totalStudents) * 100) : 0;
  const totalHomeworksGiven = fishes.reduce((sum, f) => sum + (f.homeworkCount || 0), 0);

  if (!isOpen) return null;

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-[1000] flex flex-col w-screen h-screen bg-[#02182b] select-none overflow-hidden p-0 m-0"
    >
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#02182b]">
        
        {/* ÜST BİLGİ VE KONTROL ÇUBUĞU */}
        <div className="relative z-30 flex items-center justify-between px-3 sm:px-6 py-2 bg-[#021424] border-b-2 border-cyan-400/50 shrink-0 gap-2">
          {/* SOL: İKON VE BAŞLIK */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-300 flex items-center justify-center text-base sm:text-xl shadow shrink-0">
              🐠
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-xs sm:text-sm md:text-base text-cyan-200 tracking-wide truncate">
                  {selectedGrade}. SINIF {availableClasses.length > 1 ? `(${selectedClass}) ` : ''}ÖDEV AKVARYUMU
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

          {/* ORTA: 1, 2, 3 VE 4. SINIF + ŞUBE SEÇİCİ SEKMELERİ */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Sınıf Seviyesi Seçici */}
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

            {/* Şube Seçici (Aynı sınıf seviyesinde birden fazla şube varsa - örn: 2-A ve 2-C asla karışmaz!) */}
            {availableClasses.length > 1 && (
              <div className="flex items-center gap-0.5 sm:gap-1 bg-amber-950/40 p-0.5 sm:p-1 rounded-xl border border-amber-500/50 shadow-inner shrink-0">
                <span className="text-[10px] font-black text-amber-300/90 px-1 hidden md:inline">
                  Şube:
                </span>
                {availableClasses.map((cls) => {
                  const isSelected = selectedClass === cls;
                  const count = students.filter(s => s.grade === selectedGrade && (s.className || `${s.grade}-A`).trim().toUpperCase() === cls).length;
                  return (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 shadow font-black scale-105'
                          : 'text-amber-200/80 hover:text-amber-100 hover:bg-amber-900/50'
                      }`}
                      title={`${cls} Şubesi (${count} Balık)`}
                    >
                      <span>{cls}</span>
                      <span className={`text-[9px] px-1 rounded-full ${isSelected ? 'bg-slate-900/30 text-slate-900 font-bold' : 'bg-amber-500/25 text-amber-300'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
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
              className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer shrink-0 active:scale-95 ${
                isFullscreen
                  ? 'bg-cyan-500/25 hover:bg-cyan-500/40 text-cyan-300 border-cyan-400/70 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title={isFullscreen ? 'Pencere Moduna Geç (Küçült)' : 'Tam Ekran Moduna Geç'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
            </button>

            {/* Bulut Durumu & Hızlı Eşitleme */}
            {currentUser && (
              <button
                onClick={() => {
                  if (onTriggerCloudSync) {
                    onTriggerCloudSync();
                    setActivePopup({
                      studentName: 'Bulut Yedekleme',
                      message: 'Akvaryum ve ödev verileriniz Google Cloud hesabınıza güvenle eşitlendi! ☁️',
                      type: 'info',
                      count: totalHomeworksGiven,
                      badge: '☁️',
                      title: 'Buluta Kaydedildi'
                    });
                  }
                }}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 text-[10px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95"
                title="Google Hesabınız bağlı. Ödevler bulutta korunur. Şimdi bulutu güncellemek için tıklayın."
              >
                <Cloud className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300 shrink-0" />
                <span className="hidden xl:inline text-[10px]">Bulut Korumalı</span>
              </button>
            )}

            {/* Kapat Butonu */}
            <button
              onClick={handleClose}
              className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-red-600 hover:bg-red-500 text-white font-black border border-red-400 transition-all cursor-pointer ml-0.5 shrink-0 shadow active:scale-95"
              title="Akvaryumu Kapat"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </button>
          </div>
        </div>

        {/* GÜNLÜK İLERLEME ÇUBUĞU / BİLGİ BANDI */}
        <div className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-1 sm:py-1.5 bg-[#032038] border-b border-cyan-500/30 text-xs shrink-0 flex-wrap gap-1 sm:gap-2">
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

        {/* CSS KEYFRAMES: AKICI BALIK DALGALANMASI, MÜREKKEP BALIĞI SİFON İTİŞİ VE YÜKSELEN BALONCUKLAR */}
        <style>{`
          /* Gerçekçi Balık Akıcı Yüzme Dalgası (Hafif ve GPU dostu) */
          @keyframes fishFluidSwim {
            0%, 100% {
              transform: rotate(0deg) translateY(0px);
            }
            50% {
              transform: rotate(2deg) translateY(-1.2px);
            }
          }

          /* Mürekkep Balığı (Kalamar) Sifon Kasılması ve Zarif İleri Süzülüşü */
          @keyframes squidJetSwim {
            0%, 100% {
              transform: scale(1, 1) rotate(0deg);
            }
            25% {
              transform: scale(1.025, 0.96) rotate(-1.2deg);
            }
            65% {
              transform: scale(0.975, 1.015) rotate(1deg);
            }
          }

          /* Mürekkep Balığı Biyolüminesans (Işıldama) Efekti */
          @keyframes squidBioPulse {
            0%, 100% {
              filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.45));
            }
            50% {
              filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.65)) drop-shadow(0 0 16px rgba(56, 189, 248, 0.45));
            }
          }

          @keyframes bubbleRise {
            0% {
              transform: translate3d(0, 0, 0) scale(0.65);
              opacity: 0;
            }
            10% {
              opacity: 0.85;
            }
            50% {
              transform: translate3d(-10px, -55vh, 0) scale(0.95);
            }
            85% {
              opacity: 0.7;
            }
            100% {
              transform: translate3d(6px, -115vh, 0) scale(1.15);
              opacity: 0;
            }
          }
        `}</style>

        {/* ANA AKVARYUM DÜNYASI (CANVAS / WATER VIEWPORT) */}
        <div
          id="odev-akvaryumu-container"
          ref={aquariumRef}
          className="relative flex-1 w-full min-h-0 overflow-hidden select-none cursor-default bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/akvaryum_arkaplan.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#041628'
          }}
        >
          {/* Su Işık Huzmeleri (Hafif doğal atmosfer) */}
          <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
            <div className="absolute -top-10 left-1/4 w-32 h-[600px] bg-gradient-to-b from-cyan-200/30 via-sky-300/10 to-transparent rotate-12" />
            <div className="absolute -top-10 left-2/4 w-44 h-[650px] bg-gradient-to-b from-cyan-100/25 via-teal-200/10 to-transparent -rotate-6" />
            <div className="absolute -top-10 left-3/4 w-36 h-[600px] bg-gradient-to-b from-cyan-200/30 via-sky-300/10 to-transparent rotate-12" />
          </div>

          {/* Yükselen Gerçekçi Su Baloncukları (Aşağıdan Yukarı Sürekli Yükselir - Hafif & GPU Dostu) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {BUBBLE_LIST.map((b) => (
              <div
                key={b.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${b.left}%`,
                  bottom: '-25px',
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.9) 0%, rgba(186, 230, 253, 0.35) 60%, rgba(255, 255, 255, 0.7) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.65)',
                  boxShadow: '0 0 4px rgba(255, 255, 255, 0.35)',
                  animation: `bubbleRise ${b.duration}s linear infinite`,
                  animationDelay: `${b.delay}s`,
                  willChange: 'transform'
                }}
              />
            ))}
          </div>

          {/* YÜZEN TÜM ÖĞRENCİ BALIKLARI (DOĞRUDAN GPU TRANSLATE3D İLE HAREKET EDER) */}
          {fishes.map((fish) => {
            const isCompletedToday = fish.lastCompletedDate === todayStr;
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
                  <span className="text-[9.5px]">{fish.badge}</span>
                  <span className="tracking-tight font-extrabold">{firstName}</span>
                  <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-black ${isCompletedToday ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-800 text-amber-300'}`}>
                    {fish.homeworkCount}
                  </span>
                  {isCompletedToday && (
                    <span className="text-emerald-400 font-black text-[9.5px]" title="Bugünkü ödev yapıldı!">
                      ✔
                    </span>
                  )}
                </div>

                {/* Balık / Mürekkep Balığı Gövdesi: Akıcı Dönüş Geçişi, Derinlik Gölgesi ve Işıldama */}
                <div
                  ref={(el) => {
                    if (el) {
                      fishBodyDomMap.current.set(fish.studentId, el);
                      const phys = fishesPhysicsRef.current.find(p => p.id === fish.studentId);
                      const targetScaleX = phys ? (phys.direction === 1 ? -1 : 1) : -1;
                      el.style.transform = `scaleX(${targetScaleX})`;
                    } else {
                      fishBodyDomMap.current.delete(fish.studentId);
                    }
                  }}
                  className={`relative flex items-center justify-center select-none ${
                    fish.isHappy && !teacherMode ? 'animate-bounce' : ''
                  }`}
                  style={{
                    width: `${fish.fishWidth}px`,
                    willChange: 'transform',
                    filter: isCompletedToday
                      ? 'drop-shadow(0 0 7px rgba(34, 197, 94, 0.85))'
                      : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45))'
                  }}
                >
                  {/* Gerçekçi Balık / Mürekkep Balığı Yüzme Animasyonu */}
                  <div
                    className="w-full h-full relative"
                    style={{
                      transformOrigin: fish.isSquid ? '42% 50%' : '22% 50%',
                      animation: teacherMode
                        ? 'none'
                        : fish.isSquid
                        ? `squidJetSwim ${fish.animationDuration} ease-in-out infinite, squidBioPulse 3.5s ease-in-out infinite`
                        : `fishFluidSwim ${fish.animationDuration} ease-in-out infinite`,
                      animationDelay: fish.animationDelay,
                      willChange: 'transform'
                    }}
                  >
                    <img
                      src={fish.imageSrc}
                      alt={fish.name}
                      className="w-full h-auto object-contain pointer-events-none select-none transition-all duration-300"
                      loading="eager"
                    />
                  </div>

                  {/* Bugün tamamlandıysa parlayan altın yıldız rozeti */}
                  {isCompletedToday && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border border-white text-[8px] flex items-center justify-center text-amber-950 font-black shadow">
                      ⭐
                    </div>
                  )}
                </div>

                {/* Öğretmen Modunda puan düzenleme ve bugünkü ödevi geri alma */}
                {teacherMode && (
                  <div
                    className="relative z-40 mt-1 flex items-center gap-1.5 rounded-xl border border-purple-300/50 bg-slate-950/95 p-1.5 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleAdjustPoints(fish, -1)}
                      disabled={fish.homeworkCount <= 0}
                      className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-rose-300 bg-rose-600 text-white shadow-md hover:bg-rose-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Balık puanını 1 azalt"
                      aria-label={`${fish.name} puanını 1 azalt`}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="min-w-[4rem] whitespace-nowrap text-center text-[10px] font-extrabold text-amber-200">
                      {fish.homeworkCount} puan
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustPoints(fish, 1)}
                      className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-emerald-300 bg-emerald-600 text-white shadow-md hover:bg-emerald-500 active:scale-95"
                      title="Balık puanını 1 artır"
                      aria-label={`${fish.name} puanını 1 artır`}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    {isCompletedToday && (
                      <button
                        type="button"
                        onClick={() => handleUndo(fish.studentId, fish.name)}
                        className="ml-0.5 flex h-11 shrink-0 touch-manipulation items-center gap-1 rounded-lg bg-red-600 px-2.5 text-[10px] font-bold text-white shadow-md hover:bg-red-500 active:scale-95"
                        title="Bugünkü ödevi geri al"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Geri Al
                      </button>
                    )}
                  </div>
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
                          <span className="text-sm shrink-0">{f.badge}</span>
                          <img
                            src={f.imageSrc}
                            alt=""
                            className="w-8 h-8 object-contain shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate">{f.name}</p>
                            <p className="text-[10px] text-sky-300 font-semibold truncate">{f.stageName}</p>
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