import { Container, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import type { TelemetryColor } from "../core/ConsoleTheme";
import { TelemetryText } from "../components/TelemetryText";
import type { PowerTelemetry, SystemStatus } from "../data/types";

const LABELS = ["GEN A", "GEN B", "RESRV", "STAT"];

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
    this.genA.setValue(`${data.generatorA}%`);
    this.genB.setValue(`${data.generatorB}%`);
    this.reserve.setValue(`${data.reserve}%`);
    this.status.setValue(formatStatus(data.status));
    this.status.setColor(statusColor(data.status));
  }
}

function formatStatus(s: SystemStatus): string {
  switch (s) {
    case "nominal": return "NOM";
    case "degraded": return "DEG";
    case "warning": return "WARN";
    case "critical": return "CRIT";
    case "offline": return "OFF";
  }
}

function statusColor(s: SystemStatus): TelemetryColor {
  switch (s) {
    case "nominal": return ConsoleTheme.colors.green;
    case "degraded": return ConsoleTheme.colors.yellow;
    case "warning": return ConsoleTheme.colors.yellow;
    case "critical": return ConsoleTheme.colors.red;
    case "offline": return ConsoleTheme.colors.red;
  }
}
