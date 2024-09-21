import WebSocket, { WebSocketServer } from "ws";
import { groupMap, userMap } from "./store";
import { pool } from "./db/dbConnection";
import { TokenSocketMap } from "../app";

const webSocketServer = new WebSocketServer({ noServer: true });

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
        pool.query(
          "insert into chats (message, sent_by, sent_to) values ($1, $2, $3)",
          [data.message, userId, groupId]
        ),
        pool.query("select user_id from group_members where group_id = $1", [
          groupId,
        ]),
      ]);

      await pool.query("select user_id");

      const response = JSON.stringify({
        userId,
        message: data.message.toString(),
      });

      for (const [_, { socket, userId }] of TokenSocketMap.entries()) {
        if (usersInGroup.rows.includes(userId)) {
          socket?.send(response);
        }
      }
    });
  }
);

export default webSocketServer;
