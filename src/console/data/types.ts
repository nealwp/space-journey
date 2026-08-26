export interface Point {
  x: number;
  y: number;
}

export interface NavigationDisplayData {
  shipX: number;
  shipY: number;
  destinationX: number;
  destinationY: number;
  rangeKm: number;
  etaSeconds: number;
  trajectoryPoints?: Point[];
}
