import WebSocket, { WebSocketServer } from "ws";
import { server } from "./app";
import { groupMap, userMap } from "./store";
import { parse } from "url";

const webSocketServer = new WebSocketServer({ noServer: true });

webSocketServer.on(
  "connection",
  (
    socket: WebSocket.WebSocket,
    metadata: { userData: { userName: string }; userId: string }
  ) => {
    const { userData, userId } = metadata;

    socket.on("message", (res: string) => {
      const data = JSON.parse(res);

      const groupId = data.groupId;
      const userId = data.userId;
      console.log({ groupMap, groupId, userId, data }, "test");
      groupMap.get(groupId)?.chat?.push({
        userId,
        message: data.message.toString(),
        userName: userMap.get(userId).userName,
      });
      const response = JSON.stringify({
        userId,
        message: data.message.toString(),
        userName: userData.userName,
        groupId,
      });

      for (const [_, { socket }] of userMap.entries()) {
        socket?.send(response);
      }
    });
  }
);

server.on("upgrade", (request, socket, head) => {
  const { query } = parse(request.url ?? "");

  const userId = query?.slice(7);

  if (!userMap.has(userId)) {
    request.destroy();
  }

  webSocketServer.handleUpgrade(request, socket, head, (socket) => {
    const { userName } = userMap.get(userId);

    const randomColor = Math.floor(Math.random() * 16777215).toString(16);

    userMap.set(userId, { userName, socket, colour: `#${randomColor}` });

    const metadata = {
      userData: { userName, colour: `#${randomColor}` },
      userId,
    };

    webSocketServer.emit("connection", socket, metadata);
  });
});
