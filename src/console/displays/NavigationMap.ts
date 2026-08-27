import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import type { NavigationDisplayData } from "../data/types";
import { formatRangeKm, formatDuration } from "../utils/formatting";
import { drawDashedLine } from "../rendering/primitives";

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

  private lastPlotTime = 0;
  private pendingData: NavigationDisplayData | null = null;

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
      letterSpacing: ConsoleTheme.font.letterSpacing,
    });

    this.rangeLabel = new Text({ text: "RNG ---", style: labelStyle });
    this.rangeLabel.x = ConsoleTheme.spacing.sm;
    this.rangeLabel.y = height - ConsoleTheme.spacing.lg - ConsoleTheme.font.valueSize;
    this.addChild(this.rangeLabel);

    this.etaLabel = new Text({ text: "ETA --:--:--", style: labelStyle });
    this.etaLabel.anchor.set(1, 0);
    this.etaLabel.x = width - ConsoleTheme.spacing.sm;
    this.etaLabel.y = height - ConsoleTheme.spacing.lg - ConsoleTheme.font.valueSize;
    this.addChild(this.etaLabel);

    this.drawBackground();
    this.drawGrid();
  }

  setData(data: NavigationDisplayData): void {
    this.pendingData = data;

    this.rangeLabel.text = `RNG ${formatRangeKm(data.rangeKm)}`;
    this.etaLabel.text = `ETA ${formatDuration(data.etaSeconds)}`;

    const now = performance.now();
    if (now - this.lastPlotTime >= NAV_REFRESH_MS) {
      this.redrawPlot(data);
      this.lastPlotTime = now;
    }
  }

  private redrawPlot(data: NavigationDisplayData): void {
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
  }

  private drawBackground(): void {
    this.background
      .rect(0, 0, this.viewWidth, this.viewHeight)
      .fill(ConsoleTheme.colors.screen);
  }

  private drawGrid(): void {
    const spacing = 20;

    for (let x = spacing; x < this.viewWidth; x += spacing) {
      drawDashedLine(this.gridGraphics, x, 0, x, this.viewHeight);
    }

    for (let y = spacing; y < this.viewHeight; y += spacing) {
      drawDashedLine(this.gridGraphics, 0, y, this.viewWidth, y);
    }
  }
}
