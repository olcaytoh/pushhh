const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.join(__dirname, '../tmp_frames');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

function generateFrames(type) {
  const isAslan = type === 'aslan';
  const totalFrames = 90; // 3 seconds at 30fps
  
  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames;
    const bounce = Math.abs(Math.sin(progress * Math.PI * 6)) * 40;
    const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.08;
    const rot = Math.sin(progress * Math.PI * 6) * 8;
    const sparkOpacity = 0.5 + Math.sin(progress * Math.PI * 10) * 0.5;

    const bgGrad = isAslan
      ? 'linear-gradient(135deg, #15803d 0%, #166534 50%, #052e16 100%)'
      : 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #082f49 100%)';

    const titleText = isAslan ? "🦁 ASLAN KAZANDI!" : "🐺 KURT KAZANDI!";
    const subText = isAslan ? "Tebrikler Şampiyon! 🏆" : "Harika İş Çıkardın! ⭐";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="854" viewBox="0 0 480 854">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${isAslan ? '#15803d' : '#0284c7'}" />
          <stop offset="100%" stop-color="${isAslan ? '#052e16' : '#082f49'}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#facc15" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#facc15" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Background -->
      <rect width="480" height="854" fill="url(#bg)" />

      <!-- Glowing aura behind character -->
      <circle cx="240" cy="${420 - bounce}" r="180" fill="url(#glow)" opacity="${sparkOpacity}" />

      <!-- Confetti & Particles -->
      <circle cx="${100 + Math.sin(i*0.2)*30}" cy="${(i*12)%854}" r="12" fill="#facc15" />
      <circle cx="${380 + Math.cos(i*0.2)*30}" cy="${((i*15)+200)%854}" r="16" fill="#38bdf8" />
      <circle cx="${200 + Math.sin(i*0.1)*50}" cy="${((i*10)+400)%854}" r="10" fill="#f43f5e" />
      <circle cx="${300 + Math.cos(i*0.1)*40}" cy="${((i*18)+100)%854}" r="14" fill="#a855f7" />

      <!-- Celebratory Text Top -->
      <g transform="translate(240, 120)">
        <rect x="-180" y="-45" width="360" height="90" rx="25" fill="#facc15" stroke="#ca8a04" stroke-width="4" />
        <text x="0" y="5" text-anchor="middle" fill="#1e1b4b" font-size="32" font-weight="900" font-family="sans-serif">${titleText}</text>
        <text x="0" y="32" text-anchor="middle" fill="#1e1b4b" font-size="18" font-weight="800" font-family="sans-serif">${subText}</text>
      </g>

      <!-- Character Center -->
      <g transform="translate(240, ${480 - bounce}) scale(${scale}) rotate(${rot})">
        ${isAslan ? `
          <!-- Lion Body Representation -->
          <circle cx="0" cy="0" r="110" fill="#fb923c" stroke="#c2410c" stroke-width="8" />
          <circle cx="0" cy="0" r="85" fill="#fde047" stroke="#eab308" stroke-width="6" />
          <!-- Ears -->
          <circle cx="-65" cy="-65" r="28" fill="#f97316" stroke="#c2410c" stroke-width="5" />
          <circle cx="65" cy="-65" r="28" fill="#f97316" stroke="#c2410c" stroke-width="5" />
          <!-- Eyes -->
          <ellipse cx="-30" cy="-15" rx="14" ry="20" fill="#1e293b" />
          <circle cx="-34" cy="-22" r="6" fill="#ffffff" />
          <ellipse cx="30" cy="-15" rx="14" ry="20" fill="#1e293b" />
          <circle cx="26" cy="-22" r="6" fill="#ffffff" />
          <!-- Smile -->
          <path d="M-25 25 Q0 55 25 25" stroke="#9f1239" stroke-width="8" stroke-linecap="round" fill="none" />
          <polygon points="0,5 15,-10 -15,-10" fill="#9f1239" />
          <!-- Crown -->
          <path d="M-40 -85 L-20 -125 L0 -95 L20 -125 L40 -85 Z" fill="#facc15" stroke="#ca8a04" stroke-width="4" />
          <circle cx="-20" cy="-125" r="6" fill="#ef4444" />
          <circle cx="0" cy="-95" r="6" fill="#3b82f6" />
          <circle cx="20" cy="-125" r="6" fill="#ef4444" />
        ` : `
          <!-- Wolf Body Representation -->
          <circle cx="0" cy="0" r="100" fill="#64748b" stroke="#334155" stroke-width="8" />
          <circle cx="0" cy="10" r="75" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4" />
          <!-- Ears -->
          <polygon points="-75,-20 -95,-100 -25,-60" fill="#64748b" stroke="#334155" stroke-width="6" />
          <polygon points="-70,-25 -85,-85 -35,-55" fill="#f8fafc" />
          <polygon points="75,-20 95,-100 25,-60" fill="#64748b" stroke="#334155" stroke-width="6" />
          <polygon points="70,-25 85,-85 35,-55" fill="#f8fafc" />
          <!-- Eyes -->
          <ellipse cx="-30" cy="-15" rx="12" ry="18" fill="#0f172a" />
          <circle cx="-34" cy="-20" r="5" fill="#ffffff" />
          <circle cx="-28" cy="-12" r="3" fill="#38bdf8" />
          <ellipse cx="30" cy="-15" rx="12" ry="18" fill="#0f172a" />
          <circle cx="26" cy="-20" r="5" fill="#ffffff" />
          <circle cx="32" cy="-12" r="3" fill="#38bdf8" />
          <!-- Smile -->
          <path d="M-20 20 Q0 40 20 20" stroke="#0f172a" stroke-width="6" stroke-linecap="round" fill="none" />
          <ellipse cx="0" cy="8" rx="12" ry="8" fill="#1e293b" />
          <!-- Star Badge -->
          <polygon points="0,-105 8,-85 28,-85 12,-72 18,-52 0,-65 -18,-52 -12,-72 -28,-85 -8,-85" fill="#38bdf8" stroke="#0284c7" stroke-width="3" />
        `}
      </g>

      <!-- Bottom Trophy & Badge -->
      <g transform="translate(240, 750)">
        <rect x="-140" y="-35" width="280" height="70" rx="20" fill="#1e293b" stroke="#facc15" stroke-width="3" />
        <text x="0" y="8" text-anchor="middle" fill="#facc15" font-size="24" font-weight="900" font-family="sans-serif">NUMBER 1! 🏆</text>
      </g>
    </svg>`;

    const frameFile = path.join(tmpDir, `frame_${type}_${String(i).padStart(3, '0')}.svg`);
    fs.writeFileSync(frameFile, svg);
  }

  const outputMp4 = path.join(__dirname, `../public/${type}-win.mp4`);
  
  // Use ffmpeg without audio stream (-an) as requested ("ses olmadan yükle")
  const cmd = `ffmpeg -y -framerate 30 -i "${tmpDir}/frame_${type}_%03d.svg" -c:v libx264 -pix_fmt yuv420p -an "${outputMp4}"`;
  console.log(`Building ${type} video...`);
  execSync(cmd, { stdio: 'inherit' });
}

generateFrames('aslan');
generateFrames('kurt');

// Cleanup
fs.rmSync(tmpDir, { recursive: true, force: true });
console.log('Videos generated successfully!');
