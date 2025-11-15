import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

interface WSClient {
  ws: WebSocket;
  workspaceId: string;
  subscriptions: Set<string>;
}

class AnalyticsWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, WSClient> = new Map();

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: "/ws" });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("WebSocket client connected");

      const client: WSClient = {
        ws,
        workspaceId: "",
        subscriptions: new Set(),
      };

      this.clients.set(ws, client);

      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("Invalid WebSocket message:", error);
        }
      });

      ws.on("close", () => {
        console.log("WebSocket client disconnected");
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.clients.delete(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({ type: "connected", message: "Connected to SFS Analytics" }));
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    const client = this.clients.get(ws);
    if (!client) return;

    switch (message.type) {
      case "subscribe":
        client.workspaceId = message.workspaceId;
        if (message.channels) {
          message.channels.forEach((channel: string) => {
            client.subscriptions.add(channel);
          });
        }
        ws.send(JSON.stringify({
          type: "subscribed",
          workspaceId: message.workspaceId,
          channels: Array.from(client.subscriptions),
        }));
        break;

      case "unsubscribe":
        if (message.channels) {
          message.channels.forEach((channel: string) => {
            client.subscriptions.delete(channel);
          });
        }
        break;

      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;
    }
  }

  // Broadcast event to all subscribed clients
  public broadcastEvent(workspaceId: string, event: any) {
    this.clients.forEach((client) => {
      if (
        client.workspaceId === workspaceId &&
        (client.subscriptions.has("events") || client.subscriptions.has("all"))
      ) {
        client.ws.send(JSON.stringify({
          type: "event",
          data: event,
        }));
      }
    });
  }

  // Broadcast analytics update
  public broadcastAnalyticsUpdate(workspaceId: string, data: any) {
    this.clients.forEach((client) => {
      if (
        client.workspaceId === workspaceId &&
        (client.subscriptions.has("analytics") || client.subscriptions.has("all"))
      ) {
        client.ws.send(JSON.stringify({
          type: "analytics_update",
          data,
        }));
      }
    });
  }

  // Broadcast alert
  public broadcastAlert(workspaceId: string, alert: any) {
    this.clients.forEach((client) => {
      if (
        client.workspaceId === workspaceId &&
        (client.subscriptions.has("alerts") || client.subscriptions.has("all"))
      ) {
        client.ws.send(JSON.stringify({
          type: "alert",
          data: alert,
        }));
      }
    });
  }
}

export default AnalyticsWebSocketServer;
