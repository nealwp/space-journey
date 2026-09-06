import { Container, Graphics } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";

export interface BarMeterOptions {
  blocks?: number;
  width: number;
  height: number;
}

export class BarMeter extends Container {
  private fillGraphics: Graphics;
  private blockCount: number;
  private meterWidth: number;
  private meterHeight: number;
  private currentValue = 0;

  constructor(options: BarMeterOptions) {
    super();

    this.blockCount = options.blocks ?? 10;
    this.meterWidth = options.width;
    this.meterHeight = options.height;

    this.fillGraphics = new Graphics();
    this.addChild(this.fillGraphics);

    this.draw();
  }

  setValue(value: number): void {
    this.currentValue = Math.max(0, Math.min(1, value));
    this.draw();
  }

  private draw(): void {
    this.fillGraphics.clear();

    const gap = 1;
    const blockWidth = (this.meterWidth - gap * (this.blockCount - 1)) / this.blockCount;
    const filledBlocks = Math.round(this.currentValue * this.blockCount);

    for (let i = 0; i < this.blockCount; i++) {
      const x = i * (blockWidth + gap);
      const color = i < filledBlocks
        ? ConsoleTheme.colors.green
        : ConsoleTheme.colors.chassisDark;

      this.fillGraphics
        .rect(x, 0, blockWidth, this.meterHeight)
        .fill(color);
    }
  }
}
