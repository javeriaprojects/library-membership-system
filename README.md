# Library Membership System

FastAPI backend + Next.js frontend for a small library app with two
roles — **Librarian** and **Member** — sign-up/login, a membership
roster with 30-day auto-expiry, a book catalog where librarians upload
PDFs and members download them, and real-time updates over WebSockets
so open browser tabs refresh automatically when data changes.

## How it works

- **Sign up**: `POST /auth/signup` creates an account as either role
  (chosen on the signup form). Members get `expiry_date = now + 30 days`;
  librarians never expire (`expiry_date = NULL`).
- **Log in**: `POST /auth/login` returns a JWT. The frontend stores it
  (in `localStorage`, fine for a demo — see note in `lib/auth-context.tsx`)
  and sends it as `Authorization: Bearer <token>` on every request.
- **Expiry**: an APScheduler job runs inside the FastAPI process — once on
  startup, then every hour — and marks any member whose `expiry_date` has
  passed as `is_active = False`. Rows are **not deleted**, so history is
  preserved.
- **Roster**: `GET /members` (librarian-only) lists every member account
  with expiry dates, rendered as a table with a green/red "due back" stamp.
- **Book catalog**: librarians upload PDFs via `POST /books` (multipart
  form: title, author, description, file). Any signed-in user can list
  (`GET /books`) and download (`GET /books/{id}/download`) them; only
  librarians can delete (`DELETE /books/{id}`). Files are stored on disk
  under `backend/uploads/`.
- **Real-time updates**: the frontend opens a WebSocket connection to
  `/ws`. Whenever a book is
