export type HasId = { id: string | number };

/**
 * Mengembalikan array dengan elemen unik berdasarkan id terakhir yang muncul (overwrite sebelumnya).
 */
export function dedupeById<T extends HasId>(arr: T[]): T[] {
  const map = new Map<string | number, T>();
  for (const item of arr) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}
