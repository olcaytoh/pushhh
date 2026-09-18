// Turkish Alphabet Collation & Word/Letter Sorting Data
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
 * Sorts an array of letters strictly according to Turkish alphabetical order
 */
export const sortLettersAlphabetically = (letters: string[]): string[] => {
  return [...letters].sort((a, b) => getTurkishAlphabetIndex(a) - getTurkishAlphabetIndex(b));
};

/**
 * Checks if the given array of letters is in strict alphabetical order
 */
export const isAlphabeticalOrder = (letters: (string | null)[]): boolean => {
  if (letters.some(l => l === null || l === '')) return false;
  const nonNullLetters = letters as string[];
  for (let i = 0; i < nonNullLetters.length - 1; i++) {
    const idxA = getTurkishAlphabetIndex(nonNullLetters[i]);
    const idxB = getTurkishAlphabetIndex(nonNullLetters[i + 1]);
    if (idxA >= idxB) {
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
 * Curated interesting letter groups for young learners
 * including tricky Turkish letters (ç, ğ, ı, i, ö, ş, ü)
 */
const CURATED_LETTER_SETS: Record<number, string[][]> = {
  4: [
    ['d', 'e', 'ı', 'i'],
    ['a', 'c', 'ç', 'd'],
    ['g', 'ğ', 'h', 'ı'],
    ['o', 'ö', 'p', 'r'],
    ['s', 'ş', 't', 'u'],
    ['u', 'ü', 'v', 'y'],
    ['b', 'k', 'm', 't'],
    ['a', 'e', 'i', 'u'],
    ['c', 'f', 'k', 'p'],
    ['d', 'l', 'r', 'z'],
    ['ç', 'm', 's', 'y'],
    ['b', 'g', 'n', 't'],
    ['h', 'k', 'ö', 'ü'],
    ['e', 'j', 'p', 'v'],
    ['f', 'ı', 'm', 'ş'],
    ['a', 'ç', 'i', 'ö'],
    ['k', 'l', 'm', 'n'],
    ['p', 'r', 's', 't'],
    ['b', 'c', 'd', 'e'],
    ['y', 'z', 'u', 'ü']
  ],
  5: [
    ['a', 'c', 'ç', 'd', 'e'],
    ['g', 'ğ', 'h', 'ı', 'i'],
    ['o', 'ö', 'p', 'r', 's'],
    ['s', 'ş', 't', 'u', 'ü'],
    ['b', 'f', 'k', 'p', 'z'],
    ['a', 'd', 'k', 'm', 'y'],
    ['c', 'h', 'l', 'r', 'v'],
    ['ç', 'g', 'n', 's', 't'],
    ['e', 'i', 'o', 'u', 'z'],
    ['b', 'e', 'k', 'ö', 'ş'],
    ['d', 'ğ', 'm', 'p', 'ü'],
    ['a', 'h', 'l', 't', 'y'],
    ['c', 'i', 'n', 'r', 'v'],
    ['f', 'k', 'ö', 's', 'z'],
    ['b', 'ç', 'm', 'p', 'u'],
    ['d', 'g', 'l', 'ş', 'y'],
    ['a', 'e', 'm', 'r', 't'],
    ['k', 'l', 'm', 'n', 'o'],
    ['p', 'r', 's', 'ş', 't'],
    ['u', 'ü', 'v', 'y', 'z']
  ]
};

/**
 * Generates a shuffled set of letters for a round
 * @param count 4 for 1-2. Sınıf, 5 for 3-4. Sınıf
 */
export const generateRoundLetters = (count: 4 | 5): { originalSorted: string[]; scrambled: string[] } => {
  const curated = CURATED_LETTER_SETS[count];
  let picked: string[];

  // 70% chance to pick from curated pedagogically rich sets, 30% fully random
  if (curated && Math.random() < 0.7) {
    const randomSet = curated[Math.floor(Math.random() * curated.length)];
    picked = [...randomSet];
  } else {
    // Generate random unique letters
    const indices = new Set<number>();
    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * TURKISH_ALPHABET.length));
    }
    picked = Array.from(indices).map(idx => TURKISH_ALPHABET[idx]);
  }

  const originalSorted = sortLettersAlphabetically(picked);

  // Ensure scrambled is NOT already in sorted order
  let scrambled = shuffleArray(picked);
  let attempts = 0;
  while (isAlphabeticalOrder(scrambled) && attempts < 10) {
    scrambled = shuffleArray(picked);
    attempts++;
  }

  return { originalSorted, scrambled };
};
