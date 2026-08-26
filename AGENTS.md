# AGENTS.md

## Project Overview

Space Journey is a PixiJS v8 captain's console frontend for a spacecraft game. The entire interface renders as a single PixiJS application — a late-1980s industrial spacecraft terminal with low-resolution / pixel-art presentation, gray utilitarian hardware framing, dark CRT-style displays, and sparse green/yellow/red status colors.

The only user interaction mechanism is the command terminal. All other panels are read-only instruments. The initial implementation is Phase 1 of a larger game — this phase establishes a clean, functional frontend foundation with mock data, ready to have a real spacecraft simulation plugged in later.

Reference: `PLAN.md` contains the full design specification.

## Commands

```bash
npm run dev          # Start Vite dev server on port 3000
npm run build        # Production build via Vite
npm run typecheck    # TypeScript type checking (tsc --noEmit)
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
- **Vite** — dev server and bundler, ESM (`"type": "module"`)
- **No external assets** — all visuals are procedural rectangles, lines, text, and circles
- **No frameworks** — no React, no DOM UI (except a hidden textarea for terminal input)

## Project Structure

```
src/
  main.ts                             Entry point — bootstraps ConsoleApplication + CaptainConsole

  console/
    CaptainConsole.ts                 Top-level orchestrator — owns root container, draws chassis + panels

    core/
      ConsoleApplication.ts           PixiJS Application wrapper — init, viewport scaling, resize handling
      ConsoleLayout.ts                Fixed 1280×720 layout — defines PanelRect positions for all regions
      ConsoleTheme.ts                 Single source of truth — colors, spacing, borders, font sizes

    components/                       Reusable visual primitives (Phase 1 Step 2+)
      Panel.ts                        Generic panel frame (chassis → bezel → screen → title)
      PanelHeader.ts                  Panel title text
      TelemetryText.ts               Label + value text, supports setValue() / setColor()
      StatusIndicator.ts             Tiny square light — off / nominal / warning / alarm
      BarMeter.ts                    Coarse block-based fill meter

    displays/                         Specific instrument displays (Phase 1 Steps 4–8+)
      ExteriorView.ts                Slow-moving starfield camera feed
      NavigationMap.ts               Orbital/trajectory plot with ship/destination markers
      AlarmLog.ts                    Severity-colored event log
      PowerDisplay.ts                Generator A/B, reserve, status
      PropulsionDisplay.ts           Thrust, fuel, drive status
      LifeSupportDisplay.ts          O2, CO2, temp, humidity
      PowerDistributionDisplay.ts    Power grid status
      GravityEnvironmentDisplay.ts   G-force, radiation, temp
      AlarmMatrix.ts                 Industrial annunciator panel (tiny square lights)
      SystemSummary.ts               Compact bottom status strip

    terminal/                         Command terminal — the primary interaction
      CommandTerminal.ts             Rendering only — displays lines and cursor
      TerminalBuffer.ts              Bounded history, auto-scroll, truncation
      TerminalInputController.ts     Hidden DOM textarea captures keyboard input
      TerminalService.ts             Interface: send(message) → Promise<string>
      MockTerminalService.ts         Returns fixed response for all commands

    data/                             Data contracts and state management
      ConsoleState.ts                Runtime state container
      ConsoleDataSource.ts           Interface: getSnapshot(), subscribe()
      MockConsoleDataSource.ts       Deterministic mock telemetry data
      types.ts                       All shared types and interfaces

    rendering/                        PixiJS drawing helpers
      PixelText.ts                   Text rendering helper
      crt.ts                         Scanline / CRT effects
      primitives.ts                  Reusable drawing primitives

    utils/                            Pure functions
      formatting.ts                  formatRangeKm, formatPercent, formatTemperature, etc.
      math.ts                        Math helpers
```

## Architecture Rules

### Data flow is strictly downward

```
DATA SOURCE (mock, WebSocket, HTTP, replay)
    ↓
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

### Disposable pattern

Every component that owns listeners or timers implements `Disposable`:

```ts
interface Disposable { destroy(): void; }
```

The root console cleans up timers, DOM listeners, resize listeners, data subscriptions, and Pixi containers on teardown.

## Data Contracts

### ConsoleSnapshot

The single state shape pushed from data sources to all displays:

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
  subscribe?(listener: (snapshot: ConsoleSnapshot) => void): () => void;
}
```

Phase 1 uses `MockConsoleDataSource`. Future phases will use `WebSocketConsoleDataSource` and potentially `ReplayConsoleDataSource`.

### TerminalService

```ts
interface TerminalService {
  send(message: string): Promise<string>;
}
```

Phase 1 uses `MockTerminalService` which returns `"apologies, I am unable to connect to the ships systems at this time."` for every valid message. No command parsing, no fake AI.

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

## Theme & Layout

### ConsoleTheme (`src/console/core/ConsoleTheme.ts`)

Single source of truth for all visual constants:

- `colors` — page, chassis, bezel, screen, text, green/yellow/red status, grid
- `spacing` — xs(4), sm(8), md(12), lg(18)
- `border` — outer(3), inner(1)
- `font` — family(monospace), labelSize(11), valueSize(12), terminalSize(13), titleSize(10)

Import and reference through the object. Never hardcode hex values or pixel sizes.

### ConsoleLayout (`src/console/core/ConsoleLayout.ts`)

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
4. **TerminalService** — Interface for command processing. `send(message) → Promise<string>`. Phase 1 uses MockTerminalService.

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
| Telemetry snapshot | 1 Hz |
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

## Non-Goals (Phase 1)

Do **not** implement:

- Actual spacecraft simulation or orbital physics
- Server connectivity, WebSockets, or LLM integration
- Ship AI, real alarms, audio, settings, menus
- Inventory, player accounts, save games
- Tooltips, tutorials, hover states
- Clickable UI controls of any kind
- Mobile layout or responsive panel rearrangement
- Custom shaders, CRT barrel distortion, bloom, chromatic aberration
- Elaborate sprite artwork or 3D rendering
- External font files (use monospaced system font in Phase 1)

## Future Phase Notes

Do not implement now, but ensure today's interfaces make these transitions straightforward:

**Data source swap**: `MockConsoleDataSource` → `WebSocketConsoleDataSource` receiving `ConsoleSnapshot` over WebSocket from the game server. Displays must remain unaware of this change.

**Terminal backend**: `TerminalService.send()` will eventually call `POST /computer/message` and receive responses from a Ship Computer Agent. The mock implementation returns a fixed string.

**The intended Phase 1 result is not merely a mockup.** It should be a working instrumentation client with fake instrumentation data, ready to have the real spacecraft simulation plugged into it later.
