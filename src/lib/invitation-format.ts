export function formatSpacedDisplayDate(value: string) {
  const cleaned = value.replace(/\s+/g, "").trim();
  if (!cleaned) return "";

  const parts = cleaned.split(/[.\-/]/).filter(Boolean);
  if (parts.length >= 3) {
    return `${parts[0]} . ${parts[1]} . ${parts[2]}`;
  }

  return value.trim();
}
