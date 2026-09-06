---
id: contracts
type: entity
status: current
updated: 2026-09-06
owner_paths:
  - packages/contracts/src/status.ts
  - packages/contracts/src/snapshot.ts
  - packages/contracts/src/system.ts
  - packages/contracts/src/messages.ts
  - packages/contracts/src/index.ts
links:
  - systems
  - server
  - console
  - 2026-09-06-ship-systems-architecture
  - data
---
Shared, dependency-free type boundary and transport protocol between the console and the ship systems server.

## What this is

`@space-journey/contracts` is the single shared, dependency-free package consumed by both the systems server and the console:

- **status.ts** — `SystemStatus` ("nominal" | "degraded" | "warning" | "critical" | "offline"), `IndicatorState`.
- **snapshot.ts** — `SystemSnapshot` (base, timestamped), `PowerTelemetry`, `PropulsionTelemetry`, `LifeSupportTelemetry`, `PowerDistributionTelemetry`, `EnvironmentTelemetry`, `NavigationDisplayData`, `AlarmMatrixData`, `MissionTelemetry`, `AlarmEntry`, `LogEntry`, `Point`.
- **system.ts** — `ShipSystem` interface: `id`, `start()`, `stop()`, `getSnapshot()`, `subscribe(listener)`.
- **messages.ts** — WebSocket envelope: `SUBSCRIBE` (client) and `SYSTEM_UPDATE` (server, `{ type, systemId, snapshot }`).

## Current state

Power is the first system; contracts already carry the type shapes for every plan display (propulsion, life support, environment, etc.) so later systems need no contract changes. The console and server both compile against this package — never re-declare telemetry shapes locally.

## Gotchas / non-obvious constraints

- `SystemSnapshot` is the wire base; a system emits a *specific* slice (e.g. `PowerTelemetry & { timestamp }`) that is structurally assignable to it. Consumers narrow the slice by `systemId`, not by shape.
- The console's display types (`PowerTelemetry`, etc.) intentionally have **no** `timestamp` — timestamps live on the wire `SystemSnapshot`, not in display data.
- Keep `contracts` dependency-free (no runtime deps) so both browser and Node can import it without drama.