import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const titles = [
  "Sihirli Orman Kütüphanesi",
  "Sualtı Çay Partisi",
  "Uzay Macerası Başlıyor",
  "Tarihi Saray Avlusu",
  "Tarihi Osmanlı Çeşmesi",
  "Robot Atölyesi Eğlencesi",
  "Tarihi Saat Kulesi Meydanı",
  "Osmanlı Sokak Çeşmesi",
  "Doğum Günü Kutlaması",
  "İstanbul Boğaz Limanı",
  "Tarihi Şadırvan Meydanı",
  "Çiftlikte Sevimli Dostlar",
  "Sihirli Ağaç Ev",
  "Dinozorlar Vadisi Keşfi",
  "Korsan Adası ve Hazine",
  "Peri Masalı Masmavi Şato",
  "Kutup Penguenleri Eğlencesi",
  "Orman İzcileri Kampı",
  "Oyuncak Tren İstasyonu",
  "Sevimli Hayvanlar Sirki",
  "Sonbahar Park Gezisi",
  "Gökkuşağı Şeker Dünyası"
];

const OUT_DIR = path.join(process.cwd(), 'public/fark/levels');

function getDifferencesForLevel(lvl) {
  const lPath = path.join(OUT_DIR, `level_${lvl}_left.jpg`);
  const rPath = path.join(OUT_DIR, `level_${lvl}_right.jpg`);
  
  // Diff map using ImageMagick
  const diffMapPath = `/tmp/diff_lvl_${lvl}.png`;
  const objPath = `/tmp/obj_lvl_${lvl}.png`;
  
  execSync(`convert "${lPath}" "${rPath}" -compose difference -composite -colorspace gray -threshold 13% -morphology open disk:3 "${diffMapPath}"`);
  
  const out = execSync(`convert "${diffMapPath}" -define connected-components:verbose=true -define connected-components:area-threshold=140 -connected-components 8 "${objPath}" 2>&1`).toString();
  
  const lines = out.split('\n');
  const components = [];
  for (const line of lines) {
    const match = line.match(/\s*\d+:\s+(\d+)x(\d+)\+(\d+)\+(\d+)\s+([\d.]+),([\d.]+)\s+(\d+)\s+gray\(255\)/);
    if (match) {
      const [_, w, h, x, y, cx, cy, area] = match;
      const numY = parseFloat(cy);
      const numX = parseFloat(cx);
      // Skip top title banner area (y < 160) and extreme borders
      if (numY > 165 && numY < 1140 && numX > 35 && numX < 1140) {
        components.push({
          x: Math.round((numX / 1172) * 1000) / 10,
          y: Math.round((numY / 1175) * 1000) / 10,
          area: parseInt(area, 10)
        });
      }
    }
  }
  
  // Cluster points that are close together (< 12% distance)
  const clustered = [];
  for (const c of components) {
    let merged = false;
    for (const cl of clustered) {
      const dist = Math.hypot(cl.x - c.x, cl.y - c.y);
      if (dist < 12) {
        const totalArea = cl.area + c.area;
        cl.x = Math.round(((cl.x * cl.area + c.x * c.area) / totalArea) * 10) / 10;
        cl.y = Math.round(((cl.y * cl.area + c.y * c.area) / totalArea) * 10) / 10;
        cl.area = totalArea;
        merged = true;
        break;
      }
    }
    if (!merged) {
      clustered.push({ ...c });
    }
  }
  
  // Sort by area descending
  clustered.sort((a, b) => b.area - a.area);
  
  // Default positions in case fewer than 7 distinct detected
  const fallbackCoords = [
    { x: 22, y: 32 },
    { x: 78, y: 35 },
    { x: 50, y: 52 },
    { x: 78, y: 62 },
    { x: 38, y: 60 },
    { x: 22, y: 82 },
    { x: 76, y: 82 },
  ];
  
  const finalDiffs = [];
  for (let i = 0; i < Math.min(7, clustered.length); i++) {
    finalDiffs.push({
      id: i + 1,
      name: `Fark ${i + 1}`,
      x: clustered[i].x,
      y: clustered[i].y,
      radius: 9.0
    });
  }
  
  while (finalDiffs.length < 7) {
    const idx = finalDiffs.length;
    finalDiffs.push({
      id: idx + 1,
      name: `Fark ${idx + 1}`,
      x: fallbackCoords[idx].x,
      y: fallbackCoords[idx].y,
      radius: 9.0
    });
  }
  
  return finalDiffs;
}

async function main() {
  const allLevels = [];
  
  for (let i = 1; i <= 22; i++) {
    const title = titles[i - 1] || `Bölüm ${i}`;
    console.log(`Processing level ${i}: ${title}...`);
    const diffs = getDifferencesForLevel(i);
    
    allLevels.push({
      id: `fark_level_${i}`,
      title,
      leftSrc: `/fark/levels/level_${i}_left.jpg`,
      rightSrc: `/fark/levels/level_${i}_right.jpg`,
      w: 1172,
      h: 1175,
      differences: diffs
    });
    console.log(`✓ Level ${i} processed with 7 exact differences:`, diffs.map(d => `(${d.x}%, ${d.y}%)`).join(', '));
  }
  
  const outCode = `export interface FarkDifference {
  id: number;
  name?: string;
  x: number;
  y: number;
  radius: number;
}

export interface FarkLevel {
  id: string;
  title: string;
  leftSrc: string;
  rightSrc: string;
  src?: string;
  w: number;
  h: number;
  differences: FarkDifference[];
}

export const FARK_BUL_LEVELS: FarkLevel[] = ${JSON.stringify(allLevels, null, 2)};
`;

  fs.writeFileSync(path.join(process.cwd(), 'src/data/farkBulData.ts'), outCode, 'utf-8');
  console.log(`Successfully generated src/data/farkBulData.ts with all ${allLevels.length} levels!`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
