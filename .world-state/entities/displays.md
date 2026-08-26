---
id: displays
type: entity
status: current
updated: 2026-08-26
owner_paths:
  - src/console/displays/ExteriorView.ts
  - src/console/displays/NavigationMap.ts
  - src/console/displays/AlarmPanel.ts
  - src/console/displays/LogPanel.ts
links:
  - core
  - components
  - console
---
Specific instrument displays — visual panels that render ship data.

## What this is

The displays subsystem contains specific instrument displays that compose components from the components subsystem:

- **ExteriorView** — Slow-moving starfield camera feed. 20 tiny star pixels drifting horizontally across a dark background. Extends `Container`, has `update(dt)` for animation.
- **NavigationMap** — Orbital/trajectory plot with dashed grid, ship/destination markers, and range/ETA readouts. Receives data via `setData()`. Refreshes plot every 10 seconds (NAV_REFRESH_MS).
- **AlarmPanel** — Active alarms only. Per-entry TextStyle with red for ALRM, yellow for WARN. Prefixed with "ALRM " or "WARN ". Receives data via `setData(alarms)`.
- **LogPanel** — Timestamped history entries. Gray text, `labelSize` (11px), format "HH:MM:SS TEXT". Word-wraps at 22 chars — continuation lines indent to align with message text. Receives data via `setData(logs)`.

## Current state

Step 6 complete. AlarmPanel and LogPanel implemented with:
- AlarmPanel: 2 red alarms, 1 yellow warning (mock data), correct per-entry coloring
- LogPanel: 5 timestamped info entries (mock data), word-wrapped with indented continuations
- Right column split into two stacked panels: ALRM on top, LOG below
- Both panels use line-height-based entry rendering with overflow clipping

## Gotchas / non-obvious constraints

- ExteriorView.update(dt) must be called each frame for star animation — wired via CaptainConsole.update()
- NavigationMap.setData() is called every 10 seconds for plot refresh — wired via CaptainConsole with setInterval
- NavigationDisplayData interface defined in `src/console/data/types.ts` — shared across displays
- PixiJS v8 does not support dashed lines natively — NavigationMap uses a manual drawDashedLine helper with moveTo/lineTo segments
- Range/ETA labels have a solid background rect to avoid overlaying the dashed grid
- AlarmPanel and LogPanel clear and redraw children on each setData() call
- LogPanel uses MAX_CHARS=22 for word-wrapping — continuation lines indent to align with message text, no timestamp repeat
- LogPanel uses `labelSize` (11px) instead of `valueSize` (12px) to fit more entries
- The displays are intentionally crude — no textures, nebulae, planets, or effects
