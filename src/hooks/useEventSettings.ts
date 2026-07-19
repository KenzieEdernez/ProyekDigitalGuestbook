"use client";

import { useEffect, useState } from "react";
import { mergeEventSettings } from "@/lib/event-config";
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
  birdImageIos: "",
  birdFrames: [],
  birdCount: 6,
};

export function useEventSettings() {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [settingsReady, setSettingsReady] = useState(false);
  const [settingsAvailable, setSettingsAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const res = await fetch("/api/event-settings", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load event settings");
        const data = await res.json();
        if (!cancelled && data.settings) {
          setSettings(data.settings);
          setSettingsAvailable(true);
        }
      } catch {
        if (!cancelled) setSettingsAvailable(false);
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
    ...mergeEventSettings(settings ?? EMPTY_EVENT_SETTINGS),
    settingsReady,
    settingsAvailable,
  };
}
