# World State Index

This file is the entry point. Read this before anything else in
`.world-state/`. Only follow links to files that are actually relevant
to the current task, then stop, do the work, and release them.

_Regenerate with `wstate index`. Do not hand-edit the lists
below; edit the source files' frontmatter/summary lines instead._

<!-- WSTATE:AUTO-START -->
## Entities

- **[components](entities/components.md)** `current` — Reusable visual primitives for building instrument displays.
- **[console](entities/console.md)** `current` — Top-level orchestrator that owns the root container, draws the chassis, and composes all panel placeholders.
- **[contracts](entities/contracts.md)** `current` — Shared, dependency-free type boundary and transport protocol between the console and the ship systems server.
- **[core](entities/core.md)** `current` — Foundational layer: PixiJS v8 application wrapper, fixed 1280×720 layout, and shared theme constants.
- **[data](entities/data.md)** `current` — Data contracts and state management — ConsoleSnapshot assembly, ConsoleDataSource interface, MockConsoleDataSource, WebSocketConsoleDataSource. Shared types live in @space-journey/contracts.
- **[displays](entities/displays.md)** `current` — Specific instrument displays — visual panels that render ship data.
- **[planning](entities/planning.md)** `current` — Project documentation: full design specification (PLAN.md), agent context (AGENTS.md), and repo README.
- **[server](entities/server.md)** `current` — The single ship-systems server — hosts all registered systems and broadcasts their snapshot slices over WebSocket.
- **[systems](entities/systems.md)** `current` — The ship's internal simulated systems — one workspace package per system, added one at a time.
- **[terminal](entities/terminal.md)** `current` — Command terminal — the single most important component. Strict separation of rendering, input, buffer, and service.

## Decisions (append-only log)

- **[2026-08-26-project-init](decisions/2026-08-26-project-init.md)** `current` — Initial project setup: PixiJS v8 + TypeScript + Vite with fixed 1280×720 virtual resolution.
- **[2026-09-06-ship-systems-architecture](decisions/2026-09-06-ship-systems-architecture.md)** `current` — Ship systems run as separate workspace packages hosted on a single shared server, in one monorepo.
<!-- WSTATE:AUTO-END -->
