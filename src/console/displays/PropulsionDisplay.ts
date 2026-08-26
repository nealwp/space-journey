import { Container, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import type { TelemetryColor } from "../core/ConsoleTheme";
import { TelemetryText } from "../components/TelemetryText";
import type { PropulsionTelemetry, SystemStatus } from "../data/types";

const LABELS = ["THRUST", "FUEL", "DRIVE"];

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

export class PropulsionDisplay extends Container {
  private thrust: TelemetryText;
  private fuel: TelemetryText;
  private drive: TelemetryText;

  constructor() {
    super();

    const lineHeight = ConsoleTheme.font.valueSize + ConsoleTheme.spacing.xs;

    this.thrust = new TelemetryText({ label: "THRUST", labelWidth: maxLabelWidth });
    this.thrust.y = 0;
    this.addChild(this.thrust);

    this.fuel = new TelemetryText({ label: "FUEL", labelWidth: maxLabelWidth });
    this.fuel.y = lineHeight;
    this.addChild(this.fuel);

    this.drive = new TelemetryText({ label: "DRIVE", labelWidth: maxLabelWidth });
    this.drive.y = lineHeight * 2;
    this.addChild(this.drive);
  }

  setData(data: PropulsionTelemetry): void {
    this.thrust.setValue(`${data.thrust}%`);
    this.fuel.setValue(`${data.fuel}%`);
    this.drive.setValue(formatStatus(data.driveStatus));
    this.drive.setColor(statusColor(data.driveStatus));
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
