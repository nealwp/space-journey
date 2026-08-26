---
id: displays
type: entity
status: current
updated: 2026-08-26
owner_paths:
  - src/console/displays/ExteriorView.ts
links:
  - core
  - components
  - console
---
Specific instrument displays — visual panels that render ship data.

## What this is

The displays subsystem contains specific instrument displays that compose components from the components subsystem:

- **ExteriorView** — Slow-moving starfield camera feed. 20 tiny star pixels drifting horizontally across a dark background. Labels "EXT VIEW" and "CAM 04". Extends `Container`, has `update(dt)` for animation.

## Current state

Step 4 complete. ExteriorView implemented with:
- 20 stars with varying speed (0.1–0.5 px/frame) and brightness (0.3–1.0)
- Stars wrap when crossing the right edge
- Dark screen background
- Labels in top-left corner

## Gotchas / non-obvious constraints

- ExteriorView.update(dt) must be called each frame for star animation — wired via CaptainConsole.update()
- Stars are drawn as 1×1px Graphics rects, not sprites
- Star positions use Math.random() for initial placement — deterministic would require seeded RNG
- The display is intentionally crude — no textures, nebulae, planets, or effects
