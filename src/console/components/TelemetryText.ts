import { Container, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import type { TelemetryColor } from "../core/ConsoleTheme";

export interface TelemetryTextOptions {
  label?: string;
  value?: string;
  color?: TelemetryColor;
  labelWidth?: number;
}

export class TelemetryText extends Container {
  private labelText: Text;
  private valueText: Text;

  constructor(options: TelemetryTextOptions) {
    super();

    const labelStyle = new TextStyle({
      fontFamily: ConsoleTheme.font.family,
      fontSize: ConsoleTheme.font.valueSize,
      fill: ConsoleTheme.colors.textDim,
      letterSpacing: ConsoleTheme.font.letterSpacing,
    });

    this.labelText = new Text({ text: options.label ?? "", style: labelStyle });
    this.labelText.y = 0;
    this.addChild(this.labelText);

    const valueStyle = new TextStyle({
      fontFamily: ConsoleTheme.font.family,
      fontSize: ConsoleTheme.font.valueSize,
      fill: options.color ?? ConsoleTheme.colors.text,
      letterSpacing: ConsoleTheme.font.letterSpacing,
    });

    this.valueText = new Text({ text: options.value ?? "", style: valueStyle });
    this.valueText.x = (options.labelWidth ?? this.labelText.width) + ConsoleTheme.spacing.md;
    this.valueText.y = 0;
    this.addChild(this.valueText);
  }

  setValue(value: string): void {
    this.valueText.text = value;
  }

  setColor(color: TelemetryColor): void {
    this.valueText.style.fill = color;
  }
}
