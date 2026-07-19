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
    if (!active || !ctx) return false;
    if (video.readyState < 2 || video.videoWidth <= 0 || video.videoHeight <= 0) {
      return false;
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

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(video, 0, 0, w, h);

    try {
      const imageData = ctx.getImageData(0, 0, w, h);
      keyOutGreenscreen(imageData);
      ctx.putImageData(imageData, 0, 0);
      gotFrame = true;
    } catch {
      // Proxy should keep this readable.
    }

    onFrame?.(sheet);
    return gotFrame;
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

    // Bootstrap until the first decoded frame arrives.
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
