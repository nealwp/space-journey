import { Container } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import type { TelemetryColor } from "../core/ConsoleTheme";
import { TelemetryText } from "../components/TelemetryText";
import type { PowerDistributionTelemetry, SystemStatus } from "../data/types";

export class PowerDistributionDisplay extends Container {
  private grid: TelemetryText;

  constructor() {
    super();

    this.grid = new TelemetryText({ label: "GRID" });
    this.grid.y = 0;
    this.addChild(this.grid);
  }

  setData(data: PowerDistributionTelemetry): void {
    this.grid.setValue(formatStatus(data.gridStatus));
    this.grid.setColor(statusColor(data.gridStatus));
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
