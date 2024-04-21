import cors from "cors";
import express from "express";
import { parse } from "url";
import WebSocket, { WebSocketServer } from "ws";
import addGroupRouter from "./routes/addGroup";
import addUserToGroupRouter from "./routes/addToGroup";
import getGroupDetailsRouter from "./routes/getGroupDetails";
import getGroupsRouter from "./routes/getGroups";
import loginRouter from "./routes/login";
import getUsersRouter from "./routes/users";
import { groupMap, userMap } from "./store";

const app = express();
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  preflightContinue: false,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/login", loginRouter);
app.use("/addGroup", addGroupRouter);
app.use("/addUserToGroup", addUserToGroupRouter);
app.use("/getGroupDetails/", getGroupDetailsRouter);
app.use("/getGroups", getGroupsRouter);
app.use("/users/", getUsersRouter);

export default app;

const server = app.listen(8080, () => {
  console.log("Server up at 8080");
});

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

server.on("upgrade", (request, socket, head: Buffer) => {
  const { query } = parse(request.url ?? "");

  const userId = query?.slice(7);

  if (!userMap.has(userId)) {
    request.destroy();
  }

  webSocketServer.handleUpgrade(request, socket, head as Buffer, (socket) => {
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
