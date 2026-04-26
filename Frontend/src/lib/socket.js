import { io } from "socket.io-client";

const baseURL = import.meta.env.VITE_API_URL;

let socket = null;

/**
 * Returns the singleton socket, creating it if necessary.
 * Pass `token` to authenticate the connection (used on login/init).
 */
export function getSocket(token) {
  if (socket && socket.connected) return socket;

  // If we already have a socket but it's disconnected, clean it up
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const authToken = token ?? localStorage.getItem("auction_token");

  socket = io(baseURL || "/", {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    auth: authToken ? { token: authToken } : {},
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  return socket;
}

/**
 * Re-initialise the socket with a fresh token (call after login).
 */
export function reconnectSocket(token) {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return getSocket(token);
}

/**
 * Gracefully disconnect and destroy the socket (call after logout).
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
