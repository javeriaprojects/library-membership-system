from contextlib import asynccontextmanager
from pathlib import Path
import asyncio

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

import models
import schemas
import crud
from database import engine, get_db
from scheduler import start_scheduler, stop_scheduler
from auth import create_access_token, get_current_user, require_librarian
from ws_manager import manager

models.Base.metadata.create_all(bind=engine)

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_CONTENT_TYPE = "application/pdf"
MAX_PDF_BYTES = 25 * 1024 * 1024  # 25 MB


@asynccontextmanager
async def lifespan(app: FastAPI):
    manager.set_loop(asyncio.get_event_loop())
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="Library Membership System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "library-membership-system"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    The frontend connects here once and listens for small JSON events
    like {"type": "books_updated"} — it doesn't need to send anything
    back, this is a one-way notification channel.
    """
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from the client, but reading
            # keeps the connection open and lets us detect disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ---------------------------------------------------------------
# Auth
# ---------------------------------------------------------------

@app.post("/auth/signup", response_model=schemas.TokenResponse)
def signup(data: schemas.SignupRequest, db: Session = Depends(get_db)):
    try:
        user = crud.create_user(db, data)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    token = create_access_token(user.id)
    if user.role == models.ROLE_MEMBER:
        manager.broadcast_threadsafe({"type": "members_updated"})
    return schemas.TokenResponse(access_token=token, user=user)


@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    if user.role == models.ROLE_MEMBER and not user.is_active:
        raise HTTPException(status_code=403, detail="This membership has expired.")

    token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=user)


@app.get("/auth/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ---------------------------------------------------------------
# Members roster (librarian-facing, same expiry system as before)
# ---------------------------------------------------------------

@app.get("/members", response_model=list[schemas.UserOut])
def list_members(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_librarian),
):
    """Librarian-only: lists every member account with expiry dates."""
    return crud.get_members(db, active_only=active_only)


# ---------------------------------------------------------------
# Books
# ---------------------------------------------------------------

@app.get("/books", response_model=list[schemas.BookOut])
def list_books(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Any signed-in user (librarian or member) can browse the catalog."""
    return crud.get_books(db)


@app.post("/books", response_model=schemas.BookOut)
async def add_book(
    title: str = Form(...),
    author: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_librarian),
):
    if file.content_type != ALLOWED_CONTENT_TYPE:
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    contents = await file.read()
    if len(contents) > MAX_PDF_BYTES:
        raise HTTPException(status_code=400, detail="PDF is too large (25 MB max).")

    saved_filename = crud.generate_pdf_filename(file.filename)
    (UPLOAD_DIR / saved_filename).write_bytes(contents)

    book = crud.create_book(
        db,
        title=title,
        author=author,
        description=description or None,
        original_filename=file.filename,
        saved_filename=saved_filename,
        uploaded_by=current_user,
    )
    await manager.broadcast({"type": "books_updated"})
    return book


@app.get("/books/{book_id}/download")
def download_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Any signed-in user can download the PDF."""
    book = crud.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found.")

    file_path = UPLOAD_DIR / book.pdf_filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File missing on server.")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=book.original_filename,
    )


@app.delete("/books/{book_id}")
async def remove_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_librarian),
):
    book = crud.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found.")
    crud.delete_book(db, book, UPLOAD_DIR)
    await manager.broadcast({"type": "books_updated"})
    return {"status": "deleted", "id": book_id}
