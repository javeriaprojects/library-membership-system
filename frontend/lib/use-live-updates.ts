"use client";

import { useEffect, useRef } from "react";

type EventType = "books_updated" | "members_updated";

/**
 * Connects to the backend's WebSocket and calls onEvent whenever a
 * matching event is broadcast — e.g. another tab adds a book, or the
 * hourly expiry job flips a membership to inactive. Reconnects
 * automatically if the connection drops.
 */
export function useLiveUpdates(eventType: EventType, onEvent: () => void) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let closedByUs = false;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const wsUrl = apiUrl.replace(/^http/, "ws") + "/ws";

    function connect() {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === eventType) {
            onEventRef.current();
          }
        } catch {
          // ignore malformed messages
        }
      };

      socket.onclose = () => {
        if (!closedByUs) {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };
    }

    connect();

    return () => {
      closedByUs = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [eventType]);
}
