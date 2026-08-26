import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import type { NavigationDisplayData } from "../data/types";

const NAV_REFRESH_MS = 10_000;

export class NavigationMap extends Container {
  private background: Graphics;
  private gridGraphics: Graphics;
  private plotGraphics: Graphics;
  private markersGraphics: Graphics;

  private rangeLabel: Text;
  private etaLabel: Text;

  private viewWidth: number;
  private viewHeight: number;

  private lastUpdateTime = 0;

  constructor(width: number, height: number) {
    super();

    this.viewWidth = width;
    this.viewHeight = height;

    this.background = new Graphics();
    this.addChild(this.background);

    this.gridGraphics = new Graphics();
    this.addChild(this.gridGraphics);

    this.plotGraphics = new Graphics();
    this.addChild(this.plotGraphics);

    this.markersGraphics = new Graphics();
    this.addChild(this.markersGraphics);

    const labelBg = new Graphics();
    const labelY = height - ConsoleTheme.spacing.lg - ConsoleTheme.font.valueSize - ConsoleTheme.spacing.xs;
    labelBg
      .rect(0, labelY, width, height - labelY)
      .fill(ConsoleTheme.colors.screen);
    this.addChild(labelBg);

    const labelStyle = new TextStyle({
      fontFamily: ConsoleTheme.font.family,
      fontSize: ConsoleTheme.font.valueSize,
      fill: ConsoleTheme.colors.textDim,
    });

    this.rangeLabel = new Text({ text: "RNG ---", style: labelStyle });
    this.rangeLabel.x = ConsoleTheme.spacing.sm;
    this.rangeLabel.y = height - ConsoleTheme.spacing.lg - ConsoleTheme.font.valueSize;
    this.addChild(this.rangeLabel);

    this.etaLabel = new Text({ text: "ETA --:--:--", style: labelStyle });
    this.etaLabel.x = width - ConsoleTheme.spacing.sm - 90;
    this.etaLabel.y = height - ConsoleTheme.spacing.lg - ConsoleTheme.font.valueSize;
    this.addChild(this.etaLabel);

    this.drawBackground();
    this.drawGrid();
    this.drawLabels();
  }

  setData(data: NavigationDisplayData): void {
    this.plotGraphics.clear();
    this.markersGraphics.clear();

    if (data.trajectoryPoints && data.trajectoryPoints.length > 1) {
      this.plotGraphics.moveTo(data.trajectoryPoints[0].x, data.trajectoryPoints[0].y);
      for (let i = 1; i < data.trajectoryPoints.length; i++) {
        this.plotGraphics.lineTo(data.trajectoryPoints[i].x, data.trajectoryPoints[i].y);
      }
      this.plotGraphics.stroke({ color: ConsoleTheme.colors.grid, width: 1 });
    }

    const shipSize = 4;
    this.markersGraphics
      .rect(data.shipX - shipSize / 2, data.shipY - shipSize / 2, shipSize, shipSize)
      .fill(ConsoleTheme.colors.green);

    const destSize = 4;
    this.markersGraphics
      .rect(data.destinationX - destSize / 2, data.destinationY - destSize / 2, destSize, destSize)
      .stroke({ color: ConsoleTheme.colors.yellow, width: 1 });

    this.rangeLabel.text = `RNG ${formatRangeKm(data.rangeKm)}`;
    this.etaLabel.text = `ETA ${formatDuration(data.etaSeconds)}`;
  }

  private drawBackground(): void {
    this.background
      .rect(0, 0, this.viewWidth, this.viewHeight)
      .fill(ConsoleTheme.colors.screen);
  }

  private drawGrid(): void {
    const spacing = 20;

    for (let x = spacing; x < this.viewWidth; x += spacing) {
      this.drawDashedLine(this.gridGraphics, x, 0, x, this.viewHeight);
    }

    for (let y = spacing; y < this.viewHeight; y += spacing) {
      this.drawDashedLine(this.gridGraphics, 0, y, this.viewWidth, y);
    }
  }

  private drawDashedLine(g: Graphics, x1: number, y1: number, x2: number, y2: number): void {
    const dash = 4;
    const gap = 4;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const ux = dx / len;
    const uy = dy / len;
    let dist = 0;
    let drawing = true;

    while (dist < len) {
      const segLen = Math.min(dash, len - dist);
      const sx = x1 + ux * dist;
      const sy = y1 + uy * dist;
      const ex = x1 + ux * (dist + segLen);
      const ey = y1 + uy * (dist + segLen);

      if (drawing) {
        g.moveTo(sx, sy).lineTo(ex, ey);
      }

      dist += segLen;
      drawing = !drawing;
    }

    g.stroke({ color: ConsoleTheme.colors.grid, width: 1 });
  }

  private drawLabels(): void {
  }
}

function formatRangeKm(km: number): string {
  if (km >= 1_000_000) {
    return `${(km / 1_000_000).toFixed(2)}M KM`;
  }
  if (km >= 1_000) {
    return `${(km / 1_000).toFixed(1)}K KM`;
  }
  return `${km} KM`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
