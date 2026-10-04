import { topics1stGrade } from '../data/topics1stGrade';
import { topics2ndGrade } from '../data/topics2ndGrade';
import { topics3rdGrade } from '../data/topics3rdGrade';
import { topics4thGrade } from '../data/topics4thGrade';

// Special game/activity titles
const SPECIAL_TOPICS: Record<string, { title: string; desc?: string; icon?: string }> = {
  zit_anlam: { title: 'Zıt Anlamlı Kelimeler', desc: 'Kelimelerin zıt anlamlarını bulma', icon: '⚡' },
  turkce_zit_anlam: { title: 'Zıt Anlamlı Kelimeler', desc: 'Kelimelerin zıt anlamlarını bulma', icon: '⚡' },
  es_anlam: { title: 'Eş Anlamlı Kelimeler', desc: 'Anlamdaş sözcükleri eşleştirme', icon: '🔄' },
  turkce_es_anlam: { title: 'Eş Anlamlı Kelimeler', desc: 'Anlamdaş sözcükleri eşleştirme', icon: '🔄' },
  turkce_sozcuk_sirala: { title: 'Sözlük Sıralama (Harf Sıralaması)', desc: 'Harfleri alfabetik sıraya dizme portalı', icon: '🔤' },
  turkce_sozluk_sirala: { title: 'Sözlük Sıralama (Harf Sıralaması)', desc: 'Harfleri alfabetik sıraya dizme portalı', icon: '🔤' },
  sozluk_sirala: { title: 'Sözlük Sıralama (Harf Sıralaması)', desc: 'Harfleri alfabetik sıraya dizme portalı', icon: '🔤' },
  turkce_kelime_sirala: { title: 'Kelime Sıralama (Sözlük Sırası)', desc: 'Kelimeleri sözlük sırasına dizme portalı', icon: '📚' },
  kelime_sirala: { title: 'Kelime Sıralama (Sözlük Sırası)', desc: 'Kelimeleri sözlük sırasına dizme portalı', icon: '📚' },
  turkce_kuralli_cumle: { title: 'Kurallı Cümle Oluşturma', desc: 'Kelimelerle anlamlı ve kurallı cümle kurma treni', icon: '🚂' },
  kuralli_cumle: { title: 'Kurallı Cümle Oluşturma', desc: 'Kelimelerle anlamlı ve kurallı cümle kurma treni', icon: '🚂' },
  turkce_hece_sayisi: { title: 'Kelimelerin Hece Sayısı', desc: 'Kelimelerin hece sayısını belirleme & sesli harf analizi', icon: '🗣️' },
  hece_sayisi: { title: 'Kelimelerin Hece Sayısı', desc: 'Kelimelerin hece sayısını belirleme & sesli harf analizi', icon: '🗣️' },
  turkce_hece_makasi: { title: 'Hece Makası (Hecelere Ayırma)', desc: 'Sözcükleri heceleme çizgilerinden doğru kesme', icon: '✂️' },
  hece_makasi: { title: 'Hece Makası (Hecelere Ayırma)', desc: 'Sözcükleri heceleme çizgilerinden doğru kesme', icon: '✂️' },
  turkce_yazim_dedektifi: { title: 'Yazım Yanlışı Dedektifi', desc: 'Cümledeki yazım ve imla hatalarını keşfetme', icon: '🔍' },
  yazim_dedektifi: { title: 'Yazım Yanlışı Dedektifi', desc: 'Cümledeki yazım ve imla hatalarını keşfetme', icon: '🔍' },
  dedektif_5n1k: { title: '5N1K Dedektifi', desc: 'Ne, Nerede, Ne Zaman, Nasıl, Neden, Kim sorularını çözme', icon: '🕵️' },
  turkce_5n1k: { title: '5N1K Dedektifi', desc: 'Ne, Nerede, Ne Zaman, Nasıl, Neden, Kim sorularını çözme', icon: '🕵️' },
  noktalama_avcisi: { title: 'Noktalama İşaretleri Avcısı', desc: 'Nokta, virgül, soru ve ünlem işaretlerini tamamlama', icon: '🎯' },
  turkce_noktalama: { title: 'Noktalama İşaretleri Avcısı', desc: 'Nokta, virgül, soru ve ünlem işaretlerini tamamlama', icon: '🎯' },
  harf_corbasi: { title: 'Harf Çorbası (Anagram Kelime)', desc: 'Karışık harflerden anlamlı kelime türetme', icon: '🍲' },
  turkce_harf_corbasi: { title: 'Harf Çorbası (Anagram Kelime)', desc: 'Karışık harflerden anlamlı kelime türetme', icon: '🍲' },
  geometrik_sekilleri_bul: { title: 'Geometrik Cisimleri Bul', desc: 'Günlük hayat nesnelerini geometrik cisimlerle eşleştirme', icon: '🔷' },
  saglikli_tabak: { title: 'Sağlıklı Tabak (Dengeli Beslenme)', desc: 'Yararlı ve zararlı besinleri ayırt etme', icon: '🥗' },
  geri_donusum: { title: 'Geri Dönüşüm Kahramanı', desc: 'Atıkları cam, plastik, kağıt ve metal kutularına ayırma', icon: '♻️' },
  istek_ihtiyac: { title: 'İstek mi, İhtiyaç mı?', desc: 'Zorunlu ihtiyaçlar ile keyifli istekleri ayırt etme', icon: '💡' },
  mevsim_gardirobu: { title: 'Mevsim Gardırobu', desc: 'Hava durumuna ve mevsime uygun giysileri seçme', icon: '🧥' },
  aynisini_bul: { title: 'Aynısını Bul Dikkat Düellosu', desc: 'Kartlar arasındaki ortak nesneyi ilk bulan kazanır', icon: '👀' },
  onu_bul: { title: '10\'u Bul Matematik Düellosu', desc: 'Toplamı 10 yapan sayı çiftlerini hızlıca keşfet', icon: '🔟' },
  yirmiyi_bul: { title: '20\'yi Bul Matematik Düellosu', desc: 'Toplamı 20 yapan sayı çiftlerini hızlıca keşfet', icon: '🔢' },
  es_sesli: { title: 'Eş Sesli (Sesteş) Sözcükler', desc: 'Yazılışları aynı anlamları farklı sözcükler', icon: '📝' },
  ingilizce: { title: 'İngilizce Kelimeler', desc: 'Temel İngilizce sözcük çalışmaları & quiz', icon: '🌍' },
  ingilizce_kelimeler: { title: 'İngilizce Sözlük Oyunu', desc: 'Görseller ve İngilizce kelimeler', icon: '🇬🇧' },
  xox: { title: 'XOX Bilgi Düellosu', desc: 'Strateji ve hızlı soru çözümü', icon: '❌' },
  geoboard: { title: 'Geoboard Şekil Çizimi', desc: 'Geometrik şekiller ve alan hesapları', icon: '📐' },
  geometric_nets: { title: 'Geometrik Cisimler Açılımı', desc: 'Küp, prizma, silindir ve koninin 3D açınım simülasyonu', icon: '🧊' },
  cisimler_acilimi: { title: 'Geometrik Cisimler Açılımı', desc: 'Küp, prizma, silindir ve koninin 3D açınım simülasyonu', icon: '🧊' },
  surukle_birak: { title: 'Sürükle Bırak Eşleştirme', desc: 'Kavram ve nesne eşleştirme', icon: '🎯' },
  tug_of_war: { title: 'Halat Çekmece Yarışı', desc: 'Hızlı cevapla halatı grubuna çek', icon: '🪢' },
  basketball: { title: 'Basketbol Yarışı', desc: 'Doğru cevapla basket at', icon: '🏀' },
  abluka: { title: 'Abluka Strateji Oyunu', desc: 'Hedefi çevreleme ve abluka kurma zeka oyunu', icon: '🛡️' }
};

export interface TopicInfo {
  key: string;
  title: string;
  desc?: string;
  grade?: number;
}

/**
 * Returns a human-friendly title and description for any topic key.
 */
export function getTopicInfo(topicKey: string, grade?: number): TopicInfo {
  if (SPECIAL_TOPICS[topicKey]) {
    return {
      key: topicKey,
      title: SPECIAL_TOPICS[topicKey].title,
      desc: SPECIAL_TOPICS[topicKey].desc,
      grade
    };
  }

  // Check grade-specific topic collections
  if (grade === 1 && topics1stGrade[topicKey]) {
    return { key: topicKey, title: topics1stGrade[topicKey].title, desc: topics1stGrade[topicKey].desc, grade: 1 };
  }
  if (grade === 2 && topics2ndGrade[topicKey]) {
    return { key: topicKey, title: topics2ndGrade[topicKey].title, desc: topics2ndGrade[topicKey].desc, grade: 2 };
  }
  if (grade === 3 && topics3rdGrade[topicKey]) {
    return { key: topicKey, title: topics3rdGrade[topicKey].title, desc: topics3rdGrade[topicKey].desc, grade: 3 };
  }
  if (grade === 4 && topics4thGrade[topicKey]) {
    return { key: topicKey, title: topics4thGrade[topicKey].title, desc: topics4thGrade[topicKey].desc, grade: 4 };
  }

  // If not found by specific grade, search across all grades
  if (topics2ndGrade[topicKey]) {
    return { key: topicKey, title: topics2ndGrade[topicKey].title, desc: topics2ndGrade[topicKey].desc, grade: 2 };
  }
  if (topics1stGrade[topicKey]) {
    return { key: topicKey, title: topics1stGrade[topicKey].title, desc: topics1stGrade[topicKey].desc, grade: 1 };
  }
  if (topics3rdGrade[topicKey]) {
    return { key: topicKey, title: topics3rdGrade[topicKey].title, desc: topics3rdGrade[topicKey].desc, grade: 3 };
  }
  if (topics4thGrade[topicKey]) {
    return { key: topicKey, title: topics4thGrade[topicKey].title, desc: topics4thGrade[topicKey].desc, grade: 4 };
  }

  // Fallback: format snake_case to Title Case Turkish
  const formatted = topicKey
    .replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR'))
    .join(' ');

  return { key: topicKey, title: formatted, grade };
}

/**
 * Returns all curriculum topics for a specific grade level.
 */
export function getCurriculumTopicsForGrade(grade: number): TopicInfo[] {
  let source: Record<string, { title: string; desc: string }> = {};
  if (grade === 1) source = topics1stGrade;
  else if (grade === 2) source = topics2ndGrade;
  else if (grade === 3) source = topics3rdGrade;
  else if (grade === 4) source = topics4thGrade;
  else source = topics2ndGrade;

  const list: TopicInfo[] = Object.entries(source).map(([key, val]) => ({
    key,
    title: val.title,
    desc: val.desc,
    grade
  }));

  const commonInteractiveTopics: TopicInfo[] = [
    { key: 'turkce_sozluk_sirala', title: 'Sözlük Sıralama (Harf Sıralaması)', desc: 'Harfleri alfabetik sıraya dizme portalı', grade },
    { key: 'turkce_kelime_sirala', title: 'Kelime Sıralama (Sözlük Sırası)', desc: 'Kelimeleri sözlük sırasına dizme portalı', grade },
    { key: 'turkce_zit_anlam', title: 'Zıt Anlamlı Kelimeler', desc: 'Kelimelerin zıt anlamlarını bulma', grade },
    { key: 'turkce_es_anlam', title: 'Eş Anlamlı Kelimeler', desc: 'Anlamdaş sözcükleri eşleştirme', grade },
    { key: 'turkce_kuralli_cumle', title: 'Kurallı Cümle Oluşturma', desc: 'Kelimelerle anlamlı ve kurallı cümle kurma treni', grade },
    { key: 'turkce_hece_sayisi', title: 'Kelimelerin Hece Sayısı', desc: 'Kelimelerin hece sayısını belirleme & sesli harf analizi', grade },
    { key: 'turkce_hece_makasi', title: 'Hece Makası (Hecelere Ayırma)', desc: 'Sözcükleri heceleme çizgilerinden doğru kesme', grade },
    { key: 'turkce_yazim_dedektifi', title: 'Yazım Yanlışı Dedektifi', desc: 'Cümledeki yazım ve imla hatalarını keşfetme', grade },
    { key: 'dedektif_5n1k', title: '5N1K Dedektifi', desc: 'Ne, Nerede, Ne Zaman, Nasıl, Neden, Kim sorularını çözme', grade },
    { key: 'noktalama_avcisi', title: 'Noktalama İşaretleri Avcısı', desc: 'Nokta, virgül, soru ve ünlem işaretlerini tamamlama', grade },
    { key: 'harf_corbasi', title: 'Harf Çorbası (Anagram Kelime)', desc: 'Karışık harflerden anlamlı kelime türetme', grade },
    { key: 'geometrik_sekilleri_bul', title: 'Geometrik Cisimleri Bul', desc: 'Günlük hayat nesnelerini geometrik cisimlerle eşleştirme', grade },
    { key: 'saglikli_tabak', title: 'Sağlıklı Tabak (Dengeli Beslenme)', desc: 'Yararlı ve zararlı besinleri ayırt etme', grade },
    { key: 'geri_donusum', title: 'Geri Dönüşüm Kahramanı', desc: 'Atıkları cam, plastik, kağıt ve metal kutularına ayırma', grade },
    { key: 'istek_ihtiyac', title: 'İstek mi, İhtiyaç mı?', desc: 'Zorunlu ihtiyaçlar ile keyifli istekleri ayırt etme', grade },
    { key: 'mevsim_gardirobu', title: 'Mevsim Gardırobu', desc: 'Hava durumuna ve mevsime uygun giysileri seçme', grade },
    { key: 'aynisini_bul', title: 'Aynısını Bul Dikkat Düellosu', desc: 'Kartlar arasındaki ortak nesneyi ilk bulan kazanır', grade },
    { key: 'onu_bul', title: '10\'u Bul Matematik Düellosu', desc: 'Toplamı 10 yapan sayı çiftlerini hızlıca keşfet', grade },
    { key: 'yirmiyi_bul', title: '20\'yi Bul Matematik Düellosu', desc: 'Toplamı 20 yapan sayı çiftlerini hızlıca keşfet', grade },
    { key: 'ingilizce', title: 'İngilizce Kelimeler', desc: 'Temel İngilizce sözcük çalışmaları & quiz', grade },
  ];

  commonInteractiveTopics.forEach(t => {
    if (!list.some(item => item.key === t.key)) {
      list.push(t);
    }
  });

  return list;
}
