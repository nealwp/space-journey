import { Container, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import { TelemetryText } from "../components/TelemetryText";
import type { EnvironmentTelemetry } from "../data/types";

const LABELS = ["G-FORCE", "RAD", "TEMP"];

function measureLabelWidth(label: string): number {
  const style = new TextStyle({
    fontFamily: ConsoleTheme.font.family,
    fontSize: ConsoleTheme.font.valueSize,
    letterSpacing: 1,
  });
  const t = new Text({ text: label, style });
  return t.width;
}

const maxLabelWidth = Math.max(...LABELS.map(measureLabelWidth));

export class GravityEnvironmentDisplay extends Container {
  private gForce: TelemetryText;
  private radiation: TelemetryText;
  private temp: TelemetryText;

  constructor() {
    super();

    const lineHeight = ConsoleTheme.font.valueSize + ConsoleTheme.spacing.xs;

    this.gForce = new TelemetryText({ label: "G-FORCE", labelWidth: maxLabelWidth });
    this.gForce.y = 0;
    this.addChild(this.gForce);

    this.radiation = new TelemetryText({ label: "RAD", labelWidth: maxLabelWidth });
    this.radiation.y = lineHeight;
    this.addChild(this.radiation);

    this.temp = new TelemetryText({ label: "TEMP", labelWidth: maxLabelWidth });
    this.temp.y = lineHeight * 2;
    this.addChild(this.temp);
  }

  setData(data: EnvironmentTelemetry): void {
    this.gForce.setValue(data.gForce.toFixed(2));
    this.radiation.setValue(`${data.radiation.toFixed(2)} mSv`);
    this.temp.setValue(`${data.temperature.toFixed(1)}C`);
  }
}
