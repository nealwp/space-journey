import { Container } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import { TelemetryText } from "../components/TelemetryText";
import type { PowerDistributionTelemetry } from "../data/types";
import { formatStatus, statusColor } from "../utils/status";

export class PowerDistributionDisplay extends Container {
  private grid: TelemetryText;

  constructor() {
    super();

    this.x = ConsoleTheme.spacing.sm;

    this.grid = new TelemetryText({ label: "GRID" });
    this.grid.y = 0;
    this.addChild(this.grid);
  }

  setData(data: PowerDistributionTelemetry): void {
    this.grid.setValue(formatStatus(data.gridStatus));
    this.grid.setColor(statusColor(data.gridStatus));
  }
}
