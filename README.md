# Library Membership System

FastAPI backend + Next.js frontend for tracking library members whose
memberships automatically expire 30 days after registration.

## How it works

- **Register**: `POST /members` creates a member with `expiry_date = now + 30 days`.
- **Expiry**: an APScheduler job runs inside the FastAPI process — once on
  startup, then every hour — and marks any member whose `expiry_date` has
  passed as `is_active = False`. Rows are **not deleted**, so you keep a
  history of past members; the frontend can filter to active-only via
  `GET /members?active_only=true`.
- **Display**: the Next.js page fetches `GET /members` and renders a table
  with each member's name, email, enrollment date, and expiry date (styled
  as a "due back" stamp — green while active, red once expired).

## Project structure

```
library-membership-system/
├── backend/
│   ├── main.py         # FastAPI app, routes, CORS, scheduler lifecycle
│   ├── models.py        # SQLAlchemy Member model
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── crud.py           # DB read/write logic incl. expiry check
│   ├── scheduler.py       # APScheduler background job
│   ├── database.py        # SQLite engine/session setup
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── page.tsx        # Main page: form + roster table
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── MemberForm.tsx
    │   ├── MembersTable.tsx
    │   └── DueStamp.tsx     # expiry badge
    └── lib/
        ├── api.ts           # fetch helpers
        └── types.ts
```

## Running it

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

This creates `library.db` (SQLite) automatically on first run.
API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. It reads `NEXT_PUBLIC_API_URL` from
`.env.local` (already set to `http://localhost:8000`).

## Notes / things to consider extending

- **"Cron job or scheduled background task"**: this uses APScheduler
  running inside the app process, which satisfies the requirement for a
  single-server setup with zero extra infrastructure. If you deploy
  multiple backend instances behind a load balancer, move the expiry
  check to a real external cron job (or a separate worker) so it only
  runs once — otherwise every instance will run its own hourly job
  redundantly (harmless here since the check is idempotent, but wasteful).
- **Mark inactive vs. delete**: the task says "remove or mark as
  inactive" — this implementation marks members inactive rather than
  deleting them, since librarians usually want a record of who was a
  member. Swapping to hard-delete is a one-line change in `crud.py`
  (`db.delete(member)` instead of `member.is_active = False`) if that's
  what's actually wanted.
- **Auth**: there's no login/auth layer here — every request to
  `/members` is unauthenticated. Worth asking your supervisor whether
  that's expected for this internship task or whether member
  registration/viewing should be restricted to staff.
- **Production DB**: SQLite is fine for a demo/internship task; for
  anything with concurrent writers, switch `DATABASE_URL` in
  `database.py` to Postgres.
