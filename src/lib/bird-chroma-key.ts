/**
 * Aggressive greenscreen removal for neon chroma plates (#00FF00 style).
 * Only alpha is cleared — RGB left intact (helps Safari compositing).
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

    // Neon / solid greenscreen
    if (g >= 35 && dominance >= 14 && g >= r + 14 && g >= b + 14) {
      if (
        dominance >= 22 ||
        (g >= 80 && maxRB <= 130) ||
        (g >= 120 && minRB <= 100) ||
        g - (r + b) / 2 >= 40
      ) {
        data[i + 3] = 0;
        continue;
      }

      const t = Math.min(1, Math.max(0, (dominance - 14) / 16));
      data[i + 3] = Math.round(a * (1 - t));
      if (data[i + 3] > 0) {
        data[i + 1] = Math.min(g, maxRB + 4);
      }
      continue;
    }

    if (dominance > 8 && g > maxRB + 6) {
      data[i + 1] = Math.min(g, maxRB + 4);
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

export function isAppleTouchDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}
