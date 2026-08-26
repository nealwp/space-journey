import { Container, Graphics } from "pixi.js";
import { ConsoleTheme } from "./core/ConsoleTheme";
import { Layout, DESIGN_WIDTH, DESIGN_HEIGHT } from "./core/ConsoleLayout";
import { Panel } from "./components/Panel";
import type { Disposable } from "./core/ConsoleApplication";

const panelLabels: Record<string, string> = {
  exteriorView: "EXT VIEW",
  navMap: "NAV MAP",
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

  constructor() {
    super();
    this.drawChassis();
    this.drawPanels();
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

  destroy(): void {
    for (const panel of this.panels) {
      panel.destroy({ children: true });
    }
    this.panels = [];
    super.destroy({ children: true });
  }
}
