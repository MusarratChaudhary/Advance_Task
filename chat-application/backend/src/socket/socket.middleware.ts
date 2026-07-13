import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

interface SocketWithUser extends Socket {
  user?: {
    id: string;
  };
}

export const socketAuth = (
  socket: SocketWithUser,
  next: (err?: Error) => void,
) => {
  try {
    const cookie = socket.handshake.headers.cookie;

    if (!cookie) {
      return next(new Error("Authentication required"));
    }

    const token = cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return next(new Error("Token missing"));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
    };

    socket.user = decoded;

    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
};
