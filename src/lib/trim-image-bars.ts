/** Trim solid black (or near-black) letterbox / pillarbox bars from an image. */

function rowIsBar(
  data: Uint8ClampedArray,
  width: number,
  y: number,
  threshold = 28
) {
  let dark = 0;
  const sampleStep = Math.max(1, Math.floor(width / 80));
  let samples = 0;
  for (let x = 0; x < width; x += sampleStep) {
    const i = (y * width + x) * 4;
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (lum <= threshold) dark += 1;
    samples += 1;
  }
  return samples > 0 && dark / samples >= 0.92;
}

function colIsBar(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  threshold = 28
) {
  let dark = 0;
  const sampleStep = Math.max(1, Math.floor(height / 80));
  let samples = 0;
  for (let y = 0; y < height; y += sampleStep) {
    const i = (y * width + x) * 4;
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (lum <= threshold) dark += 1;
    samples += 1;
  }
  return samples > 0 && dark / samples >= 0.92;
}

export function trimLetterboxFromCanvas(source: HTMLCanvasElement, maxSize = 1200) {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return source;

  const { width, height } = source;
  const { data } = ctx.getImageData(0, 0, width, height);

  let top = 0;
  let bottom = height - 1;
  let left = 0;
  let right = width - 1;

  while (top < bottom && rowIsBar(data, width, top)) top += 1;
  while (bottom > top && rowIsBar(data, width, bottom)) bottom -= 1;
  while (left < right && colIsBar(data, width, height, left)) left += 1;
  while (right > left && colIsBar(data, width, height, right)) right -= 1;

  const cropW = right - left + 1;
  const cropH = bottom - top + 1;
  if (cropW < 8 || cropH < 8) return source;
  if (cropW >= width - 2 && cropH >= height - 2) {
    // Almost no bars — still allow gentle downscale
    const scale = Math.min(1, maxSize / Math.max(width, height));
    if (scale >= 0.999) return source;
    const out = document.createElement("canvas");
    out.width = Math.max(1, Math.round(width * scale));
    out.height = Math.max(1, Math.round(height * scale));
    out.getContext("2d")?.drawImage(source, 0, 0, out.width, out.height);
    return out;
  }

  const scale = Math.min(1, maxSize / Math.max(cropW, cropH));
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(cropW * scale));
  out.height = Math.max(1, Math.round(cropH * scale));
  out
    .getContext("2d")
    ?.drawImage(source, left, top, cropW, cropH, 0, 0, out.width, out.height);
  return out;
}

export async function processPortraitPhotoUrl(src: string, maxSize = 1200) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load photo."));
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unavailable.");
  ctx.drawImage(image, 0, 0);
  return trimLetterboxFromCanvas(canvas, maxSize).toDataURL("image/jpeg", 0.9);
}

export function processFittedPhotoFile(file: File, maxSize = 1400) {
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
          reject(new Error("Canvas unavailable."));
          return;
        }
        ctx.drawImage(image, 0, 0);
        resolve(
          trimLetterboxFromCanvas(canvas, maxSize).toDataURL("image/jpeg", 0.9)
        );
      };
      image.onerror = () => reject(new Error("Failed to read image."));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}
