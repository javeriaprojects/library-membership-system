"use client";

import { useState } from "react";
import { Book } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { downloadBook, deleteBook } from "@/lib/api";

interface BookListProps {
  books: Book[];
  onChanged: () => void;
}

export default function BookList({ books, onChanged }: BookListProps) {
  const { token, user } = useAuth();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload(book: Book) {
    if (!token) return;
    setError(null);
    setBusyId(book.id);
    try {
      await downloadBook(token, book);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(book: Book) {
    if (!token) return;
    if (!confirm(`Remove "${book.title}" from the catalog?`)) return;
    setError(null);
    setBusyId(book.id);
    try {
      await deleteBook(token, book.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (books.length === 0) {
    return <p className="empty">No books in the catalog yet.</p>;
  }

  return (
    <div className="grid">
      {error && <p className="error">{error}</p>}
      {books.map((book) => (
        <div key={book.id} className="book-card">
          <div className="book-icon">📕</div>
          <div className="book-info">
            <h3>{book.title}</h3>
            <p className="author">by {book.author}</p>
            {book.description && <p className="desc">{book.description}</p>}
            <p className="meta">Added by {book.uploaded_by.name}</p>
          </div>
          <div className="actions">
            <button
              className="download"
              onClick={() => handleDownload(book)}
              disabled={busyId === book.id}
            >
              {busyId === book.id ? "…" : "Download PDF"}
            </button>
            {user?.role === "librarian" && (
              <button
                className="delete"
                onClick={() => handleDelete(book)}
                disabled={busyId === book.id}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 14px;
        }
        .empty {
          color: var(--ink-soft);
          font-size: 14px;
          padding: 24px 0;
        }
        .error {
          grid-column: 1 / -1;
          color: var(--stamp-red);
          font-size: 13px;
          margin: 0 0 4px;
        }
        .book-card {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 16px;
          background: var(--card);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .book-icon {
          font-size: 24px;
        }
        .book-info h3 {
          font-family: "Source Serif 4", serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--forest-deep);
          margin: 0 0 2px;
        }
        .author {
          font-size: 12.5px;
          color: var(--ink-soft);
          margin: 0 0 6px;
        }
        .desc {
          font-size: 12.5px;
          color: var(--ink);
          margin: 0 0 6px;
          line-height: 1.4;
        }
        .meta {
          font-family: "Space Mono", monospace;
          font-size: 10.5px;
          color: var(--ink-soft);
          margin: 0;
        }
        .actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }
        button {
          font-family: "Inter", sans-serif;
          font-weight: 600;
          font-size: 12px;
          padding: 8px 12px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
        }
        .download {
          flex: 1;
          background: var(--forest);
          color: #fff;
        }
        .download:hover:not(:disabled) {
          background: var(--forest-deep);
        }
        .delete {
          background: transparent;
          color: var(--stamp-red);
          border: 1px solid var(--stamp-red);
        }
        .delete:hover:not(:disabled) {
          background: rgba(140, 63, 52, 0.08);
        }
        button:disabled {
          opacity: 0.6;
          cursor: default;
        }
      `}</style>
    </div>
  );
}
