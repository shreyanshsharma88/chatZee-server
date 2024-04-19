export interface IGroupMap {
  groupName: string;
  users?: { id: string; userName: string }[];
  chat?: { userId: string; message: string; userName: string }[];
  isDm: boolean;
}

export const userMap = new Map();
export const groupMap = new Map<string, IGroupMap>();
