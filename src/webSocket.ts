import { PrismaClient } from "@prisma/client";
import WebSocket, { WebSocketServer } from "ws";
import { TokenSocketMap } from "../app";

const webSocketServer = new WebSocketServer({ noServer: true });

const prisma = new PrismaClient();
webSocketServer.on(
  "connection",
  (
    socket: WebSocket.WebSocket,
    metadata: { token: string; userId: string; username: string }
  ) => {
    socket.on("message", async (res: string) => {
      // TODO: THIS WONT WORK **MOST PROBABLY**
      // TODO: IF THIS WORKS, I DON'T THINK IT IS A GOOD APPROACH

      const data = JSON.parse(res);

      const groupId = data.groupId;
      const userId = data.userId;

      const [message, usersInGroup, user] = await Promise.all([
        // pool.query(
        //   "insert into chats (message, sent_by, sent_to) values ($1, $2, $3)",
        //   [data.message, userId, groupId]
        // ),
        // pool.query("select user_id from group_users where group_id = $1", [
        //   groupId,
        // ]),

        // TODO:  OPTIMIZE THIS SHIT

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
        prisma.users.findUnique({
          where: {
            id: userId,
          },
        }),
      ]);

      const userIdsInGroup = usersInGroup.map(({ user_id }) => user_id);

      const response = JSON.stringify({
        sentBy: message.sent_by,
        sentTo: message.sent_to,
        message: message.message.toString(),
        id: message.id,
        time: message.time_stamp,
        username: user?.username,
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
