import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  workspaceId: string;
  channels?: string[];
  onEvent?: (event: any) => void;
  onAnalyticsUpdate?: (data: any) => void;
  onAlert?: (alert: any) => void;
}

export function useWebSocket({
  workspaceId,
  channels = ['all'],
  onEvent,
  onAnalyticsUpdate,
  onAlert,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);

      // Subscribe to channels
      ws.send(JSON.stringify({
        type: 'subscribe',
        workspaceId,
        channels,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'event':
            setLastEvent(message.data);
            onEvent?.(message.data);
            break;

          case 'analytics_update':
            onAnalyticsUpdate?.(message.data);
            break;

          case 'alert':
            onAlert?.(message.data);
            break;

          case 'connected':
          case 'subscribed':
            console.log(message);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);

      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, [workspaceId, channels, onEvent, onAnalyticsUpdate, onAlert]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastEvent,
  };
}
