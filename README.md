# Space Journey

A PixiJS v8 captain's console for a spacecraft game. The entire interface renders as a single PixiJS application — a late-1980s industrial spacecraft terminal with low-resolution / pixel-art presentation, gray utilitarian hardware framing, dark CRT-style displays, and sparse green/yellow/red status colors.

The only user interaction is the command terminal. All other panels are read-only instruments.

## Getting Started

```bash
npm install
npm run dev
```

Opens on `http://localhost:3000`.

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run typecheck    # TypeScript type checking
```

## Architecture

Data flows strictly downward:

```
DATA SOURCE (mock, WebSocket, HTTP, replay)
    ↓
UI MODEL / STORE (ConsoleSnapshot)
    ↓
PIXIJS VIEWS (displays, terminal output)
```

Every display receives data through a typed `setData()` method. No panel owns simulated values. The terminal is the sole interactive element — all other panels are instruments.

### Key Interfaces

- **`ConsoleDataSource`** — `getSnapshot()` + `subscribe()`. Phase 1 uses `MockConsoleDataSource`.
- **`TerminalService`** — `send(message) → Promise<string>`. Phase 1 uses `MockTerminalService`.
- **`ConsoleSnapshot`** — Single aggregate state shape pushed to all displays.

## Project Structure

```
src/
  main.ts                          Entry point
  console/
    CaptainConsole.ts              Top-level orchestrator
    core/                          Application, layout, theme
    components/                    Reusable primitives (Panel, TelemetryText, StatusIndicator, BarMeter)
    displays/                      Instrument panels (11 displays)
    terminal/                      Command terminal (rendering, input, buffer, service)
    data/                          State contracts and mock data source
    rendering/                     PixiJS drawing helpers
    utils/                         Formatting and status utilities
```

## Tech Stack

- **PixiJS v8** — WebGL rendering
- **TypeScript** — strict mode
- **Vite** — dev server and bundler
- **No external assets** — all visuals are procedural rectangles, lines, text, and circles

## Design Principles

- Fixed 1280×720 virtual resolution, scaled to fit viewport
- All colors and spacing from `ConsoleTheme` — no inline constants
- Monospaced system font — no external font files
- Disposable pattern for cleanup (timers, listeners, subscriptions)
- No clickable UI controls of any kind

## Phase Status

Phase 1 is complete — a working instrumentation client with fake data, ready to have a real spacecraft simulation plugged in.

See `PLAN.md` for the full design specification and `AGENTS.md` for agent context.
