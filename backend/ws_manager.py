"""
Tiny WebSocket connection manager. Any connected browser tab gets
pushed a small JSON event whenever books or members change, so the UI
can refetch and update live instead of needing a manual refresh.

This broadcasts to every connected client (no per-user targeting) —
fine for a small demo app where everyone sees the same catalog/roster.
"""

import asyncio
from typing import List, Optional
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.loop: Optional[asyncio.AbstractEventLoop] = None

    def set_loop(self, loop: asyncio.AbstractEventLoop):
        """Called once at startup so background threads (the
        APScheduler job) can safely schedule a broadcast."""
        self.loop = loop

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        stale = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)

    def broadcast_threadsafe(self, message: dict):
        """Call this from a non-async thread (e.g. the scheduler job,
        which APScheduler runs on its own background thread)."""
        if self.loop is None:
            return
        asyncio.run_coroutine_threadsafe(self.broadcast(message), self.loop)


manager = ConnectionManager()