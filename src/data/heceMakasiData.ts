export interface HeceWord {
  id: string;
  word: string;
  syllables: string[];
  cutIndices: number[]; // Index in word string after which a cut is valid (0-based)
  hint: string;
  category: string;
  syllableCount: number;
}

export const buildHeceWord = (
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
  // ==========================================
  // 2 HECELİ KELİMELER (60 Adet)
  // ==========================================
  buildHeceWord('hm_2_1', 'KEDİ', ['KE', 'Dİ'], 'Miyavlayan sevimli evcil dostumuz 🐱', 'Hayvanlar'),
  buildHeceWord('hm_2_2', 'KÖPEK', ['KÖ', 'PEK'], 'Sadık ve neşeli koruyucu dostumuz 🐶', 'Hayvanlar'),
  buildHeceWord('hm_2_3', 'ASLAN', ['AS', 'LAN'], 'Ormanların güçlü ve yeleli kralı 🦁', 'Hayvanlar'),
  buildHeceWord('hm_2_4', 'KAPLAN', ['KAP', 'LAN'], 'Çizgili postuyla çok hızlı koşan avcı 🐯', 'Hayvanlar'),
  buildHeceWord('hm_2_5', 'TAVŞAN', ['TAV', 'ŞAN'], 'Havuç seven uzun kulaklı sevimli hayvan 🐰', 'Hayvanlar'),
  buildHeceWord('hm_2_6', 'TİLKİ', ['TİL', 'Kİ'], 'Kurnazlığı ve kızıl kuyruğuyla bilinen hayvan 🦊', 'Hayvanlar'),
  buildHeceWord('hm_2_7', 'BALIK', ['BA', 'LIK'], 'Denizlerde ve nehirlerde yüzen pullu canlı 🐟', 'Hayvanlar'),
  buildHeceWord('hm_2_8', 'GEYİK', ['GE', 'YİK'], 'Ormanda yaşayan zarif ve boynuzlu hayvan 🦌', 'Hayvanlar'),
  buildHeceWord('hm_2_9', 'KOYUN', ['KO', 'YUN'], 'Yumuşacık yünleri olan çiftlik hayvanı 🐑', 'Hayvanlar'),
  buildHeceWord('hm_2_10', 'KEÇİ', ['KE', 'Çİ'], 'Kayalara tırmanmayı çok seven inatçı hayvan 🐐', 'Hayvanlar'),
  buildHeceWord('hm_2_11', 'ÖRDEK', ['ÖR', 'DEK'], 'Vak vak sesleriyle gölde yüzen sevimli kuş 🦆', 'Hayvanlar'),
  buildHeceWord('hm_2_12', 'TAVUK', ['TA', 'VUK'], 'Her sabah taze yumurta veren kümes hayvanı 🐔', 'Hayvanlar'),
  buildHeceWord('hm_2_13', 'HOROZ', ['HO', 'ROZ'], 'Sabahları erkenden ötüp bizi uyandıran hayvan 🐓', 'Hayvanlar'),
  buildHeceWord('hm_2_14', 'KARTAL', ['KAR', 'TAL'], 'Yüksek dağlarda uçan keskin bakışlı kuş 🦅', 'Hayvanlar'),
  buildHeceWord('hm_2_15', 'BAYKUŞ', ['BAY', 'KUŞ'], 'Geceleri uyanık olan kocaman gözlü bilge kuş 🦉', 'Hayvanlar'),
  buildHeceWord('hm_2_16', 'SİNCAP', ['SİN', 'CAP'], 'Ağaçlarda ceviz ve palamut toplayan sevimli hayvan 🐿️', 'Hayvanlar'),
  buildHeceWord('hm_2_17', 'MAYMUN', ['MAY', 'MUN'], 'Muz yemeyi ve dallarda sallanmayı seven hayvan 🐵', 'Hayvanlar'),
  buildHeceWord('hm_2_18', 'KUNDUZ', ['KUN', 'DUZ'], 'Nehir kenarında ağaç dallarından baraj yapan canlı 🦫', 'Hayvanlar'),
  buildHeceWord('hm_2_19', 'YILAN', ['YI', 'LAN'], 'Toprakta ve otlar arasında süzülen sürüngen 🐍', 'Hayvanlar'),
  buildHeceWord('hm_2_20', 'PANDA', ['PAN', 'DA'], 'Bambu filizlerini afiyetle yiyen sevimli dev ayı 🐼', 'Hayvanlar'),

  buildHeceWord('hm_2_21', 'ELMA', ['EL', 'MA'], 'Kırmızı, tatlı ve sulu şifa deposu meyve 🍎', 'Meyveler'),
  buildHeceWord('hm_2_22', 'ARMUT', ['AR', 'MUT'], 'Sarı renkli tatlı ve lezzetli sonbahar meyvesi 🍐', 'Meyveler'),
  buildHeceWord('hm_2_23', 'ÇİLEK', ['Çİ', 'LEK'], 'Küçük, kırmızı ve mis gibi kokan yaz meyvesi 🍓', 'Meyveler'),
  buildHeceWord('hm_2_24', 'KİRAZ', ['Kİ', 'RAZ'], 'Çift sapıyla kulaklarımıza taktığımız kırmızı meyve 🍒', 'Meyveler'),
  buildHeceWord('hm_2_25', 'VİŞNE', ['VİŞ', 'NE'], 'Ekşi ve koyu kırmızı rengiyle reçeli yapılan meyve 🍒', 'Meyveler'),
  buildHeceWord('hm_2_26', 'LİMON', ['Lİ', 'MON'], 'Ekşi ve sarı C vitamini zengini meyve 🍋', 'Meyveler'),
  buildHeceWord('hm_2_27', 'KARPUZ', ['KAR', 'PUZ'], 'Dışı yeşil, içi kırmızı serinletici yaz meyvesi 🍉', 'Meyveler'),
  buildHeceWord('hm_2_28', 'KAVUN', ['KA', 'VUN'], 'Sarı kabuklu ve mis gibi kokan tatlı yaz meyvesi 🍈', 'Meyveler'),
  buildHeceWord('hm_2_29', 'ERİK', ['E', 'RİK'], 'Kütür kütür tuz döküp yenen yeşil yaz meyvesi 🍏', 'Meyveler'),
  buildHeceWord('hm_2_30', 'İNCİR', ['İN', 'CİR'], 'İçinde minik çekirdekleri olan tatlı ege meyvesi 🍇', 'Meyveler'),
  buildHeceWord('hm_2_31', 'ÜZÜM', ['Ü', 'ZÜM'], 'Salkım salkım dalında sallanan tatlı meyve 🍇', 'Meyveler'),
  buildHeceWord('hm_2_32', 'HAVUÇ', ['HA', 'VUÇ'], 'Tavşanların çok sevdiği turuncu kök sebze 🥕', 'Sebzeler'),

  buildHeceWord('hm_2_33', 'KALEM', ['KA', 'LEM'], 'Defterimize güzel yazılar yazdığımız gereç ✏️', 'Okul'),
  buildHeceWord('hm_2_34', 'DEFTER', ['DEF', 'TER'], 'Üzerine notlar alıp ödev yaptığımız sayfalar 📓', 'Okul'),
  buildHeceWord('hm_2_35', 'SİLGİ', ['SİL', 'Gİ'], 'Yazı hatalarını tertemiz silen araç 🧼', 'Okul'),
  buildHeceWord('hm_2_36', 'ÇANTA', ['ÇAN', 'TA'], 'Kitap ve defterlerimizi taşıdığımız eşya 🎒', 'Okul'),
  buildHeceWord('hm_2_37', 'SINIF', ['SI', 'NIF'], 'Arkadaşlarımızla ders işlediğimiz oda 🏫', 'Okul'),
  buildHeceWord('hm_2_38', 'KİTAP', ['Kİ', 'TAP'], 'İçinde harika bilgiler ve hikayeler olan eser 📚', 'Okul'),
  buildHeceWord('hm_2_39', 'MASA', ['MA', 'SA'], 'Ders çalışırken üzerine kitap koyduğumuz eşya 🪑', 'Okul'),
  buildHeceWord('hm_2_40', 'TAHTA', ['TAH', 'TA'], 'Öğretmenimizin tebeşirle yazı yazdığı yüzey 📋', 'Okul'),
  buildHeceWord('hm_2_41', 'CETVEL', ['CET', 'VEL'], 'Düzgün çizgiler çizmeye yarayan ölçü aleti 📏', 'Okul'),
  buildHeceWord('hm_2_42', 'BOYA', ['BO', 'YA'], 'Resimlerimizi rengarenk yapmaya yarayan renkler 🎨', 'Okul'),
  buildHeceWord('hm_2_43', 'RESİM', ['RE', 'SİM'], 'Fırça ve kalemle çizdiğimiz güzel görsel çalışma 🖼️', 'Okul'),
  buildHeceWord('hm_2_44', 'MÜZİK', ['MÜ', 'ZİK'], 'Şarkılar söyleyip neşeyle dinlediğimiz melodiler 🎵', 'Okul'),
  buildHeceWord('hm_2_45', 'MASAL', ['MA', 'SAL'], 'Uyurken dinlediğimiz büyüleyici anlatı 📖', 'Okul'),

  buildHeceWord('hm_2_46', 'GÜNEŞ', ['GÜ', 'NEŞ'], 'Dünyamızı ısıtan ve aydınlatan sarı yıldız ☀️', 'Doğa'),
  buildHeceWord('hm_2_47', 'BULUT', ['BU', 'LUT'], 'Gökyüzünde pamuk gibi süzülen beyaz kümeler ☁️', 'Doğa'),
  buildHeceWord('hm_2_48', 'YAĞMUR', ['YAĞ', 'MUR'], 'Bulutlardan yeryüzüne düşen bereketli su damlaları 🌧️', 'Doğa'),
  buildHeceWord('hm_2_49', 'RÜZGAR', ['RÜZ', 'GAR'], 'Ağaçların yapraklarını neşeyle sallayan esinti 💨', 'Doğa'),
  buildHeceWord('hm_2_50', 'ŞİMŞEK', ['ŞİM', 'ŞEK'], 'Gökyüzünü bir anda parlatan güçlü ışık çakması ⚡', 'Doğa'),
  buildHeceWord('hm_2_51', 'YILDIZ', ['YIL', 'DIZ'], 'Geceleri gökyüzünde pırıl pırıl parıldayan 🌟', 'Doğa'),
  buildHeceWord('hm_2_52', 'TOPRAK', ['TOP', 'RAK'], 'Ağaçların ve bitkilerin kök salıp büyüdüğü zemin 🌱', 'Doğa'),
  buildHeceWord('hm_2_53', 'YAPRAK', ['YAP', 'RAK'], 'Ağaçların dallarında yeşeren canlı örtü 🍃', 'Doğa'),
  buildHeceWord('hm_2_54', 'ORMAN', ['OR', 'MAN'], 'Sayısız ağaç ve canlının yaşadığı yemyeşil alan 🌲', 'Doğa'),
  buildHeceWord('hm_2_55', 'DENİZ', ['DE', 'NİZ'], 'Masmavi dalgalarıyla martıların uçtuğu sular 🌊', 'Doğa'),
  buildHeceWord('hm_2_56', 'NEHİR', ['NE', 'HİR'], 'Dağlardan denizlere doğru çağıldayarak akan su 🏞️', 'Doğa'),
  buildHeceWord('hm_2_57', 'ÇİÇEK', ['Çİ', 'ÇEK'], 'Mis gibi kokan renkli kır bitkisi 🌸', 'Doğa'),
  buildHeceWord('hm_2_58', 'AĞAÇ', ['A', 'ĞAÇ'], 'Gövdesi odunsu, dallarında meyve veren doğa dostu 🌳', 'Doğa'),
  buildHeceWord('hm_2_59', 'BAHÇE', ['BAH', 'ÇE'], 'Evimizin önünde çiçekler ve sebzeler yetiştirdiğimiz yer 🏡', 'Doğa'),
  buildHeceWord('hm_2_60', 'KÖYLER', ['KÖY', 'LER'], 'Temiz havası ve tarlaları olan şirin yerleşim yerleri 🚜', 'Doğa'),
  buildHeceWord('hm_2_61', 'GÖZLÜK', ['GÖZ', 'LÜK'], 'Gözlerimizin daha net görmesini sağlayan camlı araç 👓', 'Eşyalar'),
  buildHeceWord('hm_2_62', 'SÖZLÜK', ['SÖZ', 'LÜK'], 'Kelimelerin anlamlarını öğrendiğimiz başvuru kitabı 📖', 'Eğitim'),
  buildHeceWord('hm_2_63', 'TERLİK', ['TER', 'LİK'], 'Evde ayaklarımıza giydiğimiz rahat giyecek 🩴', 'Giyim'),
  buildHeceWord('hm_2_64', 'ÇORAP', ['ÇO', 'RAP'], 'Ayaklarımızı sıcak tutan yumuşak giysi 🧦', 'Giyim'),
  buildHeceWord('hm_2_65', 'ŞAPKA', ['ŞAP', 'KA'], 'Başımızı güneşten ve soğuktan koruyan başlık 🧢', 'Giyim'),
  buildHeceWord('hm_2_66', 'KEMER', ['KE', 'MER'], 'Pantolonumuzun belimize oturmasını sağlayan deri şerit 🥋', 'Giyim'),
  buildHeceWord('hm_2_67', 'DÜĞME', ['DÜĞ', 'ME'], 'Gömleğimizi ve ceketimizi iliklemeye yarayan yuvarlak parça 🔘', 'Giyim'),
  buildHeceWord('hm_2_68', 'BIÇAK', ['BI', 'ÇAK'], 'Mutfakta sebze ve meyveleri dilimlemek için kullanılan araç 🔪', 'Mutfak'),
  buildHeceWord('hm_2_69', 'TABAK', ['TA', 'BAK'], 'Yemeklerimizin servis edildiği geniş mutfak eşyası 🍽️', 'Mutfak'),
  buildHeceWord('hm_2_70', 'KAĞIT', ['KA', 'ĞIT'], 'Üzerine yazı yazıp resim çizdiğimiz beyaz yaprak 📄', 'Okul'),
  buildHeceWord('hm_2_71', 'DOSYA', ['DOS', 'YA'], 'Önemli kağıt ve belgeleri düzenli sakladığımız kapak 📁', 'Okul'),
  buildHeceWord('hm_2_72', 'FIRÇA', ['FIR', 'ÇA'], 'Resim yaparken boya sürmek için kullandığımız araç 🖌️', 'Sanat'),
  buildHeceWord('hm_2_73', 'EKMEK', ['EK', 'MEK'], 'Her öğünde sofralarımızda bulunan temel besin 🍞', 'Yiyecekler'),
  buildHeceWord('hm_2_74', 'PEYNİR', ['PEY', 'NİR'], 'Sütten yapılan kalsiyum deposu beyaz kahvaltılık 🧀', 'Yiyecekler'),
  buildHeceWord('hm_2_75', 'ZEYTİN', ['ZEY', 'TİN'], 'Kahvaltılarımızın vazgeçilmezi siyah ve yeşil taneler 🫒', 'Yiyecekler'),
  buildHeceWord('hm_2_76', 'REÇEL', ['RE', 'ÇEL'], 'Meyvelerin şekerle kaynatılmasıyla yapılan tatlı kahvaltılık 🍯', 'Yiyecekler'),
  buildHeceWord('hm_2_77', 'KÖFTE', ['KÖF', 'TE'], 'Kıymadan yoğrulup ızgarada pişirilen lezzetli yemek 🧆', 'Yiyecekler'),
  buildHeceWord('hm_2_78', 'PİLAV', ['Pİ', 'LAV'], 'Pirinç veya bulgurdan yapılan lezzetli yemek 🍚', 'Yiyecekler'),
  buildHeceWord('hm_2_79', 'BÖREK', ['BÖ', 'REK'], 'Yufka arasına peynir konularak fırında pişirilen hamur işi 🥟', 'Yiyecekler'),
  buildHeceWord('hm_2_80', 'CEVİZ', ['CE', 'VİZ'], 'Sert kabuklu zihin açan faydalı kuru yemiş 🧠', 'Besinler'),
  buildHeceWord('hm_2_81', 'FINDIK', ['FIN', 'DIK'], 'Karadeniz bölgemizde yetişen lezzetli ve çıtır yemiş 🌰', 'Besinler'),
  buildHeceWord('hm_2_82', 'FISTIK', ['FIS', 'TIK'], 'Kabuğu kırılarak yenen lezzetli kuruyemiş 🥜', 'Besinler'),
  buildHeceWord('hm_2_83', 'BADEM', ['BA', 'DEM'], 'Ağaçta yetişen bademcik biçimli faydalı çekirdek 🌰', 'Besinler'),
  buildHeceWord('hm_2_84', 'AYRAN', ['AY', 'RAN'], 'Yoğurt, su ve tuzla çırpılan serinletici milli içeceğimiz 🥛', 'İçecekler'),
  buildHeceWord('hm_2_85', 'DURAK', ['DU', 'RAK'], 'Otobüs ve dolmuşların yolcu aldığı bekleme yeri 🚏', 'Ulaşım'),
  buildHeceWord('hm_2_86', 'BAYRAK', ['BAY', 'RAK'], 'Gökyüzünde gururla dalgalanan ay yıldızlı simgemiz 🇹🇷', 'Milli Değerler'),
  buildHeceWord('hm_2_87', 'VATAN', ['VA', 'TAN'], 'Üzerinde özgürce yaşadığımız cennet yurdumuz 🇹🇷', 'Milli Değerler'),
  buildHeceWord('hm_2_88', 'SEVGİ', ['SEV', 'Gİ'], 'Kalplerimizi ısıtan en güzel ve temiz duygu ❤️', 'Duygular'),
  buildHeceWord('hm_2_89', 'SAYGI', ['SAY', 'GI'], 'Büyüklerimize ve çevremize gösterdiğimiz nezaket ve hürmet 🤝', 'Değerler'),
  buildHeceWord('hm_2_90', 'MUTLU', ['MUT', 'LU'], 'Yüzü gülen, sevinçle dolu olan kimse 😊', 'Duygular'),

  // ==========================================
  // 3 HECELİ KELİMELER (60 Adet)
  // ==========================================
  buildHeceWord('hm_3_1', 'KELEBEK', ['KE', 'LE', 'BEK'], 'Rengarenk kanatlarıyla çiçekten çiçeğe konan böcek 🦋', 'Hayvanlar'),
  buildHeceWord('hm_3_2', 'ZÜRAFA', ['ZÜ', 'RA', 'FA'], 'Çok uzun boynuyla ağaç yapraklarını yiyen dostumuz 🦒', 'Hayvanlar'),
  buildHeceWord('hm_3_3', 'KURBAĞA', ['KUR', 'BA', 'ĞA'], 'Vırak vırak sesiyle gölde zıplayan yeşil hayvan 🐸', 'Hayvanlar'),
  buildHeceWord('hm_3_4', 'KARINCA', ['KA', 'RIN', 'CA'], 'Birlikte yuvalarına yiyecek taşıyan çok çalışkan canlı 🐜', 'Hayvanlar'),
  buildHeceWord('hm_3_5', 'GÜVERCİN', ['GÜ', 'VER', 'CİN'], 'Barışın simgesi, kanat çırpan sevimli kuş 🕊️', 'Hayvanlar'),
  buildHeceWord('hm_3_6', 'PAPAĞAN', ['PA', 'PA', 'ĞAN'], 'Konuşulan sözleri neşeyle taklit eden renkli kuş 🦜', 'Hayvanlar'),
  buildHeceWord('hm_3_7', 'DİNOZOR', ['Dİ', 'NO', 'ZOR'], 'Milyonlarca yıl önce dünyada yaşamış devasa canlı 🦖', 'Hayvanlar'),
  buildHeceWord('hm_3_8', 'KARTALLAR', ['KAR', 'TAL', 'LAR'], 'Gökyüzünün en yükseklerinde uçan güçlü kuşlar 🦅', 'Hayvanlar'),
  buildHeceWord('hm_3_9', 'KUZULAR', ['KU', 'ZU', 'LAR'], 'Kırda melerek koşturan sevimli koyun yavruları 🐑', 'Hayvanlar'),
  buildHeceWord('hm_3_10', 'BALIKLAR', ['BA', 'LIK', 'LAR'], 'Denizin masmavi sularında yüzen minik canlılar 🐠', 'Hayvanlar'),

  buildHeceWord('hm_3_11', 'PAPATYA', ['PA', 'PAT', 'YA'], 'Sarı göbekli, beyaz taç yapraklı narin kır çiçeği 🌼', 'Doğa'),
  buildHeceWord('hm_3_12', 'PORTAKAL', ['POR', 'TA', 'KAL'], 'Turuncu kabuklu bol C vitaminli sulu kış meyvesi 🍊', 'Meyveler'),
  buildHeceWord('hm_3_13', 'ŞEFTALİ', ['ŞEF', 'TA', 'Lİ'], 'Tüylü kabuğu ve tatlı aromasıyla sevilen yaz meyvesi 🍑', 'Meyveler'),
  buildHeceWord('hm_3_14', 'KAYISI', ['KA', 'YI', 'SI'], 'Malatya ilimizde bolca yetişen tatlı sarı meyve 🍑', 'Meyveler'),
  buildHeceWord('hm_3_15', 'ANANAS', ['A', 'NA', 'NAS'], 'Tepesinde yeşil yaprak tacı olan egzotik meyve 🍍', 'Meyveler'),
  buildHeceWord('hm_3_16', 'DOMATES', ['DO', 'MA', 'TES'], 'Kahvaltılarda ve salatalarda çok sevilen kırmızı sebze 🍅', 'Sebzeler'),
  buildHeceWord('hm_3_17', 'PATATES', ['PA', 'TA', 'TES'], 'Toprak altında yetişen kızartması ve püresi yapılan sebze 🥔', 'Sebzeler'),
  buildHeceWord('hm_3_18', 'PATLICAN', ['PAT', 'LI', 'CAN'], 'Koyu mor renkli lezzetli yemekler yapılan sebze 🍆', 'Sebzeler'),
  buildHeceWord('hm_3_19', 'ISPANAK', ['IS', 'PA', 'NAK'], 'Temel Reis gibi bizi güçlü yapan yeşil yapraklı sebze 🥬', 'Sebzeler'),
  buildHeceWord('hm_3_20', 'PIRASA', ['PI', 'RA', 'SA'], 'Zeytinyağlı yemeği yapılan kışlık lezzetli sebze 🥣', 'Sebzeler'),
  buildHeceWord('hm_3_21', 'BEZELYE', ['BE', 'ZEL', 'YE'], 'Kabuğunun içinden yuvarlak yeşil taneler çıkan sebze 🟢', 'Sebzeler'),
  buildHeceWord('hm_3_22', 'SARIMSAK', ['SA', 'RIM', 'SAK'], 'Yemeklere lezzet katan doğal antibiyotik sebze 🧄', 'Sebzeler'),

  buildHeceWord('hm_3_23', 'ÖĞRENCİ', ['ÖĞ', 'REN', 'Cİ'], 'Okulda yeni bilgiler öğrenip başarıyla büyüyen çocuk 👦', 'Okul'),
  buildHeceWord('hm_3_24', 'ÖĞRETMEN', ['ÖĞ', 'RET', 'MEN'], 'Bize okumayı, sevgiyi ve bilimi öğreten rehberimiz 👩‍🏫', 'Okul'),
  buildHeceWord('hm_3_25', 'KİTAPLIK', ['Kİ', 'TAP', 'LIK'], 'Okuduğumuz hikaye kitaplarını düzenle dizdiğimiz raf 📚', 'Okul'),
  buildHeceWord('hm_3_26', 'PENCERE', ['PEN', 'CE', 'RE'], 'Odamıza güneş ışığı ve temiz hava girmesini sağlayan açıklık 🪟', 'Ev Eşyası'),
  buildHeceWord('hm_3_27', 'SANDALYE', ['SAN', 'DAL', 'YE'], 'Masa başında ders çalışırken üzerine oturduğumuz eşya 🪑', 'Ev Eşyası'),
  buildHeceWord('hm_3_28', 'TELEFON', ['TE', 'LE', 'FON'], 'Uzaklardaki arkadaşlarımızla konuştuğumuz teknolojik araç 📱', 'Teknoloji'),
  buildHeceWord('hm_3_29', 'ARABA', ['A', 'RA', 'BA'], 'Dört tekerleğiyle yollarda yolculuk yaptığımız taşıt 🚗', 'Taşıtlar'),
  buildHeceWord('hm_3_30', 'OTOBÜS', ['O', 'TO', 'BÜS'], 'Şehir içinde çok sayıda yolcuyu taşıyan büyük araç 🚌', 'Taşıtlar'),
  buildHeceWord('hm_3_31', 'UÇAKLAR', ['U', 'ÇAK', 'LAR'], 'Bulutların üzerinde süzülen kanatlı hava taşıtları ✈️', 'Taşıtlar'),
  buildHeceWord('hm_3_32', 'BİSİKLET', ['Bİ', 'SİK', 'LET'], 'Pedal çevirerek parkta spor yaptığımız iki tekerlekli araç 🚲', 'Taşıtlar'),
  buildHeceWord('hm_3_33', 'GEMİLER', ['GE', 'Mİ', 'LER'], 'Masmavi denizlerde yolcu ve yük taşıyan deniz araçları 🚢', 'Taşıtlar'),
  buildHeceWord('hm_3_34', 'KAMYONET', ['KAM', 'YO', 'NET'], 'Kasasında yük ve koli taşıyan motorlu taşıt 🚚', 'Taşıtlar'),

  buildHeceWord('hm_3_35', 'DONDURMA', ['DON', 'DUR', 'MA'], 'Yaz günlerinde külaha konup afiyetle yenen soğuk tatlı 🍦', 'Yiyecekler'),
  buildHeceWord('hm_3_36', 'YUMURTA', ['YU', 'MUR', 'TA'], 'Sabah kahvaltılarında bizi güçlü kılan protein deposu 🥚', 'Yiyecekler'),
  buildHeceWord('hm_3_37', 'TEREYAĞ', ['TE', 'RE', 'YAĞ'], 'Sütten yapılan lezzetli ve besleyici kahvaltılık 🧈', 'Yiyecekler'),
  buildHeceWord('hm_3_38', 'MAKARNA', ['MA', 'KAR', 'NA'], 'Domates sosuyla çok lezzetli olan sevilen yemek 🍝', 'Yiyecekler'),
  buildHeceWord('hm_3_39', 'PASTALAR', ['PAS', 'TA', 'LAR'], 'Doğum günlerinde mum üflediğimiz tatlı yiyecekler 🎂', 'Yiyecekler'),
  buildHeceWord('hm_3_40', 'ÇORBALAR', ['ÇOR', 'BA', 'LAR'], 'Kış günlerinde içimizi ısıtan sıcacık lezzetli başlangıç 🍲', 'Yiyecekler'),

  buildHeceWord('hm_3_41', 'DOLAPLAR', ['DO', 'LAP', 'LAR'], 'Giysilerimizi ve kitaplarımızı düzenli yerleştirdiğimiz yer 🚪', 'Ev Eşyası'),
  buildHeceWord('hm_3_42', 'HALILAR', ['HA', 'LI', 'LAR'], 'Evlerimizin zeminini sıcak tutan desenli örtüler 🧶', 'Ev Eşyası'),
  buildHeceWord('hm_3_43', 'KOLTUKLAR', ['KOL', 'TUK', 'LAR'], 'Oturma odasında dinlenirken oturduğumuz yumuşak koltuklar 🛋️', 'Ev Eşyası'),
  buildHeceWord('hm_3_44', 'SÜRAHİ', ['SÜ', 'RA', 'Hİ'], 'Masaya su koymak için kullandığımız kulplu cam kap 🫗', 'Mutfak'),
  buildHeceWord('hm_3_45', 'TENCERE', ['TEN', 'CE', 'RE'], 'Ocakta çorba ve yemek pişirilen kapaklı mutfak aracı 🍲', 'Mutfak'),
  buildHeceWord('hm_3_46', 'BARDAKLAR', ['BAR', 'DAK', 'LAR'], 'İçine su ve süt koyup içtiğimiz eşyalar 🥛', 'Mutfak'),
  buildHeceWord('hm_3_47', 'KAŞIKLAR', ['KA', 'ŞIK', 'LAR'], 'Çorbamızı içerken kullandığımız mutfak gereçleri 🥄', 'Mutfak'),
  buildHeceWord('hm_3_48', 'ÇATALLAR', ['ÇA', 'TAL', 'LAR'], 'Makarna yerken kullandığımız uçlu mutfak aleti 🍴', 'Mutfak'),

  buildHeceWord('hm_3_49', 'ELBİSE', ['EL', 'Bİ', 'SE'], 'Özel günlerde giyilen tek parça şık giysi 👗', 'Giyim'),
  buildHeceWord('hm_3_50', 'PANTOLON', ['PAN', 'TO', 'LON'], 'Bacaklarımızı saran iki paçalı temel giysi 👖', 'Giyim'),
  buildHeceWord('hm_3_51', 'GÖMLEKLER', ['GÖM', 'LEK', 'LER'], 'Yakası ve düğmeleri olan şık üst giysiler 👔', 'Giyim'),
  buildHeceWord('hm_3_52', 'CEKETLER', ['CE', 'KET', 'LER'], 'Serin havalarda üzerimize giydiğimiz düğmeli üst giysi 🧥', 'Giyim'),
  buildHeceWord('hm_3_53', 'ELDİVEN', ['EL', 'Dİ', 'VEN'], 'Kışın ellerimizi soğuktan koruyan yünlü eşya 🧤', 'Giyim'),
  buildHeceWord('hm_3_54', 'ATKILAR', ['AT', 'KI', 'LAR'], 'Kış günlerinde boynumuzu sıcacık saran örgü eşyalar 🧣', 'Giyim'),
  buildHeceWord('hm_3_55', 'ÇİZMELER', ['ÇİZ', 'ME', 'LER'], 'Yağmurlu ve karlı günlerde giyilen uzun ayakkabılar 👢', 'Giyim'),
  buildHeceWord('hm_3_56', 'ŞEMSİYE', ['ŞEM', 'Sİ', 'YE'], 'Yağmur yağdığında açıp ıslanmaktan korunduğumuz eşya ☂️', 'Eşyalar'),

  buildHeceWord('hm_3_57', 'İLKBAHAR', ['İLK', 'BA', 'HAR'], 'Ağaçların çiçek açıp doğanın uyandığı neşeli mevsim 🌸', 'Mevsimler'),
  buildHeceWord('hm_3_58', 'SONBAHAR', ['SON', 'BA', 'HAR'], 'Sarı yaprakların döküldüğü ve havaların serinlediği mevsim 🍂', 'Mevsimler'),
  buildHeceWord('hm_3_59', 'GÜNDÜZLER', ['GÜN', 'DÜZ', 'LER'], 'Güneşin gökyüzünde olduğu aydınlık zaman dilimi ☀️', 'Zaman'),
  buildHeceWord('hm_3_60', 'GECELER', ['GE', 'CE', 'LER'], 'Ay ve yıldızların gökyüzünde parladığı uyku vakti 🌙', 'Zaman'),
  buildHeceWord('hm_3_61', 'KORİDOR', ['KO', 'Rİ', 'DOR'], 'Okulda sınıflar arasında yürüdüğümüz geniş geçit 🏫', 'Okul'),
  buildHeceWord('hm_3_62', 'TENEFFÜS', ['TE', 'NEF', 'FÜS'], 'Ders arasında bahçede koşup eğlendiğimiz dinlenme vakti 🔔', 'Okul'),
  buildHeceWord('hm_3_63', 'BESLENME', ['BES', 'LEN', 'ME'], 'Teneffüste meyve ve sandviç yediğimiz çantamızdaki saat 🥪', 'Okul'),
  buildHeceWord('hm_3_64', 'MÜDÜRÜM', ['MÜ', 'DÜ', 'RÜM'], 'Okulumuzu başarıyla yöneten sevgili yöneticimiz 👨‍💼', 'Okul'),
  buildHeceWord('hm_3_65', 'GÖZLÜKLÜ', ['GÖZ', 'LÜK', 'LÜ'], 'Gözlük takan sevimli arkadaşımız 👓', 'Kişi'),
  buildHeceWord('hm_3_66', 'TİYATRO', ['Tİ', 'YAT', 'RO'], 'Sahnede oyuncuların canlandırdığı eğitici gösteri 🎭', 'Sanat'),
  buildHeceWord('hm_3_67', 'SİNEMA', ['Sİ', 'NE', 'MA'], 'Kocaman perdede film izlediğimiz salon 🎬', 'Sanat'),
  buildHeceWord('hm_3_68', 'BAĞLAMA', ['BAĞ', 'LA', 'MA'], 'Türkülerimize eşlik eden telli Türk halk çalgısı 🪕', 'Müzik'),
  buildHeceWord('hm_3_69', 'GİTARLAR', ['Gİ', 'TAR', 'LAR'], 'Gençlerin severek çaldığı melodik telli enstrüman 🎸', 'Müzik'),
  buildHeceWord('hm_3_70', 'PİYANO', ['Pİ', 'YA', 'NO'], 'Siyah beyaz tuşlarıyla harika besteler çalınan çalgı 🎹', 'Müzik'),
  buildHeceWord('hm_3_71', 'KEMANCI', ['KE', 'MAN', 'CI'], 'Yayını tellere sürterek keman çalan müzisyen 🎻', 'Müzik'),
  buildHeceWord('hm_3_72', 'ASTRONOT', ['AS', 'TRO', 'NOT'], 'Uzay gemisiyle yıldızlara ve aya giden bilim insanı 👨‍🚀', 'Bilim'),
  buildHeceWord('hm_3_73', 'TELESKOP', ['TE', 'LES', 'KOP'], 'Geceleri yıldızları ve gezegenleri incelediğimiz cihaz 🔭', 'Bilim'),
  buildHeceWord('hm_3_74', 'MİKROSKOP', ['MİK', 'ROS', 'KOP'], 'Gözle görülmeyen minik canlıları büyüten alet 🔬', 'Bilim'),
  buildHeceWord('hm_3_75', 'GEZEGEN', ['GE', 'ZE', 'GEN'], 'Güneşin etrafında dönen gök cisimleri 🪐', 'Uzay'),
  buildHeceWord('hm_3_76', 'OKYANUS', ['OK', 'YA', 'NUS'], 'Kıtalar arasındaki devasa ve derin su kütlesi 🌊', 'Coğrafya'),
  buildHeceWord('hm_3_77', 'ŞELALE', ['ŞE', 'LA', 'LE'], 'Yüksek kayalıklardan köpürerek dökülen coşkulu su 🌊', 'Doğa'),
  buildHeceWord('hm_3_78', 'YANARDAĞ', ['YA', 'NAR', 'DAĞ'], 'İçinden lavlar ve dumanlar püsküren dağ 🌋', 'Doğa'),
  buildHeceWord('hm_3_79', 'AKVARYUM', ['AK', 'VAR', 'YUM'], 'İçinde renkli balıkların yüzdüğü cam fanus 🐠', 'Canlılar'),
  buildHeceWord('hm_3_80', 'KANGURU', ['KAN', 'GU', 'RU'], 'Kesesinde yavrusunu taşıyıp uzun zıplayan sevimli hayvan 🦘', 'Hayvanlar'),
  buildHeceWord('hm_3_81', 'PENGUEN', ['PEN', 'GU', 'EN'], 'Buzullar üzerinde paytak adımlarla yürüyen sevimli kuş 🐧', 'Hayvanlar'),
  buildHeceWord('hm_3_82', 'PELİKAN', ['PE', 'Lİ', 'KAN'], 'Gagasının altında kocaman su kesesi olan deniz kuşu 🦤', 'Hayvanlar'),
  buildHeceWord('hm_3_83', 'KARTOPU', ['KAR', 'TO', 'PU'], 'Kışın arkadaşlarımızla eğlenerek oynadığımız oyun ⛄', 'Kış'),
  buildHeceWord('hm_3_84', 'KIZAKLAR', ['KI', 'ZAK', 'LAR'], 'Karlı tepelerden aşağı neşeyle kaydığımız araç 🛷', 'Kış'),
  buildHeceWord('hm_3_85', 'FUTBOLCU', ['FUT', 'BOL', 'CU'], 'Yeşil sahada topla gol atan sporcu ⚽', 'Spor'),
  buildHeceWord('hm_3_86', 'BASKETBOL', ['BAS', 'KET', 'BOL'], 'Pota içine top atarak sayı kazanılan heyecanlı spor 🏀', 'Spor'),
  buildHeceWord('hm_3_87', 'VOLEYBOL', ['VO', 'LEY', 'BOL'], 'File üzerinden topla oynanan neşeli takım oyunu 🏐', 'Spor'),
  buildHeceWord('hm_3_88', 'YÜZÜCÜ', ['YÜ', 'ZÜ', 'CÜ'], 'Havuzda ve denizde kulaç atarak yarışan sporcu 🏊', 'Spor'),
  buildHeceWord('hm_3_89', 'DOKTORLAR', ['DOK', 'TOR', 'LAR'], 'Hastaları muayene edip şifa veren sağlıkçılar 🩺', 'Meslekler'),
  buildHeceWord('hm_3_90', 'HEMŞİRE', ['HEM', 'Şİ', 'RE'], 'Hastalara şefkatle bakım yapıp ilaçlarını veren sağlık çalışanı 💉', 'Meslekler'),

  // ==========================================
  // 4 HECELİ KELİMELER (40 Adet)
  // ==========================================
  buildHeceWord('hm_4_1', 'BİLGİSAYAR', ['BİL', 'Gİ', 'SA', 'YAR'], 'Ödevlerimizi yapıp araştırmalar yaptığımız akıllı makine 💻', 'Teknoloji'),
  buildHeceWord('hm_4_2', 'TELEVİZYON', ['TE', 'LE', 'VİZ', 'YON'], 'Haberleri ve eğitici belgeselleri izlediğimiz ekran 📺', 'Teknoloji'),
  buildHeceWord('hm_4_3', 'HELİKOPTER', ['HE', 'Lİ', 'KOP', 'TER'], 'Tepesindeki pervanesi hızla dönerek uçan hava taşıtı 🚁', 'Taşıtlar'),
  buildHeceWord('hm_4_4', 'DENİZALTI', ['DE', 'NİZ', 'AL', 'TI'], 'Okyanusların derinliklerinde dalıp yüzen özel gemi 🚢', 'Taşıtlar'),
  buildHeceWord('hm_4_5', 'KAPLUMBAĞA', ['KAP', 'LUM', 'BA', 'ĞA'], 'Sırtında koruyucu kabuğunu taşıyan sevimli yavaş hayvan 🐢', 'Hayvanlar'),
  buildHeceWord('hm_4_6', 'KERTENKELE', ['KER', 'TEN', 'KE', 'LE'], 'Güneşlenmeyi çok seven hızlı ve çevik sürüngen 🦎', 'Hayvanlar'),
  buildHeceWord('hm_4_7', 'GÖKKUŞAĞI', ['GÖK', 'KU', 'ŞA', 'ĞI'], 'Yağmurdan sonra gökyüzünde beliren yedi renkli yay 🌈', 'Doğa'),
  buildHeceWord('hm_4_8', 'MANDALİNA', ['MAN', 'DA', 'Lİ', 'NA'], 'Kabuğu kolayca soyulan kokulu tatlı kış meyvesi 🍊', 'Meyveler'),
  buildHeceWord('hm_4_9', 'BATTANİYE', ['BAT', 'TA', 'Nİ', 'YE'], 'Kış gecelerinde yatağımızda üzerimizi örten sıcak örtü 🛏️', 'Ev Eşyası'),
  buildHeceWord('hm_4_10', 'AYAKKABI', ['A', 'YAK', 'KA', 'BI'], 'Dışarıda yürürken ayağımızı koruyan giyecek 👟', 'Giyim'),
  buildHeceWord('hm_4_11', 'ÇİKOLATA', ['Çİ', 'KO', 'LA', 'TA'], 'Kakaodan yapılan bayramlarda ikram edilen tatlı 🍫', 'Yiyecekler'),
  buildHeceWord('hm_4_12', 'KAHVALTILIK', ['KAH', 'VAL', 'TI', 'LIK'], 'Sabahları güne başlarken yediğimiz peynir, zeytin, bal 🧀', 'Yiyecekler'),
  buildHeceWord('hm_4_13', 'LİMONATA', ['Lİ', 'MO', 'NA', 'TA'], 'Limon ve nane ile yapılan buz gibi ferahlatıcı içecek 🥤', 'Yiyecekler'),
  buildHeceWord('hm_4_14', 'DONDURMACI', ['DON', 'DUR', 'MA', 'CI'], 'Yaz aylarında lezzetli dondurmalar satan usta 🍦', 'Meslekler'),
  buildHeceWord('hm_4_15', 'FOTOĞRAFÇI', ['FO', 'TOĞ', 'RAF', 'ÇI'], 'En güzel anlarımızı kamerasıyla ölümsüzleştiren sanatçı 📷', 'Meslekler'),
  buildHeceWord('hm_4_16', 'İTFAİYE', ['İT', 'FA', 'İ', 'YE'], 'Yangınları cesurca söndüren kahraman ekip 🚒', 'Meslekler'),
  buildHeceWord('hm_4_17', 'ÇİÇEKÇİLER', ['Çİ', 'ÇEK', 'Çİ', 'LER'], 'Rengarenk güller ve papatyalar hazırlayan esnaflar 💐', 'Meslekler'),
  buildHeceWord('hm_4_18', 'KİTAPÇILAR', ['Kİ', 'TAP', 'ÇI', 'LAR'], 'Bizlere yeni yeni masal ve bilim kitapları sunan yerler 📚', 'Meslekler'),
  buildHeceWord('hm_4_19', 'FIRINCILAR', ['FI', 'RIN', 'CI', 'LAR'], 'Sımsıcak taze ekmekler ve pideler pişiren ustalar 🥖', 'Meslekler'),
  buildHeceWord('hm_4_20', 'KÜTÜPHANE', ['KÜ', 'TÜP', 'HA', 'NE'], 'Binlerce kitabın sessizce okunduğu bilgi yuvası 🏛️', 'Mekanlar'),
  buildHeceWord('hm_4_21', 'HASTANELER', ['HAS', 'TA', 'NE', 'LER'], 'Doktorların bizleri muayene edip iyileştirdiği binalar 🏥', 'Mekanlar'),
  buildHeceWord('hm_4_22', 'ECZANELER', ['EC', 'ZA', 'NE', 'LER'], 'İlaçlarımızı temin ettiğimiz sağlık noktaları 💊', 'Mekanlar'),
  buildHeceWord('hm_4_23', 'POSTANELER', ['POS', 'TA', 'NE', 'LER'], 'Mektup ve kargoların sevdiklerimize ulaştırıldığı yer ✉️', 'Mekanlar'),
  buildHeceWord('hm_4_24', 'MERDİVENLER', ['MER', 'Dİ', 'VEN', 'LER'], 'Katlar arasında adım adım inip çıkmamızı sağlayan basamaklar 🪜', 'Ev Eşyası'),
  buildHeceWord('hm_4_25', 'ARKADAŞLAR', ['AR', 'KA', 'DAŞ', 'LAR'], 'Teneffüslerde birlikte oyunlar oynayıp paylaştığımız can dostlar 👫', 'İnsanlar'),
  buildHeceWord('hm_4_26', 'CUMHURİYET', ['CUM', 'HU', 'Rİ', 'YET'], 'Milletin kendi yöneticilerini kendisinin seçtiği aydınlık yönetim 🇹🇷', 'Genel Kültür'),
  buildHeceWord('hm_4_27', 'ÇOCUKLARIM', ['ÇO', 'CUK', 'LA', 'RIM'], 'Gözümüzün nuru neşeli minik yavrularımız 🧒', 'İnsanlar'),
  buildHeceWord('hm_4_28', 'OKULLARIM', ['O', 'KUL', 'LA', 'RIM'], 'Her gün yeni bilgilerle aydınlandığımız yuvalarımız 🏫', 'Okul'),
  buildHeceWord('hm_4_29', 'DEFTERLERİM', ['DEF', 'TER', 'LE', 'RİM'], 'Güzel yazılarımızla doldurduğumuz çalışma yaprakları 📝', 'Okul'),
  buildHeceWord('hm_4_30', 'SİLGİLERİM', ['SİL', 'Gİ', 'LE', 'RİM'], 'Kalem kutumuzda duran renkli yazı düzelticiler 🧼', 'Okul'),
  buildHeceWord('hm_4_31', 'ÇANTALARIM', ['ÇAN', 'TA', 'LA', 'RIM'], 'Omuzlarımıza takıp okula gittiğimiz eşyalarımız 🎒', 'Okul'),
  buildHeceWord('hm_4_32', 'ÇİFTLİKLERDE', ['ÇİFT', 'LİK', 'LER', 'DE'], 'Koyunların, ineklerin ve tavukların yaşadığı kırsal alanlarda 🚜', 'Doğa'),
  buildHeceWord('hm_4_33', 'GÖKYÜZÜNDE', ['GÖK', 'YÜ', 'ZÜN', 'DE'], 'Kuşların ve uçakların özgürce süzüldüğü masmavi semada ☁️', 'Doğa'),
  buildHeceWord('hm_4_34', 'YERYÜZÜNDE', ['YER', 'YÜ', 'ZÜN', 'DE'], 'Bütün canlıların üzerinde barışla yaşadığı güzel dünyamızda 🌍', 'Doğa'),
  buildHeceWord('hm_4_35', 'ŞEKERCİLER', ['ŞE', 'KER', 'Cİ', 'LER'], 'Rengarenk lokumlar ve akide şekerleri hazırlayan dükkanlar 🍬', 'Meslekler'),
  buildHeceWord('hm_4_36', 'OYUNCAKLAR', ['O', 'YUN', 'CAK', 'LAR'], 'Oyun kurarken neşeyle oynadığımız arabalar ve bebekler 🧸', 'Eşyalar'),
  buildHeceWord('hm_4_37', 'KAYDIRAKLAR', ['KAY', 'DI', 'RAK', 'LAR'], 'Çocuk parklarında neşeyle kayıp eğlendiğimiz araçlar 🛝', 'Eşyalar'),
  buildHeceWord('hm_4_38', 'SALINCAKLAR', ['SA', 'LIN', 'CAK', 'LAR'], 'Gökyüzüne doğru ileri geri sallandığımız park oyuncağı 🎠', 'Eşyalar'),
  buildHeceWord('hm_4_39', 'GÜVERCİNLER', ['GÜ', 'VER', 'CİN', 'LER'], 'Meydanlarda yem attığımız kanat çırpan kuşlar 🕊️', 'Hayvanlar'),
  buildHeceWord('hm_4_40', 'ÇALIŞKANLAR', ['ÇA', 'LIŞ', 'KAN', 'LAR'], 'Derslerine gayretle çalışan başarılı öğrenciler 🌟', 'Kişilik'),
  buildHeceWord('hm_4_41', 'KARDANADAM', ['KAR', 'DAN', 'A', 'DAM'], 'Kardan yapıp burnuna havuç taktığımız sevimli dost ☃️', 'Kış'),
  buildHeceWord('hm_4_42', 'GÖZLEMEVİ', ['GÖZ', 'LEM', 'E', 'Vİ'], 'Yıldızları dev teleskoplarla inceleyen kubbeli bina 🔭', 'Bilim'),
  buildHeceWord('hm_4_43', 'GEZEGENLER', ['GE', 'ZE', 'GEN', 'LER'], 'Güneşin etrafında dans eden gök cisimleri 🪐', 'Uzay'),
  buildHeceWord('hm_4_44', 'YILDIZLARIM', ['YIL', 'DIZ', 'LA', 'RIM'], 'Geceleri odamın penceresinden parıldayan ışıklar ✨', 'Uzay'),
  buildHeceWord('hm_4_45', 'KAHRAMANLAR', ['KAH', 'RA', 'MAN', 'LAR'], 'Vatanımızı canla başla koruyan cesur yiğitler 🦸', 'Değerler'),
  buildHeceWord('hm_4_46', 'YARDIMSEVER', ['YAR', 'DIM', 'SE', 'VER'], 'İhtiyacı olan herkese el uzatan iyi kalpli insan 🤝', 'Değerler'),
  buildHeceWord('hm_4_47', 'ARAŞTIRMA', ['A', 'RAŞ', 'TIR', 'MA'], 'Yeni bilgiler keşfetmek için yapılan dikkatli inceleme 🔍', 'Bilim'),
  buildHeceWord('hm_4_48', 'DENEYLERİM', ['DE', 'NEY', 'LE', 'RİM'], 'Fen dersinde merakla yaptığımız deney çalışmaları 🧪', 'Bilim'),
  buildHeceWord('hm_4_49', 'MATEMATİK', ['MA', 'TE', 'MA', 'TİK'], 'Sayılar, şekiller ve işlemlerle dolu zevkli ders 📐', 'Dersler'),
  buildHeceWord('hm_4_50', 'GEOMETRİ', ['GE', 'O', 'MET', 'Rİ'], 'Kare, üçgen ve çemberleri tanıdığımız matematik dalı 🔺', 'Dersler'),
  buildHeceWord('hm_4_51', 'HİKAYELER', ['Hİ', 'KA', 'YE', 'LER'], 'Kitaplarda keyifle okuduğumuz maceralı anlatılar 📖', 'Edebiyat'),
  buildHeceWord('hm_4_52', 'ŞİİRLERİM', ['Şİ', 'İR', 'LE', 'RİM'], 'Duygularımızı mısralarla anlattığımız güzel dizeler 📝', 'Edebiyat'),
  buildHeceWord('hm_4_53', 'RESİMLERİM', ['RE', 'SİM', 'LE', 'RİM'], 'Boya kalemleriyle defterime yaptığım güzel çizgiler 🎨', 'Sanat'),
  buildHeceWord('hm_4_54', 'ŞARKILARIM', ['ŞAR', 'KI', 'LA', 'RIM'], 'Müzik dersinde neşeyle söylediğimiz ezgiler 🎵', 'Müzik'),
  buildHeceWord('hm_4_55', 'YARIŞMACI', ['YA', 'RIŞ', 'MA', 'CI'], 'Bilgi yarışmasında heyecanla yarışan aday 🏆', 'Oyun'),
  buildHeceWord('hm_4_56', 'KUTLAMALAR', ['KUT', 'LA', 'MA', 'LAR'], 'Bayramlarda neşe ve coşkuyla yapılan törenler 🎈', 'Kültür'),
  buildHeceWord('hm_4_57', 'BAYRAMLARIM', ['BAY', 'RAM', 'LA', 'RIM'], 'Akrabalarımızla kucaklaştığımız mutlu özel günler 🍬', 'Kültür'),
  buildHeceWord('hm_4_58', 'TEMİZLİKÇİ', ['TE', 'MİZ', 'LİK', 'Çİ'], 'Çevremizi ve okulumuzu pırıl pırıl temizleyen emektar 🧹', 'Meslekler'),
  buildHeceWord('hm_4_59', 'GÜVENLİKÇİ', ['GÜ', 'VEN', 'LİK', 'Çİ'], 'Okulumuzun kapısında bizi güvenle karşılayan görevli 🛡️', 'Meslekler'),
  buildHeceWord('hm_4_60', 'VETERİNER', ['VE', 'TE', 'Rİ', 'NER'], 'Sevimli hayvan dostlarımızı tedavi eden şefkatli doktor 🐾', 'Meslekler'),

  // ==========================================
  // 5 HECELİ KELİMELER (15 Adet)
  // ==========================================
  buildHeceWord('hm_5_1', 'TÜRKİYEMİZİN', ['TÜR', 'Kİ', 'YE', 'Mİ', 'ZİN'], 'Cennet vatanımız güzel ülkemizin 🇹🇷', 'Genel Kültür'),
  buildHeceWord('hm_5_2', 'CUMHURİYETİM', ['CUM', 'HU', 'Rİ', 'YE', 'TİM'], 'Atatürkün bizlere emanet ettiği en büyük değerimiz 🇹🇷', 'Genel Kültür'),
  buildHeceWord('hm_5_3', 'ÖĞRETMENLERİM', ['ÖĞ', 'RET', 'MEN', 'LE', 'RİM'], 'Bizlere daima sevgiyle yol gösteren öğretmenlerimiz 👩‍🏫', 'Okul'),
  buildHeceWord('hm_5_4', 'ARKADAŞLARIM', ['AR', 'KA', 'DAŞ', 'LA', 'RIM'], 'Birlikte gülüp neşeyle oyunlar oynadığımız can yoldaşlarımız 👫', 'İnsanlar'),
  buildHeceWord('hm_5_5', 'KÜTÜPHANECİ', ['KÜ', 'TÜP', 'HA', 'NE', 'Cİ'], 'Kütüphanede kitapları düzenleyip bize veren görevli 📖', 'Meslekler'),
  buildHeceWord('hm_5_6', 'TELEVİZYONLAR', ['TE', 'LE', 'VİZ', 'YON', 'LAR'], 'Evlerimizde haberleri ve çizgi filmleri açtığımız ekranlar 📺', 'Teknoloji'),
  buildHeceWord('hm_5_7', 'HAVALİMANI', ['HA', 'VA', 'Lİ', 'MA', 'NI'], 'Uçakların inip kalktığı kocaman pistleri olan alan 🛫', 'Mekanlar'),
  buildHeceWord('hm_5_8', 'ÇOCUKLARIMIZ', ['ÇO', 'CUK', 'LA', 'RI', 'MIZ'], 'Geleceğimizin güvencesi aydınlık ve pırıl pırıl evlatlarımız 🧒', 'İnsanlar'),
  buildHeceWord('hm_5_9', 'OKULLARIMIZ', ['O', 'KUL', 'LA', 'RI', 'MIZ'], 'Her sabah zille girip arkadaşlarımla buluştuğumuz yuvalarımız 🏫', 'Okul'),
  buildHeceWord('hm_5_10', 'ÇİÇEKLERİMİZ', ['Çİ', 'ÇEK', 'LE', 'Rİ', 'MİZ'], 'Bahçemizde sulayıp özenle büyüttüğümüz mis kokulu bitkiler 🌸', 'Doğa'),
  buildHeceWord('hm_5_11', 'DOKTORLARIMIZ', ['DOK', 'TOR', 'LA', 'RI', 'MIZ'], 'Hastalıklarımızı teşhis edip bizi sağlığımıza kavuşturanlar 👨‍⚕️', 'Meslekler'),
  buildHeceWord('hm_5_12', 'OYUNCAKLARIM', ['O', 'YUN', 'CAK', 'LA', 'RIM'], 'Odamda özenle dizip temiz tuttuğum eğlenceli eşyalarım 🧸', 'Eşyalar'),
  buildHeceWord('hm_5_13', 'YAĞMURLUKLARIM', ['YAĞ', 'MUR', 'LUK', 'LA', 'RIM'], 'Yağışlı günlerde üzerimize giydiğimiz su geçirmez giysiler 🧥', 'Giyim'),
  buildHeceWord('hm_5_14', 'BİLGİSAYARCI', ['BİL', 'Gİ', 'SA', 'YAR', 'CI'], 'Yazılım ve bilişim makinelerini tamir eden uzman 💻', 'Meslekler'),
  buildHeceWord('hm_5_15', 'HELİKOPTERLER', ['HE', 'Lİ', 'KOP', 'TER', 'LER'], 'Pervaneleriyle gökyüzünde görev yapan kurtarma araçları 🚁', 'Taşıtlar'),
  buildHeceWord('hm_5_16', 'LABORATUVAR', ['LA', 'BO', 'RA', 'TU', 'VAR'], 'Bilim insanlarının deneyler yaptığı donanımlı oda 🧪', 'Bilim'),
  buildHeceWord('hm_5_17', 'BİLİMADAMI', ['Bİ', 'LİM', 'A', 'DA', 'MI'], 'İnsanlığa yeni buluşlar armağan eden araştırmacı 🔬', 'Bilim'),
  buildHeceWord('hm_5_18', 'CUMHURİYETÇİ', ['CUM', 'HU', 'Rİ', 'YET', 'Çİ'], 'Cumhuriyet değerlerini yürekten savunan aydın kişi 🇹🇷', 'Genel Kültür'),
  buildHeceWord('hm_5_19', 'KAHRAMANLARIM', ['KAH', 'RA', 'MAN', 'LA', 'RIM'], 'Tarihimize şan katan yürekli atalarımız 🎖️', 'Tarih'),
  buildHeceWord('hm_5_20', 'KİTAPLARIMIZ', ['Kİ', 'TAP', 'LA', 'RI', 'MIZ'], 'Bize dünyayı ve bilimi tanıtan en sadık dostlarımız 📚', 'Eğitim'),
  buildHeceWord('hm_5_21', 'SINIFLARIMIZ', ['SI', 'NIF', 'LA', 'RI', 'MIZ'], 'İçinde arkadaşlarımızla ders dinlediğimiz aydınlık mekanlar 🏫', 'Okul'),
  buildHeceWord('hm_5_22', 'BAHÇELERİMİZ', ['BAH', 'ÇE', 'LE', 'Rİ', 'MİZ'], 'Teneffüslerde koşup neşeyle oyunlar oynadığımız alanlar 🌳', 'Okul'),
  buildHeceWord('hm_5_23', 'DEĞERLERİMİZ', ['DE', 'ĞER', 'LE', 'Rİ', 'MİZ'], 'Sevgi, saygı, dostluk gibi bizi bir yapan güzellikler 💖', 'Değerler'),
  buildHeceWord('hm_5_24', 'ŞAMPİYONLARIM', ['ŞAM', 'Pİ', 'YON', 'LA', 'RIM'], 'Kupayı kaldırıp birincilik kürsüsüne çıkan sporcular 🥇', 'Spor'),
  buildHeceWord('hm_5_25', 'FOTOĞRAFLARIM', ['FO', 'TOĞ', 'RAF', 'LA', 'RIM'], 'Albümde geçmiş güzel anıları saklayan kareler 📸', 'Anılar'),
  buildHeceWord('hm_5_26', 'İSTİKLALİMİZ', ['İS', 'TİK', 'LA', 'Lİ', 'MİZ'], 'Milletimizin bağımsızlığını simgeleyen hürriyetimiz 🇹🇷', 'Milli Değerler'),
  buildHeceWord('hm_5_27', 'ASTRONOTLARIM', ['AS', 'TRO', 'NOT', 'LA', 'RIM'], 'Uzayın derinliklerine cesurca yolculuk eden kaşifler 🚀', 'Uzay'),
  buildHeceWord('hm_5_28', 'KARDANADAMLAR', ['KAR', 'DAN', 'A', 'DAM', 'LAR'], 'Kışın mahallede el ele yapıp süslediğimiz heykeller ⛄', 'Kış'),
  buildHeceWord('hm_5_29', 'KANGURULARIM', ['KAN', 'GU', 'RU', 'LA', 'RIM'], 'Yavrularını kesesinde büyüten Avustralyalı sevimli canlılar 🦘', 'Hayvanlar'),
  buildHeceWord('hm_5_30', 'YARDIMSEVERLİK', ['YAR', 'DIM', 'SE', 'VER', 'LİK'], 'Zor durumda olanlara karşılıksız destek olma erdemi 🤲', 'Değerler')
];

/**
 * Fisher-Yates karıştırma algoritması
 */
function shuffleArray<T>(arr: T[]): T[] {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

const STORAGE_KEY = 'hece_makasi_history_ids_v2';

export const getHeceHistoryIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

export const saveHeceHistoryIds = (ids: Set<string> | string[]): void => {
  try {
    const arr = Array.from(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
};

export const clearHeceHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

/**
 * Belirli sayıda veya filtrelenmiş kelime getiren fonksiyon
 * Tekrarları önlemek için kalıcı ve oturum geçmişini gözetir.
 */
export const getRandomHeceWords = (count: number = 30, filterSyllables?: number, excludeIds?: Set<string>): HeceWord[] => {
  let pool = HECE_MAKASI_WORDS;
  if (filterSyllables) {
    pool = pool.filter(w => w.syllableCount === filterSyllables);
  }

  const history = getHeceHistoryIds();
  const combinedExclude = new Set<string>();
  history.forEach(id => combinedExclude.add(id));
  if (excludeIds) {
    excludeIds.forEach(id => combinedExclude.add(id));
  }

  let candidates = pool.filter(w => !combinedExclude.has(w.id));
  if (candidates.length < count) {
    clearHeceHistory();
    history.clear();
    candidates = pool.filter(w => !excludeIds?.has(w.id));
    if (candidates.length < count) {
      candidates = [...pool];
    }
  }

  const shuffled = shuffleArray(candidates);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  selected.forEach(w => history.add(w.id));
  saveHeceHistoryIds(history);

  return selected;
};

/**
 * Çok oyunculu modlarda (1, 2, 3 oyuncu) her oyuncuya BİRBİRİNDEN TAMAMEN FARKLI,
 * çakışmayan ve tekrarsız en az 30 kelimelik deste dağıtır.
 * Kalıcı geçmiş sayesinde her oyunda yepyeni kelimeler gelir!
 */
export const getMultiplayerUniqueHeceWordSets = (
  playerCount: number = 2,
  wordsPerPlayer: number = 30,
  filterSyllables?: number,
  sessionUsedIds?: Set<string>
): HeceWord[][] => {
  let pool = HECE_MAKASI_WORDS;
  if (filterSyllables) {
    pool = pool.filter(w => w.syllableCount === filterSyllables);
  }

  const persistentHistory = getHeceHistoryIds();
  const combinedSeen = new Set<string>();
  persistentHistory.forEach(id => combinedSeen.add(id));
  if (sessionUsedIds) {
    sessionUsedIds.forEach(id => combinedSeen.add(id));
  }

  const neededTotal = playerCount * wordsPerPlayer;
  let unseen = pool.filter(w => !combinedSeen.has(w.id));

  // Eğer görülmemiş kelime sayısı gereken sayıdan azsa, tüm havuz görülmüş demektir; sıfırlayıp baştan başla
  if (unseen.length < neededTotal) {
    clearHeceHistory();
    persistentHistory.clear();
    combinedSeen.clear();
    if (sessionUsedIds) sessionUsedIds.clear();
    unseen = [...pool];
  }

  const shuffledUnseen = shuffleArray(unseen);

  const result: HeceWord[][] = [];
  let pointer = 0;

  for (let p = 0; p < playerCount; p++) {
    const playerDeck: HeceWord[] = [];
    for (let i = 0; i < wordsPerPlayer; i++) {
      if (pointer >= shuffledUnseen.length) {
        pointer = 0;
      }
      const chosenWord = shuffledUnseen[pointer];
      playerDeck.push(chosenWord);
      combinedSeen.add(chosenWord.id);
      persistentHistory.add(chosenWord.id);
      if (sessionUsedIds) sessionUsedIds.add(chosenWord.id);
      pointer++;
    }
    result.push(playerDeck);
  }

  saveHeceHistoryIds(persistentHistory);

  return result;
};

/**
 * Anında tekil kelimeyi değiştirmek için taze ve farklı bir kelime getirir
 */
export const getFreshReplacementHeceWord = (
  excludeIds: string[],
  filterSyllables?: number
): HeceWord => {
  const excludeSet = new Set(excludeIds);
  const history = getHeceHistoryIds();
  history.forEach(id => excludeSet.add(id));

  let pool = HECE_MAKASI_WORDS;
  if (filterSyllables) {
    pool = pool.filter(w => w.syllableCount === filterSyllables);
  }

  let candidates = pool.filter(w => !excludeSet.has(w.id));
  if (candidates.length === 0) {
    // Havuz geçmişi doluysa sadece aktif ekrandaki kelimeleri hariç tut
    const visibleOnly = new Set(excludeIds);
    candidates = pool.filter(w => !visibleOnly.has(w.id));
  }

  if (candidates.length > 0) {
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    history.add(chosen.id);
    saveHeceHistoryIds(history);
    return chosen;
  }
  return pool[Math.floor(Math.random() * pool.length)];
};
