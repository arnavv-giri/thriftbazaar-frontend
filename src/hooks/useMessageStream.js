import { useEffect, useRef, useCallback } from "react";
import { getToken } from "../utils/auth";

/**
 * SSE endpoint URL — read from the Vite environment variable so it
 * works in dev (localhost:8081) and production (real domain) without
 * any source changes.  Falls back to localhost only if the variable is
 * not set (should never happen if .env is configured correctly).
 */
const SSE_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";
const SSE_URL  = `${SSE_BASE}/messages/stream`;

/**
 * useMessageStream
 * ────────────────
 * Opens a Server-Sent Events connection to GET /messages/stream and
 * calls onMessage(parsedDto) whenever the server pushes a new message.
 *
 * The hook is safe to mount in multiple components simultaneously —
 * each mounted instance has its own EventSource connection, and the
 * server registry supports one emitter per user per tab.
 *
 * Authentication
 * ──────────────
 * EventSource does not support custom headers, so the JWT is appended
 * as a ?token= query parameter. The JwtAuthenticationFilter on the
 * backend reads this parameter specifically for the /messages/stream path.
 *
 * Reconnection
 * ────────────
 * EventSource reconnects automatically on network errors or server
 * restarts. The 30-minute server-side timeout triggers an onopen/onerror
 * cycle and the browser re-connects immediately.
 *
 * @param {function} onMessage  - called with a MessageResponseDto object
 *                                whenever a new message arrives via SSE
 * @param {boolean}  enabled    - pass false to skip opening the connection
 *                                (e.g. when the user is not logged in)
 */
export function useMessageStream(onMessage, enabled = true) {
  // Keep a stable ref to the latest callback so we never need to
  // close/reopen the EventSource just because the callback changed.
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const esRef = useRef(null);

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) return;

    // Close any stale connection before opening a fresh one
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const url = `${SSE_URL}?token=${encodeURIComponent(token)}`;
    const es  = new EventSource(url);
    esRef.current = es;

    // "message" matches the event name set in SseEmitterRegistry.pushToUser
    es.addEventListener("message", (e) => {
      try {
        const dto = JSON.parse(e.data);
        onMessageRef.current?.(dto);
      } catch {
        // Malformed event data — ignore silently
      }
    });

    es.onerror = () => {
      // EventSource retries automatically; clear the ref only when
      // the connection has fully closed so connect() can reopen it.
      if (es.readyState === EventSource.CLOSED) {
        esRef.current = null;
      }
    };
  }, []); // connect itself is stable — no deps needed

  useEffect(() => {
    if (!enabled) return;

    connect();

    // Cleanup: close the SSE connection when the component unmounts
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [enabled, connect]);
}
