"""
Scheduled background task that checks for expired memberships.

This uses APScheduler running inside the FastAPI process, which is the
simplest option for a single-server deployment (no separate cron
process to manage). If you later deploy multiple backend instances,
move this logic to an external cron job / task queue (e.g. system
cron calling a script, or Celery beat) so it only runs once, not once
per instance.
"""

import logging
from apscheduler.schedulers.background import BackgroundScheduler

from database import SessionLocal
import crud
from ws_manager import manager

logger = logging.getLogger("uvicorn")

scheduler = BackgroundScheduler()


def check_expired_memberships():
    db = SessionLocal()
    try:
        count = crud.deactivate_expired_members(db)
        if count:
            logger.info(f"[scheduler] Deactivated {count} expired membership(s).")
            # APScheduler runs this on its own background thread, so we
            # use the threadsafe variant to notify connected browser tabs.
            manager.broadcast_threadsafe({"type": "members_updated"})
    finally:
        db.close()


def start_scheduler():
    # Runs once every hour. Change to a cron trigger if you want it to
    # run at a fixed time instead, e.g.:
    # scheduler.add_job(check_expired_memberships, "cron", hour=0, minute=0)
    scheduler.add_job(check_expired_memberships, "interval", hours=1, id="expire_check")

    # Also run once immediately on startup so stale data is cleaned up
    # right away rather than waiting up to an hour.
    check_expired_memberships()

    scheduler.start()
    logger.info("[scheduler] Membership expiry scheduler started.")


def stop_scheduler():
    scheduler.shutdown()