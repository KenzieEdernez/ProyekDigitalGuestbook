"use client";

import { useEffect, useState } from "react";
import { DEFAULT_WEDDING, mergeWeddingSettings } from "@/lib/wedding-config";
import type { WeddingSettings } from "@/types/wedding";

export function useWeddingSettings() {
  const [settings, setSettings] = useState<WeddingSettings>(DEFAULT_WEDDING);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/wedding-settings", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load wedding settings");
        const data = await res.json();
        if (!cancelled && data.settings) {
          setSettings(mergeWeddingSettings(data.settings));
        }
      } catch {
        if (!cancelled) setSettings(DEFAULT_WEDDING);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { wedding: settings, weddingReady: ready };
}
