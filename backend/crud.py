import uuid
from datetime import datetime
from pathlib import Path

from sqlalchemy.orm import Session
from sqlalchemy import select

import models
import schemas
from auth import hash_password, verify_password


# ---------- Users ----------

def create_user(db: Session, data: schemas.SignupRequest) -> models.User:
    is_member = data.role == models.ROLE_MEMBER
    db_user = models.User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
        expiry_date=models.User.default_expiry() if is_member else None,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> models.User | None:
    user = db.scalar(select(models.User).where(models.User.email == email))
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def get_members(db: Session, active_only: bool = False) -> list[models.User]:
    stmt = (
        select(models.User)
        .where(models.User.role == models.ROLE_MEMBER)
        .order_by(models.User.registered_at.desc())
    )
    if active_only:
        stmt = stmt.where(models.User.is_active == True)  # noqa: E712
    return list(db.scalars(stmt))


def deactivate_expired_members(db: Session) -> int:
    """
    Marks every member whose expiry_date has passed as inactive.
    Librarians are untouched (their expiry_date is always NULL).
    """
    now = datetime.utcnow()
    stmt = select(models.User).where(
        models.User.role == models.ROLE_MEMBER,
        models.User.expiry_date < now,
        models.User.is_active == True,  # noqa: E712
    )
    expired = list(db.scalars(stmt))

    for user in expired:
        user.is_active = False

    db.commit()
    return len(expired)


# ---------- Books ----------

def create_book(
    db: Session,
    title: str,
    author: str,
    description: str | None,
    original_filename: str,
    saved_filename: str,
    uploaded_by: models.User,
) -> models.Book:
    db_book = models.Book(
        title=title,
        author=author,
        description=description,
        pdf_filename=saved_filename,
        original_filename=original_filename,
        uploaded_by_id=uploaded_by.id,
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


def get_books(db: Session) -> list[models.Book]:
    stmt = select(models.Book).order_by(models.Book.created_at.desc())
    return list(db.scalars(stmt))


def get_book(db: Session, book_id: int) -> models.Book | None:
    return db.scalar(select(models.Book).where(models.Book.id == book_id))


def delete_book(db: Session, book: models.Book, upload_dir: Path) -> None:
    file_path = upload_dir / book.pdf_filename
    if file_path.exists():
        file_path.unlink()
    db.delete(book)
    db.commit()


def generate_pdf_filename(original_filename: str) -> str:
    """Prevents filename collisions/overwrites on disk."""
    suffix = Path(original_filename).suffix or ".pdf"
    return f"{uuid.uuid4().hex}{suffix}"