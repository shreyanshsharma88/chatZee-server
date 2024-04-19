"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const url_1 = require("url");
const uuid_1 = require("uuid");
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    preflightContinue: false,
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
const userMap = new Map();
const groupMap = new Map();
app.post("/login", (req, res, next) => {
    try {
        const { userName: userNameReq } = req.body;
        for (const [_, { userName }] of userMap.entries()) {
            if (userName === userNameReq) {
                return res.status(401).send("user already exists");
            }
        }
        const id = (0, uuid_1.v4)();
        userMap.set(id, { userName: userNameReq });
        return res.status(200).send({ id });
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
app.get("/users/:userId", (req, res, next) => {
    try {
        const { userId } = req.params;
        if (userMap.has(userId)) {
            {
                const users = Array.from(userMap.entries()).map((value) => {
                    if (value[0] !== userId)
                        return {
                            name: value[1].userName,
                            id: value[0],
                            isDmExisting: groupMap.has(`${userId}**${value[0]}`) ||
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
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
app.post("/addGroup", (req, res, next) => {
    try {
        const { groupName, uniqueId, isDm, uniqueId2 } = req.body;
        if (userMap.has(uniqueId)) {
            if (isDm && uniqueId2) {
                const [user1, user2] = groupName.split("**");
                if (groupMap.has(`${user1}**${user2}`) ||
                    groupMap.has(`${user2}**${user1}`)) {
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
            }
            else {
                for (const [_, { groupName: groupNameMap }] of groupMap.entries()) {
                    if (groupNameMap === groupName) {
                        return res
                            .status(401)
                            .send("Try another group name, this one already exists!");
                    }
                }
                const id = (0, uuid_1.v4)();
                groupMap.set(id, { groupName, users: [], chat: [], isDm });
                const groups = Array.from(groupMap.entries()).map((value) => ({
                    groupName: value[1].groupName,
                    id: value[0],
                }));
                return res.status(200).send(groups);
            }
        }
        else {
            return res.status(401).send("User not found");
        }
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
app.get("/getGroups", (req, res, next) => {
    try {
        const groups = Array.from(groupMap.entries())
            .filter((group) => group[1].isDm === false)
            .map((value) => ({
            groupName: value[1].groupName,
            id: value[0],
        }));
        return res.status(200).send(groups);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
app.post("/addUserToGroup/", (req, res, next) => {
    var _a;
    try {
        const { groupId, userId } = req.body;
        if (groupMap.has(groupId) && userMap.has(userId)) {
            const group = groupMap.get(groupId);
            (_a = group === null || group === void 0 ? void 0 : group.users) === null || _a === void 0 ? void 0 : _a.push({
                id: userId,
                userName: userMap.get(userId).userName,
            });
            groupMap.set(groupId, group);
            return res.status(200).send(group === null || group === void 0 ? void 0 : group.users);
        }
    }
    catch (err) {
        return res.status(500).send(err);
    }
});
app.get("/getGroupDetails/:groupId", (req, res, next) => {
    try {
        const { groupId } = req.params;
        if (groupMap.has(groupId)) {
            const group = groupMap.get(groupId);
            return res.status(200).send(group);
        }
        else {
            return res.status(401).send("Group not found");
        }
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
const webSocketServer = new ws_1.WebSocketServer({ noServer: true });
webSocketServer.on("connection", (socket, metadata) => {
    const { userData, userId } = metadata;
    socket.on("message", (res) => {
        var _a, _b;
        const data = JSON.parse(res);
        const groupId = data.groupId;
        const userId = data.userId;
        console.log({ groupMap, groupId, userId, data }, "test");
        (_b = (_a = groupMap.get(groupId)) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.push({
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
            socket === null || socket === void 0 ? void 0 : socket.send(response);
        }
    });
});
const server = app.listen(8080, () => {
    console.log("Server up at 8080");
});
server.on("upgrade", (request, socket, head) => {
    var _a;
    const { query } = (0, url_1.parse)((_a = request.url) !== null && _a !== void 0 ? _a : "");
    const userId = query === null || query === void 0 ? void 0 : query.slice(7);
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
