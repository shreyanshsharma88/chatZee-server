import cors from "cors";
import express, { Router } from "express";
import { parse } from "url";
import { loginRouter } from "./src/api/login";
import { addGroupRouter } from "./src/api/addGroup";
import { addUserToGroupRouter } from "./src/api/addToGroup";
import { getGroupDetailsRouter } from "./src/api/getGroupDetails";
import { getGroupsRouter } from "./src/api/getGroups";
import { getUsersRouter } from "./src/api/users";
import { getUserDetailsRouter } from "./src/api/user";
import { userMap } from "./src/store";
import webSocketServer from "./src/webSocket";

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

const testRouter = Router();
testRouter.get("", (req, res) => {
  res.send("Hello there");
  console.log("running");
});
app.use("/", testRouter);
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
