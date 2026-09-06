import { Container, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import type { MissionTelemetry } from "../data/types";
import type { Disposable } from "../core/ConsoleApplication";
import { formatRangeKm, formatDuration } from "../utils/formatting";

export class SystemSummary extends Container implements Disposable {
  private text: Text;

  constructor() {
    super();

    const style = new TextStyle({
      fontFamily: ConsoleTheme.font.family,
      fontSize: ConsoleTheme.font.valueSize,
      fill: ConsoleTheme.colors.textDim,
      letterSpacing: ConsoleTheme.font.letterSpacing,
    });

    this.text = new Text({ text: "", style });
    this.text.x = ConsoleTheme.spacing.sm;
    this.text.y = 0;
    this.addChild(this.text);
  }

  setData(data: MissionTelemetry): void {
    const elapsed = formatDuration(data.elapsed);
    const range = formatRangeKm(data.rangeKm);
    this.text.text = `${data.missionId} | ${data.destination} | ${elapsed} | ${range}`;
  }

  update(dt: number): void {

  }

  destroy(): void {
    super.destroy({ children: true });
  }
}
