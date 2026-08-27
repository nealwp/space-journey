import type {
  NavigationDisplayData,
  PowerTelemetry,
  PropulsionTelemetry,
  LifeSupportTelemetry,
  PowerDistributionTelemetry,
  EnvironmentTelemetry,
  AlarmMatrixData,
  AlarmEntry,
  LogEntry,
  MissionTelemetry,
} from "./types";

export interface ConsoleSnapshot {
  timestamp: number;
  navigation: NavigationDisplayData;
  power: PowerTelemetry;
  propulsion: PropulsionTelemetry;
  lifeSupport: LifeSupportTelemetry;
  powerDistribution: PowerDistributionTelemetry;
  environment: EnvironmentTelemetry;
  alarmMatrix: AlarmMatrixData;
  activeAlarms: AlarmEntry[];
  logs: LogEntry[];
  mission: MissionTelemetry;
}
