from datetime import datetime, timedelta

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

MEMBERSHIP_DURATION_DAYS = 30

ROLE_LIBRARIAN = "librarian"
ROLE_MEMBER = "member"


class User(Base):
    """
    A single table for both roles. `role` distinguishes librarians
    (who manage books) from members (whose accounts expire after
    MEMBERSHIP_DURATION_DAYS, same as the original membership system).
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default=ROLE_MEMBER)

    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Only meaningful for members. Librarians never expire, so this
    # stays NULL for them.
    expiry_date = Column(DateTime, nullable=True)

    # For members: flips to False once expiry_date has passed.
    # Librarians are always active.
    is_active = Column(Boolean, default=True, nullable=False)

    books = relationship("Book", back_populates="uploaded_by")

    @staticmethod
    def default_expiry() -> datetime:
        return datetime.utcnow() + timedelta(days=MEMBERSHIP_DURATION_DAYS)


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    description = Column(String, nullable=True)

    # The PDF is saved to disk under UPLOAD_DIR; we only store its
    # generated filename here (see main.py for UPLOAD_DIR).
    pdf_filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)

    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_by = relationship("User", back_populates="books")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)