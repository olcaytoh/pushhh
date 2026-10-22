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
  {
    id: 'yunus',
    name: 'Yunus Ailesi',
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
];

export function getCutoutFishInfo(modelIndex: number = 0, homeworkCount: number = 0) {
  const speciesIdx = Math.abs(modelIndex) % CUTOUT_FISH_SPECIES.length;
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

  // Aşama içi pürüzsüz büyüme çarpanı
  const intraGrowth = Math.min(1.35, 1.0 + (count % 3) * 0.05 + Math.min(0.2, Math.floor(count / 3) * 0.03));
  const calculatedWidth = Math.round(currentStage.baseWidth * intraGrowth);

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
