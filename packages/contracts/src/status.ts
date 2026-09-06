export type SystemStatus =
  | "nominal"
  | "degraded"
  | "warning"
  | "critical"
  | "offline";

export type IndicatorState = "off" | "nominal" | "warning" | "alarm";
