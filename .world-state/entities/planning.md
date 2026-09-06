---
id: planning
type: entity
status: current
updated: 2026-09-06
owner_paths:
  - PLAN.md
  - AGENTS.md
  - README.md
links:
  - core
  - console
  - contracts
  - systems
  - server
---
Project documentation: full design specification (PLAN.md), agent context (AGENTS.md), and repo README.

## What this is

- **PLAN.md** — Design specification. Phase 1 (37 sections) plus a Phase 2 section (38) covering ship systems on a shared server: repository layout, adding a system, and the degradation path.
- **AGENTS.md** — Comprehensive context file for AI coding agents: commands, tech stack, monorepo project structure, architecture rules, code conventions, and future phase notes.
- **README.md** — Human-facing overview, getting started, architecture diagram, key interfaces, and phase status.

## Current state

Updated for the Phase 2 monorepo: werkspaces layout under `packages/`, server + console `npm run dev` via concurrently, `webSocketConsoleDataSource` merge/fallback behavior, and the `ShipSystem` / contracts story are all documented.

## Gotchas / non-obvious constraints

- PLAN.md is the source of truth — if AGENTS.md conflicts with PLAN.md, PLAN.md wins
- The `wstate agents-snippet` output is already included in AGENTS.md
- Adding a system changes AGENTS.md's structure tree and PLAN.md section 38 — keep them in lockstep