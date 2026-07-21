from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

import models
import schemas


def create_member(db: Session, member: schemas.MemberCreate) -> models.Member:
    db_member = models.Member(
        name=member.name,
        email=member.email,
        expiry_date=models.Member.default_expiry(),
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


def get_members(db: Session, active_only: bool = False) -> list[models.Member]:
    stmt = select(models.Member).order_by(models.Member.registered_at.desc())
    if active_only:
        stmt = stmt.where(models.Member.is_active == True)  # noqa: E712
    return list(db.scalars(stmt))


def deactivate_expired_members(db: Session) -> int:
    """
    Marks every member whose expiry_date has passed as inactive.
    Returns how many rows were updated (useful for logging).
    """
    now = datetime.utcnow()
    stmt = select(models.Member).where(
        models.Member.expiry_date < now,
        models.Member.is_active == True,  # noqa: E712
    )
    expired_members = list(db.scalars(stmt))

    for member in expired_members:
        member.is_active = False

    db.commit()
    return len(expired_members)
