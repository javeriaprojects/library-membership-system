"""
Database setup.

Using SQLite for simplicity during development / internship demo.
To move to Postgres later, just change DATABASE_URL and add the
`psycopg2-binary` driver to requirements.txt — the rest of the code
(models, crud, routes) does not need to change.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./library.db"

# check_same_thread is only needed for SQLite
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
