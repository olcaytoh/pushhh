import os

with open('src/data/topics1stGrade.ts', 'r', encoding='utf-8') as f:
    content = f.read()

idx1 = content.find('  uzamsal_iliskiler: {')
idx2 = content.find('  es_nesneler: {')

if idx1 == -1 or idx2 == -1:
    print("Could not find markers!")
    exit(1)

new_code = '''  uzamsal_iliskiler: {
    title: "Uzamsal İlişkiler (Konum)",
    desc: "Altında, üstünde, sağında, solunda kavramlarını eğlenceli görsel nesnelerle öğrenme.",
    generate: () => {
      // Çocukların kolayca tanıyabileceği okul gereçleri, meyveler ve rozetler havuzu
      interface UzamsalNesne {
        id: string;
        ad: string;
        emoji: string;
        img: string;
      }

      const UZAMSAL_HAVUZ: UzamsalNesne[] = [
        // Okul Görselleri
        { id: 'okul_otobusu', ad: 'Okul Otobüsü', emoji: '🚌', img: '/okul_gorseller/okul_otobusu.png' },
        { id: 'makas', ad: 'Okul Makası', emoji: '✂️', img: '/okul_gorseller/makas.png' },
        { id: 'kursun_kalem', ad: 'Kurşun Kalem', emoji: '✏️', img: '/okul_gorseller/kursun_kalem.png' },
        { id: 'cetvel', ad: 'Cetvel', emoji: '📏', img: '/okul_gorseller/cetvel.png' },
        { id: 'silgi', ad: 'Silgi', emoji: '🧼', img: '/okul_gorseller/silgi.png' },
        { id: 'kitap', ad: 'Açık Kitap', emoji: '📖', img: '/okul_gorseller/acik_kitap.png' },
        { id: 'boya_paleti', ad: 'Boya Paleti', emoji: '🎨', img: '/okul_gorseller/boya_paleti.png' },
        { id: 'buyutec', ad: 'Büyüteç', emoji: '🔍', img: '/okul_gorseller/buyutec.png' },
        { id: 'harf_kupleri', ad: 'Harf Küpleri', emoji: '🔤', img: '/okul_gorseller/harf_kupleri.png' },
        { id: 'kara_tahta', ad: 'Kara Tahta', emoji: '📋', img: '/okul_gorseller/kara_tahta.png' },
        { id: 'dunya_kuresi', ad: 'Dünya Küresi', emoji: '🌍', img: '/okul_gorseller/kuresel_harita.png' },
        { id: 'lego', ad: 'Lego Blokları', emoji: '🧱', img: '/okul_gorseller/lego_bloklari.png' },
        { id: 'kalemtiras', ad: 'Kalemtıraş', emoji: '✏️', img: '/okul_gorseller/kalemtiras.png' },
        { id: 'hesap_makinesi', ad: 'Hesap Makinesi', emoji: '🔢', img: '/okul_gorseller/hesap_makinesi.png' },
        { id: 'pastel_boya', ad: 'Pastel Boya', emoji: '🖍️', img: '/okul_gorseller/pastel_boya_kutusu.png' },
        { id: 'yapistirici', ad: 'Sıvı Yapıştırıcı', emoji: '🧴', img: '/okul_gorseller/sivi_yapistirici.png' },
        { id: 'defter', ad: 'Yıldızlı Defter', emoji: '📓', img: '/okul_gorseller/yildizli_kahverengi_defter.png' },

        // Meyveler
        { id: 'meyve_elma', ad: 'Kırmızı Elma', emoji: '🍎', img: '/meyveler/M1.png' },
        { id: 'meyve_cilek', ad: 'Tatlı Çilek', emoji: '🍓', img: '/meyveler/M2.png' },
        { id: 'meyve_muz', ad: 'Sarı Muz', emoji: '🍌', img: '/meyveler/M3.png' },
        { id: 'meyve_karpuz', ad: 'Sulu Karpuz', emoji: '🍉', img: '/meyveler/M4.png' },
        { id: 'meyve_portakal', ad: 'Portakal', emoji: '🍊', img: '/meyveler/M5.png' },
        { id: 'meyve_uzum', ad: 'Mor Üzüm', emoji: '🍇', img: '/meyveler/M6.png' },
        { id: 'meyve_limon', ad: 'Sarı Limon', emoji: '🍋', img: '/meyveler/M7.png' },

        // Rozetler
        { id: 'rozet_yildiz', ad: 'Yıldız Rozeti', emoji: '🌟', img: '/rozets/d1.png' },
        { id: 'rozet_ates', ad: 'Ateş Rozeti', emoji: '🔥', img: '/rozets/d2.png' },
        { id: 'rozet_simsek', ad: 'Şimşek Rozeti', emoji: '⚡', img: '/rozets/d3.png' },
        { id: 'rozet_kupa', ad: 'Kupa Rozeti', emoji: '🏆', img: '/rozets/d5.png' },
        { id: 'rozet_elmas', ad: 'Elmas Rozeti', emoji: '💎', img: '/rozets/d6.png' },
        { id: 'rozet_tac', ad: 'Altın Taç Rozeti', emoji: '👑', img: '/rozets/d8.png' },
      ];

      // Havuzdan rastgele 4 farklı nesne seç
      const karisikHavuz = [...UZAMSAL_HAVUZ].sort(() => Math.random() - 0.5);
      const ustNesne = karisikHavuz[0];
      const altNesne = karisikHavuz[1];
      const solNesne = karisikHavuz[2];
      const sagNesne = karisikHavuz[3];

      // Soru Tipleri
      const soruTipi = Math.floor(Math.random() * 6);
      let soruMetni = "";
      let dogruCevap = "";
      let yanlisCevaplar: string[] = [];

      if (soruTipi === 0) {
        // Üstte ne var?
        soruMetni = `<span class="px-2 py-0.5 rounded-md bg-sky-500 text-white font-black text-sm xs:text-base sm:text-lg shadow">ÜSTTE</span> hangi nesne durmaktadır?`;
        dogruCevap = `${ustNesne.emoji} ${ustNesne.ad}`;
        yanlisCevaplar = [
          `${altNesne.emoji} ${altNesne.ad}`,
          `${solNesne.emoji} ${solNesne.ad}`,
          `${sagNesne.emoji} ${sagNesne.ad}`,
        ];
      } else if (soruTipi === 1) {
        // Altta ne var?
        soruMetni = `<span class="px-2 py-0.5 rounded-md bg-rose-500 text-white font-black text-sm xs:text-base sm:text-lg shadow">ALTTA</span> hangi nesne durmaktadır?`;
        dogruCevap = `${altNesne.emoji} ${altNesne.ad}`;
        yanlisCevaplar = [
          `${ustNesne.emoji} ${ustNesne.ad}`,
          `${solNesne.emoji} ${solNesne.ad}`,
          `${sagNesne.emoji} ${sagNesne.ad}`,
        ];
      } else if (soruTipi === 2) {
        // Solda ne var?
        soruMetni = `<span class="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-black text-sm xs:text-base sm:text-lg shadow">SOLDA</span> hangi nesne durmaktadır?`;
        dogruCevap = `${solNesne.emoji} ${solNesne.ad}`;
        yanlisCevaplar = [
          `${ustNesne.emoji} ${ustNesne.ad}`,
          `${altNesne.emoji} ${altNesne.ad}`,
          `${sagNesne.emoji} ${sagNesne.ad}`,
        ];
      } else if (soruTipi === 3) {
        // Sağda ne var?
        soruMetni = `<span class="px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-sm xs:text-base sm:text-lg shadow">SAĞDA</span> hangi nesne durmaktadır?`;
        dogruCevap = `${sagNesne.emoji} ${sagNesne.ad}`;
        yanlisCevaplar = [
          `${ustNesne.emoji} ${ustNesne.ad}`,
          `${altNesne.emoji} ${altNesne.ad}`,
          `${solNesne.emoji} ${solNesne.ad}`,
        ];
      } else if (soruTipi === 4) {
        // Belirli bir nesnenin konumu neresi?
        const yonler = [
          { nesne: ustNesne, yon: "⬆️ Üstte", digerler: ["⬇️ Altta", "⬅️ Solda", "➡️ Sağda"] },
          { nesne: altNesne, yon: "⬇️ Altta", digerler: ["⬆️ Üstte", "⬅️ Solda", "➡️ Sağda"] },
          { nesne: solNesne, yon: "⬅️ Solda", digerler: ["➡️ Sağda", "⬆️ Üstte", "⬇️ Altta"] },
          { nesne: sagNesne, yon: "➡️ Sağda", digerler: ["⬅️ Solda", "⬆️ Üstte", "⬇️ Altta"] },
        ];
        const secilenYon = yonler[Math.floor(Math.random() * yonler.length)];
        soruMetni = `${secilenYon.nesne.emoji} <span class="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-sm xs:text-base sm:text-lg shadow">${secilenYon.nesne.ad}</span> görseli nerede durmaktadır?`;
        dogruCevap = secilenYon.yon;
        yanlisCevaplar = secilenYon.digerler;
      } else {
        // Merkeze göre soru (Örn: Ortadaki yıldızın SAĞINDA...)
        const yonSecenekleri = [
          { nesne: ustNesne, ad: "ÜSTÜNDE", badge: "bg-sky-500", diger: [altNesne, solNesne, sagNesne] },
          { nesne: altNesne, ad: "ALTINDA", badge: "bg-rose-500", diger: [ustNesne, solNesne, sagNesne] },
          { nesne: solNesne, ad: "SOLUNDA", badge: "bg-emerald-500", diger: [ustNesne, altNesne, sagNesne] },
          { nesne: sagNesne, ad: "SAĞINDA", badge: "bg-amber-500", diger: [ustNesne, altNesne, solNesne] },
        ];
        const secilen = yonSecenekleri[Math.floor(Math.random() * yonSecenekleri.length)];
        soruMetni = `Ortadaki yıldızın <span class="px-2 py-0.5 rounded-md ${secilen.badge} text-white font-black text-sm xs:text-base sm:text-lg shadow">${secilen.ad}</span> hangi nesne vardır?`;
        dogruCevap = `${secilen.nesne.emoji} ${secilen.nesne.ad}`;
        yanlisCevaplar = secilen.diger.map(d => `${d.emoji} ${d.ad}`);
      }

      const questionHTML = `
        <div data-full-width="true" class="uzamsal-soru-container flex flex-col items-center justify-between w-full h-full max-w-full overflow-hidden min-h-0 select-none">
          <div class="uzamsal-soru-frame relative flex items-center justify-center w-full flex-1 min-h-0 p-1">
            
            <!-- 4 Yönlü Uzamsal Alan (Üst, Alt, Sol, Sağ) -->
            <div class="relative w-full max-w-[280px] xs:max-w-[310px] sm:max-w-[340px] md:max-w-[370px] aspect-square flex items-center justify-center bg-radial from-slate-800/90 via-slate-900/95 to-[#060a14] rounded-2xl sm:rounded-3xl border-2 border-slate-700/80 shadow-[inset_0_2px_12px_rgba(0,0,0,0.8),0_4px_20px_rgba(0,0,0,0.6)] p-1.5">
              
              <!-- Arka Plan Yön Kılavuz Çizgileri -->
              <div class="absolute inset-x-7 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none"></div>
              <div class="absolute inset-y-7 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent pointer-events-none"></div>
              
              <!-- Merkez Göstergesi -->
              <div class="relative z-10 w-11 h-11 xs:w-12 xs:h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center pointer-events-none">
                <span class="text-amber-300 text-xs sm:text-sm font-black leading-none">⭐</span>
                <span class="text-[8px] sm:text-[9px] font-black text-cyan-300 uppercase tracking-tighter mt-0.5">ORTA</span>
              </div>

              <!-- 1. ÜST NESNE -->
              <div class="absolute top-1.5 xs:top-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                <div class="w-13 h-13 xs:w-15 xs:h-15 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl bg-gradient-to-b from-sky-500/20 to-sky-950/50 border-2 border-sky-400/90 shadow-[0_4px_12px_rgba(14,165,233,0.35)] p-1 flex items-center justify-center">
                  <img src="${ustNesne.img}" alt="${ustNesne.ad}" class="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                </div>
                <span class="px-1.5 py-0.5 mt-0.5 rounded-full bg-sky-500 text-white font-black text-[9px] xs:text-[10px] sm:text-[11px] tracking-wider shadow">ÜST</span>
              </div>

              <!-- 2. ALT NESNE -->
              <div class="absolute bottom-1.5 xs:bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                <span class="px-1.5 py-0.5 mb-0.5 rounded-full bg-rose-500 text-white font-black text-[9px] xs:text-[10px] sm:text-[11px] tracking-wider shadow">ALT</span>
                <div class="w-13 h-13 xs:w-15 xs:h-15 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl bg-gradient-to-b from-rose-500/20 to-rose-950/50 border-2 border-rose-400/90 shadow-[0_4px_12px_rgba(244,63,94,0.35)] p-1 flex items-center justify-center">
                  <img src="${altNesne.img}" alt="${altNesne.ad}" class="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                </div>
              </div>

              <!-- 3. SOL NESNE -->
              <div class="absolute left-1.5 xs:left-2 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div class="w-13 h-13 xs:w-15 xs:h-15 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl bg-gradient-to-b from-emerald-500/20 to-emerald-950/50 border-2 border-emerald-400/90 shadow-[0_4px_12px_rgba(16,185,129,0.35)] p-1 flex items-center justify-center">
                  <img src="${solNesne.img}" alt="${solNesne.ad}" class="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                </div>
                <span class="px-1.5 py-0.5 mt-0.5 rounded-full bg-emerald-500 text-white font-black text-[9px] xs:text-[10px] sm:text-[11px] tracking-wider shadow">SOL</span>
              </div>

              <!-- 4. SAĞ NESNE -->
              <div class="absolute right-1.5 xs:right-2 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div class="w-13 h-13 xs:w-15 xs:h-15 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl bg-gradient-to-b from-amber-500/20 to-amber-950/50 border-2 border-amber-400/90 shadow-[0_4px_12px_rgba(245,158,11,0.35)] p-1 flex items-center justify-center">
                  <img src="${sagNesne.img}" alt="${sagNesne.ad}" class="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                </div>
                <span class="px-1.5 py-0.5 mt-0.5 rounded-full bg-amber-500 text-white font-black text-[9px] xs:text-[10px] sm:text-[11px] tracking-wider shadow">SAĞ</span>
              </div>

            </div>
          </div>

          <div class="uzamsal-soru-text w-full text-center font-black text-white leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] shrink-0 z-10 py-1 px-2">
            ${soruMetni}
          </div>
        </div>
      `;

      return {
        question: soruMetni.replace(/<[^>]*>/g, ''),
        questionHTML,
        correct: dogruCevap,
        wrong: yanlisCevaplar,
        signature: `uzamsal-${ustNesne.id}-${altNesne.id}-${solNesne.id}-${sagNesne.id}-${soruTipi}`,
        isLong: false
      };
    }
  },

'''

content = content[:idx1] + new_code + content[idx2:]
with open('src/data/topics1stGrade.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS!")
