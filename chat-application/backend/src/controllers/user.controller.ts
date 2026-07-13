import { Response, Request } from "express";
import fs from "fs";
import path from "path";

import User from "../models/User.js";
import Message from "../models/Message.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Get Logged In User
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get All Users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({
      _id: {
        $ne: req.user?.id,
      },
    }).select("-password -__v");

    const usersWithUnread = await Promise.all(
      users.map(async (u) => {
        const unreadCount = await Message.countDocuments({
          sender: u._id,
          receiver: req.user?.id,
          isRead: false,
          deletedBy: { $ne: req.user?.id },
        });

        return {
          ...u.toObject(),
          unreadCount,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      users: usersWithUnread,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Search Users
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.query as string;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await User.find({
      $and: [
        {
          _id: {
            $ne: req.user?.id,
          },
        },

        {
          $or: [
            {
              name: {
                $regex: query,
                $options: "i",
              },
            },

            {
              email: {
                $regex: query,
                $options: "i",
              },
            },
          ],
        },
      ],
    }).select("-password -__v");

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const saveAvatarImage = (base64Data: string): string => {
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

  const uniqueFileName = `avatar-${Date.now()}.${extension}`;
  const filePath = path.join(uploadDir, uniqueFileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${uniqueFileName}`;
};

// Update Logged In User Profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, bio, avatar } = req.body;
    const updates: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      updates.name = name.trim();
    }

    if (bio !== undefined) {
      updates.bio = bio.trim();
    }

    if (avatar) {
      if (avatar.startsWith("data:image/")) {
        try {
          const avatarPath = saveAvatarImage(avatar);
          updates.avatar = avatarPath;
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid avatar image format",
          });
        }
      } else if (avatar === "" || avatar === null) {
        updates.avatar = "";
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    ).select("-password -__v");

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
