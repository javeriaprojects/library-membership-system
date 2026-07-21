from datetime import datetime, timedelta

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base

MEMBERSHIP_DURATION_DAYS = 30


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)

    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expiry_date = Column(DateTime, nullable=False)

    # instead of deleting expired members, we mark them inactive so
    # historical records are preserved
    is_active = Column(Boolean, default=True, nullable=False)

    @staticmethod
    def default_expiry() -> datetime:
       return datetime.utcnow() + timedelta(days=MEMBERSHIP_DURATION_DAYS)
