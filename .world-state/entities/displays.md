---
id: displays
type: entity
status: current
updated: 2026-08-26
owner_paths:
  - src/console/displays/ExteriorView.ts
  - src/console/displays/NavigationMap.ts
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

## Current state

Step 5 complete. NavigationMap implemented with:
- Dark screen background with dashed 20px grid (4px dash, 4px gap)
- Ship marker (green filled square) and destination marker (yellow hollow square)
- Trajectory arc connecting ship to destination
- Range and ETA readouts on solid background at bottom
- Mock data: ship at 30% x 40%, destination at 75% x 70%, range 2.43M KM, ETA 01:23:33

## Gotchas / non-obvious constraints

- ExteriorView.update(dt) must be called each frame for star animation — wired via CaptainConsole.update()
- NavigationMap.setData() is called every 10 seconds for plot refresh — wired via CaptainConsole with setInterval
- NavigationDisplayData interface defined in `src/console/data/types.ts` — shared across displays
- PixiJS v8 does not support dashed lines natively — NavigationMap uses a manual drawDashedLine helper with moveTo/lineTo segments
- Range/ETA labels have a solid background rect to avoid overlaying the dashed grid
- The displays are intentionally crude — no textures, nebulae, planets, or effects
