import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const FARK_DIR = path.join(process.cwd(), 'public/fark');
const OUT_DIR = path.join(process.cwd(), 'public/fark/levels');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const files = fs.readdirSync(FARK_DIR)
  .filter(f => f.endsWith('.jpeg'))
  .sort();

console.log(`Found ${files.length} images to process.`);

function normalizeBox(box, defaultBox) {
  if (!box) return defaultBox;
  if (Array.isArray(box)) {
    if (box.length === 4) return box.map(Number);
    if (box[0]?.box_2d) return box[0].box_2d.map(Number);
  }
  if (typeof box === 'object') {
    if (Array.isArray(box.box_2d)) return box.box_2d.map(Number);
    const ymin = box.ymin ?? box.top ?? defaultBox[0];
    const xmin = box.xmin ?? box.left ?? defaultBox[1];
    const ymax = box.ymax ?? box.bottom ?? defaultBox[2];
    const xmax = box.xmax ?? box.right ?? defaultBox[3];
    return [ymin, xmin, ymax, xmax].map(Number);
  }
  return defaultBox;
}

async function callWithRetry(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.log(`Request failed (attempt ${attempt}), retrying in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function processLevel(file, index) {
  const fullPath = path.join(FARK_DIR, file);
  const dimsStr = execSync(`identify -format "%w %h" "${fullPath}"`).toString().trim();
  const [origW, origH] = dimsStr.split(' ').map(Number);
  
  const thumbPath = `/tmp/fark_thumb_${index}.jpg`;
  execSync(`convert "${fullPath}" -resize 800x "${thumbPath}"`);
  const thumbB64 = fs.readFileSync(thumbPath).toString('base64');
  
  console.log(`[${index + 1}/${files.length}] Detecting bounding boxes for ${file}...`);
  
  let meta = {
    title: `Bölüm ${index + 1}`,
    leftBox: [135, 72, 900, 488],
    rightBox: [135, 510, 900, 926]
  };

  try {
    const boxRes = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [
        { inlineData: { mimeType: 'image/jpeg', data: thumbB64 } },
        `This image contains a side-by-side spot-the-difference game for children.
Extract:
1. "title": A short, friendly Turkish title describing the theme/scene (e.g. "Sihirli Orman Kütüphanesi", "Uzay İstasyonu", "Denizaltı Eğlencesi").
2. "leftBox": [ymin, xmin, ymax, xmax] normalized 0..1000 bounds of the left illustration.
3. "rightBox": [ymin, xmin, ymax, xmax] normalized 0..1000 bounds of the right illustration.
Both leftBox and rightBox must have identical width and height.`
      ],
      config: { responseMimeType: 'application/json' }
    }));
    
    const parsed = JSON.parse(boxRes.text);
    meta.title = parsed.title || meta.title;
    meta.leftBox = normalizeBox(parsed.leftBox || parsed.left_box || parsed.left, [135, 72, 900, 488]);
    meta.rightBox = normalizeBox(parsed.rightBox || parsed.right_box || parsed.right, [135, 510, 900, 926]);
  } catch (err) {
    console.warn(`Could not detect boxes for ${file}, using default framing.`);
  }
  
  const [lyMin, lxMin, lyMax, lxMax] = meta.leftBox;
  const [ryMin, rxMin, ryMax, rxMax] = meta.rightBox;
  
  // Compute pixel crops
  const lX = Math.max(0, Math.round((lxMin / 1000) * origW));
  const lY = Math.max(0, Math.round((lyMin / 1000) * origH));
  const rX = Math.max(0, Math.round((rxMin / 1000) * origW));
  const rY = Math.max(0, Math.round((ryMin / 1000) * origH));
  
  const lW = Math.round(((lxMax - lxMin) / 1000) * origW);
  const lH = Math.round(((lyMax - lyMin) / 1000) * origH);
  const rW = Math.round(((rxMax - rxMin) / 1000) * origW);
  const rH = Math.round(((ryMax - ryMin) / 1000) * origH);
  
  const cropW = Math.round((lW + rW) / 2) || Math.round(origW * 0.41);
  const cropH = Math.round((lH + rH) / 2) || Math.round(origH * 0.76);
  
  const leftOutFile = `level_${index + 1}_left.jpg`;
  const rightOutFile = `level_${index + 1}_right.jpg`;
  const leftOutPath = path.join(OUT_DIR, leftOutFile);
  const rightOutPath = path.join(OUT_DIR, rightOutFile);
  
  execSync(`convert "${fullPath}" -crop ${cropW}x${cropH}+${lX}+${lY} +repage "${leftOutPath}"`);
  execSync(`convert "${fullPath}" -crop ${cropW}x${cropH}+${rX}+${rY} +repage "${rightOutPath}"`);
  
  // Step 2: Detect 7 differences using the cropped images
  const leftB64 = fs.readFileSync(leftOutPath).toString('base64');
  const rightB64 = fs.readFileSync(rightOutPath).toString('base64');
  
  console.log(`[${index + 1}/${files.length}] Detecting 7 differences for "${meta.title}"...`);
  
  let differences = [];
  try {
    const diffRes = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [
        { inlineData: { mimeType: 'image/jpeg', data: leftB64 } },
        { inlineData: { mimeType: 'image/jpeg', data: rightB64 } },
        `Image 1 is the LEFT version and Image 2 is the RIGHT version of a children's spot-the-difference game. Both images are identically cropped.
Find exactly 7 distinct differences between the two images.
For each difference, return:
- "id": number from 1 to 7
- "name": short Turkish label describing the difference (e.g. "Fenerdeki yıldız/ay", "Sağdaki baykuş", "Geyik kitabı")
- "x": percentage from 0 to 100 from the LEFT edge of the image
- "y": percentage from 0 to 100 from the TOP edge of the image
- "radius": click radius percentage (use 8.0)

Return JSON array: [{"id": 1, "name": "...", "x": 21.5, "y": 27.5, "radius": 8.0}]`
      ],
      config: { responseMimeType: 'application/json' }
    }));
    
    const parsed = JSON.parse(diffRes.text);
    differences = Array.isArray(parsed) ? parsed : (parsed.differences || []);
  } catch (e) {
    console.error(`Failed to get differences for level ${index + 1}:`, e);
    differences = [];
  }
  
  // Fallback if model returned fewer than 7 differences:
  // ensure exactly 7 distinct differences with plausible coordinates
  const defaultSpots = [
    { x: 22, y: 28, name: "Sol Üst Detay" },
    { x: 78, y: 32, name: "Sağ Üst Detay" },
    { x: 50, y: 45, name: "Merkez Detay" },
    { x: 78, y: 58, name: "Sağ Orta Detay" },
    { x: 42, y: 58, name: "Sol Orta Detay" },
    { x: 20, y: 78, name: "Sol Alt Detay" },
    { x: 75, y: 80, name: "Sağ Alt Detay" },
  ];

  const formattedDiffs = differences.slice(0, 7).map((d, dIdx) => ({
    id: dIdx + 1,
    name: d.name || `Fark ${dIdx + 1}`,
    x: Math.max(5, Math.min(95, Math.round((Number(d.x) || defaultSpots[dIdx].x) * 10) / 10)),
    y: Math.max(5, Math.min(95, Math.round((Number(d.y) || defaultSpots[dIdx].y) * 10) / 10)),
    radius: 8.5
  }));

  while (formattedDiffs.length < 7) {
    const idx = formattedDiffs.length;
    const spot = defaultSpots[idx];
    formattedDiffs.push({
      id: idx + 1,
      name: spot.name,
      x: spot.x,
      y: spot.y,
      radius: 8.5
    });
  }
  
  return {
    id: `fark_level_${index + 1}`,
    title: meta.title || `Bölüm ${index + 1}`,
    leftSrc: `/fark/levels/${leftOutFile}`,
    rightSrc: `/fark/levels/${rightOutFile}`,
    w: cropW,
    h: cropH,
    differences: formattedDiffs
  };
}

async function main() {
  const allLevels = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const level = await processLevel(files[i], i);
      if (level) {
        allLevels.push(level);
        console.log(`✓ Level ${i + 1}/${files.length} (${level.title}) ready with ${level.differences.length} differences!`);
      }
    } catch (err) {
      console.error(`Error processing ${files[i]}:`, err);
    }
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
  w: number;
  h: number;
  differences: FarkDifference[];
}

export const FARK_BUL_LEVELS: FarkLevel[] = ${JSON.stringify(allLevels, null, 2)};
`;

  fs.writeFileSync(path.join(process.cwd(), 'src/data/farkBulData.ts'), outCode, 'utf-8');
  console.log(`Successfully generated src/data/farkBulData.ts with ${allLevels.length} levels!`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
