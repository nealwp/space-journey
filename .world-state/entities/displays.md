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
  - src/console/displays/PowerDisplay.ts
  - src/console/displays/PropulsionDisplay.ts
  - src/console/displays/LifeSupportDisplay.ts
  - src/console/displays/PowerDistributionDisplay.ts
  - src/console/displays/GravityEnvironmentDisplay.ts
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
- **PowerDisplay** — Generator A/B percentages, reserve, status. Uses TelemetryText. Status color from SystemStatus.
- **PropulsionDisplay** — Thrust, fuel percentages, drive status. Uses TelemetryText.
- **LifeSupportDisplay** — O2, CO2, temperature, humidity. Uses TelemetryText.
- **PowerDistributionDisplay** — Grid status only. Uses TelemetryText.
- **GravityEnvironmentDisplay** — G-force, radiation, temperature. Uses TelemetryText.

## Current state

Step 7 complete. All 5 lower telemetry panels implemented:
- PowerDisplay: GEN A 98%, GEN B 97%, RESRV 11%, STAT NOM
- PropulsionDisplay: THRUST 75%, FUEL 62%, DRIVE NOM
- LifeSupportDisplay: O2 21%, CO2 0.04%, TEMP 22.4C, HUMID 45%
- PowerDistributionDisplay: GRID NOM
- GravityEnvironmentDisplay: G-FORCE 1.00, RAD 0.12 mSv, TEMP 21.8C
- All panels use TelemetryText components with mock data via setData()
- TelemetryText renders label and value horizontally (same line)
- Each display computes maxLabelWidth and passes it to TelemetryText for aligned value columns

## Gotchas / non-obvious constraints

- ExteriorView.update(dt) must be called each frame for star animation — wired via CaptainConsole.update()
- NavigationMap.setData() is called every 10 seconds for plot refresh — wired via CaptainConsole with setInterval
- NavigationDisplayData interface defined in `src/console/data/types.ts` — shared across displays
- PixiJS v8 does not support dashed lines natively — NavigationMap uses a manual drawDashedLine helper with moveTo/lineTo segments
- Range/ETA labels have a solid background rect to avoid overlaying the dashed grid
- AlarmPanel and LogPanel clear and redraw children on each setData() call
- LogPanel uses MAX_CHARS=22 for word-wrapping — continuation lines indent to align with message text, no timestamp repeat
- LogPanel uses `labelSize` (11px) instead of `valueSize` (12px) to fit more entries
- All 5 lower telemetry displays use TelemetryText for label/value pairs
- Status colors (green/yellow/red) mapped from SystemStatus via TelemetryColor type
- TelemetryText accepts optional `labelWidth` to align values across instances — each display measures longest label
- The displays are intentionally crude — no textures, nebulae, planets, or effects
