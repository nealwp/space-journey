---
id: data
type: entity
status: current
updated: 2026-09-06
owner_paths:
  - packages/console/src/console/data/ConsoleSnapshot.ts
  - packages/console/src/console/data/ConsoleDataSource.ts
  - packages/console/src/console/data/MockConsoleDataSource.ts
  - packages/console/src/console/data/WebSocketConsoleDataSource.ts
links:
  - console
  - displays
  - core
  - contracts
  - server
  - 2026-09-06-ship-systems-architecture
---
Data contracts and state management — ConsoleSnapshot assembly, ConsoleDataSource interface, MockConsoleDataSource, WebSocketConsoleDataSource. Shared types live in @space-journey/contracts.

## What this is

The data subsystem defines the boundary between data sources and the UI:

- **ConsoleSnapshot** — Single aggregate state shape pushed from data sources to all displays. Contains navigation, power, propulsion, life support, power distribution, environment, alarm matrix, active alarms, logs, and mission telemetry.
- **ConsoleDataSource** — Interface with `getSnapshot()` (async) and `subscribe(listener)` (returns unsubscribe fn).
- **MockConsoleDataSource** — Deterministic mock with 1 Hz tick. Uses `Math.sin()` based value drift for slowly-varying telemetry. Provides `destroy()` to clean up interval. Still produces the full snapshot (source of truth for all systems not yet simulated on the server).
- **WebSocketConsoleDataSource** — Live source (used by `main.ts`). Connects to the ship systems server, subscribes to `power`, and merges live slices into the mock's snapshot so a missing server degrades gracefully to full mock data.
- Shared telemetry types and the `SystemSnapshot` base now live in `@space-journey/contracts` (`packages/contracts/src/snapshot.ts`) — the console no longer has a local `types.ts`.

## Current state

Phase 2 underway. The monorepo is wired:

- Shared types moved to `@space-journey/contracts`; console imports them directly
- `WebSocketConsoleDataSource` merges the live `power` slice into mock snapshots for not-yet-simulated systems
- `main.ts` instantiates `WebSocketConsoleDataSource` with `ws://<host>:8080` (overridable via `VITE_SYSTEMS_WS_URL`)
- `CaptainConsole` / all displays unchanged — still consume `ConsoleSnapshot` via `setData()`

## Gotchas / non-obvious constraints

- MockConsoleDataSource imports Layout and ConsoleTheme to compute nav panel content dimensions for trajectory coordinates — acceptable for fixed layout, should be decoupled when layout becomes dynamic
- `subscribe()` starts the 1 Hz interval on first subscription, clears it when last listener unsubscribes
- Navigation trajectory points are generated relative to nav panel content dimensions — changing layout constants affects mock nav data
- Active alarms in the snapshot are separate from alarm matrix states — alarm matrix is per-indicator states, active alarms are text entries for the alarm panel
- `WebSocketConsoleDataSource` casts the wire-typed `SystemSnapshot` to `PowerTelemetry` for the `power` slice — narrow by `systemId`, not by shape
- `ConsoleSnapshot` aggregate shape stays console-side; per-system slices are the wire contract