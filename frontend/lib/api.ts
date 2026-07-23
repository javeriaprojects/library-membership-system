import { AuthResponse, Book, Member } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

async function parseErrorOrJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

// ---------- Auth ----------

export async function signup(
  name: string,
  email: string,
  password: string,
  role: "librarian" | "member",
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  return parseErrorOrJson<AuthResponse>(res);
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseErrorOrJson<AuthResponse>(res);
}

// ---------- Members (librarian-only roster) ----------

export async function fetchMembers(token: string): Promise<Member[]> {
  const res = await fetch(`${API_URL}/members`, {
    cache: "no-store",
    headers: authHeaders(token),
  });
  return parseErrorOrJson<Member[]>(res);
}

// ---------- Books ----------

export async function fetchBooks(token: string): Promise<Book[]> {
  const res = await fetch(`${API_URL}/books`, {
    cache: "no-store",
    headers: authHeaders(token),
  });
  return parseErrorOrJson<Book[]>(res);
}

export async function uploadBook(
  token: string,
  title: string,
  author: string,
  description: string,
  file: File,
): Promise<Book> {
  const form = new FormData();
  form.append("title", title);
  form.append("author", author);
  form.append("description", description);
  form.append("file", file);

  const res = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: authHeaders(token), // no Content-Type: browser sets the multipart boundary
    body: form,
  });
  return parseErrorOrJson<Book>(res);
}

export async function deleteBook(token: string, bookId: number): Promise<void> {
  const res = await fetch(`${API_URL}/books/${bookId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Failed to delete book (${res.status})`);
  }
}

export function bookDownloadUrl(bookId: number): string {
  return `${API_URL}/books/${bookId}/download`;
}

/**
 * PDF downloads need the Authorization header, which a plain <a href>
 * can't send. This fetches the file as a blob and triggers a save
 * using a temporary object URL.
 */
export async function downloadBook(token: string, book: Book): Promise<void> {
  const res = await fetch(bookDownloadUrl(book.id), {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error(`Failed to download "${book.title}" (${res.status})`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = book.original_filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
