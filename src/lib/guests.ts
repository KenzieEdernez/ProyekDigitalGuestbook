import { v4 as uuidv4 } from "uuid";
import { getPhotoBucket, getSupabaseAdmin } from "./supabase-server";
import type {
  CheckInResult,
  EnvelopeSection,
  Guest,
  GuestStats,
  ImportGuestRow,
  RegisterGuestInput,
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
  const { count, error } = await supabase
    .from("guests")
    .select("id", { count: "exact", head: true })
    .like("angpao_number", `${section}-%`);

  if (error) throw new Error(error.message);
  const num = (count ?? 0) + 1;
  return `${section}-${String(num).padStart(3, "0")}`;
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

export async function registerGuest(input: RegisterGuestInput): Promise<Guest> {
  const supabase = getSupabaseAdmin();
  const id = uuidv4();
  const name = input.name.trim();
  const address = input.address.trim();
  const phone = input.phone.trim();
  const pax = Math.max(1, input.pax || 1);

  if (!name) {
    throw new Error("Name is required.");
  }
  if (!address) {
    throw new Error("Address is required.");
  }
  if (!phone) {
    throw new Error("Phone number is required.");
  }

  const row = {
    id,
    invitation_barcode: input.attending
      ? await generateInvitationBarcode()
      : null,
    name,
    address,
    phone,
    pax,
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
    .select("*")
    .single();

  if (error) throw new Error(error.message);

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
    .select("*")
    .single();

  if (error) throw new Error(error.message);
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
