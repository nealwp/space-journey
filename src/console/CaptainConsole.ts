import { Container, Graphics } from "pixi.js";
import { ConsoleTheme } from "./core/ConsoleTheme";
import { Layout, DESIGN_WIDTH, DESIGN_HEIGHT } from "./core/ConsoleLayout";
import { Panel } from "./components/Panel";
import { CommandTerminal } from "./terminal/CommandTerminal";
import { TerminalBuffer } from "./terminal/TerminalBuffer";
import { TerminalInputController } from "./terminal/TerminalInputController";
import { MockTerminalService } from "./terminal/TerminalService";
import { ExteriorView } from "./displays/ExteriorView";
import { NavigationMap } from "./displays/NavigationMap";
import type { NavigationDisplayData } from "./data/types";
import type { TerminalLine } from "./terminal/TerminalBuffer";
import type { Disposable } from "./core/ConsoleApplication";

const panelLabels: Record<string, string> = {
  exteriorView: "EXT VIEW",
  navMap: "NAV",
  mainTerminal: "MAIN TERM",
  alarmLog: "ALRM / LOG",
  alarmMatrix: "ALRM MATRIX",
  powerSys: "PWR SYS",
  propulsionSys: "PROP SYS",
  lifeSupport: "LIFE SUPP",
  powerDist: "PWR DIST",
  gravEnv: "GRAV / ENV",
  systemSummary: "SYS SUMMARY",
};

export class CaptainConsole extends Container implements Disposable {
  private panels: Panel[] = [];
  private commandTerminal: CommandTerminal | null = null;
  private exteriorView: ExteriorView | null = null;
  private navigationMap: NavigationMap | null = null;
  private inputController: TerminalInputController | null = null;
  private terminalBuffer: TerminalBuffer;
  private terminalService: MockTerminalService;
  private busy = false;

  constructor() {
    super();
    this.terminalBuffer = new TerminalBuffer();
    this.terminalService = new MockTerminalService();
    this.drawChassis();
    this.drawPanels();
    this.initTerminal();
    this.initExteriorView();
    this.initNavigationMap();
  }

  private drawChassis(): void {
    const chassis = new Graphics()
      .roundRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, 6)
      .fill(ConsoleTheme.colors.chassis);

    this.addChild(chassis);

    const inner = new Graphics()
      .roundRect(
        ConsoleTheme.border.outer,
        ConsoleTheme.border.outer,
        DESIGN_WIDTH - ConsoleTheme.border.outer * 2,
        DESIGN_HEIGHT - ConsoleTheme.border.outer * 2,
        4
      )
      .fill(ConsoleTheme.colors.chassisDark);

    this.addChild(inner);
  }

  private drawPanels(): void {
    const regions = Object.entries(Layout);

    for (const [key, rect] of regions) {
      const panel = new Panel({
        width: rect.width,
        height: rect.height,
        title: panelLabels[key] ?? key.toUpperCase(),
      });

      panel.x = rect.x;
      panel.y = rect.y;

      this.panels.push(panel);
      this.addChild(panel);
    }
  }

  private initTerminal(): void {
    const terminalPanel = this.panels.find(
      (p) => p.x === Layout.mainTerminal.x && p.y === Layout.mainTerminal.y
    );
    if (!terminalPanel) return;

    const innerPad = ConsoleTheme.border.inner + 2;
    const contentWidth = Layout.mainTerminal.width - innerPad * 2;
    const contentHeight = Layout.mainTerminal.height - innerPad * 2;

    this.commandTerminal = new CommandTerminal(contentWidth, contentHeight);
    terminalPanel.content.addChild(this.commandTerminal);

    this.inputController = new TerminalInputController(
      this.handleSubmit,
      this.handleInput
    );

    this.terminalBuffer.addLine({
      id: "greeting",
      type: "system",
      text: "Good morning, Captain.",
    });
    this.commandTerminal.setLines(this.terminalBuffer.getLines());

    this.inputController.focus();
  }

  private initExteriorView(): void {
    const extPanel = this.panels.find(
      (p) => p.x === Layout.exteriorView.x && p.y === Layout.exteriorView.y
    );
    if (!extPanel) return;

    const innerPad = ConsoleTheme.border.inner + 2;
    const contentWidth = Layout.exteriorView.width - innerPad * 2;
    const contentHeight = Layout.exteriorView.height - innerPad * 2;

    this.exteriorView = new ExteriorView(contentWidth, contentHeight);
    extPanel.content.addChild(this.exteriorView);
  }

  private initNavigationMap(): void {
    const navPanel = this.panels.find(
      (p) => p.x === Layout.navMap.x && p.y === Layout.navMap.y
    );
    if (!navPanel) return;

    const innerPad = ConsoleTheme.border.inner + 2;
    const contentWidth = Layout.navMap.width - innerPad * 2;
    const contentHeight = Layout.navMap.height - innerPad * 2;

    this.navigationMap = new NavigationMap(contentWidth, contentHeight);
    navPanel.content.addChild(this.navigationMap);

    this.navigationMap.setData({
      shipX: contentWidth * 0.3,
      shipY: contentHeight * 0.4,
      destinationX: contentWidth * 0.75,
      destinationY: contentHeight * 0.7,
      rangeKm: 2_426_812,
      etaSeconds: 3_013,
      trajectoryPoints: [
        { x: contentWidth * 0.3, y: contentHeight * 0.4 },
        { x: contentWidth * 0.4, y: contentHeight * 0.25 },
        { x: contentWidth * 0.55, y: contentHeight * 0.2 },
        { x: contentWidth * 0.65, y: contentHeight * 0.35 },
        { x: contentWidth * 0.7, y: contentHeight * 0.55 },
        { x: contentWidth * 0.75, y: contentHeight * 0.7 },
      ],
    });
  }

  update(dt: number): void {
    this.commandTerminal?.update(dt);
    this.exteriorView?.update(dt);
  }

  focusTerminal(): void {
    this.inputController?.focus();
  }

  private handleInput = (value: string): void => {
    this.commandTerminal?.setInput(value);
  };

  private handleSubmit = async (message: string): Promise<void> => {
    if (this.busy) return;

    const captainLine: TerminalLine = {
      id: `captain-${Date.now()}`,
      type: "captain",
      text: message,
    };
    this.terminalBuffer.addLine(captainLine);

    this.inputController?.clear();
    this.commandTerminal?.setInput("");
    this.commandTerminal?.setLines(this.terminalBuffer.getLines());

    this.busy = true;
    this.commandTerminal?.setBusy(true);

    try {
      const response = await this.terminalService.send(message);
      const computerLine: TerminalLine = {
        id: `computer-${Date.now()}`,
        type: "computer",
        text: response,
      };
      this.terminalBuffer.addLine(computerLine);
      this.commandTerminal?.setLines(this.terminalBuffer.getLines());
    } finally {
      this.busy = false;
      this.commandTerminal?.setBusy(false);
      this.inputController?.focus();
    }
  };

  destroy(): void {
    this.inputController?.destroy();
    for (const panel of this.panels) {
      panel.destroy({ children: true });
    }
    this.panels = [];
    super.destroy({ children: true });
  }
}
