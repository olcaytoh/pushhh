import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, CheckCircle2, Trophy, ArrowRight, ArrowLeft, Home,
  BookOpen, Sparkles
} from 'lucide-react';
import { Student } from '../types/student';
import { StudentAvatarDock } from './StudentAvatarDock';
import { AutoFitOptionContent } from './AutoFitOptionContent';
import { ActivityQuestionFrame, QuestionBadge, QuestionSentence } from './ActivityQuestionFrame';

export interface SatirSonuQuestion {
  id: string;
  title: string;
  ruleCategory: 'tek_harf' | 'heceleme' | 'bilesik_kelime' | 'kesme_isareti';
  ruleCategoryLabel: string;
  word: string;
  question: string;
  line1: string; // Satır sonunda kalan kısım
  line2: string; // Alt satıra geçen kısım
  options: string[];
  correctAnswer: string;
  explanation: string;
  isCorrectSplit: boolean;
}

export const SATIR_SONU_QUESTIONS: SatirSonuQuestion[] = [
  // --- 1. TEK HARF KURALI (Satır sonunda veya başında tek harf ASLA bırakılamaz) ---
  {
    id: 'ssh-1',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'uçurtma',
    question: '"Uçurtma" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'uçurt-',
    line2: 'ma',
    options: ['uçurt- / ma', 'u- / çurtma', 'uç- / urtma', 'uçur- / tma'],
    correctAnswer: 'uçurt- / ma',
    explanation: 'Satır sonunda tek harf (u-) bırakılamaz ve heceler bölünemez (u-çurt-ma). Bu yüzden tek doğru ayrım "uçurt- / ma"dır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-2',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'araba',
    question: '"Araba" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'ara-',
    line2: 'ba',
    options: ['ara- / ba', 'a- / raba', 'ar- / aba', 'arab- / a'],
    correctAnswer: 'ara- / ba',
    explanation: 'Satır sonunda veya alt satır başında tek sesli harf bırakılamaz! Doğru heceleme a-ra-ba olduğu için doğru ayrım "ara- / ba"dır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-3',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'öğrenci',
    question: '"Öğrenci" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'öğret-',
    line2: 'ci',
    options: ['öğren- / ci', 'ö- / ğrenci', 'öğr- / enci', 'öğrenc- / i'],
    correctAnswer: 'öğren- / ci',
    explanation: 'Satır sonunda tek harf "ö-" kalamaz, alt satırda da tek harf "-i" kalamaz. Doğru heceden ayrım "öğren- / ci"dir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-4',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'elma',
    question: '"Elma" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'el-',
    line2: 'ma',
    options: ['el- / ma', 'e- / lma', 'elm- / a', 'el-m / a'],
    correctAnswer: 'el- / ma',
    explanation: '"e- / lma"da satır sonunda tek harf, "elm- / a"da alt satırda tek harf hatası vardır! Doğrusu "el- / ma"dır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-5',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'aile',
    question: '"Aile" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'ai-',
    line2: 'le',
    options: ['ai- / le', 'a- / ile', 'ail- / e', 'a-i / le'],
    correctAnswer: 'ai- / le',
    explanation: 'a-i-le sözcüğünde üstte tek "a-" kalamaz, altta tek "-e" kalamaz! Tek kurala uygun ayrım "ai- / le"dir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-6',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'ayakkabı',
    question: '"Ayakkabı" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'ayak-',
    line2: 'kabı',
    options: ['ayak- / kabı', 'a- / yakkabı', 'ay- / akkabı', 'ayakkab- / ı'],
    correctAnswer: 'ayak- / kabı',
    explanation: 'Başta "a-" veya sonda "-ı" tek harf olarak bölünemez. Doğru heceleme a-yak-ka-bı olduğundan "ayak- / kabı" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-7',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'oyuncak',
    question: '"Oyuncak" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'oyun-',
    line2: 'cak',
    options: ['oyun- / cak', 'o- / yuncak', 'oy- / uncak', 'oyunca- / k'],
    correctAnswer: 'oyun- / cak',
    explanation: 'Sözcük o-yun-cak şeklinde hecelenir. "o- / yuncak" tek harf hatasıdır, altta tek "-k" kalamaz. Doğrusu "oyun- / cak"tır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-8',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'eriklik',
    question: '"Eriklik" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'erik-',
    line2: 'lik',
    options: ['erik- / lik', 'e- / riklik', 'er- / iklik', 'erikl- / ik'],
    correctAnswer: 'erik- / lik',
    explanation: 'Satır sonuna tek başına "e-" bırakılamaz! Doğru heceleme e-rik-lik olduğundan "erik- / lik" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-9',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'odunluk',
    question: '"Odunluk" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'odun-',
    line2: 'luk',
    options: ['odun- / luk', 'o- / dunluk', 'od- / unluk', 'odunl- / uk'],
    correctAnswer: 'odun- / luk',
    explanation: 'Satır sonunda tek harf "o-" bırakılamaz. Doğru heceden ayrım "odun- / luk"tur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-10',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'iğnelik',
    question: '"İğnelik" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'iğne-',
    line2: 'lik',
    options: ['iğne- / lik', 'i- / ğnelik', 'iğn- / elik', 'iğnel- / ik'],
    correctAnswer: 'iğne- / lik',
    explanation: 'Tek sesli harf "i-" satır sonunda yalnız bırakılamaz. Doğru ayrım "iğne- / lik"tir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-11',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'ekmeklik',
    question: '"Ekmeklik" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'ekmek-',
    line2: 'lik',
    options: ['ekmek- / lik', 'e- / kmeklik', 'ekm- / eklik', 'ekmekl- / ik'],
    correctAnswer: 'ekmek- / lik',
    explanation: 'Heceleme ek-mek-lik şeklindedir. "e- / kmeklik"te tek harf kuralı ihlal edilmiştir; doğru ayrım "ekmek- / lik"tir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-12',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'okuldaş',
    question: '"Okuldaş" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'okul-',
    line2: 'daş',
    options: ['okul- / daş', 'o- / kuldaş', 'ok- / uldaş', 'okuld- / aş'],
    correctAnswer: 'okul- / daş',
    explanation: '"o-" tek harf kalamaz, "ok- / uldaş" heceyi bozar. Doğru ayrım "okul- / daş"tır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-13',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'üzümlük',
    question: '"Üzümlük" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'üzüm-',
    line2: 'lük',
    options: ['üzüm- / lük', 'ü- / zümlük', 'üz- / ümlük', 'üzüml- / ük'],
    correctAnswer: 'üzüm- / lük',
    explanation: 'Satır sonunda tek "ü-" harfi bırakılmaz. Doğru heceleme ü-züm-lük olduğundan doğru ayrım "üzüm- / lük"tür.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-14',
    title: 'Tek Harf Kuralı',
    ruleCategory: 'tek_harf',
    ruleCategoryLabel: 'TEK HARF KURALI',
    word: 'ıspanak',
    question: '"Ispanak" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'ıspa-',
    line2: 'nak',
    options: ['ıspa- / nak', 'ı- / spanak', 'ıs- / panak değil', 'ıspana- / k'],
    correctAnswer: 'ıspa- / nak',
    explanation: '"ı- / spanak" yanlıştır çünkü "ı" tek harf kalamaz ve "sp" ile Türkçe hece başlamaz! Doğrusu "ıspa- / nak"tır.',
    isCorrectSplit: true
  },

  // --- 2. BİLEŞİK KELİMELER KURALI (Ulama ile hecelenir: il-ko-kul, ba-şöğ-ret-men) ---
  {
    id: 'ssh-15',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'ilkokul',
    question: '"İlkokul" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'ilko-',
    line2: 'kul',
    options: ['ilko- / kul', 'ilk- / okul', 'i- / lkokul', 'ilkok- / ul'],
    correctAnswer: 'ilko- / kul',
    explanation: 'Bileşik sözcükler ulamayla il-ko-kul şeklinde hecelenir. Bu yüzden "ilko- / kul" doğrudur, "ilk- / okul" yanlıştır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-16',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'başöğretmen',
    question: '"Başöğretmen" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'başöğ-',
    line2: 'retmen',
    options: ['başöğ- / retmen', 'baş- / öğretmen', 'başö- / ğretmen', 'ba-ş / öğretmen'],
    correctAnswer: 'başöğ- / retmen',
    explanation: 'Bileşik sözcükler ba-şöğ-ret-men şeklinde hecelenir! "baş- / öğretmen" yanlıştır, doğru ayrım "başöğ- / retmen"dir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-17',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'hanımeli',
    question: '"Hanımeli" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'hanı-',
    line2: 'meli',
    options: ['hanı- / meli', 'hanım- / eli', 'h- / anımeli', 'hanımel- / i'],
    correctAnswer: 'hanı- / meli',
    explanation: 'Bileşik kelime ha-nı-me-li olarak hecelenir. Bu yüzden "hanı- / meli" doğrudur, "hanım- / eli" heceleme hatasıdır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-18',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'aslanağzı',
    question: '"Aslanağzı" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'asla-',
    line2: 'nağzı',
    options: ['asla- / nağzı', 'aslan- / ağzı', 'a- / slanağzı', 'aslana- / ğzı'],
    correctAnswer: 'asla- / nağzı',
    explanation: 'Bileşik kelimeler as-la-nağ-zı olarak hecelenir. Doğrusu "asla- / nağzı"dır, "aslan- / ağzı" kurala aykırıdır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-19',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'kırkayak',
    question: '"Kırkayak" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'kırka-',
    line2: 'yak',
    options: ['kırka- / yak', 'kırk- / ayak', 'k- / ırkayak', 'kırkay- / ak'],
    correctAnswer: 'kırka- / yak',
    explanation: 'Bileşik sözcükler kır-ka-yak şeklinde hecelenir! "kırk- / ayak" yanlıştır, doğru ayrım "kırka- / yak"tır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-20',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'denizaltı',
    question: '"Denizaltı" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'deni-',
    line2: 'zaltı',
    options: ['deni- / zaltı', 'deniz- / altı', 'd- / enizaltı', 'denizal- / tı değil'],
    correctAnswer: 'deni- / zaltı',
    explanation: 'Bileşik sözcükler ulamayla de-ni-zal-tı şeklinde hecelenir! Bu yüzden "deni- / zaltı" doğrudur, "deniz- / altı" yanlıştır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-21',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'yayınevi',
    question: '"Yayınevi" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'yayı-',
    line2: 'nevi',
    options: ['yayı- / nevi', 'yayın- / evi', 'ya-yın / evi', 'y- / ayınevi'],
    correctAnswer: 'yayı- / nevi',
    explanation: 'Bileşik sözcük ya-yı-ne-vi olarak hecelenir. Bu yüzden "yayı- / nevi" doğrudur, "yayın- / evi" yanlıştır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-22',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'semizotu',
    question: '"Semizotu" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'semi-',
    line2: 'zotu',
    options: ['semi- / zotu', 'semiz- / otu', 's- / emizotu', 'semizot- / u'],
    correctAnswer: 'semi- / zotu',
    explanation: 'Sözcük se-mi-zo-tu şeklinde ulamayla hecelenir. "semi- / zotu" doğrudur, "semiz- / otu" yanlıştır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-23',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'başeser',
    question: '"Başeser" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'başe-',
    line2: 'ser',
    options: ['başe- / ser', 'baş- / eser', 'ba- / şeser', 'başes- / er'],
    correctAnswer: 'başe- / ser',
    explanation: 'ba-şe-ser olarak hecelenir. "ba-" tek harf kuralı gibi durmamalıdır, "başe- / ser" doğrudur, "baş- / eser" heceleme hatasıdır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-24',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'kuşburnu',
    question: '"Kuşburnu" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'kuşbur-',
    line2: 'nu',
    options: ['kuşbur- / nu', 'ku- / şburnu', 'k- / uşburnu', 'kuşburn- / u'],
    correctAnswer: 'kuşbur- / nu',
    explanation: 'kuş-bur-nu şeklinde hecelenir. "kuşbur- / nu" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-25',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'karayolu',
    question: '"Karayolu" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'karayo-',
    line2: 'lu',
    options: ['karayo- / lu', 'kara- / y-olu', 'k- / arayolu', 'karayol- / u'],
    correctAnswer: 'karayo- / lu',
    explanation: 'ka-ra-yo-lu şeklinde hecelenir. "karayo- / lu" kurala tam uygundur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-26',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'gökyüzü',
    question: '"Gökyüzü" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'gök-',
    line2: 'yüzü',
    options: ['gök- / yüzü', 'gö- / kyüzü', 'g- / ökyüzü', 'gökyüz- / ü'],
    correctAnswer: 'gök- / yüzü',
    explanation: 'gök-yü-zü şeklinde hecelenir. "gö- / kyüzü" yanlıştır ("ky" ile hece başlamaz); "gök- / yüzü" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-27',
    title: 'Bileşik Sözcük Kuralı',
    ruleCategory: 'bilesik_kelime',
    ruleCategoryLabel: 'BİLEŞİK SÖZCÜKLER',
    word: 'sivrisinek',
    question: '"Sivrisinek" bileşik sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'sivri-',
    line2: 'sinek',
    options: ['sivri- / sinek', 'siv- / risinek', 's- / ivrisinek', 'sivrisine- / k'],
    correctAnswer: 'sivri- / sinek',
    explanation: 'siv-ri-si-nek şeklinde hecelenir. "sivri- / sinek" doğru heceden bölünmüştür.',
    isCorrectSplit: true
  },

  // --- 3. ÖZEL İSİMLER VE KESME İŞARETİ KURALI ---
  {
    id: 'ssh-28',
    title: 'Özel İsim & Kesme İşareti',
    ruleCategory: 'kesme_isareti',
    ruleCategoryLabel: 'KESME İŞARETİ KURALI',
    word: "Ankara'ya",
    question: '"Ankara\'ya" özel ismi satır sonuna sığmadığında hangisi DOĞRUDUR?',
    line1: "Ankara'",
    line2: 'ya',
    options: ["Ankara' / ya", "Ankara'- / ya", "An- / karaya", "A- / nkara'ya"],
    correctAnswer: "Ankara' / ya",
    explanation: "Özel isimlerde kesme işareti (') satır sonuna geldiğinde ayrıca kısa çizgi (-) konmaz! Doğrusu \"Ankara' / ya\"dır.",
    isCorrectSplit: true
  },
  {
    id: 'ssh-29',
    title: 'Özel İsim & Kesme İşareti',
    ruleCategory: 'kesme_isareti',
    ruleCategoryLabel: 'KESME İŞARETİ KURALI',
    word: "Atatürk'ün",
    question: '"Atatürk\'ün" özel ismi satır sonuna sığmadığında hangisi DOĞRUDUR?',
    line1: "Atatürk'",
    line2: 'ün',
    options: ["Atatürk' / ün", "Atatürk'- / ün", "Ata- / türkün", "A- / tatürk'ün"],
    correctAnswer: "Atatürk' / ün",
    explanation: "Kesme işareti satır sonuna geldiğinde sadece kesme işareti yeterlidir, kısa çizgi konulmaz: \"Atatürk' / ün\".",
    isCorrectSplit: true
  },
  {
    id: 'ssh-30',
    title: 'Özel İsim & Kesme İşareti',
    ruleCategory: 'kesme_isareti',
    ruleCategoryLabel: 'KESME İŞARETİ KURALI',
    word: "İstanbul'da",
    question: '"İstanbul\'da" özel ismi satır sonuna sığmadığında hangisi DOĞRUDUR?',
    line1: "İstanbul'",
    line2: 'da',
    options: ["İstanbul' / da", "İstanbul'- / da", "İstan- / bulda", "İ- / stanbul'da"],
    correctAnswer: "İstanbul' / da",
    explanation: "Özel isim satır sonuna geldiğinde kesme işareti varken kısa çizgi konmaz. Doğrusu \"İstanbul' / da\"dır.",
    isCorrectSplit: true
  },
  {
    id: 'ssh-31',
    title: 'Özel İsim & Kesme İşareti',
    ruleCategory: 'kesme_isareti',
    ruleCategoryLabel: 'KESME İŞARETİ KURALI',
    word: "Türkiye'nin",
    question: '"Türkiye\'nin" özel ismi satır sonuna sığmadığında hangisi DOĞRUDUR?',
    line1: "Türkiye'",
    line2: 'nin',
    options: ["Türkiye' / nin", "Türkiye'- / nin", "Türki- / yenin", "T- / ürkiye'nin"],
    correctAnswer: "Türkiye' / nin",
    explanation: "Kesme işaretinden sonra ayrıca kısa çizgi eklenmez: \"Türkiye' / nin\".",
    isCorrectSplit: true
  },
  {
    id: 'ssh-32',
    title: 'Özel İsim & Kesme İşareti',
    ruleCategory: 'kesme_isareti',
    ruleCategoryLabel: 'KESME İŞARETİ KURALI',
    word: "Ahmet'in",
    question: '"Ahmet\'in" özel ismi satır sonuna sığmadığında hangisi DOĞRUDUR?',
    line1: "Ahmet'",
    line2: 'in',
    options: ["Ahmet' / in", "Ahmet'- / in", "Ah- / metin", "A- / hmet'in"],
    correctAnswer: "Ahmet' / in",
    explanation: "Özel ismin ekini ayırmak için kesme işareti yeterlidir; kısa çizgi çekilmez: \"Ahmet' / in\".",
    isCorrectSplit: true
  },
  {
    id: 'ssh-33',
    title: 'Özel İsim & Kesme İşareti',
    ruleCategory: 'kesme_isareti',
    ruleCategoryLabel: 'KESME İŞARETİ KURALI',
    word: "Bursa'ya",
    question: '"Bursa\'ya" özel ismi satır sonuna sığmadığında hangisi DOĞRUDUR?',
    line1: "Bursa'",
    line2: 'ya',
    options: ["Bursa' / ya", "Bursa'- / ya", "Bur- / saya", "B- / ursa'ya"],
    correctAnswer: "Bursa' / ya",
    explanation: "Satır sonunda hem kesme hem kısa çizgi yan yana bulunamaz; doğrusu \"Bursa' / ya\"dır.",
    isCorrectSplit: true
  },
  {
    id: 'ssh-34',
    title: 'Özel İsim & Kesme İşareti',
    ruleCategory: 'kesme_isareti',
    ruleCategoryLabel: 'KESME İŞARETİ KURALI',
    word: "Samsun'dan",
    question: '"Samsun\'dan" özel ismi satır sonuna sığmadığında hangisi DOĞRUDUR?',
    line1: "Samsun'",
    line2: 'dan',
    options: ["Samsun' / dan", "Samsun'- / dan", "Sam- / sundan", "S- / amsun'dan"],
    correctAnswer: "Samsun' / dan",
    explanation: "Özel isim satır sonuna geldiğinde kesme işareti tek başına yeterlidir, kısa çizgi konmaz.",
    isCorrectSplit: true
  },
  {
    id: 'ssh-35',
    title: 'Özel İsim & Kesme İşareti',
    ruleCategory: 'kesme_isareti',
    ruleCategoryLabel: 'KESME İŞARETİ KURALI',
    word: "Trabzon'da",
    question: '"Trabzon\'da" özel ismi satır sonuna sığmadığında hangisi DOĞRUDUR?',
    line1: "Trabzon'",
    line2: 'da',
    options: ["Trabzon' / da", "Trabzon'- / da", "Trab- / zonda", "T- / rabzon'da"],
    correctAnswer: "Trabzon' / da",
    explanation: "Sadece kesme işareti konur: \"Trabzon' / da\". Kısa çizgi eklenmesi yazım hatasıdır.",
    isCorrectSplit: true
  },

  // --- 4. HECE BÖLÜNMEZ VE ÜNSÜZ KURALI (Konsonant kuralı, iki ünlü arasındaki ünsüz) ---
  {
    id: 'ssh-36',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'karınca',
    question: '"Karınca" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'karın-',
    line2: 'ca',
    options: ['karın- / ca', 'kar- / ınca', 'karınc- / a', 'k- / arınca'],
    correctAnswer: 'karın- / ca',
    explanation: 'ka-rın-ca şeklinde hecelenir. "kar- / ınca" heceyi böler, "karınc- / a" ve "k- / arınca" tek harf hatasıdır. Tek doğru ayrım "karın- / ca"dır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-37',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'astronot',
    question: '"Astronot" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'astro-',
    line2: 'not',
    options: ['astro- / not', 'a- / stronot', 'astron- / ot', 'as-t / ronot'],
    correctAnswer: 'astro- / not',
    explanation: 'Sözcük as-tro-not şeklinde hecelenir. "a- / stronot"ta tek harf hatası vardır, doğru ayrım "astro- / not"tur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-38',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'papatyalar',
    question: '"Papatyalar" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'papat-',
    line2: 'yalar',
    options: ['papat- / yalar', 'pa-p / atyalar', 'p- / apatyalar', 'papatyal- / ar'],
    correctAnswer: 'papat- / yalar',
    explanation: 'pa-pat-ya-lar şeklinde hecelenir. "papat- / yalar" doğru hece sınırından ayrılmıştır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-39',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'bisküvi',
    question: '"Bisküvi" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'bis-',
    line2: 'küvi',
    options: ['bis- / küvi', 'bi- / sküvi', 'b- / isküvi', 'bisküv- / i'],
    correctAnswer: 'bis- / küvi',
    explanation: 'Türkçede hece "sk" ile başlayamaz! Bu yüzden "bi- / sküvi" yanlıştır; doğru ayrım "bis- / küvi"dir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-40',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'sandalye',
    question: '"Sandalye" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'san-',
    line2: 'dalye',
    options: ['san- / dalye', 'sa- / ndalye', 'sand- / alye', 's- / andalye'],
    correctAnswer: 'san- / dalye',
    explanation: 'san-dal-ye şeklinde hecelenir. "sa- / ndalye" yanlıştır ("nd" ile hece başlamaz); "san- / dalye" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-41',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'bilgisayar',
    question: '"Bilgisayar" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'bilgi-',
    line2: 'sayar',
    options: ['bilgi- / sayar', 'bi- / lgisayar', 'bilgis- / ayar', 'bil- / g-isayar'],
    correctAnswer: 'bilgi- / sayar',
    explanation: 'bil-gi-sa-yar şeklinde hecelenir. Hece ortadan bölünemez, "bilgi- / sayar" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-42',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'pencere',
    question: '"Pencere" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'pen-',
    line2: 'cere',
    options: ['pen- / cere', 'p- / encere', 'penc- / ere', 'pencer- / e'],
    correctAnswer: 'pen- / cere',
    explanation: 'pen-ce-re şeklinde hecelenir. "pen- / cere" doğru hecedir, tek harfler ayrılamaz.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-43',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'türkçe',
    question: '"Türkçe" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'türk-',
    line2: 'çe',
    options: ['türk- / çe', 'tür- / kçe', 't- / ürkçe', 'türkç- / e'],
    correctAnswer: 'türk- / çe',
    explanation: 'türk-çe olarak hecelenir. "tür- / kçe" yanlıştır ("kç" ile hece başlamaz); doğrusu "türk- / çe"dir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-44',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'kitaplık',
    question: '"Kitaplık" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'kitap-',
    line2: 'lık',
    options: ['kitap- / lık', 'kit- / aplık', 'k- / itaplık', 'kitapl- / ık'],
    correctAnswer: 'kitap- / lık',
    explanation: 'ki-tap-lık şeklinde hecelenir. "kitap- / lık" doğru hece sınırıdır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-45',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'cumhuriyet',
    question: '"Cumhuriyet" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'cumhu-',
    line2: 'riyet',
    options: ['cumhu- / riyet', 'c- / umhuriyet', 'cumhur- / iyet', 'cumhuriye- / t'],
    correctAnswer: 'cumhu- / riyet',
    explanation: 'cum-hu-ri-yet şeklinde hecelenir. Doğru ayrım "cumhu- / riyet"tir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-46',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'televizyon',
    question: '"Televizyon" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'tele-',
    line2: 'vizyon',
    options: ['tele- / vizyon', 'te-l / evizyon', 'telev- / izyon', 'televizyo- / n'],
    correctAnswer: 'tele- / vizyon',
    explanation: 'te-le-viz-yon şeklinde hecelenir. "tele- / vizyon" tam hece sınırıdır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-47',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'helikopter',
    question: '"Helikopter" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'heli-',
    line2: 'kopter',
    options: ['heli- / kopter', 'helik- / opter', 'he-li-k / opter', 'h- / elikopter'],
    correctAnswer: 'heli- / kopter',
    explanation: 'he-li-kop-ter şeklinde hecelenir. Doğru ayrım "heli- / kopter"dir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-48',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'çiçeklik',
    question: '"Çiçeklik" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'çiçek-',
    line2: 'lik',
    options: ['çiçek- / lik', 'çiç- / eklik', 'ç- / içeklik', 'çiçekl- / ik'],
    correctAnswer: 'çiçek- / lik',
    explanation: 'çi-çek-lik şeklinde hecelenir. Doğru ayrım "çiçek- / lik"tir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-49',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'kelebek',
    question: '"Kelebek" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'kele-',
    line2: 'bek',
    options: ['kele- / bek', 'kel- / ebek', 'k- / elebek', 'kelebe- / k'],
    correctAnswer: 'kele- / bek',
    explanation: 'ke-le-bek şeklinde hecelenir. "kel- / ebek" hece hatasıdır, "kele- / bek" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-50',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'kütüphane',
    question: '"Kütüphane" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'kütüp-',
    line2: 'hane',
    options: ['kütüp- / hane', 'k- / ütüphane', 'küt- / üphane', 'kütüphan- / e'],
    correctAnswer: 'kütüp- / hane',
    explanation: 'kü-tüp-ha-ne şeklinde hecelenir. Doğrusu "kütüp- / hane"dir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-51',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'öğretmenler',
    question: '"Öğretmenler" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'öğret-',
    line2: 'menler',
    options: ['öğret- / menler', 'ö- / ğretmenler', 'öğr- / etmenler', 'öğretmenl- / er'],
    correctAnswer: 'öğret- / menler',
    explanation: 'öğ-ret-men-ler şeklinde hecelenir. "ö- / ğretmenler" tek harf hatasıdır, "öğret- / menler" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-52',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'merdiven',
    question: '"Merdiven" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'merdi-',
    line2: 'ven',
    options: ['merdi- / ven', 'merd- / iven', 'm- / erdiven', 'merdive- / n'],
    correctAnswer: 'merdi- / ven',
    explanation: 'mer-di-ven şeklinde hecelenir. Doğrusu "merdi- / ven"dir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-53',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'şemsiyelik',
    question: '"Şemsiyelik" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'şemsi-',
    line2: 'yelik',
    options: ['şemsi- / yelik', 'şems- / iyelik', 'ş- / emsiyelik', 'şemsiyel- / ik'],
    correctAnswer: 'şemsi- / yelik',
    explanation: 'şem-si-ye-lik şeklinde hecelenir. "şemsi- / yelik" doğru heceden bölünmüştür.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-54',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'karpuzcu',
    question: '"Karpuzcu" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'karpuz-',
    line2: 'cu',
    options: ['karpuz- / cu', 'kar-p / uzcu', 'k- / arpuzcu', 'karpuzc- / u'],
    correctAnswer: 'karpuz- / cu',
    explanation: 'kar-puz-cu şeklinde hecelenir. Doğru ayrım "karpuz- / cu"dur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-55',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'portakallar',
    question: '"Portakallar" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'porta-',
    line2: 'kallar',
    options: ['porta- / kallar', 'por-t / akallar', 'p- / ortakallar', 'portakall- / ar'],
    correctAnswer: 'porta- / kallar',
    explanation: 'por-ta-kal-lar şeklinde hecelenir. Doğru ayrım "porta- / kallar"dır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-56',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'akvaryum',
    question: '"Akvaryum" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'akvar-',
    line2: 'yum',
    options: ['akvar- / yum', 'a- / kvaryum', 'ak-v / aryum', 'akvary- / um'],
    correctAnswer: 'akvar- / yum',
    explanation: 'ak-var-yum şeklinde hecelenir. "a- / kvaryum" tek harf hatasıdır, doğrusu "akvar- / yum"dur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-57',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'teleskop',
    question: '"Teleskop" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'te-les-',
    line2: 'kop',
    options: ['teles- / kop', 'tele- / skop', 't- / eleskop', 'telesko- / p'],
    correctAnswer: 'teles- / kop',
    explanation: 'te-les-kop şeklinde hecelenir. "tele- / skop" yanlıştır ("sk" ile Türkçe hece başlamaz); "teles- / kop" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-58',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'elektrik',
    question: '"Elektrik" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'elek-',
    line2: 'trik',
    options: ['elek- / trik', 'e- / lektrik', 'elekt- / rik', 'elektri- / k'],
    correctAnswer: 'elek- / trik',
    explanation: 'e-lek-trik şeklinde hecelenir. "e- / lektrik" tek harf hatasıdır, doğru ayrım "elek- / trik"tir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-59',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'program',
    question: '"Program" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'prog-',
    line2: 'ram',
    options: ['prog- / ram', 'pro-g / ram', 'p- / rogram', 'progra- / m'],
    correctAnswer: 'prog- / ram',
    explanation: 'prog-ram şeklinde hecelenir. Doğrusu "prog- / ram"dır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-60',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'orkestra',
    question: '"Orkestra" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'orkes-',
    line2: 'tra',
    options: ['orkes- / tra', 'or- / kestra değil', 'o- / rkestra', 'orkest- / ra'],
    correctAnswer: 'orkes- / tra',
    explanation: 'or-kes-tra şeklinde hecelenir. "o-" tek harf kalamaz, doğru ayrım "orkes- / tra"dır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-61',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'laboratuvar',
    question: '"Laboratuvar" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'labora-',
    line2: 'tuvar',
    options: ['labora- / tuvar', 'lab- / oratuvar', 'l- / aboratuvar', 'laboratuv- / ar'],
    correctAnswer: 'labora- / tuvar',
    explanation: 'la-bo-ra-tu-var şeklinde hecelenir. "labora- / tuvar" tam hece sınırıdır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-62',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'mikroskop',
    question: '"Mikroskop" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'mikros-',
    line2: 'kop',
    options: ['mikros- / kop', 'mikro- / skop', 'm- / ikroskop', 'mikrosko- / p'],
    correctAnswer: 'mikros- / kop',
    explanation: 'mik-ros-kop şeklinde hecelenir. "mikro- / skop" yanlıştır ("sk" ile hece başlamaz); "mikros- / kop" doğrudur.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-63',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'akrobatik',
    question: '"Akrobatik" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'akro-',
    line2: 'batik',
    options: ['akro- / batik', 'a- / krobatik', 'ak- / robatik değil', 'akrobat- / ik'],
    correctAnswer: 'akro- / batik',
    explanation: 'ak-ro-ba-tik şeklinde hecelenir. "a- / krobatik" tek harf hatasıdır; doğru ayrım "akro- / batik"tir.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-64',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'fotoğrafçı',
    question: '"Fotoğrafçı" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'fotoğ-',
    line2: 'rafçı',
    options: ['fotoğ- / rafçı', 'fot- / oğrafçı', 'f- / otoğrafçı', 'fotoğrafç- / ı'],
    correctAnswer: 'fotoğ- / rafçı',
    explanation: 'fo-toğ-raf-çı şeklinde hecelenir. Doğru ayrım "fotoğ- / rafçı"dır.',
    isCorrectSplit: true
  },
  {
    id: 'ssh-65',
    title: 'Heceleme Kuralı',
    ruleCategory: 'heceleme',
    ruleCategoryLabel: 'HECE BÖLÜNMEZ',
    word: 'veteriner',
    question: '"Veteriner" sözcüğü satır sonunda nasıl DOĞRU bölünür?',
    line1: 'veteri-',
    line2: 'ner',
    options: ['veteri- / ner', 'vet- / eriner', 'v- / eteriner', 'veterin- / er'],
    correctAnswer: 'veteri- / ner',
    explanation: 've-te-ri-ner şeklinde hecelenir. Doğru heceden ayrım "veteri- / ner"dir.',
    isCorrectSplit: true
  }
];

function getRandomSatirSonuQuestions(count = 10): SatirSonuQuestion[] {
  const shuffled = [...SATIR_SONU_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}


/** Soru kutusu içeriği: rozet + defter satırı örneği + soru cümlesi (tüm modlarda aynı, kutuya göre ölçeklenir) */
const SatirSonuQuestionContent: React.FC<{ q: SatirSonuQuestion }> = ({ q }) => (
  <>
    <QuestionBadge>{q.ruleCategoryLabel}</QuestionBadge>
    <div className="w-full max-w-[26em] bg-[#fbf9f2] text-slate-900 border-2 border-amber-300 rounded-xl px-[0.5em] py-[0.25em] my-[0.2em] shadow-md text-left">
      <div className="text-[0.38em] font-black text-slate-500 uppercase tracking-wider text-center">
        ✏️ Defter satırı ({q.word})
      </div>
      <div className="flex items-center justify-between border-b-2 border-sky-300 py-[0.1em] px-[0.2em] font-mono font-black text-[0.85em] leading-tight">
        <span className="text-slate-400">...</span>
        <span className="bg-amber-100 px-[0.3em] rounded-lg border-2 border-amber-400">{q.line1}</span>
      </div>
      <div className="flex items-center justify-start border-b-2 border-sky-300 py-[0.1em] px-[0.2em] font-mono font-black text-[0.85em] leading-tight">
        <span className="bg-sky-100 px-[0.3em] rounded-lg border-2 border-sky-400">{q.line2}</span>
      </div>
    </div>
    <QuestionSentence className="text-[0.62em]">{q.question}</QuestionSentence>
  </>
);

export type PlayerMode = 1 | 2 | 3;

interface PlayerState {
  id: number;
  name: string;
  colorName: 'rose' | 'blue' | 'emerald';
  score: number;
  questionIndex: number;
  selectedOption: string | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

export interface SatirSonuHeceGameProps {
  onClose: () => void;
  onGoHome?: () => void;
  onPrevActivity?: () => void;
  onNextActivity?: () => void;
  playMp3?: (src: string) => void;
  playerCountMode?: 1 | 2 | 3;
  onSwitchPlayerCountMode?: (mode: 1 | 2 | 3) => void;
  students?: Student[];
  selectedStudentId?: string | null;
  selectedStudentIds?: (string | null)[];
  onSelectStudent?: (studentId: string | null) => void;
  onSelectStudentForPlayer?: (pIdx: number, studentId: string | null) => void;
  onOpenRosterModal?: (grade?: number) => void;
  onQuestionAnswered?: (isCorrect: boolean) => void;
  onGameCompleted?: (winnerIndex: number | null, pCount: number) => void;
}

export const SatirSonuHeceGame: React.FC<SatirSonuHeceGameProps> = ({
  onClose,
  onGoHome,
  onPrevActivity,
  onNextActivity,
  playMp3,
  playerCountMode = 1,
  onSwitchPlayerCountMode,
  students,
  selectedStudentId,
  selectedStudentIds,
  onSelectStudent,
  onSelectStudentForPlayer,
  onOpenRosterModal,
  onQuestionAnswered,
  onGameCompleted
}) => {
  const [playerMode, setPlayerMode] = useState<PlayerMode>(playerCountMode || 1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [questions, setQuestions] = useState<SatirSonuQuestion[]>(() => getRandomSatirSonuQuestions(8));

  // 100 Saniye Geri Sayım Sayacı (1, 2 VE 3 KİŞİLİK OYUNLARIN HEPSİNDE KESİNTİSİZ GERİ SAYAR)
  const [timeLeft, setTimeLeft] = useState<number>(100);

  useEffect(() => {
    if (playerCountMode) {
      setPlayerMode(playerCountMode);
    }
  }, [playerCountMode]);

  const triggerSound = useCallback((src: string) => {
    if (soundEnabled && playMp3) {
      try {
        playMp3(src);
      } catch (err) {
        console.error(err);
      }
    }
  }, [soundEnabled, playMp3]);

  // Student selection state
  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | null)[]>([
    selectedStudentIds?.[0] || selectedStudentId || null,
    selectedStudentIds?.[1] || null,
    selectedStudentIds?.[2] || null
  ]);

  useEffect(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      setInternalSelectedIds([
        selectedStudentIds[0] || null,
        selectedStudentIds[1] || null,
        selectedStudentIds[2] || null
      ]);
    } else if (selectedStudentId !== undefined) {
      setInternalSelectedIds(prev => [selectedStudentId, prev[1] || null, prev[2] || null]);
    }
  }, [selectedStudentIds, selectedStudentId]);

  const effectiveSelectedStudentIds = useMemo(() => {
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      return selectedStudentIds;
    }
    return internalSelectedIds;
  }, [selectedStudentIds, internalSelectedIds]);

  const handleSelectStudentForPlayer = (pIdx: number, studentId: string | null) => {
    setInternalSelectedIds(prev => {
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
  };

  const createInitialPlayers = useCallback((count: number): PlayerState[] => {
    const list: PlayerState[] = [];
    const colors: ('rose' | 'blue' | 'emerald')[] = ['rose', 'blue', 'emerald'];
    const names = ['1. Öğrenci', '2. Öğrenci', '3. Öğrenci'];

    for (let i = 0; i < count; i++) {
      list.push({
        id: i + 1,
        name: count === 1 ? 'Türkçe Ustası' : names[i],
        colorName: colors[i],
        score: 0,
        questionIndex: 0,
        selectedOption: null,
        isCorrect: null,
        showFeedback: false
      });
    }
    return list;
  }, []);

  const [players, setPlayers] = useState<PlayerState[]>(() => createInitialPlayers(playerMode));

  useEffect(() => {
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    setTimeLeft(100);
  }, [playerMode, createInitialPlayers]);

  // 100 Saniye Geri Sayım Zamanlayıcısı: 1, 2 VE 3 KİŞİLİK TÜM MODLARDA AKTİFTİR!
  useEffect(() => {
    if (gameOver) return;

    if (timeLeft <= 0) {
      triggerSound('/hata.mp3');
      setGameOver(true);
      // Kazananı en yüksek puana göre belirle
      let bestIdx = 0;
      let maxScore = -1;
      players.forEach((p, idx) => {
        if (p.score > maxScore) {
          maxScore = p.score;
          bestIdx = idx;
        }
      });
      setRoundWinner(bestIdx);
      triggerSound('/para.mp3');
      return;
    }

    if (timeLeft <= 3 && timeLeft >= 1 && playMp3) {
      playMp3('/tek.mp3');
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, timeLeft, players, playMp3, triggerSound]);

  const handleSwitchMode = (mode: PlayerMode) => {
    setPlayerMode(mode);
    if (onSwitchPlayerCountMode) {
      onSwitchPlayerCountMode(mode);
    }
    triggerSound('/op.mp3');
  };

  const handleResetGame = () => {
    triggerSound('/op.mp3');
    setQuestions(getRandomSatirSonuQuestions(8));
    setPlayers(createInitialPlayers(playerMode));
    setGameOver(false);
    setRoundWinner(null);
    setTimeLeft(100);
  };

  const handleOptionClick = (playerIndex: number, optionText: string) => {
    const player = players[playerIndex];
    if (!player || player.showFeedback || gameOver) return;

    const currentQ = questions[player.questionIndex % questions.length];
    const isRight = optionText === currentQ.correctAnswer;

    if (isRight) {
      triggerSound('/coin.mp3');
      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch {}
    } else {
      triggerSound('/hata.mp3');
    }

    if (onQuestionAnswered) {
      onQuestionAnswered(isRight);
    }

    setPlayers(prev =>
      prev.map((p, idx) => {
        if (idx !== playerIndex) return p;
        return {
          ...p,
          selectedOption: optionText,
          isCorrect: isRight,
          score: isRight ? p.score + 10 : p.score,
          showFeedback: true
        };
      })
    );

    // 1.3 saniye sonra sonraki soruya geç
    setTimeout(() => {
      setPlayers(prev => {
        const nextList = prev.map((p, idx) => {
          if (idx !== playerIndex) return p;
          const nextQIdx = p.questionIndex + 1;
          return {
            ...p,
            questionIndex: nextQIdx,
            selectedOption: null,
            isCorrect: null,
            showFeedback: false
          };
        });

        // Tüm oyuncular 5 soru tamamladı mı kontrolü
        const allCompleted = nextList.every(p => p.questionIndex >= 5);
        if (allCompleted) {
          setGameOver(true);
          let bestIdx = 0;
          let maxScore = -1;
          nextList.forEach((p, i) => {
            if (p.score > maxScore) {
              maxScore = p.score;
              bestIdx = i;
            }
          });
          setRoundWinner(bestIdx);
          triggerSound('/para.mp3');
          if (onGameCompleted) {
            onGameCompleted(bestIdx, playerMode);
          }
          try {
            confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
          } catch {}
        }

        return nextList;
      });
    }, 1300);
  };

  const winnerPlayer = useMemo(() => {
    if (roundWinner === null) return null;
    return players[roundWinner] || players[0];
  }, [roundWinner, players]);

  return (
    <div 
      style={{ top: 'var(--app-header-height, 74px)' }}
      className="fixed inset-x-0 bottom-0 top-[52px] sm:top-[60px] z-[200] flex flex-col font-sans select-none overflow-hidden bg-slate-950 text-white"
    >
      {/* 1. STANDART ESKİ ARKA PLAN GÖRSELİ (/dere3.webp) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/dere3.webp" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center pointer-events-none select-none filter brightness-95" 
        />
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      </div>

      {/* Main Game Arena */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-1.5 sm:p-2 flex flex-col justify-between overflow-hidden min-h-0">
        {playerMode === 1 && players[0] ? (() => {
          const sPlayer = players[0];
          const currentQ = questions[sPlayer.questionIndex % questions.length];
          const sStudent = effectiveSelectedStudentIds[0]
            ? students?.find(s => s.id === effectiveSelectedStudentIds[0])
            : null;

          return (
            <div className="flex-1 flex flex-col items-center justify-between w-full h-full max-h-full overflow-hidden min-h-0 py-0.5 sm:py-1 px-1 sm:px-2 md:px-4 max-w-[1850px] mx-auto">
              <div className="flex-1 w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl flex flex-col justify-center min-h-0 z-10 shrink">
                <div className="flex-1 flex flex-col p-2.5 sm:p-4 bg-[#0b1328] border-2 border-cyan-500/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_16px_rgba(6,182,212,0.15)] rounded-2xl sm:rounded-3xl w-full justify-between overflow-hidden min-h-0 relative h-full">

                  {/* TOP BAR: STANDARDIZED UNIFORM CAPSULES */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 shrink-0 w-full h-8 sm:h-9">
                    <div className="flex items-center gap-1.5 min-w-0 h-full">
                      {sStudent ? (
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${sStudent.avatarBg || 'from-amber-500 to-yellow-600'} border-2 border-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0`}
                          title={`Aktif Öğrenci: ${sStudent.name}`}
                        >
                          {sStudent.avatar}
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#080e1d] border-2 border-cyan-400 text-cyan-300 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0">
                          1
                        </div>
                      )}
                      <div className="h-full bg-gradient-to-r from-[#121c2e] via-[#1b2b48] to-[#121c2e] border-2 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.3)] border-l-4 border-l-cyan-400 rounded-xl px-2.5 sm:px-3 flex items-center justify-between gap-1.5 min-w-0">
                        <div className="flex items-center min-w-0">
                          <span className="font-black text-xs text-cyan-200 uppercase tracking-wide truncate">
                            {sStudent ? sStudent.name : '1. GRUP'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 ml-1.5 truncate max-w-[110px] sm:max-w-[150px]">
                            • Satır Sonu Hece Ayırma
                          </span>
                        </div>
                        <img src="/MENUIKON/grid_icon_35.webp" alt="Etkinlik" className="h-5 w-5 sm:h-6 sm:w-6 object-contain shrink-0 filter drop-shadow-sm ml-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 h-full">
                      {/* 100-Saniye Geri Sayım Sayacı */}
                      <div className={`h-full border rounded-xl px-2 py-0.5 flex items-center gap-1 font-mono font-black text-xs shrink-0 transition-all ${
                        timeLeft <= 5 
                          ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse' 
                          : 'bg-[#080e1d] border-slate-700 text-slate-200'
                      }`}>
                        <span className="text-xs">⏱️</span>
                        <span>{timeLeft}s</span>
                      </div>

                      <div className="h-full bg-[#0e172a] border border-slate-700/80 rounded-xl px-2 sm:px-2.5 flex items-center gap-1.5 shadow-xs">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                          {sPlayer.questionIndex + 1}/5
                        </span>
                        <span className="bg-[#080e1d] border border-slate-700 text-slate-100 font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-wider">
                          {sPlayer.score} P
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CENTER: SORU ÇERÇEVESİ (İleri Üçer Sayma ile aynı tasarım) */}
                  <div className="flex-1 flex items-stretch justify-center my-1 sm:my-1.5 min-h-0 w-full overflow-hidden">
                    <ActivityQuestionFrame mode={1} contentKey={sPlayer.questionIndex}>
                      <SatirSonuQuestionContent q={currentQ} />
                    </ActivityQuestionFrame>
                  </div>

                  {/* BOTTOM: ŞIKLAR (2x2 GRID) */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 w-full shrink-0 mt-1">
                    {currentQ.options.map((opt, oIdx) => {
                      const isChosen = sPlayer.selectedOption === opt;
                      const isRight = opt === currentQ.correctAnswer;
                      let btnStyle = "border-2 border-cyan-500/35 bg-gradient-to-b from-[#102334] via-[#0c1c2b] to-[#07131e] hover:from-[#142e44] hover:via-[#0f2437] hover:to-[#0a1b28] hover:border-cyan-400/70 text-cyan-50 shadow-md";

                      if (sPlayer.showFeedback) {
                        if (isRight) {
                          btnStyle = 'ring-4 ring-inset ring-emerald-500/80 border-emerald-400/80 bg-emerald-800 text-white shadow-md scale-102';
                        } else if (isChosen && !isRight) {
                          btnStyle = 'ring-4 ring-inset ring-rose-600/80 border-rose-400/80 bg-rose-900 text-white shadow-md';
                        } else {
                          btnStyle = 'opacity-30 border-slate-700 bg-slate-800/60 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={sPlayer.showFeedback}
                          onClick={() => handleOptionClick(0, opt)}
                          className={`fast-quiz-btn relative flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 min-h-[42px] sm:min-h-[48px] md:min-h-[54px] max-h-[58px] rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer active:scale-98 shadow-md ${btnStyle}`}
                        >
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-cyan-300/10 to-transparent pointer-events-none rounded-t-2xl" />
                          <div className="flex items-center gap-2 min-w-0 flex-1 h-full">
                            <span className="w-6 h-6 rounded-lg bg-black/45 flex items-center justify-center font-black text-xs shrink-0 border border-white/20 text-cyan-300">
                              {['A', 'B', 'C', 'D'][oIdx]}
                            </span>
                            <span className="relative text-xs sm:text-sm md:text-base font-bold truncate max-w-full text-left">
                              {opt}
                            </span>
                          </div>
                          {sPlayer.showFeedback && isRight && (
                            <CheckCircle2 size={18} className="text-emerald-300 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Didaktik Açıklama (Tekli Mod) */}
                  {sPlayer.showFeedback && (
                    <div className="mt-1.5 p-2 rounded-xl bg-black/60 border border-cyan-400/40 text-xs sm:text-sm text-cyan-200 text-center animate-fade-in shrink-0">
                      <span>💡 <strong>Kural:</strong> {currentQ.explanation}</span>
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })() : (
        /* 2 VE 3 KİŞİLİK YARIŞMA ARENASI */
        <div className="flex-1 flex flex-col justify-between w-full h-full min-h-0 overflow-hidden">
          {/* ÜST ORTAK GERİ SAYIM SAYACI (2 VE 3 KİŞİLİKTE ÇOK BELİRGİN SÜRE) */}
          <div className="w-full flex items-center justify-between bg-black/60 border border-cyan-500/40 rounded-xl px-3 py-1.5 mb-1.5 shrink-0">
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-cyan-300 uppercase tracking-wider">
              <span>⚔️ {playerMode} KİŞİLİK SATIR SONU KAPIŞMASI</span>
            </div>
            <div className={`border rounded-xl px-3 py-0.5 flex items-center gap-1.5 font-mono font-black text-xs sm:text-sm shrink-0 transition-all ${
              timeLeft <= 5 
                ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-2 ring-rose-500/60 animate-pulse' 
                : 'bg-[#080e1d] border-cyan-500/60 text-cyan-200'
            }`}>
              <span>⏱️ KALAN SÜRE:</span>
              <span className="text-amber-300">{timeLeft}s</span>
            </div>
          </div>

          <div className={`w-full flex-1 grid gap-2 sm:gap-2.5 ${
            playerMode === 2 ? 'grid-cols-2' : 'grid-cols-3'
          } min-h-0 items-stretch`}>
            {players.map((player, pIdx) => {
              const currentQ = questions[player.questionIndex % questions.length];
              const pStudent = effectiveSelectedStudentIds[pIdx]
                ? students?.find(s => s.id === effectiveSelectedStudentIds[pIdx])
                : null;
              const displayName = pStudent ? pStudent.name : player.name;

              const cardBorder = player.colorName === 'rose'
                ? 'border-rose-500/80 bg-[#250d18]/90'
                : player.colorName === 'blue'
                ? 'border-sky-500/80 bg-[#0d1c31]/90'
                : 'border-emerald-500/80 bg-[#0b2419]/90';

              return (
                <div
                  key={player.id}
                  className={`rounded-2xl border-2 ${cardBorder} p-2 sm:p-2.5 flex flex-col justify-between shadow-xl min-h-0 overflow-hidden`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-1 mb-1 shrink-0 h-7 sm:h-8">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm sm:text-base shrink-0">
                        {player.colorName === 'rose' ? '🔴' : player.colorName === 'blue' ? '🔵' : '🟢'}
                      </span>
                      <span className="font-black text-xs sm:text-sm text-slate-100 truncate">
                        {displayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                        Soru: {player.questionIndex + 1}/5
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs">
                        {player.score} P
                      </span>
                    </div>
                  </div>

                  {/* Soru Alanı: İleri Üçer Sayma ile aynı tasarım, kutuyu doldurur */}
                  <div className="flex-1 min-h-0 flex my-0.5 overflow-hidden">
                    <ActivityQuestionFrame mode={playerMode as 2 | 3} contentKey={player.questionIndex}>
                      <SatirSonuQuestionContent q={currentQ} />
                    </ActivityQuestionFrame>
                  </div>

                  {/* Şıklar */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto mb-0.5 w-full shrink-0">
                    {currentQ.options.map((opt, oIdx) => {
                      const isChosen = player.selectedOption === opt;
                      const isRight = opt === currentQ.correctAnswer;
                      let btnStyle = 'bg-slate-800/95 hover:bg-slate-700 text-slate-100 border-slate-600/90';

                      if (player.showFeedback) {
                        if (isRight) {
                          btnStyle = 'ring-4 ring-inset ring-emerald-500/80 border-emerald-400/80 bg-emerald-800 text-white shadow-md';
                        } else if (isChosen && !isRight) {
                          btnStyle = 'ring-4 ring-inset ring-rose-600/80 border-rose-400/80 bg-rose-900 text-white shadow-md';
                        } else {
                          btnStyle = 'opacity-30 border-slate-700 bg-slate-800/60 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={player.showFeedback}
                          onClick={() => handleOptionClick(pIdx, opt)}
                          className={`w-full rounded-xl sm:rounded-2xl border-2 font-bold transition-all text-left flex items-center justify-between cursor-pointer active:scale-98 shadow-sm py-1 sm:py-1.5 px-2 min-h-[38px] sm:min-h-[44px] md:min-h-[48px] max-h-[52px] overflow-hidden ${btnStyle}`}
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 h-full">
                            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-black/45 flex items-center justify-center font-black shrink-0 border border-white/20 text-[10px] sm:text-xs text-cyan-300">
                              {['A', 'B', 'C', 'D'][oIdx]}
                            </span>
                            <div className="flex-1 min-w-0 h-full">
                              <AutoFitOptionContent opt={opt} displayOpt={opt} mode={playerMode as 1 | 2 | 3} />
                            </div>
                          </div>
                          {player.showFeedback && isRight && <span className="text-white shrink-0 font-black text-xs sm:text-sm ml-1">✓</span>}
                          {player.showFeedback && isChosen && !isRight && <span className="text-white shrink-0 font-black text-xs sm:text-sm ml-1">✗</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Didaktik Açıklama */}
                  {player.showFeedback && (
                    <div className="mt-1 p-1 rounded-lg bg-black/50 border border-white/10 text-[10px] sm:text-xs text-cyan-200 text-center animate-fade-in shrink-0">
                      <span className="line-clamp-2">{currentQ.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}
      </main>

      {/* Student Avatar Dock (Single Row) */}
      {students && onOpenRosterModal && (
        <div className="w-full shrink-0 z-20 px-1 sm:px-2 pb-0.5">
          <StudentAvatarDock
            students={students}
            currentGrade={2}
            playerCount={playerMode}
            selectedStudentIds={effectiveSelectedStudentIds}
            onSelectStudentForPlayer={handleSelectStudentForPlayer}
            onOpenRosterModal={onOpenRosterModal}
            playMp3={triggerSound}
          />
        </div>
      )}

      {/* Victory Celebration Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 animate-fade-in">
          <div className="bg-gradient-to-b from-[#102438] to-[#071320] border-2 border-cyan-400 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
              ✏️
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-cyan-300 uppercase">
              Tebrikler Satır Sonu Ustası!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              Kısa çizgi ve hece kurallarını eksiksiz uygulayarak tüm soruları tamamladın!
            </p>

            {/* Scores summary */}
            <div className="w-full flex items-center justify-center gap-2 py-2">
              {players.map((p, idx) => {
                const st = effectiveSelectedStudentIds[idx]
                  ? students?.find(s => s.id === effectiveSelectedStudentIds[idx])
                  : null;
                return (
                  <div key={p.id} className="flex-1 bg-black/40 border border-white/15 rounded-xl p-2">
                    <span className="text-[11px] block font-bold text-slate-300 truncate">
                      {st ? st.name : p.name}
                    </span>
                    <span className="text-base font-black text-cyan-300">{p.score} P</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full mt-1">
              <button
                onClick={handleResetGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={15} /> Tekrar Oyna
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                Menüye Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};