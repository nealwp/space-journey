import { Container } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import { TelemetryText } from "../components/TelemetryText";
import type { PowerTelemetry } from "../data/types";
import { formatPercent } from "../utils/formatting";
import { formatStatus, statusColor } from "../utils/status";
import { measureLabelWidth } from "../utils/measureLabelWidth";

const LABELS = ["GEN A", "GEN B", "RESRV", "STAT"];
const maxLabelWidth = Math.max(...LABELS.map(measureLabelWidth));

export class PowerDisplay extends Container {
  private genA: TelemetryText;
  private genB: TelemetryText;
  private reserve: TelemetryText;
  private status: TelemetryText;

  constructor() {
    super();

    const lineHeight = ConsoleTheme.font.valueSize + ConsoleTheme.spacing.xs;

    this.genA = new TelemetryText({ label: "GEN A", labelWidth: maxLabelWidth });
    this.genA.y = 0;
    this.addChild(this.genA);

    this.genB = new TelemetryText({ label: "GEN B", labelWidth: maxLabelWidth });
    this.genB.y = lineHeight;
    this.addChild(this.genB);

    this.reserve = new TelemetryText({ label: "RESRV", labelWidth: maxLabelWidth });
    this.reserve.y = lineHeight * 2;
    this.addChild(this.reserve);

    this.status = new TelemetryText({ label: "STAT", labelWidth: maxLabelWidth });
    this.status.y = lineHeight * 3;
    this.addChild(this.status);
  }

  setData(data: PowerTelemetry): void {
    this.genA.setValue(formatPercent(data.generatorA));
    this.genB.setValue(formatPercent(data.generatorB));
    this.reserve.setValue(formatPercent(data.reserve));
    this.status.setValue(formatStatus(data.status));
    this.status.setColor(statusColor(data.status));
  }
}
