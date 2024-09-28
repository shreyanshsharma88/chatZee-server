import WebSocket, { WebSocketServer } from "ws";
import { groupMap, userMap } from "./store";
import { TokenSocketMap } from "../app";
import { PrismaClient } from "@prisma/client";

const webSocketServer = new WebSocketServer({ noServer: true });

const prisma = new PrismaClient();
webSocketServer.on(
  "connection",
  (
    socket: WebSocket.WebSocket,
    metadata: { token: string; userId: string }
  ) => {
    socket.on("message", async (res: string) => {
      // TODO: THIS WONT WORK **MOST PROBABLY**
      // TODO: IF THIS WORKS, I DON'T THINK IT IS A GOOD APPROACH

      const data = JSON.parse(res);

      const groupId = data.groupId;
      const userId = data.userId;

      const [_, usersInGroup] = await Promise.all([
        // pool.query(
        //   "insert into chats (message, sent_by, sent_to) values ($1, $2, $3)",
        //   [data.message, userId, groupId]
        // ),
        // pool.query("select user_id from group_users where group_id = $1", [
        //   groupId,
        // ]),
        

        prisma.chats.create({
          data: {
            message: data.message,
            sent_by: userId,
            sent_to: groupId,
          },
        }),
        prisma.group_users.findMany({
          where: {
            group_id: groupId,
          },
          select: {
            user_id: true,
          },
        }),
      ]);

      const userIdsInGroup = usersInGroup.map(({ user_id }) => user_id);

      const response = JSON.stringify({
        userId,
        message: data.message.toString(),
      });

      for (const [_, { socket, userId }] of TokenSocketMap.entries()) {
        if (userIdsInGroup.includes(userId)) {
          socket?.send(response);
        }
      }
    });
  }
);

export default webSocketServer;
