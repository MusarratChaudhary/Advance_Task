import express from "express";
import { protect } from "../middleware/auth.Middleware.js";
import {
  createGroup,
  getUserGroups,
  addMembers,
  removeMember,
  getGroupMessages,
} from "../controllers/group.controller.js";

const router = express.Router();

// Create group
router.post("/", protect, createGroup);

// Get user's groups
router.get("/", protect, getUserGroups);

// Add members
router.post("/:groupId/members", protect, addMembers);

// Remove member
router.delete("/:groupId/members/:memberId", protect, removeMember);

// Get group messages
router.get("/:groupId/messages", protect, getGroupMessages);

export default router;
