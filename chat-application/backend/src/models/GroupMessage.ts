import mongoose, { Schema, Document } from "mongoose";

export interface IGroupMessage extends Document {
  groupId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  imageUrl?: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  deletedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const groupMessageSchema = new Schema<IGroupMessage>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    imageUrl: {
      type: String,
      default: null,
    },

    fileUrl: {
      type: String,
      default: null,
    },

    fileType: {
      type: String,
      default: null,
    },

    fileName: {
      type: String,
      default: null,
    },

    deletedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  },
);

const GroupMessage = mongoose.model<IGroupMessage>(
  "GroupMessage",
  groupMessageSchema,
);

export default GroupMessage;
