from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

import models
import schemas
import crud
from database import engine, get_db
from scheduler import start_scheduler, stop_scheduler

models.Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    start_scheduler()
    yield
    # shutdown
    stop_scheduler()


app = FastAPI(title="Library Membership System", lifespan=lifespan)

# Allow the Next.js dev server to call this API.
# Tighten this to your real frontend domain in production.
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


@app.post("/members", response_model=schemas.MemberOut)
def register_member(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_member(db, member)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="A member with this email already exists.")


@app.get("/members", response_model=list[schemas.MemberOut])
def list_members(active_only: bool = False, db: Session = Depends(get_db)):
    """
    Lists all members with their expiry dates.
    Pass ?active_only=true to only get currently active memberships.
    """
    return crud.get_members(db, active_only=active_only)
