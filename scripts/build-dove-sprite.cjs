/**
 * Build clean centered dove frames from the black-background sheet.
 * Run: node scripts/build-dove-sprite.cjs
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const SRC = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-ASUS-OneDrive-Documents-Kenzie-Proyek-Digital-Guestbook/assets/c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-45453270-6a57-4122-b7d7-d513218c3152.png"
);
const OUT_DIR = path.join(__dirname, "../public/invitation/dove");
const OUT_SPRITE = path.join(__dirname, "../public/invitation/dove-sprite.png");
const FRAME = 112;

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buf) {
  if (buf.toString("ascii", 1, 4) !== "PNG") throw new Error("Not a PNG");
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 2;
  const idat = [];
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    offset += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const stride = width * bpp;
  const rgba = Buffer.alloc(width * height * 4);
  let i = 0;
  const prev = Buffer.alloc(stride);
  const curr = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[i++];
    raw.copy(curr, 0, i, i + stride);
    i += stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= bpp ? curr[x - bpp] : 0;
      const up = prev[x];
      const upLeft = x >= bpp ? prev[x - bpp] : 0;
      let val = curr[x];
      if (filter === 1) val = (val + left) & 255;
      else if (filter === 2) val = (val + up) & 255;
      else if (filter === 3) val = (val + ((left + up) >> 1)) & 255;
      else if (filter === 4) val = (val + paeth(left, up, upLeft)) & 255;
      curr[x] = val;
    }
    for (let x = 0; x < width; x++) {
      const si = x * bpp;
      const di = (y * width + x) * 4;
      rgba[di] = curr[si];
      rgba[di + 1] = curr[si + (bpp > 1 ? 1 : 0)];
      rgba[di + 2] = curr[si + (bpp > 2 ? 2 : 0)];
      rgba[di + 3] = bpp === 4 ? curr[si + 3] : 255;
    }
    curr.copy(prev);
  }
  return { width, height, rgba };
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function lum(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function findBirds(width, height, rgba) {
  const visited = new Uint8Array(width * height);
  const birds = [];
  const stack = new Int32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;
      const i = idx * 4;
      if (lum(rgba[i], rgba[i + 1], rgba[i + 2]) < 45) {
        visited[idx] = 1;
        continue;
      }

      let head = 0;
      let tail = 0;
      stack[tail++] = idx;
      visited[idx] = 1;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let count = 0;
      let sumX = 0;
      let sumY = 0;
      const pixels = [];

      while (head < tail) {
        const cur = stack[head++];
        const cx = cur % width;
        const cy = (cur / width) | 0;
        const pi = cur * 4;
        if (lum(rgba[pi], rgba[pi + 1], rgba[pi + 2]) < 45) continue;
        pixels.push(cur);
        count += 1;
        sumX += cx;
        sumY += cy;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        for (const n of [cur - 1, cur + 1, cur - width, cur + width]) {
          if (n < 0 || n >= width * height) continue;
          const nx = n % width;
          const ny = (n / width) | 0;
          if (Math.abs(nx - cx) + Math.abs(ny - cy) !== 1) continue;
          if (visited[n]) continue;
          visited[n] = 1;
          stack[tail++] = n;
        }
      }

      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;
      // Keep only real dove silhouettes; drop speckles / fragments.
      if (count >= 900 && bw >= 55 && bh >= 55 && bw <= 160 && bh <= 150) {
        const mask = new Uint8Array(width * height);
        for (const p of pixels) mask[p] = 1;
        birds.push({
          minX,
          maxX,
          minY,
          maxY,
          count,
          cx: sumX / count,
          cy: sumY / count,
          mask,
        });
      }
    }
  }

  birds.sort((a, b) => {
    if (Math.abs(a.cy - b.cy) > 35) return a.cy - b.cy;
    return a.cx - b.cx;
  });
  return birds;
}

function renderFrame(width, height, rgba, bird) {
  const sw = bird.maxX - bird.minX + 1;
  const sh = bird.maxY - bird.minY + 1;
  const scale = Math.min((FRAME - 10) / sw, (FRAME - 10) / sh);
  const dw = Math.max(1, Math.round(sw * scale));
  const dh = Math.max(1, Math.round(sh * scale));
  // Center by mass so wing flaps don't jitter.
  const contentCx = (bird.cx - bird.minX) * scale;
  const contentCy = (bird.cy - bird.minY) * scale;
  const ox = Math.round(FRAME / 2 - contentCx);
  const oy = Math.round(FRAME / 2 - contentCy);

  const out = Buffer.alloc(FRAME * FRAME * 4);

  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = bird.minX + x / scale;
      const sy = bird.minY + y / scale;
      const ix = Math.min(width - 1, Math.max(0, Math.round(sx)));
      const iy = Math.min(height - 1, Math.max(0, Math.round(sy)));
      // Only paint pixels that belong to THIS bird component.
      if (!bird.mask[iy * width + ix]) continue;

      const si = (iy * width + ix) * 4;
      const L = lum(rgba[si], rgba[si + 1], rgba[si + 2]);
      if (L < 30) continue;

      const dx = ox + x;
      const dy = oy + y;
      if (dx < 0 || dy < 0 || dx >= FRAME || dy >= FRAME) continue;

      let alpha = 255;
      if (L < 70) alpha = Math.round(255 * ((L - 30) / 40));

      const di = (dy * FRAME + dx) * 4;
      if (alpha >= out[di + 3]) {
        out[di] = rgba[si];
        out[di + 1] = rgba[si + 1];
        out[di + 2] = rgba[si + 2];
        out[di + 3] = alpha;
      }
    }
  }

  return out;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error("Source not found:", SRC);
    process.exit(1);
  }

  const { width, height, rgba } = decodePng(fs.readFileSync(SRC));
  const birds = findBirds(width, height, rgba);
  console.log("usable dove frames:", birds.length);
  if (birds.length < 8) {
    console.error("Too few frames extracted.");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.endsWith(".png")) fs.unlinkSync(path.join(OUT_DIR, file));
  }

  const sprite = Buffer.alloc(FRAME * birds.length * FRAME * 4);
  birds.forEach((bird, index) => {
    const frame = renderFrame(width, height, rgba, bird);
    fs.writeFileSync(
      path.join(OUT_DIR, `${String(index).padStart(2, "0")}.png`),
      encodePng(FRAME, FRAME, frame)
    );
    for (let y = 0; y < FRAME; y++) {
      for (let x = 0; x < FRAME; x++) {
        const si = (y * FRAME + x) * 4;
        const di = (y * FRAME * birds.length + index * FRAME + x) * 4;
        sprite[di] = frame[si];
        sprite[di + 1] = frame[si + 1];
        sprite[di + 2] = frame[si + 2];
        sprite[di + 3] = frame[si + 3];
      }
    }
  });

  fs.writeFileSync(OUT_SPRITE, encodePng(FRAME * birds.length, FRAME, sprite));
  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify({ frameCount: birds.length, size: FRAME }, null, 2)
  );
  console.log("wrote", birds.length, "frames to", OUT_DIR);
  console.log("sprite", OUT_SPRITE);
}

main();
