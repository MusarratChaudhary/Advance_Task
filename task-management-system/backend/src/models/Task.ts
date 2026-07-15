import mongoose, { Document, Schema, Types } from "mongoose";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface ITask extends Document {
  title: string;
  description?: string;

  status: TaskStatus;
  priority: TaskPriority;

  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;

  teamId?: Types.ObjectId;

  dueDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],

      trim: true,

      minlength: [3, "Task title must be at least 3 characters"],

      maxlength: [100, "Task title cannot exceed 100 characters"],
    },

    description: {
      type: String,

      trim: true,

      maxlength: [1000, "Description cannot exceed 1000 characters"],

      default: "",
    },

    status: {
      type: String,

      enum: ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"],

      default: "TODO",
    },

    priority: {
      type: String,

      enum: ["LOW", "MEDIUM", "HIGH"],

      default: "MEDIUM",
    },

    assignedTo: {
      type: Schema.Types.ObjectId,

      ref: "User",

      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    teamId: {
      type: Schema.Types.ObjectId,

      ref: "Team",

      default: null,
    },

    dueDate: {
      type: Date,

      default: null,
    },
  },

  {
    timestamps: true,
  },
);

// Indexing for faster search/filtering

taskSchema.index({
  status: 1,
  priority: 1,
});

taskSchema.index({
  assignedTo: 1,
});

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;
