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
  },
  {
    id: 'yd_17',
    sentence: 'Ablam doğum günümde bana süpriz yaptı.',
    words: ['Ablam', 'doğum', 'günümde', 'bana', 'süpriz', 'yaptı.'],
    wrongWordIndex: 4,
    wrongWord: 'süpriz',
    correctWord: 'sürpriz',
    distractorWord: 'süpriz',
    explanation: 'Sözcüğün ilk hecesinde "r" sesi bulunur: "sürpriz".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_18',
    sentence: 'Duvardaki rafa kirbit kutusu koymuşlar.',
    words: ['Duvardaki', 'rafa', 'kirbit', 'kutusu', 'koymuşlar.'],
    wrongWordIndex: 2,
    wrongWord: 'kirbit',
    correctWord: 'kibrit',
    distractorWord: 'kirbit',
    explanation: 'Doğrusu "kibrit"tir, "r" ve "b" harfleri yer değiştirmemelidir.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_19',
    sentence: 'Uzun kiprikleri gözlerini tozdan korur.',
    words: ['Uzun', 'kiprikleri', 'gözlerini', 'tozdan', 'korur.'],
    wrongWordIndex: 1,
    wrongWord: 'kiprikleri',
    correctWord: 'kirpikleri',
    distractorWord: 'kiprikleri',
    explanation: '"Kırpmak" eyleminden gelir, doğrusu "kirpik"tir.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_20',
    sentence: 'Tarih müzesinde devasa bir dinazor iskeleti gördük.',
    words: ['Tarih', 'müzesinde', 'devasa', 'bir', 'dinazor', 'iskeleti', 'gördük.'],
    wrongWordIndex: 4,
    wrongWord: 'dinazor',
    correctWord: 'dinozor',
    distractorWord: 'dinazor',
    explanation: 'Ortadaki ünlü harf "o"dur, doğrusu "dinozor" şeklinde yazılır.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_21',
    sentence: 'Babam sabah erkenden traş olup işe gitti.',
    words: ['Babam', 'sabah', 'erkenden', 'traş', 'olup', 'işe', 'gitti.'],
    wrongWordIndex: 3,
    wrongWord: 'traş',
    correctWord: 'tıraş',
    distractorWord: 'traş',
    explanation: 'Türkçede bu sözcüğün başında "ı" harfi yazılır: "tıraş".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_22',
    sentence: 'Otobüs şöförü yolculara güler yüzle selam verdi.',
    words: ['Otobüs', 'şöförü', 'yolculara', 'güler', 'yüzle', 'selam', 'verdi.'],
    wrongWordIndex: 1,
    wrongWord: 'şöförü',
    correctWord: 'şoförü',
    distractorWord: 'şöförü',
    explanation: 'İlk hece "o", ikinci hece "ö" iledir: "şoför".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_23',
    sentence: 'Törende müdürümüz çok şık bir kıravat takmıştı.',
    words: ['Törende', 'müdürümüz', 'çok', 'şık', 'bir', 'kıravat', 'takmıştı.'],
    wrongWordIndex: 5,
    wrongWord: 'kıravat',
    correctWord: 'kravat',
    distractorWord: 'kıravat',
    explanation: 'Yabancı kökenli bu sözcükte "k" ile "r" arasına "ı" girmez: "kravat".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_24',
    sentence: 'Hızlı tiren ile Ankara\'ya iki saatte vardık.',
    words: ['Hızlı', 'tiren', 'ile', 'Ankara\'ya', 'iki', 'saatte', 'vardık.'],
    wrongWordIndex: 1,
    wrongWord: 'tiren',
    correctWord: 'tren',
    distractorWord: 'tiren',
    explanation: '"T" ile "r" harfleri arasında "i" harfi yazılmaz: "tren".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_25',
    sentence: 'Her sabah bahçede sipor hareketleri yapıyoruz.',
    words: ['Her', 'sabah', 'bahçede', 'sipor', 'hareketleri', 'yapıyoruz.'],
    wrongWordIndex: 3,
    wrongWord: 'sipor',
    correctWord: 'spor',
    distractorWord: 'sipor',
    explanation: '"S" ile "p" arasına "i" yazılmaz, doğrusu "spor"dur.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_26',
    sentence: 'Fen deneyini okulun modern laboratuar odasında yaptık.',
    words: ['Fen', 'deneyini', 'okulun', 'modern', 'laboratuar', 'odasında', 'yaptık.'],
    wrongWordIndex: 4,
    wrongWord: 'laboratuar',
    correctWord: 'laboratuvar',
    distractorWord: 'laboratuar',
    explanation: 'Sözcüğün doğru yazımında "v" harfi bulunur: "laboratuvar".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_27',
    sentence: 'Yoğurdun içine biraz sarmısak ve nane ekledik.',
    words: ['Yoğurdun', 'içine', 'biraz', 'sarmısak', 've', 'nane', 'ekledik.'],
    wrongWordIndex: 3,
    wrongWord: 'sarmısak',
    correctWord: 'sarımsak',
    distractorWord: 'sarmısak',
    explanation: 'Doğrusu "sarımsak"tır; "r"den sonra "ı" harfi gelir.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_28',
    sentence: 'Resim defterine penbe bir kelebek çizdim.',
    words: ['Resim', 'defterine', 'penbe', 'bir', 'kelebek', 'çizdim.'],
    wrongWordIndex: 2,
    wrongWord: 'penbe',
    correctWord: 'pembe',
    distractorWord: 'penbe',
    explanation: '"B" harfinden önce gelen ses "n" değil "m" olur: "pembe".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_29',
    sentence: 'Bahçede el ele tutuşup neşeyle çenber olduk.',
    words: ['Bahçede', 'el', 'ele', 'tutuşup', 'neşeyle', 'çenber', 'olduk.'],
    wrongWordIndex: 5,
    wrongWord: 'çenber',
    correctWord: 'çember',
    distractorWord: 'çenber',
    explanation: '"B" harfinden önce "n" değil "m" yazılır: "çember".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_30',
    sentence: 'Annem akşam yemeği için lezzetli karnıbahar pişirdi.',
    words: ['Annem', 'akşam', 'yemeği', 'için', 'lezzetli', 'karnıbahar', 'pişirdi.'],
    wrongWordIndex: 5,
    wrongWord: 'karnıbahar',
    correctWord: 'karnabahar',
    distractorWord: 'karnıbahar',
    explanation: 'Doğrusu "ı" ile değil "a" iledir: "karnabahar".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_31',
    sentence: 'Yeni aldığımız saatin klavuz sayfalarını okuduk.',
    words: ['Yeni', 'aldığımız', 'saatin', 'klavuz', 'sayfalarını', 'okuduk.'],
    wrongWordIndex: 3,
    wrongWord: 'klavuz',
    correctWord: 'kılavuz',
    distractorWord: 'klavuz',
    explanation: '"K" ile "l" harfleri arasına "ı" yazılır: "kılavuz".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_32',
    sentence: 'Bugün sınıfta hiç bir arkadaşımız ödevini unutmadı.',
    words: ['Bugün', 'sınıfta', 'hiç', 'bir', 'arkadaşımız', 'ödevini', 'unutmadı.'],
    wrongWordIndex: 2,
    wrongWord: 'hiç bir',
    correctWord: 'hiçbir',
    distractorWord: 'hiç bir',
    explanation: '"Hiçbir" sözcüğü her zaman bitişik yazılır.',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_33',
    sentence: 'Ödevimi tamamlamak için bir az süreye ihtiyacım var.',
    words: ['Ödevimi', 'tamamlamak', 'için', 'bir', 'az', 'süreye', 'ihtiyacım', 'var.'],
    wrongWordIndex: 3,
    wrongWord: 'bir az',
    correctWord: 'biraz',
    distractorWord: 'bir az',
    explanation: '"Biraz" sözcüğü kalıplaşmış olduğu için bitişik yazılır.',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_34',
    sentence: 'Ağacın dalından taze bir kaç elma kopardık.',
    words: ['Ağacın', 'dalından', 'taze', 'bir', 'kaç', 'elma', 'kopardık.'],
    wrongWordIndex: 3,
    wrongWord: 'bir kaç',
    correctWord: 'birkaç',
    distractorWord: 'bir kaç',
    explanation: '"Birkaç" belgisiz sözcüğü daima bitişik yazılır.',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_35',
    sentence: 'Kütüphanede ilginç bir çok kitap keşfettim.',
    words: ['Kütüphanede', 'ilginç', 'bir', 'çok', 'kitap', 'keşfettim.'],
    wrongWordIndex: 2,
    wrongWord: 'bir çok',
    correctWord: 'birçok',
    distractorWord: 'bir çok',
    explanation: '"Birçok" sözcüğü bitişik yazılır.',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_36',
    sentence: 'Sağlıklı kalmak için hergün taze meyve yemeliyiz.',
    words: ['Sağlıklı', 'kalmak', 'için', 'hergün', 'taze', 'meyve', 'yemeliyiz.'],
    wrongWordIndex: 3,
    wrongWord: 'hergün',
    correctWord: 'her gün',
    distractorWord: 'hergün',
    explanation: '"Her gün" söz öbeği daima ayrı yazılır.',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_37',
    sentence: 'Törende pekçok öğrenci bayrak sallayarak marş söyledi.',
    words: ['Törende', 'pekçok', 'öğrenci', 'bayrak', 'sallayarak', 'marş', 'söyledi.'],
    wrongWordIndex: 1,
    wrongWord: 'pekçok',
    correctWord: 'pek çok',
    distractorWord: 'pekçok',
    explanation: '"Pek çok" sözcükleri ayrı yazılır.',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_38',
    sentence: 'Akşam okuma saatinde ödevini bitirdinmi?',
    words: ['Akşam', 'okuma', 'saatinde', 'ödevini', 'bitirdinmi?'],
    wrongWordIndex: 4,
    wrongWord: 'bitirdinmi?',
    correctWord: 'bitirdin mi?',
    distractorWord: 'bitirdinmi?',
    explanation: 'Soru eki (-mi) kendinden önceki kelimeden ayrı yazılır: "bitirdin mi?".',
    category: 'Soru Eki (-mi)'
  },
  {
    id: 'yd_39',
    sentence: 'Hafta sonu bizimle pikniğe geliyormusun?',
    words: ['Hafta', 'sonu', 'bizimle', 'pikniğe', 'geliyormusun?'],
    wrongWordIndex: 4,
    wrongWord: 'geliyormusun?',
    correctWord: 'geliyor musun?',
    distractorWord: 'geliyormusun?',
    explanation: 'Soru eki ve kişi eki kelimeden ayrı yazılır: "geliyor musun?".',
    category: 'Soru Eki (-mi)'
  },
  {
    id: 'yd_40',
    sentence: 'Yaz tatilinde ankara\'daki Anıtkabir\'i ziyaret edeceğiz.',
    words: ['Yaz', 'tatilinde', 'ankara\'daki', 'Anıtkabir\'i', 'ziyaret', 'edeceğiz.'],
    wrongWordIndex: 2,
    wrongWord: 'ankara\'daki',
    correctWord: 'Ankara\'daki',
    distractorWord: 'ankara\'daki',
    explanation: 'Şehir isimleri özel isimdir, daima büyük harfle başlar: "Ankara\'daki".',
    category: 'Büyük Harf / Kesme'
  },
  {
    id: 'yd_41',
    sentence: 'Her yıl 23 nisan gününü bayram sevinciyle kutlarız.',
    words: ['Her', 'yıl', '23', 'nisan', 'gününü', 'bayram', 'sevinciyle', 'kutlarız.'],
    wrongWordIndex: 3,
    wrongWord: 'nisan',
    correctWord: 'Nisan',
    distractorWord: 'nisan',
    explanation: 'Belirli bir tarihi gösteren ay adları büyük harfle başlar: "23 Nisan".',
    category: 'Büyük Harf / Kesme'
  },
  {
    id: 'yd_42',
    sentence: 'Bahçede koşan çoçuklar neşeyle oyun oynuyordu.',
    words: ['Bahçede', 'koşan', 'çoçuklar', 'neşeyle', 'oyun', 'oynuyordu.'],
    wrongWordIndex: 2,
    wrongWord: 'çoçuklar',
    correctWord: 'çocuklar',
    distractorWord: 'çoçuklar',
    explanation: 'Doğrusu "çocuklar"dır, ortadaki harf "c"dir.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_43',
    sentence: 'Kardeşim bisküvi yerine taze meyva yemeyi seçti.',
    words: ['Kardeşim', 'bisküvi', 'yerine', 'taze', 'meyva', 'yemeyi', 'seçti.'],
    wrongWordIndex: 4,
    wrongWord: 'meyva',
    correctWord: 'meyve',
    distractorWord: 'meyva',
    explanation: 'Doğru yazılışı "meyve"dir, sonu "e" ile biter.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_44',
    sentence: 'Bu resim yarışmasını kazanmayı okadar çok istiyordu ki.',
    words: ['Bu', 'resim', 'yarışmasını', 'kazanmayı', 'okadar', 'çok', 'istiyordu', 'ki.'],
    wrongWordIndex: 4,
    wrongWord: 'okadar',
    correctWord: 'o kadar',
    distractorWord: 'okadar',
    explanation: '"O kadar" söz grubu her zaman ayrı yazılır.',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_45',
    sentence: 'Kışın soğuk günlerinde sokak hayvanlarınıda unutmamalıyız.',
    words: ['Kışın', 'soğuk', 'günlerinde', 'sokak', 'hayvanlarınıda', 'unutmamalıyız.'],
    wrongWordIndex: 4,
    wrongWord: 'hayvanlarınıda',
    correctWord: 'hayvanlarını da',
    distractorWord: 'hayvanlarınıda',
    explanation: '"Da" bağlacı kelimeden ayrı yazılır: "hayvanlarını da".',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_46',
    sentence: 'Sabah aynaya baktığında uzun kiprikleri dikkat çekiyordu.',
    words: ['Sabah', 'aynaya', 'baktığında', 'uzun', 'kiprikleri', 'dikkat', 'çekiyordu.'],
    wrongWordIndex: 4,
    wrongWord: 'kiprikleri',
    correctWord: 'kirpikleri',
    distractorWord: 'kiprikleri',
    explanation: 'Göz kapağındaki kılların doğru adı "kirpik"tir; "kiprik" yanlıştır.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_47',
    sentence: 'Babam bahçedeki çimleri biçmek için yeni bir makina aldı.',
    words: ['Babam', 'bahçedeki', 'çimleri', 'biçmek', 'için', 'yeni', 'bir', 'makina', 'aldı.'],
    wrongWordIndex: 7,
    wrongWord: 'makina',
    correctWord: 'makine',
    distractorWord: 'makina',
    explanation: 'Kelimenin TDK yazımı "makine"dir; sonu "e" ile biter.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_48',
    sentence: 'Sınıftaki en tenbel öğrenci bile yarışmaya hevesle katıldı.',
    words: ['Sınıftaki', 'en', 'tenbel', 'öğrenci', 'bile', 'yarışmaya', 'hevesle', 'katıldı.'],
    wrongWordIndex: 2,
    wrongWord: 'tenbel',
    correctWord: 'tembel',
    distractorWord: 'tenbel',
    explanation: 'Türkçede b sesinden önce m gelir: "tembel" doğrudur, "tenbel" yanlıştır.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_49',
    sentence: 'Öğretmenimiz perşenbe günü bilim merkezine gideceğimizi söyledi.',
    words: ['Öğretmenimiz', 'perşenbe', 'günü', 'bilim', 'merkezine', 'gideceğimizi', 'söyledi.'],
    wrongWordIndex: 1,
    wrongWord: 'perşenbe',
    correctWord: 'perşembe',
    distractorWord: 'perşenbe',
    explanation: 'Doğru yazılışı "b"den önceki "m" sesiyle "perşembe"dir.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_50',
    sentence: 'Ormanda bize yolu gösteren tecrübeli bir klavuz vardı.',
    words: ['Ormanda', 'bize', 'yolu', 'gösteren', 'tecrübeli', 'bir', 'klavuz', 'vardı.'],
    wrongWordIndex: 6,
    wrongWord: 'klavuz',
    correctWord: 'kılavuz',
    distractorWord: 'klavuz',
    explanation: '"Kılavuz" sözcüğü arada "ı" harfi bulunarak yazılır.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_51',
    sentence: 'Bahçede el ele tutuşarak kocaman bir çenber oluşturduk.',
    words: ['Bahçede', 'el', 'ele', 'tutuşarak', 'kocaman', 'bir', 'çenber', 'oluşturduk.'],
    wrongWordIndex: 6,
    wrongWord: 'çenber',
    correctWord: 'çember',
    distractorWord: 'çenber',
    explanation: '"b" sesinden önce gelen "n" sesi "m"ye dönüşür: "çember".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_52',
    sentence: 'Her yıl 19 mayıs gününü Atatürk\'ü Anma ve Gençlik Bayramı olarak kutlarız.',
    words: ['Her', 'yıl', '19', 'mayıs', 'gününü', 'Atatürk\'ü', 'Anma', 've', 'Gençlik', 'Bayramı', 'olarak', 'kutlarız.'],
    wrongWordIndex: 3,
    wrongWord: 'mayıs',
    correctWord: 'Mayıs',
    distractorWord: 'mayıs',
    explanation: 'Belirli bir tarihi gösteren ay isimleri büyük harfle başlar: "19 Mayıs".',
    category: 'Büyük Harf / Kesme'
  },
  {
    id: 'yd_53',
    sentence: 'Sokaktaki sevimli yavru kediye bir kapda su bıraktık.',
    words: ['Sokaktaki', 'sevimli', 'yavru', 'kediye', 'bir', 'kapda', 'su', 'bıraktık.'],
    wrongWordIndex: 5,
    wrongWord: 'kapda',
    correctWord: 'kap da',
    distractorWord: 'kapda',
    explanation: '"Da" bağlacı kelimeden ayrı yazılır: "bir kap da su".',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_54',
    sentence: 'Ali kitap okurken hiçbirşey onun dikkatini dağıtamazdı.',
    words: ['Ali', 'kitap', 'okurken', 'hiçbirşey', 'onun', 'dikkatini', 'dağıtamazdı.'],
    wrongWordIndex: 3,
    wrongWord: 'hiçbirşey',
    correctWord: 'hiçbir şey',
    distractorWord: 'hiçbirşey',
    explanation: '"Şey" sözcüğü her zaman kendinden önceki sözcükten ayrı yazılır: "hiçbir şey".',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_55',
    sentence: 'Fidan dikme etkinliğine katılan öğrencilerin herbiri çok mutluydu.',
    words: ['Fidan', 'dikme', 'etkinliğine', 'katılan', 'öğrencilerin', 'herbiri', 'çok', 'mutluydu.'],
    wrongWordIndex: 5,
    wrongWord: 'herbiri',
    correctWord: 'her biri',
    distractorWord: 'herbiri',
    explanation: '"Her biri" söz öbeği daima ayrı yazılır.',
    category: 'Ayrı/Bitişik Yazım'
  },
  {
    id: 'yd_56',
    sentence: 'Yarın okul çıkışında bizimle basketbol oynamak istermisin?',
    words: ['Yarın', 'okul', 'çıkışında', 'bizimle', 'basketbol', 'oynamak', 'istermisin?'],
    wrongWordIndex: 6,
    wrongWord: 'istermisin?',
    correctWord: 'ister misin?',
    distractorWord: 'istermisin?',
    explanation: 'Soru eki (-mi) kendinden önceki sözcükten ayrı yazılır: "ister misin?".',
    category: 'Soru Eki (-mi)'
  },
  {
    id: 'yd_57',
    sentence: 'Türkiye\'nin en büyük sodalı gölü olan Van gölü masmavidir.',
    words: ['Türkiye\'nin', 'en', 'büyük', 'sodalı', 'gölü', 'olan', 'Van', 'gölü', 'masmavidir.'],
    wrongWordIndex: 7,
    wrongWord: 'gölü',
    correctWord: 'Gölü',
    distractorWord: 'gölü',
    explanation: 'Özel ada dahil olan dağ, deniz, göl, ırmak adları büyük harfle başlar: "Van Gölü".',
    category: 'Büyük Harf / Kesme'
  },
  {
    id: 'yd_58',
    sentence: 'Kumsalda koşarken ayağına taş kaçdığını söyledi.',
    words: ['Kumsalda', 'koşarken', 'ayağına', 'taş', 'kaçdığını', 'söyledi.'],
    wrongWordIndex: 4,
    wrongWord: 'kaçdığını',
    correctWord: 'kaçtığını',
    distractorWord: 'kaçdığını',
    explanation: 'Sert ünsüzden (ç) sonra sert ünsüz (t) gelir (ünsüz sertleşmesi): "kaçtığını".',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_59',
    sentence: 'Kitap okuyan insan kendini hiçbir zaman yanlız hissetmez.',
    words: ['Kitap', 'okuyan', 'insan', 'kendini', 'hiçbir', 'zaman', 'yanlız', 'hissetmez.'],
    wrongWordIndex: 6,
    wrongWord: 'yanlız',
    correctWord: 'yalnız',
    distractorWord: 'yanlız',
    explanation: '"Yalın" kökünden türediği için doğru yazımı "yalnız"dır; "yanlız" yanlıştır.',
    category: 'Harf Yanlışı'
  },
  {
    id: 'yd_60',
    sentence: 'Otobüs durağında beklerken saat üçde buluşacaktık.',
    words: ['Otobüs', 'durağında', 'beklerken', 'saat', 'üçde', 'buluşacaktık.'],
    wrongWordIndex: 4,
    wrongWord: 'üçde',
    correctWord: 'üçte',
    distractorWord: 'üçde',
    explanation: '"Üç" kelimesi sert ünsüzle (ç) bittiği için ek sertleşir: "üçte".',
    category: 'Harf Yanlışı'
  }
];

export const getRandomYazimQuestions = (count: number = 10): YazimDedektifiQuestion[] => {
  const shuffled = [...YAZIM_DEDEKTIFI_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
