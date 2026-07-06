"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Download, Trash2, Pencil, X } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import type { Guest, GuestStats } from "@/types/guest";
import { formatRegNumber } from "@/lib/event-config";

type EditForm = {
  name: string;
  phone: string;
  address: string;
  pax: number;
  attending: boolean;
};

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  checked_in: { label: "Checked-in", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  souvenir_claimed: {
    label: "Souvenir OK",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  declined: { label: "Declined", className: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300" },
};

const souvenirConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "text-stone-400" },
  checked_in: { label: "Pending", className: "text-amber-600" },
  souvenir_claimed: { label: "Distributed", className: "text-emerald-600" },
  declined: { label: "-", className: "text-stone-300" },
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GuestListPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<GuestStats | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deletingAll, setDeletingAll] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    phone: "",
    address: "",
    pax: 1,
    attending: true,
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

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

  const exportPrintableReport = () => {
    const reportDate = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const totalPax = guests
      .filter((g) => g.status !== "declined")
      .reduce((sum, g) => sum + g.pax, 0);
    const rows = guests
      .map(
        (guest, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>
              <strong>${escapeHtml(guest.name)}</strong>
              <small>${escapeHtml(guest.phone || "-")}</small>
            </td>
            <td>${escapeHtml(guest.address || "-")}</td>
            <td class="center">${guest.pax}</td>
            <td>${escapeHtml(formatRegNumber(guest.invitation_barcode))}</td>
            <td>${escapeHtml(guest.angpao_number || "-")}</td>
            <td>${escapeHtml(statusConfig[guest.status]?.label || guest.status)}</td>
            <td>${escapeHtml(formatDateTime(guest.checked_in_at))}</td>
          </tr>
        `
      )
      .join("");

    const printableHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Guest Data Report</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #f7f3ea;
              color: #14213d;
              font-family: Arial, sans-serif;
            }
            .page {
              width: 297mm;
              min-height: 210mm;
              margin: 0 auto;
              background: white;
              padding: 18mm;
            }
            .header {
              display: flex;
              justify-content: space-between;
              gap: 24px;
              border-bottom: 3px solid #c5a059;
              padding-bottom: 18px;
            }
            .eyebrow {
              color: #c5a059;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.22em;
              text-transform: uppercase;
            }
            h1 {
              margin: 8px 0 0;
              font-family: Georgia, serif;
              font-size: 30px;
            }
            .meta {
              color: #78716c;
              font-size: 12px;
              line-height: 1.6;
              text-align: right;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin: 20px 0;
            }
            .summary-card {
              border: 1px solid #e7e5e4;
              border-radius: 14px;
              padding: 12px;
            }
            .summary-card span {
              display: block;
              color: #78716c;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.12em;
              text-transform: uppercase;
            }
            .summary-card strong {
              display: block;
              margin-top: 6px;
              font-family: Georgia, serif;
              font-size: 24px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th {
              background: #14213d;
              color: white;
              padding: 10px 8px;
              text-align: left;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              font-size: 9px;
            }
            td {
              border-bottom: 1px solid #e7e5e4;
              padding: 9px 8px;
              vertical-align: top;
            }
            td small {
              display: block;
              margin-top: 3px;
              color: #78716c;
            }
            .center { text-align: center; }
            .footer {
              margin-top: 18px;
              color: #78716c;
              font-size: 10px;
              text-align: center;
            }
            @page { size: A4 landscape; margin: 10mm; }
            @media print {
              body { background: white; }
              .page { width: auto; min-height: auto; padding: 0; }
            }
          </style>
        </head>
        <body>
          <main class="page">
            <section class="header">
              <div>
                <div class="eyebrow">Digital Guestbook</div>
                <h1>Guest Data Report</h1>
              </div>
              <div class="meta">
                Printed: ${escapeHtml(reportDate)}<br />
                Total records: ${guests.length} guests
              </div>
            </section>

            <section class="summary">
              <div class="summary-card"><span>Total Guests</span><strong>${guests.length}</strong></div>
              <div class="summary-card"><span>Total Pax</span><strong>${totalPax}</strong></div>
              <div class="summary-card"><span>Check-in</span><strong>${stats?.checked_in ?? 0}</strong></div>
              <div class="summary-card"><span>Souvenir</span><strong>${stats?.souvenir_claimed ?? 0}</strong></div>
            </section>

            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Name / Phone</th>
                  <th>Address</th>
                  <th>Pax</th>
                  <th>No. Reg</th>
                  <th>Angpao</th>
                  <th>Status</th>
                  <th>Check-in</th>
                </tr>
              </thead>
              <tbody>${rows || `<tr><td colspan="8" class="center">No guest data yet</td></tr>`}</tbody>
            </table>

            <div class="footer">Generated by EdernDigital Guestbook System</div>
          </main>
          <script>
            window.addEventListener("load", () => {
              window.focus();
              window.print();
            });
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup was blocked. Please allow popups to print the report.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(printableHtml);
    printWindow.document.close();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this guest?")) return;
    await fetch(`/api/guests/${id}`, { method: "DELETE" });
    fetchData();
  };

  const openEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setEditForm({
      name: guest.name,
      phone: guest.phone ?? "",
      address: guest.address ?? "",
      pax: guest.pax,
      attending: guest.status !== "declined",
    });
    setEditError("");
  };

  const closeEdit = () => {
    if (saving) return;
    setEditingGuest(null);
    setEditError("");
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingGuest) return;

    setSaving(true);
    setEditError("");

    try {
      const canChangeAttendance =
        editingGuest.status === "pending" || editingGuest.status === "declined";

      const res = await fetch(`/api/guests/${editingGuest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          address: editForm.address,
          pax: editForm.pax,
          ...(canChangeAttendance ? { attending: editForm.attending } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update guest.");
        return;
      }

      setEditingGuest(null);
      await fetchData();
    } catch {
      setEditError("Failed to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const canEditAttendance =
    editingGuest?.status === "pending" || editingGuest?.status === "declined";

  const handleDeleteAll = async () => {
    if (guests.length === 0) return;
    if (!confirm(`Delete all ${guests.length} guest records? This action cannot be undone.`)) {
      return;
    }
    if (!confirm("Confirm once more: all guest data will be permanently deleted.")) {
      return;
    }

    setDeletingAll(true);
    try {
      const res = await fetch("/api/guests", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete all data.");
        return;
      }
      await fetchData();
    } catch {
      alert("Failed to connect to the server.");
    } finally {
      setDeletingAll(false);
    }
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
      subtitle="Monitor guest list, envelopes, and souvenir status"
      actions={
        <>
          <button
            onClick={exportPrintableReport}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-navy-700"
          >
            <Download className="h-4 w-4" />
            Export / Print
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={deletingAll || guests.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-4 w-4" />
            {deletingAll ? "Deleting..." : "Delete All Data"}
          </button>
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
            <thead className="border-b border-stone-100 bg-stone-50 dark:border-stone-700 dark:bg-navy-900/50">
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
                    className="border-b border-stone-50 transition hover:bg-stone-50/50 dark:border-stone-800 dark:hover:bg-navy-900/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-parchment text-xs font-bold text-royal dark:bg-navy-700">
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
                          <p className="font-semibold text-navy dark:text-stone-100">{guest.name}</p>
                          <p className="text-xs text-stone-400">
                            {guest.phone || formatRegNumber(guest.invitation_barcode)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-700 dark:text-stone-200">{guest.pax}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${statusConfig[guest.status]?.className}`}
                      >
                        {statusConfig[guest.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-stone-600 dark:text-stone-300">
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
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(guest)}
                          className="inline-flex items-center gap-1 text-xs text-royal hover:text-navy dark:hover:text-stone-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Hapus
                        </button>
                      </div>
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
              label: "Not Arrived",
              value: stats.pending,
              sub: "Waiting for check-in",
            },
            {
              label: "Check-in Rate",
              value: `${checkInRate}%`,
              sub: `${stats.checked_in + stats.souvenir_claimed} guests`,
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
              <p className="mt-1 font-serif text-3xl font-bold text-navy dark:text-stone-100">
                {s.value}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card-premium w-full max-w-lg p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy dark:text-stone-100">
                  Edit Guest
                </h3>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {formatRegNumber(editingGuest.invitation_barcode)}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-navy-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Guest Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Address
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Number of Guests
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={editForm.pax}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      pax: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)),
                    }))
                  }
                  className="input-field"
                  required
                />
              </div>

              {canEditAttendance ? (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Attendance
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm((f) => ({ ...f, attending: true }))
                      }
                      className={`rounded-lg py-3 text-xs font-bold uppercase tracking-wide transition ${
                        editForm.attending
                          ? "bg-navy text-white shadow-md"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-navy-700 dark:text-stone-300 dark:hover:bg-navy-600"
                      }`}
                    >
                      Attending
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm((f) => ({ ...f, attending: false }))
                      }
                      className={`rounded-lg py-3 text-xs font-bold uppercase tracking-wide transition ${
                        !editForm.attending
                          ? "bg-navy text-white shadow-md"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-navy-700 dark:text-stone-300 dark:hover:bg-navy-600"
                      }`}
                    >
                      Not Attending
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:bg-navy-900/50 dark:text-stone-300">
                  Status:{" "}
                  <span className="font-semibold">
                    {statusConfig[editingGuest.status]?.label}
                  </span>
                  . Attendance cannot be changed after check-in.
                </div>
              )}

              {editError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
                  {editError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-navy-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-navy px-5 py-2.5 text-sm disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
