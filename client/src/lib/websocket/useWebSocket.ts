
import { useEffect, useRef, useState } from "react";

export function useWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setConnected(true);
      console.log("🟢 WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch {
        setLastMessage(event.data);
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
      console.log("🔴 WebSocket disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const sendMessage = (msg: any) => {
    ws.current?.send(JSON.stringify(msg));
  };

  return { connected, lastMessage, sendMessage };
}

