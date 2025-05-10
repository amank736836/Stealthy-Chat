import { Server as NetServer, IncomingMessage } from "http";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { Server as SocketIOServer, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { v4 as uuid } from "uuid";

declare module "http" {
  interface IncomingMessage {
    cookies?: Record<string, string>;
    user?: any;
  }
}

export interface SocketWithUser
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
  user: any;
  request: IncomingMessage & {
    cookies: {
      [key: string]: string;
    };
  };
}

let io: SocketIOServer | null = null;
const userSocketIDs = new Map();
const onlineUsers = new Set();

export const initializeSocket = (server: NetServer) => {
  if (io) return io;

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookies = parseCookie(socket.request.headers.cookie || "");
    socket.request.cookies = Object.fromEntries(cookies) as Record<
      string,
      string
    >;
    const token = socket.request.cookies[process.env.STEALTHY_CHAT_TOKEN_NAME!];
  });

  io.on("connection", (socket) => {
    try {
      const user = socket.request.user;
      if (!user?._id) return;

      userSocketIDs.set(user._id.toString(), socket.id);

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
    } catch (error) {
      console.error("Socket error:", error);
    }
  });

  return io;
};

export const getSockets = (users: Object[] = []) => {
  return users
    .map((user) => userSocketIDs.get(user.toString()))
    .filter(Boolean);
};

export const emitEvent = (event: string, users: Object[], data: any = "") => {
  if (!io) {
    console.error("Socket.io instance is not available.");
    return;
  }

  const userSockets = getSockets(users);
  io.to(userSockets).emit(event, data);
};

export const getIO = () => io;
