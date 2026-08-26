import { Container, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import { TelemetryText } from "../components/TelemetryText";
import type { LifeSupportTelemetry } from "../data/types";

const LABELS = ["O2", "CO2", "TEMP", "HUMID"];

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

export class LifeSupportDisplay extends Container {
  private o2: TelemetryText;
  private co2: TelemetryText;
  private temp: TelemetryText;
  private humid: TelemetryText;

  constructor() {
    super();

    const lineHeight = ConsoleTheme.font.valueSize + ConsoleTheme.spacing.xs;

    this.o2 = new TelemetryText({ label: "O2", labelWidth: maxLabelWidth });
    this.o2.y = 0;
    this.addChild(this.o2);

    this.co2 = new TelemetryText({ label: "CO2", labelWidth: maxLabelWidth });
    this.co2.y = lineHeight;
    this.addChild(this.co2);

    this.temp = new TelemetryText({ label: "TEMP", labelWidth: maxLabelWidth });
    this.temp.y = lineHeight * 2;
    this.addChild(this.temp);

    this.humid = new TelemetryText({ label: "HUMID", labelWidth: maxLabelWidth });
    this.humid.y = lineHeight * 3;
    this.addChild(this.humid);
  }

  setData(data: LifeSupportTelemetry): void {
    this.o2.setValue(`${data.o2}%`);
    this.co2.setValue(`${data.co2}%`);
    this.temp.setValue(`${data.temperature.toFixed(1)}C`);
    this.humid.setValue(`${data.humidity}%`);
  }
}
