---
id: data
type: entity
status: current
updated: 2026-08-27
owner_paths:
  - src/console/data/ConsoleSnapshot.ts
  - src/console/data/ConsoleDataSource.ts
  - src/console/data/MockConsoleDataSource.ts
  - src/console/data/types.ts
links:
  - console
  - displays
  - core
---
Data contracts and state management — ConsoleSnapshot, ConsoleDataSource interface, MockConsoleDataSource, and shared types.

## What this is

The data subsystem defines the boundary between data sources and the UI:

- **ConsoleSnapshot** — Single aggregate state shape pushed from data sources to all displays. Contains navigation, power, propulsion, life support, power distribution, environment, alarm matrix, active alarms, logs, and mission telemetry.
- **ConsoleDataSource** — Interface with `getSnapshot()` (async) and `subscribe(listener)` (returns unsubscribe fn). Phase 1 uses MockConsoleDataSource; future phases will use WebSocketConsoleDataSource.
- **MockConsoleDataSource** — Deterministic mock with 1 Hz tick. Uses `Math.sin()` based value drift for slowly-varying telemetry. Provides `destroy()` to clean up interval.
- **types.ts** — All shared type definitions: sub-telemetry interfaces, IndicatorState, SystemStatus, AlarmEntry, LogEntry, AlarmMatrixData, AlarmMatrixRow, Point, MissionTelemetry.

## Current state

Step 9 complete. The data layer is fully wired:

- `ConsoleSnapshot` aggregates all telemetry into a single snapshot
- `ConsoleDataSource` interface provides `getSnapshot()` + `subscribe()` + optional `destroy()`
- `MockConsoleDataSource` generates deterministic snapshots at 1 Hz with slowly drifting values
- `CaptainConsole` accepts a `ConsoleDataSource` in its constructor, calls `start()` to subscribe
- `applySnapshot()` fans data to all displays via their `setData()` methods
- `AlarmEntry` and `LogEntry` types moved from display files to `types.ts` for centralization
- No display directly owns authoritative game-state values
- `main.ts` creates `MockConsoleDataSource`, passes it to `CaptainConsole`, cleans up on `beforeunload`

## Gotchas / non-obvious constraints

- MockConsoleDataSource imports Layout and ConsoleTheme to compute nav panel content dimensions for trajectory coordinates — acceptable for Phase 1 with fixed layout, but should be decoupled when layout becomes dynamic
- `subscribe()` starts the 1 Hz interval on first subscription, clears it when last listener unsubscribes
- Navigation trajectory points are generated relative to nav panel content dimensions — changing layout constants affects mock nav data
- Active alarms in the snapshot are separate from alarm matrix states — alarm matrix is per-indicator states, active alarms are text entries for the alarm panel
- `ConsoleSnapshot.alarmMatrix` feeds AlarmMatrix, `ConsoleSnapshot.activeAlarms` feeds AlarmPanel — these are distinct data flows
- `ConsoleDataSource.destroy()` is optional — not all implementations may need it
