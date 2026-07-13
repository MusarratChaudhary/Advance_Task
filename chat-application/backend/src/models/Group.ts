import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  groupName: string;
  groupImage?: string;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
    },

    groupImage: {
      type: String,
      default: null,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Group = mongoose.model<IGroup>("Group", groupSchema);

export default Group;
