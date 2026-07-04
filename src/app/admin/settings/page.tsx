"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Save } from "lucide-react";
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
  heroImage: "",
};

function readLandscapeImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const width = 1600;
        const height = 700;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Browser tidak mendukung resize gambar."));
          return;
        }

        const sourceRatio = image.width / image.height;
        const targetRatio = width / height;
        let sourceWidth = image.width;
        let sourceHeight = image.height;
        let sourceX = 0;
        let sourceY = 0;

        if (sourceRatio > targetRatio) {
          sourceWidth = image.height * targetRatio;
          sourceX = (image.width - sourceWidth) / 2;
        } else {
          sourceHeight = image.width / targetRatio;
          sourceY = (image.height - sourceHeight) / 2;
        }

        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          width,
          height
        );

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      image.onerror = () => reject(new Error("Gagal membaca gambar."));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

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
  const [imageProcessing, setImageProcessing] = useState(false);
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

  const handleHeroImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    setImageProcessing(true);
    setError(null);
    try {
      const heroImage = await readLandscapeImage(file);
      setForm((current) => ({ ...current, heroImage }));
    } catch {
      setError("Gagal memproses gambar.");
    } finally {
      setImageProcessing(false);
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
          <div className="space-y-6">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Foto Hero Landscape
              </label>
              <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                {form.heroImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.heroImage}
                    alt="Preview foto hero"
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center text-stone-400">
                    <ImageIcon className="h-8 w-8" />
                    <p className="mt-2 text-sm">Belum ada foto hero</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroImageChange}
                disabled={saving || imageProcessing}
                className="mt-3 block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-white hover:file:bg-navy/90"
              />
              <p className="mt-2 text-xs text-stone-400">
                Gunakan gambar landscape. Sistem akan crop otomatis agar pas di
                header halaman utama.
              </p>
            </div>

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
          </div>
        )}

        <button
          disabled={loading || saving || imageProcessing}
          className="btn-navy mt-6 py-3"
        >
          <Save className="h-4 w-4" />
          {saving
            ? "Menyimpan..."
            : imageProcessing
              ? "Memproses Gambar..."
              : "Simpan Pengaturan"}
        </button>
      </form>
    </AdminShell>
  );
}
