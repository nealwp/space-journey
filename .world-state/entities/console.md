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
  - planning
---
Top-level orchestrator that owns the root container, draws the chassis, and composes all panel placeholders.

## What this is

The console subsystem contains:

- **CaptainConsole** — Extends `Container`, implements `Disposable`. Draws the gray industrial chassis (outer + inner rounded rectangles) and composes all 11 panel regions as labeled placeholders using the layout from `ConsoleLayout`. Each panel gets a bezel border, dark screen background, and title label.
- **main.ts** — Bootstrap entry point. Creates `ConsoleApplication`, initializes it, creates `CaptainConsole`, adds it to the root container, and registers cleanup on `beforeunload`.

## Current state

Step 1 complete. CaptainConsole renders:
- Gray chassis with inner dark border
- 11 labeled panel placeholders (EXT VIEW, NAV MAP, MAIN TERM, ALRM / LOG, PWR SYS, PROP SYS, LIFE SUPP, PWR DIST, GRAV / ENV, ALRM MATRIX, SYS SUMMARY)
- All panels positioned by ConsoleLayout
- Proper cleanup via `destroy()` method

## Gotchas / non-obvious constraints

- CaptainConsole uses a `panelLabels` map to convert layout keys to abbreviated display labels — add new panels here
- Each panel is a `Graphics` object with two rects (bezel + screen) plus a `Text` label
- The `destroy()` method cleans up all Graphics objects before calling `super.destroy()`
- main.ts registers `beforeunload` handler — any new resources must also be cleaned up there
