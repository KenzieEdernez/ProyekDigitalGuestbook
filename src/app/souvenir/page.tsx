"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Gift,
  Package,
  CheckCircle2,
  Clock,
  ScanLine,
} from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import ScanInput from "@/components/ScanInput";
import UniversalScanner from "@/components/UniversalScanner";
import type { Guest } from "@/types/guest";

const inventory = [
  {
    name: "Premium Gift Box",
    category: "Premium",
    stock: 245,
    total: 300,
    status: "Optimal",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Crystal Souvenir",
    category: "Tech",
    stock: 12,
    total: 150,
    status: "Low Stock",
    statusColor: "bg-red-100 text-red-700",
  },
  {
    name: "Artisan Candle",
    category: "Hospitality",
    stock: 89,
    total: 200,
    status: "Moderate",
    statusColor: "bg-amber-100 text-amber-700",
  },
];

export default function SouvenirPage() {
  const [scanValue, setScanValue] = useState("");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [claimedGuest, setClaimedGuest] = useState<Guest | null>(null);
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLog, setSearchLog] = useState("");

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

  const reset = useCallback(() => {
    setScanValue("");
    setGuest(null);
    setClaimedGuest(null);
    setError(null);
  }, []);

  const handleScan = async (barcode: string) => {
    if (loading || claimedGuest) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/souvenir?barcode=${encodeURIComponent(barcode)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Barcode tidak ditemukan.");
        setScanValue("");
        return;
      }

      if (data.guest.status === "pending") {
        setError("Tamu belum check-in.");
        setScanValue("");
        return;
      }

      if (data.guest.status === "souvenir_claimed") {
        setError("Souvenir sudah diambil sebelumnya.");
        setScanValue("");
        return;
      }

      setGuest(data.guest);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!guest) return;
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
        return;
      }

      setClaimedGuest(data.guest);
      setGuest(null);
      fetchGuests();
    } catch {
      setError("Gagal terhubung ke server.");
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

  const totalClaimed = allGuests.filter((g) => g.status === "souvenir_claimed")
    .length;
  const totalEligible = allGuests.filter(
    (g) => g.status === "checked_in" || g.status === "souvenir_claimed"
  ).length;

  return (
    <AdminShell
      title="Souvenir Management"
      subtitle="Kelola distribusi souvenir dan lacak pengambilan tamu"
    >
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {claimedGuest ? (
        <div className="mx-auto max-w-lg card-premium p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-navy">Souvenir Berhasil Diberikan</h2>
          <p className="mt-2 text-stone-600">{claimedGuest.name}</p>
          <p className="text-sm text-stone-400">Angpao {claimedGuest.angpao_number} · {claimedGuest.pax} tamu</p>
          <button onClick={reset} className="btn-navy mt-8 w-full py-3">Scan Berikutnya</button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            {/* Scan panel */}
            <div className="card-premium p-6">
              <div className="flex items-center gap-3">
                <ScanLine className="h-5 w-5 text-royal" />
                <h2 className="font-serif text-lg font-bold text-navy">Scan Barcode Souvenir</h2>
              </div>
              <div className="mt-4">
                {/* UniversalScanner mounted here for camera-based scanning */}
                <UniversalScanner
                  onDetected={(code) => {
                    setScanValue(code);
                    handleScan(code);
                  }}
                  autoStart={true}
                />

                {/* keep text input fallback for manual/keyboard scanners */}
                <div className="mt-4">
                  <ScanInput
                    value={scanValue}
                    onChange={setScanValue}
                    onScan={handleScan}
                    placeholder="Scan barcode kartu souvenir..."
                    disabled={loading}
                    variant="premium"
                  />
                </div>
              </div>

              {guest && (
                <div className="mt-6 rounded-xl border border-royal/20 bg-parchment/50 p-5">
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
                      <p className="text-sm text-stone-500">{guest.pax} tamu · Angpao {guest.angpao_number}</p>
                    </div>
                  </div>
                  <button onClick={handleClaim} disabled={loading} className="btn-navy mt-4 w-full py-3">
                    <Gift className="h-4 w-4" />
                    {loading ? "Memproses..." : "Konfirmasi Berikan Souvenir"}
                  </button>
                </div>
              )}
            </div>

            {/* Inventory cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {inventory.map((item) => (
                <div key={item.name} className="card-premium p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-parchment">
                    <Package className="h-5 w-5 text-royal" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{item.category}</p>
                  <p className="mt-1 font-semibold text-navy">{item.name}</p>
                  <p className="mt-2 text-sm text-stone-500">{item.stock}/{item.total}</p>
                  <span className={`badge mt-2 ${item.statusColor}`}>{item.status}</span>
                </div>
              ))}
            </div>

            {/* Transaction log */}
            <div className="card-premium overflow-hidden">
              <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
                <h2 className="font-serif text-lg font-bold text-navy">Transaction Log</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Cari tamu..."
                    value={searchLog}
                    onChange={(e) => setSearchLog(e.target.value)}
                    className="rounded-lg border border-stone-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-royal"
                  />
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-stone-400">Waktu</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-stone-400">Tamu</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-stone-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((g) => (
                    <tr key={g.id} className="border-t border-stone-50">
                      <td className="px-6 py-3 text-stone-500">
                        {new Date(g.souvenir_claimed_at!).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-6 py-3 font-medium text-navy">{g.name}</td>
                      <td className="px-6 py-3">
                        <span className="text-xs font-semibold text-emerald-600">+ Collected</span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-stone-400">Belum ada transaksi</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights panel */}
          <div className="space-y-6">
            <div className="rounded-xl bg-navy p-6 text-white">
              <h3 className="font-serif text-lg font-bold">Distribution Insights</h3>
              <div className="mt-6 flex flex-col items-center">
                <div className="relative flex h-36 w-36 items-center justify-center">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#c5a059" strokeWidth="3" strokeDasharray={`${totalEligible ? (totalClaimed / totalEligible) * 100 : 0} 100`} />
                  </svg>
                  <div className="absolute text-center">
                    <p className="font-serif text-3xl font-bold">{totalClaimed}</p>
                    <p className="text-[10px] uppercase text-white/60">Total</p>
                  </div>
                </div>
                <div className="mt-4 w-full space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Sudah diambil</span>
                    <span className="font-semibold text-royal">{totalClaimed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Menunggu</span>
                    <span className="font-semibold">{totalEligible - totalClaimed}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-premium p-6">
              <h3 className="font-serif text-lg font-bold text-navy">Action Center</h3>
              <div className="mt-4 space-y-3">
                <button className="flex w-full items-center gap-3 rounded-lg border border-stone-200 p-4 text-left text-sm transition hover:bg-stone-50">
                  <Clock className="h-5 w-5 text-royal" />
                  <span>Generate Daily Report</span>
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg border border-stone-200 p-4 text-left text-sm transition hover:bg-stone-50">
                  <Package className="h-5 w-5 text-royal" />
                  <span>Inventory Summary</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
