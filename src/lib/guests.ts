import { v4 as uuidv4 } from "uuid";
import { getPhotoBucket, getSupabaseAdmin } from "./supabase-server";
import type {
  CheckInResult,
  EnvelopeSection,
  Guest,
  GuestStats,
  ImportGuestRow,
  RegisterGuestInput,
  UpdateGuestInput,
} from "@/types/guest";

function rowToGuest(row: Record<string, unknown>): Guest {
  return row as unknown as Guest;
}

export async function getAllGuests(): Promise<Guest[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => rowToGuest(r as Record<string, unknown>));
}

export async function getGuestStats(): Promise<GuestStats> {
  const guests = await getAllGuests();

  return {
    total: guests.length,
    pending: guests.filter((g) => g.status === "pending").length,
    checked_in: guests.filter((g) => g.status === "checked_in").length,
    souvenir_claimed: guests.filter((g) => g.status === "souvenir_claimed")
      .length,
    declined: guests.filter((g) => g.status === "declined").length,
    total_pax_registered: guests
      .filter((g) => g.status !== "declined")
      .reduce((sum, g) => sum + g.pax, 0),
    total_pax_checked_in: guests
      .filter((g) => g.status === "checked_in" || g.status === "souvenir_claimed")
      .reduce((sum, g) => sum + g.pax, 0),
  };
}

export async function findGuestByInvitationBarcode(
  barcode: string
): Promise<Guest | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("invitation_barcode", barcode.trim())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToGuest(data as Record<string, unknown>) : null;
}

export async function findGuestBySouvenirBarcode(
  barcode: string
): Promise<Guest | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("souvenir_barcode", barcode.trim())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToGuest(data as Record<string, unknown>) : null;
}

async function getNextAngpaoNumber(section: EnvelopeSection): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("next_angpao_number", {
    p_section: section,
  });

  if (error) throw new Error(error.message);
  if (typeof data !== "string" || !data) {
    throw new Error("Failed to generate envelope number.");
  }

  return data;
}

async function generateSouvenirBarcode(): Promise<string> {
  let barcode: string;
  let exists: boolean;

  do {
    const num = Math.floor(100000 + Math.random() * 900000);
    barcode = `SV-${num}`;
    exists = !!(await findGuestBySouvenirBarcode(barcode));
  } while (exists);

  return barcode;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function registerGuest(input: RegisterGuestInput): Promise<Guest> {
  const supabase = getSupabaseAdmin();
  const id = uuidv4();
  const name = input.name.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();
  const pax = Math.min(4, Math.max(1, input.pax || 1));

  if (!name) {
    throw new Error("Name is required.");
  }
  if (!phone) {
    throw new Error("Phone number is required.");
  }
  if (!email) {
    throw new Error("Email is required.");
  }
  if (!isValidEmail(email)) {
    throw new Error("Invalid email address.");
  }
  if (input.attending && (!input.pax || input.pax < 1 || input.pax > 4)) {
    throw new Error("Number of guests must be between 1 and 4.");
  }

  const row = {
    id,
    invitation_barcode: input.attending
      ? await generateInvitationBarcode()
      : null,
    name,
    address: null,
    phone,
    email,
    pax: input.attending ? pax : 1,
    status: input.attending ? "pending" : "declined",
  };

  const { data, error } = await supabase
    .from("guests")
    .insert(row)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToGuest(data as Record<string, unknown>);
}

async function generateInvitationBarcode(): Promise<string> {
  let barcode: string;
  let exists: boolean;

  do {
    const num = Math.floor(100000 + Math.random() * 900000);
    barcode = `INV-${num}`;
    exists = !!(await findGuestByInvitationBarcode(barcode));
  } while (exists);

  return barcode;
}

export async function checkInGuest(
  invitationBarcode: string,
  photoBase64: string,
  envelopeSection: EnvelopeSection
): Promise<CheckInResult> {
  const supabase = getSupabaseAdmin();
  const guest = await findGuestByInvitationBarcode(invitationBarcode);

  if (!guest) {
    throw new Error("Guest not found. Please check the invitation barcode.");
  }

  if (guest.status !== "pending") {
    throw new Error(
      `Guest already checked in at ${guest.checked_in_at ? new Date(guest.checked_in_at).toLocaleString("en-US") : "an unknown time"}.`
    );
  }

  const angpaoNumber = await getNextAngpaoNumber(envelopeSection);
  const souvenirBarcode = await generateSouvenirBarcode();
  const photoUrl = await savePhoto(photoBase64, guest.id);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("guests")
    .update({
      angpao_number: angpaoNumber,
      souvenir_barcode: souvenirBarcode,
      photo_url: photoUrl,
      checked_in_at: now,
      status: "checked_in",
    })
    .eq("id", guest.id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    const current = await findGuestByInvitationBarcode(invitationBarcode);
    if (current && current.status !== "pending") {
      throw new Error(
        `Guest already checked in at ${current.checked_in_at ? new Date(current.checked_in_at).toLocaleString("en-US") : "an unknown time"}.`
      );
    }
    throw new Error("Check-in failed because another staff member is processing this guest.");
  }

  return {
    guest: rowToGuest(data as Record<string, unknown>),
    angpao_number: angpaoNumber,
    souvenir_barcode: souvenirBarcode,
  };
}

export async function claimSouvenir(souvenirBarcode: string): Promise<Guest> {
  const supabase = getSupabaseAdmin();
  const guest = await findGuestBySouvenirBarcode(souvenirBarcode);

  if (!guest) {
    throw new Error("Souvenir barcode not found.");
  }

  if (guest.status === "pending") {
    throw new Error("Guest has not checked in yet. Please check in first.");
  }

  if (guest.status === "souvenir_claimed") {
    throw new Error(
      `Souvenir was already collected at ${guest.souvenir_claimed_at ? new Date(guest.souvenir_claimed_at).toLocaleString("en-US") : "an unknown time"}.`
    );
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("guests")
    .update({
      souvenir_claimed_at: now,
      status: "souvenir_claimed",
    })
    .eq("id", guest.id)
    .eq("status", "checked_in")
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    const current = await findGuestBySouvenirBarcode(souvenirBarcode);
    if (current?.status === "souvenir_claimed") {
      throw new Error(
        `Souvenir was already collected at ${current.souvenir_claimed_at ? new Date(current.souvenir_claimed_at).toLocaleString("en-US") : "an unknown time"}.`
      );
    }
    throw new Error("Souvenir pickup failed because another staff member is processing this guest.");
  }

  return rowToGuest(data as Record<string, unknown>);
}

export async function importGuests(rows: ImportGuestRow[]): Promise<{
  imported: number;
  skipped: number;
}> {
  const supabase = getSupabaseAdmin();
  let imported = 0;
  let skipped = 0;
  const inserts = [];

  for (const row of rows) {
    if (!row.name?.trim()) {
      skipped++;
      continue;
    }

    inserts.push({
      id: uuidv4(),
      invitation_barcode:
        row.invitation_barcode?.trim() || (await generateInvitationBarcode()),
      name: row.name.trim(),
      address: row.address?.trim() || null,
      phone: row.phone?.trim() || null,
      pax: row.pax || 1,
      status: "pending",
    });
  }

  if (inserts.length > 0) {
    const { data, error } = await supabase
      .from("guests")
      .insert(inserts)
      .select("id");

    if (error) {
      skipped += inserts.length;
    } else {
      imported += data?.length ?? 0;
    }
  }

  return { imported, skipped };
}

export async function deleteGuest(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("guests").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function getGuestById(id: string): Promise<Guest | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToGuest(data as Record<string, unknown>) : null;
}

export async function updateGuest(
  id: string,
  input: UpdateGuestInput
): Promise<Guest> {
  const supabase = getSupabaseAdmin();
  const existing = await getGuestById(id);

  if (!existing) {
    throw new Error("Guest not found.");
  }

  const name = (input.name ?? existing.name).trim();
  const phone = (input.phone ?? existing.phone ?? "").trim();
  const email = (input.email ?? existing.email ?? "").trim();
  const pax = Math.min(4, Math.max(1, input.pax ?? existing.pax));

  if (!name) {
    throw new Error("Name is required.");
  }
  if (!phone) {
    throw new Error("Phone number is required.");
  }
  if (!email) {
    throw new Error("Email is required.");
  }
  if (!isValidEmail(email)) {
    throw new Error("Invalid email address.");
  }

  const update: Record<string, unknown> = {
    name,
    phone,
    email,
    pax,
  };

  if (input.attending !== undefined) {
    if (
      existing.status === "checked_in" ||
      existing.status === "souvenir_claimed"
    ) {
      throw new Error(
        "Cannot change attendance for guests who have already checked in."
      );
    }

    if (input.attending) {
      update.status = "pending";
      if (!existing.invitation_barcode) {
        update.invitation_barcode = await generateInvitationBarcode();
      }
    } else {
      update.status = "declined";
      update.invitation_barcode = null;
    }
  }

  const { data, error } = await supabase
    .from("guests")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToGuest(data as Record<string, unknown>);
}

export async function deleteAllGuests(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("guests")
    .delete()
    .neq("id", "")
    .select("id");

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

async function savePhoto(base64: string, guestId: string): Promise<string> {
  const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid photo format.");
  }

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const data = matches[2];
  const filename = `${guestId}.${ext}`;
  const buffer = Buffer.from(data, "base64");
  const supabase = getSupabaseAdmin();
  const bucket = getPhotoBucket();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return publicUrl.publicUrl;
}
