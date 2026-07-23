"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await login(email.trim(), password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Reading Room — Sign in</p>
        <h1>Welcome back</h1>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Log in"}
          </button>

          {error && <p className="error">{error}</p>}
        </form>

        <p className="switch">
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-page {
          max-width: 420px;
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
        input {
          font-family: "Inter", sans-serif;
          font-size: 14px;
          padding: 10px;
          border: 1px solid var(--line);
          border-radius: 4px;
          background: #fff;
          color: var(--ink);
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
