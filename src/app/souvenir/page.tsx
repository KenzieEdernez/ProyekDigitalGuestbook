"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import {
  Search,
  Gift,
  CheckCircle2,
  ScanLine,
} from "lucide-react";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";
import AdminShell from "@/components/layout/AdminShell";
import ScanInput from "@/components/ScanInput";
import UniversalScanner from "@/components/UniversalScanner";
import type { Guest } from "@/types/guest";

const SOUVENIR_SCAN_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.EAN_13,
];

export default function SouvenirPage() {
  const [scanValue, setScanValue] = useState("");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [claimedGuest, setClaimedGuest] = useState<Guest | null>(null);
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLog, setSearchLog] = useState("");
  const [scannerKey, setScannerKey] = useState(0);
  const processingRef = useRef(false);
  const lastBarcodeRef = useRef<string | null>(null);

  const fetchGuests = useCallback(async () => {
    const res = await fetch("/api/guests");
    const data = await res.json();
    setAllGuests(data.guests);
  }, []);

  useEffect(() => {
    fetchGuests();
    const interval = setInterval(fetchGuests, 10000);
    return () => clearInterval(interval);
  }, [fetchGuests]);

  const restartScanner = useCallback(() => {
    lastBarcodeRef.current = null;
    processingRef.current = false;
    setScannerKey((k) => k + 1);
  }, []);

  const reset = useCallback(() => {
    setScanValue("");
    setGuest(null);
    setClaimedGuest(null);
    setError(null);
    restartScanner();
  }, [restartScanner]);

  const handleScan = useCallback(
    async (barcode: string) => {
      const code = barcode.trim().toUpperCase();
      if (!code || loading || claimedGuest || guest) return;
      if (processingRef.current || lastBarcodeRef.current === code) return;

      processingRef.current = true;
      lastBarcodeRef.current = code;
      setLoading(true);
      setError(null);
      setScanValue(code);

      try {
        const res = await fetch(`/api/souvenir?barcode=${encodeURIComponent(code)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Barcode tidak ditemukan.");
          setScanValue("");
          lastBarcodeRef.current = null;
          restartScanner();
          return;
        }

        if (data.guest.status === "pending") {
          setError("Guest has not checked in yet.");
          setScanValue("");
          lastBarcodeRef.current = null;
          restartScanner();
          return;
        }

        if (data.guest.status === "souvenir_claimed") {
          setError("Souvenir has already been collected.");
          setScanValue("");
          lastBarcodeRef.current = null;
          restartScanner();
          return;
        }

        setGuest(data.guest);
      } catch {
        setError("Failed to connect to the server.");
        lastBarcodeRef.current = null;
        restartScanner();
      } finally {
        setLoading(false);
        processingRef.current = false;
      }
    },
    [loading, claimedGuest, guest, restartScanner]
  );

  const handleClaim = async () => {
    if (!guest || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/souvenir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ souvenir_barcode: guest.souvenir_barcode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Penukaran gagal.");
        restartScanner();
        return;
      }

      setClaimedGuest(data.guest);
      setGuest(null);
      fetchGuests();
    } catch {
        setError("Failed to connect to the server.");
      restartScanner();
    } finally {
      setLoading(false);
    }
  };

  const transactions = allGuests
    .filter((g) => g.souvenir_claimed_at)
    .sort((a, b) =>
      (b.souvenir_claimed_at || "").localeCompare(a.souvenir_claimed_at || "")
    )
    .filter((g) => !searchLog || g.name.toLowerCase().includes(searchLog.toLowerCase()))
    .slice(0, 10);

  const totalClaimed = allGuests.filter((g) => g.status === "souvenir_claimed").length;
  const totalEligible = allGuests.filter(
    (g) => g.status === "checked_in" || g.status === "souvenir_claimed"
  ).length;

  const scannerActive = !loading && !claimedGuest && !guest;

  return (
    <AdminShell
      title="Souvenir Management"
      subtitle="Manage souvenir distribution and track guest pickups"
    >
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {claimedGuest ? (
        <div className="mx-auto max-w-lg card-premium p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-navy">Souvenir Collected Successfully</h2>
          <p className="mt-2 text-stone-600 dark:text-stone-300">{claimedGuest.name}</p>
          <p className="text-sm text-stone-400">
            Envelope {claimedGuest.angpao_number} · {claimedGuest.pax} guest{claimedGuest.pax > 1 ? "s" : ""}
          </p>
          <button onClick={reset} className="btn-navy mt-8 w-full py-3">
            Scan Next Guest
          </button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="card-premium p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ScanLine className="h-5 w-5 text-royal" />
              <h2 className="font-serif text-lg font-bold text-navy">Scan Souvenir QR / Barcode</h2>
                </div>
                {scannerActive && (
                  <span className="badge bg-emerald-100 text-emerald-700">Live Camera</span>
                )}
              </div>

              <div className="mb-4">
                <UniversalScanner
                  key={scannerKey}
                  active={scannerActive}
                  autoStart
                  formats={SOUVENIR_SCAN_FORMATS}
                  scanRegion="full"
                  onDetected={handleScan}
                  prompt="Point the camera at the souvenir QR or barcode"
                />
              </div>

              <div>
                <ScanInput
                  value={scanValue}
                  onChange={setScanValue}
                  onScan={handleScan}
                  placeholder="Or enter manually..."
                  disabled={loading || !!guest}
                  variant="premium"
                />
              </div>

              {!guest && !loading && (
                <p className="mt-3 text-center text-sm text-stone-400">
                  Camera active — scan one souvenir QR/barcode, then confirm pickup
                </p>
              )}
            </div>

            {guest && (
              <div className="rounded-xl border border-royal/20 bg-parchment/50 p-5">
                <div className="flex items-center gap-4">
                  {guest.photo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={guest.photo_url}
                      alt={guest.name}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-royal/30"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-royal/20 text-xl font-bold text-royal">
                      {guest.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-serif text-xl font-bold text-navy">{guest.name}</p>
                    <p className="text-sm text-stone-500">
                      {guest.pax} guest{guest.pax > 1 ? "s" : ""} · Envelope {guest.angpao_number}
                    </p>
                  </div>
                </div>
                <button onClick={handleClaim} disabled={loading} className="btn-navy mt-4 w-full py-3">
                  <Gift className="h-4 w-4" />
                  {loading ? "Processing..." : "Confirm Souvenir Pickup"}
                </button>
              </div>
            )}

            <div className="card-premium overflow-hidden">
              <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 dark:border-stone-700">
                <h2 className="font-serif text-lg font-bold text-navy">Transaction Log</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search guest..."
                    value={searchLog}
                    onChange={(e) => setSearchLog(e.target.value)}
                    className="input-field py-1.5 pl-8 pr-3 text-xs"
                  />
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left dark:bg-navy-900/80">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-stone-400">Time</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-stone-400">Guest</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-stone-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((g) => (
                    <tr key={g.id} className="border-t border-stone-50 dark:border-stone-800">
                      <td className="px-6 py-3 text-stone-500 dark:text-stone-400">
                        {new Date(g.souvenir_claimed_at!).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-3 font-medium text-navy">{g.name}</td>
                      <td className="px-6 py-3">
                        <span className="text-xs font-semibold text-emerald-600">Collected</span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-stone-400">
                        No transactions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl bg-navy p-6 text-white">
              <h3 className="font-serif text-lg font-bold">Distribution Insights</h3>
              <div className="mt-6 flex flex-col items-center">
                <div className="relative flex h-36 w-36 items-center justify-center">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke="#c5a059"
                      strokeWidth="3"
                      strokeDasharray={`${totalEligible ? (totalClaimed / totalEligible) * 100 : 0} 100`}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="font-serif text-3xl font-bold">{totalClaimed}</p>
                    <p className="text-[10px] uppercase text-white/60">Total</p>
                  </div>
                </div>
                <div className="mt-4 w-full space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Collected</span>
                    <span className="font-semibold text-royal">{totalClaimed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Waiting</span>
                    <span className="font-semibold">{totalEligible - totalClaimed}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </AdminShell>
  );
}
