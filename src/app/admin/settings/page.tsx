"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import type { EventSettings } from "@/types/event";

const EMPTY_EVENT_SETTINGS: EventSettings = {
  name: "",
  date: "",
  dateDisplay: "",
  time: "",
  location: "",
  address: "",
  dressCode: "",
  dressNote: "",
};

const fields: Array<{
  key: keyof EventSettings;
  label: string;
  placeholder: string;
  type?: string;
}> = [
  {
    key: "name",
    label: "Nama Event",
    placeholder: "Contoh: Nama acara",
  },
  {
    key: "date",
    label: "Tanggal",
    placeholder: "Pilih tanggal acara",
    type: "date",
  },
  {
    key: "time",
    label: "Waktu",
    placeholder: "Contoh: 19:00 - 00:00",
  },
  {
    key: "location",
    label: "Lokasi",
    placeholder: "Contoh: The Imperial Grand Hall",
  },
  {
    key: "address",
    label: "Alamat",
    placeholder: "Contoh: 450 Prestige Blvd, Jakarta",
  },
  {
    key: "dressCode",
    label: "Dress Code",
    placeholder: "Contoh: Black Tie & Formal",
  },
  {
    key: "dressNote",
    label: "Catatan Dress Code",
    placeholder: "Contoh: Navy & Gold Preferred",
  },
];

export default function EventSettingsPage() {
  const [form, setForm] = useState<EventSettings>(EMPTY_EVENT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/event-settings", { cache: "no-store" });
        const data = await res.json();
        if (data.settings) setForm(data.settings);
      } catch {
        setError("Gagal memuat pengaturan event.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/event-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan pengaturan.");
        return;
      }

      setForm(data.settings);
      setMessage("Pengaturan event berhasil disimpan.");
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Pengaturan Event"
      subtitle="Atur tanggal, waktu, lokasi, dan dress code yang tampil di form tamu"
    >
      <form onSubmit={handleSubmit} className="card-premium max-w-3xl p-6">
        {message && (
          <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg bg-parchment px-4 py-5 text-sm text-stone-500">
            Memuat pengaturan event...
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {field.label}
                </label>
                <input
                  type={field.type ?? "text"}
                  value={form[field.key]}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  disabled={saving}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        )}

        <button disabled={loading || saving} className="btn-navy mt-6 py-3">
          <Save className="h-4 w-4" />
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </form>
    </AdminShell>
  );
}
