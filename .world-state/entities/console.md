---
id: console
type: entity
status: current
updated: 2026-08-26
owner_paths:
  - src/console/CaptainConsole.ts
  - src/main.ts
links:
  - core
  - components
  - terminal
  - displays
  - planning
---
Top-level orchestrator that owns the root container, draws the chassis, and composes all panel placeholders.

## What this is

The console subsystem contains:

- **CaptainConsole** — Extends `Container`, implements `Disposable`. Draws the gray industrial chassis (outer + inner rounded rectangles) and composes all 11 panel regions as labeled placeholders using the layout from `ConsoleLayout`. Each panel gets a bezel border, dark screen background, and title label.
- **main.ts** — Bootstrap entry point. Creates `ConsoleApplication`, initializes it, creates `CaptainConsole`, adds it to the root container, and registers cleanup on `beforeunload`.

## Current state

Step 5 complete. CaptainConsole renders:
- Gray chassis with inner dark border
- 11 labeled panel placeholders using `Panel` component
- Command terminal in mainTerminal panel with greeting, input, cursor, and submission flow
- Exterior view in exteriorView panel — 20 drifting stars with labels
- Navigation map in navMap panel — trajectory plot with ship/destination markers
- All panels positioned by ConsoleLayout
- Proper cleanup via `destroy()` method

## Gotchas / non-obvious constraints

- CaptainConsole uses a `panelLabels` map to convert layout keys to abbreviated display labels — add new panels here
- CaptainConsole owns the terminal submission flow — coordinates TerminalBuffer, TerminalInputController, MockTerminalService
- CaptainConsole.update(dt) must be called each frame for cursor blinking and star animation — wired via ticker in main.ts
- NavigationMap.setData() called every 10 seconds via setInterval in CaptainConsole — interval must be cleared in destroy()
- The `destroy()` method cleans up TerminalInputController, intervals, and all Panel instances
- main.ts registers `beforeunload` handler — any new resources must also be cleaned up there
