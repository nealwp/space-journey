import { Container, Text, TextStyle } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";
import { StatusIndicator } from "../components/StatusIndicator";
import type { AlarmMatrixData, AlarmMatrixRow, IndicatorState } from "../data/types";
import type { Disposable } from "../core/ConsoleApplication";

const INDICATOR_SIZE = 6;

export class AlarmMatrix extends Container implements Disposable {
  private matrixWidth: number;
  private labelStyle: TextStyle;
  private rowA: StatusIndicator[] = [];
  private rowB: StatusIndicator[] = [];
  private rowALabels: Text[] = [];
  private rowBLabels: Text[] = [];

  constructor(width: number) {
    super();

    this.matrixWidth = width;

    this.labelStyle = new TextStyle({
      fontFamily: ConsoleTheme.font.family,
      fontSize: ConsoleTheme.font.titleSize,
      fill: ConsoleTheme.colors.textDim,
      letterSpacing: 1,
    });
  }

  setData(data: AlarmMatrixData): void {
    this.clearRow(this.rowA, this.rowALabels);
    this.clearRow(this.rowB, this.rowBLabels);

    const rowHeight = ConsoleTheme.font.titleSize + ConsoleTheme.spacing.xs + INDICATOR_SIZE + ConsoleTheme.spacing.sm;

    const { indicators: rowA, labels: rowALabels } = this.buildRow(data.rowA, 0);
    const { indicators: rowB, labels: rowBLabels } = this.buildRow(data.rowB, rowHeight);

    this.rowA = rowA;
    this.rowALabels = rowALabels;
    this.rowB = rowB;
    this.rowBLabels = rowBLabels;
  }

  private clearRow(indicators: StatusIndicator[], labels: Text[]): void {
    for (const label of labels) {
      if (label.parent) label.parent.removeChild(label);
      label.destroy();
    }
    labels.length = 0;
    for (const ind of indicators) {
      if (ind.parent) ind.parent.removeChild(ind);
      ind.destroy();
    }
    indicators.length = 0;
  }

  private buildRow(row: AlarmMatrixRow, yStart: number): { indicators: StatusIndicator[]; labels: Text[] } {
    const indicators: StatusIndicator[] = [];
    const labels: Text[] = [];
    const colWidth = this.matrixWidth / row.labels.length;
    const indicatorY = yStart + ConsoleTheme.font.titleSize + ConsoleTheme.spacing.xs;

    for (let i = 0; i < row.labels.length; i++) {
      const x = i * colWidth;

      const label = new Text({ text: row.labels[i], style: this.labelStyle });
      label.x = x + (colWidth - label.width) / 2;
      label.y = yStart;
      this.addChild(label);
      labels.push(label);

      const ind = new StatusIndicator(INDICATOR_SIZE);
      ind.x = x + (colWidth - INDICATOR_SIZE) / 2;
      ind.y = indicatorY;
      ind.setState(row.states[i]);
      this.addChild(ind);
      indicators.push(ind);
    }

    return { indicators, labels };
  }

  update(dt: number): void {
    for (const ind of this.rowA) ind.update(dt);
    for (const ind of this.rowB) ind.update(dt);
  }

  destroy(): void {
    super.destroy({ children: true });
  }
}
