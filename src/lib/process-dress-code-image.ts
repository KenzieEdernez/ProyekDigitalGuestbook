/** Remove near-black solid backgrounds (edge-connected) and trim transparent edges. */

function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isBackdropCandidate(r: number, g: number, b: number, a: number) {
  if (a < 20) return true;
  const lum = luminance(r, g, b);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  // Only near-black / charcoal studio backdrops — not mid-tone clothing
  return lum <= 28 && saturation < 0.28;
}

function markEdgeConnectedBackdrop(
  data: Uint8ClampedArray,
  width: number,
  height: number
) {
  const total = width * height;
  const backdrop = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const tryEnqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (backdrop[idx]) return;
    const i = idx * 4;
    if (!isBackdropCandidate(data[i], data[i + 1], data[i + 2], data[i + 3])) {
      return;
    }
    backdrop[idx] = 1;
    queue[tail++] = idx;
  };

  for (let x = 0; x < width; x += 1) {
    tryEnqueue(x, 0);
    tryEnqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    tryEnqueue(0, y);
    tryEnqueue(width - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx / width) | 0;
    tryEnqueue(x - 1, y);
    tryEnqueue(x + 1, y);
    tryEnqueue(x, y - 1);
    tryEnqueue(x, y + 1);
  }

  return backdrop;
}

function featherBackdropAlpha(
  data: Uint8ClampedArray,
  backdrop: Uint8Array,
  width: number,
  height: number
) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      if (!backdrop[idx]) continue;

      const i = idx * 4;
      const lum = luminance(data[i], data[i + 1], data[i + 2]);

      // Soften only near subject edges so cutouts aren't jagged
      let nearSubject = false;
      for (let dy = -2; dy <= 2 && !nearSubject; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (!backdrop[ny * width + nx]) {
            nearSubject = true;
            break;
          }
        }
      }

      if (!nearSubject || lum < 12) {
        data[i + 3] = 0;
      } else {
        data[i + 3] = Math.round((lum / 28) * data[i + 3] * 0.4);
      }
    }
  }
}

export function removeDarkBackgroundFromCanvas(
  source: HTMLCanvasElement,
  maxSize = 1400
): HTMLCanvasElement {
  const srcCtx = source.getContext("2d", { willReadFrequently: true });
  if (!srcCtx) return source;

  const { width, height } = source;
  const imageData = srcCtx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const backdrop = markEdgeConnectedBackdrop(data, width, height);
  featherBackdropAlpha(data, backdrop, width, height);
  srcCtx.putImageData(imageData, 0, 0);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return source;

  const pad = 16;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, maxX - minX + 1 + pad * 2);
  const cropH = Math.min(height - cropY, maxY - minY + 1 + pad * 2);

  const scale = Math.min(1, maxSize / Math.max(cropW, cropH));
  const outW = Math.max(1, Math.round(cropW * scale));
  const outH = Math.max(1, Math.round(cropH * scale));

  const output = document.createElement("canvas");
  output.width = outW;
  output.height = outH;
  const outCtx = output.getContext("2d");
  if (!outCtx) return source;

  outCtx.clearRect(0, 0, outW, outH);
  outCtx.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
  return output;
}

export function processDressCodeImageFile(file: File, maxSize = 1400) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          reject(new Error("Browser does not support image processing."));
          return;
        }
        ctx.drawImage(image, 0, 0);
        const cleaned = removeDarkBackgroundFromCanvas(canvas, maxSize);
        resolve(cleaned.toDataURL("image/png"));
      };
      image.onerror = () => reject(new Error("Failed to read image."));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export async function processDressCodeImageUrl(src: string, maxSize = 1400) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load dress code image."));
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Browser does not support image processing.");

  ctx.drawImage(image, 0, 0);
  return removeDarkBackgroundFromCanvas(canvas, maxSize).toDataURL("image/png");
}
