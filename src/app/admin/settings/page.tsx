"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageIcon, Save } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import WeddingContentSettings from "@/components/admin/WeddingContentSettings";
import { processDressCodeImageFile } from "@/lib/process-dress-code-image";
import { processFittedPhotoFile } from "@/lib/trim-image-bars";
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
  heroImageCard: "",
  dressCodeImage: "",
  logoImage: "",
  birdImage: "",
};

function readFittedImage(file: File, maxSize = 1400, type: "image/jpeg" | "image/png" = "image/jpeg") {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Browser does not support image resizing."));
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(
          type === "image/png"
            ? canvas.toDataURL("image/png")
            : canvas.toDataURL("image/jpeg", 0.88)
        );
      };
      image.onerror = () => reject(new Error("Failed to read image."));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

function readPngAsset(file: File, maxSize = 700) {
  return readFittedImage(file, maxSize, "image/png");
}

export default function EventSettingsPage() {
  const [form, setForm] = useState<EventSettings>(EMPTY_EVENT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageProcessing, setImageProcessing] = useState<
    "landscape" | "portrait" | "card" | "dresscode" | "logo" | "bird" | null
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
    variant: "landscape" | "portrait" | "card" | "dresscode" | "logo"
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
      let processed = "";
      if (variant === "landscape" || variant === "card") {
        processed = await processFittedPhotoFile(file, 1600);
      } else if (variant === "portrait") {
        processed = await processFittedPhotoFile(file, 1400);
      } else if (variant === "dresscode") {
        processed = await processDressCodeImageFile(file, 1400);
      } else {
        processed = await readPngAsset(file, 500);
      }

      setForm((current) => {
        if (variant === "landscape") return { ...current, heroImage: processed };
        if (variant === "portrait") {
          return { ...current, heroImagePortrait: processed };
        }
        if (variant === "card") return { ...current, heroImageCard: processed };
        if (variant === "dresscode") {
          return { ...current, dressCodeImage: processed };
        }
        return { ...current, logoImage: processed };
      });
    } catch {
      setError("Failed to process image.");
    } finally {
      setImageProcessing(null);
    }
  };

  const handleBirdVideoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const isWebm =
      file.type.includes("webm") || name.endsWith(".webm");

    if (!isWebm) {
      setError("Bird file must be a WebM video (.webm).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Bird video must be under 8MB.");
      return;
    }

    setImageProcessing("bird");
    setError(null);
    setMessage(null);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/event-settings/bird-upload", {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to upload bird video.");
        return;
      }

      if (data.settings) setForm(data.settings);
      else if (data.url) {
        setForm((current) => ({ ...current, birdImage: data.url }));
      }
      setMessage("Bird WebM uploaded successfully.");
    } catch {
      setError("Failed to upload bird video.");
    } finally {
      setImageProcessing(null);
      event.target.value = "";
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
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Landscape Background
                </label>
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-navy-900">
                  {form.heroImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={form.heroImage}
                      alt="Landscape background preview"
                      className="mx-auto h-36 w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-36 flex-col items-center justify-center text-stone-400 dark:text-stone-500">
                      <ImageIcon className="h-8 w-8" />
                      <p className="mt-2 text-sm">No image yet</p>
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
                  Desktop background + opening card photo. Kept at original
                  aspect ratio (not cropped). Re-upload for the full scene.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Portrait Background
                </label>
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-navy-900">
                  {form.heroImagePortrait ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={form.heroImagePortrait}
                      alt="Portrait background preview"
                      className="mx-auto h-36 w-24 object-cover"
                    />
                  ) : (
                    <div className="flex h-36 flex-col items-center justify-center text-stone-400 dark:text-stone-500">
                      <ImageIcon className="h-8 w-8" />
                      <p className="mt-2 text-sm">No image yet</p>
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
                  Blurred background for mobile phones.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Cover Card Photo
                </label>
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-navy-900">
                  {form.heroImageCard ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={form.heroImageCard}
                      alt="Cover card preview"
                      className="mx-auto max-h-48 w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-36 flex-col items-center justify-center text-stone-400 dark:text-stone-500">
                      <ImageIcon className="h-8 w-8" />
                      <p className="mt-2 text-sm">No image yet</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleHeroImageChange(event, "card")}
                  disabled={saving || imageProcessing !== null}
                  className="mt-3 block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-white hover:file:bg-navy/90 dark:text-stone-400 dark:file:bg-navy-700 dark:hover:file:bg-navy-600"
                />
                <p className="mt-2 text-xs text-stone-400">
                  Landscape photo for the small opening card (shown fully, no
                  crop). Falls back to Desktop Landscape if empty.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Dress Code Reference Image
              </label>
              <div className="overflow-hidden rounded-xl border border-stone-200 bg-[linear-gradient(45deg,#f3ebe0_25%,transparent_25%),linear-gradient(-45deg,#f3ebe0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3ebe0_75%),linear-gradient(-45deg,transparent_75%,#f3ebe0_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] dark:border-stone-700">
                {form.dressCodeImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.dressCodeImage}
                    alt="Dress code preview"
                    className="mx-auto h-48 max-w-md object-contain"
                  />
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center bg-stone-50 text-stone-400 dark:bg-navy-900 dark:text-stone-500">
                    <ImageIcon className="h-8 w-8" />
                    <p className="mt-2 text-sm">No dress code image yet</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleHeroImageChange(event, "dresscode")}
                disabled={saving || imageProcessing !== null}
                className="mt-3 block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-white hover:file:bg-navy/90 dark:text-stone-400 dark:file:bg-navy-700 dark:hover:file:bg-navy-600"
              />
              <p className="mt-2 text-xs text-stone-400">
                Outfit photo for the dress code section. Dark/black backgrounds are
                removed automatically on upload (saved as transparent PNG).
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Logo / Initial Image
                </label>
                <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-navy-900">
                  {form.logoImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={form.logoImage}
                      alt="Logo preview"
                      className="max-h-28 w-auto object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-stone-400 dark:text-stone-500">
                      <ImageIcon className="h-8 w-8" />
                      <p className="mt-2 text-sm">No logo yet</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleHeroImageChange(event, "logo")}
                  disabled={saving || imageProcessing !== null}
                  className="mt-3 block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-white hover:file:bg-navy/90 dark:text-stone-400 dark:file:bg-navy-700 dark:hover:file:bg-navy-600"
                />
                <p className="mt-2 text-xs text-stone-400">
                  PNG recommended. Shown at the top of the open invitation hero.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Flying Bird Video (WebM)
                </label>
                <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-navy-900">
                  {form.birdImage ? (
                    <video
                      src={form.birdImage}
                      className="max-h-28 w-auto object-contain"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <div className="flex flex-col items-center text-stone-400 dark:text-stone-500">
                      <ImageIcon className="h-8 w-8" />
                      <p className="mt-2 text-sm">No bird video yet</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="video/webm,.webm"
                  onChange={handleBirdVideoChange}
                  disabled={saving || imageProcessing !== null}
                  className="mt-3 block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-white hover:file:bg-navy/90 dark:text-stone-400 dark:file:bg-navy-700 dark:hover:file:bg-navy-600"
                />
                <p className="mt-2 text-xs text-stone-400">
                  Upload a looping WebM of a bird flapping in place (transparent
                  background recommended, max 8MB). The invitation moves it
                  across the screen.
                </p>
                {form.birdImage && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({ ...current, birdImage: "" }))
                    }
                    disabled={saving || imageProcessing !== null}
                    className="mt-2 text-xs font-medium text-stone-500 underline hover:text-navy"
                  >
                    Remove bird video
                  </button>
                )}
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
                  placeholder="Example: Modern Kebaya"
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
                  placeholder="Example: Formal Batik"
                  disabled={saving}
                  className="input-field"
                />
              </div>
              <p className="md:col-span-2 text-xs text-stone-400">
                Shown under the dress code image as: Ladies · Gentlemen
              </p>
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
              ? `Processing ${imageProcessing} image...`
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
