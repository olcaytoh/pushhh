import { topics1stGrade } from './topics1stGrade';
import { topics2ndGrade } from './topics2ndGrade';
import { topics3rdGrade } from './topics3rdGrade';
import { topics4thGrade } from './topics4thGrade';
import { halatCekmeTopics, sureliExtraTopics } from './halatCekmeTopics';

export interface ActivityRegistryItem {
  id: string;
  type: 'lesson_video' | 'grade_topic' | '3d_lab' | 'xox' | 'word_game' | 'aynisini_bul' | 'onu_bul' | 'yirmiyi_bul' | 'geoboard' | 'geometric_nets' | 'kuralli_cumle' | 'sozluk_sirala' | 'kelime_sirala' | 'hece_sayisi' | 'geometrik_sekilleri_bul' | 'hece_makasi' | 'yazim_dedektifi' | 'dedektif_5n1k' | 'satir_sonu_hece' | 'noktalama_avcisi' | 'harf_corbasi' | 'geri_donusum' | 'saglikli_tabak' | 'istek_ihtiyac' | 'mevsim_gardirobu' | 'abluka' | 'sudoku' | 'gorselli_sudoku' | 'school_life' | 'sivi_tahmin_akvaryum' | 'onluk_birlik' | 'sivi_olcme_video' | 'sayi_basketi' | 'saat_zaman' | 'market_kasasi' | 'kesir_duvari_pizza' | 'es_sesli' | 'denge_terazisi' | 'kodlama_mutfagi';
  grade?: 1 | 2 | 3 | 4;
  topicKey?: string;
  wordGameType?: 'zit_anlam' | 'es_anlam' | 'ingilizce';
  title: string;
  categoryLabel: string;
  /** Konu anlatım videosu (type: 'lesson_video') için video dosyası yolu */
  videoSrc?: string;
}

const resolveTitle = (key: string, grade?: number): string => {
  if (key === 'sayi_basketi') return 'Sayı Basketi';
  if (key === 'saglikli_aliskanliklar') return 'Sağlıklı Alışkanlıklar';
  if (key === 'cisimler_acilimi') return 'Geometrik Cisimler Açılımı';
  if (key === 'sivi_tahmin_akvaryum') return 'Sıvı Ölçme Tahmini';
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
  'geometri_tahtasi',
  'cisimler_acilimi'
];
g1Geometri.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g1_${key}`,
    type: key === 'geometri_tahtasi' ? 'geoboard' : key === 'cisimler_acilimi' ? 'geometric_nets' : 'grade_topic',
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

// 5. Diğer Oyunlar (1. Sınıf Mini Oyunları)
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
  'sivi_tahmin_akvaryum',
  'tartma_olcme',
  'cisimler_acilimi'
];
g2Geometri.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g2_${key}`,
    type: key === 'geometri_tahtasi' 
      ? 'geoboard' 
      : key === 'cisimler_acilimi' 
      ? 'geometric_nets' 
      : key === 'sivi_tahmin_akvaryum'
      ? 'sivi_tahmin_akvaryum'
      : 'grade_topic',
    grade: 2,
    topicKey: key,
    title: resolveTitle(key, 2),
    categoryLabel: '2. Sınıf Geometri'
  });
});

// 2. Sayılar ve Nicelikler
const g2Sayilar = [
  'nesne_sayisi',
  'sayi_basketi',
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
    type: key === 'sayi_basketi' ? 'sayi_basketi' : 'grade_topic',
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

// ==========================================
// 2. SINIF TÜRKÇE DERSİ ETKİNLİKLERİ
// ==========================================
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_noktalama_video',
  type: 'lesson_video',
  grade: 2,
  title: 'Noktalama İşaretleri',
  categoryLabel: '2. Sınıf Türkçe',
  videoSrc: '/noktalama_isaretleri.mp4'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_sozluk_sirala',
  type: 'sozluk_sirala',
  grade: 2,
  title: 'Sözlük Sıralama (Alfabe Portalı)',
  categoryLabel: '2. Sınıf Türkçe'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_kelime_sirala',
  type: 'kelime_sirala',
  grade: 2,
  title: 'Kelime Sıralama (Sözlük Sırası)',
  categoryLabel: '2. Sınıf Türkçe'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_zit_anlam',
  type: 'word_game',
  wordGameType: 'zit_anlam',
  grade: 2,
  title: 'Zıt Anlamlı Kelimeler',
  categoryLabel: '2. Sınıf Türkçe'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_es_anlam',
  type: 'word_game',
  wordGameType: 'es_anlam',
  grade: 2,
  title: 'Eş Anlamlı Kelimeler',
  categoryLabel: '2. Sınıf Türkçe'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_kuralli_cumle',
  type: 'kuralli_cumle',
  grade: 2,
  title: 'Kurallı Cümle Oluşturma',
  categoryLabel: '2. Sınıf Türkçe'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_hece_sayisi',
  type: 'hece_sayisi',
  grade: 2,
  title: 'Kelimelerin Hece Sayısını Belirleme',
  categoryLabel: '2. Sınıf Türkçe'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_hece_makasi',
  type: 'hece_makasi',
  grade: 2,
  title: 'Hece Makası (Hecelere Ayırma)',
  categoryLabel: '2. Sınıf Türkçe'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_yazim_dedektifi',
  type: 'yazim_dedektifi',
  grade: 2,
  title: 'Yazım Yanlışı Dedektifi',
  categoryLabel: '2. Sınıf Türkçe'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_dedektif_5n1k',
  type: 'dedektif_5n1k',
  grade: 2,
  title: '5N 1K Dedektifi',
  categoryLabel: '2. Sınıf Türkçe'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_satir_sonu_hece',
  type: 'satir_sonu_hece',
  grade: 2,
  title: 'Satır Sonu Hece Ayırma',
  categoryLabel: '2. Sınıf Türkçe'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_karar_alma_video',
  type: 'lesson_video',
  topicKey: 'karar_alma',
  grade: 2,
  title: 'Karar Alma Süreci',
  categoryLabel: '2. Sınıf Türkçe',
  videoSrc: '/karar_alma_sunum.mp4'
});
ALL_ACTIVITIES_LIST.push({
  id: 'g2_turkce_saglikli_aliskanliklar_video',
  type: 'lesson_video',
  topicKey: 'saglikli_aliskanliklar',
  grade: 2,
  title: 'Sağlıklı Alışkanlıklar',
  categoryLabel: '2. Sınıf Türkçe',
  videoSrc: '/saglikli_aliskanliklar_tanitim.mp4'
});

// 5. Diğer Oyunlar (2. Sınıf Mini Oyunları)
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
  'g3_cevre_ve_olculebilir_nitelikler',
  'cisimler_acilimi'
];
g3Tema4.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g3_${key}`,
    type: key === 'cisimler_acilimi' ? 'geometric_nets' : 'grade_topic',
    grade: 3,
    topicKey: key,
    title: resolveTitle(key, 3),
    categoryLabel: '3. Sınıf Geometri'
  });
});

// 5. Diğer Oyunlar (3. Sınıf Mini Oyunları)
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
  'g4_olaylarin_olasiligi',
  'cisimler_acilimi'
];
g4Tema4.forEach(key => {
  ALL_ACTIVITIES_LIST.push({
    id: `g4_${key}`,
    type: key === 'cisimler_acilimi' ? 'geometric_nets' : 'grade_topic',
    grade: 4,
    topicKey: key,
    title: resolveTitle(key, 4),
    categoryLabel: '4. Sınıf Geometri & Veri'
  });
});

// 5. Diğer Oyunlar (4. Sınıf Mini Oyunları)
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
// GENEL DİĞER OYUNLAR & İNGİLİZCE (Tüm Hub Listesi - 20 Özel Oyun Sıralı)
// ==========================================
export const OTHER_GAMES_HUB_LIST: ActivityRegistryItem[] = [
  {
    id: 'other_kodlama_mutfagi',
    type: 'kodlama_mutfagi',
    title: 'Kodlama & Algoritma Mutfağı',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_sozluk_sirala',
    type: 'sozluk_sirala',
    title: 'Sözlük Sıralama (Alfabe Portalı)',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_kelime_sirala',
    type: 'kelime_sirala',
    title: 'Kelime Sıralama (Sözlük Sırası)',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_hece_makasi',
    type: 'hece_makasi',
    title: 'Hece Makası (Hecelere Ayırma)',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_yazim_dedektifi',
    type: 'yazim_dedektifi',
    title: 'Yazım Yanlışı Dedektifi',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_aynisini_bul',
    type: 'aynisini_bul',
    title: 'Aynısını Bul (2 Kişilik)',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_onu_bul',
    type: 'onu_bul',
    title: "10'u Bul (2 Kişilik)",
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_yirmiyi_bul',
    type: 'yirmiyi_bul',
    title: "20'yi Bul (2 Kişilik)",
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_xox',
    type: 'xox',
    title: 'XOX & Zeka Düellosu',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_zit_anlam',
    type: 'word_game',
    wordGameType: 'zit_anlam',
    title: 'Zıt Anlamlı Kelimeler',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_es_anlam',
    type: 'word_game',
    wordGameType: 'es_anlam',
    title: 'Eş Anlamlı Kelimeler',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_3d_lab',
    type: '3d_lab',
    title: '3D Geometri & Şekil Laboratuvarı',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_geoboard',
    type: 'geoboard',
    title: 'Geometri Tahtası',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_cisimler_acilimi',
    type: 'geometric_nets',
    title: 'Geometrik Cisimler Açılımı',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_kuralli_cumle',
    type: 'kuralli_cumle',
    title: 'Kurallı Cümle Oluştur',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_geometrik_sekilleri_bul',
    type: 'geometrik_sekilleri_bul',
    title: 'Geometrik Cisimleri Bul',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_dedektif_5n1k',
    type: 'dedektif_5n1k',
    title: '5N 1K Dedektifi',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_satir_sonu_hece',
    type: 'satir_sonu_hece',
    title: 'Satır Sonu Hece Ayırma',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_noktalama_avcisi',
    type: 'noktalama_avcisi',
    title: 'Noktalama İşareti Avcısı',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_harf_corbasi',
    type: 'harf_corbasi',
    title: 'Harf Çorbası / Anagram',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_geri_donusum',
    type: 'geri_donusum',
    title: 'Geri Dönüşüm Kahramanı (Doğada Hayat)',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_saglikli_tabak',
    type: 'saglikli_tabak',
    title: 'Sağlıklı Tabak Şefi',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_istek_ihtiyac',
    type: 'istek_ihtiyac',
    title: 'İstek mi, İhtiyaç mı?',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_mevsim_gardirobu',
    type: 'mevsim_gardirobu',
    title: 'Mevsim Gardırobu',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_abluka',
    type: 'abluka',
    title: 'Abluka Zeka Oyunu',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_gorselli_sudoku',
    type: 'gorselli_sudoku',
    title: '2 Kişilik Görselli Sudoku (4x4 & 6x6)',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_sudoku',
    type: 'sudoku',
    title: 'Sudoku Zeka Oyunu (4x4 & 6x6)',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_sivi_tahmin_akvaryum',
    type: 'sivi_tahmin_akvaryum',
    title: 'Sıvı Ölçme Tahmini (Akvaryum & Kova & Sürahi)',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_saat_zaman',
    type: 'saat_zaman',
    title: 'İnteraktif Saat & Zaman Laboratuvarı',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_market_kasasi',
    type: 'market_kasasi',
    title: 'Bakkal & Market Kasası (Paralarımız)',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_kesir_duvari_pizza',
    type: 'kesir_duvari_pizza',
    title: 'Kesir Duvarı & Pizza Dilimleme',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_es_sesli',
    type: 'es_sesli',
    title: 'Eş Sesli (Sesteş) Kelimeler Dedektifi',
    categoryLabel: 'Diğer Oyunlar'
  },
  {
    id: 'other_denge_terazisi',
    type: 'denge_terazisi',
    title: 'Eşit Kollu Denge Terazisi (Tartma & Kütle)',
    categoryLabel: 'Diğer Oyunlar'
  }
];

OTHER_GAMES_HUB_LIST.forEach(item => ALL_ACTIVITIES_LIST.push(item));

ALL_ACTIVITIES_LIST.push({
  id: 'other_ingilizce',
  type: 'word_game',
  wordGameType: 'ingilizce',
  title: 'İngilizce Kelime Oyunu',
  categoryLabel: 'İngilizce Oyunlar'
});

ALL_ACTIVITIES_LIST.push({
  id: 'english_school_life',
  type: 'school_life',
  title: 'School Life (Okul Hayatı)',
  categoryLabel: 'İngilizce Oyunlar'
});

export const getGradeOtherGamesList = (grade: 1 | 2 | 3 | 4): ActivityRegistryItem[] => {
  let topicKeys: string[] = [];
  if (grade === 1) {
    topicKeys = [
      'halat_toplama_1', 'halat_cikarma_1',
      'sureli_toplama_cikarma', 'sureli_on_tamamlama',
      'balon_patlatma_mat', 'matematik_hafiza', 'hizli_islem_carki', 'sayi_dedektifi', 'ritim_labirent', 'geometri_eslestirme'
    ];
  } else if (grade === 2) {
    topicKeys = [
      'halat_toplama_2', 'halat_cikarma_2', 'halat_carpma_2', 'halat_bolme_2',
      'sureli_toplama_cikarma', 'sureli_carpma_bolme',
      'balon_patlatma_mat', 'matematik_hafiza', 'hizli_islem_carki', 'sayi_dedektifi', 'ritim_labirent', 'geometri_eslestirme'
    ];
  } else if (grade === 3) {
    topicKeys = [
      'halat_toplama_3', 'halat_cikarma_3', 'halat_carpma_3', 'halat_bolme_3',
      'sureli_carpma_3', 'sureli_bolme_3', 'sureli_carpma_bolme', 'sureli_toplama_cikarma',
      'balon_patlatma_mat', 'matematik_hafiza', 'hizli_islem_carki', 'sayi_dedektifi', 'ritim_labirent', 'geometri_eslestirme'
    ];
  } else {
    topicKeys = [
      'halat_toplama_4', 'halat_cikarma_4', 'halat_carpma_4', 'halat_bolme_4',
      'sureli_carpma_4', 'sureli_bolme_4', 'sureli_carpma_bolme', 'sureli_toplama_cikarma',
      'balon_patlatma_mat', 'matematik_hafiza', 'hizli_islem_carki', 'sayi_dedektifi', 'ritim_labirent', 'geometri_eslestirme'
    ];
  }

  const topicItems: ActivityRegistryItem[] = topicKeys.map(key => ({
    id: `g${grade}_${key}`,
    type: 'grade_topic',
    grade,
    topicKey: key,
    title: resolveTitle(key, grade),
    categoryLabel: `${grade}. Sınıf Diğer Oyunlar`
  }));

  return topicItems;
};

export const findActivityIndex = (
  type?: ActivityRegistryItem['type'],
  topicKey?: string,
  grade?: number | null,
  wordGameType?: 'zit_anlam' | 'es_anlam' | 'ingilizce' | null,
  preferOtherHub?: boolean
): number => {
  if (preferOtherHub) {
    if (wordGameType) {
      const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.id.startsWith('other_') && a.type === 'word_game' && a.wordGameType === wordGameType);
      if (idx !== -1) return idx;
    }
    if (topicKey) {
      const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.id.startsWith('other_') && (a.topicKey === topicKey || a.id === `other_${topicKey}` || a.id.includes(topicKey)));
      if (idx !== -1) return idx;
    }
    if (type) {
      const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.id.startsWith('other_') && a.type === type);
      if (idx !== -1) return idx;
    }
  }

  // If grade is specified (1, 2, 3, 4), strictly look within that grade first!
  if (grade) {
    if (wordGameType) {
      const wgIdx = ALL_ACTIVITIES_LIST.findIndex(a => a.grade === grade && a.wordGameType === wordGameType);
      if (wgIdx !== -1) return wgIdx;
    }

    if (topicKey) {
      // 1. Exact match by topicKey & grade
      const exactIdx = ALL_ACTIVITIES_LIST.findIndex(a => a.grade === grade && a.topicKey === topicKey);
      if (exactIdx !== -1) return exactIdx;

      // 2. Exact match by generated id (e.g. g2_kesirler)
      const idIdx = ALL_ACTIVITIES_LIST.findIndex(a => a.grade === grade && (a.id === `g${grade}_${topicKey}` || a.id === topicKey));
      if (idIdx !== -1) return idIdx;

      // 3. Partial match inside the same grade
      const partialIdx = ALL_ACTIVITIES_LIST.findIndex(a => a.grade === grade && (a.id.includes(topicKey) || (a.topicKey && a.topicKey.includes(topicKey))));
      if (partialIdx !== -1) return partialIdx;
    }

    if (type) {
      const typeIdx = ALL_ACTIVITIES_LIST.findIndex(a => a.grade === grade && a.type === type);
      if (typeIdx !== -1) return typeIdx;
    }
  }

  // Special topic mappings fallback (when no grade was matched or grade is null)
  if (wordGameType) {
    const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.type === 'word_game' && a.wordGameType === wordGameType && (!grade || a.grade === grade));
    if (idx !== -1) return idx;
  }

  if (topicKey) {
    const idx = ALL_ACTIVITIES_LIST.findIndex(a => (a.topicKey === topicKey || a.id === topicKey || a.id.includes(topicKey)) && (!grade || a.grade === grade));
    if (idx !== -1) return idx;
  }

  if (type) {
    const idx = ALL_ACTIVITIES_LIST.findIndex(a => a.type === type && (!grade || a.grade === grade));
    if (idx !== -1) return idx;
  }

  return 0;
};