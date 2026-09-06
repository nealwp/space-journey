import type { SystemSnapshot } from "./snapshot";

export interface ShipSystem {
  readonly id: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  getSnapshot(): SystemSnapshot;
  subscribe(listener: (snapshot: SystemSnapshot) => void): () => void;
}