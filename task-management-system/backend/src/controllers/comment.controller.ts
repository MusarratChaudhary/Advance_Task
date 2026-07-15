import { Request, Response } from "express";
import mongoose from "mongoose";

import Comment from "../models/Comment";
import Task from "../models/Task";

// ===============================
// Request Params Types
// ===============================

interface TaskParams {
  taskId: string;
}

interface CommentParams {
  id: string;
}

// ===============================
// Add Comment
// ===============================

export const addComment = async (req: Request<TaskParams>, res: Response) => {
  try {
    const { message } = req.body;

    const { taskId } = req.params;

    const userId = (req as any).user.id;

    // Validate message

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,

        message: "Comment message is required",
      });
    }

    // Validate Task ID

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,

        message: "Invalid task id",
      });
    }

    // Check Task exists

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,

        message: "Task not found",
      });
    }

    const comment = await Comment.create({
      taskId,

      userId,

      message: message.trim(),
    });

    await comment.populate("userId", "name email role");

    return res.status(201).json({
      success: true,

      message: "Comment added successfully",

      comment,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);

    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// ===============================
// Get Task Comments
// ===============================

export const getTaskComments = async (
  req: Request<TaskParams>,
  res: Response,
) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,

        message: "Invalid task id",
      });
    }

    const comments = await Comment.find({
      taskId,
    })

      .populate("userId", "name email role")

      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count: comments.length,

      comments,
    });
  } catch (error) {
    console.error("Get Comments Error:", error);

    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// ===============================
// Delete Comment
// ===============================

export const deleteComment = async (
  req: Request<CommentParams>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,

        message: "Invalid comment id",
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,

        message: "Comment not found",
      });
    }

    const userId = (req as any).user.id;

    // Only owner can delete

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,

        message: "You can only delete your own comments",
      });
    }

    await comment.deleteOne();

    return res.status(200).json({
      success: true,

      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);

    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};
