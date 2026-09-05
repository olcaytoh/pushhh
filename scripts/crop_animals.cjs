const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const outputDir = path.join(process.cwd(), 'public', 'animals');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function processAndCrop(filename, prefix) {
  const filePath = path.join(process.cwd(), 'public', filename);
  if (!fs.existsSync(filePath)) return;

  const data = fs.readFileSync(filePath);
  const srcPng = PNG.sync.read(data);
  const { width, height, data: pixels } = srcPng;

  const isForeground = (x, y) => {
    const idx = (y * width + x) << 2;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    return r < 240 || g < 240 || b < 240;
  };

  const visited = new Uint8Array(width * height);
  let savedCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (visited[pos] || !isForeground(x, y)) continue;

      let minX = x, maxX = x, minY = y, maxY = y;
      const queue = [[x, y]];
      visited[pos] = 1;
      let count = 0;

      while (queue.length > 0) {
        const [cx, cy] = queue.pop();
        count++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighborDist = 3;
        for (let dy = -neighborDist; dy <= neighborDist; dy++) {
          for (let dx = -neighborDist; dx <= neighborDist; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const npos = ny * width + nx;
              if (!visited[npos] && isForeground(nx, ny)) {
                visited[npos] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }
      }

      const w = maxX - minX + 1;
      const h = maxY - minY + 1;

      if (w >= 30 && h >= 30 && w <= 220 && h <= 220 && count > 300) {
        savedCount++;
        const padding = 6;
        const cropMinX = Math.max(0, minX - padding);
        const cropMaxX = Math.min(width - 1, maxX + padding);
        const cropMinY = Math.max(0, minY - padding);
        const cropMaxY = Math.min(height - 1, maxY + padding);

        const cropW = cropMaxX - cropMinX + 1;
        const cropH = cropMaxY - cropMinY + 1;

        const outPng = new PNG({ width: cropW, height: cropH });

        for (let cy = 0; cy < cropH; cy++) {
          for (let cx = 0; cx < cropW; cx++) {
            const srcX = cropMinX + cx;
            const srcY = cropMinY + cy;
            const srcIdx = (srcY * width + srcX) << 2;
            const outIdx = (cy * cropW + cx) << 2;

            const r = pixels[srcIdx];
            const g = pixels[srcIdx + 1];
            const b = pixels[srcIdx + 2];

            if (r > 242 && g > 242 && b > 242) {
              outPng.data[outIdx] = 255;
              outPng.data[outIdx + 1] = 255;
              outPng.data[outIdx + 2] = 255;
              outPng.data[outIdx + 3] = 0;
            } else if (r > 225 && g > 225 && b > 225) {
              const avg = (r + g + b) / 3;
              const alpha = Math.max(0, Math.min(255, Math.floor((255 - avg) * 8)));
              outPng.data[outIdx] = r;
              outPng.data[outIdx + 1] = g;
              outPng.data[outIdx + 2] = b;
              outPng.data[outIdx + 3] = alpha;
            } else {
              outPng.data[outIdx] = r;
              outPng.data[outIdx + 1] = g;
              outPng.data[outIdx + 2] = b;
              outPng.data[outIdx + 3] = 255;
            }
          }
        }

        const outName = `${prefix}_${savedCount}.png`;
        const outPath = path.join(outputDir, outName);
        fs.writeFileSync(outPath, PNG.sync.write(outPng));
      }
    }
  }
  console.log(`Saved ${savedCount} cropped animals from ${filename}`);
}

processAndCrop('1w.png', 'w_animal');
processAndCrop('1q.png', 'q_animal');
