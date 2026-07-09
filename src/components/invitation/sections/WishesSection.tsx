"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import type { Wish } from "@/types/wish";

interface WishesSectionProps {
  defaultName?: string | null;
}

export default function WishesSection({ defaultName }: WishesSectionProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    guest_name: defaultName ?? "",
    message: "",
    attendance: "hadir",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/wishes");
        if (res.ok) {
          const data = await res.json();
          setWishes(data.wishes ?? []);
        }
      } catch {
        // wishes unavailable
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengirim ucapan.");
        return;
      }

      setWishes((prev) => [data.wish, ...prev]);
      setForm((f) => ({ ...f, message: "" }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="wishes" className="invitation-section bg-parchment px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <header className="mb-14 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal">
            Ucapan & Doa
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-navy md:text-4xl">
            Wishes
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-stone-500">
            Kirimkan ucapan dan doa restu untuk kami berdua.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Form */}
          <div className="card-premium p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                  Ucapan berhasil dikirim. Terima kasih!
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Nama
                </label>
                <input
                  type="text"
                  value={form.guest_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guest_name: e.target.value }))
                  }
                  placeholder="Nama Anda"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Kehadiran
                </label>
                <select
                  value={form.attendance}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, attendance: e.target.value }))
                  }
                  className="input-field"
                >
                  <option value="hadir">Hadir</option>
                  <option value="tidak_hadir">Tidak Hadir</option>
                  <option value="ragu">Masih Ragu</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Ucapan
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Tuliskan ucapan dan doa Anda..."
                  rows={4}
                  maxLength={500}
                  className="input-field resize-none"
                  required
                />
                <p className="mt-1 text-right text-[10px] text-stone-400">
                  {form.message.length}/500
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Mengirim..." : "Kirim Ucapan"}
              </button>
            </form>
          </div>

          {/* Wishes wall */}
          <div className="max-h-[520px] space-y-4 overflow-y-auto pr-2">
            {loading && (
              <p className="text-center text-sm text-stone-400">
                Memuat ucapan...
              </p>
            )}

            {!loading && wishes.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 py-16 text-center">
                <MessageCircle className="mb-3 h-8 w-8 text-stone-300" />
                <p className="text-sm text-stone-400">
                  Belum ada ucapan. Jadilah yang pertama!
                </p>
              </div>
            )}

            {wishes.map((wish) => (
              <div
                key={wish.id}
                className="rounded-xl border border-royal/15 bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy">{wish.guest_name}</p>
                    <p className="text-[10px] text-stone-400">
                      {new Date(wish.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {wish.attendance === "hadir" && (
                    <span className="badge bg-emerald-50 text-emerald-600">
                      <Heart className="mr-1 h-3 w-3" />
                      Hadir
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {wish.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
