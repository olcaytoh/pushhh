import React, { useState } from 'react';
import { Users, ChevronLeft, ChevronRight, UserPlus, Check, Sparkles } from 'lucide-react';
import { Student } from '../types/student';

interface StudentAvatarDockProps {
  students: Student[];
  playerCount: number; // 2 or 3
  selectedStudentIds: (string | null)[];
  onSelectStudentForPlayer: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal: () => void;
  playMp3?: (src: string) => void;
}

export const StudentAvatarDock: React.FC<StudentAvatarDockProps> = ({
  students,
  playerCount,
  selectedStudentIds,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  playMp3
}) => {
  // Which group is currently active for tapping an avatar (0: 1. Grup, 1: 2. Grup, 2: 3. Grup)
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(() => {
    // Default to the first group that has no student selected
    const firstEmpty = selectedStudentIds.findIndex((id, idx) => idx < playerCount && !id);
    return firstEmpty !== -1 ? firstEmpty : 0;
  });

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleAvatarClick = (student: Student) => {
    playMp3?.('/op.mp3');

    // Check if this student is already selected by the active group
    if (selectedStudentIds[activeGroupIndex] === student.id) {
      // Toggle off
      onSelectStudentForPlayer(activeGroupIndex, null);
      return;
    }

    // Check if this student is assigned to any other group
    const existingGroupIdx = selectedStudentIds.indexOf(student.id);
    if (existingGroupIdx !== -1 && existingGroupIdx !== activeGroupIndex) {
      // Remove from previous group
      onSelectStudentForPlayer(existingGroupIdx, null);
    }

    // Assign to active group
    onSelectStudentForPlayer(activeGroupIndex, student.id);

    // Auto advance to the next unassigned group
    const nextUnassigned = [0, 1, 2].slice(0, playerCount).find(
      idx => idx !== activeGroupIndex && !selectedStudentIds[idx]
    );
    if (nextUnassigned !== undefined) {
      setActiveGroupIndex(nextUnassigned);
    }
  };

  const groupThemes = [
    {
      label: '1. Grup',
      borderActive: 'border-blue-400 bg-blue-500/20 text-blue-200 ring-2 ring-blue-400',
      badgeBg: 'bg-blue-500 text-white',
      ringColor: 'ring-2 ring-blue-400 border-blue-300',
      textColor: 'text-blue-300',
      tabBorder: 'border-blue-500/60'
    },
    {
      label: '2. Grup',
      borderActive: 'border-rose-400 bg-rose-500/20 text-rose-200 ring-2 ring-rose-400',
      badgeBg: 'bg-rose-500 text-white',
      ringColor: 'ring-2 ring-rose-400 border-rose-300',
      textColor: 'text-rose-300',
      tabBorder: 'border-rose-500/60'
    },
    {
      label: '3. Grup',
      borderActive: 'border-emerald-400 bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-400',
      badgeBg: 'bg-emerald-500 text-white',
      ringColor: 'ring-2 ring-emerald-400 border-emerald-300',
      textColor: 'text-emerald-300',
      tabBorder: 'border-emerald-500/60'
    }
  ];

  return (
    <div className="w-full shrink-0 z-20 mt-1 mb-0.5 px-1 sm:px-2 select-none">
      <div className="relative rounded-2xl bg-[#070c18]/95 border border-slate-700/80 shadow-[0_8px_24px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.08)] p-1.5 sm:p-2 overflow-hidden flex flex-col gap-1.5 backdrop-blur-md">
        
        {/* TOP MINI BAR: GROUP SELECTOR TABS & ROSTER ACTION BUTTONS */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          {/* GROUP TABS */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-amber-300/90 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-0.5">
              <Users size={12} className="text-amber-400" />
              <span className="hidden xs:inline">Yarışmacı:</span>
            </span>

            {Array.from({ length: playerCount }).map((_, gIdx) => {
              const theme = groupThemes[gIdx];
              const isCurrent = activeGroupIndex === gIdx;
              const assignedStudent = students.find(s => s.id === selectedStudentIds[gIdx]);

              return (
                <button
                  key={gIdx}
                  type="button"
                  onClick={() => {
                    playMp3?.('/op.mp3');
                    setActiveGroupIndex(gIdx);
                  }}
                  className={`px-2 py-0.5 sm:py-1 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer border ${
                    isCurrent
                      ? theme.borderActive
                      : assignedStudent
                      ? `bg-slate-900/90 border-slate-700 text-slate-200`
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title={`${theme.label} için öğrenci seç`}
                >
                  <span className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold ${theme.badgeBg}`}>
                    {gIdx + 1}
                  </span>
                  <span className="truncate max-w-[85px] sm:max-w-[120px]">
                    {assignedStudent ? `${assignedStudent.avatar} ${assignedStudent.name.split(' ')[0]}` : `${theme.label}: Seç`}
                  </span>
                  {assignedStudent && (
                    <Check size={11} className={theme.textColor} />
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT BUTTON: MANAGE ROSTER */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={() => {
                playMp3?.('/op.mp3');
                onOpenRosterModal();
              }}
              className="px-2 py-0.5 sm:py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              title="Öğrenci Listesi Ekle / İstatistikleri Gör"
            >
              <UserPlus size={12} className="text-amber-400" />
              <span>Sınıf Listesi ({students.length})</span>
            </button>
          </div>
        </div>

        {/* BOTTOM ROW: SIDE-BY-SIDE STUDENT AVATARS DOCK (KÜÇÜK İKON BÜYÜKLÜĞÜNDE YANYANA) */}
        <div className="relative flex items-center w-full min-w-0">
          {/* SCROLL LEFT BUTTON */}
          <button
            type="button"
            onClick={scrollLeft}
            className="shrink-0 p-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 mr-1 z-10 cursor-pointer shadow-xs active:scale-95 transition"
            title="Sola Kaydır"
          >
            <ChevronLeft size={14} />
          </button>

          {/* HORIZONTAL AVATARS SCROLL CONTAINER */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                  className={`group relative flex flex-col items-center shrink-0 p-1 rounded-xl transition-all cursor-pointer active:scale-90 ${
                    isCurrentGroupAssigned
                      ? 'bg-slate-800/90 scale-105'
                      : isAssigned
                      ? 'bg-slate-900/80'
                      : 'hover:bg-slate-800/60'
                  }`}
                  title={`${student.name} (${student.totalCorrect} Doğru, ${student.totalWrong} Yanlış)`}
                >
                  {/* AVATAR BADGE */}
                  <div
                    className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${student.avatarBg || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-base sm:text-lg shadow-md transition-all ${
                      assignedTheme
                        ? `${assignedTheme.ringColor} shadow-[0_0_12px_rgba(255,255,255,0.4)]`
                        : 'border border-white/20 group-hover:scale-110 group-hover:border-white/50'
                    }`}
                  >
                    <span>{student.avatar}</span>

                    {/* ASSIGNED GROUP NUMBER BADGE (1, 2, 3) */}
                    {isAssigned && (
                      <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${assignedTheme?.badgeBg} font-black text-[9px] flex items-center justify-center border border-white shadow-md animate-pulse`}>
                        {assignedGIdx + 1}
                      </span>
                    )}
                  </div>

                  {/* STUDENT FIRST NAME */}
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold mt-0.5 truncate max-w-[50px] sm:max-w-[56px] text-center leading-none ${
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
                onOpenRosterModal();
              }}
              className="flex flex-col items-center justify-center shrink-0 p-1 w-10 sm:w-11 h-11 sm:h-12 rounded-xl border border-dashed border-amber-400/50 hover:border-amber-300 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition cursor-pointer active:scale-95"
              title="Yeni Öğrenci Ekle veya Liste Yapıştır"
            >
              <UserPlus size={14} className="text-amber-400" />
              <span className="text-[8px] font-bold mt-0.5 text-amber-300/80">Ekle</span>
            </button>
          </div>

          {/* SCROLL RIGHT BUTTON */}
          <button
            type="button"
            onClick={scrollRight}
            className="shrink-0 p-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 ml-1 z-10 cursor-pointer shadow-xs active:scale-95 transition"
            title="Sağa Kaydır"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
