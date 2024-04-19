import express, { NextFunction, Request, Response } from "express";
import { parse } from "url";
import { v4 as uuid } from "uuid";
import WebSocket, { WebSocketServer } from "ws";
import cors from "cors";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  preflightContinue: false,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

interface IGroupMap {
  groupName: string;
  users?: { id: string; userName: string }[];
  chat?: { userId: string; message: string; userName: string }[];
  isDm: boolean;
}

const userMap = new Map();
const groupMap = new Map<string, IGroupMap>();

app.post("/login", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userName: userNameReq } = req.body as { userName: string };

    for (const [_, { userName }] of userMap.entries()) {
      if (userName === userNameReq) {
        return res.status(401).send("user already exists");
      }
    }

    const id = uuid();

    userMap.set(id, { userName: userNameReq });

    return res.status(200).send({ id });
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.get("/users/:userId", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (userMap.has(userId)) {
      {
        const users = Array.from(userMap.entries()).map((value) => {
          if (value[0] !== userId)
            return {
              name: value[1].userName,
              id: value[0],
              isDmExisting:
                groupMap.has(`${userId}**${value[0]}`) ||
                groupMap.has(`${value[0]}**${userId}`),
              dmID: groupMap.has(`${userId}**${value[0]}`)
                ? `${userId}**${value[0]}`
                : `${value[0]}**${userId}`,
            };
        });

        return res.status(200).send(users);
      }
      return res.status(401).send("User not found");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.post("/addGroup", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupName, uniqueId, isDm, uniqueId2 } = req.body as {
      groupName: string;
      uniqueId: string;
      isDm: boolean;
      uniqueId2?: string;
    };

    if (userMap.has(uniqueId)) {
      if (isDm && uniqueId2) {
        const [user1, user2] = groupName.split("**");
        if (
          groupMap.has(`${user1}**${user2}`) ||
          groupMap.has(`${user2}**${user1}`)
        ) {
          return res.status(401).send("Group already exists");
        }
        const id = `${uniqueId}**${uniqueId2}`;
        groupMap.set(id, {
          groupName,
          users: [
            {
              id: uniqueId,
              userName: userMap.get(uniqueId).userName,
            },
            {
              id: uniqueId2,
              userName: userMap.get(uniqueId2).userName,
            },
          ],
          chat: [],
          isDm,
        });
        const groups = Array.from(groupMap.entries()).map((value) => ({
          groupName: value[1].groupName,
          id: value[0],
        }));
        return res.status(200).send(groups);
      } else {
        for (const [_, { groupName: groupNameMap }] of groupMap.entries()) {
          if (groupNameMap === groupName) {
            return res
              .status(401)
              .send("Try another group name, this one already exists!");
          }
        }
        const id = uuid();
        groupMap.set(id, { groupName, users: [], chat: [], isDm });
        const groups = Array.from(groupMap.entries()).map((value) => ({
          groupName: value[1].groupName,
          id: value[0],
        }));
        return res.status(200).send(groups);
      }
    } else {
      return res.status(401).send("User not found");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.get("/getGroups", (req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = Array.from(groupMap.entries())
      .filter((group) => group[1].isDm === false)
      .map((value) => ({
        groupName: value[1].groupName,
        id: value[0],
      }));
    return res.status(200).send(groups);
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.post(
  "/addUserToGroup/",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupId, userId } = req.body as {
        groupId: string;
        userId: string;
      };
      if (groupMap.has(groupId) && userMap.has(userId)) {
        const group = groupMap.get(groupId);
        group?.users?.push({
          id: userId,
          userName: userMap.get(userId).userName,
        });
        groupMap.set(groupId, group as IGroupMap);
        return res.status(200).send(group?.users);
      }
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

app.get(
  "/getGroupDetails/:groupId",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupId } = req.params;
      if (groupMap.has(groupId)) {
        const group = groupMap.get(groupId);
        return res.status(200).send(group);
      } else {
        return res.status(401).send("Group not found");
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

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

const server = app.listen(8080, () => {
  console.log("Server up at 8080");
});

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
