import { Container } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import { TelemetryText } from "../components/TelemetryText";
import type { LifeSupportTelemetry } from "../data/types";
import { formatPercent, formatTemperature } from "../utils/formatting";
import { measureLabelWidth } from "../utils/measureLabelWidth";

const LABELS = ["O2", "CO2", "TEMP", "HUMID"];
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
    this.o2.setValue(formatPercent(data.o2));
    this.co2.setValue(formatPercent(data.co2));
    this.temp.setValue(formatTemperature(data.temperature));
    this.humid.setValue(formatPercent(data.humidity));
  }
}
