import { Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";

export function measureLabelWidth(label: string): number {
  const style = new TextStyle({
    fontFamily: ConsoleTheme.font.family,
    fontSize: ConsoleTheme.font.valueSize,
    letterSpacing: ConsoleTheme.font.letterSpacing,
  });
  const t = new Text({ text: label, style });
  return t.width;
}
