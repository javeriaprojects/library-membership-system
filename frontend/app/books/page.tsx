"use client";

import { useState, useEffect, useCallback } from "react";
import { Book } from "@/lib/types";
import { fetchBooks } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLiveUpdates } from "@/lib/use-live-updates";
import RequireAuth from "@/components/RequireAuth";
import BookForm from "@/components/BookForm";
import BookList from "@/components/BookList";

function BooksContent() {
  const { token, user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const data = await fetchBooks(token);
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load books.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Refetch automatically when any user adds/removes a book elsewhere
  useLiveUpdates("books_updated", loadBooks);

  return (
    <main className="page">
      <header className="header">
        <p className="eyebrow">Reading Room — Catalog</p>
        <h1>Book Catalog</h1>
        <p className="sub">
          {user?.role === "librarian"
            ? "Add PDFs to the catalog for members to download."
            : "Browse and download available books as PDFs."}
        </p>
      </header>

      {user?.role === "librarian" && (
        <section className="card">
          <h2>Add a new book</h2>
          <BookForm onUploaded={loadBooks} />
        </section>
      )}

      <section className="card">
        <div className="card__heading">
          <h2>Available books</h2>
          <span className="count">{books.length} total</span>
        </div>

        {loading && <p className="status">Loading catalog…</p>}
        {error && <p className="status status--error">{error}</p>}
        {!loading && !error && <BookList books={books} onChanged={loadBooks} />}
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

export default function BooksPage() {
  return (
    <RequireAuth>
      <BooksContent />
    </RequireAuth>
  );
}
