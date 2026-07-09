import { v4 as uuidv4 } from "uuid";
import { getSupabaseAdmin } from "./supabase-server";
import type { CreateWishInput, Wish } from "@/types/wish";

function rowToWish(row: Record<string, unknown>): Wish {
  return row as unknown as Wish;
}

export async function getWishes(limit = 50): Promise<Wish[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => rowToWish(r as Record<string, unknown>));
}

export async function createWish(input: CreateWishInput): Promise<Wish> {
  const guestName = input.guest_name?.trim();
  const message = input.message?.trim();

  if (!guestName || guestName.length < 2) {
    throw new Error("Nama tamu wajib diisi.");
  }
  if (!message || message.length < 3) {
    throw new Error("Ucapan wajib diisi.");
  }
  if (message.length > 500) {
    throw new Error("Ucapan maksimal 500 karakter.");
  }

  const supabase = getSupabaseAdmin();
  const row = {
    id: uuidv4(),
    guest_name: guestName,
    message,
    attendance: input.attendance?.trim() || null,
  };

  const { data, error } = await supabase
    .from("wishes")
    .insert(row)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToWish(data as Record<string, unknown>);
}
