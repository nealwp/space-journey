# Space Journey

A spacecraft game split across two concerns in a single monorepo:

- **Console** (`packages/console`) — a PixiJS v8 captain's console. The entire interface renders as a single PixiJS application — a late-1980s industrial spacecraft terminal with low-resolution / pixel-art presentation, gray utilitarian hardware framing, dark CRT-style displays, and sparse green/yellow/red status colors.
- **Ship systems** (`packages/server` + `packages/systems/*`) — the ship's internal simulated systems, all running on a single server. The frontend connects over WebSocket for live telemetry.

The only user interaction is the command terminal. All other panels are read-only instruments.

## Getting Started

```bash
npm install
npm run dev
```

This boots the systems server (`ws://localhost:8080`) and the Vite console (`http://localhost:3000`) via concurrently. The console connects to the server for live power telemetry; if the server is down it degrades gracefully to mock data.

## Commands

```bash
npm run dev          # Boot systems server + Vite console together
npm run dev -w @space-journey/console   # Vite console only
npm run dev -w @space-journey/server    # Systems server only
npm run build        # Production build of the console
npm run typecheck    # TypeScript type checking across all workspaces
```

## Architecture

Data flows strictly downward:

```
SHIP SYSTEMS SERVER       CONSOLE
systems/* ──WebSocket──▶  WebSocketConsoleDataSource
packages/server           ↓
                          UI MODEL / STORE (ConsoleSnapshot)
                          ↓
                          PIXIJS VIEWS (displays, terminal output)
```

Every display receives data through a typed `setData()` method. No panel owns simulated values. The terminal is the sole interactive element — all other panels are instruments.

### Key Interfaces

- **`ShipSystem`** (`@space-journey/contracts`) — `start()` / `stop()` / `getSnapshot()` / `subscribe()`. Each ship system implements this; the server registry treats them uniformly.
- **`ConsoleDataSource`** — `getSnapshot()` + `subscribe()`. The console uses `WebSocketConsoleDataSource`, which merges live server slices with mock slices for not-yet-simulated systems.
- **`TerminalService`** — `send(message) → Promise<string>`. Currently uses `MockTerminalService`.

## Project Structure

```
packages/
  contracts/     Shared, dependency-free types + transport protocol
  systems/*      One package per ship system (power first; added one at a time)
  server/        Single ship-systems server (WebSocket host + registry)
  console/       PixiJS captain's console (Vite app)
```

## Tech Stack

- **PixiJS v8** — WebGL rendering
- **TypeScript** — strict mode
- **Vite** — console dev server and bundler
- **Node.js + ws** — ship systems server
- **concurrently** — one command boots server + console
- **No external assets** — all visuals are procedural rectangles, lines, text, and circles

## Design Principles

- Fixed 1280×720 virtual resolution, scaled to fit viewport
- All colors and spacing from `ConsoleTheme` — no inline constants
- Monospaced system font — no external font files
- Disposable pattern for cleanup (timers, listeners, subscriptions)
- No clickable UI controls of any kind

## Phase Status

Phase 1 was a working instrumentation client with fake data. Current phase: real ship systems running on a shared server, added one at a time. Power is the first system.

See `PLAN.md` for the full design specification and `AGENTS.md` for agent context.