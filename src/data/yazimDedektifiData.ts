export interface YazimDedektifiQuestion {
  id: string;
  sentence: string; // The sentence containing a spelling mistake
  words: string[]; // Words of the sentence for clickable words
  wrongWordIndex: number; // Which word in the sentence is misspelled
  wrongWord: string; // The incorrect word as written
  correctWord: string; // The correct form
  distractorWord: string; // Another plausible but incorrect option
  explanation: string; // Explanatory rule for 2nd grade
  category: 'Harf Yanlışı' | 'Ayrı/Bitişik Yazım' | 'Büyük Harf / Kesme' | 'Soru Eki (-mi)';
}

export const YAZIM_DEDEKTIFI_QUESTIONS: YazimDedektifiQuestion[] = [
  {
    id: 'yd_1',
    sentence: 'Parkta herkez neşeyle oyun oynuyor.',
    words: ['Parkta', 'herkez', 'neşeyle', 'oyun', 'oynuyor.'],
    wrongWordIndex: 1,
    wrongWord: 'herkez',
    correctWord: 'herkes',
    distractorWord: 'herkez',
    explanation: 'Sözcüğün sonu "s" harfi ile biter: "herkes".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_2',
    sentence: 'Öğretmenimiz bize herşey çok güzel olacak dedi.',
    words: ['Öğretmenimiz', 'bize', 'herşey', 'çok', 'güzel', 'olacak', 'dedi.'],
    wrongWordIndex: 2,
    wrongWord: 'herşey',
    correctWord: 'her şey',
    distractorWord: 'herşey',
    explanation: '"Şey" sözcüğü her zaman ayrı yazılır: "her şey".',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_3',
    sentence: 'Sınıfta yanlız kalmaktan hiç hoşlanmaz.',
    words: ['Sınıfta', 'yanlız', 'kalmaktan', 'hiç', 'hoşlanmaz.'],
    wrongWordIndex: 1,
    wrongWord: 'yanlız',
    correctWord: 'yalnız',
    distractorWord: 'yanlız',
    explanation: '"Yalın" kökünden gelir, doğrusu "yalnız"dır.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_4',
    sentence: 'Matematik testinde bir tane yanlışım çıktı.',
    words: ['Matematik', 'testinde', 'bir', 'tane', 'yalnışım', 'çıktı.'],
    wrongWordIndex: 4,
    wrongWord: 'yalnışım',
    correctWord: 'yanlışım',
    distractorWord: 'yalnışım',
    explanation: '"Yanılmak" kökünden gelir, doğrusu "yanlış"tır.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_5',
    sentence: 'Pazardan taze meyva ve sebze aldık.',
    words: ['Pazardan', 'taze', 'meyva', 've', 'sebze', 'aldık.'],
    wrongWordIndex: 2,
    wrongWord: 'meyva',
    correctWord: 'meyve',
    distractorWord: 'meyva',
    explanation: 'Sözcüğün doğrusu "meyve" olarak yazılır.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_6',
    sentence: 'Çantasında kırmızı bir süpriz hediye vardı.',
    words: ['Çantasında', 'kırmızı', 'bir', 'süpriz', 'hediye', 'vardı.'],
    wrongWordIndex: 3,
    wrongWord: 'süpriz',
    correctWord: 'sürpriz',
    distractorWord: 'süpriz',
    explanation: 'İlk hecesinde "r" harfi bulunur: "sürpriz".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_7',
    sentence: 'Yemekte lezzetli kurufasulye ve pilav yedik.',
    words: ['Yemekte', 'lezzetli', 'kurufasulye', 've', 'pilav', 'yediler.'],
    wrongWordIndex: 2,
    wrongWord: 'kurufasulye',
    correctWord: 'kuru fasulye',
    distractorWord: 'kurufasulye',
    explanation: '"Kuru fasulye" ayrı yazılır.',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_8',
    sentence: 'Yarın bizimle tiyatroya geliyormusun?',
    words: ['Yarın', 'bizimle', 'tiyatroya', 'geliyormusun?'],
    wrongWordIndex: 3,
    wrongWord: 'geliyormusun?',
    correctWord: 'geliyor musun?',
    distractorWord: 'geliyormusun?',
    explanation: 'Soru eki "-mu / -mü" daima kendinden önceki kelimeden ayrı yazılır.',
    category: 'Soru Eki (-mi)'
  },
  {
    id: 'yd_9',
    sentence: 'Okul servisi bu sabah tiren istasyonuna uğradı.',
    words: ['Okul', 'servisi', 'bu', 'sabah', 'tiren', 'istasyonuna', 'uğradı.'],
    wrongWordIndex: 4,
    wrongWord: 'tiren',
    correctWord: 'tren',
    distractorWord: 'tiren',
    explanation: '"Tren" sözcüğünde "t" ve "r" arasında "i" harfi yazılmaz.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_10',
    sentence: 'Gözlerindeki kiprikler çok uzundu.',
    words: ['Gözlerindeki', 'kiprikler', 'çok', 'uzundu.'],
    wrongWordIndex: 1,
    wrongWord: 'kiprikler',
    correctWord: 'kirpikler',
    distractorWord: 'kiprikler',
    explanation: 'Önce "r", sonra "p" harfi gelir: "kirpik".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_11',
    sentence: 'Yaz tatilinde ankaraya dedemin yanına gideceğiz.',
    words: ['Yaz', 'tatilinde', 'ankaraya', 'dedemin', 'yanına', 'gideceğiz.'],
    wrongWordIndex: 2,
    wrongWord: 'ankaraya',
    correctWord: "Ankara'ya",
    distractorWord: 'ankaraya',
    explanation: 'Şehir adları büyük harfle başlar ve gelen ek kesme işaretiyle ayrılır.',
    category: 'Büyük Harf / Kesme'
  },
  {
    id: 'yd_12',
    sentence: 'Bahçedeki sarı çiçeği koparma günahdır.',
    words: ['Bahçedeki', 'sarı', 'çiçeği', 'koparma', 'günahdır.'],
    wrongWordIndex: 4,
    wrongWord: 'günahdır.',
    correctWord: 'günahtır.',
    distractorWord: 'günahdır.',
    explanation: '"h" sert ünsüzünden sonra "t" gelir: "günahtır".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_13',
    sentence: 'Ali ödevini vaktinde bitirdimi?',
    words: ['Ali', 'ödevini', 'vaktinde', 'bitirdimi?'],
    wrongWordIndex: 3,
    wrongWord: 'bitirdimi?',
    correctWord: 'bitirdi mi?',
    distractorWord: 'bitirdimi?',
    explanation: 'Soru eki olan "-mi" her zaman kelimeden ayrı yazılır.',
    category: 'Soru Eki (-mi)'
  },
  {
    id: 'yd_14',
    sentence: 'Beden eğitimi dersinde siportmen davrandık.',
    words: ['Beden', 'eğitimi', 'dersinde', 'siportmen', 'davrandık.'],
    wrongWordIndex: 3,
    wrongWord: 'siportmen',
    correctWord: 'sportmen',
    distractorWord: 'siportmen',
    explanation: '"Spor / Sportmen" kelimelerinde "s" ile "p" arasında "i" yoktur.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_15',
    sentence: 'Çorbanın içine biraz sovan doğradı.',
    words: ['Çorbanın', 'içine', 'biraz', 'sovan', 'doğradı.'],
    wrongWordIndex: 3,
    wrongWord: 'sovan',
    correctWord: 'soğan',
    distractorWord: 'sovan',
    explanation: 'Sözcüğün ortasında "v" değil, yumuşak g "ğ" bulunur: "soğan".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_16',
    sentence: 'Teneffüste bizde bahçeye çıkmak istiyoruz.',
    words: ['Teneffüste', 'bizde', 'bahçeye', 'çıkmak', 'istiyoruz.'],
    wrongWordIndex: 1,
    wrongWord: 'bizde',
    correctWord: 'biz de',
    distractorWord: 'bizde',
    explanation: '"Dahi" anlamındaki "de" bağlacı kelimeden ayrı yazılır: "biz de".',
    category: 'Ayrı/Bitişik Yazım'
  }
];

export const getRandomYazimQuestions = (count: number = 10): YazimDedektifiQuestion[] => {
  const shuffled = [...YAZIM_DEDEKTIFI_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
