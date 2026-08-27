import { Container } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import { TelemetryText } from "../components/TelemetryText";
import type { PropulsionTelemetry } from "../data/types";
import { formatPercent } from "../utils/formatting";
import { formatStatus, statusColor } from "../utils/status";
import { measureLabelWidth } from "../utils/measureLabelWidth";

const LABELS = ["THRUST", "FUEL", "DRIVE"];
const maxLabelWidth = Math.max(...LABELS.map(measureLabelWidth));

export class PropulsionDisplay extends Container {
  private thrust: TelemetryText;
  private fuel: TelemetryText;
  private drive: TelemetryText;

  constructor() {
    super();

    this.x = ConsoleTheme.spacing.sm;

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
    this.thrust.setValue(formatPercent(data.thrust));
    this.fuel.setValue(formatPercent(data.fuel));
    this.drive.setValue(formatStatus(data.driveStatus));
    this.drive.setColor(statusColor(data.driveStatus));
  }
}
