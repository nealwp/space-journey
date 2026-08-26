import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "./core/ConsoleTheme";
import { Layout, DESIGN_WIDTH, DESIGN_HEIGHT, PanelRect } from "./core/ConsoleLayout";
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
  private panelGraphics: Graphics[] = [];

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
      const g = this.drawPanel(rect, panelLabels[key] ?? key.toUpperCase());
      this.panelGraphics.push(g);
      this.addChild(g);
    }
  }

  private drawPanel(rect: PanelRect, label: string): Graphics {
    const g = new Graphics();

    g.rect(rect.x, rect.y, rect.width, rect.height)
      .fill(ConsoleTheme.colors.bezel);

    const innerPad = ConsoleTheme.border.inner + 2;

    g.rect(
        rect.x + innerPad,
        rect.y + innerPad,
        rect.width - innerPad * 2,
        rect.height - innerPad * 2
      )
      .fill(ConsoleTheme.colors.screen);

    const labelStyle = new TextStyle({
      fontFamily: ConsoleTheme.font.family,
      fontSize: ConsoleTheme.font.titleSize,
      fill: ConsoleTheme.colors.textDim,
      letterSpacing: 1,
    });

    const labelText = new Text({ text: label, style: labelStyle });
    labelText.x = rect.x + ConsoleTheme.spacing.sm;
    labelText.y = rect.y + ConsoleTheme.spacing.xs;
    g.addChild(labelText);

    return g;
  }

  destroy(): void {
    for (const g of this.panelGraphics) {
      g.destroy({ children: true });
    }
    this.panelGraphics = [];
    super.destroy({ children: true });
  }
}
