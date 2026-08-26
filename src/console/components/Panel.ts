import { Container, Graphics, Rectangle, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";

export interface PanelOptions {
  width: number;
  height: number;
  title?: string;
}

export class Panel extends Container {
  readonly content: Container;

  private bezel: Graphics;
  private screen: Graphics;
  private contentMask: Graphics;
  private titleText: Text | null = null;

  private panelWidth: number;
  private panelHeight: number;

  constructor(options: PanelOptions) {
    super();

    this.panelWidth = options.width;
    this.panelHeight = options.height;

    this.bezel = new Graphics();
    this.addChild(this.bezel);

    this.screen = new Graphics();
    this.addChild(this.screen);

    this.content = new Container();
    this.addChild(this.content);

    this.contentMask = new Graphics();
    this.addChild(this.contentMask);
    this.content.mask = this.contentMask;

    if (options.title) {
      const style = new TextStyle({
        fontFamily: ConsoleTheme.font.family,
        fontSize: ConsoleTheme.font.titleSize,
        fill: ConsoleTheme.colors.textDim,
        letterSpacing: 1,
      });

      this.titleText = new Text({ text: options.title, style });
      this.addChild(this.titleText);
    }

    this.draw();
  }

  private draw(): void {
    this.bezel.clear();
    this.screen.clear();
    this.contentMask.clear();

    this.bezel
      .rect(0, 0, this.panelWidth, this.panelHeight)
      .fill(ConsoleTheme.colors.bezel);

    const innerPad = ConsoleTheme.border.inner + 2;

    this.screen
      .rect(innerPad, innerPad, this.panelWidth - innerPad * 2, this.panelHeight - innerPad * 2)
      .fill(ConsoleTheme.colors.screen);

    this.content.x = innerPad;

    const maskWidth = this.panelWidth - innerPad * 2;
    let maskY = innerPad;
    let maskHeight = this.panelHeight - innerPad * 2;

    if (this.titleText) {
      this.titleText.x = ConsoleTheme.spacing.sm;
      this.titleText.y = ConsoleTheme.spacing.xs;
      const titleOffset = ConsoleTheme.spacing.xs + ConsoleTheme.font.titleSize + ConsoleTheme.spacing.xs;
      maskY = innerPad + titleOffset;
      maskHeight = this.panelHeight - innerPad - titleOffset;
      this.content.y = maskY;
    } else {
      this.content.y = innerPad;
    }

    this.contentMask
      .rect(0, maskY, maskWidth, maskHeight)
      .fill(0xffffff);
  }

  resize(width: number, height: number): void {
    this.panelWidth = width;
    this.panelHeight = height;
    this.draw();
  }
}
