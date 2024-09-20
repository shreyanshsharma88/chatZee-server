import cors from "cors";
import express, { Router } from "express";
import { parse } from "url";
import { chatRouter } from "./src/routes/chats";
import { getAllGroupsRouter, groupRouter } from "./src/routes/groups";
import { loginRoute, signupRoute } from "./src/routes/signup-login";
import { userDetailRouter } from "./src/routes/user";
import { userMap } from "./src/store";
import { AuthChecker } from "./src/utils/authChecker";
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
testRouter.get("/health", (req, res) => {
  res.send("Hello there");
  console.log("running");
});

app.use("/", testRouter);
app.use("/login", loginRoute);
app.use("/signup", signupRoute);

const authRouter = Router();
authRouter.use(AuthChecker);
app.use("/api", authRouter);
authRouter.use("/group", groupRouter);
authRouter.use("/getGroups", getAllGroupsRouter);
authRouter.use("/user", userDetailRouter);
authRouter.use("/chat", chatRouter);

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
