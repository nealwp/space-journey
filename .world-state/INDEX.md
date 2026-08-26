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
- **[core](entities/core.md)** `current` — Foundational layer: PixiJS v8 application wrapper, fixed 1280×720 layout, and shared theme constants.
- **[planning](entities/planning.md)** `current` — Project documentation: full design specification (PLAN.md) and agent context (AGENTS.md).
- **[terminal](entities/terminal.md)** `current` — Command terminal — the single most important component. Strict separation of rendering, input, buffer, and service.

## Decisions (append-only log)

- **[2026-08-26-project-init](decisions/2026-08-26-project-init.md)** `current` — Initial project setup: PixiJS v8 + TypeScript + Vite with fixed 1280×720 virtual resolution.
<!-- WSTATE:AUTO-END -->
