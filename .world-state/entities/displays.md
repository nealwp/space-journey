---
id: displays
type: entity
status: current
updated: 2026-08-27
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
  - src/console/displays/AlarmMatrix.ts
  - src/console/displays/SystemSummary.ts
links:
  - core
  - components
  - console
  - data
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
- **AlarmMatrix** — 2-row × 5-column grid of tiny StatusIndicator lights. Each row has custom labels and independent states via `setData()`. Row A: PWR, PROP, LIFE, NAV, COMM. Row B: COOL, FUEL, O2, DCLK, AUX. Supports blinking alarm states via `update(dt)`.
- **SystemSummary** — Compact bottom status strip. Single horizontal line: mission ID, destination, elapsed time, range.

## Current state

Step 9 complete. All panels implemented:
- All displays receive data via `setData()` from `CaptainConsole.applySnapshot()`, not hardcoded values
- AlarmPanel and LogPanel now import AlarmEntry/LogEntry types from `../data/types` (centralized)
- PowerDisplay: GEN A/B %, RESRV %, STAT status
- PropulsionDisplay: THRUST %, FUEL %, DRIVE status
- LifeSupportDisplay: O2 %, CO2 %, TEMP C, HUMID %
- PowerDistributionDisplay: GRID status
- GravityEnvironmentDisplay: G-FORCE, RAD mSv, TEMP C
- AlarmMatrix: 2×5 grid of blinking status indicators
- SystemSummary: mission ID, destination, elapsed time, range
- All panels use TelemetryText components with data-driven values via setData()
- TelemetryText renders label and value horizontally (same line)
- Each display computes maxLabelWidth and passes it to TelemetryText for aligned value columns
- Formatting utilities shared from `src/console/utils/formatting.ts`

## Gotchas / non-obvious constraints

- ExteriorView.update(dt) must be called each frame for star animation — wired via CaptainConsole.update()
- NavigationMap.setData() receives full NavigationDisplayData including trajectory points — nav panel dimensions affect pixel coordinates
- NavigationDisplayData interface defined in `src/console/data/types.ts` — shared across displays
- AlarmEntry and LogEntry types now centralized in `src/console/data/types.ts` — AlarmPanel and LogPanel import from there
- PixiJS v8 does not support dashed lines natively — NavigationMap uses a manual drawDashedLine helper with moveTo/lineTo segments
- Range/ETA labels have a solid background rect to avoid overlaying the dashed grid
- AlarmPanel and LogPanel clear and redraw children on each setData() call
- LogPanel uses MAX_CHARS=22 for word-wrapping — continuation lines indent to align with message text, no timestamp repeat
- LogPanel uses `labelSize` (11px) instead of `valueSize` (12px) to fit more entries
- All 5 lower telemetry displays use TelemetryText for label/value pairs
- Status colors (green/yellow/red) mapped from SystemStatus via TelemetryColor type
- TelemetryText accepts optional `labelWidth` to align values across instances — each display measures longest label
- AlarmMatrix uses StatusIndicator component — update(dt) must be called each frame for blink
- AlarmMatrix accepts AlarmMatrixData with rowA/rowB, each containing labels[] and states[]
- AlarmMatrix rebuilds rows on setData() — clears and recreates all children
- SystemSummary uses formatRangeKm and formatDuration from shared utils
- The displays are intentionally crude — no textures, nebulae, planets, or effects
