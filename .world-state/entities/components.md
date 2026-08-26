---
id: components
type: entity
status: current
updated: 2026-08-26
owner_paths:
  - src/console/components/Panel.ts
  - src/console/components/TelemetryText.ts
  - src/console/components/StatusIndicator.ts
  - src/console/components/BarMeter.ts
links:
  - core
  - console
---
Reusable visual primitives for building instrument displays.

## What this is

The components subsystem provides four reusable building blocks that all instrument displays compose:

- **Panel** — Generic frame (bezel → screen → title). Extends `Container`, exposes `readonly content: Container` for child positioning. Supports `resize()`.
- **TelemetryText** — Label + value text pair. `setValue()` and `setColor()` mutate existing Text objects (no recreation).
- **StatusIndicator** — Tiny 6×6 square light. States: off/nominal/warning/alarm. Supports blink via `update(dt)`.
- **BarMeter** — Coarse block-based fill (default 10 blocks). `setValue(0..1)` redraws fill.

## Current state

Step 2 complete. All four components implemented and type-checked. CaptainConsole now uses `Panel` instead of inline drawing logic. Components are ready for use by instrument displays in Steps 4–8.

TelemetryText has been enhanced for Step 7:
- Renders label and value horizontally on the same line (value right of label)
- Accepts optional `labelWidth` to align values across instances within a display
- Each display computes maxLabelWidth and passes it to all TelemetryText instances

## Gotchas / non-obvious constraints

- Panel's `content` container is offset to the inner screen area — children position relative to usable space, not the bezel
- TelemetryText mutates `.text` and `.style.fill` — never recreate Text objects
- TelemetryText uses `labelWidth` option to align values — each display measures longest label
- StatusIndicator's `update(dt)` must be called each frame for blink to work — only triggers on `alarm` state
- BarMeter uses `Graphics.clear()` + redraw on each `setValue()` — acceptable for 1Hz updates, not per-frame
