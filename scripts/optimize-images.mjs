import sharp from "sharp";
import { join, resolve } from "path";
import { statSync } from "fs";

const srcDir = "Attie Cartoons";
const outDir = "public/attie";

const nameMap = {
  "Happy Encouraging Attie.png": "happy.webp",
  "Thinking Attie.png": "thinking.webp",
  "Sympathetic Encouraging Attie.png": "sympathetic.webp",
  "Celebrating Attie.png": "celebrating.webp",
};

async function removeCheckerboard(inputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const output = Buffer.from(data);
  const w = info.width;
  const h = info.height;

  // Pass 1: Mark obvious checkerboard pixels as transparent
  // The checkerboard alternates between grey (~220-226) and white (~250-255)
  // in a grid pattern. Both are desaturated (R ≈ G ≈ B).
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Saturation check: checkerboard pixels are nearly grey (R ≈ G ≈ B)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max - min;

    // If very desaturated AND in the grey/white range, it's checkerboard
    if (saturation <= 12) {
      const avg = (r + g + b) / 3;
      if ((avg >= 210 && avg <= 232) || avg >= 245) {
        output[i + 3] = 0; // transparent
      }
    }
  }

  // Pass 2: Expand transparency to clean up edges
  // Any pixel that borders a transparent pixel AND is also desaturated gets cleared
  const tmp = Buffer.from(output);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      if (tmp[idx + 3] === 0) continue; // already transparent

      const r = tmp[idx];
      const g = tmp[idx + 1];
      const b = tmp[idx + 2];
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      const avg = (r + g + b) / 3;

      // Only clear if desaturated and light
      if (sat > 20 || avg < 200) continue;

      // Check if any neighbor is transparent
      const neighbors = [
        ((y - 1) * w + x) * 4,
        ((y + 1) * w + x) * 4,
        (y * w + (x - 1)) * 4,
        (y * w + (x + 1)) * 4,
      ];

      for (const ni of neighbors) {
        if (tmp[ni + 3] === 0) {
          output[idx + 3] = 0;
          break;
        }
      }
    }
  }

  return sharp(output, {
    raw: { width: w, height: h, channels: 4 },
  });
}

for (const [src, dest] of Object.entries(nameMap)) {
  const inputPath = join(srcDir, src);
  const outputPath = join(outDir, dest);

  const cleaned = await removeCheckerboard(inputPath);

  await cleaned
    .resize(400, null, { withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(outputPath);

  const { size } = statSync(outputPath);
  console.log(`${src} → ${dest} (${(size / 1024).toFixed(1)}KB)`);
}

console.log("Done!");
