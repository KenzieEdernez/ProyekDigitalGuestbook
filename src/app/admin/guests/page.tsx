"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, Download, Plus } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import type { Guest, GuestStats } from "@/types/guest";
import { formatRegNumber } from "@/lib/event-config";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  checked_in: { label: "Checked-in", className: "bg-emerald-100 text-emerald-800" },
  souvenir_claimed: {
    label: "Souvenir OK",
    className: "bg-emerald-100 text-emerald-800",
  },
  declined: { label: "Declined", className: "bg-stone-100 text-stone-600" },
};

const souvenirConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "text-stone-400" },
  checked_in: { label: "Pending", className: "text-amber-600" },
  souvenir_claimed: { label: "Distributed", className: "text-emerald-600" },
  declined: { label: "-", className: "text-stone-300" },
};

export default function GuestListPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<GuestStats | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/guests");
    const data = await res.json();
    setGuests(data.guests);
    setStats(data.stats);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filtered = guests.filter((g) => {
    const matchFilter = filter === "all" || g.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.phone?.toLowerCase().includes(q) ||
      g.invitation_barcode?.toLowerCase().includes(q) ||
      g.angpao_number?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const exportCsv = () => {
    const headers = ["Nama", "HP", "Alamat", "Pax", "QR", "Angpao", "Status"];
    const rows = guests.map((g) => [
      g.name,
      g.phone || "",
      g.address || "",
      g.pax,
      g.invitation_barcode || "",
      g.angpao_number || "",
      statusConfig[g.status]?.label || g.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus tamu ini?")) return;
    await fetch(`/api/guests/${id}`, { method: "DELETE" });
    fetchData();
  };

  const checkInRate =
    stats && stats.pending + stats.checked_in + stats.souvenir_claimed > 0
      ? Math.round(
          ((stats.checked_in + stats.souvenir_claimed) /
            (stats.pending + stats.checked_in + stats.souvenir_claimed)) *
            100
        )
      : 0;

  return (
    <AdminShell
      title="Guest Data Management"
      subtitle="Pantau daftar tamu, angpao, dan status souvenir"
      actions={
        <>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <Link href="/admin/import" className="btn-navy py-2 text-xs">
            <Plus className="h-4 w-4" />
            Add Guest
          </Link>
        </>
      }
    >
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari nama, HP, atau angpao ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-auto min-w-[160px]"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="checked_in">Checked-in</option>
          <option value="souvenir_claimed">Souvenir OK</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Guest Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Pax
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Angpao No.
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Souvenir
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((guest) => {
                const initials = guest.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const souvenir = souvenirConfig[guest.status];

                return (
                  <tr
                    key={guest.id}
                    className="border-b border-stone-50 transition hover:bg-stone-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-parchment text-xs font-bold text-royal">
                          {guest.photo_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={guest.photo_url}
                              alt={guest.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-navy">{guest.name}</p>
                          <p className="text-xs text-stone-400">
                            {guest.phone || formatRegNumber(guest.invitation_barcode)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{guest.pax}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${statusConfig[guest.status]?.className}`}
                      >
                        {statusConfig[guest.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {guest.angpao_number ? `#${guest.angpao_number}` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold ${souvenir?.className}`}
                      >
                        {souvenir?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(guest.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total RSVP",
              value: stats.total - stats.declined,
              sub: `${stats.total_pax_registered} pax`,
            },
            {
              label: "Belum Datang",
              value: stats.pending,
              sub: "Menunggu check-in",
            },
            {
              label: "Check-in Rate",
              value: `${checkInRate}%`,
              sub: `${stats.checked_in + stats.souvenir_claimed} tamu`,
            },
            {
              label: "Souvenirs Given",
              value: `${stats.souvenir_claimed} / ${stats.checked_in + stats.souvenir_claimed || 0}`,
              sub: "Distribusi",
            },
          ].map((s) => (
            <div key={s.label} className="card-premium p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                {s.label}
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-navy">
                {s.value}
              </p>
              <p className="text-xs text-stone-500">{s.sub}</p>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
