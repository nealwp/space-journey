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

- **CommandTerminal** — Rendering only. Displays conversation history and blinking cursor. Uses `setLines()`, `setInput()`, `setBusy()`. Extends `Container`.
- **TerminalBuffer** — Manages bounded line history (~100 lines), auto-truncation. Returns copies via `getLines()`.
- **TerminalInputController** — Hidden DOM `<textarea>` captures keyboard input. Enter triggers `onSubmit`, other keys trigger `onInput`. Positioned offscreen, transparent.
- **TerminalService** — Interface `send(message) → Promise<string>`. Mock implementation returns fixed response for all commands.

## Current state

Step 3 complete. Terminal renders in the mainTerminal panel with:
- "Good morning, Captain." greeting on init
- Word-based text wrapping within panel width
- Blinking underscore cursor (~500ms)
- Full submission flow: captain line → service call → computer response
- Auto-scroll to newest content
- Bounded history with truncation

## Gotchas / non-obvious constraints

- CommandTerminal.update(dt) must be called each frame for cursor blinking — wired via ticker in main.ts
- CommandTerminal uses `ConsoleTheme.blinkIntervalMs` for cursor blink timing
- TerminalInputController is positioned offscreen, not hidden via display:none — DOM input must remain focusable
- Text wrapping uses TextStyle.wordWrap — estimateTextHeight() approximates line count for positioning
- CaptainConsole owns the submission flow — CommandTerminal never calls TerminalService directly
- PixiJS v8 TextStyle has strict types — don't spread style objects, create new instances
