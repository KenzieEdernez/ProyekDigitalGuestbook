/**
 * Remove greenscreen backgrounds from bird video frames.
 * Tuned for typical bright chroma-green plates (#00FF00 / #00B140 style).
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
    const dominance = g - maxRB;
    const sum = r + g + b + 1;
    const greenRatio = g / sum;

    // Solid greenscreen plate
    if (g >= 60 && dominance >= 28 && greenRatio >= 0.36) {
      if (dominance >= 48 || (g >= 120 && dominance >= 35)) {
        data[i + 3] = 0;
        continue;
      }

      // Soft matte around feathers / compression fringe
      const t = (dominance - 28) / 20;
      const alphaScale = 1 - Math.min(1, Math.max(0, t));
      data[i + 3] = Math.round(a * alphaScale);

      // Despill remaining green fringe
      if (data[i + 3] > 0) {
        data[i + 1] = Math.min(g, maxRB + 14);
      }
      continue;
    }

    // Light green spill cleanup on bird edges
    if (dominance > 16 && g > maxRB + 12) {
      data[i + 1] = Math.min(g, maxRB + 10);
    }
  }
}
