export interface PanelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutRegions {
  exteriorView: PanelRect;
  navMap: PanelRect;
  mainTerminal: PanelRect;
  alarm: PanelRect;
  log: PanelRect;
  alarmMatrix: PanelRect;
  powerSys: PanelRect;
  propulsionSys: PanelRect;
  lifeSupport: PanelRect;
  powerDist: PanelRect;
  gravEnv: PanelRect;
  systemSummary: PanelRect;
}

const W = 1280;
const H = 720;

const CHASSIS_PAD = 14;
const PANEL_GAP = 6;

const RIGHT_COL_W = 200;
const LEFT_COL_W = 200;
const BOTTOM_ROW_H = 90;
const MIDDLE_ROW_H = 200;

const ALARM_MATRIX_W = RIGHT_COL_W;

const contentW = W - CHASSIS_PAD * 2;
const contentH = H - CHASSIS_PAD * 2;

const topRowH = contentH - BOTTOM_ROW_H - MIDDLE_ROW_H - PANEL_GAP * 2;

const leftColW = LEFT_COL_W;
const rightColW = RIGHT_COL_W;
const centerColW = contentW - leftColW - rightColW - PANEL_GAP * 2;

const leftX = CHASSIS_PAD;
const centerX = leftX + leftColW + PANEL_GAP;
const rightX = centerX + centerColW + PANEL_GAP;

const topY = CHASSIS_PAD;
const midY = topY + topRowH + PANEL_GAP;
const botY = midY + MIDDLE_ROW_H + PANEL_GAP;

const leftSplitH = (topRowH - PANEL_GAP) / 2;

const rightSplitH = (topRowH + PANEL_GAP + MIDDLE_ROW_H - PANEL_GAP) / 2;

const midBottomH = MIDDLE_ROW_H;
const midSubW = (centerColW - PANEL_GAP * 2) / 3;
const midBottomSubH = (midBottomH - PANEL_GAP) / 2;

export const DESIGN_WIDTH = W;
export const DESIGN_HEIGHT = H;

export const Layout: LayoutRegions = {
  exteriorView: {
    x: leftX,
    y: topY,
    width: leftColW,
    height: leftSplitH,
  },

  navMap: {
    x: leftX,
    y: topY + leftSplitH + PANEL_GAP,
    width: leftColW,
    height: leftSplitH,
  },

  mainTerminal: {
    x: centerX,
    y: topY,
    width: centerColW,
    height: topRowH + PANEL_GAP + MIDDLE_ROW_H,
  },

  alarm: {
    x: rightX,
    y: topY,
    width: rightColW,
    height: rightSplitH,
  },

  log: {
    x: rightX,
    y: topY + rightSplitH + PANEL_GAP,
    width: rightColW,
    height: rightSplitH,
  },

  powerSys: {
    x: centerX,
    y: midY,
    width: midSubW,
    height: midBottomSubH,
  },

  propulsionSys: {
    x: centerX + midSubW + PANEL_GAP,
    y: midY,
    width: midSubW,
    height: midBottomSubH,
  },

  lifeSupport: {
    x: centerX + (midSubW + PANEL_GAP) * 2,
    y: midY,
    width: midSubW,
    height: midBottomSubH,
  },

  powerDist: {
    x: centerX,
    y: midY + midBottomSubH + PANEL_GAP,
    width: midSubW,
    height: midBottomSubH,
  },

  gravEnv: {
    x: centerX + midSubW + PANEL_GAP,
    y: midY + midBottomSubH + PANEL_GAP,
    width: midSubW,
    height: midBottomSubH,
  },

  alarmMatrix: {
    x: rightX,
    y: topY + topRowH + PANEL_GAP + MIDDLE_ROW_H + PANEL_GAP,
    width: rightColW,
    height: BOTTOM_ROW_H,
  },

  systemSummary: {
    x: leftX,
    y: botY,
    width: contentW,
    height: BOTTOM_ROW_H,
  },
};
