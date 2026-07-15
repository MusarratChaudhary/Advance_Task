import mongoose, { Document, Schema, Types } from "mongoose";

export interface IComment extends Document {
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  message: string;

  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task ID is required"],
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    message: {
      type: String,
      required: [true, "Comment message is required"],

      trim: true,

      minlength: [1, "Comment cannot be empty"],

      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },

  {
    timestamps: true,
  },
);

// Faster task comments fetching

commentSchema.index({
  taskId: 1,
  createdAt: -1,
});

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
