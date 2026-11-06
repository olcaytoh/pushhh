import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, RotateCcw, Home, ChevronRight,
  Flame, CheckCircle2, XCircle, ArrowLeft, ArrowRight, HelpCircle, Bug,
  ChefHat, Play, Award, Shuffle, UtensilsCrossed, AlertTriangle, Lightbulb,
  Volume2, VolumeX, Maximize2, Minimize2, X, SlidersHorizontal, ListOrdered
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';

export type KitchenMode = 'sirala' | 'eksik_adim' | 'hatali_bul';

export interface RecipeStep {
  id: string;
  order: number; // 1 to N
  title: string; // Sade, az ve öz (2-3 kelime)
  emoji: string;
  actionType: string; // graphic renderer key
  image?: string; // Gerçekçi yüksek çözünürlüklü fotoğraf görseli
}

export interface Recipe {
  id: string;
  name: string;
  dishEmoji: string;
  dishImage?: string;
  color: string;
  category: string;
  promptText: string;
  steps: RecipeStep[];
  funnyBugs: Record<string, string>;
  fakeStep?: RecipeStep;
}

export const KITCHEN_RECIPES: Recipe[] = [
  {
    id: 'menemen',
    name: 'Menemen',
    dishEmoji: '🍳',
    dishImage: '/mutfak/menemen/tabaga_al.png',
    color: 'from-amber-500 to-orange-600',
    category: 'Sıcak Kahvaltı',
    promptText: "Bugünkü tarifimiz: Menemen. Adımları doğru sıraya diz, sonra Pişir'e bas!",
    steps: [
      { id: 'm-1', order: 1, title: 'Ocağı yak', emoji: '🔥', actionType: 'ocagi_yak', image: '/mutfak/menemen/ocagi_yak.png' },
      { id: 'm-2', order: 2, title: 'Tavaya yağ koy', emoji: '🫒', actionType: 'tavaya_yag_koy', image: '/mutfak/menemen/tavaya_yag_koy.png' },
      { id: 'm-3', order: 3, title: 'Domatesleri tavaya koy', emoji: '🍅', actionType: 'domatesleri_tavaya_koy', image: '/mutfak/menemen/domatesleri_tavaya_koy.png' },
      { id: 'm-4', order: 4, title: 'Karıştır', emoji: '🥄', actionType: 'karistir', image: '/mutfak/menemen/karistir.png' },
      { id: 'm-5', order: 5, title: 'Yumurtaları kâseye kır', emoji: '🥚', actionType: 'yumurtalari_kaseye_kir', image: '/mutfak/menemen/yumurtalari_kaseye_kir.png' },
      { id: 'm-6', order: 6, title: 'Yumurtaları tavaya dök', emoji: '🍳', actionType: 'yumurtalari_tavaya_dok', image: '/mutfak/menemen/yumurtalari_tavaya_dok.png' },
      { id: 'm-7', order: 7, title: 'Tabağa al', emoji: '🍽️', actionType: 'tabaga_al', image: '/mutfak/menemen/tabaga_al.png' }
    ],
    funnyBugs: {
      default: 'Ocağı yakmadan veya yağ koymadan pişirmeye çalışırsan tava soğuk kalır! Sıralamayı kontrol edelim.'
    },
    fakeStep: { id: 'm-fake', order: 99, title: 'Şeker ekle', emoji: '🍬', actionType: 'seker_ekle', image: '/mutfak/limonata/seker_ekle.png' }
  },
  {
    id: 'cay_demleme',
    name: 'Tavşan Kanı Çay',
    dishEmoji: '🫖',
    dishImage: '/mutfak/cay/bardaga_cay_koy.png',
    color: 'from-red-500 to-rose-700',
    category: 'Sıcak İçecek',
    promptText: 'Bugünkü tarifimiz: Tavşan Kanı Çay. Doğru adımları sırayla yerleştirip demliği fokurdat!',
    steps: [
      { id: 'c-1', order: 1, title: 'Çaydanlığa su doldur', emoji: '💧', actionType: 'caydanliga_su_doldur', image: '/mutfak/cay/caydanliga_su_doldur.png' },
      { id: 'c-2', order: 2, title: 'Çaydanlığı ocağa koy', emoji: '🫖', actionType: 'caydanligi_ocaga_koy', image: '/mutfak/cay/caydanligi_ocaga_koy.png' },
      { id: 'c-3', order: 3, title: 'Ocağı yak', emoji: '🔥', actionType: 'ocagi_yak', image: '/mutfak/cay/ocagi_yak.png' },
      { id: 'c-4', order: 4, title: 'Demliğe çay koy', emoji: '🌿', actionType: 'demlige_cay_koy', image: '/mutfak/cay/demlige_cay_koy.png' },
      { id: 'c-5', order: 5, title: 'Kaynar suyu demliğe dök', emoji: '♨️', actionType: 'kaynar_suyu_demlige_dok', image: '/mutfak/cay/kaynar_suyu_demlige_dok.png' },
      { id: 'c-6', order: 6, title: 'Demliği üste koy beklet', emoji: '⏳', actionType: 'demligi_uste_koy_beklet', image: '/mutfak/cay/demligi_uste_koy_beklet.png' },
      { id: 'c-7', order: 7, title: 'Bardağa çay koy', emoji: '☕', actionType: 'bardaga_cay_koy', image: '/mutfak/cay/bardaga_cay_koy.png' }
    ],
    funnyBugs: {
      default: 'Suyu kaynatmadan demliğe soğuk su dökersen çay demlenmez! Sırayı kontrol et.'
    },
    fakeStep: { id: 'c-fake', order: 99, title: 'Bir tutam tuz ekle', emoji: '🧂', actionType: 'bir_tutam_tuz_ekle', image: '/mutfak/ayran/bir_tutam_tuz_ekle.png' }
  },
  {
    id: 'tost',
    name: 'Kaşarlı Tost',
    dishEmoji: '🥪',
    dishImage: '/mutfak/tost/tabaga_al.png',
    color: 'from-yellow-500 to-amber-600',
    category: 'Pratik Atıştırmalık',
    promptText: 'Bugünkü tarifimiz: Kaşarlı Tost. Çıtır çıtır bir tost için kartları doğru diz!',
    steps: [
      { id: 't-1', order: 1, title: 'Tost makinesini aç', emoji: '🔌', actionType: 'tost_makinesini_ac', image: '/mutfak/tost/tost_makinesini_ac.png' },
      { id: 't-2', order: 2, title: 'Ekmeğe peynir koy', emoji: '🧀', actionType: 'ekmege_peynir_koy', image: '/mutfak/tost/ekmege_peynir_koy.png' },
      { id: 't-3', order: 3, title: 'Üstüne ekmek kapat', emoji: '🍞', actionType: 'ustune_ekmek_kapat', image: '/mutfak/tost/ustune_ekmek_kapat.png' },
      { id: 't-4', order: 4, title: 'Tostu makineye koy', emoji: '🥪', actionType: 'tostu_makineye_koy', image: '/mutfak/tost/tostu_makineye_koy.png' },
      { id: 't-5', order: 5, title: 'Kapağı kapat bekle', emoji: '⏱️', actionType: 'kapagi_kapat_bekle', image: '/mutfak/tost/kapagi_kapat_bekle.png' },
      { id: 't-6', order: 6, title: 'Tabağa al', emoji: '🍽️', actionType: 'tabaga_al', image: '/mutfak/tost/tabaga_al.png' }
    ],
    funnyBugs: {
      default: 'Ekmeğin arasına peynir koymadan makineye basarsan kuru ekmek yanar!'
    },
    fakeStep: { id: 't-fake', order: 99, title: 'Reçeli ekmeğe sür', emoji: '🍓', actionType: 'receli_ekmege_sur', image: '/mutfak/receli_ekmek/receli_ekmege_sur.png' }
  },
  {
    id: 'limonata',
    name: 'Buzlu Limonata',
    dishEmoji: '🍋',
    dishImage: '/mutfak/limonata/bardaklara_dok.png',
    color: 'from-lime-500 to-yellow-500',
    category: 'Serinletici İçecek',
    promptText: 'Bugünkü tarifimiz: Buzlu Limonata. Ferahlatıcı bir içecek için adımları sırala!',
    steps: [
      { id: 'l-1', order: 1, title: 'Limonları ikiye kes', emoji: '🍋', actionType: 'limonlari_ikiye_kes', image: '/mutfak/limonata/limonlari_ikiye_kes.png' },
      { id: 'l-2', order: 2, title: 'Limonları sık', emoji: '🥤', actionType: 'limonlari_sik', image: '/mutfak/limonata/limonlari_sik.png' },
      { id: 'l-3', order: 3, title: 'Sürahiye su doldur', emoji: '💧', actionType: 'surahiye_su_doldur', image: '/mutfak/limonata/surahiye_su_doldur.png' },
      { id: 'l-4', order: 4, title: 'Şeker ekle', emoji: '🍬', actionType: 'seker_ekle', image: '/mutfak/limonata/seker_ekle.png' },
      { id: 'l-5', order: 5, title: 'Karıştır', emoji: '🥄', actionType: 'karistir', image: '/mutfak/limonata/karistir.png' },
      { id: 'l-6', order: 6, title: 'Bardaklara dök', emoji: '🥤', actionType: 'bardaklara_dok', image: '/mutfak/limonata/bardaklara_dok.png' }
    ],
    funnyBugs: {
      default: 'Limonları kesip sıkmadan bütün suya atarsan limonata olmaz!'
    },
    fakeStep: { id: 'l-fake', order: 99, title: 'Bir tutam tuz ekle', emoji: '🧂', actionType: 'bir_tutam_tuz_ekle', image: '/mutfak/ayran/bir_tutam_tuz_ekle.png' }
  },
  {
    id: 'meyve_salatasi',
    name: 'Meyve Salatası',
    dishEmoji: '🍓',
    dishImage: '/mutfak/meyve_salatasi/karistir.png',
    color: 'from-pink-500 to-rose-600',
    category: 'Sağlıklı Tatlı',
    promptText: 'Bugünkü tarifimiz: Meyve Salatası. Vitamin dolu renkli salatamızı hazırla!',
    steps: [
      { id: 'ms-1', order: 1, title: 'Meyveleri yıka', emoji: '🍎', actionType: 'meyveleri_yika', image: '/mutfak/meyve_salatasi/meyveleri_yika.png' },
      { id: 'ms-2', order: 2, title: 'Muzu soy', emoji: '🍌', actionType: 'muzu_soy', image: '/mutfak/meyve_salatasi/muzu_soy.png' },
      { id: 'ms-3', order: 3, title: 'Meyveleri doğra', emoji: '🔪', actionType: 'meyveleri_dogra', image: '/mutfak/meyve_salatasi/meyveleri_dogra.png' },
      { id: 'ms-4', order: 4, title: 'Kâseye koy', emoji: '🥣', actionType: 'kaseye_koy', image: '/mutfak/meyve_salatasi/kaseye_koy.png' },
      { id: 'ms-5', order: 5, title: 'Karıştır', emoji: '🥄', actionType: 'karistir', image: '/mutfak/meyve_salatasi/karistir.png' }
    ],
    funnyBugs: {
      default: 'Meyveleri yıkamadan kâseye koyarsak hijyen algoritması bozulur!'
    },
    fakeStep: { id: 'ms-fake', order: 99, title: 'Ocağı yak', emoji: '🔥', actionType: 'ocagi_yak', image: '/mutfak/menemen/ocagi_yak.png' }
  },
  {
    id: 'ayran',
    name: 'Köpüklü Yayık Ayran',
    dishEmoji: '🥛',
    dishImage: '/mutfak/ayran/cirp_ve_bardaga_dok.png',
    color: 'from-cyan-500 to-blue-600',
    category: 'Doğal İçecek',
    promptText: 'Bugünkü tarifimiz: Köpüklü Ayran. Serinletici yayık ayranı için kartları diz!',
    steps: [
      { id: 'a-1', order: 1, title: 'Yoğurdu kaba koy', emoji: '🍶', actionType: 'yogurdu_kaba_koy', image: '/mutfak/ayran/yogurdu_kaba_koy.png' },
      { id: 'a-2', order: 2, title: 'Bir tutam tuz ekle', emoji: '🧂', actionType: 'bir_tutam_tuz_ekle', image: '/mutfak/ayran/bir_tutam_tuz_ekle.png' },
      { id: 'a-3', order: 3, title: 'Su ekle', emoji: '💧', actionType: 'su_ekle', image: '/mutfak/ayran/su_ekle.png' },
      { id: 'a-4', order: 4, title: 'Çırp ve bardağa dök', emoji: '🥛', actionType: 'cirp_ve_bardaga_dok', image: '/mutfak/ayran/cirp_ve_bardaga_dok.png' }
    ],
    funnyBugs: {
      default: 'Yoğurdu çırpmadan bardağa dökersen ayran değil koca bir yoğurt topu yutarsın!'
    },
    fakeStep: { id: 'a-fake', order: 99, title: 'Kakao ekle', emoji: '🍫', actionType: 'kakao_ekle', image: '/mutfak/sicak_cikolata/kakao_ekle.png' }
  },
  {
    id: 'recelli_ekmek',
    name: 'Reçelli Ekmek',
    dishEmoji: '🍓',
    dishImage: '/mutfak/receli_ekmek/tabaga_koy.png',
    color: 'from-rose-500 to-red-600',
    category: 'Kahvaltı Keyfi',
    promptText: 'Bugünkü tarifimiz: Reçelli Ekmek. Mis gibi kahvaltılık için kartları sırala!',
    steps: [
      { id: 'r-1', order: 1, title: 'Ekmeği tahtaya koy', emoji: '🍞', actionType: 'ekmegi_tahtaya_koy', image: '/mutfak/receli_ekmek/ekmegi_tahtaya_koy.png' },
      { id: 'r-2', order: 2, title: 'Ekmeği dilimle', emoji: '🔪', actionType: 'ekmegi_dilimle', image: '/mutfak/receli_ekmek/ekmegi_dilimle.png' },
      { id: 'r-3', order: 3, title: 'Reçel kavanozunu aç', emoji: '🥫', actionType: 'recel_kavanozunu_ac', image: '/mutfak/receli_ekmek/recel_kavanozunu_ac.png' },
      { id: 'r-4', order: 4, title: 'Reçeli ekmeğe sür', emoji: '🍓', actionType: 'receli_ekmege_sur', image: '/mutfak/receli_ekmek/receli_ekmege_sur.png' },
      { id: 'r-5', order: 5, title: 'Tabağa koy', emoji: '🍽️', actionType: 'tabaga_koy', image: '/mutfak/receli_ekmek/tabaga_koy.png' }
    ],
    funnyBugs: {
      default: 'Ekmeği dilimlemeden reçel sürmeye çalışırsan tüm somun reçel olur!'
    },
    fakeStep: { id: 'r-fake', order: 99, title: 'Ocağı yak', emoji: '🔥', actionType: 'ocagi_yak', image: '/mutfak/menemen/ocagi_yak.png' }
  },
  {
    id: 'misir',
    name: 'Mısır Patlağı',
    dishEmoji: '🍿',
    dishImage: '/mutfak/misir_patlagi/kaseye_bosalt.png',
    color: 'from-amber-400 to-yellow-600',
    category: 'Film Atıştırmalığı',
    promptText: 'Bugünkü tarifimiz: Mısır Patlağı. Tencerede çıtır çıtır patlatmak için adımları diz!',
    steps: [
      { id: 'p-1', order: 1, title: 'Tencereye yağ koy', emoji: '🫒', actionType: 'tencereye_yag_koy', image: '/mutfak/misir_patlagi/tencereye_yag_koy.png' },
      { id: 'p-2', order: 2, title: 'Mısır tanelerini koy', emoji: '🌽', actionType: 'misir_tanelerini_koy', image: '/mutfak/misir_patlagi/misir_tanelerini_koy.png' },
      { id: 'p-3', order: 3, title: 'Ocağı yak', emoji: '🔥', actionType: 'ocagi_yak', image: '/mutfak/misir_patlagi/ocagi_yak.png' },
      { id: 'p-4', order: 4, title: 'Kapağı kapat', emoji: '🥘', actionType: 'kapagi_kapat', image: '/mutfak/misir_patlagi/kapagi_kapat.png' },
      { id: 'p-5', order: 5, title: 'Kâseye boşalt', emoji: '🍿', actionType: 'kaseye_bosalt', image: '/mutfak/misir_patlagi/kaseye_bosalt.png' }
    ],
    funnyBugs: {
      default: 'Kapağı kapatmadan ocağı açarsan mısırlar mutfakta havaya uçar!'
    },
    fakeStep: { id: 'p-fake', order: 99, title: 'Su ekle', emoji: '💧', actionType: 'su_ekle', image: '/mutfak/ayran/su_ekle.png' }
  },
  {
    id: 'sandvic',
    name: 'Okul Sandviçi',
    dishEmoji: '🥪',
    dishImage: '/mutfak/sandvic/ekmegi_kapat.png',
    color: 'from-emerald-500 to-teal-600',
    category: 'Beslenme Çantası',
    promptText: 'Bugünkü tarifimiz: Okul Sandviçi. Doyurucu bir sandviç için adımları sırala!',
    steps: [
      { id: 's-1', order: 1, title: 'Ekmeği ortadan kes', emoji: '🥖', actionType: 'ekmegi_ortadan_kes', image: '/mutfak/sandvic/ekmegi_ortadan_kes.png' },
      { id: 's-2', order: 2, title: 'Tereyağı sür', emoji: '🧈', actionType: 'tereyagi_sur', image: '/mutfak/sandvic/tereyagi_sur.png' },
      { id: 's-3', order: 3, title: 'Domatesi dilimle', emoji: '🍅', actionType: 'domatesi_dilimle', image: '/mutfak/sandvic/domatesi_dilimle.png' },
      { id: 's-4', order: 4, title: 'Domatesleri diz', emoji: '🥗', actionType: 'domatesleri_diz', image: '/mutfak/sandvic/domatesleri_diz.png' },
      { id: 's-5', order: 5, title: 'Peynir koy', emoji: '🧀', actionType: 'peynir_koy', image: '/mutfak/sandvic/peynir_koy.png' },
      { id: 's-6', order: 6, title: 'Ekmeği kapat', emoji: '🥪', actionType: 'ekmegi_kapat', image: '/mutfak/sandvic/ekmegi_kapat.png' }
    ],
    funnyBugs: {
      default: 'Ekmeği kesmeden malzemeleri üzerine koyarsan sandviç olmaz!'
    },
    fakeStep: { id: 's-fake', order: 99, title: 'Ocağı yak', emoji: '🔥', actionType: 'ocagi_yak', image: '/mutfak/menemen/ocagi_yak.png' }
  },
  {
    id: 'sicak_cikolata',
    name: 'Köpüklü Sıcak Çikolata',
    dishEmoji: '☕',
    dishImage: '/mutfak/sicak_cikolata/kupaya_dok.png',
    color: 'from-amber-700 to-stone-800',
    category: 'Kış Keyfi',
    promptText: 'Bugünkü tarifimiz: Sıcak Çikolata. İçini ısıtacak lezzet için adımları sırala!',
    steps: [
      { id: 'sc-1', order: 1, title: 'Tencereye süt koy', emoji: '🥛', actionType: 'tencereye_sut_koy', image: '/mutfak/sicak_cikolata/tencereye_sut_koy.png' },
      { id: 'sc-2', order: 2, title: 'Ocağı yak', emoji: '🔥', actionType: 'ocagi_yak', image: '/mutfak/sicak_cikolata/ocagi_yak.png' },
      { id: 'sc-3', order: 3, title: 'Kakao ekle', emoji: '🍫', actionType: 'kakao_ekle', image: '/mutfak/sicak_cikolata/kakao_ekle.png' },
      { id: 'sc-4', order: 4, title: 'Karıştır', emoji: '🥄', actionType: 'karistir', image: '/mutfak/sicak_cikolata/karistir.png' },
      { id: 'sc-5', order: 5, title: 'Kupaya dök', emoji: '☕', actionType: 'kupaya_dok', image: '/mutfak/sicak_cikolata/kupaya_dok.png' }
    ],
    funnyBugs: {
      default: 'Sütü ısıtmadan çikolatayı cezveye atarsan çikolata donuk kalır!'
    },
    fakeStep: { id: 'sc-fake', order: 99, title: 'Bir tutam tuz ekle', emoji: '🧂', actionType: 'bir_tutam_tuz_ekle', image: '/mutfak/ayran/bir_tutam_tuz_ekle.png' }
  }
];

// BÜYÜK VE ETKİLEYİCİ PİŞİRME GÖRSELLERİ BİLEŞENİ
const CookingStepGraphic: React.FC<{ actionType: string; emoji: string; image?: string; altText?: string }> = ({ actionType, emoji, image, altText }) => {
  if (image) {
    return (
      <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-white p-0.5">
        <img
          src={image}
          alt={altText || actionType}
          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm filter transition-transform duration-150"
        />
      </div>
    );
  }

  switch (actionType) {
    case 'ocagi_yak':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full max-h-24 sm:max-h-28 object-contain">
          {/* Ocak gövdesi */}
          <rect x="25" y="45" width="85" height="42" rx="10" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
          <rect x="30" y="49" width="75" height="12" rx="4" fill="#e2e8f0" />
          {/* Izgara ve ocak gözü */}
          <circle cx="67" cy="45" r="22" fill="#475569" stroke="#1e293b" strokeWidth="3" />
          <circle cx="67" cy="45" r="14" fill="#1e293b" />
          {/* Mavi canlı alevler */}
          <path d="M57 40 C57 26 65 16 67 14 C69 16 77 26 77 40 Z" fill="#38bdf8" />
          <path d="M62 40 C62 30 66 22 67 20 C68 22 72 30 72 40 Z" fill="#e0f2fe" />
          <path d="M50 42 C45 34 50 24 53 22 C55 26 59 34 59 42 Z" fill="#0284c7" />
          <path d="M84 42 C89 34 84 24 81 22 C79 26 75 34 75 42 Z" fill="#0284c7" />
          {/* Ocak Düğmesi */}
          <circle cx="67" cy="72" r="9" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="67" y1="65" x2="67" y2="79" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          {/* Beyaz aşçı kolu ve eli - düğmeyi çeviriyor */}
          <path d="M110 65 Q115 72 135 70 L155 70 L155 86 L130 86 Q108 84 100 78 Z" fill="#ffffff" stroke="#334155" strokeWidth="3" />
          <line x1="130" y1="70" x2="130" y2="86" stroke="#cbd5e1" strokeWidth="2" />
          {/* El ve parmaklar düğmede */}
          <ellipse cx="88" cy="72" rx="10" ry="7" fill="#fed7aa" stroke="#334155" strokeWidth="2.5" />
          <circle cx="78" cy="72" r="5" fill="#fcd34d" stroke="#334155" strokeWidth="2" />
        </svg>
      );
    case 'yag_koy':
    case 'tencere_yag':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full max-h-24 sm:max-h-28 object-contain">
          {/* Siyah tava ve sapı */}
          <ellipse cx="65" cy="88" rx="46" ry="18" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
          <ellipse cx="65" cy="86" rx="41" ry="14" fill="#334155" />
          <path d="M106 85 L145 92 L143 100 L104 90 Z" fill="#0f172a" stroke="#000000" strokeWidth="2" />
          {/* Yağ birikintisi */}
          <ellipse cx="65" cy="87" rx="18" ry="7" fill="#facc15" opacity="0.9" />
          {/* Akan parlak zeytinyağı */}
          <path d="M85 45 Q75 65 67 84" stroke="#facc15" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Eğilmiş cam zeytinyağı şişesi */}
          <g transform="translate(105, 20) rotate(-40)">
            <rect x="0" y="14" width="22" height="42" rx="6" fill="#84cc16" stroke="#3f6212" strokeWidth="3" opacity="0.95" />
            <rect x="3" y="18" width="16" height="30" rx="3" fill="#bef264" opacity="0.7" />
            <rect x="7" y="4" width="8" height="10" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
            <path d="M11 4 L11 -6 L8 -6" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          {/* Şişeyi tutan beyaz aşçı kolu ve eli */}
          <path d="M125 15 Q140 22 158 20 L158 36 L135 34 Z" fill="#ffffff" stroke="#334155" strokeWidth="3" />
          <ellipse cx="120" cy="28" rx="8" ry="7" fill="#fed7aa" stroke="#334155" strokeWidth="2.5" />
        </svg>
      );
    case 'domates_koy':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full max-h-24 sm:max-h-28 object-contain">
          {/* Tava */}
          <ellipse cx="60" cy="88" rx="44" ry="18" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
          <ellipse cx="60" cy="86" rx="39" ry="14" fill="#334155" />
          {/* Eğilmiş ahşap kesme tahtası */}
          <g transform="translate(75, 22) rotate(-28)">
            <rect x="0" y="0" width="56" height="36" rx="6" fill="#d97706" stroke="#78350f" strokeWidth="3" />
            <rect x="4" y="4" width="48" height="28" rx="3" fill="#f59e0b" opacity="0.8" />
            {/* Tahta üzerindeki doğranmış sebzeler */}
            <circle cx="16" cy="14" r="5" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
            <circle cx="28" cy="12" r="5" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
            <rect x="18" cy="22" width="6" height="6" rx="1.5" fill="#22c55e" stroke="#166534" strokeWidth="1" />
          </g>
          {/* Tahtayı tutan beyaz aşçı kolu */}
          <path d="M125 10 Q142 16 158 14 L158 30 L135 28 Z" fill="#ffffff" stroke="#334155" strokeWidth="3" />
          <ellipse cx="122" cy="22" rx="7" ry="6" fill="#fed7aa" stroke="#334155" strokeWidth="2.5" />
          {/* Tavaya düşen domates ve biber küpleri */}
          <circle cx="70" cy="62" r="5.5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
          <rect x="62" y="72" width="7" height="7" rx="2" fill="#22c55e" stroke="#166534" strokeWidth="1.5" />
          <circle cx="50" cy="85" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
          <circle cx="62" cy="87" r="5.5" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
          <rect x="72" y="85" width="6" height="6" rx="1.5" fill="#22c55e" stroke="#166534" strokeWidth="1" />
        </svg>
      );
    case 'karistir':
    case 'meyve_karistir':
    case 'cikolata_karistir':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full max-h-24 sm:max-h-28 object-contain">
          {/* Tava */}
          <ellipse cx="68" cy="88" rx="48" ry="19" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
          <ellipse cx="68" cy="86" rx="43" ry="15" fill="#ea580c" />
          {/* Pişen domates, biber ve yumurtalar */}
          <circle cx="55" cy="85" r="5" fill="#facc15" />
          <circle cx="65" cy="87" r="6" fill="#ef4444" />
          <circle cx="78" cy="84" r="5.5" fill="#facc15" />
          <rect x="70" y="82" width="6" height="6" rx="1.5" fill="#22c55e" />
          <circle cx="85" cy="86" r="5" fill="#ef4444" />
          {/* Tahta kaşık */}
          <g transform="translate(68, 28) rotate(32)">
            <rect x="0" y="0" width="8" height="52" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="2.5" />
            <ellipse cx="4" cy="52" rx="13" ry="9" fill="#b45309" stroke="#78350f" strokeWidth="2.5" />
          </g>
          {/* Kaşığı tutan beyaz aşçı kolu ve eli */}
          <path d="M105 18 Q125 24 155 22 L155 38 L115 36 Z" fill="#ffffff" stroke="#334155" strokeWidth="3" />
          <ellipse cx="102" cy="30" rx="8" ry="7" fill="#fed7aa" stroke="#334155" strokeWidth="2.5" />
          {/* Karıştırma hareket çizgileri ve duman */}
          <path d="M48 76 Q68 66 88 76" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeDasharray="3 3" opacity="0.9" />
          <path d="M60 62 Q56 50 64 42" stroke="#cbd5e1" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M76 60 Q80 48 74 40" stroke="#cbd5e1" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'kaseye_kir':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full max-h-24 sm:max-h-28 object-contain">
          {/* Mavi kâse */}
          <ellipse cx="80" cy="86" rx="42" ry="18" fill="#0284c7" stroke="#0369a1" strokeWidth="3" />
          <path d="M38 86 Q38 108 80 108 Q122 108 122 86 Z" fill="#38bdf8" stroke="#0369a1" strokeWidth="3.5" />
          <ellipse cx="80" cy="85" rx="35" ry="12" fill="#7dd3fc" opacity="0.4" />
          {/* Sol aşçı kolu ve kırılmış sol kabuk */}
          <path d="M5 25 L40 28 L38 42 L5 38 Z" fill="#ffffff" stroke="#334155" strokeWidth="3" />
          <ellipse cx="44" cy="35" rx="8" ry="7" fill="#fed7aa" stroke="#334155" strokeWidth="2.5" />
          <g transform="translate(52, 28) rotate(-25)">
            <ellipse cx="12" cy="14" rx="12" ry="16" fill="#fde68a" stroke="#d97706" strokeWidth="2.5" />
            <path d="M0 14 Q6 19 12 13 Q18 20 24 14" stroke="#b45309" strokeWidth="2" fill="none" />
          </g>
          {/* Sağ aşçı kolu ve kırılmış sağ kabuk */}
          <path d="M155 25 L120 28 L122 42 L155 38 Z" fill="#ffffff" stroke="#334155" strokeWidth="3" />
          <ellipse cx="116" cy="35" rx="8" ry="7" fill="#fed7aa" stroke="#334155" strokeWidth="2.5" />
          <g transform="translate(86, 24) rotate(25)">
            <ellipse cx="12" cy="14" rx="12" ry="16" fill="#fde68a" stroke="#d97706" strokeWidth="2.5" />
            <path d="M0 14 Q6 19 12 13 Q18 20 24 14" stroke="#b45309" strokeWidth="2" fill="none" />
          </g>
          {/* Kâseye süzülen parlak sarı yumurta akı ve sarısı */}
          <path d="M77 50 Q75 68 79 78" stroke="#fef08a" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="80" cy="86" r="11" fill="#f59e0b" stroke="#d97706" strokeWidth="2.5" />
          <circle cx="77" cy="83" r="3.5" fill="#fef08a" opacity="0.8" />
        </svg>
      );
    case 'tavaya_dok':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full max-h-24 sm:max-h-28 object-contain">
          {/* Tava tabanı ve pişmiş sebzeler */}
          <ellipse cx="64" cy="88" rx="45" ry="18" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
          <ellipse cx="64" cy="86" rx="40" ry="14" fill="#334155" />
          <circle cx="50" cy="86" r="5" fill="#ef4444" />
          <rect x="58" y="83" width="6" height="6" rx="1.5" fill="#22c55e" />
          {/* Eğilmiş mavi kâse */}
          <g transform="translate(100, 24) rotate(-42)">
            <ellipse cx="20" cy="14" rx="24" ry="12" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
            <path d="M-4 14 Q-4 34 20 34 Q44 34 44 14 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="3" />
          </g>
          {/* Kâseyi tutan beyaz aşçı kolu ve eli */}
          <path d="M125 15 Q140 20 158 18 L158 34 L132 30 Z" fill="#ffffff" stroke="#334155" strokeWidth="3" />
          <ellipse cx="120" cy="24" rx="8" ry="7" fill="#fed7aa" stroke="#334155" strokeWidth="2.5" />
          {/* Dökülen kalın sarı çırpılmış yumurta */}
          <path d="M96 46 Q76 62 65 78" stroke="#facc15" strokeWidth="11" strokeLinecap="round" fill="none" />
          <path d="M96 46 Q76 62 65 78" stroke="#fef08a" strokeWidth="5" strokeLinecap="round" fill="none" />
          <ellipse cx="62" cy="85" rx="19" ry="8" fill="#facc15" opacity="0.95" />
          <circle cx="60" cy="83" r="5" fill="#f59e0b" />
        </svg>
      );
    case 'tabaga_al':
      return (
        <svg viewBox="0 0 160 120" className="w-full h-full max-h-24 sm:max-h-28 object-contain">
          {/* Beyaz sunum tabağı */}
          <ellipse cx="88" cy="88" rx="46" ry="19" fill="#ffffff" stroke="#94a3b8" strokeWidth="3.5" />
          <ellipse cx="88" cy="86" rx="38" ry="13" fill="#f1f5f9" />
          {/* Tabağa kayan lezzetli sıcak menemen */}
          <ellipse cx="86" cy="85" rx="32" ry="10" fill="#f59e0b" />
          <circle cx="78" cy="84" r="5.5" fill="#ef4444" />
          <circle cx="94" cy="86" r="5" fill="#ef4444" />
          <rect x="85" y="82" width="6" height="6" rx="1.5" fill="#22c55e" />
          {/* Eğilmiş siyah tava */}
          <g transform="translate(32, 28) rotate(-34)">
            <ellipse cx="25" cy="14" rx="28" ry="12" fill="#334155" stroke="#1e293b" strokeWidth="3" />
            <rect x="-24" y="10" width="28" height="7" rx="3.5" fill="#0f172a" />
          </g>
          {/* Tava sapını tutan beyaz aşçı kolu ve eli */}
          <path d="M0 16 L22 22 L20 36 L0 30 Z" fill="#ffffff" stroke="#334155" strokeWidth="3" />
          <ellipse cx="25" cy="28" rx="8" ry="7" fill="#fed7aa" stroke="#334155" strokeWidth="2.5" />
          {/* Sıcak buhar çizgileri */}
          <path d="M82 70 Q78 58 84 48" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M94 68 Q98 56 92 46" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl filter drop-shadow select-none animate-bounce">{emoji}</span>
        </div>
      );
  }
};

interface KodlamaAlgoritmaMutfagiGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  onQuestionAnswered?: (isCorrect: boolean) => void;
  onGameCompleted?: (winnerIdx: number, pCount: number) => void;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (studentId: string | null) => void;
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  playMp3?: (src: string) => void;
}

export const KodlamaAlgoritmaMutfagiGame: React.FC<KodlamaAlgoritmaMutfagiGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  onQuestionAnswered,
  onGameCompleted,
  students = [],
  selectedStudentId = null,
  selectedStudentIds = [null],
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  playMp3
}) => {
  // OYUN DURUMLARI
  const [recipeIndex, setRecipeIndex] = useState<number>(0);
  const [mode, setMode] = useState<KitchenMode>('sirala');
  const [showModeDropdown, setShowModeDropdown] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // SIRALAMA MODU İÇİN STATE
  const [slots, setSlots] = useState<(RecipeStep | null)[]>([]);
  const [availableCards, setAvailableCards] = useState<RecipeStep[]>([]);
  
  // ÇALIŞTIRMA & ŞEF ANİMASYONLARI
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executingStepIndex, setExecutingStepIndex] = useState<number | null>(null);
  const [chefEmotion, setChefEmotion] = useState<'normal' | 'happy' | 'confused' | 'cooking'>('normal');
  const [chefSpeech, setChefSpeech] = useState<string>('');
  const [resultStatus, setResultStatus] = useState<'idle' | 'success' | 'failure'>('idle');

  // EKSİK ADIM MODU İÇİN STATE
  const [missingSlotIndex, setMissingSlotIndex] = useState<number>(0);
  const [missingOptions, setMissingOptions] = useState<RecipeStep[]>([]);

  // HATALI ADIM (DEBUGGING) MODU İÇİN STATE
  const [buggyList, setBuggyList] = useState<RecipeStep[]>([]);
  const [buggyTargetIndex, setBuggyTargetIndex] = useState<number>(0);

  // İSTATİSTİK
  const [completedRecipesCount, setCompletedRecipesCount] = useState<number>(0);

  const currentRecipe = useMemo(() => KITCHEN_RECIPES[recipeIndex], [recipeIndex]);

  // Ses çalma
  const playSound = useCallback((src: string) => {
    if (isMuted) return;
    try {
      if (playMp3) playMp3(src);
      else {
        const a = new Audio(src);
        a.play().catch(() => {});
      }
    } catch {
      // ignore
    }
  }, [isMuted, playMp3]);

  // Tam ekran geçişi
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // TARİF VEYA MOD DEĞİŞTİĞİNDE BAŞLAT
  const resetRound = useCallback(() => {
    setIsExecuting(false);
    setExecutingStepIndex(null);
    setResultStatus('idle');
    setChefEmotion('normal');
    setChefSpeech(currentRecipe.promptText);

    const stepCount = currentRecipe.steps.length;

    if (mode === 'sirala') {
      setSlots(new Array(stepCount).fill(null));
      // Kartları karıştır
      const shuffled = [...currentRecipe.steps].sort(() => Math.random() - 0.5);
      setAvailableCards(shuffled);
    } else if (mode === 'eksik_adim') {
      const missingIdx = Math.floor(Math.random() * stepCount);
      setMissingSlotIndex(missingIdx);
      const targetStep = currentRecipe.steps[missingIdx];
      
      const preFilled: (RecipeStep | null)[] = currentRecipe.steps.map((st, i) => i === missingIdx ? null : st);
      setSlots(preFilled);

      // Seçenekler: Doğru adım + 2 çeldirici
      const otherSteps = KITCHEN_RECIPES
        .flatMap(r => r.steps)
        .filter(s => s.id !== targetStep.id && s.title !== targetStep.title);
      const shuffledOthers = [...otherSteps].sort(() => Math.random() - 0.5).slice(0, 2);
      const opts = [targetStep, ...shuffledOthers].sort(() => Math.random() - 0.5);
      setMissingOptions(opts);
      setAvailableCards([]);
    } else if (mode === 'hatali_bul') {
      // 1 hatalı adımı rastgele bir sıraya yerleştir
      const fake = currentRecipe.fakeStep || {
        id: 'fake-bug',
        order: 99,
        title: 'Buzlu dondurma ekle',
        emoji: '🍦',
        actionType: 'dondurma_ekle'
      };
      const bugIdx = Math.floor(Math.random() * stepCount);
      setBuggyTargetIndex(bugIdx);

      const modified = [...currentRecipe.steps];
      modified[bugIdx] = fake;
      setBuggyList(modified);
      setSlots(modified);
      setAvailableCards([]);
    }
  }, [currentRecipe, mode]);

  useEffect(() => {
    resetRound();
  }, [resetRound]);

  // KARTI TEZGAHTAN SIRAYA YERLEŞTİR (Sırala Modu)
  const handlePlaceCard = (card: RecipeStep) => {
    if (isExecuting || resultStatus === 'success') return;
    playSound('/click.mp3');

    // İlk boş slota yerleştir
    const firstEmptyIdx = slots.findIndex(s => s === null);
    if (firstEmptyIdx === -1) {
      setChefSpeech('Tüm slotlar dolu! Kontrol etmek için "Pişir!" butonuna bas.');
      return;
    }

    const newSlots = [...slots];
    newSlots[firstEmptyIdx] = card;
    setSlots(newSlots);

    // Kullanılabilir kartlardan çıkar
    setAvailableCards(prev => prev.filter(c => c.id !== card.id));
  };

  // KARTI SIRADAN TEZGAHA GERİ AL
  const handleRemoveCardFromSlot = (slotIdx: number) => {
    if (isExecuting || resultStatus === 'success') return;
    const card = slots[slotIdx];
    if (!card) return;

    playSound('/op.mp3');
    const newSlots = [...slots];
    newSlots[slotIdx] = null;
    setSlots(newSlots);

    setAvailableCards(prev => [...prev, card]);
    setResultStatus('idle');
  };

  // KARIŞTIR (Tezgahtaki kartları karıştır)
  const handleShuffle = () => {
    playSound('/coin.mp3');
    setAvailableCards(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  // TÜMÜNÜ SIFIRLA
  const handleResetSlots = () => {
    playSound('/op.mp3');
    resetRound();
  };

  // ALGORİTMAYI ÇALIŞTIR / PİŞİR
  const handleExecuteCooking = () => {
    if (isExecuting) return;

    // Tüm slotlar doldu mu kontrolü
    const hasEmpty = slots.some(s => s === null);
    if (hasEmpty) {
      playSound('/hata.mp3');
      setChefEmotion('confused');
      setChefSpeech('Henüz tüm adımları yerleştirmedin! Boş kutuları doldurmalısın.');
      return;
    }

    setIsExecuting(true);
    setChefEmotion('cooking');
    setChefSpeech('Mutfakta ocak yandı, algoritma adım adım çalışıyor...');
    playSound('/coin.mp3');

    let currentStep = 0;
    const totalSteps = slots.length;

    const interval = setInterval(() => {
      setExecutingStepIndex(currentStep);
      playSound('/click.mp3');

      currentStep++;
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setTimeout(() => {
          verifyExecution();
        }, 600);
      }
    }, 550);
  };

  // ÇALIŞTIRMA SONUCUNU DENETLE
  const verifyExecution = () => {
    setIsExecuting(false);
    setExecutingStepIndex(null);

    // Her bir slotun doğru sırada olup olmadığını denetle
    const isCorrect = slots.every((step, idx) => step && step.order === idx + 1);

    if (isCorrect) {
      playSound('/alkis.mp3');
      playSound('/dogru.mp3');
      setChefEmotion('happy');
      setResultStatus('success');
      setChefSpeech(`Tebrikler! ${currentRecipe.name} tarifini eksiksiz hazırladın. Harika bir şefsin!`);
      setCompletedRecipesCount(prev => prev + 1);
      onQuestionAnswered?.(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      playSound('/yanlis.mp3');
      setChefEmotion('confused');
      setResultStatus('failure');
      setChefSpeech(currentRecipe.funnyBugs.default || 'Eyvah! Adımları yanlış sırada çalıştırdık. Sıralamayı kontrol edip tekrar dene!');
      onQuestionAnswered?.(false);
    }
  };

  // EKSİK ADIM SEÇİMİ
  const handleSelectMissingOption = (picked: RecipeStep) => {
    if (resultStatus === 'success') return;
    const trueStep = currentRecipe.steps[missingSlotIndex];

    if (picked.id === trueStep.id) {
      playSound('/alkis.mp3');
      playSound('/dogru.mp3');
      const newSlots = [...slots];
      newSlots[missingSlotIndex] = picked;
      setSlots(newSlots);
      setResultStatus('success');
      setChefEmotion('happy');
      setChefSpeech(`Harika! Eksik olan "${picked.title}" adımını başarıyla buldun!`);
      setCompletedRecipesCount(prev => prev + 1);
      onQuestionAnswered?.(true);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      playSound('/yanlis.mp3');
      setChefEmotion('confused');
      setChefSpeech(`Hmm, "${picked.title}" bu adıma uymadı. Mantıklı sıralamayı tekrar düşün!`);
      onQuestionAnswered?.(false);
    }
  };

  // HATALI ADIM (DEBUGGING) TIKLAMASI
  const handlePickBuggyStep = (idx: number) => {
    if (resultStatus === 'success') return;
    if (idx === buggyTargetIndex) {
      playSound('/alkis.mp3');
      playSound('/dogru.mp3');
      setResultStatus('success');
      setChefEmotion('happy');
      const trueStep = currentRecipe.steps[idx];
      const fixedSlots = [...slots];
      fixedSlots[idx] = trueStep;
      setSlots(fixedSlots);
      setChefSpeech(`Hata ayıklandı (Debugged)! Mantıksız olan adımı yakaladın, doğrusu "${trueStep.title}" oldu.`);
      setCompletedRecipesCount(prev => prev + 1);
      onQuestionAnswered?.(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } else {
      playSound('/yanlis.mp3');
      setChefEmotion('confused');
      setChefSpeech('Bu adım tarifin doğru bir parçası! Mantıksız/komik olan adımı bulmalısın.');
      onQuestionAnswered?.(false);
    }
  };

  // SONRAKİ / ÖNCEKİ TARİF
  const handleNextRecipe = () => {
    playSound('/op.mp3');
    setRecipeIndex(prev => (prev + 1) % KITCHEN_RECIPES.length);
  };
  const handlePrevRecipe = () => {
    playSound('/op.mp3');
    setRecipeIndex(prev => (prev - 1 + KITCHEN_RECIPES.length) % KITCHEN_RECIPES.length);
  };

  return (
    <div className="fixed inset-0 z-[250] flex flex-col font-sans select-none overflow-hidden bg-stone-900 text-stone-900">
      
      {/* 1. ÜST HEADER BAR - ŞIK VE BASİT */}
      <header className="relative z-20 px-3 sm:px-6 py-2 bg-stone-950/90 border-b-2 border-stone-800 flex items-center justify-between gap-2 shrink-0">
        {/* Sol Rozet: Algoritma Mutfağı & Tarif İsmi */}
        <div className="bg-white/95 text-stone-900 rounded-2xl px-3.5 py-1.5 border-2 border-stone-800 shadow-md flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow">
            🍳
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xs sm:text-sm text-stone-900 leading-tight">
              Algoritma Mutfağı
            </span>
            <span className="text-[11px] font-bold text-amber-700 leading-none">
              {currentRecipe.name} • {mode === 'sirala' ? 'Sırala' : mode === 'eksik_adim' ? 'Eksik Adım' : 'Hata Ayıkla'}
            </span>
          </div>
        </div>

        {/* Sağ Butonlar Grubu: Mod Seçici, Ses, Tam Ekran, Kapat */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mod Seçici Açılır Menü */}
          <div className="relative">
            <button
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-white hover:bg-stone-50 text-stone-900 font-black text-xs sm:text-sm rounded-xl border-2 border-stone-800 shadow cursor-pointer active:scale-95 transition-all"
            >
              <SlidersHorizontal size={14} className="text-amber-600" />
              <span className="hidden xs:inline">
                {mode === 'sirala' ? 'Sırala • Sırayla' : mode === 'eksik_adim' ? 'Eksik Adımı Bul' : 'Hata Ayıkla'}
              </span>
              <span className="xs:hidden">Mod</span>
            </button>

            {showModeDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-stone-800 rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-1">
                <button
                  onClick={() => { setMode('sirala'); setShowModeDropdown(false); }}
                  className={`px-3 py-2 rounded-xl text-left font-black text-xs flex items-center gap-2 ${mode === 'sirala' ? 'bg-amber-100 text-amber-900' : 'hover:bg-stone-100 text-stone-800'}`}
                >
                  <ListOrdered size={14} />
                  <span>Sırala • Sırayla</span>
                </button>
                <button
                  onClick={() => { setMode('eksik_adim'); setShowModeDropdown(false); }}
                  className={`px-3 py-2 rounded-xl text-left font-black text-xs flex items-center gap-2 ${mode === 'eksik_adim' ? 'bg-amber-100 text-amber-900' : 'hover:bg-stone-100 text-stone-800'}`}
                >
                  <HelpCircle size={14} />
                  <span>Eksik Adımı Bul</span>
                </button>
                <button
                  onClick={() => { setMode('hatali_bul'); setShowModeDropdown(false); }}
                  className={`px-3 py-2 rounded-xl text-left font-black text-xs flex items-center gap-2 ${mode === 'hatali_bul' ? 'bg-amber-100 text-amber-900' : 'hover:bg-stone-100 text-stone-800'}`}
                >
                  <Bug size={14} />
                  <span>Hata Ayıkla (Bug)</span>
                </button>
              </div>
            )}
          </div>

          {/* Ses Butonu */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-800 shadow cursor-pointer active:scale-95"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Tam Ekran Butonu */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-800 shadow cursor-pointer active:scale-95"
            title="Tam Ekran"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Kapat (X) Butonu */}
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white border-2 border-stone-800 shadow cursor-pointer active:scale-95"
            title="Çıkış"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* 2. ÖĞRENCİ SEÇİM ŞERİDİ (AKILLI TAHTA) */}
      {students.length > 0 && (
        <div className="relative z-10 px-2 py-0.5 bg-stone-900 border-b border-stone-800 shrink-0">
          <StudentAvatarDock
            students={students}
            selectedStudentIds={selectedStudentIds}
            playerCount={1}
            onSelectStudentForPlayer={(pIdx, id) => onSelectStudentForPlayer?.(pIdx, id)}
            onOpenRosterModal={() => onOpenRosterModal?.(2)}
            playMp3={playMp3}
          />
        </div>
      )}

      {/* 3. ANA MUTFAK SAHNESİ - ARKA PLANLI VE GÖZ ALICI */}
      <div className="relative flex-1 flex flex-col justify-between p-2 sm:p-4 md:p-5 overflow-hidden">
        {/* Arka plan görseli (Sıcak Çizgi Mutfak) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#2a1708] via-[#1a120b] to-[#120d08]">
          <img
            src="/mutfak/kitchen_bg.jpg"
            alt="Mutfak Arka Planı"
            onError={(e) => {
              // Görsel gecikirse veya yüklenemezse kırık ikon gösterme, şık arka plan degrade tonunu koru
              (e.target as HTMLImageElement).style.opacity = '0';
            }}
            className="w-full h-full object-cover object-center filter brightness-[0.94] transition-opacity duration-300"
          />
          {/* Hafif sıcak güneş tonu katmanı */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-transparent pointer-events-none" />
        </div>

        {/* ÜST BÖLÜM: ŞEF KARAKTERİ + KONUŞMA BALONU (SOLDA) | BUGÜNKÜ TARİF KARTI (SAĞDA) */}
        <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-6 min-h-[140px] sm:min-h-[180px] md:min-h-[220px]">
          {/* SOL: ŞEF VE KONUŞMA BALONU */}
          <div className="flex items-center gap-2 sm:gap-4 max-w-2xl">
            {/* ŞEF KARAKTERİ (Şirin Çizgi Şef Kızı) */}
            <div className="relative shrink-0 flex items-end">
              <img
                src="/mutfak/chef_girl.jpg"
                alt="Şef Karakteri"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                className={`w-24 h-32 sm:w-32 sm:h-44 md:w-40 md:h-52 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.4)] transition-transform duration-300 ${
                  chefEmotion === 'happy' ? 'scale-105 animate-bounce' : chefEmotion === 'cooking' ? 'scale-105 -rotate-2' : ''
                }`}
              />
              {/* Pişirme anında şef yanında küçük alev simgesi */}
              {chefEmotion === 'cooking' && (
                <div className="absolute -top-1 -right-1 text-2xl animate-spin">🔥</div>
              )}
            </div>

            {/* ŞEFİN KONUŞMA BALONU (KOMİK / BİLGİLENDİRİCİ) */}
            <div className="relative bg-[#fffdf5] text-stone-900 font-extrabold text-xs sm:text-sm md:text-base px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-3xl border-3 border-stone-900 shadow-xl max-w-xs sm:max-w-md md:max-w-lg leading-snug">
              <p>{chefSpeech}</p>
              {/* Baloncuk sivri ucu (sol tarafa, şefe dönük) */}
              <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-[12px] border-r-[#fffdf5]" />
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[14px] border-r-stone-900 -z-10" />
            </div>
          </div>

          {/* SAĞ: BUGÜNKÜ TARİF KARTI (Örnek Menemen tavası + ekmek) */}
          <div className="bg-white/95 border-3 border-stone-900 rounded-3xl p-2.5 sm:p-3.5 shadow-2xl flex flex-col items-center w-40 sm:w-56 md:w-64 shrink-0 transition-all hover:scale-102">
            <div className="self-start px-2 py-0.5 rounded-lg bg-stone-900 text-white font-black text-[10px] sm:text-xs flex items-center gap-1.5 mb-1 shadow">
              <span>🍴</span>
              <span>Bugünkü tarif</span>
            </div>
            {/* Büyük Yemek Görseli */}
            <div className="w-full h-20 sm:h-28 md:h-32 flex items-center justify-center overflow-hidden my-0.5 sm:my-1">
              {currentRecipe.dishImage ? (
                <img
                  src={currentRecipe.dishImage}
                  alt={currentRecipe.name}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain drop-shadow-md hover:scale-105 transition-transform"
                />
              ) : (
                <div className="text-5xl sm:text-6xl md:text-7xl filter drop-shadow animate-pulse">
                  {currentRecipe.dishEmoji}
                </div>
              )}
            </div>
            {/* Yemek İsmi & Tarif Değiştirme Butonları */}
            <div className="w-full flex items-center justify-between gap-1 mt-1 border-t border-stone-200 pt-1">
              <button
                onClick={handlePrevRecipe}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-700 font-bold text-xs"
                title="Önceki Tarif"
              >
                ◀
              </button>
              <span className="font-black text-stone-900 text-xs sm:text-sm md:text-base text-center truncate px-1">
                {currentRecipe.name}
              </span>
              <button
                onClick={handleNextRecipe}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-700 font-bold text-xs"
                title="Sonraki Tarif"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* ORTA BÖLÜM: TARİF SIRASI (AHŞAP TEPSİ VE NUMARALI SLOTLAR) */}
        <div className="relative z-10 w-full bg-[#8b5a2b] border-3 border-stone-950 rounded-2xl sm:rounded-3xl p-2 sm:p-3 md:p-3.5 shadow-[0_10px_25px_rgba(0,0,0,0.5)] my-2 sm:my-3">
          {/* Tepsi Başlığı */}
          <div className="flex items-center justify-between mb-1 sm:mb-2 px-1">
            <div className="flex items-center gap-1.5 text-amber-100 font-black text-xs sm:text-sm drop-shadow">
              <ListOrdered size={16} />
              <span>Tarif sırası</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-amber-200/90">
                {mode === 'sirala' ? 'Kartları sırasıyla yerleştirin' : mode === 'eksik_adim' ? 'Eksik olan adımı bulun' : 'Hatalı adıma tıklayın'}
              </span>
              {mode === 'sirala' && (
                <button
                  onClick={handleResetSlots}
                  className="px-2 py-0.5 rounded-lg bg-stone-900/40 hover:bg-stone-900/60 text-amber-200 text-[10px] font-bold border border-amber-400/30 cursor-pointer active:scale-95"
                >
                  Boşalt
                </button>
              )}
            </div>
          </div>

          {/* SLOTLAR SATIRI (1'den N'e kadar sıralı kutular ve aralarındaki oklar) */}
          <div className="flex items-center justify-start sm:justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-1">
            {slots.map((step, idx) => {
              const isMissingSlot = mode === 'eksik_adim' && idx === missingSlotIndex;
              const isBuggySlot = mode === 'hatali_bul' && idx === buggyTargetIndex;
              const isCurrentlyExecuting = executingStepIndex === idx;

              return (
                <React.Fragment key={idx}>
                  {/* Slot Kutusu */}
                  <div
                    onClick={() => {
                      if (mode === 'sirala' && step) handleRemoveCardFromSlot(idx);
                      if (mode === 'hatali_bul') handlePickBuggyStep(idx);
                    }}
                    className={`relative shrink-0 flex flex-col items-center justify-between rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all duration-200 ${
                      step
                        ? 'bg-white border-stone-800 shadow-md cursor-pointer hover:border-amber-500'
                        : isMissingSlot
                        ? 'bg-amber-100/90 border-dashed border-amber-400 animate-pulse'
                        : 'bg-stone-800/40 border-dashed border-amber-200/50'
                    } ${
                      isCurrentlyExecuting ? 'ring-4 ring-orange-500 scale-105 shadow-xl' : ''
                    } w-[82px] h-[105px] xs:w-[96px] xs:h-[120px] sm:w-[110px] sm:h-[135px] md:w-[125px] md:h-[150px] p-1 sm:p-1.5`}
                  >
                    {/* Numara Rozeti (Sol Üst) */}
                    <div className="absolute top-1 left-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-stone-900 text-white font-black text-[10px] sm:text-xs flex items-center justify-center shadow">
                      {idx + 1}
                    </div>

                    {/* Slot İçeriği */}
                    {step ? (
                      <>
                        {/* Büyük Görsel (Kullanıcının 3D Kart Görseli) */}
                        <div className="w-full flex-1 flex items-center justify-center pt-1 pb-0.5 overflow-hidden">
                          <CookingStepGraphic actionType={step.actionType} emoji={step.emoji} image={step.image} altText={step.title} />
                        </div>
                        {/* Sade, Az ve Öz Başlık (Görselde yazı yoksa fallback olarak gösterilir) */}
                        {!step.image && (
                          <span className="w-full font-black text-stone-900 text-[10px] sm:text-xs text-center leading-tight truncate px-0.5">
                            {step.title}
                          </span>
                        )}
                      </>
                    ) : isMissingSlot ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-amber-700">
                        <span className="text-2xl sm:text-3xl font-black">❓</span>
                        <span className="text-[10px] font-bold mt-1">Eksik Adım</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-amber-200/30 text-lg sm:text-2xl font-black">+{idx + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Slotlar arası chevron oku (>) */}
                  {idx < slots.length - 1 && (
                    <ChevronRight size={18} className="text-amber-200/60 shrink-0 hidden sm:inline" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ALT BÖLÜM: MUTFAK TEZGAHI / SEÇİLEBİLİR BÜYÜK KARTLAR & PİŞİR BUTONU */}
        <div className="relative z-10 w-full flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3 bg-stone-900/80 backdrop-blur-md p-2 sm:p-3 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-stone-800 shadow-2xl">
          {/* KARTLAR LİSTESİ */}
          <div className="flex-1 flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1 px-1">
            {mode === 'sirala' && availableCards.length === 0 && (
              <div className="w-full py-4 text-center text-amber-200 font-bold text-xs sm:text-sm">
                Tüm kartlar tepsiye dizildi! Sağdaki <strong className="text-orange-400">"Pişir!"</strong> butonuna basarak algoritmayı çalıştırabilirsin.
              </div>
            )}

            {/* SIRALA MODUNDA TEZGAHTAKİ KARTLAR */}
            {mode === 'sirala' && availableCards.map((step) => (
              <button
                key={step.id}
                onClick={() => handlePlaceCard(step)}
                disabled={isExecuting}
                className="group shrink-0 flex flex-col items-center justify-between bg-white border-2 sm:border-3 border-stone-800 rounded-xl sm:rounded-2xl p-1 shadow-lg hover:-translate-y-1 hover:border-amber-500 hover:shadow-2xl active:translate-y-0.5 cursor-pointer transition-all duration-150 w-[95px] h-[120px] xs:w-[110px] xs:h-[135px] sm:w-[125px] sm:h-[150px] md:w-[140px] md:h-[165px] overflow-hidden"
              >
                {/* BÜYÜK VE NET GÖRSEL */}
                <div className="w-full flex-1 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform overflow-hidden">
                  <CookingStepGraphic actionType={step.actionType} emoji={step.emoji} image={step.image} altText={step.title} />
                </div>
                {!step.image && (
                  <span className="w-full font-black text-stone-900 text-[10px] sm:text-xs md:text-sm text-center leading-tight px-0.5 truncate">
                    {step.title}
                  </span>
                )}
              </button>
            ))}

            {/* EKSİK ADIM MODUNDA SEÇENEKLER */}
            {mode === 'eksik_adim' && (
              <div className="w-full flex items-center justify-center gap-3">
                <span className="text-amber-200 font-black text-xs sm:text-sm shrink-0">Eksik Adımı Seç:</span>
                {missingOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectMissingOption(opt)}
                    className="flex flex-col items-center justify-between bg-white border-3 border-stone-800 rounded-2xl p-1.5 shadow-lg hover:-translate-y-1 hover:border-amber-500 hover:shadow-xl active:translate-y-0.5 cursor-pointer transition-all w-[110px] h-[135px] sm:w-[130px] sm:h-[155px] overflow-hidden"
                  >
                    <div className="w-full flex-1 flex items-center justify-center p-0.5 overflow-hidden">
                      <CookingStepGraphic actionType={opt.actionType} emoji={opt.emoji} image={opt.image} altText={opt.title} />
                    </div>
                    {!opt.image && (
                      <span className="font-black text-stone-900 text-xs text-center leading-tight">
                        {opt.title}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* HATALI ADIM (DEBUGGING) MODUNDA BİLGİ */}
            {mode === 'hatali_bul' && (
              <div className="w-full py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                <Bug size={24} className="text-amber-400 shrink-0" />
                <p className="text-amber-200 text-xs sm:text-sm font-bold">
                  Yukarıdaki tepside tarifin arasına sızmış mantıksız/hatalı bir adım var! Hatalı kartı bulup üzerine tıkla ve hatayı ayıkla (Debug).
                </p>
              </div>
            )}
          </div>

          {/* SAĞ EYLEM BUTONLARI (PİŞİR! VE KARIŞTIR) */}
          {mode === 'sirala' && (
            <div className="flex sm:flex-col gap-2 shrink-0 justify-center">
              {/* PİŞİR BUTONU */}
              <button
                onClick={handleExecuteCooking}
                disabled={isExecuting || availableCards.length > 0}
                className={`flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl border-3 border-stone-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-95 transition-all ${
                  availableCards.length === 0
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:brightness-110 animate-pulse'
                    : 'bg-[#e5e5e5] text-stone-700 hover:bg-[#d5d5d5]'
                }`}
              >
                <Flame size={20} className={availableCards.length === 0 ? 'text-yellow-200' : 'text-orange-500'} />
                <span>Pişir!</span>
              </button>

              {/* KARIŞTIR BUTONU */}
              <button
                onClick={handleShuffle}
                disabled={isExecuting || availableCards.length <= 1}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#f2e6d6] hover:bg-[#e4d4be] text-stone-900 border-2 sm:border-3 border-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer"
              >
                <Shuffle size={16} />
                <span>Karıştır</span>
              </button>
            </div>
          )}

          {/* EKSİK ADIM VEYA HATALI BUL MODUNDA YENİDEN BAŞLAT / DEVAM BUTONU */}
          {resultStatus === 'success' && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleNextRecipe}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-3 border-stone-950 font-black text-sm flex items-center gap-2 shadow-xl animate-bounce cursor-pointer"
              >
                <Sparkles size={18} />
                <span>Sonraki Tarif ▶</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
