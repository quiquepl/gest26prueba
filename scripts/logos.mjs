import { PNG } from 'pngjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMG = join(__dirname, '..', 'public', 'img');

function process(srcName, outName, isBg, padFrac = 0.07) {
  const png = PNG.sync.read(readFileSync(join(IMG, srcName)));
  const { width, height, data } = png;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (isBg(r, g, b)) {
        data[i + 3] = 0; // transparente
      } else {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  // recorte con padding
  const w = maxX - minX + 1, h = maxY - minY + 1;
  const pad = Math.round(Math.max(w, h) * padFrac);
  const ow = w + pad * 2, oh = h + pad * 2;
  const out = new PNG({ width: ow, height: oh });
  out.data.fill(0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = ((minY + y) * width + (minX + x)) * 4;
      const di = ((y + pad) * ow + (x + pad)) * 4;
      out.data[di] = data[si]; out.data[di + 1] = data[si + 1];
      out.data[di + 2] = data[si + 2]; out.data[di + 3] = data[si + 3];
    }
  }
  writeFileSync(join(IMG, outName), PNG.sync.write(out));
  console.log(outName, `${ow}x${oh}`);
}

// Logo navy sobre blanco → fondo blanco transparente
process('logo-azul.png', 'logo-navy.png', (r, g, b) => r > 232 && g > 232 && b > 232);
// Logo blanco sobre navy → fondo navy transparente
process('logo-blanco.png', 'logo-white.png', (r, g, b) => b > 55 && r < 60 && g < 80 && b < 150 && b >= g);
