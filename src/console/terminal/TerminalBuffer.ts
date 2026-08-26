export interface TerminalLine {
  id: string;
  type: "system" | "captain" | "computer";
  text: string;
}

export class TerminalBuffer {
  private lines: TerminalLine[] = [];
  private maxLines = 100;

  addLine(line: TerminalLine): void {
    this.lines.push(line);
    if (this.lines.length > this.maxLines) {
      this.lines = this.lines.slice(this.lines.length - this.maxLines);
    }
  }

  getLines(): TerminalLine[] {
    return [...this.lines];
  }

  clear(): void {
    this.lines = [];
  }
}
