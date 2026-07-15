import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from "../controllers/auth.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

// Public routes

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

// Protected route

router.get("/me", protect, getMe);

export default router;
