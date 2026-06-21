import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

type Props = {
  onSuccess?: (code: string) => void;
  apiEndpoint?: string; // default /api/checkin
};

export default function BarcodeScanner({ onSuccess, apiEndpoint = "/api/checkin" }: Props) {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const readerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "html5qr-reader";

  useEffect(() => {
    return () => {
      // cleanup on unmount
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startScanner() {
    if (scanning) return;
    setMessage("Mencari kamera...");
    const config = {
      fps: 10,
      qrbox: 250,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.CODE_39,
      ],
    } as any;

    try {
      const html5QrCode = new Html5Qrcode(containerId);
      readerRef.current = html5QrCode;
      setScanning(true);
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // success
          stopScanner();
          handleDetected(decodedText);
        },
        (error) => {
          // optional: per-frame decode failure
          // console.debug("scan fail", error);
        }
      );
      setMessage("Arahkan kamera ke barcode / QR");
    } catch (err: any) {
      console.error("Tidak bisa mulai kamera:", err);
      setMessage("Gagal mengakses kamera. Pastikan izin diberikan atau coba upload gambar.");
      setScanning(false);
    }
  }

  async function stopScanner() {
    const html5QrCode = readerRef.current;
    if (!html5QrCode) return;
    try {
      await html5QrCode.stop();
      await html5QrCode.clear();
    } catch (err) {
      // ignore
    }
    readerRef.current = null;
    setScanning(false);
  }

  async function handleDetected(code: string) {
    setMessage(`Terbaca: ${code}. Mengirim ke server...`);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: code }),
      });
      if (!res.ok) {
        const text = await res.text();
        setMessage(`Server error: ${res.status} ${text}`);
        return;
      }
      const data = await res.json();
      setMessage(`Check-in berhasil: ${data.message ?? "OK"}`);
      if (onSuccess) onSuccess(code);
      // contoh: data.souvenir { id, name, pickupCode }
    } catch (err: any) {
      console.error(err);
      setMessage("Gagal mengirim ke server.");
    }
  }

  // fallback: upload image (html5-qrcode juga mendukung scan dari file in-memory; keep simple: just send file to server)
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage("Mengirim gambar ke server untuk di-scan...");
    const f = new FormData();
    f.append("image", file);
    try {
      const res = await fetch(`${apiEndpoint}/upload-scan`, {
        method: "POST",
        body: f,
      });
      if (!res.ok) {
        setMessage(`Server error: ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.barcode) {
        setMessage(`Terbaca: ${data.barcode}`);
        handleDetected(data.barcode);
      } else {
        setMessage("Gagal membaca barcode dari gambar.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Gagal mengirim gambar ke server.");
    }
  }

  return (
    <div>
      <div id={containerId} style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
        {/* html5-qrcode mounts video/canvas into this div */}
      </div>

      <div style={{ marginTop: 12 }}>
        {!scanning ? (
          <button onClick={startScanner}>Buka Kamera untuk Scan</button>
        ) : (
          <button onClick={stopScanner}>Stop Kamera</button>
        )}
        <label style={{ marginLeft: 8 }}>
          atau upload gambar:
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}
