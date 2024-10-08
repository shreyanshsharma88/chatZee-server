import cors from "cors";
import express, { Router } from "express";
import { parse } from "url";
import { chatRouter } from "./src/routes/chats";
import { getAllGroupsRouter, groupRouter } from "./src/routes/groups";
import { loginRoute, signupRoute } from "./src/routes/signup-login";
import { userDetailRouter } from "./src/routes/user";
import { AuthChecker } from "./src/utils/authChecker";
import webSocketServer from "./src/webSocket";
import jsonwebtoken from "jsonwebtoken";
import { WebSocket } from "ws";
import { JWT_SECRET } from "./src/utils/constants";
// import { sequelize } from "./src/db/dbConnection";

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

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log("connected to db");
//   })
//   .catch((e) => {
//     console.log(e, "error connecting to db");
//   });
const testRouter = Router();
testRouter.get("/health", (req, res) => {
  res.send("Hello there");
  console.log("running");
});

//  TODO: ADD MODELS
app.use("/", testRouter);
app.use("/login", loginRoute);
app.use("/signup", signupRoute);

const authRouter = Router();
authRouter.use(AuthChecker);
app.use("/auth", authRouter);
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

  const token = query!.slice(7);
  console.log({ token });

  webSocketServer.handleUpgrade(request, socket, head as Buffer, (socket) => {
    jsonwebtoken.verify(token, JWT_SECRET, (err: any, jwtUser: any) => {
      if (err) {
        console.log("Invalid token");
        request.destroy();
        return;
      }
      TokenSocketMap.set(token, { socket: socket, userId: jwtUser.id });
      const metadata = {
        userId: jwtUser.id,
        token,
        name: jwtUser.username
      };
      webSocketServer.emit("connection", socket, metadata);
    });
  });
});

export const TokenSocketMap = new Map<
  string,
  { socket: WebSocket; userId: string }
>();
