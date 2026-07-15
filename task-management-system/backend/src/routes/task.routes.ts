import { Router } from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";

import { protect } from "../middleware/auth.middleware";

import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(protect);

// Anyone logged in can view tasks

router.get("/", getTasks);

router.get("/:id", getTaskById);

// Only Admin + Manager

router.post("/", authorize("ADMIN", "MANAGER"), createTask);

router.put("/:id", authorize("ADMIN", "MANAGER"), updateTask);

router.delete("/:id", authorize("ADMIN"), deleteTask);

export default router;
