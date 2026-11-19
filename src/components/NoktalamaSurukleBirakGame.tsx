import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2, RotateCcw, Sparkles, RefreshCw, AlertCircle, Eraser
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { ActivityBackground } from './ActivityBackground';

export type PunctuationMark = '.' | ',' | '?' | '!' | "'";

interface SentenceSegment {
  type: 'text' | 'slot';
  text?: string;
  slotId?: string;
  correctMark?: PunctuationMark;
  ruleHint?: string;
}

export interface PunctuationSentence {
  id: string;
  segments: SentenceSegment[];
}

interface PunctuationMarkDef {
  symbol: PunctuationMark;
  name: string;
  shortDesc: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const PUNCTUATION_MARKS: PunctuationMarkDef[] = [
  {
    symbol: '.',
    name: 'Nokta',
    shortDesc: 'Cümle sonu / Sıra',
    bgClass: 'from-emerald-500 to-teal-600',
    borderClass: 'border-emerald-300',
    textClass: 'text-white',
  },
  {
    symbol: ',',
    name: 'Virgül',
    shortDesc: 'Sıralı kelimeler',
    bgClass: 'from-amber-500 to-orange-600',
    borderClass: 'border-amber-200',
    textClass: 'text-slate-950',
  },
  {
    symbol: '?',
    name: 'Soru İşareti',
    shortDesc: 'Soru cümlesi',
    bgClass: 'from-sky-500 to-blue-600',
    borderClass: 'border-sky-200',
    textClass: 'text-white',
  },
  {
    symbol: '!',
    name: 'Ünlem',
    shortDesc: 'Heyecan / Uyarı',
    bgClass: 'from-rose-500 to-pink-600',
    borderClass: 'border-rose-200',
    textClass: 'text-white',
  },
  {
    symbol: "'",
    name: 'Kesme İşareti',
    shortDesc: 'Özel ad ekleri',
    bgClass: 'from-violet-500 to-purple-600',
    borderClass: 'border-violet-200',
    textClass: 'text-white',
  },
];

// 2. Sınıf MEB Türkçe Kazanımlarına (T.2.4.2) uygun 25 cümlelik soru havuzu (5'li setler halinde)
const SENTENCE_SETS: PunctuationSentence[][] = [
  // SET 1
  [
    {
      id: 's1-1',
      segments: [
        { type: 'text', text: 'Pazardan elma' },
        { type: 'slot', slotId: 's1-1-a', correctMark: ',', ruleHint: 'Eş görevli sözcükleri (elma, armut) ayırmak için virgül (,) konur.' },
        { type: 'text', text: 'armut ve muz aldık' },
        { type: 'slot', slotId: 's1-1-b', correctMark: '.', ruleHint: 'Anlamı tamamlanmış cümlelerin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's1-2',
      segments: [
        { type: 'text', text: 'Yarın bizimle parka gelecek misin' },
        { type: 'slot', slotId: 's1-2-a', correctMark: '?', ruleHint: 'Soru anlamı taşıyan cümlelerin sonuna soru işareti (?) konur.' },
      ],
    },
    {
      id: 's1-3',
      segments: [
        { type: 'text', text: 'Eyvah' },
        { type: 'slot', slotId: 's1-3-a', correctMark: ',', ruleHint: 'Seslenme ve ünlem bildiren kelimeden sonra virgül (,) kullanılabilir.' },
        { type: 'text', text: 'süt ocakta taştı' },
        { type: 'slot', slotId: 's1-3-b', correctMark: '!', ruleHint: 'Korku, telaş ve heyecan bildiren cümlenin sonuna ünlem (!) konur.' },
      ],
    },
    {
      id: 's1-4',
      segments: [
        { type: 'text', text: 'Yaz tatilinde Ankara' },
        { type: 'slot', slotId: 's1-4-a', correctMark: "'", ruleHint: 'Özel adlara (Ankara) gelen ekleri ayırmak için kesme işareti (\') konur.' },
        { type: 'text', text: 'ya gideceğiz' },
        { type: 'slot', slotId: 's1-4-b', correctMark: '.', ruleHint: 'Tamamlanmış cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's1-5',
      segments: [
        { type: 'text', text: 'Sınıfımızdaki en sevdiğin ders hangisi' },
        { type: 'slot', slotId: 's1-5-a', correctMark: '?', ruleHint: 'Cevap bekleyen soru cümlelerinin sonuna soru işareti (?) konur.' },
      ],
    },
  ],
  // SET 2
  [
    {
      id: 's2-1',
      segments: [
        { type: 'text', text: 'Atatürk' },
        { type: 'slot', slotId: 's2-1-a', correctMark: "'", ruleHint: 'Kişi adlarına gelen ekleri ayırmak için kesme işareti (\') kullanılır.' },
        { type: 'text', text: 'ü sevgi ve saygıyla anıyoruz' },
        { type: 'slot', slotId: 's2-1-b', correctMark: '.', ruleHint: 'Kurallı ve bitmiş cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's2-2',
      segments: [
        { type: 'text', text: 'Yaşasın' },
        { type: 'slot', slotId: 's2-2-a', correctMark: ',', ruleHint: 'Duygu bildiren sözcükten sonra virgül (,) konup cümle sonunda ünlem (!) kullanılır.' },
        { type: 'text', text: 'yarın okulumuzda şenlik var' },
        { type: 'slot', slotId: 's2-2-b', correctMark: '!', ruleHint: 'Büyük sevinç bildiren cümlenin sonuna ünlem işareti (!) konur.' },
      ],
    },
    {
      id: 's2-3',
      segments: [
        { type: 'text', text: 'Kalem' },
        { type: 'slot', slotId: 's2-3-a', correctMark: ',', ruleHint: 'Sıralanan eş görevli kelimelerin arasına virgül (,) konur.' },
        { type: 'text', text: 'silgi' },
        { type: 'slot', slotId: 's2-3-b', correctMark: ',', ruleHint: 'Aynı görevdeki kelimeleri ayırmak için virgül (,) kullanılır.' },
        { type: 'text', text: 'defter ve boyalarımı çantama koydum' },
        { type: 'slot', slotId: 's2-3-c', correctMark: '.', ruleHint: 'Bitmiş cümlelerin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's2-4',
      segments: [
        { type: 'text', text: 'Ödevlerini zamanında bitirdin mi' },
        { type: 'slot', slotId: 's2-4-a', correctMark: '?', ruleHint: 'Soru eki "mi" bulunan soru cümlesinin sonuna soru işareti (?) konur.' },
      ],
    },
    {
      id: 's2-5',
      segments: [
        { type: 'text', text: 'Ben 2' },
        { type: 'slot', slotId: 's2-5-a', correctMark: '.', ruleHint: 'Sıra bildiren sayıların ("2." = ikinci) yanına nokta (.) konur.' },
        { type: 'text', text: 'sınıfta okuyorum' },
        { type: 'slot', slotId: 's2-5-b', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
  ],
  // SET 3
  [
    {
      id: 's3-1',
      segments: [
        { type: 'text', text: 'Dikkat et' },
        { type: 'slot', slotId: 's3-1-a', correctMark: ',', ruleHint: 'Uyarı ifadesinden sonra virgül (,) koyup cümlenin sonuna ünlem (!) getiririz.' },
        { type: 'text', text: 'yerler çok kaygan' },
        { type: 'slot', slotId: 's3-1-b', correctMark: '!', ruleHint: 'Uyarı ve tehlike bildiren cümlelerin sonuna ünlem (!) konur.' },
      ],
    },
    {
      id: 's3-2',
      segments: [
        { type: 'text', text: 'Elif' },
        { type: 'slot', slotId: 's3-2-a', correctMark: "'", ruleHint: 'Özel isimlere (Elif) gelen ek kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'in kedisi Pamuk çok sevimlidir' },
        { type: 'slot', slotId: 's3-2-b', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's3-3',
      segments: [
        { type: 'text', text: 'Bu kitabı nereden aldın' },
        { type: 'slot', slotId: 's3-3-a', correctMark: '?', ruleHint: 'Soru anlamı taşıyan cümlenin sonuna soru işareti (?) konur.' },
      ],
    },
    {
      id: 's3-4',
      segments: [
        { type: 'text', text: 'Kahvaltıda peynir' },
        { type: 'slot', slotId: 's3-4-a', correctMark: ',', ruleHint: 'Eş görevli kelimeler arasına virgül (,) konur.' },
        { type: 'text', text: 'zeytin ve yumurta yedim' },
        { type: 'slot', slotId: 's3-4-b', correctMark: '.', ruleHint: 'Tamamlanmış cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's3-5',
      segments: [
        { type: 'text', text: 'Cumhuriyet 29 Ekim' },
        { type: 'slot', slotId: 's3-5-a', correctMark: "'", ruleHint: 'Belirli gün ve tarihlere gelen ekler kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'de ilan edildi' },
        { type: 'slot', slotId: 's3-5-b', correctMark: '.', ruleHint: 'Bitmiş cümlelerin sonuna nokta (.) konur.' },
      ],
    },
  ],
  // SET 4
  [
    {
      id: 's4-1',
      segments: [
        { type: 'text', text: 'Türkiye' },
        { type: 'slot', slotId: 's4-1-a', correctMark: "'", ruleHint: 'Ülke adları özel isimdir, gelen ek kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'nin başkenti neresidir' },
        { type: 'slot', slotId: 's4-1-b', correctMark: '?', ruleHint: 'Soru bildiren cümlelerin sonuna soru işareti (?) konur.' },
      ],
    },
    {
      id: 's4-2',
      segments: [
        { type: 'text', text: 'Bahçede top oynadık' },
        { type: 'slot', slotId: 's4-2-a', correctMark: ',', ruleHint: 'Sıralı cümleleri birbirinden ayırmak için virgül (,) konur.' },
        { type: 'text', text: 'ip atladık ve koştuk' },
        { type: 'slot', slotId: 's4-2-b', correctMark: '.', ruleHint: 'Tamamlanmış cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's4-3',
      segments: [
        { type: 'text', text: 'Aferin sana' },
        { type: 'slot', slotId: 's4-3-a', correctMark: ',', ruleHint: 'Hitap ve övgü sözünden sonra virgül (,) konur.' },
        { type: 'text', text: 'yarışmada 1' },
        { type: 'slot', slotId: 's4-3-b', correctMark: '.', ruleHint: 'Sıra bildiren sayıların ("1." = birinci) sonuna nokta (.) konur.' },
        { type: 'text', text: 'oldun' },
        { type: 'slot', slotId: 's4-3-c', correctMark: '!', ruleHint: 'Coşku ve sevinç bildiren cümlenin sonuna ünlem (!) konur.' },
      ],
    },
    {
      id: 's4-4',
      segments: [
        { type: 'text', text: 'Evet' },
        { type: 'slot', slotId: 's4-4-a', correctMark: ',', ruleHint: 'Kabul ve ret bildiren "Evet, Hayır" sözcüklerinden sonra virgül (,) konur.' },
        { type: 'text', text: 'dişlerimi her akşam fırçalarım' },
        { type: 'slot', slotId: 's4-4-b', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's4-5',
      segments: [
        { type: 'text', text: 'İzmir' },
        { type: 'slot', slotId: 's4-5-a', correctMark: "'", ruleHint: 'Şehir isimlerine gelen ekler kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'e ne zaman gideceksiniz' },
        { type: 'slot', slotId: 's4-5-b', correctMark: '?', ruleHint: 'Soru anlamlı cümlenin sonuna soru işareti (?) konur.' },
      ],
    },
  ],
  // SET 5
  [
    {
      id: 's5-1',
      segments: [
        { type: 'text', text: 'İmdat' },
        { type: 'slot', slotId: 's5-1-a', correctMark: ',', ruleHint: 'Yardım ve seslenme sözcüğünden sonra virgül (,) konur.' },
        { type: 'text', text: 'yavru kedi ağaçta mahsur kaldı' },
        { type: 'slot', slotId: 's5-1-b', correctMark: '!', ruleHint: 'Korku ve heyecan bildiren cümlenin sonuna ünlem (!) konur.' },
      ],
    },
    {
      id: 's5-2',
      segments: [
        { type: 'text', text: 'Kırtasiyeden kırmızı' },
        { type: 'slot', slotId: 's5-2-a', correctMark: ',', ruleHint: 'Eş görevli kelimelerin (kırmızı, mavi) arasına virgül (,) konur.' },
        { type: 'text', text: 'mavi ve sarı karton aldık' },
        { type: 'slot', slotId: 's5-2-b', correctMark: '.', ruleHint: 'Bitmiş cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's5-3',
      segments: [
        { type: 'text', text: 'Karabaş' },
        { type: 'slot', slotId: 's5-3-a', correctMark: "'", ruleHint: 'Hayvanlara verilen özel adlara gelen ekler kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'a su ve mama verdin mi' },
        { type: 'slot', slotId: 's5-3-b', correctMark: '?', ruleHint: 'Soru cümlesinin sonuna soru işareti (?) konur.' },
      ],
    },
    {
      id: 's5-4',
      segments: [
        { type: 'text', text: 'Saat 08' },
        { type: 'slot', slotId: 's5-4-a', correctMark: '.', ruleHint: 'Saat ve dakika arasına nokta (.) konur.' },
        { type: 'text', text: '30' },
        { type: 'slot', slotId: 's5-4-b', correctMark: "'", ruleHint: 'Saatlere gelen ekleri ayırmak için kesme işareti (\') konur.' },
        { type: 'text', text: 'da dersimiz başlıyor' },
        { type: 'slot', slotId: 's5-4-c', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's5-5',
      segments: [
        { type: 'text', text: 'Hayır' },
        { type: 'slot', slotId: 's5-5-a', correctMark: ',', ruleHint: 'Kabul ve ret sözcüklerinden (Hayır) sonra virgül (,) konur.' },
        { type: 'text', text: 'yarın hava yağmurlu olmayacak' },
        { type: 'slot', slotId: 's5-5-b', correctMark: '.', ruleHint: 'Tamamlanmış cümlenin sonuna nokta (.) konur.' },
      ],
    },
  ],
  // SET 6
  [
    {
      id: 's6-1',
      segments: [
        { type: 'text', text: 'Sevgili öğretmenim' },
        { type: 'slot', slotId: 's6-1-a', correctMark: ',', ruleHint: 'Hitap sözlerinden sonra virgül (,) konur.' },
        { type: 'text', text: 'bugün yeni şiirimizi okuyacağız' },
        { type: 'slot', slotId: 's6-1-b', correctMark: '.', ruleHint: 'Tamamlanmış cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's6-2',
      segments: [
        { type: 'text', text: 'Van Gölü' },
        { type: 'slot', slotId: 's6-2-a', correctMark: "'", ruleHint: 'Yer adlarına (Van Gölü) gelen ekler kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'nde yüzen tekneleri gördün mü' },
        { type: 'slot', slotId: 's6-2-b', correctMark: '?', ruleHint: 'Soru anlamı taşıyan cümlelerin sonuna soru işareti (?) konur.' },
      ],
    },
    {
      id: 's6-3',
      segments: [
        { type: 'text', text: 'Sakın' },
        { type: 'slot', slotId: 's6-3-a', correctMark: ',', ruleHint: 'Uyarı bildiren sözcükten sonra virgül (,) konabilir.' },
        { type: 'text', text: 'kırmızı ışıkta karşıya geçme' },
        { type: 'slot', slotId: 's6-3-b', correctMark: '!', ruleHint: 'Güçlü uyarı bildiren cümlenin sonuna ünlem (!) konur.' },
      ],
    },
    {
      id: 's6-4',
      segments: [
        { type: 'text', text: 'Çantamda Türkçe' },
        { type: 'slot', slotId: 's6-4-a', correctMark: ',', ruleHint: 'Eş görevli ders adlarını ayırmak için virgül (,) konur.' },
        { type: 'text', text: 'Matematik ve Hayat Bilgisi kitaplarım var' },
        { type: 'slot', slotId: 's6-4-b', correctMark: '.', ruleHint: 'Kurallı cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's6-5',
      segments: [
        { type: 'text', text: 'Akşam yemeğinden sonra dişlerini fırçaladın mı' },
        { type: 'slot', slotId: 's6-5-a', correctMark: '?', ruleHint: 'Soru eki "mı" bulunan cümlenin sonuna soru işareti (?) konur.' },
      ],
    },
  ],
  // SET 7
  [
    {
      id: 's7-1',
      segments: [
        { type: 'text', text: 'Kitabımı açtım' },
        { type: 'slot', slotId: 's7-1-a', correctMark: ',', ruleHint: 'Birbiri ardınca sıralanan cümleleri ayırmak için virgül (,) konur.' },
        { type: 'text', text: 'dikkatlice okudum ve özetini çıkardım' },
        { type: 'slot', slotId: 's7-1-b', correctMark: '.', ruleHint: 'Bitmiş cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's7-2',
      segments: [
        { type: 'text', text: 'Zeynep' },
        { type: 'slot', slotId: 's7-2-a', correctMark: "'", ruleHint: 'Kişi adlarına gelen ekler kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'ten ödünç hikâye kitabı aldım' },
        { type: 'slot', slotId: 's7-2-b', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's7-3',
      segments: [
        { type: 'text', text: 'Vay canına' },
        { type: 'slot', slotId: 's7-3-a', correctMark: ',', ruleHint: 'Şaşkınlık ifadesinden sonra virgül (,) konur.' },
        { type: 'text', text: 'uçurtman bulutlara kadar yükseldi' },
        { type: 'slot', slotId: 's7-3-b', correctMark: '!', ruleHint: 'Şaşkınlık ve hayranlık bildiren cümlenin sonuna ünlem (!) konur.' },
      ],
    },
    {
      id: 's7-4',
      segments: [
        { type: 'text', text: 'Okulumuzdaki kütüphane 3' },
        { type: 'slot', slotId: 's7-4-a', correctMark: '.', ruleHint: 'Sıra bildiren sayının ("3." = üçüncü) yanına nokta (.) konur.' },
        { type: 'text', text: 'kattadır' },
        { type: 'slot', slotId: 's7-4-b', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's7-5',
      segments: [
        { type: 'text', text: 'Hangi otobüse bineceğimizi biliyor musun' },
        { type: 'slot', slotId: 's7-5-a', correctMark: '?', ruleHint: 'Soru bildiren cümlelerin sonuna soru işareti (?) konur.' },
      ],
    },
  ],
  // SET 8
  [
    {
      id: 's8-1',
      segments: [
        { type: 'text', text: 'Trafikte kırmızı' },
        { type: 'slot', slotId: 's8-1-a', correctMark: ',', ruleHint: 'Eş görevli renk adlarının arasına virgül (,) konur.' },
        { type: 'text', text: 'sarı ve yeşil ışıklar sırayla yanar' },
        { type: 'slot', slotId: 's8-1-b', correctMark: '.', ruleHint: 'Tamamlanmış cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's8-2',
      segments: [
        { type: 'text', text: 'Tüh' },
        { type: 'slot', slotId: 's8-2-a', correctMark: ',', ruleHint: 'Üzüntü ve şaşkınlık ünleminden sonra virgül (,) konabilir.' },
        { type: 'text', text: 'resim defterimi evde unutmuşum' },
        { type: 'slot', slotId: 's8-2-b', correctMark: '!', ruleHint: 'Üzüntü ve heyecan bildiren cümlenin sonuna ünlem (!) konur.' },
      ],
    },
    {
      id: 's8-3',
      segments: [
        { type: 'text', text: 'Dünya' },
        { type: 'slot', slotId: 's8-3-a', correctMark: "'", ruleHint: 'Gezegen adları özel isimdir, gelen ek kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'mızı temiz tutmak hepimizin görevidir' },
        { type: 'slot', slotId: 's8-3-b', correctMark: '.', ruleHint: 'Bitmiş cümlelerin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's8-4',
      segments: [
        { type: 'text', text: 'Tabii' },
        { type: 'slot', slotId: 's8-4-a', correctMark: ',', ruleHint: 'Onay bildiren kelimeden sonra virgül (,) konur.' },
        { type: 'text', text: 'ödevinde sana seve seve yardım ederim' },
        { type: 'slot', slotId: 's8-4-b', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's8-5',
      segments: [
        { type: 'text', text: 'Doğum günün ne zaman kutlanacak' },
        { type: 'slot', slotId: 's8-5-a', correctMark: '?', ruleHint: 'Soru anlamlı cümlenin sonuna soru işareti (?) konur.' },
      ],
    },
  ],
  // SET 9
  [
    {
      id: 's9-1',
      segments: [
        { type: 'text', text: '23 Nisan' },
        { type: 'slot', slotId: 's9-1-a', correctMark: "'", ruleHint: 'Belirli gün ve tarihlere gelen ekler kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'da okulumuzu bayraklarla süsledik' },
        { type: 'slot', slotId: 's9-1-b', correctMark: '.', ruleHint: 'Tamamlanmış cümlelerin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's9-2',
      segments: [
        { type: 'text', text: 'Canım arkadaşım' },
        { type: 'slot', slotId: 's9-2-a', correctMark: ',', ruleHint: 'Hitap ifadelerinden sonra virgül (,) konur.' },
        { type: 'text', text: 'mektubunu okuyunca çok mutlu oldum' },
        { type: 'slot', slotId: 's9-2-b', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's9-3',
      segments: [
        { type: 'text', text: 'Harika' },
        { type: 'slot', slotId: 's9-3-a', correctMark: ',', ruleHint: 'Duygu bildiren sözcükten sonra virgül (,) konur.' },
        { type: 'text', text: 'bütün soruları doğru cevapladın' },
        { type: 'slot', slotId: 's9-3-b', correctMark: '!', ruleHint: 'Coşku ve övgü bildiren cümlenin sonuna ünlem (!) konur.' },
      ],
    },
    {
      id: 's9-4',
      segments: [
        { type: 'text', text: 'Bugün okuldan neden erken çıktınız' },
        { type: 'slot', slotId: 's9-4-a', correctMark: '?', ruleHint: '"Neden" soru kelimesi içeren cümlenin sonuna soru işareti (?) konur.' },
      ],
    },
    {
      id: 's9-5',
      segments: [
        { type: 'text', text: 'Manavdan kiraz' },
        { type: 'slot', slotId: 's9-5-a', correctMark: ',', ruleHint: 'Eş görevli meyve adlarını ayırmak için virgül (,) konur.' },
        { type: 'text', text: 'şeftali' },
        { type: 'slot', slotId: 's9-5-b', correctMark: ',', ruleHint: 'Sıralanan kelimeler arasına virgül (,) konur.' },
        { type: 'text', text: 'kayısı ve üzüm aldık' },
        { type: 'slot', slotId: 's9-5-c', correctMark: '.', ruleHint: 'Bitmiş cümlenin sonuna nokta (.) konur.' },
      ],
    },
  ],
  // SET 10
  [
    {
      id: 's10-1',
      segments: [
        { type: 'text', text: 'Tekir' },
        { type: 'slot', slotId: 's10-1-a', correctMark: "'", ruleHint: 'Hayvanlara verilen özel adlara gelen ek kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'in tüyleri yumuşacık ve tertemizdi' },
        { type: 'slot', slotId: 's10-1-b', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's10-2',
      segments: [
        { type: 'text', text: 'Saat 14' },
        { type: 'slot', slotId: 's10-2-a', correctMark: '.', ruleHint: 'Saat ve dakika arasına nokta (.) konur.' },
        { type: 'text', text: '15' },
        { type: 'slot', slotId: 's10-2-b', correctMark: "'", ruleHint: 'Saatlere gelen ekleri ayırmak için kesme işareti (\') konur.' },
        { type: 'text', text: 'te bahçede buluşalım mı' },
        { type: 'slot', slotId: 's10-2-c', correctMark: '?', ruleHint: 'Soru bildiren cümlenin sonuna soru işareti (?) konur.' },
      ],
    },
    {
      id: 's10-3',
      segments: [
        { type: 'text', text: 'Dikkat' },
        { type: 'slot', slotId: 's10-3-a', correctMark: ',', ruleHint: 'Seslenme ve uyarı sözünden sonra virgül (,) konur.' },
        { type: 'text', text: 'arkandan bisiklet geliyor' },
        { type: 'slot', slotId: 's10-3-b', correctMark: '!', ruleHint: 'Uyarı bildiren cümlelerin sonuna ünlem (!) konur.' },
      ],
    },
    {
      id: 's10-4',
      segments: [
        { type: 'text', text: 'Ağaçları koruduk' },
        { type: 'slot', slotId: 's10-4-a', correctMark: ',', ruleHint: 'Sıralı cümleleri ayırmak için virgül (,) konur.' },
        { type: 'text', text: 'parka yeni fidanlar diktik' },
        { type: 'slot', slotId: 's10-4-b', correctMark: '.', ruleHint: 'Tamamlanmış cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's10-5',
      segments: [
        { type: 'text', text: 'Kardeşin kaç yaşındaymış' },
        { type: 'slot', slotId: 's10-5-a', correctMark: '?', ruleHint: 'Soru cümlesinin sonuna soru işareti (?) konur.' },
      ],
    },
  ],
  // SET 11
  [
    {
      id: 's11-1',
      segments: [
        { type: 'text', text: 'Merve' },
        { type: 'slot', slotId: 's11-1-a', correctMark: "'", ruleHint: 'Kişi adlarına gelen ekler kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'ye doğum gününde güzel bir kitap aldık' },
        { type: 'slot', slotId: 's11-1-b', correctMark: '.', ruleHint: 'Bitmiş cümlelerin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's11-2',
      segments: [
        { type: 'text', text: 'Aaa' },
        { type: 'slot', slotId: 's11-2-a', correctMark: ',', ruleHint: 'Şaşkınlık sözünden sonra virgül (,) konabilir.' },
        { type: 'text', text: 'yağmurdan sonra gökkuşağı çıkmış' },
        { type: 'slot', slotId: 's11-2-b', correctMark: '!', ruleHint: 'Şaşkınlık ve sevinç bildiren cümlelerin sonuna ünlem (!) konur.' },
      ],
    },
    {
      id: 's11-3',
      segments: [
        { type: 'text', text: 'Ellerimi yıkadım' },
        { type: 'slot', slotId: 's11-3-a', correctMark: ',', ruleHint: 'Sıralı eylemleri ayırmak için virgül (,) konur.' },
        { type: 'text', text: 'sofraya oturdum ve yemeğimi yedim' },
        { type: 'slot', slotId: 's11-3-b', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's11-4',
      segments: [
        { type: 'text', text: '10 Kasım' },
        { type: 'slot', slotId: 's11-4-a', correctMark: "'", ruleHint: 'Belirli gün ve tarihlere gelen ekler kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'da saat dokuzu beş geçe saygı duruşunda durduk' },
        { type: 'slot', slotId: 's11-4-b', correctMark: '.', ruleHint: 'Kurallı cümlelerin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's11-5',
      segments: [
        { type: 'text', text: 'Sabah kahvaltıda neler yedin' },
        { type: 'slot', slotId: 's11-5-a', correctMark: '?', ruleHint: 'Soru anlamı taşıyan cümlenin sonuna soru işareti (?) konur.' },
      ],
    },
  ],
  // SET 12
  [
    {
      id: 's12-1',
      segments: [
        { type: 'text', text: 'Antalya' },
        { type: 'slot', slotId: 's12-1-a', correctMark: "'", ruleHint: 'Şehir isimlerine gelen ekler kesme işareti (\') ile ayrılır.' },
        { type: 'text', text: 'nın denizi yaz aylarında çok sıcak olur' },
        { type: 'slot', slotId: 's12-1-b', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's12-2',
      segments: [
        { type: 'text', text: 'Elbette' },
        { type: 'slot', slotId: 's12-2-a', correctMark: ',', ruleHint: 'Onay bildiren kelimeden sonra virgül (,) konur.' },
        { type: 'text', text: 'oyuncaklarımı arkadaşımla paylaşırım' },
        { type: 'slot', slotId: 's12-2-b', correctMark: '.', ruleHint: 'Tamamlanmış cümlelerin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's12-3',
      segments: [
        { type: 'text', text: 'Yavaş ol' },
        { type: 'slot', slotId: 's12-3-a', correctMark: ',', ruleHint: 'Uyarı ifadesinden sonra virgül (,) konur.' },
        { type: 'text', text: 'merdivenden düşeceksin' },
        { type: 'slot', slotId: 's12-3-b', correctMark: '!', ruleHint: 'Uyarı ve telaş bildiren cümlelerin sonuna ünlem (!) konur.' },
      ],
    },
    {
      id: 's12-4',
      segments: [
        { type: 'text', text: 'Matematik testindeki 4' },
        { type: 'slot', slotId: 's12-4-a', correctMark: '.', ruleHint: 'Sıra bildiren sayının ("4." = dördüncü) sonuna nokta (.) konur.' },
        { type: 'text', text: 'soruyu kolayca çözdüm' },
        { type: 'slot', slotId: 's12-4-b', correctMark: '.', ruleHint: 'Cümlenin sonuna nokta (.) konur.' },
      ],
    },
    {
      id: 's12-5',
      segments: [
        { type: 'text', text: 'Sıranın üzerindeki mavi çanta kimin' },
        { type: 'slot', slotId: 's12-5-a', correctMark: '?', ruleHint: 'Soru bildiren cümlelerin sonuna soru işareti (?) konur.' },
      ],
    },
  ],
];

interface NoktalamaSurukleBirakGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string) => void;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (studentId: string | null) => void;
  onSelectStudentForPlayer?: (playerIndex: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean, playerIndex?: number) => void;
  onGameCompleted?: (winnerIndex: number, playerCount: number) => void;
}

export const NoktalamaSurukleBirakGame: React.FC<NoktalamaSurukleBirakGameProps> = ({
  playMp3,
  students = [],
  selectedStudentId = null,
  selectedStudentIds,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted,
}) => {
  const [setIndex, setSetIndex] = useState<number>(0);
  const [customMixSentences, setCustomMixSentences] = useState<PunctuationSentence[] | null>(null);
  const [placedMarks, setPlacedMarks] = useState<Record<string, PunctuationMark | null>>({});
  const [checkedResults, setCheckedResults] = useState<Record<string, 'correct' | 'wrong' | null>>({});
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [allCorrectBanner, setAllCorrectBanner] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [selectedDockMark, setSelectedDockMark] = useState<PunctuationMark | null>(null);
  const [score, setScore] = useState<number>(0);

  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | null)[]>([
    selectedStudentIds?.[0] || selectedStudentId || null,
    selectedStudentIds?.[1] || null,
    selectedStudentIds?.[2] || null,
  ]);

  useEffect(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      setInternalSelectedIds([
        selectedStudentIds[0] || null,
        selectedStudentIds[1] || null,
        selectedStudentIds[2] || null,
      ]);
    } else if (selectedStudentId !== undefined) {
      setInternalSelectedIds((prev) => [selectedStudentId, prev[1] || null, prev[2] || null]);
    }
  }, [selectedStudentIds, selectedStudentId]);

  const effectiveSelectedStudentIds = useMemo(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      return selectedStudentIds;
    }
    return internalSelectedIds;
  }, [selectedStudentIds, internalSelectedIds]);

  // Pointer-based drag state (smartboard touch & mouse friendly)
  const [draggingMark, setDraggingMark] = useState<PunctuationMark | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);

  const slotRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const currentSentences = customMixSentences || SENTENCE_SETS[setIndex % SENTENCE_SETS.length];

  const triggerSound = useCallback(
    (src: string) => {
      if (playMp3) {
        try {
          playMp3(src);
        } catch {
          // ignore audio playback errors
        }
      }
    },
    [playMp3]
  );

  const activeStudentId = effectiveSelectedStudentIds[0] || selectedStudentId;
  const activeStudent = activeStudentId
    ? students.find((s) => s.id === activeStudentId) || null
    : null;

  const handleSelectStudentForPlayer = useCallback(
    (pIdx: number, studentId: string | null) => {
      setInternalSelectedIds((prev) => {
        const updated = [...prev];
        updated[pIdx] = studentId;
        return updated;
      });
      if (onSelectStudentForPlayer) {
        onSelectStudentForPlayer(pIdx, studentId);
      } else if (pIdx === 0 && onSelectStudent) {
        onSelectStudent(studentId);
      }
      triggerSound('/op.mp3');
    },
    [onSelectStudentForPlayer, onSelectStudent, triggerSound]
  );

  // Hit-test pointer against all red-square slot elements (with generous +14px touch radius)
  const findSlotUnderPoint = useCallback((clientX: number, clientY: number): string | null => {
    const padding = 14;
    let bestMatch: string | null = null;
    let bestDist = Infinity;

    for (const [slotId, el] of Object.entries(slotRefs.current) as [string, HTMLButtonElement | null][]) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        clientX >= rect.left - padding &&
        clientX <= rect.right + padding &&
        clientY >= rect.top - padding &&
        clientY <= rect.bottom + padding
      ) {
        const cx = (rect.left + rect.right) / 2;
        const cy = (rect.top + rect.bottom) / 2;
        const dist = Math.hypot(clientX - cx, clientY - cy);
        if (dist < bestDist) {
          bestDist = dist;
          bestMatch = slotId;
        }
      }
    }
    return bestMatch;
  }, []);

  const placeMarkInSlot = useCallback(
    (slotId: string, mark: PunctuationMark) => {
      setPlacedMarks((prev) => ({ ...prev, [slotId]: mark }));
      // Clear previous error/check state on that slot so student can immediately verify again
      setCheckedResults((prev) => ({ ...prev, [slotId]: null }));
      setHasChecked(false);
      setAllCorrectBanner(false);
      setActiveHint(null);
      triggerSound('/ding.mp3');
    },
    [triggerSound]
  );

  // Global pointer listeners while dragging
  useEffect(() => {
    if (!draggingMark) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      setDragPos({ x: e.clientX, y: e.clientY });
      const hitSlot = findSlotUnderPoint(e.clientX, e.clientY);
      setDragOverSlotId(hitSlot);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const hitSlot = findSlotUnderPoint(e.clientX, e.clientY);
      if (hitSlot) {
        placeMarkInSlot(hitSlot, draggingMark);
        setSelectedDockMark(null);
      } else {
        // Check if it was a quick tap without dragging far -> keep selected for tap-to-place
        setSelectedDockMark((prev) => (prev === draggingMark ? null : draggingMark));
      }
      setDraggingMark(null);
      setDragOverSlotId(null);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggingMark, findSlotUnderPoint, placeMarkInSlot]);

  const handleStartDragFromDock = (e: React.PointerEvent<HTMLButtonElement>, mark: PunctuationMark) => {
    if (e.button === 2) return;
    e.preventDefault();
    setDraggingMark(mark);
    setDragPos({ x: e.clientX, y: e.clientY });
    setDragOverSlotId(findSlotUnderPoint(e.clientX, e.clientY));
    triggerSound('/op.mp3');
  };

  const handleSlotClick = (slotId: string) => {
    if (selectedDockMark) {
      placeMarkInSlot(slotId, selectedDockMark);
      setSelectedDockMark(null);
      return;
    }
    // If slot already has a mark, clicking it clears it back to a red square
    if (placedMarks[slotId]) {
      setPlacedMarks((prev) => ({ ...prev, [slotId]: null }));
      setCheckedResults((prev) => ({ ...prev, [slotId]: null }));
      setHasChecked(false);
      setAllCorrectBanner(false);
      setActiveHint(null);
      triggerSound('/op.mp3');
    }
  };

  const handleClearAll = () => {
    setPlacedMarks({});
    setCheckedResults({});
    setHasChecked(false);
    setAllCorrectBanner(false);
    setActiveHint(null);
    setSelectedDockMark(null);
    triggerSound('/op.mp3');
  };

  const handleSwitchSet = (targetSetIdx: number) => {
    setCustomMixSentences(null);
    setSetIndex(targetSetIdx);
    setPlacedMarks({});
    setCheckedResults({});
    setHasChecked(false);
    setAllCorrectBanner(false);
    setActiveHint(null);
    setSelectedDockMark(null);
    triggerSound('/op.mp3');
  };

  const handleRandomMixSet = () => {
    const allPool = SENTENCE_SETS.flat();
    const shuffled = [...allPool].sort(() => Math.random() - 0.5).slice(0, 5);
    setCustomMixSentences(shuffled);
    setPlacedMarks({});
    setCheckedResults({});
    setHasChecked(false);
    setAllCorrectBanner(false);
    setActiveHint(null);
    setSelectedDockMark(null);
    triggerSound('/op.mp3');
  };

  const handleCheckAnswers = () => {
    if (allCorrectBanner) return;
    const newResults: Record<string, 'correct' | 'wrong'> = {};
    let totalSlots = 0;
    let correctCount = 0;
    let firstErrorHint: string | null = null;
    let emptyCount = 0;

    for (const sentence of currentSentences) {
      for (const seg of sentence.segments) {
        if (seg.type === 'slot' && seg.slotId && seg.correctMark) {
          totalSlots++;
          const userVal = placedMarks[seg.slotId];
          if (!userVal) {
            emptyCount++;
            newResults[seg.slotId] = 'wrong';
            if (!firstErrorHint) {
              firstErrorHint = 'Boş kalan kırmızı karelere de uygun noktalama işaretini sürükleyip bırakalım.';
            }
          } else if (userVal === seg.correctMark) {
            correctCount++;
            newResults[seg.slotId] = 'correct';
          } else {
            newResults[seg.slotId] = 'wrong';
            if (!firstErrorHint && seg.ruleHint) {
              firstErrorHint = seg.ruleHint;
            }
          }
        }
      }
    }

    setCheckedResults(newResults);
    setHasChecked(true);

    if (correctCount === totalSlots && totalSlots > 0) {
      setAllCorrectBanner(true);
      setActiveHint(null);
      setScore((prev) => prev + 50);
      triggerSound('/para.mp3');
      onQuestionAnswered?.(true, 0);
      onGameCompleted?.(0, 1);
      confetti({
        particleCount: 95,
        spread: 75,
        origin: { y: 0.58 },
      });
    } else {
      setAllCorrectBanner(false);
      setActiveHint(firstErrorHint);
      triggerSound('/hata.mp3');
      if (emptyCount < totalSlots) {
        onQuestionAnswered?.(false, 0);
      }
    }
  };

  // Count how many slots exist in the current 5 sentences vs filled
  const allCurrentSlots = currentSentences.flatMap((s) =>
    s.segments.filter((seg) => seg.type === 'slot' && seg.slotId)
  );
  const filledCount = allCurrentSlots.filter((seg) => seg.slotId && placedMarks[seg.slotId]).length;

  const activeDragMeta = draggingMark
    ? PUNCTUATION_MARKS.find((m) => m.symbol === draggingMark) || null
    : null;

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white"
    >
      <ActivityBackground theme="doga" opacity={0.45} dimCenter={true} />

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2.5 flex flex-col gap-1.5 sm:gap-2 overflow-hidden min-h-0">
        {/* TOP STRIP: SET SWITCHER + INSTRUCTION + SCORE */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 sm:py-2 rounded-2xl bg-[#0c162d]/95 border border-slate-700/80 shadow-lg shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {activeStudent && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-amber-500/15 border border-amber-400/60 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${activeStudent.avatarBg || 'from-amber-400 to-orange-500'} border border-amber-300 text-slate-950 font-black text-xs flex items-center justify-center shrink-0`}
                  title={activeStudent.name}
                >
                  {activeStudent.avatar}
                </div>
                <span className="text-xs font-black text-amber-200 max-w-[110px] truncate">
                  {activeStudent.name}
                </span>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <h2 className="text-xs sm:text-sm md:text-base font-black tracking-wide text-amber-300 uppercase truncate">
                Noktalama İşaretleri (Sürükle Bırak)
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-300 truncate">
                Aşağıdaki noktalama işaretlerini sürükleyip cümlelerdeki{' '}
                <span className="inline-block w-3 h-3 align-middle rounded-[3px] bg-red-600 border border-red-300 mx-0.5" />{' '}
                kırmızı karelere bırakın.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Set Buttons (1..12) + Random Mix */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
              <span className="text-[10px] sm:text-xs font-black text-slate-400 px-1.5 uppercase">Set:</span>
              {SENTENCE_SETS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSwitchSet(idx)}
                  className={`min-w-[26px] px-1.5 sm:px-2 py-1 rounded-lg text-xs font-black tabular-nums transition-all cursor-pointer ${
                    !customMixSentences && setIndex === idx
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={handleRandomMixSet}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  customMixSentences
                    ? 'bg-cyan-400 text-slate-950 shadow'
                    : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                }`}
                title="60 cümle içinden rastgele 5 cümle getir"
              >
                Karışık
              </button>
            </div>

            <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-black text-emerald-300 tabular-nums">
              {score} Puan
            </div>
          </div>
        </div>

        {/* FEEDBACK / HINT BANNER */}
        {(allCorrectBanner || activeHint) && (
          <div
            className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-lg ${
              allCorrectBanner
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100'
                : 'bg-rose-950/90 border-rose-400 text-rose-100'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {allCorrectBanner ? (
                <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
              )}
              <span className="text-xs sm:text-sm md:text-base font-bold leading-snug">
                {allCorrectBanner
                  ? 'Tebrikler! 5 cümledeki tüm noktalama işaretlerini doğru yerleştirdin!'
                  : activeHint}
              </span>
            </div>

            {allCorrectBanner && (
              <button
                onClick={() => handleSwitchSet((setIndex + 1) % SENTENCE_SETS.length)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow cursor-pointer active:scale-95 transition-transform"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sonraki 5 Cümle</span>
              </button>
            )}
          </div>
        )}

        {/* CENTER: 5 SENTENCES STACKED VERTICALLY */}
        <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 sm:gap-2 overflow-y-auto pr-0.5">
          {currentSentences.map((sentence, sIdx) => {
            const sentenceSlots = sentence.segments.filter((seg) => seg.type === 'slot' && seg.slotId);
            const sentenceAllCorrect =
              hasChecked &&
              sentenceSlots.length > 0 &&
              sentenceSlots.every((seg) => seg.slotId && checkedResults[seg.slotId] === 'correct');

            return (
              <div
                key={sentence.id}
                className={`flex-1 min-h-[54px] flex items-center gap-2.5 sm:gap-3.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl border-2 transition-colors shadow-md ${
                  sentenceAllCorrect
                    ? 'bg-emerald-950/75 border-emerald-400/80'
                    : 'bg-[#0e1930]/92 border-slate-700/80'
                }`}
              >
                {/* Sentence Number */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-lg tabular-nums shrink-0 border ${
                    sentenceAllCorrect
                      ? 'bg-emerald-500 text-slate-950 border-emerald-200'
                      : 'bg-slate-800 text-amber-300 border-slate-600'
                  }`}
                >
                  {sIdx + 1}
                </div>

                {/* Sentence Text + Red Square Punctuation Slots (~10% larger typography) */}
                <div className="flex-1 flex flex-wrap items-center gap-x-2 sm:gap-x-2.5 gap-y-1 text-[18px] sm:text-[22px] md:text-[27px] font-bold text-slate-100 leading-snug">
                  {sentence.segments.map((seg, segIdx) => {
                    if (seg.type === 'text') {
                      return (
                        <span key={segIdx} className="whitespace-normal">
                          {seg.text}
                        </span>
                      );
                    }

                    const slotId = seg.slotId!;
                    const placed = placedMarks[slotId];
                    const status = checkedResults[slotId];
                    const isHoverTarget = dragOverSlotId === slotId;

                    let slotStyle =
                      'bg-red-600 border-red-300 text-white shadow-[0_0_12px_rgba(220,38,38,0.55)]';

                    if (isHoverTarget) {
                      slotStyle =
                        'bg-red-500 border-amber-300 text-white ring-4 ring-amber-300/80 scale-110 shadow-[0_0_20px_rgba(251,191,36,0.8)]';
                    } else if (status === 'correct') {
                      slotStyle =
                        'bg-emerald-500 border-emerald-200 text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.65)]';
                    } else if (status === 'wrong') {
                      slotStyle =
                        'bg-rose-700 border-amber-300 text-white ring-2 ring-rose-400 animate-pulse';
                    } else if (placed) {
                      slotStyle =
                        'bg-red-700 border-amber-300 text-amber-200 shadow-[0_0_12px_rgba(220,38,38,0.45)]';
                    }

                    return (
                      <button
                        key={slotId}
                        type="button"
                        ref={(el) => {
                          slotRefs.current[slotId] = el;
                        }}
                        onClick={() => handleSlotClick(slotId)}
                        title={
                          placed
                            ? 'Kaldırmak için dokun veya üzerine yeni işaret sürükle'
                            : 'Noktalama işaretini buraya sürükleyip bırak'
                        }
                        className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-[52px] md:h-[52px] rounded-xl border-2 font-black text-2xl sm:text-3xl md:text-[32px] leading-none transition-all cursor-pointer align-middle select-none ${slotStyle}`}
                      >
                        {placed ? (
                          <span className="drop-shadow-sm">{placed}</span>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-sm bg-red-300/45 pointer-events-none" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM DOCK: DRAGGABLE PUNCTUATION MARKS + ACTION BUTTONS */}
        <div className="shrink-0 rounded-2xl bg-[#0b1326]/95 border-2 border-slate-700/90 px-2.5 sm:px-4 py-2 sm:py-2.5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-2 sm:gap-3">
          {/* Draggable Marks Row */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full lg:w-auto">
            {PUNCTUATION_MARKS.map((mark) => {
              const isSelected = selectedDockMark === mark.symbol;
              const isBeingDragged = draggingMark === mark.symbol;
              return (
                <button
                  key={mark.symbol}
                  type="button"
                  onPointerDown={(e) => handleStartDragFromDock(e, mark.symbol)}
                  className={`touch-none group flex flex-col items-center justify-center min-w-[60px] xs:min-w-[68px] sm:min-w-[88px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-b ${mark.bgClass} border-2 ${mark.borderClass} ${mark.textClass} shadow-lg transition-all cursor-grab active:cursor-grabbing active:scale-95 ${
                    isSelected
                      ? 'ring-4 ring-white scale-105 shadow-[0_0_22px_rgba(255,255,255,0.65)]'
                      : 'hover:-translate-y-0.5 hover:brightness-110'
                  } ${isBeingDragged ? 'opacity-65 scale-95' : ''}`}
                >
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black leading-none drop-shadow">
                    {mark.symbol}
                  </span>
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-tight mt-0.5 opacity-95">
                    {mark.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Controls */}
          <div className="flex items-center justify-center gap-2 w-full lg:w-auto shrink-0">
            <div className="hidden sm:flex items-center px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 tabular-nums">
              {filledCount}/{allCurrentSlots.length} Yerleştirildi
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs sm:text-sm cursor-pointer active:scale-95 transition-all"
              title="Tüm kutuları temizle"
            >
              <Eraser className="w-4 h-4" />
              <span>Temizle</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchSet((setIndex + 1) % SENTENCE_SETS.length)}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-500/60 font-bold text-xs sm:text-sm cursor-pointer active:scale-95 transition-all"
              title="Farklı 5 cümle getir"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden xs:inline">Yeni Cümleler</span>
            </button>

            <button
              type="button"
              onClick={handleCheckAnswers}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border-2 border-emerald-200 font-black text-xs sm:text-base shadow-[0_0_18px_rgba(16,185,129,0.45)] cursor-pointer active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>KONTROL ET</span>
            </button>
          </div>
        </div>
      </main>

      {/* EN ALT: 2. SINIF ÖĞRENCİ LİSTESİ DOCK (SEÇİLEN ÖĞRENCİNİN İSTATİSTİKLERİNE İŞLER) */}
      <div className="relative z-20 shrink-0 pb-1 max-w-6xl w-full mx-auto">
        <StudentAvatarDock
          students={students}
          currentGrade={2}
          playerCount={1}
          selectedStudentIds={effectiveSelectedStudentIds}
          onSelectStudentForPlayer={handleSelectStudentForPlayer}
          onOpenRosterModal={onOpenRosterModal || (() => {})}
          playMp3={playMp3}
        />
      </div>

      {/* FLOATING DRAGGED PUNCTUATION MARK BADGE */}
      {draggingMark && activeDragMeta && (
        <div
          style={{
            left: dragPos.x,
            top: dragPos.y,
            transform: 'translate(-50%, -50%)',
          }}
          className={`fixed z-[500] pointer-events-none w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b ${activeDragMeta.bgClass} border-2 ${activeDragMeta.borderClass} ${activeDragMeta.textClass} flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.65)] scale-110`}
        >
          <span className="text-3xl sm:text-4xl font-black leading-none">{activeDragMeta.symbol}</span>
        </div>
      )}
    </div>
  );
};
