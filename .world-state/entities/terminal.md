---
id: terminal
type: entity
status: current
updated: 2026-08-27
owner_paths:
  - src/console/terminal/CommandTerminal.ts
  - src/console/terminal/TerminalBuffer.ts
  - src/console/terminal/TerminalInputController.ts
  - src/console/terminal/TerminalService.ts
links:
  - core
  - console
---
Command terminal — the single most important component. Strict separation of rendering, input, buffer, and service.

## What this is

The terminal subsystem provides the primary user interaction mechanism:

- **CommandTerminal** — Rendering only. Displays conversation history, blinking cursor, and character-by-character typing animation. Uses `setLines()`, `setInput()`, `setBusy()`, `startTyping()`. Extends `Container`.
- **TerminalBuffer** — Manages bounded line history (~100 lines), auto-truncation. Returns copies via `getLines()`.
- **TerminalInputController** — Hidden DOM `<textarea>` captures keyboard input. Enter triggers `onSubmit`, other keys trigger `onInput`. Positioned offscreen, transparent.
- **TerminalService** — Interface `send(message) → Promise<string>`. Mock implementation returns fixed response for all commands.

## Current state

Step 3 complete. Terminal renders in the mainTerminal panel with:
- "Good morning, Captain." greeting on init
- Word-based text wrapping within panel width
- Blinking underscore cursor (~500ms)
- Full submission flow: captain line → service call → typing animation → ready for next input
- Computer responses type out one character at a time (40 chars/sec)
- Computer responses and system text use `textDim` color (matching greeting)
- Captain lines use `text` color (brighter)
- Auto-scroll to newest content
- Bounded history with truncation

## Gotchas / non-obvious constraints

- CommandTerminal.update(dt) must be called each frame for cursor blinking and typing animation — wired via ticker in main.ts
- CommandTerminal uses `ConsoleTheme.blinkIntervalMs` for cursor blink timing
- `startTyping(lineId, fullText, onComplete)` begins the character reveal — CaptainConsole awaits the Promise before enabling input
- CaptainConsole owns the submission flow — CommandTerminal never calls TerminalService directly
- PixiJS v8 TextStyle has strict types — don't spread style objects, create new instances
