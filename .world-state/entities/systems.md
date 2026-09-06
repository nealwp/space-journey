---
id: systems
type: entity
status: current
updated: 2026-09-06
owner_paths:
  - packages/systems/power/src/index.ts
links:
  - contracts
  - server
  - 2026-09-06-ship-systems-architecture
---
The ship's internal simulated systems — one workspace package per system, added one at a time.

## What this is

Each ship system lives in `packages/systems/<name>` as its own npm workspace package implementing `ShipSystem`:

- **id** — unique system id used as the wire key (e.g. "power")
- **start() / stop()** — lifecycle for the 1 Hz simulation tick
- **getSnapshot()** — the system's current slice (e.g. `PowerTelemetry & { timestamp }`)
- **subscribe(listener)** — push new slices; returns an unsubscribe fn

## Current state

**Power** (`packages/systems/power`) is the first and only system. It ports the deterministic simulation that previously lived in `MockConsoleDataSource`: `generatorA`/`generatorB` oscillate via `Math.sin`, `reserve` depletes slowly, and `status` dips nominal→degraded every 60 seconds. Values are clamped to [0,100] / floor 5.

## Gotchas / non-obvious constraints

- A system's snapshot must be assignable to `SystemSnapshot` (include `timestamp`).
- Keep each system self-contained — it must be promotable to its own process by giving it its own `index.ts` later.
- Adding a system = new `packages/systems/<name>` package + one entry in `packages/server/src/index.ts` + a subscribe/merge line in `WebSocketConsoleDataSource`. No other system changes.