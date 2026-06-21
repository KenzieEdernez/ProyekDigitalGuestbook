"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Camera, RotateCcw, CheckCircle2 } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (photoBase64: string) => void;
  onCancel?: () => void;
  compact?: boolean;
  autoStart?: boolean;
}

export default function CameraCapture({
  onCapture,
  onCancel,
  compact = false,
  autoStart = false,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setError("Tidak dapat mengakses kamera.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (autoStart) startCamera();
    return () => stopCamera();
  }, [autoStart, startCamera, stopCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setPreview(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
  }, [stopCamera]);

  const containerClass = compact
    ? "relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-navy-900"
    : "relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl bg-navy-900";

  return (
    <div className={compact ? "flex h-full flex-col" : "flex flex-col items-center gap-4"}>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {!preview ? (
        <>
          <div className={containerClass}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            {!cameraReady && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-navy-900/90">
                <Camera className="h-12 w-12 text-royal/60" />
                <button onClick={startCamera} className="btn-gold text-xs">
                  Buka Kamera
                </button>
              </div>
            )}
            {cameraReady && compact && (
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 bg-royal/60" />
            )}
          </div>

          {cameraReady && (
            <div className={`flex gap-3 ${compact ? "mt-4" : "mt-2"}`}>
              {onCancel && (
                <button
                  onClick={() => {
                    stopCamera();
                    onCancel();
                  }}
                  className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  <RotateCcw className="mx-auto h-4 w-4" />
                </button>
              )}
              <button
                onClick={takePhoto}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-navy shadow-md transition hover:bg-stone-50 ${compact ? "" : "touch-target"}`}
              >
                <Camera className="h-4 w-4" />
                Capture
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className={containerClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className={`flex gap-3 ${compact ? "mt-4" : "mt-2"}`}>
            <button
              onClick={() => {
                setPreview(null);
                startCamera();
              }}
              className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium"
            >
              Retake
            </button>
            <button
              onClick={() => onCapture(preview)}
              className="btn-navy flex-1 py-2.5 text-xs"
            >
              <CheckCircle2 className="h-4 w-4" />
              Gunakan
            </button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
