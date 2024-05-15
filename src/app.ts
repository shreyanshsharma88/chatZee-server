import cors from "cors";
import express from "express";
import {
  getGroupsRouter,
  addGroupRouter,
  addUserToGroupRouter,
  getGroupDetailsRouter,
  getUsersRouter,
  loginRouter,
} from "./routes";
import { parse } from "url";
import { userMap } from "./store";
import webSocketServer from "./webSocket";
import { getUserDetailsRouter } from "./routes/user";

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
app.use("/getGroupDetails", getGroupDetailsRouter);
app.use("/getGroups", getGroupsRouter);
app.use("/users", getUsersRouter);
app.use("/user", getUserDetailsRouter);

export const server = app.listen(8080, () => {
  console.log("Server up at 8080");
});
export default app;

server.on("upgrade", (request, socket, head: Buffer) => {
  const { query } = parse(request.url ?? "");

  const userId = query!.slice(7);

  if (!userMap.has(userId)) {
    request.destroy();
  }

  webSocketServer.handleUpgrade(request, socket, head as Buffer, (socket) => {
    const userName = userMap.get(userId)?.userName ?? "";

    userMap.set(userId, { userName, socket });

    const metadata = {
      userData: { userName },
      userId,
    };

    webSocketServer.emit("connection", socket, metadata);
  });
});
