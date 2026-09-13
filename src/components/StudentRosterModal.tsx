import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  FileText,
  Download,
  Trash2,
  Edit2,
  Check,
  Search,
  Trophy,
  CheckCircle2,
  XCircle,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import { Student } from '../types/student';
import {
  AVATAR_OPTIONS,
  saveStudents,
  importStudentsFromText,
  resetAllStudentStats,
  resetSingleStudentStat,
  exportStudentsToCSV,
  clearAllStudents,
  clearStudentsForGrade,
  restoreDefaultStudents,
  restoreDefaultStudentsForGrade
} from '../utils/studentStore';

interface StudentRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToStats?: (grade?: number) => void;
  students: Student[];
  onStudentsUpdated: (updated: Student[]) => void;
  currentGrade?: number | null; // 1, 2, 3, or 4
  playMp3?: (src: string) => void;
}

export const StudentRosterModal: React.FC<StudentRosterModalProps> = ({
  isOpen,
  onClose,
  onBackToStats,
  students,
  onStudentsUpdated,
  currentGrade = 2,
  playMp3
}) => {
  // Sınıf seviyesi sekmesi (1, 2, 3, 4 veya 'ALL' - Varsayılan: Aktif oyunun sınıfı)
  const [activeGradeTab, setActiveGradeTab] = useState<number | 'ALL'>(() => {
    return (currentGrade && [1, 2, 3, 4].includes(currentGrade)) ? currentGrade : 2;
  });

  // Modal her açıldığında mevcut oyunun veya istatistiklerin sınıfını seçili yap
  useEffect(() => {
    if (isOpen && currentGrade && [1, 2, 3, 4].includes(currentGrade)) {
      setActiveGradeTab(currentGrade);
      setImportTargetGrade(currentGrade);
      setNewStudentGrade(currentGrade);
      setExpandedStudentId(null);
    }
  }, [isOpen, currentGrade]);

  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [showImportBox, setShowImportBox] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [importTargetGrade, setImportTargetGrade] = useState<number>(() => {
    return (currentGrade && [1, 2, 3, 4].includes(currentGrade)) ? currentGrade : 2;
  });
  const [importClassName, setImportClassName] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  
  // Tekli ekleme durumu
  const [showAddSingle, setShowAddSingle] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState<number>(2);
  const [newStudentClass, setNewStudentClass] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(AVATAR_OPTIONS[0].id);

  // Düzenleme durumu
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingGrade, setEditingGrade] = useState<number>(2);
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);
  const [editingClassName, setEditingClassName] = useState('');

  // Konu detayları açma
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Onay pencereleri
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [confirmClearGrade, setConfirmClearGrade] = useState(false);
  const [confirmRestoreGrade, setConfirmRestoreGrade] = useState(false);

  // Toplu içe aktarma açıldığında hedef sınıfı aktif sekmeyle eşitle
  useEffect(() => {
    if (activeGradeTab !== 'ALL') {
      setImportTargetGrade(activeGradeTab);
      setNewStudentGrade(activeGradeTab);
    }
  }, [activeGradeTab]);

  if (!isOpen) return null;

  // Seçili sekmeye göre öğrencileri filtrele
  const gradeStudents = activeGradeTab === 'ALL'
    ? students
    : students.filter(s => s.grade === activeGradeTab);

  // Filtreleme için mevcut şubeleri ayıkla
  const existingBranches = Array.from(
    new Set(gradeStudents.map(s => s.className).filter(Boolean) as string[])
  );

  // Arama ve şube filtresi uygulanmış liste
  const filteredStudents = gradeStudents.filter(s => {
    const matchesSearch = s.name.toLocaleLowerCase('tr').includes(searchTerm.trim().toLocaleLowerCase('tr'));
    const matchesBranch = classFilter === 'ALL' || s.className === classFilter;
    return matchesSearch && matchesBranch;
  });

  // Seçili sekmenin istatistikleri
  const totalCorrect = gradeStudents.reduce((acc, s) => acc + s.totalCorrect, 0);
  const totalWrong = gradeStudents.reduce((acc, s) => acc + s.totalWrong, 0);
  const totalAnswers = totalCorrect + totalWrong;
  const successRate = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  // Toplu içe aktarma işlemi
  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    playMp3?.('/op.mp3');
    const isReplace = importMode === 'replace';
    const targetGrade = importTargetGrade;
    const targetBranch = importClassName.trim() || `${targetGrade}-A`;

    const updated = importStudentsFromText(
      importText,
      students,
      isReplace,
      targetGrade,
      targetBranch
    );

    saveStudents(updated);
    onStudentsUpdated(updated);
    setImportText('');
    setShowImportBox(false);

    const gradeCount = updated.filter(s => s.grade === targetGrade).length;
    setSuccessNotice(
      isReplace
        ? `✅ ${targetGrade}. Sınıf için ${gradeCount} öğrenci başarıyla kaydedildi! (Diğer sınıflar korundu)`
        : `✅ ${targetGrade}. Sınıfa yeni öğrenciler eklendi! (Toplam: ${gradeCount} öğrenci)`
    );
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  // Tek öğrenci ekleme
  const handleAddSingleStudent = () => {
    if (!newStudentName.trim()) return;
    playMp3?.('/op.mp3');
    const avatarOpt = AVATAR_OPTIONS.find(a => a.id === selectedAvatarId) || AVATAR_OPTIONS[0];
    const targetGrade = newStudentGrade;
    const targetClass = newStudentClass.trim() || `${targetGrade}-A`;

    const newStd: Student = {
      id: `std_g${targetGrade}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newStudentName.trim(),
      avatar: avatarOpt.emoji,
      avatarBg: avatarOpt.bg,
      grade: targetGrade,
      className: targetClass,
      totalCorrect: 0,
      totalWrong: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      topicStats: {},
      createdAt: new Date().toISOString()
    };

    const updated = [...students, newStd];
    saveStudents(updated);
    onStudentsUpdated(updated);
    setNewStudentName('');
    setShowAddSingle(false);
    setSuccessNotice(`✅ "${newStd.name}" (${newStd.grade}. Sınıf) kalıcı olarak eklendi.`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Öğrenci düzenleme kaydı
  const handleSaveEdit = (studentId: string) => {
    if (!editingName.trim()) return;
    playMp3?.('/op.mp3');
    const updated = students.map(s => {
      if (s.id !== studentId) return s;
      const avatarOpt = AVATAR_OPTIONS.find(a => a.id === editingAvatarId);
      return {
        ...s,
        name: editingName.trim(),
        grade: editingGrade,
        avatar: avatarOpt ? avatarOpt.emoji : s.avatar,
        avatarBg: avatarOpt ? avatarOpt.bg : s.avatarBg,
        className: editingClassName.trim() || `${editingGrade}-A`
      };
    });
    saveStudents(updated);
    onStudentsUpdated(updated);
    setEditingStudentId(null);
    setEditingAvatarId(null);
    setEditingClassName('');
    setSuccessNotice('✅ Öğrenci bilgileri güncellendi.');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Tek öğrenci silme
  const handleDeleteStudent = (studentId: string) => {
    playMp3?.('/op.mp3');
    const updated = students.filter(s => s.id !== studentId);
    saveStudents(updated);
    onStudentsUpdated(updated);
  };

  // Seçili sınıfı temizleme (Diğer sınıflara dokunmaz)
  const handleClearGrade = () => {
    playMp3?.('/op.mp3');
    let updated: Student[] = [];
    if (activeGradeTab === 'ALL') {
      updated = clearAllStudents();
      setSuccessNotice('🧹 Tüm sınıfların listesi temizlendi.');
    } else {
      updated = clearStudentsForGrade(activeGradeTab, students);
      setSuccessNotice(`🧹 ${activeGradeTab}. Sınıf listesi temizlendi. Diğer sınıflarınız korundu.`);
    }
    onStudentsUpdated(updated);
    setConfirmClearGrade(false);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  // Seçili sınıfa örnek öğrencileri geri yükleme
  const handleRestoreGrade = () => {
    playMp3?.('/op.mp3');
    let updated: Student[] = [];
    if (activeGradeTab === 'ALL') {
      updated = restoreDefaultStudents();
      setSuccessNotice('🦁 Tüm sınıflara örnek öğrenci listeleri geri yüklendi.');
    } else {
      updated = restoreDefaultStudentsForGrade(activeGradeTab, students);
      setSuccessNotice(`🦁 ${activeGradeTab}. Sınıf için örnek öğrenciler geri yüklendi.`);
    }
    onStudentsUpdated(updated);
    setConfirmRestoreGrade(false);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Tek öğrenci istatistik sıfırlama
  const handleResetSingle = (studentId: string) => {
    playMp3?.('/op.mp3');
    const updated = resetSingleStudentStat(studentId);
    onStudentsUpdated(updated);
  };

  // Tüm skorları sıfırlama
  const handleResetAll = () => {
    playMp3?.('/op.mp3');
    const updated = resetAllStudentStats();
    onStudentsUpdated(updated);
    setConfirmResetAll(false);
    setSuccessNotice('🔄 Tüm öğrencilerin doğru-yanlış puanları sıfırlandı.');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // CSV İndirme
  const handleDownloadCSV = () => {
    playMp3?.('/op.mp3');
    const listToExport = activeGradeTab === 'ALL'
      ? students
      : students.filter(s => s.grade === activeGradeTab);
    const csvContent = exportStudentsToCSV(listToExport);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileNameSuffix = activeGradeTab === 'ALL' ? 'tum_siniflar' : `${activeGradeTab}_sinif`;
    link.setAttribute('download', `ogrenci_istatistikleri_${fileNameSuffix}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sınıf seviyesi renk şeması
  const gradeColors: Record<number, { bg: string; text: string; border: string }> = {
    1: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-400/40' },
    2: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-400/40' },
    3: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-400/40' },
    4: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-400/40' }
  };

  return (
    <div className="fixed inset-0 bg-[#070b19]/90 backdrop-blur-xl z-[400] flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="relative bg-gradient-to-b from-[#131d36] via-[#0f172a] to-[#090e1c] text-white rounded-[24px] sm:rounded-[32px] border-2 border-indigo-500/50 shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-w-4xl w-full h-[92vh] max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-[#17254a] via-[#203264] to-[#17254a] border-b border-indigo-500/30 shrink-0 flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {onBackToStats && (
              <button
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  onBackToStats(typeof activeGradeTab === 'number' ? activeGradeTab : (currentGrade || 2));
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition-all active:scale-95 cursor-pointer border border-purple-300/50 shadow flex items-center gap-1.5 shrink-0 ring-1 ring-purple-400/40"
                title="İstatistikler Üst Menüsüne Dön"
              >
                <ArrowLeft size={16} />
                <span>Üst Menü</span>
              </button>
            )}

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-300 flex items-center justify-center text-lg sm:text-xl shadow shrink-0">
              🎓
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2 truncate">
                  <span>Sınıf Listeleri & Öğrenci Takibi</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                  <span>💾</span>
                  <span>Kalıcı Kayıtlı</span>
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/80 truncate">
                Her sınıfın (1, 2, 3, 4. Sınıf) öğrenci listesi bağımsız olarak tutulur ve kaydedilir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onBackToStats && (
              <button
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  onBackToStats(typeof activeGradeTab === 'number' ? activeGradeTab : (currentGrade || 2));
                }}
                className="hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 hover:text-white font-black text-xs transition-all active:scale-95 cursor-pointer border border-indigo-400/40 shadow items-center gap-1.5"
                title="İstatistikler Üst Menüsüne Dön"
              >
                <ArrowLeft size={14} />
                <span>İstatistik Menüsü</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer border border-white/20 shrink-0"
              title="Kapat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PROMINENT GRADE SELECTION TABS (1. SINIF | 2. SINIF | 3. SINIF | 4. SINIF | TÜM SINIFLAR) */}
        <div className="px-3 sm:px-5 py-2 bg-slate-950/90 border-b border-indigo-500/20 flex items-center justify-between gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] sm:text-xs font-black text-amber-300/90 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <GraduationCap size={14} className="text-amber-400" />
              <span>Sınıf Seçin:</span>
            </span>

            {[1, 2, 3, 4].map(g => {
              const isSelected = activeGradeTab === g;
              const count = students.filter(s => s.grade === g).length;
              const gCol = gradeColors[g];

              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    playMp3?.('/op.mp3');
                    setActiveGradeTab(g);
                    setClassFilter('ALL');
                    setShowImportBox(false);
                    setShowAddSingle(false);
                  }}
                  className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? `bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-300 shadow-md scale-105 ring-2 ring-indigo-400/50`
                      : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
                  }`}
                  title={`${g}. Sınıf Öğrenci Listesini Göster`}
                >
                  <span>{g}. Sınıf</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-white/25 text-white' : `${gCol.bg} ${gCol.text}`
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ALL GRADES TAB */}
          <button
            type="button"
            onClick={() => {
              playMp3?.('/op.mp3');
              setActiveGradeTab('ALL');
              setClassFilter('ALL');
              setShowImportBox(false);
              setShowAddSingle(false);
            }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 cursor-pointer border shrink-0 ${
              activeGradeTab === 'ALL'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-300 shadow-md ring-2 ring-purple-400/50'
                : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800'
            }`}
            title="Tüm sınıfları genel görünümde göster"
          >
            <span>Tüm Sınıflar</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeGradeTab === 'ALL' ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {students.length}
            </span>
          </button>
        </div>

        {/* SUCCESS NOTIFICATION TOAST BANNER */}
        {successNotice && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-4 py-2 text-xs font-bold text-emerald-200 flex items-center justify-between animate-fadeIn shrink-0">
            <span className="flex items-center gap-2">
              <span>{successNotice}</span>
            </span>
            <button
              type="button"
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-300 hover:text-white p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* TOP STATS CARDS & CONTROLS TOOLBAR */}
        <div className="px-3 sm:px-5 py-2 border-b border-slate-800 bg-[#0a1020]/90 shrink-0 flex flex-col gap-2">
          {/* QUICK CLASS STATS TILES */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
            <div className="bg-slate-900/90 border border-indigo-500/40 rounded-xl p-1.5 sm:p-2 text-center shadow-xs">
              <div className="text-[10px] font-bold text-indigo-300 uppercase truncate">
                {activeGradeTab === 'ALL' ? 'Tüm Öğrenciler' : `${activeGradeTab}. Sınıf Mevcudu`}
              </div>
              <div className="text-base sm:text-xl font-black text-white">{gradeStudents.length}</div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-1.5 sm:p-2 text-center shadow-xs">
              <div className="text-[10px] font-bold text-emerald-300 uppercase truncate">Toplam Doğru</div>
              <div className="text-base sm:text-xl font-black text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 size={14} />
                <span>{totalCorrect}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-rose-500/40 rounded-xl p-1.5 sm:p-2 text-center shadow-xs">
              <div className="text-[10px] font-bold text-rose-300 uppercase truncate">Toplam Yanlış</div>
              <div className="text-base sm:text-xl font-black text-rose-400 flex items-center justify-center gap-1">
                <XCircle size={14} />
                <span>{totalWrong}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-1.5 sm:p-2 text-center shadow-xs">
              <div className="text-[10px] font-bold text-amber-300 uppercase truncate">Başarı Oranı</div>
              <div className="text-base sm:text-xl font-black text-amber-300">
                %{successRate}
              </div>
            </div>
          </div>

          {/* BRANCH FILTER TABS (IF MULTIPLE BRANCHES EXIST IN THIS GRADE) */}
          {existingBranches.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Şube:</span>
              <button
                type="button"
                onClick={() => setClassFilter('ALL')}
                className={`px-2 py-0.5 rounded-lg font-bold text-[10px] sm:text-[11px] transition shrink-0 ${
                  classFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Tümü ({gradeStudents.length})
              </button>
              {existingBranches.map(cls => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setClassFilter(cls)}
                  className={`px-2 py-0.5 rounded-lg font-bold text-[10px] sm:text-[11px] transition shrink-0 ${
                    classFilter === cls
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cls} ({gradeStudents.filter(s => s.className === cls).length})
                </button>
              ))}
            </div>
          )}

          {/* ACTION BUTTONS & SEARCH BAR */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
            {/* SEARCH */}
            <div className="relative flex-1 min-w-[130px] max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Öğrenci ara..."
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex items-center gap-1.5 flex-wrap ml-auto">
              <button
                type="button"
                onClick={() => {
                  setShowImportBox(!showImportBox);
                  setShowAddSingle(false);
                }}
                className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer active:scale-95 shadow"
              >
                <FileText size={13} />
                <span>Toplu Liste Yapıştır</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddSingle(!showAddSingle);
                  setShowImportBox(false);
                }}
                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer active:scale-95 shadow"
              >
                <UserPlus size={13} />
                <span>Tek Ekle</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer active:scale-95"
                title="İstatistikleri CSV olarak indir"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Excel/CSV İndir</span>
              </button>

              {/* CLEAR GRADE ROSTER BUTTON */}
              {confirmClearGrade ? (
                <div className="flex items-center gap-1 bg-rose-950 border border-rose-600 rounded-xl px-2 py-0.5 animate-pulse">
                  <span className="text-[10px] font-bold text-rose-200">
                    {activeGradeTab === 'ALL' ? 'Tüm sınıflar silinsin mi?' : `${activeGradeTab}. Sınıf silinsin mi?`}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearGrade}
                    className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px]"
                  >
                    Evet, Sil
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearGrade(false)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                  >
                    İptal
                  </button>
                </div>
              ) : gradeStudents.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearGrade(true)}
                  className="px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 text-slate-400 font-bold text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer"
                  title={activeGradeTab === 'ALL' ? 'Tüm sınıf listelerini temizle' : `Sadece ${activeGradeTab}. Sınıf listesini temizle`}
                >
                  <Trash2 size={12} />
                  <span className="hidden md:inline">
                    {activeGradeTab === 'ALL' ? 'Listeyi Temizle' : `${activeGradeTab}. Sınıfı Temizle`}
                  </span>
                </button>
              ) : null}

              {/* RESTORE DEMO BUTTON FOR THIS GRADE */}
              {confirmRestoreGrade ? (
                <div className="flex items-center gap-1 bg-amber-950 border border-amber-600 rounded-xl px-2 py-0.5 animate-pulse">
                  <span className="text-[10px] font-bold text-amber-200">
                    {activeGradeTab === 'ALL' ? 'Örnek sınıflar yüklensin mi?' : `${activeGradeTab}. Sınıf örnekleri yüklensin mi?`}
                  </span>
                  <button
                    type="button"
                    onClick={handleRestoreGrade}
                    className="px-1.5 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px]"
                  >
                    Yükle
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRestoreGrade(false)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                  >
                    İptal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRestoreGrade(true)}
                  className="px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer"
                  title="Örnek hayvan avatarlı öğrencileri yükle"
                >
                  <Sparkles size={12} />
                  <span className="hidden md:inline">Örnek Sınıf</span>
                </button>
              )}

              {/* RESET ALL STATS CONFIRMATION */}
              {confirmResetAll ? (
                <div className="flex items-center gap-1 bg-rose-950 border border-rose-600 rounded-xl px-2 py-0.5 animate-pulse">
                  <span className="text-[10px] font-bold text-rose-200">Skorlar sıfırlansın mı?</span>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px]"
                  >
                    Evet
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetAll(false)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                  >
                    İptal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmResetAll(true)}
                  className="px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer"
                  title="Tüm sınıfın skorlarını sıfırla"
                >
                  <BarChart2 size={12} />
                  <span className="hidden lg:inline">Skorları Sıfırla</span>
                </button>
              )}
            </div>
          </div>

          {/* BULK IMPORT COLLAPSIBLE BOX */}
          {showImportBox && (
            <div className="mt-1 p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 flex flex-col gap-2.5 shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-200">
                    📋 Toplu Öğrenci Listesi Yapıştır (e-Okul / Excel / Word)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportBox(false)}
                  className="text-indigo-300 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              {/* TARGET GRADE SELECTOR & OPTIONS */}
              <div className="flex items-center gap-3 flex-wrap bg-slate-950/70 p-2 rounded-xl border border-indigo-500/20 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-amber-300">Eklenen Sınıf Seviyesi:</span>
                  <select
                    value={importTargetGrade}
                    onChange={e => setImportTargetGrade(Number(e.target.value))}
                    className="bg-slate-900 border border-indigo-400/50 rounded-lg px-2 py-1 text-white font-bold focus:outline-none"
                  >
                    <option value={1}>1. Sınıf</option>
                    <option value={2}>2. Sınıf</option>
                    <option value={3}>3. Sınıf</option>
                    <option value={4}>4. Sınıf</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-300 font-semibold">Şube:</span>
                  <input
                    type="text"
                    value={importClassName}
                    onChange={e => setImportClassName(e.target.value)}
                    placeholder={`Örn: ${importTargetGrade}-A`}
                    className="w-24 px-2 py-0.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="flex items-center gap-3 ml-auto flex-wrap">
                  <label className="flex items-center gap-1.5 cursor-pointer text-emerald-300 font-bold">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-emerald-500 cursor-pointer"
                    />
                    <span>Yeni {importTargetGrade}. Sınıf Olarak Kaydet (Diğer sınıflara dokunmaz)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-indigo-200">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="accent-indigo-500 cursor-pointer"
                    />
                    <span>Mevcut {importTargetGrade}. Sınıf Listesine İlave Et</span>
                  </label>
                </div>
              </div>

              <textarea
                rows={4}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={"Örnek Yapıştırma Formatları:\n1. Ali Yılmaz\n2. Ayşe Kaya\n103 Mehmet Demir\nZeynep Çelik\n\n(Numaralar, e-Okul formatı, Excel sütunları ve tireler otomatik ayıklanır)"}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-indigo-400/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
              />

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] text-emerald-300 font-medium">
                  💾 Eklenen öğrenciler sadece seçtiğiniz {importTargetGrade}. Sınıfa kaydedilir ve kalıcı hafızaya yazılır!
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowImportBox(false)}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={handleImportSubmit}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>{importTargetGrade}. Sınıf Listesini Kaydet</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADD SINGLE STUDENT COLLAPSIBLE DRAWER */}
          {showAddSingle && (
            <div className="mt-1 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex flex-col gap-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-200">
                  ➕ Yeni Öğrenci Ekle ve Avatar Seç
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddSingle(false)}
                  className="text-emerald-300 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Öğrenci Adı ve Soyadı..."
                  className="flex-1 min-w-[160px] p-2 rounded-xl bg-slate-950 border border-emerald-400/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />

                <div className="flex items-center gap-1">
                  <span className="text-xs text-emerald-300 font-bold">Sınıf:</span>
                  <select
                    value={newStudentGrade}
                    onChange={e => setNewStudentGrade(Number(e.target.value))}
                    className="p-1.5 rounded-xl bg-slate-950 border border-emerald-400/40 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value={1}>1. Sınıf</option>
                    <option value={2}>2. Sınıf</option>
                    <option value={3}>3. Sınıf</option>
                    <option value={4}>4. Sınıf</option>
                  </select>
                </div>

                <input
                  type="text"
                  value={newStudentClass}
                  onChange={e => setNewStudentClass(e.target.value)}
                  placeholder={`Şube (${newStudentGrade}-A)`}
                  className="w-24 p-2 rounded-xl bg-slate-950 border border-emerald-400/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />

                <button
                  type="button"
                  onClick={handleAddSingleStudent}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow cursor-pointer"
                >
                  Kalıcı Ekle
                </button>
              </div>

              {/* AVATAR SELECTOR GRID */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-emerald-300">Avatar Seçin:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-950/60 rounded-xl border border-emerald-500/20">
                  {AVATAR_OPTIONS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatarId(av.id)}
                      className={`p-1 rounded-lg text-lg flex items-center justify-center transition shrink-0 cursor-pointer ${
                        selectedAvatarId === av.id
                          ? `bg-gradient-to-br ${av.bg} ring-2 ring-white scale-110 shadow`
                          : 'hover:bg-white/10'
                      }`}
                      title={av.label}
                    >
                      <span>{av.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STUDENT ROSTER LIST CONTAINER */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2">
          {filteredStudents.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4">
              <div className="text-4xl mb-2">🎒</div>
              <h3 className="text-sm font-black text-slate-300">
                {activeGradeTab === 'ALL' ? 'Henüz Öğrenci Eklenmedi' : `${activeGradeTab}. Sınıf İçin Öğrenci Bulunamadı`}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {searchTerm
                  ? 'Arama kriterinize uygun öğrenci bulunamadı.'
                  : `Yukarıdaki "Toplu Liste Yapıştır" veya "Tek Ekle" butonunu kullanarak ${activeGradeTab !== 'ALL' ? `${activeGradeTab}. Sınıf` : ''} listenizi oluşturabilirsiniz.`}
              </p>
              {!searchTerm && activeGradeTab !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowImportBox(true);
                    setImportTargetGrade(activeGradeTab);
                  }}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow cursor-pointer transition active:scale-95"
                >
                  📋 {activeGradeTab}. Sınıf Listesini Yapıştır
                </button>
              )}
            </div>
          ) : (
            filteredStudents.map((student) => {
              const totalAnswers = student.totalCorrect + student.totalWrong;
              const studentSuccessRate = totalAnswers > 0 ? Math.round((student.totalCorrect / totalAnswers) * 100) : 0;
              const isEditing = editingStudentId === student.id;
              const isExpanded = expandedStudentId === student.id;
              const topicEntries = Object.entries(student.topicStats || {});
              const gCol = gradeColors[student.grade] || gradeColors[2];

              return (
                <div
                  key={student.id}
                  className="rounded-2xl bg-[#0e1628] border border-slate-800 hover:border-slate-700 transition p-2.5 sm:p-3 flex flex-col gap-2 shadow-sm"
                >
                  {/* STUDENT MAIN ROW */}
                  <div className="flex items-center justify-between gap-2.5">
                    {/* LEFT: AVATAR & NAME */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* AVATAR BADGE */}
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br ${student.avatarBg || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-xl sm:text-2xl shadow border border-white/20 shrink-0`}
                      >
                        {student.avatar}
                      </div>

                      {/* NAME OR EDIT INPUT */}
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                          <input
                            type="text"
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            placeholder="Öğrenci Adı"
                            className="p-1 px-2 text-xs rounded-lg bg-slate-900 border border-indigo-400 text-white flex-1 min-w-[120px]"
                          />
                          <select
                            value={editingGrade}
                            onChange={e => setEditingGrade(Number(e.target.value))}
                            className="p-1 px-1.5 text-xs rounded-lg bg-slate-900 border border-indigo-400 text-white font-bold"
                          >
                            <option value={1}>1. Sınıf</option>
                            <option value={2}>2. Sınıf</option>
                            <option value={3}>3. Sınıf</option>
                            <option value={4}>4. Sınıf</option>
                          </select>
                          <input
                            type="text"
                            value={editingClassName}
                            onChange={e => setEditingClassName(e.target.value)}
                            placeholder="Şube"
                            className="p-1 px-2 text-xs rounded-lg bg-slate-900 border border-indigo-400 text-white w-16"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(student.id)}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white cursor-pointer"
                            title="Kaydet"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStudentId(null)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 cursor-pointer"
                            title="İptal"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-xs sm:text-sm text-white tracking-wide truncate">
                              {student.name}
                            </h4>
                            
                            {/* GRADE BADGE */}
                            <span className={`px-1.5 py-0.2 rounded border ${gCol.bg} ${gCol.border} ${gCol.text} text-[9px] font-black`}>
                              {student.grade}. Sınıf
                            </span>

                            {/* CLASS/BRANCH BADGE */}
                            {student.className && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-[9px] font-bold">
                                {student.className}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>🎮 {student.gamesPlayed} Oyun</span>
                            {student.gamesWon > 0 && (
                              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                <Trophy size={11} />
                                <span>{student.gamesWon} Galibiyet</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* STATS CAPSULES: DOĞRU, YANLIŞ, % ORAN */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {/* DOĞRU */}
                      <div className="px-2 sm:px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center gap-1 text-[11px] sm:text-xs font-black">
                        <CheckCircle2 size={13} />
                        <span>{student.totalCorrect}</span>
                      </div>

                      {/* YANLIŞ */}
                      <div className="px-2 sm:px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center gap-1 text-[11px] sm:text-xs font-black">
                        <XCircle size={13} />
                        <span>{student.totalWrong}</span>
                      </div>

                      {/* % BAŞARI */}
                      <div className="px-2 sm:px-2.5 py-1 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-black min-w-[50px] text-center">
                        %{studentSuccessRate}
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-1 ml-1">
                        {/* TOGGLE TOPIC DETAIL */}
                        <button
                          type="button"
                          onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                          className={`p-1.5 rounded-lg border text-slate-300 transition cursor-pointer ${
                            isExpanded ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800/80 border-slate-700 hover:text-white'
                          }`}
                          title="Detaylı Konu İstatistikleri"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {/* EDIT BUTTON */}
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStudentId(student.id);
                              setEditingName(student.name);
                              setEditingGrade(student.grade || 2);
                              setEditingClassName(student.className || '');
                              const avOpt = AVATAR_OPTIONS.find(a => a.emoji === student.avatar);
                              setEditingAvatarId(avOpt ? avOpt.id : AVATAR_OPTIONS[0].id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Öğrenciyi Düzenle / Sınıfını Değiştir"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}

                        {/* DELETE BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-rose-400/80 hover:text-rose-300 hover:bg-rose-950 transition cursor-pointer"
                          title="Öğrenciyi Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED TOPIC STATS ACCORDION */}
                  {isExpanded && (
                    <div className="mt-1 pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-300">
                          📊 Çözülen Etkinlik ve Konu Dağılımı:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleResetSingle(student.id)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                          title="Sadece bu öğrencinin doğru-yanlışlarını sıfırla"
                        >
                          <Trash2 size={10} />
                          <span>Skorunu Sıfırla</span>
                        </button>
                      </div>

                      {topicEntries.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic py-1">
                          Bu öğrenci henüz 2 veya 3 kişilik oyunlarda soru çözmedi. Oyun oynadıkça istatistikleri burada listelenir.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {topicEntries.map(([tKey, stat]) => {
                            const total = stat.correct + stat.wrong;
                            const tRate = total > 0 ? Math.round((stat.correct / total) * 100) : 0;

                            return (
                              <div
                                key={tKey}
                                className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                              >
                                <span className="font-semibold text-slate-200 truncate pr-2">
                                  {tKey.replace(/_/g, ' ')}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                    <CheckCircle2 size={11} /> {stat.correct}
                                  </span>
                                  <span className="text-rose-400 font-bold flex items-center gap-0.5">
                                    <XCircle size={11} /> {stat.wrong}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                                    %{tRate}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER BAR */}
        <div className="px-3 sm:px-5 py-2.5 bg-slate-950 border-t border-slate-800/80 shrink-0 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {activeGradeTab === 'ALL'
                ? `Tüm sınıflarda toplam ${students.length} öğrenci kayıtlı.`
                : `${activeGradeTab}. Sınıfta ${gradeStudents.length} öğrenci kayıtlı.`}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {onBackToStats && (
              <button
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  onBackToStats(typeof activeGradeTab === 'number' ? activeGradeTab : (currentGrade || 2));
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-purple-200 hover:text-white font-bold text-xs border border-purple-400/40 shadow transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="İstatistikler Üst Menüsüne Dön"
              >
                <ArrowLeft size={14} />
                <span>Üst Menüye Dön</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow transition active:scale-95 cursor-pointer"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
