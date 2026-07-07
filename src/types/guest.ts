export type GuestStatus =
  | "pending"
  | "checked_in"
  | "souvenir_claimed"
  | "declined";

export type EnvelopeSection = "A" | "B";

export interface Guest {
  id: string;
  invitation_barcode: string | null;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  pax: number;
  angpao_number: string | null;
  souvenir_barcode: string | null;
  photo_url: string | null;
  checked_in_at: string | null;
  souvenir_claimed_at: string | null;
  status: GuestStatus;
  created_at: string;
}

export interface GuestStats {
  total: number;
  pending: number;
  checked_in: number;
  souvenir_claimed: number;
  declined: number;
  total_pax_registered: number;
  total_pax_checked_in: number;
}

export interface CheckInResult {
  guest: Guest;
  angpao_number: string;
  souvenir_barcode: string;
}

export interface ImportGuestRow {
  name: string;
  pax: number;
  address?: string;
  phone?: string;
  invitation_barcode?: string;
}

export interface RegisterGuestInput {
  name: string;
  phone: string;
  email: string;
  pax: number;
  attending: boolean;
}

export interface UpdateGuestInput {
  name?: string;
  phone?: string;
  email?: string;
  pax?: number;
  attending?: boolean;
}
