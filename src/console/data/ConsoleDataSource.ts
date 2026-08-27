import type { ConsoleSnapshot } from "./ConsoleSnapshot";

export interface ConsoleDataSource {
  getSnapshot(): Promise<ConsoleSnapshot>;
  subscribe(listener: (snapshot: ConsoleSnapshot) => void): () => void;
  destroy?(): void;
}
