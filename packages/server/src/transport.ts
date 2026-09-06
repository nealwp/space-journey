import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage, ServerMessage } from "@space-journey/contracts";
import type { SystemRegistry } from "./registry";

const DEFAULT_PORT = 8080;

export class SystemTransport {
  private wss: WebSocketServer | null = null;
  private clients = new Set<WebSocket>();

  constructor(private registry: SystemRegistry) {}

  listen(port: number = DEFAULT_PORT): void {
    this.wss = new WebSocketServer({ port });

    this.wss.on("connection", (socket) => {
      this.clients.add(socket);

      socket.on("message", (raw) => {
        let message: ClientMessage;
        try {
          message = JSON.parse(raw.toString());
        } catch {
          return;
        }

        if (message.type === "SUBSCRIBE") {
          this.sendInitial(socket, message.systemIds);
        }
      });

      socket.on("close", () => {
        this.clients.delete(socket);
      });
    });

    this.registry.addListener((message) => {
      this.broadcast(message satisfies ServerMessage);
    });
  }

  close(): void {
    for (const socket of this.clients) {
      socket.close();
    }
    this.clients.clear();
    this.wss?.close();
    this.wss = null;
  }

  private sendInitial(socket: WebSocket, systemIds: string[]): void {
    for (const id of systemIds) {
      const snapshot = this.registry.getSnapshot(id);
      if (!snapshot) continue;
      const update: ServerMessage = {
        type: "SYSTEM_UPDATE",
        systemId: id,
        snapshot,
      };
      socket.send(JSON.stringify(update));
    }
  }

  private broadcast(message: ServerMessage): void {
    const data = JSON.stringify(message);
    for (const socket of this.clients) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    }
  }
}