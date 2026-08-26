import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";

interface Star {
  x: number;
  y: number;
  speed: number;
  brightness: number;
}

export class ExteriorView extends Container {
  private background: Graphics;
  private starsGraphics: Graphics;
  private stars: Star[] = [];

  private viewWidth: number;
  private viewHeight: number;

  constructor(width: number, height: number) {
    super();

    this.viewWidth = width;
    this.viewHeight = height;

    this.background = new Graphics();
    this.addChild(this.background);

    this.starsGraphics = new Graphics();
    this.addChild(this.starsGraphics);

    this.drawBackground();
    this.initStars();
    this.drawStars();
    this.drawLabels();
  }

  update(dt: number): void {
    const delta = dt / 16.667;

    for (const star of this.stars) {
      star.x += star.speed * delta;
      if (star.x > this.viewWidth) {
        star.x = 0;
        star.y = Math.random() * this.viewHeight;
      }
    }

    this.drawStars();
  }

  private drawBackground(): void {
    this.background
      .rect(0, 0, this.viewWidth, this.viewHeight)
      .fill(ConsoleTheme.colors.screen);
  }

  private initStars(): void {
    const count = 20;

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.viewWidth,
        y: Math.random() * this.viewHeight,
        speed: 0.025 + Math.random() * 0.1,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
  }

  private drawStars(): void {
    this.starsGraphics.clear();

    for (const star of this.stars) {
      const alpha = star.brightness;
      this.starsGraphics
        .rect(Math.round(star.x), Math.round(star.y), 1, 1)
        .fill({ color: ConsoleTheme.colors.text, alpha });
    }
  }

  private drawLabels(): void {
    const style = new TextStyle({
      fontFamily: ConsoleTheme.font.family,
      fontSize: ConsoleTheme.font.titleSize,
      fill: ConsoleTheme.colors.textDim,
      letterSpacing: 1,
    });

    const camLabel = new Text({ text: "CAM 04", style });
    camLabel.x = ConsoleTheme.spacing.sm;
    camLabel.y = ConsoleTheme.spacing.xs;
    this.addChild(camLabel);
  }
}
