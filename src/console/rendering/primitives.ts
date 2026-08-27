import type { Graphics } from "pixi.js";
import { ConsoleTheme } from "../core/ConsoleTheme";

export function drawDashedLine(
  g: Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  const dash = 4;
  const gap = 4;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;

  const ux = dx / len;
  const uy = dy / len;
  let dist = 0;
  let drawing = true;

  while (dist < len) {
    const segLen = Math.min(dash, len - dist);
    const sx = x1 + ux * dist;
    const sy = y1 + uy * dist;
    const ex = x1 + ux * (dist + segLen);
    const ey = y1 + uy * (dist + segLen);

    if (drawing) {
      g.moveTo(sx, sy).lineTo(ex, ey);
    }

    dist += segLen;
    drawing = !drawing;
  }

  g.stroke({ color: ConsoleTheme.colors.grid, width: 1 });
}
