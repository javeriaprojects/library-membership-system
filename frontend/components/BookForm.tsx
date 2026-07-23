"use client";

import { useState, FormEvent, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { uploadBook } from "@/lib/api";

interface BookFormProps {
  onUploaded: () => void;
}

export default function BookForm({ onUploaded }: BookFormProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) return;
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }

    setSubmitting(true);
    try {
      await uploadBook(
        token,
        title.trim(),
        author.trim(),
        description.trim(),
        file,
      );
      setTitle("");
      setAuthor("");
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload book.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="row">
        <label className="field">
          <span>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Author</span>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </label>
      </div>

      <label className="field">
        <span>Description (optional)</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="field">
        <span>PDF file</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? "Uploading…" : "Add book to catalog"}
      </button>

      {error && <p className="error">{error}</p>}

      <style jsx>{`
        .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .row {
          display: flex;
          gap: 12px;
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
          background: #fff;
          color: var(--ink);
        }
        input[type="file"] {
          padding: 6px 4px;
        }
        button {
          align-self: flex-start;
          font-family: "Inter", sans-serif;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 18px;
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
      `}</style>
    </form>
  );
}
