import React from 'react';
import { Users, UserPlus, Check, Sparkles } from 'lucide-react';
import { Student } from '../types/student';

interface StudentAvatarDockProps {
  students: Student[];
  currentGrade?: number | null;
  playerCount: number; // 2 or 3
  selectedStudentIds: (string | null)[];
  onSelectStudentForPlayer: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal: (grade?: number) => void;
  playMp3?: (src: string) => void;
}

export const StudentAvatarDock: React.FC<StudentAvatarDockProps> = ({
  students,
  currentGrade = 2,
  playerCount,
  selectedStudentIds,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  playMp3
}) => {
  const effectiveGrade = (currentGrade && [1, 2, 3, 4].includes(currentGrade)) ? currentGrade : 2;

  // Group theme definitions (1: Red/Kırmızı, 2: Blue/Mavi, 3: Green/Yeşil)
  const groupThemes = [
    {
      label: playerCount === 1 ? 'Öğrenci' : '1. Grup',
      textColor: playerCount === 1 ? 'text-amber-300' : 'text-rose-400',
      borderColor: playerCount === 1 ? 'border-amber-500' : 'border-rose-500',
      borderActive: playerCount === 1 
        ? 'border-amber-400 bg-amber-500/25 text-white ring-2 ring-amber-500/80' 
        : 'border-rose-400 bg-rose-500/25 text-white ring-2 ring-rose-500/80',
      badgeBg: playerCount === 1 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-rose-500 text-white',
      ringColor: playerCount === 1 ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0d1527]' : 'ring-2 ring-rose-500 ring-offset-2 ring-offset-[#0d1527]'
    },
    {
      label: '2. Grup',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500',
      borderActive: 'border-blue-400 bg-blue-500/25 text-white ring-2 ring-blue-500/80',
      badgeBg: 'bg-blue-500 text-white',
      ringColor: 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0d1527]'
    },
    {
      label: '3. Grup',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500',
      borderActive: 'border-emerald-400 bg-emerald-500/25 text-white ring-2 ring-emerald-500/80',
      badgeBg: 'bg-emerald-500 text-white',
      ringColor: 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0d1527]'
    }
  ];

  // Currently focused group tab (0 = 1. Grup, 1 = 2. Grup, 2 = 3. Grup)
  const [activeGroupIndex, setActiveGroupIndex] = React.useState<number>(0);

  const handleAvatarClick = (student: Student) => {
    playMp3?.('/op.mp3');

    // If student is already assigned to this group, unassign them
    if (selectedStudentIds[activeGroupIndex] === student.id) {
      onSelectStudentForPlayer(activeGroupIndex, null);
      return;
    }

    // If student is assigned to another group, swap or unassign them from there
    const existingIndex = selectedStudentIds.findIndex(id => id === student.id);
    if (existingIndex !== -1 && existingIndex !== activeGroupIndex) {
      onSelectStudentForPlayer(existingIndex, null);
    }

    // Assign to active group
    onSelectStudentForPlayer(activeGroupIndex, student.id);

    // Auto-advance to next group if not all filled
    const nextGroup = (activeGroupIndex + 1) % playerCount;
    setActiveGroupIndex(nextGroup);
  };

  return (
    <div className="w-full shrink-0 z-20 mt-1 mb-0.5 px-1 sm:px-2 select-none">
      <div className="relative rounded-2xl bg-[#070c18]/95 border border-slate-700/80 shadow-[0_8px_24px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.08)] p-1.5 sm:p-2 overflow-hidden flex flex-col gap-1.5 backdrop-blur-md">
        
        {/* TOP MINI BAR: GROUP SELECTOR TABS & ROSTER ACTION BUTTONS */}
        <div className="flex items-center justify-between gap-1.5 flex-nowrap overflow-x-auto scrollbar-none no-scrollbar">
          {/* GROUP TABS */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <span className="text-[10px] sm:text-xs font-black text-amber-300/90 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-0.5">
              <Users size={12} className="text-amber-400" />
              <span className="hidden xs:inline">{effectiveGrade}. Sınıf:</span>
            </span>

            {Array.from({ length: playerCount }).map((_, gIdx) => {
              const theme = groupThemes[gIdx] || groupThemes[0];
              const isCurrent = activeGroupIndex === gIdx;
              const assignedStudent = students.find(s => s.id === selectedStudentIds[gIdx]);

              return (
                <button
                  key={gIdx}
                  type="button"
                  onClick={() => {
                    playMp3?.('/op.mp3');
                    if (playerCount === 1 && assignedStudent) {
                      onSelectStudentForPlayer(0, null);
                    } else {
                      setActiveGroupIndex(gIdx);
                    }
                  }}
                  className={`px-2 py-0.5 sm:py-1 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer border ${
                    isCurrent
                      ? theme.borderActive
                      : assignedStudent
                      ? `bg-slate-900/90 border-slate-700 text-slate-200`
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title={playerCount === 1 ? (assignedStudent ? `${assignedStudent.name} (Seçimi Kaldır)` : 'Öğrenci Seç') : `${theme.label} için öğrenci seç`}
                >
                  <span className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold ${theme.badgeBg}`}>
                    {playerCount === 1 ? '👤' : (gIdx + 1)}
                  </span>
                  <span className="truncate max-w-[85px] sm:max-w-[120px]">
                    {assignedStudent ? `${assignedStudent.avatar} ${assignedStudent.name.split(' ')[0]}` : (playerCount === 1 ? 'Öğrenci Seç' : `${theme.label}: Seç`)}
                  </span>
                  {assignedStudent && (
                    <Check size={11} className={theme.textColor} />
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT BUTTON: MANAGE ROSTER FOR THIS GRADE */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                onOpenRosterModal(effectiveGrade);
              }}
              className="px-2 py-0.5 sm:py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              title={`${effectiveGrade}. Sınıf Öğrenci Listesi / İstatistikleri`}
            >
              <UserPlus size={12} className="text-amber-400" />
              <span>{effectiveGrade}. Sınıf Listesi ({students.length})</span>
            </button>
          </div>
        </div>

        {/* BOTTOM ROW: SIDE-BY-SIDE STUDENT AVATARS DOCK (KÜÇÜK İKON BÜYÜKLÜĞÜNDE YANYANA) */}
        {students.length === 0 ? (
          <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/80 rounded-xl border border-dashed border-amber-500/40">
            <div className="flex items-center gap-2 text-xs text-amber-200">
              <span className="text-base">🎒</span>
              <span><strong>{effectiveGrade}. Sınıf</strong> için henüz öğrenci listesi eklenmedi.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                onOpenRosterModal(effectiveGrade);
              }}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow active:scale-95"
            >
              <Sparkles size={12} />
              <span>{effectiveGrade}. Sınıf Listesi Ekle</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-start sm:justify-center min-w-0 overflow-x-auto scrollbar-none no-scrollbar py-0.5 px-0.5">
            {/* STRICT SINGLE-ROW HORIZONTAL DOCK - NEVER BREAKS TO A 2ND ROW */}
            <div
              className="flex flex-row flex-nowrap items-center gap-1 sm:gap-1.5 min-w-max mx-auto"
            >
              {students.map((student) => {
                // Check if student is assigned to any of the players
                const assignedGIdx = selectedStudentIds.findIndex(id => id === student.id);
                const isAssigned = assignedGIdx !== -1 && assignedGIdx < playerCount;
                const assignedTheme = isAssigned ? groupThemes[assignedGIdx] : null;
                const isCurrentGroupAssigned = isAssigned && assignedGIdx === activeGroupIndex;

                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleAvatarClick(student)}
                    className={`group relative flex flex-col items-center shrink-0 p-0.5 sm:p-1 rounded-xl transition-all cursor-pointer active:scale-90 ${
                      isCurrentGroupAssigned
                        ? 'bg-slate-800/90 scale-105'
                        : isAssigned
                        ? 'bg-slate-900/80'
                        : 'hover:bg-slate-800/60'
                    }`}
                    title={`${student.name} (${student.grade}. Sınıf${student.className ? ` - ${student.className}` : ''}) • ${student.totalCorrect} Doğru, ${student.totalWrong} Yanlış`}
                  >
                    {/* AVATAR BADGE */}
                    <div
                      className={`relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br ${student.avatarBg || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-xs sm:text-sm md:text-base shadow-sm transition-all ${
                        assignedTheme
                          ? `${assignedTheme.ringColor} shadow-[0_0_12px_rgba(255,255,255,0.4)]`
                          : 'border border-white/20 group-hover:scale-110 group-hover:border-white/50'
                      }`}
                    >
                      <span>{student.avatar}</span>

                      {/* ASSIGNED GROUP NUMBER BADGE (1, 2, 3 or ✓) */}
                      {isAssigned && (
                        <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${assignedTheme?.badgeBg} font-black text-[8px] sm:text-[9px] flex items-center justify-center border border-white shadow-xs animate-pulse`}>
                          {playerCount === 1 ? '✓' : (assignedGIdx + 1)}
                        </span>
                      )}
                    </div>

                    {/* STUDENT FIRST NAME */}
                    <span
                      className={`text-[8px] sm:text-[9px] font-bold mt-0.5 truncate max-w-[42px] sm:max-w-[48px] text-center leading-none ${
                        assignedTheme
                          ? `${assignedTheme.textColor} font-black drop-shadow`
                          : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {student.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}

              {/* QUICK ADD MORE STUDENTS PILL AT THE END OF THE DOCK */}
              <button
                type="button"
                onClick={() => {
                  playMp3?.('/op.mp3');
                  onOpenRosterModal(effectiveGrade);
                }}
                className="flex flex-col items-center justify-center shrink-0 p-0.5 w-8 sm:w-9 h-8 sm:h-9 rounded-xl border border-dashed border-amber-400/50 hover:border-amber-300 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition cursor-pointer active:scale-95"
                title={`${effectiveGrade}. Sınıfa Yeni Öğrenci Ekle`}
              >
                <UserPlus size={12} className="text-amber-400" />
                <span className="text-[7.5px] font-bold mt-0.5 text-amber-300/80">Ekle</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
