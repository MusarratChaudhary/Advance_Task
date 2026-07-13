import { Response, Request } from "express";

import Message from "../models/Message.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Send Message

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?.id;

    const { receiverId, text } = req.body;

    if (!senderId) {
      return res.status(401).json({
        success: false,

        message: "Unauthorized",
      });
    }

    if (!receiverId || !text?.trim()) {
      return res.status(400).json({
        success: false,

        message: "Receiver and message are required",
      });
    }

    const message = await Message.create({
      sender: senderId,

      receiver: receiverId,

      text: text.trim(),
    });

    return res.status(201).json({
      success: true,

      message,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// Get Chat History

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user?.id;

    const userId = req.params.userId;

    if (!currentUser) {
      return res.status(401).json({
        success: false,

        message: "Unauthorized",
      });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: currentUser,
          receiver: userId,
        },

        {
          sender: userId,
          receiver: currentUser,
        },
      ],

      deletedBy: { $ne: currentUser },
    })

      .sort({
        createdAt: 1,
      })

      .populate("sender", "name email avatar")

      .populate("receiver", "name email avatar");

    return res.status(200).json({
      success: true,

      messages,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// Clear Chat — delete all messages between currentUser and userId

export const clearChat = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user?.id;

    const userId = req.params.userId;

    if (!currentUser) {
      return res.status(401).json({
        success: false,

        message: "Unauthorized",
      });
    }

    await Message.deleteMany({
      $or: [
        {
          sender: currentUser,
          receiver: userId,
        },

        {
          sender: userId,
          receiver: currentUser,
        },
      ],
    });

    return res.status(200).json({
      success: true,

      message: "Chat cleared successfully",
    });
  } catch (error) {
    console.error("Clear chat error:", error);

    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};
