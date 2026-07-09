export interface Wish {
  id: string;
  guest_name: string;
  message: string;
  attendance: string | null;
  created_at: string;
}

export interface CreateWishInput {
  guest_name: string;
  message: string;
  attendance?: string;
}
