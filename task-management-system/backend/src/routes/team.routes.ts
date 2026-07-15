import { Router } from "express";

import {
  createTeam,
  getTeams,
  getTeamById,
  addMember,
  removeMember,
  deleteTeam,
} from "../controllers/team.controller";

import { protect } from "../middleware/auth.middleware";

import { authorize } from "../middleware/role.middleware";

const router = Router();

// Authentication required

router.use(protect);

// ===============================
// View Teams
// ===============================

router.get("/", getTeams);

router.get("/:id", getTeamById);

// ===============================
// Create Team
// ADMIN + MANAGER
// ===============================

router.post("/", authorize("ADMIN", "MANAGER"), createTeam);

// ===============================
// Add Member
// ADMIN + MANAGER
// ===============================

router.post("/:id/members", authorize("ADMIN", "MANAGER"), addMember);

// ===============================
// Remove Member
// ADMIN + MANAGER
// ===============================

router.delete("/:id/members", authorize("ADMIN", "MANAGER"), removeMember);

// ===============================
// Delete Team
// ADMIN ONLY
// ===============================

router.delete("/:id", authorize("ADMIN"), deleteTeam);

export default router;
