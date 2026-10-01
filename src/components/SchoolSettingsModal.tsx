import React, { useEffect, useState } from 'react';
import { CalendarDays, Image, ListPlus, Save, School, Trash2, UserPlus, UserRound, X } from 'lucide-react';
import {
  DEFAULT_SCHOOL_SETTINGS,
  loadSchoolSettings,
  saveSchoolSettings,
  SchoolSettings
} from '../utils/schoolSettings';
import { Student } from '../types/student';
import { AVATAR_OPTIONS, importStudentsFromText, saveStudents } from '../utils/studentStore';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (settings: SchoolSettings) => void;
  students?: Student[];
  onStudentsUpdated?: (students: Student[]) => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  students = [],
  onStudentsUpdated
}) => {
  const [form, setForm] = useState<SchoolSettings>(DEFAULT_SCHOOL_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [studentListText, setStudentListText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(loadSchoolSettings());
      setSaved(false);
      setNewStudentName('');
      setStudentListText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (field: keyof SchoolSettings, value: string) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    const cleaned: SchoolSettings = {
      schoolName: form.schoolName.trim() || DEFAULT_SCHOOL_SETTINGS.schoolName,
      teacherName: form.teacherName.trim() || DEFAULT_SCHOOL_SETTINGS.teacherName,
      className: form.className.trim() || DEFAULT_SCHOOL_SETTINGS.className,
      reportStartDate: form.reportStartDate.trim() || DEFAULT_SCHOOL_SETTINGS.reportStartDate,
      logoPath: form.logoPath.trim()
    };
    saveSchoolSettings(cleaned);
    setForm(cleaned);
    setSaved(true);
    onSaved?.(cleaned);
  };

  const handleReset = () => {
    setForm(DEFAULT_SCHOOL_SETTINGS);
    setSaved(false);
  };

  const selectedGrade = Number(form.className.match(/^[1-4]/)?.[0] || 2);
  const selectedClassName = form.className.trim();
  const selectedClassStudents = students.filter(student =>
    student.grade === selectedGrade && student.className === selectedClassName
  );

  const handleAddStudent = () => {
    const name = newStudentName.trim();
    if (!name || !selectedClassName || !onStudentsUpdated) return;

    const avatar = AVATAR_OPTIONS[students.length % AVATAR_OPTIONS.length];
    const newStudent: Student = {
      id: `std_g${selectedGrade}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      avatar: avatar.emoji,
      avatarBg: avatar.bg,
      grade: selectedGrade,
      className: selectedClassName,
      totalCorrect: 0,
      totalWrong: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      topicStats: {},
      createdAt: new Date().toISOString()
    };
    const updated = [...students, newStudent];
    saveStudents(updated);
    onStudentsUpdated(updated);
    setNewStudentName('');
  };

  const handleAddStudentList = () => {
    if (!studentListText.trim() || !selectedClassName || !onStudentsUpdated) return;
    const updated = importStudentsFromText(
      studentListText,
      students,
      false,
      selectedGrade,
      selectedClassName
    );
    saveStudents(updated);
    onStudentsUpdated(updated);
    setStudentListText('');
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!onStudentsUpdated) return;
    const updated = students.filter(student => student.id !== studentId);
    saveStudents(updated);
    onStudentsUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-red-500/40 bg-gradient-to-b from-[#132b61] to-[#0b1735] shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg border-2 border-red-500/70">
              <School className="text-[#1e3a7d]" size={25} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Okul ve Rapor Ayarları</h2>
              <p className="text-xs text-blue-100/75 mt-0.5">PDF ve etkinliklerde kullanılacak bilgileri düzenleyin.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10" title="Kapat">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <label className="block">
            <span className="flex items-center gap-2 text-xs font-black text-blue-100 mb-1.5"><School size={15} /> Okul adı</span>
            <input value={form.schoolName} onChange={e => update('schoolName', e.target.value)} className="w-full rounded-xl border border-blue-300/30 bg-slate-950/40 px-3 py-2.5 text-sm text-white outline-none focus:border-red-400" placeholder="Okul adını yazın" />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-xs font-black text-blue-100 mb-1.5"><UserRound size={15} /> Öğretmen adı</span>
            <input value={form.teacherName} onChange={e => update('teacherName', e.target.value)} className="w-full rounded-xl border border-blue-300/30 bg-slate-950/40 px-3 py-2.5 text-sm text-white outline-none focus:border-red-400" placeholder="Öğretmen adını yazın" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="flex items-center gap-2 text-xs font-black text-blue-100 mb-1.5"><School size={15} /> Sınıf / Şube</span>
              <input value={form.className} onChange={e => update('className', e.target.value)} className="w-full rounded-xl border border-blue-300/30 bg-slate-950/40 px-3 py-2.5 text-sm text-white outline-none focus:border-red-400" placeholder="Örn. 2-C" />
            </label>
            <label className="block">
              <span className="flex items-center gap-2 text-xs font-black text-blue-100 mb-1.5"><CalendarDays size={15} /> Rapor başlangıç tarihi</span>
              <input value={form.reportStartDate} onChange={e => update('reportStartDate', e.target.value)} className="w-full rounded-xl border border-blue-300/30 bg-slate-950/40 px-3 py-2.5 text-sm text-white outline-none focus:border-red-400" placeholder="Örn. 01.09.2026" />
            </label>
          </div>

          <label className="block">
            <span className="flex items-center gap-2 text-xs font-black text-blue-100 mb-1.5"><Image size={15} /> Logo yolu (isteğe bağlı)</span>
            <input value={form.logoPath} onChange={e => update('logoPath', e.target.value)} className="w-full rounded-xl border border-blue-300/30 bg-slate-950/40 px-3 py-2.5 text-sm text-white outline-none focus:border-red-400" placeholder="Örn. /okul-logo.png" />
            <p className="text-[11px] text-blue-100/60 mt-1">Logo dosyası public klasöründe olmalıdır. Kullanmayacaksanız boş bırakabilirsiniz.</p>
          </label>

          <section className="rounded-2xl border border-red-400/30 bg-slate-950/25 p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-black text-white"><UserPlus size={16} className="text-red-300" /> Öğrenci listesi</h3>
                <p className="text-[11px] text-blue-100/65 mt-1">{selectedClassName || 'Sınıf / Şube'} için eklenen öğrenciler etkinliklerde seçilebilir.</p>
              </div>
              <span className="rounded-full bg-red-500/15 border border-red-300/30 px-2 py-1 text-[10px] font-black text-red-200">{selectedClassStudents.length} öğrenci</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddStudent(); }} className="flex-1 rounded-xl border border-blue-300/30 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-red-400" placeholder="Tek öğrenci adı" />
              <button onClick={handleAddStudent} className="rounded-xl bg-red-600 hover:bg-red-500 px-3 py-2 text-xs font-black text-white flex items-center justify-center gap-1.5"><UserPlus size={14} /> Tek ekle</button>
            </div>

            <div>
              <textarea value={studentListText} onChange={e => setStudentListText(e.target.value)} className="w-full min-h-20 rounded-xl border border-blue-300/30 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-red-400" placeholder="Liste ekle: her satıra bir öğrenci adı yazın" />
              <button onClick={handleAddStudentList} className="mt-2 rounded-xl border border-red-300/40 bg-red-500/15 hover:bg-red-500/25 px-3 py-2 text-xs font-black text-red-100 flex items-center gap-1.5"><ListPlus size={14} /> Listeyi sınıfa ekle</button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {selectedClassStudents.length === 0 ? (
                <p className="rounded-xl border border-dashed border-blue-200/20 px-3 py-3 text-xs text-blue-100/55 text-center">Bu sınıfta henüz öğrenci yok.</p>
              ) : selectedClassStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                  <span className="text-sm font-bold text-white">{student.avatar} {student.name}</span>
                  <button onClick={() => handleDeleteStudent(student.id)} className="p-1.5 rounded-lg text-red-300 hover:bg-red-500/20" title="Öğrenciyi sil"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </section>

          {saved && <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-sm font-bold text-emerald-200">Ayarlar kaydedildi. Yeni PDF ve etkinliklerde kullanılacak.</div>}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
            <button onClick={handleReset} className="rounded-xl border border-blue-200/20 px-4 py-2.5 text-xs font-black text-blue-100 hover:bg-white/10">Varsayılan bilgilere dön</button>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 sm:flex-none rounded-xl border border-blue-200/20 px-4 py-2.5 text-xs font-black text-blue-100 hover:bg-white/10">Kapat</button>
              <button onClick={handleSave} className="flex-1 sm:flex-none rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs font-black text-white shadow-lg flex items-center justify-center gap-2"><Save size={15} /> Kaydet</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};