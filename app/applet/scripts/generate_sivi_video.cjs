const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.join(__dirname, '../tmp_sivi_frames');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const outDir = path.join(__dirname, '../public/sivi_oyunu');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outputMp4 = path.join(outDir, 'standart_olmayan_sivi_olcme.mp4');

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const TOTAL_FRAMES = 360; // 12 seconds

console.log('Generating frames for Standart Olmayan Sıvı Ölçme video...');

for (let i = 0; i < TOTAL_FRAMES; i++) {
  const t = i / TOTAL_FRAMES; // 0 to 1
  const sec = i / FPS;

  let sceneContent = '';

  if (sec < 3.2) {
    // SCENE 1: Intro Title
    const introBounce = Math.sin(sec * Math.PI * 2) * 8;
    const waveShift = (i * 4) % 1280;
    sceneContent = `
      <!-- Scene 1: Intro -->
      <g transform="translate(640, 200)">
        <rect x="-320" y="-45" width="640" height="70" rx="35" fill="#0284c7" stroke="#38bdf8" stroke-width="4" opacity="0.95" />
        <text x="0" y="2" text-anchor="middle" fill="#ffffff" font-size="28" font-weight="900" font-family="sans-serif">2. SINIF MATEMATİK • NESNELERİN GEOMETRİSİ</text>
      </g>

      <g transform="translate(640, 340)">
        <text x="0" y="0" text-anchor="middle" fill="#facc15" font-size="56" font-weight="900" font-family="sans-serif" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.8))">Standart Olmayan</text>
        <text x="0" y="70" text-anchor="middle" fill="#ffffff" font-size="52" font-weight="900" font-family="sans-serif" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.8))">Sıvı Ölçme Araçları</text>
      </g>

      <g transform="translate(640, 520)">
        <rect x="-180" y="-30" width="360" height="60" rx="30" fill="#f59e0b" stroke="#fef08a" stroke-width="3" />
        <text x="0" y="8" text-anchor="middle" fill="#1e1b4b" font-size="28" font-weight="900" font-family="sans-serif">📖 KONU ANLATIMI 💧</text>
      </g>

      <!-- Floating Tool Icons -->
      <g transform="translate(240, ${440 - introBounce})">
        <circle cx="0" cy="0" r="65" fill="#0369a1" stroke="#38bdf8" stroke-width="4" />
        <text x="0" y="16" text-anchor="middle" font-size="54">🫗</text>
        <text x="0" y="95" text-anchor="middle" fill="#7dd3fc" font-size="20" font-weight="800" font-family="sans-serif">Sürahi</text>
      </g>

      <g transform="translate(1040, ${440 + introBounce})">
        <circle cx="0" cy="0" r="65" fill="#0369a1" stroke="#38bdf8" stroke-width="4" />
        <text x="0" y="16" text-anchor="middle" font-size="54">🪣</text>
        <text x="0" y="95" text-anchor="middle" fill="#7dd3fc" font-size="20" font-weight="800" font-family="sans-serif">Kova</text>
      </g>
    `;
  } else if (sec < 7.0) {
    // SCENE 2: The non-standard tools grid
    const sProgress = (sec - 3.2) / 3.8;
    sceneContent = `
      <!-- Scene 2: Araçlar -->
      <g transform="translate(640, 75)">
        <rect x="-350" y="-35" width="700" height="60" rx="30" fill="#0f766e" stroke="#2dd4bf" stroke-width="3" />
        <text x="0" y="6" text-anchor="middle" fill="#ffffff" font-size="30" font-weight="900" font-family="sans-serif">💧 Standart Olmayan Ölçme Araçlarımız</text>
      </g>

      <!-- Row of measuring tools -->
      <g transform="translate(170, 240)">
        <rect x="-70" y="-90" width="140" height="180" rx="20" fill="#082f49" stroke="#38bdf8" stroke-width="3" />
        <text x="0" y="-10" text-anchor="middle" font-size="56">🥄</text>
        <text x="0" y="50" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900" font-family="sans-serif">Kaşık</text>
        <text x="0" y="75" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="700" font-family="sans-serif">En küçük</text>
      </g>

      <g transform="translate(325, 240)">
        <rect x="-70" y="-90" width="140" height="180" rx="20" fill="#082f49" stroke="#38bdf8" stroke-width="3" />
        <text x="0" y="-10" text-anchor="middle" font-size="56">☕</text>
        <text x="0" y="50" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900" font-family="sans-serif">Fincan</text>
      </g>

      <g transform="translate(480, 240)">
        <rect x="-70" y="-90" width="140" height="180" rx="20" fill="#082f49" stroke="#38bdf8" stroke-width="3" />
        <text x="0" y="-10" text-anchor="middle" font-size="56">🍵</text>
        <text x="0" y="50" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="900" font-family="sans-serif">Çay Bardağı</text>
      </g>

      <g transform="translate(640, 240)">
        <rect x="-75" y="-95" width="150" height="190" rx="22" fill="#0369a1" stroke="#facc15" stroke-width="4" />
        <text x="0" y="-10" text-anchor="middle" font-size="64">🥛</text>
        <text x="0" y="50" text-anchor="middle" fill="#facc15" font-size="21" font-weight="900" font-family="sans-serif">Su Bardağı</text>
        <text x="0" y="75" text-anchor="middle" fill="#fef08a" font-size="14" font-weight="700" font-family="sans-serif">En yaygın</text>
      </g>

      <g transform="translate(800, 240)">
        <rect x="-70" y="-90" width="140" height="180" rx="20" fill="#082f49" stroke="#38bdf8" stroke-width="3" />
        <text x="0" y="-10" text-anchor="middle" font-size="56">🫗</text>
        <text x="0" y="50" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900" font-family="sans-serif">Sürahi</text>
      </g>

      <g transform="translate(955, 240)">
        <rect x="-70" y="-90" width="140" height="180" rx="20" fill="#082f49" stroke="#38bdf8" stroke-width="3" />
        <text x="0" y="-10" text-anchor="middle" font-size="56">🪣</text>
        <text x="0" y="50" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900" font-family="sans-serif">Kova</text>
      </g>

      <g transform="translate(1110, 240)">
        <rect x="-70" y="-90" width="140" height="180" rx="20" fill="#082f49" stroke="#38bdf8" stroke-width="3" />
        <text x="0" y="-10" text-anchor="middle" font-size="56">🛢️</text>
        <text x="0" y="50" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="900" font-family="sans-serif">Damacana</text>
        <text x="0" y="75" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="700" font-family="sans-serif">En büyük</text>
      </g>

      <!-- Explanation Banner -->
      <g transform="translate(640, 520)">
        <rect x="-520" y="-60" width="1040" height="120" rx="24" fill="#0f172a" stroke="#38bdf8" stroke-width="3" opacity="0.9" />
        <text x="0" y="-15" text-anchor="middle" fill="#38bdf8" font-size="24" font-weight="800" font-family="sans-serif">💡 Neden "Standart Olmayan" Diyoruz?</text>
        <text x="0" y="25" text-anchor="middle" fill="#e2e8f0" font-size="22" font-weight="700" font-family="sans-serif">Çünkü herkesin evindeki bardağın veya sürahinin büyüklüğü birbirinden farklıdır!</text>
      </g>
    `;
  } else if (sec < 10.2) {
    // SCENE 3: Comparison Rules & Example
    const fillAmount = Math.min(1, (sec - 7.0) / 2.0);
    sceneContent = `
      <!-- Scene 3: Karşılaştırma ve Altın Kural -->
      <g transform="translate(640, 75)">
        <rect x="-350" y="-35" width="700" height="60" rx="30" fill="#7c2d12" stroke="#fb923c" stroke-width="3" />
        <text x="0" y="6" text-anchor="middle" fill="#fed7aa" font-size="30" font-weight="900" font-family="sans-serif">⭐ Sıvı Ölçmede Altın Kural</text>
      </g>

      <g transform="translate(360, 270)">
        <rect x="-260" y="-130" width="520" height="260" rx="25" fill="#0c4a6e" stroke="#38bdf8" stroke-width="4" />
        <text x="0" y="-70" text-anchor="middle" fill="#facc15" font-size="28" font-weight="900" font-family="sans-serif">🥛 KÜÇÜK ARAÇ KULLANILIRSA</text>
        <text x="0" y="-10" text-anchor="middle" font-size="52">🥛 🥛 🥛 🥛 🥛</text>
        <text x="0" y="45" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="800" font-family="sans-serif">Daha ÇOK sayıda kap gerekir!</text>
        <text x="0" y="85" text-anchor="middle" fill="#7dd3fc" font-size="20" font-weight="700" font-family="sans-serif">(Örn: 1 sürahi = 5 su bardağı)</text>
      </g>

      <g transform="translate(920, 270)">
        <rect x="-260" y="-130" width="520" height="260" rx="25" fill="#14532d" stroke="#4ade80" stroke-width="4" />
        <text x="0" y="-70" text-anchor="middle" fill="#facc15" font-size="28" font-weight="900" font-family="sans-serif">🫗 BÜYÜK ARAÇ KULLANILIRSA</text>
        <text x="0" y="-10" text-anchor="middle" font-size="52">🫗 🫗</text>
        <text x="0" y="45" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="800" font-family="sans-serif">Daha AZ sayıda kap gerekir!</text>
        <text x="0" y="85" text-anchor="middle" fill="#86efac" font-size="20" font-weight="700" font-family="sans-serif">(Örn: 1 kova = 4 sürahi)</text>
      </g>

      <!-- Bottom Summary Box -->
      <g transform="translate(640, 560)">
        <rect x="-480" y="-45" width="960" height="90" rx="22" fill="#1e1b4b" stroke="#a855f7" stroke-width="3" />
        <text x="0" y="10" text-anchor="middle" fill="#fbcfe8" font-size="23" font-weight="900" font-family="sans-serif">🎯 Kap büyüdükçe sayı AZALIR, kap küçüldükçe sayı ARTAR!</text>
      </g>
    `;
  } else {
    // SCENE 4: Outro & Action
    const celebrationBounce = Math.sin(sec * Math.PI * 4) * 12;
    sceneContent = `
      <!-- Scene 4: Outro -->
      <g transform="translate(640, 160)">
        <text x="0" y="0" text-anchor="middle" fill="#facc15" font-size="50" font-weight="900" font-family="sans-serif" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.8))">Tebrikler Şampiyon! 🌟</text>
        <text x="0" y="65" text-anchor="middle" fill="#ffffff" font-size="34" font-weight="800" font-family="sans-serif">Konuyu Başarıyla Tamamladın!</text>
      </g>

      <g transform="translate(640, ${370 - celebrationBounce})">
        <text x="0" y="0" text-anchor="middle" font-size="90">🐠 🥛 🫗 🪣 ✨</text>
      </g>

      <g transform="translate(640, 520)">
        <rect x="-320" y="-40" width="640" height="80" rx="40" fill="#10b981" stroke="#a7f3d0" stroke-width="4" filter="drop-shadow(0 8px 20px rgba(16,185,129,0.5))" />
        <text x="0" y="10" text-anchor="middle" fill="#ffffff" font-size="32" font-weight="900" font-family="sans-serif">▶ Sıvı Ölçme Oyununa Başla!</text>
      </g>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#05192d" />
        <stop offset="50%" stop-color="#0a2a4a" />
        <stop offset="100%" stop-color="#031525" />
      </linearGradient>
      <radialGradient id="waterGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Deep Blue Water Theme Background -->
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGrad)" />
    <circle cx="640" cy="360" r="450" fill="url(#waterGlow)" />

    <!-- Wave Effect Bottom -->
    <path d="M 0 680 Q 320 ${650 + Math.sin(t * Math.PI * 8) * 15} 640 680 T 1280 680 L 1280 720 L 0 720 Z" fill="#0369a1" opacity="0.4" />
    <path d="M 0 690 Q 320 ${670 + Math.cos(t * Math.PI * 8) * 12} 640 690 T 1280 690 L 1280 720 L 0 720 Z" fill="#0284c7" opacity="0.3" />

    ${sceneContent}
  </svg>`;

  const frameFile = path.join(tmpDir, `frame_${String(i).padStart(4, '0')}.svg`);
  fs.writeFileSync(frameFile, svg);
}

console.log('Rendering MP4 video with ffmpeg...');
const cmd = `ffmpeg -y -framerate ${FPS} -i "${tmpDir}/frame_%04d.svg" -c:v libx264 -pix_fmt yuv420p -an "${outputMp4}"`;
execSync(cmd, { stdio: 'inherit' });

// Cleanup
fs.rmSync(tmpDir, { recursive: true, force: true });
console.log('Standart Olmayan Sıvı Ölçme video created successfully at:', outputMp4);
