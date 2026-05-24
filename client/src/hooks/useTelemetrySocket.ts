import { useEffect, useState } from "react";
export function useTelemetrySocket() {
  const [connected, setConnected] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [whales, setWhales] = useState<any[]>([]);


  useEffect(() => {
    const protocol =
      window.location.protocol === "https:" ? "wss" : "ws";

    const socket = new WebSocket(
      `${protocol}://${window.location.host}/ws`
    );

    
    socket.onopen = () => {
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        
         if (payload.type === "TELEMETRY") {
          setTelemetry(payload.data);
        }

        if (payload.type === "WHALE_ALERT") {
          setWhales((prev) => [payload.data, ...prev].slice(0, 20));
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    
     socket.onclose = () => {
      setConnected(false);
    };

    return () => socket.close();
  }, []);


   return {
    connected,
    telemetry,
    whales,
  };
}