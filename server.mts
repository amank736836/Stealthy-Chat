import { parse as parseCookie } from "cookie";
import next from "next";
import { getToken } from "next-auth/jwt";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const userSocketIDs = new Map();
const onlineUsers = new Set();

const httpServer = createServer(handle);
export const io = new Server(httpServer);

app.prepare().then(() => {
  io.use(async (socket, next) => {
    try {
      const cookies = parseCookie(socket.request.headers.cookie || "");
      const token = cookies[process.env.STEALTHY_CHAT_TOKEN_NAME!];

      if (!token) {
        return next(new Error("Authentication token not found"));
      }

      const decoded = await getToken({
        req: { headers: socket.request.headers as Record<string, string> },
        secret: process.env.AUTH_SECRET!,
        cookieName: process.env.STEALTHY_CHAT_TOKEN_NAME!,
      });

      if (!decoded) {
        return next(new Error("Authentication token is invalid"));
      }

      socket.request.user = decoded;

      next();
    } catch (err) {
      console.error("Cookie parsing error:", err);
      return next(
        err instanceof Error ? err : new Error("Cookie parsing error")
      );
    }
  });

  io.on("connection", async (socket) => {
    try {
      console.log(`A user connected with ID: ${socket.id}`);

      const user = socket.request.user;

      if (!user?._id) {
        console.error("User ID not found");
        return;
      }

      userSocketIDs.set(user._id.toString(), socket.id);
      onlineUsers.add(user._id.toString());

      socket.on("NEW_MESSAGE", async ({ chatId, message, members }) => {
        const messageForRealTime = {
          _id: uuid(),
          attachments: [],
          content: message,
          sender: {
            _id: user._id,
            name: user.name,
          },
          chat: chatId,
          createdAt: new Date().toISOString(),
        };

        const messageForDB = {
          content: message,
          chat: chatId,
          sender: user._id,
          attachments: [],
        };

        const membersSocket = getSockets(members);

        if (!io) {
          console.error("Socket.io instance is not available.");
          return;
        }

        io.to(membersSocket).emit("NEW_MESSAGE", {
          chatId,
          message: messageForRealTime,
        });

        io.to(membersSocket).emit("NEW_MESSAGE_ALERT", {
          chatId,
        });
      });

      socket.on("START_TYPING", ({ chatId, members, senderId }) => {
        const membersSocket = getSockets(members);
        socket.to(membersSocket).emit("START_TYPING", {
          chatId,
          senderId,
        });
      });

      socket.on("STOP_TYPING", ({ chatId, members, senderId }) => {
        const membersSocket = getSockets(members);
        socket.to(membersSocket).emit("STOP_TYPING", {
          chatId,
          senderId,
        });
      });
      socket.on("CHAT_JOINED", ({ chatId, userId, members }) => {
        onlineUsers.add(userId.toString());
        const membersSocket = getSockets(members);
        if (!io) {
          console.error("Socket.io instance is not available.");
          return;
        }
        io.to(membersSocket).emit("ONLINE_USERS", {
          onlineUsers: Array.from(onlineUsers),
          chatId,
        });
      });

      socket.on("CHAT_LEAVED", ({ chatId, userId, members }) => {
        onlineUsers.delete(userId.toString());
        const membersSocket = getSockets(members);
        if (!io) {
          console.error("Socket.io instance is not available.");
          return;
        }
        io.to(membersSocket).emit("ONLINE_USERS", {
          onlineUsers: Array.from(onlineUsers),
          chatId,
        });
      });

      socket.on("disconnect", () => {
        userSocketIDs.delete(user._id.toString());
        onlineUsers.delete(user._id.toString());
        socket.broadcast.emit("ONLINE_USERS", {
          onlineUsers: Array.from(onlineUsers),
        });
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    } catch (error) {
      console.error("Error in socket connection:", error);
      socket.emit("error", "An error occurred during the connection");
    }
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  httpServer.on("error", (err: Error) => {
    console.error("Server error:", err);
    throw err;
  });
});

export const getSockets = (users: Object[] = []) => {
  return users
    .map((user) => userSocketIDs.get(user.toString()))
    .filter(Boolean);
};

export const emitEvent = (event: string, users: Object[], data: any = "") => {
  const userSockets = getSockets(users);
  io.to(userSockets).emit(event, data);
};
