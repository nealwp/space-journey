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
import { AlarmPanel } from "./displays/AlarmPanel";
import { LogPanel } from "./displays/LogPanel";
import { PowerDisplay } from "./displays/PowerDisplay";
import { PropulsionDisplay } from "./displays/PropulsionDisplay";
import { LifeSupportDisplay } from "./displays/LifeSupportDisplay";
import { PowerDistributionDisplay } from "./displays/PowerDistributionDisplay";
import { GravityEnvironmentDisplay } from "./displays/GravityEnvironmentDisplay";
import { AlarmMatrix } from "./displays/AlarmMatrix";
import { SystemSummary } from "./displays/SystemSummary";
import type { TerminalLine } from "./terminal/TerminalBuffer";
import type { Disposable } from "./core/ConsoleApplication";
import type { ConsoleDataSource } from "./data/ConsoleDataSource";
import type { ConsoleSnapshot } from "./data/ConsoleSnapshot";

const panelLabels: Record<string, string> = {
  exteriorView: "EXT VIEW",
  navMap: "NAV",
  mainTerminal: "MAIN TERM",
  alarm: "ALRM",
  log: "LOG",
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
  private alarmPanel: AlarmPanel | null = null;
  private logPanel: LogPanel | null = null;
  private powerDisplay: PowerDisplay | null = null;
  private propulsionDisplay: PropulsionDisplay | null = null;
  private lifeSupportDisplay: LifeSupportDisplay | null = null;
  private powerDistDisplay: PowerDistributionDisplay | null = null;
  private gravEnvDisplay: GravityEnvironmentDisplay | null = null;
  private alarmMatrix: AlarmMatrix | null = null;
  private systemSummary: SystemSummary | null = null;
  private inputController: TerminalInputController | null = null;
  private terminalBuffer: TerminalBuffer;
  private terminalService: MockTerminalService;
  private dataSource: ConsoleDataSource;
  private unsubscribe: (() => void) | null = null;
  private busy = false;

  constructor(dataSource: ConsoleDataSource) {
    super();
    this.dataSource = dataSource;
    this.terminalBuffer = new TerminalBuffer();
    this.terminalService = new MockTerminalService();
    this.drawChassis();
    this.drawPanels();
    this.initTerminal();
    this.initExteriorView();
    this.initNavigationMap();
    this.initAlarmPanel();
    this.initLogPanel();
    this.initPowerDisplay();
    this.initPropulsionDisplay();
    this.initLifeSupportDisplay();
    this.initPowerDistDisplay();
    this.initGravEnvDisplay();
    this.initAlarmMatrix();
    this.initSystemSummary();
  }

  async start(): Promise<void> {
    const snapshot = await this.dataSource.getSnapshot();
    this.applySnapshot(snapshot);
    this.unsubscribe = this.dataSource.subscribe((s) => this.applySnapshot(s));
  }

  private applySnapshot(snapshot: ConsoleSnapshot): void {
    this.navigationMap?.setData(snapshot.navigation);
    this.powerDisplay?.setData(snapshot.power);
    this.propulsionDisplay?.setData(snapshot.propulsion);
    this.lifeSupportDisplay?.setData(snapshot.lifeSupport);
    this.powerDistDisplay?.setData(snapshot.powerDistribution);
    this.gravEnvDisplay?.setData(snapshot.environment);
    this.alarmMatrix?.setData(snapshot.alarmMatrix);
    this.alarmPanel?.setData(snapshot.activeAlarms);
    this.logPanel?.setData(snapshot.logs);
    this.systemSummary?.setData(snapshot.mission);
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

    const innerPad = ConsoleTheme.contentPad;
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

    const innerPad = ConsoleTheme.contentPad;
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

    const innerPad = ConsoleTheme.contentPad;
    const contentWidth = Layout.navMap.width - innerPad * 2;
    const contentHeight = Layout.navMap.height - innerPad * 2;

    this.navigationMap = new NavigationMap(contentWidth, contentHeight);
    navPanel.content.addChild(this.navigationMap);
  }

  private initAlarmPanel(): void {
    const alarmPanelEl = this.panels.find(
      (p) => p.x === Layout.alarm.x && p.y === Layout.alarm.y
    );
    if (!alarmPanelEl) return;

    const innerPad = ConsoleTheme.contentPad;
    const contentWidth = Layout.alarm.width - innerPad * 2;
    const contentHeight = Layout.alarm.height - innerPad * 2;

    this.alarmPanel = new AlarmPanel(contentWidth, contentHeight);
    alarmPanelEl.content.addChild(this.alarmPanel);
  }

  private initLogPanel(): void {
    const logPanelEl = this.panels.find(
      (p) => p.x === Layout.log.x && p.y === Layout.log.y
    );
    if (!logPanelEl) return;

    const innerPad = ConsoleTheme.contentPad;
    const contentWidth = Layout.log.width - innerPad * 2;
    const contentHeight = Layout.log.height - innerPad * 2;

    this.logPanel = new LogPanel(contentWidth, contentHeight);
    logPanelEl.content.addChild(this.logPanel);
  }

  private initPowerDisplay(): void {
    const panel = this.panels.find(
      (p) => p.x === Layout.powerSys.x && p.y === Layout.powerSys.y
    );
    if (!panel) return;

    this.powerDisplay = new PowerDisplay();
    panel.content.addChild(this.powerDisplay);
  }

  private initPropulsionDisplay(): void {
    const panel = this.panels.find(
      (p) => p.x === Layout.propulsionSys.x && p.y === Layout.propulsionSys.y
    );
    if (!panel) return;

    this.propulsionDisplay = new PropulsionDisplay();
    panel.content.addChild(this.propulsionDisplay);
  }

  private initLifeSupportDisplay(): void {
    const panel = this.panels.find(
      (p) => p.x === Layout.lifeSupport.x && p.y === Layout.lifeSupport.y
    );
    if (!panel) return;

    this.lifeSupportDisplay = new LifeSupportDisplay();
    panel.content.addChild(this.lifeSupportDisplay);
  }

  private initPowerDistDisplay(): void {
    const panel = this.panels.find(
      (p) => p.x === Layout.powerDist.x && p.y === Layout.powerDist.y
    );
    if (!panel) return;

    this.powerDistDisplay = new PowerDistributionDisplay();
    panel.content.addChild(this.powerDistDisplay);
  }

  private initGravEnvDisplay(): void {
    const panel = this.panels.find(
      (p) => p.x === Layout.gravEnv.x && p.y === Layout.gravEnv.y
    );
    if (!panel) return;

    this.gravEnvDisplay = new GravityEnvironmentDisplay();
    panel.content.addChild(this.gravEnvDisplay);
  }

  private initAlarmMatrix(): void {
    const panel = this.panels.find(
      (p) => p.x === Layout.alarmMatrix.x && p.y === Layout.alarmMatrix.y
    );
    if (!panel) return;

    const innerPad = ConsoleTheme.contentPad;
    const contentWidth = Layout.alarmMatrix.width - innerPad * 2;

    this.alarmMatrix = new AlarmMatrix(contentWidth);
    panel.content.addChild(this.alarmMatrix);
  }

  private initSystemSummary(): void {
    const panel = this.panels.find(
      (p) => p.x === Layout.systemSummary.x && p.y === Layout.systemSummary.y
    );
    if (!panel) return;

    this.systemSummary = new SystemSummary();
    panel.content.addChild(this.systemSummary);
  }

  update(dt: number): void {
    this.commandTerminal?.update(dt);
    this.exteriorView?.update(dt);
    this.alarmMatrix?.update(dt);
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

      await new Promise<void>((resolve) => {
        this.commandTerminal?.startTyping(computerLine.id, response, resolve);
      });
    } finally {
      this.busy = false;
      this.commandTerminal?.setBusy(false);
      this.inputController?.focus();
    }
  };

  destroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.inputController?.destroy();
    for (const panel of this.panels) {
      panel.destroy({ children: true });
    }
    this.panels = [];
    super.destroy({ children: true });
  }
}
