/**
 * Build a horizontal transparent dove sprite from the black-background sheet.
 * Run: node scripts/build-dove-sprite.mjs
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const SRC = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-ASUS-OneDrive-Documents-Kenzie-Proyek-Digital-Guestbook/assets/c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-45453270-6a57-4122-b7d7-d513218c3152.png"
);
const OUT = path.join(__dirname, "../public/invitation/dove-sprite.png");

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
  let bitDepth = 8;
  let colorType = 2;
  const idat = [];
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") break;
    offset += 12 + len;
  }
  const compressed = Buffer.concat(idat);
  const raw = zlib.inflateSync(compressed);
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
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
      else if (filter === 3) val = (val + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) val = (val + paeth(left, up, upLeft)) & 255;
      curr[x] = val;
    }
    for (let x = 0; x < width; x++) {
      const si = x * bpp;
      const di = (y * width + x) * 4;
      if (colorType === 2) {
        rgba[di] = curr[si];
        rgba[di + 1] = curr[si + 1];
        rgba[di + 2] = curr[si + 2];
        rgba[di + 3] = 255;
      } else if (colorType === 6) {
        rgba[di] = curr[si];
        rgba[di + 1] = curr[si + 1];
        rgba[di + 2] = curr[si + 2];
        rgba[di + 3] = curr[si + 3];
      }
    }
    curr.copy(prev);
  }
  return { width, height, rgba };
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
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
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function luminance(r, g, b) {
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
      if (luminance(rgba[i], rgba[i + 1], rgba[i + 2]) < 40) {
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
      while (head < tail) {
        const cur = stack[head++];
        const cx = cur % width;
        const cy = (cur / width) | 0;
        const pi = cur * 4;
        if (luminance(rgba[pi], rgba[pi + 1], rgba[pi + 2]) < 40) continue;
        count += 1;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        const neighbors = [cur - 1, cur + 1, cur - width, cur + width];
        for (const n of neighbors) {
          if (n < 0 || n >= width * height) continue;
          const nx = n % width;
          const ny = (n / width) | 0;
          if (Math.abs(nx - cx) + Math.abs(ny - cy) !== 1) continue;
          if (visited[n]) continue;
          visited[n] = 1;
          stack[tail++] = n;
        }
      }
      if (count > 80) {
        birds.push({ minX, maxX, minY, maxY, count });
      }
    }
  }
  birds.sort((a, b) => {
    const acy = (a.minY + a.maxY) / 2;
    const bcy = (b.minY + b.maxY) / 2;
    if (Math.abs(acy - bcy) > 40) return acy - bcy;
    return (a.minX + a.maxX) / 2 - (b.minX + b.maxX) / 2;
  });
  return birds;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error("Source sprite not found:", SRC);
    process.exit(1);
  }
  const { width, height, rgba } = decodePng(fs.readFileSync(SRC));
  const birds = findBirds(width, height, rgba);
  console.log("birds:", birds.length);
  const fw = 96;
  const fh = 96;
  const out = Buffer.alloc(fw * birds.length * fh * 4);
  birds.forEach((bird, index) => {
    const sw = bird.maxX - bird.minX + 1;
    const sh = bird.maxY - bird.minY + 1;
    const scale = Math.min((fw - 8) / sw, (fh - 8) / sh);
    const dw = Math.max(1, Math.round(sw * scale));
    const dh = Math.max(1, Math.round(sh * scale));
    const ox = index * fw + Math.floor((fw - dw) / 2);
    const oy = Math.floor((fh - dh) / 2);
    for (let y = 0; y < dh; y++) {
      for (let x = 0; x < dw; x++) {
        const sx = bird.minX + Math.min(sw - 1, Math.floor(x / scale));
        const sy = bird.minY + Math.min(sh - 1, Math.floor(y / scale));
        const si = (sy * width + sx) * 4;
        const lum = luminance(rgba[si], rgba[si + 1], rgba[si + 2]);
        const di = ((oy + y) * fw * birds.length + (ox + x)) * 4;
        if (lum < 25) {
          out[di + 3] = 0;
          continue;
        }
        const alpha = lum < 60 ? Math.round(255 * ((lum - 25) / 35)) : 255;
        out[di] = rgba[si];
        out[di + 1] = rgba[si + 1];
        out[di + 2] = rgba[si + 2];
        out[di + 3] = alpha;
      }
    }
  });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, encodePng(fw * birds.length, fh, out));
  console.log("wrote", OUT, `${fw * birds.length}x${fh}`, `frames=${birds.length}`);
}

main();
