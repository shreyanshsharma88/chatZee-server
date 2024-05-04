import { WebSocket } from "ws";

export interface IGroupMap {
  groupName: string;
  users?: { id: string; userName: string }[];
  chat?: { userId: string; message: string; userName: string }[];
  isDm: boolean;
}

export interface IUserMap {
  userName: string;
  socket?: WebSocket
}

export const userMap = new Map<string , IUserMap>();
export const groupMap = new Map<string, IGroupMap>();
