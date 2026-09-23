import { GeometricSolidType } from './geometricShapesGameData';

export interface Geo2dObjectItem {
  id: string;
  name: string;
  solidType: GeometricSolidType;
  imgSrc: string;
  category: 'ev' | 'yiyecek' | 'okul' | 'spor' | 'oyun' | 'doga';
  hint: string;
}

export const GEO2D_OBJECTS_POOL: Geo2dObjectItem[] = [
  // ==========================================
  // 1. KÜP (KUP) MODELLERİ (20 Nesne)
  // ==========================================
  {
    id: 'geo2_ahsap_kup',
    name: 'Ahşap Küp Blok',
    solidType: 'kup',
    imgSrc: '/geo2d/ahsap_kup.png',
    category: 'oyun',
    hint: '6 karesel eşit yüzeyi olan ahşap küp blok.'
  },
  {
    id: 'geo2_mavi_ahsap_kup',
    name: 'Mavi Ahşap Küp',
    solidType: 'kup',
    imgSrc: '/geo2d/mavi_ahsap_kup.png',
    category: 'oyun',
    hint: 'Tüm yüzleri kare olan mavi ahşap küp.'
  },
  {
    id: 'geo2_kirmizi_ahsap_kup',
    name: 'Kırmızı Ahşap Küp',
    solidType: 'kup',
    imgSrc: '/geo2d/kirmizi_ahsap_kup.png',
    category: 'oyun',
    hint: 'Kırmızı renkli eşit kenarlı küp blok.'
  },
  {
    id: 'geo2_kirmizi_ahsap_kutu',
    name: 'Kırmızı Küp Kutu',
    solidType: 'kup',
    imgSrc: '/geo2d/kirmizi_ahsap_kup_kutu.png',
    category: 'ev',
    hint: 'Küp şeklinde kırmızı ahşap kutu.'
  },
  {
    id: 'geo2_beyaz_zar_1',
    name: 'Oyun Zarı',
    solidType: 'kup',
    imgSrc: '/geo2d/beyaz_zar_1.png',
    category: 'oyun',
    hint: 'Noktalı 6 kare yüzü olan oyun zarı.'
  },
  {
    id: 'geo2_beyaz_zar_2',
    name: 'Beyaz Zar',
    solidType: 'kup',
    imgSrc: '/geo2d/beyaz_zar_2.png',
    category: 'oyun',
    hint: 'Küp şeklinde beyaz oyun zarı.'
  },
  {
    id: 'geo2_dice_purple',
    name: 'Mor Oyun Zarı',
    solidType: 'kup',
    imgSrc: '/geo2d/dice_purple.png',
    category: 'oyun',
    hint: 'Mor renkli küp oyun zarı.'
  },
  {
    id: 'geo2_cube_green',
    name: 'Yeşil Küp Blok',
    solidType: 'kup',
    imgSrc: '/geo2d/cube_green.png',
    category: 'oyun',
    hint: 'Yeşil renkli plastik küp blok.'
  },
  {
    id: 'geo2_cube_orange',
    name: 'Turuncu Küp',
    solidType: 'kup',
    imgSrc: '/geo2d/cube_orange.png',
    category: 'oyun',
    hint: 'Turuncu renkli 6 kare yüzlü küp.'
  },
  {
    id: 'geo2_cube_pink_face',
    name: 'Sevimli Pembe Küp',
    solidType: 'kup',
    imgSrc: '/geo2d/cube_pink_face.png',
    category: 'oyun',
    hint: 'Pembe renkli gülen yüzlü küp.'
  },
  {
    id: 'geo2_cube_yellow',
    name: 'Sarı Küp',
    solidType: 'kup',
    imgSrc: '/geo2d/cube_yellow.png',
    category: 'oyun',
    hint: 'Sarı renkli plastik küp.'
  },
  {
    id: 'geo2_cube_yellow_smiley',
    name: 'Gülen Yüz Sarı Küp',
    solidType: 'kup',
    imgSrc: '/geo2d/cube_yellow_smiley.png',
    category: 'oyun',
    hint: 'Sarı renkli gülen emojili küp.'
  },
  {
    id: 'geo2_gumus_metal_kup',
    name: 'Metal Parlak Küp',
    solidType: 'kup',
    imgSrc: '/geo2d/gumus_metal_kup.png',
    category: 'ev',
    hint: 'Gümüş rengi metalik küp.'
  },
  {
    id: 'geo2_ice_cube',
    name: 'Buz Küpü',
    solidType: 'kup',
    imgSrc: '/geo2d/ice_cube.png',
    category: 'yiyecek',
    hint: 'Dondurulmuş kristal küp buz.'
  },
  {
    id: 'geo2_mantar_kup',
    name: 'Mantar Küp Tıpa',
    solidType: 'kup',
    imgSrc: '/geo2d/mantar_kup.png',
    category: 'ev',
    hint: 'Doğal mantardan küp blok.'
  },
  {
    id: 'geo2_sari_sunger_kup',
    name: 'Sarı Sünger Küp',
    solidType: 'kup',
    imgSrc: '/geo2d/sari_sunger_kup.png',
    category: 'oyun',
    hint: 'Yumuşak sarı sünger küp.'
  },
  {
    id: 'geo2_sari_sunger_kup_2',
    name: 'Sünger Küp Blok',
    solidType: 'kup',
    imgSrc: '/geo2d/sari_sunger_kup_2.png',
    category: 'oyun',
    hint: 'Sarı süngerden yapılmış küp.'
  },
  {
    id: 'geo2_seffaf_plastik_kup',
    name: 'Şeffaf Plastik Küp',
    solidType: 'kup',
    imgSrc: '/geo2d/seffaf_plastik_kup.png',
    category: 'ev',
    hint: 'Saydam pleksi küp kutu.'
  },
  {
    id: 'geo2_yesil_seramik_kutu',
    name: 'Yeşil Seramik Kutu',
    solidType: 'kup',
    imgSrc: '/geo2d/yesil_seramik_kutu.png',
    category: 'ev',
    hint: 'Kare kapaklı seramik küp kutu.'
  },
  {
    id: 'geo2_yesil_seramik_kutu_2',
    name: 'Yeşil Porselen Küp',
    solidType: 'kup',
    imgSrc: '/geo2d/yesil_seramik_kutu_2.png',
    category: 'ev',
    hint: 'Yeşil renkli küp şeklinde dekoratif kutu.'
  },

  // ==========================================
  // 2. KÜRE (KURE) MODELLERİ (20 Nesne)
  // ==========================================
  {
    id: 'geo2_futbol_topu',
    name: 'Futbol Topu',
    solidType: 'kure',
    imgSrc: '/geo2d/futbol_topu.png',
    category: 'spor',
    hint: 'Köşesi ve kenarı olmayan küre futbol topu.'
  },
  {
    id: 'geo2_soccer_ball',
    name: 'Klasik Futbol Topu',
    solidType: 'kure',
    imgSrc: '/geo2d/soccer_ball.png',
    category: 'spor',
    hint: 'Siyah beyaz desenli küre spor topu.'
  },
  {
    id: 'geo2_basketbol_topu',
    name: 'Basketbol Topu',
    solidType: 'kure',
    imgSrc: '/geo2d/basketbol_topu.png',
    category: 'spor',
    hint: 'Turuncu renkli küre basketbol topu.'
  },
  {
    id: 'geo2_basketball',
    name: 'Basketbol Topu',
    solidType: 'kure',
    imgSrc: '/geo2d/basketball.png',
    category: 'spor',
    hint: 'Pürüzlü yüzeyli küre basketbol topu.'
  },
  {
    id: 'geo2_volleyball',
    name: 'Voleybol Topu',
    solidType: 'kure',
    imgSrc: '/geo2d/volleyball.png',
    category: 'spor',
    hint: 'Renkli panellerden oluşan küre voleybol topu.'
  },
  {
    id: 'geo2_tenis_topu',
    name: 'Tenis Topu',
    solidType: 'kure',
    imgSrc: '/geo2d/tenis_topu.png',
    category: 'spor',
    hint: 'Sarı keçeli yuvarlak küre tenis topu.'
  },
  {
    id: 'geo2_beach_ball',
    name: 'Plaj Topu',
    solidType: 'kure',
    imgSrc: '/geo2d/beach_ball.png',
    category: 'spor',
    hint: 'Renkli şişme küre deniz topu.'
  },
  {
    id: 'geo2_kirmizi_lastik_top',
    name: 'Kırmızı Lastik Top',
    solidType: 'kure',
    imgSrc: '/geo2d/kirmizi_lastik_top.png',
    category: 'oyun',
    hint: 'Zıplayan kırmızı küre lastik top.'
  },
  {
    id: 'geo2_mavi_mermer_top',
    name: 'Mavi Mermer Bilye',
    solidType: 'kure',
    imgSrc: '/geo2d/mavi_mermer_top.png',
    category: 'oyun',
    hint: 'Mermer desenli küre bilye.'
  },
  {
    id: 'geo2_sari_top',
    name: 'Sarı Parlak Top',
    solidType: 'kure',
    imgSrc: '/geo2d/sari_top.png',
    category: 'oyun',
    hint: 'Sarı renkli yuvarlak küre.'
  },
  {
    id: 'geo2_turuncu_top',
    name: 'Turuncu Oyun Topu',
    solidType: 'kure',
    imgSrc: '/geo2d/turuncu_top.png',
    category: 'oyun',
    hint: 'Tam yuvarlak turuncu küre top.'
  },
  {
    id: 'geo2_exercise_ball_blue',
    name: 'Pilates Topu',
    solidType: 'kure',
    imgSrc: '/geo2d/exercise_ball_blue.png',
    category: 'spor',
    hint: 'Büyük mavi spor ve egzersiz küresi.'
  },
  {
    id: 'geo2_desenli_boncuk',
    name: 'Desenli Boncuk',
    solidType: 'kure',
    imgSrc: '/geo2d/desenli_boncuk.png',
    category: 'ev',
    hint: 'Takı yapılan küre biçimli boncuk.'
  },
  {
    id: 'geo2_ceviz',
    name: 'Ceviz',
    solidType: 'kure',
    imgSrc: '/geo2d/ceviz.png',
    category: 'yiyecek',
    hint: 'Doğal küre kabuklu kuru yemiş.'
  },
  {
    id: 'geo2_bilyali_rulman',
    name: 'Çelik Rulman Bilyesi',
    solidType: 'kure',
    imgSrc: '/geo2d/bilyali_rulman.png',
    category: 'ev',
    hint: 'Pürüzsüz çelik küre bilye.'
  },
  {
    id: 'geo2_globe_earth',
    name: 'Dünya Modeli Küre',
    solidType: 'kure',
    imgSrc: '/geo2d/globe_earth.png',
    category: 'okul',
    hint: 'Kıtaları gösteren yuvarlak Dünya küresi.'
  },
  {
    id: 'geo2_ornament_red',
    name: 'Kırmızı Yılbaşı Küresi',
    solidType: 'kure',
    imgSrc: '/geo2d/ornament_red.png',
    category: 'ev',
    hint: 'Ağaca asılan parlak kırmızı süs küresi.'
  },
  {
    id: 'geo2_seffaf_susleme_topu_1',
    name: 'Şeffaf Cam Küre',
    solidType: 'kure',
    imgSrc: '/geo2d/seffaf_susleme_topu_1.png',
    category: 'ev',
    hint: 'Saydam küre süsleme topu.'
  },
  {
    id: 'geo2_seffaf_susleme_topu_2',
    name: 'Kristal Süs Topu',
    solidType: 'kure',
    imgSrc: '/geo2d/seffaf_susleme_topu_2.png',
    category: 'ev',
    hint: 'Şeffaf parlak küre dekorasyon topu.'
  },
  {
    id: 'geo2_sphere_purple',
    name: 'Mor Küre',
    solidType: 'kure',
    imgSrc: '/geo2d/sphere_purple.png',
    category: 'oyun',
    hint: 'Mor renkli geometrik küre.'
  },

  // ==========================================
  // 3. SİLİNDİR (SILINDIR) MODELLERİ (26 Nesne)
  // ==========================================
  {
    id: 'geo2_pil_1',
    name: 'Kalem Pil',
    solidType: 'silindir',
    imgSrc: '/geo2d/pil_1.png',
    category: 'ev',
    hint: 'İki dairesel tabanlı silindir pil.'
  },
  {
    id: 'geo2_pil_2',
    name: 'Alkalin Kalem Pil',
    solidType: 'silindir',
    imgSrc: '/geo2d/pil_2.png',
    category: 'ev',
    hint: 'Yuvarlak gövdeli silindir pil.'
  },
  {
    id: 'geo2_battery_blue',
    name: 'Mavi Pil',
    solidType: 'silindir',
    imgSrc: '/geo2d/battery_blue.png',
    category: 'ev',
    hint: 'Mavi etiketli silindir pil.'
  },
  {
    id: 'geo2_soda_can_red',
    name: 'Kırmızı Teneke İçecek',
    solidType: 'silindir',
    imgSrc: '/geo2d/soda_can_red.png',
    category: 'yiyecek',
    hint: 'Dairesel kapaklı silindir teneke kutu.'
  },
  {
    id: 'geo2_soda_kutusu',
    name: 'Alüminyum Kutu',
    solidType: 'silindir',
    imgSrc: '/geo2d/soda_kutusu.png',
    category: 'yiyecek',
    hint: 'Gazoz kutusu biçiminde metal silindir.'
  },
  {
    id: 'geo2_can_green',
    name: 'Yeşil Teneke İçecek',
    solidType: 'silindir',
    imgSrc: '/geo2d/can_green.png',
    category: 'yiyecek',
    hint: 'Yeşil boyalı silindir meşrubat kutusu.'
  },
  {
    id: 'geo2_altin_teneke',
    name: 'Altın Teneke Kutular',
    solidType: 'silindir',
    imgSrc: '/geo2d/altin_renkli_teneke_kutular.png',
    category: 'ev',
    hint: 'Parlak altın renkli silindir konserve tenekeleri.'
  },
  {
    id: 'geo2_teneke_konserve',
    name: 'Konserve Kutusu',
    solidType: 'silindir',
    imgSrc: '/geo2d/teneke_konserve.png',
    category: 'yiyecek',
    hint: 'Metal oluklu silindir konserve tenekesi.'
  },
  {
    id: 'geo2_kagit_havlu_rulosu',
    name: 'Kağıt Havlu Rulosu',
    solidType: 'silindir',
    imgSrc: '/geo2d/kagit_havlu_rulosu.png',
    category: 'ev',
    hint: 'Silindir karton göbekli kağıt havlu.'
  },
  {
    id: 'geo2_kirmizi_silindir_mum',
    name: 'Kırmızı Silindir Mum',
    solidType: 'silindir',
    imgSrc: '/geo2d/kirmizi_silindir_mum.png',
    category: 'ev',
    hint: 'Daire tabanlı kalın kırmızı silindir mum.'
  },
  {
    id: 'geo2_sari_silindir_mum',
    name: 'Sarı Silindir Mum',
    solidType: 'silindir',
    imgSrc: '/geo2d/sari_silindir_mum.png',
    category: 'ev',
    hint: 'Sarı balmumundan silindir blok mum.'
  },
  {
    id: 'geo2_yesil_cam_mum',
    name: 'Yeşil Camlı Mum',
    solidType: 'silindir',
    imgSrc: '/geo2d/yesil_cam_mum.png',
    category: 'ev',
    hint: 'Silindir cam bardakta dekoratif mum.'
  },
  {
    id: 'geo2_candle_purple',
    name: 'Mor Silindir Mum',
    solidType: 'silindir',
    imgSrc: '/geo2d/candle_purple.png',
    category: 'ev',
    hint: 'Mor renkli silindir süs mumu.'
  },
  {
    id: 'geo2_cylinder_purple',
    name: 'Mor Silindir Blok',
    solidType: 'silindir',
    imgSrc: '/geo2d/cylinder_purple.png',
    category: 'oyun',
    hint: 'Dairesel tabanlı mor silindir şekil.'
  },
  {
    id: 'geo2_bottle_pink',
    name: 'Pembe Su Şişesi',
    solidType: 'silindir',
    imgSrc: '/geo2d/bottle_pink.png',
    category: 'okul',
    hint: 'Silindir gövdeli pembe mataralık şişe.'
  },
  {
    id: 'geo2_bottle_pink_thermos',
    name: 'Pembe Çelik Termos',
    solidType: 'silindir',
    imgSrc: '/geo2d/bottle_pink_thermos.png',
    category: 'okul',
    hint: 'Sıcak su tutan pembe silindir termos.'
  },
  {
    id: 'geo2_bottle_teal',
    name: 'Turkuaz Termos',
    solidType: 'silindir',
    imgSrc: '/geo2d/bottle_teal.png',
    category: 'okul',
    hint: 'Silindirik metal turkuaz matara.'
  },
  {
    id: 'geo2_kahverengi_cam_sise',
    name: 'Kahverengi Cam Şişe',
    solidType: 'silindir',
    imgSrc: '/geo2d/kahverengi_cam_sise.png',
    category: 'ev',
    hint: 'Silindir gövdeli kahverengi cam şişe.'
  },
  {
    id: 'geo2_recel_kavanozu',
    name: 'Reçel Kavanozu',
    solidType: 'silindir',
    imgSrc: '/geo2d/recel_kavanozu.png',
    category: 'yiyecek',
    hint: 'Daire kapaklı silindir cam kavanoz.'
  },
  {
    id: 'geo2_baharat_kavanozu_1',
    name: 'Baharat Kavanozu',
    solidType: 'silindir',
    imgSrc: '/geo2d/baharat_kavanozu_1.png',
    category: 'ev',
    hint: 'Cam silindir baharat kabı.'
  },
  {
    id: 'geo2_baharat_kavanozu_2',
    name: 'Tuzluk / Baharatlık',
    solidType: 'silindir',
    imgSrc: '/geo2d/baharat_kavanozu_2.png',
    category: 'ev',
    hint: 'Silindir şeklinde cam baharatlık.'
  },
  {
    id: 'geo2_baharat_sisesi',
    name: 'Baharat Şişesi',
    solidType: 'silindir',
    imgSrc: '/geo2d/baharat_sisesi.png',
    category: 'ev',
    hint: 'Yuvarlak gövdeli silindir baharat şişesi.'
  },
  {
    id: 'geo2_beyaz_ilac_kavanozu',
    name: 'İlaç Şişesi',
    solidType: 'silindir',
    imgSrc: '/geo2d/beyaz_ilac_kavanozu.png',
    category: 'ev',
    hint: 'Beyaz plastik silindir ilaç kutusu.'
  },
  {
    id: 'geo2_biber_degirmeni',
    name: 'Ahşap Biber Değirmeni',
    solidType: 'silindir',
    imgSrc: '/geo2d/biber_degirmeni.png',
    category: 'ev',
    hint: 'Mutfakta kullanılan silindir karabiber öğütücü.'
  },
  {
    id: 'geo2_ruj',
    name: 'Kozmetik Ruj',
    solidType: 'silindir',
    imgSrc: '/geo2d/ruj.png',
    category: 'ev',
    hint: 'Silindir biçiminde makyaj ruju.'
  },
  {
    id: 'geo2_ahsap_cubuk_1',
    name: 'Ahşap Silindir Çubuk',
    solidType: 'silindir',
    imgSrc: '/geo2d/ahsap_cubuk_1.png',
    category: 'okul',
    hint: 'İnce uzun dairesel silindir ahşap çubuk.'
  },
  {
    id: 'geo2_gumus_kalem_1',
    name: 'Gümüş Metal Kalem',
    solidType: 'silindir',
    imgSrc: '/geo2d/gumus_kalem_1.png',
    category: 'okul',
    hint: 'Silindir metal yazı kalemi.'
  },
  {
    id: 'geo2_seffaf_tukenmez_kalem',
    name: 'Tükenmez Kalem',
    solidType: 'silindir',
    imgSrc: '/geo2d/seffaf_tukenmez_kalem.png',
    category: 'okul',
    hint: 'Şeffaf silindir gövdeli yazı kalemi.'
  },

  // ==========================================
  // 4. DİKDÖRTGEN PRİZMA (DIKDORTGEN_PRIZMA) (14 Nesne)
  // ==========================================
  {
    id: 'geo2_chocolate_bar',
    name: 'Çikolata Tableti',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/chocolate_bar.png',
    category: 'yiyecek',
    hint: 'Tüm yüzeyleri dikdörtgen olan çikolata tableti.'
  },
  {
    id: 'geo2_cikolata',
    name: 'Kalıp Çikolata',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/cikolata.png',
    category: 'yiyecek',
    hint: 'Dikdörtgenler prizması biçiminde paketli çikolata.'
  },
  {
    id: 'geo2_folyo_paketli_bar',
    name: 'Gofret / Enerji Barı',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/folyo_paketli_bar.png',
    category: 'yiyecek',
    hint: 'Folyo ambalajlı dikdörtgen prizma bisküvi.'
  },
  {
    id: 'geo2_tereyagi_kalibi',
    name: 'Tereyağı Kalıbı',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/tereyagi_kalibi.png',
    category: 'yiyecek',
    hint: 'Sarı renkli dikdörtgenler prizması tereyağı.'
  },
  {
    id: 'geo2_peynir_blogu',
    name: 'Kaşar Peyniri Bloğu',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/peynir_blogu.png',
    category: 'yiyecek',
    hint: 'Dikdörtgen prizma sarı peynir bloğu.'
  },
  {
    id: 'geo2_ekmek_somunu',
    name: 'Tost Ekmeği Somunu',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/ekmek_somunu.png',
    category: 'yiyecek',
    hint: 'Dikdörtgen prizma kalıbında pişmiş ekmek.'
  },
  {
    id: 'geo2_power_bank_black',
    name: 'Powerbank (Taşınabilir Şarj)',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/power_bank_black.png',
    category: 'ev',
    hint: 'Yassı dikdörtgenler prizması taşınabilir pil.'
  },
  {
    id: 'geo2_pencil_case_red',
    name: 'Kırmızı Kalem Kutusu',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/pencil_case_red.png',
    category: 'okul',
    hint: 'Dikdörtgen prizma okul kalemliği.'
  },
  {
    id: 'geo2_tissue_box',
    name: 'Mendil Kutusu',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/tissue_box.png',
    category: 'ev',
    hint: 'Dikdörtgen prizma karton peçete kutusu.'
  },
  {
    id: 'geo2_karton_kutu',
    name: 'Karton Koli Kutusu',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/karton_kutu.png',
    category: 'ev',
    hint: 'Eşyaların taşındığı dikdörtgen prizma koli.'
  },
  {
    id: 'geo2_wooden_crate',
    name: 'Ahşap Sandık',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/wooden_crate.png',
    category: 'ev',
    hint: 'Tahta çıtalardan yapılmış dikdörtgen sandık.'
  },
  {
    id: 'geo2_gift_box_red_long',
    name: 'Uzun Hediye Kutusu',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/gift_box_red_long.png',
    category: 'ev',
    hint: 'Dikdörtgen yüzeyli kırmızı hediye paketi.'
  },
  {
    id: 'geo2_dis_macunu_tuubu_1',
    name: 'Diş Macunu Kutusu',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/dis_macunu_tuubu_1.png',
    category: 'ev',
    hint: 'Uzun ince dikdörtgenler prizması karton kutu.'
  },
  {
    id: 'geo2_dis_macunu_tuubu_2',
    name: 'Macun Ambalaj Kutusu',
    solidType: 'dikdortgen_prizma',
    imgSrc: '/geo2d/dis_macunu_tuubu_2.png',
    category: 'ev',
    hint: 'Bütün yüzleri dikdörtgen olan banyo kutusu.'
  },

  // ==========================================
  // 5. KARE PRİZMA (KARE_PRIZMA) (9 Nesne)
  // ==========================================
  {
    id: 'geo2_milk_carton_blue',
    name: 'Süt Kutusu',
    solidType: 'kare_prizma',
    imgSrc: '/geo2d/milk_carton_blue.png',
    category: 'yiyecek',
    hint: 'Tabanı kare, yan yüzeyleri dikdörtgen süt kutusu.'
  },
  {
    id: 'geo2_juice_box',
    name: 'Meyve Suyu Kutusu',
    solidType: 'kare_prizma',
    imgSrc: '/geo2d/juice_box.png',
    category: 'yiyecek',
    hint: 'Kare tabanlı küçük pipetli meyve suyu paketi.'
  },
  {
    id: 'geo2_gift_box_blue',
    name: 'Mavi Hediye Paketi',
    solidType: 'kare_prizma',
    imgSrc: '/geo2d/gift_box_blue.png',
    category: 'ev',
    hint: 'Tabanı kare olan yüksek hediye paketi.'
  },
  {
    id: 'geo2_gift_box_red',
    name: 'Kırmızı Hediye Kutusu',
    solidType: 'kare_prizma',
    imgSrc: '/geo2d/gift_box_red.png',
    category: 'ev',
    hint: 'Kare prizma kurdeleli hediye kutusu.'
  },
  {
    id: 'geo2_gift_box_yellow',
    name: 'Sarı Hediye Kutusu',
    solidType: 'kare_prizma',
    imgSrc: '/geo2d/gift_box_yellow.png',
    category: 'ev',
    hint: 'Kare tabanlı uzun sarı hediye kutusu.'
  },
  {
    id: 'geo2_mavi_hediye_kutusu',
    name: 'Mavi Dik Kutu',
    solidType: 'kare_prizma',
    imgSrc: '/geo2d/mavi_hediye_kutusu.png',
    category: 'ev',
    hint: 'Tabanı kare olan şık mavi prizma kutu.'
  },
  {
    id: 'geo2_cookie_box_blue',
    name: 'Bisküvi Paketi',
    solidType: 'kare_prizma',
    imgSrc: '/geo2d/cookie_box_blue.png',
    category: 'yiyecek',
    hint: 'Kare tabanlı dik bisküvi ambalajı.'
  },
  {
    id: 'geo2_gumball_box',
    name: 'Sakız Kutusu',
    solidType: 'kare_prizma',
    imgSrc: '/geo2d/gumball_box.png',
    category: 'yiyecek',
    hint: 'Kare prizma şeklinde renkli şekerleme kutusu.'
  },
  {
    id: 'geo2_speaker_teal',
    name: 'Hoparlör Kulesi',
    solidType: 'kare_prizma',
    imgSrc: '/geo2d/speaker_teal.png',
    category: 'ev',
    hint: 'Kare tabanlı dik prizma ses hoparlörü.'
  },

  // ==========================================
  // 6. ÜÇGEN PRİZMA (UCGEN_PRIZMA) (9 Nesne)
  // ==========================================
  {
    id: 'geo2_sandwich',
    name: 'Üçgen Sandviç',
    solidType: 'ucgen_prizma',
    imgSrc: '/geo2d/sandwich.png',
    category: 'yiyecek',
    hint: 'İki üçgen tabanı ve dikdörtgen kenarları olan sandviç.'
  },
  {
    id: 'geo2_sandwich_wedge_red',
    name: 'Kırmızı Sandviç Kutusu',
    solidType: 'ucgen_prizma',
    imgSrc: '/geo2d/sandwich_wedge_red.png',
    category: 'yiyecek',
    hint: 'Üçgen prizma şeklinde üçgen ambalaj kabı.'
  },
  {
    id: 'geo2_pizza_slice',
    name: 'Pizza Dilimi',
    solidType: 'ucgen_prizma',
    imgSrc: '/geo2d/pizza_slice.png',
    category: 'yiyecek',
    hint: 'Üçgen prizma şeklinde kalın fırın pizza dilimi.'
  },
  {
    id: 'geo2_watermelon_slice',
    name: 'Karpuz Dilimi',
    solidType: 'ucgen_prizma',
    imgSrc: '/geo2d/watermelon_slice.png',
    category: 'yiyecek',
    hint: 'Üçgen prizma şeklinde kesilmiş lezzetli karpuz dilimi.'
  },
  {
    id: 'geo2_tortilla_chip_1',
    name: 'Üçgen Mısır Cipsi',
    solidType: 'ucgen_prizma',
    imgSrc: '/geo2d/tortilla_chip_1.png',
    category: 'yiyecek',
    hint: 'Üçgen tabanlı çıtır tortilla cipsi.'
  },
  {
    id: 'geo2_tortilla_chip_2',
    name: 'Baharatlı Üçgen Cips',
    solidType: 'ucgen_prizma',
    imgSrc: '/geo2d/tortilla_chip_2.png',
    category: 'yiyecek',
    hint: 'Üçgen şeklinde fırınlanmış cips.'
  },
  {
    id: 'geo2_ucgenprz_3d',
    name: '3D Üçgen Prizma Modeli',
    solidType: 'ucgen_prizma',
    imgSrc: '/geos/ucgenprz.png',
    category: 'okul',
    hint: 'İki üçgen tabanı ve üç dikdörtgen yan yüzü olan üçgen prizma.'
  },
  {
    id: 'geo2_ucgenp_wood',
    name: 'Ahşap Üçgen Prizma Bloğu',
    solidType: 'ucgen_prizma',
    imgSrc: '/geo/ucgenp.png',
    category: 'okul',
    hint: 'Okul eğitim setlerindeki ahşap üçgen prizma blok.'
  }
];
