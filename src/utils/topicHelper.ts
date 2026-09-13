import { topics1stGrade } from '../data/topics1stGrade';
import { topics2ndGrade } from '../data/topics2ndGrade';
import { topics3rdGrade } from '../data/topics3rdGrade';
import { topics4thGrade } from '../data/topics4thGrade';

// Special game/activity titles
const SPECIAL_TOPICS: Record<string, { title: string; desc?: string; icon?: string }> = {
  zit_anlam: { title: 'Zıt Anlamlı Kelimeler', desc: 'Kelimelerin zıt anlamlarını bulma', icon: '⚡' },
  es_anlam: { title: 'Eş Anlamlı Kelimeler', desc: 'Anlamdaş sözcükleri eşleştirme', icon: '🔄' },
  es_sesli: { title: 'Eş Sesli (Sesteş) Sözcükler', desc: 'Yazılışları aynı anlamları farklı sözcükler', icon: '📝' },
  ingilizce: { title: 'İngilizce Kelimeler', desc: 'Temel İngilizce sözcük çalışmaları', icon: '🌍' },
  ingilizce_kelimeler: { title: 'İngilizce Sözlük Oyunu', desc: 'Görseller ve İngilizce kelimeler', icon: '🇬🇧' },
  xox: { title: 'XOX Bilgi Düellosu', desc: 'Strateji ve hızlı soru çözümü', icon: '❌' },
  geoboard: { title: 'Geoboard Şekil Çizimi', desc: 'Geometrik şekiller ve alan hesapları', icon: '📐' },
  cisimler_acilimi: { title: 'Geometrik Cisimler Açılımı', desc: 'Küp, prizma, silindir ve koninin 3D katlanma ve açınım simülasyonu', icon: '🧊' },
  aynisini_bul: { title: 'Aynısını Bul Dikkat Oyunu', desc: 'Görsel eşleme ve hafıza', icon: '👀' },
  surukle_birak: { title: 'Sürükle Bırak Eşleştirme', desc: 'Kavram ve nesne eşleştirme', icon: '🎯' },
  tug_of_war: { title: 'Halat Çekmece Yarışı', desc: 'Hızlı cevapla halatı grubuna çek', icon: '🪢' },
  basketball: { title: 'Basketbol Yarışı', desc: 'Doğru cevapla basket at', icon: '🏀' }
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

  return Object.entries(source).map(([key, val]) => ({
    key,
    title: val.title,
    desc: val.desc,
    grade
  }));
}
