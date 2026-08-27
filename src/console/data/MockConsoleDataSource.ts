import type { ConsoleDataSource } from "./ConsoleDataSource";
import type { ConsoleSnapshot } from "./ConsoleSnapshot";
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
  IndicatorState,
} from "./types";
import { Layout } from "../core/ConsoleLayout";
import { ConsoleTheme } from "../core/ConsoleTheme";

type Listener = (snapshot: ConsoleSnapshot) => void;

const TICK_MS = 1000;

const INITIAL_MISSION: MissionTelemetry = {
  missionId: "VOY-2847",
  destination: "STATION EREBUS",
  elapsed: 2533,
  rangeKm: 2_426_812,
};

const INITIAL_ALARMS: AlarmEntry[] = [
  { id: "a1", severity: "alarm", text: "PWR DIST B" },
  { id: "a2", severity: "alarm", text: "COOL LOOP B TEMP" },
  { id: "w1", severity: "warning", text: "H20 LVL LOW" },
];

const INITIAL_LOGS: LogEntry[] = [
  { id: "l1", timestamp: "10:13:02", text: "NAV SOL UPDT" },
  { id: "l2", timestamp: "10:15:47", text: "PWR DIST B VOLT FLUC" },
  { id: "l3", timestamp: "10:16:12", text: "COOL LOOP B TEMP HIGH" },
  { id: "l4", timestamp: "10:18:33", text: "COMM LINK OK" },
  { id: "l5", timestamp: "10:20:01", text: "FUEL CELLS NOMINAL" },
];

const LOG_POOL: { text: string; severity: "info" | "warning" }[] = [
  { text: "NAV SOL UPDT", severity: "info" },
  { text: "PWR BUS A FLUCT", severity: "warning" },
  { text: "COOL LOOP A STABLE", severity: "info" },
  { text: "COMM HANDSHAKE OK", severity: "info" },
  { text: "FUEL CELLS NOMINAL", severity: "info" },
  { text: "O2 RECIRC FILTER", severity: "warning" },
  { text: "THRUST VECTOR ADJ", severity: "info" },
  { text: "LIFE SUPP B NOM", severity: "info" },
  { text: "NAV STAR FIX", severity: "info" },
  { text: "PWR GRID REBAL", severity: "info" },
];

const TITLE_OFFSET = ConsoleTheme.spacing.xs + ConsoleTheme.font.titleSize + ConsoleTheme.spacing.xs;

function getNavContentDimensions(): { w: number; h: number } {
  return {
    w: Layout.navMap.width - ConsoleTheme.contentPad * 2,
    h: Layout.navMap.height - ConsoleTheme.contentPad - TITLE_OFFSET,
  };
}

function buildTrajectory(
  shipX: number,
  shipY: number,
  destX: number,
  destY: number,
): { x: number; y: number }[] {
  const midX = (shipX + destX) / 2;
  const midY = (shipY + destY) / 2;
  const curveOffset = (destX - shipX) * 0.2;

  return [
    { x: shipX, y: shipY },
    { x: shipX + (midX - shipX) * 0.4, y: shipY - curveOffset },
    { x: midX, y: midY - curveOffset * 1.2 },
    { x: midX + (destX - midX) * 0.5, y: midY - curveOffset * 0.4 },
    { x: destX, y: destY },
  ];
}

function formatTimestamp(totalSeconds: number): string {
  const baseHours = 10;
  const baseMinutes = 20;
  const h = baseHours + Math.floor((baseMinutes * 60 + totalSeconds) / 3600);
  const m = Math.floor(((baseMinutes * 60 + totalSeconds) % 3600) / 60);
  const s = Math.floor((totalSeconds) % 60);
  return `${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export class MockConsoleDataSource implements ConsoleDataSource {
  private listeners: Listener[] = [];
  private interval: ReturnType<typeof setInterval> | null = null;
  private tickCount = 0;
  private latestSnapshot: ConsoleSnapshot;
  private logs: LogEntry[] = [...INITIAL_LOGS];
  private logIndex = 0;

  constructor() {
    this.latestSnapshot = this.generateSnapshot(0);
  }

  async getSnapshot(): Promise<ConsoleSnapshot> {
    return this.latestSnapshot;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);

    if (this.interval === null) {
      this.interval = setInterval(() => {
        this.tick();
      }, TICK_MS);
    }

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
      if (this.listeners.length === 0 && this.interval !== null) {
        clearInterval(this.interval);
        this.interval = null;
      }
    };
  }

  destroy(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.listeners = [];
  }

  private tick(): void {
    this.tickCount++;
    this.latestSnapshot = this.generateSnapshot(this.tickCount);
    for (const listener of this.listeners) {
      listener(this.latestSnapshot);
    }
  }

  private generateSnapshot(tick: number): ConsoleSnapshot {
    const t = tick;
    const nav = getNavContentDimensions();

    const shipX = nav.w * (0.3 + t * 0.0003);
    const shipY = nav.h * (0.4 - t * 0.0001);
    const destX = nav.w * 0.75;
    const destY = nav.h * 0.7;

    const range = Math.max(100_000, INITIAL_MISSION.rangeKm - t * 12);
    const elapsed = INITIAL_MISSION.elapsed + t;
    const eta = Math.max(0, Math.round(range / 800));

    const navigation: NavigationDisplayData = {
      shipX: Math.min(shipX, destX - 10),
      shipY: Math.max(shipY, 10),
      destinationX: destX,
      destinationY: destY,
      rangeKm: range,
      etaSeconds: eta,
      trajectoryPoints: buildTrajectory(
        Math.min(shipX, destX - 10),
        Math.max(shipY, 10),
        destX,
        destY,
      ),
    };

    const power: PowerTelemetry = {
      generatorA: Math.round(98 + Math.sin(t / 5) * 1.5),
      generatorB: Math.round(97 + Math.sin(t / 7 + 1) * 1.5),
      reserve: Math.max(5, Math.round(11 - t * 0.02 + Math.sin(t / 10) * 0.5)),
      status: t % 60 < 55 ? "nominal" : "degraded",
    };

    const propulsion: PropulsionTelemetry = {
      thrust: Math.round(75 + Math.sin(t / 8) * 2),
      fuel: Math.max(10, Math.round(62 - t * 0.015)),
      driveStatus: "nominal",
    };

    const lifeSupport: LifeSupportTelemetry = {
      o2: 21,
      co2: 0.04,
      temperature: +(22.4 + Math.sin(t / 12) * 0.3).toFixed(1),
      humidity: 45,
    };

    const powerDistribution: PowerDistributionTelemetry = {
      gridStatus: t % 45 < 42 ? "nominal" : "degraded",
    };

    const environment: EnvironmentTelemetry = {
      gForce: +(1.0 + Math.sin(t / 20) * 0.01).toFixed(2),
      radiation: +(0.12 + Math.sin(t / 15) * 0.02).toFixed(2),
      temperature: +(21.8 + Math.sin(t / 10) * 0.2).toFixed(1),
    };

    const rowAStates: IndicatorState[] = [
      "nominal",
      "nominal",
      t % 30 < 25 ? "nominal" : "warning",
      "nominal",
      t % 40 < 35 ? "alarm" : "nominal",
    ];
    const rowBStates: IndicatorState[] = [
      "nominal",
      t % 50 < 45 ? "alarm" : "nominal",
      "nominal",
      t % 35 < 30 ? "warning" : "nominal",
      "nominal",
    ];

    const alarmMatrix: AlarmMatrixData = {
      rowA: {
        labels: ["PWR", "PROP", "LIFE", "NAV", "COMM"],
        states: rowAStates,
      },
      rowB: {
        labels: ["COOL", "FUEL", "O2", "DCLK", "AUX"],
        states: rowBStates,
      },
    };

    const activeAlarms: AlarmEntry[] = [...INITIAL_ALARMS];
    if (t % 60 > 50) {
      activeAlarms.push({ id: `w-${t}`, severity: "warning", text: "NAV SIG DRIFT" });
    }

    const logInterval = 12;
    if (t > 0 && t % logInterval === 0) {
      const poolEntry = LOG_POOL[this.logIndex % LOG_POOL.length];
      this.logs.push({
        id: `log-${t}`,
        timestamp: formatTimestamp(t),
        text: poolEntry.text,
      });
      this.logIndex++;
    }

    const mission: MissionTelemetry = {
      missionId: INITIAL_MISSION.missionId,
      destination: INITIAL_MISSION.destination,
      elapsed,
      rangeKm: range,
    };

    return {
      timestamp: Date.now(),
      navigation,
      power,
      propulsion,
      lifeSupport,
      powerDistribution,
      environment,
      alarmMatrix,
      activeAlarms,
      logs: this.logs,
      mission,
    };
  }
}
