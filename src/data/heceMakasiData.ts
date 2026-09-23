export interface HeceWord {
  id: string;
  word: string;
  syllables: string[];
  cutIndices: number[]; // Index in word string after which a cut is valid (0-based)
  hint: string;
  category: string;
  syllableCount: number;
}

const buildHeceWord = (
  id: string,
  word: string,
  syllables: string[],
  hint: string,
  category: string
): HeceWord => {
  const cutIndices: number[] = [];
  let cumulative = 0;
  for (let i = 0; i < syllables.length - 1; i++) {
    cumulative += syllables[i].length;
    cutIndices.push(cumulative - 1);
  }

  return {
    id,
    word: word.toUpperCase(),
    syllables: syllables.map(s => s.toUpperCase()),
    cutIndices,
    hint,
    category,
    syllableCount: syllables.length
  };
};

export const HECE_MAKASI_WORDS: HeceWord[] = [
  // 2 HECELİ KELİMELER (Kolay - Başlangıç Seviyesi)
  buildHeceWord('hm_1', 'KEDİ', ['KE', 'Dİ'], 'Miyavlayan sevimli dostumuz 🐱', 'Hayvanlar'),
  buildHeceWord('hm_2', 'KÖPEK', ['KÖ', 'PEK'], 'Sadık ve koruyucu evcil hayvan 🐶', 'Hayvanlar'),
  buildHeceWord('hm_3', 'ASLAN', ['AS', 'LAN'], 'Ormanların güçlü kralı 🦁', 'Hayvanlar'),
  buildHeceWord('hm_4', 'KAPLAN', ['KAP', 'LAN'], 'Çizgili ve hızlı yırtıcı 🐯', 'Hayvanlar'),
  buildHeceWord('hm_5', 'TAVŞAN', ['TAV', 'ŞAN'], 'Havuç seven uzun kulaklı 🐰', 'Hayvanlar'),
  buildHeceWord('hm_6', 'ELMA', ['EL', 'MA'], 'Kırmızı, tatlı ve sulu meyve 🍎', 'Meyveler'),
  buildHeceWord('hm_7', 'ARMUT', ['AR', 'MUT'], 'Sarı renkli lezzetli kış meyvesi 🍐', 'Meyveler'),
  buildHeceWord('hm_8', 'ÇİLEK', ['Çİ', 'LEK'], 'Küçük, kırmızı ve mis kokulu meyve 🍓', 'Meyveler'),
  buildHeceWord('hm_9', 'KİRAZ', ['Kİ', 'RAZ'], 'Çift kulaklı dalında parlayan meyve 🍒', 'Meyveler'),
  buildHeceWord('hm_10', 'LİMON', ['Lİ', 'MON'], 'Ekşi ve sarı C vitamini deposu 🍋', 'Meyveler'),
  buildHeceWord('hm_11', 'KALEM', ['KA', 'LEM'], 'Yazı yazmamızı sağlayan araç ✏️', 'Okul'),
  buildHeceWord('hm_12', 'DEFTER', ['DEF', 'TER'], 'Üzerine not aldığımız sayfalar 📓', 'Okul'),
  buildHeceWord('hm_13', 'SİLGİ', ['SİL', 'Gİ'], 'Hatalı yazıları temizleyen gereç 🧼', 'Okul'),
  buildHeceWord('hm_14', 'ÇANTA', ['ÇAN', 'TA'], 'Kitaplarımızı taşıdığımız eşya 🎒', 'Okul'),
  buildHeceWord('hm_15', 'SINIF', ['SI', 'NIF'], 'Ders işlediğimiz oda 🏫', 'Okul'),
  buildHeceWord('hm_16', 'GÜNEŞ', ['GÜ', 'NEŞ'], 'Dünyamızı ısıtan ve aydınlatan yıldız ☀️', 'Doğa'),
  buildHeceWord('hm_17', 'BULUT', ['BU', 'LUT'], 'Gökyüzünde pamuk gibi süzülen ☁️', 'Doğa'),
  buildHeceWord('hm_18', 'YAĞMUR', ['YAĞ', 'MUR'], 'Bulutlardan düşen bereketli damlalar 🌧️', 'Doğa'),
  buildHeceWord('hm_19', 'RÜZGAR', ['RÜZ', 'GAR'], 'Ağaçların yapraklarını sallayan esinti 💨', 'Doğa'),
  buildHeceWord('hm_20', 'YILDIZ', ['YIL', 'DIZ'], 'Geceleri gökyüzünde ışıldayan 🌟', 'Doğa'),

  // 3 HECELİ KELİMELER (Orta Seviye - 2. Sınıf Ana Kazanım)
  buildHeceWord('hm_21', 'KELEBEK', ['KE', 'LE', 'BEK'], 'Rengarenk kanatlarıyla uçan böcek 🦋', 'Hayvanlar'),
  buildHeceWord('hm_22', 'ZÜRAFA', ['ZÜ', 'RA', 'FA'], 'Uzun boynuyla ağaç yapraklarını yiyen 🦒', 'Hayvanlar'),
  buildHeceWord('hm_23', 'KAPLUMBAĞA', ['KAP', 'LUM', 'BA'], 'Sırtında evini taşıyan yavaş hayvan 🐢', 'Hayvanlar'),
  buildHeceWord('hm_24', 'PAPATYA', ['PA', 'PAT', 'YA'], 'Beyaz yapraklı, sarı göbekli kır çiçeği 🌼', 'Doğa'),
  buildHeceWord('hm_25', 'GÖKKUŞAĞI', ['GÖK', 'KU', 'ŞAĞ'], 'Yağmurdan sonra beliren yedi renk 🌈', 'Doğa'),
  buildHeceWord('hm_26', 'PORTAKAL', ['POR', 'TA', 'KAL'], 'Turuncu ve sulu kış meyvesi 🍊', 'Meyveler'),
  buildHeceWord('hm_27', 'MANDALİNA', ['MAN', 'DA', 'LİN'], 'Kabuğu kolay soyulan tatlı kış meyvesi 🍊', 'Meyveler'),
  buildHeceWord('hm_28', 'DOMATES', ['DO', 'MA', 'TES'], 'Salataların vazgeçilmezi kırmızı sebze 🍅', 'Sebzeler'),
  buildHeceWord('hm_29', 'PATATES', ['PA', 'TA', 'TES'], 'Toprak altında yetişen kızartması sevilen sebze 🥔', 'Sebzeler'),
  buildHeceWord('hm_30', 'ÖĞRENCİ', ['ÖĞ', 'REN', 'Cİ'], 'Okulda bilgi öğrenen çocuk 👦', 'Okul'),
  buildHeceWord('hm_31', 'ÖĞRETMEN', ['ÖĞ', 'RET', 'MEN'], 'Bize okumayı ve yazmayı öğreten 👩‍🏫', 'Okul'),
  buildHeceWord('hm_32', 'KİTAPLIK', ['Kİ', 'TAP', 'LIK'], 'Kitaplarımızı düzenli dizdiğimiz dolap 📚', 'Okul'),
  buildHeceWord('hm_33', 'PENCERE', ['PEN', 'CE', 'RE'], 'Odamıza ışık ve temiz hava veren açıklık 🪟', 'Ev Eşyası'),
  buildHeceWord('hm_34', 'SANDALYE', ['SAN', 'DAL', 'YE'], 'Üzerine oturduğumuz ayaklı eşya 🪑', 'Ev Eşyası'),
  buildHeceWord('hm_35', 'TELEFON', ['TE', 'LE', 'FON'], 'Uzaklardaki sevdiklerimizle konuştuğumuz cihaz 📱', 'Teknoloji'),
  buildHeceWord('hm_36', 'ARABA', ['A', 'RA', 'BA'], 'Dört tekerlekli karayolu taşıtı 🚗', 'Taşıtlar'),
  buildHeceWord('hm_37', 'OTOBÜS', ['O', 'TO', 'BÜS'], 'Çok sayıda yolcu taşıyan büyük araç 🚌', 'Taşıtlar'),
  buildHeceWord('hm_38', 'UÇAKLAR', ['U', 'ÇAK', 'LAR'], 'Gökyüzünde süzülen demir kuşlar ✈️', 'Taşıtlar'),
  buildHeceWord('hm_39', 'BİSİKLET', ['Bİ', 'SİK', 'LET'], 'Pedal çevirerek sürdüğümüz iki tekerlekli 🚲', 'Taşıtlar'),
  buildHeceWord('hm_40', 'ÇİKOLATA', ['Çİ', 'KO', 'LAT'], 'Kakao ile yapılan tatlı ve lezzetli yiyecek 🍫', 'Yiyecekler'),

  // 4 HECELİ KELİMELER (İleri Seviye - Meydan Okuma)
  buildHeceWord('hm_41', 'BİLGİSAYAR', ['BİL', 'Gİ', 'SA', 'YAR'], 'İnternete girdiğimiz akıllı ekranlı cihaz 💻', 'Teknoloji'),
  buildHeceWord('hm_42', 'TELEVİZYON', ['TE', 'LE', 'VİZ', 'YON'], 'Haberleri ve çizgi filmleri izlediğimiz ekran 📺', 'Teknoloji'),
  buildHeceWord('hm_43', 'HELİKOPTER', ['HE', 'Lİ', 'KOP', 'TER'], 'Tepesindeki pervaneyle havalanan hava aracı 🚁', 'Taşıtlar'),
  buildHeceWord('hm_44', 'DENİZALTI', ['DE', 'NİZ', 'AL', 'TI'], 'Suların derinliklerinde yüzen gizemli gemi 🚢', 'Taşıtlar'),
  buildHeceWord('hm_45', 'DİNOZORLAR', ['Dİ', 'NO', 'ZOR', 'LAR'], 'Milyonlarca yıl önce yaşamış dev canlılar 🦖', 'Hayvanlar'),
  buildHeceWord('hm_46', 'KAHVALTILIK', ['KAH', 'VAL', 'TI', 'LIK'], 'Sabah sofrasında yenen peynir, zeytin, bal 🧀', 'Yiyecekler'),
  buildHeceWord('hm_47', 'KÜTÜPHANE', ['KÜ', 'TÜP', 'HA', 'NE'], 'Binlerce kitabın bulunduğu sessiz mekan 🏛️', 'Okul'),
  buildHeceWord('hm_48', 'MERDİVENLER', ['MER', 'Dİ', 'VEN', 'LER'], 'Katlar arasında inip çıkmaya yarayan basamaklar 🪜', 'Ev Eşyası'),
  buildHeceWord('hm_49', 'ARKADAŞLAR', ['AR', 'KA', 'DAŞ', 'LAR'], 'Birlikte oyun oynayıp güldüğümüz dostlarımız 👫', 'İnsanlar'),
  buildHeceWord('hm_50', 'CUMHURİYET', ['CUM', 'HU', 'Rİ', 'YET'], 'Milletin kendi kendini yönettiği güzel yönetim 🇹🇷', 'Genel Kültür')
];

/**
 * Belirli bir hece sayısına veya rastgele kelime getiren yardımcı fonksiyon
 */
export const getRandomHeceWords = (count: number = 10, filterSyllables?: number): HeceWord[] => {
  let pool = [...HECE_MAKASI_WORDS];
  if (filterSyllables) {
    pool = pool.filter(w => w.syllableCount === filterSyllables);
  }
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
