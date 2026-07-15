import { Request, Response } from "express";

import Team from "../models/Team";
import User from "../models/User";

// =================================
// Create Team
// =================================

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    const userId = (req as any).user.id;

    if (!name) {
      return res.status(400).json({
        success: false,

        message: "Team name is required",
      });
    }

    const team = await Team.create({
      name,

      description,

      createdBy: userId,

      members: [userId],
    });

    return res.status(201).json({
      success: true,

      message: "Team created successfully",

      team,
    });
  } catch (error) {
    console.error("Create Team Error:", error);

    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// =================================
// Get Teams
// =================================

export const getTeams = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const teams = await Team.find({
      members: userId,
    })

      .populate("createdBy", "name email")

      .populate("members", "name email role");

    return res.status(200).json({
      success: true,

      count: teams.length,

      teams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// =================================
// Get Single Team
// =================================

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id)

      .populate("members", "name email role");

    if (!team) {
      return res.status(404).json({
        success: false,

        message: "Team not found",
      });
    }

    return res.status(200).json({
      success: true,

      team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// =================================
// Add Member
// =================================

export const addMember = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,

        message: "Team not found",
      });
    }

    if (team.members.includes(userId)) {
      return res.status(400).json({
        success: false,

        message: "User already in team",
      });
    }

    team.members.push(userId);

    await team.save();

    return res.status(200).json({
      success: true,

      message: "Member added successfully",

      team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// =================================
// Remove Member
// =================================

export const removeMember = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,

        message: "Team not found",
      });
    }

    team.members = team.members.filter(
      (member) => member.toString() !== userId,
    );

    await team.save();

    return res.status(200).json({
      success: true,

      message: "Member removed successfully",

      team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// =================================
// Delete Team
// =================================

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,

        message: "Team not found",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Team deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};
