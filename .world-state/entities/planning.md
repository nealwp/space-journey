---
id: planning
type: entity
status: current
updated: 2026-08-26
owner_paths:
  - PLAN.md
  - AGENTS.md
links:
  - core
  - console
---
Project documentation: full design specification (PLAN.md) and agent context (AGENTS.md).

## What this is

- **PLAN.md** — Complete Phase 1 design specification covering architecture, layout, components, terminal, data contracts, mock data, and acceptance criteria. This is the authoritative reference for what to build.
- **AGENTS.md** — Comprehensive context file for AI coding agents: commands, tech stack, project structure, architecture rules, code conventions, and future phase notes.

## Current state

Both documents are complete and up to date. PLAN.md defines 37 sections covering the full Phase 1 scope. AGENTS.md synthesizes the key information agents need to work correctly.

## Gotchas / non-obvious constraints

- PLAN.md is the source of truth — if AGENTS.md conflicts with PLAN.md, PLAN.md wins
- AGENTS.md references planned directories (components/, displays/, terminal/, etc.) that don't exist yet — they will be created in later steps
- The `wstate agents-snippet` output is already included in AGENTS.md
