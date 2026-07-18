"use client";

import { useEffect, useState } from "react";
import {
  ImageIcon,
  Plus,
  Save,
  Trash2,
  Heart,
  Calendar,
  Gift,
  Users,
  Quote,
  Music,
  Sparkles,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import CeremonyDateInput from "@/components/admin/CeremonyDateInput";
import EventTimeInput from "@/components/admin/EventTimeInput";
import { DEFAULT_WEDDING } from "@/lib/wedding-config";
import type { WeddingSettings } from "@/types/wedding";

type Tab = "invitation" | "couple" | "story" | "events" | "gallery" | "gifts" | "music" | "wishes";

const MAX_MUSIC_BYTES = 12 * 1024 * 1024;

function isLocalPreviewUrl(url: string) {
  return url.startsWith("blob:") || url.startsWith("data:");
}

function buildSavePayload(form: WeddingSettings): WeddingSettings {
  return {
    ...form,
    musicUrl: isLocalPreviewUrl(form.musicUrl) ? "" : form.musicUrl,
  };
}

function readImageFile(file: File) {
  return new Promise<{ dataUrl: string; orientation: "portrait" | "landscape" }>(
    (resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const max = 1400;
          const scale = Math.min(1, max / Math.max(image.width, image.height));
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas not supported."));
            return;
          }
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve({
            dataUrl: canvas.toDataURL("image/jpeg", 0.85),
            orientation:
              image.height > image.width ? "portrait" : "landscape",
          });
        };
        image.onerror = () => reject(new Error("Failed to read image."));
        image.src = String(reader.result);
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    }
  );
}

async function readCouplePhotoFile(file: File) {
  const { processFittedPhotoFile } = await import("@/lib/trim-image-bars");
  const dataUrl = await processFittedPhotoFile(file, 1400);
  const probe = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to probe image."));
    image.src = dataUrl;
  });
  return {
    dataUrl,
    orientation:
      probe.height >= probe.width
        ? ("portrait" as const)
        : ("landscape" as const),
  };
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "invitation", label: "Invitation Copy", icon: Sparkles },
  { id: "couple", label: "Couple & Quote", icon: Users },
  { id: "story", label: "Love Story", icon: Heart },
  { id: "events", label: "Wedding Events", icon: Calendar },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "gifts", label: "Gifts", icon: Gift },
  { id: "music", label: "Music", icon: Music },
  { id: "wishes", label: "Wishes", icon: Quote },
];

export default function WeddingContentSettings() {
  const [form, setForm] = useState<WeddingSettings>(DEFAULT_WEDDING);
  const [tab, setTab] = useState<Tab>("couple");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingWishes, setDeletingWishes] = useState(false);
  const [musicProcessing, setMusicProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/wedding-settings", { cache: "no-store" });
        const data = await res.json();
        if (data.settings) setForm(data.settings);
      } catch {
        setError("Failed to load wedding content.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/wedding-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSavePayload(form)),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save wedding content.");
        return;
      }
      setForm(data.settings);
      setMessage("Wedding content saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to the server."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllWishes = async () => {
    if (!confirm("Delete ALL guest wishes? This cannot be undone.")) return;
    if (!confirm("Are you absolutely sure?")) return;
    setDeletingWishes(true);
    setError(null);
    try {
      const res = await fetch("/api/wishes", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete wishes.");
        return;
      }
      setMessage(`Deleted ${data.deleted ?? 0} wishes.`);
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setDeletingWishes(false);
    }
  };

  const updateInvitationCopy = (
    field: keyof WeddingSettings["invitationCopy"],
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      invitationCopy: {
        ...current.invitationCopy,
        [field]: value,
      },
    }));
  };

  const updateCouple = (
    role: "groom" | "bride",
    field: keyof WeddingSettings["groom"],
    value: string
  ) => {
    setForm((f) => ({
      ...f,
      [role]: { ...f[role], [field]: value },
    }));
  };

  const handleCouplePhoto = async (
    role: "groom" | "bride",
    file: File | undefined
  ) => {
    if (!file) return;
    try {
      const { dataUrl } = await readCouplePhotoFile(file);
      updateCouple(role, "photo", dataUrl);
    } catch {
      setError("Failed to process photo.");
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const items = await Promise.all(
        Array.from(files).map(async (file) => {
          const { dataUrl, orientation } = await readImageFile(file);
          return {
            id: uuidv4(),
            src: dataUrl,
            alt: file.name.replace(/\.[^.]+$/, ""),
            orientation,
          };
        })
      );
      setForm((f) => ({ ...f, gallery: [...f.gallery, ...items] }));
    } catch {
      setError("Failed to process gallery images.");
    }
  };

  const handleMusicUpload = async (file: File | undefined) => {
    if (!file) return;

    const isAudio =
      file.type.startsWith("audio/") ||
      file.name.toLowerCase().endsWith(".mp3");

    if (!isAudio) {
      setError("Please upload an MP3 or audio file.");
      return;
    }

    if (file.size > MAX_MUSIC_BYTES) {
      setError("Music file must be under 12MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setForm((f) => ({ ...f, musicUrl: previewUrl }));
    setMusicProcessing(true);
    setError(null);
    setMessage(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/wedding-music/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to upload music.");
        setForm((f) => ({ ...f, musicUrl: "" }));
        return;
      }

      setForm(data.settings);
      setMessage("Music uploaded and saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload music file."
      );
      setForm((f) => ({ ...f, musicUrl: "" }));
    } finally {
      URL.revokeObjectURL(previewUrl);
      setMusicProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="card-premium p-6 text-sm text-stone-500">
        Loading wedding content...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              tab === id
                ? "bg-navy text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-navy-700 dark:text-stone-300"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="card-premium p-6">
        {tab === "invitation" && (
          <div className="grid gap-5 md:grid-cols-2">
            {(
              [
                ["engagementTitle", "Engagement Title", "The Sangjit Engagement of"],
                ["displayDate", "Display Date", "06.09.2026"],
                ["openButtonLabel", "Open Button Label", "Open Invitation"],
                ["dressCodeTitle", "Dress Code Title", "Dress Code"],
                ["dressCodeTheme", "Dress Code Theme", "Elegant Formal"],
                ["giftTitle", "Gift Title", "Gift"],
              ] as const
            ).map(([field, label, placeholder]) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {label}
                </label>
                <input
                  className="input-field"
                  value={form.invitationCopy[field]}
                  placeholder={placeholder}
                  onChange={(e) => updateInvitationCopy(field, e.target.value)}
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Cover Message
              </label>
              <textarea
                className="input-field min-h-24"
                value={form.invitationCopy.coverMessage}
                onChange={(e) => updateInvitationCopy("coverMessage", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Dress Code Description
              </label>
              <textarea
                className="input-field min-h-24"
                value={form.invitationCopy.dressCodeDescription}
                onChange={(e) =>
                  updateInvitationCopy("dressCodeDescription", e.target.value)
                }
              />
            </div>
            <p className="md:col-span-2 text-xs text-stone-400">
              Outfit looks under the dress code image come from Ladies / Gentlemen in
              Page Settings (for example: Modern Kebaya · Formal Batik).
            </p>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Gift Message
              </label>
              <textarea
                className="input-field min-h-32"
                value={form.invitationCopy.giftMessage}
                onChange={(e) => updateInvitationCopy("giftMessage", e.target.value)}
              />
            </div>
          </div>
        )}

        {tab === "couple" && (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              {(["groom", "bride"] as const).map((role) => (
                <div key={role} className="space-y-4 rounded-xl border border-stone-200 p-5 dark:border-stone-700">
                  <h3 className="font-serif text-lg font-bold capitalize text-navy dark:text-stone-100">
                    {role}
                  </h3>
                  {(
                    [
                      ["name", "Short Name"],
                      ["fullName", "Full Name"],
                      ["nickname", "Nickname"],
                      ["father", "Father"],
                      ["mother", "Mother"],
                      ["instagram", "Instagram"],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                        {label}
                      </label>
                      <input
                        className="input-field"
                        value={form[role][field]}
                        onChange={(e) => updateCouple(role, field, e.target.value)}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Photo
                    </label>
                    {form[role].photo && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={form[role].photo}
                        alt={role}
                        className="mb-2 h-40 w-full rounded-lg object-cover"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        void handleCouplePhoto(role, e.target.files?.[0])
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Quote
                </label>
                <textarea
                  className="input-field min-h-[100px]"
                  value={form.quote}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quote: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Quote Source
                </label>
                <input
                  className="input-field"
                  value={form.quoteSource}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quoteSource: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {tab === "story" && (
          <div className="space-y-4">
            {form.loveStory.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-stone-200 p-5 dark:border-stone-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-navy dark:text-stone-100">
                    Story {index + 1}
                  </p>
                  {form.loveStory.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          loveStory: f.loveStory.filter((s) => s.id !== item.id),
                        }))
                      }
                      className="text-xs text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="input-field"
                    placeholder="Year"
                    value={item.year}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        loveStory: f.loveStory.map((s) =>
                          s.id === item.id ? { ...s, year: e.target.value } : s
                        ),
                      }))
                    }
                  />
                  <input
                    className="input-field"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        loveStory: f.loveStory.map((s) =>
                          s.id === item.id ? { ...s, title: e.target.value } : s
                        ),
                      }))
                    }
                  />
                </div>
                <textarea
                  className="input-field mt-3 min-h-[90px]"
                  placeholder="Story text"
                  value={item.text}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      loveStory: f.loveStory.map((s) =>
                        s.id === item.id ? { ...s, text: e.target.value } : s
                      ),
                    }))
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  loveStory: [
                    ...f.loveStory,
                    {
                      id: uuidv4(),
                      year: "",
                      title: "",
                      text: "",
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-royal"
            >
              <Plus className="h-4 w-4" /> Add Story
            </button>
          </div>
        )}

        {tab === "events" && (
          <div className="space-y-4">
            {form.ceremonies.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-stone-200 p-5 dark:border-stone-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-navy dark:text-stone-100">
                    Event {index + 1}
                  </p>
                  {form.ceremonies.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          ceremonies: f.ceremonies.filter((c) => c.id !== item.id),
                        }))
                      }
                      className="text-xs text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Title
                  </label>
                  <input
                    className="input-field"
                    value={item.title}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        ceremonies: f.ceremonies.map((c) =>
                          c.id === item.id
                            ? { ...c, title: e.target.value }
                            : c
                        ),
                      }))
                    }
                  />
                </div>
                <CeremonyDateInput
                  value={item.date}
                  onChange={(date) =>
                    setForm((f) => ({
                      ...f,
                      ceremonies: f.ceremonies.map((c) =>
                        c.id === item.id ? { ...c, date } : c
                      ),
                    }))
                  }
                  disabled={saving}
                />
                <EventTimeInput
                  label="Time"
                  className="mb-3"
                  timeFrom={item.time}
                  onChange={(time) =>
                    setForm((f) => ({
                      ...f,
                      ceremonies: f.ceremonies.map((c) =>
                        c.id === item.id ? { ...c, time } : c
                      ),
                    }))
                  }
                  disabled={saving}
                />
                {(
                  [
                    ["location", "Location"],
                    ["address", "Address"],
                    ["mapUrl", "Maps URL"],
                  ] as const
                ).map(([field, label]) => (
                  <div key={field} className="mb-3">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                      {label}
                    </label>
                    <input
                      className="input-field"
                      value={item[field]}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          ceremonies: f.ceremonies.map((c) =>
                            c.id === item.id
                              ? { ...c, [field]: e.target.value }
                              : c
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  ceremonies: [
                    ...f.ceremonies,
                    {
                      id: uuidv4(),
                      title: "",
                      date: "",
                      time: "",
                      location: "",
                      address: "",
                      mapUrl: "https://maps.google.com",
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-royal"
            >
              <Plus className="h-4 w-4" /> Add Event
            </button>
          </div>
        )}

        {tab === "gallery" && (
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => void handleGalleryUpload(e.target.files)}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {form.gallery.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className={`w-full object-cover ${
                      photo.orientation === "portrait" ? "h-56" : "h-36"
                    }`}
                  />
                  <div className="flex items-center justify-between p-3">
                    <span className="text-xs capitalize text-stone-500">
                      {photo.orientation}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          gallery: f.gallery.filter((g) => g.id !== photo.id),
                        }))
                      }
                      className="text-xs text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "gifts" && (
          <div className="space-y-6">
            {form.gifts.map((gift, index) => (
              <div
                key={gift.id}
                className="rounded-xl border border-stone-200 p-5 dark:border-stone-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-navy dark:text-stone-100">
                    Account {index + 1}
                  </p>
                  {form.gifts.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          gifts: f.gifts.filter((g) => g.id !== gift.id),
                        }))
                      }
                      className="text-xs text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {(
                  [
                    ["bank", "Bank"],
                    ["accountName", "Account Name"],
                    ["accountNumber", "Account Number"],
                  ] as const
                ).map(([field, label]) => (
                  <div key={field} className="mb-3">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                      {label}
                    </label>
                    <input
                      className="input-field"
                      value={gift[field]}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          gifts: f.gifts.map((g) =>
                            g.id === gift.id
                              ? { ...g, [field]: e.target.value }
                              : g
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  gifts: [
                    ...f.gifts,
                    {
                      id: uuidv4(),
                      bank: "",
                      accountName: "",
                      accountNumber: "",
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-royal"
            >
              <Plus className="h-4 w-4" /> Add Bank Account
            </button>

            <div className="rounded-xl border border-stone-200 p-5 dark:border-stone-700">
              <p className="mb-4 text-sm font-semibold text-navy dark:text-stone-100">
                Physical Gift Address
              </p>
              {(
                [
                  ["name", "Recipient Name"],
                  ["address", "Address"],
                  ["city", "City / Postal"],
                  ["phone", "Phone"],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="mb-3">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    {label}
                  </label>
                  <input
                    className="input-field"
                    value={form.giftAddress[field]}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        giftAddress: {
                          ...f.giftAddress,
                          [field]: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "music" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-700 dark:bg-navy-900">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-royal/10">
                  <Music className="h-5 w-5 text-royal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy dark:text-stone-100">
                    Background Music
                  </p>
                  <p className="text-xs text-stone-500">
                    Plays on the invitation page when guests tap the music button.
                  </p>
                </div>
              </div>

              {form.musicUrl ? (
                <audio
                  controls
                  src={form.musicUrl}
                  className="mb-4 w-full"
                  preload="metadata"
                />
              ) : (
                <p className="mb-4 text-sm text-stone-500">No music selected yet.</p>
              )}

              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Upload MP3
              </label>
              <input
                type="file"
                accept="audio/mpeg,audio/mp3,.mp3,audio/*"
                disabled={saving || musicProcessing}
                onChange={(e) => void handleMusicUpload(e.target.files?.[0])}
                className="block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-white hover:file:bg-navy/90 dark:text-stone-400 dark:file:bg-navy-700"
              />
              <p className="mt-2 text-xs text-stone-400">
                MP3 recommended. Maximum file size 12MB. Uploads directly to
                Supabase — no need to click Save again for music.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Or paste music URL
              </label>
              <input
                className="input-field"
                value={
                  form.musicUrl.startsWith("data:")
                    ? ""
                    : form.musicUrl
                }
                placeholder="https://example.com/wedding-song.mp3"
                onChange={(e) =>
                  setForm((f) => ({ ...f, musicUrl: e.target.value }))
                }
              />
              <p className="mt-2 text-xs text-stone-400">
                Use a direct link to an MP3 file hosted online, or upload above.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, musicUrl: "" }))}
              className="text-sm font-semibold text-stone-500 transition hover:text-red-500"
            >
              Remove music
            </button>
          </div>
        )}

        {tab === "wishes" && (
          <div className="space-y-4">
            <p className="text-sm text-stone-600 dark:text-stone-300">
              Permanently remove all guest wish letters from the public guestbook.
            </p>
            <button
              type="button"
              onClick={() => void handleDeleteAllWishes()}
              disabled={deletingWishes}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deletingWishes ? "Deleting..." : "Delete All Wishes"}
            </button>
          </div>
        )}

        {tab !== "wishes" && (
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || musicProcessing}
            className="btn-navy mt-6 py-3"
          >
            <Save className="h-4 w-4" />
            {saving
              ? "Saving..."
              : musicProcessing
                ? "Processing Music..."
                : "Save Wedding Content"}
          </button>
        )}
      </div>
    </div>
  );
}
