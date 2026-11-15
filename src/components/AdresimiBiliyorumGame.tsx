import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, Eraser, ArrowRight } from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { ActivityBackground } from './ActivityBackground';

/**
 * 2. SINIF HAYAT BİLGİSİ - ADRESİMİ BİLİYORUM (Sürükle Bırak)
 * Kaynak: 2. Sınıf 10. Hafta Defter Notları - "Adresimi Biliyorum" (Hayat Bilgisi / Konu 12)
 *
 * Bölüm 1 - Adres Kartı: Adres parçalarını doğru sıraya sürükle
 *   (1. Mahalle, 2. Cadde/Sokak, 3. Bina no/adı, 4. Kat, 5. Kapı/Daire no, 6. İlçe ve il)
 * Bölüm 2 - Adresimi Kime Veririm?: Tanımadığımız kişilere adres vermeyiz,
 *   güvenlik görevlileriyle paylaşabiliriz.
 */

type GameMode = 'adres' | 'paylas';

/* ------------------------------------------------------------------ */
/* VERİ                                                                */
/* ------------------------------------------------------------------ */

interface AddressSlotDef {
  id: string;
  no: number;
  label: string;
  icon: string;
  hint: string;
}

// PDF'teki sıralama: Mahalle - Cadde/Sokak - Bina - Kat - Kapı/Daire - İlçe ve il
const ADDRESS_SLOTS: AddressSlotDef[] = [
  { id: 'mahalle', no: 1, label: 'Mahalle adı', icon: '🏘️', hint: 'Adres, önce mahalle adı ile başlar.' },
  { id: 'cadde', no: 2, label: 'Cadde veya sokak adı', icon: '🛣️', hint: 'Mahalleden sonra cadde veya sokak adı yazılır.' },
  { id: 'bina', no: 3, label: 'Bina numarası veya adı', icon: '🏢', hint: 'Sonra bina numarası veya bina adı gelir.' },
  { id: 'kat', no: 4, label: 'Kat numarası', icon: '🪜', hint: 'Bina bilgisinden sonra kat numarası yazılır.' },
  { id: 'daire', no: 5, label: 'Kapı veya daire numarası', icon: '🚪', hint: 'Kattan sonra kapı veya daire numarası yazılır.' },
  { id: 'ilce', no: 6, label: 'İlçe ve il adı', icon: '🏙️', hint: 'En sona ilçe ve il adı yazılır.' },
];

interface AddressSet {
  id: string;
  values: Record<string, string>;
}

const ADDRESS_SETS: AddressSet[] = [
  {
    id: 'a1',
    values: { mahalle: 'Göksu Mahallesi', cadde: 'Bahar Caddesi', bina: 'No: 12', kat: 'Kat: 3', daire: 'Daire: 5', ilce: 'Çankaya / ANKARA' },
  },
  {
    id: 'a2',
    values: { mahalle: 'Çiçek Mahallesi', cadde: 'Gül Sokak', bina: 'Papatya Apartmanı', kat: 'Kat: 2', daire: 'Daire: 4', ilce: 'Bornova / İZMİR' },
  },
  {
    id: 'a3',
    values: { mahalle: 'Yıldız Mahallesi', cadde: 'Atatürk Caddesi', bina: 'No: 25', kat: 'Kat: 5', daire: 'Daire: 10', ilce: 'Kadıköy / İSTANBUL' },
  },
  {
    id: 'a4',
    values: { mahalle: 'Fidanlık Mahallesi', cadde: 'Lale Sokak', bina: 'Güneş Apartmanı', kat: 'Kat: 1', daire: 'Daire: 2', ilce: 'Melikgazi / KAYSERİ' },
  },
  {
    id: 'a5',
    values: { mahalle: 'Barış Mahallesi', cadde: 'Çınar Caddesi', bina: 'No: 7', kat: 'Kat: 4', daire: 'Daire: 8', ilce: 'Seyhan / ADANA' },
  },
  {
    id: 'a6',
    values: { mahalle: 'Cumhuriyet Mahallesi', cadde: 'Menekşe Sokak', bina: 'Umut Apartmanı', kat: 'Kat: 3', daire: 'Daire: 6', ilce: 'Osmangazi / BURSA' },
  },
];

interface ShareItem {
  id: string;
  emoji: string;
  label: string;
  canShare: boolean;
  explanation: string;
}

const SHARE_SETS: ShareItem[][] = [
  [
    { id: 's1-1', emoji: '👮', label: 'Güvenlik görevlisi', canShare: true, explanation: 'Güvenliğimiz için adresimizi güvenlik görevlileri ile paylaşabiliriz.' },
    { id: 's1-2', emoji: '🧑', label: 'Sokakta tanımadığım biri', canShare: false, explanation: 'Tanımadığımız insanlara adres bilgilerimizi vermemeliyiz.' },
    { id: 's1-3', emoji: '💻', label: 'İnternette tanıştığım yabancı', canShare: false, explanation: 'İnternette tanışıp hiç görmediğimiz kişilere adresimizi vermeyiz.' },
    { id: 's1-4', emoji: '🚓', label: 'Polis amca', canShare: true, explanation: 'Polis de bir güvenlik görevlisidir. Yardım gerekirse adresimizi söyleyebiliriz.' },
    { id: 's1-5', emoji: '🚪', label: 'Kapıya gelen tanımadığım kişi', canShare: false, explanation: 'Kapıya gelen tanımadığımız kişilere adresimizi söylemeyiz.' },
    { id: 's1-6', emoji: '👨‍👩‍👧', label: 'Annem ve babam', canShare: true, explanation: 'Ailemiz adresimizi bilir. Adresimizi ve aile bireylerinin telefon numaralarını biz de bilmeliyiz.' },
  ],
  [
    { id: 's2-1', emoji: '🛡️', label: 'Apartman güvenlik görevlisi', canShare: true, explanation: 'Güvenlik görevlileri ile adresimizi paylaşabiliriz.' },
    { id: 's2-2', emoji: '📱', label: 'Mesaj atan tanımadığım kişi', canShare: false, explanation: 'Tanımadığımız kişilerle adres bilgilerimizi paylaşmayız.' },
    { id: 's2-3', emoji: '🚓', label: 'Polis abla', canShare: true, explanation: 'Kaybolursak veya yardıma ihtiyacımız olursa polise adresimizi söyleyebiliriz.' },
    { id: 's2-4', emoji: '🚗', label: 'Arabasıyla beni çağıran yabancı', canShare: false, explanation: 'Yabancılara adres vermeyiz, onlarla da birlikte gitmeyiz.' },
    { id: 's2-5', emoji: '👵', label: 'Anneannem ve dedem', canShare: true, explanation: 'Ailemizin büyükleri adresimizi bilir, onlarla paylaşabiliriz.' },
    { id: 's2-6', emoji: '🎮', label: 'Oyunda tanıştığım yabancı', canShare: false, explanation: 'Oyunda tanıştığımız kişilere adresimizi vermeyiz.' },
  ],
  [
    { id: 's3-1', emoji: '🏬', label: 'Kaybolunca AVM güvenlik görevlisi', canShare: true, explanation: 'Kaybolduğumuzda güvenlik görevlisine adresimizi söyleyebiliriz.' },
    { id: 's3-2', emoji: '🎁', label: 'Bana hediye vermek isteyen yabancı', canShare: false, explanation: 'Hediye verse bile tanımadığımız kişiye adresimizi vermeyiz.' },
    { id: 's3-3', emoji: '👮', label: 'Yardım eden polis', canShare: true, explanation: 'Polis güvenliğimiz için çalışır, adresimizi ona söyleyebiliriz.' },
    { id: 's3-4', emoji: '📞', label: 'Telefonda arayan tanımadığım kişi', canShare: false, explanation: 'Telefonda tanımadığımız kişilere adres bilgisi vermeyiz.' },
    { id: 's3-5', emoji: '👨‍👩‍👦', label: 'Annem ve babam', canShare: true, explanation: 'Ailemiz adresimizi bilir, onlarla paylaşabiliriz.' },
    { id: 's3-6', emoji: '🛒', label: 'Sokakta anket yapan yabancı', canShare: false, explanation: 'Anket yapıyor demesi, adresimizi vermemizi gerektirmez.' },
  ],
];

const SHARE_ZONES = [
  { id: 'verebilir', title: 'Adresimi Verebilirim', emoji: '✅' },
  { id: 'vermemeli', title: 'Adresimi Vermemeliyim', emoji: '⛔' },
] as const;

/* ------------------------------------------------------------------ */
/* YARDIMCILAR                                                         */
/* ------------------------------------------------------------------ */

interface Chip {
  id: string;
  label: string;
  emoji?: string;
  correctTarget: string;
}

const buildChips = (mode: GameMode, setIdx: number): Chip[] => {
  if (mode === 'adres') {
    const set = ADDRESS_SETS[setIdx % ADDRESS_SETS.length];
    return ADDRESS_SLOTS.map((slot) => ({
      id: `${set.id}-${slot.id}`,
      label: set.values[slot.id],
      correctTarget: slot.id,
    }));
  }
  const items = SHARE_SETS[setIdx % SHARE_SETS.length];
  return items.map((it) => ({
    id: it.id,
    label: it.label,
    emoji: it.emoji,
    correctTarget: it.canShare ? 'verebilir' : 'vermemeli',
  }));
};

const shuffleChips = (chips: Chip[]): Chip[] => {
  const original = chips.map((c) => c.id).join('|');
  let result = [...chips];
  for (let attempt = 0; attempt < 6; attempt++) {
    result = [...chips];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    if (result.map((c) => c.id).join('|') !== original) break;
  }
  return result;
};

/* ------------------------------------------------------------------ */
/* BİLEŞEN                                                             */
/* ------------------------------------------------------------------ */

interface AdresimiBiliyorumGameProps {
  onClose?: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  playerCountMode?: 1 | 2 | 3;
  onSwitchPlayerCountMode?: (mode: 1 | 2 | 3) => void;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (id: string | null) => void;
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerPlayerIndex: number | null, playerCount: number) => void;
}

export const AdresimiBiliyorumGame: React.FC<AdresimiBiliyorumGameProps> = ({
  playMp3,
  students = [],
  selectedStudentId = null,
  selectedStudentIds,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted,
}) => {
  const [mode, setMode] = useState<GameMode>('adres');
  const [addrSetIdx, setAddrSetIdx] = useState<number>(0);
  const [shareSetIdx, setShareSetIdx] = useState<number>(0);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  // chipId -> hedef id (slot veya bölge). null = tepsi (henüz yerleştirilmedi)
  const [placement, setPlacement] = useState<Record<string, string | null>>({});
  const [results, setResults] = useState<Record<string, 'correct' | 'wrong' | null>>({});
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [allCorrect, setAllCorrect] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [selectedChipId, setSelectedChipId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);

  // Öğrenci seçimi (Noktalama Sürükle Bırak ile aynı yapı)
  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | null)[]>([
    selectedStudentIds?.[0] || selectedStudentId || null,
    selectedStudentIds?.[1] || null,
    selectedStudentIds?.[2] || null,
  ]);

  useEffect(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      setInternalSelectedIds([
        selectedStudentIds[0] || null,
        selectedStudentIds[1] || null,
        selectedStudentIds[2] || null,
      ]);
    } else if (selectedStudentId !== undefined) {
      setInternalSelectedIds((prev) => [selectedStudentId, prev[1] || null, prev[2] || null]);
    }
  }, [selectedStudentIds, selectedStudentId]);

  const effectiveSelectedStudentIds = useMemo(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) return selectedStudentIds;
    return internalSelectedIds;
  }, [selectedStudentIds, internalSelectedIds]);

  const triggerSound = useCallback(
    (src: string) => {
      if (playMp3) {
        try {
          playMp3(src);
        } catch {
          // ses hatası oyunu durdurmasın
        }
      }
    },
    [playMp3]
  );

  const activeStudentId = effectiveSelectedStudentIds[0] || selectedStudentId;
  const activeStudent = activeStudentId ? students.find((s) => s.id === activeStudentId) || null : null;

  const handleSelectStudentForPlayer = useCallback(
    (pIdx: number, studentId: string | null) => {
      setInternalSelectedIds((prev) => {
        const updated = [...prev];
        updated[pIdx] = studentId;
        return updated;
      });
      if (onSelectStudentForPlayer) {
        onSelectStudentForPlayer(pIdx, studentId);
      } else if (pIdx === 0 && onSelectStudent) {
        onSelectStudent(studentId);
      }
      triggerSound('/op.mp3');
    },
    [onSelectStudentForPlayer, onSelectStudent, triggerSound]
  );

  /* ---------------- Soru kümesi ---------------- */

  const currentSetIdx = mode === 'adres' ? addrSetIdx : shareSetIdx;
  const chips = useMemo(() => buildChips(mode, currentSetIdx), [mode, currentSetIdx]);
  // shuffleSeed değişince tepsi yeniden karışsın
  const trayOrder = useMemo(() => shuffleChips(chips), [chips, shuffleSeed]);
  const chipById = useMemo(() => {
    const map: Record<string, Chip> = {};
    chips.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [chips]);

  const resetBoard = useCallback(() => {
    setPlacement({});
    setResults({});
    setHasChecked(false);
    setAllCorrect(false);
    setActiveHint(null);
    setSelectedChipId(null);
  }, []);

  const handleSwitchMode = (next: GameMode) => {
    if (next === mode) return;
    setMode(next);
    resetBoard();
    setShuffleSeed((s) => s + 1);
    triggerSound('/op.mp3');
  };

  const handleNextSet = () => {
    if (mode === 'adres') {
      setAddrSetIdx((i) => (i + 1) % ADDRESS_SETS.length);
    } else {
      setShareSetIdx((i) => (i + 1) % SHARE_SETS.length);
    }
    resetBoard();
    setShuffleSeed((s) => s + 1);
    triggerSound('/op.mp3');
  };

  const handleClearAll = () => {
    resetBoard();
    triggerSound('/op.mp3');
  };

  /* ---------------- Sürükle bırak ---------------- */

  const [dragChipId, setDragChipId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [overTargetId, setOverTargetId] = useState<string | null>(null);

  const targetRefs = useRef<Record<string, HTMLElement | null>>({});
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragMovedRef = useRef<boolean>(false);

  const setTargetRef = (id: string) => (el: HTMLElement | null) => {
    targetRefs.current[id] = el;
  };

  // Parmak/fare altındaki hedefi bul (dokunmatik için +14px tolerans)
  const findTargetUnderPoint = useCallback((clientX: number, clientY: number): string | null => {
    const padding = 14;
    let best: string | null = null;
    let bestDist = Infinity;
    for (const [targetId, el] of Object.entries(targetRefs.current) as [string, HTMLElement | null][]) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        clientX >= rect.left - padding &&
        clientX <= rect.right + padding &&
        clientY >= rect.top - padding &&
        clientY <= rect.bottom + padding
      ) {
        const cx = (rect.left + rect.right) / 2;
        const cy = (rect.top + rect.bottom) / 2;
        const dist = Math.hypot(clientX - cx, clientY - cy);
        if (dist < bestDist) {
          bestDist = dist;
          best = targetId;
        }
      }
    }
    return best;
  }, []);

  const clearCheckState = useCallback(() => {
    setResults({});
    setHasChecked(false);
    setAllCorrect(false);
    setActiveHint(null);
  }, []);

  const placeChip = useCallback(
    (chipId: string, targetId: string) => {
      setPlacement((prev) => {
        const next = { ...prev };
        if (mode === 'adres') {
          // Adres kartında her kutuya tek parça: önceki parça tepsiye döner
          Object.keys(next).forEach((cid) => {
            if (cid !== chipId && next[cid] === targetId) next[cid] = null;
          });
        }
        next[chipId] = targetId;
        return next;
      });
      clearCheckState();
      triggerSound('/ding.mp3');
    },
    [mode, clearCheckState, triggerSound]
  );

  const returnChipToTray = useCallback(
    (chipId: string) => {
      setPlacement((prev) => ({ ...prev, [chipId]: null }));
      clearCheckState();
      triggerSound('/op.mp3');
    },
    [clearCheckState, triggerSound]
  );

  useEffect(() => {
    if (!dragChipId) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      setDragPos({ x: e.clientX, y: e.clientY });
      if (
        !dragMovedRef.current &&
        Math.hypot(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y) > 8
      ) {
        dragMovedRef.current = true;
      }
      setOverTargetId(findTargetUnderPoint(e.clientX, e.clientY));
    };

    const handlePointerUp = (e: PointerEvent) => {
      const moved = dragMovedRef.current;
      const hit = findTargetUnderPoint(e.clientX, e.clientY);
      const wasPlaced = placement[dragChipId] != null;

      if (moved) {
        if (hit) {
          placeChip(dragChipId, hit);
          setSelectedChipId(null);
        } else if (wasPlaced) {
          // Boşluğa bırakıldı: parça tepsiye geri döner
          returnChipToTray(dragChipId);
        }
      } else if (wasPlaced) {
        // Yerleşmiş parçaya kısa dokunuş: tepsiye geri al
        returnChipToTray(dragChipId);
      } else {
        // Tepsideki parçaya kısa dokunuş: seç / seçimi kaldır (dokun-yerleştir)
        setSelectedChipId((prev) => (prev === dragChipId ? null : dragChipId));
      }

      setDragChipId(null);
      setOverTargetId(null);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragChipId, placement, findTargetUnderPoint, placeChip, returnChipToTray]);

  const handleChipPointerDown = (e: React.PointerEvent<HTMLElement>, chipId: string) => {
    if (e.button === 2) return;
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragMovedRef.current = false;
    setDragPos({ x: e.clientX, y: e.clientY });
    setDragChipId(chipId);
  };

  const handleTargetTap = (targetId: string) => {
    if (!selectedChipId) return;
    placeChip(selectedChipId, targetId);
    setSelectedChipId(null);
  };

  /* ---------------- Kontrol ---------------- */

  const handleCheckAnswers = () => {
    if (allCorrect) return;

    const newResults: Record<string, 'correct' | 'wrong'> = {};
    let total = 0;
    let correctCount = 0;
    let emptyCount = 0;
    let firstHint: string | null = null;

    if (mode === 'adres') {
      for (const slot of ADDRESS_SLOTS) {
        total++;
        const occupant = chips.find((c) => placement[c.id] === slot.id);
        if (!occupant) {
          emptyCount++;
          newResults[slot.id] = 'wrong';
          if (!firstHint) firstHint = 'Boş kalan yerlere de uygun adres parçasını sürükleyip bırakalım.';
        } else if (occupant.correctTarget === slot.id) {
          correctCount++;
          newResults[slot.id] = 'correct';
        } else {
          newResults[slot.id] = 'wrong';
          if (!firstHint) firstHint = `${slot.no}. sıra: ${slot.hint}`;
        }
      }
    } else {
      const items = SHARE_SETS[shareSetIdx % SHARE_SETS.length];
      for (const chip of chips) {
        total++;
        const zone = placement[chip.id];
        if (!zone) {
          emptyCount++;
          newResults[chip.id] = 'wrong';
          if (!firstHint) firstHint = 'Bütün kartları iki kutudan birine sürükleyip bırakalım.';
        } else if (zone === chip.correctTarget) {
          correctCount++;
          newResults[chip.id] = 'correct';
        } else {
          newResults[chip.id] = 'wrong';
          if (!firstHint) {
            const item = items.find((it) => it.id === chip.id);
            firstHint = item ? item.explanation : null;
          }
        }
      }
    }

    setResults(newResults);
    setHasChecked(true);

    if (total > 0 && correctCount === total) {
      setAllCorrect(true);
      setActiveHint(null);
      setScore((prev) => prev + 50);
      triggerSound('/para.mp3');
      onQuestionAnswered?.(true, 0);
      onGameCompleted?.(0, 1);
      confetti({ particleCount: 95, spread: 75, origin: { y: 0.58 } });
    } else {
      setAllCorrect(false);
      setActiveHint(firstHint);
      triggerSound('/hata.mp3');
      if (emptyCount < total) {
        onQuestionAnswered?.(false, 0);
      }
    }
  };

  /* ---------------- Görünüm yardımcıları ---------------- */

  const trayChips = trayOrder.filter((c) => !placement[c.id]);
  const placedCount = chips.filter((c) => placement[c.id]).length;
  const dragChip = dragChipId ? chipById[dragChipId] : null;
  const currentAddress = mode === 'adres' ? ADDRESS_SETS[addrSetIdx % ADDRESS_SETS.length] : null;
  const addressSentence = currentAddress
    ? ADDRESS_SLOTS.map((s) => currentAddress.values[s.id]).join(', ')
    : '';

  const renderChip = (chip: Chip, status: 'correct' | 'wrong' | null | undefined, compact = false) => {
    const isSelected = selectedChipId === chip.id;
    const isDragged = dragChipId === chip.id;

    let tone =
      'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-900 border-amber-100 shadow-[0_4px_10px_rgba(0,0,0,0.45)]';
    if (status === 'correct') tone = 'bg-gradient-to-b from-emerald-300 to-emerald-500 text-slate-900 border-emerald-100';
    if (status === 'wrong') tone = 'bg-gradient-to-b from-rose-300 to-rose-500 text-slate-900 border-rose-100';

    return (
      <button
        key={chip.id}
        type="button"
        onPointerDown={(e) => handleChipPointerDown(e, chip.id)}
        className={`touch-none cursor-grab active:cursor-grabbing select-none flex items-center gap-1.5 rounded-xl border-2 font-black leading-tight transition-transform ${
          compact ? 'px-2 py-1 text-xs sm:text-sm' : 'px-3 py-2 text-sm sm:text-base md:text-lg'
        } ${tone} ${
          isSelected ? 'ring-4 ring-white scale-105 shadow-[0_0_22px_rgba(255,255,255,0.65)]' : 'hover:-translate-y-0.5'
        } ${isDragged ? 'opacity-40 scale-95' : ''}`}
      >
        {chip.emoji && <span className="text-xl sm:text-2xl leading-none">{chip.emoji}</span>}
        <span className="text-left">{chip.label}</span>
      </button>
    );
  };

  /* ---------------- Render ---------------- */

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white"
    >
      <ActivityBackground theme="doga" opacity={0.45} dimCenter={true} />

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2.5 flex flex-col gap-1.5 sm:gap-2 overflow-hidden min-h-0">
        {/* ÜST ŞERİT: BAŞLIK + BÖLÜM SEÇİCİ + PUAN */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 sm:py-2 rounded-2xl bg-[#0c162d]/95 border border-slate-700/80 shadow-lg shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {activeStudent && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-amber-500/15 border border-amber-400/60 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${activeStudent.avatarBg || 'from-amber-400 to-orange-500'} border border-amber-300 text-slate-950 font-black text-xs flex items-center justify-center shrink-0`}
                  title={activeStudent.name}
                >
                  {activeStudent.avatar}
                </div>
                <span className="text-xs font-black text-amber-200 max-w-[110px] truncate">{activeStudent.name}</span>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <h2 className="text-xs sm:text-sm md:text-base font-black tracking-wide text-amber-300 uppercase truncate">
                Adresimi Biliyorum (Sürükle Bırak)
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-300 truncate">
                {mode === 'adres'
                  ? 'Adres parçalarını sürükleyip adres kartındaki doğru yere bırakın.'
                  : 'Kartları sürükleyip doğru kutuya bırakın: adresimizi kime verebiliriz?'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
              <button
                type="button"
                onClick={() => handleSwitchMode('adres')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                  mode === 'adres' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                1. Adres Kartı
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('paylas')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                  mode === 'paylas' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                2. Kime Veririm?
              </button>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black text-amber-300 tabular-nums">
              {score} P
            </div>
          </div>
        </div>

        {/* ORTA ALAN */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-2">
          {mode === 'adres' ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 sm:gap-3">
              {/* ADRES KARTI */}
              <div className="lg:col-span-3 rounded-2xl border-4 border-rose-400/90 bg-gradient-to-b from-amber-50 to-orange-100 text-slate-800 shadow-2xl p-2.5 sm:p-3.5 flex flex-col gap-1.5 sm:gap-2">
                <div className="flex items-center justify-between border-b-2 border-dashed border-rose-300 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl">🏠</span>
                    <div className="leading-tight">
                      <div className="text-sm sm:text-base font-black text-rose-600 uppercase tracking-wide">Ev Adresi Kartı</div>
                      <div className="text-[10px] sm:text-xs font-bold text-slate-500">Adres, bu sıraya göre yazılır</div>
                    </div>
                  </div>
                  <span className="text-2xl sm:text-3xl">📍</span>
                </div>

                {ADDRESS_SLOTS.map((slot) => {
                  const occupant = chips.find((c) => placement[c.id] === slot.id);
                  const res = results[slot.id];
                  const isOver = overTargetId === slot.id;

                  let slotTone = 'border-dashed border-slate-400 bg-white/70';
                  if (res === 'correct') slotTone = 'border-solid border-emerald-500 bg-emerald-100';
                  else if (res === 'wrong') slotTone = 'border-solid border-rose-500 bg-rose-100';
                  else if (isOver) slotTone = 'border-solid border-amber-500 bg-amber-100 scale-[1.02]';
                  else if (selectedChipId) slotTone = 'border-dashed border-amber-500 bg-amber-50 animate-pulse';

                  return (
                    <div key={slot.id} className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500 text-white font-black text-sm sm:text-base flex items-center justify-center shrink-0 shadow">
                        {slot.no}
                      </div>
                      <div className="w-[38%] sm:w-[34%] shrink-0 flex items-center gap-1 text-[11px] sm:text-sm font-extrabold text-slate-700 leading-tight">
                        <span className="text-base sm:text-xl shrink-0">{slot.icon}</span>
                        <span>{slot.label}</span>
                      </div>
                      <div
                        ref={setTargetRef(slot.id)}
                        onClick={() => handleTargetTap(slot.id)}
                        className={`flex-1 min-h-[44px] sm:min-h-[52px] rounded-xl border-2 flex items-center justify-center px-1.5 py-1 transition-all ${slotTone}`}
                      >
                        {occupant ? (
                          renderChip(occupant, res, true)
                        ) : (
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 pointer-events-none">buraya bırak</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ADRES PARÇALARI TEPSİSİ */}
              <div className="lg:col-span-2 rounded-2xl border-2 border-sky-400/70 bg-[#0b1a33]/95 shadow-xl p-2.5 sm:p-3.5 flex flex-col gap-2">
                <div className="text-xs sm:text-sm font-black text-sky-300 uppercase tracking-wide">🧩 Adres Parçaları</div>
                <div className="flex flex-wrap gap-2 content-start min-h-[60px]">
                  {trayChips.length > 0 ? (
                    trayChips.map((chip) => renderChip(chip, null))
                  ) : (
                    <div className="text-xs sm:text-sm font-bold text-slate-400">
                      Bütün parçalar yerleşti. Şimdi KONTROL ET'e basabilirsin!
                    </div>
                  )}
                </div>
                <div className="mt-auto text-[11px] sm:text-xs font-semibold text-sky-200/80 border-t border-sky-500/30 pt-1.5">
                  📞 Evimizin adresini ve aile bireylerimizin telefon numaralarını bilmeliyiz.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* İKİ KUTU: VEREBİLİRİM / VERMEMELİYİM */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {SHARE_ZONES.map((zone) => {
                  const inZone = chips.filter((c) => placement[c.id] === zone.id);
                  const isOver = overTargetId === zone.id;
                  const isYes = zone.id === 'verebilir';
                  const base = isYes
                    ? 'border-emerald-400/80 bg-gradient-to-b from-emerald-950/90 to-[#071910]/95'
                    : 'border-rose-400/80 bg-gradient-to-b from-rose-950/90 to-[#1c0a10]/95';
                  return (
                    <div
                      key={zone.id}
                      ref={setTargetRef(zone.id)}
                      onClick={() => handleTargetTap(zone.id)}
                      className={`rounded-2xl border-4 p-2 sm:p-3 min-h-[150px] sm:min-h-[190px] flex flex-col gap-2 transition-all shadow-xl ${base} ${
                        isOver ? 'ring-4 ring-amber-300 scale-[1.01]' : selectedChipId ? 'ring-2 ring-amber-300/70 animate-pulse' : ''
                      }`}
                    >
                      <div className={`text-sm sm:text-lg font-black uppercase tracking-wide ${isYes ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {zone.emoji} {zone.title}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {inZone.length === 0 && (
                          <span className="text-[11px] sm:text-xs font-bold text-slate-400 pointer-events-none">
                            kartı buraya bırak
                          </span>
                        )}
                        {inZone.map((chip) => renderChip(chip, results[chip.id], true))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* KART TEPSİSİ */}
              <div className="rounded-2xl border-2 border-sky-400/70 bg-[#0b1a33]/95 shadow-xl p-2.5 sm:p-3.5 flex flex-col gap-2">
                <div className="text-xs sm:text-sm font-black text-sky-300 uppercase tracking-wide">🃏 Kartlar</div>
                <div className="flex flex-wrap gap-2 content-start min-h-[48px]">
                  {trayChips.length > 0 ? (
                    trayChips.map((chip) => renderChip(chip, null))
                  ) : (
                    <div className="text-xs sm:text-sm font-bold text-slate-400">
                      Bütün kartlar yerleşti. Şimdi KONTROL ET'e basabilirsin!
                    </div>
                  )}
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-sky-200/80 border-t border-sky-500/30 pt-1.5">
                  🔒 Tanımadığımız insanlara adres bilgilerimizi vermemeliyiz. Güvenliğimiz için adresimizi güvenlik görevlileri ile paylaşabiliriz.
                </div>
              </div>
            </div>
          )}

          {/* GERİ BİLDİRİM */}
          {allCorrect && (
            <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-900/80 px-3 py-2 sm:py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg animate-fade-in">
              <div className="text-xs sm:text-sm font-bold text-emerald-100">
                <span className="font-black text-emerald-300">🎉 Harika! </span>
                {mode === 'adres' ? (
                  <>
                    Adresi doğru sıraladın:{' '}
                    <span className="font-black text-white">{addressSentence}</span>
                  </>
                ) : (
                  <>Adresimizi kime verip kime vermeyeceğimizi çok iyi ayırt ettin!</>
                )}
              </div>
              <button
                type="button"
                onClick={handleNextSet}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm border-2 border-amber-100 shadow cursor-pointer active:scale-95 transition"
              >
                {mode === 'adres' ? 'Sıradaki Adres' : 'Sıradaki Kartlar'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {!allCorrect && hasChecked && activeHint && (
            <div className="rounded-2xl border-2 border-rose-400/80 bg-rose-950/80 px-3 py-2 text-xs sm:text-sm font-bold text-rose-100 shadow-lg animate-fade-in">
              💡 {activeHint}
            </div>
          )}
        </div>

        {/* ALT KONTROL ÇUBUĞU */}
        <div className="shrink-0 rounded-2xl bg-[#0b1326]/95 border-2 border-slate-700/90 px-2.5 sm:px-4 py-2 shadow-2xl flex items-center justify-between gap-2">
          <div className="hidden sm:flex items-center px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 tabular-nums">
            {placedCount}/{chips.length} Yerleştirildi
          </div>

          <div className="flex items-center justify-center gap-2 w-full sm:w-auto sm:ml-auto">
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs sm:text-sm cursor-pointer active:scale-95 transition"
              title="Tüm parçaları geri al"
            >
              <Eraser className="w-4 h-4" />
              <span>Temizle</span>
            </button>

            <button
              type="button"
              onClick={handleNextSet}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-500/60 font-bold text-xs sm:text-sm cursor-pointer active:scale-95 transition"
              title={mode === 'adres' ? 'Farklı bir adres getir' : 'Farklı kartlar getir'}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden xs:inline">{mode === 'adres' ? 'Yeni Adres' : 'Yeni Kartlar'}</span>
            </button>

            <button
              type="button"
              onClick={handleCheckAnswers}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border-2 border-emerald-200 font-black text-xs sm:text-sm cursor-pointer active:scale-95 shadow-lg transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>KONTROL ET</span>
            </button>
          </div>
        </div>
      </main>

      {/* ÖĞRENCİ LİSTESİ DOCK */}
      <div className="relative z-20 shrink-0 pb-1 max-w-6xl w-full mx-auto">
        <StudentAvatarDock
          students={students}
          currentGrade={2}
          playerCount={1}
          selectedStudentIds={effectiveSelectedStudentIds}
          onSelectStudentForPlayer={handleSelectStudentForPlayer}
          onOpenRosterModal={onOpenRosterModal || (() => {})}
          playMp3={playMp3}
        />
      </div>

      {/* SÜRÜKLENEN PARÇA */}
      {dragChip && dragMovedRef.current && (
        <div
          style={{ left: dragPos.x, top: dragPos.y, transform: 'translate(-50%, -50%)' }}
          className="fixed z-[500] pointer-events-none flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-amber-100 text-slate-900 font-black text-sm sm:text-lg shadow-[0_8px_24px_rgba(0,0,0,0.6)] rotate-2 scale-110"
        >
          {dragChip.emoji && <span className="text-xl sm:text-2xl leading-none">{dragChip.emoji}</span>}
          <span>{dragChip.label}</span>
        </div>
      )}
    </div>
  );
};
