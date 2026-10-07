import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, Trophy, ArrowRight, ArrowLeft, Home,
  Volume2, HelpCircle, Check, X
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export interface SchoolLifeItem {
  id: string;
  number: number;
  targetWord: string;
  turkishMeaning: string;
  options: string[];
  themeColor: 'yellow' | 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  sceneType: 
    | 'classroom' 
    | 'kid' 
    | 'sports_hall' 
    | 'teacher_female' 
    | 'pupil_girl' 
    | 'teachers_room' 
    | 'garden' 
    | 'library' 
    | 'playground' 
    | 'boy' 
    | 'teacher_male' 
    | 'pupil_boy' 
    | 'books' 
    | 'library_reading' 
    | 'school';
}

// Exactly ordered as requested:
// 1. classroom, 2. a kid, 3. a sports hall, 4. a teacher, 5. a pupil, 6. a teacher's room,
// 7. a garden, 8. a library, 9. a playground, 10. a boy, 11. a teacher, 12. a pupil,
// 13. books, 14. a library, 15. a school
export const SCHOOL_LIFE_ITEMS: SchoolLifeItem[] = [
  {
    id: 'sl-1',
    number: 1,
    targetWord: 'classroom',
    turkishMeaning: 'Derslik / Sınıf',
    options: ['classroom', 'a garden', 'a sports hall'],
    themeColor: 'yellow',
    sceneType: 'classroom'
  },
  {
    id: 'sl-2',
    number: 2,
    targetWord: 'a kid',
    turkishMeaning: 'Küçük Çocuk',
    options: ['a kid', 'a teacher', 'a school'],
    themeColor: 'blue',
    sceneType: 'kid'
  },
  {
    id: 'sl-3',
    number: 3,
    targetWord: 'a sports hall',
    turkishMeaning: 'Spor Salonu',
    options: ['a library', 'a sports hall', "a teacher's room"],
    themeColor: 'purple',
    sceneType: 'sports_hall'
  },
  {
    id: 'sl-4',
    number: 4,
    targetWord: 'a teacher',
    turkishMeaning: 'Öğretmen (Kadın)',
    options: ['a pupil', 'a teacher', 'a kid'],
    themeColor: 'green',
    sceneType: 'teacher_female'
  },
  {
    id: 'sl-5',
    number: 5,
    targetWord: 'a pupil',
    turkishMeaning: 'Öğrenci (Kız)',
    options: ['a pupil', 'a boy', "a teacher's room"],
    themeColor: 'pink',
    sceneType: 'pupil_girl'
  },
  {
    id: 'sl-6',
    number: 6,
    targetWord: "a teacher's room",
    turkishMeaning: 'Öğretmenler Odası',
    options: ['a playground', 'a garden', "a teacher's room"],
    themeColor: 'orange',
    sceneType: 'teachers_room'
  },
  {
    id: 'sl-7',
    number: 7,
    targetWord: 'a garden',
    turkishMeaning: 'Okul Bahçesi',
    options: ['a garden', 'a sports hall', 'classroom'],
    themeColor: 'green',
    sceneType: 'garden'
  },
  {
    id: 'sl-8',
    number: 8,
    targetWord: 'a library',
    turkishMeaning: 'Okul Kütüphanesi',
    options: ['a library', 'a playground', 'books'],
    themeColor: 'blue',
    sceneType: 'library'
  },
  {
    id: 'sl-9',
    number: 9,
    targetWord: 'a playground',
    turkishMeaning: 'Oyun Parkı / Bahçe',
    options: ['a kid', 'a playground', 'a school'],
    themeColor: 'yellow',
    sceneType: 'playground'
  },
  {
    id: 'sl-10',
    number: 10,
    targetWord: 'a boy',
    turkishMeaning: 'Erkek Çocuk / Öğrenci',
    options: ['a boy', 'a pupil', 'a teacher'],
    themeColor: 'blue',
    sceneType: 'boy'
  },
  {
    id: 'sl-11',
    number: 11,
    targetWord: 'a teacher',
    turkishMeaning: 'Öğretmen (Erkek)',
    options: ['a teacher', 'a sports hall', 'a boy'],
    themeColor: 'purple',
    sceneType: 'teacher_male'
  },
  {
    id: 'sl-12',
    number: 12,
    targetWord: 'a pupil',
    turkishMeaning: 'Öğrenci (Erkek)',
    options: ['books', 'a kid', 'a pupil'],
    themeColor: 'pink',
    sceneType: 'pupil_boy'
  },
  {
    id: 'sl-13',
    number: 13,
    targetWord: 'books',
    turkishMeaning: 'Ders Kitapları / Kitaplar',
    options: ['classroom', 'books', 'a library'],
    themeColor: 'orange',
    sceneType: 'books'
  },
  {
    id: 'sl-14',
    number: 14,
    targetWord: 'a library',
    turkishMeaning: 'Kütüphane Okuma Köşesi',
    options: ['a school', "a teacher's room", 'a library'],
    themeColor: 'blue',
    sceneType: 'library_reading'
  },
  {
    id: 'sl-15',
    number: 15,
    targetWord: 'a school',
    turkishMeaning: 'Okul Binası',
    options: ['a sports hall', 'a playground', 'a school'],
    themeColor: 'yellow',
    sceneType: 'school'
  }
];

// Helper: Text-to-speech pronunciation
export const speakEnglishWord = (text: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }
};

const normalizeWord = (w: string) => w.trim().toLowerCase().replace(/’/g, "'");

// Vector Illustrations matching high-fidelity worksheet design
const SceneIllustration: React.FC<{ type: SchoolLifeItem['sceneType']; className?: string }> = ({ type, className = '' }) => {
  switch (type) {
    // 1. CLASSROOM
    case 'classroom':
      return (
        <div className={`relative w-full h-full bg-[#fdfaf2] flex flex-col items-center justify-between p-2 overflow-hidden ${className}`}>
          {/* Header Banner */}
          <div className="absolute top-1 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none z-10">
            <div className="bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
              <span>🇹🇷</span>
              <span>CLASSROOM 1-A</span>
            </div>
          </div>
          {/* Akıllı Tahta */}
          <div className="w-[84%] h-[46%] mt-3 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg border-4 border-slate-700 shadow-md flex flex-col items-center justify-center relative">
            <span className="text-emerald-400 font-mono text-[10px] tracking-wider uppercase font-bold">ABC • 1 2 3</span>
            <div className="w-20 h-0.5 bg-cyan-400/60 rounded-full mt-0.5" />
            <div className="absolute bottom-1 right-2 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
          </div>
          {/* Öğrenci Sıraları & Öğrenciler */}
          <div className="w-full flex items-end justify-around px-2 z-10 mb-0.5">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-amber-900 shadow-xs" />
              <div className="w-7 h-4 bg-purple-500 rounded-t-md -mt-1" />
              <div className="w-9 h-3.5 bg-amber-200 border border-amber-400 rounded-xs shadow-xs" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-amber-950 shadow-xs" />
              <div className="w-7 h-4 bg-sky-500 rounded-t-md -mt-1" />
              <div className="w-9 h-3.5 bg-amber-200 border border-amber-400 rounded-xs shadow-xs" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-yellow-900 shadow-xs" />
              <div className="w-7 h-4 bg-rose-500 rounded-t-md -mt-1" />
              <div className="w-9 h-3.5 bg-amber-200 border border-amber-400 rounded-xs shadow-xs" />
            </div>
          </div>
        </div>
      );

    // 2. A KID
    case 'kid':
      return (
        <div className={`relative w-full h-full bg-[#fefce8] flex flex-col items-center justify-end p-2 overflow-hidden ${className}`}>
          {/* Güneş ve Uçan Balonlar Arka Planı */}
          <div className="absolute top-1 inset-x-2 flex justify-between items-center opacity-80 pointer-events-none">
            <span className="text-xl">☀️</span>
            <span className="text-xs">🎈</span>
            <span className="text-sm">✨</span>
          </div>
          {/* Sevimli Küçük Çocuk */}
          <div className="relative z-10 flex flex-col items-center mb-1">
            {/* Şapka */}
            <div className="w-10 h-4 bg-amber-500 rounded-t-full relative shadow-xs">
              <div className="absolute -right-2 top-2 w-4 h-1.5 bg-amber-600 rounded-r-full" />
            </div>
            {/* Kafa */}
            <div className="w-10 h-10 bg-amber-100 rounded-full -mt-2 border border-amber-300 flex flex-col items-center justify-center relative shadow-sm">
              <div className="flex gap-2.5 -mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>
              <div className="w-3 h-1.5 border-b-2 border-rose-500 rounded-full mt-1" />
              {/* Yanaklar */}
              <div className="absolute left-1 top-5 w-2 h-1 bg-rose-300/60 rounded-full" />
              <div className="absolute right-1 top-5 w-2 h-1 bg-rose-300/60 rounded-full" />
            </div>
            {/* Sarı Tişört & Küçük Çanta */}
            <div className="w-12 h-9 bg-yellow-400 border border-yellow-500 rounded-t-xl shadow-xs flex items-center justify-center relative -mt-0.5">
              <span className="text-[10px] font-black text-slate-800">⭐</span>
              <div className="absolute -left-2 top-1 w-2.5 h-5 bg-rose-500 rounded-l-md shadow-xs" />
            </div>
            {/* Şort & Ayakkabılar */}
            <div className="w-10 h-4 bg-sky-600 rounded-b-md" />
            <div className="flex gap-2.5 mt-0.5">
              <div className="w-3 h-2 bg-rose-500 rounded-full" />
              <div className="w-3 h-2 bg-rose-500 rounded-full" />
            </div>
          </div>
        </div>
      );

    // 3. A SPORTS HALL
    case 'sports_hall':
      return (
        <div className={`relative w-full h-full bg-[#f0f9ff] flex flex-col items-center justify-between p-2 overflow-hidden ${className}`}>
          {/* Tavan Işıkları & Çizgiler */}
          <div className="w-full flex items-center justify-around pt-0.5 opacity-70">
            <div className="w-6 h-1 bg-blue-300 rounded-full" />
            <div className="w-8 h-1 bg-blue-400 rounded-full" />
            <div className="w-6 h-1 bg-blue-300 rounded-full" />
          </div>
          {/* Basketbol Potası & Top */}
          <div className="relative w-full flex items-center justify-center -my-1">
            <div className="relative flex flex-col items-center">
              {/* Pota Arkalığı */}
              <div className="w-14 h-10 bg-white border-2 border-slate-700 shadow-sm flex items-center justify-center relative">
                <div className="w-6 h-4 border border-rose-500" />
                {/* Çember ve File */}
                <div className="absolute bottom-0 w-7 h-1.5 bg-orange-600 rounded-full" />
                <div className="absolute -bottom-3 w-6 h-3 border-x border-b border-dashed border-slate-400 bg-white/40" />
              </div>
            </div>
            {/* Zıplayan Basketbol Topu */}
            <div className="absolute right-4 bottom-2 text-2xl animate-bounce">
              🏀
            </div>
            {/* Voleybol Topu */}
            <div className="absolute left-4 bottom-1 text-xl">
              🏐
            </div>
          </div>
          {/* Parke Ahşap Zemin */}
          <div className="w-full h-7 bg-amber-200 border-t-2 border-amber-400 flex flex-col justify-around px-2 relative">
            <div className="w-full h-0.5 bg-white/80" />
            <div className="w-12 h-6 border-2 border-white/70 rounded-full mx-auto -mt-3 pointer-events-none" />
          </div>
        </div>
      );

    // 4. A TEACHER (FEMALE)
    case 'teacher_female':
      return (
        <div className={`relative w-full h-full bg-[#fcf5f8] flex flex-col items-center justify-end p-2 overflow-hidden ${className}`}>
          {/* Arka Planda Ders Tahtası */}
          <div className="absolute top-2 inset-x-3 h-[56%] bg-emerald-800 rounded-lg border-2 border-emerald-950 flex flex-col items-center justify-start pt-1.5">
            <span className="text-emerald-200 font-bold text-[9px] tracking-wider uppercase">Lesson 1: English</span>
            <span className="text-white/70 text-[8px] mt-0.5">Welcome Class! ✏️</span>
          </div>
          {/* Kadın Öğretmen */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Topuz Saç & Gözlük */}
            <div className="relative flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-amber-800 -mb-2 shadow-xs" />
              <div className="w-11 h-8 bg-amber-700 rounded-t-full shadow-xs" />
              <div className="w-9 h-9 bg-amber-100 rounded-full -mt-4 border border-amber-200 flex flex-col items-center justify-center relative shadow-sm">
                <div className="flex items-center gap-1 -mt-1">
                  <div className="w-3 h-3 rounded-full border-2 border-rose-500 bg-rose-100/40" />
                  <div className="w-1 h-0.5 bg-rose-500" />
                  <div className="w-3 h-3 rounded-full border-2 border-rose-500 bg-rose-100/40" />
                </div>
                <div className="w-2.5 h-1 border-b-2 border-rose-600 rounded-full mt-1" />
              </div>
            </div>
            {/* Kıyafet & Elinde Kitap */}
            <div className="relative flex items-center justify-center -mt-1">
              <div className="w-13 h-14 bg-rose-500 border border-rose-600 rounded-t-xl shadow-md flex items-center justify-center relative">
                <div className="w-3 h-6 bg-white border border-rose-300 rounded-xs" />
                {/* Kitap */}
                <div className="absolute -left-2 top-2 w-5 h-6 bg-cyan-600 border border-cyan-800 rounded-xs shadow flex items-center justify-center text-[8px] text-white font-bold">
                  📖
                </div>
              </div>
            </div>
            <div className="w-12 h-4 bg-slate-800 rounded-b-md" />
          </div>
        </div>
      );

    // 5. A PUPIL (GIRL)
    case 'pupil_girl':
      return (
        <div className={`relative w-full h-full bg-[#fdf2f8] flex flex-col items-center justify-end p-2 overflow-hidden ${className}`}>
          {/* Okul Sınıfı Panosu */}
          <div className="absolute top-2 inset-x-3 h-[52%] bg-sky-700 rounded-lg border-2 border-sky-900 flex items-center justify-center">
            <span className="text-sky-100 text-[10px] font-bold">PRIMARY SCHOOL</span>
          </div>
          {/* Kız Öğrenci */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Çift Örgülü Saç & Fiyonklar */}
            <div className="relative flex items-center justify-center">
              <div className="absolute -left-2.5 top-0 w-3.5 h-3.5 bg-amber-950 rounded-full border border-pink-400" />
              <div className="absolute -right-2.5 top-0 w-3.5 h-3.5 bg-amber-950 rounded-full border border-pink-400" />
              <div className="w-10 h-10 bg-amber-100 rounded-full border border-amber-300 flex flex-col items-center justify-center shadow-sm">
                <div className="flex gap-2 -mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                </div>
                <div className="w-2.5 h-1 bg-rose-400 rounded-full mt-1" />
              </div>
            </div>
            {/* Üniforma ve Sırt Çantası */}
            <div className="w-11 h-7 bg-pink-500 rounded-t-lg border border-pink-600 shadow-xs flex items-center justify-center">
              <span className="text-[9px]">🎒</span>
            </div>
            <div className="w-12 h-6 bg-indigo-600 rounded-b-md shadow-xs" />
            <div className="flex gap-2 mt-0.5">
              <div className="w-2.5 h-1.5 bg-rose-600 rounded-full" />
              <div className="w-2.5 h-1.5 bg-rose-600 rounded-full" />
            </div>
          </div>
        </div>
      );

    // 6. A TEACHER'S ROOM
    case 'teachers_room':
      return (
        <div className={`relative w-full h-full bg-[#faf5ff] flex flex-col items-center justify-between p-2 overflow-hidden ${className}`}>
          {/* Tabela */}
          <div className="w-full bg-purple-700 text-white font-black text-[9px] py-0.5 rounded text-center uppercase tracking-wider shadow-xs">
            ☕ Teacher’s Room • Öğretmenler Odası 📋
          </div>
          {/* Dinlenme Koltuğu & Kahve Masası */}
          <div className="w-full flex items-center justify-around my-auto px-2">
            {/* Koltuk */}
            <div className="w-14 h-12 bg-purple-400 border-2 border-purple-600 rounded-t-xl shadow-md flex flex-col items-center justify-center relative">
              <div className="w-11 h-4 bg-purple-300 rounded-xs mb-1" />
              <div className="w-full h-3 bg-purple-500 rounded-b-lg" />
            </div>
            {/* Sehpa & Kahve Fincanı */}
            <div className="flex flex-col items-center">
              <span className="text-xl animate-pulse">☕</span>
              <div className="w-12 h-4 bg-amber-700 rounded-t-md shadow" />
              <div className="flex justify-between w-10">
                <div className="w-1 h-3 bg-amber-900" />
                <div className="w-1 h-3 bg-amber-900" />
              </div>
            </div>
            {/* Dosya Dolabı */}
            <div className="w-10 h-14 bg-slate-300 border border-slate-500 rounded-xs flex flex-col justify-around p-1 shadow">
              <div className="w-full h-2.5 bg-rose-400 rounded-xs" />
              <div className="w-full h-2.5 bg-sky-400 rounded-xs" />
              <div className="w-full h-2.5 bg-emerald-400 rounded-xs" />
            </div>
          </div>
          {/* Halı */}
          <div className="w-full h-3 bg-purple-200 border-t border-purple-300 rounded-t-lg" />
        </div>
      );

    // 7. A GARDEN
    case 'garden':
      return (
        <div className={`relative w-full h-full bg-gradient-to-b from-sky-200 via-emerald-100 to-emerald-200 flex flex-col items-center justify-between p-2 overflow-hidden ${className}`}>
          {/* Gökyüzü ve Kuşlar */}
          <div className="w-full flex items-center justify-between px-2 pt-0.5">
            <span className="text-xl">☀️</span>
            <span className="text-xs opacity-70">🕊️ 🌸</span>
            <span className="text-sm">🦋</span>
          </div>
          {/* Ağaç & Çiçekler & Ahşap Bank */}
          <div className="relative w-full flex items-end justify-around my-auto">
            {/* Ağaç */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-emerald-600 rounded-full border-2 border-emerald-700 shadow-sm flex items-center justify-center text-xs">
                🍎
              </div>
              <div className="w-3.5 h-6 bg-amber-800 -mt-1 rounded-b-xs" />
            </div>
            {/* Ahşap Bank */}
            <div className="flex flex-col items-center mb-1">
              <div className="w-12 h-2.5 bg-amber-600 border border-amber-800 rounded-xs" />
              <div className="flex justify-between w-10 mt-0.5">
                <div className="w-1 h-3 bg-amber-900" />
                <div className="w-1 h-3 bg-amber-900" />
              </div>
            </div>
            {/* Çiçekler */}
            <div className="text-xl mb-1">
              🌷🌼
            </div>
          </div>
          {/* Çimenlik Zemin */}
          <div className="w-full h-4 bg-emerald-500 rounded-t-xl flex items-center justify-around px-2 text-[8px]">
            <span>🌱</span>
            <span>🌿</span>
            <span>🌱</span>
          </div>
        </div>
      );

    // 8. A LIBRARY
    case 'library':
      return (
        <div className={`relative w-full h-full bg-[#fdf5e6] flex flex-col items-center justify-between p-2 overflow-hidden ${className}`}>
          {/* Kütüphane Kitaplıkları */}
          <div className="w-full h-[76%] bg-[#d99859] border-2 border-[#b87c42] rounded-lg p-1.5 flex flex-col justify-around shadow-md">
            {/* Raf 1 */}
            <div className="w-full h-6 bg-[#f5dfbb] border-b-2 border-[#b87c42] flex items-end gap-1 px-1 overflow-hidden">
              <span className="w-2 h-5 bg-rose-500 rounded-t-xs" />
              <span className="w-2.5 h-5 bg-sky-500 rounded-t-xs" />
              <span className="w-2 h-4.5 bg-emerald-500 rounded-t-xs" />
              <span className="w-3 h-5 bg-amber-500 rounded-t-xs" />
              <span className="w-2 h-4 bg-purple-500 rounded-t-xs" />
              <span className="w-2.5 h-5 bg-indigo-500 rounded-t-xs" />
              <span className="w-2 h-4.5 bg-teal-500 rounded-t-xs" />
            </div>
            {/* Raf 2 */}
            <div className="w-full h-6 bg-[#f5dfbb] border-b-2 border-[#b87c42] flex items-end gap-1 px-1 overflow-hidden">
              <span className="w-3 h-5 bg-blue-600 rounded-t-xs" />
              <span className="w-2 h-4.5 bg-yellow-500 rounded-t-xs" />
              <span className="w-2.5 h-5 bg-red-500 rounded-t-xs" />
              <span className="w-2 h-4 bg-green-600 rounded-t-xs" />
              <span className="w-3 h-5 bg-pink-500 rounded-t-xs" />
              <span className="w-2.5 h-5 bg-orange-500 rounded-t-xs" />
            </div>
          </div>
          {/* Çalışma Masası ve Kitap */}
          <div className="w-[75%] h-5 bg-[#c4824d] border border-[#8a5225] rounded-t-md shadow flex items-center justify-center gap-2">
            <span className="text-[10px]">📖</span>
            <span className="text-[9px]">💡</span>
          </div>
        </div>
      );

    // 9. A PLAYGROUND
    case 'playground':
      return (
        <div className={`relative w-full h-full bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-200 flex flex-col items-center justify-between p-1.5 overflow-hidden ${className}`}>
          {/* Güneş & Bulut */}
          <div className="w-full flex items-center justify-between px-2 pt-1 z-0">
            <span className="text-xl">☀️</span>
            <span className="text-sm opacity-80">☁️</span>
          </div>
          {/* Kaydırak ve Salıncak */}
          <div className="relative z-10 w-full flex items-end justify-center gap-3 mb-1">
            {/* Salıncak */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-1 bg-amber-700" />
              <div className="flex justify-between w-8 h-10">
                <div className="w-0.5 h-full bg-slate-500" />
                <div className="w-0.5 h-full bg-slate-500" />
              </div>
              <div className="w-6 h-1.5 bg-rose-500 rounded-xs -mt-1 shadow" />
            </div>
            {/* Kaydıraklı Oyun Kulesi */}
            <div className="flex flex-col items-center">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[12px] border-b-amber-500" />
              <div className="w-8 h-7 bg-cyan-400 border border-cyan-600 flex items-center justify-center text-xs">
                🏰
              </div>
              <div className="w-8 h-5 bg-amber-400 flex justify-around items-center">
                <span className="w-1 h-full bg-amber-700" />
                <span className="w-1 h-full bg-amber-700" />
              </div>
            </div>
            {/* Kaydırak Yolu */}
            <div className="w-7 h-9 border-r-4 border-b-4 border-blue-500 rounded-br-2xl transform -rotate-12 -ml-2" />
          </div>
          {/* Çim Zemin */}
          <div className="w-full h-4 bg-emerald-500 rounded-t-xl flex items-center justify-around px-2 text-[8px]">
            <span>🌼</span>
            <span>🌱</span>
            <span>🌸</span>
          </div>
        </div>
      );

    // 10. A BOY
    case 'boy':
      return (
        <div className={`relative w-full h-full bg-[#eff6ff] flex flex-col items-center justify-end p-2 overflow-hidden ${className}`}>
          {/* Spor Futbol Köşesi */}
          <div className="absolute top-1 inset-x-2 flex justify-between items-center opacity-80 pointer-events-none">
            <span className="text-base">⚽</span>
            <span className="text-sm">🧢</span>
            <span className="text-base">🏆</span>
          </div>
          {/* Neşeli Erkek Çocuk */}
          <div className="relative z-10 flex flex-col items-center mb-1">
            {/* Saç ve Kafa */}
            <div className="w-10 h-7 bg-amber-950 rounded-t-full shadow-xs" />
            <div className="w-9 h-9 bg-amber-100 rounded-full -mt-4 border border-amber-300 flex flex-col items-center justify-center relative shadow-sm">
              <div className="flex gap-2.5 -mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>
              <div className="w-3 h-1 border-b-2 border-rose-500 rounded-full mt-1" />
            </div>
            {/* Mavi Spor Tişört & Sırt Çantası */}
            <div className="w-12 h-9 bg-blue-500 border border-blue-600 rounded-t-xl shadow-xs flex items-center justify-center relative -mt-0.5">
              <span className="text-white text-[9px] font-black">7</span>
              <div className="absolute -right-2 top-1 w-2.5 h-6 bg-amber-500 rounded-r-md shadow-xs" />
            </div>
            {/* Kot Şort & Spor Ayakkabılar */}
            <div className="w-10 h-4 bg-slate-700 rounded-b-md" />
            <div className="flex gap-2.5 mt-0.5">
              <div className="w-3 h-2 bg-blue-600 rounded-full" />
              <div className="w-3 h-2 bg-blue-600 rounded-full" />
            </div>
          </div>
        </div>
      );

    // 11. A TEACHER (MALE)
    case 'teacher_male':
      return (
        <div className={`relative w-full h-full bg-[#fdfaf2] flex flex-col items-center justify-end p-2 overflow-hidden ${className}`}>
          {/* Akıllı Tahta */}
          <div className="absolute top-2 inset-x-3 h-[58%] bg-slate-800 rounded-lg border-2 border-slate-600 flex items-start justify-center pt-1.5">
            <span className="text-amber-300 font-mono text-[9px] tracking-wider uppercase font-bold">Mr. Smith • Teacher</span>
          </div>
          {/* Erkek Öğretmen Karakteri */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Saç & Kafa & Gözlük */}
            <div className="relative flex flex-col items-center">
              <div className="w-10 h-7 bg-amber-900 rounded-t-full shadow-xs" />
              <div className="w-9 h-9 bg-amber-100 rounded-full -mt-4 border border-amber-200 flex flex-col items-center justify-center relative shadow-sm">
                <div className="flex items-center gap-1 -mt-1">
                  <div className="w-3 h-3 rounded-full border-2 border-cyan-600 bg-cyan-100/40" />
                  <div className="w-1 h-0.5 bg-cyan-600" />
                  <div className="w-3 h-3 rounded-full border-2 border-cyan-600 bg-cyan-100/40" />
                </div>
                <div className="w-2.5 h-1 border-b-2 border-rose-500 rounded-full mt-1" />
              </div>
            </div>
            {/* Gövde: Mavi kravat ve Ceket */}
            <div className="relative flex items-center justify-center -mt-1">
              <div className="w-14 h-14 bg-slate-800 border-2 border-slate-700 rounded-t-xl shadow-md flex flex-col items-center pt-1">
                <div className="w-2.5 h-6 bg-cyan-400 rotate-45 transform rounded-xs" />
                <div className="w-0.5 h-5 bg-white/70 mt-0.5" />
              </div>
            </div>
            <div className="w-12 h-3 bg-slate-900 rounded-b-md" />
          </div>
        </div>
      );

    // 12. A PUPIL (BOY AT DESK)
    case 'pupil_boy':
      return (
        <div className={`relative w-full h-full bg-[#fefce8] flex flex-col items-center justify-end p-2 overflow-hidden ${className}`}>
          {/* Tahta Arka Planı */}
          <div className="absolute top-2 inset-x-3 h-[46%] bg-emerald-800 rounded-lg border-2 border-emerald-950 flex items-center justify-center">
            <span className="text-emerald-200 text-[10px] font-bold">1 + 1 = 2 🌟</span>
          </div>
          {/* Sırada Parmak Kaldıran Erkek Öğrenci */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Kafa ve Parmak Kaldıran El */}
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 bg-amber-100 rounded-full border border-amber-300 flex flex-col items-center justify-center shadow-sm">
                <div className="w-9 h-4 bg-amber-900 rounded-t-full -mt-4 shadow-xs" />
                <div className="flex gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                </div>
                <div className="w-2.5 h-1 bg-rose-400 rounded-full mt-1" />
              </div>
              {/* Parmak Kaldıran El */}
              <div className="absolute -right-3 -top-2 flex flex-col items-center">
                <span className="text-sm">✋</span>
              </div>
            </div>
            {/* Öğrenci Sırası ve Defter */}
            <div className="w-16 h-8 bg-amber-300 border-2 border-amber-500 rounded-t-md shadow flex items-center justify-around px-1 mt-1">
              <span className="text-[10px]">📝</span>
              <span className="text-[9px]">✏️</span>
            </div>
            <div className="w-16 h-2 bg-amber-700 rounded-b-xs" />
          </div>
        </div>
      );

    // 13. BOOKS
    case 'books':
      return (
        <div className={`relative w-full h-full bg-[#fffbeb] flex flex-col items-center justify-between p-2 overflow-hidden ${className}`}>
          {/* Başlık Etiketi */}
          <div className="w-full bg-amber-500 text-slate-950 font-black text-[9px] py-0.5 rounded text-center uppercase tracking-wider shadow-xs">
            📚 Textbooks & School Books 📖
          </div>
          {/* Üst Üste Renkli Kitaplar */}
          <div className="w-full flex flex-col items-center justify-center my-auto">
            {/* Üstteki Açık Kitap */}
            <div className="text-3xl animate-bounce mb-1">
              📖
            </div>
            {/* Kitap Yığını */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-20 h-3.5 bg-rose-500 border border-rose-700 rounded-xs shadow flex items-center px-1">
                <span className="text-[7px] text-white font-bold">ENGLISH 1</span>
              </div>
              <div className="w-22 h-4 bg-blue-500 border border-blue-700 rounded-xs shadow flex items-center px-1">
                <span className="text-[7px] text-white font-bold">MATHS</span>
              </div>
              <div className="w-24 h-4.5 bg-emerald-500 border border-emerald-700 rounded-xs shadow flex items-center px-1">
                <span className="text-[7px] text-white font-bold">SCIENCE</span>
              </div>
              <div className="w-26 h-5 bg-amber-500 border border-amber-700 rounded-xs shadow flex items-center px-1">
                <span className="text-[7px] text-slate-950 font-bold">DICTIONARY</span>
              </div>
            </div>
          </div>
          {/* Cetvel ve Kalem Altlığı */}
          <div className="w-full flex items-center justify-center gap-2 text-xs opacity-80">
            <span>📏</span>
            <span>✏️</span>
            <span>🔖</span>
          </div>
        </div>
      );

    // 14. A LIBRARY (READING CORNER)
    case 'library_reading':
      return (
        <div className={`relative w-full h-full bg-[#fefce8] flex flex-col items-center justify-between p-2 overflow-hidden ${className}`}>
          {/* Tabela */}
          <div className="w-full bg-indigo-700 text-white font-black text-[9px] py-0.5 rounded text-center uppercase tracking-wider shadow-xs">
            Quiet Reading Corner • Okuma Alanı 🤫
          </div>
          {/* Kitaplık ve Rahat Minderler */}
          <div className="w-full flex items-center justify-around my-auto px-1">
            {/* Alçak Kitaplık */}
            <div className="w-16 h-14 bg-amber-300 border-2 border-amber-500 rounded-md p-1 flex flex-col justify-around shadow">
              <div className="flex gap-1 items-end h-5 bg-amber-100 rounded-xs px-0.5">
                <span className="w-2 h-4 bg-rose-500" />
                <span className="w-2 h-3.5 bg-sky-500" />
                <span className="w-2.5 h-4.5 bg-green-500" />
              </div>
              <div className="flex gap-1 items-end h-5 bg-amber-100 rounded-xs px-0.5">
                <span className="w-2.5 h-4 bg-purple-500" />
                <span className="w-2 h-3 bg-amber-500" />
                <span className="w-2 h-4 bg-teal-500" />
              </div>
            </div>
            {/* Okuma Minderi / Armut Koltuk */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-10 bg-rose-400 border-2 border-rose-600 rounded-full shadow-md flex items-center justify-center text-xs">
                🛋️
              </div>
              <span className="text-[8px] font-bold text-slate-700 mt-0.5">Read & Dream</span>
            </div>
          </div>
          {/* Zemin Halısı */}
          <div className="w-full h-3 bg-indigo-200 border-t border-indigo-300 rounded-t-lg" />
        </div>
      );

    // 15. A SCHOOL (BUILDING EXTERIOR)
    case 'school':
      return (
        <div className={`relative w-full h-full bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-200 flex flex-col items-center justify-between p-1.5 overflow-hidden ${className}`}>
          {/* Güneş ve Gökyüzü */}
          <div className="w-full flex items-center justify-between px-2 pt-0.5">
            <span className="text-xl">☀️</span>
            <span className="text-xs">☁️</span>
            <span className="text-sm">🦅</span>
          </div>
          {/* Okul Binası */}
          <div className="relative w-full flex items-end justify-center mb-1">
            {/* Sol Ağaç */}
            <div className="text-xl -mr-1 z-10">🌳</div>
            {/* Okul Ana Gövde */}
            <div className="flex flex-col items-center">
              {/* Saat Kulesi & Türk Bayrağı */}
              <div className="flex items-center gap-1 mb-0.5">
                <div className="w-7 h-5 bg-red-600 rounded-t-md border border-red-700 flex items-center justify-center text-[8px] text-white font-bold shadow-xs">
                  ⏰ 12:00
                </div>
                <div className="flex items-center">
                  <div className="w-0.5 h-6 bg-slate-400" />
                  <div className="w-4 h-3 bg-red-600 border border-red-700 flex items-center justify-center text-[7px] text-white font-bold -ml-0.5">
                    🇹🇷
                  </div>
                </div>
              </div>
              {/* Çatı Üçgeni */}
              <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[18px] border-b-rose-700" />
              {/* Ana Bina & Pencereler */}
              <div className="w-32 h-16 bg-amber-100 border-2 border-amber-400 shadow-md flex flex-col justify-between p-1">
                {/* Pencereler */}
                <div className="flex justify-around">
                  <div className="w-4 h-4 bg-sky-300 border border-sky-500 rounded-xs" />
                  <div className="w-4 h-4 bg-sky-300 border border-sky-500 rounded-xs" />
                  <div className="w-4 h-4 bg-sky-300 border border-sky-500 rounded-xs" />
                </div>
                {/* Okul Giriş Kapısı ve Merdivenler */}
                <div className="flex items-end justify-center">
                  <div className="w-6 h-7 bg-amber-800 border border-amber-950 rounded-t-md flex items-center justify-center">
                    <div className="w-1 h-1 bg-amber-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            {/* Sağ Ağaç */}
            <div className="text-xl -ml-1 z-10">🌲</div>
          </div>
          {/* Okul Bahçesi Çimen */}
          <div className="w-full h-4 bg-emerald-600 rounded-t-xl flex items-center justify-around px-2 text-[8px] text-white font-bold">
            <span>🏫 SCHOOL</span>
          </div>
        </div>
      );

    default:
      return null;
  }
};

// Color theme classes for the pill buttons matching the worksheet
const getPillThemeClasses = (color: SchoolLifeItem['themeColor'], isSelected: boolean, isCorrect: boolean, isWrong: boolean) => {
  if (isSelected && isCorrect) {
    return 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 scale-102';
  }
  if (isSelected && isWrong) {
    return 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-300 animate-shake';
  }

  switch (color) {
    case 'yellow':
      return 'bg-[#fef08a] hover:bg-[#fde047] text-slate-900 border-[#eab308]';
    case 'blue':
      return 'bg-[#38bdf8] hover:bg-[#0ea5e9] text-slate-950 border-[#0284c7] font-bold';
    case 'purple':
      return 'bg-[#c084fc] hover:bg-[#a855f7] text-slate-950 border-[#9333ea] font-bold';
    case 'green':
      return 'bg-[#6ee7b7] hover:bg-[#34d399] text-slate-950 border-[#059669] font-bold';
    case 'orange':
      return 'bg-[#fdba74] hover:bg-[#fb923c] text-slate-950 border-[#ea580c] font-bold';
    case 'pink':
      return 'bg-[#f472b6] hover:bg-[#ec4899] text-slate-950 border-[#db2777] font-bold';
    default:
      return 'bg-amber-100 hover:bg-amber-200 text-slate-900 border-amber-300';
  }
};

interface SchoolLifeGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string, onEnded?: () => void) => void;
  students?: Student[];
  selectedStudentIds?: (string | null)[];
  onSelectStudentForPlayer?: (pIdx: number, id: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, pIdx?: number) => void;
  onGameCompleted?: (winnerIdx: number, pCount: number) => void;
  playerCountMode?: 1 | 2 | 3;
  onSwitchPlayerCountMode?: (mode: 1 | 2 | 3) => void;
}

export const SchoolLifeGame: React.FC<SchoolLifeGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  students = [],
  selectedStudentIds = [null, null, null],
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted,
  playerCountMode = 1,
  onSwitchPlayerCountMode
}) => {
  const [playerMode, setPlayerMode] = useState<1 | 2 | 3>(playerCountMode || 1);
  const [showTurkishHints, setShowTurkishHints] = useState<boolean>(false);
  const [soundEnabled] = useState<boolean>(true);

  // Sync playerMode with top app header playerCountMode
  useEffect(() => {
    if (playerCountMode && (playerCountMode === 1 || playerCountMode === 2 || playerCountMode === 3)) {
      if (playerCountMode !== playerMode) {
        setPlayerMode(playerCountMode);
      }
    }
  }, [playerCountMode, playerMode]);

  // Per-player state: question index, score, streak, lives, selected option, feedback
  const [playerStates, setPlayerStates] = useState([
    { questionIndex: 0, score: 0, streak: 0, lives: 3, selectedOption: null as string | null, feedback: null as 'correct' | 'wrong' | null },
    { questionIndex: 0, score: 0, streak: 0, lives: 3, selectedOption: null as string | null, feedback: null as 'correct' | 'wrong' | null },
    { questionIndex: 0, score: 0, streak: 0, lives: 3, selectedOption: null as string | null, feedback: null as 'correct' | 'wrong' | null }
  ]);

  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Trigger sound effect
  const triggerAudio = useCallback((src: string) => {
    if (soundEnabled && playMp3) {
      playMp3(src);
    }
  }, [soundEnabled, playMp3]);

  // Handle option select for a player
  const handleSelectOption = (playerIdx: number, option: string) => {
    const pState = playerStates[playerIdx];
    if (pState.feedback !== null) return; // Wait for transition

    const currentItem = SCHOOL_LIFE_ITEMS[pState.questionIndex % SCHOOL_LIFE_ITEMS.length];
    const isCorrect = normalizeWord(option) === normalizeWord(currentItem.targetWord);

    // Speak native English pronunciation
    speakEnglishWord(option);

    if (isCorrect) {
      triggerAudio('/dogru.mp3');
      if (onQuestionAnswered) onQuestionAnswered(true, playerIdx);

      setPlayerStates(prev => {
        const next = [...prev];
        next[playerIdx] = {
          ...next[playerIdx],
          score: next[playerIdx].score + 10,
          streak: next[playerIdx].streak + 1,
          selectedOption: option,
          feedback: 'correct'
        };
        return next;
      });

      // Confetti burst on streak
      if (pState.streak + 1 >= 3) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      }

      // Advance to next question
      setTimeout(() => {
        setPlayerStates(prev => {
          const next = [...prev];
          const nextQIdx = next[playerIdx].questionIndex + 1;
          
          // Check if all 15 questions completed
          if (nextQIdx >= SCHOOL_LIFE_ITEMS.length) {
            setIsGameOver(true);
            triggerAudio('/kazandin.mp3');
            if (onGameCompleted) onGameCompleted(playerIdx, playerMode);
          }

          next[playerIdx] = {
            ...next[playerIdx],
            questionIndex: nextQIdx,
            selectedOption: null,
            feedback: null
          };
          return next;
        });
      }, 1000);

    } else {
      triggerAudio('/yanlis.mp3');
      if (onQuestionAnswered) onQuestionAnswered(false, playerIdx);

      setPlayerStates(prev => {
        const next = [...prev];
        const newLives = Math.max(0, next[playerIdx].lives - 1);

        next[playerIdx] = {
          ...next[playerIdx],
          streak: 0,
          lives: newLives,
          selectedOption: option,
          feedback: 'wrong'
        };
        return next;
      });

      // Clear wrong feedback to allow retry
      setTimeout(() => {
        setPlayerStates(prev => {
          const next = [...prev];
          next[playerIdx] = {
            ...next[playerIdx],
            selectedOption: null,
            feedback: null
          };
          return next;
        });
      }, 900);
    }
  };

  // Reset / Replay
  const handleRestart = () => {
    setIsGameOver(false);
    setPlayerStates([
      { questionIndex: 0, score: 0, streak: 0, lives: 3, selectedOption: null, feedback: null },
      { questionIndex: 0, score: 0, streak: 0, lives: 3, selectedOption: null, feedback: null },
      { questionIndex: 0, score: 0, streak: 0, lives: 3, selectedOption: null, feedback: null }
    ]);
    triggerAudio('/op.mp3');
  };

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white"
    >
      {/* 1. CINEMATIC BACKGROUND IMAGE (/dere3.webp) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.webp" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center pointer-events-none select-none filter brightness-95" 
        />
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      </div>

      {/* 2. TOP UNIFIED NAVIGATION & ACTION BAR */}
      <header className="relative z-20 shrink-0 bg-[#080e1d]/90 border-b border-amber-400/40 shadow-md px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2">
        {/* Left: Go Back & Home */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onGoHome && (
            <button
              onClick={() => { triggerAudio('/op.mp3'); onGoHome(); }}
              className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-400/50 shadow-sm transition-all cursor-pointer flex items-center gap-1"
              title="Ana Sayfa"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => { triggerAudio('/op.mp3'); onClose(); }}
            className="px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-sm transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Geri</span>
          </button>
        </div>

        {/* Center: Title Capsule Matching Worksheet */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/60 shadow-inner">
          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
            1
          </div>
          <span className="font-black text-xs sm:text-sm md:text-base text-amber-300 uppercase tracking-wide flex items-center gap-1">
            <span>School Life</span>
            <span className="text-white/60">•</span>
            <span className="text-white text-[11px] sm:text-xs">Choose and</span>
            <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-xs">✓</span>
          </span>
        </div>

        {/* Right: Turkish Hint & Activity Next */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Turkish hint button */}
          <button
            onClick={() => {
              triggerAudio('/op.mp3');
              setShowTurkishHints(!showTurkishHints);
            }}
            className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showTurkishHints 
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm' 
                : 'bg-slate-800/90 text-amber-300 border-amber-400/40 hover:bg-slate-700'
            }`}
            title="Türkçe Anlam İpucu"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Türkçe İpucu</span>
          </button>

          {/* Activity Next */}
          {onNextActivity && (
            <button
              onClick={() => { triggerAudio('/op.mp3'); onNextActivity(); }}
              className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400 shadow-sm transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Sonraki Etkinlik"
            >
              <span className="hidden sm:inline">İleri</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 3. MAIN ARENA WORKSPACE */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2.5 flex items-stretch justify-center gap-2 overflow-hidden min-h-0">
        {Array.from({ length: playerMode }).map((_, pIdx) => {
          const pState = playerStates[pIdx];
          const currentItem = SCHOOL_LIFE_ITEMS[pState.questionIndex % SCHOOL_LIFE_ITEMS.length];
          const assignedStudentId = selectedStudentIds[pIdx];
          const studentObj = students.find(s => s.id === assignedStudentId);

          return (
            <div 
              key={pIdx}
              className={`flex-1 flex flex-col justify-between p-2 sm:p-3 bg-[#0b1328]/95 border-2 ${
                pIdx === 0 ? 'border-amber-400/80' : pIdx === 1 ? 'border-cyan-400/80' : 'border-purple-400/80'
              } shadow-[0_12px_36px_rgba(0,0,0,0.85)] rounded-2xl sm:rounded-3xl overflow-hidden min-h-0 relative`}
            >
              {/* PLAYER TOP CAPSULE */}
              <div className="flex items-center justify-between gap-1 mb-1.5 shrink-0 h-8">
                {/* Avatar & Student Name */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {studentObj ? (
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                      {studentObj.avatar}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600 text-slate-200 font-black text-xs flex items-center justify-center">
                      {pIdx + 1}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-black text-xs text-white truncate">
                      {studentObj ? studentObj.name : `${pIdx + 1}. Oyuncu`}
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold">
                      Skor: {pState.score}
                    </span>
                  </div>
                </div>

                {/* Question Badge & Audio speaker */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speakEnglishWord(currentItem.targetWord)}
                    className="p-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-400/50 text-sky-300 transition-all cursor-pointer"
                    title="Sesli Dinle"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-400 px-1.5 py-0.5 rounded bg-black/40">
                    {(pState.questionIndex % SCHOOL_LIFE_ITEMS.length) + 1} / {SCHOOL_LIFE_ITEMS.length}
                  </span>
                </div>
              </div>

              {/* CARD CONTAINER MATCHING THE TEXTBOOK WORKSHEET */}
              <div className="flex-1 w-full flex flex-col items-center justify-between min-h-0 bg-[#fffdfa] rounded-2xl p-2 sm:p-3 border-2 border-amber-200/80 shadow-md overflow-hidden text-slate-900">
                {/* 1. Illustration Header & Scene Frame */}
                <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center relative">
                  {/* Number Circle Badge top-left */}
                  <div className="absolute top-1 left-1 z-20 w-6 h-6 rounded-full bg-pink-100 border-2 border-pink-500 text-pink-600 font-black text-xs flex items-center justify-center shadow-xs">
                    {currentItem.number}
                  </div>

                  {/* Scene Frame */}
                  <div className="w-full max-w-[280px] sm:max-w-[320px] h-[130px] sm:h-[155px] md:h-[175px] rounded-2xl border-4 border-amber-300 shadow-md overflow-hidden relative">
                    <SceneIllustration type={currentItem.sceneType} />
                  </div>

                  {/* Turkish Hint (if enabled) */}
                  {showTurkishHints && (
                    <div className="mt-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-400 text-amber-900 text-[11px] font-bold shadow-xs animate-in fade-in">
                      🇹🇷 {currentItem.turkishMeaning}
                    </div>
                  )}
                </div>

                {/* 2. Options with Checkboxes & Pills */}
                <div className="w-full max-w-sm flex flex-col gap-1.5 sm:gap-2 mt-2 shrink-0">
                  {currentItem.options.map((opt, optIdx) => {
                    const isSelected = pState.selectedOption === opt;
                    const isCorrect = isSelected && pState.feedback === 'correct';
                    const isWrong = isSelected && pState.feedback === 'wrong';

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(pIdx, opt)}
                        disabled={pState.feedback !== null}
                        className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 py-2 rounded-2xl border-2 transition-all cursor-pointer shadow-xs text-left ${getPillThemeClasses(
                          currentItem.themeColor,
                          isSelected,
                          isCorrect,
                          isWrong
                        )}`}
                      >
                        {/* Checkbox Square */}
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected && isCorrect
                            ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                            : isSelected && isWrong
                            ? 'bg-rose-600 border-rose-700 text-white shadow-xs'
                            : 'bg-white border-slate-700 text-transparent'
                        }`}>
                          {isSelected && isCorrect ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                          ) : isSelected && isWrong ? (
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                          ) : null}
                        </div>

                        {/* Word Text */}
                        <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-wide flex-1">
                          {opt}
                        </span>

                        {/* Speaker small icon */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            speakEnglishWord(opt);
                          }}
                          className="p-1 rounded-full hover:bg-black/10 text-slate-700 transition-colors"
                          title="Dinle"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* 4. STUDENT AVATAR DOCK AT BOTTOM */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-30 px-1 sm:px-2 pb-1 mt-auto">
          <StudentAvatarDock
            students={students}
            currentGrade={6}
            playerCount={playerMode}
            selectedStudentIds={selectedStudentIds.slice(0, playerMode)}
            onSelectStudentForPlayer={onSelectStudentForPlayer || (() => {})}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* 5. GAME OVER SUMMARY MODAL */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 bg-black/85 flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-gradient-to-b from-[#131d33] to-[#090e1d] border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
            <div className="text-4xl mb-1 animate-bounce">🏆</div>
            <h3 className="font-black text-xl sm:text-2xl text-amber-300 uppercase tracking-wide">
              Great Job! • Harika!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              "School Life" İngilizce kelime çalışmasındaki 15 görseli ve sözcüğü başarıyla tamamladın!
            </p>

            {/* Scores List */}
            <div className="w-full my-4 flex flex-col gap-2">
              {playerStates.slice(0, playerMode).map((p, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-400/30"
                >
                  <span className="font-black text-sm text-white">
                    {students.find(s => s.id === selectedStudentIds[idx])?.name || `${idx + 1}. Oyuncu`}
                  </span>
                  <span className="font-extrabold text-sm text-amber-300">
                    {p.score} Puan
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 w-full">
              <button
                onClick={handleRestart}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tekrar Oyna</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 shadow-md transition-all cursor-pointer"
              >
                Menü
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolLifeGame;
