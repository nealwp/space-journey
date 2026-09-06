import type { ShipSystem, SystemSnapshot, SystemUpdateMessage } from "@space-journey/contracts";

export type SystemListener = (message: SystemUpdateMessage) => void;

export class SystemRegistry {
  private systems = new Map<string, ShipSystem>();
  private unsubscribers = new Map<string, () => void>();
  private listeners = new Set<SystemListener>();

  register(system: ShipSystem): void {
    this.systems.set(system.id, system);
  }

  getSnapshot(id: string): SystemSnapshot | undefined {
    return this.systems.get(id)?.getSnapshot();
  }

  addListener(listener: SystemListener): void {
    this.listeners.add(listener);
  }

  async start(): Promise<void> {
    for (const [id, system] of this.systems) {
      await system.start();
      const unsubscribe = system.subscribe((snapshot) => {
        const message: SystemUpdateMessage = {
          type: "SYSTEM_UPDATE",
          systemId: id,
          snapshot,
        };
        for (const listener of this.listeners) {
          listener(message);
        }
      });
      this.unsubscribers.set(id, unsubscribe);
    }
  }

  async stop(): Promise<void> {
    for (const unsubscribe of this.unsubscribers.values()) {
      unsubscribe();
    }
    this.unsubscribers.clear();
    for (const system of this.systems.values()) {
      await system.stop();
    }
  }
}