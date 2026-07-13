import express from "express";

import {
  sendMessage,
  getMessages,
  clearChat,
} from "../controllers/message.controller.js";

import { protect } from "../middleware/auth.Middleware.js";

const router = express.Router();

// Send message
router.post("/", protect, sendMessage);

// Get conversation messages
router.get("/:userId", protect, getMessages);

// Clear chat — delete all messages between current user and userId
router.delete("/:userId", protect, clearChat);

export default router;
