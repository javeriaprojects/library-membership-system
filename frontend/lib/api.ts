import { Member } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchMembers(): Promise<Member[]> {
  const res = await fetch(`${API_URL}/members`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load members (${res.status})`);
  }
  return res.json();
}

export async function registerMember(name: string, email: string): Promise<Member> {
  const res = await fetch(`${API_URL}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Failed to register member (${res.status})`);
  }

  return res.json();
}
