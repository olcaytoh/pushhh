import React from 'react';
import { Volume2 } from 'lucide-react';
import { speakTurkish } from '../utils/turkishSpeech';

interface TeacherVoiceToggleProps {
  compact?: boolean;
  playMp3?: (src: string) => void;
}

export const TeacherVoiceToggle: React.FC<TeacherVoiceToggleProps> = ({
  compact = false,
  playMp3,
}) => {
  const handlePreview = () => {
    playMp3?.('/op.mp3');
    speakTurkish('Merhaba çocuklar!', {
      kind: 'cumle',
      voice: 'kadin',
    });
  };

  return (
    <button
      type="button"
      onClick={handlePreview}
      aria-label="Öğretmen Sesini Dinle"
      title="Öğretmen Sesini Kontrol Et"
      className={`inline-flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-extrabold transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
        compact ? 'min-h-[38px] px-2.5 text-[11px]' : 'min-h-[44px] px-3 sm:px-3.5 text-xs'
      }`}
    >
      <Volume2 className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />
      <span>Öğretmen Sesi</span>
    </button>
  );
};
