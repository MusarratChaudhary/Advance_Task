import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { env } from "./config/env.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.routes.js";
import groupRoutes from "./routes/group.routes.js";

import { protect } from "./middleware/auth.Middleware.js";

const app = express();

// Middlewares

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(cookieParser());

// Authentication Routes

app.use("/api/auth", authRoutes);

// User Routes

app.use("/api/users", userRoutes);

// Message Routes

app.use("/api/messages", messageRoutes);

// Group Routes

app.use("/api/groups", groupRoutes);

// Protected Route Testing

app.get("/api/profile", protect, (req, res) => {
  res.json({
    success: true,

    message: "Protected route working",

    user: req.user,
  });
});

// Health Check

app.get("/", (_req, res) => {
  res.json({
    success: true,

    message: "ChatSphere API Running 🚀",
  });
});

export default app;
