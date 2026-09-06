import type { SystemSnapshot } from "./snapshot";

export interface SystemUpdateMessage {
  type: "SYSTEM_UPDATE";
  systemId: string;
  snapshot: SystemSnapshot;
}

export type ServerMessage = SystemUpdateMessage;

export interface SubscribeMessage {
  type: "SUBSCRIBE";
  systemIds: string[];
}

export type ClientMessage = SubscribeMessage;