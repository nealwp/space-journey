import { ConsoleTheme } from "../core/ConsoleTheme";
import type { TelemetryColor } from "../core/ConsoleTheme";
import type { SystemStatus } from "../data/types";

export function formatStatus(s: SystemStatus): string {
  switch (s) {
    case "nominal": return "NOM";
    case "degraded": return "DEG";
    case "warning": return "WARN";
    case "critical": return "CRIT";
    case "offline": return "OFF";
  }
}

export function statusColor(s: SystemStatus): TelemetryColor {
  switch (s) {
    case "nominal": return ConsoleTheme.colors.green;
    case "degraded": return ConsoleTheme.colors.yellow;
    case "warning": return ConsoleTheme.colors.yellow;
    case "critical": return ConsoleTheme.colors.red;
    case "offline": return ConsoleTheme.colors.red;
  }
}
