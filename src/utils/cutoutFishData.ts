// Cutout balık türleri ve aşamaları (Yavru -> Genç -> Yetişkin)
export interface CutoutStage {
  minHomework: number;
  stageIndex: number;
  imageSrc: string;
  stageName: string;
  badge: string;
  baseWidth: number;
}

export interface CutoutSpecies {
  id: string;
  name: string;
  stages: CutoutStage[];
}

export const CUTOUT_FISH_SPECIES: CutoutSpecies[] = [
  // 1. Balina Ailesi (Mevcut - cutouts)
  {
    id: 'balina',
    name: 'Balina Ailesi',
    stages: [
      {
        minHomework: 0,
        stageIndex: 1,
        imageSrc: '/cutouts/1_genc_hortumlu_balina.png',
        stageName: 'Yavru Hortumlu Balina',
        badge: '🐳',
        baseWidth: 65,
      },
      {
        minHomework: 3,
        stageIndex: 2,
        imageSrc: '/cutouts/2_mavi_balina.png',
        stageName: 'Genç Mavi Balina',
        badge: '🐋',
        baseWidth: 84,
      },
      {
        minHomework: 7,
        stageIndex: 3,
        imageSrc: '/cutouts/3_hortumlu_balina_yetiskin.png',
        stageName: 'Yetişkin Dev Balina',
        badge: '👑🐋',
        baseWidth: 108,
      },
    ],
  },
  // 2. İspermeçet Balinası Ailesi (Yeni - cutouts2)
  {
    id: 'ispermecet_balinasi',
    name: 'İspermeçet Balinası Ailesi',
    stages: [
      {
        minHomework: 0,
        stageIndex: 1,
        imageSrc: '/cutouts2/1_ispermecet_balinasi_genc.png',
        stageName: 'Yavru İspermeçet Balinası',
        badge: '🐋',
        baseWidth: 65,
      },
      {
        minHomework: 3,
        stageIndex: 2,
        imageSrc: '/cutouts2/2_sag_balina.png',
        stageName: 'Genç Sağ Balina',
        badge: '🐳',
        baseWidth: 84,
      },
      {
        minHomework: 7,
        stageIndex: 3,
        imageSrc: '/cutouts2/3_ispermecet_balinasi_yetiskin.png',
        stageName: 'Yetişkin Dev İspermeçet',
        badge: '👑🐋',
        baseWidth: 108,
      },
    ],
  },
  // 3. Kaplan Köpekbalığı Ailesi (Mevcut - cutouts)
  {
    id: 'kopekbaligi',
    name: 'Kaplan Köpekbalığı Ailesi',
    stages: [
      {
        minHomework: 0,
        stageIndex: 1,
        imageSrc: '/cutouts/4_kaplan_kopekbaligi_yavru.png',
        stageName: 'Yavru Kaplan Köpekbalığı',
        badge: '🦈',
        baseWidth: 62,
      },
      {
        minHomework: 3,
        stageIndex: 2,
        imageSrc: '/cutouts/5_kaplan_kopekbaligi_genc.png',
        stageName: 'Genç Kaplan Köpekbalığı',
        badge: '⚡🦈',
        baseWidth: 80,
      },
      {
        minHomework: 7,
        stageIndex: 3,
        imageSrc: '/cutouts/6_kaplan_kopekbaligi_yetiskin.png',
        stageName: 'Yetişkin Kaplan Köpekbalığı',
        badge: '👑🦈',
        baseWidth: 104,
      },
    ],
  },
  // 4. Boğa & Çekiç Başlı Köpekbalığı Ailesi (Yeni - cutouts2)
  {
    id: 'cekic_kopekbaligi',
    name: 'Çekiç Başlı Köpekbalığı Ailesi',
    stages: [
      {
        minHomework: 0,
        stageIndex: 1,
        imageSrc: '/cutouts2/4_boga_kopekbaligi.png',
        stageName: 'Yavru Boğa Köpekbalığı',
        badge: '🦈',
        baseWidth: 62,
      },
      {
        minHomework: 3,
        stageIndex: 2,
        imageSrc: '/cutouts2/5_cekic_basli_kopekbaligi_genc.png',
        stageName: 'Genç Çekiç Başlı Köpekbalığı',
        badge: '⚡🦈',
        baseWidth: 80,
      },
      {
        minHomework: 7,
        stageIndex: 3,
        imageSrc: '/cutouts2/6_cekic_basli_kopekbaligi_yetiskin.png',
        stageName: 'Yetişkin Dev Çekiç Başlı',
        badge: '👑🦈',
        baseWidth: 104,
      },
    ],
  },
  // 5. Pembe Yunus Ailesi (Mevcut - cutouts)
  {
    id: 'yunus',
    name: 'Pembe Yunus Ailesi',
    stages: [
      {
        minHomework: 0,
        stageIndex: 1,
        imageSrc: '/cutouts/7_pembe_yunus.png',
        stageName: 'Sevimli Pembe Yunus',
        badge: '🐬',
        baseWidth: 60,
      },
      {
        minHomework: 3,
        stageIndex: 2,
        imageSrc: '/cutouts/8_siset_burunlu_yunus_genc.png',
        stageName: 'Genç Şişe Burunlu Yunus',
        badge: '✨🐬',
        baseWidth: 78,
      },
      {
        minHomework: 7,
        stageIndex: 3,
        imageSrc: '/cutouts/9_siset_burunlu_yunus_yetiskin.png',
        stageName: 'Yetişkin Akrobat Yunus',
        badge: '👑🐬',
        baseWidth: 102,
      },
    ],
  },
  // 6. Şişe Burunlu Yunus Ailesi (Yeni - cutouts2)
  {
    id: 'sise_burun_yunus',
    name: 'Şişe Burunlu Okyanus Yunusu Ailesi',
    stages: [
      {
        minHomework: 0,
        stageIndex: 1,
        imageSrc: '/cutouts2/7_sise_burunlu_yunus_yavru.png',
        stageName: 'Yavru Şişe Burunlu Yunus',
        badge: '🐬',
        baseWidth: 60,
      },
      {
        minHomework: 3,
        stageIndex: 2,
        imageSrc: '/cutouts2/8_sise_burunlu_yunus_genc.png',
        stageName: 'Genç Okyanus Yunusu',
        badge: '✨🐬',
        baseWidth: 78,
      },
      {
        minHomework: 7,
        stageIndex: 3,
        imageSrc: '/cutouts2/9_sise_burunlu_yunus_yetiskin.png',
        stageName: 'Yetişkin Okyanus Yunusu',
        badge: '👑🐬',
        baseWidth: 102,
      },
    ],
  },
  // 7. Mürekkep Balığı Ailesi (Kalamar / Bioluminescent & Giant Squid)
  {
    id: 'murekkep_baligi',
    name: 'Mürekkep Balığı Ailesi',
    stages: [
      {
        minHomework: 0,
        stageIndex: 1,
        imageSrc: '/cutouts/murekkep_baligi_yavru.png',
        stageName: 'Yavru Mürekkep Balığı',
        badge: '🦑',
        baseWidth: 62,
      },
      {
        minHomework: 3,
        stageIndex: 2,
        imageSrc: '/cutouts/murekkep_baligi_genc.png',
        stageName: 'Genç Parlayan Mürekkep Balığı',
        badge: '✨🦑',
        baseWidth: 80,
      },
      {
        minHomework: 7,
        stageIndex: 3,
        imageSrc: '/cutouts/murekkep_baligi_yetiskin.png',
        stageName: 'Yetişkin Dev Mürekkep Balığı',
        badge: '👑🦑',
        baseWidth: 104,
      },
    ],
  },
];

// 23 kişilik sınıfta mürekkep balığına sahip 3 kız öğrenci (Aybüke Yaylak, Elif Su Tekin, Zeynep Koç)
export const SQUID_GIRL_STUDENT_IDS = new Set(['std_g2_1', 'std_g2_7', 'std_g2_22']);

export function isSquidGirlStudent(studentIdOrName?: string | null): boolean {
  if (!studentIdOrName) return false;
  const clean = studentIdOrName.trim().toLocaleLowerCase('tr');
  if (SQUID_GIRL_STUDENT_IDS.has(clean)) return true;
  return (
    clean === 'aybüke' || clean === 'aybuke' || clean.startsWith('aybüke ') || clean.startsWith('aybuke ') ||
    clean === 'elif su' || clean.startsWith('elif su ') || clean.startsWith('elif su') ||
    clean === 'zeynep koç' || clean === 'zeynep koc' || clean.startsWith('zeynep koç') || clean.startsWith('zeynep koc')
  );
}

export function getCutoutFishInfo(
  modelIndex: number = 0, 
  homeworkCount: number = 0,
  studentIdOrName?: string | null
) {
  const squidIdx = CUTOUT_FISH_SPECIES.findIndex(s => s.id === 'murekkep_baligi'); // 6
  // Normal balık türleri: Mürekkep balığı hariç İLK 6 TÜR (0..5)
  const regularSpeciesCount = squidIdx !== -1 ? squidIdx : 6;

  // Varsayılan balık türü: SADECE ilk 6 normal balık türü arasında döner.
  // Miraç (13 % 6 = 1), Umut (20 % 6 = 2), Efekan (6 % 6 = 0) ASLA mürekkep balığı olamaz!
  let speciesIdx = Math.abs(modelIndex) % regularSpeciesCount;

  // YALNIZCA ve SADECE 3 kız öğrenci (Aybüke, Elif Su, Zeynep Koç) özel Mürekkep Balığı modelini alır
  if (isSquidGirlStudent(studentIdOrName) && squidIdx !== -1) {
    speciesIdx = squidIdx;
  }

  const species = CUTOUT_FISH_SPECIES[speciesIdx];
  const count = Math.max(0, homeworkCount || 0);

  let currentStage = species.stages[0];
  for (let i = species.stages.length - 1; i >= 0; i--) {
    if (count >= species.stages[i].minHomework) {
      currentStage = species.stages[i];
      break;
    }
  }

  // Sonraki aşamaya kalan ödev
  const stageIdx = species.stages.indexOf(currentStage);
  let nextStageMin: number | null = null;
  let nextStageName: string | null = null;
  let neededForNext: number = 0;

  if (stageIdx < species.stages.length - 1) {
    nextStageMin = species.stages[stageIdx + 1].minHomework;
    nextStageName = species.stages[stageIdx + 1].stageName;
    neededForNext = Math.max(1, nextStageMin - count);
  }

  // Balık boyutu üzerindeki sayı (ödev puanı) ile KESİNLİKLE DOĞRU ORANTILI:
  // Her 1 ödev puanı balığı düzenli (+6.5px) büyütür.
  const BASE_WIDTH = 62;
  const GROWTH_PER_POINT = 6.5;
  const calculatedWidth = Math.min(260, Math.round(BASE_WIDTH + count * GROWTH_PER_POINT));

  return {
    speciesId: species.id,
    speciesName: species.name,
    stageIndex: currentStage.stageIndex,
    stageName: currentStage.stageName,
    badge: currentStage.badge,
    imageSrc: currentStage.imageSrc,
    calculatedWidth,
    nextStageMin,
    nextStageName,
    neededForNext,
    isMaxStage: stageIdx === species.stages.length - 1,
  };
}
