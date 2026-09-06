import type {
  PowerTelemetry,
  ShipSystem,
  SystemSnapshot,
  SystemStatus,
} from "@space-journey/contracts";

export type PowerSystemSnapshot = PowerTelemetry & { timestamp: number };

const TICK_MS = 1000;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class PowerSystem implements ShipSystem {
  readonly id = "power";
  private listeners: ((snapshot: SystemSnapshot) => void)[] = [];
  private interval: ReturnType<typeof setInterval> | null = null;
  private tick = 0;
  private latest: PowerSystemSnapshot = this.generate(this.tick);

  async start(): Promise<void> {
    if (this.interval !== null) return;
    this.interval = setInterval(() => {
      this.tick++;
      this.latest = this.generate(this.tick);
      for (const listener of this.listeners) {
        listener(this.latest);
      }
    }, TICK_MS);
  }

  async stop(): Promise<void> {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getSnapshot(): PowerSystemSnapshot {
    return this.latest;
  }

  subscribe(listener: (snapshot: SystemSnapshot) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private generate(t: number): PowerSystemSnapshot {
    return {
      timestamp: Date.now(),
      generatorA: Math.round(clamp(98 + Math.sin(t / 5) * 1.5, 0, 100)),
      generatorB: Math.round(clamp(97 + Math.sin(t / 7 + 1) * 1.5, 0, 100)),
      reserve: Math.round(Math.max(5, 11 - t * 0.02 + Math.sin(t / 10) * 0.5)),
      status: this.statusAt(t),
    };
  }

  private statusAt(t: number): SystemStatus {
    return t % 60 < 55 ? "nominal" : "degraded";
  }
}