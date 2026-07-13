import http from "http";

import { Server } from "socket.io";

import "dotenv/config";

import app from "./app.js";

import { env } from "./config/env.js";

import { connectDB } from "./config/db.js";

import { socketHandler } from "./socket/socketHandler.js";

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    maxHttpBufferSize: 50 * 1024 * 1024,
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  socketHandler(io);

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
  });
};

startServer();
