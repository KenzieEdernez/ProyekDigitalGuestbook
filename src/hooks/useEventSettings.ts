"use client";

import { useEffect, useState } from "react";
import { DEFAULT_EVENT_SETTINGS, mergeEventSettings } from "@/lib/event-config";
import type { EventSettings } from "@/types/event";

export function useEventSettings() {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const res = await fetch("/api/event-settings", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.settings) {
          setSettings(data.settings);
        }
      } catch {
        if (!cancelled) setSettings(DEFAULT_EVENT_SETTINGS);
      } finally {
        if (!cancelled) setSettingsReady(true);
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ...mergeEventSettings(settings ?? DEFAULT_EVENT_SETTINGS),
    settingsReady,
  };
}
