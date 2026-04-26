import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getSocket, reconnectSocket, disconnectSocket } from "../lib/socket.js";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

/**
 * Provides a Socket.io socket instance that is:
 *  - Connected immediately (anonymous) on mount
 *  - Reconnected with a fresh auth token when the user logs in
 *  - Disconnected (and reconnected anonymously) when the user logs out
 */
export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Re-create socket whenever auth token changes (login / logout)
    const sock = token ? reconnectSocket(token) : getSocket();
    socketRef.current = sock;

    function onConnect() {
      setConnected(true);
    }
    function onDisconnect() {
      setConnected(false);
    }

    sock.on("connect", onConnect);
    sock.on("disconnect", onDisconnect);

    // Sync initial state
    setConnected(sock.connected);

    return () => {
      sock.off("connect", onConnect);
      sock.off("disconnect", onDisconnect);
    };
  }, [token]);

  // Disconnect entirely on unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
}
