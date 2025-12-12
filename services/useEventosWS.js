import { useEffect } from "react";
export default function useEventosWS(idRemate, onMessage) {
  useEffect(() => {
    if (!idRemate) return;

    const socket = new WebSocket(`wss://testapp.digitaltelecom.net/ws/eventos/${idRemate}`);

    socket.onopen = () => console.log("WS conectado");

    socket.onmessage = (event) => {
      const mensaje = event.data;
      console.log(mensaje)
      onMessage(mensaje);  // 👈 aquí se procesa el mensaje
    };

    socket.onerror = (err) => console.log("WS error:", err);
    socket.onclose = () => console.log("WS cerrado");

    return () => socket.close();
  }, [idRemate, onMessage]);
}
