"use client";

import { useState, FormEvent } from "react";
import { registerMember } from "@/lib/api";

interface MemberFormProps {
  onRegistered: () => void;
}

export default function MemberForm({ onRegistered }: MemberFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerMember(name.trim(), email.trim());
      setName("");
      setEmail("");
      onRegistered();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form__row">
        <label className="field">
          <span>Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Amina Raza"
            required
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="amina@example.com"
            required
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Enrolling…" : "Enroll member"}
        </button>
      </div>

      {error && <p className="form__error">{error}</p>}

      <style jsx>{`
        .form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form__row {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: var(--ink-soft);
          flex: 1;
          min-width: 180px;
        }
        input {
          font-family: "Inter", sans-serif;
          font-size: 14px;
          padding: 9px 10px;
          border: 1px solid var(--line);
          border-radius: 4px;
          background: var(--card);
          color: var(--ink);
        }
        input:focus-visible {
          outline: 2px solid var(--forest);
          outline-offset: 1px;
        }
        button {
          font-family: "Inter", sans-serif;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 18px;
          border-radius: 4px;
          border: none;
          background: var(--forest);
          color: #fff;
          cursor: pointer;
          white-space: nowrap;
        }
        button:hover:not(:disabled) {
          background: var(--forest-deep);
        }
        button:focus-visible {
          outline: 2px solid var(--brass);
          outline-offset: 2px;
        }
        button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .form__error {
          color: var(--stamp-red);
          font-size: 13px;
          margin: 0;
        }
      `}</style>
    </form>
  );
}
