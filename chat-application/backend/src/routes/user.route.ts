import express from "express";

import {
  getMe,
  getUsers,
  searchUsers,
  updateProfile,
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.Middleware.js";

const router = express.Router();

// Get Logged In User
router.get("/me", protect, getMe);

// Search Users
router.get("/search", protect, searchUsers);

// Update profile
router.put("/profile", protect, updateProfile);

// Get All Users
router.get("/", protect, getUsers);

export default router;
