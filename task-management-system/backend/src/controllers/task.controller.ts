import { Request, Response } from "express";

import Task from "../models/Task";
import "../models/Team";

// ===============================
// Create Task
// ===============================

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, assignedTo, teamId, dueDate } =
      req.body;

    const userId = (req as any).user.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const task = await Task.create({
      title,

      description,

      priority,

      assignedTo,

      teamId,

      dueDate,

      createdBy: userId,
    });

    return res.status(201).json({
      success: true,

      message: "Task created successfully",

      task,
    });
  } catch (error) {
    console.error("Create Task Error:", error);

    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// ===============================
// Get All Tasks
// ===============================

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find()

      .populate("createdBy", "name email")

      .populate("assignedTo", "name email")

      .populate("teamId", "name")

      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count: tasks.length,

      tasks,
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);

    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// ===============================
// Get Single Task
// ===============================

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)

      .populate("createdBy", "name email")

      .populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,

        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,

      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// ===============================
// Update Task
// ===============================

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,

      req.body,

      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        success: false,

        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Task updated successfully",

      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};

// ===============================
// Delete Task
// ===============================

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,

        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  }
};
