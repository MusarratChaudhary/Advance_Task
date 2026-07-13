import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;

  email: string;

  password: string;

  avatar?: string;

  bio?: string;

  isOnline: boolean;

  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    avatar: {
      type: String,
    },

    bio: {
      type: String,
      default: "",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
