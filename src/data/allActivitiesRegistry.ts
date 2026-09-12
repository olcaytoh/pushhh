import { topics1stGrade } from './topics1stGrade';
import { topics2ndGrade } from './topics2ndGrade';
import { topics3rdGrade } from './topics3rdGrade';
import { topics4thGrade } from './topics4thGrade';
import { halatCekmeTopics, sureliExtraTopics } from './halatCekmeTopics';

export interface ActivityRegistryItem {
  id: string;
  type: 'grade_topic' | '3d_lab' | 'xox' | 'word_game' | 'aynisini_bul' | 'geoboard';
  grade?: 1 | 2 | 3 | 4;
  topicKey?: string;
  wordGameType?: 'zit_anlam' | 'es_anlam' | 'ingilizce';
  title: string;
  categoryLabel: string;
}

const resolveTitle = (key: string, grade?: number): string => {
  if (halatCekmeTopics[key]?.title) return halatCekmeTopics[key].title;
  if (sureliExtraTopics[key]?.title) return sureliExtraTopics[key].title;
  if (grade === 1 && topics1stGrade[key]?.title) return topics1stGrade[key].title;
  if (grade === 2 && topics2ndGrade[key]?.title) return topics2ndGrade[key].title;
  if (grade === 3 && topics3rdGrade[key]?.title) return topics3rdGrade[key].title;
  if (grade === 4 && topics4thGrade[key]?.title) return topics4thGrade[key].title;
  if (topics1stGrade[key]?.title) return topics1stGrade[key].title;
  if (topics2ndGrade[key]?.title) return topics2ndGrade[key].title;
  if (topics3rdGrade[key]?.title) return topics3rdGrade[key].title;
  if (topics4thGrade[key]?.title) return topics4thGrade[key].title;
  return key;
};

export const ALL_ACTIVITIES_LIST: ActivityRegistryItem[] = [];

// ==========================================
// 1. SINIF: Müfredat Sırasına Göre
// ==========================================
// 1. Nesnelerin Geometrisi
const g1Geometri = [
  'uzamsal_iliskiler',
  'uzamsal_iliskiler_simetri',
  'es_nesneler',
  'geometrik_sekil_cisim',
  'geometri_tahtasi'
];
g1Geometri.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g1_${key}`,
    type: key === 'geometri_tahtasi' ? 'geoboard' : 'grade_topic',
    grade: 1,
    topicKey: key,
    title: resolveTitle(key, 1),
    categoryLabel: '1. Sınıf Geometri'
  });
});

// 2. Sayılar ve Nicelikler
const g1Sayilar = [
  'nesne_sayisi',
  'sira_sayilari',
  'cok_az_esit',
  'ritmik_ileri_1',
  'ritmik_ileri_2',
  'ritmik_ileri_5',
  'ritmik_ileri_10',
  'ritmik_geri_1',
  'ritmik_geri_2',
  'ritmik_geri_10'
];
g1Sayilar.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g1_${key}`,
    type: 'grade_topic',
    grade: 1,
    topicKey: key,
    title: resolveTitle(key, 1),
    categoryLabel: '1. Sınıf Sayılar'
  });
});

// 3. İşlemlerden Cebirsel Düşünmeye
const g1Islemler = [
  'toplama_20_ici',
  'toplama_onluk',
  'verilmeyen_toplanan',
  'zihinden_toplama',
  'tek_islem_toplama_problemleri',
  'iki_islem_toplama_problemleri',
  'cikarma_20_ici',
  'cikarma_onluk',
  'zihinden_cikarma',
  'tek_islem_cikarma_problemleri',
  'iki_islem_cikarma_problemleri',
  'toplama_cikarma_problemleri'
];
g1Islemler.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g1_${key}`,
    type: 'grade_topic',
    grade: 1,
    topicKey: key,
    title: resolveTitle(key, 1),
    categoryLabel: '1. Sınıf İşlemler'
  });
});

// 4. Veri İşleme & Ölçme
const g1Olcme = ['veri_grafik'];
g1Olcme.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g1_${key}`,
    type: 'grade_topic',
    grade: 1,
    topicKey: key,
    title: resolveTitle(key, 1),
    categoryLabel: '1. Sınıf Veri ve Ölçme'
  });
});

// 5. Diğer Oyunlar
ALL_ACTIVITIES_LIST.push({
  id: 'g1_aynisini_bul',
  type: 'aynisini_bul',
  grade: 1,
  title: 'Aynısını Bul (2 Kişilik)',
  categoryLabel: '1. Sınıf Diğer Oyunlar'
});
const g1Diger = [
  'halat_toplama_1', 'halat_cikarma_1',
  'sureli_toplama_cikarma', 'sureli_on_tamamlama',
  'balon_patlatma_mat', 'matematik_hafiza', 'hizli_islem_carki', 'sayi_dedektifi', 'ritim_labirent', 'geometri_eslestirme'
];
g1Diger.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g1_${key}`,
    type: 'grade_topic',
    grade: 1,
    topicKey: key,
    title: resolveTitle(key, 1),
    categoryLabel: '1. Sınıf Diğer Oyunlar'
  });
});

// ==========================================
// 2. SINIF: Müfredat Sırasına Göre
// ==========================================
// 1. Nesnelerin Geometrisi
const g2Geometri = [
  'geometrik_sekil_cisim',
  'geometri_tahtasi',
  'yuz_ayrit_kose',
  'geometrik_oruntu',
  'uzamsal_iliskiler_simetri',
  'sivi_olcme',
  'tartma_olcme'
];
g2Geometri.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g2_${key}`,
    type: key === 'geometri_tahtasi' ? 'geoboard' : 'grade_topic',
    grade: 2,
    topicKey: key,
    title: resolveTitle(key, 2),
    categoryLabel: '2. Sınıf Geometri'
  });
});

// 2. Sayılar ve Nicelikler
const g2Sayilar = [
  'nesne_sayisi',
  'sayi_basamak_degeri',
  'en_yakin_onluk',
  'deste_duzine',
  'kesirler',
  'sayi_karsilastirma',
  'sira_sayilari',
  'paralarimiz',
  'zaman_olcme',
  'uzunluk_olcme',
  'ritmik_ileri_2',
  'ritmik_ileri_3',
  'ritmik_ileri_4',
  'ritmik_ileri_5',
  'ritmik_ileri_10',
  'ritmik_geri_2',
  'ritmik_geri_10',
  'saat_tam',
  'saat_yarim',
  'saat_ceyrek_gece',
  'saat_ceyrek_kala'
];
g2Sayilar.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g2_${key}`,
    type: 'grade_topic',
    grade: 2,
    topicKey: key,
    title: resolveTitle(key, 2),
    categoryLabel: '2. Sınıf Sayılar'
  });
});

// 3. İşlemlerden Cebirsel Düşünmeye
const g2Islemler = [
  'toplama_eldesiz_50',
  'toplama_eldeli_50',
  'verilmeyen_toplanani_bul',
  'zihinden_toplama',
  'tek_islem_toplama_problemleri',
  'iki_islem_toplama_problemleri',
  'cikarma_onluksuz_50',
  'cikarma_onluklu_50',
  'zihinden_cikarma',
  'tek_islem_cikarma_problemleri',
  'iki_islem_cikarma_problemleri',
  'toplama_cikarma_problemleri',
  'ardisik_toplama',
  'ritmik_carpim',
  'esit_paylastirma',
  'ardisik_cikarma',
  'kalansiz_bolme'
];
g2Islemler.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g2_${key}`,
    type: 'grade_topic',
    grade: 2,
    topicKey: key,
    title: resolveTitle(key, 2),
    categoryLabel: '2. Sınıf İşlemler'
  });
});

// 4. Veri İşleme & Ölçme
const g2Olcme = ['veri_grafik', 'takvim_olcme'];
g2Olcme.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g2_${key}`,
    type: 'grade_topic',
    grade: 2,
    topicKey: key,
    title: resolveTitle(key, 2),
    categoryLabel: '2. Sınıf Veri ve Ölçme'
  });
});

// 5. Diğer Oyunlar
ALL_ACTIVITIES_LIST.push({
  id: 'g2_aynisini_bul',
  type: 'aynisini_bul',
  grade: 2,
  title: 'Aynısını Bul (2 Kişilik)',
  categoryLabel: '2. Sınıf Diğer Oyunlar'
});
const g2Diger = [
  'halat_toplama_2', 'halat_cikarma_2', 'halat_carpma_2', 'halat_bolme_2',
  'sureli_toplama_cikarma', 'sureli_carpma_bolme',
  'balon_patlatma_mat', 'matematik_hafiza', 'hizli_islem_carki', 'sayi_dedektifi', 'ritim_labirent', 'geometri_eslestirme'
];
g2Diger.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g2_${key}`,
    type: 'grade_topic',
    grade: 2,
    topicKey: key,
    title: resolveTitle(key, 2),
    categoryLabel: '2. Sınıf Diğer Oyunlar'
  });
});

// 6. 3D Geometri Laboratuvarı
ALL_ACTIVITIES_LIST.push({
  id: 'g2_other_3dlab',
  type: '3d_lab',
  grade: 2,
  title: '3D Geometri Laboratuvarı',
  categoryLabel: '2. Sınıf Geometri'
});

// ==========================================
// 3. SINIF: Müfredat Sırasına Göre
// ==========================================
// Tema 1: Sayılar ve Nicelikler (1)
const g3Tema1 = [
  'g3_uc_basamakli_okuma_yazma',
  'g3_sayi_cozumleme',
  'g3_sayi_siralama_karsilastirma',
  'g3_en_yakin_onluga_yuvarlama_100',
  'g3_en_yakin_onluga_yuvarlama',
  'g3_en_yakin_yuzluge_yuvarlama',
  'g3_ritmik_6',
  'g3_ritmik_7',
  'g3_ritmik_8',
  'g3_ritmik_9',
  'g3_ritmik_10',
  'g3_ritmik_100',
  'g3_tek_cift_20ye_kadar_islemler',
  'g3_tek_cift_sayilar',
  'g3_sayi_sekil_oruntuleri',
  'g3_nesne_tahmin_karsilastirma'
];
g3Tema1.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g3_${key}`,
    type: 'grade_topic',
    grade: 3,
    topicKey: key,
    title: resolveTitle(key, 3),
    categoryLabel: '3. Sınıf Sayılar (1)'
  });
});

// Tema 2: Sayılar ve Nicelikler (2)
const g3Tema2 = [
  'g3_birim_kesirler',
  'g3_pay_payda_modelleme',
  'g3_payda_10_100_kesir',
  'g3_zaman_olcme',
  'g3_uzunluk_kutle_sivi',
  'g3_paralarimiz_lira_kurus'
];
g3Tema2.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g3_${key}`,
    type: 'grade_topic',
    grade: 3,
    topicKey: key,
    title: resolveTitle(key, 3),
    categoryLabel: '3. Sınıf Sayılar (2)'
  });
});

// Tema 3: İşlemlerden Cebirsel Düşünmeye
const g3Tema3 = [
  'g3_zihinden_toplama_cikarma_tahmin',
  'g3_toplama_cikarma_problemleri',
  'g3_carpma_bolme_pratik',
  'g3_verilmeyen_ogeyi_bulma'
];
g3Tema3.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g3_${key}`,
    type: 'grade_topic',
    grade: 3,
    topicKey: key,
    title: resolveTitle(key, 3),
    categoryLabel: '3. Sınıf İşlemler'
  });
});

// Tema 4: Nesnelerin Geometrisi ve Ölçme
const g3Tema4 = [
  'g3_geometrik_cisimler_ozellikleri',
  'g3_temel_geometri_kavramlari',
  'g3_cevre_ve_olculebilir_nitelikler'
];
g3Tema4.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g3_${key}`,
    type: 'grade_topic',
    grade: 3,
    topicKey: key,
    title: resolveTitle(key, 3),
    categoryLabel: '3. Sınıf Geometri'
  });
});

// 3. Sınıf Diğer Oyunlar
ALL_ACTIVITIES_LIST.push({
  id: 'g3_aynisini_bul',
  type: 'aynisini_bul',
  grade: 3,
  title: 'Aynısını Bul (2 Kişilik)',
  categoryLabel: '3. Sınıf Diğer Oyunlar'
});
const g3Diger = [
  'halat_toplama_3', 'halat_cikarma_3', 'halat_carpma_3', 'halat_bolme_3',
  'sureli_carpma_3', 'sureli_bolme_3', 'sureli_carpma_bolme', 'sureli_toplama_cikarma',
  'balon_patlatma_mat', 'matematik_hafiza', 'hizli_islem_carki', 'sayi_dedektifi', 'ritim_labirent', 'geometri_eslestirme'
];
g3Diger.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g3_${key}`,
    type: 'grade_topic',
    grade: 3,
    topicKey: key,
    title: resolveTitle(key, 3),
    categoryLabel: '3. Sınıf Diğer Oyunlar'
  });
});

// ==========================================
// 4. SINIF: Müfredat Sırasına Göre
// ==========================================
// Tema 1: Sayılar ve Nicelikler (1)
const g4Tema1 = [
  'g4_sayi_okuma_yazma',
  'g4_basamak_ve_cozumleme',
  'g4_sayi_siralama',
  'g4_en_yakin_onluk_yuzluk',
  'g4_ritmik_yuzer_biner',
  'g4_sayi_sekil_oruntuleri'
];
g4Tema1.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g4_${key}`,
    type: 'grade_topic',
    grade: 4,
    topicKey: key,
    title: resolveTitle(key, 4),
    categoryLabel: '4. Sınıf Sayılar (1)'
  });
});

// Tema 2: Sayılar ve Nicelikler (2)
const g4Tema2 = [
  'g4_kesir_cesitleri_modelleme',
  'g4_birim_kesirler_karsilastirma',
  'g4_paydalari_esit_kesir_islemleri',
  'g4_uzunluk_olculeri_donusum',
  'g4_kutle_olculeri_ton_kg_g'
];
g4Tema2.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g4_${key}`,
    type: 'grade_topic',
    grade: 4,
    topicKey: key,
    title: resolveTitle(key, 4),
    categoryLabel: '4. Sınıf Kesirler & Ölçme'
  });
});

// Tema 3: İşlemlerden Cebirsel Düşünmeye
const g4Tema3 = [
  'g4_dort_islem_toplama_cikarma',
  'g4_carpma_islemi_3basamakli',
  'g4_kisa_yoldan_carpma_5',
  'g4_kisa_yoldan_carpma_50',
  'g4_kisa_yoldan_carpma_25',
  'g4_bolme_islemi_4basamakli',
  'g4_zihinden_carpma_bolme_10_100_1000',
  'g4_esitlik_ve_verilmeyen_deger'
];
g4Tema3.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g4_${key}`,
    type: 'grade_topic',
    grade: 4,
    topicKey: key,
    title: resolveTitle(key, 4),
    categoryLabel: '4. Sınıf İşlemler'
  });
});

// Tema 4: Geometri, Veri ve Olasılık
const g4Tema4 = [
  'g4_geometrik_cisimler',
  'g4_cevre_uzunlugu',
  'g4_alan_tahmini_ve_birim_kare',
  'g4_dogru_isin_dogru_parcasi_acilar',
  'g4_simetri_dogrulari',
  'g4_sutun_grafigi_ve_tablolar',
  'g4_olaylarin_olasiligi'
];
g4Tema4.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g4_${key}`,
    type: 'grade_topic',
    grade: 4,
    topicKey: key,
    title: resolveTitle(key, 4),
    categoryLabel: '4. Sınıf Geometri & Veri'
  });
});

// 4. Sınıf Diğer Oyunlar
ALL_ACTIVITIES_LIST.push({
  id: 'g4_aynisini_bul',
  type: 'aynisini_bul',
  grade: 4,
  title: 'Aynısını Bul (2 Kişilik)',
  categoryLabel: '4. Sınıf Diğer Oyunlar'
});
const g4Diger = [
  'halat_toplama_4', 'halat_cikarma_4', 'halat_carpma_4', 'halat_bolme_4',
  'sureli_carpma_4', 'sureli_bolme_4', 'sureli_carpma_bolme', 'sureli_toplama_cikarma',
  'balon_patlatma_mat', 'matematik_hafiza', 'hizli_islem_carki', 'sayi_dedektifi', 'ritim_labirent', 'geometri_eslestirme'
];
g4Diger.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g4_${key}`,
    type: 'grade_topic',
    grade: 4,
    topicKey: key,
    title: resolveTitle(key, 4),
    categoryLabel: '4. Sınıf Diğer Oyunlar'
  });
});

// ==========================================
// GENEL DİĞER OYUNLAR & İNGİLİZCE
// ==========================================
ALL_ACTIVITIES_LIST.push({
  id: 'other_aynisini_bul',
  type: 'aynisini_bul',
  title: 'Aynısını Bul (2 Kişilik)',
  categoryLabel: 'Diğer Oyunlar'
});
ALL_ACTIVITIES_LIST.push({
  id: 'other_geoboard',
  type: 'geoboard',
  title: 'Geometri Tahtası',
  categoryLabel: 'Diğer Oyunlar'
});
ALL_ACTIVITIES_LIST.push({
  id: 'other_xox',
  type: 'xox',
  title: 'XOX & Zeka Düellosu',
  categoryLabel: 'Diğer Oyunlar'
});
ALL_ACTIVITIES_LIST.push({
  id: 'other_zit_anlam',
  type: 'word_game',
  wordGameType: 'zit_anlam',
  title: 'Zıt Anlamlı Kelimeler',
  categoryLabel: 'Diğer Oyunlar'
});
ALL_ACTIVITIES_LIST.push({
  id: 'other_es_anlam',
  type: 'word_game',
  wordGameType: 'es_anlam',
  title: 'Eş Anlamlı Kelimeler',
  categoryLabel: 'Diğer Oyunlar'
});
ALL_ACTIVITIES_LIST.push({
  id: 'other_ingilizce',
  type: 'word_game',
  wordGameType: 'ingilizce',
  title: 'İngilizce Kelime Oyunu',
  categoryLabel: 'İngilizce Oyunlar'
});

export const findActivityIndex = (
  type?: 'grade_topic' | '3d_lab' | 'xox' | 'word_game' | 'aynisini_bul' | 'geoboard',
  topicKey?: string,
  grade?: number | null,
  wordGameType?: 'zit_anlam' | 'es_anlam' | 'ingilizce' | null
): number => {
  if (type === 'word_game' && wordGameType) {
    const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.type === 'word_game' && a.wordGameType === wordGameType);
    if (idx !== -1) return idx;
  }
  if (type === 'xox') {
    const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.type === 'xox');
    if (idx !== -1) return idx;
  }
  if (type === '3d_lab') {
    const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.type === '3d_lab');
    if (idx !== -1) return idx;
  }
  if (type === 'aynisini_bul') {
    if (grade) {
      const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.type === 'aynisini_bul' && a.grade === grade);
      if (idx !== -1) return idx;
    }
    const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.type === 'aynisini_bul');
    if (idx !== -1) return idx;
  }
  if (type === 'geoboard' || topicKey === 'geometri_tahtasi') {
    if (grade) {
      const idx = ALL_ACTIVITIES_LIST.findIndex(a => (a.type === 'geoboard' || a.topicKey === 'geometri_tahtasi') && a.grade === grade);
      if (idx !== -1) return idx;
    }
    const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.type === 'geoboard');
    if (idx !== -1) return idx;
  }
  if (topicKey) {
    if (grade) {
      const idx = ALL_ACTIVITIES_LIST.findIndex(a => (a.topicKey === topicKey || a.id === `g${grade}_${topicKey}`) && a.grade === grade);
      if (idx !== -1) return idx;
    }
    const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.topicKey === topicKey || a.id === topicKey);
    if (idx !== -1) return idx;
  }
  return -1;
};
