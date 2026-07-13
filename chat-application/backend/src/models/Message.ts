import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;

  receiver: mongoose.Types.ObjectId;

  text: string;

  isRead: boolean;

  deletedBy: mongoose.Types.ObjectId[];

  imageUrl?: string;

  fileUrl?: string;

  fileType?: string;

  fileName?: string;

  createdAt: Date;

  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
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

    isRead: {
      type: Boolean,
      default: false,
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

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
