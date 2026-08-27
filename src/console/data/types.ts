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

export type IndicatorState = "off" | "nominal" | "warning" | "alarm";

export interface AlarmMatrixRow {
  labels: string[];
  states: IndicatorState[];
}

export interface AlarmMatrixData {
  rowA: AlarmMatrixRow;
  rowB: AlarmMatrixRow;
}

export interface MissionTelemetry {
  missionId: string;
  destination: string;
  elapsed: number;
  rangeKm: number;
}

export interface AlarmEntry {
  id: string;
  severity: "warning" | "alarm";
  text: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  text: string;
}
