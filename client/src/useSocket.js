import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:4000";

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [queueState, setQueueState] = useState({
    queue: [],
    currentToken: null,
    avgConsultTime: 10,
    totalServed: 0,
  });

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("state_update", (data) => setQueueState(data));

    return () => socket.disconnect();
  }, []);

  const emit = (event, payload) => {
    if (socketRef.current) socketRef.current.emit(event, payload);
  };

  return { connected, queueState, emit };
}
