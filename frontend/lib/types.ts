export type Role = "librarian" | "member";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  registered_at: string;
  expiry_date: string | null;
  is_active: boolean;
}

// Kept as an alias so the existing MembersTable/DueStamp components
// (built before roles existed) still type-check without changes.
export type Member = User;

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string | null;
  original_filename: string;
  created_at: string;
  uploaded_by: User;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
