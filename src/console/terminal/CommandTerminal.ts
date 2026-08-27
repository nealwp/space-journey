import { Container, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import type { TerminalLine } from "./TerminalBuffer";

export class CommandTerminal extends Container {
  private linesContainer: Container;
  private cursorText: Text;
  private inputPrefix: Text;
  private inputValue: Text;

  private currentLines: TerminalLine[] = [];
  private currentInput = "";
  private busy = false;
  private elapsed = 0;

  private lineWidth: number;
  private lineHeight: number;
  private availableHeight: number;

  constructor(width: number, height: number) {
    super();

    this.lineWidth = width;
    this.availableHeight = height;
    this.lineHeight = ConsoleTheme.font.terminalSize + ConsoleTheme.spacing.xs;

    this.linesContainer = new Container();
    this.linesContainer.x = ConsoleTheme.spacing.sm;
    this.addChild(this.linesContainer);

    const inputRow = new Container();
    inputRow.x = ConsoleTheme.spacing.sm;
    this.addChild(inputRow);

    const prefixStyle = new TextStyle({
      fontFamily: ConsoleTheme.font.family,
      fontSize: ConsoleTheme.font.terminalSize,
      fill: ConsoleTheme.colors.text,
    });

    this.inputPrefix = new Text({ text: "> ", style: prefixStyle });
    inputRow.addChild(this.inputPrefix);

    this.inputValue = new Text({ text: "", style: prefixStyle });
    this.inputValue.x = this.inputPrefix.width;
    inputRow.addChild(this.inputValue);

    const cursorStyle = new TextStyle({
      fontFamily: ConsoleTheme.font.family,
      fontSize: ConsoleTheme.font.terminalSize,
      fill: ConsoleTheme.colors.green,
    });

    this.cursorText = new Text({ text: "_", style: cursorStyle });
    this.cursorText.x = this.inputPrefix.width;
    inputRow.addChild(this.cursorText);

    this.rebuildLines();
  }

  setLines(lines: TerminalLine[]): void {
    this.currentLines = lines;
    this.rebuildLines();
  }

  setInput(value: string): void {
    this.currentInput = value;
    this.inputValue.text = value;
    this.cursorText.x = this.inputPrefix.width + this.inputValue.width;
  }

  setBusy(value: boolean): void {
    this.busy = value;
  }

  update(dt: number): void {
    this.elapsed += dt;
    const visible = Math.floor(this.elapsed / ConsoleTheme.blinkIntervalMs) % 2 === 0;
    this.cursorText.visible = visible && !this.busy;
  }

  private rebuildLines(): void {
    this.linesContainer.removeChildren();

    const baseStyle = new TextStyle({
      fontFamily: ConsoleTheme.font.family,
      fontSize: ConsoleTheme.font.terminalSize,
      fill: ConsoleTheme.colors.text,
      wordWrap: true,
      wordWrapWidth: this.lineWidth,
    });

    const dimStyle = new TextStyle({
      fontFamily: ConsoleTheme.font.family,
      fontSize: ConsoleTheme.font.terminalSize,
      fill: ConsoleTheme.colors.textDim,
      wordWrap: true,
      wordWrapWidth: this.lineWidth,
    });

    let y = 0;

    for (const line of this.currentLines) {
      let prefix = "";

      if (line.type === "captain") {
        prefix = "> ";
      }

      const lineStyle = line.type === "system"
        ? dimStyle
        : baseStyle;

      const text = new Text({ text: prefix + line.text, style: lineStyle });
      text.y = y;
      this.linesContainer.addChild(text);

      y += this.lineHeight;
    }

    const inputY = y + ConsoleTheme.spacing.xs;
    const totalContentHeight = inputY + this.lineHeight;

    if (totalContentHeight > this.availableHeight) {
      this.linesContainer.y = this.availableHeight - totalContentHeight;
    } else {
      this.linesContainer.y = 0;
    }

    this.positionInput(inputY);
  }

  private positionInput(y: number): void {
    const inputRow = this.children[1];
    if (inputRow) {
      inputRow.y = y;
    }
  }
}
