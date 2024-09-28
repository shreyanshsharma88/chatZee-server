import WebSocket, { WebSocketServer } from "ws";
import { groupMap, userMap } from "./store";
import { TokenSocketMap } from "../app";
import Chat from "./models/chats";
import GroupUser from "./models/groupUsers";

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
        // pool.query(
        //   "insert into chats (message, sent_by, sent_to) values ($1, $2, $3)",
        //   [data.message, userId, groupId]
        // ),
        // pool.query("select user_id from group_users where group_id = $1", [
        //   groupId,
        // ]),
        Chat.create({
          message: data.message,
          sent_by: userId,
          sent_to: groupId,
        }),
        GroupUser.findAll({
          attributes: ["user_id"],
          where: {
            group_id: groupId,
          },
        })
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
