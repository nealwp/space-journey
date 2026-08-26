import { Container, Graphics } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";

export type IndicatorState = "off" | "nominal" | "warning" | "alarm";

const STATE_COLORS: Record<IndicatorState, number | null> = {
  off: null,
  nominal: ConsoleTheme.colors.green,
  warning: ConsoleTheme.colors.yellow,
  alarm: ConsoleTheme.colors.red,
};

export class StatusIndicator extends Container {
  private light: Graphics;
  private indicatorSize: number;
  private currentState: IndicatorState = "off";
  private blinkTimer = 0;
  private blinkVisible = true;

  constructor(size = 6) {
    super();

    this.indicatorSize = size;

    this.light = new Graphics();
    this.addChild(this.light);

    this.drawLight();
  }

  setState(state: IndicatorState): void {
    if (this.currentState === state) return;

    this.currentState = state;
    this.blinkTimer = 0;
    this.blinkVisible = true;
    this.drawLight();
  }

  update(dt: number): void {
    if (this.currentState !== "alarm") return;

    this.blinkTimer += dt;
    if (this.blinkTimer >= 500) {
      this.blinkTimer -= 500;
      this.blinkVisible = !this.blinkVisible;
      this.light.visible = this.blinkVisible;
    }
  }

  private drawLight(): void {
    this.light.clear();

    const color = STATE_COLORS[this.currentState];
    if (color === null) {
      this.light
        .rect(0, 0, this.indicatorSize, this.indicatorSize)
        .fill(ConsoleTheme.colors.chassisDark);
    } else {
      this.light
        .rect(0, 0, this.indicatorSize, this.indicatorSize)
        .fill(color);
    }

    this.light.visible = true;
  }
}
