// Turkish Alphabet Collation & Word Sorting Data
export const TURKISH_ALPHABET = [
  'a', 'b', 'c', 'ç', 'd', 'e', 'f', 'g', 'ğ', 'h',
  'ı', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'ö', 'p',
  'r', 's', 'ş', 't', 'u', 'ü', 'v', 'y', 'z'
];

export const TURKISH_ALPHABET_UPPER = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H',
  'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P',
  'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'
];

/**
 * Returns the alphabetical index (0 to 28) for a Turkish letter
 */
export const getTurkishAlphabetIndex = (letter: string): number => {
  return TURKISH_ALPHABET.indexOf(letter.toLowerCase());
};

/**
 * Compares two Turkish words in strict dictionary/alphabetical order
 */
export const compareTurkishWords = (a: string, b: string): number => {
  const normA = a.toLowerCase();
  const normB = b.toLowerCase();
  const minLen = Math.min(normA.length, normB.length);
  
  for (let i = 0; i < minLen; i++) {
    const idxA = getTurkishAlphabetIndex(normA[i]);
    const idxB = getTurkishAlphabetIndex(normB[i]);
    if (idxA !== idxB) {
      // If either letter is not in standard alphabet, fallback to localeCompare
      if (idxA === -1 || idxB === -1) {
        return normA.localeCompare(normB, 'tr');
      }
      return idxA - idxB;
    }
  }
  return normA.length - normB.length;
};

/**
 * Sorts an array of words strictly according to Turkish dictionary order
 */
export const sortWordsAlphabetically = (words: string[]): string[] => {
  return [...words].sort(compareTurkishWords);
};

/**
 * Checks if the given array of words is in strict dictionary order
 */
export const isWordsAlphabeticalOrder = (words: (string | null)[]): boolean => {
  if (words.some(w => w === null || w === '')) return false;
  const nonNullWords = words as string[];
  for (let i = 0; i < nonNullWords.length - 1; i++) {
    if (compareTurkishWords(nonNullWords[i], nonNullWords[i + 1]) >= 0) {
      return false;
    }
  }
  return true;
};

/**
 * Shuffles an array randomly using Fisher-Yates
 */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 1 ve 2. Sınıflar İçin 3 Kelimelik Zengin Setler (Basit, tanıdık ve genellikle kısa kelimeler)
 */
export const WORD_SETS_GRADE_1_2: string[][] = [
  ['arı', 'bal', 'çam'],
  ['ay', 'güneş', 'yıldız'],
  ['top', 'okul', 'zil'],
  ['elma', 'kiraz', 'muz'],
  ['kuş', 'kedi', 'köpek'],
  ['ev', 'oda', 'yol'],
  ['dere', 'deniz', 'göl'],
  ['çay', 'su', 'süt'],
  ['dut', 'incir', 'nar'],
  ['kış', 'bahar', 'yaz'],
  ['göz', 'kulak', 'burun'],
  ['el', 'kol', 'ayak'],
  ['kapı', 'pencere', 'çatı'],
  ['kitap', 'kalem', 'silgi'],
  ['baba', 'anne', 'bebek'],
  ['tavuk', 'ördek', 'horoz'],
  ['koyun', 'keçi', 'inek'],
  ['araba', 'gemi', 'uçak'],
  ['çiçek', 'ağaç', 'yaprak'],
  ['ceviz', 'fındık', 'badem'],
  ['limon', 'portakal', 'kivi'],
  ['bulut', 'yağmur', 'rüzgar'],
  ['halı', 'masa', 'koltuk'],
  ['çanta', 'önlük', 'defter'],
  ['resim', 'müzik', 'oyun'],
  ['simit', 'ekmek', 'pasta'],
  ['çorba', 'pilav', 'köfte'],
  ['tavşan', 'kaplumbağa', 'sincap'],
  ['ayakkabı', 'çorap', 'terlik'],
  ['çekiç', 'çivi', 'makas'],
  ['sabah', 'akşam', 'gece'],
  ['kar', 'buz', 'dolu'],
  ['deniz', 'kum', 'güneş'],
  ['dağ', 'tepe', 'ova'],
  ['dere', 'nehir', 'şelale'],
  ['tilki', 'kurt', 'ayı'],
  ['tabak', 'çatal', 'kaşık'],
  ['defter', 'boya', 'cetvel'],
  ['ceket', 'gömlek', 'pantolon'],
  ['şapka', 'atkı', 'eldiven'],
  ['karpuz', 'kavun', 'çilek'],
  ['bayrak', 'vatan', 'yurt'],
  ['aslan', 'kaplan', 'leopar'],
  ['kuzu', 'oğlak', 'buzağı']
];

/**
 * 3 ve 4. Sınıflar İçin 4 Kelimelik Zengin Setler (3-4. sınıf seviyesine uygun, sözlük sırasını pekiştiren)
 */
export const WORD_SETS_GRADE_3_4: string[][] = [
  ['aslan', 'balık', 'ceylan', 'deve'],
  ['armut', 'ayva', 'çilek', 'elma'],
  ['biber', 'domates', 'havuç', 'patates'],
  ['defter', 'kalem', 'kitap', 'silgi'],
  ['doktor', 'hemşire', 'mühendis', 'öğretmen'],
  ['bayrak', 'millet', 'vatan', 'yurt'],
  ['ceviz', 'fındık', 'fıstık', 'leblebi'],
  ['kartal', 'karga', 'kumru', 'kuğu'],
  ['masa', 'sandalye', 'sehpa', 'dolap'],
  ['akıl', 'bilgi', 'hafıza', 'öğrenme'],
  ['dünya', 'mars', 'satürn', 'venüs'],
  ['şapka', 'yelek', 'atkı', 'eldiven'],
  ['tavuk', 'horoz', 'ördek', 'kaz'],
  ['bahar', 'bulut', 'fırtına', 'yağmur'],
  ['papatya', 'lale', 'karanfil', 'gül'],
  ['kiraz', 'karpuz', 'kavun', 'kayısı'],
  ['bardak', 'çatal', 'kaşık', 'tabak'],
  ['kavun', 'karpuz', 'şeftali', 'üzüm'],
  ['tren', 'otobüs', 'minibüs', 'vapur'],
  ['balina', 'yunus', 'köpekbalığı', 'ahtapot'],
  ['ayakkabı', 'çizme', 'bot', 'sandalet'],
  ['gözlük', 'dürbün', 'teleskop', 'mercek'],
  ['ilkokul', 'ortaokul', 'lise', 'üniversite'],
  ['sabah', 'öğle', 'ikindi', 'akşam'],
  ['dostluk', 'sevgi', 'saygı', 'barış'],
  ['çalışkan', 'dürüst', 'yardımsever', 'nazik'],
  ['orman', 'koru', 'fidanlık', 'bahçe'],
  ['çekiç', 'tornavida', 'pense', 'testere'],
  ['gezegen', 'yıldız', 'kuyrukluyıldız', 'meteor'],
  ['denizaltı', 'yelkenli', 'motor', 'feribot'],
  ['akrep', 'karınca', 'örümcek', 'yusufçuk'],
  ['balkabağı', 'karnabahar', 'pırasa', 'ıspanak'],
  ['kardelen', 'nergis', 'sümbül', 'menekşe'],
  ['gazete', 'dergi', 'ansiklopedi', 'roman'],
  ['kahvaltı', 'öğle yemeği', 'ikindi çayı', 'akşam yemeği'],
  ['yüzme', 'koşu', 'basketbol', 'voleybol'],
  ['geometri', 'matematik', 'türkçe', 'fen bilimleri'],
  ['uçurtma', 'bisiklet', 'paten', 'kaykay']
];

/**
 * Generates a round with scrambled words and their proper sorted order
 * @param count 3 for 1-2. Sınıf, 4 for 3-4. Sınıf
 */
export const generateRoundWords = (count: 3 | 4): { originalSorted: string[]; scrambled: string[] } => {
  const bank = count === 3 ? WORD_SETS_GRADE_1_2 : WORD_SETS_GRADE_3_4;
  const pickedSet = bank[Math.floor(Math.random() * bank.length)];
  const picked = [...pickedSet];

  const originalSorted = sortWordsAlphabetically(picked);

  // Ensure scrambled is NOT already sorted
  let scrambled = shuffleArray(picked);
  let attempts = 0;
  while (isWordsAlphabeticalOrder(scrambled) && attempts < 10) {
    scrambled = shuffleArray(picked);
    attempts++;
  }

  return { originalSorted, scrambled };
};
