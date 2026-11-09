export type GeometricSolidType = 
  | 'kup' 
  | 'silindir' 
  | 'kure' 
  | 'koni' 
  | 'dikdortgen_prizma' 
  | 'ucgen_prizma' 
  | 'kare_prizma';

export interface GeometricSolidDef {
  type: GeometricSolidType;
  name: string;
  shortName: string;
  description: string;
  badgeColor: string;
  gradient: string;
  solidIconSvg: string; // 3D representation of the geometric solid
}

export interface EverydayObjectItem {
  id: string;
  name: string;
  solidType: GeometricSolidType;
  hint: string;
  category: 'ev' | 'yiyecek' | 'okul' | 'spor' | 'oyun' | 'doga';
  badgeBg: string;
}

export const GEOMETRIC_SOLIDS: Record<GeometricSolidType, GeometricSolidDef> = {
  kup: {
    type: 'kup',
    name: 'Küp',
    shortName: 'Küp',
    description: '6 karesel yüzeyden oluşan, tüm ayrıtları eşit 3 boyutlu cisim.',
    badgeColor: 'border-amber-400 text-amber-300 bg-amber-500/20',
    gradient: 'from-amber-500 via-yellow-400 to-orange-500',
    solidIconSvg: 'cube'
  },
  silindir: {
    type: 'silindir',
    name: 'Silindir',
    shortName: 'Silindir',
    description: 'İki dairesel taban ve eğri bir yan yüzeyden oluşan cisim.',
    badgeColor: 'border-cyan-400 text-cyan-300 bg-cyan-500/20',
    gradient: 'from-cyan-500 via-teal-400 to-blue-500',
    solidIconSvg: 'cylinder'
  },
  kure: {
    type: 'kure',
    name: 'Küre',
    shortName: 'Küre',
    description: 'Köşesi ve ayrıtı olmayan, tamamen yuvarlak 3 boyutlu cisim.',
    badgeColor: 'border-emerald-400 text-emerald-300 bg-emerald-500/20',
    gradient: 'from-emerald-500 via-green-400 to-teal-500',
    solidIconSvg: 'sphere'
  },
  koni: {
    type: 'koni',
    name: 'Koni',
    shortName: 'Koni',
    description: 'Dairesel tabanı ve tepe noktası olan huni biçimli cisim.',
    badgeColor: 'border-purple-400 text-purple-300 bg-purple-500/20',
    gradient: 'from-purple-500 via-pink-400 to-rose-500',
    solidIconSvg: 'cone'
  },
  dikdortgen_prizma: {
    type: 'dikdortgen_prizma',
    name: 'Dikdörtgenler Prizması',
    shortName: 'Dikdörtgen Prizma',
    description: 'Tüm yüzeyleri dikdörtgen olan 6 yüzlü prizma.',
    badgeColor: 'border-blue-400 text-blue-300 bg-blue-500/20',
    gradient: 'from-blue-500 via-indigo-400 to-sky-500',
    solidIconSvg: 'rect_prism'
  },
  ucgen_prizma: {
    type: 'ucgen_prizma',
    name: 'Üçgen Prizma',
    shortName: 'Üçgen Prizma',
    description: 'İki üçgen tabanı ve 3 dikdörtgen yan yüzü olan prizma.',
    badgeColor: 'border-rose-400 text-rose-300 bg-rose-500/20',
    gradient: 'from-rose-500 via-amber-400 to-red-500',
    solidIconSvg: 'tri_prism'
  },
  kare_prizma: {
    type: 'kare_prizma',
    name: 'Kare Prizma',
    shortName: 'Kare Prizma',
    description: 'Tabanları kare, yan yüzeyleri dikdörtgen olan prizma.',
    badgeColor: 'border-orange-400 text-orange-300 bg-orange-500/20',
    gradient: 'from-orange-500 via-amber-400 to-yellow-500',
    solidIconSvg: 'square_prism'
  }
};

export const EVERYDAY_OBJECTS_POOL: EverydayObjectItem[] = [
  // 1. KÜP ÖRNEKLERİ
  { id: 'kup_zar', name: 'Oyun Zarı', solidType: 'kup', hint: '6 yüzü de karedir ve eşit büyüklüktedir.', category: 'oyun', badgeBg: 'bg-amber-950/60' },
  { id: 'kup_rubik', name: 'Zeka Küpü (Rubik)', solidType: 'kup', hint: 'Renkli karelerden oluşan küp şeklinde zeka oyuncağı.', category: 'oyun', badgeBg: 'bg-amber-950/60' },
  { id: 'kup_hediye', name: 'Hediye Kutusu', solidType: 'kup', hint: 'Kare kenarlı, kurdeleli küp paket.', category: 'ev', badgeBg: 'bg-amber-950/60' },
  { id: 'kup_buz', name: 'Buz Küpü', solidType: 'kup', hint: 'Kalıptan çıkan dondurulmuş küp şeklinde su.', category: 'yiyecek', badgeBg: 'bg-amber-950/60' },
  { id: 'kup_seker', name: 'Kesme Şeker', solidType: 'kup', hint: 'Çaya atılan küçük beyaz küp şeker.', category: 'yiyecek', badgeBg: 'bg-amber-950/60' },
  { id: 'kup_ahsap', name: 'Ahşap Harf Bloğu', solidType: 'kup', hint: 'Çocukların kule yaptığı küp ahşap blok.', category: 'okul', badgeBg: 'bg-amber-950/60' },
  { id: 'kup_koli', name: 'Kare Koli Kutusu', solidType: 'kup', hint: 'Eşit kenarlı kare karton koli.', category: 'ev', badgeBg: 'bg-amber-950/60' },

  // 2. SİLİNDİR ÖRNEKLERİ
  { id: 'sil_konserve', name: 'Konserve Kutusu', solidType: 'silindir', hint: 'Altı ve üstü daire, yan yüzeyi yuvarlak teneke.', category: 'yiyecek', badgeBg: 'bg-cyan-950/60' },
  { id: 'sil_pil', name: 'Kalem Pil', solidType: 'silindir', hint: 'Saat ve kumandalara takılan silindirik pil.', category: 'ev', badgeBg: 'bg-cyan-950/60' },
  { id: 'sil_rulo', name: 'Rulo Kağıt Havlu', solidType: 'silindir', hint: 'Daire tabanlı rulo şeklinde sarılmış kağıt.', category: 'ev', badgeBg: 'bg-cyan-950/60' },
  { id: 'sil_davul', name: 'Müzik Davulu', solidType: 'silindir', hint: 'İki yanı dairesel deriyle kaplı silindir çalgı.', category: 'okul', badgeBg: 'bg-cyan-950/60' },
  { id: 'sil_teneke', name: 'Teneke İçecek', solidType: 'silindir', hint: 'Gazoz ve meyve suyu kutusu.', category: 'yiyecek', badgeBg: 'bg-cyan-950/60' },
  { id: 'sil_mum', name: 'Silindir Mum', solidType: 'silindir', hint: 'Yuvarlak tabanlı kalın dekoratif mum.', category: 'ev', badgeBg: 'bg-cyan-950/60' },
  { id: 'sil_salca', name: 'Salça Tenekesi', solidType: 'silindir', hint: 'Mutfakta kullanılan silindir metal teneke kutu.', category: 'yiyecek', badgeBg: 'bg-cyan-950/60' },
  { id: 'sil_termos', name: 'Silindir Termos', solidType: 'silindir', hint: 'Sıcak su koyulan yuvarlak silindir termos.', category: 'okul', badgeBg: 'bg-cyan-950/60' },

  // 3. KÜRE ÖRNEKLERİ
  { id: 'kur_futbol', name: 'Futbol Topu', solidType: 'kure', hint: 'Tamamen yuvarlak, köşesi ve kenarı olmayan spor topu.', category: 'spor', badgeBg: 'bg-emerald-950/60' },
  { id: 'kur_portakal', name: 'Taze Portakal', solidType: 'kure', hint: 'Küre biçiminde lezzetli bir kış meyvesi.', category: 'yiyecek', badgeBg: 'bg-emerald-950/60' },
  { id: 'kur_basket', name: 'Basketbol Topu', solidType: 'kure', hint: 'Potaya atılan yuvarlak turuncu küre top.', category: 'spor', badgeBg: 'bg-emerald-950/60' },
  { id: 'kur_dunya', name: 'Dünya Küresi', solidType: 'kure', hint: 'Sınıfta ülkeleri incelediğimiz küre modeli.', category: 'okul', badgeBg: 'bg-emerald-950/60' },
  { id: 'kur_misket', name: 'Cam Bilye / Misket', solidType: 'kure', hint: 'Yerde yuvarlanan renkli cam küre.', category: 'oyun', badgeBg: 'bg-emerald-950/60' },
  { id: 'kur_karpuz', name: 'Karpuz', solidType: 'kure', hint: 'Yeşil çizgili yuvarlak küre şeklinde yaz meyvesi.', category: 'yiyecek', badgeBg: 'bg-emerald-950/60' },
  { id: 'kur_yun', name: 'Yün Yumağı', solidType: 'kure', hint: 'Kedilerin oynadığı yuvarlak örgü yumağı.', category: 'ev', badgeBg: 'bg-emerald-950/60' },

  // 4. KONİ ÖRNEKLERİ
  { id: 'kon_kulah', name: 'Dondurma Külahı', solidType: 'koni', hint: 'Altı daralan sivri tepeli lezzetli külah.', category: 'yiyecek', badgeBg: 'bg-purple-950/60' },
  { id: 'kon_trafik', name: 'Trafik Konisi', solidType: 'koni', hint: 'Yollarda güvenlik için konulan turuncu kuka.', category: 'ev', badgeBg: 'bg-purple-950/60' },
  { id: 'kon_sapka', name: 'Parti Şapkası', solidType: 'koni', hint: 'Doğum günlerinde takılan sivri tepeli külah şapka.', category: 'oyun', badgeBg: 'bg-purple-950/60' },
  { id: 'kon_huni', name: 'Mutfak Hunisi', solidType: 'koni', hint: 'Şişeye sıvı doldurmak için kullanılan huni.', category: 'ev', badgeBg: 'bg-purple-950/60' },
  { id: 'kon_cam', name: 'Çam Ağacı', solidType: 'koni', hint: 'Aşağıdan yukarıya daralarak sivrilen koni ağaç.', category: 'doga', badgeBg: 'bg-purple-950/60' },
  { id: 'kon_havuc', name: 'Havuç', solidType: 'koni', hint: 'Tavşanların sevdiği koni biçiminde turuncu sebze.', category: 'yiyecek', badgeBg: 'bg-purple-950/60' },

  // 5. DİKDÖRTGENLER PRİZMASI ÖRNEKLERİ
  { id: 'dik_sut', name: 'Süt Kutusu', solidType: 'dikdortgen_prizma', hint: 'Bütün yüzleri dikdörtgen olan 1 litrelik karton kutu.', category: 'yiyecek', badgeBg: 'bg-blue-950/60' },
  { id: 'dik_kitap', name: 'Kalın Kitap', solidType: 'dikdortgen_prizma', hint: 'Sayfaları dikdörtgen prizma oluşturan okuma kitabı.', category: 'okul', badgeBg: 'bg-blue-950/60' },
  { id: 'dik_kibrit', name: 'Kibrit Kutusu', solidType: 'dikdortgen_prizma', hint: 'Küçük dikdörtgenler prizması karton kutu.', category: 'ev', badgeBg: 'bg-blue-950/60' },
  { id: 'dik_ayakkabi', name: 'Ayakkabı Kutusu', solidType: 'dikdortgen_prizma', hint: 'Mağazadan alınan ayakkabının dikdörtgen kutusu.', category: 'ev', badgeBg: 'bg-blue-950/60' },
  { id: 'dik_tugla', name: 'İnşaat Tuğlası', solidType: 'dikdortgen_prizma', hint: 'Duvar örerken kullanılan kırmızı tuğla.', category: 'ev', badgeBg: 'bg-blue-950/60' },
  { id: 'dik_telefon', name: 'Akıllı Telefon', solidType: 'dikdortgen_prizma', hint: 'İnce ve yassı dikdörtgen prizma telefon.', category: 'ev', badgeBg: 'bg-blue-950/60' },
  { id: 'dik_biskuvi', name: 'Bisküvi Paketi', solidType: 'dikdortgen_prizma', hint: 'Dikdörtgen pötibör bisküvilerin dizildiği paket.', category: 'yiyecek', badgeBg: 'bg-blue-950/60' },

  // 6. ÜÇGEN PRİZMA ÖRNEKLERİ
  { id: 'ucg_cadir', name: 'Kamp Çadırı', solidType: 'ucgen_prizma', hint: 'Önü ve arkası üçgen, yanları dikdörtgen kamp çadırı.', category: 'doga', badgeBg: 'bg-rose-950/60' },
  { id: 'ucg_peynir', name: 'Üçgen Peynir', solidType: 'ucgen_prizma', hint: 'Kahvaltıda açılan üçgen prizma peynir dilimi.', category: 'yiyecek', badgeBg: 'bg-rose-950/60' },
  { id: 'ucg_cati', name: 'Ev Çatısı', solidType: 'ucgen_prizma', hint: 'Evlerin üstüne konulan üçgen prizma kiremit çatı.', category: 'ev', badgeBg: 'bg-rose-950/60' },
  { id: 'ucg_takvim', name: 'Masa Takvimi', solidType: 'ucgen_prizma', hint: 'Masa üzerinde üçgen duran karton takvim.', category: 'okul', badgeBg: 'bg-rose-950/60' },
  { id: 'ucg_cikolata', name: 'Toblerone Çikolata', solidType: 'ucgen_prizma', hint: 'Üçgen prizma kutuda satılan meşhur çikolata.', category: 'yiyecek', badgeBg: 'bg-rose-950/60' },
  { id: 'ucg_takoz', name: 'Rampa / Takoz', solidType: 'ucgen_prizma', hint: 'Tekerleğin önüne konan üçgen güvenlik takozu.', category: 'ev', badgeBg: 'bg-rose-950/60' },

  // 7. KARE PRİZMA ÖRNEKLERİ
  { id: 'kar_ilac', name: 'İlaç Şurubu Kutusu', solidType: 'kare_prizma', hint: 'Tabanları kare, yüksekliği dikdörtgen şurup kutusu.', category: 'ev', badgeBg: 'bg-orange-950/60' },
  { id: 'kar_parfum', name: 'Parfüm Kutusu', solidType: 'kare_prizma', hint: 'Kare tabanlı dik prizma parfüm paketi.', category: 'ev', badgeBg: 'bg-orange-950/60' },
  { id: 'kar_gokdelen', name: 'Gökdelen Binası', solidType: 'kare_prizma', hint: 'Kare tabanlı göğe yükselen yüksek prizma kule.', category: 'ev', badgeBg: 'bg-orange-950/60' },
  { id: 'kar_cay', name: 'Çay Tenekesi', solidType: 'kare_prizma', hint: 'Kare tabanlı uzun çay saklama tenekesi.', category: 'yiyecek', badgeBg: 'bg-orange-950/60' },
  { id: 'kar_kucuksut', name: 'Küçük Süt Paketi', solidType: 'kare_prizma', hint: 'Kare tabanlı 200ml okul sütü kutusu.', category: 'okul', badgeBg: 'bg-orange-950/60' }
];

export function getRandomSolidType(exclude?: GeometricSolidType): GeometricSolidType {
  const types: GeometricSolidType[] = ['kup', 'silindir', 'kure', 'koni', 'dikdortgen_prizma', 'ucgen_prizma', 'kare_prizma'];
  const filtered = exclude ? types.filter(t => t !== exclude) : types;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function generateRoundItems(targetSolid: GeometricSolidType, count: number = 12): EverydayObjectItem[] {
  // En az 2-3 adet aranan cisimden olsun
  const targetItems = EVERYDAY_OBJECTS_POOL.filter(item => item.solidType === targetSolid);
  const otherItems = EVERYDAY_OBJECTS_POOL.filter(item => item.solidType !== targetSolid);

  const shuffledTargets = [...targetItems].sort(() => 0.5 - Math.random());
  const shuffledOthers = [...otherItems].sort(() => 0.5 - Math.random());

  const numTargets = Math.min(shuffledTargets.length, Math.floor(Math.random() * 2) + 3); // 3 veya 4 hedef
  const numOthers = count - numTargets;

  const selected: EverydayObjectItem[] = [
    ...shuffledTargets.slice(0, numTargets),
    ...shuffledOthers.slice(0, numOthers)
  ];

  return selected.sort(() => 0.5 - Math.random());
}
