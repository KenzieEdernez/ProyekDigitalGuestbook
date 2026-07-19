import {
  birdMediaProxyUrl,
  keyOutGreenscreen,
} from "@/lib/bird-chroma-key";

type KeyedDrawerOptions = {
  src: string;
  maxSize?: number;
  onFrame?: (sheet: HTMLCanvasElement) => void;
};

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};

/**
 * Safari/iOS bug: putImageData() with alpha=0 often paints opaque black.
 * createImageBitmap(ImageData) + drawImage preserves transparency correctly.
 */
async function paintKeyedFrame(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  w: number,
  h: number
) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(imageData);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return;
  }

  // Fallback: punch greenscreen out with destination-out (no putImageData alpha).
  const mask = document.createElement("canvas");
  mask.width = w;
  mask.height = h;
  const maskCtx = mask.getContext("2d");
  if (!maskCtx) {
    ctx.putImageData(imageData, 0, 0);
    return;
  }

  const maskData = maskCtx.createImageData(w, h);
  const src = imageData.data;
  const dst = maskData.data;
  for (let i = 0; i < src.length; i += 4) {
    const alpha = src[i + 3];
    // Opaque white where we want to erase (keyed-out green)
    const erase = alpha === 0 ? 255 : 0;
    dst[i] = 255;
    dst[i + 1] = 255;
    dst[i + 2] = 255;
    dst[i + 3] = erase;
  }
  maskCtx.putImageData(maskData, 0, 0);
  ctx.globalCompositeOperation = "destination-out";
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}

/**
 * Plays a greenscreen bird video and writes keyed frames into a canvas.
 * Attaches the video to the DOM (required for reliable iOS/Safari decoding).
 */
export function startKeyedBirdDrawer({
  src,
  maxSize = 180,
  onFrame,
}: KeyedDrawerOptions) {
  let active = true;
  let raf = 0;
  let frameCallback = 0;
  let gotFrame = false;
  let busy = false;
  let wantsFrame = false;

  const playableSrc = birdMediaProxyUrl(src);
  const sheet = document.createElement("canvas");
  const ctx = sheet.getContext("2d", {
    willReadFrequently: true,
    alpha: true,
  });

  const video = document.createElement("video") as VideoWithFrameCallback;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.setAttribute("muted", "");
  video.preload = "auto";
  video.src = playableSrc;

  // Keep in DOM so iOS actually decodes frames for canvas drawImage.
  video.style.cssText =
    "position:fixed;width:2px;height:2px;opacity:0.01;pointer-events:none;left:0;top:0;z-index:-1;";
  document.body.appendChild(video);

  const play = () => {
    void video.play().catch(() => undefined);
  };

  video.addEventListener("loadeddata", play);
  video.addEventListener("canplay", play);
  video.addEventListener("canplaythrough", play);
  play();

  const process = () => {
    if (!active || !ctx) return;
    if (busy) {
      wantsFrame = true;
      return;
    }
    if (video.readyState < 2 || video.videoWidth <= 0 || video.videoHeight <= 0) {
      return;
    }

    const scale = Math.min(
      maxSize / video.videoWidth,
      maxSize / video.videoHeight,
      1
    );
    const w = Math.max(1, Math.round(video.videoWidth * scale));
    const h = Math.max(1, Math.round(video.videoHeight * scale));

    if (sheet.width !== w || sheet.height !== h) {
      sheet.width = w;
      sheet.height = h;
    }

    // Draw raw frame first (needed for destination-out fallback too).
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(video, 0, 0, w, h);

    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(0, 0, w, h);
    } catch {
      return;
    }

    keyOutGreenscreen(imageData);
    busy = true;

    void paintKeyedFrame(ctx, imageData, w, h)
      .then(() => {
        if (!active) return;
        gotFrame = true;
        onFrame?.(sheet);
      })
      .catch(() => {
        if (!active || !ctx) return;
        // Last resort — may show black on old iOS; CSS screen-blend covers it.
        ctx.putImageData(imageData, 0, 0);
        gotFrame = true;
        onFrame?.(sheet);
      })
      .finally(() => {
        busy = false;
        if (active && wantsFrame) {
          wantsFrame = false;
          process();
        }
      });
  };

  const tickRaf = () => {
    if (!active) return;
    process();
    raf = requestAnimationFrame(tickRaf);
  };

  if (typeof video.requestVideoFrameCallback === "function") {
    const onVideoFrame = () => {
      if (!active) return;
      process();
      frameCallback = video.requestVideoFrameCallback!(onVideoFrame);
    };
    frameCallback = video.requestVideoFrameCallback(onVideoFrame);

    const waitTick = () => {
      if (!active) return;
      if (!gotFrame) {
        process();
        raf = requestAnimationFrame(waitTick);
      }
    };
    raf = requestAnimationFrame(waitTick);
  } else {
    raf = requestAnimationFrame(tickRaf);
  }

  return {
    sheet,
    video,
    stop() {
      active = false;
      cancelAnimationFrame(raf);
      if (frameCallback && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(frameCallback);
      }
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
      video.removeEventListener("canplaythrough", play);
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
    },
  };
}
