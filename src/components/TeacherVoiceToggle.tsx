import React, { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import {
  TeacherVoiceId,
  getTeacherVoice,
  setTeacherVoice,
  speakTurkish,
  subscribeTeacherVoice,
} from '../utils/turkishSpeech';

interface TeacherVoiceToggleProps {
  compact?: boolean;
  playMp3?: (src: string) => void;
}

export const TeacherVoiceToggle: React.FC<TeacherVoiceToggleProps> = ({
  compact = false,
  playMp3,
}) => {
  const [voice, setVoice] = useState<TeacherVoiceId>(() => getTeacherVoice());

  useEffect(() => {
    return subscribeTeacherVoice((next) => setVoice(next));
  }, []);

  const handleSelect = (next: TeacherVoiceId) => {
    if (next === voice) {
      speakTurkish(next === 'kadin' ? 'Merhaba çocuklar!' : 'Merhaba çocuklar!', {
        kind: 'cumle',
        voice: next,
      });
      return;
    }
    playMp3?.('/op.mp3');
    setTeacherVoice(next);
    speakTurkish('Merhaba çocuklar!', { kind: 'cumle', voice: next });
  };

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-300 shrink-0"
      role="group"
      aria-label="Öğretmen Sesi Seçimi"
      title="Doğal Türkçe Öğretmen Sesi"
    >
      <Volume2 className="w-3.5 h-3.5 text-rose-600 ml-1.5 mr-0.5 shrink-0" aria-hidden="true" />
      <button
        type="button"
        onClick={() => handleSelect('kadin')}
        className={`${
          compact ? 'min-h-[34px] px-2.5 text-[11px]' : 'min-h-[36px] px-2.5 sm:px-3 text-xs'
        } rounded-lg font-extrabold transition cursor-pointer whitespace-nowrap ${
          voice === 'kadin'
            ? 'bg-rose-600 text-white shadow-xs'
            : 'text-slate-700 hover:bg-white'
        }`}
      >
        Kadın Ses
      </button>
      <button
        type="button"
        onClick={() => handleSelect('erkek')}
        className={`${
          compact ? 'min-h-[34px] px-2.5 text-[11px]' : 'min-h-[36px] px-2.5 sm:px-3 text-xs'
        } rounded-lg font-extrabold transition cursor-pointer whitespace-nowrap ${
          voice === 'erkek'
            ? 'bg-sky-600 text-white shadow-xs'
            : 'text-slate-700 hover:bg-white'
        }`}
      >
        Erkek Ses
      </button>
    </div>
  );
};
