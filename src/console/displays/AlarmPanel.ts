import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import type { AlarmEntry } from "../data/types";

export class AlarmPanel extends Container {
  private viewWidth: number;
  private viewHeight: number;
  private entries: AlarmEntry[] = [];

  constructor(width: number, height: number) {
    super();

    this.viewWidth = width;
    this.viewHeight = height;
  }

  setData(alarms: AlarmEntry[]): void {
    this.entries = alarms;
    this.drawEntries();
  }

  private drawEntries(): void {
    this.removeChildren();

    const lineHeight = ConsoleTheme.font.valueSize + ConsoleTheme.spacing.xs;
    const maxVisible = Math.floor(this.viewHeight / lineHeight);

    const visible = this.entries.slice(0, maxVisible);

    for (let i = 0; i < visible.length; i++) {
      const entry = visible[i];
      const prefix = entry.severity === "alarm" ? "ALRM " : "WARN ";
      const color = entry.severity === "alarm"
        ? ConsoleTheme.colors.red
        : ConsoleTheme.colors.yellow;

      const label = new Text({
        text: `${prefix}${entry.text}`,
        style: new TextStyle({
          fontFamily: ConsoleTheme.font.family,
          fontSize: ConsoleTheme.font.valueSize,
          fill: color,
          letterSpacing: 1,
        }),
      });
      label.x = ConsoleTheme.spacing.sm;
      label.y = i * lineHeight;
      this.addChild(label);
    }
  }
}
