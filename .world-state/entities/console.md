---
id: console
type: entity
status: current
updated: 2026-08-27
owner_paths:
  - src/console/CaptainConsole.ts
  - src/main.ts
links:
  - core
  - components
  - terminal
  - displays
  - data
  - planning
---
Top-level orchestrator that owns the root container, draws the chassis, and composes all panel placeholders.

## What this is

The console subsystem contains:

- **CaptainConsole** — Extends `Container`, implements `Disposable`. Accepts a `ConsoleDataSource` in its constructor. Draws the gray industrial chassis (outer + inner rounded rectangles) and composes all 12 panel regions as labeled placeholders using the layout from `ConsoleLayout`. Each panel gets a bezel border, dark screen background, and title label.
- **main.ts** — Bootstrap entry point. Creates `ConsoleApplication`, initializes it, creates `MockConsoleDataSource` and `CaptainConsole`, calls `start()` to subscribe to data, adds it to the root container, and registers cleanup on `beforeunload`.

## Current state

Step 11 complete. CaptainConsole renders:
- Gray chassis with inner dark border
- 12 labeled panel placeholders using `Panel` component
- Command terminal in mainTerminal panel with greeting, input, cursor, and submission flow
- Exterior view in exteriorView panel — 20 drifting stars (self-contained, no data source)
- Navigation map, alarm panel, log panel, all lower telemetry displays, alarm matrix, and system summary — all receive data via `applySnapshot()` fan-out from ConsoleDataSource
- `start()` method calls `getSnapshot()` then `subscribe()` for 1 Hz push updates
- `applySnapshot()` fans ConsoleSnapshot data to all displays via their `setData()` methods
- No hardcoded initial data in init methods — components are created but data comes from the data source
- Proper cleanup via `destroy()` method — unsubscribes from data source, destroys panels, cleans up input controller
- Uses `ConsoleTheme.contentPad` instead of hardcoded `border.inner + 2`

## Gotchas / non-obvious constraints

- CaptainConsole uses a `panelLabels` map to convert layout keys to abbreviated display labels — add new panels here
- CaptainConsole owns the terminal submission flow — coordinates TerminalBuffer, TerminalInputController, MockTerminalService
- CaptainConsole.update(dt) must be called each frame for cursor blinking, star animation, and alarm blink — wired via ticker in main.ts
- All displays receive data via `applySnapshot()` — never set data directly in init methods
- AlarmMatrix.update(dt) must be called each frame for status indicator blinking
- The `destroy()` method cleans up data source subscription, TerminalInputController, and all Panel instances
- main.ts registers `beforeunload` handler — any new resources must also be cleaned up there
- `ConsoleSnapshot.alarmMatrix` and `ConsoleSnapshot.activeAlarms` are separate data flows to different panels
