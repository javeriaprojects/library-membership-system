"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Member } from "@/lib/types";
import { fetchMembers } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLiveUpdates } from "@/lib/use-live-updates";
import RequireAuth from "@/components/RequireAuth";
import MembersTable from "@/components/MembersTable";
import DueStamp from "@/components/DueStamp";

function LibrarianDashboard() {
  const { token } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const data = await fetchMembers(token);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the API.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Refetch automatically on new signups or when the hourly expiry
  // job flips someone's membership to inactive.
  useLiveUpdates("members_updated", loadMembers);

  const activeCount = members.filter((m) => m.is_active).length;

  return (
    <>
      <header className="header">
        <p className="eyebrow">Reading Room — Membership Ledger</p>
        <h1>Library Members</h1>
        <p className="sub">
          Members sign up on their own (see the Sign up page). Every membership
          expires 30 days after signup — a background job checks hourly and
          stamps lapsed cards as expired automatically.
        </p>
      </header>

      <section className="card">
        <div className="card__heading">
          <h2>Current roster</h2>
          <span className="count">
            {activeCount} active · {members.length} total
          </span>
        </div>

        {loading && <p className="status">Loading roster…</p>}
        {error && <p className="status status--error">{error}</p>}
        {!loading && !error && <MembersTable members={members} />}
      </section>

      <section className="card">
        <h2>Manage the catalog</h2>
        <p className="sub" style={{ marginBottom: 12 }}>
          Add new books for members to download from the catalog page.
        </p>
        <Link href="/books" className="cta">
          Go to Book Catalog →
        </Link>
      </section>
    </>
  );
}

function MemberDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <header className="header">
        <p className="eyebrow">Reading Room — Your account</p>
        <h1>Welcome, {user.name.split(" ")[0]}</h1>
        <p className="sub">
          Here&rsquo;s your membership status and a shortcut to the catalog.
        </p>
      </header>

      <section className="card membership-card">
        <div>
          <h2>Membership status</h2>
          <p className="sub" style={{ marginBottom: 0 }}>
            {user.email}
          </p>
        </div>
        {user.expiry_date && (
          <DueStamp expiryDate={user.expiry_date} isActive={user.is_active} />
        )}
      </section>

      <section className="card">
        <h2>Book catalog</h2>
        <p className="sub" style={{ marginBottom: 12 }}>
          Browse available books and download them as PDFs.
        </p>
        <Link href="/books" className="cta">
          Browse Books →
        </Link>
      </section>
    </>
  );
}

function HomeContent() {
  const { user } = useAuth();

  return (
    <main className="page">
      {user?.role === "librarian" ? (
        <LibrarianDashboard />
      ) : (
        <MemberDashboard />
      )}
    </main>
  );
}

export default function Home() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  );
}
