import type {
  ConsoleDataSource,
} from "./ConsoleDataSource";
import type { ConsoleSnapshot } from "./ConsoleSnapshot";
import type {
  PowerTelemetry,
  ServerMessage,
} from "@space-journey/contracts";
import { MockConsoleDataSource } from "./MockConsoleDataSource";

type Listener = (snapshot: ConsoleSnapshot) => void;

export class WebSocketConsoleDataSource implements ConsoleDataSource {
  private mock: MockConsoleDataSource;
  private power: PowerTelemetry | null = null;
  private ws: WebSocket | null = null;
  private listeners: Listener[] = [];
  private mockUnsubscribe: (() => void) | null = null;

  constructor(private url: string, private systemIds: string[] = ["power"]) {
    this.mock = new MockConsoleDataSource();
  }

  async getSnapshot(): Promise<ConsoleSnapshot> {
    const snapshot = await this.mock.getSnapshot();
    return this.mergePower(snapshot);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);

    if (this.mockUnsubscribe === null) {
      this.mockUnsubscribe = this.mock.subscribe((snapshot) => {
        for (const l of this.listeners) {
          l(this.mergePower(snapshot));
        }
      });
    }

    if (this.ws === null) {
      this.openSocket();
    }

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
      if (this.listeners.length === 0) {
        this.mockUnsubscribe?.();
        this.mockUnsubscribe = null;
        this.closeSocket();
      }
    };
  }

  destroy(): void {
    this.mockUnsubscribe?.();
    this.mockUnsubscribe = null;
    this.closeSocket();
    this.listeners = [];
    this.mock.destroy?.();
  }

  private mergePower(snapshot: ConsoleSnapshot): ConsoleSnapshot {
    if (this.power === null) return snapshot;
    return { ...snapshot, power: this.power };
  }

  private openSocket(): void {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.ws?.send(
        JSON.stringify({ type: "SUBSCRIBE", systemIds: this.systemIds }),
      );
    };
    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };
    this.ws.onclose = () => {
      this.ws = null;
    };
    this.ws.onerror = () => {
      this.closeSocket();
    };
  }

  private handleMessage(raw: unknown): void {
    let message: ServerMessage;
    try {
      message = JSON.parse(String(raw)) as ServerMessage;
    } catch {
      return;
    }

    if (message.type === "SYSTEM_UPDATE" && message.systemId === "power") {
      this.power = message.snapshot as unknown as PowerTelemetry;

      for (const listener of this.listeners) {
        void this.mock.getSnapshot().then((snapshot) => {
          listener(this.mergePower(snapshot));
        });
      }
    }
  }

  private closeSocket(): void {
    this.ws?.close();
    this.ws = null;
  }
}