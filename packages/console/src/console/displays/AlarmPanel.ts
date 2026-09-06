import { Container, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import type { AlarmEntry } from "../data/types";

const CHARS_PER_SECOND = 40;

export class AlarmPanel extends Container {
  private viewWidth: number;
  private viewHeight: number;
  private entries: AlarmEntry[] = [];
  private typedTexts = new Set<string>();

  private typingEntryKey: string | null = null;
  private typingCharIndex = 0;
  private typingTimer = 0;
  private typingQueue: string[] = [];

  constructor(width: number, height: number) {
    super();

    this.viewWidth = width;
    this.viewHeight = height;
  }

  setData(alarms: AlarmEntry[]): void {
    for (const entry of alarms) {
      const key = `${entry.severity}:${entry.text}`;
      if (!this.typedTexts.has(key)) {
        this.typingQueue.push(key);
      }
    }

    this.entries = alarms;

    if (this.typingEntryKey === null && this.typingQueue.length > 0) {
      this.startNextTyping();
    }

    this.drawEntries();
  }

  update(dt: number): void {
    if (this.typingEntryKey === null) return;

    this.typingTimer += dt;
    const [severity, ...textParts] = this.typingEntryKey.split(":");
    const text = textParts.join(":");
    const entry = this.entries.find(
      (e) => e.severity === severity && e.text === text,
    );
    if (!entry) {
      this.typingEntryKey = null;
      return;
    }

    const prefix = entry.severity === "alarm" ? "ALRM " : "WARN ";
    const fullText = `${prefix}${entry.text}`;
    const charsToShow = Math.floor(this.typingTimer / (1000 / CHARS_PER_SECOND));

    if (charsToShow > this.typingCharIndex) {
      this.typingCharIndex = Math.min(charsToShow, fullText.length);
      this.drawEntries();
    }

    if (this.typingCharIndex >= fullText.length) {
      this.typedTexts.add(this.typingEntryKey);
      this.typingEntryKey = null;
      this.typingCharIndex = 0;
      this.typingTimer = 0;

      if (this.typingQueue.length > 0) {
        this.startNextTyping();
      }
    }
  }

  private startNextTyping(): void {
    const nextKey = this.typingQueue.shift() ?? null;
    this.typingEntryKey = nextKey;
    this.typingCharIndex = 0;
    this.typingTimer = 0;
  }

  private drawEntries(): void {
    this.removeChildren();

    const lineHeight = ConsoleTheme.font.valueSize + ConsoleTheme.spacing.xs;
    const maxVisible = Math.floor(this.viewHeight / lineHeight);

    const visible = this.entries.slice(0, maxVisible);

    for (let i = 0; i < visible.length; i++) {
      const entry = visible[i];
      const prefix = entry.severity === "alarm" ? "ALRM " : "WARN ";
      const color = entry.severity === "alarm"
        ? ConsoleTheme.colors.red
        : ConsoleTheme.colors.yellow;

      let displayText = `${prefix}${entry.text}`;
      const entryKey = `${entry.severity}:${entry.text}`;
      if (entryKey === this.typingEntryKey) {
        displayText = displayText.substring(0, this.typingCharIndex);
      }

      const label = new Text({
        text: displayText,
        style: new TextStyle({
          fontFamily: ConsoleTheme.font.family,
          fontSize: ConsoleTheme.font.valueSize,
          fill: color,
          letterSpacing: ConsoleTheme.font.letterSpacing,
        }),
      });
      label.x = ConsoleTheme.spacing.sm;
      label.y = i * lineHeight;
      this.addChild(label);
    }
  }
}
