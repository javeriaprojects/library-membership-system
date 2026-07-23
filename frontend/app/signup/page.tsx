"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Role } from "@/lib/types";

export default function SignupPage() {
  const { signup, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(name.trim(), email.trim(), password, role);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Reading Room — Create account</p>
        <h1>Join the library</h1>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>

          <fieldset className="role-field">
            <legend>I am signing up as a…</legend>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="member"
                checked={role === "member"}
                onChange={() => setRole("member")}
              />
              <span>
                <strong>Member</strong> — browse and download books; membership
                expires after 30 days
              </span>
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="librarian"
                checked={role === "librarian"}
                onChange={() => setRole("librarian")}
              />
              <span>
                <strong>Librarian</strong> — add books to the catalog and view
                the member roster
              </span>
            </label>
          </fieldset>

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>

          {error && <p className="error">{error}</p>}
        </form>

        <p className="switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-page {
          max-width: 460px;
          margin: 0 auto;
          padding: 64px 24px;
        }
        .auth-card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 28px;
        }
        .eyebrow {
          font-family: "Space Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brass);
          margin: 0 0 8px;
        }
        h1 {
          font-family: "Source Serif 4", serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--forest-deep);
          margin: 0 0 20px;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: var(--ink-soft);
        }
        input[type="text"],
        input[type="email"],
        input[type="password"] {
          font-family: "Inter", sans-serif;
          font-size: 14px;
          padding: 10px;
          border: 1px solid var(--line);
          border-radius: 4px;
          background: #fff;
          color: var(--ink);
        }
        .role-field {
          border: 1px solid var(--line);
          border-radius: 6px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .role-field legend {
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-soft);
          padding: 0 4px;
        }
        .role-option {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: var(--ink);
          cursor: pointer;
        }
        .role-option input {
          margin-top: 3px;
        }
        button {
          margin-top: 4px;
          font-family: "Inter", sans-serif;
          font-weight: 600;
          font-size: 14px;
          padding: 11px 18px;
          border-radius: 4px;
          border: none;
          background: var(--forest);
          color: #fff;
          cursor: pointer;
        }
        button:hover:not(:disabled) {
          background: var(--forest-deep);
        }
        button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .error {
          color: var(--stamp-red);
          font-size: 13px;
          margin: 0;
        }
        .switch {
          margin: 18px 0 0;
          font-size: 13px;
          color: var(--ink-soft);
          text-align: center;
        }
        .switch :global(a) {
          color: var(--forest);
          font-weight: 600;
        }
      `}</style>
    </main>
  );
}
