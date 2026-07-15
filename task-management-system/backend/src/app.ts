import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";

// Routes

import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import teamRoutes from "./routes/team.routes";
import commentRoutes from "./routes/comment.routes";

// Error Middleware

import { notFound, errorHandler } from "./middleware/error.middleware";

const app = express();

// ===============================
// Security Middleware
// ===============================

app.use(helmet());

// Rate Limiting

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {
    success: false,

    message: "Too many requests, please try again later",
  },
});

app.use(limiter);

// ===============================
// CORS
// ===============================

app.use(
  cors({
    origin: env.CLIENT_URL,

    credentials: true,
  }),
);

// ===============================
// Body Parser
// ===============================

app.use(express.json());

app.use(cookieParser());

// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/teams", teamRoutes);

app.use("/api", commentRoutes);

// ===============================
// Health Check
// ===============================

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,

    message: "TaskPilot API running 🚀",
  });
});

// ===============================
// Error Handling
// ===============================

app.use(notFound);

app.use(errorHandler);

export default app;
