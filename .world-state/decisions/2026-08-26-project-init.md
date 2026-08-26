---
id: 2026-08-26-project-init
type: decision
status: current
updated: 2026-08-26
links:
  - core
  - console
  - planning
---
Initial project setup: PixiJS v8 + TypeScript + Vite with fixed 1280×720 virtual resolution.

## Context

Starting a new PixiJS-based spacecraft captain's console frontend. Needed to establish the foundational tech stack, project structure, and rendering approach before building any UI components.

## Decision

- **PixiJS v8.20.1** as the rendering engine with async `Application.init()`
- **TypeScript** in strict mode, ES2020 target, ESNext modules
- **Vite** as the dev server and bundler (ESM)
- **Fixed 1280×720 virtual resolution** scaled to fit viewport with aspect ratio preservation
- **ConsoleTheme** as single source of truth for all colors, spacing, borders, fonts
- **ConsoleLayout** for fixed panel positioning (no dynamic rearrangement)
- **CaptainConsole** as top-level orchestrator extending `Container`
- **No external assets** — all procedural rectangles, lines, text, circles
- **Disposable pattern** for lifecycle management

## Why not the alternatives

- **React/DOM UI**: Rejected per PLAN.md — entire console must be PixiJS-rendered, no HTML panels
- **Dynamic layout**: Rejected — this is a fixed physical console, not a responsive web page
- **BitmapText**: Deferred — Text is sufficient for Phase 1, BitmapText can be swapped in later for performance
- **Custom shaders/CRT effects**: Explicitly excluded in Phase 1 non-goals — keep it simple
- **webpack**: Vite is simpler, faster HMR, better ESM support, minimal config needed
