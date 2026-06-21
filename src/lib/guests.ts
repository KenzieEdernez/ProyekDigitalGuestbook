import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import { getUploadsDir } from "./paths";
import type {
  CheckInResult,
  Guest,
  GuestStats,
  ImportGuestRow,
  RegisterGuestInput,
} from "@/types/guest";

function rowToGuest(row: Record<string, unknown>): Guest {
  return row as unknown as Guest;
}

export function getAllGuests(): Guest[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM guests ORDER BY created_at DESC")
    .all();
  return rows.map((r) => rowToGuest(r as Record<string, unknown>));
}

export function getGuestStats(): GuestStats {
  const db = getDb();
  const stats = db
    .prepare(
      `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END) as checked_in,
      SUM(CASE WHEN status = 'souvenir_claimed' THEN 1 ELSE 0 END) as souvenir_claimed,
      SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) as declined,
      SUM(CASE WHEN status IN ('pending', 'checked_in', 'souvenir_claimed') THEN pax ELSE 0 END) as total_pax_registered,
      SUM(CASE WHEN status IN ('checked_in', 'souvenir_claimed') THEN pax ELSE 0 END) as total_pax_checked_in
    FROM guests
  `
    )
    .get() as Record<string, number>;

  return {
    total: stats.total ?? 0,
    pending: stats.pending ?? 0,
    checked_in: stats.checked_in ?? 0,
    souvenir_claimed: stats.souvenir_claimed ?? 0,
    declined: stats.declined ?? 0,
    total_pax_registered: stats.total_pax_registered ?? 0,
    total_pax_checked_in: stats.total_pax_checked_in ?? 0,
  };
}

export function findGuestByInvitationBarcode(
  barcode: string
): Guest | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM guests WHERE invitation_barcode = ?")
    .get(barcode.trim());
  return row ? rowToGuest(row as Record<string, unknown>) : null;
}

export function findGuestBySouvenirBarcode(barcode: string): Guest | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM guests WHERE souvenir_barcode = ?")
    .get(barcode.trim());
  return row ? rowToGuest(row as Record<string, unknown>) : null;
}

function getNextAngpaoNumber(): string {
  const db = getDb();
  const result = db
    .prepare(
      "SELECT COUNT(*) as count FROM guests WHERE angpao_number IS NOT NULL"
    )
    .get() as { count: number };
  const num = (result.count ?? 0) + 1;
  return `A-${String(num).padStart(3, "0")}`;
}

function generateSouvenirBarcode(): string {
  const db = getDb();
  let barcode: string;
  let exists: boolean;

  do {
    const num = Math.floor(100000 + Math.random() * 900000);
    barcode = `SV-${num}`;
    const row = db
      .prepare("SELECT id FROM guests WHERE souvenir_barcode = ?")
      .get(barcode);
    exists = !!row;
  } while (exists);

  return barcode;
}

export function registerGuest(input: RegisterGuestInput): Guest {
  const db = getDb();
  const id = uuidv4();
  const name = input.name.trim();
  const address = input.address.trim();
  const phone = input.phone.trim();
  const pax = Math.max(1, input.pax || 1);

  if (!name) {
    throw new Error("Nama wajib diisi.");
  }
  if (!address) {
    throw new Error("Alamat wajib diisi.");
  }
  if (!phone) {
    throw new Error("Nomor HP wajib diisi.");
  }

  if (input.attending) {
    const invitationBarcode = generateInvitationBarcode();
    db.prepare(
      `
      INSERT INTO guests (id, invitation_barcode, name, address, phone, pax, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `
    ).run(id, invitationBarcode, name, address, phone, pax);
  } else {
    db.prepare(
      `
      INSERT INTO guests (id, invitation_barcode, name, address, phone, pax, status, created_at)
      VALUES (?, NULL, ?, ?, ?, ?, 'declined', datetime('now'))
    `
    ).run(id, name, address, phone, pax);
  }

  const row = db
    .prepare("SELECT * FROM guests WHERE id = ?")
    .get(id) as Record<string, unknown>;

  return rowToGuest(row);
}

function generateInvitationBarcode(): string {
  const db = getDb();
  let barcode: string;
  let exists: boolean;

  do {
    const num = Math.floor(100000 + Math.random() * 900000);
    barcode = `INV-${num}`;
    const row = db
      .prepare("SELECT id FROM guests WHERE invitation_barcode = ?")
      .get(barcode);
    exists = !!row;
  } while (exists);

  return barcode;
}

export function checkInGuest(
  invitationBarcode: string,
  photoBase64: string
): CheckInResult {
  const db = getDb();
  const guest = findGuestByInvitationBarcode(invitationBarcode);

  if (!guest) {
    throw new Error("Tamu tidak ditemukan. Periksa kembali barcode undangan.");
  }

  if (guest.status !== "pending") {
    throw new Error(
      `Tamu sudah check-in pada ${guest.checked_in_at ? new Date(guest.checked_in_at).toLocaleString("id-ID") : "waktu tidak diketahui"}.`
    );
  }

  const angpaoNumber = getNextAngpaoNumber();
  const souvenirBarcode = generateSouvenirBarcode();
  const photoUrl = savePhoto(photoBase64, guest.id);
  const now = new Date().toISOString();

  db.prepare(
    `
    UPDATE guests SET
      angpao_number = ?,
      souvenir_barcode = ?,
      photo_url = ?,
      checked_in_at = ?,
      status = 'checked_in'
    WHERE id = ?
  `
  ).run(angpaoNumber, souvenirBarcode, photoUrl, now, guest.id);

  const updated = db
    .prepare("SELECT * FROM guests WHERE id = ?")
    .get(guest.id) as Record<string, unknown>;

  return {
    guest: rowToGuest(updated),
    angpao_number: angpaoNumber,
    souvenir_barcode: souvenirBarcode,
  };
}

export function claimSouvenir(souvenirBarcode: string): Guest {
  const db = getDb();
  const guest = findGuestBySouvenirBarcode(souvenirBarcode);

  if (!guest) {
    throw new Error("Barcode souvenir tidak ditemukan.");
  }

  if (guest.status === "pending") {
    throw new Error("Tamu belum check-in. Harap check-in terlebih dahulu.");
  }

  if (guest.status === "souvenir_claimed") {
    throw new Error(
      `Souvenir sudah diambil pada ${guest.souvenir_claimed_at ? new Date(guest.souvenir_claimed_at).toLocaleString("id-ID") : "waktu tidak diketahui"}.`
    );
  }

  const now = new Date().toISOString();

  db.prepare(
    `
    UPDATE guests SET
      souvenir_claimed_at = ?,
      status = 'souvenir_claimed'
    WHERE id = ?
  `
  ).run(now, guest.id);

  const updated = db
    .prepare("SELECT * FROM guests WHERE id = ?")
    .get(guest.id) as Record<string, unknown>;

  return rowToGuest(updated);
}

export function importGuests(rows: ImportGuestRow[]): {
  imported: number;
  skipped: number;
} {
  const db = getDb();
  let imported = 0;
  let skipped = 0;

  const insert = db.prepare(`
    INSERT INTO guests (id, invitation_barcode, name, address, phone, pax, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
  `);

  const transaction = db.transaction((items: ImportGuestRow[]) => {
    for (const row of items) {
      if (!row.name?.trim()) {
        skipped++;
        continue;
      }

      const barcode =
        row.invitation_barcode?.trim() || generateInvitationBarcode();

      try {
        insert.run(
          uuidv4(),
          barcode,
          row.name.trim(),
          row.address?.trim() || null,
          row.phone?.trim() || null,
          row.pax || 1
        );
        imported++;
      } catch {
        skipped++;
      }
    }
  });

  transaction(rows);
  return { imported, skipped };
}

export function deleteGuest(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM guests WHERE id = ?").run(id);
  return result.changes > 0;
}

function savePhoto(base64: string, guestId: string): string {
  const uploadsDir = getUploadsDir();

  const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Format foto tidak valid.");
  }

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const data = matches[2];
  const filename = `${guestId}.${ext}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, Buffer.from(data, "base64"));
  return `/api/uploads/${filename}`;
}
