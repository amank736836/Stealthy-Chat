import UserModel from "../model/user.model";
import { ErrorHandler, TryCatch } from "./error";
import jwt from "jsonwebtoken";
import { Request } from "express";
import { Socket } from "socket.io";
import { IncomingMessage } from "http";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface SocketWithUser
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
  user: any;
  request: IncomingMessage & {
    cookies: {
      [key: string]: string;
    };
  };
}

const isAuthenticated = TryCatch(async (req, res, next) => {
  const token = req.cookies[process.env.STEALTHY_NOTE_TOKEN_NAME!];

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET!);

  if (!decodedData || typeof decodedData === "string") {
    return next(new ErrorHandler("Invalid Token", 401));
  }

  req.userId = decodedData.id;

  next();
});

const isAdminAuthenticated = TryCatch(async (req, res, next) => {
  const token = req.cookies[process.env.STEALTHY_NOTE_ADMIN_TOKEN_NAME!];

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET!);

  if (!decodedData || typeof decodedData === "string") {
    return next(new ErrorHandler("Invalid Token", 401));
  }

  const adminSecretKey = decodedData.secretKey;
  const isMatch = adminSecretKey === process.env.ADMIN_SECRET_KEY;

  if (!isMatch) {
    return next(new ErrorHandler("Invalid Admin secret key", 401));
  }

  next();
});

const isSocketAuthenticated = async (
  err: Error | null,
  socket: SocketWithUser,
  next: (err?: any) => void
) => {
  if (err) {
    return next(
      new ErrorHandler(err?.message || "Socket authentication error", 401)
    );
  }

  try {
    const authToken =
      socket.request.cookies[process.env.STEALTHY_NOTE_TOKEN_NAME!];

    if (!authToken) {
      return next(
        new ErrorHandler("Please Login to access this resource", 401)
      );
    }
    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET!);

    if (!decodedData || typeof decodedData === "string") {
      return next(new ErrorHandler("Invalid Token", 401));
    }

    const user = await UserModel.findById(decodedData.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    socket.user = user;

    return next();
  } catch (error: unknown) {
    console.error(error);
    return next(
      new ErrorHandler(
        error instanceof Error ? error.message : "Socket authentication error",
        401
      )
    );
  }
};

export { isAdminAuthenticated, isAuthenticated, isSocketAuthenticated };
