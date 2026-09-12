import React, { useState } from 'react';
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
  RefreshCw,
  Award
} from 'lucide-react';
import { Student } from '../types/student';
import {
  AVATAR_OPTIONS,
  saveStudents,
  importStudentsFromText,
  resetAllStudentStats,
  resetSingleStudentStat,
  exportStudentsToCSV
} from '../utils/studentStore';

interface StudentRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onStudentsUpdated: (updated: Student[]) => void;
  playMp3?: (src: string) => void;
}

export const StudentRosterModal: React.FC<StudentRosterModalProps> = ({
  isOpen,
  onClose,
  students,
  onStudentsUpdated,
  playMp3
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [importText, setImportText] = useState('');
  const [showAddSingle, setShowAddSingle] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(AVATAR_OPTIONS[0].id);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  if (!isOpen) return null;

  // Filter students
  const filteredStudents = students.filter(s =>
    s.name.toLocaleLowerCase('tr').includes(searchTerm.trim().toLocaleLowerCase('tr'))
  );

  // Overall class calculations
  const totalClassCorrect = students.reduce((acc, s) => acc + s.totalCorrect, 0);
  const totalClassWrong = students.reduce((acc, s) => acc + s.totalWrong, 0);
  const totalClassAnswers = totalClassCorrect + totalClassWrong;
  const overallSuccessRate = totalClassAnswers > 0
    ? Math.round((totalClassCorrect / totalClassAnswers) * 100)
    : 0;

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    playMp3?.('/op.mp3');
    const updated = importStudentsFromText(importText, students);
    onStudentsUpdated(updated);
    setImportText('');
    setShowImportBox(false);
  };

  const handleAddSingleStudent = () => {
    if (!newStudentName.trim()) return;
    playMp3?.('/op.mp3');
    const avatarOpt = AVATAR_OPTIONS.find(a => a.id === selectedAvatarId) || AVATAR_OPTIONS[0];
    const newStd: Student = {
      id: `std_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: newStudentName.trim(),
      avatar: avatarOpt.emoji,
      avatarBg: avatarOpt.bg,
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
  };

  const handleSaveEdit = (studentId: string) => {
    if (!editingName.trim()) return;
    playMp3?.('/op.mp3');
    const updated = students.map(s => {
      if (s.id !== studentId) return s;
      const avatarOpt = AVATAR_OPTIONS.find(a => a.id === editingAvatarId);
      return {
        ...s,
        name: editingName.trim(),
        avatar: avatarOpt ? avatarOpt.emoji : s.avatar,
        avatarBg: avatarOpt ? avatarOpt.bg : s.avatarBg
      };
    });
    saveStudents(updated);
    onStudentsUpdated(updated);
    setEditingStudentId(null);
    setEditingAvatarId(null);
  };

  const handleDeleteStudent = (studentId: string) => {
    playMp3?.('/op.mp3');
    const updated = students.filter(s => s.id !== studentId);
    saveStudents(updated);
    onStudentsUpdated(updated);
  };

  const handleResetSingle = (studentId: string) => {
    playMp3?.('/op.mp3');
    const updated = resetSingleStudentStat(studentId);
    onStudentsUpdated(updated);
  };

  const handleResetAll = () => {
    playMp3?.('/op.mp3');
    const updated = resetAllStudentStats();
    onStudentsUpdated(updated);
    setConfirmResetAll(false);
  };

  const handleDownloadCSV = () => {
    playMp3?.('/op.mp3');
    const csvContent = exportStudentsToCSV(students);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sinif_istatistikleri_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-[#070b19]/90 backdrop-blur-xl z-[400] flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="relative bg-gradient-to-b from-[#131d36] via-[#0f172a] to-[#090e1c] text-white rounded-[24px] sm:rounded-[32px] border-2 border-indigo-500/50 shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-w-4xl w-full h-[92vh] max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-[#17254a] via-[#203264] to-[#17254a] border-b border-indigo-500/30 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-300 flex items-center justify-center text-lg sm:text-xl shadow shrink-0">
              🎓
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2 truncate">
                <span>Sınıf Listesi & Öğrenci İstatistikleri</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/50 text-indigo-200 text-[10px] sm:text-xs">
                  {students.length} Öğrenci
                </span>
              </h2>
              <p className="text-[11px] text-indigo-200/80 truncate">
                Öğrenci avatarları, çok oyunculu yarışma kayıtları ve doğru-yanlış analizleri
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer border border-white/20 shrink-0"
            title="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* TOP STATS CARDS & CONTROLS TOOLBAR */}
        <div className="px-3 sm:px-5 py-2 border-b border-slate-800 bg-[#0a1020]/90 shrink-0 flex flex-col gap-2">
          {/* QUICK CLASS STATS TILES */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
            <div className="bg-slate-900/90 border border-indigo-500/40 rounded-xl p-1.5 sm:p-2 text-center shadow-xs">
              <div className="text-[10px] font-bold text-indigo-300 uppercase">Toplam Öğrenci</div>
              <div className="text-base sm:text-xl font-black text-white">{students.length}</div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-1.5 sm:p-2 text-center shadow-xs">
              <div className="text-[10px] font-bold text-emerald-300 uppercase">Sınıf Doğru</div>
              <div className="text-base sm:text-xl font-black text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 size={14} />
                <span>{totalClassCorrect}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-rose-500/40 rounded-xl p-1.5 sm:p-2 text-center shadow-xs">
              <div className="text-[10px] font-bold text-rose-300 uppercase">Sınıf Yanlış</div>
              <div className="text-base sm:text-xl font-black text-rose-400 flex items-center justify-center gap-1">
                <XCircle size={14} />
                <span>{totalClassWrong}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-1.5 sm:p-2 text-center shadow-xs">
              <div className="text-[10px] font-bold text-amber-300 uppercase">Başarı Oranı</div>
              <div className="text-base sm:text-xl font-black text-amber-300">
                %{overallSuccessRate}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS & SEARCH BAR */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            {/* SEARCH */}
            <div className="relative flex-1 min-w-[140px] max-w-xs">
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
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer active:scale-95"
                title="İstatistikleri CSV olarak indir"
              >
                <Download size={13} />
                <span className="hidden sm:inline">İndir (Excel/CSV)</span>
              </button>

              {/* RESET ALL STATS CONFIRMATION */}
              {confirmResetAll ? (
                <div className="flex items-center gap-1 bg-rose-950 border border-rose-600 rounded-xl px-2 py-0.5 animate-pulse">
                  <span className="text-[10px] font-bold text-rose-200">Sıfırlansın mı?</span>
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
                  className="px-2 py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-bold text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer"
                  title="Tüm sınıfın doğru-yanlış skorlarını sıfırla (öğrenci isimleri silinmez)"
                >
                  <RefreshCw size={12} />
                  <span>Skorları Sıfırla</span>
                </button>
              )}
            </div>
          </div>

          {/* BULK IMPORT COLLAPSIBLE DRAWER */}
          {showImportBox && (
            <div className="mt-1 p-3 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-200 flex items-center gap-1.5">
                  <span>📋 Öğrenci Listesini Yapıştır</span>
                  <span className="text-[10px] font-normal text-indigo-300/80">
                    (Her satıra bir isim veya virgülle ayırarak yazabilirsiniz)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowImportBox(false)}
                  className="text-indigo-300 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <textarea
                rows={4}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={"Örnek:\n1. Ali Yılmaz\n2. Ayşe Kaya\n3. Mehmet Demir\nZeynep Çelik\nCan Öztürk"}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-indigo-400/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-300">
                  * Otomatik olarak numaralar temizlenecek ve her öğrenciye sevimli bir avatar atanacaktır.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportBox(false)}
                    className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={handleImportSubmit}
                    className="px-4 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow"
                  >
                    Listeyi Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADD SINGLE STUDENT COLLAPSIBLE DRAWER */}
          {showAddSingle && (
            <div className="mt-1 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex flex-col gap-2">
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

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Öğrenci Adı ve Soyadı..."
                  className="flex-1 p-2 rounded-xl bg-slate-950 border border-emerald-400/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={handleAddSingleStudent}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow"
                >
                  Ekle
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
              <div className="text-4xl mb-2">🧑‍🎓</div>
              <h3 className="text-sm font-black text-slate-300">Öğrenci Bulunamadı</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {searchTerm ? 'Arama kriterinize uygun öğrenci yok.' : 'Yukarıdaki "Toplu Liste Yapıştır" butonuyla sınıf listenizi ekleyebilirsiniz.'}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const totalAnswers = student.totalCorrect + student.totalWrong;
              const successRate = totalAnswers > 0 ? Math.round((student.totalCorrect / totalAnswers) * 100) : 0;
              const isEditing = editingStudentId === student.id;
              const isExpanded = expandedStudentId === student.id;
              const topicEntries = Object.entries(student.topicStats || {});

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
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <input
                            type="text"
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            className="p-1 px-2 text-xs rounded-lg bg-slate-900 border border-indigo-400 text-white flex-1 min-w-0"
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
                          <h4 className="font-black text-xs sm:text-sm text-white tracking-wide truncate">
                            {student.name}
                          </h4>
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
                        %{successRate}
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
                              const avOpt = AVATAR_OPTIONS.find(a => a.emoji === student.avatar);
                              setEditingAvatarId(avOpt ? avOpt.id : AVATAR_OPTIONS[0].id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Öğrenciyi Düzenle / Avatar Değiştir"
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

                  {/* EDIT AVATAR PICKER ROW (WHEN EDITING) */}
                  {isEditing && (
                    <div className="p-2 rounded-xl bg-slate-900 border border-indigo-500/30 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-indigo-300">Yeni Avatar Seç:</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto p-1">
                        {AVATAR_OPTIONS.map(av => (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setEditingAvatarId(av.id)}
                            className={`p-1 rounded-lg text-lg flex items-center justify-center transition shrink-0 cursor-pointer ${
                              editingAvatarId === av.id
                                ? `bg-gradient-to-br ${av.bg} ring-2 ring-white scale-110 shadow`
                                : 'hover:bg-white/10'
                            }`}
                          >
                            <span>{av.emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EXPANDED TOPIC BREAKDOWN ACCORDION */}
                  {isExpanded && (
                    <div className="mt-1 pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                        <span>📚 Konulara Göre Cevap Dağılımı ({topicEntries.length} Konu Çözüldü)</span>
                        <button
                          type="button"
                          onClick={() => handleResetSingle(student.id)}
                          className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Bu Öğrencinin Skorlarını Sıfırla
                        </button>
                      </div>

                      {topicEntries.length === 0 ? (
                        <p className="text-[11px] text-slate-500 py-1 italic">
                          Bu öğrenci henüz bir oyunda veya etkinlikte soru çözmedi. 3 kişilik yarışmalarda öğrencinin avatarına dokunarak oyuna dahil edebilirsiniz.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {topicEntries.map(([topicKey, stat]) => {
                            const total = stat.correct + stat.wrong;
                            const tRate = total > 0 ? Math.round((stat.correct / total) * 100) : 0;
                            const formattedTopic = topicKey.replace(/_/g, ' ').toUpperCase();

                            return (
                              <div
                                key={topicKey}
                                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                              >
                                <span className="font-bold text-slate-300 truncate max-w-[150px] sm:max-w-[180px]">
                                  {formattedTopic}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-400 font-bold">{stat.correct} D</span>
                                  <span className="text-rose-400 font-bold">{stat.wrong} Y</span>
                                  <span className="text-amber-300 font-black text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">
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
      </div>
    </div>
  );
};
