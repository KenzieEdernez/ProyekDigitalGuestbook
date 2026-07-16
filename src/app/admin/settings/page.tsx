"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageIcon, Save } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import WeddingContentSettings from "@/components/admin/WeddingContentSettings";
import type { EventSettings } from "@/types/event";

const EMPTY_EVENT_SETTINGS: EventSettings = {
  name: "",
  date: "",
  dateDisplay: "",
  timeFrom: "",
  time: "",
  location: "",
  address: "",
  dressLadies: "",
  dressGentlemen: "",
  heroImage: "",
  heroImagePortrait: "",
};

function readCroppedImage(file: File, width: number, height: number) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Browser does not support image resizing."));
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
      image.onerror = () => reject(new Error("Failed to read image."));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

function readLandscapeImage(file: File) {
  return readCroppedImage(file, 1600, 700);
}

function readPortraitImage(file: File) {
  return readCroppedImage(file, 900, 1600);
}

export default function EventSettingsPage() {
  const [form, setForm] = useState<EventSettings>(EMPTY_EVENT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageProcessing, setImageProcessing] = useState<
    "landscape" | "portrait" | null
  >(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/event-settings", { cache: "no-store" });
        const data = await res.json();
        if (data.settings) setForm(data.settings);
      } catch {
        setError("Failed to load event settings.");
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
        setError(data.error || "Failed to save event settings.");
        return;
      }

      setForm(data.settings);
      setMessage("Page settings saved successfully.");
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    variant: "landscape" | "portrait"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File must be an image.");
      return;
    }

    setImageProcessing(variant);
    setError(null);
    try {
      const processed =
        variant === "landscape"
          ? await readLandscapeImage(file)
          : await readPortraitImage(file);
      setForm((current) =>
        variant === "landscape"
          ? { ...current, heroImage: processed }
          : { ...current, heroImagePortrait: processed }
      );
    } catch {
      setError("Failed to process image.");
    } finally {
      setImageProcessing(null);
    }
  };

  return (
    <AdminShell
      title="Wedding Settings"
      subtitle="Manage the hero image, dress code, and wedding invitation content"
    >
      <form onSubmit={handleSubmit} className="card-premium mb-8 max-w-3xl p-6">
        {message && (
          <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg bg-parchment px-4 py-5 text-sm text-stone-500 dark:bg-navy-700 dark:text-stone-300">
            Loading settings...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Landscape Hero Image
                </label>
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-navy-900">
                  {form.heroImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={form.heroImage}
                      alt="Landscape hero preview"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center text-stone-400 dark:text-stone-500">
                      <ImageIcon className="h-8 w-8" />
                      <p className="mt-2 text-sm">No landscape image yet</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleHeroImageChange(event, "landscape")}
                  disabled={saving || imageProcessing !== null}
                  className="mt-3 block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-white hover:file:bg-navy/90 dark:text-stone-400 dark:file:bg-navy-700 dark:hover:file:bg-navy-600"
                />
                <p className="mt-2 text-xs text-stone-400">
                  For laptop, iPad, and wide screens.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Portrait Hero Image
                </label>
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-navy-900">
                  {form.heroImagePortrait ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={form.heroImagePortrait}
                      alt="Portrait hero preview"
                      className="mx-auto h-40 w-28 object-cover"
                    />
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center text-stone-400 dark:text-stone-500">
                      <ImageIcon className="h-8 w-8" />
                      <p className="mt-2 text-sm">No portrait image yet</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleHeroImageChange(event, "portrait")}
                  disabled={saving || imageProcessing !== null}
                  className="mt-3 block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-white hover:file:bg-navy/90 dark:text-stone-400 dark:file:bg-navy-700 dark:hover:file:bg-navy-600"
                />
                <p className="mt-2 text-xs text-stone-400">
                  For mobile phones. Use a vertical photo of the couple.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Ladies
                </label>
                <input
                  value={form.dressLadies}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      dressLadies: e.target.value,
                    }))
                  }
                  placeholder="Example: Evening dress in neutral tones"
                  disabled={saving}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Gentlemen
                </label>
                <input
                  value={form.dressGentlemen}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      dressGentlemen: e.target.value,
                    }))
                  }
                  placeholder="Example: Formal suit in dark tones"
                  disabled={saving}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        <button
          disabled={loading || saving || imageProcessing !== null}
          className="btn-navy mt-6 py-3"
        >
          <Save className="h-4 w-4" />
          {saving
            ? "Saving..."
            : imageProcessing
              ? `Processing ${imageProcessing === "landscape" ? "Landscape" : "Portrait"} Image...`
              : "Save Settings"}
        </button>
      </form>

      <div className="max-w-5xl">
        <h2 className="mb-4 font-serif text-2xl font-bold text-navy dark:text-stone-100">
          Wedding Invitation Content
        </h2>
        <WeddingContentSettings />
      </div>
    </AdminShell>
  );
}
