import { parse } from "url";
import WebSocket, { WebSocketServer } from "ws";
import { groupMap, userMap } from "./store";

  
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

  export default webSocketServer
  
  