import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { getDataDir } from "./paths";

const DATA_DIR = getDataDir();
const DB_PATH = path.join(DATA_DIR, "guestbook.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema(db);
    migrateSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      invitation_barcode TEXT UNIQUE,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      pax INTEGER NOT NULL DEFAULT 1,
      angpao_number TEXT,
      souvenir_barcode TEXT UNIQUE,
      photo_url TEXT,
      checked_in_at TEXT,
      souvenir_claimed_at TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_guests_status ON guests(status);
    CREATE INDEX IF NOT EXISTS idx_guests_invitation ON guests(invitation_barcode);
    CREATE INDEX IF NOT EXISTS idx_guests_souvenir ON guests(souvenir_barcode);
  `);
}

function migrateSchema(database: Database.Database) {
  const columns = database
    .prepare("PRAGMA table_info(guests)")
    .all() as { name: string }[];

  const columnNames = new Set(columns.map((c) => c.name));

  if (!columnNames.has("address")) {
    database.exec("ALTER TABLE guests ADD COLUMN address TEXT");
  }
  if (!columnNames.has("phone")) {
    database.exec("ALTER TABLE guests ADD COLUMN phone TEXT");
  }
}
