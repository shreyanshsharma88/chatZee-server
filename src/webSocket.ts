import { PrismaClient } from "@prisma/client";
import WebSocket, { WebSocketServer } from "ws";
import { TokenSocketMap } from "../app";
import { randomUUID } from "crypto";
import { DATE } from "sequelize";

const webSocketServer = new WebSocketServer({ noServer: true });

const prisma = new PrismaClient();
webSocketServer.on(
  "connection",
  (
    socket: WebSocket.WebSocket,
    metadata: { token: string; userId: string; username: string }
  ) => {
    try {
      socket.on("message", async (res: string) => {
        // TODO: THIS WONT WORK **MOST PROBABLY**
        // TODO: OPTIMIZE THIS

        const data = JSON.parse(res);

        const groupId = data.groupId;
        const userId = data.userId;

        const usersInGroup = await prisma.group_users.findMany({
          where: {
            group_id: groupId,
          },
          select: {
            user_id: true,
          },
        });

        const userIdsInGroup = usersInGroup.map(({ user_id }) => user_id);

        const response = JSON.stringify({
          sentBy: userId,
          sentTo: groupId,
          message: data.message?.toString(),
          id: randomUUID(),
          time: data.time,
          username: data.username,
        });

        for (const [_, { socket, userId }] of TokenSocketMap.entries()) {
          if (userIdsInGroup.includes(userId)) {
            socket?.send(response);
          }
        }

        if (!!data.message) {
          await prisma.chats.create({
            data: {
              message: data.message,
              sent_by: userId,
              sent_to: groupId,
            },
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
);

export default webSocketServer;
