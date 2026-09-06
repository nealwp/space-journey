---
id: 2026-09-06-ship-systems-architecture
type: decision
status: current
updated: 2026-09-06
links:
  - contracts
  - systems
  - server
  - console
  - data
---
Ship systems run as separate workspace packages hosted on a single shared server, in one monorepo.

## Context

Phase 1 was a pure frontend whose simulated state lived entirely in `MockConsoleDataSource`. The next step is to build the ship's actual internal systems. Requirements: a single repository, systems added one at a time, and all systems running on the same server for as long as possible.

## Decision

- **npm workspaces monorepo** — `packages/contracts`, `packages/systems/*`, `packages/server`, `packages/console`.
- **`@space-journey/contracts`** is the shared, dependency-free package holding telemetry types + `ShipSystem` interface + WebSocket message envelope.
- **One package per system** (`packages/systems/<name>`) implementing `ShipSystem`, so any system can later be promoted to its own process without touching the others.
- **`packages/server`** is transport-only: it registers systems, starts them, and broadcasts per-system snapshot slices over `ws` keyed by `systemId`.
- **Console stays a separate Vite app**; it connects to the server over WebSocket. This was a deliberate choice — the frontend is served separately from the systems server.
- **Power is the first system** — bounded percentage values, deterministic `sin` drift, a single branchable status enum, faithful port from the mock, clean 1:1 with `PowerDisplay.setData`.
- **Transport is `ws`**; dev boots server + console via `concurrently`.
- **Terminal stays mock** until systems prove out (no command routing yet).
- The console's `WebSocketConsoleDataSource` merges live server slices (power) over `MockConsoleDataSource` output for not-yet-simulated systems, so a missing server degrades gracefully.

## Why not the alternatives

- **Single flat npm package**: fewer boundaries, but harder to extract a system to its own process later — the requirement is to keep extraction cheap.
- **Systems as only shared modules, defer server**: delayed the "same server" guarantee and WebSocket wiring; introducing the server now makes the shared-server target explicit from the start.
- **Full server + all transports up front**: heavier scaffold than needed before any real system exists; increment per-system is cleaner.
- **Wire the terminal to the server now**: `TerminalService` routing to a Ship Computer is a separate concern; deferring keeps the system-phase change surface small.