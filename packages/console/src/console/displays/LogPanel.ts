import { Container, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import type { LogEntry } from "../data/types";

const MAX_CHARS = 22;
const CHARS_PER_SECOND = 40;

export class LogPanel extends Container {
  private viewWidth: number;
  private viewHeight: number;
  private entries: LogEntry[] = [];
  private knownIds = new Set<string>();

  private typingEntryId: string | null = null;
  private typingCharIndex = 0;
  private typingTimer = 0;
  private typingQueue: string[] = [];

  constructor(width: number, height: number) {
    super();

    this.viewWidth = width;
    this.viewHeight = height;
  }

  setData(logs: LogEntry[]): void {
    const prevIds = this.knownIds;

    for (const entry of logs) {
      if (!prevIds.has(entry.id)) {
        this.knownIds.add(entry.id);
        this.typingQueue.push(entry.id);
      }
    }

    this.entries = logs;

    if (this.typingEntryId === null && this.typingQueue.length > 0) {
      this.startNextTyping();
    }

    this.drawEntries();
  }

  update(dt: number): void {
    if (this.typingEntryId === null) return;

    this.typingTimer += dt;
    const charsToShow = Math.floor(this.typingTimer / (1000 / CHARS_PER_SECOND));

    const entry = this.entries.find((e) => e.id === this.typingEntryId);
    if (entry && charsToShow > this.typingCharIndex) {
      this.typingCharIndex = Math.min(charsToShow, entry.text.length);
      this.drawEntries();
    }

    if (entry && this.typingCharIndex >= entry.text.length) {
      this.typingEntryId = null;
      this.typingCharIndex = 0;
      this.typingTimer = 0;

      if (this.typingQueue.length > 0) {
        this.startNextTyping();
      }
    }
  }

  private startNextTyping(): void {
    const nextId = this.typingQueue.shift() ?? null;
    this.typingEntryId = nextId;
    this.typingCharIndex = 0;
    this.typingTimer = 0;
  }

  private drawEntries(): void {
    this.removeChildren();

    const lineHeight = ConsoleTheme.font.labelSize + ConsoleTheme.spacing.xs;
    const maxVisible = Math.floor(this.viewHeight / lineHeight);

    const entryLines: { text: string; indent: boolean }[][] = [];

    for (const entry of this.entries) {
      const prefix = `${entry.timestamp} `;
      const indentPad = " ".repeat(prefix.length);
      const availableChars = MAX_CHARS - prefix.length;

      let displayText = entry.text;
      if (entry.id === this.typingEntryId) {
        displayText = entry.text.substring(0, this.typingCharIndex);
      }

      const chunks = this.wrapText(displayText, availableChars);
      const lines: { text: string; indent: boolean }[] = [];

      for (let c = 0; c < chunks.length; c++) {
        if (c === 0) {
          lines.push({ text: `${prefix}${chunks[c]}`, indent: false });
        } else {
          lines.push({ text: `${indentPad}${chunks[c]}`, indent: true });
        }
      }

      entryLines.push(lines);
    }

    let totalLines = 0;
    let startIndex = entryLines.length;
    for (let i = entryLines.length - 1; i >= 0; i--) {
      totalLines += entryLines[i].length;
      if (totalLines > maxVisible) break;
      startIndex = i;
    }

    const visible: { text: string; indent: boolean }[] = [];
    for (let i = startIndex; i < entryLines.length; i++) {
      visible.push(...entryLines[i]);
    }

    for (let i = 0; i < visible.length; i++) {
      const line = visible[i];

      const label = new Text({
        text: line.text,
        style: new TextStyle({
          fontFamily: ConsoleTheme.font.family,
          fontSize: ConsoleTheme.font.labelSize,
          fill: ConsoleTheme.colors.text,
          letterSpacing: ConsoleTheme.font.letterSpacing,
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
