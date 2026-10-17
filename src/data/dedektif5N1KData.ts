export interface Dedektif5N1KStory {
  id: string;
  title: string;
  story: string;
  question: string;
  qType: 'kim' | 'ne' | 'nerede' | 'ne_zaman' | 'nasil' | 'neden';
  qTypeLabel: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  emoji: string;
}

export const STORIES_5N1K: Dedektif5N1KStory[] = [
  // ==========================================
  // KİM? (12 Adet)
  // ==========================================
  {
    id: '5n1k-k1',
    title: 'Kütüphane Kaşifi',
    story: 'Zeynep, pazar günü sabah erkenden mahalle kütüphanesine gitti. Fen bilgisi projesi için uzay ve gezegenler hakkında sessizce kitap okudu.',
    question: 'Kitapları sessizce okuyan kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Zeynep', 'Ali', 'Öğretmen', 'Kütüphaneci'],
    correctAnswer: 'Zeynep',
    explanation: 'Metne göre kütüphaneye gidip kitap okuyan kişi Zeynep\'tir.',
    emoji: '📚'
  },
  {
    id: '5n1k-k2',
    title: 'Resim Sergisi',
    story: 'Selin, 23 Nisan günü okulun konferans salonunda rengarenk boyalarla çizdiği Atatürk ve çocuk resimlerini gururla sergiledi.',
    question: 'Resimleri gururla sergileyen kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Selin', 'Öğretmen', 'Müdür', 'Can'],
    correctAnswer: 'Selin',
    explanation: 'Metinde resimleri çizen ve gururla sergileyen kişi Selin\'dir.',
    emoji: '🎨'
  },
  {
    id: '5n1k-k3',
    title: 'Bahçedeki Kuş Evi',
    story: 'Kerem ve marangoz dedesi, hafta sonu bahçedeki ceviz ağacının dalına minik serçeler için tahtadan bir yuva astılar.',
    question: 'Serçeler için tahta yuvayı asanlar kimlerdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Kerem ve dedesi', 'Komşu teyze', 'Sınıf arkadaşları', 'Park görevlisi'],
    correctAnswer: 'Kerem ve dedesi',
    explanation: 'Metne göre tahta yuvayı ceviz ağacına asanlar Kerem ve dedesidir.',
    emoji: '🐦'
  },
  {
    id: '5n1k-k4',
    title: 'Okul Temsilcisi',
    story: 'Mert, dün öğleden sonra okul bahçesinde arkadaşlarına hazırladığı projeleri heyecanla anlattı ve oyların çoğunu alarak okul temsilcisi seçildi.',
    question: 'Okul temsilcisi seçilen kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Mert', 'Ayşe', 'Okul Müdürü', 'Burak'],
    correctAnswer: 'Mert',
    explanation: 'Metne göre oyların çoğunu alarak temsilci seçilen kişi Mert\'tir.',
    emoji: '🗳️'
  },
  {
    id: '5n1k-k5',
    title: 'Gezegen Gözlemi',
    story: 'Ece ve babası, açık bir yaz gecesinde köyün tepesine kurdukları teleskopla Jüpiter gezegeninin uydularını ilgiyle izlediler.',
    question: 'Teleskopla Jüpiter\'in uydularını izleyenler kimlerdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Ece ve babası', 'Ali ve annesi', 'Fen öğretmenleri', 'Köy muhtarı'],
    correctAnswer: 'Ece ve babası',
    explanation: 'Metne göre teleskopla gökyüzünü izleyenler Ece ve babasıdır.',
    emoji: '🔭'
  },
  {
    id: '5n1k-k6',
    title: 'Satranç Şampiyonu',
    story: 'Kaan, okul turnuvasının son turunda rakibinin vezirini zekice sıkıştırarak altın madalyanın sahibi oldu.',
    question: 'Altın madalyanın sahibi olan öğrenci kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Kaan', 'Deniz', 'Hakem', 'Emir'],
    correctAnswer: 'Kaan',
    explanation: 'Metinde şampiyonluğu kazanıp madalyayı alan kişi Kaan\'dır.',
    emoji: '♟️'
  },
  {
    id: '5n1k-k7',
    title: 'Çiçeklerin Bakımı',
    story: 'Fatma Nine, her sabah balkonundaki sardunyaları ve fesleğenleri sevgiyle sulayıp kuruyan yapraklarını temizler.',
    question: 'Balkondaki çiçekleri her sabah sevgiyle sulayan kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Fatma Nine', 'Zehra Teyze', 'Ahmet Amca', 'Torunu Cem'],
    correctAnswer: 'Fatma Nine',
    explanation: 'Metne göre çiçeklerin bakımını her sabah yapan kişi Fatma Nine\'dir.',
    emoji: '🌸'
  },
  {
    id: '5n1k-k8',
    title: 'Kayıp Cüzdan',
    story: 'Tugay, teneffüste koridorda bulduğu içi para dolu cüzdanı hemen nöbetçi öğretmene teslim etti.',
    question: 'Bulduğu cüzdanı nöbetçi öğretmene teslim eden kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Tugay', 'Ozan', 'Temizlik görevlisi', 'Sınıf başkanı'],
    correctAnswer: 'Tugay',
    explanation: 'Cüzdanı koridorda bulup öğretmene teslim eden dürüst öğrenci Tugay\'dır.',
    emoji: '👛'
  },
  {
    id: '5n1k-k9',
    title: 'Gitar Melodisi',
    story: 'Beren, okulun müzik kulübünde hocasının gösterdiği notaları büyük bir dikkatle gitarda çaldı.',
    question: 'Gitarı büyük bir dikkatle çalan kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Beren', 'Defne', 'Müzik öğretmeni', 'Koro şefi'],
    correctAnswer: 'Beren',
    explanation: 'Metne göre notaları gitarda dikkatle çalan kişi Beren\'dir.',
    emoji: '🎸'
  },
  {
    id: '5n1k-k10',
    title: 'Veteriner Kliniği',
    story: 'Doktor Sinan Bey, sokakta ayağı incinen beyaz köpeğin bacağını özenle sardı ve ona mama verdi.',
    question: 'Yaralı köpeğin bacağını özenle saran kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Doktor Sinan Bey', 'Hayvansever Can', 'Eczacı Hanım', 'Polis Memuru'],
    correctAnswer: 'Doktor Sinan Bey',
    explanation: 'Metne göre köpeğe tıbbi yardım sağlayan kişi Veteriner Doktor Sinan Bey\'dir.',
    emoji: '🐶'
  },
  {
    id: '5n1k-k11',
    title: 'Geri Dönüşüm Lideri',
    story: 'Defne, sınıfta başlattığı sıfır atık kampanyasıyla bütün öğrencilerin kağıt ve pilleri ayrı kutularda toplamasını sağladı.',
    question: 'Sıfır atık kampanyasını sınıfta başlatan kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Defne', 'Hakan', 'Okul Müdürü', 'Rehber Öğretmen'],
    correctAnswer: 'Defne',
    explanation: 'Metne göre çevre kampanyasını başlatan öğrenci Defne\'dir.',
    emoji: '♻️'
  },
  {
    id: '5n1k-k12',
    title: 'Ekmek Kokusu',
    story: 'Fırıncı Hasan Amca, sabahın ilk ışıklarıyla sıcak somunları fırından çıkarıp dükkanın vitrinine dizdi.',
    question: 'Sıcak somunları sabah erken vitrine dizen kimdir?',
    qType: 'kim',
    qTypeLabel: 'KİM?',
    options: ['Fırıncı Hasan Amca', 'Bakkal Mehmet', 'Çırak Ali', 'Müşteri Veli'],
    correctAnswer: 'Fırıncı Hasan Amca',
    explanation: 'Metinde fırından sıcak ekmekleri çıkarıp dizen kişi Hasan Amca\'dır.',
    emoji: '🥖'
  },

  // ==========================================
  // NE? (12 Adet)
  // ==========================================
  {
    id: '5n1k-ne1',
    title: 'Fidan Dikme Şenliği',
    story: 'Can ile dedesi, ilkbahar sabahı köyün tepesinde neşeyle çam fidanı dikti. Doğayı korumak ve yeşillendirmek istiyorlardı.',
    question: 'Can ile dedesi tepeye ne diktiler?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Çam fidanı', 'Çiçek tohumu', 'Elma ağacı', 'Gül fidesi'],
    correctAnswer: 'Çam fidanı',
    explanation: 'Metne göre toprağa çam fidanı dikilmiştir.',
    emoji: '🌲'
  },
  {
    id: '5n1k-ne2',
    title: 'Pasta Ustası Elif',
    story: 'Elif, annesinin doğum günü için mutfakta özenle çilekli bir pasta hazırladı. Çünkü annesine güzel bir sürpriz yapmak istiyordu.',
    question: 'Elif mutfakta ne hazırladı?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Çilekli bir pasta', 'Elmalı turta', 'Çikolatalı kurabiye', 'Meyve salatası'],
    correctAnswer: 'Çilekli bir pasta',
    explanation: 'Metinde Elif mutfakta çilekli bir pasta hazırlamıştır.',
    emoji: '🎂'
  },
  {
    id: '5n1k-ne3',
    title: 'Arkeoloji Atölyesi',
    story: 'Öğrenciler, müzenin bahçesindeki kum havuzunda minik fırçalarla kazı yaparak eski dönemlere ait kilden bir vazo buldular.',
    question: 'Öğrenciler kum havuzunda kazı yaparak ne buldular?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Kilden bir vazo', 'Altın sikke', 'Demir kılıç', 'Taş heykel'],
    correctAnswer: 'Kilden bir vazo',
    explanation: 'Metne göre öğrenciler kum havuzunda kilden bir vazo bulmuşlardır.',
    emoji: '🏺'
  },
  {
    id: '5n1k-ne4',
    title: 'Görsel Sanatlar',
    story: 'Murat, teknoloji ve tasarım dersinde atık karton kutuları ve kapakları birleştirerek uzay roketi maketi yaptı.',
    question: 'Murat atık malzemelerle ne yaptı?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Uzay roketi maketi', 'Karton araba', 'Kuş kafesi', 'Oyuncak ev'],
    correctAnswer: 'Uzay roketi maketi',
    explanation: 'Metinde Murat karton kutularla uzay roketi maketi yapmıştır.',
    emoji: '🚀'
  },
  {
    id: '5n1k-ne5',
    title: 'Piknik Sepeti',
    story: 'Seda, göl kenarındaki piknik masasına evden getirdikleri taze sıkılmış portakal suyunu ve cevizli kekleri koydu.',
    question: 'Seda piknik masasına ne koydu?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Portakal suyu ve cevizli kek', 'Çay ve kurabiye', 'Limonata ve börek', 'Süt ve poğaça'],
    correctAnswer: 'Portakal suyu ve cevizli kek',
    explanation: 'Metne göre Seda masaya portakal suyu ve cevizli kek koymuştur.',
    emoji: '🧺'
  },
  {
    id: '5n1k-ne6',
    title: 'Yağmur Bereketi',
    story: 'Çiftçi Ahmet, kurak geçen günlerin ardından tarlasına can veren ilkbahar yağmurunu sevinçle karşıladı.',
    question: 'Tarlaya can veren doğa olayı nedir?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['İlkbahar yağmuru', 'Fırtına rüzgarı', 'Kış karı', 'Dolu yağışı'],
    correctAnswer: 'İlkbahar yağmuru',
    explanation: 'Metinde tarlaya can suyu olan doğa olayı ilkbahar yağmurudur.',
    emoji: '🌧️'
  },
  {
    id: '5n1k-ne7',
    title: 'Kuşların Ziyafeti',
    story: 'Deniz, kış gününde pencerenin kenarına serçelerin beslenmesi için bir avuç buğday ve ekmek kırıntısı bıraktı.',
    question: 'Deniz pencere kenarına kuşlar için ne bıraktı?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Buğday ve ekmek kırıntısı', 'Peynir dilimi', 'Ayçiçeği yağı', 'Meyve kabuğu'],
    correctAnswer: 'Buğday ve ekmek kırıntısı',
    explanation: 'Metne göre pencereye buğday ve ekmek kırıntısı bırakılmıştır.',
    emoji: '🌾'
  },
  {
    id: '5n1k-ne8',
    title: 'Posta Kutusu',
    story: 'Büyükanne, sabah kapıyı açtığında köydeki torunundan gelen pullu bir mektup gördü.',
    question: 'Büyükanne posta kutusunda ne gördü?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Pullu bir mektup', 'Gazete', 'Paket kutusu', 'Elektrik faturası'],
    correctAnswer: 'Pullu bir mektup',
    explanation: 'Metinde torunundan gelen pullu mektup belirtilmiştir.',
    emoji: '✉️'
  },
  {
    id: '5n1k-ne9',
    title: 'Bahçe Hasadı',
    story: 'Emre, bahçedeki sebze tarhından akşam yemeği için kırmızı domatesler ve çıtır salatalıklar topladı.',
    question: 'Emre sebze tarhından ne topladı?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Domates ve salatalık', 'Biber ve patlıcan', 'Havuç ve patates', 'Marul ve nane'],
    correctAnswer: 'Domates ve salatalık',
    explanation: 'Metne göre Emre kırmızı domates ve çıtır salatalık toplamıştır.',
    emoji: '🍅'
  },
  {
    id: '5n1k-ne10',
    title: 'Fen Deneyi',
    story: 'Öğretmenimiz, derste mıknatısın hangi maddeleri çektiğini göstermek için masaya demir ataşlar ve toplu iğneler koydu.',
    question: 'Öğretmen deney masasına ne koydu?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Demir ataşlar ve iğneler', 'Tahta bloklar', 'Plastik düğmeler', 'Cam bilyeler'],
    correctAnswer: 'Demir ataşlar ve iğneler',
    explanation: 'Metne göre öğretmen masaya demir ataşlar ve toplu iğneler koymuştur.',
    emoji: '🧲'
  },
  {
    id: '5n1k-ne11',
    title: 'Akıl Oyunu',
    story: 'Gizem, doğum gününde en yakın arkadaşının hediye ettiği 500 parçalık renkli dünya haritası yapbozunu tamamladı.',
    question: 'Gizem arkadaşının hediyesi olan neyi tamamladı?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Dünya haritası yapbozunu', 'Hikaye kitabını', 'Lego kalesini', 'Resim albümünü'],
    correctAnswer: 'Dünya haritası yapbozunu',
    explanation: 'Metne göre Gizem 500 parçalık dünya haritası yapbozunu tamamlamıştır.',
    emoji: '🧩'
  },
  {
    id: '5n1k-ne12',
    title: 'Tasarruf Alışkanlığı',
    story: 'Yusuf, her hafta harçlığından artan bozuk paraları odasındaki kırmızı kumbarasına attı.',
    question: 'Yusuf kumbarasına ne attı?',
    qType: 'ne',
    qTypeLabel: 'NE?',
    options: ['Artan bozuk paraları', 'Şekerleme fişlerini', 'Oyun biletlerini', 'Kırtasiye fişlerini'],
    correctAnswer: 'Artan bozuk paraları',
    explanation: 'Metne göre Yusuf harçlığından artan bozuk paraları kumbaraya atmıştır.',
    emoji: '🪙'
  },

  // ==========================================
  // NEREDE? (12 Adet)
  // ==========================================
  {
    id: '5n1k-nr1',
    title: 'Yağmurlu Günün Sürprizi',
    story: 'Ali, dün yağmurlu bir sonbahar günü okul yolunda ıslanan minik bir kedi yavrusu gördü. Onu montunun içine sararak sevgiyle evine götürdü.',
    question: 'Ali minik kedi yavrusunu nerede gördü?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Okul yolunda', 'Parkta', 'Bahçede', 'Kütüphanede'],
    correctAnswer: 'Okul yolunda',
    explanation: 'Metne göre Ali kedi yavrusunu "okul yolunda" görmüştür.',
    emoji: '🐱'
  },
  {
    id: '5n1k-nr2',
    title: 'Uçurtma Yarışı',
    story: 'Mehmet, rüzgarlı bir cumartesi öğleden sonra sahil kenarında kırmızı uçurtmasını gökyüzüne uçurdu. Uçurtma adeta bir kuş gibi süzülüyordu.',
    question: 'Mehmet uçurtmasını nerede uçurdu?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Sahil kenarında', 'Okul bahçesinde', 'Evin terasında', 'Ormanlık alanda'],
    correctAnswer: 'Sahil kenarında',
    explanation: 'Metinde Mehmet uçurtmasını "sahil kenarında" uçurmuştur.',
    emoji: '🪁'
  },
  {
    id: '5n1k-nr3',
    title: 'Botanik Bahçesi',
    story: 'Öğrenciler, fen dersi gezisinde seranın içinde etçil bitkileri ve dev kaktüsleri hayretle incelediler.',
    question: 'Öğrenciler ilginç bitkileri nerede incelediler?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Seranın içinde', 'Okul kantininde', 'Şehir meydanında', 'Otobüs durağında'],
    correctAnswer: 'Seranın içinde',
    explanation: 'Metne göre inceleme "seranın içinde" gerçekleşmiştir.',
    emoji: '🌵'
  },
  {
    id: '5n1k-nr4',
    title: 'Tarih Kokan Sokaklar',
    story: 'Aylin ve ailesi, Safranbolu\'daki tarihi ahşap konakların arasında fotoğraf çekerek keyifli bir yürüyüş yaptı.',
    question: 'Aylin ve ailesi fotoğraf çekimini nerede yaptı?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Safranbolu konakları arasında', 'Alışveriş merkezinde', 'Tren garında', 'Deniz fenerinde'],
    correctAnswer: 'Safranbolu konakları arasında',
    explanation: 'Metinde yürüyüşün Safranbolu\'daki tarihi ahşap konaklar arasında yapıldığı geçer.',
    emoji: '🏠'
  },
  {
    id: '5n1k-nr5',
    title: 'Masa Tenisi Turnuvası',
    story: 'Cem, öğle tatilinde okulun spor salonunda arkadaşıyla heyecanlı bir masa tenisi maçı yaptı.',
    question: 'Masa tenisi maçı nerede yapıldı?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Okulun spor salonunda', 'Sınıfta', 'Okul bahçesinde', 'Evde'],
    correctAnswer: 'Okulun spor salonunda',
    explanation: 'Metne göre maç "okulun spor salonunda" oynanmıştır.',
    emoji: '🏓'
  },
  {
    id: '5n1k-nr6',
    title: 'Doğa Yürüyüşü',
    story: 'İzciler, Çamlıca Ormanı\'nda pusula ve harita yardımıyla gizlenmiş ipuçlarını aradılar.',
    question: 'İzciler ipuçlarını nerede aradılar?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Çamlıca Ormanı\'nda', 'Şehir stadyumunda', 'Kamp binasında', 'Nehir kenarında'],
    correctAnswer: 'Çamlıca Ormanı\'nda',
    explanation: 'Metinde arama faaliyetinin Çamlıca Ormanı\'nda yapıldığı belirtilmiştir.',
    emoji: '🌲'
  },
  {
    id: '5n1k-nr7',
    title: 'Uzay Sergisi',
    story: 'Hakan, Bilim Merkezi\'nde gerçeğe uygun modellenmiş astronot kıyafetlerini ve uzay istasyonunu hayranlıkla izledi.',
    question: 'Hakan astronot kıyafetlerini nerede gördü?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Bilim Merkezi\'nde', 'Havalimanında', 'Sinema salonunda', 'Oyuncakçıda'],
    correctAnswer: 'Bilim Merkezi\'nde',
    explanation: 'Metne göre sergi "Bilim Merkezi\'nde" yer almaktadır.',
    emoji: '👨‍🚀'
  },
  {
    id: '5n1k-nr8',
    title: 'Köy Çeşmesi',
    story: 'Çoban Salih, sıcak yaz gününde koyunlarını köy meydanındaki taş çeşmenin başına getirip serinletti.',
    question: 'Koyunlar nerede serinletildi?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Köy meydanındaki taş çeşmede', 'Göl kıyısında', 'Ağılda', 'Yaylada'],
    correctAnswer: 'Köy meydanındaki taş çeşmede',
    explanation: 'Metne göre koyunlar köy meydanındaki taş çeşmenin başına getirilmiştir.',
    emoji: '🐑'
  },
  {
    id: '5n1k-nr9',
    title: 'Akılcı Alışveriş',
    story: 'Kerem ile annesi, semt pazarında taze sebze ve meyveleri seçerek bez torbalarına doldurdular.',
    question: 'Taze sebze ve meyveler nerede seçildi?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Semt pazarında', 'Bakkalda', 'Kantin sırasında', 'Fırında'],
    correctAnswer: 'Semt pazarında',
    explanation: 'Metinde alışverişin semt pazarında yapıldığı açıkça belirtilmiştir.',
    emoji: '🥦'
  },
  {
    id: '5n1k-nr10',
    title: 'Sualtı Dünyası',
    story: 'Sarp, dev akvaryumda cam tünelin içinden geçerken başının üzerinden yüzen vatozları ve köpekbalıklarını izledi.',
    question: 'Sarp deniz canlılarını nerede izledi?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Dev akvaryumdaki cam tünelde', 'Sahil kıyısında', 'Balıkçı teknesinde', 'Havuzda'],
    correctAnswer: 'Dev akvaryumdaki cam tünelde',
    explanation: 'Metne göre olay dev akvaryumdaki cam tünelde gerçekleşmektedir.',
    emoji: '🦈'
  },
  {
    id: '5n1k-nr11',
    title: 'Gezici Kütüphane',
    story: 'Dağ köyündeki çocuklar, okulun önüne park eden gezici kütüphane otobüsünde masal kitaplarını seçtiler.',
    question: 'Çocuklar masal kitaplarını nerede seçtiler?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Gezici kütüphane otobüsünde', 'Köy kahvesinde', 'Muhtarlıkta', 'Sınıfta'],
    correctAnswer: 'Gezici kütüphane otobüsünde',
    explanation: 'Metinde çocukların gezici kütüphane otobüsünde kitap seçtiği anlatılmaktadır.',
    emoji: '🚌'
  },
  {
    id: '5n1k-nr12',
    title: 'Kamp Ateşi',
    story: 'Mert ve izci arkadaşları, göl kenarındaki çadırların ortasında güvenli bir kamp ateşi yaktılar.',
    question: 'Kamp ateşi nerede yakıldı?',
    qType: 'nerede',
    qTypeLabel: 'NEREDE?',
    options: ['Göl kenarındaki çadırların ortasında', 'Dağın zirvesinde', 'Orman yolunda', 'Köy girişinde'],
    correctAnswer: 'Göl kenarındaki çadırların ortasında',
    explanation: 'Metne göre ateş çadırların ortasında, göl kenarında yakılmıştır.',
    emoji: '⛺'
  },

  // ==========================================
  // NE ZAMAN? (12 Adet)
  // ==========================================
  {
    id: '5n1k-nz1',
    title: 'Kütüphane Ziyareti',
    story: 'Zeynep, pazar günü sabah erkenden mahalle kütüphanesine gitti. Fen bilgisi projesi için sessizce kitap okudu.',
    question: 'Zeynep kütüphaneye ne zaman gitti?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Pazar günü sabah erkenden', 'Cuma akşamı', 'Pazartesi öğlen', 'Salı gecesi'],
    correctAnswer: 'Pazar günü sabah erkenden',
    explanation: 'Metinde Zeynep\'in kütüphaneye pazar günü sabah erkenden gittiği belirtilmiştir.',
    emoji: '⏰'
  },
  {
    id: '5n1k-nz2',
    title: 'Göçmen Kuşlar',
    story: 'Leylekler, sonbahar geldiğinde havalar soğumadan önce sıcak güney ülkelerine doğru uzun bir yolculuğa çıkarlar.',
    question: 'Leylekler sıcak ülkelere ne zaman göç eder?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Sonbahar geldiğinde', 'İlkbahar ortasında', 'Yazın en sıcak gününde', 'Kışın ortasında'],
    correctAnswer: 'Sonbahar geldiğinde',
    explanation: 'Metne göre leylekler sonbahar geldiğinde sıcak ülkelere doğru yola çıkarlar.',
    emoji: '🪶'
  },
  {
    id: '5n1k-nz3',
    title: 'Kutup Ayısı Belgeseli',
    story: 'Cemre, dün akşam televizyonda kutup ayılarını anlatan harika bir doğa belgeseli izledi.',
    question: 'Cemre belgeseli ne zaman izledi?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Dün akşam', 'Geçen hafta sabah', 'Öğle arasında', 'Bu sabah'],
    correctAnswer: 'Dün akşam',
    explanation: 'Metinde Cemre\'nin belgeseli dün akşam izlediği açıkça yazılıdır.',
    emoji: '📺'
  },
  {
    id: '5n1k-nz4',
    title: 'Güneşin Doğuşu',
    story: 'Balıkçı Rıza, şafak sökmeden önce kayığını denize indirip ağlarını sessizce suya bıraktı.',
    question: 'Balıkçı Rıza kayığını denize ne zaman indirdi?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Şafak sökmeden önce', 'Öğle vaktinde', 'İkindi saatinde', 'Gece yarısında'],
    correctAnswer: 'Şafak sökmeden önce',
    explanation: 'Metne göre Rıza kayığını şafak sökmeden önce denize indirmiştir.',
    emoji: '🌅'
  },
  {
    id: '5n1k-nz5',
    title: 'Karnaval Coşkusu',
    story: 'Okul bandosu, 29 Ekim Cumhuriyet Bayramı sabahında marşlar çalarak caddede gururla yürüdü.',
    question: 'Bando caddede ne zaman yürüdü?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Cumhuriyet Bayramı sabahında', 'Yılbaşı akşamında', 'Hafta sonu öğleden sonra', 'Yaz tatilinde'],
    correctAnswer: 'Cumhuriyet Bayramı sabahında',
    explanation: 'Metne göre yürüyüş 29 Ekim Cumhuriyet Bayramı sabahında gerçekleşti.',
    emoji: '🥁'
  },
  {
    id: '5n1k-nz6',
    title: 'Kar Tatili Sevinci',
    story: 'Çocuklar, kışın ilk karı yağdığında bahçeye fırlayıp havuç burunlu neşeli bir kardan adam yaptılar.',
    question: 'Çocuklar kardan adamı ne zaman yaptılar?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Kışın ilk karı yağdığında', 'Sonbahar yağmurunda', 'İlkbahar başında', 'Yaz tatilinde'],
    correctAnswer: 'Kışın ilk karı yağdığında',
    explanation: 'Metinde kardan adamın kışın ilk karı yağdığında yapıldığı belirtilmektedir.',
    emoji: '⛄'
  },
  {
    id: '5n1k-nz7',
    title: 'Yıldız Yağmuru',
    story: 'Gökbilimciler, ağustos ayının ortasında gece yarısı gökyüzünde beliren meteor yağmurunu fotoğrafladılar.',
    question: 'Meteor yağmuru ne zaman fotoğraflandı?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Ağustos ayı ortasında gece yarısı', 'Ocak ayı sabahında', 'Nisan ayı öğlesinde', 'Eylül akşamüstünde'],
    correctAnswer: 'Ağustos ayı ortasında gece yarısı',
    explanation: 'Metne göre gözlem ağustos ayının ortasında gece yarısı yapılmıştır.',
    emoji: '🌠'
  },
  {
    id: '5n1k-nz8',
    title: 'Teneffüs Zili',
    story: 'Zil çalar çalmaz öğrenciler neşeyle okul bahçesine koşarak yakantop oynamaya başladılar.',
    question: 'Öğrenciler bahçeye ne zaman koştular?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Zil çalar çalmaz', 'Dersin ortasında', 'Okul çıkışında', 'Sabah töreninde'],
    correctAnswer: 'Zil çalar çalmaz',
    explanation: 'Metinde öğrencilerin "zil çalar çalmaz" bahçeye koştukları ifade edilmektedir.',
    emoji: '🔔'
  },
  {
    id: '5n1k-nz9',
    title: 'Bahar Temizliği',
    story: 'Köylüler, ilkbahar başlangıcında dere yatağındaki çöpleri ve kuru dalları hep birlikte temizlediler.',
    question: 'Dere yatağı ne zaman temizlendi?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['İlkbahar başlangıcında', 'Kış ortasında', 'Yaz sonunda', 'Sonbahar akşamında'],
    correctAnswer: 'İlkbahar başlangıcında',
    explanation: 'Metne göre temizlik ilkbahar başlangıcında yapılmıştır.',
    emoji: '🌱'
  },
  {
    id: '5n1k-nz10',
    title: 'Yatmadan Önce',
    story: 'Aslı, her akşam yatmadan yarım saat önce dişlerini fırçalayıp en sevdiği masal kitabını okur.',
    question: 'Aslı masal kitabını ne zaman okur?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Yatmadan yarım saat önce', 'Sabah kalkar kalkmaz', 'Öğle yemeğinden sonra', 'Okul yolunda'],
    correctAnswer: 'Yatmadan yarım saat önce',
    explanation: 'Metinde Aslı\'nın kitabı "yatmadan yarım saat önce" okuduğu yazılıdır.',
    emoji: '📖'
  },
  {
    id: '5n1k-nz11',
    title: 'Deprem Tatbikatı',
    story: 'Okulumuzda dün saat 14.00\'te sirenler çaldığında tüm sınıflar çök-kapan-tutun hareketini uyguladı.',
    question: 'Deprem tatbikatı ne zaman yapıldı?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Dün saat 14.00\'te', 'Geçen hafta sabah 09.00\'da', 'Cuma akşamı', 'Pazartesi sabahında'],
    correctAnswer: 'Dün saat 14.00\'te',
    explanation: 'Metne göre sirenler ve tatbikat dün saat 14.00\'te gerçekleşmiştir.',
    emoji: '🚨'
  },
  {
    id: '5n1k-nz12',
    title: 'Doğum Günü Kutlaması',
    story: 'Arkadaşları, cuma günü son dersten hemen sonra öğretmenleri için sınıfta sürpriz bir kutlama hazırladılar.',
    question: 'Sürpriz kutlama ne zaman hazırlandı?',
    qType: 'ne_zaman',
    qTypeLabel: 'NE ZAMAN?',
    options: ['Cuma günü son dersten hemen sonra', 'Pazartesi ilk derste', 'Hafta sonu', 'Teneffüs arasında'],
    correctAnswer: 'Cuma günü son dersten hemen sonra',
    explanation: 'Metinde kutlamanın cuma günü son dersten hemen sonra hazırlandığı anlatılır.',
    emoji: '🎉'
  },

  // ==========================================
  // NASIL? (12 Adet)
  // ==========================================
  {
    id: '5n1k-ns1',
    title: 'Bisiklet Turu',
    story: 'Burak ve arkadaşları, dün akşamüstü parkın bisiklet yolunda kasklarını takarak dikkatlice pedal çevirdiler.',
    question: 'Burak ve arkadaşları bisikleti nasıl sürdüler?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Dikkatlice', 'Hızlıca ve tehlikeli', 'Gözleri kapalı', 'Korkarak'],
    correctAnswer: 'Dikkatlice',
    explanation: 'Metinde çocukların kask takarak "dikkatlice" pedal çevirdikleri belirtilmiştir.',
    emoji: '🚲'
  },
  {
    id: '5n1k-ns2',
    title: 'Fidan Dikme Şenliği',
    story: 'Can ile dedesi, ilkbahar sabahı köyün tepesinde neşeyle çam fidanı diktiler.',
    question: 'Can ile dedesi fidanı nasıl diktiler?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Neşeyle', 'Üzgünce', 'Zorlanarak', 'Aceleyle'],
    correctAnswer: 'Neşeyle',
    explanation: 'Metne göre fidan "neşeyle" dikilmiştir.',
    emoji: '🌲'
  },
  {
    id: '5n1k-ns3',
    title: 'Yavru Kuşun Kurtarılışı',
    story: 'İtfaiyeci amca, çatı oluğuna sıkışan güvercini merdivenle tırmanıp incitmeden nazikçe kurtardı.',
    question: 'İtfaiyeci güvercini oluktan nasıl kurtardı?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['İncitmeden nazikçe', 'Sertçe çekerek', 'Bağırarak', 'Aşağı düşürerek'],
    correctAnswer: 'İncitmeden nazikçe',
    explanation: 'Metinde güvercinin "incitmeden nazikçe" kurtarıldığı ifade edilir.',
    emoji: '🕊️'
  },
  {
    id: '5n1k-ns4',
    title: 'Ebru Sanatı',
    story: 'Sanatçı Leyla Hanım, at kuyruğu fırçasıyla boyaları suyun üzerine hafif vuruşlarla damlattı.',
    question: 'Leyla Hanım boyaları suyun üzerine nasıl damlattı?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Hafif vuruşlarla', 'Hızlıca dökerek', 'Şişeyi sıkarak', 'Karasızca sallayarak'],
    correctAnswer: 'Hafif vuruşlarla',
    explanation: 'Metne göre boyalar suyun üzerine "hafif vuruşlarla" damlatılmıştır.',
    emoji: '🎨'
  },
  {
    id: '5n1k-ns5',
    title: 'Gizli Mesaj',
    story: 'Dedektif Demir, arkadaşına vaka hakkındaki gizli ipucunu kimse duymasın diye fısıltıyla söyledi.',
    question: 'Demir gizli ipucunu arkadaşına nasıl söyledi?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Fısıltıyla', 'Bağırarak', 'Mektupla', 'Şarkı söyleyerek'],
    correctAnswer: 'Fısıltıyla',
    explanation: 'Metinde Demir\'in ipucunu kimse duymasın diye "fısıltıyla" söylediği yazar.',
    emoji: '🤫'
  },
  {
    id: '5n1k-ns6',
    title: 'Buz Pateni Gösterisi',
    story: 'Genç patenci Damla, buz pistinin üzerinde müzik eşliğinde bir kuğu gibi zarifçe kaydı.',
    question: 'Damla buz pistinde nasıl kaydı?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Zarifçe', 'Düşe kalka', 'Tereddütle', 'Öfkeyle'],
    correctAnswer: 'Zarifçe',
    explanation: 'Metne göre Damla pistte bir kuğu gibi "zarifçe" kaymıştır.',
    emoji: '⛸️'
  },
  {
    id: '5n1k-ns7',
    title: 'Trafik Kuralları',
    story: 'Ali, okul çıkışında karşıdan karşıya geçerken sağa ve sola dikkatle bakarak yaya geçidinden yürüdü.',
    question: 'Ali karşıdan karşıya nasıl geçti?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Sağa ve sola dikkatle bakarak', 'Koşarak ve bakmadan', 'Kulaklıkla müzik dinleyerek', 'Gözlerini kapatarak'],
    correctAnswer: 'Sağa ve sola dikkatle bakarak',
    explanation: 'Metinde Ali\'nin yolu sağa ve sola dikkatle bakarak geçtiği anlatılır.',
    emoji: '🚸'
  },
  {
    id: '5n1k-ns8',
    title: 'Cam Şişirme Atölyesi',
    story: 'Usta Mehmet, erimiş sıcak camı üfleme çubuğunun ucunda sabırla döndürerek rengarenk bir sürahi yaptı.',
    question: 'Usta sıcak camı nasıl döndürdü?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Sabırla', 'Aceleyle', 'Dikkatsizce', 'Öfkeyle'],
    correctAnswer: 'Sabırla',
    explanation: 'Metne göre cam "sabırla" döndürülerek sürahiye dönüştürülmüştür.',
    emoji: '🏺'
  },
  {
    id: '5n1k-ns9',
    title: 'Korkusuz Kedi',
    story: 'Sarı kedi Tekir, bahçedeki yüksek duvarın üzerinden sessiz adımlarla yürüyerek ağaca zıpladı.',
    question: 'Tekir duvarın üzerinde nasıl yürüdü?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Sessiz adımlarla', 'Ses çıkararak', 'Korkarak', 'Geri geri'],
    correctAnswer: 'Sessiz adımlarla',
    explanation: 'Metinde Tekir\'in yüksek duvarda "sessiz adımlarla" yürüdüğü belirtilmiştir.',
    emoji: '🐈'
  },
  {
    id: '5n1k-ns10',
    title: 'Ödev Zamanı',
    story: 'Emine, matematik ödevindeki zor problemleri tane tane okuyup defterine özenle yazarak çözdü.',
    question: 'Emine ödevini defterine nasıl yazdı?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Özenle', 'Karalayarak', 'Okunaksızca', 'Yarısını atlayarak'],
    correctAnswer: 'Özenle',
    explanation: 'Metne göre Emine problemleri defterine "özenle" yazarak çözmüştür.',
    emoji: '✏️'
  },
  {
    id: '5n1k-ns11',
    title: 'Yüzme Yarışı',
    story: 'Yiğit, yarışın son kulvarında kollarını güçlü kulaçlarla savurarak birincilik çizgisine ulaştı.',
    question: 'Yiğit son kulvarda nasıl yüzdü?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Güçlü kulaçlarla', 'Yorulup durarak', 'Yavaşça bekleyerek', 'Geriye bakarak'],
    correctAnswer: 'Güçlü kulaçlarla',
    explanation: 'Metinde Yiğit\'in "güçlü kulaçlarla" yüzdüğü anlatılmaktadır.',
    emoji: '🏊'
  },
  {
    id: '5n1k-ns12',
    title: 'Tohumun Büyüyüşü',
    story: 'Saksıya ekilen fasulye tohumu, güneş ışığı ve su sayesinde günden güne güçlenerek boy attı.',
    question: 'Fasulye tohumu zamanla nasıl büyüdü?',
    qType: 'nasil',
    qTypeLabel: 'NASIL?',
    options: ['Güçlenerek', 'Kuruyarak', 'Sararıp solgunlaşarak', 'Köklerini kaybederek'],
    correctAnswer: 'Güçlenerek',
    explanation: 'Metne göre tohum zamanla "güçlenerek" boy atmıştır.',
    emoji: '🌱'
  },

  // ==========================================
  // NEDEN / NİÇİN? (12 Adet)
  // ==========================================
  {
    id: '5n1k-nd1',
    title: 'Yağmurlu Günün Sürprizi',
    story: 'Ali, dün yağmurlu bir sonbahar günü okul yolunda ıslanan minik bir kedi yavrusu gördü. Onu montunun içine sararak evine götürdü. Çünkü kedi çok üşüyordu.',
    question: 'Ali kediyi niçin (neden) evine götürdü?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Çok üşüdüğü için', 'Sütü bittiği için', 'Oyun oynamak istediği için', 'Kedilerden korktuğu için'],
    correctAnswer: 'Çok üşüdüğü için',
    explanation: 'Metinde Ali kediyi "çünkü kedi çok üşüyordu" gerekçesiyle evine götürmüştür.',
    emoji: '🐱'
  },
  {
    id: '5n1k-nd2',
    title: 'Pasta Ustası Elif',
    story: 'Elif, annesinin doğum günü için mutfakta özenle çilekli bir pasta hazırladı. Çünkü annesine unutulmaz bir sürpriz yapmak istiyordu.',
    question: 'Elif pastayı neden hazırladı?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Annesine sürpriz yapmak istediği için', 'Karnı çok acıktığı için', 'Yemek dersi olduğu için', 'Misafirler istediği için'],
    correctAnswer: 'Annesine sürpriz yapmak istediği için',
    explanation: 'Metinde pastanın annesine güzel bir sürpriz yapmak amacıyla hazırlandığı yazılıdır.',
    emoji: '🎂'
  },
  {
    id: '5n1k-nd3',
    title: 'Erken Uyanış',
    story: 'Can, sabah güneş doğmadan uyandı. Çünkü babasıyla balık tutmaya gidecekleri için çok heyecanlıydı.',
    question: 'Can neden sabah erkenden uyandı?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Balık tutmaya gidecekleri için heyecanlıydı', 'Uykusu kaçtığı için', 'Kabus gördüğü için', 'Okula geç kaldığı için'],
    correctAnswer: 'Balık tutmaya gidecekleri için heyecanlıydı',
    explanation: 'Metne göre Can babasıyla balığa gideceği için heyecanlı olduğundan erken uyandı.',
    emoji: '🎣'
  },
  {
    id: '5n1k-nd4',
    title: 'Güneş Gözlüğü',
    story: 'Zehra, sahilde yürürken güneş gözlüğünü taktı. Çünkü parlak güneş ışığı gözlerini kamaştırıyordu.',
    question: 'Zehra güneş gözlüğünü neden taktı?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Güneş ışığı gözlerini kamaştırdığı için', 'Gözlük modası olduğu için', 'Yağmur yağdığı için', 'Rüzgar estiği için'],
    correctAnswer: 'Güneş ışığı gözlerini kamaştırdığı için',
    explanation: 'Metinde parlak güneş ışığı gözlerini kamaştırdığı için gözlük taktığı anlatılır.',
    emoji: '🕶️'
  },
  {
    id: '5n1k-nd5',
    title: 'Pencerenin Kapanışı',
    story: 'Öğretmen, ders sırasında aniden şiddetlenen fırtına nedeniyle sınıfın pencerelerini kapattı.',
    question: 'Öğretmen pencereleri neden kapattı?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Şiddetli fırtına çıktığı için', 'Sınıf çok sıcak olduğu için', 'Zil çaldığı için', 'Ders bittiği için'],
    correctAnswer: 'Şiddetli fırtına çıktığı için',
    explanation: 'Metne göre pencereler şiddetli fırtına nedeniyle kapatılmıştır.',
    emoji: '💨'
  },
  {
    id: '5n1k-nd6',
    title: 'Diş Hekimi Ziyareti',
    story: 'Bora, dün öğleden sonra annesiyle diş hekimine gitti. Çünkü çürüyen arka dişi sızlıyordu.',
    question: 'Bora diş hekimine neden gitti?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Çürüyen dişi sızladığı için', 'Doktoru özlediği için', 'Arkadaşını beklemek için', 'Okuldan kaçmak için'],
    correctAnswer: 'Çürüyen dişi sızladığı için',
    explanation: 'Metinde Bora\'nın çürüyen dişi sızladığı için hekime gittiği belirtilmiştir.',
    emoji: '🦷'
  },
  {
    id: '5n1k-nd7',
    title: 'Kütüphanede Sessizlik',
    story: 'Görevli kütüphaneci, masada konuşan iki öğrenciyi nazikçe uyardı. Çünkü kütüphanedeki diğer okuyucuların dikkati dağılıyordu.',
    question: 'Görevli öğrencileri niçin uyardı?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Diğer okuyucuların dikkati dağıldığı için', 'Saat dolduğu için', 'Kitaplar bittiği için', 'Kütüphane kapandığı için'],
    correctAnswer: 'Diğer okuyucuların dikkati dağıldığı için',
    explanation: 'Metne göre uyarı, diğer insanların dikkatini dağıttıkları için yapılmıştır.',
    emoji: '🤫'
  },
  {
    id: '5n1k-nd8',
    title: 'Şemsiyeyi Açmak',
    story: 'Tuna, okuldan çıkarken çantasından çıkardığı mavi şemsiyesini açtı. Çünkü gökyüzünden aniden sağanak yağmur boşalmıştı.',
    question: 'Tuna şemsiyesini niçin açtı?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Sağanak yağmur başladığı için', 'Güneşten korunmak için', 'Şemsiyesini denemek için', 'Rüzgarı durdurmak için'],
    correctAnswer: 'Sağanak yağmur başladığı için',
    explanation: 'Metinde Tuna\'nın sağanak yağmur başladığı için şemsiyesini açtığı ifade edilir.',
    emoji: '☔'
  },
  {
    id: '5n1k-nd9',
    title: 'Tasarruflu Ampuller',
    story: 'Babam, evimizdeki eski sarı lambaları çıkarıp LED ampuller taktı. Çünkü elektrik enerjisini tasarruflu kullanmak istiyordu.',
    question: 'Baba evdeki ampulleri neden değiştirdi?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Elektrik tasarrufu yapmak için', 'Eski lambaları sevmediği için', 'Ev çok aydınlık olsun diye', 'Ampuller kırıldığı için'],
    correctAnswer: 'Elektrik tasarrufu yapmak için',
    explanation: 'Metne göre değişim sebebi enerjiyi tasarruflu kullanma isteğidir.',
    emoji: '💡'
  },
  {
    id: '5n1k-nd10',
    title: 'Kuş Yemi Hazırlığı',
    story: 'Ayşe, balkonuna tahta bir yemlik koydu. Çünkü kış aylarında kar yağınca kuşlar yiyecek bulmakta zorlanıyordu.',
    question: 'Ayşe balkona neden yemlik koydu?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Kuşlar kışın yiyecek bulamadığı için', 'Kuşları yakalamak için', 'Balkon süsü olsun diye', 'Kuşlardan korktuğu için'],
    correctAnswer: 'Kuşlar kışın yiyecek bulamadığı için',
    explanation: 'Metinde kışın kuşların yiyecek bulmakta zorlandığı açıkça ifade edilmiştir.',
    emoji: '🐦'
  },
  {
    id: '5n1k-nd11',
    title: 'Sıcak Süt ve Bal',
    story: 'Anneannem, boğazı ağrıyan torununa ılık ballı süt içirdi. Çünkü bal boğazı yumuşatıp öksürüğü azaltıyordu.',
    question: 'Anneanne torununa neden ballı süt içirdi?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Boğazı yumuşatıp öksürüğü azalttığı için', 'Sütü çok soğuk bulduğu için', 'Torunun canı tatlı istediği için', 'Akşam yemeği olmadığı için'],
    correctAnswer: 'Boğazı yumuşatıp öksürüğü azalttığı için',
    explanation: 'Metne göre ballı süt boğazı yumuşatıp öksürüğü hafiflettiği için içirilmiştir.',
    emoji: '🥛'
  },
  {
    id: '5n1k-nd12',
    title: 'Emniyet Kemeri',
    story: 'Sürücü Kemal Bey, arabasına biner binmez ilk iş olarak emniyet kemerini taktı. Çünkü trafikte can güvenliğini sağlamak istiyordu.',
    question: 'Kemal Bey emniyet kemerini niçin taktı?',
    qType: 'neden',
    qTypeLabel: 'NEDEN / NİÇİN?',
    options: ['Trafikte can güvenliğini sağlamak için', 'Polis gördüğü için', 'Kemer rengini sevdiği için', 'Araba alarm çaldığı için'],
    correctAnswer: 'Trafikte can güvenliğini sağlamak için',
    explanation: 'Metinde can güvenliğini sağlamak amacıyla kemer taktığı belirtilmektedir.',
    emoji: '🚗'
  }
];

/**
 * Fisher-Yates shuffle helper
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Rastgele 5N1K soruları getirir.
 * Eğer hariç tutulacak ID'ler verilirse, o sorular öncelikle dışlanır.
 * Havuz tükenirse havuzu sıfırlayıp karıştırır.
 */
export const getRandom5N1KQuestions = (
  count: number = 8,
  excludeIds: string[] = []
): Dedektif5N1KStory[] => {
  const available = STORIES_5N1K.filter(s => !excludeIds.includes(s.id));
  const pool = available.length >= count ? available : STORIES_5N1K;
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

/**
 * Çok oyunculu (2 veya 3 kişi) mod için her oyuncuya birbirinden FARKLI ve benzersiz sorular atar.
 * Böylece tahtada yan yana yarışan öğrenciler birbirinin ekranına bakıp kopyalayamaz,
 * her öğrenci taze ve farklı bir vaka çözer.
 */
export const getMultiplayerUniqueQuestionSets = (
  playerCount: number,
  questionsPerPlayer: number = 8,
  excludeIds: string[] = []
): Dedektif5N1KStory[][] => {
  const totalNeeded = playerCount * questionsPerPlayer;
  const available = STORIES_5N1K.filter(s => !excludeIds.includes(s.id));
  const pool = available.length >= totalNeeded ? available : STORIES_5N1K;
  const shuffled = shuffleArray(pool);

  const result: Dedektif5N1KStory[][] = [];
  for (let p = 0; p < playerCount; p++) {
    const start = p * questionsPerPlayer;
    const playerSlice = shuffled.slice(start, start + questionsPerPlayer);
    // Eğer yetersizse genel havuzdan tamamla
    if (playerSlice.length < questionsPerPlayer) {
      const extraNeeded = questionsPerPlayer - playerSlice.length;
      const extra = shuffleArray(STORIES_5N1K).slice(0, extraNeeded);
      result.push([...playerSlice, ...extra]);
    } else {
      result.push(playerSlice);
    }
  }
  return result;
};

/**
 * Tekil bir vakayı değiştirmek istendiğinde (🔄 "Vakayı Değiştir" butonu)
 * aktif kullanılan sorular dışındaki yeni bir hikayeyi getirir.
 */
export const getFreshReplacementQuestion = (
  currentActiveIds: string[] = []
): Dedektif5N1KStory => {
  const available = STORIES_5N1K.filter(s => !currentActiveIds.includes(s.id));
  const pool = available.length > 0 ? available : STORIES_5N1K;
  const randomIdx = Math.floor(Math.random() * pool.length);
  return pool[randomIdx];
};
