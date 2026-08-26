export interface Point {
  x: number;
  y: number;
}

export interface NavigationDisplayData {
  shipX: number;
  shipY: number;
  destinationX: number;
  destinationY: number;
  rangeKm: number;
  etaSeconds: number;
  trajectoryPoints?: Point[];
}

export type SystemStatus = "nominal" | "degraded" | "warning" | "critical" | "offline";

export interface PowerTelemetry {
  generatorA: number;
  generatorB: number;
  reserve: number;
  status: SystemStatus;
}

export interface PropulsionTelemetry {
  thrust: number;
  fuel: number;
  driveStatus: SystemStatus;
}

export interface LifeSupportTelemetry {
  o2: number;
  co2: number;
  temperature: number;
  humidity: number;
}

export interface PowerDistributionTelemetry {
  gridStatus: SystemStatus;
}

export interface EnvironmentTelemetry {
  gForce: number;
  radiation: number;
  temperature: number;
}
