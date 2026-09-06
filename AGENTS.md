# AGENTS.md

## Project Overview

Space Journey is a spacecraft game split across two concerns in a single monorepo:

- **@space-journey/console** — a PixiJS v8 captain's console frontend. The entire interface renders as a single PixiJS application — a late-1980s industrial spacecraft terminal with low-resolution / pixel-art presentation, gray utilitarian hardware framing, dark CRT-style displays, and sparse green/yellow/red status colors.
- **@space-journey/server + @space-journey/systems/\*** — the ship's internal simulated systems, all running on a single server for as long as possible. Each system is a separate workspace package so one can later be promoted to its own process without touching the others.

The only user interaction mechanism is the command terminal. All other panels are read-only instruments. The frontend is served separately from the systems server; it connects to the server over WebSocket for live telemetry.

Reference: `PLAN.md` contains the full design specification.

## Commands

```bash
npm run dev          # Boot the systems server (ws://localhost:8080) AND the Vite console (port 3000) via concurrently
npm run dev -w @space-journey/console   # Vite console only
npm run dev -w @space-journey/server    # Systems server only
npm run build        # Production build of the console via Vite
npm run typecheck    # TypeScript type checking across all workspaces (tsc --noEmit)
```

**Always run `npm run typecheck` before committing.** There is no test suite.

## Working with .world-state/

This repo tracks durable project context in `.world-state/`, separate
from the code and from chat memory. Rules:

1. Before starting any non-trivial task, read `.world-state/INDEX.md`.
   It lists every entity, decision, and task file with a one-line
   summary. Follow links only for files relevant to your task.
2. Do not read every file in `.world-state/` up front. Load what the
   task needs, use it, and stop carrying it once the task is done.
3. If you change code under a path listed in some entity's
   `owner_paths`, update that entity file in the same change (its
   `updated` date and any facts that changed).
4. Never edit a `decision` file after creation. If a decision changes,
   write a new decision file and link back to the old one with
   `status: superseded`.
5. Run `wstate lint` before finishing. Fix broken links and
   orphaned files it reports.
6. If you create a new subsystem or concept worth remembering, run
   `wstate new entity <id>` (or `decision`/`task`) rather
   than inventing a new file by hand, so frontmatter stays consistent.

## Tech Stack

- **PixiJS v8.20.1** — rendering engine (WebGL, async `Application.init()`)
- **TypeScript** — strict mode, ES2020 target, ESNext modules
- **Vite** — console dev server and bundler, ESM (`"type": "module"`)
- **Node.js + `ws`** — ship systems server; systems emit snapshot slices over WebSocket
- **`tsx`** — runs the server's TypeScript directly (`npm run dev -w @space-journey/server`)
- **`concurrently`** — one root `npm run dev` boots server + console
- **npm workspaces** — one package per concern; `@space-journey/contracts` is the shared, dependency-free type/transport boundary
- **No external assets** — all visuals are procedural rectangles, lines, text, and circles
- **No frameworks** — no React, no DOM UI (except a hidden textarea for terminal input)

## Project Structure

```
packages/
  contracts/                        Shared, dependency-free types + transport protocol
    src/
      index.ts                      Barrel re-exports
      status.ts                     SystemStatus, IndicatorState
      snapshot.ts                   Telemetry slice types (PowerTelemetry, etc.) + SystemSnapshot
      system.ts                     ShipSystem interface
      messages.ts                   WebSocket message envelope (SUBSCRIBE / SYSTEM_UPDATE)

  systems/
    power/                          Ship power system (first system; others added one at a time)
      src/index.ts                  PowerSystem implements ShipSystem

  server/                           The single ship-systems server
    src/
      index.ts                      Boots host, registers systems, installs shutdown hooks
      registry.ts                   Registers/start/stops systems, fans updates to listeners
      transport.ts                  WebSocketServer, subscription handling, broadcast

  console/                          PixiJS captain's console (Vite app)
    index.html
    vite.config.ts
    src/
      main.ts                       Entry point — bootstraps ConsoleApplication + CaptainConsole
      console/
        CaptainConsole.ts           Top-level orchestrator — owns root container, draws chassis + panels
        core/                       ConsoleApplication, ConsoleLayout, ConsoleTheme
        components/                 Panel, TelemetryText, StatusIndicator, BarMeter
        displays/                   ExteriorView, NavigationMap, PowerDisplay, etc.
        terminal/                   CommandTerminal, TerminalBuffer, TerminalInputController, TerminalService
        data/                       ConsoleDataSource interface, snapshot assembly
        rendering/                  PixiJS drawing helpers
        utils/                      Formatting and status utilities
```

## Architecture Rules

### Data flow is strictly downward

```
SHIP SYSTEMS SERVER                  CONSOLE
packages/systems/*  ──WebSocket──▶  WebSocketConsoleDataSource
packages/server                      ↓
                                   UI MODEL / STORE (ConsoleSnapshot)
                                    ↓
                                   PIXIJS VIEWS (displays, terminal output)
```

Never allow rendering code to mutate ship state. PixiJS views are consumers, not producers of game data.

### Every display is a view of external state

No panel internally owns simulated values. Every display receives data through a typed `setData()` method:

```ts
// Good
interface PowerTelemetry { generatorA: number; generatorB: number; reserve: number; status: SystemStatus; }
class PowerPanel { setData(data: PowerTelemetry): void; }

// Bad
class PowerPanel { power = 98; }
```

### Only the terminal is interactive

No buttons, tabs, dropdowns, clickable headers, switches, sliders, hover states, pointer cursors, or touch targets. All diagnostic panels are instruments — they display information, they do not respond to clicking.

### Every ship system is a `ShipSystem`

```ts
interface ShipSystem {
  readonly id: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  getSnapshot(): SystemSnapshot;
  subscribe(listener: (snapshot: SystemSnapshot) => void): () => void;
}
```

The server's registry treats all systems uniformly. Adding a system = a new `packages/systems/<name>` package plus one entry in `packages/server/src/index.ts`.

### Disposable pattern

Every component that owns listeners or timers implements `Disposable`:

```ts
interface Disposable { destroy(): void; }
```

The root console cleans up timers, DOM listeners, resize listeners, data subscriptions, and Pixi containers on teardown. The server stops all registered systems on SIGINT/SIGTERM.

## Data Contracts

### ConsoleSnapshot (console-side assembly)

The console's `WebSocketConsoleDataSource` assembles per-system server slices (live if connected, otherwise mock) into the single state shape pushed to all displays:

```ts
interface ConsoleSnapshot {
  timestamp: number;
  navigation: NavigationDisplayData;
  power: PowerTelemetry;
  propulsion: PropulsionTelemetry;
  lifeSupport: LifeSupportTelemetry;
  powerDistribution: PowerDistributionTelemetry;
  environment: EnvironmentTelemetry;
  alarms: AlarmMatrixData;
  logs: ShipLogEntry[];
  mission: MissionTelemetry;
}
```

### ConsoleDataSource

```ts
interface ConsoleDataSource {
  getSnapshot(): Promise<ConsoleSnapshot>;
  subscribe(listener: (snapshot: ConsoleSnapshot) => void): () => void;
}
```

`WebSocketConsoleDataSource` is the live source (used by `main.ts`). It merges the live `power` slice from the server into the mock's snapshot for all not-yet-simulated systems, so a missing server degrades gracefully to full mock data.

### ShipSystem / transport

Per-system snapshot slices travel over WebSocket as:

```ts
interface SystemUpdateMessage {
  type: "SYSTEM_UPDATE";
  systemId: string;                    // e.g. "power"
  snapshot: SystemSnapshot;            // timestamped telemetry slice
}
interface SubscribeMessage { type: "SUBSCRIBE"; systemIds: string[]; }
```

### TerminalService

```ts
interface TerminalService {
  send(message: string): Promise<string>;
}
```

Currently uses `MockTerminalService` which returns `"apologies, I am unable to connect to the ships systems at this time."` for every valid message. No command parsing, no fake AI, no server routing yet.

### SystemStatus

```ts
type SystemStatus = "nominal" | "degraded" | "warning" | "critical" | "offline";
```

## Code Conventions

- **No comments** in code unless explicitly requested
- **Strict TypeScript** — no `any`, no `Record<string, any>`, strong typing on all interfaces
- **`import type`** for type-only imports: `import type { Disposable } from "./ConsoleApplication"`
- **PixiJS v8 chained Graphics API**: `new Graphics().rect(x, y, w, h).fill(color)`
- **No external PNG/sprite assets** — everything is procedural rectangles, lines, text, circles, tiny filled squares
- **Pixel-snap coordinates**: `x = Math.round(x)` for crisp rendering
- **All colors and spacing from `ConsoleTheme`** — no inline hex literals scattered through components
- **Classes extend `Container`** for composite components, implement `Disposable` if they own resources
- **Shared types live in `@space-journey/contracts`** — never re-declare telemetry shapes locally

## Theme & Layout

### ConsoleTheme (`packages/console/src/console/core/ConsoleTheme.ts`)

Single source of truth for all visual constants:

- `colors` — page, chassis, bezel, screen, text, green/yellow/red status, grid
- `spacing` — xs(4), sm(8), md(12), lg(18)
- `border` — outer(3), inner(1)
- `font` — family(monospace), labelSize(11), valueSize(12), terminalSize(13), titleSize(10)

Import and reference through the object. Never hardcode hex values or pixel sizes.

### ConsoleLayout (`packages/console/src/console/core/ConsoleLayout.ts`)

Fixed 1280×720 virtual resolution. The application scales this to fit the browser viewport while maintaining aspect ratio. Layout defines `PanelRect` positions for all 11 panel regions:

- **Left column**: exteriorView, navMap (stacked, 200px wide)
- **Center column**: mainTerminal (dominant), powerSys, propulsionSys, lifeSupport, powerDist, gravEnv (lower 2×3 grid)
- **Right column**: alarmLog, alarmMatrix
- **Bottom row**: systemSummary (full width)

## Component Patterns

### Panel

Reusable frame drawn from layered rectangles:

```ts
interface PanelOptions { width: number; height: number; title?: string; }
class Panel extends Container {
  readonly content: Container;
  constructor(options: PanelOptions);
  resize(width: number, height: number): void;
}
```

Draws: outer chassis rect → dark border → inner bezel rect → screen area → title text. Do not create nine slightly different panel implementations.

### TelemetryText

Label + value pair for instrument readouts:

```ts
interface TelemetryTextOptions { label?: string; value?: string; color?: TelemetryColor; }
class TelemetryText extends Container {
  setValue(value: string): void;
  setColor(color: TelemetryColor): void;
}
```

### StatusIndicator

Tiny square light:

```ts
type IndicatorState = "off" | "nominal" | "warning" | "alarm";
```

May stay dark/green/yellow/red or blink. Must not appear clickable.

### BarMeter

Coarse block-based fill for power/load displays:

```ts
class BarMeter extends Container { setValue(value: number): void; } // 0.0 to 1.0
```

Renders as discrete blocks (e.g., `████████░░`), not smooth progress bars.

## Terminal Architecture

The terminal is the single most important component. Responsibilities are strictly separated:

1. **CommandTerminal** — Rendering only. Displays conversation history and cursor. Does not interpret commands.
2. **TerminalBuffer** — Manages bounded line history (~50–100 lines), text wrapping, auto-scroll to newest content, truncation of old entries.
3. **TerminalInputController** — Hidden DOM `<textarea>` captures keyboard input (for reliable IME, paste, mobile keyboard support). PixiJS terminal renders the text visually; the DOM input exists only to capture keystrokes.
4. **TerminalService** — Interface for command processing. `send(message) → Promise<string>`. Currently uses MockTerminalService.

### Submission flow

```
1. Capture current input
2. Ignore empty/whitespace-only input
3. Append captain line to terminal
4. Clear current input
5. Call TerminalService.send()
6. Await response
7. Append computer response
8. Maintain terminal focus
```

### Cursor

Simple blinking underscore, toggled every ~500ms:

```ts
cursor.visible = Math.floor(elapsed / 500) % 2 === 0;
```

## Update Frequencies

Different data types update at different rates. Do not tie everything to the Pixi ticker:

| Element | Rate |
|---------|------|
| PixiJS rendering | 60 fps |
| Starfield drift | every frame |
| Terminal cursor blink | ~500 ms |
| Clock / countdown | 1 Hz |
| Telemetry snapshot | 1 Hz (server systems tick at 1 Hz) |
| Alarm lights | 1 Hz or event-driven |
| Navigation numeric data | 1 Hz |
| Navigation plot redraw | 10 seconds |
| Ship logs | event-driven |

## Formatting Utilities

Number formatting lives outside display classes in `utils/formatting.ts`:

```ts
formatRangeKm(2_426_812);   // "2.43M KM"
formatPercent(0.98);         // "98%"
formatTemperature(22.4);     // "22.4C"
formatDuration(3661);        // "01:01:01"
formatVelocity(12400);       // "12.4K M/S"
```

All displays use these helpers for consistent formatting.

## Non-Goals (current phase)

Do **not** implement:

- Orbital physics or a full mission model in the simulation
- Terminal routing to the ship computer / LLM integration / fake AI
- Real alarms, audio, settings, menus
- Inventory, player accounts, save games
- Tooltips, tutorials, hover states
- Clickable UI controls of any kind
- Mobile layout or responsive panel rearrangement
- Custom shaders, CRT barrel distortion, bloom, chromatic aberration
- Elaborate sprite artwork or 3D rendering
- External font files (use monospaced system font in this phase)

## Future Phase Notes

Do not implement now, but ensure today's interfaces make these transitions straightforward:

**Adding a system**: add `packages/systems/<name>` implementing `ShipSystem`, register it in `packages/server/src/index.ts`, and extend `WebSocketConsoleDataSource` to subscribe to its `systemId` and merge its slice into `ConsoleSnapshot`. Other systems and the displays remain untouched.

**Splitting a system to its own process**: each system is an independent workspace package with `start()/stop()`. When one outgrows a shared process, give it its own `index.ts` and forward its `ShipSystem` updates over the network — the contracts and message envelope already match.

**Terminal backend**: `TerminalService.send()` will eventually call `POST /computer/message` and receive responses from a Ship Computer Agent on the same server. The mock implementation returns a fixed string.

**The intended result is not merely a mockup.** It should be a working instrumentation client with fake instrumentation data, ready to have the real spacecraft simulation plugged into it later.