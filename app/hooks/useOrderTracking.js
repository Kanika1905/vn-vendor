// app/hooks/useOrderTracking.js
// Live order tracking with graceful degradation:
//   1. Initial state is loaded over REST (GET /track).
//   2. A WebSocket pushes real-time driver updates.
//   3. If the WS drops, we immediately fall back to polling /track every 5s and
//      keep retrying the WS with exponential backoff.
//
// Returns: { status, driver, destination, loading, error, connection, retry }
//   connection: "connecting" | "live" | "polling"
import { useEffect, useRef, useState, useCallback } from "react";
import { fetchTrack, trackSocketUrl } from "../services/tracking";

const POLL_MS = 3000;
const MAX_BACKOFF_MS = 13000;

export default function useOrderTracking(orderId, token) {
  const [status, setStatus] = useState("preparing");
  const [driver, setDriver] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connection, setConnection] = useState("connecting");

  const wsRef = useRef(null);
  const pollRef = useRef(null);
  const reconnectRef = useRef(null);
  const attemptRef = useRef(0);
  const mountedRef = useRef(true);

  const apply = useCallback((data) => {
    if (!data) return;
    if (data.status) setStatus(data.status);
    if (data.driver !== undefined) setDriver(data.driver);
    if (data.destination !== undefined) setDestination(data.destination);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollOnce = useCallback(async () => {
    try {
      const data = await fetchTrack(orderId, token);
      if (!mountedRef.current) return;
      apply(data);
      setError(null);
    } catch {
      if (mountedRef.current) setError("Can't reach the server. Retrying…");
    }
  }, [orderId, token, apply]);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    setConnection((c) => (c === "live" ? c : "polling"));
    pollOnce();
    pollRef.current = setInterval(pollOnce, POLL_MS);
  }, [pollOnce]);

  const connectWs = useCallback(() => {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }
    let ws;
    try {
      ws = new WebSocket(trackSocketUrl(orderId, token));
    } catch {
      startPolling();
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      attemptRef.current = 0;
      setConnection("live");
      setError(null);
      stopPolling(); // WS is authoritative — pause the fallback
    };
    ws.onmessage = (evt) => {
      if (!mountedRef.current) return;
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === "location") apply(msg);
      } catch {}
    };
    ws.onerror = () => {}; // onclose drives the reconnect
    ws.onclose = () => {
      if (!mountedRef.current) return;
      wsRef.current = null;
      startPolling(); // keep data flowing while we retry
      const attempt = (attemptRef.current += 1);
      const delay = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectRef.current = setTimeout(() => {
        if (mountedRef.current) connectWs();
      }, delay);
    };
  }, [orderId, token, apply, startPolling, stopPolling]);

  const start = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTrack(orderId, token);
      if (!mountedRef.current) return;
      apply(data);
      setError(null);
    } catch {
      if (mountedRef.current) setError("Couldn't load tracking.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
    connectWs();
  }, [orderId, token, apply, connectWs]);

  const retry = useCallback(() => {
    attemptRef.current = 0;
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    stopPolling();
    setError(null);
    setConnection("connecting");
    start();
  }, [start, stopPolling]);

  useEffect(() => {
    mountedRef.current = true;
    if (orderId && token) start();
    return () => {
      mountedRef.current = false;
      stopPolling();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token]);

  return { status, driver, destination, loading, error, connection, retry };
}
