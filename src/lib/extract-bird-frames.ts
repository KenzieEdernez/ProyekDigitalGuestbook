import { keyOutGreenscreen } from "@/lib/bird-chroma-key";

const FRAME_COUNT = 16;
const MAX_SIZE = 160;

function waitForEvent(
  target: EventTarget,
  event: string,
  timeoutMs = 8000
) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for ${event}.`));
    }, timeoutMs);

    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error(`Video error while waiting for ${event}.`));
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      target.removeEventListener(event, onEvent);
      target.removeEventListener("error", onError);
    };

    target.addEventListener(event, onEvent, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

/**
 * Turn a greenscreen bird MP4 into transparent PNG frames (real alpha).
 * These frames work on iOS — unlike canvas-keyed video playback.
 */
export async function extractKeyedBirdPngFrames(
  file: File,
  frameCount = FRAME_COUNT
): Promise<Blob[]> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.preload = "auto";
  video.src = objectUrl;

  try {
    await waitForEvent(video, "loadeddata");
    await video.play().catch(() => undefined);
    video.pause();

    const duration =
      Number.isFinite(video.duration) && video.duration > 0.05
        ? video.duration
        : 1;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
      alpha: true,
    });
    if (!ctx) {
      throw new Error("Browser cannot process bird frames.");
    }

    const frames: Blob[] = [];

    for (let i = 0; i < frameCount; i += 1) {
      const t = ((i + 0.5) / frameCount) * duration;
      video.currentTime = Math.min(Math.max(0, t), Math.max(0, duration - 0.001));
      await waitForEvent(video, "seeked");

      if (video.videoWidth <= 0 || video.videoHeight <= 0) {
        continue;
      }

      const scale = Math.min(
        MAX_SIZE / video.videoWidth,
        MAX_SIZE / video.videoHeight,
        1
      );
      const w = Math.max(1, Math.round(video.videoWidth * scale));
      const h = Math.max(1, Math.round(video.videoHeight * scale));
      canvas.width = w;
      canvas.height = h;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(video, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      keyOutGreenscreen(imageData);

      if (typeof createImageBitmap === "function") {
        const bitmap = await createImageBitmap(imageData);
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
      } else {
        ctx.putImageData(imageData, 0, 0);
      }

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((value) => resolve(value), "image/png");
      });
      if (blob) frames.push(blob);
    }

    if (frames.length === 0) {
      throw new Error("Could not extract transparent bird frames.");
    }

    return frames;
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}
