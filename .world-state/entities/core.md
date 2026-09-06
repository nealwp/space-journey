---
id: core
type: entity
status: current
updated: 2026-08-27
owner_paths:
  - src/console/core/ConsoleApplication.ts
  - src/console/core/ConsoleLayout.ts
  - src/console/core/ConsoleTheme.ts
links:
  - planning
  - 2026-08-26-project-init
---
Foundational layer: PixiJS v8 application wrapper, fixed 1280×720 layout, and shared theme constants.

## What this is

The core subsystem provides the three foundational modules that all other console components depend on:

- **ConsoleApplication** — Wraps PixiJS v8 `Application` with async initialization, viewport scaling that maintains aspect ratio, and resize handling. Implements `Disposable` for cleanup.
- **ConsoleLayout** — Defines the fixed 1280×720 virtual resolution and computes `PanelRect` positions for all 12 panel regions (left column, center column, right column, bottom row).
- **ConsoleTheme** — Single source of truth for all visual constants: colors, spacing, borders, and font sizes. No inline hex literals or pixel sizes allowed elsewhere.

## Current state

Step 11 complete. All three modules are implemented and working:
- PixiJS v8 async `Application.init()` with `resizeTo: window`
- Viewport scaling with `Math.min(vw/1280, vh/720)` and pixel-snap centering
- 12 panel regions positioned in a three-column grid (alarmLog split into alarm + log)
- Theme colors matching PLAN.md specification
- ConsoleTheme now includes `font.letterSpacing`, `contentPad`, `blinkIntervalMs`, `indicatorSize`

## Gotchas / non-obvious constraints

- ConsoleTheme exports `TelemetryColor` type for status colors — use this instead of raw hex values
- ConsoleLayout computes positions from constants (CHASSIS_PAD=14, PANEL_GAP=6) — changing these affects all panel positions
- ConsoleApplication uses `Math.round()` for pixel-snap centering — don't remove this or text will blur
- The `Disposable` interface in ConsoleApplication.ts must be implemented by any component that owns listeners or timers
- `contentPad` (4px) is the standard inner padding for panel content areas — replaces scattered `border.inner + 2` patterns
