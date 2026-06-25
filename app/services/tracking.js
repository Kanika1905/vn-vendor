// app/services/tracking.js
// Live order tracking transport helpers. Reuses CONFIG.BASE_URL and the existing
// Bearer-token flow (no new auth).
import { CONFIG } from "../constants";

// CONFIG.BASE_URL looks like "http://192.168.1.6:5000/api"
const API_ROOT = CONFIG.BASE_URL.replace(/\/+$/, "");
const SERVER_ROOT = API_ROOT.replace(/\/api$/, ""); // strip the /api suffix for WS

// GET /api/orders/:orderId/track  — initial load + polling fallback.
export async function fetchTrack(orderId, token, signal) {
  const res = await fetch(`${API_ROOT}/orders/${orderId}/track`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  if (!res.ok) throw new Error(`Track request failed (${res.status})`);
  return res.json();
}

// ws(s)://<host>/ws/orders/:orderId?token=<JWT>
export function trackSocketUrl(orderId, token) {
  const wsRoot = SERVER_ROOT.replace(/^http/i, "ws"); // http→ws, https→wss
  return `${wsRoot}/ws/orders/${orderId}?token=${encodeURIComponent(token)}`;
}

// POST /api/orders/:orderId/location — for a driver/agent build (handy for testing).
export async function pushLocation(orderId, token, body) {
  const res = await fetch(`${API_ROOT}/orders/${orderId}/location`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Location push failed (${res.status})`);
  return res.json();
}
