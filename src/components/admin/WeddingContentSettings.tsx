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
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_WEDDING } from "@/lib/wedding-config";
import type { WeddingSettings } from "@/types/wedding";

type Tab = "couple" | "story" | "events" | "gallery" | "gifts" | "wishes";

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

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "couple", label: "Couple & Quote", icon: Users },
  { id: "story", label: "Love Story", icon: Heart },
  { id: "events", label: "Wedding Events", icon: Calendar },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "gifts", label: "Gifts", icon: Gift },
  { id: "wishes", label: "Wishes", icon: Quote },
];

export default function WeddingContentSettings() {
  const [form, setForm] = useState<WeddingSettings>(DEFAULT_WEDDING);
  const [tab, setTab] = useState<Tab>("couple");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingWishes, setDeletingWishes] = useState(false);
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
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save wedding content.");
        return;
      }
      setForm(data.settings);
      setMessage("Wedding content saved successfully.");
    } catch {
      setError("Failed to connect to the server.");
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
      const { dataUrl } = await readImageFile(file);
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
                {(
                  [
                    ["title", "Title"],
                    ["date", "Date"],
                    ["time", "Time"],
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
            disabled={saving}
            className="btn-navy mt-6 py-3"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Wedding Content"}
          </button>
        )}
      </div>
    </div>
  );
}
