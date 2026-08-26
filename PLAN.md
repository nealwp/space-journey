# Phase 1 Implementation Plan — PixiJS Spacecraft Captain Console

## Objective

Implement the first playable frontend for the spacecraft game as a **single-screen PixiJS captain’s console** based on the latest visual concept.

The screen should feel like a late-1980s industrial spacecraft terminal:

- low-resolution / pixel-art presentation
- gray, utilitarian hardware framing
- dark CRT-style displays
- sparse green/yellow/red status colors
- abbreviated labels
- minimal visual polish
- no clickable-looking controls
- no conventional game UI
- the **command terminal is the only user interaction mechanism**
- all other panels are read-only instruments whose values can change over time

The implementation should deliberately favor **simple, maintainable PixiJS primitives** over complex artwork, shaders, or custom rendering tricks.

Target PixiJS **v8** conventions. PixiJS v8 uses async `Application.init()`, and its `Graphics`, `Container`, `Text`, and `BitmapText` APIs are sufficient for this screen. `BitmapText` is especially appropriate for frequently changing telemetry. ([PixiJS][1])

---

# 1. Core Design Principles

The implementation must follow these rules throughout.

### 1.1 PixiJS owns the rendered console

The entire spacecraft console should live inside one PixiJS application.

Use PixiJS primitives wherever possible:

- `Container`
- `Graphics`
- `BitmapText` or `Text`
- simple lines
- rectangles
- circles
- tiny pixel markers

Avoid building individual panels as HTML elements.

The **only exception** may be an invisible/native DOM text input used to capture keyboard text reliably, described later.

---

### 1.2 Treat every display as a view of external state

No panel should internally own simulated ship values.

Bad:

```ts
class PowerPanel {
  power = 98;
}
```

Good:

```ts
interface PowerTelemetry {
  generatorA: number;
  generatorB: number;
  reserve: number;
  status: SystemStatus;
}

class PowerPanel {
  setData(data: PowerTelemetry): void;
}
```

Every display must be capable of receiving new values later from:

- WebSocket snapshots
- simulation events
- HTTP responses
- local development mocks
- replay data

For Phase 1, mock data is acceptable.

The UI architecture must not care where the data originated.

---

### 1.3 Separate rendering from game state

Do not let rendering code mutate the ship model.

The dependency direction should be:

```text
DATA SOURCE
    ↓
UI MODEL / STORE
    ↓
PIXIJ S VIEWS
```

Never:

```text
Pixi component
    ↓
simulation mutation
```

The sole user-command path is:

```text
Terminal input
    ↓
Command service
    ↓
Response
    ↓
Terminal output
```

Later that command service can call the actual ship computer backend.

---

### 1.4 Nothing except the terminal should look interactive

This is a critical aesthetic and UX requirement.

Do **not** create:

- buttons
- tabs
- dropdowns
- clickable panel headers
- switches
- sliders
- hover states
- pointer cursors
- obvious touch targets

All diagnostic panels are instruments.

They display information.

They do not respond to clicking.

PixiJS supports pointer interaction through `eventMode`; leave passive/read-only visual elements non-interactive rather than setting them up as clickable objects. ([PixiJS][2])

The player should instinctively understand:

> “I don't know what any of this means, but I can type into that terminal.”

---

# 2. Recommended Project Structure

Do not put the entire screen into one giant Pixi scene file.

Create a modular structure roughly like this, adapting paths to the existing repository:

```text
src/
  console/
    CaptainConsole.ts

    core/
      ConsoleApplication.ts
      ConsoleLayout.ts
      ConsoleTheme.ts
      ConsoleClock.ts

    components/
      Panel.ts
      PanelHeader.ts
      TelemetryText.ts
      StatusIndicator.ts
      BarMeter.ts

    displays/
      ExteriorView.ts
      NavigationMap.ts
      AlarmLog.ts
      PowerDisplay.ts
      PropulsionDisplay.ts
      LifeSupportDisplay.ts
      PowerDistributionDisplay.ts
      GravityEnvironmentDisplay.ts
      AlarmMatrix.ts
      SystemSummary.ts

    terminal/
      CommandTerminal.ts
      TerminalBuffer.ts
      TerminalInputController.ts
      TerminalService.ts
      MockTerminalService.ts

    data/
      ConsoleState.ts
      ConsoleDataSource.ts
      MockConsoleDataSource.ts
      types.ts

    rendering/
      PixelText.ts
      crt.ts
      primitives.ts

    utils/
      formatting.ts
      math.ts
```

Do not create abstractions merely for abstraction's sake.

The important boundaries are:

1. **application/layout**
2. **reusable visual components**
3. **specific instrument displays**
4. **data/state**
5. **terminal**
6. **rendering helpers**

---

# 3. Use a Fixed Virtual Resolution

Render the console against a fixed internal coordinate system.

Recommended initial resolution:

```text
1600 × 900
```

or, for stronger pixel character:

```text
1280 × 720
```

Prefer **1280 × 720** if it still comfortably fits the telemetry.

Then scale the Pixi canvas to fit the browser viewport while maintaining aspect ratio.

Do not dynamically rearrange every panel based on viewport width.

This is supposed to be a fixed physical console.

Conceptually:

```ts
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;
```

Determine:

```ts
scale = Math.min(viewportWidth / DESIGN_WIDTH, viewportHeight / DESIGN_HEIGHT);
```

Center the root console container.

If extra browser space exists, fill it with a near-black background.

---

# 4. Establish a Single Theme

Create `ConsoleTheme.ts`.

Do not scatter literal values throughout individual components.

Example:

```ts
export const ConsoleTheme = {
  colors: {
    page: 0x10110f,
    chassis: 0x53544e,
    chassisDark: 0x30312e,
    bezel: 0x262824,
    bezelHighlight: 0x70716a,

    screen: 0x09100b,
    screenSecondary: 0x0c120d,

    text: 0xa8b09c,
    textDim: 0x68705f,
    green: 0x79a86b,
    yellow: 0xb3a44f,
    red: 0xb85848,

    grid: 0x273329,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 18,
  },

  border: {
    outer: 3,
    inner: 1,
  },
};
```

Keep the palette intentionally limited.

No gradients are required.

No fancy metallic textures are required.

Simple stacked rectangles and borders should create the industrial chassis look.

---

# 5. Typography

Typography is a major part of the aesthetic.

Prefer one monospaced pixel or bitmap font throughout the spacecraft displays.

Use:

- one main pixel font
- uppercase labels
- abbreviated instrumentation text
- slightly larger terminal text

PixiJS `BitmapText` is a good fit for frequently updating HUD-style content because it uses pre-generated glyph textures rather than re-rasterizing changing strings. ([PixiJS][3])

If the repository does not already have a suitable bitmap font asset, keep Phase 1 simple:

```ts
Text;
```

with a monospaced system font.

Do **not** spend substantial implementation time sourcing or creating fonts.

The architecture should allow switching `TelemetryText` from `Text` to `BitmapText` later without rewriting the panels.

---

# 6. Screen Layout

Use the latest concept as the structural reference, but simplify it where necessary.

Recommended grid:

```text
┌────────────┬──────────────────────────┬───────────────┐
│ EXT VIEW   │                          │               │
├────────────┤        MAIN TERM         │   ALRM / LOG  │
│ NAV MAP    │                          │               │
│            │                          │               │
├────────────┼───────┬───────┬──────────┼───────────────┤
│            │ PWR   │ PROP  │ LIFE     │               │
│            ├───────┼───────┼──────────┤ ALRM MATRIX   │
│            │ DIST  │ GRAV  │ ...      │               │
├────────────┴───────┴───────┴──────────┴───────────────┤
│ SYS SUMMARY / MISSION CLOCK                            │
└────────────────────────────────────────────────────────┘
```

Specific priorities:

1. **Main terminal is the dominant visual object.**
2. Navigation is the second-most legible display.
3. Exterior view is small and obviously secondary.
4. Alarm/log panel should be visible without dominating.
5. Lower telemetry should initially be somewhat inscrutable.
6. System summary should be extremely compact.

The exterior view should feel like an engineer reluctantly added a camera feed because somebody asked for a window.

---

# 7. Generic `Panel` Component

Build the panel frame once.

Example API:

```ts
interface PanelOptions {
  width: number;
  height: number;
  title?: string;
}

class Panel extends Container {
  readonly content: Container;

  constructor(options: PanelOptions);

  resize(width: number, height: number): void;
}
```

The panel should draw:

```text
outer chassis rect
dark border
inner bezel rect
screen area
title text
```

Do not create nine slightly different implementations.

Optional visual variation can come from configuration later.

---

# 8. Reusable Instrument Components

Create only a few basic primitives.

## `TelemetryText`

```ts
interface TelemetryTextOptions {
  label?: string;
  value?: string;
  color?: TelemetryColor;
}
```

Supports changing:

```ts
setValue(value: string): void;
setColor(color: TelemetryColor): void;
```

---

## `StatusIndicator`

Tiny square light.

```ts
type IndicatorState = "off" | "nominal" | "warning" | "alarm";
```

The light may:

- stay dark
- stay green
- stay yellow
- stay red
- blink

It must **not** appear clickable.

---

## `BarMeter`

For very simple power/load displays.

Implementation should be rectangles, not sprites.

```ts
setValue(0.0 ... 1.0)
```

Keep it visually coarse.

For example:

```text
████████░░
```

or ten drawn blocks.

Do not create smooth modern progress bars.

---

# 9. Main Command Terminal

This is the single most important component.

Create:

```text
terminal/
  CommandTerminal.ts
  TerminalBuffer.ts
  TerminalInputController.ts
  TerminalService.ts
```

Responsibilities must be separated.

---

## `CommandTerminal`

Rendering only.

It knows how to render:

```text
Good morning, Captain.

> _
```

and conversation history.

It does **not** decide what a command means.

API:

```ts
interface TerminalLine {
  id: string;
  type: "system" | "captain" | "computer";
  text: string;
}

class CommandTerminal extends Container {
  setLines(lines: TerminalLine[]): void;
  setInput(value: string): void;
  setBusy(value: boolean): void;
}
```

---

# 10. Terminal Input

PixiJS is a renderer, not a conventional text-entry framework.

For reliable keyboard input, IME behavior, paste support, selection behavior, mobile keyboard support, etc., use a small hidden/native DOM `<input>` or `<textarea>` associated with the canvas.

Visually, the Pixi terminal renders the text.

The DOM input exists only to capture it.

Architecture:

```text
keyboard
   ↓
hidden DOM textarea
   ↓
TerminalInputController
   ↓
CommandTerminal.setInput()
```

When the terminal region gains focus or when the page initializes:

```ts
input.focus();
```

Keep the DOM input:

- visually hidden
- positioned offscreen or transparent
- not part of the visible interface

Do not attempt to build a full text editor from raw Pixi keyboard events.

---

# 11. Terminal Submission

When the user presses Enter:

```text
1. capture current input
2. ignore empty/whitespace-only input
3. append captain line to terminal
4. clear current input
5. call TerminalService.send()
6. await response
7. append computer response
8. maintain terminal focus
```

Interface:

```ts
export interface TerminalService {
  send(message: string): Promise<string>;
}
```

Phase 1 implementation:

```ts
export class MockTerminalService implements TerminalService {
  async send(_message: string): Promise<string> {
    return "apologies, I am unable to connect to the ships systems at this time.";
  }
}
```

Use that exact response for every valid message.

Do not special-case commands.

Do not implement fake AI.

---

# 12. Terminal History and Scrolling

The terminal must support multiple exchanges.

Example:

```text
Good morning, Captain.

> status

apologies, I am unable to connect to the ships systems at this time.

> where are we?

apologies, I am unable to connect to the ships systems at this time.

> _
```

The terminal should:

- keep a bounded history
- wrap long text
- automatically keep the newest content visible
- not require clicking a scroll bar
- truncate old history when necessary

For Phase 1, keeping the latest ~50–100 logical lines is enough.

Do not build interactive scrolling unless absolutely necessary.

---

# 13. Cursor

Add a simple blinking block or underscore cursor:

```text
> _
```

Implementation:

```ts
elapsed += deltaMS;

cursor.visible = Math.floor(elapsed / 500) % 2 === 0;
```

This is one of the only animated elements besides telemetry and stars.

---

# 14. Exterior View

Keep this intentionally crude.

Use:

```text
black/dark background
15–30 tiny star pixels
```

Each star:

```ts
interface Star {
  x: number;
  y: number;
  speed: number;
  brightness: number;
}
```

Move extremely slowly.

When a star crosses the edge, wrap it.

Do not use:

- textures
- nebulae
- planets
- lens effects
- 3D
- particle libraries

The exterior screen should look like a cheap low-resolution optical feed.

Suggested label:

```text
EXT VIEW
CAM 04
```

No controls.

---

# 15. Navigation Map

Build entirely from Pixi `Graphics`.

Elements:

```text
background
grid
2–4 orbital/trajectory curves
origin marker
destination marker
ship marker
tiny text readouts
```

The ship should be:

```text
■
```

or:

```text
•
```

Not a spacecraft sprite.

The destination may be another square.

Example:

```text
        ·

     ( orbit )

        ■ SHP

                 □ DST
```

Do not build highly accurate orbital graphics in Phase 1.

The map exists to establish the display architecture.

Provide:

```ts
interface NavigationDisplayData {
  shipX: number;
  shipY: number;
  destinationX: number;
  destinationY: number;

  rangeKm: number;
  etaSeconds: number;

  trajectoryPoints?: Point[];
}
```

Method:

```ts
setData(data: NavigationDisplayData): void;
```

---

# 16. Navigation Refresh Behavior

The navigation plot should visibly update slowly.

Do **not** redraw it every animation frame.

Use a refresh interval:

```ts
const NAV_REFRESH_MS = 10_000;
```

Every ten seconds:

```text
receive current data
clear previous plot
redraw trajectory
redraw markers
update labels
```

This makes it feel like an old onboard plotting computer.

The Pixi application can render normally every frame; the expensive map geometry only changes every ~10 seconds.

---

# 17. Alarm / Log Display

Keep this panel visually strong.

Data model:

```ts
interface ShipLogEntry {
  id: string;
  timestamp: string;
  severity: "info" | "warning" | "alarm";
  text: string;
}
```

Display:

```text
ALRM PWR DIST B
ALRM COOL LOOP B TEMP
WARN H20 LVL LOW

----------------

10:13:02 NAV SOL UPDT
10:15:47 PWR DIST B VOLT FLUC
10:16:12 COOL LOOP B TEMP HIGH
10:18:33 COMM LINK OK
```

Color:

```text
alarm   red
warning yellow
normal  gray/green
```

Do not add filters or controls.

The log should simply update as new entries arrive.

---

# 18. Alarm Matrix

This should mimic an industrial annunciator panel.

Example:

```text
       PWR PROP LIFE NAV COMM
       ──────────────────────
       ■    ■    ■   ■   ■
       ■    ■    ■   ■   ■
```

Use tiny square lights.

Data:

```ts
interface AlarmMatrixData {
  power: IndicatorState;
  propulsion: IndicatorState;
  lifeSupport: IndicatorState;
  navigation: IndicatorState;
  communications: IndicatorState;
}
```

Support blinking alarm states.

Again: lights only.

No buttons.

---

# 19. Lower Telemetry Panels

Implement five basic displays:

```text
PWR SYS
PROP SYS
LIFE SUPP
PWR DIST
GRAV / ENV
```

These should primarily be composed of:

```text
label + numeric value
```

Example:

```text
PWR SYS

GEN A    98%
GEN B    97%
RESRV    11%

STAT     NOM
```

Prefer abbreviated headings because these panels are supposed to feel built for trained personnel.

---

# 20. Data Contracts

Create explicit shared types.

Example:

```ts
export type SystemStatus =
  | "nominal"
  | "degraded"
  | "warning"
  | "critical"
  | "offline";

export interface ConsoleSnapshot {
  timestamp: number;

  navigation: NavigationDisplayData;
  power: PowerTelemetry;
  propulsion: PropulsionTelemetry;
  lifeSupport: LifeSupportTelemetry;
  powerDistribution: PowerDistributionTelemetry;
  environment: EnvironmentTelemetry;

  alarms: AlarmMatrixData;
  logs: ShipLogEntry[];

  mission: MissionTelemetry;
}
```

Avoid:

```ts
Record<string, any>;
```

Strong typing is important because these contracts will eventually become the boundary between live game state and rendering.

---

# 21. Data Source Abstraction

Define:

```ts
interface ConsoleDataSource {
  getSnapshot(): Promise<ConsoleSnapshot>;

  subscribe?(listener: (snapshot: ConsoleSnapshot) => void): () => void;
}
```

Phase 1:

```ts
MockConsoleDataSource;
```

Later:

```ts
WebSocketConsoleDataSource;
```

Potentially:

```ts
ReplayConsoleDataSource;
```

Every display must remain unaware of which implementation is active.

---

# 22. Mock Live Data

Do not make the Phase 1 screen completely static.

Create a lightweight mock source that demonstrates the architecture.

Examples:

```text
mission elapsed time increases continuously
destination range slowly decreases
power load fluctuates ±1%
temperature drifts slightly
stars move continuously
navigation plot refreshes every 10 seconds
one or two indicators occasionally blink
```

Do not create random chaos.

The point is merely to prove that displays are reactive.

Prefer deterministic periodic values over uncontrolled `Math.random()` where easy.

For example:

```ts
power = 0.78 + Math.sin(t / 5000) * 0.01;
```

---

# 23. State Coordinator

`CaptainConsole` should own the overall orchestration.

Conceptually:

```ts
class CaptainConsole {
  private dataSource: ConsoleDataSource;

  private navigation: NavigationMap;
  private power: PowerDisplay;
  private propulsion: PropulsionDisplay;
  private lifeSupport: LifeSupportDisplay;
  // ...

  async start() {
    const snapshot = await this.dataSource.getSnapshot();

    this.applySnapshot(snapshot);

    this.dataSource.subscribe?.((snapshot) => this.applySnapshot(snapshot));
  }

  private applySnapshot(snapshot: ConsoleSnapshot) {
    this.navigation.setData(snapshot.navigation);
    this.power.setData(snapshot.power);
    // ...
  }
}
```

Avoid event spaghetti.

A single clear state fan-out is enough for this phase.

---

# 24. Update Frequencies

Do not tie everything to Pixi's ticker.

Different data types should naturally update at different rates.

Recommended:

```text
Rendering                         60 fps
Starfield                       every frame
Terminal cursor                 ~500 ms blink
Clock / countdown                 1 Hz
Telemetry snapshot                1 Hz
Alarm lights                      1 Hz or event driven
Navigation numeric data           1 Hz
Navigation plot redraw           10 sec
Ship logs                        event driven
```

This distinction will map cleanly to the real server architecture later.

---

# 25. Formatting Utilities

Keep number formatting outside display classes.

Create helpers like:

```ts
formatRangeKm();
formatPercent();
formatTemperature();
formatDuration();
formatVelocity();
formatTimestamp();
```

Example:

```ts
formatRangeKm(2_426_812);
// "2.43M KM"
```

This ensures all displays use consistent formatting.

---

# 26. CRT / Pixel Effects

Keep effects extremely modest.

Do **not** build custom shaders in Phase 1.

Possible cheap effects:

### Scanlines

Draw horizontal translucent lines every 3–4 pixels over each screen or over the entire screen layer.

### Slight screen tint

Use the dark green/black panel backgrounds.

### Pixel snapping

Round object positions:

```ts
x = Math.round(x);
y = Math.round(y);
```

### Nearest-neighbor scaling

Ensure the canvas and any textures retain hard pixel edges.

Do not implement:

- barrel distortion
- bloom
- chromatic aberration
- complex noise shaders
- expensive postprocessing

Those can come later.

---

# 27. Do Not Add Visual Assets Unless Necessary

The initial interface should be almost entirely procedural.

It should be possible to recreate most of the console from:

```text
rectangles
lines
text
small circles
tiny filled squares
```

Avoid depending on custom PNG assets.

The only reasonable initial asset dependency is a bitmap font if one already exists or is trivial to include.

This helps keep the codebase portable and understandable.

---

# 28. Initialization

Use PixiJS v8 initialization style:

```ts
const app = new Application();

await app.init({
  resizeTo: window,
  antialias: false,
  background: "#10110f",
});
```

PixiJS v8 uses asynchronous application initialization. ([PixiJS][1])

Create one root container:

```ts
const consoleRoot = new Container();

app.stage.addChild(consoleRoot);
```

Scale and center `consoleRoot` based on the fixed design resolution.

---

# 29. Rendering Performance

Do not prematurely optimize.

This screen is graphically simple.

However:

- avoid recreating all `Text` instances every frame
- mutate `.text` on existing objects
- redraw `Graphics` only when geometry changes
- redraw navigation plot only on its scheduled refresh
- reuse panel objects
- keep star count low
- avoid unnecessary filters
- destroy components and listeners cleanly

Frequently changing instrumentation may eventually benefit from `BitmapText`, which PixiJS specifically recommends for HUD-like text that updates often. ([PixiJS][3])

---

# 30. Lifecycle / Cleanup

Every component that owns listeners or timers should support cleanup.

For example:

```ts
interface Disposable {
  destroy(): void;
}
```

The root console should clean up:

```text
timers
DOM input listener
window resize listener
data-source subscription
Pixi containers
```

Do not leave global event listeners attached.

---

# 31. Testing

Prioritize logic tests rather than pixel-perfect rendering tests.

Unit-test:

```text
formatting utilities
TerminalBuffer
terminal submission behavior
ConsoleDataSource contracts
mock telemetry updates
layout calculations
state mapping
```

Example terminal test:

```text
input: "status"
→ captain line is stored

→ service receives "status"
→ response is appended
→ input resets
```

Expected response:

```text
apologies, I am unable to connect to the ships systems at this time.
```

Do not invest heavily in screenshot tests during Phase 1 unless the existing project already uses them.

---

# 32. First-Pass Implementation Sequence

Execute in this order.

## Step 1 — Pixi application shell

Create:

```text
ConsoleApplication
CaptainConsole
ConsoleTheme
ConsoleLayout
```

Render an empty chassis with panel placeholders.

Verify scaling and resizing.

---

## Step 2 — Generic panel and text primitives

Implement:

```text
Panel
TelemetryText
StatusIndicator
BarMeter
```

Use them everywhere after this.

---

## Step 3 — Main terminal

Implement terminal rendering and keyboard capture before other detailed displays.

Required working behavior:

```text
Good morning, Captain.

> hello
```

Enter:

```text
Good morning, Captain.

> hello

apologies, I am unable to connect to the ships systems at this time.

> _
```

Do not proceed until this works.

---

## Step 4 — Exterior view

Implement the tiny slow-moving starfield.

Keep it simple.

---

## Step 5 — Navigation display

Implement:

```text
grid
simple orbital/trajectory lines
ship square
destination square
range
ETA
```

Refresh graphical plot every 10 seconds.

---

## Step 6 — Alarm/log panel

Implement severity colors, static initial events, and ability to append entries.

---

## Step 7 — Lower telemetry panels

Implement:

```text
PWR SYS
PROP SYS
LIFE SUPP
PWR DIST
GRAV / ENV
```

Use shared components.

---

## Step 8 — Alarm matrix and system summary

Add tiny status lights and compact status strip.

---

## Step 9 — Mock data layer

Replace hardcoded display values with:

```ts
MockConsoleDataSource;
```

Ensure each display receives typed data.

---

## Step 10 — Live mock updates

Add slow deterministic updates and demonstrate that:

```text
range changes
ETA changes
power changes
thermal values change
alarm state can change
navigation redraws
```

without manually modifying the individual displays.

---

## Step 11 — Cleanup

Remove:

- duplicated styles
- inline colors
- inline magic coordinates where practical
- display-owned mock state
- unnecessary interaction events
- accidental hover/click behavior

---

# 33. Explicit Non-Goals for Phase 1

Do **not** implement:

- actual spacecraft simulation
- orbital physics
- server connectivity
- WebSockets
- LLM integration
- ship AI
- real alarms
- audio
- settings
- menus
- inventory
- player accounts
- save games
- tooltips
- tutorial
- clickable UI
- mobile layout
- shader-heavy CRT rendering
- elaborate sprite artwork
- 3D rendering

The goal is **not** to make the game.

The goal is to establish a clean, functional frontend foundation for the game.

---

# 34. Important UX Rules

The completed screen should satisfy the following experience.

A brand-new user sees:

```text
Good morning, Captain.

> _
```

That should immediately be the obvious place to start.

Everything surrounding it should look like:

> “This probably means something, but I don't know what yet.”

For example:

```text
PWR SYS
GEN A 98
GEN B 97
RESRV 11
STAT NOM
```

Do **not** add explanations.

Do **not** add hover tooltips.

Do **not** write:

```text
Generator A Power: 98%
```

Prefer:

```text
GEN A   98%
```

The future game teaches the player through the ship computer.

The instrument panel assumes the captain already knows how to read it.

---

# 35. Visual Acceptance Criteria

The resulting screen should visibly contain:

- gray industrial console/chassis
- black/green CRT-style screens
- small exterior star view at upper-left
- navigation map below or beside it
- large central command terminal
- right-side alarm/log display
- lower subsystem telemetry displays
- alarm matrix
- bottom system summary/status area

The screen should contain **no obvious interactive elements except the command prompt**.

There should be:

- no rendered buttons
- no hover highlighting
- no switches
- no draggable objects
- no clickable tabs
- no fake keyboard
- no UI chrome that implies clicking

---

# 36. Functional Acceptance Criteria

Before Phase 1 is considered complete:

1. The Pixi console fills and scales with the browser while maintaining aspect ratio.
2. All major panels render through reusable components.
3. All panels receive their data through typed data interfaces.
4. A mock data source provides the current console state.
5. Telemetry visibly changes while the app is running.
6. Navigation map refreshes approximately every 10 seconds.
7. Stars drift slowly in the exterior view.
8. Alarm indicators can blink.
9. Logs can receive new entries.
10. The terminal receives real keyboard input.
11. The terminal shows the user's submitted command.
12. Enter sends the command through `TerminalService`.
13. Every command receives:

```text
apologies, I am unable to connect to the ships systems at this time.
```

14. The response renders back into the terminal history.
15. The terminal accepts another command immediately afterward.
16. No other visible console element behaves as a clickable control.
17. No individual display directly owns authoritative game-state values.
18. The app can later replace the mock source with a live source without rewriting display components.

---

# 37. Architectural Target for the Next Phase

Do not implement this now, but ensure today's interfaces make this future transition straightforward:

```text
                 GAME SERVER
                      │
                  WebSocket
                      │
                      ▼
          WebSocketConsoleDataSource
                      │
              ConsoleSnapshot
                      │
                      ▼
               CaptainConsole
              /      |       \
             ▼       ▼        ▼
           NAV      PWR      LIFE
```

And independently:

```text
CAPTAIN
   │
terminal
   │
   ▼
TerminalService
   │
   ▼
POST /computer/message
   │
   ▼
Ship Computer Agent
```

The Pixi displays should never need to know that transition happened.

The intended Phase 1 result is therefore not merely a mockup. It should be a **working instrumentation client with fake instrumentation data**, ready to have the real spacecraft simulation plugged into it later.

[1]: https://pixijs.com/8.x/guides/components/application?utm_source=chatgpt.com "Application | PixiJS"
[2]: https://pixijs.com/8.x/guides/components/events?utm_source=chatgpt.com "Events / Interaction | PixiJS"
[3]: https://pixijs.com/8.x/guides/components/scene-objects/text/bitmap?utm_source=chatgpt.com "Bitmap Text | PixiJS"
