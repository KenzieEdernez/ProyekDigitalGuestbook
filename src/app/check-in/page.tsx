"use client";

import { useCallback, useState } from "react";
import { Search, CheckCircle2, Wifi } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import ScanInput from "@/components/ScanInput";
import CameraCapture from "@/components/CameraCapture";
import BarcodeDisplay from "@/components/BarcodeDisplay";
import { formatRegNumber } from "@/lib/event-config";
import type { Guest, CheckInResult } from "@/types/guest";

export default function CheckInPage() {
  const [scanValue, setScanValue] = useState("");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const reset = useCallback(() => {
    setScanValue("");
    setGuest(null);
    setResult(null);
    setError(null);
    setShowCamera(false);
  }, []);

  const handleScan = async (barcode: string) => {
    if (loading || result) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/guests?barcode=${encodeURIComponent(barcode)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Tamu tidak ditemukan.");
        setScanValue("");
        return;
      }

      if (data.guest.status !== "pending") {
        setError("Tamu sudah check-in sebelumnya.");
        setScanValue("");
        return;
      }

      setGuest(data.guest);
      setShowCamera(true);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (photo: string) => {
    if (!guest) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitation_barcode: guest.invitation_barcode,
          photo,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Check-in gagal.");
        return;
      }

      setResult(data);
      setShowCamera(false);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell title="Check-in Registry">
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result ? (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="card-premium p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-navy">
              Check-in Berhasil
            </h2>
            <p className="mt-2 text-stone-600">
              {result.guest.name} · {result.guest.pax} tamu · Boleh masuk
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card-premium p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-red-500">
                Nomor Angpao
              </p>
              <p className="mt-3 font-serif text-5xl font-bold text-red-600">
                {result.angpao_number}
              </p>
              <p className="mt-2 text-xs text-stone-400">Tempel ke amplop</p>
            </div>
            <div className="card-premium p-6">
              <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-royal">
                Barcode Souvenir
              </p>
              <BarcodeDisplay value={result.souvenir_barcode} />
              <p className="mt-2 text-center text-xs text-stone-400">
                Tempel ke kartu souvenir
              </p>
            </div>
          </div>

          <button onClick={reset} className="btn-navy w-full py-4">
            Check-in Tamu Berikutnya
          </button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Camera panel */}
          <div className="card-premium p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-navy">
                Guest Photo Capture
              </h2>
              {showCamera && (
                <span className="badge bg-emerald-100 text-emerald-700">
                  Live Camera
                </span>
              )}
            </div>

            {showCamera && guest ? (
              <CameraCapture
                compact
                autoStart
                onCapture={handleCheckIn}
                onCancel={() => setShowCamera(false)}
              />
            ) : (
              <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl bg-navy-900/5 text-stone-400">
                <Search className="mb-4 h-12 w-12 opacity-30" />
                <p className="text-sm">Scan QR tamu untuk mulai</p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between rounded-lg bg-parchment px-4 py-3 text-xs">
              <span className="text-stone-500">Scanner Status: HID-Scanner-V3</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <Wifi className="h-3.5 w-3.5" /> Ready
              </span>
            </div>
          </div>

          {/* Registry panel */}
          <div className="card-premium p-6">
            <h2 className="font-serif text-2xl font-bold text-navy">
              Check-in Registry
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Guest Name / QR Code
                </label>
                <ScanInput
                  value={scanValue}
                  onChange={setScanValue}
                  onScan={handleScan}
                  placeholder="Scan QR atau ketik nama..."
                  disabled={loading}
                  variant="premium"
                />
              </div>

              {guest && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Registration No.
                    </label>
                    <input
                      readOnly
                      value={formatRegNumber(guest.invitation_barcode)}
                      className="input-field bg-stone-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Party Size
                    </label>
                    <input
                      readOnly
                      value={`${guest.pax} Tamu`}
                      className="input-field bg-stone-50"
                    />
                  </div>

                  <div className="rounded-lg bg-navy px-5 py-4 text-white">
                    <p className="text-xs text-white/60">Guest Info</p>
                    <p className="mt-1 font-serif text-xl font-bold">
                      {guest.name}
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      {guest.phone} · {guest.pax} orang
                    </p>
                  </div>
                </>
              )}

              {loading && (
                <p className="text-center text-sm text-stone-400">
                  Memproses...
                </p>
              )}

              {!guest && !loading && (
                <p className="text-center text-sm text-stone-400">
                  Arahkan scanner ke QR code undangan tamu
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
