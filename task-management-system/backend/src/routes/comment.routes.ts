import { Router } from "express";

import {
  addComment,
  getTaskComments,
  deleteComment,
} from "../controllers/comment.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

// Add comment

router.post("/tasks/:taskId/comments", addComment);

// Get comments

router.get("/tasks/:taskId/comments", getTaskComments);

// Delete comment

router.delete("/comments/:id", deleteComment);

export default router;
