import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Student } from '../types/student';

export interface StudentAvatarSideGridProps {
  slotsStudents: Student[];
  side: 'left' | 'right';
  count: number;
  label: string;
  selectedStudentId: string | null;
  onSelectStudent: (id: string | null) => void;
  onOpenRosterModal: () => void;
  playMp3?: (src: string) => void;
}

export const StudentAvatarSideGrid: React.FC<StudentAvatarSideGridProps> = ({
  slotsStudents,
  side,
  count,
  label,
  selectedStudentId,
  onSelectStudent,
  onOpenRosterModal,
  playMp3
}) => {
  const isLeft = side === 'left';
  return (
    <div className={`flex flex-col shrink-0 bg-[#0b1328] rounded-2xl sm:rounded-3xl border-2 ${
      isLeft 
        ? 'border-indigo-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.85),0_0_16px_rgba(99,102,241,0.2)]' 
        : 'border-amber-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.85),0_0_16px_rgba(245,158,11,0.2)]'
    } p-2 sm:p-2.5 md:p-3 select-none`}>
      {/* FRAME HEADER */}
      <div className={`flex items-center justify-between px-1 pb-1.5 mb-1.5 border-b ${
        isLeft ? 'border-indigo-500/25' : 'border-amber-500/25'
      } text-[9.5px] sm:text-[10.5px] md:text-xs font-black uppercase tracking-wider`}>
        <span className={`flex items-center gap-1.5 ${isLeft ? 'text-indigo-300' : 'text-amber-300'}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${
            isLeft 
              ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]' 
              : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
          }`} />
          {label}
        </span>
        <button
          type="button"
          onClick={() => {
            if (playMp3) playMp3('/op.mp3');
            onOpenRosterModal();
          }}
          className={`text-[8.5px] sm:text-[9.5px] font-bold transition cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-md ${
            isLeft 
              ? 'bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/30' 
              : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/30'
          }`}
          title="Sınıf Listesini Yönet"
        >
          <Users size={12} />
          <span>{count} Kişi</span>
        </button>
      </div>

      {/* 2-ROW x 6-COLUMN GRID */}
      <div className="grid grid-cols-6 grid-rows-2 gap-1 sm:gap-1.5 md:gap-2">
        {Array.from({ length: 12 }).map((_, slotIdx) => {
          if (side === 'right' && slotIdx === 11 && slotsStudents.length <= 11) {
            return (
              <button
                key="add-student-slot"
                type="button"
                onClick={() => {
                  if (playMp3) playMp3('/op.mp3');
                  onOpenRosterModal();
                }}
                className="w-11 sm:w-12 md:w-13 lg:w-14 xl:w-15 h-[56px] sm:h-[62px] md:h-[68px] lg:h-[72px] shrink-0 rounded-xl border-2 border-dashed border-amber-400/50 hover:border-amber-300 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 transition-all cursor-pointer flex flex-col items-center justify-center p-1 group active:scale-95"
                title="Yeni Öğrenci Ekle"
              >
                <UserPlus size={16} className="text-amber-400 group-hover:scale-110 transition" />
                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-amber-300 mt-1 leading-none">
                  Ekle
                </span>
              </button>
            );
          }

          const student = slotsStudents[slotIdx];

          if (!student) {
            const seatNum = side === 'left' ? slotIdx + 1 : slotIdx + 13;
            return (
              <button
                key={`empty-${slotIdx}`}
                type="button"
                onClick={() => {
                  if (playMp3) playMp3('/op.mp3');
                  onOpenRosterModal();
                }}
                className="w-11 sm:w-12 md:w-13 lg:w-14 xl:w-15 h-[56px] sm:h-[62px] md:h-[68px] lg:h-[72px] shrink-0 rounded-xl border-2 border-dashed border-slate-700/50 hover:border-slate-500 bg-[#070d1a]/50 hover:bg-slate-800/40 flex flex-col items-center justify-center p-1 text-slate-500 hover:text-slate-300 transition-all cursor-pointer group"
                title={`Sıra #${seatNum} - Öğrenci Ekle`}
              >
                <span className="text-[10px] sm:text-xs text-slate-600 group-hover:text-slate-400 font-mono font-bold">
                  {seatNum}
                </span>
              </button>
            );
          }

          const isSelected = Boolean(selectedStudentId && selectedStudentId === student.id);

          return (
            <button
              key={student.id}
              type="button"
              onClick={() => {
                if (playMp3) playMp3('/op.mp3');
                onSelectStudent(isSelected ? null : student.id);
              }}
              title={`${student.name} (${student.className || ''}) • ${student.totalCorrect} Doğru - ${isSelected ? 'Seçimi Kaldır' : 'Aktif Oyuncu Yap'}`}
              className={`group relative p-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-between text-center ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-500/35 via-orange-500/25 to-amber-600/30 border-2 border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_16px_rgba(251,191,36,0.6)] scale-105 z-10'
                  : 'bg-[#060c1c]/90 hover:bg-[#111e3d] border border-slate-700/70 hover:border-blue-400/70'
              } w-11 sm:w-12 md:w-13 lg:w-14 xl:w-15 h-[56px] sm:h-[62px] md:h-[68px] lg:h-[72px] shrink-0 active:scale-95`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br ${student.avatarBg || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-sm sm:text-base md:text-lg shrink-0 shadow border border-white/20 relative mt-0.5`}>
                <span>{student.avatar}</span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border border-slate-950 shadow flex items-center justify-center text-[9px] text-slate-950 font-black">
                    ✓
                  </span>
                )}
              </div>
              <span className={`text-[8.5px] sm:text-[9.5px] md:text-[10.5px] font-bold block truncate w-full text-center leading-tight mb-0.5 px-0.5 ${
                isSelected ? 'text-amber-300 font-black drop-shadow' : 'text-slate-100 group-hover:text-white'
              }`}>
                {student.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
