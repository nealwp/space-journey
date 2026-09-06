---
id: server
type: entity
status: current
updated: 2026-09-06
owner_paths:
  - packages/server/src/index.ts
  - packages/server/src/registry.ts
  - packages/server/src/transport.ts
links:
  - contracts
  - systems
  - data
  - console
  - 2026-09-06-ship-systems-architecture
---
The single ship-systems server — hosts all registered systems and broadcasts their snapshot slices over WebSocket.

## What this is

`@space-journey/server` is the process that runs every ship system on one host for as long as possible:

- **index.ts** — Boots a `SystemRegistry`, registers systems, installs `SIGINT`/`SIGTERM` shutdown hooks.
- **registry.ts** — Holds systems by id, `start()`s them, fans their `subscribe()` emissions to listeners as `SYSTEM_UPDATE` messages, `stop()`s on teardown.
- **transport.ts** — `ws` `WebSocketServer` on port 8080. Handles `SUBSCRIBE` frames (sends initial snapshots), broadcasts `SYSTEM_UPDATE` to all connected clients, closes cleanly.

## Current state

Runs the power system on `ws://localhost:8080`. The console's `WebSocketConsoleDataSource` connects, subscribes to `power`, and merges live slices into its snapshot.

## Gotchas / non-obvious constraints

- The server is transport only — all simulation logic lives in `packages/systems/*`.
- Registry broadcasts to *all* clients regardless of subscription set in the current minimal phase (filters by subscription can be added when traffic matters).
- The server runs via `tsx` (`npm run dev -w @space-journey/server`); `types` are Node + `ws`.
- When a system is promoted to its own process, `registry.stop()` must still drain remaining systems.