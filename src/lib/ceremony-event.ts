import type { CeremonyItem, WeddingSettings } from "@/types/wedding";
import { getCoupleDisplayName } from "./wedding-config";

export type CeremonyEventDetails = {
  date: string;
  time: string;
  location: string;
  title: string;
  description: string;
  dateLabel: string;
};

export function getPrimaryCeremony(wedding: WeddingSettings): CeremonyItem | null {
  return (
    wedding.ceremonies.find((ceremony) => ceremony.date && ceremony.time) ??
    wedding.ceremonies[0] ??
    null
  );
}

export function resolveCeremonyEventDetails(
  wedding: WeddingSettings
): CeremonyEventDetails | null {
  const ceremony = getPrimaryCeremony(wedding);
  if (!ceremony?.date || !ceremony.time) return null;

  const coupleName = getCoupleDisplayName(wedding);

  return {
    date: ceremony.date,
    time: ceremony.time,
    location: [ceremony.location, ceremony.address].filter(Boolean).join(", "),
    title: ceremony.title || `${coupleName} Wedding`,
    description: ceremony.title || "Wedding celebration",
    dateLabel: ceremony.date,
  };
}
