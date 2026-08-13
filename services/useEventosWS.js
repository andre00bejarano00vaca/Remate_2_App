import { useEffect, useRef } from "react";
import { wsBaseUrl } from "../config/env";

export default function useEventosWS(idRemate, onMessage) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!idRemate) return;

    const socket = new WebSocket(`${wsBaseUrl}/ws/eventos/${idRemate}`);

    socket.onmessage = (event) => {
      onMessageRef.current?.(event.data);
    };

    socket.onerror = (err) => console.error("[EVENTOS WS] error:", err);

    return () => socket.close();
  }, [idRemate]);
}
