"use client";

import { useEffect, useState, useCallback } from "react";
import { Member } from "@/lib/types";
import { fetchMembers } from "@/lib/api";
import MemberForm from "@/components/MemberForm";
import MembersTable from "@/components/MembersTable";

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchMembers();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const activeCount = members.filter((m) => m.is_active).length;

  return (
    <main className="page">
      <header className="header">
        <p className="eyebrow">Reading Room — Membership Ledger</p>
        <h1>Library Members</h1>
        <p className="sub">
          Every card expires 30 days after enrollment. A background job checks
          hourly and stamps lapsed cards as expired automatically.
        </p>
      </header>

      <section className="card">
        <h2>Enroll a new member</h2>
        <MemberForm onRegistered={loadMembers} />
      </section>

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

      <style jsx>{`
        .page {
          max-width: 880px;
          margin: 0 auto;
          padding: 56px 24px 80px;
        }
        .header {
          margin-bottom: 36px;
        }
        .eyebrow {
          font-family: "Space Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brass);
          margin: 0 0 10px;
        }
        h1 {
          font-family: "Source Serif 4", serif;
          font-size: 40px;
          font-weight: 700;
          color: var(--forest-deep);
          margin: 0 0 10px;
        }
        .sub {
          color: var(--ink-soft);
          font-size: 15px;
          max-width: 56ch;
          line-height: 1.5;
          margin: 0;
        }
        .card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .card h2 {
          font-family: "Source Serif 4", serif;
          font-size: 19px;
          font-weight: 600;
          color: var(--forest-deep);
          margin: 0 0 16px;
        }
        .card__heading {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .card__heading h2 {
          margin: 0;
        }
        .count {
          font-family: "Space Mono", monospace;
          font-size: 12px;
          color: var(--ink-soft);
        }
        .status {
          font-size: 14px;
          color: var(--ink-soft);
        }
        .status--error {
          color: var(--stamp-red);
        }
      `}</style>
    </main>
  );
}
