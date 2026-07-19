/**
 * Aggressive greenscreen removal for neon chroma plates (#00FF00 style).
 * White/light birds stay; green plate becomes transparent.
 */
export function keyOutGreenscreen(imageData: ImageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) continue;

    const maxRB = Math.max(r, b);
    const minRB = Math.min(r, b);
    const dominance = g - maxRB;
    const avgRB = (r + b) * 0.5;

    // Neon / solid greenscreen (very common in bird stock clips)
    const isStrongGreen =
      g >= 40 &&
      dominance >= 18 &&
      g >= avgRB * 1.25 &&
      (dominance >= 30 || (g >= 90 && maxRB <= 140) || (g >= 150 && minRB <= 120));

    if (isStrongGreen) {
      if (dominance >= 28 || (g >= 100 && maxRB <= 110) || g - minRB >= 50) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
        continue;
      }

      // Soft edge
      const t = Math.min(1, Math.max(0, (dominance - 18) / 18));
      data[i + 3] = Math.round(a * (1 - t));
      if (data[i + 3] > 0) {
        // Despill green fringe onto bird silhouette
        data[i + 1] = Math.min(g, maxRB + 6);
      }
      continue;
    }

    // Residual spill on pale feathers
    if (dominance > 12 && g > maxRB + 8) {
      data[i + 1] = Math.min(g, maxRB + 6);
    }
  }
}

/** Same-origin proxy URL so canvas can read pixels (CORS-safe). */
export function birdMediaProxyUrl(src: string) {
  const value = src.trim();
  if (!value) return "";
  if (value.startsWith("/api/")) return value;
  if (value.startsWith("data:")) return value;
  if (value.startsWith("blob:")) return value;
  return `/api/event-settings/bird-media?url=${encodeURIComponent(value)}`;
}
