import { Request, Response } from "express";
import fs from "fs";
import path from "path";

import Group from "../models/Group.js";
import GroupMessage from "../models/GroupMessage.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

const saveGroupImage = (base64Data: string): string => {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string");
  }

  const extension = matches[1].split("/")[1] || "png";
  const buffer = Buffer.from(matches[2], "base64");
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueFileName = `group-${Date.now()}.${extension}`;
  const filePath = path.join(uploadDir, uniqueFileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${uniqueFileName}`;
};

// Create Group
export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { groupName, members, groupImage } = req.body;

    if (!groupName?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Group name is required" });
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one member is required" });
    }

    const allMembers = Array.from(new Set([userId, ...members]));

    let imageUrl: string | undefined;
    if (groupImage && groupImage.startsWith("data:image/")) {
      try {
        imageUrl = saveGroupImage(groupImage);
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid image format" });
      }
    }

    const group = await Group.create({
      groupName: groupName.trim(),
      // groupImage: imageUrl || null,
      groupImage: groupImage || undefined,
      members: allMembers,
      admins: [userId],
      createdBy: userId,
    });

    const populated = await Group.findById(group._id)
      .populate("members", "name email avatar isOnline")
      .populate("admins", "name email avatar")
      .populate("createdBy", "name email avatar");

    return res.status(201).json({ success: true, group: populated });
  } catch (error) {
    console.error("Create group error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get User's Groups
export const getUserGroups = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const groups = await Group.find({ members: userId })
      .populate("members", "name email avatar isOnline")
      .populate("admins", "name email avatar")
      .populate("createdBy", "name email avatar")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, groups });
  } catch (error) {
    console.error("Get groups error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add Members
export const addMembers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { groupId } = req.params;
    const { members } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const isAdmin = group.admins.some((a) => a.toString() === userId);
    if (!isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Only admins can add members" });
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Members array is required" });
    }

    await Group.findByIdAndUpdate(groupId, {
      $addToSet: { members: { $each: members } },
    });

    const updated = await Group.findById(groupId)
      .populate("members", "name email avatar isOnline")
      .populate("admins", "name email avatar")
      .populate("createdBy", "name email avatar");

    return res.status(200).json({ success: true, group: updated });
  } catch (error) {
    console.error("Add members error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove Member
export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { groupId, memberId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const isAdmin = group.admins.some((a) => a.toString() === userId);
    const isSelf = memberId === userId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await Group.findByIdAndUpdate(groupId, {
      $pull: { members: memberId, admins: memberId },
    });

    const updated = await Group.findById(groupId)
      .populate("members", "name email avatar isOnline")
      .populate("admins", "name email avatar")
      .populate("createdBy", "name email avatar");

    return res.status(200).json({ success: true, group: updated });
  } catch (error) {
    console.error("Remove member error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Group Messages
export const getGroupMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const isMember = group.members.some((m) => m.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ success: false, message: "Not a member" });
    }

    const messages = await GroupMessage.find({
      groupId,
      deletedBy: { $ne: userId },
    })
      .populate("sender", "name email avatar")
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Get group messages error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
