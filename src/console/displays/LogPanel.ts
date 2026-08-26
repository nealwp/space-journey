import { Container, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";

export interface LogEntry {
  id: string;
  timestamp: string;
  text: string;
}

const MAX_CHARS = 22;

export class LogPanel extends Container {
  private viewWidth: number;
  private viewHeight: number;
  private entries: LogEntry[] = [];

  constructor(width: number, height: number) {
    super();

    this.viewWidth = width;
    this.viewHeight = height;
  }

  setData(logs: LogEntry[]): void {
    this.entries = logs;
    this.drawEntries();
  }

  private drawEntries(): void {
    this.removeChildren();

    const lineHeight = ConsoleTheme.font.labelSize + ConsoleTheme.spacing.xs;
    const maxVisible = Math.floor(this.viewHeight / lineHeight);

    const lines: { text: string; indent: boolean }[] = [];

    for (const entry of this.entries) {
      const prefix = `${entry.timestamp} `;
      const indentPad = " ".repeat(prefix.length);
      const availableChars = MAX_CHARS - prefix.length;

      const chunks = this.wrapText(entry.text, availableChars);

      for (let c = 0; c < chunks.length; c++) {
        if (c === 0) {
          lines.push({ text: `${prefix}${chunks[c]}`, indent: false });
        } else {
          lines.push({ text: `${indentPad}${chunks[c]}`, indent: true });
        }
      }
    }

    const visible = lines.slice(0, maxVisible);

    for (let i = 0; i < visible.length; i++) {
      const line = visible[i];

      const label = new Text({
        text: line.text,
        style: new TextStyle({
          fontFamily: ConsoleTheme.font.family,
          fontSize: ConsoleTheme.font.labelSize,
          fill: ConsoleTheme.colors.text,
          letterSpacing: 1,
        }),
      });
      label.x = ConsoleTheme.spacing.sm;
      label.y = i * lineHeight;
      this.addChild(label);
    }
  }

  private wrapText(text: string, maxChars: number): string[] {
    if (text.length <= maxChars) {
      return [text];
    }

    const words = text.split(" ");
    const chunks: string[] = [];
    let current = "";

    for (const word of words) {
      if (current.length === 0) {
        current = word;
      } else if (current.length + 1 + word.length <= maxChars) {
        current += ` ${word}`;
      } else {
        chunks.push(current);
        current = word;
      }
    }

    if (current.length > 0) {
      chunks.push(current);
    }

    return chunks;
  }
}
